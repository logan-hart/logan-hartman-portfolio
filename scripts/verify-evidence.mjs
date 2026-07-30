import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fixtureUrl = new URL("../evidence/red-eye/workflow-snapshot.json", import.meta.url);
const fixtureText = await readFile(fixtureUrl, "utf8");
const fixture = JSON.parse(fixtureText);
const guardedFixtureUrl = new URL("../evidence/red-eye/guarded-repair-snapshot.json", import.meta.url);
const guardedFixtureText = await readFile(guardedFixtureUrl, "utf8");
const guardedFixture = JSON.parse(guardedFixtureText);

const forbiddenFieldNames = [
  "email",
  "phone",
  "customerName",
  "orderId",
  "ticketToken",
  "cardNumber",
  "cvv",
  "credential",
  "accessToken",
  "internalUrl"
];

assert.equal(fixture.schemaVersion, 1, "unsupported evidence schema");
assert.equal(
  fixture.provenance.classification,
  "portfolio_safe_reconstruction",
  "evidence must retain its reconstruction label"
);
assert.equal(fixture.provenance.containsProductionData, false, "production data must not enter the fixture");
assert.equal(fixture.provenance.identifierNamespace, "demo_", "public identifiers must use the demo namespace");
assert.ok(Array.isArray(fixture.workflows) && fixture.workflows.length >= 2, "expected representative workflows");

for (const workflow of fixture.workflows) {
  assert.match(workflow.id, /^demo_[a-z0-9_]+$/, `unsafe workflow identifier: ${workflow.id}`);
  assert.equal(
    workflow.maturity,
    "production_behavior_reconstruction",
    `${workflow.id} must declare its maturity boundary`
  );
  assert.ok(new Set(workflow.states).size === workflow.states.length, `${workflow.id} contains duplicate states`);
  assert.ok(workflow.invariants.length >= 4, `${workflow.id} needs an inspectable invariant set`);
  assert.ok(workflow.recoveryPaths.length >= 2, `${workflow.id} needs explicit recovery behavior`);
}

const forbiddenFieldsFound = forbiddenFieldNames.filter((field) =>
  new RegExp(`"${field}"\\s*:`, "i").test(fixtureText)
);
assert.deepEqual(forbiddenFieldsFound, [], `forbidden fields found: ${forbiddenFieldsFound.join(", ")}`);

assert.equal(guardedFixture.schemaVersion, 1, "unsupported guarded-repair evidence schema");
assert.equal(
  guardedFixture.provenance.classification,
  "sanitized_production_architecture",
  "guarded-repair evidence must retain its architecture classification"
);
assert.equal(
  guardedFixture.provenance.containsProductionData,
  false,
  "production data must not enter the guarded-repair fixture"
);
assert.equal(guardedFixture.provenance.identifierNamespace, "demo_", "public identifiers must use the demo namespace");
assert.deepEqual(
  guardedFixture.stages,
  [
    "signed_evidence",
    "deduplicated_task",
    "planner",
    "executor",
    "reviewer",
    "policy_and_approval",
    "exact_commit_deployment",
    "production_verification",
    "outcome_and_lesson"
  ],
  "guarded-repair stage order changed unexpectedly"
);
assert.ok(guardedFixture.deployLanes.includes("approval_required"), "approval lane is required");
assert.ok(guardedFixture.deployLanes.includes("blocked_or_escalated"), "blocked lane is required");
assert.ok(
  guardedFixture.maturityBoundaries.includes("default_off_or_framework_only"),
  "default-off/framework-only boundary is required"
);
assert.ok(
  guardedFixture.nonClaims.includes("unrestricted_autonomous_production_access"),
  "autonomy non-claim is required"
);

const guardedForbiddenFieldsFound = forbiddenFieldNames.filter((field) =>
  new RegExp(`"${field}"\\s*:`, "i").test(guardedFixtureText)
);
assert.deepEqual(
  guardedForbiddenFieldsFound,
  [],
  `forbidden guarded-repair fields found: ${guardedForbiddenFieldsFound.join(", ")}`
);

console.log(
  `Verified ${fixture.workflows.length} sanitized workflows and the guarded-repair architecture with no forbidden public fields.`
);
