# AI-Assisted Delivery Management Platform

## User Guide

| Document information | Value |
| --- | --- |
| Document | User Guide |
| Platform | AI-Assisted Delivery Management Platform |
| Platform stage | MVP |
| Applicable baseline | BASELINE_v0.16_2026-08-26 |
| Guide version | 2.1 |
| Last updated | 26 August 2026 |
| Status | Approved |
| Audience | Delivery Managers, Engineering Managers, Product Managers, Product Directors, Strategy Managers, Financial Managers, PMO, CTO, and Executive Leadership |

## 1. Introduction

The AI-Assisted Delivery Management Platform MVP is an interactive operational analytics workspace for delivery, product, portfolio, financial, and executive decisions. It brings governed Tempo effort, Jira delivery metadata, workforce capacity, and organizational mappings into one view so leaders can ask practical questions: where effort was spent, how capacity is being used, what work was active, and where due-date attention is needed.

The MVP succeeds the previous Power BI-style reporting experience with a browser-based, filterable workspace. It is an operational reporting MVP, not a replacement for Jira delivery management, a forecasting engine, or an AI recommendation service. Its purpose is transparent, governed decision support based on the currently available data.

The platform applies the approved business, calculation, data, and visualization governance. For definitions and source ownership, use [MVP Business Rules](../governance/MVP_Business_Rules.md), [KPI Definitions](../governance/KPI_Definitions.md), and the [Data Dictionary](../governance/Data_Dictionary.md) as the authority.

## 2. Intended audience

The platform supports informed operational discussion; it does not replace Jira, Tempo, financial systems, portfolio governance, management judgment, or the normal processes that create and manage delivery actions.

| Role | Questions and relevant areas | Decisions supported |
| --- | --- | --- |
| Delivery Managers | Which work was active, what is due or overdue, and where is capacity pressure? Use Hours Trend, Team Utilization, Backlog, and Delivery Progress. | Review delivery actions, risk follow-up, and workload conversations. |
| Engineering Managers | How is team and individual capacity being used, and what mix of work is being logged? Use KPI cards, Team Utilization, Engineering Work Mix, and People. | Inform capacity, staffing, and operational-overhead discussions. |
| Product Managers | What activity is associated with priorities, accounts, Programs, target releases, and the current operational bug queue? Use Backlog Priority, Account Distribution, Program Distribution, Bug Severity Distribution, Backlog, Bug Triage, and filters. | Support prioritisation and product-delivery conversations. |
| Product Directors | Where is effort concentrated and what delivery risk requires attention? Use KPI cards, Hours Trend, distributions, Team Utilization, and Delivery Progress. | Support product portfolio and escalation discussions. |
| Strategy Managers | How is effort distributed across Programs and accounts, and where are mapping gaps? Use Program Distribution, Account Distribution, and their detail context. | Support portfolio framing and governance follow-up. |
| Financial Managers | What logged and billable effort is visible by account and person? Use Hours Trend, Accounts, and People. | Support effort and estimate-variance discussion; not revenue, cost, margin, or forecast decisions. |
| PMO | What is the current workload, priority mix, due-date risk, and data-quality context? Use KPI cards, Backlog Priority, Delivery Progress, and details. | Support reporting, governance, and follow-up coordination. |
| CTO | What is the executive picture of capacity, effort, demand context, delivery risk, and the current operational bug queue? Use KPI cards, Hours Trend, Bug Severity Distribution, Team Utilization, Remaining Demand vs Logged Effort by Team, and Delivery Progress. | Support leadership prioritisation and escalation discussion. |
| Executive Leadership | Where are material effort, capacity, account, Program, and delivery-risk signals? Use KPI cards and the high-level charts before opening details. | Support management review and decision framing. |

## 3. Getting started

For a first analysis, use the following sequence:

1. Open the platform.
2. Review the default reporting scope shown in the Date Range and header.
3. Select the relevant Date Range.
4. Apply Team, Assignee, Skill, Account, Priority, Status, Target Release, or Program filters as required.
5. Review the KPI cards for the connected capacity and effort context.
6. Review trends and distributions.
7. Investigate operational risks and demand context using Team Utilization, Remaining Demand vs Logged Effort by Team, Backlog Priority, and Delivery Progress.
8. Open the relevant detail table for traceable follow-up.
9. Select **Reset** before beginning a new, unrelated analysis.
10. Select **Download CSV** when the supported filtered Accounts snapshot is required.

## 4. Platform overview

