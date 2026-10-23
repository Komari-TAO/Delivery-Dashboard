# Account Distribution — operational separation

Date: 2026-10-23 (Europe/Madrid). Scope: Portfolio Account Distribution only,
plus its focused validation and the explicitly authorized legacy KPI-count test
expectation. This is implementation evidence, not a new governance baseline.

## Classification investigation completed before implementation

The current managed, globally filtered Tempo population has 32,218 worklogs and
51,084.279 logged hours. The source snapshot remains
`RAW_DATA_FULL_ANALYSIS_01_Jan_26_22_Oct_26.csv`; no payload or source was rebuilt.

The existing `isTempoWorkItem` helper classifies normalized `TEMPO-*` keys as
operational, after the shared exclusions: TEMPO-54, TEMPO-92, TEMPO-106,
TEMPO-111 and TEMPO-112. Client and Account names do not classify activity.
The investigation executed the existing Engineering Work Mix and People
calculations against the chart's governed worklog scope. Both independently
returned **8,182.091 operational hours**, with **42,902.188 engineering hours**.
This discrepancy from the illustrative screenshot was reported before the
visualization was modified; no alternative classification was introduced.

### TEMPO TICKETS is not an operational classification

| Population | Worklogs | Logged hours |
| --- | ---: | ---: |
| Original TEMPO TICKETS Client tile | 9,114 | 6,025.323 |
| Operational worklogs within that tile | 9,071 | 5,956.657 |
| Nonoperational worklogs within that tile | 43 | 68.666 |
| Operational worklogs under other Clients/missing attribution | 1,812 | 2,225.434 |
| All governed operational worklogs | 10,883 | 8,182.091 |

The original tile references 39 distinct keys: 24 operational TEMPO keys and 15
nonoperational keys. Its operational keys and contributions are:

| Key | Worklogs | Hours |
| --- | ---: | ---: |
| TEMPO-108 | 5,448 | 2,599.427 |
| TEMPO-30 | 625 | 788.167 |
| TEMPO-32 | 843 | 608.500 |
| TEMPO-36 | 450 | 338.583 |
| TEMPO-109 | 444 | 323.417 |
| TEMPO-113 | 278 | 215.500 |
| TEMPO-34 | 248 | 193.999 |
| TEMPO-77 | 96 | 153.084 |
| TEMPO-86 | 164 | 134.666 |
| TEMPO-31 | 64 | 119.750 |
| TEMPO-59 | 93 | 109.233 |
| TEMPO-39 | 89 | 89.500 |
| TEMPO-45 | 106 | 86.347 |
| TEMPO-28 | 38 | 51.250 |
| TEMPO-43 | 9 | 48.567 |
| TEMPO-95 | 23 | 44.167 |
| TEMPO-26 | 16 | 17.500 |
| TEMPO-49 | 7 | 12.750 |
| TEMPO-115 | 18 | 10.500 |
| TEMPO-99 | 4 | 4.250 |
| TEMPO-29 | 2 | 3.500 |
| TEMPO-89 | 4 | 2.000 |
| TEMPO-114 | 1 | 1.500 |
| TEMPO-93 | 1 | 0.500 |

The 43 nonoperational worklogs remain customer/account effort under their source
Client name TEMPO TICKETS:

| Key | Worklogs | Hours |
| --- | ---: | ---: |
| CMP-459 | 4 | 16.000 |
| OPS-1292 | 10 | 14.000 |
| LSI-4477 | 3 | 13.000 |
| AUT-4549 | 3 | 7.000 |
| MS-3432 | 3 | 5.916 |
| MS-3539 | 5 | 3.750 |
| MS-3537 | 5 | 3.000 |
| MS-3422 | 3 | 1.250 |
| RFE-1515 | 1 | 1.250 |
| TR-6778 | 1 | 1.000 |
| BSA-171 | 1 | 1.000 |
| CMP-318 | 1 | 0.500 |
| RFE-73 | 1 | 0.500 |
| RFE-2340 | 1 | 0.250 |
| ADF-2299 | 1 | 0.250 |

### Operational work exists under other Accounts

| Tempo Client | Tempo Account Key / Name | Worklogs | Operational hours |
| --- | --- | ---: | ---: |
| TEMPO TICKETS | TEMPOOATIN / TEMPO OAT INTER | 9,071 | 5,956.657 |
| OAT | ENGINEERIN / Engineering | 1,756 | 2,188.101 |
| OAT | ISO27001 / ISO27001 | 25 | 22.500 |
| Missing/unverified (`N/A` globally, `-` locally) | Missing | 31 | 14.833 |

The additional operational keys are TEMPO-83, TEMPO-79, TEMPO-33, TEMPO-78,
TEMPO-80, TEMPO-42, TEMPO-51, TEMPO-38, TEMPO-116, TEMPO-87 and TEMPO-98.
Thus total Operations exceeds the old Client tile by 2,156.768 hours:
2,225.434 outside the tile minus 68.666 nonoperational hours inside it.
Subtracting a Client-name bucket would misclassify both populations.

## Implementation and footer scope

- The renderer filters the already governed, managed Tempo scope using the
  existing `isTempoWorkItem` classifier. Only nonoperational rows feed local
  picker options and `governedTempoAccountAggregation` for customer tiles.
- Total and Operational Tempo hours reuse the existing
  `peopleTotalsRow(groupPeople(worklogs, []))` calculation. No new effort or
  operational-classification engine, data join or source mutation was introduced.
- Total logged hours and Operational Tempo hours retain the global filter scope,
  including the existing applicable Team, Assignee, Skill, Date and other sidebar
  selections. Their labels explicitly say **global filters**. Jira Status remains
  independent of this governed effort path.
