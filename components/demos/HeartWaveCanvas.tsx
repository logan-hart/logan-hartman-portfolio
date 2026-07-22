"use client";

import { useEffect, useRef } from "react";

type HeartWaveCanvasProps = {
  playing: boolean;
};

const amountX = 90;
const amountY = 60;
const amplitudeA = 9;
const amplitudeB = 9;
const speed = 0.07;
const stopPositions = [0, 0.25, 0.4, 0.55, 0.75, 0.9];
const palette = ["#f345d0", "#f45a58", "#f349bf", "#f345d0", "#8219e2", "#2d2dff"];

function parseHex(hex: string) {
  return [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
}

function mixColor(from: string, to: string, amount: number) {
  const a = parseHex(from);
  const b = parseHex(to);
  const channels = a.map((channel, index) => Math.round(channel + (b[index] - channel) * amount));
  return `rgb(${channels.join(", ")})`;
}

function rampColor(value: number) {
  const biased = Math.pow(Math.max(0, Math.min(1, value)), 1.6);
  const eased = 0.5 - 0.5 * Math.cos(Math.PI * biased);

  for (let index = 1; index < stopPositions.length; index += 1) {
    if (eased <= stopPositions[index]) {
      const start = stopPositions[index - 1];
      const end = stopPositions[index];
      return mixColor(palette[index - 1], palette[index], (eased - start) / Math.max(0.0001, end - start));
    }
  }

  return palette[palette.length - 1];
}

const bucketColors = Array.from({ length: 16 }, (_, index) => rampColor(index / 15));

export function HeartWaveCanvas({ playing }: HeartWaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let animationFrame = 0;
    let phase = 0;
    let width = 1;
    let height = 1;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const draw = () => {
      context.clearRect(0, 0, width, height);
      const paths = bucketColors.map(() => new Path2D());

      for (let yIndex = 0; yIndex < amountY; yIndex += 1) {
        const depth = yIndex / (amountY - 1);
        const spread = 0.48 + depth * 0.72;
        const baseY = height * (0.04 + depth * 0.9);

        for (let xIndex = 0; xIndex < amountX; xIndex += 1) {
          const waveY =
            Math.sin((xIndex + phase) * 0.28) * amplitudeA +
            Math.sin((yIndex + phase) * 0.46) * amplitudeB;
          const previousY =
            Math.sin((xIndex + phase - speed) * 0.28) * amplitudeA +
            Math.sin((yIndex + phase - speed) * 0.46) * amplitudeB;
          const normalizedHeight = Math.max(0, Math.min(1, (waveY + amplitudeA + amplitudeB) / 36));
          const velocity = waveY - previousY;
          let bucket = Math.round(normalizedHeight * (paths.length - 1));

          if (velocity > 0.22 && depth > 0.55) bucket = Math.max(0, bucket - 3);
          if (velocity < -0.22) bucket = Math.min(paths.length - 1, bucket + 2);

          const screenX = width / 2 + ((xIndex / (amountX - 1)) - 0.5) * width * 1.18 * spread;
          const screenY = baseY - waveY * (1.05 + depth * 1.2);
          const radius = Math.max(0.55, 0.65 + depth * 2.15 + Math.max(0, waveY) * 0.018);
          paths[bucket].moveTo(screenX + radius, screenY);
          paths[bucket].arc(screenX, screenY, radius, 0, Math.PI * 2);
        }
      }

      context.globalCompositeOperation = "lighter";
      paths.forEach((path, index) => {
        context.fillStyle = bucketColors[index];
        context.fill(path);
      });
      context.globalCompositeOperation = "source-over";
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw();
    };

    const animate = () => {
      phase += speed;
      draw();
      animationFrame = window.requestAnimationFrame(animate);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    if (playing && !reduceMotion.matches) {
      animationFrame = window.requestAnimationFrame(animate);
    }

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [playing]);

  return <canvas aria-hidden="true" className="heart-dot-wave" ref={canvasRef} />;
}
