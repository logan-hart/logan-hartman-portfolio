export const portfolioSnapshotContract = "redeye_portfolio_lifetime_v1";
export const portfolioMetricKeys = ["events", "buyers", "orders", "tickets", "gpv"] as const;
export type PortfolioMetricKey = (typeof portfolioMetricKeys)[number];
export type PortfolioSnapshot = {
  schemaVersion: 1;
  contract: typeof portfolioSnapshotContract;
  asOf: string;
  metrics: Record<PortfolioMetricKey, { value: string; floor: number }>;
};

export function formatPortfolioFloor(key: PortfolioMetricKey, floor: number) {
  if (key === "events") return String(floor);
  if (key === "gpv") return floor >= 1_000_000
    ? `$${(floor / 1_000_000).toFixed(2)}M+` : `$${floor / 1000}K+`;
  return floor >= 1000 ? `${(floor / 1000).toFixed(1)}K+` : String(floor);
}

// No partial updates, arbitrary labels, HTML, identifiers or unknown fields.
export function validatePortfolioSnapshot(input: unknown, baseline: PortfolioSnapshot, now = Date.now()): PortfolioSnapshot | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as PortfolioSnapshot;
  if (Object.keys(candidate).sort().join() !== "asOf,contract,metrics,schemaVersion" ||
    candidate.schemaVersion !== 1 || candidate.contract !== portfolioSnapshotContract ||
    typeof candidate.asOf !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(candidate.asOf)) return null;
  const cutoff = Date.parse(candidate.asOf);
  if (!Number.isFinite(cutoff) || new Date(cutoff).toISOString().replace(".000Z", "Z") !== candidate.asOf || cutoff > now + 5 * 60_000 ||
    cutoff <= Date.parse(baseline.asOf) || now - cutoff > 8 * 86_400_000) return null;
  if (!candidate.metrics || typeof candidate.metrics !== "object" ||
    Object.keys(candidate.metrics).sort().join() !== [...portfolioMetricKeys].sort().join()) return null;
  for (const key of portfolioMetricKeys) {
    const metric = candidate.metrics[key];
    if (!metric || Object.keys(metric).sort().join() !== "floor,value" ||
      !Number.isSafeInteger(metric.floor) || metric.floor <= 0 ||
      metric.floor < baseline.metrics[key].floor || typeof metric.value !== "string" ||
      metric.value !== formatPortfolioFloor(key, metric.floor)) return null;
    if (key === "gpv" && metric.floor % 10_000 !== 0) return null;
    if (!["events", "gpv"].includes(key) && metric.floor >= 1000 && metric.floor % 100 !== 0) return null;
  }
  if (candidate.metrics.buyers.floor > candidate.metrics.orders.floor ||
    candidate.metrics.events.floor > candidate.metrics.orders.floor) return null;
  return candidate;
}
