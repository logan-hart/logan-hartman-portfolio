import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateManifest } from "@/components/scientific-viewer/core/manifest";

test("generated scientific-viewer manifest is valid", async () => {
  const manifest = JSON.parse(
    await readFile("public/data/scientific-viewer/manifest.json", "utf8"),
  );
  const validated = validateManifest(manifest);
  assert.equal(validated.structures.length, 6);
  assert.equal(
    validated.structures.filter((structure) => structure.kind === "context").length,
    3,
  );
  assert.equal(
    validated.structures.filter((structure) => structure.kind === "cell").length,
    3,
  );
});

test("manifest validation rejects missing LOD levels", () => {
  assert.throws(
    () =>
      validateManifest({
        schemaVersion: 2,
        bounds: { radius: 1 },
        structures: [
          { id: "a", kind: "cell", levels: [] },
          { id: "b", kind: "context", levels: [] },
        ],
      }),
    /LOD levels 0–3/,
  );
});
