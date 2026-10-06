# Post-Baseline Drift and Governance Risk Analysis

Audit date: 2026-09-03 (Europe/Madrid)  
Validated reference checkpoint: `BASELINE_v0.16_2026-08-26.txt`  
Scope: read-only analysis of current repository state; no build, synchronization, test, browser, validation, or regeneration command was run. The only write made for this task is this requested report.

## 1. Executive Assessment

The current dashboard is **Conditionally trusted**. The five-key exclusion boundary is well specified and has strong implementation-focused test design, and the current payload is internally coherent for many Tempo, capacity, Team, Program, planning, and Bug Triage row-level structures. It is not possible, however, to extend the v0.16 “validated” status to the current application as a whole.

The reasons are evidence-based:

- The v0.16 generated payload was overwritten on 27 August after Tempo, Jira, Weekly Capacity, and Bug Triage source refreshes.
- The exact v0.16 Tempo/Jira/capacity payload cannot be reconstructed from files currently present. The baseline-named `Weekly Capacity_20260805.csv` and its payload are absent.
- `web/app.js` was modified on 28 August, after the current payload was generated. The broad Chrome validation harness was modified 30 minutes later, but no retained PASS output or refreshed verification screenshots prove that this code/payload combination completed the suite.
- Current frontend and payload schemas are statically compatible, but the Bug Triage prior-snapshot metadata is inconsistent with the current source directory and current builder.
- Three current behaviors are clear implementation violations of explicit governance with material output risk: Account attribution, Delivery Health states/thresholds, and Jira Created-Date filtering. Master Date fallback, Work Item counting, and Bug snapshot provenance add further defect risk.
- Two identified conflicts are fundamentally governance-document inconsistencies rather than safely classifiable implementation defects: KPI naming/annual capacity terminology and Original Estimate versus Remaining Demand semantics.
- Release Cycle UI and Version 2.1 forecasting are explicitly parked. Their absence is not treated as a defect.

Nine relevant post-baseline artifacts were identified when the exact baseline file timestamp is used: eight source/runtime/generated/validation changes plus the architecture audit created on 3 September. Temporary Chrome profiles and failed diagnostic logs are evidence of attempted validation activity, not counted as implementation changes.

### Summary classification

| Subject | Result |
|---|---|
| Governance conflicts | 6 true implementation defects; 1 intentional governed exception; 2 documentation inconsistencies; 0 conflicts classified wholly as parked functionality; 1 unresolved. The parked Release Cycle subcase is explicitly excluded from defect status. |
| Parallel logic | 11 output-risk; 2 maintenance-only; 1 harmless defense-in-depth; 0 unresolved. |
| Numerical correctness | Conditional: governed Tempo totals/exclusions are comparatively strong; Account, demand, Work Item, and mixed-grain totals require independent reconciliation. |
| Semantic correctness | Elevated risk: Account, demand, Delivery Health, status, Team, and date meanings differ by surface. |
| Provenance | High risk: no immutable manifest binds source hashes, build code, payload hash, frontend hash, and validation result. |

## 2. v0.16 Baseline Reconstruction

### What v0.16 explicitly validates

Baseline v0.16, written at `2026-08-26T10:03:16Z`, records a focused change: the globally governed exclusion of exactly `TEMPO-54`, `TEMPO-92`, `TEMPO-106`, `TEMPO-111`, and `TEMPO-112`. It states that the exclusion was applied in the production builder and browser ingestion guard, that `web/data.js` was rebuilt, and that Python, JavaScript syntax, headless Chrome, Delivery Progress ownership, Bug Triage, and desktop/mobile validation passed.

Recorded v0.16 numerical state:

| Baseline measure | v0.16 value |
|---|---:|
| Source window | 2026-01-02 through 2026-08-05 |
| Governed managed-Team worklog rows | 23,404 |
| Governed managed-Team Logged Total | 37,571.793 h |
| Billable | 33,573.563 h |
| Logged Engineering | 31,275.948 h |
| Logged Operations | 6,295.845 h |
| Annual workforce capacity | 65,470.000 h |
| Weekly planned capacity | 52,665.000 h |
| Bug Triage current queue | 46 distinct keys |

Recorded source hashes:

- Assignees: `20260307_Assignees_Capacity.csv` → `A081441EDA66E20044FFDBB5FA7F186B89875321C64C5A8C2160CB9B73D3E613`.
- Capacity: `Weekly Capacity_20260805.csv` → `843274DF81B4DA9AACE8AEE8464222A41036B6BB7BB7B8C376E2C2CF9C5D6CAC`.

The baseline does not record Tempo/Jira/Bug/mapping filenames and hashes, the generated `web/data.js` hash, `web/app.js` hash, builder hash, validation-harness hash, or a machine-readable validation result.

### Files attributable to the v0.16 checkpoint

Evidence strength uses **proven**, **strongly attributable**, or **not provable**.

