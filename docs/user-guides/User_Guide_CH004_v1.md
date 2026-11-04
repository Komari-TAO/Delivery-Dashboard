# Delivery Management Dashboard User Guide

> **CH-004 v1 — Step 4 local review candidate, 2026-11-03. Not canonical; promotion pending Delivery Management review.**
> Canonical source: `docs/user-guides/User_Guide.md`; GitHub reference `feature/initial-dashboard-import` pinned to `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a`. Exact blob/version, scoped G1 approval, G2/G3 corrections, G4–G10 limitations and validation: [Step 4 report](../audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md). Revision history: pinned canonical → CH-004 v1; no calculation or application-behavior change.

## Purpose

The dashboard combines historical Tempo effort, Jira delivery demand, workforce capacity, and governed organizational dimensions. It supports delivery visibility and known demand management; it is not a forecasting tool and does not replace Jira or Tempo.

For the authoritative field-level rules, calculations, joins, and data-quality behavior, use [Chart and Visual Specification](./Chart_and_Visual_Specification.md). This guide focuses on how to use the workspace.

## Workspace layout

- **General KPI cards** stay visible above the tabs. Applicability depends on the measure: annual roster scope, filtered actual effort, and full-source capacity/demand are distinct. See below.
- **Portfolio** is the delivery-effort workspace: historical Tempo activity, Jira context, capacity, charts, and operational details. Its sidebar separates **Client**, **Account** (Tempo), and **Reporting Account**.
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

Tempo Account selection affects only Account Distribution. Client and Reporting Account retain their existing supported effort/reporting consumers; they do not allocate workforce capacity. Gross measures remain before absences, preserve source joiner/leaver adjustments and compatible-year checks, and are unavailable for unsupported/mixed-year scope or missing/ambiguous annual data. These descriptions restate the existing Portfolio card contract and change no formula.

## Portfolio

Use Portfolio to understand actual delivery work and current operational context.

1. Set the **Date Range** for Tempo activity.
2. Use the searchable multi-select sidebar controls. **Client** is verified Tempo Account Customer. **Account** identifies Tempo Accounts by Account Key, displaying Name (Key). **Reporting Account** preserves the separate existing mixed Jira/Tempo reporting and snapshot-export filter. Team, Assignee, Skill, Category, Priority, Status, Target Release and Program retain their supported scope. Release Cycle functionality remains parked/hidden; no new interaction is introduced.
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

Tiles show nonoperational Tempo effort, including `-` missing-attribution buckets; the Client picker uses `N/A` for unresolved attribution. The footer shows Total logged hours, Operational Tempo hours and Customer/account effort for the same applicable Client/Account scope. Operational effort stays out of tiles and within applicable footer totals. Reporting Account and Status do not filter this treemap. Other supported filters retain their existing effect.

**Reporting Account is separate:** it preserves legacy reporting and export functionality. It can represent a different population from the Tempo treemap; its labels do not establish a Jira-to-Tempo Account mapping. Tempo Account selection does not filter other charts, details, Demand Management or the snapshot CSV. Client selection can still affect its existing supported consumers.

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
- Grouping alone preserves eligible Account Distribution worklogs; Client or Account filters can narrow them and their footer totals. The 51,806.039 h Total / 8,263.271 h Operational / 43,542.768 h Customer/Account values are a validated snapshot, not permanent targets.
- Do not infer Jira ownership, full customer demand, or allocated customer capacity from Tempo Account names. Missing attribution stays explicit. Negative/nonpositive aggregate-hour reconciliation and broad historical replay/regression assurance remain limited; see the Step 4 governance validation report.
