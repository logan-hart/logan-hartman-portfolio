import assert from "node:assert/strict";
import test from "node:test";

import { RequestScheduler } from "@/components/scientific-viewer/core/requestScheduler";

test("request scheduler applies the same bounded concurrency policy", async () => {
  const scheduler = new RequestScheduler(2);
  let active = 0;
  let maximumActive = 0;
  const tasks = Array.from({ length: 6 }, (_, index) =>
    scheduler.run(async () => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      await new Promise((resolve) => setTimeout(resolve, 2));
      active -= 1;
      return index;
    }),
  );

  assert.deepEqual(await Promise.all(tasks), [0, 1, 2, 3, 4, 5]);
  assert.equal(maximumActive, 2);
});