| File/state | Evidence | Attribution |
|---|---|---|
| `BASELINE_v0.16_2026-08-26.txt` | Current hash `F4628F612717E80392C03E351C29D0D7086A0023A106DC97179FFD7CF643F97E`; timestamp 10:03:16Z | Proven baseline record |
| `scripts/governed_exclusions.py` | Timestamp 09:21:04Z, exact set and baseline explicitly names it | Strongly attributable; current hash `F101CBED...E617` but baseline did not record hash |
| `scripts/test_global_tempo_exclusions.py` | Timestamp 09:21:05Z; exactly seven tests matching baseline claim | Strongly attributable; current hash `C7426E...302F` |
| `scripts/build_web_data.py` | Timestamp 09:21:46Z; baseline explicitly identifies production builder behavior | Strongly attributable; current hash `B71F924...B268` |
| `scripts/prepare_dashboard_data.py` | Timestamp 09:21:57Z; baseline says legacy path consumes central exclusions | Strongly attributable; current hash `A729D8E...8741` |
| `scripts/validate_delivery_progress_team_ownership.cjs` | Timestamp 09:22:54Z; matches baseline ownership validation | Strongly attributable; current hash `13FCF6...1F74` |
| Canonical governance documents | All relevant documents except Release Cycle were saved 09:25–09:26Z; baseline says they were updated/reconciled | Strongly attributable; current hashes captured in the architecture audit working evidence |
| `outputs/bi_dashboard/bug_triage_unmapped_assignees.csv` | Timestamp 10:01:16Z; baseline says Bug Triage validation passed | Strong baseline evidence, but generated report has no run manifest |
| `web/verification-desktop.png`, `web/verification-mobile.png` | Timestamps 10:05:53Z and 10:05:54Z, immediately after baseline file | Strong visual evidence for the v0.16 run, although saved after the text checkpoint |
| Assignees CSV | Current hash exactly matches baseline hash and file predates checkpoint | Proven source identity |
| `Bug Triage_20260805.csv` | Predates checkpoint and has 46 distinct keys, matching baseline | Strong inference; baseline omits its filename/hash |
| Tempo operational mapping | Predates checkpoint and has not changed by timestamp | Continuity inference only; no baseline hash/version |
| Master Date and Release Cycle | Predate checkpoint and remain fingerprinted in current sync state | Continuity inference only; baseline does not record hashes |
| `Weekly Capacity_20260805.csv` | Baseline records exact filename/hash, but file is no longer present | Baseline identity proven by record; content unavailable |
| v0.16 Tempo and Jira exports | Baseline records only date window/aggregates | Not provable from current files; current exports are 27-Aug refreshes |
| v0.16 `web/data.js` | Baseline says it was rebuilt; current file was overwritten 27-Aug | Not recoverable/provable; no baseline payload hash |
| v0.16 `web/app.js` | Baseline says syntax/browser validation passed; current file modified 28-Aug | Baseline version not recoverable; no Git history/hash |
| v0.16 Chrome harness | Current harness modified 28-Aug | Baseline version not recoverable; no Git history/hash |

### Baseline validation assets stated as run

The baseline states:

1. Production `web/data.js` build passed.
2. Seven focused Python exclusion tests passed.
3. Python compilation passed for builder, legacy preparation, exclusion authority, and focused tests.
4. JavaScript syntax checks passed for frontend and Chrome harness.
5. Full headless Chrome regression passed across four cards, ten charts, filters, detail tables, reconciliation, ownership, responsive rendering, and CSV.
6. Delivery Progress ownership validation passed, including ADF-2326.
7. Bug Triage validation passed at 46 rows/keys.
8. Desktop/mobile renders passed visual inspection.

This proves the checkpoint claim as a governance record, but not reproducibility: command lines, outputs, exit codes, environment, hashes, and exact source manifest were not retained together.

### Protected baseline boundaries

- The five-key exclusion was the approved implementation change.
- Capacity sources/denominators were stated unchanged by that exclusion.
- Bug Triage remained independent and at 46 keys.
- Version 2.1 forecasting and Release Cycle UI remained parked.

## 3. Post-v0.16 Change Inventory

The exact baseline text timestamp (26-Aug 10:03:16Z) is used because one important file arrived later on the same calendar day. Nine relevant artifacts follow. The first eight can affect or validate runtime state; the ninth is the prior audit report and has no runtime effect.

| # | File | Modified UTC | Classification | Reflected in payload? | Proven validation after change? | Numbers | Filters | Reconciliation | Provenance |
|---:|---|---|---|---|---|---|---|---|---|
| 1 | `data/raw/Weekly Capacity_20260826.csv` | 2026-08-26 13:57:30 | Raw data refresh; Capacity | Yes: payload names it and contains 2,014 rows | No retained PASS tied to this hash | Yes, capacity/utilization | Can affect valid Team domain and capacity results | Yes | Yes; replaces baseline-named 05-Aug source |
| 2 | `data/raw/All Jira Work Items marked PI Backlog (JIRA)_20260827.csv` | 2026-08-27 06:56:03 | Raw refresh; Jira metadata, mappings, hierarchy, estimates | Yes: 1,708 payload rows | No retained PASS tied to hash | Yes | Yes | Yes | Yes |
| 3 | `data/raw/RAW_DATA_FULL_ANALYSIS_01_Jan_26_27_Aug_26.csv` | 2026-08-27 06:59:23 | Raw refresh; Tempo facts | Yes: 26,214 post-exclusion rows | No retained PASS tied to hash | Yes, nearly all historical effort metrics | Yes, facet populations/scope | Yes | Yes |
| 4 | `data/raw/Bug Triage_20260827.csv.csv` | 2026-08-27 07:09:57 | Raw refresh; Bug Triage | Yes: 54 distinct payload rows | No retained PASS; current harness would accept one-snapshot fallback | Bug module only, not KPIs | Bug table Team/Assignee/Skill/explicit Status | Bug snapshot counts | Yes; double extension changes date parsing to mtime fallback |
| 5 | `web/data.js` | 2026-08-27 07:12:44 | Generated data | It is the payload | No immutable run result. Source state was written same second | Yes | Yes | Yes | Central artifact; hash `1071C417...EB1C` |
| 6 | `data/.dashboard_sync_state.json` | 2026-08-27 07:12:44 | Configuration/state; source provenance | Adjacent state matches six payload source filenames | Not applicable as calculation validation | No direct | No direct | No direct | Yes; omits Bug Triage and mapping |
| 7 | `web/app.js` | 2026-08-28 17:15:17 | KPI, filter, Account, Program, hierarchy, Team, Bug rendering, UI | No: runtime code consumes existing payload | Not proven. Current verification screenshots remain 26-Aug; later temp profiles indicate attempts only | Yes | Yes | Yes | Yes; creates code/payload version split |
| 8 | `scripts/verify_bi_app_chrome_cdp.mjs` | 2026-08-28 17:45:28 | Validation | No | It is the validator, not proof of a pass. Diagnostic log at 17:42 records Chrome errors; no PASS log retained | No dashboard output | No | No | Validation provenance only |
| 9 | `docs/audit/CURRENT_ARCHITECTURE_AND_DEPENDENCY_GRAPH.md` | 2026-09-03 10:11:57 | Documentation/audit | No | Read-only analysis evidence | No | No | No | Improves current-state traceability, not build provenance |

