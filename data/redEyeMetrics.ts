export type RedEyeMetric = {
  key: "events" | "buyers" | "orders" | "tickets" | "gpv";
  value: string;
  label: string;
  definition: string;
};

export const redEyeMetricsAsOf = "July 21, 2026";

export const redEyeMetrics: RedEyeMetric[] = [
  {
    key: "events",
    value: "240+",
    label: "Ticketed events",
    definition: "Distinct events with at least one issued, non-QA ticket.",
  },
  {
    key: "buyers",
    value: "15K+",
    label: "Buyer identities",
    definition:
      "Distinct account ID when present; otherwise a normalized purchaser email across completed orders.",
  },
  {
    key: "orders",
    value: "19K+",
    label: "Completed orders",
    definition:
      "Orders that reached paid, partial-refund, refunded, or chargeback state after completing payment.",
  },
  {
    key: "tickets",
    value: "29K+",
    label: "Tickets issued",
    definition:
      "Historical issued ticket records, including complimentary tickets and tickets later refunded or canceled.",
  },
  {
    key: "gpv",
    value: "$900K+",
    label: "Gross payment volume",
    definition:
      "Successful or captured charge volume before refunds and chargebacks. GPV is payment volume, not revenue.",
  },
];

export const redEyeMetricsDisclosure =
  "Production totals through July 21, 2026. Buyer identities deduplicate completed orders by account ID or normalized email; GPV includes successful charges before refunds. Obvious QA and local fixtures are excluded.";

export function redEyeMetric(key: RedEyeMetric["key"]) {
  return redEyeMetrics.find((metric) => metric.key === key)!;
}