The page is arranged as a working dashboard:

- The left rail contains the Date Range and multi-select filters.
- The header shows the selected date range and provides **Download CSV**.
- KPI cards summarize annual capacity and selected-period logged effort.
- The executive visualization area is arranged as **Hours Trend | Planned vs Unplanned Effort**, followed by **Program Distribution | Bug Severity Distribution**.
- The dashboard panels also show account, utilization, demand, priority, and work-type views.
- The **Details** section provides Accounts, People, Backlog, Delivery Progress, and Bug Triage tabs.

Selections refresh the page immediately. Active selections appear beneath the header as removable filter chips. The **Reset** button restores the default date range and filter state. The trend chart can be switched between monthly and weekly display.

> Screenshot

docs/user-guides/images/platform-overview.png

## 5. Dashboard map

The MVP is a single dashboard workspace. Users encounter the following areas in this order:

1. **Filter rail** — Date Range and multi-select scope controls.
2. **Header and active filter context** — selected range, removable filter chips, and **Download CSV**.
3. **KPI cards** — Annual Workforce Capacity, Actual Hours, Annual Capacity Remaining, and Annual Capacity Utilization.
4. **Executive row 1** — **Hours Trend** and **Planned vs Unplanned Effort**.
5. **Executive row 2** — **Program Distribution** and **Bug Severity Distribution**.
6. **Account distribution and work mix** — **Account Distribution** and **Engineering Work Mix**.
7. **Team utilization** — **Team Utilization**.
8. **Remaining demand and logged-effort comparison** — **Remaining Demand vs Logged Effort by Team**.
9. **Backlog priority** — **Backlog Priority** and **Work Item Types**.
10. **Detail tables** — **Accounts**, **People**, **Backlog**, **Delivery Progress**, and **Bug Triage**.

> Screenshot

docs/user-guides/images/dashboard-map.png

## 6. Navigation

Use the filter rail to define the scope, then move from summary to detail:

1. Set a Date Range, or choose **Full** to return to the complete available historical range.
2. Open a filter picker and select one or more values. Search is available for Assignee, Account, Target Release, and Program.
3. Use a chart to focus the analysis. Account tiles, team bars, demand bars, and applicable bar-chart categories can change the related filter selection.
4. Open a Details tab for row-level follow-up. Use the search box to find text across the displayed rows and select a column heading to sort; repeat selection changes sort direction.
5. Remove a specific filter with its chip, or select **Reset** to start again.

## 7. How to read the dashboard

Use the dashboard as a summary-to-diagnosis sequence rather than as a mandatory workflow:

1. Confirm the scope and Date Range.
2. Read the KPI cards as one capacity-and-effort story.
3. Review **Hours Trend** for the timing of effort.
4. Review **Planned vs Unplanned Effort** for planning-coverage context.
5. Review **Program Distribution** for Program concentration and mapping context.
6. Review **Bug Severity Distribution** for an executive overview of the current operational Bug Triage queue before opening the Bug Triage table.
7. Compare teams in **Team Utilization**.
8. Review **Remaining Demand vs Logged Effort by Team** as current demand context alongside recent historical effort.
9. Examine **Backlog Priority** for priority context, then use **Details** for traceable work-item investigation.

The views have different sources, time bases, and business meanings. Move from summary to diagnosis and then to detail; do not turn the sequence into a completion percentage or forecast.

## 8. Global filters

All visible filter controls are multi-select. An empty selection means “all available values” for that control. The date range governs historical Tempo activity by Worklog Date; capacity is aligned to the Master Date weeks represented by that selected range. Remaining Demand is a current Jira snapshot and does not change solely because the Date Range changes.

