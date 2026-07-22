import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const fixtureUrl = new URL("../evidence/red-eye/workflow-snapshot.json", import.meta.url);
const fixtureText = await readFile(fixtureUrl, "utf8");
const fixture = JSON.parse(fixtureText);

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

console.log(`Verified ${fixture.workflows.length} sanitized workflows with no forbidden public fields.`);
