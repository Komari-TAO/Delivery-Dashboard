# CH-005A — Portfolio Account consolidation implementation and validation

Date: 2026-11-03, Europe/Madrid. Scope: approved CH-005A only; CH-005B remains deferred. Approval source: the user's Step 3 attachment at `C:/Users/User/.codex/attachments/accccdd5-2856-45d6-a477-072145b6f202/Pasted text.txt`.

## Result and retirement decision

Portfolio now has one Account picker, alongside Client and Account Category. Reporting Account's sidebar control, selection/search state, chips, event bindings and predicates were removed after the first complete migration browser gate passed. An additional final browser pass verifies the retired state. Legacy label selection survives solely inside the explicit v1 export control and cannot restrict Portfolio consumers.

Demand Management's picker/state, calculations and source files remain independent and unchanged. Authoritative governance, historical baselines and the CH-004 proposal set were not edited. No branch change, reset, rebase, merge, stage, commit or push was performed.

## Repository and before-change protection

Repository: `Komari-TAO/Delivery-Dashboard`; branch `feature/initial-dashboard-import`; HEAD/reference `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a`. The earlier Step 1 direct GitHub reads verified the pinned canonical governance; this phase used that same baseline without changing refs.

`outputs/ch005a/initial-git-status.txt` and `initial-hashes.json` capture the initial worktree and 92 file hashes. Copies of the original runtime, payload and manifest are retained under `outputs/ch005a/before/`. Baseline KPI HTML, all Portfolio chart markup, People/activity/delivery populations, Demand Management markup, CSV output and 77 Account cases were captured before production edits. All nine raw source/mapping hashes matched the initial manifest. Its frontend hash predated local CH-004; this pre-existing stale metadata was recorded, not treated as source identity proof.

86 protected files outside the allowed edit set remain byte-identical, including Demand Management, capacity/annual KPI modules, raw inputs, canonical governance, CH-004 proposals/audits and existing test changes. Historical baseline files remain unchanged against Git.

## Files changed by CH-005A

| File | Change |
|---|---|
| `scripts/build_web_data.py` | Validate and retain source Worklog ID; add Account/export module manifest hashes and scoped lineage note |
| `web/portfolio-accounts.js` | Direct snapshot membership, missing/partial states, issue unions, Account report aggregation and v2 CSV |
| `web/portfolio-legacy-export.js` | Isolated original v1 export populations, schema, rounding and formulas |
| `web/app.js` | Consumer-specific Account predicates, qualified Account details, unlinked reconciliation, exports; retire legacy Portfolio state |
| `web/index.html` | Remove Reporting Account; add explicit legacy export controls, module loading and Account issue evidence |
| `web/styles.css` | Layout for export controls and reconciliation/details |
| `scripts/test_portfolio_accounts.cjs` | Domain, conservation, multi-Account, missingness and export tests |
| `scripts/verify_portfolio_accounts.cjs` | Baseline/browser, per-key, consumer, CH-004, export, Demand and mobile checks |
| `docs/audit/CH005A_EXPORT_CONTRACT_v2.md` | Non-authoritative export implementation contract |
| This audit | Results, gate, evidence and limitations |

Generated `web/data.js` and `web/build-manifest.json` were rebuilt from the same raw inputs. These are ignored local artifacts. Existing CH-004 modifications in `scripts/verify_account_distribution.cjs`, `web/app.js`, `web/index.html`, `web/styles.css`, and existing untracked CH-004 files were preserved as the starting implementation. The old verification script and proposal files remain unchanged by this phase.

## Mappings and consumer rules

- Tempo `Account Key` is trimmed and case-preserved; Name is display only. Client remains validated `Account Customer`; Category remains `Account Category`.
- Worklogs match selected keys directly in the native and enriched projections. Each consumer retains its existing Team, person, Skill, Status, date, Program, release and other filter behavior.
- Jira membership uses direct normalized Issue Key evidence from the complete governed valid-date Tempo snapshot before interactive filters. It includes Worklog ID provenance and flags no-worklog, missing-key, partial and multi-Account evidence. Names and parent Accounts do not establish membership.
- Jira inventory and estimate unions deduplicate Issue Key. Original/Remaining Estimates remain source values. No allocation or new hierarchy suppression is introduced.
- Hours Trend, Team Utilization, Planning, Program, Work Mix, People and activity views consume the migrated worklog scope. Capacity and annual allocations are not Account-filtered.
- Delivery Progress still validates Jira ownership and assignee rules; Account selection only changes its activity input. Backlog Worked On stays activity-based.
- The Remaining Demand chart uses observed issue membership. Its companion displays selected, residual unlinked and other linked populations. No-worklog and missing-key demand are distinct, with source Jira Account retained in issue detail. Unrestricted demand is preserved.
- Account details display keyed actuals and observed linked-issue estimates. Row estimates can overlap; the footer counts each linked issue once. Unsupported comparisons show Unavailable. Search-scoped footer unions were separately verified.
- Capacity versus Known Demand is located in Demand Management. Its calculation and Account behavior remain unchanged; the 42-issue case was checked through its unchanged resolver, not introduced as a new Portfolio horizon.

## Before/after populations

All 77 observed Account identities, including missing key, have an expected worklog-ID and distinct-issue comparison in `population-difference-ledger.json`. `consumer-difference-ledger.json` also records People totals, activity/delivery counts, remaining demand, Planning categories, Program and Work Mix for representative cases.

