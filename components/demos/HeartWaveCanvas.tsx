"use client";

import { useEffect, useRef } from "react";
import type * as THREE from "three";

type HeartWaveCanvasProps = {
  playing: boolean;
};

/* Original "The Wave" CodePen parameters supplied by Logan Hart. */
const SEPARATION = 15;
const AMOUNT_X = 90;
const AMOUNT_Y = 60;
const AMPLITUDE_ONE = 9;
const AMPLITUDE_TWO = 9;
const SPEED = 0.07;

const BASE_SIZE = 1.4;
const SIZE_GAIN = 0.1;
const MIN_SIZE = 1.4;
const PERSPECTIVE = 210;

const VELOCITY_GAIN = 3;
const NEAR_DISTANCE = 120;
const FAR_DISTANCE = 220;
const BIAS_POWER = 1.6;
const STOP_POSITIONS = [0, 0.25, 0.4, 0.55, 0.75, 0.9] as const;

const vertexShader = `
  attribute float aVelocity;

  uniform float uSize, uSizeGain, uMinSize, uPerspective, uPixelRatio;
  uniform float uYMin, uYMax;
  uniform vec2 uNearFar;

  varying float vYN01;
  varying float vVel;
  varying float vNear01;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);

    float yn = (position.y - uYMin) / max(0.0001, (uYMax - uYMin));
    vYN01 = clamp(yn, 0.0, 1.0);
    vVel = aVelocity;

    float dist = -mv.z;
    vNear01 = 1.0 - smoothstep(uNearFar.x, uNearFar.y, dist);

    float sizePx = max(uMinSize, uSize + uSizeGain * position.y);
    gl_PointSize = sizePx * (uPerspective / -mv.z) * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = `
  precision mediump float;

  uniform float uOpacity;
  uniform float uVelGain;
  uniform float uBiasPow;
  uniform float uEaseStrength;

  uniform vec3 uStop0, uStop1, uStop2, uStop3, uStop4, uStop5;
  uniform float uS0, uS1, uS2, uS3, uS4, uS5;

  uniform vec3 uWarmBoost;
  uniform vec3 uCoolBoost;

  varying float vYN01;
  varying float vVel;
  varying float vNear01;

  float saturate(float value) {
    return clamp(value, 0.0, 1.0);
  }

  vec3 rampCustom(float value) {
    float biased = pow(value, uBiasPow);
    float eased = (uEaseStrength <= 0.0)
      ? biased
      : (0.5 - 0.5 * cos(3.1415926535 * biased));

    if (eased <= uS1) return mix(uStop0, uStop1, saturate((eased - uS0) / max(1e-5, uS1 - uS0)));
    if (eased <= uS2) return mix(uStop1, uStop2, saturate((eased - uS1) / max(1e-5, uS2 - uS1)));
    if (eased <= uS3) return mix(uStop2, uStop3, saturate((eased - uS2) / max(1e-5, uS3 - uS2)));
    if (eased <= uS4) return mix(uStop3, uStop4, saturate((eased - uS3) / max(1e-5, uS4 - uS3)));
    if (eased <= uS5) return mix(uStop4, uStop5, saturate((eased - uS4) / max(1e-5, uS5 - uS4)));
    return uStop5;
  }

  void main() {
    float distanceFromCenter = distance(gl_PointCoord, vec2(0.5));
    if (distanceFromCenter > 0.5) discard;

    float alpha = (1.0 - smoothstep(0.45, 0.5, distanceFromCenter)) * uOpacity;
    vec3 color = rampCustom(vYN01);

    float rising = saturate(vVel * uVelGain) * vNear01;
    float falling = saturate(-vVel * uVelGain);
    color = mix(color, uWarmBoost, rising);
    color = mix(color, uCoolBoost, falling);

    gl_FragColor = vec4(color, alpha);
  }
