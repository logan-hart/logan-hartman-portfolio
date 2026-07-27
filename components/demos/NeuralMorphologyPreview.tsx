"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";

import {
  H01_CELLS,
  H01_PREVIEW_MODEL_URL,
} from "@/components/demos/h01MorphologyData";

const PREVIEW_CAMERA_DISTANCE_FACTOR = 0.5;
const PREVIEW_ROTATION_RADIANS_PER_SECOND = 0.138;

function disposeScene(scene: THREE.Object3D, three: typeof import("three")) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();

  scene.traverse((object) => {
    if ("geometry" in object && object.geometry instanceof three.BufferGeometry) {
      geometries.add(object.geometry);
    }
    if ("material" in object) {
      const material = object.material as THREE.Material | THREE.Material[];
      (Array.isArray(material) ? material : [material]).forEach((item) => materials.add(item));
    }
  });

  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

function getSourceId(object: THREE.Object3D) {
  const explicitId = object.userData.h01SegmentId;
  if (typeof explicitId === "string") return explicitId;
  if (typeof explicitId === "number") return String(explicitId);
  return H01_CELLS.find((cell) => object.name.includes(cell.sourceId))?.sourceId;
}

export function NeuralMorphologyPreview() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setShouldLoad(true);
        loadObserver.disconnect();
      },
      { rootMargin: "500px 0px", threshold: 0 },
    );
    loadObserver.observe(mount);

    return () => loadObserver.disconnect();
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !shouldLoad) return;

    let cancelled = false;
    let cleanup = () => {};

    const setup = async () => {
      setLoadFailed(false);
      const [three, loaderModule] = await Promise.all([
        import("three"),
        import("three/examples/jsm/loaders/GLTFLoader.js"),
      ]);
      if (cancelled) return;

      const scene = new three.Scene();
      scene.background = new three.Color(0x061321);

      const camera = new three.PerspectiveCamera(38, 16 / 9, 0.1, 5000);
      const renderer = new three.WebGLRenderer({
        antialias: true,
        powerPreference: "low-power",
      });
      renderer.outputColorSpace = three.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.domElement.setAttribute("aria-hidden", "true");
      mount.replaceChildren(renderer.domElement);

      let baseDisposed = false;
      const disposeBase = () => {
        if (baseDisposed) return;
        baseDisposed = true;
        disposeScene(scene, three);
        renderer.dispose();
        mount.replaceChildren();
      };
      cleanup = disposeBase;

      scene.add(new three.HemisphereLight(0xc8f2ff, 0x102033, 1.65));
      const keyLight = new three.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(420, 520, 700);
      scene.add(keyLight);
      const rimLight = new three.PointLight(0x52e1da, 32, 1800, 2);
      rimLight.position.set(-520, -120, 520);
      scene.add(rimLight);

      const loader = new loaderModule.GLTFLoader();
      const gltf = await loader.loadAsync(H01_PREVIEW_MODEL_URL);
      if (cancelled) {
        disposeScene(gltf.scene, three);
        cleanup();
        return;
      }

      const cluster = gltf.scene;
      cluster.rotation.set(-0.16, -0.3, -0.03);
      scene.add(cluster);
      const sourceMeshes: THREE.Mesh[] = [];
      cluster.traverse((object) => {
        if (object instanceof three.Mesh) sourceMeshes.push(object);
      });

      sourceMeshes.forEach((mesh) => {
        const sourceId = getSourceId(mesh);
        const cell = H01_CELLS.find((item) => item.sourceId === sourceId);
        if (!cell) {
          mesh.visible = false;
          return;
        }

        const priorMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        priorMaterials.forEach((material) => material.dispose());

        mesh.material = new three.MeshPhysicalMaterial({
          clearcoat: 0.28,
          clearcoatRoughness: 0.5,
          color: cell.color,
          depthWrite: false,
          emissive: cell.color,
          emissiveIntensity: 0.05,
          metalness: 0.03,
          opacity: 0.46,
          roughness: 0.34,
          side: three.DoubleSide,
          transparent: true,
        });
        mesh.renderOrder = H01_CELLS.findIndex((item) => item.sourceId === sourceId);

        const wireframe = new three.Mesh(
          mesh.geometry,
          new three.MeshBasicMaterial({
            color: cell.color,
            depthWrite: false,
            opacity: 0.1,
            transparent: true,
            wireframe: true,
          }),
        );
        wireframe.position.copy(mesh.position);
        wireframe.quaternion.copy(mesh.quaternion);
        wireframe.scale.copy(mesh.scale);
        wireframe.renderOrder = mesh.renderOrder + H01_CELLS.length;
        mesh.parent?.add(wireframe);
      });

      const bounds = new three.Box3().setFromObject(cluster);
      const sphere = bounds.getBoundingSphere(new three.Sphere());
      const radius = Math.max(sphere.radius, 1);
      const distance =
        radius /
        Math.sin(three.MathUtils.degToRad(camera.fov / 2)) *
        PREVIEW_CAMERA_DISTANCE_FACTOR;
      camera.position.copy(sphere.center).add(new three.Vector3(0, radius * 0.04, distance));
      camera.lookAt(sphere.center);
      camera.near = Math.max(0.1, distance / 1000);
      camera.far = distance * 8;
      camera.updateProjectionMatrix();
      scene.fog = new three.FogExp2(0x061321, 0.42 / distance);

      const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
      let reducedMotion = motionPreference.matches;
      const clock = new three.Clock();
      let isVisible = false;
      let frame = 0;

      const render = () => renderer.render(scene, camera);
      const resize = () => {
        const { width, height } = mount.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        render();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      resize();

      const animate = () => {
        frame = 0;
        if (!isVisible || reducedMotion) return;
        const delta = Math.min(clock.getDelta(), 0.05);
        cluster.rotation.y += delta * PREVIEW_ROTATION_RADIANS_PER_SECOND;
        render();
        frame = window.requestAnimationFrame(animate);
      };

      const stopAnimation = () => {
        if (!frame) return;
        window.cancelAnimationFrame(frame);
        frame = 0;
      };

      const startAnimation = () => {
        if (!isVisible || reducedMotion || frame) {
          if (isVisible) render();
          return;
        }
        clock.getDelta();
        frame = window.requestAnimationFrame(animate);
      };

      const handleMotionPreference = (event: MediaQueryListEvent) => {
        reducedMotion = event.matches;
        if (reducedMotion) {
          stopAnimation();
          if (isVisible) render();
        } else {
          startAnimation();
        }
      };
      motionPreference.addEventListener("change", handleMotionPreference);

      const visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          isVisible = entry?.isIntersecting ?? true;
          if (isVisible) startAnimation();
          else stopAnimation();
        },
        { threshold: 0.05 },
      );
      visibilityObserver.observe(mount);
      render();
      setIsReady(true);

      cleanup = () => {
        stopAnimation();
        motionPreference.removeEventListener("change", handleMotionPreference);
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        disposeBase();
      };
    };

    void setup().catch(() => {
      cleanup();
      if (!cancelled) {
        setIsReady(false);
        setLoadFailed(true);
      }
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [shouldLoad]);

  return (
    <div
      aria-busy={!isReady && !loadFailed}
      className="morphology-preview"
      data-loading={!isReady && !loadFailed}
      data-ready={isReady}
    >
      <Image
        alt=""
        className="morphology-preview__fallback"
        fill
        sizes="(max-width: 720px) 100vw, 36vw"
        src="/images/projects/einstein-research.svg"
      />
      <div className="morphology-preview__canvas" ref={mountRef} />
      {isReady ? (
        <span aria-hidden="true">H01 · Live 3D preview</span>
      ) : !loadFailed ? (
        <div aria-live="polite" className="morphology-preview__loading" role="status">
          <span aria-hidden="true" className="neural-visualizer__spinner" />
          <span>Loading 3D preview</span>
        </div>
      ) : null}
    </div>
  );
}