No post-baseline timestamp change was found in `build_web_data.py`, `governed_exclusions.py`, `sync_dashboard.ps1`, canonical governance, Assignees, Master Date, Release Cycle, or `tempo_operational_mapping.csv`. Therefore the 27-Aug raw refresh used the same currently observed build and exclusion code, but not the validated baseline source set.

Temporary evidence not counted as repository changes:

- Many Chrome profile directories were created on 28 and 31 August, showing attempted browser executions.
- `cdp_diagnostic_20260828.stderr.log` records access-denied and “Multiple targets are not supported in headless mode” errors.
- Successful current-harness completion is not proven because no PASS output was retained and the verification screenshots were not refreshed after 26 August.

## 4. Governance Conflict Classification

The ten IDs map one-for-one to section 14 of `CURRENT_ARCHITECTURE_AND_DEPENDENCY_GRAPH.md`.

### C-01 — Master Date fallback

- **Implementation:** `scripts/build_web_data.py:apply_master_date_week`.
- **Governance:** Master Date exclusively governs Week Number and workday boundaries; independent ISO logic must never be used.
- **Mismatch:** missing Master Date matches fall back to `dt.isocalendar().week` and computed weekday.
- **Classification:** **True implementation defect**. It is latent for the current source because all current worklog dates were found in Master Date.
- **Impact/severity:** historical behavior; future filter/capacity reconciliation; **Medium**.
- **QA evidence:** fixture with a worklog date outside Master Date and source-to-payload assertion that the build rejects or explicitly quarantines it rather than calculating an ISO week. Pass only if no independent week/workday enters governed output.

### C-02 — KPI naming and capacity terminology

- **Implementation:** `web/app.js:renderKpis` renders Annual Workforce Capacity, Actual Hours, Annual Capacity Remaining, Annual Capacity Utilization.
- **Governance:** `KPI_Definitions.md` calls Actual Hours deprecated and defines Capacity from Weekly Capacity; `Calculation_Governance.md` separately approves the current annual card model and “Actual Hours” label.
- **Mismatch:** canonical documents conflict with each other; implementation follows Calculation Governance rather than KPI Definitions naming/source terminology.
- **Classification:** **Documentation inconsistency**.
- **Impact/severity:** UI/semantic interpretation; possible KPI denominator misunderstanding; **Medium**.
- **QA evidence:** signed governance precedence decision and an approved card catalogue with exact labels, sources, formulas, and filter behavior.

### C-03 — Account attribution source and exceptions

- **Implementation:** `web/app.js:accountDistributionScope`, `governedTempoAccountAggregation`, `accountTreemapRows`, `groupAccounts`, `accountFacetRows`, `downloadSnapshot`.
- **Governance:** Account attribution must use Jira Account, with direct then immediate-parent fallback only when direct key is absent; unresolved engineering effort is reported separately; operational TEMPO work is not an Account tile.
- **Mismatch:** rendered logged values group `row.tempoAccount`; valid TEMPO rows with Tempo Account are eligible; exceptions are always `[]`; Jira estimates are merged into Tempo-account label buckets.
- **Classification:** **True implementation defect**.
- **Impact/severity:** KPI-like chart values, filter, Account table, CSV, reconciliation; **Critical**.
- **QA evidence:** independent worklog-level partition from raw Tempo and Jira into attributed engineering, engineering exceptions by reason, and operations. Pass only if three populations are mutually exclusive/exhaustive, tiles use Jira-resolved Account, exceptions reconcile, and operations never tile.

### C-04 — Original Estimate demand versus Remaining Demand

- **Implementation:** `web/app.js:demandBacklogData`, `renderRemainingDemandChart`; sums `remainingEstimateHours` and labels the visual Remaining Demand vs Logged Effort.
- **Governance:** Calculation Governance defines Demand vs Actual using Original Estimate. Semantic Visualization Governance approves a current Jira Remaining Demand snapshot. Forecasting governance reserves Remaining Estimate for parked Version 2.1 but also describes future planning, not necessarily this current comparison.
- **Mismatch:** the documents define overlapping but inconsistent visual semantics. Current CDP text calls this a “replacement,” suggesting a post-baseline change, but the prior frontend is unavailable.
- **Classification:** **Documentation inconsistency**; not classified as parked forecasting because the visual is currently active and mixes current demand with historical logged effort.
- **Impact/severity:** KPI/chart semantics and reconciliation; **High**.
- **QA evidence:** product/governance decision naming the active visual and selecting Original or Remaining Estimate; raw Jira issue-level reconciliation to the chosen field; confirmation that this is not the parked forecast resolver.

### C-05 — Delivery Health states and thresholds

- **Implementation:** `web/app.js:deliveryDueState`, `DELIVERY_HEALTH_ORDER`, legend.
- **Governance:** Healthy >7 days; At Risk 3–7; Critical 0–2; Overdue; Completed; Blocked. Paused/blocked statuses stop countdown.
- **Mismatch:** runtime emits Due soon for 0–7, never emits At Risk or Critical, maps Blocked/On Hold to Not applicable, and adds No due date/Not applicable states outside the allowed list.
- **Classification:** **True implementation defect**.
- **Impact/severity:** delivery-risk semantic output, sorting, legend; **High**.
- **QA evidence:** boundary fixture for -1, 0, 2, 3, 7, 8 days and every terminal/paused status. Pass only if outputs exactly match the approved state table.

