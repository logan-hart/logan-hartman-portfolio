import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateManifest } from "@/components/scientific-viewer/core/manifest";

test("generated scientific-viewer manifest is valid", async () => {
  const manifest = JSON.parse(
    await readFile("public/data/scientific-viewer/manifest.json", "utf8"),
  );
  const validated = validateManifest(manifest);
  assert.equal(validated.structures.length, 10);
  assert.equal(
    validated.structures.filter((structure) => structure.kind === "context").length,
    3,
  );
  assert.equal(
    validated.structures.filter((structure) => structure.kind === "cell").length,
    7,
  );
  assert.equal(validated.delivery.baseline.requestCount, 2);
  assert.equal(
    validated.delivery.baseline.byteSize,
    validated.dataset.sourceAssets.reduce(
      (sum, asset) => sum + asset.byteSize,
      0,
    ),
  );
  assert.equal(
    validated.delivery.baseline.triangleCount,
    validated.structures.reduce(
      (sum, structure) => sum + structure.levels[3].triangleCount,
      0,
    ),
  );
  assert.equal(validated.delivery.progressive.bootstrap.structureCount, 10);
  assert.equal(
    validated.delivery.progressive.bootstrap.triangleCount,
    validated.structures.reduce(
      (sum, structure) => sum + structure.levels[0].triangleCount,
      0,
    ),
  );
  assert.ok(
    validated.delivery.progressive.bootstrap.byteSize <
      validated.delivery.baseline.byteSize,
  );
});

test("manifest validation rejects missing LOD levels", () => {
  assert.throws(
    () =>
      validateManifest({
        schemaVersion: 3,
        dataset: {
          sourceAssets: [
            { role: "cells" },
            { role: "layers" },
          ],
        },
        delivery: {
          baseline: {
            strategy: "full-resolution-source-glbs",
            byteSize: 1,
            requestCount: 1,
            triangleCount: 1,
          },
          progressive: {
            bootstrap: {
              url: "/bootstrap.glb",
              byteSize: 1,
              triangleCount: 1,
              structureCount: 2,
            },
          },
        },
        bounds: { radius: 1 },
        structures: [
          {
            id: "a",
            sourceAssetRole: "cells",
            sourceNodeName: "a",
            kind: "cell",
            levels: [],
          },
          {
            id: "b",
            sourceAssetRole: "layers",
            sourceNodeName: "b",
            kind: "context",
            levels: [],
          },
        ],
      }),
    /LOD levels 0–3/,
  );
});
