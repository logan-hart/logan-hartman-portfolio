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
      "Distinct normalized paid-order emails, falling back to user ID only when email is missing.",
  },
  {
    key: "orders",
    value: careerFacts.redEye.metrics.paidOrders.value,
    label: "Paid orders",
    definition:
      "Orders with recorded paid timestamps, excluding known check-in pilot fixtures and comp-only orders. This historical portfolio cohort is retained across refreshes.",
  },
  {
    key: "tickets",
    value: careerFacts.redEye.metrics.ticketsSold.value,
    label: "Tickets sold",
    definition:
      "Non-canceled, non-comp line-item quantities on recorded paid customer orders, plus nonduplicative legacy tickets. This historical cohort is not a settled-payment or attendance measure.",
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
  `Production lifetime totals as of ${redEyeMetricsAsOf}. Unique buyers use normalized order email with user-ID fallback; captured customer charges include fees and taxes. Display values use conservative floors from the dated source snapshot and retain the approved historical paid-recorded cohort.`;

export function redEyeMetric(key: RedEyeMetric["key"]) {
  return redEyeMetrics.find((metric) => metric.key === key)!;
}
