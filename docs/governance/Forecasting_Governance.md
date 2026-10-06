# Forecasting Governance

## 1. Purpose

This document defines the governed forecasting rules for Version 2.1 Demand Planning.

Version 2.1 focuses exclusively on future demand planning from Jira. It defines how planned future work is selected, allocated, grouped, and reconciled for forecasting purposes after the MVP freeze.

---

## 2. Scope

In scope:

* Future demand from Jira
* Forecast allocation by Target Release
* Forecast allocation by Future Due Date as fallback
* Remaining demand by Team
* Remaining demand by Assignee
* Unassigned demand
* Planning exceptions
* Forecast reconciliation validations

Out of scope:

* Tempo actual execution comparison
* Predictive risk scoring
* Historical planning maturity
* Team Intake Date
* Assignment Lead Time
* Late Intake analysis
* Promoter behavior analysis
* AI recommendations

---

## Forecast Planning Horizon

Version 2.1 forecasting is future-oriented.

The planning horizon begins on the day after the current reporting date and extends to the latest planned work available.

The dashboard must support forecasting through at least 31 December 2026.

If governed Jira work items exist beyond 31 December 2026, the planning horizon must automatically extend to include the latest future Target Release or Future Due Date.

Historical reporting date filters must not limit future forecasting.

---

## 3. Authoritative Source

Jira is the authoritative source for Version 2.1 forecasting.

Tempo must not be used for forecasting in Version 2.1 because forecasting concerns planned future work, not historical execution.

Tempo may be used in later versions to compare forecasted demand against actual execution.

Authoritative Jira fields:

* Original Estimate
* Remaining Estimate
* Target Release
* Due Date
* Team
* Assignee
* Status

Remaining Estimate is the authoritative demand value for Version 2.1 forecasting.

Original Estimate is retained for reconciliation, estimation analysis, historical comparison and future Planning Intelligence capabilities.

Version 2.1 forecasting must calculate future demand using Remaining Estimate.

Before any Jira item can enter a forecasting candidate population, the globally excluded exact keys TEMPO-54, TEMPO-92, TEMPO-106, TEMPO-111, and TEMPO-112 must be removed after trimming surrounding whitespace and converting the candidate key to uppercase. These HR/absence/legal-registration items contribute no demand. Exact matching must not remove near matches such as TEMPO-540. This rule preserves the global analytical boundary and does not start or expand the parked Version 2.1 implementation.

---

## 4. Forecasting Principle

Each Jira work item must be allocated once and only once.

A work item must never be allocated to both Target Release and Due Date.

Target Release always takes precedence when it is valid and in the future.

### Completed Work Exclusion

Work items in terminal statuses must not contribute to future demand regardless of Remaining Estimate.

Examples include:

* Done
* Closed
* Cancelled
* Rejected
* Abandoned

The exact terminal statuses must remain aligned with the existing MVP business governance.

The forecasting engine must never forecast completed work.

---

## 5. Planning Precedence

A Target Release references a governed Release Cycle. The Release Cycle calendar determines whether that Target Release is Current, Future, or Historical.

Forecast allocation must follow this priority:

1. Future Target Release

If a valid future Target Release exists, allocate the work item only to that Target Release.

2. Future Due Date

If there is no valid future Target Release, including backports where the Target Release belongs to an earlier release, and a Future Due Date exists, allocate the work item only to the Future Due Date.

If the Target Release maps to a historical Release Cycle whose End Date is earlier than the current reporting date, it is treated as a backport and the Future Due Date fallback applies.

3. Planning Exception

If neither a Future Target Release nor a Future Due Date exists, classify the work item as a Planning Exception.

Planning Exceptions:

* are excluded from forecasting
* appear in a dedicated Planning Exceptions validation table
* represent planning or data-quality issues to correct

---

## 6. Forecast Bucket Examples

Current planning period: July 2026

| Target Release | Due Date | Forecast Bucket |
|---|---:|---|
| release-2026-09 | 15 Aug 2026 | release-2026-09 |
| release-2026-03 (backport) | 18 Jul 2026 | 18 Jul 2026 |
| release-2026-03 (backport) | 10 Oct 2026 | 10 Oct 2026 |

