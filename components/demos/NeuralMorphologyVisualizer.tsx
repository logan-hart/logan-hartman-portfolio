"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type SwcNode = {
  id: number;
  type: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  parent: number;
};

type NeuronDataset = {
  nodes: SwcNode[];
  edges: number;
  roots: number;
};

type SelectedNode = SwcNode & {
  kind: "Branch point" | "Terminal point";
};

type ViewPreset = "Front" | "Side" | "Top";

type VisualizerRuntime = {
  three: typeof import("three");
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  model?: THREE.Group;
  branchMesh?: THREE.InstancedMesh;
  terminalMesh?: THREE.InstancedMesh;
  distance: number;
};

const SAMPLE_URL = "/data/vfb-da1-lpn-r3.swc";
const SAMPLE_NAME = "DA1 projection-neuron skeleton";
const SAMPLE_ID = "VFB_00101204 · FAFB 61221";
const MAX_LOCAL_FILE_SIZE = 5 * 1024 * 1024;

function parseSwc(text: string): NeuronDataset {
  const nodes = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split(/\s+/).map(Number))
    .filter((row) => row.length >= 7 && row.slice(0, 7).every(Number.isFinite))
    .map(([id, type, x, y, z, radius, parent]) => ({ id, type, x, y, z, radius, parent }));

  if (nodes.length < 2) {
    throw new Error("This file does not contain enough valid SWC nodes.");
  }

  const ids = new Set(nodes.map((node) => node.id));
  const edges = nodes.filter((node) => node.parent > 0 && ids.has(node.parent)).length;

  if (!edges) {
    throw new Error("This SWC file does not contain any connected parent-child nodes.");
  }

  return {
    nodes,
    edges,
    roots: nodes.filter((node) => node.parent < 0).length,
  };
}

function disposeObject(object: THREE.Object3D, three: typeof import("three")) {
  object.traverse((child) => {
    if ("geometry" in child && child.geometry instanceof three.BufferGeometry) {
      child.geometry.dispose();
    }

    if ("material" in child) {
      const material = child.material as THREE.Material | THREE.Material[];
      (Array.isArray(material) ? material : [material]).forEach((item) => item.dispose());
    }
  });
}

