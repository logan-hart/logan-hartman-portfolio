"use client";

import {
  Eye,
  EyeOff,
  Focus,
  Maximize2,
  Minimize2,
  Palette,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import {
  H01_CELLS,
  H01_DATASET_URL,
  H01_LICENSE_URL,
  H01_MODEL_URL,
  H01_PAPER_URL,
  type H01CellDefinition,
} from "@/components/demos/h01MorphologyData";

type ViewPreset = "Front" | "Side" | "Top";
type DragMode = "rotate" | "pan";

type VolumeDisplayState = {
  color: string;
  muted: boolean;
  visible: boolean;
};

type RuntimeVolume = {
  group: THREE.Group;
  surfaceMaterial: THREE.MeshPhysicalMaterial;
  wireMaterial: THREE.MeshBasicMaterial;
};

type VisualizerRuntime = {
  three: typeof import("three");
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  volumes: Map<string, RuntimeVolume>;
  model?: THREE.Group;
  distance: number;
};

const VOLUMES = H01_CELLS;
const DEFAULT_SELECTED_ID = VOLUMES[0].id;
const NORMALIZED_MODEL_RADIUS = 58;

function createInitialVolumeStates(): Record<string, VolumeDisplayState> {
  return Object.fromEntries(
    VOLUMES.map((volume) => [
      volume.id,
      {
        color: volume.color,
        muted: false,
        visible: true,
      },
    ]),
  );
}

function seededValue(seed: number, index: number) {
  const value = Math.sin(seed * 91.17 + index * 43.73) * 43758.5453;
  return value - Math.floor(value);
}

function disposeObject(object: THREE.Object3D, three: typeof import("three")) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  object.traverse((child) => {
    if ("geometry" in child && child.geometry instanceof three.BufferGeometry) {
      geometries.add(child.geometry);
    }

    if ("material" in child) {
      const material = child.material as THREE.Material | THREE.Material[];
      (Array.isArray(material) ? material : [material]).forEach((item) => materials.add(item));
    }
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

function createRuntimeVolume(
  three: typeof import("three"),
  definition: H01CellDefinition,
) {
  const group = new three.Group();
  group.name = definition.id;

  const surfaceMaterial = new three.MeshPhysicalMaterial({
    clearcoat: 0.28,
    clearcoatRoughness: 0.48,
    color: definition.color,
    depthWrite: false,
    metalness: 0.04,
    opacity: 0.42,
    roughness: 0.32,
    side: three.DoubleSide,
    transparent: true,
  });
  const wireMaterial = new three.MeshBasicMaterial({
    color: definition.color,
    depthWrite: false,
    opacity: 0.12,
    transparent: true,
    wireframe: true,
  });
  surfaceMaterial.forceSinglePass = true;

  return { group, surfaceMaterial, wireMaterial };
}

function sourceObjectMatchesCell(
  object: THREE.Object3D,
  sourceRoot: THREE.Object3D,
  sourceId: string,
) {
  let current: THREE.Object3D | null = object;

  while (current && current !== sourceRoot.parent) {
    if (current.name.includes(sourceId)) return true;
    if (current === sourceRoot) break;
    current = current.parent;
  }

  return false;
}

function createH01Model(
  three: typeof import("three"),
  sourceScene: THREE.Group,
) {
  const model = new three.Group();
  model.name = "h01-demo-model";
  model.rotation.set(-0.08, -0.18, -0.04);

  const normalizedRoot = new three.Group();
  normalizedRoot.name = "h01-normalized-root";
  const coordinateRoot = new three.Group();
  coordinateRoot.name = "h01-shared-coordinate-root";
  normalizedRoot.add(coordinateRoot);
  model.add(normalizedRoot);

  const volumes = new Map<string, RuntimeVolume>(
    VOLUMES.map((definition) => {
      const volume = createRuntimeVolume(three, definition);
      coordinateRoot.add(volume.group);
      return [definition.id, volume] as const;
    }),
  );

  sourceScene.updateMatrixWorld(true);
  sourceScene.traverse((object) => {
    if (!(object instanceof three.Mesh) || !(object.geometry instanceof three.BufferGeometry)) {
      return;
    }

    const definition = VOLUMES.find((candidate) =>
      sourceObjectMatchesCell(object, sourceScene, candidate.sourceId),
    );
    if (!definition) return;

    const volume = volumes.get(definition.id);
    if (!volume) return;

    const geometry = object.geometry.clone();
    geometry.applyMatrix4(object.matrixWorld);
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();

    const surface = new three.Mesh(geometry, volume.surfaceMaterial);
    surface.name = `${definition.id}-surface`;
    surface.userData.volumeId = definition.id;
    volume.group.add(surface);

    const wireframe = new three.Mesh(geometry, volume.wireMaterial);
    wireframe.name = `${definition.id}-wire`;
    wireframe.renderOrder = 10;
    volume.group.add(wireframe);
  });

  const missingCells = VOLUMES.filter(
    (definition) => volumes.get(definition.id)?.group.children.length === 0,
  );
  if (missingCells.length) {
    disposeObject(model, three);
    throw new Error(`H01 model is missing cell meshes: ${missingCells.map((cell) => cell.sourceId).join(", ")}`);
  }

  const sourceBox = new three.Box3().setFromObject(coordinateRoot);
  if (sourceBox.isEmpty()) {
    disposeObject(model, three);
    throw new Error("H01 model does not contain renderable geometry.");
  }

  const sourceSphere = sourceBox.getBoundingSphere(new three.Sphere());
  coordinateRoot.position.copy(sourceSphere.center).multiplyScalar(-1);
  normalizedRoot.scale.setScalar(
    NORMALIZED_MODEL_RADIUS / Math.max(sourceSphere.radius, Number.EPSILON),
  );

  return { model, volumes };
}

function createAmbientParticles(three: typeof import("three")) {
  const positions: number[] = [];

  for (let index = 0; index < 180; index += 1) {
    positions.push(
      (seededValue(101, index * 3) - 0.5) * 150,
      (seededValue(101, index * 3 + 1) - 0.5) * 110,
      (seededValue(101, index * 3 + 2) - 0.5) * 95,
    );
  }

  const geometry = new three.BufferGeometry();
  geometry.setAttribute("position", new three.Float32BufferAttribute(positions, 3));
  return new three.Points(
    geometry,
    new three.PointsMaterial({
      color: 0xa6d7e7,
      opacity: 0.16,
      size: 0.45,
      transparent: true,
    }),
  );
}

export function NeuralMorphologyVisualizer() {
  const visualizerRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<VisualizerRuntime | null>(null);
  const dragModeRef = useRef<DragMode>("rotate");
  const [shouldInitialize, setShouldInitialize] = useState(false);
  const [isRendererReady, setIsRendererReady] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [volumeStates, setVolumeStates] = useState(createInitialVolumeStates);
  const [selectedId, setSelectedId] = useState(DEFAULT_SELECTED_ID);
  const [globalOpacity, setGlobalOpacity] = useState(0.42);
  const [autoRotate, setAutoRotate] = useState(false);
  const [activeView, setActiveView] = useState<ViewPreset | null>("Front");
  const [dragMode, setDragMode] = useState<DragMode>("rotate");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);
  const [fullscreenStatus, setFullscreenStatus] = useState("");

  const selectedVolume = useMemo(
    () => VOLUMES.find((volume) => volume.id === selectedId) ?? VOLUMES[0],
    [selectedId],
  );

  const selectVolume = useCallback((volumeId: string) => {
    setSelectedId(volumeId);
    setVolumeStates((current) => ({
      ...current,
      [volumeId]: {
        ...current[volumeId],
        muted: false,
        visible: true,
      },
    }));
  }, []);

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

  useEffect(() => {
    const syncFullscreenState = () => {
      const visualizer = visualizerRef.current;
      setFullscreenSupported(
        Boolean(document.fullscreenEnabled && visualizer?.requestFullscreen),
      );
      setIsFullscreen(Boolean(visualizer && document.fullscreenElement === visualizer));
    };

    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (!("IntersectionObserver" in window)) {
      setShouldInitialize(true);
      return;
    }

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldInitialize(true);
        loadObserver.disconnect();
      },
      { rootMargin: "500px 0px", threshold: 0 },
    );
    loadObserver.observe(viewport);

    return () => loadObserver.disconnect();
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !shouldInitialize) return;

    let cancelled = false;
    let cleanup = () => {};

    const setup = async () => {
      const [three, controlsModule] = await Promise.all([
        import("three"),
        import("three/examples/jsm/controls/OrbitControls.js"),
      ]);
      if (cancelled) return;

      const scene = new three.Scene();
      scene.background = new three.Color(0x061321);
      scene.fog = new three.FogExp2(0x061321, 0.0024);

      const camera = new three.PerspectiveCamera(40, 1, 0.1, 1200);
      camera.position.set(0, 0, 180);

      const renderer = new three.WebGLRenderer({
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = three.SRGBColorSpace;
      renderer.domElement.setAttribute("aria-hidden", "true");
      viewport.replaceChildren(renderer.domElement);

      const controls = new controlsModule.OrbitControls(camera, renderer.domElement);
      controls.autoRotateSpeed = 0.72;
      controls.dampingFactor = 0.06;
      controls.enableDamping = true;
      controls.maxDistance = 1400;
      controls.minDistance = 8;
      controls.panSpeed = 0.62;
      controls.rotateSpeed = 0.62;
      controls.screenSpacePanning = true;
      controls.zoomToCursor = true;

      scene.add(new three.HemisphereLight(0xc5efff, 0x142033, 1.65));
      const keyLight = new three.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(55, 70, 90);
      scene.add(keyLight);
      const rimLight = new three.PointLight(0x46dcd2, 90, 230, 2);
      rimLight.position.set(-60, -20, 60);
      scene.add(rimLight);
      scene.add(createAmbientParticles(three));

      const grid = new three.GridHelper(150, 12, 0x335b70, 0x1b3445);
      grid.position.y = -47;
      (grid.material as THREE.Material).transparent = true;
      (grid.material as THREE.Material).opacity = 0.22;
      scene.add(grid);

      const runtime: VisualizerRuntime = {
        camera,
        controls,
        distance: 180,
        renderer,
        scene,
        three,
        volumes: new Map(),
      };
      runtimeRef.current = runtime;
      setIsRendererReady(true);

      const raycaster = new three.Raycaster();
      const pointer = new three.Vector2();
      let pointerStart = { x: 0, y: 0 };
      let pointerIsDown = false;

      const updatePointer = (event: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
      };

      const getVisibleHit = () => {
        const targets = Array.from(runtime.volumes.values())
          .filter((volume) => volume.group.visible)
          .flatMap((volume) => volume.group.children)
          .filter((child): child is THREE.Mesh => child instanceof three.Mesh && Boolean(child.userData.volumeId));
        return raycaster.intersectObjects(targets, false)[0];
      };

      const handlePointerDown = (event: PointerEvent) => {
        pointerStart = { x: event.clientX, y: event.clientY };
        pointerIsDown = true;
        renderer.domElement.style.cursor = "grabbing";
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (pointerIsDown && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) {
          setActiveView(null);
        }
        updatePointer(event);
        renderer.domElement.style.cursor = pointerIsDown
          ? "grabbing"
          : dragModeRef.current === "pan"
            ? "move"
            : getVisibleHit()
              ? "pointer"
              : "grab";
      };

      const handlePointerUp = (event: PointerEvent) => {
        pointerIsDown = false;
        updatePointer(event);
        renderer.domElement.style.cursor = dragModeRef.current === "pan"
          ? "move"
          : getVisibleHit()
            ? "pointer"
            : "grab";
        if (Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 5) return;
        const hit = getVisibleHit();
        const volumeId = hit?.object.userData.volumeId as string | undefined;
        if (volumeId) selectVolume(volumeId);
      };

      const handlePointerCancel = () => {
        pointerIsDown = false;
        renderer.domElement.style.cursor = dragModeRef.current === "pan" ? "move" : "grab";
      };

      const handleWheel = () => setActiveView(null);

      const handleKeyDown = (event: KeyboardEvent) => {
        const supportedKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "_"];
        if (!supportedKeys.includes(event.key)) return;

        event.preventDefault();
        if (event.shiftKey && event.key.startsWith("Arrow")) {
          const distance = camera.position.distanceTo(controls.target);
          const panAmount = distance * 0.035;
          const cameraRight = new three.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
          const cameraUp = new three.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
          const panOffset = new three.Vector3();

          if (event.key === "ArrowLeft") panOffset.addScaledVector(cameraRight, -panAmount);
          if (event.key === "ArrowRight") panOffset.addScaledVector(cameraRight, panAmount);
          if (event.key === "ArrowUp") panOffset.addScaledVector(cameraUp, panAmount);
          if (event.key === "ArrowDown") panOffset.addScaledVector(cameraUp, -panAmount);

          camera.position.add(panOffset);
          controls.target.add(panOffset);
          controls.update();
          setActiveView(null);
          return;
        }

        const spherical = new three.Spherical().setFromVector3(
          camera.position.clone().sub(controls.target),
        );

        if (event.key === "ArrowLeft") spherical.theta -= 0.12;
        if (event.key === "ArrowRight") spherical.theta += 0.12;
        if (event.key === "ArrowUp") spherical.phi -= 0.1;
        if (event.key === "ArrowDown") spherical.phi += 0.1;
        if (event.key === "+" || event.key === "=") spherical.radius *= 0.9;
        if (event.key === "-" || event.key === "_") spherical.radius *= 1.1;

        spherical.phi = three.MathUtils.clamp(spherical.phi, 0.12, Math.PI - 0.12);
        spherical.radius = three.MathUtils.clamp(
          spherical.radius,
          controls.minDistance,
          controls.maxDistance,
        );
        camera.position.copy(controls.target).add(new three.Vector3().setFromSpherical(spherical));
        camera.lookAt(controls.target);
        controls.update();
        setActiveView(null);
      };

      renderer.domElement.addEventListener("pointerdown", handlePointerDown);
      renderer.domElement.addEventListener("pointermove", handlePointerMove);
      renderer.domElement.addEventListener("pointerup", handlePointerUp);
      renderer.domElement.addEventListener("pointercancel", handlePointerCancel);
      renderer.domElement.addEventListener("wheel", handleWheel, { passive: true });
      viewport.addEventListener("keydown", handleKeyDown);

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
      let isVisible = false;
      const animate = () => {
        frame = 0;
        if (!isVisible) return;
        controls.update();
        renderer.render(scene, camera);
        frame = window.requestAnimationFrame(animate);
      };

      const stopAnimation = () => {
        if (!frame) return;
        window.cancelAnimationFrame(frame);
        frame = 0;
      };

      const startAnimation = () => {
        if (!isVisible || frame) return;
        frame = window.requestAnimationFrame(animate);
      };

      const visibilityObserver = "IntersectionObserver" in window
        ? new IntersectionObserver(
            ([entry]) => {
              isVisible = entry?.isIntersecting ?? true;
              if (isVisible) startAnimation();
              else stopAnimation();
            },
            { threshold: 0.01 },
          )
        : null;

      if (visibilityObserver) {
        visibilityObserver.observe(viewport);
      } else {
        isVisible = true;
        startAnimation();
      }

      cleanup = () => {
        stopAnimation();
        visibilityObserver?.disconnect();
        resizeObserver.disconnect();
        renderer.domElement.removeEventListener("pointerdown", handlePointerDown);
        renderer.domElement.removeEventListener("pointermove", handlePointerMove);
        renderer.domElement.removeEventListener("pointerup", handlePointerUp);
        renderer.domElement.removeEventListener("pointercancel", handlePointerCancel);
        renderer.domElement.removeEventListener("wheel", handleWheel);
        viewport.removeEventListener("keydown", handleKeyDown);
        controls.dispose();
        if (runtime.model) {
          const activeModel = runtime.model;
          runtime.model = undefined;
          runtime.volumes.clear();
          scene.remove(activeModel);
          disposeObject(activeModel, three);
        }
        scene.children.forEach((child) => disposeObject(child, three));
        renderer.dispose();
        if (runtimeRef.current === runtime) runtimeRef.current = null;
        viewport.replaceChildren();
      };
    };

    void setup().catch(() => {
      if (!cancelled) {
        setViewerError("This browser could not start the WebGL volume viewer.");
        setIsRendererReady(false);
      }
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [selectVolume, shouldInitialize]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime || !isRendererReady) return;

    let cancelled = false;
    let loadedModel: THREE.Group | undefined;
    setIsModelReady(false);
    setViewerError(null);

    const loadModel = async () => {
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const gltf = await new GLTFLoader().loadAsync(H01_MODEL_URL);

      if (cancelled) {
        disposeObject(gltf.scene, runtime.three);
        return;
      }

      let prepared: ReturnType<typeof createH01Model>;
      try {
        prepared = createH01Model(runtime.three, gltf.scene);
      } finally {
        disposeObject(gltf.scene, runtime.three);
      }

      if (cancelled) {
        disposeObject(prepared.model, runtime.three);
        return;
      }

      loadedModel = prepared.model;
      runtime.volumes.clear();
      prepared.volumes.forEach((volume, volumeId) => runtime.volumes.set(volumeId, volume));
      runtime.scene.add(loadedModel);
      runtime.model = loadedModel;

      const modelBox = new runtime.three.Box3().setFromObject(loadedModel);
      const sphere = modelBox.getBoundingSphere(new runtime.three.Sphere());
      runtime.controls.target.copy(sphere.center);
      runtime.controls.minDistance = Math.max(2, sphere.radius * 0.12);
      runtime.controls.maxDistance = Math.max(1200, sphere.radius * 22);
      runtime.distance =
        sphere.radius
        / Math.sin(runtime.three.MathUtils.degToRad(runtime.camera.fov / 2))
        * 0.96;
      runtime.camera.near = Math.max(0.02, runtime.controls.minDistance / 250);
      runtime.camera.far = Math.max(
        runtime.controls.maxDistance * 3,
        runtime.distance * 12,
      );
      runtime.camera.updateProjectionMatrix();
      applyView("Front");
      setIsModelReady(true);
    };

    void loadModel().catch(() => {
      if (!cancelled) {
        setViewerError("The public H01 demo geometry could not be loaded.");
        setIsModelReady(false);
      }
    });

    return () => {
      cancelled = true;
      if (loadedModel && runtime.model === loadedModel) {
        runtime.scene.remove(loadedModel);
        disposeObject(loadedModel, runtime.three);
        runtime.model = undefined;
        runtime.volumes.clear();
      }
    };
  }, [applyView, isRendererReady]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime?.model) return;

    VOLUMES.forEach((definition) => {
      const state = volumeStates[definition.id];
      const volume = runtime.volumes.get(definition.id);
      if (!state || !volume) return;

      const isSelected = selectedId === definition.id;
      volume.group.visible = state.visible;
      volume.surfaceMaterial.depthWrite = false;
      volume.surfaceMaterial.transparent = true;

      if (state.muted) {
        volume.surfaceMaterial.color.set(0x8391a2);
        volume.surfaceMaterial.emissive.set(0x000000);
        volume.surfaceMaterial.emissiveIntensity = 0;
        volume.surfaceMaterial.opacity = 0.09;
        volume.wireMaterial.color.set(0x9aa6b4);
        volume.wireMaterial.opacity = 0.055;
      } else if (isSelected) {
        volume.surfaceMaterial.color.set(state.color);
        volume.surfaceMaterial.emissive.set(state.color);
        volume.surfaceMaterial.emissiveIntensity = 0.34;
        volume.surfaceMaterial.opacity = globalOpacity;
        volume.wireMaterial.color.set(0xffffff);
        volume.wireMaterial.opacity = 0.46;
      } else {
        volume.surfaceMaterial.color.set(state.color);
        volume.surfaceMaterial.emissive.set(state.color);
        volume.surfaceMaterial.emissiveIntensity = 0.045;
        volume.surfaceMaterial.opacity = globalOpacity;
        volume.wireMaterial.color.set(state.color);
        volume.wireMaterial.opacity = 0.12;
      }

      volume.surfaceMaterial.needsUpdate = true;
    });
  }, [globalOpacity, isModelReady, isRendererReady, selectedId, volumeStates]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (runtime) runtime.controls.autoRotate = autoRotate;
    if (autoRotate) setActiveView(null);
  }, [autoRotate]);

  useEffect(() => {
    dragModeRef.current = dragMode;

    const runtime = runtimeRef.current;
    if (!runtime) return;

    runtime.controls.mouseButtons.LEFT = dragMode === "pan"
      ? runtime.three.MOUSE.PAN
      : runtime.three.MOUSE.ROTATE;
    runtime.controls.mouseButtons.RIGHT = runtime.three.MOUSE.PAN;
    runtime.controls.touches.ONE = dragMode === "pan"
      ? runtime.three.TOUCH.PAN
      : runtime.three.TOUCH.ROTATE;
    runtime.controls.touches.TWO = runtime.three.TOUCH.DOLLY_PAN;
    runtime.renderer.domElement.style.cursor = dragMode === "pan" ? "move" : "grab";
  }, [dragMode, isRendererReady]);

  const updateVolume = (volumeId: string, patch: Partial<VolumeDisplayState>) => {
    setVolumeStates((current) => ({
      ...current,
      [volumeId]: {
        ...current[volumeId],
        ...patch,
      },
    }));
  };

  const showAll = () => {
    setVolumeStates((current) =>
      Object.fromEntries(
        Object.entries(current).map(([volumeId, state]) => [
          volumeId,
          { ...state, muted: false, visible: true },
        ]),
      ),
    );
  };

  const focusSelected = () => {
    setVolumeStates((current) =>
      Object.fromEntries(
        Object.entries(current).map(([volumeId, state]) => [
          volumeId,
          {
            ...state,
            muted: volumeId !== selectedId,
            visible: true,
          },
        ]),
      ),
    );
  };

  const resetScene = () => {
    setVolumeStates(createInitialVolumeStates());
    setSelectedId(DEFAULT_SELECTED_ID);
    setGlobalOpacity(0.42);
    setAutoRotate(false);
    setDragMode("rotate");
    applyView("Front");
  };

  const toggleFullscreen = async () => {
    const visualizer = visualizerRef.current;

    if (
      !visualizer
      || !document.fullscreenEnabled
      || typeof visualizer.requestFullscreen !== "function"
    ) {
      setFullscreenStatus("Full screen is not available in this browser.");
      return;
    }

    setFullscreenStatus("");

    try {
      if (document.fullscreenElement === visualizer) {
        await document.exitFullscreen();
      } else {
        await visualizer.requestFullscreen();
      }
    } catch {
      setFullscreenStatus("Full screen could not be opened. Browser permission may be required.");
    }
  };

  return (
    <section
      className="neural-visualizer"
      aria-label="Interactive three-dimensional public H01 dataset demo"
      ref={visualizerRef}
    >
      <header className="neural-visualizer__header">
        <div>
          <span>Public H01 dataset demo</span>
          <h3>Multi-volume spatial explorer</h3>
          <p>Publicly available reconstructions used to demonstrate layered 3D inspection and rendering controls.</p>
        </div>
        <div className="neural-visualizer__header-actions">
          <dl aria-label="Public demo dataset summary">
            <div><dt>Cells</dt><dd>{VOLUMES.length}</dd></div>
            <div><dt>Dataset</dt><dd>H01</dd></div>
            <div><dt>Use</dt><dd>Demo only</dd></div>
          </dl>
          <div className="neural-visualizer__fullscreen-control">
            <button
              aria-disabled={!fullscreenSupported}
              aria-label={isFullscreen ? "Exit full screen" : "Open demo in full screen"}
              aria-pressed={isFullscreen}
              className="neural-visualizer__fullscreen"
              onClick={() => void toggleFullscreen()}
              title={
                fullscreenSupported
                  ? isFullscreen
                    ? "Exit full screen"
                    : "Open demo in full screen"
                  : "Full screen is not available in this browser"
              }
              type="button"
            >
              {isFullscreen
                ? <Minimize2 aria-hidden="true" size={16} />
                : <Maximize2 aria-hidden="true" size={16} />}
              {isFullscreen ? "Exit full screen" : "Full screen"}
            </button>
            <span aria-live="polite" className="sr-only">{fullscreenStatus}</span>
          </div>
        </div>
      </header>

      <aside className="neural-visualizer__controls" aria-label="Volume and view controls">
        <fieldset className="neural-visualizer__layer-fieldset">
          <legend>Volume layers</legend>
          <div className="neural-visualizer__layer-actions">
            <button onClick={showAll} type="button">Show all</button>
            <button onClick={focusSelected} type="button">
              <Focus aria-hidden="true" size={14} />
              Focus
            </button>
          </div>
          <div className="neural-visualizer__layer-list">
            {VOLUMES.map((volume) => {
              const state = volumeStates[volume.id];
              const isSelected = selectedId === volume.id;

              return (
                <div
                  className="neural-visualizer__layer"
                  data-muted={state.muted}
                  data-selected={isSelected}
                  data-visible={state.visible}
                  key={volume.id}
                >
                  <button
                    aria-pressed={isSelected}
                    className="neural-visualizer__layer-name"
                    onClick={() => selectVolume(volume.id)}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className="neural-visualizer__swatch"
                      style={{ backgroundColor: state.color }}
                    />
                    <span>
                      <strong>{volume.name}</strong>
                      <small>{volume.classification}</small>
                    </span>
                  </button>
                  <div className="neural-visualizer__layer-tools">
                    <button
                      aria-label={`${state.visible ? "Hide" : "Show"} ${volume.name}`}
                      onClick={() => updateVolume(volume.id, { visible: !state.visible })}
                      title={state.visible ? "Hide volume" : "Show volume"}
                      type="button"
                    >
                      {state.visible ? <Eye aria-hidden="true" size={14} /> : <EyeOff aria-hidden="true" size={14} />}
                    </button>
                    <button
                      aria-label={`${state.muted ? "Restore color to" : "Grey out"} ${volume.name}`}
                      aria-pressed={state.muted}
                      className="neural-visualizer__mute"
                      onClick={() => updateVolume(volume.id, { muted: !state.muted, visible: true })}
                      title={state.muted ? "Restore color" : "Grey into context"}
                      type="button"
                    >
                      <span aria-hidden="true" />
                    </button>
                    <label title={`Change ${volume.name} color`}>
                      <span className="sr-only">Change {volume.name} color</span>
                      <input
                        aria-label={`Change ${volume.name} color`}
                        onChange={(event) => updateVolume(volume.id, { color: event.target.value, muted: false })}
                        type="color"
                        value={state.color}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
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
          <div
            aria-label="Primary mouse and one-finger drag mode"
            className="neural-visualizer__button-row"
            role="group"
            style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
          >
            <button
              aria-pressed={dragMode === "rotate"}
              onClick={() => setDragMode("rotate")}
              type="button"
            >
              Rotate drag
            </button>
            <button
              aria-pressed={dragMode === "pan"}
              onClick={() => setDragMode("pan")}
              type="button"
            >
              Pan drag
            </button>
          </div>
          <label className="neural-visualizer__range">
            <span>Translucent opacity <output>{Math.round(globalOpacity * 100)}%</output></span>
            <input
              aria-valuetext={`${Math.round(globalOpacity * 100)} percent`}
              max="1"
              min="0"
              onChange={(event) => setGlobalOpacity(Number(event.target.value))}
              step="0.01"
              type="range"
              value={globalOpacity}
            />
          </label>
          <label>
            <input checked={autoRotate} onChange={(event) => setAutoRotate(event.target.checked)} type="checkbox" />
            Auto-rotate
          </label>
          <button className="neural-visualizer__reset" onClick={resetScene} type="button">
            <RotateCcw aria-hidden="true" size={14} />
            Reset scene
          </button>
        </fieldset>

        <fieldset className="neural-visualizer__key">
          <legend>Display key</legend>
          <p><span className="neural-key neural-key--selected" /> Highlighted volume</p>
          <p><span className="neural-key neural-key--visible" /> Translucent volume</p>
          <p><span className="neural-key neural-key--muted" /> Grey context</p>
          <p className="neural-visualizer__key-note">
            <Palette aria-hidden="true" size={14} />
            Colors and transparency are interface encodings.
          </p>
        </fieldset>
      </aside>

      <div
        aria-busy={!isModelReady && !viewerError}
        className="neural-visualizer__viewer"
      >
        <div
          aria-label={`Seven reconstructions from the public H01 dataset. Primary mouse and one-finger drag currently ${dragMode === "pan" ? "pans across the screen plane" : "rotates the model"}. Right-drag or shift plus arrow keys pans across the screen plane. Scroll, pinch, or use plus and minus to zoom.`}
          className="neural-visualizer__viewport"
          ref={viewportRef}
          role="region"
          tabIndex={0}
        />
        <p className="neural-visualizer__gesture">
          {dragMode === "pan" ? "Drag pans in screen plane" : "Drag rotates"}
          {" · "}Right-drag pans{" · "}Shift + arrows pan{" · "}Scroll/pinch or +/− zoom
        </p>
        <div className="neural-visualizer__selection" aria-live="polite">
          <span
            aria-hidden="true"
            className="neural-visualizer__selection-swatch"
            style={{ backgroundColor: volumeStates[selectedVolume.id].color }}
          />
          <span>
            <strong>{selectedVolume.name} · {selectedVolume.classification}</strong>
            <small>{selectedVolume.description}</small>
          </span>
        </div>
        {!isModelReady && !viewerError ? (
          <div className="neural-visualizer__loading" role="status">
            <div className="neural-visualizer__loading-content">
              <span aria-hidden="true" className="neural-visualizer__spinner" />
              <span>Preparing the 3D explorer…</span>
              <small>
                The rest of the case study is ready to browse.
              </small>
            </div>
          </div>
        ) : null}
        {viewerError ? (
          <div className="neural-visualizer__loading neural-visualizer__viewer-error" role="alert">{viewerError}</div>
        ) : null}
      </div>

      <footer className="neural-visualizer__source">
        <p>
          Demo purposes only. Simplified geometry is derived from seven proofread reconstructions in the publicly
          available{" "}
          <a href={H01_DATASET_URL} rel="noreferrer" target="_blank">H01 dataset</a>
          {" "}(
          <a href={H01_PAPER_URL} rel="noreferrer" target="_blank">Shapson-Coe et al., 2024</a>
          )
          {" "}(
          <a href={H01_LICENSE_URL} rel="noreferrer" target="_blank">CC BY 4.0</a>
          ). Colors and transparency are interface encodings. This is not data from the original Albert
          Einstein engagement.
        </p>
      </footer>
    </section>
  );
}
