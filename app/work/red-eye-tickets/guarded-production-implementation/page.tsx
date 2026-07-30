import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceCallout, EvidencePage, EvidenceSection } from "@/components/red-eye/EvidencePage";
import {
  guardedImplementationTests,
  guardedRepairStages,
  loopLifecycle,
} from "@/data/redEyeEvidence";

export const metadata: Metadata = {
  title: "Guarded Production Implementation | Red Eye Tickets",
  description:
    "How Red Eye connects signed operational evidence to bounded repair, policy, exact-commit deployment, rollback, production verification, and reusable lessons.",
  alternates: { canonical: "/work/red-eye-tickets/guarded-production-implementation/" },
};

const maturityBoundaries = [
  {
    title: "Production-facing",
    copy: "Signed operational evidence, alert intake, task generation, policy enforcement, deployment controls, canaries, Watchdog monitoring, and production verification.",
  },
  {
    title: "Local execution plane",
    copy: "Planner, executor, and reviewer passes run in isolated worktrees with full developer tooling and explicit release authority.",
  },
  {
    title: "Attended or pilot-scoped",
    copy: "Loop observation proofs use reviewed activation windows, immutable contracts, bounded occurrences, shutdown, and retirement evidence.",
  },
  {
    title: "Default-off or framework-only",
    copy: "Capabilities that are not authorized for ordinary production execution remain ineligible by configuration and policy.",
  },
];

export default function GuardedProductionImplementationPage() {
  return (
    <EvidencePage
      eyebrow="Production implementation"
      title="From signed evidence to verified recovery"
      intro="A guarded AI-assisted operations control plane turns production signals into bounded repair work without transferring unrestricted production authority to an agent."
      meta={["Implemented in Red Eye", "Human approval for higher-risk lanes", "Evidence reviewed July 2026"]}
    >
      <EvidenceCallout title="Defensible claim">
        <p>
          I designed and operated a guarded production-repair system that converts signed operational evidence into
          deduplicated tasks, separates planning, execution, and review, enforces policy and approval gates, deploys
          through an exact-commit release path, preserves rollback, and requires production verification before recovery
          is accepted.
        </p>
      </EvidenceCallout>

      <EvidenceSection number="01" title="The control flow">
        <div className="guarded-repair-flow" aria-label="Guarded production repair lifecycle">
          {guardedRepairStages.map((stage) => (
            <article key={stage.step}>
              <span>{stage.step}</span>
              <h3>{stage.title}</h3>
              <p>{stage.copy}</p>
            </article>
          ))}
        </div>
      </EvidenceSection>

      <EvidenceSection number="02" title="Why the stages stay separate">
        <div className="evidence-detail-grid">
          <article>
            <h3>Planner</h3>
            <p>Investigates the evidence, names uncertainty, identifies invariants, defines the narrow change, and records a rollback path.</p>
          </article>
          <article>
            <h3>Executor</h3>
            <p>Works inside the permitted scope, preserves tests and restricted boundaries, and produces the implementation and verification artifacts.</p>
          </article>
          <article>
            <h3>Reviewer</h3>
            <p>Evaluates the diff, test evidence, risk classification, missing proof, and whether release criteria actually passed.</p>
          </article>
          <article>
            <h3>Release authority</h3>
            <p>Policy and human approval determine whether work may stage, merge, deploy, or stop. The agent does not silently widen its own authority.</p>
          </article>
        </div>
        <pre className="evidence-code"><code>{`# Sanitized excerpt from the production runner
planner_pass
executor_pass
reviewer_pass

# Deployment is incomplete until the explicit verifier succeeds.
run_production_verification || abort_blocked(
  "Production verification failed after deploy."
)`}</code></pre>
        <p className="evidence-maturity">
          <strong>Excerpt boundary:</strong> representative names and control order are preserved; paths, environment
          values, credentials, identifiers, and security-sensitive implementation details are excluded.
        </p>
      </EvidenceSection>

      <EvidenceSection number="03" title="Policy and approval are part of the implementation">
        <div className="evidence-two-column">
          <div>
            <h3>Fail-closed checks</h3>
            <ul>
              <li>Restricted payment, authentication, database, workflow, and infrastructure paths.</li>
              <li>Required invariant and regression coverage.</li>
              <li>Diff-size, file-count, secret-redaction, and test-integrity limits.</li>
              <li>Risk, severity, evidence quality, deploy lane, and approval requirements.</li>
            </ul>
          </div>
          <div>
            <h3>Release controls</h3>
            <ul>
              <li>Exact-commit deployment across the required production services.</li>
              <li>Cross-worktree and deployment locks, cooldowns, release fences, and rollback plans.</li>
              <li>Fresh production probes, canaries, recovery telemetry, and required replay or reconciliation.</li>
              <li>Quiet success and loud uncertainty: ambiguous evidence escalates instead of being converted into a confident mutation.</li>
            </ul>
          </div>
        </div>
      </EvidenceSection>

      <EvidenceSection number="04" title="Loop: observation to outcome">
        <p>
          Loop is the internal name for a policy-governed observation and learning architecture. It connects production
          evidence to action while preserving the authority, causal, and maturity boundaries required for a financial
          and ticket-state system.
        </p>
        <div className="loop-lifecycle" aria-label="Loop observation and learning lifecycle">
          {loopLifecycle.map((stage, index) => (
            <span key={stage}><b>{String(index + 1).padStart(2, "0")}</b>{stage}</span>
          ))}
        </div>
        <p>
          The outcome is not “the agent learned.” The system records which observation produced which finding, what
          action was proposed and approved, how rollback and verification were defined, what happened after release, and
          whether a reusable lesson is safe to promote.
        </p>
      </EvidenceSection>

      <EvidenceSection number="05" title="Evidence from recent delivery">
        <div className="reliability-metrics">
          {guardedImplementationTests.map((metric) => (
            <article key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span></article>
          ))}
        </div>
        <ul>
          <li>Production-canary and automation hardening distinguished classification defects from downtime and preserved fail-closed checks.</li>
          <li>An attended Loop acceptance contract captured immutable identity, bounded provider-window evidence, shutdown, and rollback behavior.</li>
          <li>Independent Better Stack monitoring detects failure of the external Watchdog itself, adding a separate failure-domain signal.</li>
          <li>GitHub evidence records risk, tests, rollout, backout, exact release identity, and post-deploy acceptance criteria.</li>
        </ul>
        <p className="evidence-maturity">
          <strong>Test-summary boundary:</strong> counts are taken from the cited merged PR validation records. They
          describe those runs; they are not a claim that every repository test belongs to this subsystem.
        </p>
      </EvidenceSection>

      <EvidenceSection number="06" title="Maturity boundaries">
        <div className="evidence-detail-grid">
          {maturityBoundaries.map((boundary) => (
            <article key={boundary.title}><h3>{boundary.title}</h3><p>{boundary.copy}</p></article>
          ))}
        </div>
        <EvidenceCallout title="What this does not claim">
          <p>
            This is not model training, ML research, a general-purpose RAG platform, or unrestricted autonomous
            production access. “Self-healing” describes a guarded operating pipeline with explicit human, policy,
            rollback, and verification boundaries.
          </p>
        </EvidenceCallout>
        <p className="evidence-next-link">
          Read next: <Link href="/work/red-eye-tickets/adr-local-first-repair/">why the execution plane remains local-first and release-gated →</Link>
        </p>
      </EvidenceSection>
    </EvidencePage>
  );
}
