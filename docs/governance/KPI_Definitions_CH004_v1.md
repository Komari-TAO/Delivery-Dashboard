# KPI Definitions

> **CH-004 v1 — Step 4 local review candidate, 2026-11-03. Not canonical; promotion pending Delivery Management review.**
> Canonical source: `docs/governance/KPI_Definitions.md`; GitHub reference `feature/initial-dashboard-import` pinned to `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a`. Exact blob/version, scoped G1 approval, G2/G3 corrections, G4–G10 limitations and validation: [Step 4 report](../audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md). Revision history: pinned canonical → CH-004 v1; no calculation or application-behavior change.

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

Jira Account attribution is a retained reconciliation diagnostic partition, not a KPI or the Tempo Account Distribution eligibility rule. It separates governed effort into Jira Account-attributed engineering effort, engineering Jira Account-attribution exceptions, and operational TEMPO-* effort. Existing partition names in the formula below are retained.

## Formula

```text
Governed Logged Total
= Account-attributed engineering effort
+ Engineering Account-attribution exceptions
+ Operational TEMPO-* effort
```

Tempo remains authoritative for all three effort measures. Account attribution uses Jira Account metadata under the current immediate-parent fallback documented in `MVP_Business_Rules.md`. Operational TEMPO-* effort remains a valid Logged Operations population and is not an Account-attribution exception.

**Approval boundary:** Delivery Management G1 approval supersedes Jira Account-restricted treemap eligibility and exception-only footer rules for Account Distribution only. It does not approve unrelated historical changes or alter KPI formulas, Jira demand, exclusions, Team, Status, hierarchy, capacity, or other visualizations.

Client = verified Tempo `Account Customer`. Account = Tempo `Account Key` identity and `Account Name` display. Reporting Account = independent existing mixed Jira/Tempo compatibility dimension. Jira Account = Jira metadata and retained attribution diagnostics; matching names do not establish a Jira/Tempo bridge.

Tiles contain governed managed, nonexcluded, nonoperational Tempo worklogs, including explicit missing-attribution buckets. Operational `TEMPO-*` effort is excluded from tiles by the existing issue-key classifier, never by Client/Account names. All three footer values use one applicable Client/Account-filtered Tempo scope: Total logged hours, Operational Tempo hours, and Customer/account effort. Reporting Account and Jira Status do not filter this visual. Date Range, Team, Assignee, Skill, Client, Account Category, Priority, Target Release, Program and existing Release Cycle state apply where implemented; active Tempo Account keys are then applied. The UI footer phrase `global filters` refers to this consumer-specific scope. Changing grouping alone preserves eligible worklogs; applying Client or Account filters can change populations and totals. Missing Client displays `-` in tiles (`N/A` in the Client picker); missing Account Key remains a `-` bucket. Only positive aggregate-hour buckets render (`logged > 0`); negative-adjustment conservation remains unapproved/unvalidated (G6).

The validated CH-004 snapshot is Total Logged 51,806.039 h = Operational Tempo 8,263.271 h + Customer/Account effort 43,542.768 h. Client and Account grouping conserve the same unfiltered nonoperational effort; Client/Account filtering may narrow it. Reporting Account can describe a different population. These observations are not KPI constants or proof of historical reconciliation.

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

Active filters are inherited only where the consumer and measure support them. References elsewhere in this retained document to “all active filters” mean all **applicable** filters under this section; formulas are unchanged.

| Consumer / measure | Existing filter applicability retained |
| --- | --- |
| Account Distribution tiles and all three footers | Applicable Tempo scope plus Client and active Tempo Account keys; ignores Reporting Account and Jira Status. |
| Other Portfolio logged-effort consumers | Existing Date/workforce/Client/Jira-metadata and Reporting Account predicates; governed logged effort remains Status-independent. Tempo Account selection does not filter these consumers. |
| Jira counts, estimates, demand and workflow | Existing consumer-specific Jira predicates, including Status where implemented; Client uses complete single-customer direct Tempo evidence, with unresolved Jira-only items under `N/A`. No Tempo Account ownership is inferred. |
| Annual Gross Workforce Hours | Existing Team/Assignee/Skill roster scope and compatible reporting-year checks; no Client/Account allocation or date proration of annual amounts. |
| Portfolio Actual Hours, Gross Annual Hours Balance, Logged Hours / Gross Annual Hours | Existing governed actual-effort numerator; applicable dates, workforce, Client, Reporting Account and effort predicates; Status ignored. Tempo Account has no effect. Annual denominator keeps its existing annual roster/year rules. |
| Annual Development Capacity and Demand Capacity cards | Existing full-source behavior; sidebar selections do not allocate these sources to a Client or Tempo Account. |
| Weekly capacity / Demand capacity coverage | Existing Master Date/workforce/horizon rules. Client and Jira metadata can scope demand without allocating capacity; panel-specific exceptions remain. |
| Demand Delivered Features KPIs | Existing full-source values; ignore Demand picker selections. |
| Accounts detail table and snapshot CSV | Existing mixed-source Reporting Account grouping and predicates; Client where already supported. Tempo Account selection has no effect. |

The sidebar distinguishes Client, Tempo Account and Reporting Account. Legacy Account wording elsewhere means the existing Reporting Account / Jira Account consumer, not universal Tempo Account filtering. Jira Status may scope lifecycle/demand measures but does not reduce governed logged effort. No Jira-only demand is assigned a Tempo Account by name equality. Team semantics, parent-child inheritance and Master Date remain unchanged.

See [CH-004 dictionary](Data_Dictionary_CH004_v1.md#22-ch-004-client-account-and-reporting-account) for exact identities and [visual specification](../user-guides/Chart_and_Visual_Specification_CH004_v1.md#account-distribution-accounttreemap) for the Account Distribution contract.

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
