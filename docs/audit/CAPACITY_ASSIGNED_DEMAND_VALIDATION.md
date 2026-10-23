# Capacity versus Known Assigned Demand — implementation and validation

Date: 2026-10-22. Reporting date: 2026-10-22, from the existing payload source-export calculation, not the browser clock.

## Scope and prior state

Replaced only the Demand Management capacity pivot and its related calculation/rendering path. The original pivot grouped Weekly Capacity, Tempo logged effort and raw Jira Remaining Estimate by Team/planning period; its Gap was Capacity − Logged − Known Demand. It did not resolve overlapping estimates or consistently exclude terminal demand. The replacement Gap is Available Capacity − eligible resolved Known Assigned Demand. The separate Team × Release matrix, Epic Workflow, account comparison, quality panel, Portfolio and exports retain their existing semantics.

The workspace already contained uncommitted changes, including the Client implementation and governance updates. These were preserved. `web/app.js` and `web/dashboard-core.js` have the same SHA-256 values captured before this change. The latest implementation baseline read was v0.16, with v0.15's forecast boundary and the current calculation, source, forecasting, hierarchy, semantic and release documents reviewed before implementation.

### Conflicts identified before calculation changes

1. `Forecast_Resolution_Specification.md` §5.3 does not authorize parent/child contributor selection. The user first clarified: **“Use parent estimates only when no estimated children exist,”** then refined this to **eligible** subtasks with a valid Remaining Estimate. The scoped rule uses eligible open child estimates first, including confirmed zero; a completed subtask or missing/invalid estimate does not suppress parent fallback. Hierarchy is resolved after source eligibility checks and before presentation filters. No estimates, ownership or dates are inherited or distributed. This does not rewrite Version 2.1 forecasting.
2. The parked forecast contract uses Jira Team and forbids Assignee-based planning ownership; this request explicitly requires Assignees workforce attribution. The new panel uses that requested scope without changing other ownership semantics.
3. Forecast governance starts the day after reporting date; this request explicitly starts from reporting date. The new panel uses that inclusive date and labels its full-week treatment. Existing Master Date partial-week capacity treatment is retained.
4. The previous builder converts missing capacity hours to zero. A separate source-preserving input now retains blanks/invalid values for this panel, without altering legacy capacity values.

## Code and mapping audit

| Responsibility | Existing reusable logic / change |
| --- | --- |
| Weekly capacity | `build_web_data.py:main`, Weekly Capacity `Planned Hours` and `Week Number`; existing `periodCapacity` retained for compatibility, removed from this panel's active path. New source-preserving `capacityCoverage.capacity` prevents blanks becoming zero. |
| Remaining Estimate | Existing Jira Remaining Estimate / 3,600 conversion; new isolated input preserves numeric validity. Original Estimate is never a fallback. |
| Hierarchy | Existing `jiraParentKey` extraction and original issue keys reused; new `CapacityCoverage.resolve` applies the user-approved rule, duplicate/cycle checks and source traceability before filtering. |
| Canonical person / Team / Skill | `build_assignee_name_lookup`, `canonicalize_assignee_series`, Assignees mappings. The isolated workforce input retains contributing teams even when they have no Engineering capacity records. |
| Planning allocation | Governed current/future Target Release first, future Due Date fallback, then unscheduled. The existing `demand.planningPeriod` algorithm cannot safely supply the new future horizon (unknown releases and gaps differ), so the new scoped resolver applies the documented precedence directly to source fields. Existing planning-period values remain unchanged elsewhere. |
| Release boundaries | Existing `releases` payload from `Release Cycle.csv`; future choices sorted by Start Date. End Date remains official Code Freeze. |
| Reporting date | Existing builder `export_current_date` / `current_date`, based on export dates and latest governed worklog date. |
| Calendar | Existing `masterDates` payload; no ISO week calculation. Missing interior dates invalidate capacity coverage. |
| Filters | Demand `pickerState`, `businessAreaMatches`, `promoterMatches`, shared `DashboardCore.clientValue`. Tab-specific state remains separate. |
| Client | Existing verified direct Tempo Account Customer attribution retained. Independent account metadata is absent. No worklog is required for Jira inclusion; unlogged items remain `N/A`. |
| Unallocated | New exclusive exception categories retain independent allocation/planning/estimate flags and Jira keys. Team selection does not remove the broader exception population. |
| Arithmetic | `CapacityCoverage.metrics` centralizes gap/load; portfolio values derive from team totals. |

