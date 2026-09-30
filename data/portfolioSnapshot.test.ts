import assert from "node:assert/strict";
import test from "node:test";
import { validatePortfolioSnapshot, portfolioSnapshotContract, type PortfolioSnapshot } from "./portfolioSnapshot";

const baseline: PortfolioSnapshot = {
  schemaVersion: 1, contract: portfolioSnapshotContract, asOf: "2026-09-11T22:51:00Z",
  metrics: {
    events: { value: "285", floor: 285 }, buyers: { value: "19.1K+", floor: 19100 },
    orders: { value: "28.5K+", floor: 28500 }, tickets: { value: "42.7K+", floor: 42700 },
    gpv: { value: "$1.44M+", floor: 1440000 },
  },
};
const now = Date.parse("2026-09-30T19:00:00Z");
function fresh() { return { ...structuredClone(baseline), asOf: "2026-09-30T18:00:00Z" }; }

test("accepts only a newer complete contract with conservative floors", () => {
  const snapshot = fresh(); snapshot.metrics.buyers = { value: "20.0K+", floor: 20000 };
  assert.equal(validatePortfolioSnapshot(snapshot, baseline, now), snapshot);
});
test("rejects stale, future, mismatched, partial, rounded-up and declining snapshots", () => {
  const mutations = [
    (s: any) => { s.asOf = baseline.asOf; },
    (s: any) => { s.asOf = "2026-09-20T18:00:00Z"; },
    (s: any) => { s.asOf = "2026-10-01T18:00:00Z"; },
    (s: any) => { s.contract = "different_definition"; },
    (s: any) => { delete s.metrics.orders; },
    (s: any) => { s.metrics.gpv.value = "$1.45M+"; },
    (s: any) => { s.metrics.buyers = { value: "18.0K+", floor: 18000 }; },
    (s: any) => { s.metrics.orders.floor = 28532; },
    (s: any) => { s.metrics.events.value = "<script>"; },
    (s: any) => { s.customerEmail = "private@example.test"; },
    (s: any) => { s.metrics.buyers.email = "private@example.test"; },
    (s: any) => { s.metrics.buyers = { value: "50.0K+", floor: 50000 }; },
  ];
  for (const mutate of mutations) {
    const snapshot = fresh(); mutate(snapshot);
    assert.equal(validatePortfolioSnapshot(snapshot, baseline, now), null);
  }
  for (const input of [null, {}, [], "untrusted", 42]) assert.equal(validatePortfolioSnapshot(input, baseline, now), null);
});