### C-06 — Jira Created-Date filtering

- **Implementation:** `web/app.js:filteredData` backlog branch uses `inDateRange(row.createdDate || raw.meta.dateMin)`; affects Backlog Priority and Accounts estimate/item side.
- **Governance:** Date Range governs Tempo Work Date; Backlog Priority/Jira demand must not acquire a Jira Created Date basis without separate approval; Jira Created must not drive Delivery Progress.
- **Mismatch:** a shared Jira inventory path applies Date Range to Created Date without located approval.
- **Classification:** **True implementation defect**.
- **Impact/severity:** filters, counts, estimates, variance/reconciliation; **High**.
- **QA evidence:** fixed Jira snapshot reconciled under two Date Ranges. Pass only if current-snapshot Jira populations remain stable unless a signed Created-Date rule exists.

### C-07 — Missing and parked global controls

- **Implementation:** `web/index.html`/`web/app.js` have no explicit Week Number, Delivery, Fix Version, or Delivery Health controls; Release Cycle is present but hidden.
- **Governance:** canonical framework includes Week, Delivery, Fix Version; task also calls for Delivery Health analysis. Release Cycle UI and Version 2.1 forecasting are explicitly parked.
- **Mismatch:** Release Cycle absence is governed and not defective. The implementation status of the other absent controls is not recorded as parked or intentionally excluded.
- **Classification:** **Unable to determine**. The Release Cycle subcase is an **intentional parked future function**, but the combined conflict cannot be wholly classified that way.
- **Impact/severity:** filter completeness/semantic scope; **Medium**.
- **QA evidence:** approved MVP filter inventory explicitly marking each control implemented, intentionally absent, or parked. No forecasting implementation should be required to pass.

### C-08 — Work Item identity and totals

- **Implementation:** card `distinctCount(data.worklogs,"key")`; `groupPeople`; `peopleTotalsRow`; `groupAccounts`.
- **Governance:** Work Items canonical source is Jira Issue Key, respects filters/exclusions, and avoids duplicate counting.
- **Mismatch:** card/People use Tempo work item keys, including valid operational keys; People total sums per-person distinct counts so a shared key can count more than once. Account uses filtered Jira keys.
- **Classification:** **True implementation defect** for the total/no-double-count rule; some operational-key inclusion remains semantically ambiguous.
- **Impact/severity:** KPI note/table totals and reconciliation; **Medium**.
- **QA evidence:** item-level expected sets per surface and a shared-key-across-people fixture. Pass only if labels disclose grain and total distinctness matches governance.

### C-09 — Status propagation differences

- **Implementation:** `defaultStatusLabels`, `isStatusFilterActive`, `filteredData`, `loggedEffortData`, `demandBacklogData`.
- **Governance:** Status must not reduce governed logged hours by default; it may filter Jira demand, backlog, delivery metadata, and applicable Bug Triage rows.
- **Mismatch:** the default non-Done selection is active for Jira inventory/demand, intentionally inactive for governed logged effort and activity-based backlog/Bug Triage. Explicit non-default selections activate more paths.
- **Classification:** **Intentional governed exception**, with a UI clarity/filter-consistency risk rather than a formula defect.
- **Impact/severity:** filter behavior and interpretation; **Medium**.
- **QA evidence:** component-by-component status propagation contract and browser tests for default, cleared, all, and explicit selections.

### C-10 — Bug Triage previous snapshot

- **Implementation:** `build_web_data.py:latest_two_csvs`, `bug_triage_snapshot_comparison`; payload metadata/banner.
- **Governance:** latest and immediately prior complete dedicated exports govern distinct-key comparison.
- **Mismatch:** payload correctly contains 54 rows from `Bug Triage_20260827.csv.csv` but says no previous snapshot. Current directory contains `Bug Triage_20260805.csv`; current builder resolves it as prior. Independent set comparison yields previous 46, added 19, removed 11, and reconciles.
- **Classification:** **True implementation defect** in generated snapshot provenance/state.
- **Impact/severity:** Bug informational banner and source traceability, not Tempo KPIs; **High**.
- **QA evidence:** reproduce selection without writing, explain build-time file availability, and reconcile exact distinct-key sets. Pass only if payload names both exact files and reports 54 = 46 + 19 − 11.

### Classification totals

| Classification | Count | IDs |
|---|---:|---|
| True implementation defect | 6 | C-01, C-03, C-05, C-06, C-08, C-10 |
| Intentional governed exception | 1 | C-09 |
| Documentation inconsistency | 2 | C-02, C-04 |
| Parked future functionality (whole conflict) | 0 | Release Cycle portion of C-07 is parked and explicitly not a defect |
| Unable to determine | 1 | C-07 |

## 5. Parallel Logic Risk Analysis

