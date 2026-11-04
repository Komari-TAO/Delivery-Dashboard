# Semantic Visualization Governance

> **CH-004 v1 — Step 4 local review candidate, 2026-11-03. Not canonical; promotion pending Delivery Management review.**
> Canonical source: `docs/governance/Semantic_Visualization_Governance.md`; GitHub reference `feature/initial-dashboard-import` pinned to `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a`. Exact blob/version, scoped G1 approval, G2/G3 corrections, G4–G10 limitations and validation: [Step 4 report](../audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md). Revision history: pinned canonical → CH-004 v1; no calculation or application-behavior change.

## Purpose

This document defines the rendering and interaction principles for the active browser dashboard. It does not duplicate field-level calculations; [Chart and Visual Specification](../user-guides/Chart_and_Visual_Specification.md) is the authoritative source for those rules.

## Core principles

- Every displayed measure must be traceable to named CSV fields or a documented derived calculation.
- Missing, unmapped, unavailable, and `Other/Blank` values remain visible rather than being silently converted to zero.
- Charts provide a decision-oriented summary; details retain the source work-item context needed for follow-up.
- A filter uses consistent values for its governed dimension within supported consumers; applicability is consumer-specific. Client = verified Tempo `Account Customer`. Account = Tempo `Account Key` identity and `Account Name` display. Reporting Account = independent existing mixed Jira/Tempo compatibility dimension. Jira Account = Jira metadata and retained attribution diagnostics; matching names do not establish a Jira/Tempo bridge.
- Direct relationships must not be presented as hierarchy roll-ups. In particular, Epic Workflow shows direct Tempo-to-Epic matches only.

## Tabs

### General KPI cards

The six Portfolio KPI cards remain visible above the tabs. Apply the current annual workforce contract: gross annual allocations follow Team/Assignee/Skill and compatible year; Actual Hours and the gross balance/consumption numerator follow applicable effort filters and ignore Status. Annual Development Capacity and Demand Capacity retain their full-source scope. Tempo Account selection affects only Account Distribution. No KPI formula or tab-switch calculation changes are introduced.

### Portfolio

Portfolio represents actual and historical delivery effort. Its filter rail, charts, and detail tables use the governed Tempo, Jira, capacity, and Assignees dimensions. Detail tables support sorting and grouping. Jira and Tempo links are rendered only when the required destination identifier is known.

The sidebar has separate Client, Account (Tempo) and Reporting Account controls. Client uses verified Tempo Account Customer and keeps its existing supported consumers. Tempo Account uses Account Key identity and Name display, and scopes only Account Distribution. Reporting Account preserves legacy reporting/export compatibility and does not scope this treemap.

| Sidebar state | Account Distribution |
| --- | --- |
| No active Client or Tempo Account selection | Distribution by Client |
| Client selected | Associated Account distribution |
| Tempo Account selected | Selected Account distribution |
| Explicit All Accounts | All eligible Account distribution |
| Client and Account active | Intersected Account distribution |
| Both reset | Default Client distribution |

Explicit **Select All** stores the currently rendered Account options and activates Account grouping. It differs from inactive **All accounts**. Search or other applicable scope can limit those options; it is not a wildcard for future Accounts. Explicit All Clients also activates Account grouping when options exist. Clear All Accounts deactivates Account selection; Client grouping returns only when Client is also cleared. Client and Account selections intersect; a selection outside the current scope does not widen it.

Tiles contain governed managed, nonexcluded, nonoperational Tempo worklogs, including explicit missing-attribution buckets. Operational `TEMPO-*` effort is excluded from tiles by the existing issue-key classifier, never by Client/Account names. All three footer values use one applicable Client/Account-filtered Tempo scope: Total logged hours, Operational Tempo hours, and Customer/account effort. Reporting Account and Jira Status do not filter this visual. Date Range, Team, Assignee, Skill, Client, Account Category, Priority, Target Release, Program and existing Release Cycle state apply where implemented; active Tempo Account keys are then applied. The UI footer phrase `global filters` refers to this consumer-specific scope. Changing grouping alone preserves eligible worklogs; applying Client or Account filters can change populations and totals. Missing Client displays `-` in tiles (`N/A` in the Client picker); missing Account Key remains a `-` bucket. Only positive aggregate-hour buckets render (`logged > 0`); negative-adjustment conservation remains unapproved/unvalidated (G6).

