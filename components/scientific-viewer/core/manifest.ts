import type {
  LodLevel,
  ScientificViewerManifest,
} from "@/components/scientific-viewer/types";

const EXPECTED_LEVELS: LodLevel[] = [0, 1, 2, 3];

export function validateManifest(value: unknown): ScientificViewerManifest {
  if (!value || typeof value !== "object") {
    throw new Error("The scene manifest is not an object.");
  }

  const manifest = value as Partial<ScientificViewerManifest>;
  if (manifest.schemaVersion !== 3) {
    throw new Error("Unsupported scene manifest version.");
  }
  if (!manifest.bounds || !(manifest.bounds.radius > 0)) {
    throw new Error("The scene manifest has invalid dataset bounds.");
  }
  if (!Array.isArray(manifest.structures) || manifest.structures.length < 2) {
    throw new Error("The scene manifest must contain multiple structures.");
  }
  const bootstrap = manifest.delivery?.progressive?.bootstrap;
  if (
    !bootstrap?.url.endsWith(".glb") ||
    bootstrap.byteSize <= 0 ||
    bootstrap.triangleCount <= 0 ||
    bootstrap.structureCount !== manifest.structures.length
  ) {
    throw new Error("The scene manifest has invalid progressive bootstrap metadata.");
  }
  if (
    manifest.delivery?.baseline?.strategy !== "full-resolution-source-glbs" ||
    manifest.delivery.baseline.byteSize <= 0 ||
    manifest.delivery.baseline.requestCount <= 0 ||
    manifest.delivery.baseline.triangleCount <= 0
  ) {
    throw new Error("The scene manifest has invalid baseline delivery metadata.");
  }

  const sourceRoles = new Set(
    manifest.dataset?.sourceAssets?.map((asset) => asset.role) ?? [],
  );

  const ids = new Set<string>();
  for (const structure of manifest.structures) {
    if (!structure.id || ids.has(structure.id)) {
      throw new Error(`Duplicate or missing structure id: ${structure.id || "(empty)"}.`);
    }
    ids.add(structure.id);
    if (
      !structure.sourceNodeName ||
      !structure.sourceAssetRole ||
      !sourceRoles.has(structure.sourceAssetRole)
    ) {
      throw new Error(`${structure.id} has invalid source-asset mapping.`);
    }
    if (structure.kind !== "context" && structure.kind !== "cell") {
      throw new Error(`${structure.id} has an invalid structure kind.`);
    }

    const levels = structure.levels?.map((level) => level.level);
    if (
      !levels ||
      levels.length !== EXPECTED_LEVELS.length ||
      levels.some((level, index) => level !== EXPECTED_LEVELS[index])
    ) {
      throw new Error(`${structure.id} must provide ordered LOD levels 0–3.`);
    }
    for (const level of structure.levels) {
      if (!level.url.endsWith(".glb") || level.triangleCount <= 0 || level.byteSize <= 0) {
        throw new Error(`${structure.id} LOD ${level.level} has invalid asset metadata.`);
      }
    }
  }

  const lod0Triangles = manifest.structures.reduce(
    (sum, structure) => sum + structure.levels[0].triangleCount,
    0,
  );
  if (bootstrap.triangleCount !== lod0Triangles) {
    throw new Error("The progressive bootstrap triangle count does not match LOD 0.");
  }

  return manifest as ScientificViewerManifest;
}
