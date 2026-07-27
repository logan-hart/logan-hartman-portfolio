"use client";

import { useEffect } from "react";
import {
  H01_MODEL_URL,
  H01_PREVIEW_MODEL_URL,
} from "@/components/demos/h01MorphologyData";

const H01_ASSET_URLS = [H01_PREVIEW_MODEL_URL, H01_MODEL_URL];
let warmupPromise: Promise<void> | null = null;

type IdleWindow = Window & {
  cancelIdleCallback?: (handle: number) => void;
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout?: number },
  ) => number;
};

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
  };
};

async function warmAsset(href: string) {
  const url = new URL(href, document.baseURI);

  if (url.origin !== window.location.origin) {
    return;
  }

  const response = await fetch(url, {
    cache: "default",
    credentials: "same-origin",
    priority: "low",
  } as RequestInit & { priority: "low" });

  if (!response.ok) {
    return;
  }

  // Consume the body so the completed response can be retained by the HTTP cache.
  await response.arrayBuffer();
}

async function warmH01Assets() {
  const saveData = (navigator as NavigatorWithConnection).connection?.saveData;
  const urls = saveData ? [H01_PREVIEW_MODEL_URL] : H01_ASSET_URLS;

  // Warm the small card asset first, then the full model, to avoid competing
  // downloads during initial page rendering.
  for (const href of urls) {
    try {
      await warmAsset(href);
    } catch {
      // This is an opportunistic warmup; the visualizer retries on demand.
    }
  }
}

function startWarmup() {
  warmupPromise ??= warmH01Assets();
}

export function H01AssetWarmup() {
  useEffect(() => {
    const idleWindow = window as IdleWindow;

    if (idleWindow.requestIdleCallback) {
      const idleHandle = idleWindow.requestIdleCallback(startWarmup, {
        timeout: 2_000,
      });

      return () => idleWindow.cancelIdleCallback?.(idleHandle);
    }

    const timeoutHandle = window.setTimeout(startWarmup, 800);
    return () => window.clearTimeout(timeoutHandle);
  }, []);

  return null;
}
