import { careerFacts } from "@/data/careerFacts";

export type RedEyeMetric = {
  key: "events" | "buyers" | "orders" | "tickets" | "gpv";
  value: string;
  label: string;
  definition: string;
};

export const redEyeMetricsAsOf = careerFacts.redEye.metricsAsOfLabel;

export const redEyeMetrics: RedEyeMetric[] = [
  {
    key: "events",
    value: careerFacts.redEye.metrics.ticketedEvents.value,
    label: "Ticketed events",
    definition: "Distinct events with at least one issued, non-QA ticket.",
  },
  {
    key: "buyers",
    value: careerFacts.redEye.metrics.buyerIdentities.value,
    label: "Buyer identities",
    definition:
      "Distinct account ID when present; otherwise a normalized purchaser email across completed orders.",
  },
  {
    key: "orders",
    value: careerFacts.redEye.metrics.completedOrders.value,
    label: "Completed orders",
    definition:
      "Orders that reached paid, partial-refund, refunded, or chargeback state after completing payment.",
  },
  {
    key: "tickets",
    value: careerFacts.redEye.metrics.ticketsIssued.value,
    label: "Tickets issued",
    definition:
      "Historical issued ticket records, including complimentary tickets and tickets later refunded or canceled.",
  },
  {
    key: "gpv",
    value: careerFacts.redEye.metrics.grossPaymentVolume.value,
    label: "Gross payment volume",
    definition:
      "Successful or captured charge volume before refunds and chargebacks. GPV is payment volume, not revenue.",
  },
];

export const redEyeMetricsDisclosure =
  `Production totals through ${redEyeMetricsAsOf}. Buyer identities deduplicate completed orders by account ID or normalized email; GPV includes successful charges before refunds. Obvious QA and local fixtures are excluded.`;

export function redEyeMetric(key: RedEyeMetric["key"]) {
  return redEyeMetrics.find((metric) => metric.key === key)!;
}
