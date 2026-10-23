# Account Distribution — CH-004

The 2026-10-22 evidence below records the original operational-inclusive chart.
Its tile/footer population is superseded by the scoped [2026-10-23 operational
separation](ACCOUNT_DISTRIBUTION_OPERATIONAL_EFFORT_VALIDATION.md). Source mappings,
local interactions, global isolation and missing-attribution retention continue.

## Pre-implementation findings (2026-10-22)

The existing render path is `update` → `renderAccountTreemap` using
`effortData.baseFiltered.worklogs` from `filteredData({ ignoreStatus: true })`.
`governedTempoAccountAggregation` is also used by the Accounts detail table and
must retain its existing semantics. The existing treemap merges accounts by
display name, drops missing account names, and overlays Jira estimates by name.

The historical Account governance specifies Jira Account. The current treemap
instead groups Tempo Account Name and sends its label to the shared Account
filter on tile click. This conflicts with distinct Tempo identifiers, duplicate
names, and the requested Client tiles. CH-004 authorizes Tempo-specific local
dimensions, not replacement of the global Account dimension. Tile clicks will
therefore select the embedded Client/Account locally; the selected styling and
hover interaction remain. Jira estimates cannot truthfully be attributed to
Tempo Clients/Account Keys by name; those tooltip fields will show `-`.
No global Account mapping, filter behavior, or Account table will be changed.

`downloadSnapshot` exports the Accounts detail table; it is not a treemap export.
It must continue using the global context without local selections.

Exact existing mappings are `tempoCustomerAccount` ← validated Tempo
`Account Customer` through `Account Key`, `tempoAccount` ← `Account Name`, and
`tempoAccountKey` ← `Account Key`. No Jira field supplies Client. The payload
already contains these fields, so no production mapping or payload rebuild is
needed. Existing unverified Client attribution is displayed as `-` locally,
without changing the global `N/A` bucket.

The binary treemap layout rounds small partitions to zero and then omits their
rows. The scoped correction will retain positive fractional partitions and
reduce gaps only where needed, preserving the layout algorithm and palette.

## Implemented behavior

The default view groups eligible managed-team worklogs by the existing validated
Tempo Customer dimension. Client selection switches to Account Key groups.
Account selection also shows Account Key groups, including when Client is All
Clients. Display names always include the authoritative Account Key in account
view, preventing ambiguity between equal names. Missing or unverified Client
and missing Account identity display `-`; these hours remain in the total.

Local controls intersect the existing Status-ignored Tempo filter path. Date
filtering remains Tempo `Work date`; existing Master Date, workforce, exclusions,
Jira enrichment and parent/child logic are unchanged. `governedTempoAccountAggregation`
accepts an optional dimension selector; its default behavior and Accounts-table
callers are unchanged. No new effort engine, source join, global state mutation,
or chart export was introduced. Selected Client survives temporary empty global
scopes. Changing Client clears an Account only when the complete eligible source
does not associate it with that Client.

## Current-snapshot reconciliation

Source: `data/raw/RAW_DATA_FULL_ANALYSIS_01_Jan_26_22_Oct_26.csv`.
The source schema was inspected directly, including `Tempo Worklog ID`.

| Measure | Before | After |
| --- | ---: | ---: |
| Governed managed-team worklogs | 32,218 | 32,218 |
| Governed managed-team logged hours | 51,084.279 | 51,084.279 |
| Treemap aggregation / footer hours (unrounded) | 50,634.882 | 51,084.279 |
| Rendered tile hours, desktop | 50,632.632 | 51,084.279 |
| Valid hours omitted for blank Account Name | 449.397 | 0 |
| Positive tile hours omitted by geometry, desktop | 2.250 | 0 |

