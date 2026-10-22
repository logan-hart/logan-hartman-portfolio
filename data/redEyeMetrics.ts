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
      "Distinct buyer identities from normalized paid-order emails, falling back to user ID only when email is missing; not registered-account counts.",
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
    label: "Ticket sales volume",
    definition:
      "A conservative public floor of lifetime captured customer charges including fees and taxes. This is payment volume, not company revenue, ARR, or an annualized run rate.",
  },
];

export const redEyeMetricsDisclosure =
  `Production lifetime totals as of ${redEyeMetricsAsOf}. Unique buyers use normalized order email with user-ID fallback. Ticket sales volume includes captured customer charges, fees, and taxes; it is not company revenue, ARR, or an annualized run rate. The homepage uses a coarser sales-volume floor than this methodology page; neither amount is an exact total. All display values use conservative floors from the dated source snapshot and retain the approved historical paid-recorded cohort.`;

export function redEyeMetric(key: RedEyeMetric["key"]) {
  return redEyeMetrics.find((metric) => metric.key === key)!;
}
