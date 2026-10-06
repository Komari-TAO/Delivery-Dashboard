# KPI Definitions

## 1. Purpose

This document defines the canonical KPI calculation layer for the AI-Assisted Delivery Management MVP platform.

It governs:

* KPI names
* KPI formulas
* aggregation logic
* calculation semantics
* utilization formulas
* variance formulas
* KPI source mappings

This document does NOT govern:

* visualization behavior
* dashboard rendering
* operational workflow semantics
* source ownership governance
* table rendering logic

These are defined separately.

---

# 2. KPI Naming Governance

Canonical KPI names:

| Canonical KPI      | Deprecated / Non-Canonical |
| ------------------ | -------------------------- |
| Logged Total       | Actual Hours               |
| Logged Engineering | Engineering Logged         |
| Logged Operations  | Operational Logged         |
| Capacity           | Planned Capacity           |
| Utilization Rate   | Utilization                |
| Billable           | Billable Hours             |

Deprecated naming must not be used in new implementations.

---

# 3. Capacity

## Definition

Capacity represents planned delivery availability for the selected scope.

## Source

Weekly Capacity CSV

## Formula

```text id="mbl6eu"
SUM(Planned Hours)
```

## Aggregation

* summed by selected scope
* assignee-aware
* filter-aware

## Notes

Capacity follows:

* Team filters
* Assignee filters
* Skill filters
* selected reporting period

---

# 4. Logged Total

## Definition

Total logged effort after global exclusions.

This KPI combines:

* Logged Engineering
* Logged Operations

## Source

Tempo

## Formula

```text id="hjgptd"
Logged Engineering + Logged Operations
```

---

# 5. Logged Engineering

## Definition

Engineering delivery effort excluding operational Tempo activity.

## Source

Tempo

## Formula

```text id="utnlf3"
SUM(non-TEMPO worklog hours)
```

excluding:

* TEMPO-* operational items
* TEMPO-54
* TEMPO-92
* TEMPO-106
* TEMPO-111
* TEMPO-112

---

# 6. Logged Operations

## Definition

Operational and administrative delivery effort.

## Source

Tempo

## Formula

```text id="o7d4z4"
SUM(valid TEMPO-* worklog hours)
```

excluding:

* TEMPO-54
* TEMPO-92
* TEMPO-106
* TEMPO-111
* TEMPO-112

---

# 7. Account Attribution Reconciliation

## Definition

Account attribution is a visualization reconciliation population, not a KPI and not a change to Tempo effort inclusion. It separates governed effort into Account-attributed engineering effort, engineering Account-attribution exceptions, and operational TEMPO-* effort.

## Formula

```text
Governed Logged Total
= Account-attributed engineering effort
+ Engineering Account-attribution exceptions
+ Operational TEMPO-* effort
```

Tempo remains authoritative for all three effort measures. Account attribution uses Jira Account metadata under the current immediate-parent fallback documented in `MVP_Business_Rules.md`. Operational TEMPO-* effort remains a valid Logged Operations population and is not an Account-attribution exception.

---

# 8. Billable

## Definition

Total billable effort recorded in Tempo.

## Source

Tempo Billable Hours

## Formula

```text id="gvf71q"
SUM(Billable Hours)
```

## Notes

Billable is independent from:

* Capacity
* Logged Engineering
* Logged Operations

Billable reflects Tempo billing semantics only.

---

# 9. Utilization Rate

## Definition

Ratio between total logged effort and planned capacity.

## Formula

```text id="0hcl2o"
(Logged Engineering + Logged Operations) / Capacity
```

## Rendering

Display as percentage.

## Notes

Utilization must:

* respect all active filters
* inherit exclusion governance
* include operational effort unless excluded globally

---

# 10. Remaining Capacity

## Definition

Unused planned capacity after logged effort.

## Formula

```text id="2r3zlg"
Capacity - Logged Total
```

---

# 11. Logged vs Estimate %

## Definition

Relationship between logged effort and Jira original estimates.

## Formula

```text id="5r9kqg"
Logged Hours / Original Estimate Hours
```

## Rendering

Display as percentage.

## Notes

Only valid where Original Estimate exists.

---

# 12. Variance Hours

## Definition

Difference between Jira Original Estimate and Logged Hours.

## Formula

```text id="8t80yd"
Logged Hours - Original Estimate Hours
```

## Interpretation

Positive:

* logged effort exceeded estimate

Negative:

* logged effort remains below estimate

---

# 13. Work Items

## Definition

Distinct work items after active filtering.

## Canonical Source

Jira Issue Key

## Rules

Work Items:

* must respect active filters
* must respect exclusion governance
* must avoid duplicate counting

---

# 14. Last Worklog Date

## Definition

Latest Tempo Work Date for the work item within the selected scope.

## Source

Tempo Work Date

## Formula

```text id="13m7j6"
MAX(Tempo Work Date)
```

---

# 15. Delivery Health

## Definition

Operational delivery-risk indicator.

## States

### Healthy

More than 7 days remaining

### At Risk

3–7 days remaining

### Critical

0–2 days remaining

### Overdue

Past due date

### Completed

Terminal completed statuses

### Blocked

Blocked or paused statuses

---

# 16. Due-Date Metrics

## Days Remaining

Time remaining until Due Date.

## Days Overdue

Time elapsed after Due Date.

## Governance

Calculations stop for:

* Done
* Closed
* Rejected
* Abandoned
* Cancelled
* On Hold
* Blocked

---

# 17. KPI Filter Governance

All KPIs must inherit active global filters:

* Team
* Assignee
* Skill
* Date Range
* Week Number
* Delivery
* Target Release
* Fix Version
* Program
* Account
* Status

---

# 18. Exclusion Governance

The following keys are globally excluded from ALL KPI calculations:

* TEMPO-54
* TEMPO-92
* TEMPO-106
* TEMPO-111
* TEMPO-112

TEMPO-92, TEMPO-111, and TEMPO-112 represent HR daily-registration and vacation records. Their individual HR purpose is not inferred where the source data does not identify it.

These exclusions apply consistently across:

* KPI cards
* tables
* charts, filters, searches, tooltips, summaries, and exports
* reconciliation
* utilization
* operational analytics
* Backlog Worked On and Delivery Progress
* any Jira-derived planned or remaining-demand population containing one of these exact keys

Candidate issue keys are trimmed and converted to uppercase before exact-key matching. Exclusion occurs before aggregation, classification, enrichment, joins, reconciliation, or presentation. Annual Capacity and Weekly Capacity source values are unchanged; only combined calculations can change through their logged, planned, demand, or activity component.