| # | Logic area / locations | Identical or divergent | Runtime path / can both influence output? | Risk | Severity | Consolidation before development? | Class |
|---:|---|---|---|---|---|---|---|
| P-01 | Source selection: Python builder vs PowerShell sync | Similar, separately maintained; both use filename date then mtime | Sync decides whether to invoke build; builder reselects files. Both influence source provenance | Stale/wrong source, especially `.csv.csv` fallback | High | Yes: one selection manifest/implementation | Output-risk |
| P-02 | Exclusions: central Python, metadata-driven browser guard, component guards, test oracle | Current governed set identical; browser derives from payload | Build and browser both influence output; component guards are redundant | Defense against leakage; low drift risk because browser set is generated | Low | No; retain boundary defense, test generated metadata | Harmless |
| P-03 | Assignee canonicalization in Python and browser | Intended identical but separately implemented | Build maps all arrays; browser remaps governed logged rows | Team/Skill mismatch and row inclusion | High | Yes, or generate canonical IDs/results once with invariant tests | Output-risk |
| P-04 | Team/Skill derivation build vs browser | Divergent by path: browser overwrites only governed logged scope | Both affect filters/cards/charts/tables | Team semantic mismatch, divergent totals | High | Yes, while preserving ownership/activity semantics explicitly | Output-risk |
| P-05 | Account facet/table/treemap/export calculations | Divergent and source-mixed | All active runtime paths influence visible output | Divergent KPI/table/CSV and reconciliation | Critical | Yes, after independent Account reconciliation | Output-risk |
| P-06 | Program normalization/build enrichment vs browser parent resolution | Divergent but partly intentional | Build supplies direct normalized value; browser adds parent and chart-specific selection | Filter/chart totals and unmapped population | High | Yes, or define one item-level resolved Program field | Output-risk |
| P-07 | Planning classification build vs browser reinterpretation/aggregation | Build traverses hierarchy; browser reclassifies TEMPO and collapses by key | Both determine chart | Divergent classifications/hours | Medium | Prefer one resolved item-level classification plus display aggregation | Output-risk |
| P-08 | Parent and summary fallback in build, shared helpers, and local Backlog helpers | Repeated and slightly divergent | Build and browser both affect displayed hierarchy | Duplicate/suppressed rows, inconsistent fallback | High | Yes after hierarchy QA | Output-risk |
| P-09 | Delivery ownership in frontend vs standalone validator | Near-copy; validator does not render | Only frontend affects dashboard; validator affects release confidence | Maintenance/stale-test risk; no double count directly | Medium | Recommended, not a release blocker if shared fixtures exist | Maintainability-only |
| P-10 | Capacity/utilization/remaining in cards, Team, People, legacy workbook | Deliberately divergent annual vs weekly, plus legacy semantics | Active web paths all influence different outputs; legacy only if consumed/run | Divergent KPI interpretation/numbers | High | Yes for active formulas/contract; isolate legacy | Output-risk |
| P-11 | Status default and filters across five fact paths | Divergent, partly governed | All active paths influence output | Inconsistent filter behavior, mixed scopes | High | Consolidate propagation policy, not necessarily one dataset | Output-risk |
| P-12 | Master Date/week/release and legacy ISO logic | Divergent | Active build/browser influence current; legacy only manual | Filter/capacity drift, historical behavior | Medium | Remove active fallback only after QA; isolate legacy | Output-risk |
| P-13 | Active web pipeline vs legacy workbook pipeline | Substantially divergent and stale | Legacy does not feed web; both artifacts can be mistaken for authoritative | Maintenance/confusion; stale generated data if legacy rerun | Medium | Isolation/retirement decision recommended, not needed for web correctness | Maintainability-only |
| P-14 | Bug counts in build summary, browser distribution, validator, CDP harness | Different layers; snapshot state currently divergent | Build and browser affect module; validators affect confidence | Stale snapshot metadata and inconsistent counts | High | Yes: one generated comparison dataset with raw-source reconciliation | Output-risk |

Totals: **11 output-risk, 2 maintenance-only, 1 harmless, 0 unresolved**.

“Consolidation required” means a single governed result or contract should exist before extending that area. It does not authorize refactoring before the independent audit establishes expected outputs.

## 6. Payload / Frontend Drift

### Exact dates and hashes

| Artifact | Last modified UTC | SHA-256 |
|---|---|---|
| `scripts/build_web_data.py` | 2026-08-26 09:21:46 | `B71F924647BE430C61939B6469A626CC83ACCBE2608F07F41486A7F3D212B268` |
| `web/data.js` | 2026-08-27 07:12:44 | `1071C417BE95FC625E84FE71BACB6B3BF5B40326B2F163924987A05CE9D3EB1C` |
| `web/app.js` | 2026-08-28 17:15:17 | `4C5BEF6C4A8C80238CF6A4E70FDA675601756477AB1BABA8864C8B6A7C31398E` |
| `verify_bi_app_chrome_cdp.mjs` | 2026-08-28 17:45:28 | `49F153416937E33893DC0048777B5E581933B08FC0E8FB8E846A064A9754F487` |

### Static compatibility

The frontend directly expects `assignees`, `backlog`, `backlogWorklogs`, `bugTriage`, `capacity`, `masterDates`, `meta`, `programs`, `releases`, `skills`, `statuses`, `teams`, and `worklogs`; all are present. Required row fields for the current cards, filters, charts, tables, hierarchy, planning, ownership, and Bug module are present. Optional fallbacks exist for `backlogWorklogs`→`worklogs`, `teams`/`skills`→`assignees`, and exclusion metadata. No current frontend-required top-level field was found missing.

The payload contains fields or structures no longer materially consumed by the current runtime:

- `issueTypes` is generated but `web/app.js` does not read `raw.issueTypes`; the type chart regroups worklogs instead.
- `tempoOperationalMappings` and identical `tempoDescriptions` are used by the browser exclusion pass but have no distinct rendering consumer; one is a duplicate array.
- Several `meta` summaries primarily support diagnostics/validation rather than rendered UI.
- Many source/enrichment fields remain on every worklog row although only detail or validation paths consume them. This increases payload size but is not itself a correctness defect.

### Is code and data from different implementation states mixed?

Yes in version/provenance terms: the frontend postdates the payload by approximately 34 hours. They are schema-compatible, and frontend code routinely calculates output from the older generated facts, so the application can run. What cannot be proven is that the current `app.js` behavior was validated against this exact payload hash. The current harness was updated after the frontend, suggesting intended coverage, but retained artifacts do not prove a completed pass.

