# Red Eye Tickets: sanitized evidence pack

This directory exposes representative product behavior and engineering constraints from the Red Eye Tickets case study without publishing the private application, customer records, credentials, internal endpoints, or raw operational telemetry.

## Evidence classification

| Artifact | Classification | What it supports | What it does not prove |
| --- | --- | --- | --- |
| [`workflow-snapshot.json`](./workflow-snapshot.json) | Portfolio-safe reconstruction | Actors, states, recovery paths, and invariants across checkout and admissions | Production source-code identity or live service availability |
| [`payment-invariants.md`](./payment-invariants.md) | Sanitized engineering specification | The correctness boundary around payment capture, ticket issuance, reconciliation, and refunds | Provider certification or a live-wallet transaction |
| [`guarded-repair-architecture.md`](./guarded-repair-architecture.md) | Sanitized production architecture and representative excerpt | Evidence intake, bounded repair, separated passes, policy, deployment, rollback, verification, and Loop maturity boundaries | Unrestricted autonomy, model training, or a general-purpose AI platform |
| [`guarded-repair-snapshot.json`](./guarded-repair-snapshot.json) | Sanitized architecture fixture | Stage order, deploy lanes, maturity labels, and explicit non-claims | Production configuration, live incidents, credentials, or customer data |
| [`../../public/images/red-eye/checkin-mobile-scanner-admit.webp`](../../public/images/red-eye/checkin-mobile-scanner-admit.webp) | Audited product capture | Successful mobile admission feedback | Customer data or the complete scanner application |
| [`../../public/images/red-eye/checkin-mobile-event-menu.webp`](../../public/images/red-eye/checkin-mobile-event-menu.webp) | Audited product capture | Manual recovery and event controls | Production credentials or administrative access |

## Provenance and redaction boundary

- The workflow fixture is reconstructed from documented production behavior and uses invented identifiers only.
- Public metrics are conservative rounded floors with definitions and limitations published in the portfolio.
- Captures are reviewed to exclude buyer names, email addresses, order identifiers, ticket tokens, and payment data.
- Production implementation details are summarized at the architectural and invariant level.
- Production-facing, local-execution, attended/pilot, default-off, and framework-only capabilities are labeled separately.

## Verification

From the repository root:

```bash
npm run verify:evidence
```

The verifier checks the fixture schema, maturity labels, state uniqueness, required invariants, invented identifier format, and a denylist of fields that must never appear in the public artifact.

Passing verification establishes that the public fixture is internally consistent and respects its declared privacy boundary. It does not validate the private production system.