---

## 7. Forecast Inputs

Use:

* Original Estimate
* Remaining Estimate
* Future Target Release
* Future Due Date as fallback only
* Team
* Assignee

---

## 8. Forecast Outputs

Produce:

* Portfolio Remaining Demand
* Demand by Target Release
* Demand by Future Due Date
* Demand by Team
* Demand by Assignee
* Unassigned Demand
* Planning Exceptions

---

## 9. Team View

Display Remaining Demand grouped by Team.

Include:

* every governed Team
* allocated demand
* Unallocated Demand, displayed separately

Team views include both allocated demand and Unallocated Demand. Missing Team values must not be interpreted as invalid planning data.

### Unallocated Demand

Unallocated Demand represents valid future Jira demand that has not yet been assigned to a delivery Team.

Unallocated Demand is an expected planning state. It is not an error and it is not a Planning Exception.

Unallocated Demand must remain visible in all applicable forecasting outputs and contributes to Portfolio Remaining Demand.

### Delivery Management Ownership

Team allocation is an operational Delivery Management decision. Delivery Management is the sole authority for Team allocation.

The platform provides planning visibility only. It must never automatically assign work to Teams, infer Team ownership from historical execution, or allocate demand based solely on available capacity.

If allocation recommendations are introduced in future AI capabilities, they remain advisory only and never replace Delivery Management decisions. No AI allocation behaviour is part of Version 2.1 forecasting.

---

## 10. Assignee View

Display Remaining Demand grouped by Assignee.

Include:

* every governed Assignee
* Unassigned

The Unassigned row represents work without an Assignee.

The Unassigned row should be highlighted using a subtle pastel red background to draw attention.

---

## 11. Validation Rules

The following reconciliations must hold:

```text
Portfolio Remaining Demand =
Demand by Target Release +
Demand by Future Due Date
```

Where Demand by Future Due Date contains only work items without a valid future Target Release.

```text
Portfolio Remaining Demand =
Demand by Team
```

```text
Portfolio Remaining Demand =
Demand by Assignee
```

```text
Unassigned Remaining Demand by Team =
Unassigned Remaining Demand by Assignee
```

```text
Forecast Remaining Demand +
Planning Exceptions =
Total Remaining Demand
```

Where:

* Forecast Remaining Demand = items successfully allocated according to the planning precedence
* Planning Exceptions = items with neither a valid future Target Release nor a Future Due Date

---

## 12. Version Separation

Version 2.1 Demand Planning answers:

How much work is planned, when is it expected, and who currently owns it?

Version 2.2 Planning Intelligence answers:

Did the work reach the delivery teams early enough for effective planning and execution?

The forecasting engine must not depend on Version 2.2 capabilities.

---

## 13. Deferred Capabilities

Deferred capabilities:

* Team Intake Date or equivalent
* Assignment Lead Time
* Late Intake analysis
* Last-minute request analysis
* Planning maturity metrics
* Promoter behavior analysis

---

## 14. Business Rationale

Forecasting and Planning Intelligence are separate capabilities.

Version 2.1 must remain deterministic, governed, explainable, and independent from unreliable historical assignment data. It must forecast planned future demand using governed Jira fields only, without depending on execution history, inferred planning behavior, or predictive logic.

---

## 15. Non-Negotiable Rules

* Do not use Tempo for Version 2.1 forecasting.
* Do not allocate a work item more than once.
* Do not allocate a work item to both Target Release and Due Date.
* Do not infer missing planning dates.
* Do not fabricate Team or Assignee values.
* Do not include Planning Exceptions in forecast totals.
* Do not implement predictive logic in Version 2.1.
* Do not depend on Team Intake Date for Version 2.1.
* Do not restrict forecasting to the dashboard reporting date range.
* The forecast horizon must extend dynamically to include all governed future planning data.
* Do not allow any globally excluded exact issue key to enter forecast demand.
