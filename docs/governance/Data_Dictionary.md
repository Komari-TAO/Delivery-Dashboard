# Data Dictionary

## 1. Purpose

This document defines the canonical semantic data layer for the AI-Assisted Delivery Management MVP platform.

It governs:

* canonical field names
* field descriptions
* source mappings
* semantic ownership
* data types
* allowed values
* rendering placeholders

This document acts as the semantic contract for:

* dashboard logic
* KPI calculations
* reconciliation
* filtering
* visualization behavior

This document does NOT define:

* KPI formulas
* operational governance
* rendering logic
* visualization behavior

---
# 2. Canonical Placeholder Governance

Missing or unavailable values must render as:

```text id="3pcwt2"
-
```

The platform must NOT render:

* N/A
* null
* undefined
* NaN

This applies across:

* tables
* cards
* filters
* drilldowns

---

# 3. Canonical Field Definitions

| Canonical Field      | Source                        | Description                         |
| -------------------- | ----------------------------- | ----------------------------------- |
| Team                 | Assignees CSV                 | Canonical delivery team attribution |
| Skill                | Assignees CSV                 | Canonical skill attribution         |
| Assignee             | Assignees CSV / Tempo         | Canonical person mapping            |
| Account              | Jira                          | Mandatory delivery/customer grouping for normal Jira work items; a present-but-blank value is an exception |
| Program              | Jira                          | Program grouping                    |
| Delivery             | Jira Release Cycle            | Delivery release stream             |
| Target Release       | Jira                          | Planned target release              |
| Release Cycle        | Release Cycle CSV             | Governed Engineering delivery iteration |
| Release Start Date   | Release Cycle CSV             | Release Cycle start date            |
| Release End Date     | Release Cycle CSV             | Official Release Cycle Code Freeze date |
| Release Status       | Derived                       | Release Cycle temporal status       |
| Target Release End Date | Derived                    | Target Release end date             |
| Forecast Bucket      | Derived                       | Version 2.1 forecast allocation bucket |
| Allocation State     | Derived                       | Version 2.1 planning allocation status: Allocated or Unallocated |
| Planning Exception   | Derived                       | Forecasting governance exception    |
| Fix Version          | Jira                          | Jira fix version                    |
| Product Module       | Jira                          | Jira product-module classification associated with the work item; missing values render as "-" |
| Bug Severity         | Jira PI Backlog                | `Custom field (Bug Severity)` used only by the Bug Severity Distribution for Bug Issue Type values Blocker, Critical, and Major |
| Key                  | Jira / Tempo                  | Canonical work item identifier      |
| Parent Key           | Jira Hierarchy                | Parent work item key                |
| Summary              | Jira / Tempo Description List | Canonical work item summary         |
| Parent Summary       | Jira                          | Parent work item summary            |
| Status               | Jira                          | Current work item lifecycle status  |
| Priority             | Jira                          | Jira delivery priority              |
| Start Date           | Jira                          | Planned or actual start             |
| Due Date             | Jira                          | Planned delivery due date           |
| Last Worklog Date    | Tempo                         | Latest Tempo worklog date           |
| Worklog Date         | Tempo                         | Individual Tempo worklog date       |
| Capacity             | Weekly Capacity               | Planned delivery capacity           |
| Logged Engineering   | Tempo                         | Engineering delivery effort         |
| Logged Operations    | Tempo                         | Operational Tempo effort            |
| Logged Total         | Derived                       | Engineering + operational effort    |
| Billable             | Tempo                         | Billable logged effort              |
| Remaining Capacity   | Derived                       | Unused capacity                     |
| Utilization Rate     | Derived                       | Logged effort vs capacity           |
| Variance Hours       | Derived                       | Logged vs estimate delta            |
| Logged vs Estimate % | Derived                       | Estimate utilization ratio          |
| Account Attribution State | Derived                  | Account-attributed engineering, engineering attribution exception, or operational TEMPO-* effort |
| Delivery Health      | Derived                       | Operational delivery-risk state     |
| Work Items           | Jira                          | Distinct work item count            |

## Account Attribution Definitions

**Account-attributed engineering effort** is non-TEMPO Tempo work whose Account resolves directly from Jira or through the current immediate-parent fallback.

**Engineering Account-attribution exception** is non-TEMPO Tempo work whose Account cannot be resolved from Jira records available to the platform. Its cause must distinguish: a Jira key absent from the restricted extract; a Jira record present with unexpectedly blank Account; or hierarchy, normalization, join, mapping, or transformation failure. An absent extract record does not mean that the Jira ticket does not exist.

**Operational TEMPO-* effort** is valid Tempo operational work. It does not carry Jira Account metadata by design and is not an Account-attribution exception. The exact keys `TEMPO-54`, `TEMPO-92`, `TEMPO-106`, `TEMPO-111`, and `TEMPO-112` are globally excluded. The three newly added keys represent HR daily-registration and vacation records; the source does not support assigning either HR purpose to an individual new key.