Changed implementation files: `scripts/build_web_data.py`, `web/capacity-coverage.js`, `web/demand.js`, `web/index.html`, `web/styles.css`. Added focused calculation and browser checks. Calculation/visualization documentation and Datasources lineage were updated narrowly. Generated payload and evidence remain local/ignored.

## Baseline and source reconciliation

The pre-change capture is [baseline.json](../../outputs/capacity_assigned_demand/baseline.json), including exact source filenames/hashes and pre-change code hashes. Current source files:

- `Weekly Capacity_20261016.csv`
- `20261009_Assignees_Capacity.csv`
- `All Jira Work Items marked PI Backlog (JIRA)_20261022.csv`
- `RAW_DATA_FULL_ANALYSIS_01_Jan_26_22_Oct_26.csv`
- `Google 2026 to 2028_Master_Date.csv`
- `Release Cycle.csv`
- `Promoters.csv`

| Existing population | Before | After |
| --- | ---: | ---: |
| Legacy governed capacity rows | 2,014 | 2,014 |
| Legacy capacity source sum | 52,654.4 h | 52,654.4 h |
| Governed worklog rows | 32,934 | 32,934 |
| Governed worklog sum | 52,013.029 h | 52,013.029 h |
| Jira demand rows | 2,238 | 2,238 |
| Legacy raw Remaining Estimate sum | 44,636.1001 h | 44,636.1001 h |
| Fixed source KPI values | Captured | Unchanged |

All six teams are represented in both sources. Assignees / capacity row counts: Authoring 5 / 265; Delivery Express 7 / 371; Integration 6 / 318; Nexus 6 / 318; Portal 5 / 265; Scoring 9 / 477. There are **zero duplicate populated assignee-week records**. The raw CSV's trailing empty rows are excluded before auditing grain. There are 142 populated capacity rows with blank planned hours across the complete source.

### Resolved demand reconciliation

The 2,238 unique Jira keys partition into:

| Resolution | Keys | Remaining Estimate |
| --- | ---: | ---: |
| Terminal | 1,842 | 31,131.6835 h |
| Open valid estimates before planning/team scope | 250 | 12,844.2499 h |
| Open parents covered by eligible estimated descendants | 20 | 660.1667 h |
| Open missing/invalid estimates | 126 | Unavailable |

The three known-hour populations reconcile to 44,636.1001 h; missing estimates are not assigned zero demand. The audit found 186 positive parent/child estimate pairs across the source, which demonstrates why raw additive totals cannot supply the replacement KPI.

Each included Jira key contributes once, to one date allocation and one canonical team. No estimate joins fan out. Terminal-parent status never suppresses eligible children. Source tests include a zero-own-estimate Epic with 94.75 h of active child demand; its contribution is 94.75 h. All hierarchy cases use synthetic fixtures where no such exact source case is established, rather than fabricated production rows.

### Through year-end: 2026-10-22 through 2026-12-31

| Team | Complete capacity | Known capacity subtotal | Assigned demand | Gap |
| --- | ---: | ---: | ---: | ---: |
| Nexus | 1,816 h | 1,816 h | 889.75 h | 926.25 h |
| Delivery Express | 2,508 h | 2,508 h | 1,461 h | 1,047 h |
| Authoring | 1,940 h | 1,940 h | 633 h | 1,307 h |
| Portal | 1,980 h | 1,980 h | 338.75 h | 1,641.25 h |
| Integration | 2,320 h | 2,320 h | 271.75 h | 2,048.25 h |
| Scoring | - | 2,252 h | 809.1666 h | - |
| Portfolio | **-** | **12,816 h** | **4,403.4166 h** | **-** |

Scoring has 33 blank assignee-week values in this window; its capacity, gap and load and the portfolio denominator are unavailable. The 12,816 h subtotal must not be presented as confirmed complete capacity. Unallocated demand = **1,259.75 h / 15 keys**. Unscheduled = **7,181.0833 h / 139 keys**, disclosed outside the dated horizon. Missing/invalid estimate exceptions in scope = 118 keys. No scheduled, estimated non-Engineering keys fall in this window, but known non-Engineering mappings remain preserved in other exception records. Zero keys have unresolved hierarchy/identity conflicts in the current source.

