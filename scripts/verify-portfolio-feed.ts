import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { careerFacts } from "../data/careerFacts";
import { portfolioSnapshotContract, validatePortfolioSnapshot, type PortfolioSnapshot } from "../data/portfolioSnapshot";

// Read-only deployment check; no AWS, database or Render credentials required.
async function main() {
  const [url, origin, receiptPath] = process.argv.slice(2);
  assert(url && origin, "Usage: npm run verify:portfolio-feed -- <https-public-json-url> <https-portfolio-origin> [local-public-receipt.json]");
  assert.equal(new URL(url).protocol, "https:");
  assert.equal(new URL(origin).origin, origin, "Use the exact portfolio origin without a trailing slash");
  assert.equal(new URL(origin).protocol, "https:");
  const response = await fetch(url, {
    headers: { Origin: origin }, credentials: "omit", cache: "no-cache",
    signal: AbortSignal.timeout(10000),
  });
  assert.equal(response.status, 200, "Public file must be anonymously readable");
  assert(response.headers.get("content-type")?.includes("application/json"));
  assert([origin, "*"].includes(response.headers.get("access-control-allow-origin") ?? ""), "Portfolio origin is not permitted by CORS");
  const cache = /max-age=(\d+)/.exec(response.headers.get("cache-control") ?? "");
  assert(cache && Number(cache[1]) <= 300, "Public snapshot must revalidate within five minutes");
  const body = await response.text();
  assert(body.length <= 4096, "Unexpected public payload size");
  const facts = careerFacts.redEye;
  const baseline: PortfolioSnapshot = {
    schemaVersion: 1, contract: portfolioSnapshotContract, asOf: facts.metricsAsOf,
    metrics: {
      events: facts.metrics.salesGeneratingEvents, buyers: facts.metrics.uniqueBuyers,
      orders: facts.metrics.paidOrders, tickets: facts.metrics.ticketsSold, gpv: facts.metrics.capturedCharges,
    },
  };
  const snapshot = validatePortfolioSnapshot(JSON.parse(body), baseline);
  assert(snapshot, "Public file does not pass the browser's source-contract/freshness checks");
  if (receiptPath) assert.deepEqual(snapshot, JSON.parse(await readFile(receiptPath, "utf8")), "Published file differs from the read-only source receipt");
  console.log(JSON.stringify({ status: "verified_public_feed", asOf: snapshot.asOf, metrics: snapshot.metrics,
    sha256: createHash("sha256").update(body).digest("hex"),
    limitation: "This verifies the public file and Origin response; browser rendering and scheduled execution require separate verification." }, null, 2));
}

void main().catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
