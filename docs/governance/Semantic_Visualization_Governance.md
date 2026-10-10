# Semantic Visualization Governance

## Purpose

This document defines the rendering and interaction principles for the active browser dashboard. It does not duplicate field-level calculations; [Chart and Visual Specification](../user-guides/Chart_and_Visual_Specification.md) is the authoritative source for those rules.

## Core principles

- Every displayed measure must be traceable to named CSV fields or a documented derived calculation.
- Missing, unmapped, unavailable, and `Other/Blank` values remain visible rather than being silently converted to zero.
- Charts provide a decision-oriented summary; details retain the source work-item context needed for follow-up.
- A global filter must use the same governed dimension values wherever that filter is offered.
- Direct relationships must not be presented as hierarchy roll-ups. In particular, Epic Workflow shows direct Tempo-to-Epic matches only.

## Tabs

### General KPI cards

The six general KPI cards are permanently visible above the tabs and remain fixed source measures. They do not change with active tab or filters.

### Portfolio

Portfolio represents actual and historical delivery effort. Its filter rail, charts, and detail tables use the governed Tempo, Jira, capacity, and Assignees dimensions. Detail tables support sorting and grouping. Jira and Tempo links are rendered only when the required destination identifier is known.

### Demand Management

Demand Management represents actual effort, known future demand, capacity, delivery workflow position, and release context. It is demand visibility, not forecasting.

Its filter rail uses searchable multi-select controls. The shared Client filter uses Tempo Client values; Business Area uses a Jira Promoter **or** Reporter match to the Promoters mapping. Unmatched values are explicitly represented as `Other/Blank`.

Epic Workflow uses Jira Issue Type = Epic, Epic Lab, or Epic Release. A card and its inline detail represent Jira rows in the selected stage. Logged hours are direct Jira Issue key to Tempo Work Item Key matches only; descendant hierarchy attribution is not implied.

### Datasources

The Datasources tab exposes current payload freshness, source status, data-quality warnings, relationships, fallbacks, and tab-specific lineage. It is a concise operational view; the Chart and Visual Specification contains the detailed field contract.

## Interaction and accessibility

- All picker controls must expose a descriptive label, selection count, Select All, Clear All, and keyboard-usable search where the value list can be long.
- Chart labels, legends, and tooltips must state the measured unit or count.
- Clicking a chart category may apply only the matching documented filter; it must not introduce an undocumented calculation.
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