`;

export function HeartWaveCanvas({ playing }: HeartWaveCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playingRef = useRef(playing);
  const resumeAnimationRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    playingRef.current = playing;
    resumeAnimationRef.current?.();
  }, [playing]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;
    const mount: HTMLDivElement = currentMount;

    let disposed = false;
    let started = false;
    let animationFrame = 0;
    let preloadObserver: IntersectionObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let visibilityObserver: IntersectionObserver | undefined;
    let renderer: THREE.WebGLRenderer | undefined;
    let geometry: THREE.BufferGeometry | undefined;
    let material: THREE.ShaderMaterial | undefined;
    let removeRuntimeListeners: (() => void) | undefined;
    let isVisible = false;

    async function setup() {
      const three = await import("three");
      if (disposed) return;

      renderer = new three.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.outputColorSpace = three.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.className = "heart-dot-wave__canvas";
      mount.replaceChildren(renderer.domElement);

      const scene = new three.Scene();
      const camera = new three.PerspectiveCamera(50, 1, 0.1, 4000);
      camera.position.set(0, 35, 260);
      camera.lookAt(0, 0, 0);

      const pointCount = AMOUNT_X * AMOUNT_Y;
      const positions = new Float32Array(pointCount * 3);
      const velocities = new Float32Array(pointCount);

      let positionIndex = 0;
      for (let xIndex = 0; xIndex < AMOUNT_X; xIndex += 1) {
        for (let yIndex = 0; yIndex < AMOUNT_Y; yIndex += 1) {
          positions[positionIndex] = (xIndex - AMOUNT_X * 0.5) * SEPARATION;
          positions[positionIndex + 1] = 0;
          positions[positionIndex + 2] = (yIndex - AMOUNT_Y * 0.5) * SEPARATION;
          positionIndex += 3;
        }
      }

      geometry = new three.BufferGeometry();
      geometry.setAttribute("position", new three.BufferAttribute(positions, 3));
      geometry.setAttribute("aVelocity", new three.BufferAttribute(velocities, 1));

      material = new three.ShaderMaterial({
        uniforms: {
          uSize: { value: BASE_SIZE },
          uSizeGain: { value: SIZE_GAIN },
          uMinSize: { value: MIN_SIZE },
          uPerspective: { value: PERSPECTIVE },
          uPixelRatio: { value: renderer.getPixelRatio() },
          uYMin: { value: -1 },
          uYMax: { value: 1 },
          uNearFar: { value: new three.Vector2(NEAR_DISTANCE, FAR_DISTANCE) },
          uStop5: { value: new three.Color("#2d2dff") },
          uStop4: { value: new three.Color("#8219e2") },
          uStop3: { value: new three.Color("#f345d0") },
          uStop2: { value: new three.Color("#f349bf") },
          uStop1: { value: new three.Color("#f45a58") },
          uStop0: { value: new three.Color("#f345d0") },
          uS0: { value: STOP_POSITIONS[0] },
          uS1: { value: STOP_POSITIONS[1] },
          uS2: { value: STOP_POSITIONS[2] },
          uS3: { value: STOP_POSITIONS[3] },
          uS4: { value: STOP_POSITIONS[4] },
          uS5: { value: STOP_POSITIONS[5] },
          uBiasPow: { value: BIAS_POWER },
          uEaseStrength: { value: 1 },
          uVelGain: { value: VELOCITY_GAIN },
          uWarmBoost: { value: new three.Color("#ffb347") },
          uCoolBoost: { value: new three.Color("#4b1ea6") },
          uOpacity: { value: 1 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: three.AdditiveBlending,
      });

      const points = new three.Points(geometry, material);
      scene.add(points);

      const positionAttribute = geometry.getAttribute("position") as THREE.BufferAttribute;
      const velocityAttribute = geometry.getAttribute("aVelocity") as THREE.BufferAttribute;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let time = 0;
      let frameScheduled = false;

      const renderFrame = (advance: boolean) => {
        let index = 0;
        let velocityIndex = 0;
        let minimumY = Number.POSITIVE_INFINITY;
        let maximumY = Number.NEGATIVE_INFINITY;

        for (let xIndex = 0; xIndex < AMOUNT_X; xIndex += 1) {
          for (let yIndex = 0; yIndex < AMOUNT_Y; yIndex += 1) {
            const previousY = positionAttribute.array[index + 1];
            const nextY =
              Math.sin((xIndex + time) * 0.28) * AMPLITUDE_ONE +
              Math.sin((yIndex + time) * 0.46) * AMPLITUDE_TWO;

            positionAttribute.array[index + 1] = nextY;
            velocityAttribute.array[velocityIndex] = nextY - previousY;
            minimumY = Math.min(minimumY, nextY);
            maximumY = Math.max(maximumY, nextY);
            index += 3;
            velocityIndex += 1;
          }
        }

        positionAttribute.needsUpdate = true;
        velocityAttribute.needsUpdate = true;
        material!.uniforms.uYMin.value = minimumY;
        material!.uniforms.uYMax.value = maximumY;

        if (advance) time += SPEED;
        renderer!.render(scene, camera);
      };

      const animate = () => {
        frameScheduled = false;
        if (
          disposed ||
          !playingRef.current ||
          !isVisible ||
          reduceMotion.matches ||
          document.hidden
        ) {
          return;
        }

        renderFrame(true);
        scheduleAnimation();
      };

      const scheduleAnimation = () => {
        if (
          disposed ||
          frameScheduled ||
          !playingRef.current ||
          !isVisible ||
          reduceMotion.matches ||
          document.hidden
        ) {
          return;
        }

        frameScheduled = true;
        animationFrame = window.requestAnimationFrame(animate);
      };

      const resize = (width: number, height: number) => {
        const safeWidth = Math.max(1, width);
        const safeHeight = Math.max(1, height);
        renderer!.setSize(safeWidth, safeHeight, false);
        camera.aspect = safeWidth / safeHeight;
        camera.updateProjectionMatrix();
        material!.uniforms.uPixelRatio.value = renderer!.getPixelRatio();
        renderFrame(false);
      };

      resizeObserver = new ResizeObserver(([entry]) => {
        resize(entry.contentRect.width, entry.contentRect.height);
      });
      resizeObserver.observe(mount);

      visibilityObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
        scheduleAnimation();
      });
      visibilityObserver.observe(mount);

      const handleVisibilityChange = () => scheduleAnimation();
      const handleMotionPreference = () => scheduleAnimation();
      document.addEventListener("visibilitychange", handleVisibilityChange);
      reduceMotion.addEventListener("change", handleMotionPreference);
      resumeAnimationRef.current = scheduleAnimation;
      removeRuntimeListeners = () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        reduceMotion.removeEventListener("change", handleMotionPreference);
        if (resumeAnimationRef.current === scheduleAnimation) {
          resumeAnimationRef.current = null;
        }
      };

      resize(mount.clientWidth, mount.clientHeight);
      scheduleAnimation();
    }

    preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        preloadObserver?.disconnect();
        void setup();
      },
      { rootMargin: "320px 0px" },
    );
    preloadObserver.observe(mount);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      preloadObserver?.disconnect();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      removeRuntimeListeners?.();
      geometry?.dispose();
      material?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, []);

  return <div aria-hidden="true" className="heart-dot-wave" ref={mountRef} />;
}
