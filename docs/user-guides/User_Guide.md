# Delivery Management Dashboard User Guide

## Purpose

The dashboard combines historical Tempo effort, Jira delivery demand, workforce capacity, and governed organizational dimensions. It supports delivery visibility and known demand management; it is not a forecasting tool and does not replace Jira or Tempo.

For the authoritative field-level rules, calculations, joins, and data-quality behavior, use [Chart and Visual Specification](./Chart_and_Visual_Specification.md). This guide focuses on how to use the workspace.

## Workspace layout

- **General KPI cards** stay visible above all tabs. They are fixed source measures and do not respond to filters or tab changes.
- **Portfolio** is the delivery-effort workspace: historical Tempo activity, Jira context, capacity, charts, and operational details.
- **Demand Management** combines current actual effort, known future demand, capacity, planning position, and Epic Workflow. It is demand visibility, not a forecast.
- **Datasources** displays source freshness, data-quality status, relationships, and the exact rules used by the dashboard.

## General KPI cards

| KPI | Definition |
| --- | --- |
| Annual Workforce Legal Hours | Sum of Assignees `Actual Annual Hours` for Authoring, Delivery Express, Integration, Nexus, Portal, and Scoring. |
| Annual Workforce Capacity | Sum of Weekly Capacity `Planned Hours`. |
| Actual Hours | Sum of Tempo `Logged Hours`. |
| Remaining Period Capacity | Annual Workforce Capacity minus Actual Hours. |
| Annual Capacity Utilization | Actual Hours divided by Annual Workforce Capacity. |
| Demand Capacity | Sum of Jira `Effort CAP (hrs)`. |

## Portfolio

Use Portfolio to understand actual delivery work and current operational context.

1. Set the **Date Range** for Tempo activity.
2. Use searchable multi-select filters for Team, Assignee, Skill, Client, Account, Category, Priority, Status, Target Release, Program, and Release Cycle.
3. Review charts for time trend, planning discipline, program, bug severity, account distribution, utilization, remaining demand, priority, engineering work mix, and work-item types.
4. Use **Accounts**, **People**, **Backlog**, and **Delivery Progress** details for follow-up. Tables support sorting, grouping, and Jira/Tempo links where an authoritative identifier is available.

**Bug Severity Distribution** counts distinct Jira PI Backlog work items where Issue Type is Bug and severity is Blocker, Critical, or Major. It follows the active Portfolio filters.

## Demand Management

Use Demand Management to inspect known delivery demand and its workflow position.

- The filter rail follows the same multi-select pattern as Portfolio.
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