The current Account resolution precedence is direct Jira Account, then immediate-parent Jira Account only if the direct key is absent from the extract and the available parent has a nonblank Account. The current MVP does not inherit when a present direct Jira record has blank Account and does not recursively traverse ancestors. See `MVP_Business_Rules.md` for business rules and `Calculation_Governance.md` for calculation scope.

---

# 4. Canonical Data Types

| Field                | Type       |
| -------------------- | ---------- |
| Team                 | String     |
| Skill                | String     |
| Assignee             | String     |
| Account              | String     |
| Program              | String     |
| Delivery             | String     |
| Target Release       | String     |
| Release Cycle        | String     |
| Release Start Date   | Date       |
| Release End Date     | Date       |
| Release Status       | String     |
| Target Release End Date | Date    |
| Forecast Bucket      | String     |
| Allocation State     | String     |
| Planning Exception   | String     |
| Fix Version          | String     |
| Product Module       | String     |
| Bug Severity         | String     |
| Current Queue        | Integer    |
| Added to Queue       | Integer    |
| Removed from Queue   | Integer    |
| Updated              | String     |
| Key                  | String     |
| Parent Key           | String     |
| Summary              | String     |
| Parent Summary       | String     |
| Status               | String     |
| Priority             | String     |
| Start Date           | Date       |
| Due Date             | Date       |
| Last Worklog Date    | Date       |
| Worklog Date         | Date       |
| Capacity             | Decimal    |
| Logged Engineering   | Decimal    |
| Logged Operations    | Decimal    |
| Logged Total         | Decimal    |
| Billable             | Decimal    |
| Remaining Capacity   | Decimal    |
| Utilization Rate     | Percentage |
| Variance Hours       | Decimal    |
| Logged vs Estimate % | Percentage |
| Delivery Health      | String     |
| Work Items           | Integer    |

---

# 5. Team Governance

Organizational/workforce Team attribution must come from:

* Assignees CSV

The following must not govern organizational/workforce Team by default:

* Jira Team fields
* Tempo Team fields

Exception semantics by table:

* Delivery Progress: Team = Jira ticket ownership
* Backlog Worked On: Team filtering = Tempo contributor activity in scope

---

# 6. Skill Governance

Skill attribution must come exclusively from:

* Assignees CSV

---

# 7. Key Governance

## Jira Items

Use Jira Issue Key.

Examples:

* AB-405
* SOLAR-1933
* HKD-1514

---

## Tempo Operational Items

Tempo operational items remain valid work-item identifiers.

Examples:

* TEMPO-30
* TEMPO-31
* TEMPO-83
* TEMPO-108

---

# 8. Summary Governance

## Jira Items

Summary comes from:

* Jira Summary

---

## Tempo Operational Items

Summary comes from:

* Tempo Description List

---

## Parent/Sub-task Fallback

If a child/sub-task lacks its own Jira summary but parent context exists:

Canonical rendering:

```text id="e9ykr0"
[Sub-task] {Parent Summary}
```

---

# 9. Status Governance

## Jira Items

Status comes from:

* Jira Status

Examples:

* To Do
* In Development
* QA
* Done
* Blocked

---

## Tempo Operational Items

Tempo-only operational items use:

```text id="x8pg5r"
Operational
```

---

# 10. Date Governance

## Start Date

Source:

* Jira Start Date

---

## Due Date

Source:

* Jira Due Date

---

## Last Worklog Date

Source:

* latest Tempo Work Date

This field must NEVER use:

* Jira Updated Date
* Jira Created Date

---

# 11. Release Cycle and Forecasting Governance

## Release Cycle

Description:

* Governed Engineering delivery iteration

Authoritative source:

* data/raw/Release Cycle.csv

Notes:

* Used to organize planning, forecasting and release-based reporting.
* Ordered chronologically using Release Start Date.

---

## Release Start Date

Description:

* Start date of the governed Engineering Release Cycle

Authoritative source:

* Release Cycle.csv

---

## Release End Date

Description:

* Official Code Freeze date for the Release Cycle

Authoritative source:

* Release Cycle.csv

Notes:

* Determines whether a Release Cycle is Current/Future or Historical.

---

## Release Status (Derived)

Allowed values:

* Future
* Current
* Historical

Description:

* Derived by comparing Release End Date with the current reporting date.

---

## Target Release

Description:

* Target Release assigned to a Jira work item

Authoritative source:

* Jira

Notes:

* Mapped to the governed Release Cycle calendar.

---

## Target Release End Date (Derived)

Description:

* Release End Date corresponding to the Target Release

Derived from:

* Release Cycle.csv

Purpose:

