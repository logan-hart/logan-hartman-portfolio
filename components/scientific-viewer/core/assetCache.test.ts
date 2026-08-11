import assert from "node:assert/strict";
import test from "node:test";

import { AssetCache } from "@/components/scientific-viewer/core/assetCache";

test("cache records misses, hits, bytes, and loaded triangles", async () => {
  const cache = new AssetCache<{ byteSize: number; triangleCount: number }>();
  const first = await cache.load("mesh", async () => ({ byteSize: 120, triangleCount: 42 }));
  const second = await cache.load("mesh", async () => ({ byteSize: 999, triangleCount: 999 }));

  assert.equal(first, second);
  assert.deepEqual(cache.snapshot(), {
    entries: 1,
    hits: 1,
    misses: 1,
    requests: 1,
    requestedBytes: 120,
    totalLoadedTriangles: 42,
  });
});

test("cache deduplicates simultaneous requests by reusing one promise", async () => {
  const cache = new AssetCache<{ byteSize: number; triangleCount: number }>();
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const loader = async () => {
    calls += 1;
    await gate;
    return { byteSize: 1, triangleCount: 2 };
  };

  const first = cache.load("shared", loader);
  const second = cache.load("shared", loader);
  release();
  assert.equal(await first, await second);
  assert.equal(calls, 1);
  assert.equal(cache.snapshot().hits, 1);
});

test("clear disposes ready cached assets", async () => {
  let disposed = 0;
  const cache = new AssetCache<{
    byteSize: number;
    triangleCount: number;
    dispose: () => void;
  }>();
  await cache.load("mesh", async () => ({
    byteSize: 1,
    triangleCount: 1,
    dispose: () => {
      disposed += 1;
    },
  }));
  cache.clear();
  assert.equal(disposed, 1);
  assert.equal(cache.snapshot().entries, 0);
});
