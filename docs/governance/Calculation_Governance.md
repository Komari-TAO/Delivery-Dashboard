# Calculation Governance

## Purpose

This document defines the governed calculation semantics for dashboard KPIs, visualizations, and detail tables in the AI-Assisted Delivery Management Platform.

It is the reference for validating future implementation changes against business meaning, source ownership, filter behavior, aggregation level, date basis, exclusions, and reconciliation expectations.

Authoritative references:

- `docs/MVP_Business_Rules.md`
- `docs/KPI_Definitions.md`
- `docs/Data_Dictionary.md`
- `docs/Semantic_Visualization_Governance.md`

## Global Calculation Principles

- Logged Hours = all valid Tempo worklogs within the selected Date Range after governed exclusions.
- Tempo is the source of truth for Logged Hours, Billable Hours, Worklog Date, Last Worklog Date, and operational Tempo activity.
- Jira is the source of truth for issue metadata, Original Estimate, Remaining Estimate, Status, Priority, Account, Program, Target Release, Fix Version, Delivery metadata, Due Date, Start Date, and hierarchy.
- Weekly Capacity is the source of truth for weekly planned capacity.
- Assignees CSV is the source of truth for organizational Team, Skill, Role, Availability, and canonical assignee mapping.
- Master Date is the source of truth for Week Number, workday boundaries, and reporting calendar alignment.
- Jira metadata enriches Tempo worklogs but must not determine whether logged hours exist.
- Unmatched Jira metadata must not remove logged effort.
- Missing Jira metadata must not remove logged effort. In Account Distribution, non-TEMPO work without a resolved Account is classified as an engineering Account-attribution exception outside the treemap; operational TEMPO-* work is governed separately.
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
- Account
- Account Category
- Priority
- Status
- Target Release
- Program
- Release Cycle

Global filters should apply wherever the governed source field exists and the visual has not explicitly defined an exception.

Status filtering must not reduce governed Logged Hours by default. Status may filter Jira demand, backlog, and delivery metadata views where Jira lifecycle state is the governed semantic.

## Approved Interim Implementation Clarifications

### Account Distribution

The source population remains governed Tempo Logged Effort, but the treemap is limited to Account-attributed engineering effort. Jira Status must not alter the historical worklog population. Unmatched engineering work and operational TEMPO-* work remain in their governed totals, while only the unresolved engineering subset is reported in the treemap footer.

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
|---|---|
| Visual name | Account Distribution |
| Business question answered | Which valid Jira Accounts consumed the most attributable engineering effort? |
| Business purpose | Show engineering Tempo effort distribution by valid Jira Account; report unresolved engineering attribution separately. |
| Source datasets | Tempo, Jira, Assignees, Master Date |
| Governing source | Logged Hours -> Tempo; Account -> Jira Custom field (Account), first direct then immediate parent only when the direct key is absent from the current extract |
| Aggregation level | Account, Worklog |
| Date basis | Tempo Work Date |
| Filters that SHOULD apply | Date Range, Week Number, Team, Assignee, Skill, Account, Account Category, Priority, Target Release, Program, Release Cycle |
| Filters intentionally ignored | Jira Status by default for logged effort; unavailable Jira metadata must not be invented for attribution exceptions |
| Global exclusions | Exclude the complete five-key governed set |
| Business assumptions | A present Jira record with blank Account is an unexpected data-quality or technical exception. A Jira key absent from the current extract is a source-coverage limitation, not proof that the ticket does not exist. Operational TEMPO-* activity is not an Account exception. |
| Business interpretation | Account-level share of attributable engineering effort in the selected scope. |
| Validation rules | Treemap tiles contain valid Jira Accounts only. Account-attributed engineering effort + engineering Account-attribution exceptions + operational TEMPO-* effort = Governed Logged Total. The footer uses exactly the unresolved engineering subset excluded from the treemap and is hidden at zero exceptions. |

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
|---|---|
| Visual name | Account detail table |
| Business question answered | For each account, how much was originally estimated, how much has been logged, and what is the variance? |
| Business purpose | Provide account-level reconciliation between Jira demand and Tempo effort. |
| Source datasets | Jira, Tempo, Assignees, Master Date |
| Governing source | Original Estimate -> Jira; Logged Hours -> Tempo; Account -> Jira; Team/Skill/Assignee -> Assignees CSV |
| Aggregation level | Account, Jira issue, Worklog |
| Date basis | Logged side -> Tempo Work Date; estimate side -> Jira issue scope with no Tempo date basis unless future time-phased demand is governed |
| Filters that SHOULD apply | Team, Assignee, Skill, Account, Priority, Status, Target Release, Program, Release Cycle for Jira estimate side where fields exist; Date Range and Week Number for logged side; account/category filters for both where applicable |
| Filters intentionally ignored | Jira Status must not reduce governed logged hours by default; unresolved Account attribution must remain reportable outside the Account Distribution treemap |
| Global exclusions | Exclude the complete five-key governed set from the logged side |
| Business assumptions | Variance compares logged effort against Original Estimate, not Remaining Estimate. |
| Business interpretation | Account-level plan-vs-actual effort and over/under-estimate signal. |
| Validation rules | Logged vs Estimate % = Logged Hours / Original Estimate Hours where estimate exists; Variance Hours = Logged Hours - Original Estimate Hours. |

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

- Remaining Estimate is Jira-owned and valuable for forecasting, but it is not the governed Demand definition for the current Demand vs Actual visual.
- A future forecast visual may show Original Estimate, Remaining Estimate, and Logged Hours together, but it requires explicit governance before implementation.
- New visuals must not redefine Logged Hours, Team attribution, Week Number, global exclusions, parent-child preservation, or Delivery Progress ownership semantics.
- Any visual that drops rows because of missing Jira metadata, missing Assignees mapping, missing Program, missing Account, or missing labels must report that behavior explicitly.
- Recursive, metadata-driven Account hierarchy traversal, configurable hierarchy levels, cycle protection, safe maximum depth, first-valid-Account resolution, and ancestor conflict detection are future enhancements; they are not current MVP functionality.