| Filter | Purpose and business meaning | Practical use |
| --- | --- | --- |
| Date Range | Sets the historical execution period for logged effort and activity-based detail. | Select a review week to see work logged and worked-on items in that week. |
| Team | Narrows the governed workforce team scope. In Delivery Progress, Team means Jira ticket ownership; in Backlog Worked On, it means Tempo contributor activity. | Compare a delivery team’s workload, capacity, and owned delivery risk. |
| Assignee | Narrows to named people mapped in the Assignees source. | Prepare an individual capacity or contribution review. |
| Skill | Narrows the governed workforce skill scope. | Review demand and effort relevant to a specialist capability. |
| Account | Narrows by governed Account attribution: the Jira Account on the work item takes precedence. Immediate-parent fallback is used only when the directly logged Jira key is absent from the current Jira extract, a parent exists, and the parent Account is non-blank. A work item present in the extract with a blank Account does not inherit from its parent; **No Account / Missing Account** remains reportable as an attribution exception. | Review customer/account effort and estimate variance. |
| Account Category | Narrows the available account classification. | Focus a portfolio discussion on a category of accounts. |
| Priority | Narrows Jira priority metadata and its matched activity context. | Investigate work associated with a particular priority. |
| Status | Defaults to the available non-done statuses. Changing it applies the chosen Jira status selection where status is used; governed logged-effort surfaces retain their approved status behavior. | Focus delivery-risk and demand views on a status set. |
| Target Release | Narrows Jira Target Release metadata and its matched activity. | Review work associated with a planned target release. |
| Program | Narrows Jira Program metadata and its matched activity. Program Distribution still exposes Unmapped / Non-Program effort for reconciliation. | Review a Program while retaining visibility of unmapped effort. |

Do not use the Date Range as a proxy for a future demand horizon. Forecasting is not implemented in this MVP.

## 9. Filters and chart interactions

Visible filter controls set the dashboard scope subject to the governed exceptions described in this guide. Filter chips show active selections: use an individual chip to remove that selection, or the grouped chip to clear a larger selection. **Reset** restores the full available Date Range, clears the visible filter selections, restores the default Status selection, and clears table and filter-search text.

Chart selections are implemented for specific visuals. In **Account Distribution**, select a tile to focus on that Account; Ctrl/Cmd-click extends or removes an Account selection. **Team Utilization** bars and labels select the related Team, and **Remaining Demand vs Logged Effort by Team** bars select the related Team. **Backlog Priority** bars select the related Priority. These interactions change the corresponding global filter scope; they are not a separate drill-through page. Other charts should be read as visual evidence unless an interaction is visibly available.

The **Hours Trend** selector changes only the trend display between monthly and weekly grain. Detail-table search filters the currently displayed detail tab and does not create a global filter. Selecting a detail-table column heading cycles its sort order. **Download CSV** exports the filtered Accounts snapshot only. Remaining Demand remains a current Jira snapshot; changing Date Range affects historical execution reporting, not Remaining Demand alone.

**Bug Severity Distribution** and its shared Bug Triage snapshot banner represent the complete current Bug Triage queue. They are intentionally independent of the Team and Assignee filters, Details search, and table sorting. They are informational views, not interactive filters.

## 10. Data sources and ownership

| Information | Authoritative source |
| --- | --- |
| Logged effort and worklogs | Tempo |
| Work-item and delivery metadata | Jira |
| Account, Program, Priority, Status, Target Release, Original Estimate, Remaining Estimate, and Due Date | Jira |
| Capacity | Weekly Capacity |
| Workforce Team and Skill mapping | Assignees |
| Week and date logic | Master Date |
| Bug Triage queue, metadata, and snapshots | Dedicated Bug Triage Jira export |

These sources have different semantic roles and must not be substituted for one another. Tempo governs historical activity and logged effort; Jira governs work-item metadata and the current Remaining Demand context; Weekly Capacity governs capacity; Assignees governs workforce mapping; and Master Date governs reporting-calendar logic.

### Global work-item exclusions

The following exact keys are removed from every governed analytical population:

- TEMPO-54
- TEMPO-92
- TEMPO-106
- TEMPO-111
- TEMPO-112

TEMPO-92, TEMPO-111, and TEMPO-112 are used for HR daily registration and vacation. The available source does not identify which individual new key represents which HR purpose, so the platform does not infer that mapping.

Candidate keys are trimmed and converted to uppercase before exact comparison. A near match such as TEMPO-540 remains included. Exclusion occurs before calculations, classifications, joins, reconciliation, filter population, export, and rendering. The five keys therefore contribute no logged, planned, remaining, billable, utilization, variance, Work Ratio, record-count, worklog-count, distinct-work-item, backlog-activity, or Delivery Progress value, and they cannot appear in charts, filters, searches, tooltips, tables, summaries, or CSV exports.

Valid operational Tempo items not in the five-key set remain governed Logged Operations. Annual Capacity and Weekly Capacity source values remain unchanged. Bug Triage is unaffected because it is governed exclusively by its dedicated Jira export and does not use Tempo.

## 11. Data refresh and data currency

The dashboard is populated from a generated local data file built from supplied source extracts. The build process reads the latest matching supplied CSV extracts when it is run and writes the dashboard data file; it does not query Jira or Tempo live. The browser dashboard checks that generated data file for changes and reloads it when a newer file is available.

