# Red Eye production report source

The static fallback uses the canonical snapshot supplied September 15, 2026.
The following read-only refresh evidence retains its definitions for the new
page-load feed. Code preparation does not establish a live connection.

## September 30 refresh verification

Authenticated production PostgreSQL SELECT queries at cutoff
**September 30, 2026 at 12:01:33 PM PDT** (`2026-09-30T19:01:33.278848Z`)
independently reproduced the retained portfolio cohorts:

| Existing feed metric | Exact total | Conservative public display |
|---|---:|---:|
| Sales-generating events | 309 | 309 |
| Unique identifiable buyers | 19,995 | 19.9K+ |
| Paid customer orders | 30,406 | 30.4K+ |
| Tickets sold | 45,205 | 45.2K+ |
| Captured customer charges, including fees/taxes | $1,509,383.47 | $1.50M+ |

Gross ticket sales were $1,375,660.95 and remain a different metric. No new
public metric slot is added. The source reader's SQL reproduced these five
totals again in one read-only repeatable-read transaction at
`2026-09-30T19:26:28.127685Z`, with zero invalid source rows.

Reconciliation: 30,953 recorded-paid orders less one known check-in pilot
fixture and 546 comp-only orders equals 30,406. Email-first buyer identity
remains the approved definition; switching to today's user-first application
method would produce 23,884 and would be a definition change. Seventeen orders
lack both email and user ID. Three nonduplicative legacy ticket rows remain
included. Three orders have multiple captured charge movements, which remain
included at movement grain. No active line-item dimension conflicts were found.

The historical paid-recorded cohort includes 89 ticket units ($2,368.20 ticket
gross) excluded by the newer settled-payment guard. This feed intentionally
retains the approved historical definition; tickets are not represented as
attendance or settlement proof. The automatic source contract is
`redeye_portfolio_lifetime_v1`, and any definition change requires explicit
version review rather than substituting current application report values.

Evidence is retained in the existing "Pull production lifetime statistics"
chat `019f8a26-11f9-7e51-ae54-e468d5c471e8`, with the aggregate query receipt
`portfolio-production-verification-sources.json`. Only aggregate results were
read; no production records, payment providers or publication schedules were
changed by verification. The original September 11 source remains below for
the static fallback and historical provenance.

## Canonical source

- Report title: **Red Eye Tickets: Production Lifetime Statistics**
- Production snapshot time: **September 11, 2026 at 3:51 PM PDT**
- Comparison baseline: **August 25, 2026**
- Source system: Red Eye production database
- Source evidence: the rendered report includes the chart, metric definitions, read-only query provenance, cohort filters, and QA/reconciliation context
- Repository use: this file preserves the full approved fact set; public portfolio pages continue to show only their existing metric slots

The rendered report is the governing source for this snapshot. The figures below are a stored transcription for portfolio maintenance and do not constitute a live database connection.

## Production lifetime snapshot

| Metric | September 11 total | Change since Aug. 25 | Definition or scope |
|---|---:|---:|---|
| Users / identifiable buyers | 19,106 | +9.20% | Identifiable buyers represented in the production user/order cohort |
| Accounts | 20,219 | +9.48% | Count of database accounts |
| Producers | 136 | +0.74% | Producer accounts |
| Events | 334 | +4.70% | All event records |
| Venues | 35 | — | Distinct venue locations |
| Paid orders | 28,532 | +10.91% | Lifetime paid-order cohort |
| Tickets sold | 42,716 | +11.29% | Lifetime sold-ticket cohort |
| Gross ticket sales | $1,312,759.05 | +13.34% | Gross value attributed to ticket sales |

All lifetime totals include **July 15–18, 2026**. Those dates are removed only from the payment-method mix below.

## Corrected payment cohort after the public Google Pay launch

The corrected payment cohort contains **13,235 captured transactions**:

| Method | Captured transactions | Share |
|---|---:|---:|
| Apple Pay | 10,070 | 76.09% |
| Manual card entry | 2,033 | 15.36% |
| Google Pay | 1,132 | 8.55% |

The payment cohort excludes **July 15–18, 2026 UTC**, removing all four Apple Pay outage dates. These shares describe the corrected bounded payment cohort, not lifetime payment-method share. The supplied report did not include captured amounts by method in this update; no amounts are inferred here.

## Additional stored portfolio figures

| Metric | Value |
|---|---:|
| Captured customer charges | $1,440,418.60 |
| Events with sales | 285 |
| Producers with sales | 105 |
| Checked-in tickets | 28,727 |
| Repeat buyers | 4,979 (26.1% of identifiable buyers) |
| Average ticket value | $30.73 |
| Average ticket gross per order | $46.01 |
| Average tickets per order | 1.50 |
| Approved or archived events | 316 |
| Approved/archived venues | 33 |

Captured customer charges include fees and taxes. They are a payment-volume measure and must not be labeled as gross ticket-sales revenue.

## Definition boundary

- **Users / identifiable buyers** and **accounts** are different measures; the homepage uses identifiable buyers because they establish customer reach tied to the commerce cohort.
- **Gross ticket sales** and **captured customer charges** are different measures; the latter includes fees and taxes.
- **Events**, **events with sales**, and **approved or archived events** are different cohorts.
- **Venues** and **approved/archived venues** are different cohorts.
- The payment-method analysis must retain its corrected cohort, its 13,235 captured-transaction denominator, and the July 15–18 outage exclusion.

## Public-use mapping

The portfolio retains the existing commerce-focused homepage trio and does not add the supporting figures above as new page stats:

| Existing public slot | September 11 display floor | Exact source total |
|---|---:|---:|
| Customer charges processed | $1.44M+ | $1,440,418.60 |
| Paid orders | 28.5K+ | 28,532 |
| Identifiable buyers | 19.1K+ | 19,106 |

The homepage uses **$1.44M+ in customer charges processed · 28.5K+ paid orders · 19.1K+ identifiable buyers**. “Processed” describes the payment volume handled by the platform; it does not imply retained company revenue. The public display uses conservative floors, while this source record preserves exact totals and definitions.

## Superseded snapshot retained for provenance

The previous internal source record used the **August 10, 2026 at 14:07 UTC** production snapshot: 15,678 unique buyers, 16,472 registered accounts, 130 producers, 310 events, 295 approved/archived events, 33,532 tickets sold, $986,608.05 gross ticket sales, $1,079,689.47 captured customer charges, 36 venues, and 34 approved/archived-event venues. Its payment cohort excluded July 15–18 and contained 7,429 transactions. Those figures are historical and no longer control current portfolio copy.

The earlier July 22, 2026 at 14:12:59 UTC snapshot remains preserved in the archived Codex task record referenced by prior audit materials.
