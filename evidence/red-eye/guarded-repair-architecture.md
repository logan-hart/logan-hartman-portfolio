# Guarded production-repair architecture

Classification: sanitized production architecture and representative code
excerpt
Publication authorization: approved by the Red Eye technical owner
Reviewed: July 27, 2026

## Claim

Red Eye implements a guarded AI-assisted operations control plane that connects
signed production evidence to bounded repair, separated planning/execution/
review, risk and approval policy, exact-commit deployment, rollback, production
verification, and reusable lessons.

## Lifecycle

1. Signed or independently corroborated evidence enters through a redaction
   boundary.
2. Findings are fingerprinted, deduplicated, clustered, classified, and
   converted into bounded tasks.
3. A planner identifies uncertainty, invariants, scope, tests, and rollback.
4. An executor implements inside an isolated worktree and permitted file scope.
5. A separate reviewer evaluates the diff and verification evidence.
6. Policy determines whether the task may stage, merge, deploy, require human
   approval, or stop.
7. Deployment uses the certified exact-commit workflow.
8. Production verification, reconciliation, and required replay determine
   whether recovery can be accepted.
9. Outcomes and safe lessons are retained as evidence.

## Representative control excerpt

The following excerpt preserves the production runner’s stage order while
removing environment configuration and operational identifiers:

```sh
planner_pass
executor_pass
reviewer_pass

run_production_verification || abort_blocked \
  "Production verification failed after deploy."
```

## Policy boundary

- Payment, authentication, database, workflow, and infrastructure paths are
  restricted.
- Tests may not be disabled or weakened to make a repair pass.
- Diff size, file count, secret redaction, and required invariant coverage are
  enforced.
- Safe staged, urgent-safe, approval-required, and blocked/escalated lanes are
  distinct.
- Higher-risk and ambiguous work does not authorize its own release.

## Loop

Loop is the internal name for the policy-governed observation and learning
architecture:

```text
observation → finding → proposed action → approval → rollback plan
            → verification → measured outcome → reusable lesson
```

Some components are production-facing. Others remain deliberately default-off,
attended, pilot-scoped, or framework-only. Those labels are part of the
architecture, not disclaimers added after the fact.

## Recent validation evidence

- Production-canary and automation hardening: 6,628 backend examples, zero
  failures in the cited run.
- Attended Loop acceptance contract: 358 focused examples, zero failures in the
  cited run.
- Independent Watchdog heartbeat monitoring: 64 focused examples, zero
  failures in the cited run.

These counts describe the corresponding merged PR validation records. They are
not added together as a repository-wide coverage metric.

## Non-claims

This artifact does not claim model training, ML research, a general-purpose RAG
platform, unrestricted autonomous production access, or that every repository
commit was individually hand-authored.

## Sanitization boundary

Excluded: customer and attendee data, personal identifiers, credentials,
tokens, private endpoints, environment values, production resource IDs,
third-party proprietary material, and security-sensitive operational detail.