No user-facing source refresh control or governed refresh cadence is implemented in the MVP. Data currency therefore depends on the latest supplied extracts and build process. Before using the platform for management decisions, confirm the effective reporting period shown in the dashboard and consider the currency of the supplied source extracts.

## 12. Executive KPI cards

The current cards use the labels shown in the interface. Where a displayed label differs from the canonical KPI name, the canonical terminology in [KPI Definitions](../governance/KPI_Definitions.md) remains authoritative.

### Annual Workforce Capacity

This is the full-year governed workforce capacity for the selected Team, Assignee, and Skill scope. Use it to establish the annual capacity envelope before interpreting utilization. It is not capacity limited to the selected Date Range, and it is not a commitment of deliverable output. Managers should use it to identify whether the selected workforce population has a plausible annual capacity base.

### Actual Hours

This card is the interface label for governed **Logged Total** in the selected Date Range. It represents valid logged effort after global exclusions and includes both engineering and operational effort. Use it to understand consumed effort and the number of distinct Tempo work items represented. Do not read it as completed scope, delivery progress, or billable revenue.

### Annual Capacity Remaining

This is the remaining annual workforce capacity after the selected-period governed logged effort is considered. It is a capacity signal for management discussion, not a forward forecast. A negative value means selected logged effort exceeds the displayed annual capacity measure; investigate scope, period, and capacity-data quality before drawing a staffing conclusion.

### Annual Capacity Utilization

This is the displayed ratio of selected-period governed logged hours to annual workforce capacity. Use it as a directional workload indicator alongside the People table and Team Utilization chart. It does not measure productivity, delivery completion, quality, or financial performance. For canonical utilization semantics, see [KPI Definitions](../governance/KPI_Definitions.md).

> Screenshot

docs/user-guides/images/executive-kpis.png

## 13. Interpreting KPIs together

Read the KPI cards as connected capacity-and-effort context, not as independent performance scores. **Annual Workforce Capacity** establishes the annual governed workforce envelope for the organizational scope. **Actual Hours** is the displayed label for governed **Logged Total** in the selected historical Date Range. **Annual Capacity Remaining** expresses annual capacity headroom after that logged effort, while **Annual Capacity Utilization** expresses the selected logged effort relative to annual capacity. Together, they support a workload and capacity conversation; they do not constitute a delivery forecast, completion percentage, or productivity score.

The operational views complement this context but answer different questions. **Remaining Demand** is current Jira demand context; **Team Utilization** compares planned capacity and historical logged effort; **Delivery Progress** highlights due-date and status-based risk; and **Backlog Worked On** traces items that received Tempo activity in scope. Do not combine these views into a mathematically reconciled funnel: they have different sources, time bases, and business meanings.

## 14. Dashboard visualizations

For field-level source mappings (`[filename].[fieldname]`), filter behavior, and calculation rules for each KPI, chart, and table, see [Chart and Visual Specification](./Chart_and_Visual_Specification.md).

### Hours Trend

Shows logged and billable hours by month or week. It answers how effort and billable activity moved through the selected period. Use the grain selector to match the cadence of the review. Look for sustained shifts rather than treating a single point as a delivery-health verdict. Logged and Billable have different business meanings; billable is governed by Tempo billing semantics and should not be compared directly with capacity as if it were a utilization measure.

> Screenshot

docs/user-guides/images/hours-trend.png

### Account Distribution

This treemap shows governed Tempo logged hours by Account. The Jira Account on the work item takes precedence. Immediate-parent Account fallback is used only when the directly logged Jira key is absent from the current Jira extract, a parent exists, and the parent Account is non-blank. A work item present in the extract with a blank Account is a data-quality or technical exception and does not inherit from its parent; recursive ancestor traversal is not implemented. Unresolved engineering work is excluded from the treemap and reported separately, preserving reconciliation integrity and exposing metadata-quality issues rather than silently excluding effort from governed logged effort. Tile size represents the account’s share of selected effort. Select a tile to focus on one Account, or use Ctrl/Cmd-click to extend the selection. Use it for account concentration and data-quality discussions. Do not interpret effort share as revenue, margin, or contractual completion.

> Screenshot

docs/user-guides/images/account-distribution.png

### Program Distribution

