import type { Metadata } from "next";
import Link from "next/link";
import { EvidenceCallout, EvidencePage, EvidenceSection } from "@/components/red-eye/EvidencePage";

export const metadata: Metadata = {
  title: "ADR: Local-First Production Repair | Red Eye Tickets",
  description: "Why Red Eye uses a local-first, evidence-driven repair loop with policy and release gates.",
  alternates: { canonical: "/work/red-eye-tickets/adr-local-first-repair/" },
};

const options = [
  {
    name: "Autonomous production agent",
    benefit: "Fastest path from alert to mutation.",
    cost: "Requires broad production credentials and makes ambiguous failures too easy to turn into high-blast-radius changes.",
    decision: "Rejected",
  },
  {
    name: "CI-hosted repair agent",
    benefit: "Repeatable environment close to merge checks.",
    cost: "Moves repository write access and sensitive operational context into a remote runner; awkward for long investigations and visual QA.",
    decision: "Deferred",
  },
  {
    name: "Local-first bounded repair",
    benefit: "Uses an isolated worktree, local credentials, full developer tooling, and explicit human release control.",
    cost: "Depends on an operator machine and does not promise unattended 24/7 remediation.",
    decision: "Accepted",
  },
];

export default function LocalFirstAdrPage() {
  return (
    <EvidencePage
      eyebrow="Architecture decision record"
      title="Keep production repair local-first and release-gated"
      intro="Red Eye can use agents to investigate and prepare bounded fixes, but production authority stays outside the agent loop. Evidence comes in; reviewed changes go out through existing gates."
      meta={["ADR status: accepted", "Decision owner: CTO", "Documented: July 2026"]}
    >
      <EvidenceCallout title="Decision">
        <p>
          Run planner, executor, reviewer, and verification passes locally in an isolated worktree. Give the operations
          gateway read-only access, classify risk before mutation, and require GitHub and deployment controls for release.
          Financial, authentication, migration, and uncertain changes require explicit approval or escalation.
        </p>
      </EvidenceCallout>

      <EvidenceSection number="01" title="Context">
        <p>
          Red Eye combines checkout, payments, ticket issuance, refunds, event configuration, and live admissions. An
          operational symptom can cross several of those boundaries, and a plausible-looking repair can still violate a
          financial or ticket-state invariant. The design goal is faster investigation without quietly transferring
          production authority to an agent.
        </p>
      </EvidenceSection>

      <EvidenceSection number="02" title="Options considered">
        <div className="adr-options">
          {options.map((option) => (
            <article key={option.name}>
              <div><h3>{option.name}</h3><span>{option.decision}</span></div>
              <p><strong>Benefit:</strong> {option.benefit}</p>
              <p><strong>Cost:</strong> {option.cost}</p>
            </article>
          ))}
        </div>
      </EvidenceSection>

      <EvidenceSection number="03" title="Resulting control flow">
        <ol className="decision-flow">
          <li><span>1</span><div><strong>Collect evidence</strong><p>Read health, deployment, alert, CI, and runbook context without granting write authority.</p></div></li>
          <li><span>2</span><div><strong>Classify the task</strong><p>Identify restricted areas, required invariants, missing evidence, and the permitted repair lane.</p></div></li>
          <li><span>3</span><div><strong>Work in isolation</strong><p>Plan and patch in a dedicated worktree with a narrow file scope and an explicit rollback path.</p></div></li>
          <li><span>4</span><div><strong>Verify and review</strong><p>Run targeted tests, inspect the diff, and produce a durable evidence packet.</p></div></li>
          <li><span>5</span><div><strong>Gate release</strong><p>Open a PR or escalate. Existing GitHub and Render controls—not the agent—authorize deployment.</p></div></li>
        </ol>
      </EvidenceSection>

      <EvidenceSection number="04" title="Consequences">
        <div className="evidence-two-column">
          <div>
            <h3>What this improves</h3>
            <ul>
              <li>Production credentials do not need to live in a general agent runtime.</li>
              <li>Every attempted repair leaves plan, diff, verification, review, and rollback evidence.</li>
              <li>Local browser, database, and debugging tools remain available for ambiguous failures.</li>
              <li>Release authority stays legible to the humans accountable for the system.</li>
            </ul>
          </div>
          <div>
            <h3>What this does not solve</h3>
            <ul>
              <li>It is not an unattended always-on remediation service.</li>
              <li>Operator workstation health and credential hygiene still matter.</li>
              <li>Local environment drift can complicate reproduction.</li>
              <li>Approval queues can limit recovery speed for high-risk changes.</li>
            </ul>
          </div>
        </div>
      </EvidenceSection>

      <EvidenceSection number="05" title="Revisit conditions">
        <p>This decision should be revisited when all of the following are true:</p>
        <ul>
          <li>A hardened remote runner can use short-lived, least-privilege credentials.</li>
          <li>The safety benchmark shows sustained recall on restricted areas and required invariants.</li>
          <li>Rollback and canary controls are automated and independently verified.</li>
          <li>Observed incident volume justifies always-on automation over the simpler local operating model.</li>
        </ul>
        <p className="evidence-next-link">
          Next: <Link href="/work/red-eye-tickets/reliability/">the evals and operational tools that make those boundaries measurable →</Link>
        </p>
      </EvidenceSection>
    </EvidencePage>
  );
}