- Customer/account effort equals visible tile hours after global **and local**
  Client/Account selections. Its label says **global + local filters**. A local
  Client subtotal is never presented as a portfolio total. Local control callbacks
  retain the complete global worklog context, including Operations.
- With All Clients / All Accounts, Total = Operations + Customer/account effort.
  Under local selection, Total = Operations + selected customer effort + unselected
  nonoperational effort. The contextual total/operations values do not shrink.
- Tile percentages use only the visible customer/account effort denominator.
  Missing Client/Account attribution remains `-`; no valid engineering effort is
  silently dropped. There are 521.064 engineering hours with unverified Client
  attribution, including 434.564 hours with blank Account Name, in this snapshot.
- Tempo `Account Customer`, `Account Name` and `Account Key` mappings remain
  unchanged. The local picker/drilldown, pastel colors, fractional binary layout,
  selected styling, hover information, keyboard behavior and responsiveness remain.
- Source records, global exclusions, workforce attribution, Master Date calendar,
  hierarchy, other visualizations and global exports were not modified. The new
  business hint uses the exact requested wording. No new baseline was created.

## Before/after reconciliation

| Measure, same default global scope | Before | After |
| --- | ---: | ---: |
| Governed source worklogs | 32,218 | 32,218 |
| Governed Logged Total (h) | 51,084.279 | 51,084.279 |
| Governed Logged Operations (h) | 8,182.091 | 8,182.091 |
| Governed Logged Engineering / eligible customer effort (h) | 42,902.188 | 42,902.188 |
| Hours represented by customer/account tiles | 51,084.279 (included Operations) | 42,902.188 |
| Nonoperational worklogs retained in tiles | 21,335 | 21,335 |
| Operational worklogs represented in tiles | 10,883 | 0 |
| TEMPO TICKETS tile (h) | 6,025.323 | 68.666 |

After rounding, the footer shows **51,084.3 h total**, **8,182.1 h operational**,
and **42,902.2 h customer/account effort**. The screenshot's illustrative
6,025.3 / 45,059.0 split is not the governed split for this snapshot. All expected
test values are calculated from active data, not these illustrative constants.

## Validation outcomes

- Before: existing focused browser validation passed 115 scenarios; all 13 Python
  tests and 15 capacity unit checks passed.
- After: updated focused browser validation passed **117 scenarios**, with no
  console or page errors. It compares Total/Operations to the existing People and
  Engineering Work Mix calculations and reconciles every Client/Account selection
  against independently filtered nonoperational worklogs.
- Every scenario reconciles tile hours, visible percentage sums, footer numbers,
  rounding and scope labels. Tests cover default and local scopes, reset,
  Team/Assignee/Skill/Date and other global filter intersections, missing
  attribution, misleading Client names, equal Account display names with distinct
  keys, excluded/unmanaged records, operational-only empty states and mobile bounds.
- The unchanged global worklog context, KPI cards, other chart content/geometry,
  tables and snapshot CSV are checked for local filter leakage. Existing responsive
  SVG CSS-height changes are normalized in the unrelated-chart DOM comparison.
- Existing Client and Capacity browser regressions passed with zero console
  errors/treemap diagnostics. Delivery Progress ownership validation passed.
  All 13 Python tests and 15 capacity unit checks passed after implementation.
  JavaScript syntax validation passed for implementation and validation scripts.
- Desktop and 390px mobile screenshots were visually inspected; the three footer
  values wrap within the panel and retain explicit scope labels. Evidence is
  retained under `.tmp/account-operations/` (`investigation.json`, `validation.json`,
  screenshots and validation logs).

### Full legacy regression follow-up

Confirmed that `.kpi-card` includes six validated general cards plus two Delivered
Features cards. The authorized test change updates only `initial.kpis !== 4` to
`initial.kpis !== 8`; no dashboard KPI was altered.

The full CDP harness was run. Its direct Chromium launch crashed (`Target
crashed`). A temporary copy using Chromium compatibility launch flags executed
the unchanged assertions and passed the new eight-card count, then failed on the
pre-existing required label **Annual Capacity Remaining**. The unchanged dashboard
uses **Remaining Period Capacity**, both before and after this chart change.
The passing before/after context and KPI fingerprints confirm the chart change
did not introduce that mismatch. This second assertion was left intact because
the request authorizes only the obsolete card-count expectation correction.
**Full regression sign-off remains incomplete; a full-suite PASS is not claimed.**

## Remaining governance/data-quality issues

- Source Client TEMPO TICKETS contains 68.666 nonoperational hours. The name remains
  visible; removing or relabeling it would require a source attribution decision,
  not a new operational rule. OPS-prefixed issue keys are likewise not automatically
  operational under the approved TEMPO-key classification.
- Missing/unverified Client and Account attribution is preserved explicitly.
  Historical global Jira Account semantics remain separate from Tempo dimensions;
  no new hierarchy or Client inference was introduced.
- The legacy full browser suite needs a separately scoped review of stale KPI
  assertions. This implementation does not change unrelated KPI names/calculations
  or weaken those assertions to obtain a green result.

## Files modified

- `web/app.js`
- `web/index.html`
- `web/styles.css`
- `scripts/verify_account_distribution.cjs`
- `scripts/verify_bi_app_chrome_cdp.mjs` (card-count expectation only)
- `docs/user-guides/Chart_and_Visual_Specification.md`
- `docs/audit/ACCOUNT_DISTRIBUTION_VALIDATION.md` (historical supersession notice)
- `docs/audit/ACCOUNT_DISTRIBUTION_OPERATIONAL_EFFORT_VALIDATION.md`

Pre-existing unrelated working-tree changes were preserved.
