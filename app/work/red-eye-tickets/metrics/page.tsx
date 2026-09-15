import type { Metadata } from "next";
import { EvidenceCallout, EvidencePage, EvidenceSection } from "@/components/red-eye/EvidencePage";
import { redEyeMetrics, redEyeMetricsAsOf, redEyeMetricsDisclosure } from "@/data/redEyeMetrics";

export const metadata: Metadata = {
  title: "Production Metric Methodology | Red Eye Tickets",
  description:
    "Definitions, exclusions, and limitations behind the production scale metrics in the Red Eye Tickets case study.",
  alternates: { canonical: "/work/red-eye-tickets/metrics/" },
};

export default function RedEyeMetricsPage() {
  return (
    <EvidencePage
      eyebrow="Production evidence"
      title="How the production numbers are counted"
      intro="The case study uses conservative display floors from a dated production snapshot. This page defines each existing scale claim and makes its limits explicit."
      meta={[`Snapshot: ${redEyeMetricsAsOf}`, "Read-only query", "QA fixtures excluded"]}
    >
      <EvidenceCallout title="Published disclosure">
        <p>{redEyeMetricsDisclosure}</p>
      </EvidenceCallout>

      <EvidenceSection number="01" title="The publishable production snapshot">
        <div className="metric-method-grid">
          {redEyeMetrics.map((metric) => (
            <article key={metric.key}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
            </article>
          ))}
        </div>
        <p>
          Counts and currency are compacted into conservative public display floors. Exact totals, supporting figures,
          cohort notes, and query provenance remain in the dated internal source record.
        </p>
      </EvidenceSection>

      <EvidenceSection number="02" title="Definitions">
        <dl className="metric-definition-list">
          {redEyeMetrics.map((metric) => (
            <div key={metric.key}>
              <dt>{metric.label}</dt>
              <dd>{metric.definition}</dd>
            </div>
          ))}
        </dl>
      </EvidenceSection>

      <EvidenceSection number="03" title="Exclusions and privacy boundary">
        <ul>
          <li>The published figures are aggregate counts and sums; customer names, emails, order IDs, and payment details are not published.</li>
          <li>Unique buyers use normalized paid-order identity rather than the larger registered-account count.</li>
          <li>Captured customer charges include fees and taxes and are not labeled as ticket-sales revenue.</li>
          <li>Tickets sold follow the report&apos;s lifetime sold-ticket cohort and are not represented as attendance.</li>
          <li>All lifetime totals include July 15–18; those dates are excluded only from the corrected payment-method cohort.</li>
        </ul>
      </EvidenceSection>

      <EvidenceSection number="04" title="What the metrics do—and do not—prove">
        <p>
          These figures establish operating scale for a production system. They do not, by themselves, prove that one
          feature caused conversion, revenue, or reliability to improve. Any before-and-after claim requires its own dated
          cohort, denominator, and measurement window.
        </p>
        <p className="evidence-maturity">
          <strong>Verification boundary:</strong> the values were checked against a read-only production database snapshot
          and the application&apos;s reporting definitions. They have not been independently audited by a third party.
        </p>
      </EvidenceSection>
    </EvidencePage>
  );
}