export function NeuralMorphologyVisualizer() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<VisualizerRuntime | null>(null);
  const pointScaleRef = useRef(1);
  const showPathsRef = useRef(true);
  const showBranchesRef = useRef(true);
  const showTerminalsRef = useRef(true);
  const [dataset, setDataset] = useState<NeuronDataset | null>(null);
  const [datasetName, setDatasetName] = useState(SAMPLE_NAME);
  const [datasetId, setDatasetId] = useState(SAMPLE_ID);
  const [isPublicSample, setIsPublicSample] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isRendererReady, setIsRendererReady] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaths, setShowPaths] = useState(true);
  const [showBranches, setShowBranches] = useState(true);
  const [showTerminals, setShowTerminals] = useState(true);
  const [pointScale, setPointScale] = useState(1);
  const [autoRotate, setAutoRotate] = useState(false);
  const [activeView, setActiveView] = useState<ViewPreset>("Front");
  const [selectedNode, setSelectedNode] = useState<SelectedNode | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const applyView = useCallback((preset: ViewPreset) => {
    const runtime = runtimeRef.current;
    if (!runtime) return;

    const { camera, controls, distance } = runtime;
    camera.up.set(0, 1, 0);

    if (preset === "Side") {
      camera.position.set(distance, 0, 0);
    } else if (preset === "Top") {
      camera.up.set(0, 0, -1);
      camera.position.set(0, distance, 0);
    } else {
      camera.position.set(0, 0, distance);
    }

    controls.target.set(0, 0, 0);
    controls.update();
    setActiveView(preset);
  }, []);

  const loadFile = async (file: File) => {
    if (file.size > MAX_LOCAL_FILE_SIZE) {
      setError("Choose an SWC file smaller than 5 MB.");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".swc")) {
      setError("Choose a neuron morphology file ending in .swc.");
      return;
    }

    try {
      const parsed = parseSwc(await file.text());
      setDataset(parsed);
      setDatasetName(file.name);
      setDatasetId("Local SWC");
      setIsPublicSample(false);
      setSelectedNode(null);
      setError(null);
    } catch (fileError) {
      setError(fileError instanceof Error ? fileError.message : "Unable to read this SWC file.");
    }
  };

  const restoreSample = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(SAMPLE_URL);
      if (!response.ok) throw new Error("The public sample could not be loaded.");
      setDataset(parseSwc(await response.text()));
      setDatasetName(SAMPLE_NAME);
      setDatasetId(SAMPLE_ID);
      setIsPublicSample(true);
      setSelectedNode(null);
    } catch (sampleError) {
      setError(sampleError instanceof Error ? sampleError.message : "The public sample could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSample();
  }, [restoreSample]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    let cancelled = false;
    let cleanup = () => {};

    const setup = async () => {
      const [three, controlsModule] = await Promise.all([
        import("three"),
        import("three/examples/jsm/controls/OrbitControls.js"),
      ]);
      if (cancelled) return;

      const { OrbitControls: OrbitControlsRuntime } = controlsModule;

      const scene = new three.Scene();
      scene.background = new three.Color(0x071525);
      scene.fog = new three.FogExp2(0x071525, 0.0018);

      const camera = new three.PerspectiveCamera(42, 1, 0.1, 2000);
      camera.position.set(0, 0, 240);

      const renderer = new three.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = three.SRGBColorSpace;
      renderer.domElement.setAttribute("aria-hidden", "true");
      viewport.replaceChildren(renderer.domElement);

      const controls = new OrbitControlsRuntime(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.minDistance = 45;
      controls.maxDistance = 700;
      controls.rotateSpeed = 0.65;
      controls.panSpeed = 0.65;
      controls.autoRotateSpeed = 0.7;

      const runtime: VisualizerRuntime = { three, scene, camera, renderer, controls, distance: 240 };
      runtimeRef.current = runtime;
      setIsRendererReady(true);

      const raycaster = new three.Raycaster();
      const pointer = new three.Vector2();
      let pointerStart = { x: 0, y: 0 };

      const handlePointerDown = (event: PointerEvent) => {
        pointerStart = { x: event.clientX, y: event.clientY };
      };

      const handlePointerUp = (event: PointerEvent) => {
        if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return;

        const targets = [runtime.branchMesh, runtime.terminalMesh].filter(
          (mesh): mesh is THREE.InstancedMesh => Boolean(mesh?.visible),
        );
        if (!targets.length) return;

        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        const hit = raycaster.intersectObjects(targets, false)[0];
        if (!hit || hit.instanceId === undefined) {
          setSelectedNode(null);
          return;
        }

        const sourceNodes = hit.object.userData.sourceNodes as SwcNode[];
        const sourceNode = sourceNodes[hit.instanceId];
        const kind = hit.object === runtime.branchMesh ? "Branch point" : "Terminal point";
        setSelectedNode({ ...sourceNode, kind });
      };

      renderer.domElement.addEventListener("pointerdown", handlePointerDown);
      renderer.domElement.addEventListener("pointerup", handlePointerUp);

      const resize = () => {
        const { width, height } = viewport.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(viewport);
      resize();

      let frame = 0;
      const animate = () => {
        frame = window.requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        window.cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
        renderer.domElement.removeEventListener("pointerup", handlePointerUp);
        controls.dispose();
        if (runtime.model) disposeObject(runtime.model, three);
        renderer.dispose();
        runtimeRef.current = null;
        viewport.replaceChildren();
      };
    };

    void setup().catch(() => {
      if (!cancelled) {
        setViewerError("This browser could not start the WebGL viewer.");
        setIsRendererReady(false);
      }
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime || !dataset || !isRendererReady) return;

    const THREE = runtime.three;

    if (runtime.model) {
      runtime.scene.remove(runtime.model);
      disposeObject(runtime.model, THREE);
    }

    const sourceBox = new THREE.Box3();
    dataset.nodes.forEach((node) => sourceBox.expandByPoint(new THREE.Vector3(node.x, node.y, node.z)));
    const center = sourceBox.getCenter(new THREE.Vector3());
    const size = sourceBox.getSize(new THREE.Vector3());
    const scale = 150 / Math.max(size.x, size.y, size.z, 1);
    const normalized = new Map<number, THREE.Vector3>();

    dataset.nodes.forEach((node) => {
      normalized.set(
        node.id,
        new THREE.Vector3(
          (node.x - center.x) * scale,
          (node.y - center.y) * scale,
          (node.z - center.z) * scale,
        ),
      );
    });

    const model = new THREE.Group();
    model.rotation.z = -0.08;

    const pathGroup = new THREE.Group();
    pathGroup.name = "paths";
    const segmentPositions: number[] = [];
    const allPositions: number[] = [];
    const byId = new Map(dataset.nodes.map((node) => [node.id, node]));

    dataset.nodes.forEach((node) => {
      const point = normalized.get(node.id);
      if (!point) return;
      allPositions.push(point.x, point.y, point.z);

      const parent = byId.get(node.parent);
      const parentPoint = parent ? normalized.get(parent.id) : undefined;
      if (parentPoint) {
        segmentPositions.push(parentPoint.x, parentPoint.y, parentPoint.z, point.x, point.y, point.z);
      }
    });

    const segmentGeometry = new THREE.BufferGeometry();
    segmentGeometry.setAttribute("position", new THREE.Float32BufferAttribute(segmentPositions, 3));
    const segments = new THREE.LineSegments(
      segmentGeometry,
      new THREE.LineBasicMaterial({ color: 0x45d6d1, transparent: true, opacity: 0.86 }),
    );
    pathGroup.add(segments);

    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute("position", new THREE.Float32BufferAttribute(allPositions, 3));
    const points = new THREE.Points(
      pointGeometry,
      new THREE.PointsMaterial({ color: 0x7cf3ed, size: 0.78, transparent: true, opacity: 0.62 }),
    );
    pathGroup.add(points);
    pathGroup.visible = showPathsRef.current;
    model.add(pathGroup);

    const createNodeMesh = (
      sourceNodes: SwcNode[],
      geometry: THREE.BufferGeometry,
      color: number,
      baseScale: number,
    ) => {
      const mesh = new THREE.InstancedMesh(
        geometry,
        new THREE.MeshBasicMaterial({ color }),
        sourceNodes.length,
      );
      const transform = new THREE.Object3D();
      sourceNodes.forEach((node, index) => {
        transform.position.copy(normalized.get(node.id) ?? new THREE.Vector3());
        transform.scale.setScalar(baseScale * pointScaleRef.current);
        transform.updateMatrix();
        mesh.setMatrixAt(index, transform.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.userData.sourceNodes = sourceNodes;
      mesh.userData.baseScale = baseScale;
      mesh.userData.normalized = normalized;
      return mesh;
    };

    const branchNodes = dataset.nodes.filter((node) => node.type === 5);
    const terminalNodes = dataset.nodes.filter((node) => node.type === 6);
    const branchMesh = createNodeMesh(branchNodes, new THREE.SphereGeometry(1, 12, 8), 0xffa54f, 1.05);
    branchMesh.name = "branches";
    branchMesh.visible = showBranchesRef.current;
    model.add(branchMesh);

    const terminalMesh = createNodeMesh(terminalNodes, new THREE.OctahedronGeometry(1, 0), 0xe867ce, 0.92);
    terminalMesh.name = "terminals";
    terminalMesh.visible = showTerminalsRef.current;
    model.add(terminalMesh);

    runtime.scene.add(model);
    runtime.model = model;
    runtime.branchMesh = branchMesh;
    runtime.terminalMesh = terminalMesh;

    const modelBox = new THREE.Box3().setFromObject(model);
    const sphere = modelBox.getBoundingSphere(new THREE.Sphere());
    runtime.distance = Math.max(165, sphere.radius / Math.sin(THREE.MathUtils.degToRad(runtime.camera.fov / 2)) * 1.2);
    runtime.camera.near = Math.max(0.1, runtime.distance / 1000);
    runtime.camera.far = runtime.distance * 8;
    runtime.camera.updateProjectionMatrix();
    applyView("Front");
  }, [applyView, dataset, isRendererReady]);

  useEffect(() => {
    showPathsRef.current = showPaths;
    showBranchesRef.current = showBranches;
    showTerminalsRef.current = showTerminals;
    const runtime = runtimeRef.current;
    runtime?.model?.getObjectByName("paths")?.traverse((object) => {
      object.visible = showPaths;
    });
    if (runtime?.branchMesh) runtime.branchMesh.visible = showBranches;
    if (runtime?.terminalMesh) runtime.terminalMesh.visible = showTerminals;
  }, [showBranches, showPaths, showTerminals]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (runtime) runtime.controls.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    pointScaleRef.current = pointScale;
    const runtime = runtimeRef.current;
    if (!runtime) return;

    const THREE = runtime.three;

    [runtime.branchMesh, runtime.terminalMesh].forEach((mesh) => {
      if (!mesh) return;
      const sourceNodes = mesh.userData.sourceNodes as SwcNode[];
      const normalized = mesh.userData.normalized as Map<number, THREE.Vector3>;
      const baseScale = mesh.userData.baseScale as number;
      const transform = new THREE.Object3D();
      sourceNodes.forEach((node, index) => {
        transform.position.copy(normalized.get(node.id) ?? new THREE.Vector3());
        transform.scale.setScalar(baseScale * pointScale);
        transform.updateMatrix();
        mesh.setMatrixAt(index, transform.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  }, [pointScale]);

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void loadFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void loadFile(file);
  };

  const branchCount = dataset?.nodes.filter((node) => node.type === 5).length ?? 0;
  const terminalCount = dataset?.nodes.filter((node) => node.type === 6).length ?? 0;

  return (
    <section className="neural-visualizer" aria-label="Interactive three-dimensional neuron morphology visualizer">
      <header className="neural-visualizer__header">
        <div>
          <span>Public morphology sample</span>
          <h3>{datasetName}</h3>
          <p>{datasetId} · TEM-derived SWC morphology</p>
        </div>
        <dl aria-label="Dataset summary">
          <div><dt>Nodes</dt><dd>{dataset?.nodes.length.toLocaleString() ?? "—"}</dd></div>
          <div><dt>Edges</dt><dd>{dataset?.edges.toLocaleString() ?? "—"}</dd></div>
          <div><dt>Roots</dt><dd>{dataset?.roots.toLocaleString() ?? "—"}</dd></div>
        </dl>
      </header>

      <aside className="neural-visualizer__controls" aria-label="Global visualization controls">
        <fieldset>
          <legend>Structure</legend>
          <label><input checked={showPaths} onChange={(event) => setShowPaths(event.target.checked)} type="checkbox" /> <span className="neural-legend neural-legend--path" /> Neurite paths</label>
          <label><input checked={showBranches} onChange={(event) => setShowBranches(event.target.checked)} type="checkbox" /> <span className="neural-legend neural-legend--branch" /> Branch points <small>{branchCount}</small></label>
          <label><input checked={showTerminals} onChange={(event) => setShowTerminals(event.target.checked)} type="checkbox" /> <span className="neural-legend neural-legend--terminal" /> Terminal points <small>{terminalCount}</small></label>
        </fieldset>

        <fieldset>
          <legend>View</legend>
          <div className="neural-visualizer__button-row">
            {(["Front", "Side", "Top"] as ViewPreset[]).map((preset) => (
              <button
                aria-pressed={activeView === preset}
                key={preset}
                onClick={() => applyView(preset)}
                type="button"
              >
                {preset}
              </button>
            ))}
          </div>
          <label className="neural-visualizer__range">
            <span>Node scale <output>{pointScale.toFixed(1)}×</output></span>
            <input
              max="2"
              min="0.6"
              onChange={(event) => setPointScale(Number(event.target.value))}
              step="0.1"
              type="range"
              value={pointScale}
            />
          </label>
          <label><input checked={autoRotate} onChange={(event) => setAutoRotate(event.target.checked)} type="checkbox" /> Auto-rotate</label>
          <button className="neural-visualizer__reset" onClick={() => applyView("Front")} type="button">Reset view</button>
        </fieldset>

        <fieldset>
          <legend>Dataset</legend>
          <label className="neural-visualizer__file">
            Open an SWC file
            <input accept=".swc,text/plain" onChange={handleFileInput} type="file" />
          </label>
          <p>Or drop a local .swc file onto the viewer. Files stay in your browser.</p>
          {!isPublicSample ? <button onClick={() => void restoreSample()} type="button">Restore public sample</button> : null}
          {error ? <p className="neural-visualizer__error" role="alert">{error}</p> : null}
        </fieldset>
      </aside>

      <div
        className="neural-visualizer__viewer"
        data-drag-active={isDragActive}
        onDragEnter={(event) => { event.preventDefault(); setIsDragActive(true); }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsDragActive(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <div
          aria-label="Three-dimensional neuron skeleton. Drag to rotate, right-drag to pan, and scroll to zoom."
          className="neural-visualizer__viewport"
          ref={viewportRef}
          role="img"
        />
        <p className="neural-visualizer__gesture">Drag to rotate · Right-drag to pan · Scroll to zoom</p>
        <div className="neural-visualizer__selection" aria-live="polite">
          {selectedNode ? (
            <><strong>{selectedNode.kind} · node {selectedNode.id}</strong><span>x {selectedNode.x.toFixed(1)} · y {selectedNode.y.toFixed(1)} · z {selectedNode.z.toFixed(1)}</span></>
          ) : (
            <><strong>Select a colored node</strong><span>Branch and terminal coordinates appear here.</span></>
          )}
        </div>
        {isLoading ? <div className="neural-visualizer__loading">Loading public morphology…</div> : null}
        {viewerError ? <div className="neural-visualizer__loading neural-visualizer__viewer-error">{viewerError}</div> : null}
        {isDragActive ? <div className="neural-visualizer__drop">Drop SWC to visualize</div> : null}
      </div>

      <footer className="neural-visualizer__source">
        {isPublicSample ? (
          <p>
            Source: <a href="https://virtualflybrain.org/reports/VFB_00101204" rel="noreferrer" target="_blank">Virtual Fly Brain · FAFB 61221</a>. CC BY-SA 4.0; aligned to the JRC2018Unisex template.
          </p>
        ) : (
          <p>Local SWC preview · no file data leaves this browser.</p>
        )}
      </footer>
    </section>
  );
}
