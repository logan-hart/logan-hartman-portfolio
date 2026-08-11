import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { validateManifest } from "@/components/scientific-viewer/core/manifest";
import {
  createStructureRegistry,
  setAllOpacity,
  setAllVisibility,
  updateStructure,
} from "@/components/scientific-viewer/core/structureRegistry";

async function registryFixture() {
  const manifest = validateManifest(
    JSON.parse(await readFile("public/data/scientific-viewer/manifest.json", "utf8")),
  );
  return createStructureRegistry(manifest);
}

test("global visibility and opacity preserve independently keyed structures", async () => {
  const registry = await registryFixture();
  const hidden = setAllVisibility(registry, false);
  const translucent = setAllOpacity(hidden, 0.25);

  assert.equal(Object.keys(translucent).length, 10);
  assert.ok(Object.values(translucent).every((state) => !state.visible));
  assert.ok(Object.values(translucent).every((state) => state.opacity === 0.25));
});

test("updating one structure does not clear or replace unrelated structures", async () => {
  const registry = await registryFixture();
  const ids = Object.keys(registry);
  const updated = updateStructure(registry, ids[0], { color: "#ffffff" });

  assert.equal(updated[ids[0]].color, "#ffffff");
  assert.deepEqual(updated[ids[1]], registry[ids[1]]);
  assert.equal(Object.keys(updated).length, Object.keys(registry).length);
});