### Would regeneration materially change results?

- The six sync-tracked source files still match the 27-Aug state hashes, and the builder predates the payload. Core generated fact arrays would therefore be expected to remain substantially stable.
- The mapping file and Bug files also predate the payload and are unchanged now, but they are not tracked by sync state.
- A current build would, at minimum, be expected to change Bug snapshot metadata: the current builder selects the 05-Aug prior snapshot and calculates 19 added and 11 removed, while the current payload reports none.
- Because that discrepancy has no explained cause, exact reproducibility of the remainder cannot be assumed without an in-memory/output-diff reconciliation.

**Regeneration is not safe as the next action before QA reconciliation.** It would overwrite the only current payload, at least change visible Bug context, and could obscure the evidence needed to explain how the existing state was produced. The safe audit step is to preserve/hash the current payload and generate any candidate only in an isolated comparison location after authorization.

## 7. Bug Triage Provenance

### Available dedicated files

| Role | File | Timestamp UTC | Rows/distinct keys | SHA-256 |
|---|---|---|---:|---|
| Current | `data/raw/Bug Triage_20260827.csv.csv` | 2026-08-27 07:09:57 | 54/54 | `4A39261B306D7F98A84D5D078FBD75A350EC7F4E6FA97A69488A5B035A19B8F7` |
| Previous | `data/raw/Bug Triage_20260805.csv` | 2026-08-05 17:37:16 | 46/46 | `9089EBDB3C706743296157FF183DF1C407E2E3A9BA4C04469F0E8A656D197B6A` |

Current payload rows exactly identify the 27-Aug export by filename, row count, distinct keys, severities (4 Blocker, 13 Critical, 37 Major), and mapped fields. It is not stale relative to the latest available current snapshot.

Selection behavior:

- `latest_two_csvs("Bug Triage_*")` sorts by `parse_export_date` then mtime.
- `Bug Triage_20260805.csv` parses its filename date.
- `Bug Triage_20260827.csv.csv` does not match the expected `_<yyyymmdd>.csv` suffix because of the double extension, so its mtime is used as fallback.
- With current files, the builder selects 27-Aug as current and 05-Aug as prior.

Independent current set comparison:

```text
current 54 = previous 46 + added 19 - removed 11
intersection = 35
```

The payload instead records `hasPreviousSnapshot=false`. Thus current row membership and displayed Jira fields comply with dedicated-source governance, including independence from Tempo and retention of unassigned/unmapped rows. Prior-snapshot comparison does not comply with the current available-source state. The browser harness validates whichever metadata is supplied; when `hasPreviousSnapshot=false`, it only checks the fallback message, so it cannot detect an omitted available prior file.

Bug Triage remains independent from the Tempo five-key exclusion as required. Team is mapped from the Bug export Assignee through Assignees; 28 rows are unassigned and 8 assigned rows are unmapped, all retained with `-` Team at render time.

## 8. Mapping Traceability

### File-backed references

| Mapping/reference | Purpose / downstream consumers | Hash/version recorded? | Can current payload be tied exactly? | Silent drift risk |
|---|---|---|---|---|
| `data/mappings/tempo_operational_mapping.csv` | Key→operational summary; Backlog/Delivery operational rows; duplicate mapping arrays | Current hash `C0AE3FBC...2E9E` measured by audit; not in sync state/payload metadata | Payload names file and embeds 20 post-exclusion rows, but no source hash and raw file has 22 rows | **Yes.** Sync definitions omit it, so edits do not trigger rebuild. |
| `data/raw/20260307_Assignees_Capacity.csv` | canonical Assignee→Team/Skill/Role/Availability; annual capacity; every Team semantic; Bug mapping | Hash recorded in sync state and baseline | Strong: current hash matches both | Low for source drift through sync; code normalization drift still untracked |
| `data/raw/20260307_Master_Date - Master Date PBI.csv` | date→Week Number/workday; capacity week selection | Hash recorded in current sync state, not baseline | Strong for current payload timestamp | Low through sync; fallback logic is code risk |
| `data/raw/Release Cycle.csv` | date interval→Release Cycle; hidden facet | Hash recorded in current sync state | Strong for current payload timestamp | Low through sync; UI intentionally parked |
| Bug Triage current/prior files | queue and snapshot key-set reference | Not in sync state; payload names current only | Current row set strong; prior tie fails | **Yes.** Bug refresh does not participate in `sync_dashboard.ps1` source definitions. |

### Code-backed mappings

| Mapping | Location | Consumers | Version traceability | Drift risk |
|---|---|---|---|---|
| Five-key exclusions/reasons | `governed_exclusions.py` | all governed analytical sources and generated metadata | Baseline names exact values; no code hash in payload/sync | Code edits do not trigger source sync by themselves |
| Program label allow-list | `build_web_data.py:PROGRAM_LABELS` | Jira Program dimension/filter/chart | No mapping version or code hash in payload | Changes require rebuild but are invisible to source sync |
| Planned/Unplanned/`tempo-ticket` rules | builder functions | planning fields/chart | No rule version/hash | Same |
| Delivery state/status lists and thresholds | `web/app.js` | Delivery Progress | Frontend hash not bound to payload | Changes apply immediately without rebuild/sync metadata |
| Bug severity order/colors | `web/app.js` | Bug chart/table | Frontend hash only measured by audit | UI changes outside payload provenance |

Mapping drift can therefore change results without appearing in sync metadata for the operational mapping, Bug snapshots, any code-backed mapping, and frontend-derived mappings. A complete manifest must include these inputs, not just the six sync-tracked CSVs.

## 9. Validation Coverage Gaps

Ratings describe available validation design and current post-baseline evidence. “Strong” does not mean independent source truth unless stated.

