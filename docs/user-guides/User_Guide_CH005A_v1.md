# Delivery Management Dashboard User Guide — CH-005A v1

> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only.

## Revision provenance and version history

Previous proposal: [User_Guide_CH004_v1.md](User_Guide_CH004_v1.md), preserved unchanged. Canonical comparison document: [User_Guide.md](User_Guide.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/user-guides/User_Guide.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob 509da0db5928246d6845a4a792ec82a615942b3d. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work.

| Version | Date / status |
| --- | --- |
| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |
| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |
| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |

## CH-005A decision and evidence boundary

This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.

Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision.

## Purpose

The dashboard combines historical Tempo effort, Jira delivery demand, workforce capacity, and governed organizational dimensions. It supports delivery visibility and known demand management; it is not a forecasting tool and does not replace Jira or Tempo.

For the authoritative field-level rules, calculations, joins, and data-quality behavior, use [Chart and Visual Specification](./Chart_and_Visual_Specification_CH005A_v1.md). This guide focuses on how to use the workspace.

## Workspace layout

- **General KPI cards** stay visible above the tabs. Applicability depends on the measure: annual roster scope, filtered actual effort, and full-source capacity/demand are distinct. See below.
- **Portfolio** is the delivery-effort workspace: historical Tempo activity, Jira context, capacity, charts, and operational details. Its sidebar offers **Client**, **Account** and **Account Category**. Reporting Account has been removed; legacy label choices are available only with the explicit v1 export.
- **Demand Management** combines current actual effort, known future demand, capacity, planning position, and Epic Workflow. It is demand visibility, not a forecast.
- **Datasources** displays source freshness, data-quality status, relationships, and the exact rules used by the dashboard.

## General KPI cards

| KPI | Existing meaning and filter scope |
| --- | --- |
| Annual Gross Workforce Hours | Supplied Development + Engineering annual allocation once per canonical Assignee ID; Team/Assignee/Skill and compatible year govern scope. |
| Annual Development Capacity | Existing full-source Weekly Capacity Planned Hours; blank contributes zero. Planned Support is shown separately and is already deducted from Development. |
| Actual Hours | Governed six-team Tempo effort for the compatible roster, reporting year, selected dates and applicable effort filters; Status-independent. |
| Gross Annual Hours Balance | Annual gross allocation minus the same governed actual-effort numerator. Annual amounts are not prorated by partial effort/date selections. |
| Logged Hours / Gross Annual Hours | Same governed actual-effort numerator divided by compatible annual gross allocation; gross consumption, not net utilization. |
| Demand Capacity | Existing fixed full-source Jira Effort CAP sum. |

Account selection now filters approved Portfolio logged-effort measures using Tempo Account Key, including Actual Hours and the gross balance/ratio numerator. Client keeps its supported scope. Neither selection divides workforce capacity among Accounts. Gross measures remain before absences, preserve source joiner/leaver adjustments and compatible-year checks, and are unavailable for unsupported/mixed-year scope or missing/ambiguous annual data. These descriptions restate the existing Portfolio card contract and change no formula.

## Portfolio

Use Portfolio to understand actual delivery work and current operational context.

1. Set the **Date Range** for Tempo activity.
2. Use the searchable multi-select sidebar controls. **Client** is verified Tempo Account Customer. **Account** identifies Tempo Accounts by Account Key, displaying Name (Key). **Account Category** comes from Tempo. Jira Account remains ticket metadata and is used independently in Demand Management. Team, Assignee, Skill, Priority, Status, Target Release and Program retain their supported scope. Release Cycle functionality remains parked/hidden; no new interaction is introduced.
3. Review charts for time trend, planning discipline, program, bug severity, account distribution, utilization, remaining demand, priority, engineering work mix, and work-item types.
4. Use **Accounts**, **People**, **Backlog**, and **Delivery Progress** details for follow-up. Tables support sorting, grouping, and Jira/Tempo links where an authoritative identifier is available.

**Bug Severity Distribution** counts distinct Jira PI Backlog work items where Issue Type is Bug and severity is Blocker, Critical, or Major. It follows the active Portfolio filters.

### Account Distribution

| Sidebar state | Account Distribution |
| --- | --- |
| No active Client or Tempo Account selection | Distribution by Client |
| Client selected | Associated Account distribution |
| Tempo Account selected | Selected Account distribution |
| Explicit All Accounts | All eligible Account distribution |
| Client and Account active | Intersected Account distribution |
| Both reset | Default Client distribution |

Explicit **Select All** stores the currently rendered Account options and activates Account grouping. It differs from inactive **All accounts**. Search or other applicable scope can limit those options; it is not a wildcard for future Accounts. Explicit All Clients also activates Account grouping when options exist. Clear All Accounts deactivates Account selection; Client grouping returns only when Client is also cleared. Client and Account selections intersect; a selection outside the current scope does not widen it.

Use Account checkboxes to choose one or more keys. Clicking a Client tile sets that sidebar Client; clicking an Account tile selects its key or clears the Account selection if already selected. Keyboard Enter/Space performs the same action. Clear both Client and Account, or use Reset, to return to default Client distribution.

Tiles show nonoperational Tempo effort, including `-` missing-attribution buckets; the Client picker uses `N/A` for unresolved attribution. The footer shows Total logged hours, Operational Tempo hours and Customer/account effort for the same applicable Client/Account scope. Operational effort stays out of tiles and within applicable footer totals. Status does not filter this treemap. Other supported filters retain their existing effect.

### Using Account selections

Account names help you read the picker; the trimmed, case-preserved Key identifies the Account. Equal names with different keys remain separate. With Account inactive, reports are unrestricted by Account. Explicit Select All saves the currently shown options and activates the selection; a search or current scope may limit those options. It will not automatically include keys added later. An active selection containing no keys shows no matching worklogs or issues. Clear Account returns to unrestricted; an active Client still keeps Account grouping. Keys that disappear after refresh remain selected and available to clear, without broadening the current Client intersection. The missing-key option retains logs whose Account Key is missing, even if a name is present. It does not select tickets with no worklogs.

The Account choice applies to approved effort charts and logged-effort details: Hours Trend, Team Utilization, Planned/Unplanned, Program Distribution, Engineering Work Mix, People, Backlog Worked On and Delivery Progress activity. Their existing eligibility and calculation rules still apply. Capacity remains based on workforce and calendar sources, so selecting an Account does not show capacity dedicated to it.

### Linked and unlinked Jira demand

For Jira counts and estimates, an issue is linked only through direct matching Jira Issue Key and Tempo Work Item Key activity in the complete governed source snapshot, before your interactive filters. Account names, parents, Client and Category do not create a link. Observed activity is evidence of work, not contractual ownership. Jira Account metadata is retained for investigation.

The reconciliation panel separates selected Account demand, residual unlinked demand and other linked issues. Unlinked means no eligible worklogs or only worklogs missing Account Keys; those two causes are shown separately. Partial attribution and multiple observed Accounts are also disclosed. Partial evidence can include multiple known keys. A missing-key choice may select an issue with missing-key logs; that issue is then excluded from residual unlinked totals. With Account unrestricted, the overall selected issue population includes all eligible issues, while attribution diagnostics still identify gaps.

A multi-Account issue contributes its estimate once to the selected Account union. Separate Account estimate rows may overlap and must not be added together. No estimate is split among Accounts, and unlinked demand is never assigned by guessing a Tempo Account. It is not included in treemap tiles or footer hours.

### Reading Account details

Actual hours come from Tempo by Account Key. Original and Remaining Estimates come from Jira, once per issue, and are labelled observed linked-issue estimates. They are not Account budgets. Account details retain their existing Jira Created-date and Status scope; the Remaining Demand panel uses the current Jira snapshot independently of Created date. The two populations can differ. Logged effort uses selected work dates and keeps its existing Status exception. Account Category filters worklogs, not Jira estimates.

A variance or percentage is available only for a complete, single-Account comparison with the same issues, valid Original Estimates and all their observed source worklogs included. A date, person or Team selection can leave only partial activity and make the comparison unavailable. The explanation accompanies Unavailable. A zero estimate makes the percentage unavailable. Union variance/percentage remain unavailable. The footer deduplicates linked issues across visible Account rows.

Account-filtered results may differ from older Reporting Account reports because the old reports mixed Jira Account labels and Tempo names, while current reports use Tempo keys and observed activity. The underlying effort and estimate arithmetic is unchanged. Historical equivalence has not been established.

### Choosing an export

Use the primary snapshot v2 action for Account-detail scope, or the reconciliation panel's planning v2 action for Remaining Demand snapshot scope. Both are explicitly versioned and keep Account effort rows separate from Jira issue rows. Jira estimates occur once per issue across selected/unlinked/other populations; do not expand them onto worklog rows and sum them. Missing source estimates stay blank. Files include selection/source context and ignore table text search and displayed-row limits.

Use Legacy CSV (v1) for consumers that still need the original six columns and original rounding/formulas. Its optional Jira Account / Tempo Account Name labels are export-only, independent of modern Account selection. Modern Account Key selection does not filter v1. v1 remains required pending downstream approval; external acceptance of v2 has not been established.

## Demand Management

Use Demand Management to inspect known delivery demand and its workflow position.

- The filter rail follows the same multi-select pattern as Portfolio, but its Account picker remains independently selected Jira Account metadata. Portfolio Account Key choices do not synchronize with it. Consolidation is deferred to CH-005B.
- **Client** = Tempo Customer Account (`Account Customer`), validated through Tempo Account Key. Jira demand requires complete direct work-item evidence for exactly one customer; missing, incomplete, or ambiguous attribution appears as `N/A`. Jira Client, Tempo Account Name, and Jira Account never supply a fallback. Capacity and the fixed source KPI cards retain their existing filter scope.
- **Business Area** is mapped from the Jira Promoter or Reporter to `Promoters.csv`; the relationship is an OR match and blanks/unmatched values appear as `Other/Blank`.
- **Target / Planning Release** comes directly from the Jira Target Release field.
- **Delivered Features (%)** is DONE feature count divided by the defined in-delivery feature count, multiplied by 100. **Delivered Features difference** is DONE feature count minus that in-delivery count. Both are full-source values and do not respond to Demand filters.
- **Epic Workflow** uses Jira Epic, Epic Lab, and Epic Release rows. A workflow card can show direct Tempo hours only where the Epic key directly matches a Tempo work-item key; it does not roll up descendant tickets.
- **Capacity versus Known Assigned Demand** compares the six Engineering teams. Choose **Release** and a governed release, or **Through year-end**. The displayed reporting date and horizon control this panel independently of the sidebar Date Range. Team, Assignee and Skill filter capacity and demand; customer and Jira metadata filters affect demand only. Demand uses eligible open child Remaining Estimates first, including confirmed zero; use the parent's own estimate only when no eligible child has a valid estimate. Completed subtasks do not suppress the parent. Expand **Parent/child estimation overlaps** for governance-review records with original parent and child estimates and Jira links; review records add no demand hours. Grey bars show capacity, blue shows assigned demand up to capacity, and red shows excess. A missing capacity value makes the affected gap and load unavailable (`-`); the known capacity subtotal is not a complete total. Expand exception and assigned-demand sections for Jira-key detail. Unallocated demand remains visible across Team selections and is never added to team gaps or load.

## Datasources and data quality

Use the Datasources tab before interpreting an unexpected total.

- Check **Last synchronized**, source row counts, and empty-source warnings.
- Open **Data relationships and joins** to see the source keys, relationship coverage, fallbacks, and whether a measure uses a direct relationship or a non-attributed boundary.
- Open the tab-specific sections for the precise fields and calculations behind each filter, KPI, chart, and table.

## Refreshing data

1. Place supported CSV exports in `data/raw/`.
2. Run `python scripts/build_web_data.py` from the repository root.
3. Reload the local dashboard.

The builder selects the latest matching export according to the documented file patterns. Generated payload files remain local because they can contain operational data.

## Limits and good practice

- Treat missing mappings as a data-quality signal, not as a zero value.
- Use Jira for ticket-level workflow actions and Tempo for time-entry investigation.
- Do not infer an Epic's total descendant effort from the direct Epic-hour value.
- Use `Other/Blank`, unmapped records, and data-quality exceptions as prompts to correct source data or mappings.
- Refer to the Chart and Visual Specification instead of copying calculations into offline reports.
- Grouping alone preserves eligible Account Distribution worklogs; Client or Account filters can narrow them and their footer totals. The 51,806.039 h Total / 8,263.271 h Operational / 43,542.768 h Customer/Account values are a validated snapshot, not permanent targets.
- Do not infer Jira ownership, full customer demand, or allocated customer capacity from Tempo Account names. Missing attribution stays explicit. Negative/nonpositive aggregate-hour reconciliation and broad historical replay/regression assurance remain limited; see the Step 4 governance validation report.


## Conditional acceptance and known limits

CH-005A is conditionally accepted for the validated current-source Portfolio scope. These conditions remain:

1. Historical capacity and reporting replay are incomplete because prior exports are unavailable.
2. External consumer acceptance of v2 exports has not been established.
3. Legacy v1 remains available pending downstream approval.
4. Jira Status category mapping has an unresolved defect.
5. The builder still has an ISO-week/weekday fallback that conflicts with exclusive Master Date governance; this is an implementation exception, not an approved calendar rule.
6. Epic-child Jira Account mismatches and missing Jira Account values remain data-quality issues.
7. Observed Tempo Account membership does not prove contractual ownership.
8. Effective-dated Account/customer history and an authoritative Jira/Tempo ownership crosswalk are unavailable.
9. Treemap reconciliation with negative adjustments remains unvalidated.
10. CH-005B remains deferred; Demand Management keeps its existing independent Account and planning rules.

The validated October 30, 2026 treemap snapshot is Total Logged 51,806.039 h, Operational Tempo 8,263.271 h and Customer/Account 43,542.768 h. These are historical observations, not permanent values. Separately, the October 30–December 31 capacity planning reference recorded 4,934.2333 h assigned demand, 42 unlogged issues and 2,056 h unlogged demand. That reference uses the independent Demand Management resolver, is not Portfolio Remaining Demand and does not assign those hours to Tempo Accounts.

The chart specification also records a pre-existing Bug Severity date-rule contradiction and an Original-versus-Remaining visual-definition inconsistency. This documentation does not resolve or approve either discrepancy. Earlier CH-004 manifest/sync-state and chronology observations remain dated evidence; newer matching CH-005A manifest hashes do not repair historical records or establish historical acceptance.

See the [governance validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) for checks and unresolved conflicts, and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) for file details.
