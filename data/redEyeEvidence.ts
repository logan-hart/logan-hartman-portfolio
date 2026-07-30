export type EvidenceLink = {
  href: string;
  label: string;
  title: string;
  description: string;
  meta: string;
  linkLabel?: string;
};

export const homepageRedEyeEvidenceLinks: EvidenceLink[] = [
  {
    href: "/work/red-eye-tickets/payment-integration/",
    label: "Production integration",
    title: "One checkout across three payment protocols",
    description:
      "How Authorize.Net, Apple Pay, and Google Pay share authoritative order state while preserving provider-specific validation, order-bound idempotency, webhook recovery, and reconciliation.",
    meta: "Payments · Idempotency · Reconciliation",
    linkLabel: "Read the Payment Case",
  },
  {
    href: "/work/red-eye-tickets/guest-checkout-inventory-hold/",
    label: "Resolved production incident",
    title: "The final ticket was held, but capture counted it twice",
    description:
      "How a guest's own final-inventory hold became competing demand after confirmation associated the order with an existing account—and how origin-bound ownership fixed it without weakening capacity safety.",
    meta: "Checkout origin · Inventory integrity · 6,706 backend examples",
    linkLabel: "Read the Incident Review",
  },
  {
    href: "/work/red-eye-tickets/postmortem-unicode-pdf/",
    label: "Production incident",
    title: "The event title that broke ticket PDFs",
    description:
      "How one valid emoji exposed an encoding boundary across stored event data, fonts, and PDF rendering, and how the fix was protected against recurrence.",
    meta: "Incident response · Root cause · Regression coverage",
    linkLabel: "Read the Incident Review",
  },
  {
    href: "/work/red-eye-tickets/reliability/",
    label: "Production reliability",
    title: "Testing, release, and recovery",
    description:
      "How RSpec, Jest, Playwright, risk-based CI gates, production canaries, exact-commit releases, rollback, and post-deploy verification protect critical workflows.",
    meta: "Automated testing · Release safety · Verification",
    linkLabel: "Review the Reliability Controls",
  },
  {
    href: "/work/red-eye-tickets/guarded-production-implementation/",
    label: "Guarded prototype",
    title: "AI-assisted production repair with explicit boundaries",
    description:
      "How signed operational evidence becomes bounded repair work through separate planning, execution, review, policy, approval, rollback, and verification stages.",
    meta: "Human approval · Safety gates · Maturity limits",
    linkLabel: "Explore the Guarded Architecture",
  },
];

export const redEyeEvidenceLinks: EvidenceLink[] = [
  {
    href: "/work/red-eye-tickets/guarded-production-implementation/",
    label: "Production implementation",
    title: "From signed evidence to verified recovery",
    description:
      "A guarded repair control plane with deduplicated tasks, separated planner/executor/reviewer passes, policy and approval gates, exact-commit deployment, rollback, and production verification.",
    meta: "AI implementation · release safety · measured outcomes",
  },
  {
    href: "/work/red-eye-tickets/payment-integration/",
    label: "Production",
    title: "One checkout across three payment protocols",
    description:
      "How Authorize.Net, Apple Pay, and Google Pay were joined through provider-specific adapters, order-bound idempotency, recovery, and reconciliation.",
    meta: "Authentication · failure handling · ledger truth",
  },
  {
    href: "/work/red-eye-tickets/guest-checkout-inventory-hold/",
    label: "Resolved production incident",
    title: "The final ticket was held, but capture counted it twice",
    description:
      "A guest-origin hold became invisible to payment capture after account association. The fix binds consumption, session authorization, and replay to verified checkout provenance.",
    meta: "Origin-bound holds · fail-closed identity · verified release",
  },
  {
    href: "/work/red-eye-tickets/postmortem-unicode-pdf/",
    label: "Production incident",
    title: "The event title that broke ticket PDFs",
    description:
      "A valid emoji exposed an implicit encoding contract between the web product, stored event data, fonts, and the PDF renderer.",
    meta: "Ownership · root cause · layered remediation",
  },
  {
    href: "/work/red-eye-tickets/adr-local-first-repair/",
    label: "Accepted architecture decision",
    title: "Why production repair stays local-first",
    description:
      "A documented tradeoff between autonomous cloud repair, CI-hosted automation, and a bounded local evidence-and-review loop.",
    meta: "Decision · alternatives · revisit conditions",
  },
  {
    href: "/work/red-eye-tickets/reliability/",
    label: "Evaluation evidence",
    title: "Safety evals, operational evidence, and launch readiness",
    description:
      "A local agent-safety benchmark, read-only GitHub/Render/runbook gateway, and producer-readiness report tested against production-shaped operating risks.",
    meta: "26 evals · 9 MCP tests · graceful degradation",
  },
];

