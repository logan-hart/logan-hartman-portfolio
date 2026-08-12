#!/usr/bin/env node

/**
 * Builds four meshoptimizer-backed LODs for a mixed public H01 scene.
 *
 * The browser never simplifies geometry. This deterministic, offline step reads
 * two CC BY 4.0 source assets, isolates each cortical-layer crop or proofread
 * reconstruction, applies meshoptimizer through glTF-Transform, and writes
 * decoder-ready GLBs plus one unified scene manifest.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  cloneDocument,
  mergeDocuments,
  meshopt,
  prune,
  simplify,
  unpartition,
  weld,
} from "@gltf-transform/functions";
import {
  MeshoptDecoder,
  MeshoptEncoder,
  MeshoptSimplifier,
} from "meshoptimizer";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = resolve(SCRIPT_DIRECTORY, "..");
const SOURCE_FILES = {
  cells: join(REPOSITORY_ROOT, "public/data/h01/h01-seven-cells.glb"),
  layers: join(REPOSITORY_ROOT, "public/data/h01/h01-layer-context.glb"),
};
const OUTPUT_DIRECTORY = join(
  REPOSITORY_ROOT,
  "public/data/scientific-viewer/generated",
);
const MANIFEST_FILE = join(
  REPOSITORY_ROOT,
  "public/data/scientific-viewer/manifest.json",
);
const BOOTSTRAP_FILE_NAME = "scene-lod0-bootstrap.glb";

const LOD_LEVELS = [
  { level: 0, recommendedDistance: 5.6 },
  { level: 1, recommendedDistance: 3.7 },
  { level: 2, recommendedDistance: 2.2 },
  { level: 3, recommendedDistance: 0 },
];

const LOD_RATIOS = {
  context: [0.03, 0.12, 0.35, 1],
  cell: [0.08, 0.25, 0.5, 1],
};

const STRUCTURES = [
  {
    sourceKey: "layers",
    sourceName: "H01 cortical layer 1 crop",
    sourceId: "1",
    id: "layer-1",
    kind: "context",
    name: "Cortical layer 1 context",
    color: "#577b9f",
    opacity: 0.16,
  },
  {
    sourceKey: "layers",
    sourceName: "H01 cortical layer 2 crop",
    sourceId: "2",
    id: "layer-2",
    kind: "context",
    name: "Cortical layer 2 context",
    color: "#6f6f9f",
    opacity: 0.13,
  },
  {
    sourceKey: "layers",
    sourceName: "H01 cortical layer 3 crop",
    sourceId: "3",
    id: "layer-3",
    kind: "context",
    name: "Cortical layer 3 context",
    color: "#775c83",
    opacity: 0.11,
  },
  {
    sourceKey: "cells",
    sourceName: "H01 reconstruction 1072605926",
    sourceId: "1072605926",
    id: "cell-1072605926",
    kind: "cell",
    name: "Proofread cell 1072605926",
    color: "#32d7d2",
    opacity: 0.78,
  },
  {
    sourceKey: "cells",
    sourceName: "H01 reconstruction 810151953",
    sourceId: "810151953",
    id: "cell-810151953",
    kind: "cell",
    name: "Proofread cell 810151953",
    color: "#ff9d4d",
    opacity: 0.74,
  },
  {
    sourceKey: "cells",
    sourceName: "H01 reconstruction 620880207",
    sourceId: "620880207",
    id: "cell-620880207",
    kind: "cell",
    name: "Proofread cell 620880207",
    color: "#ed70cf",
    opacity: 0.72,
  },
  {
    sourceKey: "cells",
    sourceName: "H01 reconstruction 1684504313",
    sourceId: "1684504313",
    id: "cell-1684504313",
    kind: "cell",
    name: "Proofread cell 1684504313",
    color: "#9de36c",
    opacity: 0.74,
  },
  {
    sourceKey: "cells",
    sourceName: "H01 reconstruction 1465400601",
    sourceId: "1465400601",
    id: "cell-1465400601",
    kind: "cell",
    name: "Proofread cell 1465400601",
    color: "#ffd166",
    opacity: 0.72,
  },
  {
    sourceKey: "cells",
    sourceName: "H01 reconstruction 810970127",
    sourceId: "810970127",
    id: "cell-810970127",
    kind: "cell",
    name: "Proofread cell 810970127",
    color: "#5ea8ff",
    opacity: 0.72,
  },
  {
    sourceKey: "cells",
    sourceName: "H01 reconstruction 2047644309",
    sourceId: "2047644309",
    id: "cell-2047644309",
    kind: "cell",
    name: "Proofread cell 2047644309",
    color: "#9b7cff",
    opacity: 0.72,
  },
];

function triangleCount(document) {
  return document
    .getRoot()
    .listMeshes()
    .flatMap((mesh) => mesh.listPrimitives())
    .reduce((sum, primitive) => {
      const indices = primitive.getIndices();
      const positions = primitive.getAttribute("POSITION");
      return sum + (indices ? indices.getCount() / 3 : (positions?.getCount() ?? 0) / 3);
    }, 0);
}

function computeBounds(documents) {
  const minimum = [Infinity, Infinity, Infinity];
  const maximum = [-Infinity, -Infinity, -Infinity];

  for (const document of documents) {
    for (const mesh of document.getRoot().listMeshes()) {
      for (const primitive of mesh.listPrimitives()) {
        const positions = primitive.getAttribute("POSITION");
        if (!positions) continue;
        const array = positions.getArray();
        for (let index = 0; index < array.length; index += 3) {
          for (let axis = 0; axis < 3; axis += 1) {
            minimum[axis] = Math.min(minimum[axis], array[index + axis]);
            maximum[axis] = Math.max(maximum[axis], array[index + axis]);
          }
        }
      }
    }
  }

  if (!minimum.every(Number.isFinite) || !maximum.every(Number.isFinite)) {
    throw new Error("The source asset has no finite POSITION bounds.");
  }

  const center = minimum.map((value, axis) => (value + maximum[axis]) / 2);
  let radiusSquared = 0;
  for (const document of documents) {
    for (const mesh of document.getRoot().listMeshes()) {
      for (const primitive of mesh.listPrimitives()) {
        const positions = primitive.getAttribute("POSITION");
        if (!positions) continue;
        const array = positions.getArray();
        for (let index = 0; index < array.length; index += 3) {
          const distanceSquared =
            (array[index] - center[0]) ** 2 +
            (array[index + 1] - center[1]) ** 2 +
            (array[index + 2] - center[2]) ** 2;
          radiusSquared = Math.max(radiusSquared, distanceSquared);
        }
      }
    }
  }

  return { minimum, maximum, center, radius: Math.sqrt(radiusSquared) };
}

async function sha256(filePath) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

function isolateStructure(sourceDocument, sourceName) {
  const document = cloneDocument(sourceDocument);
  const matchingNodes = document
    .getRoot()
    .listNodes()
    .filter((node) => node.getName() === sourceName);

  if (matchingNodes.length !== 1) {
    throw new Error(
      `Expected one node named ${sourceName}, found ${matchingNodes.length}.`,
    );
  }

  for (const node of document.getRoot().listNodes()) {
    if (node !== matchingNodes[0]) node.dispose();
  }

  return document;
}

async function buildLevel(sourceDocument, structure, levelSpec, io) {
  const document = isolateStructure(sourceDocument, structure.sourceName);
  await document.transform(prune());
  const sourceTriangles = triangleCount(document);
  const targetRatio = LOD_RATIOS[structure.kind][levelSpec.level];

  if (targetRatio < 1) {
    await document.transform(
      weld({ tolerance: 0.0001 }),
      simplify({
        simplifier: MeshoptSimplifier,
        ratio: targetRatio,
        // A modest error allowance protects the thin branching silhouette while
        // allowing meshoptimizer to approach the requested target ratio.
        error: levelSpec.level === 0 ? 0.1 : 0.01,
        lockBorder: false,
      }),
      prune(),
    );
  }

  await document.transform(
    meshopt({
      encoder: MeshoptEncoder,
      level: "high",
      quantizePosition: 14,
      quantizeNormal: 10,
    }),
  );

  const outputName = `${structure.id}-lod${levelSpec.level}.glb`;
  const outputPath = join(OUTPUT_DIRECTORY, outputName);
  await io.write(outputPath, document);

  // Re-open every generated file so broken extension registration or encoder
  // output fails the build instead of reaching the browser.
  const verificationDocument = await io.read(outputPath);
  const generatedTriangles = triangleCount(verificationDocument);
  if (!generatedTriangles) {
    throw new Error(`${outputName} contains no triangles.`);
  }

  const fileStats = await stat(outputPath);
  return {
    level: levelSpec.level,
    ratio: Number((generatedTriangles / sourceTriangles).toFixed(4)),
    targetRatio,
    triangleCount: generatedTriangles,
    byteSize: fileStats.size,
    recommendedDistance: levelSpec.recommendedDistance,
    url: `/data/scientific-viewer/generated/${outputName}`,
    sha256: await sha256(outputPath),
  };
}

async function buildBootstrapAsset(io, structures) {
  const document = new Document();
  const scene = document.createScene("Progressive LOD 0 bootstrap");

  for (const structure of structures) {
    const level = structure.levels[0];
    const levelDocument = await io.read(
      join(OUTPUT_DIRECTORY, `${structure.id}-lod0.glb`),
    );
    const sourceNode = levelDocument
      .getRoot()
      .listNodes()
      .find((node) => node.getMesh());
    if (!sourceNode) {
      throw new Error(`${structure.id} LOD 0 has no mesh node to bundle.`);
    }

    const propertyMap = mergeDocuments(document, levelDocument);
    const copiedNode = propertyMap.get(sourceNode);
    if (!copiedNode || copiedNode.propertyType !== "Node") {
      throw new Error(`${structure.id} LOD 0 could not be copied into the bootstrap.`);
    }
    copiedNode.setName(structure.id);
    copiedNode.getMesh()?.setName(structure.id);
    scene.addChild(copiedNode);

    // mergeDocuments also copies the source scene. The named bootstrap scene is
    // the only scene the browser needs, while each copied mesh remains a
    // separately addressable node inside it.
    for (const candidate of document.getRoot().listScenes()) {
      if (candidate !== scene) candidate.dispose();
    }

    if (triangleCount(levelDocument) !== level.triangleCount) {
      throw new Error(`${structure.id} LOD 0 metadata changed before bundling.`);
    }
  }

  await document.transform(
    unpartition(),
    prune(),
    meshopt({
      encoder: MeshoptEncoder,
      level: "high",
      quantizePosition: 14,
      quantizeNormal: 10,
    }),
  );

  const outputPath = join(OUTPUT_DIRECTORY, BOOTSTRAP_FILE_NAME);
  await io.write(outputPath, document);
  const verificationDocument = await io.read(outputPath);
  const generatedTriangles = triangleCount(verificationDocument);
  const expectedTriangles = structures.reduce(
    (sum, structure) => sum + structure.levels[0].triangleCount,
    0,
  );
  if (generatedTriangles !== expectedTriangles) {
    throw new Error(
      `${BOOTSTRAP_FILE_NAME} has ${generatedTriangles} triangles; expected ${expectedTriangles}.`,
    );
  }

  const nodeNames = new Set(
    verificationDocument
      .getRoot()
      .listNodes()
      .filter((node) => node.getMesh())
      .map((node) => node.getName()),
  );
  for (const structure of structures) {
    if (!nodeNames.has(structure.id)) {
      throw new Error(`${BOOTSTRAP_FILE_NAME} is missing ${structure.id}.`);
    }
  }

  return {
    url: `/data/scientific-viewer/generated/${BOOTSTRAP_FILE_NAME}`,
    byteSize: (await stat(outputPath)).size,
    triangleCount: generatedTriangles,
    structureCount: structures.length,
    sha256: await sha256(outputPath),
  };
}

async function main() {
  await Promise.all([
    MeshoptDecoder.ready,
    MeshoptEncoder.ready,
    MeshoptSimplifier.ready,
  ]);

  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      "meshopt.decoder": MeshoptDecoder,
      "meshopt.encoder": MeshoptEncoder,
    });
  const sourceDocuments = Object.fromEntries(
    await Promise.all(
      Object.entries(SOURCE_FILES).map(async ([key, file]) => [key, await io.read(file)]),
    ),
  );
  const bounds = computeBounds(
    STRUCTURES.map((structure) =>
      isolateStructure(sourceDocuments[structure.sourceKey], structure.sourceName),
    ),
  );

  await rm(OUTPUT_DIRECTORY, { recursive: true, force: true });
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });

  const structures = [];
  for (const structure of STRUCTURES) {
    const levels = [];
    for (const level of LOD_LEVELS) {
      const result = await buildLevel(
        sourceDocuments[structure.sourceKey],
        structure,
        level,
        io,
      );
      levels.push(result);
      process.stdout.write(
        `${structure.id} LOD ${level.level}: ${result.triangleCount.toLocaleString()} triangles, ${result.byteSize.toLocaleString()} bytes\n`,
      );
    }

    structures.push({
      id: structure.id,
      sourceId: structure.sourceId,
      sourceAssetRole: structure.sourceKey,
      sourceNodeName: structure.sourceName,
      kind: structure.kind,
      name: structure.name,
      description:
        structure.kind === "context"
          ? "Surface extracted offline from a fixed crop of the public H01 cortical-layer segmentation."
          : "Public H01 proofread surface reconstruction used as non-proprietary demonstration geometry.",
      defaultColor: structure.color,
      defaultOpacity: structure.opacity,
      visible: true,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      levels,
    });
  }

  const bootstrap = await buildBootstrapAsset(io, structures);
  process.stdout.write(
    `LOD 0 bootstrap: ${bootstrap.triangleCount.toLocaleString()} triangles, ${bootstrap.byteSize.toLocaleString()} bytes\n`,
  );

  const gltfTransformPackage = JSON.parse(
    await readFile(
      join(REPOSITORY_ROOT, "node_modules/@gltf-transform/core/package.json"),
      "utf8",
    ),
  );
  const meshoptimizerPackage = JSON.parse(
    await readFile(
      join(REPOSITORY_ROOT, "node_modules/meshoptimizer/package.json"),
      "utf8",
    ),
  );
  const sourceAssets = await Promise.all(
    Object.entries(SOURCE_FILES).map(async ([role, file]) => ({
      role,
      url: `/${relative(join(REPOSITORY_ROOT, "public"), file)}`,
      byteSize: (await stat(file)).size,
      sha256: await sha256(file),
    })),
  );
  const baselineTriangles = structures.reduce(
    (sum, structure) => sum + structure.levels[3].triangleCount,
    0,
  );
  const baselineBytes = sourceAssets.reduce(
    (sum, asset) => sum + asset.byteSize,
    0,
  );
  const manifest = {
    schemaVersion: 3,
    dataset: {
      id: "public-h01-cortical-context-and-cells-lod-demo",
      name: "Public H01 cortical-context and proofread-cell demonstration",
      description:
        "Three cropped cortical-layer surfaces and seven proofread cell surfaces sharing one coordinate system. Colors are interface encodings, not medical classifications.",
      coordinateSystem: "Shared H01-derived micrometer coordinate frame",
      sourceAssets,
      sourcePage: "https://h01-release.storage.googleapis.com/data.html",
      publication: "https://doi.org/10.1126/science.adk4858",
      license: "CC BY 4.0",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    },
    delivery: {
      baseline: {
        strategy: "full-resolution-source-glbs",
        byteSize: baselineBytes,
        requestCount: sourceAssets.length,
        triangleCount: baselineTriangles,
      },
      progressive: {
        strategy: "packed-meshopt-lod0-then-demand-driven-lods",
        bootstrap,
      },
    },
    bounds,
    build: {
      command: "npm run assets:build",
      deterministic: true,
      gltfTransformVersion: gltfTransformPackage.version,
      meshoptimizerVersion: meshoptimizerPackage.version,
      simplification: "glTF-Transform simplify() using MeshoptSimplifier",
      optimization: "glTF-Transform meshopt() with EXT_meshopt_compression",
      ratios: Object.fromEntries(
        Object.entries(LOD_RATIOS).map(([kind, ratios]) => [
          kind,
          ratios.map((ratio, level) => ({ level, ratio })),
        ]),
      ),
    },
    structures,
  };

  await mkdir(dirname(MANIFEST_FILE), { recursive: true });
  await writeFile(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(`Manifest: ${relative(REPOSITORY_ROOT, MANIFEST_FILE)}\n`);
}

await main();
