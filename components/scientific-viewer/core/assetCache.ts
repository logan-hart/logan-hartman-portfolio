export type CacheableAsset = {
  byteSize: number;
  triangleCount: number;
  dispose?: () => void;
};

type CacheEntry<TAsset extends CacheableAsset> = {
  status: "loading" | "ready";
  promise: Promise<TAsset>;
  asset?: TAsset;
  lastUsedAt: number;
};

export type AssetCacheSnapshot = {
  entries: number;
  hits: number;
  misses: number;
  requests: number;
  requestedBytes: number;
  totalLoadedTriangles: number;
};

/** Explicit application cache; separate from the browser's HTTP cache. */
export class AssetCache<TAsset extends CacheableAsset> {
  private entries = new Map<string, CacheEntry<TAsset>>();
  private generation = 0;
  private hits = 0;
  private misses = 0;
  private requests = 0;
  private requestedBytes = 0;

  load(key: string, loader: () => Promise<TAsset>): Promise<TAsset> {
    const existing = this.entries.get(key);
    if (existing) {
      this.hits += 1;
      existing.lastUsedAt = performance.now();
      return existing.promise;
    }

    this.misses += 1;
    this.requests += 1;
    const requestGeneration = this.generation;
    const entry: CacheEntry<TAsset> = {
      status: "loading",
      promise: Promise.resolve(undefined as never),
      lastUsedAt: performance.now(),
    };
    const promise = loader()
      .then((asset) => {
        if (requestGeneration !== this.generation) {
          asset.dispose?.();
          throw new Error("Asset cache was cleared while the request was in progress.");
        }
        entry.status = "ready";
        entry.asset = asset;
        entry.lastUsedAt = performance.now();
        this.requestedBytes += asset.byteSize;
        return asset;
      })
      .catch((error) => {
        if (this.entries.get(key) === entry) this.entries.delete(key);
        throw error;
      });
    entry.promise = promise;
    this.entries.set(key, entry);
    return promise;
  }

  peek(key: string): TAsset | undefined {
    const entry = this.entries.get(key);
    return entry?.asset;
  }

  reuse(key: string): TAsset | undefined {
    const entry = this.entries.get(key);
    if (!entry?.asset) return undefined;
    this.hits += 1;
    entry.lastUsedAt = performance.now();
    return entry.asset;
  }

  clear() {
    this.generation += 1;
    for (const entry of this.entries.values()) entry.asset?.dispose?.();
    this.entries.clear();
    this.hits = 0;
    this.misses = 0;
    this.requests = 0;
    this.requestedBytes = 0;
  }

  snapshot(): AssetCacheSnapshot {
    return {
      entries: this.entries.size,
      hits: this.hits,
      misses: this.misses,
      requests: this.requests,
      requestedBytes: this.requestedBytes,
      totalLoadedTriangles: [...this.entries.values()].reduce(
        (sum, entry) => sum + (entry.asset?.triangleCount ?? 0),
        0,
      ),
    };
  }
}
