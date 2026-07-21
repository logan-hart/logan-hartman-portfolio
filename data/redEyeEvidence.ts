export type EvidenceLink = {
  href: string;
  label: string;
  title: string;
  description: string;
  meta: string;
};

export const redEyeEvidenceLinks: EvidenceLink[] = [
  {
    href: "/work/red-eye-tickets/payment-integration/",
    label: "Production integration",
    title: "One checkout across three payment protocols",
    description:
      "How Authorize.Net, Apple Pay, and Google Pay were joined through provider-specific adapters, order-bound idempotency, recovery, and reconciliation.",
    meta: "Authentication · failure handling · ledger truth",
  },
  {
    href: "/work/red-eye-tickets/postmortem-unicode-pdf/",
    label: "Production postmortem",
    title: "The event title that broke ticket PDFs",
    description:
      "A valid emoji exposed an implicit encoding contract between the web product, stored event data, fonts, and the PDF renderer.",
    meta: "Ownership · root cause · layered remediation",
  },
  {
    href: "/work/red-eye-tickets/adr-local-first-repair/",
    label: "Architecture decision record",
    title: "Why production repair stays local-first",
    description:
      "A documented tradeoff between autonomous cloud repair, CI-hosted automation, and a bounded local evidence-and-review loop.",
    meta: "Decision · alternatives · revisit conditions",
  },
  {
    href: "/work/red-eye-tickets/reliability/",
    label: "Reliability engineering",
    title: "Safety evals, operational evidence, and launch readiness",
    description:
      "A balanced agent-safety benchmark, read-only GitHub/Render/runbook gateway, and deterministic producer readiness report prototyped against Red Eye's real operating risks.",
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
    title: "Operational automation",
    copy: "Telemetry is read-only evidence. Repairs are prepared in isolated worktrees, checked by policy, and released through GitHub gates.",
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
