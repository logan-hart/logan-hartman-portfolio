import assert from "node:assert/strict";
import test from "node:test";

import {
  chooseLod,
  LOD_DISTANCE_THRESHOLDS,
} from "@/components/scientific-viewer/core/lodController";

test("automatic LOD promotes at named distance boundaries", () => {
  assert.equal(
    chooseLod({ distance: 6, currentLevel: null, isSelected: false, quality: "automatic" }),
    0,
  );
  assert.equal(
    chooseLod({ distance: 4.9, currentLevel: 0, isSelected: false, quality: "automatic" }),
    1,
  );
  assert.equal(
    chooseLod({ distance: 3.1, currentLevel: 1, isSelected: false, quality: "automatic" }),
    2,
  );
});

test("hysteresis retains the current LOD inside the threshold gap", () => {
  const between =
    (LOD_DISTANCE_THRESHOLDS.promote[2] + LOD_DISTANCE_THRESHOLDS.demote[2]) / 2;
  assert.equal(
    chooseLod({ distance: between, currentLevel: 1, isSelected: false, quality: "automatic" }),
    1,
  );
  assert.equal(
    chooseLod({ distance: between, currentLevel: 2, isSelected: false, quality: "automatic" }),
    2,
  );
});

test("selection priority and manual quality remain explicit", () => {
  assert.ok(
    chooseLod({ distance: 4, currentLevel: 1, isSelected: true, quality: "automatic" }) >
      chooseLod({ distance: 4, currentLevel: 1, isSelected: false, quality: "automatic" }),
  );
  assert.equal(
    chooseLod({ distance: 99, currentLevel: 0, isSelected: false, quality: "high" }),
    3,
  );
});
