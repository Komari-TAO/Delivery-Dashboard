# Calculation Governance — CH-005A v1

> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only.

## Revision provenance and version history

Previous proposal: [Calculation_Governance_CH004_v1.md](Calculation_Governance_CH004_v1.md), preserved unchanged. Canonical comparison document: [Calculation_Governance.md](Calculation_Governance.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/Calculation_Governance.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob 1779af38f4d7caa2b72be1356f83281abc4fe9ac. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work.

| Version | Date / status |
| --- | --- |
| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |
| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |
| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |

## CH-005A decision and evidence boundary

This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.

Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision.

## Purpose

This document defines the governed calculation semantics for dashboard KPIs, visualizations, and detail tables in the AI-Assisted Delivery Management Platform.

It is the reference for validating future implementation changes against business meaning, source ownership, filter behavior, aggregation level, date basis, exclusions, and reconciliation expectations.

Authoritative references:

- `docs/MVP_Business_Rules_CH005A_v1.md`
- `docs/KPI_Definitions_CH005A_v1.md`
- `docs/Data_Dictionary_CH005A_v1.md`
- `docs/Semantic_Visualization_Governance_CH005A_v1.md`

## Global Calculation Principles

### Client attribution (2026-10-22)

Client = Tempo Customer Account, exported as `Account Customer` (column S), validated by `Account Key`. It is separate from Tempo Account Name, Jira Account, and Jira Delivery. Jira Client and Tempo's legacy `Client` column are never attribution inputs or fallbacks.

Validation uses the complete governed, valid-date Tempo export before UI filters. For each nonblank Account Key, exactly one distinct nonblank Account Customer verifies the mapping; multiple account keys may map to one customer. A blank row customer may use that validated key mapping. Missing account keys, missing customer mappings, and keys with conflicting customers are `N/A`. Account names alone never prove a relationship.

At worklog grain, use the validated account's customer without duplicating or dropping worklogs. At Jira grain, normalize direct Work Item Key / Issue key by trim and uppercase. Assign a customer only if all direct worklogs have verified attribution and exactly one customer is present. Multiple customers or incomplete evidence deterministically produce `N/A`, with candidate customers and account keys recorded in `meta.clientAttribution.issueExceptions`. An item with no direct worklogs is also `N/A`. Never inherit a customer from a parent, Jira Client, Jira Account, or account-name similarity. No fan-out joins, latest-row selection, weighting, or estimate splitting are allowed.

Client selection restricts existing Client-aware Portfolio and Demand datasets, charts, details and the account snapshot CSV. The Client predicate filters Jira rows by their own resolved customer and does not require worklogs for unrestricted Jira inclusion. Separately, approved active Portfolio Account selection uses observed membership; residual unlinked demand stays visible separately. Inactive Account preserves unlogged Jira items in the overall selected issue set. All Jira-only counts, effort caps, estimates, demand and workflow measures have incomplete customer coverage and include unresolved items under `N/A`. Worklog effort remains attributable at its own grain: a multi-customer item's direct hours can appear under individual customers while its unsplittable Jira counts/estimates stay under `N/A`. In an `N/A` Epic view, direct hours include only `N/A` worklogs, not hours attributed to another customer.

Existing filter scope is consumer-specific: the current Portfolio annual cards follow the controlling Annual workforce / Portfolio KPI contract in Business Rules and Chart and Visual Specification. Governed Actual Hours and its gross balance/ratio numerator follow applicable effort filters; annual allocations follow their existing roster/year scope. Annual Development Capacity and Demand Capacity retain full-source behavior, as do the two Delivered Features KPIs. Capacity has no customer allocation. These must not be presented as customer-specific capacity or full customer demand coverage. Client attribution changes no KPI formula, date basis, managed-team rule, or exclusion. With Client unrestricted, every row, logged hour, estimate, effort cap, and demand total is conserved. The source comparison and current gaps are recorded in [Client attribution validation](../audit/CLIENT_CUSTOMER_ATTRIBUTION_VALIDATION.md).

- Logged Hours = all valid Tempo worklogs within the selected Date Range after governed exclusions.
- Tempo is the source of truth for Logged Hours, Billable Hours, Worklog Date, Last Worklog Date, and operational Tempo activity.
- Jira is the source of truth for issue metadata, Original Estimate, Remaining Estimate, Status, Priority, Jira Account metadata, Program, Target Release, Fix Version, Delivery metadata, Due Date, Start Date, and hierarchy. Tempo owns Client, Account identity/display and Account Category. Mixed-label Reporting Account semantics remain only in legacy v1 export compatibility.
- Weekly Capacity is the source of truth for weekly planned capacity.
- Assignees CSV is the source of truth for organizational Team, Skill, Role, Availability, and canonical assignee mapping.
- Master Date is the source of truth for Week Number, workday boundaries, and reporting calendar alignment.
- Jira metadata enriches Tempo worklogs but must not determine whether logged hours exist.
- Unmatched Jira metadata must not remove logged effort.
- Missing Jira metadata must not remove logged effort. Jira Account attribution exceptions remain diagnostic populations. In the approved Account Distribution, eligible nonoperational Tempo work remains in Client/Account or explicit missing-attribution buckets regardless of Jira Account resolution; operational effort remains outside tiles and within applicable footer totals.
- `TEMPO-54`, `TEMPO-92`, `TEMPO-106`, `TEMPO-111`, and `TEMPO-112` are globally excluded from all analytics, KPIs, tables, charts, filters, searches, tooltips, summaries, exports, reconciliation, utilization, backlog activity, Delivery Progress, and Jira-derived demand populations. Candidate keys are trimmed, converted to uppercase, and matched exactly before aggregation, classification, enrichment, joins, or filter population. `TEMPO-92`, `TEMPO-111`, and `TEMPO-112` represent HR daily-registration and vacation records; no individual purpose is assigned without source evidence.
- Valid operational TEMPO-* rows remain included as Logged Operations unless globally excluded.
- Team attribution must come from Assignees CSV unless a visual explicitly defines Team as Jira ownership or Tempo activity context.
- Dot-format assignee names can normalize to canonical Assignees CSV names when they refer to the same governed person:
  - `ignacio.mangas` -> `Ignacio Mangas`
  - `andres.rojas` -> `Andres Rojas` / `Andrés Rojas` as represented in the Assignees CSV
- Marina Petrova and Yuliya Kandukova remain unmanaged/excluded unless added to Assignees CSV.

## Global Filters

Canonical global filters:

- Date Range
- Week Number
- Team
- Assignee
- Skill
- Client
- Account (Tempo Account Key; consumer-specific applicability)
- Account Category
- Priority
- Status
- Target Release
- Program
- Release Cycle

Global filters apply according to each consumer and measure contract. In Portfolio, Account means Tempo Account Key, with observed membership for applicable Jira populations. In Demand Management, Account remains its independent Jira metadata picker. Week Number and parked Release Cycle references describe existing calculations/state, not newly exposed controls.

| Consumer / measure | CH-005A filter contract; existing arithmetic retained |
| --- | --- |
| Portfolio effort KPIs; Hours Trend; Team Utilization; Planned/Unplanned; Program Distribution; Engineering Work Mix; People logged effort; Backlog Worked On; Delivery Progress activity | Direct Tempo Account Key on eligible worklogs. Preserve each consumer's date, metadata, Status exceptions, workforce/ownership and aggregation rules; Program slices still ignore Program selection. |
| Work Item Types | Direct Key on filtered native worklogs; current measure is worklog-row count by type, with its existing Status-aware path. |
| Jira inventory, priority and applicable issue estimates | Direct observed Issue Key membership in selected Account keys; one estimate/count per distinct issue in a union. Existing Jira eligibility and date/Status predicates remain. Account Category is not a Jira attribute. |
| Remaining Demand versus Logged Effort | Demand uses current Jira snapshot Remaining Estimate, independent of Created date; selected observed membership scopes issues. Actuals use selected-period direct-key worklogs and ignore Status. These are separate measures. |
| Account details and v2 snapshot | Actuals grouped by Key; Jira linked estimates use existing Created-date/Status issue scope. Per-Account estimates overlap; union deduplicated. Search can narrow visible detail totals, but exports ignore detail search/row limits. |
| Unlinked demand companion and v2 planning export | Remaining-Demand current-snapshot issue scope, without Created-date restriction. Partition into selected, residual unlinked, other linked; no attribution by Jira Account label. This is not the Demand Management capacity resolver. |
| Annual Gross Workforce Hours | Existing Team/Assignee/Skill roster and compatible-year scope; annual allocations are not divided among Accounts or prorated by worklog filters. |
| Actual Hours; Gross Annual Hours Balance; Logged Hours / Gross Annual Hours | Same governed actual-effort numerator now follows direct Account Key, plus existing effort predicates; ignores Status. Annual denominator retains roster/year scope. |
| Annual Development Capacity and Demand Capacity | Existing full-source cards; no Account/Client allocation. General cards remain Portfolio-scoped above tabs. |
| Weekly capacity and Demand capacity coverage | Existing workforce/Master Date/horizon scope; Account selections do not allocate workforce capacity. |
| Demand Management and Delivered Features exceptions | Independent Jira Account picker and existing planning/hierarchy/filter rules; CH-005B deferred. Existing full-source Delivered Features KPIs continue to ignore Demand pickers. |

Status filtering must not reduce governed Logged Hours by default. Status may filter Jira demand, backlog, and delivery metadata views where Jira lifecycle state is the governed semantic.

## Approved Interim Implementation Clarifications

### Account Distribution

**Approval boundary:** Delivery Management G1 approval supersedes Jira Account-restricted treemap eligibility and exception-only footer rules for Account Distribution only. It does not approve unrelated historical changes or alter KPI formulas, Jira demand, exclusions, Team, Status, hierarchy, capacity, or other visualizations.

Client = verified Tempo `Account Customer`. Portfolio Account = trimmed, case-preserved Tempo `Account Key` identity with `Account Name` for display. Account Category = Tempo `Account Category`. Jira Account = Jira `Custom field (Account)` metadata and retained planning/diagnostic use. Legacy Reporting Account labels exist only in v1 export compatibility controls; no modern Portfolio selection state or predicate uses that dimension. Matching names do not establish a Jira/Tempo relationship.

Tiles contain governed managed, nonexcluded, nonoperational Tempo worklogs, including explicit missing-attribution buckets. Operational `TEMPO-*` effort is excluded from tiles by the existing issue-key classifier, never by Client/Account names. All three footer values use one applicable Client/Account-filtered Tempo scope: Total logged hours, Operational Tempo hours, and Customer/account effort. Jira Status does not filter this visual; the Reporting Account sidebar control has been removed. Date Range, Team, Assignee, Skill, Client, Account Category, Priority, Target Release, Program and existing Release Cycle state apply where implemented; active Tempo Account keys are then applied. The UI footer phrase `global filters` refers to this consumer-specific scope. Changing grouping alone preserves eligible worklogs; applying Client or Account filters can change populations and totals. Missing Client displays `-` in tiles (`N/A` in the Client picker); missing Account Key remains a `-` bucket. Only positive aggregate-hour buckets render (`logged > 0`); negative-adjustment conservation remains unapproved/unvalidated (G6).

| Sidebar state | Account Distribution |
| --- | --- |
| No active Client or Tempo Account selection | Distribution by Client |
| Client selected | Associated Account distribution |
| Tempo Account selected | Selected Account distribution |
| Explicit All Accounts | All eligible Account distribution |
| Client and Account active | Intersected Account distribution |
| Both reset | Default Client distribution |

Explicit **Select All** stores the currently rendered Account options and activates Account grouping. It differs from inactive **All accounts**. Search or other applicable scope can limit those options; it is not a wildcard for future Accounts. Explicit All Clients also activates Account grouping when options exist. Clear All Accounts deactivates Account selection; Client grouping returns only when Client is also cleared. Client and Account selections intersect; a selection outside the current scope does not widen it.

### Capacity

Master Date is the exclusive authority for date-to-week membership; capacity must not use independently calculated ISO week logic. The selected Date Range determines the Master Date weeks in scope. Weekly Capacity remains weekly-grain, and a partial-week Date Range includes the full governed weekly capacity when that Master Date week is represented. Daily capacity proration is not introduced.

### Remaining Demand

Remaining Demand remains Jira Remaining Estimate at issue grain. It is independent of Date Range, and Tempo Logged Effort is not subtracted from Jira Remaining Estimate.

## KPI Cards

### Annual Capacity

| Field | Governance |
|---|---|
| Visual name | Annual Capacity KPI |
| Business question answered | How much annual delivery capacity exists for the governed workforce in the selected organizational scope? |
| Business purpose | Establish the workforce capacity baseline used by executive utilization and remaining-hours context. |
| Source datasets | Assignees CSV |
| Governing source | Annual Capacity -> Assignees CSV Actual Annual Hours; Team/Skill/Assignee -> Assignees CSV |
| Aggregation level | Assignee, Team |
| Date basis | No selected-period date basis; annual capacity is a workforce attribute |
| Filters that SHOULD apply | Team, Assignee, Skill; worklog-only filters may constrain displayed capacity to active people/teams when paired with logged-effort scope |
| Filters intentionally ignored | Jira Status; Tempo Work Date; Week Number; Jira metadata filters except when used to constrain active logged-effort scope |
| Global exclusions | The complete five-key governed exclusion set is irrelevant to the Assignees-sourced capacity value but remains excluded from any logged-effort scope used to constrain the KPI |
| Business assumptions | Annual capacity represents governed workforce availability, not period-specific weekly capacity. |
| Business interpretation | The organization-level capacity envelope available for delivery management. |
| Validation rules | Sum Assignees CSV Actual Annual Hours after Team/Assignee/Skill scope; do not derive annual capacity from Tempo or Jira. |

### Actual Hours

| Field | Governance |
|---|---|
| Visual name | Actual Hours KPI |
| Business question answered | How many governed hours have been logged in the selected period? |
| Business purpose | Show total consumed effort from Tempo. |
| Source datasets | Tempo, Assignees, Master Date, Jira for enrichment only |
| Governing source | Logged Hours -> Tempo; Team/Skill/Assignee -> Assignees CSV; Week Number -> Master Date |
| Aggregation level | Worklog |
| Date basis | Tempo Work Date |
| Filters that SHOULD apply | Date Range, Week Number, Team, Assignee, Skill, Account, Account Category, Priority, Target Release, Program, Release Cycle |
| Filters intentionally ignored | Jira Status by default; Jira Created Date |
| Global exclusions | Exclude `TEMPO-54`, `TEMPO-92`, `TEMPO-106`, `TEMPO-111`, and `TEMPO-112` |
| Business assumptions | Logged effort exists even when Jira metadata is missing. Missing metadata must not remove hours. |
| Business interpretation | The governed Tempo effort consumed in the selected scope. |
| Validation rules | Reconcile to governed Logged Hours used by Team Utilization, Demand vs Actual logged side, Program Distribution total, Planned vs Unplanned total, and People table logged total. |

### Remaining Hours

| Field | Governance |
|---|---|
| Visual name | Remaining Hours KPI |
| Business question answered | How much annual capacity remains after governed logged effort? |
| Business purpose | Provide executive capacity headroom context. |
| Source datasets | Assignees CSV, Tempo, Master Date |
| Governing source | Annual Capacity -> Assignees CSV; Logged Hours -> Tempo |
| Aggregation level | Assignee, Team, Worklog |
| Date basis | Annual capacity has no date basis; logged side uses Tempo Work Date |
| Filters that SHOULD apply | Same capacity scope as Annual Capacity; same governed logged-hours filters as Actual Hours for the logged side |
| Filters intentionally ignored | Jira Status for logged side by default; Jira Created Date |
| Global exclusions | Exclude the complete five-key governed set from the logged side |
| Business assumptions | This is annual capacity minus selected-period logged effort, not a weekly forecast. |
| Business interpretation | Remaining capacity headroom under the current annual-capacity model. |
| Validation rules | Remaining Hours = Annual Capacity - governed Logged Hours. |

### Utilization Rate

| Field | Governance |
|---|---|
| Visual name | Utilization Rate KPI |
| Business question answered | What share of governed annual capacity has been consumed by logged effort? |
| Business purpose | Provide a normalized view of effort consumption against workforce capacity. |
| Source datasets | Assignees CSV, Tempo, Master Date |
| Governing source | Logged Hours -> Tempo; Annual Capacity -> Assignees CSV |
| Aggregation level | Assignee, Team, Worklog |
| Date basis | Logged side uses Tempo Work Date; annual capacity has no date basis |
| Filters that SHOULD apply | Same governed scope as Annual Capacity and Actual Hours |
| Filters intentionally ignored | Jira Status for logged side by default; Jira Created Date |
| Global exclusions | Exclude the complete five-key governed set from the logged side |
| Business assumptions | Operational TEMPO-* effort remains included in utilization unless globally excluded. |
| Business interpretation | How much governed delivery/operational effort has been consumed relative to annual workforce capacity. |
| Validation rules | Utilization Rate = governed Logged Hours / Annual Capacity; denominator must not come from Tempo or Jira. |

## Visualizations

### Effort Trend

| Field | Governance |
|---|---|
| Visual name | Effort Trend |
| Business question answered | How has governed logged effort changed over time? |
| Business purpose | Show temporal pattern of consumed effort. |
| Source datasets | Tempo, Assignees, Master Date, Jira for enrichment |
| Governing source | Logged Hours -> Tempo; Date/Week -> Tempo Work Date and Master Date |
| Aggregation level | Worklog aggregated by selected time grain |
| Date basis | Tempo Work Date |
| Filters that SHOULD apply | Date Range, Week Number, Team, Assignee, Skill, Account, Account Category, Priority, Target Release, Program, Release Cycle |
| Filters intentionally ignored | Jira Status by default; Jira Created Date |
| Global exclusions | Exclude the complete five-key governed set |
| Business assumptions | Trend is effort consumption, not Jira issue creation or completion trend. |
| Business interpretation | When governed effort was spent. |
| Validation rules | Sum of trend buckets must equal governed Logged Hours for the same scope. |

### Team Utilization

| Field | Governance |
|---|---|
| Visual name | Team Utilization |
| Business question answered | How much logged effort did each governed team consume relative to available capacity? |
| Business purpose | Compare team-level effort consumption and capacity usage. |
| Source datasets | Tempo, Weekly Capacity, Assignees, Master Date, Jira for enrichment |
| Governing source | Logged Hours -> Tempo; Weekly Capacity -> Weekly Capacity CSV; Team/Skill/Assignee -> Assignees CSV; Week Number -> Master Date |
| Aggregation level | Team, Worklog, Weekly Capacity row |
| Date basis | Logged Hours -> Tempo Work Date; Weekly Capacity -> capacity week aligned to selected reporting range |
| Filters that SHOULD apply | Date Range, Week Number, Team, Assignee, Skill, Account, Account Category, Priority, Target Release, Program, Release Cycle |
| Filters intentionally ignored | Jira Status by default for logged side; Jira Created Date |
| Global exclusions | Exclude the complete five-key governed set from the logged side |
| Business assumptions | Team is organizational workforce team from Assignees CSV. Tempo Team and Jira Team must not govern this visual. |
| Business interpretation | Team-level utilization and capacity pressure. |
| Validation rules | Sum logged bars must equal governed Logged Hours by Team for the filtered scope; capacity must reconcile to Weekly Capacity rows for selected teams/weeks. |

### Demand vs Actual Effort by Team

**Retained measure boundary:** this Original-Estimate contract is preserved as written; it is distinct from the active Remaining Demand vs Logged Effort visual, which uses Jira Remaining Estimate. The pre-existing naming/measure inconsistency remains recorded, not resolved by CH-005A.

| Field | Governance |
|---|---|
| Visual name | Demand vs Actual Effort by Team |
| Business question answered | How much effort was originally planned versus how much effort has been spent? |
| Business purpose | Compare Jira Original Estimate demand against governed Tempo actual logged effort by Team. |
| Source datasets | Jira, Tempo, Assignees, Master Date |
| Governing source | Demand -> Jira Original Estimate; Actual -> governed Tempo Logged Hours; Team -> Assignees CSV |
| Aggregation level | Team; Jira issue for demand; Tempo worklog for actual |
| Date basis | Actual -> Tempo Work Date; Demand -> no Tempo date basis and no Jira Created Date basis unless separately governed for time-phased demand |
| Filters that SHOULD apply | Team, Assignee, Skill, Account, Priority, Status for Jira demand; Date Range and Week Number for logged actuals; Account Category, Target Release, Program, Release Cycle where fields exist and are governed |
| Filters intentionally ignored | Jira Status must not reduce Actual logged hours by default; Jira Created Date must not filter Actual; Date Range/Week Number should not imply Jira issue creation filtering for Demand unless a future time-phased demand rule is approved |
| Global exclusions | Exclude the complete five-key governed set from Actual; excluded keys must not contribute Jira-derived demand |
| Business assumptions | Demand means Original Estimate, not Remaining Estimate. Remaining Estimate is a future forecasting metric and should be governed separately or shown as a third measure only after visualization governance review. |
| Business interpretation | Team-level plan-vs-consumed comparison. Positive Actual over Demand indicates logged effort exceeded original plan. |
| Validation rules | Demand = SUM(Jira Original Estimate Hours) by governed team scope; Actual = SUM(governed Tempo Logged Hours) by governed team scope; logged total must reconcile to common governed Logged Hours. |

### Program Distribution

| Field | Governance |
|---|---|
| Visual name | Program Distribution |
| Business question answered | How is governed logged effort distributed across Jira Programs, and how much logged effort is not program-mapped? |
| Business purpose | Provide transparent Program effort reconciliation. |
| Source datasets | Tempo, Jira, Assignees, Master Date |
| Governing source | Logged Hours -> Tempo; Program -> Jira Custom field (Program) with governed normalization and parent inheritance where applicable; Team -> Assignees CSV |
| Aggregation level | Worklog, Program |
| Date basis | Tempo Work Date |
| Filters that SHOULD apply | Date Range, Week Number, Team, Assignee, Skill, Account, Account Category, Priority, Target Release, Release Cycle; Program selection may affect selected-scope totals while unmapped work remains visible in reconciliation |
| Filters intentionally ignored | Jira Status by default for governed logged total; Program filter is intentionally handled so the distribution can preserve reconciliation visibility |
| Global exclusions | Exclude the complete five-key governed set |
| Business assumptions | Missing Program must not remove logged hours. Unmapped / Non-Program hours are a governed reconciliation bucket. |
| Business interpretation | Program-mapped effort plus unmapped/non-program effort equals governed Logged Hours. |
| Validation rules | Program-mapped Logged Hours + Unmapped / Non-Program Logged Hours = governed Logged Total. Invalid Program labels must not appear as governed slices. |

### Planned vs Unplanned Effort

| Field | Governance |
|---|---|
| Visual name | Planned vs Unplanned Effort |
| Business question answered | How much governed logged effort was planned, unplanned, operational, or unclassified? |
| Business purpose | Explain planning coverage and operational effort classification. |
| Source datasets | Tempo, Jira, Assignees, Master Date |
| Governing source | Logged Hours -> Tempo; Planned/Unplanned classification -> Jira labels and parent/ancestor labels; Operations -> TEMPO-* operational keys or governed Jira tempo-ticket labels |
| Aggregation level | Worklog, Work item key, Planning category |
| Date basis | Tempo Work Date |
| Filters that SHOULD apply | Date Range, Week Number, Team, Assignee, Skill, Account, Account Category, Priority, Target Release, Program, Release Cycle |
| Filters intentionally ignored | Jira Status by default for logged effort; missing Jira labels must not remove logged hours |
| Global exclusions | Exclude the complete five-key governed set |
| Business assumptions | Label quality limits classification completeness. Missing or conflicting labels are visible as Unclassified, not dropped. Operational TEMPO-* work is separate from Planned and Unplanned. |
| Business interpretation | Shows how much consumed effort was tied to planned work, unplanned work, operations, or unresolved classification. |
| Validation rules | Planned + Unplanned + Operations + Unclassified = governed Logged Hours for the selected scope. |

### Account Distribution

| Field | Governance |
| --- | --- |
| Visual name | Account Distribution |
| Business question answered | Which Clients or Tempo Accounts consumed governed nonoperational Tempo effort? |
| Business purpose | Show Tempo Client/Account effort, including missing attribution; retain Jira Account diagnostics separately. |
| Source datasets | Tempo, Assignees, Master Date; existing Jira enrichment for applicable metadata filters only |
| Governing source | Logged Hours -> Tempo; Client -> verified Account Customer; Account identity -> Account Key; display -> Account Name |
| Aggregation level | Worklog aggregated by Client by default or Tempo Account Key on active selections; no Jira demand/estimate allocation |
| Date basis | Tempo Work Date |
| Filters that SHOULD apply | Applicable Date Range, workforce, Client and metadata predicates, plus active Tempo Account keys; intersection semantics as specified above |
| Filters intentionally ignored | Jira Status; no inferred cross-source bridge |
| Global exclusions | Complete existing five-key governed set; operational worklogs excluded from tiles only |
| Business assumptions | Missing Jira Account does not exclude otherwise eligible Tempo effort. Missing Client/Account attribution is explicit. |
| Business interpretation | Tile share of visible positive aggregate-hour nonoperational effort; not complete customer demand or allocated capacity |
| Validation rules | Client and Account grouping reconcile to the same unfiltered nonoperational population in the validated snapshot. All three footer totals share applicable scope. G6 qualifies negative/nonpositive buckets. |

### Backlog Priority

| Field | Governance |
|---|---|
| Visual name | Backlog Priority |
| Business question answered | What priority mix exists in the filtered Jira backlog/demand scope? |
| Business purpose | Show delivery priority distribution for governed Jira work. |
| Source datasets | Jira, Assignees |
| Governing source | Priority -> Jira; Work item identity -> Jira; Team/Skill/Assignee -> Assignees CSV where workforce scope applies |
| Aggregation level | Jira issue, Priority |
| Date basis | Jira backlog scope; not Tempo Work Date unless explicitly paired with activity scope |
| Filters that SHOULD apply | Team, Assignee, Skill, Account, Priority, Status, Target Release, Program, Release Cycle where fields exist; Date Range only if a separately governed Jira date basis is specified |
| Filters intentionally ignored | Tempo Work Date unless visual is changed to activity-based priority; governed Logged Hours pipeline does not define this visual |
| Global exclusions | No key in the complete five-key governed set may appear if operational rows are present in the source scope |
| Business assumptions | Priority is Jira-owned and reflects issue metadata quality. |
| Business interpretation | Priority composition of the governed backlog/demand scope. |
| Validation rules | Counts must reconcile to distinct Jira issue rows in the filtered backlog scope; missing priorities should be visible as blank/placeholder rather than dropped. |

### Work Item Types

| Field | Governance |
|---|---|
| Visual name | Work Item Types |
| Business question answered | What kinds of work items are represented in the current activity scope? |
| Business purpose | Show mix of Jira issue types and Tempo operational item types in governed activity. |
| Source datasets | Tempo, Jira, Assignees, Master Date |
| Governing source | Worklog inclusion -> Tempo; Jira Issue Type -> Jira; Tempo operational type -> Tempo where Jira issue type is unavailable |
| Aggregation level | Worklog row or distinct work item, depending on approved metric label; current governed metric is Tempo worklog row count by type |
| Date basis | Tempo Work Date |
| Filters that SHOULD apply | Date Range, Week Number, Team, Assignee, Skill, Account, Account Category, Priority, Target Release, Program, Release Cycle; Status only where explicitly governed for type analysis |
| Filters intentionally ignored | Jira Status should not reduce governed logged effort by default; missing Jira type must not remove operational work |
| Global exclusions | Exclude the complete five-key governed set |
| Business assumptions | Type distribution is descriptive activity metadata, not demand volume. |
| Business interpretation | Shows what kinds of work generated activity in the selected scope. |
| Validation rules | Row-count total must reconcile to the governed activity source used by the chart. Metric label must distinguish row count from distinct item count. |

## Detail Tables

### Account Table

| Field | Governance |
| --- | --- |
| Purpose | Actual key-attributed effort and observed linked-issue estimates; no Account budgets or ownership inference. |
| Sources | Tempo Account Key, Name, Logged Hours, Worklog ID; Jira Issue key, Original estimate, Remaining Estimate; Assignees and Master Date as before. |
| Grain | One actuals bucket per trimmed, case-preserved Key; one Jira estimate per distinct issue in each observed bucket. Separate Account estimate subtotals overlap; union footer deduplicates linked issues. |
| Date / Status | Actuals use selected Tempo Work date and existing Status-independent governed effort. Jira estimates retain Account-detail Created-date and Status scope. Remaining-Demand snapshot scope is separate. |
| Filters | Direct Key for effort, observed Issue Key membership for estimates; existing workforce, Client and Jira predicates. Account Category applies to worklogs only. Detail search can narrow visible union totals. |
| Comparisons | Original-Estimate comparison only when complete one-Key attribution, same issue sets, valid estimates and complete observed Worklog ID coverage hold; otherwise Unavailable with explanation. Union variance/ratio unavailable. Zero denominator ratio unavailable. |
| Arithmetic retained | Logged vs Estimate % = Logged Hours / Original Estimate Hours where supported; Variance Hours = Logged Hours - Original Estimate Hours where supported. Remaining Estimate remains separate. |
| Exports | v2 emits separate Account-effort and deduplicated Jira-issue records, no detail search/row limit; explicit legacy v1 remains available. |

### People Table

| Field | Governance |
|---|---|
| Visual name | People table |
| Business question answered | How much governed effort and capacity are associated with each person? |
| Business purpose | Provide assignee-level operational capacity and effort transparency. |
| Source datasets | Tempo, Weekly Capacity, Assignees, Master Date |
| Governing source | Logged Hours/Billable -> Tempo; Capacity -> Weekly Capacity; Team/Skill/Role -> Assignees CSV |
| Aggregation level | Assignee, Worklog, Weekly Capacity row |
| Date basis | Logged side -> Tempo Work Date; capacity side -> Weekly Capacity week |
| Filters that SHOULD apply | Date Range, Week Number, Team, Assignee, Skill, Account, Account Category, Priority, Target Release, Program, Release Cycle |
| Filters intentionally ignored | Jira Status by default for logged side; Jira Created Date |
| Global exclusions | Exclude the complete five-key governed set |
| Business assumptions | People table must not display duplicate assignee rows. Team must not come from Jira or Tempo Team. |
| Business interpretation | Individual delivery and operational effort, capacity, utilization, billability, and work-item breadth. |
| Validation rules | Sum Logged Total across people must equal governed Logged Hours; Logged Total = Logged Engineering + Logged Operations; Utilization = Logged Total / Capacity. |

### Backlog Table

| Field | Governance |
|---|---|
| Visual name | Backlog table |
| Business question answered | Which work items were actively worked on during the selected period? |
| Business purpose | Provide activity-based backlog traceability, not full Jira inventory. |
| Source datasets | Tempo, Jira, Assignees, Master Date |
| Governing source | Inclusion and Last Worklog Date -> Tempo; metadata -> Jira; Team activity scope -> Assignees CSV through Tempo contributor |
| Aggregation level | Work item key, Parent, Worklog |
| Date basis | Tempo Work Date |
| Filters that SHOULD apply | Date Range, Week Number, Team, Assignee, Skill, Account, Account Category, Priority, Status where appropriate for metadata view, Target Release, Program, Release Cycle |
| Filters intentionally ignored | Jira Created Date must not determine inclusion; missing Jira metadata must not remove activity rows |
| Global exclusions | Exclude the complete five-key governed set |
| Business assumptions | Backlog Worked On is activity-based. Jira metadata enriches rows but does not govern inclusion. Child/sub-task keys must be preserved. |
| Business interpretation | Shows the work that actually received Tempo effort in the selected scope. |
| Validation rules | Every row must have Tempo activity in selected scope; Last Worklog Date = MAX(Tempo Work Date); parent inheritance must not replace child key. |

### Delivery Progress

| Field | Governance |
|---|---|
| Visual name | Delivery Progress |
| Business question answered | Which delivery items are due, overdue, blocked, completed, or at risk? |
| Business purpose | Monitor delivery risk and due-date health. |
| Source datasets | Jira, Tempo, Assignees, Master Date |
| Governing source | Due Date/Start Date/Status/Priority/ownership metadata -> Jira; Last Worklog Date -> Tempo; ownership Team -> Jira ticket ownership semantic, not Tempo contributor team |
| Aggregation level | Jira issue or preserved child work item with parent context |
| Date basis | Jira Due Date for delivery risk; Tempo Work Date for Last Worklog Date/activity context |
| Filters that SHOULD apply | Team under Delivery Progress ownership semantics, Assignee, Skill, Account, Priority, Status, Target Release, Program, Release Cycle; Date Range/Week Number where activity scope is used for Last Worklog/activity context |
| Filters intentionally ignored | Tempo contributor team must not overwrite Jira ownership Team; Jira Created Date must not drive progress state |
| Global exclusions | Exclude the complete five-key governed set |
| Business assumptions | Delivery Progress is not percent complete, sprint burndown, or story-point tracking. Countdown stops for terminal or paused states. |
| Business interpretation | Operational view of delivery risk and due-date pressure. |
| Validation rules | Delivery Health must be one of Healthy, At Risk, Critical, Overdue, Completed, Blocked; terminal/paused statuses stop due-date accumulation; known ownership cases must remain under Jira ownership team. |

## Future Governance Notes

### Capacity versus Known Assigned Demand — scoped authorization, 2026-10-22

Here Account always means the independent Demand Management Jira Account picker. Portfolio Account Key does not synchronize with this panel; D4 defers consolidation to CH-005B.

The implementation request and the user's hierarchy clarification authorize this replacement panel only. They do not change the other demand views or the parked Version 2.1 forecast contract.

- Compare Authoring, Delivery Express, Integration, Nexus, Portal, and Scoring using canonical Assignees Team/Skill/Assignee mappings. Other contributing teams retain their own classification.
- Capacity is Weekly Capacity Planned Hours, once per canonical assignee and Master Date week. Full weekly capacity is included when any date in the horizon touches the week; no proration or logged-effort subtraction is introduced. Blank/invalid/missing/duplicate capacity remains unavailable, and affected team and portfolio denominators are unavailable. Known subtotals are separately labelled.
- Use the payload reporting date, derived by the existing builder from source exports, as the inclusive start. This request explicitly differs from the Version 2.1 day-after-reporting-date rule. Year-end is December 31 of that reporting year; release windows start at the later of reporting date and governed Release Start Date. Historical releases are excluded.
- Weekly Capacity has no year column. Its export snapshot year bounds the supported annual capacity data; the panel explicitly reports capacity unavailable for windows extending outside that year. Master Date week numbers must never reuse that annual source for another year. Incomplete calendar coverage also makes capacity unavailable.
- Jira Remaining Estimate is the demand measure. Terminal membership matches the existing delivery-health implementation: Done, Closed, Resolved, Rejected, Abandoned, Cancelled, Canceled, or Status Category Done. Blocked, On Hold, and Pending remain open demand.
- **User-approved hierarchy rule (refined 2026-10-22): child-first, parent-fallback.** For overlapping Story/Task and subtask estimates, use eligible open descendants' valid Remaining Estimates and exclude the parent's own estimate. If no eligible descendant has a valid estimate, use the parent's own valid Remaining Estimate. A confirmed zero is valid and suppresses the parent; a missing, invalid or negative estimate does not. Terminal subtasks do not suppress a parent. Paused/blocked subtasks remain eligible. This preserves the panel's ancestor double-counting protection, including Epic/child protection. Terminal parents never suppress eligible children. Do not inherit estimates, dates, ownership, or customer attribution; preserve the original Jira values and key-level evidence.
- Determine source eligibility after global exclusions, identity/hierarchy validation and terminal-status checks, before Team, Assignee, Skill, customer and planning-window selection. This prevents a filtered-out eligible child causing its parent's estimate to reappear. Cycles and conflicting duplicate Jira identities are explicit exceptions; identical source duplicates contribute once.
- Flag valid parent/eligible-child estimate overlaps as **governance exceptions for reconciliation and review**. Keep this review population separate from assigned demand and exclusive unallocated/invalid/unscheduled exception buckets. Every review record preserves the parent's source estimate, excluded outcome, eligible descendant keys and their source estimates/outcomes. Never add those review estimates to demand or unallocated hours. Review scope matches the parent or an affected child against the horizon and applicable demand/Assignee/Skill filters, across all teams, and is labelled accordingly.
- Allocate once to a valid current/future Target Release, otherwise a strictly future Due Date, otherwise an unscheduled exception. The release's official End Date anchors release demand against a date horizon; Due Date anchors fallback demand. A selected release includes fallback dates actually within its governed boundaries; calendar gaps are not invented release memberships. A future release ending beyond year-end is outside that year's demand total, even if it starts in December.
- Gap = capacity minus assigned demand. Load = assigned demand divided by capacity × 100, using aggregate totals for portfolio load. Missing capacity or a zero denominator produces `-`. Positive portfolio headroom is theoretical and does not transfer capacity between teams.
- Team/Assignee/Skill scope capacity and assigned demand. Client, Account, Business Area, Promoter, Product module, and Target Release scope demand only. The embedded horizon overrides the sidebar Date Range for this panel. Portfolio-only filters retain their separate existing state and do not implicitly filter Demand Management.
- Eligible unallocated demand is scheduled, estimated open demand without a mapped workforce team. It is excluded from assigned load/gaps. The exception population ignores Team selection, while retaining Assignee/Skill and demand filters. Non-Engineering, undated, invalid-estimate, and hierarchy exceptions remain separate. Each key has one primary exception category (hierarchy → estimate → unscheduled → unmapped team → outside Engineering); its independent allocation and planning flags remain traceable.
- Preserve existing Client attribution. No independent account-customer metadata source is present in this workspace. Jira demand never requires a worklog for inclusion; unlogged items remain under Client `N/A`. Do not invent a Jira Account to Tempo Account Key relationship.

The hierarchy rule applies to the supplied Jira extract; unavailable descendants cannot be verified. See [implementation audit and filter matrix](../audit/CAPACITY_ASSIGNED_DEMAND_VALIDATION.md) and the [visual contract](../user-guides/Chart_and_Visual_Specification_CH005A_v1.md#capacity-versus-known-assigned-demand).

### Other existing governance notes

- Retained Original-Estimate contract: Remaining Estimate is Jira-owned and valuable for forecasting, but it is not that contract's Demand definition. The active Remaining Demand visual separately uses Remaining Estimate; this pre-existing definition inconsistency remains unresolved.
- A future forecast visual may show Original Estimate, Remaining Estimate, and Logged Hours together, but it requires explicit governance before implementation.
- New visuals must not redefine Logged Hours, Team attribution, Week Number, global exclusions, parent-child preservation, or Delivery Progress ownership semantics.
- Any visual that drops rows because of missing Jira metadata, missing Assignees mapping, missing Program, missing Account, or missing labels must report that behavior explicitly.
- Recursive, metadata-driven Account hierarchy traversal, configurable hierarchy levels, cycle protection, safe maximum depth, first-valid-Account resolution, and ancestor conflict detection are future enhancements; they are not current MVP functionality.


## CH-005A source ownership

| Business concept | Authority and boundary |
| --- | --- |
| Client | Tempo Account Customer, verified by Account Key; unresolved is N/A. Existing full-snapshot single-customer Jira attribution remains unchanged. |
| Portfolio Account identity | Tempo Account Key, trimmed and case-preserved; equal names with different keys remain distinct. |
| Account display / Category | Tempo Account Name / Account Category. Neither establishes Jira ownership or key membership. |
| Logged effort / worklog date | Tempo Logged Hours / Work date. Worklog ID is source provenance, not an issue or Account identity. |
| Jira metadata / Jira Account | Jira fields / Custom field (Account), retained internally for diagnostics, display and independent planning. |
| Original Estimate / Remaining Estimate | Jira, issue grain, seconds converted to hours. They are separate measures, not Account budgets. |
| Workforce / capacity / weeks | Assignees CSV / Weekly Capacity / Master Date. No Account capacity allocation. |

The Portfolio sidebar exposes Client, Account and Account Category alongside the existing controls. Reporting Account has been removed from that sidebar and from modern reporting predicates. Legacy label choices are export-only compatibility controls. Jira Account metadata remains in the data model.

## CH-005A observed relationships and activation

D2 uses normalized direct Jira Issue Key = Tempo Work Item Key to collect observed Tempo Account Keys from the complete governed eligible valid-date source snapshot **before interactive filters**. Issue keys are trimmed and uppercased; Account Keys are trimmed without case folding. The index is not rebuilt from a selected date, person or Team sample. Consumer-specific six-team/workforce eligibility remains applied by each consumer. No name, parent Account, Client or Category bridge is permitted. Observed activity is not contractual ownership; Jira metadata inheritance remains a separate existing process.

| Attribution evidence | Meaning |
| --- | --- |
| No worklogs | No eligible direct Tempo evidence; no Account can be assigned. |
| Missing Account Keys | Direct worklogs exist, but all keys are missing; distinct from no worklogs. |
| Partially attributed | Known keys and missing-key worklogs coexist. Known keys remain inspectable; the issue can also involve multiple known Accounts. |
| Multiple Accounts | More than one observed nonmissing key. The display prioritizes Partially attributed when missing evidence also exists; it does not discard the multiple keys. |
| Observed Account | Complete evidence for a single nonmissing key. This still establishes activity, not ownership. |

| Account activation state | Effect |
| --- | --- |
| Inactive/default, empty selection | Unrestricted Account predicate. Includes Jira-only issues in the selected overall issue population; attribution diagnostics still disclose them. |
| Explicit Select All | Active stored selection of currently rendered option keys; search and current scope can limit it. It is not a wildcard for future or newly eligible keys. |
| Selected keys | Direct worklog-key match; Jira issue matches any observed selected key, once in the union. Client and Account intersect. |
| Active-empty | Matches no worklogs or Jira issues. Distinct from inactive/unrestricted, and retains Account treemap grouping. |
| Clear / reset | Clear Account empties keys and deactivates; active Client still gives Account grouping. Reset also clears Client and restores existing date/Status defaults. |
| Missing-key selection | One explicit missing-key bucket, encoded as JSON array containing an empty string. Matches missing-key worklogs and issues with direct missing-key evidence, never issues with no worklogs. No Jira-name fallback. |
| Selected key unavailable after scope/refresh | Retained and clearable; cannot widen the current intersection or silently select another key. |

Checkbox and tile interactions retain their existing activation behavior; unchecking the last checkbox deactivates. A programmatically active-empty state or Select All on an empty rendered option scope remains active-empty.

## CH-005A consumer populations and estimate grain

| Consumer / measure | CH-005A filter contract; existing arithmetic retained |
| --- | --- |
| Portfolio effort KPIs; Hours Trend; Team Utilization; Planned/Unplanned; Program Distribution; Engineering Work Mix; People logged effort; Backlog Worked On; Delivery Progress activity | Direct Tempo Account Key on eligible worklogs. Preserve each consumer's date, metadata, Status exceptions, workforce/ownership and aggregation rules; Program slices still ignore Program selection. |
| Work Item Types | Direct Key on filtered native worklogs; current measure is worklog-row count by type, with its existing Status-aware path. |
| Jira inventory, priority and applicable issue estimates | Direct observed Issue Key membership in selected Account keys; one estimate/count per distinct issue in a union. Existing Jira eligibility and date/Status predicates remain. Account Category is not a Jira attribute. |
| Remaining Demand versus Logged Effort | Demand uses current Jira snapshot Remaining Estimate, independent of Created date; selected observed membership scopes issues. Actuals use selected-period direct-key worklogs and ignore Status. These are separate measures. |
| Account details and v2 snapshot | Actuals grouped by Key; Jira linked estimates use existing Created-date/Status issue scope. Per-Account estimates overlap; union deduplicated. Search can narrow visible detail totals, but exports ignore detail search/row limits. |
| Unlinked demand companion and v2 planning export | Remaining-Demand current-snapshot issue scope, without Created-date restriction. Partition into selected, residual unlinked, other linked; no attribution by Jira Account label. This is not the Demand Management capacity resolver. |
| Annual Gross Workforce Hours | Existing Team/Assignee/Skill roster and compatible-year scope; annual allocations are not divided among Accounts or prorated by worklog filters. |
| Actual Hours; Gross Annual Hours Balance; Logged Hours / Gross Annual Hours | Same governed actual-effort numerator now follows direct Account Key, plus existing effort predicates; ignores Status. Annual denominator retains roster/year scope. |
| Annual Development Capacity and Demand Capacity | Existing full-source cards; no Account/Client allocation. General cards remain Portfolio-scoped above tabs. |
| Weekly capacity and Demand capacity coverage | Existing workforce/Master Date/horizon scope; Account selections do not allocate workforce capacity. |
| Demand Management and Delivered Features exceptions | Independent Jira Account picker and existing planning/hierarchy/filter rules; CH-005B deferred. Existing full-source Delivered Features KPIs continue to ignore Demand pickers. |

For each consumer's eligible Jira issue set Q, partition after preserving its non-Account predicates. Under an active Account selection, selected issues match observed keys (or the selected missing-key bucket); residual unlinked issues have no direct worklogs or only missing keys and exclude anything already selected; other linked issues are the remaining issues. A partially attributed issue outside the selection is other linked, with its uncertainty disclosed. Under inactive Account, selected contains all Q, and residual/other are empty; unresolved attribution is still diagnosed within selected. Counts, Original Estimate and Remaining Estimate reconcile across these disjoint populations using distinct normalized issue identity. Source estimate availability flags remain intact; exports leave missing estimates blank. Existing aggregate sums retain their numeric zero contribution for unavailable values, without treating absence as a confirmed source zero.

D1 keeps residual unlinked demand visible separately from selected Account demand. Its Jira Account metadata can be inspected but never supplies a Tempo Account. Unlinked Jira demand is not part of Tempo treemap tiles or any of their three footer measures. Do not confuse this Portfolio partition with Demand Management's unlogged planning cohort.

D3: each issue contributes its Jira estimate once within a selected Account union. Separate Account rows can contain the same multi-Account issue; those estimate subtotals are **non-additive**. Account-detail footer estimates are a deduplicated union of the visible Account buckets' linked issues, not a sum of row estimates and not the full unlinked population. Worklog hours retain source Worklog ID uniqueness. There is no estimate allocation, weighting or Account budget.

D5: Account rows show key-attributed actual hours and observed linked-issue Original/Remaining Estimates. A supported comparison requires complete single-nonmissing-key evidence, the same eligible issue sets, valid Original Estimates, and coverage of every observed source Worklog ID for those issues. A date/person/Team filter can break that coverage. Otherwise variance and ratio display Unavailable with a reason; union variance/ratio are always unavailable. Where supported, the existing arithmetic is Logged minus Original, and Logged divided by Original; zero Original makes the ratio unavailable. Remaining Estimate is not substituted into those formulas. This qualification introduces no new arithmetic.

## CH-005A exports and compatibility

D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [The exact contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2.

Account effort records aggregate selected governed worklogs by case-preserved Key, including missing-key records; they have logged values and blank Jira estimates. Jira issue records contain one distinct issue across selected/unlinked/other with source estimates, blank logged values and blank Account Key/Name; Observed Account Keys is a JSON evidence array, not allocation. An unavailable source estimate is blank. Do not expand issue records onto worklogs and sum estimates. Scope JSON records selected dates, source date/files/hashes, active Account flag and keys, other selections, membership basis and actual-effort Status exception. Exports ignore detail text search and display-row limits.

Snapshot v2 uses Account-detail Jira Created-date/Status scope; planning v2 uses current Remaining-Demand snapshot scope without Created-date or new future-horizon filtering. Both retain selected-period actual effort. Filenames are delivery-bi-snapshot-v2-{start}_{end}.csv and delivery-bi-planning-v2-{start}_{end}.csv. CSV quotes fields containing commas, quotes or line breaks, doubles embedded quotes, and retains unrounded numeric values.

Legacy CSV (v1) remains available pending downstream approval. Export-only optional labels retain original mixed Jira Account / Tempo Account Name semantics and do not filter modern reports. Modern Account Key selection does not filter v1. Preserve original filename, rounding, six columns (Account; Original Estimate Hours; Logged Hours; Variance Hours; Logged vs Estimate %; Work Items), original formulas and original empty-name omissions in v1 only. Supported legacy sort fields retain behavior; v2-only sort fields fall back to Logged Hours descending. Local 97-case equivalence evidence is not downstream acceptance, and v1 is not retired.

## Current-source evidence and preserved CH-004 behavior

The October 30, 2026 snapshot reconciles Total Logged **51,806.039 h**, Operational Tempo **8,263.271 h**, and Customer/Account effort **43,542.768 h**. These are dated validation observations, never KPI constants. Client and Account grouping conserve the same unfiltered eligible nonoperational worklogs. Tiles exclude operational TEMPO-* effort after the five exact exclusions; all three footer measures share the applicable Client/Account scope and retain operational effort in Total/Operations. Only positive aggregate buckets render. Default grouping is Client; active Client or Account, including explicit All/active-empty Account, gives Account; both reset gives Client. Grouping alone changes no eligible worklogs.

The separate October 30–December 31, 2026 Demand Management capacity reference is **4,934.2333 h** known assigned demand, **42** unlogged issues and **2,056 h** unlogged demand. It uses its own hierarchy/horizon resolver. It is not the Portfolio Remaining Demand cohort, a constant or demand assigned to named Tempo Accounts.

Current CH-005A evidence records 33 browser scenario groups, 77 identity cases, 11 domain checks, source/worklog conservation and 97 legacy equivalence cases. Step 5 inspects this newer implementation and evidence; it does not substitute the CH-004 audits for CH-005A validation or rerun output-producing tests. Account-filtered populations may legitimately differ from prior label-based Reporting Account reports while formulas and classifications remain unchanged; historical equivalence has not been established.

## CH-005A implementation traceability

[Account domain module](../../web/portfolio-accounts.js): index, status, worklogMatches, issueMatches, partition, accountRows and exportCsv preserve direct keys, source IDs and distinct issue unions. [Portfolio integration](../../web/app.js): filteredData, governedLoggedWorklogRows, demandBacklogData, portfolioAccountRows, portfolioAccountTotals, snapshotCsv (snapshot/planning modes), exportScope and renderAccountTreemap apply the consumer boundaries above. [Markup](../../web/index.html) exposes one Portfolio Account control and explicit legacy export controls. [Builder](../../scripts/build_web_data.py) retains mandatory unique source Worklog ID and manifest hashes; source/calendar exceptions remain as recorded. [Legacy module](../../web/portfolio-legacy-export.js) isolates v1. [Demand implementation](../../web/demand.js) retains its independent Jira picker.

Evidence inspection covers [domain tests](../../scripts/test_portfolio_accounts.cjs), [browser verifier](../../scripts/verify_portfolio_accounts.cjs), [CH-004 verifier](../../scripts/verify_account_distribution.cjs) and the newer CH-005A outputs inventoried in the validation report. Preserved CH-004 assertions that Tempo Account affects only the treemap describe the superseded scope and are not claimed as current CH-005A regression assertions. No test/source file is changed by Step 5.

## Conditions, unresolved contradictions and change control

1. Historical capacity and reporting replay are incomplete: required prior exports are unavailable.
2. External consumer acceptance of v2 exports has not been established.
3. Legacy v1 compatibility remains required pending downstream approval.
4. The Jira Status category mapping defect remains unresolved: source Status category and the builder's requested Status Category differ.
5. The builder's ISO-week/weekday fallback remains an implementation exception to exclusive Master Date authority; it is not an approved alternate calendar rule.
6. Epic-child Jira Account mismatches and missing Jira Account values remain data-quality issues; no new inheritance is authorized.
7. Observed Tempo Account membership does not establish contractual ownership.
8. Effective-dated Account/customer history and an authoritative Jira/Tempo ownership crosswalk are unavailable.
9. Negative-adjustment treemap reconciliation remains unvalidated; the positive snapshot does not establish future conservation.
10. CH-005B remains deferred. Demand Management retains its independent Jira Account picker, planning semantics, hierarchy and filter state.

Pre-existing date/measure wording conflicts are recorded in the [Step 5 validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before.

Historical CH-004 G5 manifest/sync-state and G7 chronology observations retain their dates and evidential limits. Current CH-005A manifest hashes match current implementation; that newer evidence does not retroactively repair historical sync-state records, supply prior exports or prove historical approval chronology. G1 remains scoped; G4–G10 limitations are not closed by this proposal. Canonical promotion, v1 retirement, ownership allocation, new rules and CH-005B require separate approval.
