# CH-005A Governance Revalidation Addendum v1

Date: 2026-11-04, Europe/Madrid. Result: **PASS for the corrected seven-document proposal set; eligible for controlled canonical promotion subject to a separate promotion instruction. No promotion performed.**

This new addendum follows the user's final review and correction request. It supplements, without overwriting, [the original validation](CH005A_GOVERNANCE_VALIDATION_v1.md) and [change matrix](CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md). Version history: original audit v1 → read-only final review identifying A/B → this correction/revalidation addendum v1. Data Dictionary v1 remains historical; v2 is its corrected successor. No other proposal is superseded.

## Corrections and source evidence

- **A:** [Dictionary v2](../governance/Data_Dictionary_CH005A_v2.md), §22.2 now says payload **category** is sourced from Tempo **Account Category**. The previous unsupported accountCategory mapping is absent. [Builder line 576](../../scripts/build_web_data.py) implements category: text(worklogs, Account Category). Account Key/Name and Tempo Worklog ID mappings at lines 562–576 remain unchanged.
- **B:** §22.3 now states: “Modern Portfolio Account selection uses Tempo Account Key as its identifier. Other filters, including Client and Status, may continue using their existing label-based selection values.” [app.js](../../web/app.js), inSelectedClient (285–286) uses state.clients.has(clientValue(row)); inSelectedStatus (289–290) uses state.statuses.has(value). [portfolio-accounts.js](../../web/portfolio-accounts.js), lines 3–5 and 28–36, uses trimmed case-preserved Key identity and observed issue membership for Account.
- v2 adds predecessor/version-history and this addendum's exception-acceptance provenance. Reversing A/B in the v2 body from Purpose onward reproduces the v1 body exactly. Formula blocks are unchanged. No builder, payload or filter implementation was edited.

## Revalidation

Reviewed the corrected dictionary, all six previously passing proposals, original matrix/validation, approved implementation audit/export contract and source predicates above. Pinned governance reference remains Komari-TAO/Delivery-Dashboard, commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; all seven canonical texts were verified against that reference during the preceding final review and remain byte-identical here. Existing implementation/browser results are prior acceptance evidence, not rerun tests. No output-producing tests or payload rebuild ran in this task.

| # | Check | Result | Evidence / finding |
| --- | --- | --- | --- |
| 1 | Exact Tempo field mapping | PASS | Tempo Account Category maps to payload category; Tempo Account Key → tempoAccountKey, Account Name → tempoAccount; source Tempo Worklog ID → worklogId unchanged. |
| 2 | Client / Account / Category semantics | PASS | Client is verified Account Customer; Account identity is trimmed, case-preserved Key, Name is display; Category is a Tempo attribute. Client and Status retain existing label values. |
| 3 | Jira Account | PASS | Custom field (Account) remains Jira metadata, diagnostics and independent planning; no ownership crosswalk inferred. |
| 4 | Single Portfolio Account control | PASS | Modern Account selection uses Key; Reporting Account control/state/predicates removed. Legacy labels are export-only. |
| 5 | Independent Demand Management | PASS | Existing Jira Account picker, hierarchy/horizon and planning state unchanged; CH-005B deferred. |
| 6 | Issue-grain estimates | PASS | Original/Remaining Estimates retain Jira issue grain; selected union deduplicates Issue Key, Account row estimates can overlap and are non-additive. |
| 7 | Worklog-grain effort | PASS | Actual effort uses direct Key on eligible unique source worklogs; no joining/summing issue estimates across expanded worklogs. |
| 8 | CH-004 treemap | PASS | Default Client, active Client/Account gives Account grouping; explicit All differs from inactive, active-empty matches none, clear/reset/intersection/missing buckets retained. Operational effort outside tiles, three footers share scope; positive-bucket limitation retained. |
| 9 | Linked / unlinked demand | PASS | Selected, residual unlinked and other linked populations remain disjoint. No logs versus missing keys, partial and multiple evidence explicit; no invented Account ownership or allocation. |
| 10 | v1 / v2 exports | PASS | v2 separates effort/issue records and snapshot Created-date versus planning snapshot scope. v1 retained with original label semantics; modern Key does not filter v1. External v2 acceptance pending. |
| 11 | Formulas and unaffected definitions | PASS | Dictionary body differs only in corrections A/B; all inherited formula blocks retained. Six previously passing proposals unchanged byte-for-byte; no KPI, capacity, Team, hierarchy, Master Date or other business-rule change. |