This chart shows governed logged effort by Program and presents Program-mapped, governed-total, and Unmapped / Non-Program effort. It answers how recorded effort is distributed across the available Program metadata while preserving reconciliation visibility. Use it to identify concentration or missing Program mapping. Do not treat the mapped slices alone as total platform effort.

> Screenshot

docs/user-guides/images/program-distribution.png

### Bug Severity Distribution

Provides an executive summary of the current operational Bug Triage queue before item-level investigation. Its source is the dedicated Bug Triage Jira export, and its metric is the count of distinct Jira Bugs: one Jira Key equals one Bug. Missing Bug Severity is excluded, zero-count categories are hidden, and rendered categories retain the canonical order: Blocker, Critical, Major, Medium, Low, Enhancement.

The shared banner above this chart shows the Full Bug Triage queue and, when the immediately previous complete export is available, Added to queue and Removed from queue. These values compare complete Bug Triage snapshots only. They must not be interpreted as Bugs created, fixed, or resolved.

### Planned vs Unplanned Effort

This panel compares the count of distinct Tempo issue keys classified as Planned or Unplanned and also summarizes hours in Planned, Unplanned, Operations, and Unclassified categories. It supports planning-coverage conversations: how much consumed effort was tied to known planning labels, operational work, or unresolved classification. Do not equate this with completed work or assume Unclassified means unplanned; it can signal missing or conflicting metadata.

> Screenshot

docs/user-guides/images/planned-vs-unplanned-effort.png

### Team Utilization

Shows Capacity, logged hours, variance, and utilization rate by governed Team. Use it to identify teams where recorded activity is high against planned capacity and to target a capacity review. A bar selection focuses the Team filter. This is a plan-versus-consumed-effort view; it is not a measure of individual productivity or delivery quality.

> Screenshot

docs/user-guides/images/team-utilization.png

### Remaining Demand vs Logged Effort by Team

Compares the current Jira Remaining Demand with Tempo logged effort in the selected historical period, by Team. It answers where outstanding demand sits alongside recent execution activity. Remaining Demand is intentionally independent of Date Range, while logged effort is date-filtered. Do not interpret the bars as a like-for-like period comparison, forecast, or completion percentage.

> Screenshot

docs/user-guides/images/remaining-demand-vs-logged-effort.png

### Backlog Priority

Shows the priority composition of the filtered Jira backlog scope. Use it to frame portfolio or product discussions about priority mix. It is Jira metadata, not a measure of hours, value, delivery risk, or actual activity. Missing or incomplete priority data should prompt data-quality follow-up rather than silent exclusion.

> Screenshot

docs/user-guides/images/backlog-priority.png

### Engineering Work Mix

Shows governed engineering logged effort by engineering work category. Use it to understand the mix of engineering activity within the selected historical scope. It excludes operational work from the engineering total by design. Do not use it to infer the full workforce mix without reviewing the Planned vs Unplanned Effort panel, which separately exposes operations and unclassified effort.

> Screenshot

docs/user-guides/images/engineering-work-mix.png

### Work Item Types

Shows Tempo worklog row count by Jira issue type. It answers what kinds of items generated activity, not how much demand exists or how many distinct work items there are. Use it as a descriptive activity-metadata view. Do not read a row count as hours, distinct issues, priority, or delivery completion.

> Screenshot

docs/user-guides/images/work-item-types.png

## 15. Detail tables

All tabs support text search and column sorting. They show only the current displayed result set, with the platform’s row limits applied; use filters and search to narrow the view. The **Download CSV** button exports the filtered Accounts snapshot, not the currently selected detail tab.

### Accounts

Purpose: account-level plan-versus-actual reconciliation.

Columns: Account, Original Estimate Hours, Logged Hours, Variance Hours, Logged vs Estimate %, and Work Items. The total row summarizes the displayed account values. Original Estimate is Jira-owned; Logged Hours is Tempo-owned. Positive Variance Hours indicates logged effort above the original estimate. Treat the missing-account bucket as a data-quality and reconciliation signal, not zero effort.

### People

Purpose: assignee-level capacity and effort transparency.

Columns: Assignee, Team, Capacity, Logged Total, Logged Engineering, Logged Operations, Utilization Rate, Billable, and Work Items. Team and Skill are governed through the Assignees source. Use this tab for weekly delivery and capacity review; do not compare people as a productivity ranking without appropriate operational context.

### Backlog

Purpose: traceability for work items actively worked on during the selected period.