| Account | Previous governed effort (h) | Keyed effort (h) | Backlog Worked On before → after | Delivery Progress before → after |
|---|---:|---:|---:|---:|
| Unrestricted | 51,806.039 | 51,806.039 | 3,584 → 3,584 | 3,247 → 3,247 |
| ENGINEERIN / Engineering | 1,935.999 | 6,724.166 | 194 → 241 | 185 → 224 |
| HK-DIR / HK-Dir | 11,785.626 | 14,040.609 | 712 → 897 | 610 → 786 |
| TAOSAAS / Tao SaaS | 2,059.134 | 1,554.501 | 147 → 102 | 119 → 79 |
| Missing key versus old blank Jira Account | 15,857.627 | 306.033 | 1,015 → 30 | 982 → 28 |

The changes result from Tempo Key filtering replacing Jira-derived Account-label filtering. The blank comparison deliberately represents different missingness concepts. No Account ownership equivalence is inferred. Capacity remains unchanged in each case. v2 Account details retain missing-key effort that v1's blank Tempo Name aggregation omitted; v1 compatibility preserves that old omission.

## KPI and Jira reconciliation

| Unrestricted measure | Result |
|---|---:|
| Logged Total | 51,806.039 h |
| Operational Tempo | 8,263.271 h |
| Customer/Account effort | 43,542.768 h |
| Gross annual workforce | 67,732 h |
| Annual Development Capacity card | 52,384.8 h |
| Gross annual balance | 15,925.961 h |
| Logged / gross annual hours | 76.486799% |
| Demand Capacity card | 3,802 h |

Unrestricted KPI/chart markup, People, Backlog Worked On and Delivery Progress match the saved baseline. Across both payload projections, removing only the newly added Worklog ID makes every worklog record equal its baseline record. All other datasets, all metric metadata, hierarchy inputs, source estimates, workforce and calendar values are equal to baseline; only the scoped Account lineage note and manifest metadata change.

The raw restricted Jira snapshot still has 674 no-worklog issues, 18 matched issues with all keys missing, and 1,602 with known direct keys. No multi-Account issue is observed; synthetic cases validate it.

In the current unrestricted Portfolio Remaining Demand scope, 1,819 eligible issues contain 308 no-worklog and 17 all-missing-key issues. The Engineering selection shows 120 selected issues / about 1,129.0 h, 325 residual unlinked issues / about 11,267.1 h, and 1,374 other linked issues / about 23,052.1 h. Unrounded values reconcile exactly to the applicable source population; rounding is for display only.

The separate, unchanged year-end capacity resolver reproduces 42 unlogged issues / 2,056 h inside 4,934.2333 h assigned demand for 2026-10-30 through 2026-12-31. This is a snapshot fixture, not a business constant. Source scopes differ; these values must not be substituted for the Portfolio Remaining Demand population.

## Validation and export compatibility

Domain tests cover Worklog IDs, case-sensitive/duplicate names, no-name bridge, direct membership, repeated worklogs, issue unions, partial/missing keys, active-empty/inactive states, unmatched effort, non-additive estimates, unavailable comparisons, CSV grain and the unchanged future-demand case.

Focused browser evidence covers all 77 Account identities; default and selected consumers; all applicable global filter dimensions; Client/Account intersection, explicit All, reset, active-empty, tile/keyboard actions, missing attribution, duplicate names, operations/exclusions; all four detail modes; parsed v2 CSV totals and scope; independent Demand Account/Team/Client behavior; desktop/mobile rendering and no document overflow. The Reporting Account control and hidden `accounts` state are absent. No browser errors were observed.

The final focused suites contain 11 domain checks and 33 browser scenarios, with 77 exhaustive Account identity cases. Unsupported comparison checks also require complete source Worklog ID coverage, preventing partial date/person/Team activity from being compared with a whole-issue estimate.

Legacy CSV compatibility: 84 label/unrestricted cases plus 13 additional global-filter cases, including all four Programs, match original bytes. v1 remains available; v2 is explicitly versioned. Snapshot issue estimates and worklog actuals occupy different record types and cannot fan out. See the export contract for scope boundaries and schema.

Relevant existing suites passed: capacity coverage (15 checks), annual workforce KPIs, Hours Trend/Master Date capacity, Delivery Progress ownership, global exclusions (7 tests), Tempo customer attribution (6), capacity sources (6), and release-cycle boundaries (1). `git diff --check` passed.

Existing limitations remain: historical capacity replay is skipped because the required prior source exports are unavailable; existing Jira date-parser warnings remain; Status category mapping and ISO-week fallback were not repaired; no effective-dated Account/customer master or authoritative Jira Account bridge exists; CH-004 negative/nonpositive adjustment limitations are unchanged. Old CH-004 test assertions that Tempo Account must not affect other reporting/export populations describe the superseded scope; the preserved script is not claimed as a CH-005A regression suite.

## Evidence and Git status

Local evidence directory: `outputs/ch005a/`. It includes initial hashes/status, frozen before runtime, before results and CSV cases, source checks, semantic conservation, per-Account and per-consumer ledgers, browser validation, Demand comparisons, legacy comparisons, v2 CSV samples, scoped-footer review and desktop/mobile/component screenshots. The directory is ignored because it contains local source/derived data.

Final Git status is captured in `outputs/ch005a/final-git-status.txt`. It includes this phase's changes and the preserved pre-existing CH-004 work. No staging, commits or remote writes occurred.