## Exact eligible proposal inventory

These seven documents are the complete current promotion-candidate set; every row passes the corrected governance consistency review.

| Proposal | Result |
| --- | --- |
| [docs/governance/Data_Dictionary_CH005A_v2.md](../governance/Data_Dictionary_CH005A_v2.md) | PASS |
| [docs/governance/MVP_Business_Rules_CH005A_v1.md](../governance/MVP_Business_Rules_CH005A_v1.md) | PASS |
| [docs/governance/Calculation_Governance_CH005A_v1.md](../governance/Calculation_Governance_CH005A_v1.md) | PASS |
| [docs/governance/KPI_Definitions_CH005A_v1.md](../governance/KPI_Definitions_CH005A_v1.md) | PASS |
| [docs/governance/Semantic_Visualization_Governance_CH005A_v1.md](../governance/Semantic_Visualization_Governance_CH005A_v1.md) | PASS |
| [docs/user-guides/Chart_and_Visual_Specification_CH005A_v1.md](../user-guides/Chart_and_Visual_Specification_CH005A_v1.md) | PASS |
| [docs/user-guides/User_Guide_CH005A_v1.md](../user-guides/User_Guide_CH005A_v1.md) | PASS |

The six unchanged v1 documents still contain historical sibling references to Dictionary v1. For the controlled promotion inventory, this addendum explicitly selects **Dictionary v2**. Those references do not make v1's two erroneous statements authoritative. A future authorized promotion should update destination cross-links/status metadata consistently; this correction task does not edit the preserved six proposals or canonical files. Dictionary v1 is excluded from the eligible set.

## Accepted unresolved exceptions

The user's current Delivery Management instruction explicitly accepts carrying these unresolved exceptions for CH-005A alignment: Bug Severity Date Range versus Jira Created-date behavior; retained Original Estimate versus active Remaining Estimate distinction; incomplete historical capacity replay; existing Master Date fallback; existing Jira Status category mapping defect; pending external v2 export acceptance. This is acceptance of continued documented exception status, not approval of an alternate business rule, a claim of resolution or authorization to change code.

Bug Severity still receives Created-date-filtered Jira rows, despite the retained exemption expectation. The active demand chart still uses Remaining Estimate; the retained Original-Estimate comparison contract is distinct. Neither conflict is resolved here. All original ten conditions remain in the dictionary and six proposals, including v1 compatibility, Jira Account data-quality issues, activity not contractual ownership, unavailable effective-dated master/crosswalk, negative-adjustment treemap limitations and deferred CH-005B. v1 retirement and external v2 acceptance require separate downstream approval. Canonical promotion requires an explicit subsequent instruction.

## Protected-file preservation and Git

Protected before correction: **160 existing files**, including all seven canonicals, all CH-004/CH-005A versions and audits, production code/tests, raw inputs, generated payload/manifest, acceptance evidence and historical root baselines. SHA-256 comparison after creation: **160/160 unchanged, zero missing or changed**. Only the two new paths in this task were written. The ordered path/hash inventory digest is 04ae8cb781fa70b91a859b71dce126f6841395fdd2413efd98cf842830ded5e0 (UTF-8 records path + tab + lowercase SHA-256 + LF, sorted by JavaScript localeCompare on paths); this identifies the preservation inventory. Dictionary v1 SHA-256 remains ce9d4a5b6366ad0cdea693c0156dce2a46afdc75e8445cec4adb1c261f8eca57.

Branch remains feature/initial-dashboard-import; HEAD remains 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a. Existing dirty work is preserved. No staging, commit, push, merge, reset, rebase, canonical promotion or GitHub-baseline write occurred.

