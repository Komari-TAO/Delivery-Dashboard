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
| Bug Severity         | Jira Bug Triage export         | Read-only bug-severity metadata from the dedicated Bug Triage queue; allowed values are Blocker, Critical, Major, Medium, Low, and Enhancement; missing values render as "-" |
| Bug Triage Queue     | Jira Bug Triage export         | Inventory-based operational Bug Triage membership; one row per distinct exported Jira key |
| Current Queue        | Derived                        | Number of distinct Jira Issue Keys in the latest Bug Triage export |
| Added to Queue       | Derived                        | Distinct Jira Issue Keys present in the latest Bug Triage export but absent from the immediately previous export |
| Removed from Queue   | Derived                        | Distinct Jira Issue Keys present in the immediately previous Bug Triage export but absent from the latest export |
| Updated              | Jira Bug Triage export         | Jira Updated value displayed exactly as stored in the dedicated Bug Triage queue; missing values render as "-" |
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
| Bug Triage Queue     | String     |
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

Candidate keys are normalized by trimming surrounding whitespace and converting to uppercase, then compared using exact-key matching. The exclusion occurs before aggregation, classification, enrichment, joins, reconciliation, filter population, export, or rendering. Annual Capacity and Weekly Capacity source fields remain governed exclusively by the Assignees and Weekly Capacity datasets and are not changed. Bug Triage remains independent and Tempo-free.

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

# 22. Bug Severity Governance

Bug Severity is Jira-owned, read-only metadata for operational Bug Triage only.

Source field in the dedicated Jira Bug Triage export:

* `Custom field (Bug Severity)`

Allowed values:

1. Blocker
2. Critical
3. Major
4. Medium
5. Low
6. Enhancement

Bug Severity is displayed exactly as stored. The dashboard may suppress zero-count severity categories in visualizations while preserving the canonical order above. Bug Severity has no fallback, parent inheritance, filtering, grouping, aggregation, KPI, calculation, or reconciliation role.

---

# 23. Bug Triage Queue Governance

Bug Triage is an inventory-based Jira operational queue. Its authoritative source is the latest dedicated `Bug Triage_*` export in `data/raw/`, not the general Jira PI backlog export and not Tempo activity.

For this queue, Key, Summary, Bug Severity, Status, Updated, and Assignee are direct Jira-export values. No parent inheritance, general-backlog fallback, or Tempo enrichment is permitted. A field absent from the dedicated export is not represented by a placeholder table column.

Each distinct valid Jira key in that export appears once. Unassigned issues, unmapped-assignee issues, and issues with no Tempo worklogs remain visible. Missing Assignee, Team, or Bug Severity values render as `-`.

Updated is Jira-owned metadata from the dedicated export and is displayed exactly as stored. It is never derived from Tempo.

Team is resolved from the Assignees CSV using the Jira-export Assignee. If Assignee is blank, Assignee and Team render as `-`. If Assignee exists but is absent from the Assignees CSV, the Jira Assignee is preserved, Team renders as `-`, and the row remains visible. Jira Team and Tempo Team must not be used or inferred. Tempo does not participate in Bug Triage. The queue does not introduce a KPI, calculation, reconciliation population, global filter, or future AI Bug Intelligence capability.

Unmapped assigned rows are written to `outputs/bi_dashboard/bug_triage_unmapped_assignees.csv` with fields Jira Key, Summary, Jira Assignee, and Reason. The governed Reason value is `Assignee not found in Assignees CSV`. This output is a validation artifact and is not a dashboard data source.

---

# 24. Bug Triage Jira Export Dataset

## Dataset Definition

| Attribute | Definition |
| --- | --- |
| Dataset | Bug Triage Jira Export |
| Purpose | Current operational Bug Triage queue |
| Authoritative source | Dedicated Jira Bug Triage CSV export |
| Refresh behavior | The latest export replaces the previous operational queue |
| Historical behavior | Intentionally non-historical; previous exports participate only in the immediately previous snapshot comparison |

## Field Source Ownership

| Field | Authoritative source | Ownership notes |
| --- | --- | --- |
| Key | Jira Bug Triage export | Canonical Jira Issue Key |
| Summary | Jira Bug Triage export | Jira Summary exactly as exported |
| Bug Severity | Jira Bug Triage export | Jira-owned metadata using the canonical values in Section 22 |
| Status | Jira Bug Triage export | Jira Status exactly as exported |
| Updated | Jira Bug Triage export | Jira Updated value exactly as exported |
| Assignee | Jira Bug Triage export | Jira Assignee exactly as exported; blank values render as `-` |
| Team | Assignees CSV | Derived only through governed mapping of the Jira-export Assignee; never derived from Jira or Tempo |

## Snapshot-Derived Fields

The following fields are derived by the dashboard and are not stored in Jira:

| Derived field | Definition |
| --- | --- |
| Current Queue | Number of distinct Jira Issue Keys in the latest Bug Triage export |
| Added to Queue | Distinct Jira Issue Keys present in the latest export but absent from the immediately previous export |
| Removed from Queue | Distinct Jira Issue Keys present in the immediately previous export but absent from the latest export |

The comparison represents changes between two complete Bug Triage snapshots only. Added to Queue does not mean Bug created or Bug opened. Removed from Queue does not mean Bug fixed, resolved, or closed.

## Dataset Scope Boundary

The Bug Triage Jira Export dataset does not contain historical bug states, bug lifecycle history, bug trends, bug ageing, MTTR, or reopened history.