Columns: Parent Key, Parent Summary, Child Key, Child Summary, Work Item Type, Status, Start Date, Due Date, Last Worklog Date, Priority, Target Release, and Fix Version. A row exists because Tempo activity occurred in scope; this is **Backlog Worked On**, not a complete Jira inventory. Child keys are preserved. Parent context can enrich a child when appropriate, but it does not replace the child key. Tempo operational items are shown as operational with unavailable Jira-derived fields rendered as `-`.

### Delivery Progress

Purpose: operational due-date and delivery-risk monitoring for the activity scope.

Columns: Account, Team, Parent Key, Parent Summary, Child Key, Child Summary, Status, Priority, Start Date, Due Date, Last Worklog Date, Days to Due, and Delivery Health. Team here means Jira ticket ownership, not the Tempo contributor team. The tab uses visible health badges: overdue, due soon, healthy, completed, or not applicable/no due date. It is not percent complete, a sprint burndown, or story-point tracking. Terminal and paused/blocked statuses stop countdown accumulation.

### Bug Triage

Purpose: operational review of the current Bug Triage queue.

Columns: Key, Summary, Bug Severity, Status, Updated, Assignee, and Team. The dedicated Bug Triage Jira export governs the queue and its Jira metadata. Team is governed exclusively by the Assignees CSV. If an Assignee cannot be mapped, the Assignee remains visible, Team displays `-`, and the row remains available for investigation.

> Screenshot

docs/user-guides/images/detail-tables.png

## 16. Operational workflows

### Weekly Delivery Reviews

Set the review period, check Hours Trend and Team Utilization, then use Backlog and Delivery Progress to discuss actual activity, late work, and next actions. Record follow-ups in the team’s normal delivery-management process; the platform does not create work items or actions.

### Capacity Reviews

Use Team Utilization and People to compare planned capacity with governed logged effort. Investigate material variance using the Date Range, Team, Skill, and Assignee filters. Separate capacity pressure from operational overhead by reviewing Logged Engineering and Logged Operations in People.

### PI Preparation

Use Remaining Demand vs Logged Effort by Team, Backlog Priority, Account Distribution, and Program Distribution to prepare transparent scope and ownership conversations. The MVP does not produce a future demand forecast, release allocation, or planning exception list.

### Executive Reporting

Use the KPI cards, Hours Trend, Planned vs Unplanned Effort, Program Distribution, Bug Severity Distribution, Team Utilization, and Account Distribution for a concise narrative of capacity, effort, concentration, current operational bug severity, and reconciliation gaps. Download the Accounts CSV when an account-level snapshot is required.

### Product Reviews

Use Backlog Priority, Target Release, Program, and Backlog Worked On to connect priority and release metadata with actual activity. Keep demand, activity, and progress distinct: activity does not prove completion.

### Portfolio Reviews

Use Account and Program views to identify concentration, unmapped effort, and account estimate variance. Review No Account / Missing Account and Unmapped / Non-Program values as governance follow-up items.

### Financial Reviews

Use Hours Trend and People for billable and logged-effort visibility, and Accounts for original-estimate versus logged-effort discussion. The MVP does not calculate revenue, cost, margin, or financial forecast.

### Delivery Governance

Use Delivery Progress to triage due-date pressure and stalled activity, then use Backlog detail for preserved item and parent context. Apply the source and semantic distinctions in the governance documents when escalating data-quality, ownership, or reconciliation issues.

## 17. Best practices

- Start with Date Range and workforce scope before interpreting any execution metric.
- Read capacity and utilization as workload signals, then validate with People and Team details.
- Treat Backlog Worked On as evidence of activity, not a total demand inventory or completion list.
- Keep Remaining Demand distinct from historical logged effort; they have different time bases.
- Use missing Account, Program, labels, or metadata as visible data-quality signals rather than removing them from the narrative.
- Treat **No Account / Missing Account** as a governance and data-quality indicator rather than an error; it identifies work that could not be attributed using the approved Account resolution rules.
- Use Delivery Progress for due-date risk, not a percentage-complete estimate.
- Use **Bug Severity Distribution** for executive prioritisation, then use **Bug Triage** detail for operational investigation.
- Do not interpret the Bug Triage snapshot comparison as engineering throughput.
- Preserve the child work-item key when tracing work; parent information is context only.
- Refer to the governance documents for definitions instead of recreating formulas in local reports or presentations.

## 18. Common mistakes