export const architectureLayers = [
  {
    label: "Experience layer",
    nodes: ["Buyer checkout", "Producer tools", "Admin support", "Door check-in"],
  },
  {
    label: "Application boundary",
    nodes: ["Rails API", "Authentication + roles", "Inventory rules", "Payment + ticket state"],
  },
  {
    label: "State + async work",
    nodes: ["PostgreSQL", "Background jobs", "Audit trails", "Notifications"],
  },
  {
    label: "External systems",
    nodes: ["Authorize.Net + wallets", "Email delivery", "Object storage", "Render + GitHub"],
  },
];

export const guardedRepairStages = [
  {
    step: "01",
    title: "Signed evidence",
    copy: "Production reports, alerts, deployment state, and runbooks cross a redaction and corroboration boundary.",
  },
  {
    step: "02",
    title: "Bounded task",
    copy: "Findings are fingerprinted, deduplicated, clustered, risk-classified, and assigned tests and a deployment lane.",
  },
  {
    step: "03",
    title: "Separated passes",
    copy: "Planner, executor, and reviewer work in isolation; the reviewer evaluates the diff and verification evidence.",
  },
  {
    step: "04",
    title: "Policy and approval",
    copy: "Restricted paths, test integrity, diff size, secrets, risk, and human-approval requirements fail closed.",
  },
  {
    step: "05",
    title: "Exact-commit release",
    copy: "Approved work moves through the certified deployment path with a recorded rollback plan and release identity.",
  },
  {
    step: "06",
    title: "Verified recovery",
    copy: "The incident remains unresolved until post-deploy probes pass and required reconciliation or replay completes.",
  },
];

export const loopLifecycle = [
  "Observation",
  "Finding",
  "Proposed action",
  "Approval",
  "Rollback plan",
  "Verification",
  "Outcome",
  "Lesson",
];

export const guardedImplementationTests = [
  { value: "6,628", label: "Backend examples passed in production-canary and automation hardening" },
  { value: "358", label: "Focused examples for the attended Loop acceptance contract" },
  { value: "64", label: "Focused examples for independent Watchdog heartbeat monitoring" },
  { value: "0", label: "Failures in the cited validation runs" },
];

export const architectureContracts = [
  {
    title: "Money movement",
    copy: "Payment and refund transitions remain explicit, idempotent, and auditable; automation cannot silently widen them.",
  },
  {
    title: "Ticket identity",
    copy: "Orders, issued tickets, refund state, and admission state stay connected so support actions have visible consequences.",
  },
  {
    title: "Live admissions",
    copy: "Camera scanning degrades to manual lookup, while credentials constrain staff access and the server remains authoritative.",
  },
  {
    title: "Publishing boundary",
    copy: "Approved event state triggers a controlled public-frontend rebuild so event pages and metadata can publish without a separate manual release.",
  },
];

export const evalMetrics = [
  { value: "26", label: "Human-authored safety cases" },
  { value: "0 / 19", label: "Unsafe cases classified false-safe" },
  { value: "96.2%", label: "Baseline decision accuracy" },
  { value: "94.4%", label: "Restricted-area recall" },
];

export const safetyCaseMix = [
  { label: "Abstain", value: 7 },
  { label: "Approval required", value: 8 },
  { label: "Block", value: 4 },
  { label: "Safe repair", value: 7 },
];

export const opsGatewayTools = [
  "Read Red Eye service health",
  "List recent Render deployments",
  "Search operational runbooks",
  "Read open GitHub ops-alert issues",
  "Assemble partial incident evidence",
  "Preview an incident issue without writing it",
];

export const readinessChecks = [
  "Customer-facing event details",
  "Upcoming performance schedule",
  "Sellable ticket inventory",
  "Ticket-title rendering compatibility",
  "Tax and service-fee configuration",
  "Door credential readiness",
];
