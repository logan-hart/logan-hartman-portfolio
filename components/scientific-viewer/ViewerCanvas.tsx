"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type * as THREE from "three";
import type { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import { AssetCache } from "@/components/scientific-viewer/core/assetCache";
import { chooseLod } from "@/components/scientific-viewer/core/lodController";
import { RequestScheduler } from "@/components/scientific-viewer/core/requestScheduler";
import type {
  CameraPose,
  LodLevel,
  ScientificViewerManifest,
  StructureDisplayState,
  StructureRuntimeStatus,
  ViewerMetrics,
  ViewerMode,
  ViewerQuality,
} from "@/components/scientific-viewer/types";

type GeometryAsset = {
  kind: "geometry";
  geometry: THREE.BufferGeometry;
  matrix: THREE.Matrix4;
  triangleCount: number;
  byteSize: number;
  dispose: () => void;
};

type GeometryBundleAsset = {
  kind: "bundle";
  geometries: Map<string, GeometryAsset>;
  triangleCount: number;
  byteSize: number;
  dispose: () => void;
};

type ViewerAsset = GeometryAsset | GeometryBundleAsset;

type RuntimeStructure = {
  container: THREE.Group;
  material: THREE.MeshStandardMaterial;
  activeMesh: THREE.Mesh | null;
  currentLod: LodLevel | null;
};

type ViewerRuntime = {
  three: typeof import("three");
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  datasetRoot: THREE.Group;
  structures: Map<string, RuntimeStructure>;
  cache: AssetCache<ViewerAsset>;
  requestedLevels: Map<string, LodLevel>;
  activateDemandDrivenLods: () => void;
  applyCameraPose: (pose: CameraPose) => void;
  clearCache: () => void;
  frameAll: () => void;
  frameStructure: (structureId: string) => void;
  updateDisplayedLods: () => void;
};

export type ViewerCanvasHandle = {
  applyCameraPose: (pose: CameraPose) => void;
  clearCache: () => void;
  frameAll: () => void;
  frameStructure: (structureId: string) => void;
};

type ViewerCanvasProps = {
  autoRotate: boolean;
  className?: string;
  globalOpacity: number;
  label: string;
  manifest: ScientificViewerManifest;
  mode: ViewerMode;
  onCameraPose: (pose: CameraPose) => void;
  onMetrics: (metrics: ViewerMetrics) => void;
  quality: ViewerQuality;
  selectedId: string;
  structureStates: Record<string, StructureDisplayState>;
};

function emptyStructureStatuses(
  manifest: ScientificViewerManifest,
): Record<string, StructureRuntimeStatus> {
  return Object.fromEntries(
    manifest.structures.map((structure) => [
      structure.id,
      {
        currentLod: null,
        highestDownloadedLod: null,
        loading: true,
        error: null,
        triangleCount: 0,
        transferSize: 0,
      },
    ]),
  );
}

function disposeObject(object: THREE.Object3D, three: typeof import("three")) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  object.traverse((child) => {
    if (child instanceof three.Mesh) {
      geometries.add(child.geometry);
      const childMaterials = Array.isArray(child.material)
        ? child.material
        : [child.material];
      childMaterials.forEach((material) => materials.add(material));
    }
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

function triangleCount(geometry: THREE.BufferGeometry) {
  return geometry.index
    ? geometry.index.count / 3
    : (geometry.getAttribute("position")?.count ?? 0) / 3;
}

function formatLoadError(error: unknown) {
  return error instanceof Error ? error.message : "Unknown model-loading error.";
}

export const ViewerCanvas = forwardRef<ViewerCanvasHandle, ViewerCanvasProps>(
  function ViewerCanvas(
    {
      autoRotate,
      className,
      globalOpacity,
      label,
      manifest,
      mode,
      onCameraPose,
      onMetrics,
      quality,
      selectedId,
      structureStates,
    },
    ref,
  ) {
    const mountRef = useRef<HTMLDivElement>(null);
    const runtimeRef = useRef<ViewerRuntime | null>(null);
    const qualityRef = useRef(quality);
    const selectedIdRef = useRef(selectedId);
    const statesRef = useRef(structureStates);
    const globalOpacityRef = useRef(globalOpacity);
    const autoRotateRef = useRef(autoRotate);

    useImperativeHandle(ref, () => ({
      applyCameraPose: (pose) => runtimeRef.current?.applyCameraPose(pose),
      clearCache: () => runtimeRef.current?.clearCache(),
      frameAll: () => runtimeRef.current?.frameAll(),
      frameStructure: (structureId) =>
        runtimeRef.current?.frameStructure(structureId),
    }));

    useEffect(() => {
      qualityRef.current = quality;
      runtimeRef.current?.activateDemandDrivenLods();
    }, [quality]);

    useEffect(() => {
      selectedIdRef.current = selectedId;
      const runtime = runtimeRef.current;
      if (!runtime) return;
      for (const [id, structure] of runtime.structures) {
        structure.material.emissive.set(
          id === selectedId ? structure.material.color : 0x000000,
        );
        structure.material.emissiveIntensity = id === selectedId ? 0.12 : 0;
      }
      runtime.activateDemandDrivenLods();
    }, [selectedId]);

    useEffect(() => {
      statesRef.current = structureStates;
      globalOpacityRef.current = globalOpacity;
      const runtime = runtimeRef.current;
      if (!runtime) return;
      for (const [id, structure] of runtime.structures) {
        const state = structureStates[id];
        if (!state) continue;
        structure.container.visible = state.visible;
        structure.material.color.set(state.color);
        structure.material.opacity = state.opacity * globalOpacity;
        structure.material.transparent = structure.material.opacity < 1;
        structure.material.depthWrite = structure.material.opacity >= 0.98;
        structure.material.needsUpdate = true;
      }
      runtime.updateDisplayedLods();
    }, [globalOpacity, structureStates]);

    useEffect(() => {
      autoRotateRef.current = autoRotate;
      if (runtimeRef.current) {
        runtimeRef.current.controls.autoRotate = autoRotate;
      }
    }, [autoRotate]);

    useEffect(() => {
      const mount = mountRef.current;
      if (!mount) return;

      let cancelled = false;
      let frame = 0;
      let cleanup = () => {};

      const setup = async () => {
        const [three, controlsModule, loaderModule, meshoptimizer] = await Promise.all([
          import("three"),
          import("three/examples/jsm/controls/OrbitControls.js"),
          import("three/examples/jsm/loaders/GLTFLoader.js"),
          import("meshoptimizer"),
        ]);
        await meshoptimizer.MeshoptDecoder.ready;
        if (cancelled) return;

        const scene = new three.Scene();
        scene.background = new three.Color(0x14213d);
        scene.fog = new three.FogExp2(0x14213d, 0.105);
        const camera = new three.PerspectiveCamera(38, 1, 0.01, 30);
        const renderer = new three.WebGLRenderer({
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        });
        renderer.outputColorSpace = three.SRGBColorSpace;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.domElement.setAttribute("aria-hidden", "true");
        mount.replaceChildren(renderer.domElement);

        scene.add(new three.HemisphereLight(0xbceeff, 0x142338, 2.2));
        const keyLight = new three.DirectionalLight(0xffffff, 2.6);
        keyLight.position.set(3, 4, 6);
        scene.add(keyLight);
        const rimLight = new three.DirectionalLight(0xf77f00, 1.45);
        rimLight.position.set(-4, -2, 3);
        scene.add(rimLight);

        const datasetRoot = new three.Group();
        datasetRoot.name = `${mode}-unified-dataset`;
        const normalizationScale = 1 / manifest.bounds.radius;
        datasetRoot.scale.setScalar(normalizationScale);
        datasetRoot.position.set(
          -manifest.bounds.center[0] * normalizationScale,
          -manifest.bounds.center[1] * normalizationScale,
          -manifest.bounds.center[2] * normalizationScale,
        );
        scene.add(datasetRoot);

        const structures = new Map<string, RuntimeStructure>();
        for (const definition of manifest.structures) {
          const state = statesRef.current[definition.id];
          const container = new three.Group();
          container.name = definition.id;
          container.visible = state?.visible ?? definition.visible;
          container.position.fromArray(definition.transform.position);
          container.rotation.fromArray(definition.transform.rotation);
          container.scale.fromArray(definition.transform.scale);
          const opacity =
            (state?.opacity ?? definition.defaultOpacity) * globalOpacityRef.current;
          const material = new three.MeshStandardMaterial({
            color: state?.color ?? definition.defaultColor,
            metalness: 0.02,
            roughness: 0.38,
            opacity,
            transparent: opacity < 1,
            depthWrite: opacity >= 0.98,
            side: three.DoubleSide,
          });
          datasetRoot.add(container);
          structures.set(definition.id, {
            container,
            material,
            activeMesh: null,
            currentLod: null,
          });
        }

        const controls = new controlsModule.OrbitControls(
          camera,
          renderer.domElement,
        );
        controls.enableDamping = true;
        controls.dampingFactor = 0.075;
        controls.enablePan = true;
        controls.screenSpacePanning = true;
        controls.zoomSpeed = 0.72;
        controls.rotateSpeed = 0.62;
        controls.panSpeed = 0.72;
        controls.minDistance = 0.7;
        controls.maxDistance = 8;
        controls.autoRotate = autoRotateRef.current;
        controls.autoRotateSpeed = 0.55;

        const fitDistance =
          1.14 / Math.sin(three.MathUtils.degToRad(camera.fov / 2));
        const defaultPose: CameraPose = {
          position: [0, 0.08, fitDistance],
          target: [0, 0, 0],
          up: [0, 1, 0],
        };
        camera.position.fromArray(defaultPose.position);
        camera.up.fromArray(defaultPose.up);
        controls.target.fromArray(defaultPose.target);
        controls.update();

        const cache = new AssetCache<ViewerAsset>();
        const requestScheduler = new RequestScheduler(3);
        const gltfLoader = new loaderModule.GLTFLoader();
        gltfLoader.setMeshoptDecoder(meshoptimizer.MeshoptDecoder);
        const startedAt = performance.now();
        const statuses = emptyStructureStatuses(manifest);
        const timings = {
          firstGeometryMs: null as number | null,
          firstMeaningfulRenderMs: null as number | null,
          interactiveMs: null as number | null,
          highestRequestedLodReadyMs: null as number | null,
        };
        const startup = {
          bytes: 0,
          requests: 0,
          triangles: 0,
        };
        const requestedLevels = new Map<string, LodLevel>();
        const downloadedLevels = new Map<string, Set<LodLevel>>();
        const bootstrapGeometries = new Map<string, GeometryAsset>();
        let demandRequestsInFlight = 0;
        let demandActivated = false;
        let suppressCameraBroadcast = false;
        let progressiveBaseReady = mode === "baseline";

        const snapshotMetrics = (): ViewerMetrics => {
          const cacheStats = cache.snapshot();
          let currentTriangles = 0;
          for (const definition of manifest.structures) {
            if (statesRef.current[definition.id]?.visible) {
              currentTriangles += statuses[definition.id].triangleCount;
            }
          }
          return {
            mode,
            startedAt,
            ...timings,
            startupBytes: startup.bytes,
            startupRequests: startup.requests,
            startupTriangles: startup.triangles,
            requestedBytes: cacheStats.requestedBytes,
            assetRequests: cacheStats.requests,
            cacheHits: cacheStats.hits,
            cacheMisses: cacheStats.misses,
            currentTriangles,
            totalLoadedTriangles: cacheStats.totalLoadedTriangles,
            structures: structuredClone(statuses),
          };
        };

        const emitMetrics = () => onMetrics(snapshotMetrics());

        const fetchGlb = (url: string) =>
          requestScheduler.run(async () => {
            const response = await fetch(url, {
              cache: "no-store",
              credentials: "same-origin",
            });
            if (!response.ok) {
              throw new Error(`Asset request failed with HTTP ${response.status}.`);
            }
            const buffer = await response.arrayBuffer();
            const gltf = await gltfLoader.parseAsync(buffer, "");
            return { buffer, gltf };
          });

        const loadGeometry = async (url: string): Promise<GeometryAsset> => {
          const { buffer, gltf } = await fetchGlb(url);
          gltf.scene.updateMatrixWorld(true);
          const sourceMesh = gltf.scene.getObjectByProperty("type", "Mesh") as
            | THREE.Mesh
            | undefined;
          if (!sourceMesh || !(sourceMesh.geometry instanceof three.BufferGeometry)) {
            disposeObject(gltf.scene, three);
            throw new Error("The GLB contains no mesh geometry.");
          }
          const geometry = sourceMesh.geometry.clone();
          const matrix = sourceMesh.matrixWorld.clone();
          const asset: GeometryAsset = {
            kind: "geometry",
            geometry,
            matrix,
            triangleCount: triangleCount(geometry),
            byteSize: buffer.byteLength,
            dispose: () => geometry.dispose(),
          };
          disposeObject(gltf.scene, three);
          return asset;
        };

        const loadGeometryBundle = async (
          url: string,
          expectedNodes: Array<{ structureId: string; nodeName: string }>,
        ): Promise<GeometryBundleAsset> => {
          const { buffer, gltf } = await fetchGlb(url);
          gltf.scene.updateMatrixWorld(true);
          const geometries = new Map<string, GeometryAsset>();

          for (const expected of expectedNodes) {
            let object: THREE.Object3D | undefined;
            gltf.scene.traverse((candidate) => {
              if (
                !object &&
                (candidate.name === expected.nodeName ||
                  candidate.userData.name === expected.nodeName)
              ) {
                object = candidate;
              }
            });
            let sourceMesh: THREE.Mesh | undefined;
            object?.traverse((child) => {
              if (!sourceMesh && child instanceof three.Mesh) sourceMesh = child;
            });
            if (!sourceMesh || !(sourceMesh.geometry instanceof three.BufferGeometry)) {
              disposeObject(gltf.scene, three);
              geometries.forEach((asset) => asset.dispose());
              throw new Error(
                `${url} is missing mesh node ${expected.nodeName}.`,
              );
            }
            const geometry = sourceMesh.geometry.clone();
            geometries.set(expected.structureId, {
              kind: "geometry",
              geometry,
              matrix: sourceMesh.matrixWorld.clone(),
              triangleCount: triangleCount(geometry),
              byteSize: 0,
              dispose: () => geometry.dispose(),
            });
          }

          disposeObject(gltf.scene, three);
          const bundleTriangles = [...geometries.values()].reduce(
            (sum, asset) => sum + asset.triangleCount,
            0,
          );
          for (const asset of geometries.values()) {
            asset.byteSize = Math.round(
              buffer.byteLength * (asset.triangleCount / bundleTriangles),
            );
          }
          return {
            kind: "bundle",
            geometries,
            triangleCount: bundleTriangles,
            byteSize: buffer.byteLength,
            dispose: () => geometries.forEach((asset) => asset.dispose()),
          };
        };

        const replaceActiveGeometry = (
          structureId: string,
          level: LodLevel,
          asset: GeometryAsset,
        ) => {
          const structure = structures.get(structureId);
          if (!structure || structure.currentLod === level) return;
          const replacement = new three.Mesh(
            asset.geometry.clone(),
            structure.material,
          );
          replacement.name = `${structureId}-lod${level}`;
          replacement.matrixAutoUpdate = false;
          replacement.matrix.copy(asset.matrix);
          replacement.renderOrder = manifest.structures.findIndex(
            (item) => item.id === structureId,
          );
          structure.container.add(replacement);

          // The replacement is fully parsed before the old geometry is removed,
          // avoiding an empty frame without introducing complex geomorphing.
          if (structure.activeMesh) {
            structure.container.remove(structure.activeMesh);
            structure.activeMesh.geometry.dispose();
          }
          structure.activeMesh = replacement;
          structure.currentLod = level;
          statuses[structureId].currentLod = level;
          statuses[structureId].triangleCount = asset.triangleCount;
          if (timings.firstGeometryMs === null) {
            timings.firstGeometryMs = performance.now() - startedAt;
          }
          emitMetrics();
        };

        const loadLevel = async (
          structureId: string,
          level: LodLevel,
          activate: boolean,
        ) => {
          const definition = manifest.structures.find(
            (structure) => structure.id === structureId,
          );
          const levelDefinition = definition?.levels[level];
          if (!definition || !levelDefinition) return;
          statuses[structureId].loading = true;
          statuses[structureId].error = null;
          emitMetrics();
          try {
            const asset = await cache.load(levelDefinition.url, () =>
              loadGeometry(levelDefinition.url),
            );
            if (cancelled) return;
            if (asset.kind !== "geometry") {
              throw new Error(`${levelDefinition.url} returned an unexpected bundle.`);
            }
            const priorHighest = statuses[structureId].highestDownloadedLod;
            statuses[structureId].highestDownloadedLod = Math.max(
              priorHighest ?? 0,
              level,
            ) as LodLevel;
            const downloaded = downloadedLevels.get(structureId) ?? new Set<LodLevel>();
            if (!downloaded.has(level)) {
              downloaded.add(level);
              downloadedLevels.set(structureId, downloaded);
              statuses[structureId].transferSize += asset.byteSize;
            }
            statuses[structureId].loading = false;
            if (activate) replaceActiveGeometry(structureId, level, asset);
            emitMetrics();
          } catch (error) {
            if (cancelled) return;
            statuses[structureId].loading = false;
            statuses[structureId].error = formatLoadError(error);
            emitMetrics();
          }
        };

        const updateDisplayedLods = () => {
          if (
            !demandActivated ||
            !progressiveBaseReady ||
            mode === "baseline"
          ) return;
          const distance = camera.position.distanceTo(controls.target);
          for (const definition of manifest.structures) {
            const structure = structures.get(definition.id);
            if (!structure) continue;
            if (statuses[definition.id].error) continue;
            const desired = chooseLod({
              distance,
              currentLevel: structure.currentLod,
              isSelected: definition.id === selectedIdRef.current,
              quality: qualityRef.current,
            });
            if (structure.currentLod === desired) continue;
            const desiredUrl = definition.levels[desired].url;
            if (desired === 0) {
              const bootstrapAsset = bootstrapGeometries.get(definition.id);
              if (bootstrapAsset) {
                replaceActiveGeometry(definition.id, desired, bootstrapAsset);
                continue;
              }
            }
            const desiredAsset = cache.reuse(desiredUrl);
            if (desiredAsset?.kind === "geometry") {
              replaceActiveGeometry(definition.id, desired, desiredAsset);
              continue;
            }

            const requestedLevel = requestedLevels.get(definition.id);
            if (requestedLevel === undefined) {
              requestedLevels.set(definition.id, desired);
              demandRequestsInFlight += 1;
              timings.highestRequestedLodReadyMs = null;
              void loadLevel(definition.id, desired, false).finally(() => {
                if (cancelled) return;
                requestedLevels.delete(definition.id);
                demandRequestsInFlight -= 1;
                updateDisplayedLods();
                if (demandRequestsInFlight === 0) {
                  timings.highestRequestedLodReadyMs = performance.now() - startedAt;
                  emitMetrics();
                }
              });
            }

            // Keep the best cached level visible while the requested detail
            // loads. This avoids an empty frame and lets camera motion drive
            // network work instead of eagerly fetching every possible LOD.
            for (let fallback = desired - 1; fallback >= 0; fallback -= 1) {
              if (fallback === 0) {
                const bootstrapAsset = bootstrapGeometries.get(definition.id);
                if (bootstrapAsset) {
                  replaceActiveGeometry(definition.id, 0, bootstrapAsset);
                  break;
                }
              }
              const asset = cache.peek(definition.levels[fallback].url);
              if (asset?.kind === "geometry") {
                replaceActiveGeometry(
                  definition.id,
                  fallback as LodLevel,
                  asset,
                );
                break;
              }
            }
          }
          emitMetrics();
        };

        const activateDemandDrivenLods = () => {
          demandActivated = true;
          updateDisplayedLods();
        };

        const publishCameraPose = () => {
          if (suppressCameraBroadcast) return;
          onCameraPose({
            position: camera.position.toArray(),
            target: controls.target.toArray(),
            up: camera.up.toArray(),
          });
          activateDemandDrivenLods();
        };
        controls.addEventListener("change", publishCameraPose);

        const applyCameraPose = (pose: CameraPose) => {
          suppressCameraBroadcast = true;
          camera.position.fromArray(pose.position);
          camera.up.fromArray(pose.up);
          controls.target.fromArray(pose.target);
          controls.update();
          suppressCameraBroadcast = false;
          activateDemandDrivenLods();
        };

        const frameSphere = (sphere: THREE.Sphere) => {
          const direction = camera.position
            .clone()
            .sub(controls.target)
            .normalize();
          const distance =
            Math.max(sphere.radius, 0.2) /
            Math.sin(three.MathUtils.degToRad(camera.fov / 2));
          camera.position.copy(sphere.center).addScaledVector(direction, distance * 1.18);
          controls.target.copy(sphere.center);
          controls.update();
          publishCameraPose();
        };

        const frameAll = () => {
          const bounds = new three.Box3().setFromObject(datasetRoot);
          if (bounds.isEmpty()) {
            applyCameraPose(defaultPose);
            return;
          }
          frameSphere(bounds.getBoundingSphere(new three.Sphere()));
        };

        const frameStructure = (structureId: string) => {
          const structure = structures.get(structureId);
          if (!structure?.activeMesh) return;
          const bounds = new three.Box3().setFromObject(structure.container);
          if (!bounds.isEmpty()) frameSphere(bounds.getBoundingSphere(new three.Sphere()));
        };

        const runtime: ViewerRuntime = {
          three,
          camera,
          controls,
          renderer,
          scene,
          datasetRoot,
          structures,
          cache,
          requestedLevels,
          activateDemandDrivenLods,
          applyCameraPose,
          clearCache: () => {
            cache.clear();
            bootstrapGeometries.clear();
          },
          frameAll,
          frameStructure,
          updateDisplayedLods,
        };
        runtimeRef.current = runtime;

        const resize = () => {
          const { width, height } = mount.getBoundingClientRect();
          if (!width || !height) return;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height, false);
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(mount);
        resize();

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Home") {
            event.preventDefault();
            frameAll();
          } else if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            controls.dollyIn(1.15);
            controls.update();
          } else if (event.key === "-" || event.key === "_") {
            event.preventDefault();
            controls.dollyOut(1.15);
            controls.update();
          }
        };
        mount.addEventListener("keydown", handleKeyDown);

        const render = () => {
          controls.update();
          renderer.render(scene, camera);
          frame = window.requestAnimationFrame(render);
        };
        frame = window.requestAnimationFrame(render);
        emitMetrics();

        cleanup = () => {
          window.cancelAnimationFrame(frame);
          resizeObserver.disconnect();
          mount.removeEventListener("keydown", handleKeyDown);
          controls.removeEventListener("change", publishCameraPose);
          controls.dispose();
          cache.clear();
          disposeObject(scene, three);
          renderer.dispose();
          mount.replaceChildren();
          if (runtimeRef.current === runtime) runtimeRef.current = null;
        };

        if (mode === "baseline") {
          await Promise.all(
            manifest.dataset.sourceAssets.map(async (sourceAsset) => {
              const definitions = manifest.structures.filter(
                (structure) => structure.sourceAssetRole === sourceAsset.role,
              );
              const bundle = await cache.load(sourceAsset.url, () =>
                loadGeometryBundle(
                  sourceAsset.url,
                  definitions.map((structure) => ({
                    structureId: structure.id,
                    nodeName: structure.sourceNodeName,
                  })),
                ),
              );
              if (cancelled) return;
              if (bundle.kind !== "bundle") {
                throw new Error(`${sourceAsset.url} returned an unexpected mesh.`);
              }
              for (const definition of definitions) {
                const asset = bundle.geometries.get(definition.id);
                if (!asset) {
                  throw new Error(`${sourceAsset.url} is missing ${definition.id}.`);
                }
                downloadedLevels.set(definition.id, new Set<LodLevel>([3]));
                statuses[definition.id].highestDownloadedLod = 3;
                statuses[definition.id].loading = false;
                statuses[definition.id].transferSize = asset.byteSize;
                replaceActiveGeometry(definition.id, 3, asset);
              }
            }),
          );
        } else {
          const bootstrapDefinition = manifest.delivery.progressive.bootstrap;
          const bundle = await cache.load(bootstrapDefinition.url, () =>
            loadGeometryBundle(
              bootstrapDefinition.url,
              manifest.structures.map((structure) => ({
                structureId: structure.id,
                nodeName: structure.id,
              })),
            ),
          );
          if (cancelled) return;
          if (bundle.kind !== "bundle") {
            throw new Error(`${bootstrapDefinition.url} returned an unexpected mesh.`);
          }
          for (const definition of manifest.structures) {
            const asset = bundle.geometries.get(definition.id);
            if (!asset) {
              throw new Error(`${bootstrapDefinition.url} is missing ${definition.id}.`);
            }
            bootstrapGeometries.set(definition.id, asset);
            downloadedLevels.set(definition.id, new Set<LodLevel>([0]));
            statuses[definition.id].highestDownloadedLod = 0;
            statuses[definition.id].loading = false;
            statuses[definition.id].transferSize = asset.byteSize;
            replaceActiveGeometry(definition.id, 0, asset);
          }
        }
        if (cancelled) return;
        timings.firstMeaningfulRenderMs = performance.now() - startedAt;
        timings.interactiveMs = timings.firstMeaningfulRenderMs;
        const startupSnapshot = cache.snapshot();
        startup.bytes = startupSnapshot.requestedBytes;
        startup.requests = startupSnapshot.requests;
        startup.triangles = startupSnapshot.totalLoadedTriangles;
        progressiveBaseReady = true;
        timings.highestRequestedLodReadyMs = timings.firstMeaningfulRenderMs;
        // The initial camera alone does not promote LODs. Promotion begins only
        // after camera movement, selection, framing, or a manual quality change.
        if (qualityRef.current !== "automatic") demandActivated = true;
        updateDisplayedLods();
        emitMetrics();

      };

      void setup().catch((error) => {
        if (!cancelled) {
          const statuses = emptyStructureStatuses(manifest);
          Object.values(statuses).forEach((status) => {
            status.loading = false;
            status.error = formatLoadError(error);
          });
          onMetrics({
            mode,
            startedAt: performance.now(),
            firstGeometryMs: null,
            firstMeaningfulRenderMs: null,
            interactiveMs: null,
            highestRequestedLodReadyMs: null,
            startupBytes: 0,
            startupRequests: 0,
            startupTriangles: 0,
            requestedBytes: 0,
            assetRequests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            currentTriangles: 0,
            totalLoadedTriangles: 0,
            structures: statuses,
          });
        }
      });

      return () => {
        cancelled = true;
        cleanup();
      };
    }, [manifest, mode, onCameraPose, onMetrics]);

    return (
      <div
        aria-label={label}
        className={className}
        onContextMenu={(event) => event.preventDefault()}
        ref={mountRef}
        role="img"
        tabIndex={0}
      />
    );
  },
);