| Mistake | Avoid it by |
| --- | --- |
| Treating Actual Hours as completed scope | Read it as governed logged effort in the selected date range. |
| Treating Remaining Demand as date-filtered historical activity | Remember it is a current Jira snapshot. |
| Comparing demand and logged bars as the same time period | Use the demand chart as a contextual comparison, not a forecast or completion rate. |
| Treating Backlog Worked On as all Jira backlog | Use it only for items with Tempo activity in the selected scope. |
| Dropping missing Program or Account effort from analysis | Keep the reportable unmapped buckets in reconciliation discussions. |
| Reading utilization as productivity | Combine it with delivery context, operational effort, and capacity data quality. |
| Treating Delivery Progress as a burndown | Use it for due-date risk and current delivery health only. |
| Expecting a CSV for every tab | Download CSV exports the filtered Accounts snapshot only. |

## 19. Known MVP limitations

- The MVP is a single dashboard workspace; it has no separate user-facing dashboard pages.
- Forecasting, future demand allocation, planning exceptions, predictive risk scoring, and AI recommendations are not implemented.
- The platform does not create, edit, or synchronize Jira work items from the UI.
- Export is limited to the filtered Accounts snapshot in CSV format; there is no per-chart or per-detail-tab export.
- Detail tables are display-limited and require filtering/search for focused investigation.
- Financial measures such as revenue, cost, margin, and budget are not provided.
- Bug Triage is a current operational snapshot. The MVP does not provide Bug ageing, historical Bug analytics, MTTR, Reopened Bugs, trend analysis, or AI Bug Intelligence.

## 20. Future evolution

Approved work beyond the MVP begins with Version 2.1 Demand Planning. Its governed scope includes future Jira Remaining Estimate demand, allocation to a future Target Release or future Due Date, demand by Team and Assignee, Unassigned demand, and Planning Exceptions. These are future capabilities and are not available in the current dashboard.

The approved longer-term roadmap also includes the following capabilities, none of which is implemented in the current MVP:

- **Executive and Team Reporting** — expanded reporting views for leadership and teams.
- **Delivery Risk Prediction** — risk-oriented delivery intelligence.
- **Team Expertise Intelligence** — insight into team expertise context.
- **Intelligent Prioritization** — decision support for prioritization.
- **Dependency Intelligence** — visibility of delivery dependencies.
- **AI Bug Intelligence** — AI-assisted bug-related intelligence.
- **Conversational Delivery Assistant** — conversational access to delivery-management insight.

Later Planning Intelligence topics, such as intake timing, assignment lead time, and late-intake analysis, remain deferred. See [Forecasting Governance](../governance/Forecasting_Governance.md) for the approved future definition; do not infer current functionality from the platform name.

## 21. Frequently Asked Questions

### Why does changing the Date Range not change Remaining Demand?

Remaining Demand is a current Jira snapshot. Date Range governs historical Tempo execution metrics and activity-based reporting.

### Why do I see operational work in the platform?

Valid Tempo operational activity is governed operational effort. It remains visible unless it is globally excluded.

### Why are some HR Tempo records absent?

TEMPO-54, TEMPO-92, TEMPO-106, TEMPO-111, and TEMPO-112 are globally excluded because they represent absence, legal daily-time registration, or the governed HR daily-registration/vacation population rather than delivery or operational effort. Exact normalized matching prevents similarly numbered valid items from being removed.

### Why do some hours appear under "No Account / Missing Account"?

The Jira Account on the work item takes precedence. Immediate-parent fallback is used only when the directly logged Jira key is absent from the current Jira extract, a parent exists, and the parent Account is non-blank. A work item present in the extract with a blank Account does not inherit from its parent. Recursive ancestor traversal is not implemented. Unresolved engineering work is reported separately and remains included in governed logged effort, preserving reconciliation and highlighting missing metadata rather than removing effort from reporting.

### Why are some fields shown as `-`?

`-` is the canonical placeholder for unavailable information. Tempo operational items do not carry Jira-derived delivery fields.

### Why does the Backlog tab show a child key rather than its parent?

The platform preserves the actual work item that received the Tempo worklog. Parent metadata is supplied only as context where available.

### Why can Program Distribution show Unmapped / Non-Program effort?

Missing Program metadata must not remove governed logged effort. The bucket keeps the chart reconcilable to governed total effort.

### Why do Delivery Progress and Backlog use Team differently?

Backlog Worked On uses Tempo contributor activity; Delivery Progress uses Jira ticket ownership. This distinction is intentional and governed.

### Why doesn't "Added to queue" equal newly created Bugs?