The first release option, `release-2026-12`, resolves to 2026-10-22 through 2026-11-06: assigned demand **2,593.2166 h**; unallocated **268 h / 7 keys**; known capacity subtotal **3,488 h**, with nine blank Scoring assignee-week cells. Complete portfolio capacity/gap/load remain unavailable.

### Eligibility refinement and overlap governance review

This refinement applies only to Capacity versus Known Assigned Demand. Terminal children no longer suppress the parent. Valid open zero estimates do suppress it. Missing, invalid and negative child estimates remain explicit estimate exceptions while allowing the parent's own valid estimate to contribute. Paused/blocked children remain eligible under existing status rules. Source eligibility is determined before Team/customer/horizon selection so hidden eligible children do not reintroduce parent demand.

The source now has 20 open covered parents instead of 27. The released parent estimates move only into their own planning/team populations: year-end assigned demand increases by 84 h, unallocated by 160 h, and unscheduled by 154.5 h; one newly uncovered parent has no valid estimate. All original Jira values remain unchanged.

The new governance-review section contains **21 unique parent records** in each default release/year-end view, including 14 open covered parents and seven terminal parents whose source estimates overlap eligible child estimates. Each review record retains the parent key, source estimate, excluded outcome, eligible descendant keys, source estimates and resolution outcomes. Zero estimates remain zero. These records are **non-additive review evidence**, not an additional exception-hour population; they do not inflate assigned or unallocated demand. Multiple child links belong to one parent review record. Review scope spans teams and matches a parent or affected child against applicable filters and the horizon/unscheduled scope. Cycles and identity conflicts remain separate unresolved exceptions.

Focused tests cover Story and Task parents with completed subtasks, paused subtasks, mixed valid/missing/zero/terminal subtasks, parent fallback, source immutability, overlap flags and non-additive review records. Existing legacy datasets and KPI values are hash-compared before/after this refinement.

Display rounding is one decimal for hours/percentages, matching the dashboard; calculations retain the payload's four-decimal estimate precision. Tiny binary floating-point differences are below display precision.

## Filter applicability matrix

The app has separate Portfolio and Demand rails; it does not have a shared cross-tab filter store. No new unrelated filters were added.

| Filter | Capacity | Demand | Expected behavior / validation |
| --- | --- | --- | --- |
| Team | Yes | Yes | Actual Demand multi-select; single, multiple and Nexus-only browser checks pass. Exceptions remain visible across Team scope. |
| Assignee | Yes | Yes | Canonical workforce identity; single and combined Skill checks pass. |
| Skill | Yes | Yes | Assignees Skill, including combined Assignee; browser checks pass. |
| Client | No | Yes | Shared existing customer mapping, including N/A; browser Client and Team + Client checks pass; capacity unchanged. |
| Account | No | Yes | Jira Account; browser check passes; capacity unchanged. |
| Business Area | No | Yes | Existing Promoter OR Reporter business-area mapping; browser check passes. |
| Promoter | No | Yes | Existing Promoter OR Reporter identity match; browser check passes. |
| Product module | No | Yes | Existing Jira product-module field; browser check passes. |
| Target / planning release | No | Yes | Existing raw Jira Target Release selection is an additional demand restriction; embedded horizon remains authoritative. Browser check passes. |
| Date Range | Embedded horizon | Embedded horizon | The sidebar From/To controls remain active elsewhere. Historical dates do not intersect this panel; browser invariance check passes. |
| Embedded Release / year-end | Yes | Yes | Dynamic governed windows; both browser checks pass; unsupported capacity years explicitly unavailable. |
| Status | No | Where offered | Portfolio-only control; no Demand Status picker exists. No cross-tab propagation introduced. Resolver terminal and paused cases pass calculation tests. |
| Priority | No | Where offered | Portfolio-only control, not present in Demand. Not applicable to this panel's actual UI. |
| Program | No | Where offered | Portfolio-only control, not present in Demand. Not applicable to this panel's actual UI. |
| Account Category | No | No | Portfolio-only Tempo classification, absent in Demand; no invented Jira classification. |
| Week Number | Horizon | Horizon | No independent Demand week picker. Horizon selects source Master Date weeks; no historical-week intersection. |
| Delivery / Release Cycle | Embedded horizon | Embedded horizon | Global Release Cycle control is parked/hidden. Embedded release selector uses Release Cycle boundaries; no global filter reactivation. |
| Fix Version | No | Where offered | No left-rail control exists in the current app; not added by this scoped replacement. |
| Delivery Health | No | Where offered | No left-rail control exists in the current app; not added. |

