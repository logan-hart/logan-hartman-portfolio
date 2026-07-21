import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceCallout, EvidencePage, EvidenceSection } from "@/components/red-eye/EvidencePage";
import { evalMetrics, opsGatewayTools, readinessChecks, safetyCaseMix } from "@/data/redEyeEvidence";

export const metadata: Metadata = {
  title: "Reliability Engineering | Red Eye Tickets",
  description: "Red Eye's balanced safety evals, read-only operations gateway, deterministic event readiness, and check-in degradation strategy.",
  alternates: { canonical: "/work/red-eye-tickets/reliability/" },
};

export default function ReliabilityPage() {
  return (
    <EvidencePage
      eyebrow="Reliability engineering"
      title="Make operational judgment testable"
      intro="Three tools address real operating risks in Red Eye: unsafe repair decisions, fragmented incident context, and incomplete event configuration before launch."
      meta={["Local working prototypes", "Real read-only adapters", "No production credentials used"]}
    >
      <EvidenceCallout title="What these results mean">
        <p>
          The numbers below measure a deterministic guardrail baseline against a human-authored suite. They demonstrate
          dataset design, failure analysis, and an executable contract. They are not presented as proof of general model
          intelligence or autonomous production safety.
        </p>
      </EvidenceCallout>

      <EvidenceCallout title="Verification boundary">
        <ul className="evidence-verification-list">
          <li>
            <strong>Safety evaluation:</strong> deterministic local baseline; 3 tests and 13 assertions pass. External-model
            evaluation and CI wiring are not claimed.
          </li>
          <li>
            <strong>Operations MCP:</strong> six tools register over local stdio; 9 tests pass, including provider-shaped
            loopback HTTP integration tests. Deployment and production-credential validation are not claimed.
          </li>
          <li>
            <strong>Producer readiness:</strong> Rails service and CLI runbook; 5 targeted examples pass. Producer UI and
            launch-gate integration remain future work.
          </li>
        </ul>
      </EvidenceCallout>

      <EvidenceSection number="01" title="A safety benchmark that includes hard cases">
        <div className="reliability-metrics">
          {evalMetrics.map((metric) => (
            <article key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></article>
          ))}
        </div>
        <div className="case-mix" aria-label="Safety case decision distribution">
          {safetyCaseMix.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <div><i style={{ width: `${(item.value / 8) * 100}%` }} /></div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        <p>
          The 26 cases cover payments, refunds, ticket issuance, authentication, seating, check-in, migrations, deploys,
          prompt injection, test weakening, and missing or conflicting evidence. The expected decisions are deliberately
          balanced: 7 abstain, 8 approval-required, 4 block, and 7 safe-repair cases. Eighteen cases touch restricted areas
          and eighteen require explicit invariant checks.
        </p>
        <p>
          Baseline results: 25 of 26 decisions correct, 24 of 26 risk labels correct, 94.4% restricted-area recall,
          94.4% required-invariant recall, and zero false-safe classifications across 19 unsafe cases. Failure-type accuracy
          is only 57.7%, which is useful evidence of where classification still needs work.
        </p>
        <p className="evidence-maturity">
          <strong>Maturity:</strong> local deterministic evaluation prototype. These figures measure the guardrail baseline,
          not an LLM or a production agent.
        </p>
      </EvidenceSection>

      <EvidenceSection number="02" title="Why the historical corpus was not enough">
        <p>
          Red Eye already had 180 generated cases from archived automation runs, but the distribution mostly described what
          the existing system had already chosen to block: 163 blocked, 10 failed, and 7 successful runs; 173 were labeled
          low-risk and 7 medium-risk; none explicitly touched a restricted area or required an invariant. That is useful operational history,
          but a poor standalone safety benchmark.
        </p>
        <p>
          The new harness audits label dominance and missing safety positives, accepts external prediction JSONL, reports
          confusion by field, and fails visibly on false-safe behavior. Historical data stays as one source; adversarial,
          human-authored cases supply the coverage production history lacks.
        </p>
      </EvidenceSection>

      <EvidenceSection number="03" title="Read-only operations gateway">
        <div className="evidence-two-column evidence-two-column--gateway">
          <div>
            <h3>Available tools</h3>
            <ul>{opsGatewayTools.map((tool) => <li key={tool}>{tool}</li>)}</ul>
          </div>
          <div>
            <h3>Safety properties</h3>
            <ul>
              <li>Local MCP stdio implementation with explicit per-tool scopes.</li>
              <li>Real GET-only GitHub Issues and Render deployment-history REST adapters plus local runbook search.</li>
              <li>Bearer credentials stay in environment configuration and returned content crosses a redaction boundary.</li>
              <li>Email, bearer-token, card-like, and sensitive-key redaction is applied at the boundary.</li>
              <li>Rate limits, authorization failures, and per-service connector failures preserve usable partial evidence.</li>
              <li>Issue creation is preview-only; the first release has no external write path.</li>
            </ul>
          </div>
        </div>
        <p>
          The HTTP integration suite verifies provider-shaped paths, bearer and API-version headers, response
          normalization, rate-limit classification, repository-scoped incident reads, local Markdown search, partial
          degradation, and the absence of a write side effect. The gateway matches the local-first ADR, but real Red Eye
          health endpoints, credential-backed smoke tests, deployment, and a production data-minimization review are still
          outstanding.
        </p>
        <p className="evidence-maturity">
          <strong>Maturity:</strong> local read-only MCP prototype with real GitHub and Render REST adapters and local
          runbook search; it is not a deployed or production-credentialed operations service.
        </p>
      </EvidenceSection>

      <EvidenceSection number="04" title="Deterministic producer readiness">
        <p>
          Event launches should not depend on an agent deciding whether a configuration “looks right.” The Rails readiness
          service evaluates six explicit checks and returns <code>ready</code>, <code>needs_attention</code>, or <code>blocked</code>:
        </p>
        <div className="readiness-checks">
          {readinessChecks.map((check, index) => <span key={check}><b>{index + 1}</b>{check}</span>)}
        </div>
        <p>
          The test suite covers a ready approved event, missing schedule, missing inventory, missing door credentials, and a
          Unicode title outside the legacy PDF character set. Normal event writes already reject titles the legacy renderer
          cannot represent; this warning is defense in depth for imported, legacy, or validation-bypassed records. It marks
          a rendering boundary without assigning blame to the producer.
        </p>
        <p className="evidence-maturity">
          <strong>Maturity:</strong> rule-based Rails service with a CLI runbook; it is not yet exposed in the producer UI or
          enforced as a launch gate.
        </p>
      </EvidenceSection>

      <EvidenceSection number="05" title="Live check-in degrades deliberately">
        <div className="evidence-detail-grid">
          <article><h3>Camera unavailable</h3><p>Staff can move from QR scanning to manual ticket search or entry instead of losing the admission workflow.</p></article>
          <article><h3>Constrained devices</h3><p>Pause/resume and battery-saver controls acknowledge that a door shift is longer than a perfect-device demo.</p></article>
          <article><h3>Scoped access</h3><p>Event-specific credentials limit what door staff can see and do while preserving an administrative recovery path.</p></article>
          <article><h3>State authority</h3><p>The server owns ticket and admission state so scanner feedback cannot silently override refunds or prior use.</p></article>
        </div>
        <p className="evidence-next-link">
          Related: <Link href="/work/red-eye-tickets/postmortem-unicode-pdf/">read the Unicode PDF incident review →</Link>
        </p>
      </EvidenceSection>
    </EvidencePage>
  );
}
