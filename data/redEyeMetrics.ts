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
    value: careerFacts.redEye.metrics.salesGeneratingEvents.value,
    label: "Sales-generating events",
    definition: "Distinct events represented by at least one paid order.",
  },
  {
    key: "buyers",
    value: careerFacts.redEye.metrics.uniqueBuyers.value,
    label: "Unique buyers",
    definition:
      "Distinct paid-order identities after normalizing account and guest-checkout identity.",
  },
  {
    key: "orders",
    value: careerFacts.redEye.metrics.paidOrders.value,
    label: "Paid orders",
    definition:
      "Orders included in the production report's paid-order cohort.",
  },
  {
    key: "tickets",
    value: careerFacts.redEye.metrics.ticketsSold.value,
    label: "Tickets sold",
    definition:
      "Tickets included in the production report's lifetime sold-ticket cohort.",
  },
  {
    key: "gpv",
    value: careerFacts.redEye.metrics.capturedCharges.value,
    label: "Captured customer charges",
    definition:
      "Captured customer charge volume including fees and taxes; this is payment volume, not ticket-sales revenue.",
  },
];

export const redEyeMetricsDisclosure =
  `Production lifetime totals as of ${redEyeMetricsAsOf}. Unique buyers use normalized paid-order identity; captured customer charges include fees and taxes. Display values use conservative floors from the dated source snapshot.`;

export function redEyeMetric(key: RedEyeMetric["key"]) {
  return redEyeMetrics.find((metric) => metric.key === key)!;
}