* Determines whether the Target Release is valid for forecasting.

---

## Forecast Bucket (Derived)

Description:

* Final allocation bucket used by Version 2.1 forecasting

Possible values:

* Target Release
* Future Due Date
* Planning Exception

---

## Allocation State Governance

### Purpose

Allocation State distinguishes allocated and unallocated future demand for Delivery Capacity Planning visibility.

### Business Semantics

Allocation State is a derived Version 2.1 forecasting field. It represents the planning allocation status of forecast demand and has only the following allowed values:

* **Allocated:** a Jira work item that has an assigned governed Jira Team and therefore represents allocated delivery demand.
* **Unallocated:** a Jira work item with no Jira Team assignment. This represents valid future demand awaiting Delivery Management allocation. It is an expected planning state, not a Planning Exception and not a data-quality error.

Allocation State does not change Remaining Estimate, Forecast Bucket, Portfolio Remaining Demand, or any other forecast value. It does not determine Planning Exceptions and does not infer Team ownership.

This forecasting-specific field does not alter the organizational/workforce Team governance in Section 5 or its table-level exceptions.

### Rules

* Allocated requires a governed Jira Team.
* Unallocated represents valid future demand without a Jira Team.
* Allocation State must never be derived from Tempo.
* Allocation State must never be inferred from historical execution.
* Allocation State must never automatically assign work to Teams.
* Delivery Management remains the sole authority for Team allocation.

### Future Roadmap

Future AI capabilities may use Allocation State when generating recommendations. Version 2.1 remains decision-support only: no recommendation may automatically allocate work or replace a Delivery Management decision.

---

## Planning Exception (Derived)

Description:

* Work item that has neither a valid future Target Release nor a Future Due Date

Notes:

* Excluded from forecast totals.
* Reported separately for governance.

---

# 12. Capacity Governance

Capacity represents:

* planned delivery availability

Source:

* Weekly Capacity CSV

---

# 13. Logged Engineering Governance

Represents:

* engineering delivery execution effort

Source:

* Tempo

Excludes:

* TEMPO-* operational activity
* TEMPO-54
* TEMPO-92
* TEMPO-106
* TEMPO-111
* TEMPO-112

---

# 14. Logged Operations Governance

Represents:

* operational Tempo activity

Source:

* Tempo

Includes:

* valid TEMPO-* activity

Excludes:

* TEMPO-54
* TEMPO-92
* TEMPO-106
* TEMPO-111
* TEMPO-112

---

# 15. Logged Total Governance

Definition:

```text id="f8u7yo"
Logged Engineering + Logged Operations
```

---

# 16. Delivery Health Allowed Values

Allowed values:

* Healthy
* At Risk
* Critical
* Overdue
* Completed
* Blocked

No other values are valid.

---

# 17. Delivery Health Semantics

| State     | Meaning                     |
| --------- | --------------------------- |
| Healthy   | >7 days remaining           |
| At Risk   | 3–7 days remaining          |
| Critical  | 0–2 days remaining          |
| Overdue   | Past due                    |
| Completed | Terminal completed state    |
| Blocked   | Paused or blocked execution |

---

# 18. Global Exclusion Governance

The following operational keys are globally excluded:

* TEMPO-54
* TEMPO-92
* TEMPO-106
* TEMPO-111
* TEMPO-112

These exclusions apply across:

* KPI calculations
* tables
* reconciliation
* utilization
* operational analytics
* Delivery Progress
* backlog calculations
* charts, filters, searches, tooltips, totals, summaries, and CSV exports
* Jira-derived planned and remaining-demand populations where these exact keys could enter

Candidate keys are normalized by trimming surrounding whitespace and converting to uppercase, then compared using exact-key matching. The exclusion occurs before aggregation, classification, enrichment, joins, reconciliation, filter population, export, or rendering. Annual Capacity and Weekly Capacity source fields remain governed exclusively by the Assignees and Weekly Capacity datasets and are not changed.

---

# 19. Week Governance

Week logic is governed exclusively by:

* Master Date CSV

The platform must NOT use:

* independent ISO week calculations

---

# 20. Backlog Semantics

Backlog represents:

```text id="0urjlwm"
Backlog Worked On
```

NOT:

* full Jira inventory
* sprint backlog inventory

Backlog inclusion requires:

* Tempo activity within selected scope

Backlog Worked On is activity-based rather than ownership-based.

Where Team context is applied to Backlog Worked On, it refers to Tempo contributor activity in scope, not Jira ticket ownership.

---

# 21. Canonical Rendering Principle

Operational activity is governed by Tempo.

Delivery metadata is governed by Jira.

Organizational/workforce Team and skill semantics are governed by Assignees CSV, except where a table explicitly uses Team to mean Jira ticket ownership or Tempo contributor activity.

Week semantics are governed exclusively by Master Date.

---