### Demand Management

Demand Management represents actual effort, known future demand, capacity, delivery workflow position, and release context. It is demand visibility, not forecasting.

Its filter rail uses searchable multi-select controls. Both Client pickers use only validated Tempo `Account Customer` values plus the explicit `N/A` attribution bucket. Client retains its position, styling, search, multi-select, Select All, Clear All, and reset behavior. Business Area uses a Jira Promoter **or** Reporter match to the Promoters mapping; its unmatched values remain `Other/Blank`.

Client = Tempo Customer Account, never Jira Client, Tempo Account Name, or Jira Account. Both tabs and the Portfolio snapshot export use `tempoCustomerAccount` through the shared `DashboardCore.clientValue` helper. Worklogs retain their direct account/customer attribution; Jira counts and estimates use only complete, single-customer direct issue mappings. Missing or ambiguous items remain visible under `N/A` without parent inheritance or splitting estimates. See [Calculation Governance](Calculation_Governance.md#client-attribution-2026-10-22) for the deterministic rule. Full-source KPIs and Delivered Features retain their existing exceptions; current annual Portfolio cards use the scope described above. Workforce capacity is not customer allocated. Portfolio Tempo Account and Reporting Account state do not synchronize with Demand’s independent Jira Account picker or redefine Jira demand.

Epic Workflow uses Jira Issue Type = Epic, Epic Lab, or Epic Release. A card and its inline detail represent Jira rows in the selected stage. Logged hours are direct Jira Issue key to Tempo Work Item Key matches only; descendant hierarchy attribution is not implied.

Capacity versus Known Assigned Demand replaces the capacity pivot with a six-team comparison, aggregate KPI cards, an independent future-horizon selector, and separate unallocated/exception disclosure. Its scoped source and hierarchy rules are recorded in [Calculation Governance](Calculation_Governance.md#capacity-versus-known-assigned-demand--scoped-authorization-2026-10-22). Use a common bar scale, grey capacity, pastel-blue assigned demand capped at capacity, and muted-red excess demand. Sort known gaps ascending with alphabetical ties; unavailable gaps follow. Missing values render `-`, confirmed zeros render zero, and incomplete capacity never renders as a zero bar or a valid portfolio load. The exception indicator labels its broader Team scope. Existing demand panels retain their previous semantics.

### Datasources

The Datasources tab exposes current payload freshness, source status, data-quality warnings, relationships, fallbacks, and tab-specific lineage. It is a concise operational view; the Chart and Visual Specification contains the detailed field contract.

## Interaction and accessibility

- All picker controls must expose a descriptive label, selection count, Select All, Clear All, and keyboard-usable search where the value list can be long.
- Chart labels, legends, and tooltips must state the measured unit or count.
- Clicking a chart category may apply only the matching documented filter. Account Distribution Client tiles set the sidebar Client selection; Account tiles select that Tempo Account, or clear Account selection when the selected tile is clicked again. Enter/Space use the same action. Clearing Account does not clear Client; resetting both restores Client grouping. No embedded Client/Account dropdowns or separate grouping toggle are present.
- Tables must preserve textual headers, sortable-column state, and a readable empty state.
- External Jira and Tempo links open in a new tab with safe `noopener noreferrer` behavior.

## Visual rules

- Use the existing neutral dashboard palette; color supports grouping or semantic state and must not fabricate thresholds.
- Use a clear unavailable or not-attributed state when a governed relationship is absent.
- Responsive layouts must stack panels without horizontal overflow on smaller screens.
- Business hints explain purpose, not technical implementation details.

## Change control

Any new KPI, filter, relationship, chart, table, or workflow stage requires:

1. A documented source and calculation in the Chart and Visual Specification.
2. Corresponding Datasources-tab lineage.
3. Filter, empty-state, accessibility, and data-quality behavior.
4. A rebuilt payload and validation against current source exports.
