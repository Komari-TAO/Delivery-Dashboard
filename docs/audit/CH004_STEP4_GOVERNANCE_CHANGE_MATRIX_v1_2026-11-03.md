# CH-004 Step 4 — governance change matrix v1

Date: 2026-11-03 (Europe/Madrid). Status: **local proposals pending review; no canonical promotion**.

Reference: `Komari-TAO/Delivery-Dashboard`, branch `feature/initial-dashboard-import`, pinned commit `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a`. [Inventory, scoped approval, consistency review and validation](CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md).

G1 authorizes the Account Distribution semantic contract only. G2/G3 are documentation corrections to existing behavior. Neither these corrections nor this proposal set approve unrelated historical changes. The Data Dictionary v1 is the Step 4 successor to preserved vNext; all seven v1 files form one review set.

| Document | Section | Previous definition / wording | Proposed definition / wording | Approval basis | Calculations change? | Application behavior changes? |
| --- | --- | --- | --- | --- | --- | --- |
| Data Dictionary | §2 | Single placeholder plus Client N/A exception | Distinct Client N/A, treemap -, and legacy Reporting Account blank buckets | G1/G2 | No | No |
| Data Dictionary | §§3–4 / §§22–23 | Account terminology mixes Jira metadata and separate Tempo fields | Four distinct concepts; Tempo Account Key identity / Name display; source ownership retained | G1/G2 | No | No |
| Data Dictionary | §§24–26 / provenance | Step 3 proposal records unapproved visual conflict and prior evidence | Step 4 successor records scoped approval, exact versions and retained snapshot evidence | G1; task provenance requirements | No | No |
| Data Dictionary | §27 | G1–G7 unresolved in Step 3 file | G1 scoped resolved; G2/G3 corrected in candidates; G4–G10 remain qualified | Supplied G1 approval and Step 3.1 dispositions | No | No |
| Business Rules | §5 | Operational exclusion from visual attributed to absent Jira Account | Operational work excluded from tiles by issue key, retained in applicable Total/Operations footers | G1 | No | No |
| Business Rules | §13 | Jira-attributed-only tiles and exception-only footer | Jira diagnostic partition retained; separate Tempo eligible population and three common-scope footers | G1 | No | No |
| Calculation Governance | Global principles / Client attribution | Unresolved Jira Account placed outside treemap; six cards called fixed | Missing Tempo attribution stays visible; current annual/source filter exceptions described | G1/G3 | No | No |
| Calculation Governance | Global Filters / KPI applicability | Unqualified Account and generic global applicability | Client, Tempo Account and Reporting Account separated; consumer-specific scope | G2/G3 | No | No |
| Calculation Governance | Interim / Visualizations → Account Distribution | Jira Account engineering eligibility and exception-only footer | Tempo Client/default or active Account Key grouping, intersection, reset and common footer scope | G1 | No | No |
| Calculation Governance | Account Table | Jira-only Account wording and unresolved work outside treemap | Existing mixed label grouping preserved; Tempo Account does not filter report/export | G1/G2 | No | No |
| KPI Definitions | §7 | Visualization reconciliation interpreted as Jira partition | Unchanged Jira partition formula retained as diagnostics; Tempo visual separately described | G1 | No | No |
| KPI Definitions | §17 | All KPIs inherit all global filters | Applicability by consumer/measure, annual/source exceptions and Status-independent logged effort | G3 | No | No |
| Semantic Visualization | Core / General KPI cards | Uniform global-filter principle and six fixed cards | Consistent dimension values with measure-specific applicability; existing annual contract | G2/G3 | No | No |
| Semantic Visualization | Portfolio / Interaction | General interactions without current Account activation contract | Sidebar Client/Account/Reporting Account, explicit All, reset, tile and keyboard behavior | G1/G2 | No | No |
| Semantic Visualization | Demand Management | Broad fixed-source scope language | Independent Demand Jira Account picker and unchanged Jira-only demand semantics | G2/G3 | No | No |
| Chart Specification | Sidebar | Legacy Account label and broad joined-row Status claim | Tempo Account Key control separate from Reporting Account; governed-effort Status exception | G2/G3 | No | No |
| Chart Specification | Account Distribution | Embedded dropdowns, local-only tile actions and split global/local footer totals | Sidebar-driven intersection/grouping; current tile actions; three common-scope totals | G1/G2 | No | No |
| Chart Specification | Portfolio exact lineage / strict ledger | Old Account label, local selection and dated source rows | Current Account Customer/Key/Name lineage; Reporting Account qualified; unrelated dated lineage retained | G2/G3 | No | No |
| User Guide | Workspace / General KPI cards | Account unqualified and six cards described as fixed | Separate controls and current annual/actual/full-source applicability | G2/G3 | No | No |
| User Guide | Portfolio / Limits | No current sidebar grouping/reset contract | Required six-state behavior table, explicit All nuance, missing buckets and export independence | G1/G2 | No | No |

G4 (no authoritative bridge), G5 (historical manifest/sync-state differences), G6 (negative adjustments), G7 (incomplete approval chronology), G9 (unavailable historical capacity replay) and G10 (incomplete broad historical regression assurance) remain known limitations. G8 is a separate unapproved ISO-week/weekday implementation exception requiring separate remediation; no code remediation occurs here.

Prior definitions are traceable to the exact pinned source versions in the inventory. GitHub and local canonical texts are identical after CRLF/LF normalization, so each proposal's comparison against both baselines has the same semantic diff. No source file, payload, test, canonical document, historical audit or baseline is revised.
