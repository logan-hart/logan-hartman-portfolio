export type LodLevel = 0 | 1 | 2 | 3;
export type ViewerQuality = "automatic" | "low" | "balanced" | "high";
export type ViewerMode = "baseline" | "progressive";
export type StructureKind = "context" | "cell";

export type LodManifestEntry = {
  level: LodLevel;
  ratio: number;
  targetRatio: number;
  triangleCount: number;
  byteSize: number;
  recommendedDistance: number;
  url: string;
  sha256: string;
};

export type StructureManifest = {
  id: string;
  sourceId: string;
  kind: StructureKind;
  name: string;
  description: string;
  defaultColor: string;
  defaultOpacity: number;
  visible: boolean;
  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  };
  levels: LodManifestEntry[];
};

export type ScientificViewerManifest = {
  schemaVersion: 2;
  dataset: {
    id: string;
    name: string;
    description: string;
    coordinateSystem: string;
    sourceAssets: Array<{
      role: string;
      url: string;
      byteSize: number;
      sha256: string;
    }>;
    sourcePage: string;
    publication: string;
    license: string;
    licenseUrl: string;
  };
  bounds: {
    minimum: [number, number, number];
    maximum: [number, number, number];
    center: [number, number, number];
    radius: number;
  };
  build: {
    command: string;
    deterministic: boolean;
    gltfTransformVersion: string;
    meshoptimizerVersion: string;
    simplification: string;
    optimization: string;
    ratios: Record<StructureKind, Array<{ level: LodLevel; ratio: number }>>;
  };
  structures: StructureManifest[];
};

export type StructureDisplayState = {
  visible: boolean;
  opacity: number;
  color: string;
};

export type StructureRuntimeStatus = {
  currentLod: LodLevel | null;
  highestDownloadedLod: LodLevel | null;
  loading: boolean;
  error: string | null;
  triangleCount: number;
  transferSize: number;
};

export type ViewerMetrics = {
  mode: ViewerMode;
  startedAt: number;
  firstGeometryMs: number | null;
  firstMeaningfulRenderMs: number | null;
  interactiveMs: number | null;
  highestRequestedLodReadyMs: number | null;
  startupBytes: number;
  startupRequests: number;
  startupTriangles: number;
  requestedBytes: number;
  assetRequests: number;
  cacheHits: number;
  cacheMisses: number;
  currentTriangles: number;
  totalLoadedTriangles: number;
  structures: Record<string, StructureRuntimeStatus>;
};

export type CameraPose = {
  position: [number, number, number];
  target: [number, number, number];
  up: [number, number, number];
};