For unallocated/exception records, Team is intentionally ignored; selected Assignee/Skill and all actual demand-specific filters still apply. Known demand assigned to another Engineering team is excluded by selection, never reclassified as unallocated. Exclusive primary exception buckets avoid double counting; independent flags preserve, for example, both outside-Engineering and undated status.

## Validation and screenshots

- PASS: production data build and JavaScript syntax checks.
- PASS: 15 focused calculation/source checks in `scripts/test_capacity_coverage.cjs`, including eligible child-first/parent-fallback, terminal subtasks, confirmed zero versus missing estimates, overlap governance review, source immutability, negative/zero/missing/overloaded cases, cycles/duplicates, global exclusions, backports, calendar boundaries, aggregate load and source-baseline conservation.
- PASS: 13 existing Python unit tests (`unittest discover -s scripts -p test_*.py`).
- PASS: existing Authoring report regression check.
- PASS: existing Delivery Progress ownership regression, including ADF-2326 under Integration and Nexus contributor isolation.
- PASS: existing Client browser regression; no unexpected errors. It continues to report two already-known Account Distribution rounding/omitted-tile diagnostics.
- PASS: new browser verification across 14 actual filter scenarios, both horizons, date-filter independence, dynamic release choices, unsupported capacity year, source KPI and unrelated Demand markup invariance, four KPI cards, all six teams and Jira identity uniqueness.
- PASS: desktop and 390 px mobile visual inspection; panel width/scroll width both 360 px. No new browser-console errors or page errors.
- **Existing full CDP regression harness does not pass.** Its original invocation crashed the browser; a temporary invocation with `--no-sandbox` ran but failed the obsolete `initial.kpis !== 4` assertion. The unchanged current application already has six fixed source KPIs plus two Delivered Features cards. The harness also expects retired KPI naming. These pre-existing harness assumptions were not changed to manufacture a passing result. No claim of a fully passing legacy suite is made.

Commands: `node scripts/test_capacity_coverage.cjs`; `node scripts/verify_capacity_coverage.cjs` (with bundled Playwright in NODE_PATH); bundled Python `-m unittest discover -s scripts -p test_*.py`; `node scripts/validate_delivery_progress_team_ownership.cjs`; `node scripts/verify_client_customer_filter.cjs` against a local server.

- [Before: original capacity pivot](../../outputs/capacity_assigned_demand/before.png)
- [After: release horizon](../../outputs/capacity_assigned_demand/after-release.png)
- [After: through year-end](../../outputs/capacity_assigned_demand/after-year-end.png)
- [After: mobile](../../outputs/capacity_assigned_demand/after-mobile.png)
- [Machine-readable reconciliation and Jira traces](../../outputs/capacity_assigned_demand/reconciliation.json)
- [Browser validation](../../outputs/capacity_assigned_demand/browser-validation.json)

## Remaining source limitations and operational impact

1. Three Scoring assignees have blank future capacity cells. Their Assignees records contain historical Capacity End Dates, but existing dashboard governance does not authorize converting those missing cells to confirmed zero or introducing an active-employment exclusion here. The panel exposes incomplete capacity rather than claiming a complete portfolio headroom/load result. Resolve the source values or separately govern effective-date eligibility to establish a complete denominator.
2. Weekly Capacity has week numbers but no year field. Only its snapshot year is supported. Cross-year and 2027 capacity remain unavailable; the panel does not recycle 2026 week values.
3. The Jira PI Backlog export is a restricted extract. Hierarchy resolution is deterministic over available records; absent descendants and demand outside the extract cannot be verified. Missing estimates and unscheduled work are not added to assigned totals.
4. No independent Tempo account-customer metadata feed or governed Jira Account→Tempo Account Key mapping exists in the workspace. Existing attribution remains incomplete for unlogged Jira demand; Client N/A retains that demand. No account associations were invented.
5. Requested Status/Priority/Program and several other controls are absent from the Demand rail. They were audited and documented, not added or silently inherited from Portfolio.
6. The pasted request references two supplied design screenshots, but this attachment contains only text. The implemented layout follows the written design requirements and existing dashboard styling; before/after screenshots are provided for review.
7. Legacy full-browser acceptance remains limited by the stale regression harness and its existing Portfolio diagnostics. The new focused checks and current Client/ownership/Python regressions pass; broader legacy-suite repair is outside the requested panel replacement.