| High-risk area | Existing assets | Coverage classification | Gap |
|---|---|---|---|
| Governed Logged Total | exclusion unit test; CDP expected total from loaded payload; baseline aggregate | **Internal-consistency only** for current payload | No independent current raw Tempo→managed scope→render reconciliation tied to hashes |
| Engineering vs Operations | exclusion unit test and CDP/People checks | **Internal-consistency only** | No independent raw key classification and rendered reconciliation for current refresh |
| Five-key exclusions | seven focused tests; payload leakage scan; broad UI/search/CSV checks | **Strong coverage design**, but **partial current-run evidence** | No retained post-refresh/post-frontend PASS artifact |
| Capacity | baseline hashes/values; CDP Team/People/card comparisons | **Partial coverage** | Baseline capacity file differs; no independent current weekly source reconciliation by selected Master Date weeks |
| Team Utilization | CDP chart values/tooltips; People calculations | **Internal-consistency only** | Expected values derive from payload/current logic; denominator scope not independently rebuilt |
| Account attribution | CDP Account table/facet/treemap checks | **Internal-consistency only** | Harness validates Tempo-account implementation, not canonical Jira attribution/exception partition |
| Program Distribution | browser reconciliation logging and CDP checks | **Partial/internal-consistency** | No independent child/parent resolution table or source-to-slice exception evidence |
| Planned vs Unplanned | browser reconciliation logging and CDP checks; older temp analyses | **Partial/internal-consistency** | No current independent key-level label/ancestor oracle tied to Jira hash |
| Demand vs Actual by Team | CDP Remaining Demand tooltips/teams | **Partial/internal-consistency** | Governance field conflict unresolved; no independent Jira issue-level estimate reconciliation |
| Backlog Worked On | broad browser row checks | **Partial coverage** | No independent Tempo-key set reconciliation under every filter and hierarchy case |
| Delivery Progress ownership | dedicated validator, inline browser checks, ADF-2326, CDP | **Strong known-case coverage; partial overall** | Reimplements production logic; no independent full Jira ownership/assignee validity reconciliation |
| Parent/child behavior | CDP detail checks and build metadata | **Partial coverage** | No exhaustive direct/missing-child/parent-active/double-count fixture and raw reconciliation |
| Filters | broad CDP scenarios | **Partial/internal-consistency** | No authoritative component propagation matrix oracle; absent filters and default Status asymmetry not independently approved |
| Bug Triage | validator, CDP table/search/banner checks, build summary | **Partial coverage** | Existing tests accept false no-prior state and do not independently enumerate available snapshots |
| CSV export | CDP blob capture/leakage checks | **Partial coverage** | Only Accounts export; no raw-source reconciliation and no current PASS artifact |
| Generated payload/source traceability | sync state filename/timestamp checks | **No independent coverage** | No full manifest, code hashes, Bug/mapping hashes, payload hash, validation result, or reproducibility comparison |

No existing asset qualifies as a complete independent reconciliation test. The current broad harness is valuable as regression protection, but it predominantly computes expectations from the same payload and semantics it is testing.

## 10. Current Trust Assessment

### Overall classification: Conditionally trusted

The dashboard can be used for controlled investigation only if users understand that Tempo logged totals and the five-key exclusion are the strongest areas, while Account, demand, delivery risk, some filters, Work Item totals, and provenance remain conditional. It should not yet be treated as independently audited executive truth.

| Dimension | Assessment | Evidence |
|---|---|---|
| A. Numerical correctness risk | **Medium–High** | Core generated Tempo rows/exclusions reconcile internally, but Account mixes sources, demand field is disputed, Jira Created filtering changes estimates/counts, and Work Item totals can double count. |
| B. Semantic correctness risk | **High** | Account, demand, Delivery Health, Team, Status, Capacity, Target Release, and Work Item meanings vary by component or conflict with governance. |
| C. Reconciliation risk | **High** | Account exception population is structurally empty; no independent current source-to-render suite; mixed grains/scopes; Bug prior comparison incorrect. |
| D. Source-data limitation | **Medium** | Restricted Jira coverage leaves 4,895 unresolved metadata worklog rows; 716 worklog rows lack governed Team; Bug mapping exceptions are retained as governed. |
| E. Maintainability risk | **High** | Fourteen parallel areas, monolithic frontend, repeated mapping/filter logic, and stale legacy pipeline. |
| F. Provenance/version drift risk | **High** | Baseline payload/source versions missing; current raw/payload/frontend/harness span three states; sync omits Bug/mapping/code; no Git history or immutable manifest. |

This is not classified Low trust or Unreliable because the source ownership model, current payload structure, exclusion implementation, many join paths, and broad regression harness are inspectable and internally coherent. It is not Trusted with minor exceptions because the unresolved areas can materially change charts, filters, tables, and reconciliation.

## 11. Ranked QA Audit Priorities

Fourteen specific independent reconciliations are required. They are ranked by potential decision impact and prerequisite relationships.