Initial status:

```text
 M scripts/build_web_data.py
 M scripts/verify_account_distribution.cjs
 M web/app.js
 M web/index.html
 M web/styles.css
?? docs/audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md
?? docs/audit/CH004_STEP4_GOVERNANCE_CHANGE_MATRIX_v1_2026-11-03.md
?? docs/audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md
?? docs/audit/CH005A_EXPORT_CONTRACT_v2.md
?? docs/audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md
?? docs/audit/CH005A_GOVERNANCE_VALIDATION_v1.md
?? docs/audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md
?? docs/governance/Calculation_Governance_CH004_v1.md
?? docs/governance/Calculation_Governance_CH005A_v1.md
?? docs/governance/Data_Dictionary_CH004_v1.md
?? docs/governance/Data_Dictionary_CH004_vNext.md
?? docs/governance/Data_Dictionary_CH005A_v1.md
?? docs/governance/KPI_Definitions_CH004_v1.md
?? docs/governance/KPI_Definitions_CH005A_v1.md
?? docs/governance/MVP_Business_Rules_CH004_v1.md
?? docs/governance/MVP_Business_Rules_CH005A_v1.md
?? docs/governance/Semantic_Visualization_Governance_CH004_v1.md
?? docs/governance/Semantic_Visualization_Governance_CH005A_v1.md
?? docs/user-guides/Chart_and_Visual_Specification_CH004_v1.md
?? docs/user-guides/Chart_and_Visual_Specification_CH005A_v1.md
?? docs/user-guides/User_Guide_CH004_v1.md
?? docs/user-guides/User_Guide_CH005A_v1.md
?? scripts/test_portfolio_accounts.cjs
?? scripts/verify_portfolio_accounts.cjs
?? scripts/verify_tempo_account_filters.cjs
?? web/portfolio-accounts.js
?? web/portfolio-legacy-export.js
```

Final status (sorted, verified after creation; exactly two additional untracked files):

```text
 M scripts/build_web_data.py
 M scripts/verify_account_distribution.cjs
 M web/app.js
 M web/index.html
 M web/styles.css
?? docs/audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md
?? docs/audit/CH004_STEP4_GOVERNANCE_CHANGE_MATRIX_v1_2026-11-03.md
?? docs/audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md
?? docs/audit/CH005A_EXPORT_CONTRACT_v2.md
?? docs/audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md
?? docs/audit/CH005A_GOVERNANCE_REVALIDATION_ADDENDUM_v1.md
?? docs/audit/CH005A_GOVERNANCE_VALIDATION_v1.md
?? docs/audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md
?? docs/governance/Calculation_Governance_CH004_v1.md
?? docs/governance/Calculation_Governance_CH005A_v1.md
?? docs/governance/Data_Dictionary_CH004_v1.md
?? docs/governance/Data_Dictionary_CH004_vNext.md
?? docs/governance/Data_Dictionary_CH005A_v1.md
?? docs/governance/Data_Dictionary_CH005A_v2.md
?? docs/governance/KPI_Definitions_CH004_v1.md
?? docs/governance/KPI_Definitions_CH005A_v1.md
?? docs/governance/MVP_Business_Rules_CH004_v1.md
?? docs/governance/MVP_Business_Rules_CH005A_v1.md
?? docs/governance/Semantic_Visualization_Governance_CH004_v1.md
?? docs/governance/Semantic_Visualization_Governance_CH005A_v1.md
?? docs/user-guides/Chart_and_Visual_Specification_CH004_v1.md
?? docs/user-guides/Chart_and_Visual_Specification_CH005A_v1.md
?? docs/user-guides/User_Guide_CH004_v1.md
?? docs/user-guides/User_Guide_CH005A_v1.md
?? scripts/test_portfolio_accounts.cjs
?? scripts/verify_portfolio_accounts.cjs
?? scripts/verify_tempo_account_filters.cjs
?? web/portfolio-accounts.js
?? web/portfolio-legacy-export.js
```