It compares complete Bug Triage exports using Jira Issue Keys only. A key added to the current queue was absent from the immediately previous queue export; that does not establish when the Bug was created.

### Why doesn't "Removed from queue" equal Bugs fixed?

A key can disappear from the operational queue for multiple reasons. Snapshot comparison does not establish that the Bug was fixed, resolved, or closed.

### Why don't some Bugs show a Team?

Team is governed exclusively by the Assignees CSV. When the Jira Assignee cannot be mapped, the Assignee remains visible and Team displays `-`.

### Can I use Delivery Health as a completion percentage?

No. It is a due-date risk indicator, not a completion, burndown, or story-point measure.

### What does Download CSV export?

It downloads the filtered Accounts snapshot with the account-detail columns. It does not export the active tab automatically.

### Does the MVP forecast future demand or make AI recommendations?

No. Both capabilities are outside the current operational MVP.

## 22. Screenshot index

| File | Section | Capture guidance |
| --- | --- | --- |
| docs/user-guides/images/platform-overview.png | Platform overview | Capture the complete dashboard at the default reporting scope. |
| docs/user-guides/images/dashboard-map.png | Dashboard map | Capture the full single-workspace dashboard so each major area is visible. |
| docs/user-guides/images/executive-kpis.png | Executive KPI cards | Capture the four KPI cards with their labels and values visible. |
| docs/user-guides/images/hours-trend.png | Hours Trend | Capture the chart with the selected grain control visible. |
| docs/user-guides/images/account-distribution.png | Account Distribution | Capture the treemap with account tiles and summary context visible. |
| docs/user-guides/images/program-distribution.png | Program Distribution | Capture the Program Distribution chart including mapped, governed-total, and unmapped context. |
| docs/user-guides/images/planned-vs-unplanned-effort.png | Planned vs Unplanned Effort | Capture planned and unplanned bars with the category summary. |
| docs/user-guides/images/team-utilization.png | Team Utilization | Capture capacity, logged, variance, and utilization by team. |
| docs/user-guides/images/remaining-demand-vs-logged-effort.png | Remaining Demand vs Logged Effort by Team | Capture both measures by team and the chart title. |
| docs/user-guides/images/backlog-priority.png | Backlog Priority | Capture the priority distribution. |
| docs/user-guides/images/engineering-work-mix.png | Engineering Work Mix | Capture the engineering-category mix and summary. |
| docs/user-guides/images/work-item-types.png | Work Item Types | Capture the worklog-row-count view by Jira issue type. |
| docs/user-guides/images/detail-tables.png | Detail tables | Capture the Details area with tabs, search, sorting, and one representative table. |

## 23. Glossary

| Term | Meaning in this platform |
| --- | --- |
| Account | Jira delivery/customer grouping. |
| Assignee | Canonical mapped person used for workforce reporting. |
| Backlog Worked On | Work items with Tempo activity in the selected scope; not a full Jira inventory. |
| Billable | Tempo billable logged effort. |
| Capacity | Planned delivery capacity from Weekly Capacity. |
| Delivery Health | Operational delivery-risk state based on due-date and status governance. |
| Fix Version | Jira fix-version metadata. |
| Global work-item exclusion | Exact normalized removal of TEMPO-54, TEMPO-92, TEMPO-106, TEMPO-111, and TEMPO-112 from governed analytics before calculation or presentation. |
| Key | Canonical Jira or Tempo work-item identifier. |
| Last Worklog Date | Latest Tempo Worklog Date for the item in the selected scope. |
| Logged Engineering | Governed non-operational Tempo delivery effort. |
| Logged Operations | Governed valid TEMPO operational effort. |
| Logged Total | Combined governed Logged Engineering and Logged Operations. |
| Program | Jira Program grouping. |
| Remaining Capacity | Unused capacity after logged effort. |
| Remaining Demand | Current Jira remaining estimate/demand context; independent of historical Date Range. |
| Skill | Canonical workforce skill attribution from Assignees. |
| Target Release | Jira planned target-release metadata. |
| Team | Canonical workforce team attribution, except where a view explicitly uses activity or ticket-ownership semantics. |
| Utilization Rate | Ratio of governed logged effort to capacity for the applicable view. |
| Worklog Date | Date of an individual Tempo worklog. |
| Work Items | Distinct work-item count after the active applicable scope. |

For the complete canonical definitions, including source ownership and allowed values, consult the [Data Dictionary](../governance/Data_Dictionary.md).