The original chart footer was **not** the entire governed population: 226 valid
worklogs with missing Account Name were dropped. Restoring their 449.397 hours
is required by CH-004's missing-attribution requirement. It explains the changed
footer, without changing a KPI calculation, exclusion, or source population.
All Clients / All Accounts reconciles to the original governed total; it does
not preserve the old chart's missing-attribution defect. The visible footer is
51,084.3 h after rounding. No screenshot total is an expected test constant.

There are 270 unverified Client-attribution rows (535.897 h). They remain visible
as `-` locally and retain the existing global `N/A` semantics. The raw source has
37,531 rows, zero missing `Tempo Worklog ID` values, and zero repeated IDs.
The production row-preserving mappings and existing aggregation count each
eligible source worklog once; there is no Jira join in the chart path.

## Validation

- Before: all 13 Python tests and 15 capacity unit checks passed. Existing Client
  browser regression passed with the known tiny-tile mismatch diagnostics.
- After: all 13 Python tests and 15 capacity unit checks passed. Existing Client
  and Capacity browser regressions passed with zero console errors/treemap
  diagnostics. Delivery Progress ownership validation passed.
- `node --check web/app.js` and the new browser suite passed syntax validation.
- `scripts/verify_account_distribution.cjs`: **115 scenarios passed**, zero
  console/page errors. Covers every current Client and associated Account,
  Account-only selection, incompatible Account clearing, local tile click and
  keyboard selection, missing attribution, duplicate account names with distinct
  keys, valid operational work, excluded/unmanaged rows, date/global filter
  intersections, empty scopes, selection persistence, and mobile geometry.
- Every scenario reconciles tile hours to the independently filtered governed
  worklogs and rounded footer; raw percentages sum to one for nonempty scopes.
  Default source context is conserved before/after. Local changes preserve global
  state, worklog context, snapshot CSV, KPI cards, detail table and other chart
  contents/geometry. Existing responsive SVG CSS-height adjustment is normalized
  in the DOM comparison (the observed difference was Priority SVG height only).
- Desktop and 390px mobile panel screenshots were visually inspected. Controls,
  footer, palette, typography and binary treemap layout remain readable/in place.
- Numerical browser evidence and screenshots are retained locally under
  `.tmp/account-distribution/`. The new suite runs standalone; when the optional
  `.tmp/account-treemap-before.js` saved source exists it also compares the old
  chart against the same payload.

## Remaining limitations

Historical governance describes a Jira Account engineering-only treemap, whereas
CH-004 requests Tempo Client/Account logged effort. This implementation confines
that change to the chart. Global Jira Account mappings, the Accounts detail
table, historical reconciliation rules and other charts remain unchanged. This
document records the local interaction and tooltip conflicts rather than
rewriting governance or declaring a new baseline.

Missing/unverified Client and missing Account keys remain source-quality issues;
no Jira field, display-name identity, or invented customer is substituted. The
current source has unique worklog IDs, but this change does not introduce a new
global deduplication policy for future duplicated source exports.

The broad legacy CDP browser harness is not green: its initial assertion requires
four KPI cards, whereas the current dashboard renders eight. The direct runner
also crashed/hung in this environment; a temporary copy with Chromium compatibility
launch flags reached the stale four-card assertion. This validation limitation
is separate from the focused passing tests and is not claimed as a full-suite
pass. No unrelated KPI or legacy test assertions were changed.
The same four-versus-eight assertion failure was reproduced using the saved
pre-change `app.js` against the identical payload. Full regression sign-off
therefore remains outstanding, despite the focused validation passing.

## Files changed for CH-004

- `web/app.js`: embedded selection/aggregation/rendering and fractional tiles.
- `web/index.html`: local controls, subtitle, hint and chart source lineage.
- `web/styles.css`: responsive header controls, scoped to this panel.
- `scripts/verify_account_distribution.cjs`: focused browser validation.
- `docs/user-guides/Chart_and_Visual_Specification.md`: chart-specific contract.
- `docs/audit/ACCOUNT_DISTRIBUTION_VALIDATION.md`: this evidence and limitations.

Other edits already present in the working tree were preserved.
