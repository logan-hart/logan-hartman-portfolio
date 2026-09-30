# Static portfolio statistics refresh

The portfolio remains a Next.js static export. At page load its shared
`LivePortfolioStatistics` provider performs one credential-free GET to the
public JSON endpoint configured by `NEXT_PUBLIC_PORTFOLIO_METRICS_URL`. All existing
metric cards, associated prose and disclosure dates read one validated snapshot
from that provider. No CSS, layout, photos or additional metric slots change.

Red Eye owns the calculation and publishes the five conservative display values
and source cutoff twice weekly, using its existing maintenance worker and
existing private asset storage. The existing Red Eye backend serves only the
validated publication at `/api/v1/portfolio_statistics`; requests never run the
aggregate SQL. No additional paid Render service is needed. The Codex
heartbeat is already a monitor and must not become a second writer or schedule.

## Contract and fallback

The only accepted contract is `redeye_portfolio_lifetime_v1`:

```json
{
  "schemaVersion": 1,
  "contract": "redeye_portfolio_lifetime_v1",
  "asOf": "2026-09-30T19:01:33Z",
  "metrics": {
    "events": { "value": "309", "floor": 309 },
    "buyers": { "value": "19.9K+", "floor": 19900 },
    "orders": { "value": "30.4K+", "floor": 30400 },
    "tickets": { "value": "45.2K+", "floor": 45200 },
    "gpv": { "value": "$1.50M+", "floor": 1500000 }
  }
}
```

`gpv` is the retained internal key for captured fee- and tax-inclusive customer
charges; public labels remain captured customer charges. This snapshot retains
the portfolio's approved historical paid-recorded and email-first definitions,
which differ from some current application reports. The methodology page makes
that boundary explicit. Definitions must never be silently changed by a refresh.

The client rejects unknown/extra fields, missing metrics, incorrect rounding,
declining floors, stale/future cutoffs, and different contracts. It replaces the
whole snapshot atomically. On a timeout, CORS failure, malformed response or
unavailable file, the explicitly dated build snapshot stays visible. Search
engines and users without JavaScript also receive the dated build snapshot.
No user, order, payment or customer identifiers occur in the JSON.

There is one initial code/configuration deployment. Afterwards replacing the
JSON updates page-load statistics without rebuilding the portfolio. The only
public environment setting is the HTTPS JSON URL. Never use a presigned URL,
database credential, AWS key, Render key or bearer token in this setting.

## Validation and release evidence

- `npm test`: includes source-contract, floor, cutoff and privacy rejection tests.
- `npm run verify:evidence`: existing sanitized evidence checks.
- `npm run audit`: existing production dependency release check.
- `npm run build`: must continue to export static routes.
- `npm run verify:portfolio-feed -- <public-url> <portfolio-origin> [receipt.json]`:
  after publication, verifies an anonymous fetch, content type, CORS, cache TTL,
  schema/freshness, hash and optional read-only receipt equality. A passing feed
  check does not prove browser integration or future scheduled execution.

Local browser validation covers the homepage, work index, case study and
methodology page on valid data; 503, stale, malformed and timed-out responses retain the
dated fallback; JavaScript-disabled users also retain it. Responsive screenshots are validation artifacts, not production
acceptance. Repeat the browser checks against the exact deployed site after
release, verify the credential-free network request, and compare all rendered
values/cutoffs with the public file. Observe a later scheduled publication with
no portfolio deployment before claiming unattended refreshes proven.

The starting commit is `e2e37e3843279fb18bf24537632dbb72e054a361`, the verified
live September 15 metric update. At inspection, repository main
`acafb345eaf591d9775f28839381c46ffaa86057` still had older July definitions.
Publication must retain the already-deployed metric update rather than revert
to main's old labels. Promote the reviewed branch through the portfolio's normal
PR and build workflow; verify its exact Render deployment SHA.

The initial audit found inherited Next.js, Sharp and Nano ID advisories. The
patch updates in this branch clear the existing production dependency gate;
they do not change the static hosting model.

## Remaining production prerequisites

The writer and endpoint are default-off until the protected Red Eye release and
activation. The worker and backend need their existing authenticated GetObject
access, and the worker needs PutObject for the fixed private publication key.
A route-specific CORS rule permits credential-free GET/HEAD from the verified
portfolio origin only; it does not add the portfolio to authenticated API origins.
The portfolio URL is `https://api.redeyetickets.com/api/v1/portfolio_statistics`.
No S3 bucket public-read or CORS change is required.

The direct S3 option was rejected after live checks found the object absent,
public requests denied, and the runtime uploader unable to manage bucket CORS.
The existing backend avoids that administrative dependency while keeping the
file private. No live linkage is established merely by adding `render.yaml`.