| Rank | Area | Authoritative source / governed calculation | Current path | Known risk | Independent evidence required | Pass/fail condition |
|---:|---|---|---|---|---|---|
| 1 | Immutable current and v0.16 provenance | Exact source, mapping, code, payload and validation hashes | baseline text + partial sync state | Cannot reproduce baseline/current pairing | Preserved v0.16 artifacts if available; full current manifest; timestamps/hashes/run output | Pass only if every generated population is tied to exact inputs/code and a validation result |
| 2 | Governed Logged Total + exclusions + Eng/Ops | Tempo Logged Hours after exact five keys and managed Assignees scope; non-TEMPO vs valid TEMPO | builder partition + governed browser rows | Current refresh not independently reconciled | Raw Tempo worklog-ID ledger showing included/excluded/unmanaged/classification and sums | Exact raw-ledger = payload = rendered totals; Eng+Ops=Total; no excluded key anywhere |
| 3 | Account attribution and Account outputs | Tempo hours; Jira Account direct then immediate parent; three exclusive populations | Tempo Account grouping plus Jira estimate merge | Critical source/exception defect | Worklog-level Jira join ledger with resolution reason, Account, hours, and operations partition | Tiles contain only Jira-attributed engineering; exceptions/operations reconcile to Logged Total; table/CSV match |
| 4 | Capacity and Team Utilization | Weekly Capacity Planned Hours; Master Date weeks; Assignees Team | `filteredData.capacity`, Team/People/card formulas | New capacity file postdates baseline; annual/weekly scope differences | Assignee-week reconciliation for full and partial-week ranges plus card/team/person results | Exact sums by person/team/week and documented annual-vs-weekly denominators |
| 5 | Active demand semantic | Jira Original or Remaining Estimate after governance decision | current snapshot sums Remaining Estimate | Conflicting documents/post-baseline replacement | Signed semantic decision and issue-level Jira ledger by Team/status/filter | Rendered bars exactly equal chosen governed field; label and tooltip unambiguous; no forecast implication unless approved |
| 6 | Filter propagation matrix | Source-owned fields under approved per-component exceptions | eight runtime paths | Status, Account, Created Date, Target Release, absent controls | Golden component-by-filter cases with expected included key/worklog sets | Every control changes only approved datasets; default/clear/all behaviors match contract |
| 7 | Delivery Progress ownership and inclusion | Jira owner/Assignee→Assignees Team; Tempo only for activity/last work date | ownership reapplication plus all-contributor validity gate | Correct owner can be removed by unmapped contributor | Full Jira-key ownership ledger with contributor exceptions and filter scenarios | Every eligible key appears once under owner Team; contributor Team never overwrites/removes without governed rule |
| 8 | Delivery Health and due dates | Jira due/status; governed thresholds/states | `deliveryDueState` | Wrong states/thresholds and Blocked mapping | Boundary/status fixture and raw current-item sample | Exact six allowed states and stop rules; sort/legend consistent |
| 9 | Parent/child hierarchy | Preserved Tempo key; direct Jira metadata; allowed immediate-parent fields | build enrichment + browser grouping/suppression | Suppressed active parent, inherited-field mistakes, double count | Key-level cases: child present, child absent, parent present, parent also worked, blank direct Account, cycles | Child key preserved; only permitted fallback; each fact contributes once; no valid active row silently lost |
| 10 | Program Distribution | Tempo hours; Jira normalized child/parent Program; unmapped retained | build normalization + browser parent resolution | Different filter/chart paths and console-only detail | Worklog/key Program resolution ledger with source/depth/reason | Mapped + unmapped = governed total; filter results and slices match ledger |
| 11 | Planned vs Unplanned | Tempo hours; Jira labels through governed hierarchy; Operations separate | recursive build + browser key collapse | First-row metadata, conflicts, unresolved ancestors | Key-level classification oracle with inspected hierarchy and hours | Each governed key classified once; four buckets reconcile exactly |
| 12 | Backlog Worked On | Tempo activity in Date Range; Jira enrichment only | filtered `backlogWorklogs` → group by key | Shared filters/hierarchy and Status asymmetry | Expected distinct active-key set for several filter scenarios | One row per eligible active key; Last Worklog Date exact; missing Jira never removes valid managed activity |
| 13 | Bug Triage provenance and rendering | latest/prior dedicated Jira exports; distinct key comparison; Assignees mapping | build metadata + raw chart/table | Prior snapshot omitted; sync omits Bug files | Exact file-order proof, key-set diff, row/field/mapping comparison | Current=54, prior=46, added=19, removed=11 with exact filenames; all current rows render once |
| 14 | Work Item totals and Accounts CSV | Approved key grain and filtered source sets | card/People/Account sets; Accounts-only export | Per-person double count and mixed Account semantics | Expected unique key sets and exported CSV compared with independently reconciled Account table | Totals use approved distinctness; footer totals and every exported cell equal reconciled table |

These priorities intentionally exclude implementation of forecasting and Release Cycle UI. Future governance should be tested only when that implementation is authorized.

## 12. Unresolved Questions

1. Are archived copies of the v0.16 Tempo/Jira exports, `Weekly Capacity_20260805.csv`, `web/data.js`, `web/app.js`, and Chrome harness available outside this workspace?
2. What exact commands, environment, and outputs produced the v0.16 PASS record?
3. What changed in `web/app.js` on 28 August? No prior version or Git history is available for diffing.
4. Did the current 28-Aug/31-Aug Chrome runs pass? Temp profiles prove attempts, but screenshots and PASS logs do not.
5. Why did the 27-Aug payload omit the already existing 05-Aug Bug Triage prior snapshot when the current builder selects it?
6. Which document has precedence for the active demand chart and for KPI naming/annual-versus-weekly Capacity terminology?
7. Is Tempo Account use an approved post-baseline exception that was never documented, or an implementation defect? Current explicit governance supports the latter classification pending contrary evidence.
8. Are Week Number, Delivery, Fix Version, and Delivery Health controls intentionally excluded from MVP, independently parked, or incomplete?
9. Is the Delivery Progress all-contributor Assignees-validity gate an approved scope rule?
10. Should legacy workbook artifacts remain user-visible as historical evidence, or are consumers still relying on them?

### Completion validation

- No implementation, data, mapping, baseline, generated artifact, or existing documentation file was modified.
- No data or payload was regenerated.
- All 10 previously identified conflicts were individually classified.
- All 14 parallel logic areas were individually analyzed.
- v0.16 was treated as the validated checkpoint, with proof limitations separated from its governance claim.
- Parked forecasting and Release Cycle UI were not classified as defects.
- Payload/frontend drift, Bug Triage provenance, and mapping traceability were explicitly assessed.
