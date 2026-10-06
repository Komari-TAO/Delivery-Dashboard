# Semantic Visualization Governance

## 1. Purpose

This document defines the canonical visualization and rendering behavior for the AI-Assisted Delivery Management MVP platform.

It governs:

* dashboard behavior
* table semantics
* rendering rules
* filter behavior
* tab behavior
* placeholder rendering
* date rendering
* visualization consistency
* color semantics
* operational rendering logic

This document does NOT define:

* KPI formulas
* source ownership
* operational governance
* business rules

These are governed separately.

---

# 2. Global Visualization Principles

Dashboard visuals must follow:

* McKinsey / BCG consulting style
* minimalist design
* low visual clutter
* white/light backgrounds
* soft low-saturation colors
* strong readability
* operational clarity

The dashboard must prioritize:

* readability
* delivery visibility
* operational scanning
* reconciliation clarity

over decorative visualization.

---

# 3. Global Filter Governance

Global filters apply across:

* KPI cards
* charts
* tables
* drilldowns

unless explicitly excluded.

---

# 4. Global Filter Set

Canonical global filters:

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

All new tabs and tables must inherit this filter framework.

---

## 4.1 Current Approved Filter and Visualization Implementation

Date Range applies to historical execution metrics using Tempo Work Date. It drives Capacity through membership of the selected dates in Master Date weeks, and must not constrain Remaining Demand.

Remaining Demand is shown as a current Jira snapshot and is intentionally independent of Date Range.

Account Distribution is an Account-attribution visualization, not a complete Tempo reconciliation visual. Jira Status must not remove historical governed Tempo effort from the applicable logged-effort scope. The treemap displays only Account-attributed engineering effort; engineering attribution exceptions and operational TEMPO-* effort remain in governed totals but are not treemap categories.

Release Cycle governance remains approved for future implementation; the control is currently hidden. No visible dashboard surface may imply that Release Cycle filtering is currently implemented.

---

## 4.2 Account Distribution and Attribution Footer

The Account Distribution treemap represents **engineering Tempo effort attributable to valid Jira Accounts**. It includes only governed non-TEMPO worklogs with a valid direct Jira Account or a valid immediate-parent Account fallback under the current MVP rule.

It must exclude operational TEMPO-* activity, Jira-style work absent from the current restricted Jira extract, present-but-blank Jira Accounts, unresolved hierarchy or join failures, and the globally excluded exact keys `TEMPO-54`, `TEMPO-92`, `TEMPO-106`, `TEMPO-111`, and `TEMPO-112`. It must not render `(No Account)`, Operational, Unmapped, or any exception category as an Account tile.

The compact footer beneath the treemap reports only the same unresolved non-TEMPO engineering subset excluded from the treemap:

> Account attribution exception: {distinct engineering Jira issue count} engineering Jira work items ({logged hours} h) could not be attributed using the current Jira source extract. Operational TEMPO-* activities are excluded.

The footer values are dynamic, use distinct normalized Jira issue keys, and are hidden when the exception population is zero. They must not claim that an absent-extract ticket does not exist or that Account is blank unless that is proven. Operational TEMPO-* activities are never footer exceptions.

Date Range, Team, Assignee, Skill, and applicable Tempo-derived filters may apply to both attributed and unattributed work. Jira-dependent filters cannot reliably classify work absent from the extract; the platform must not invent metadata, and filtering such a record out must not be interpreted as resolving it.

---

# 5. Placeholder Rendering Governance

Missing or unavailable values must render as:

```text id="4s2g0n"
-
```

The platform must NOT render:

* N/A
* null
* undefined
* NaN

---

# 6. Color Governance

Use subtle low-saturation colors only.

Avoid:

* aggressive red/green saturation
* neon colors
* heavy gradients
* decorative effects

---

# 7. Details Section Governance

Canonical Details tabs:

1. Account
2. People
3. Backlog
4. Delivery Progress
5. Bug Triage

Bug Triage is an approved operational-investigation tab. No additional tabs should be added without governance review.

---

# 8. Account Table Governance

## Purpose

Represents delivery effort distribution by account/project grouping.

---

## Canonical Columns

1. Account
2. Original Estimate
3. Logged Hours
4. Variance Hours
5. Logged vs Estimate %
6. Work Items

---

## Rendering Rules

Variance:

* positive = over estimate
* negative = under estimate

Percentages:

* render as percentages
* preserve decimal precision consistency

---

# 9. People Table Governance

## Purpose

Represents assignee-level capacity and delivery effort.

---

## Canonical Columns

1. Assignee
2. Team
3. Capacity
4. Logged Total
5. Logged Engineering
6. Logged Operations
7. Utilization Rate
8. Billable
9. Work Items

---

## Rendering Rules

People table is:

* assignee-focused
* operationally aggregated

The People table must NOT:

* display duplicated assignee rows
* derive teams from Jira or Tempo

---

# 10. Backlog Governance

## Purpose

Represents:

* Backlog Worked On

This is NOT:

* a full Jira inventory
* a sprint board
* a release inventory

---

## Inclusion Logic

Backlog inclusion requires:

* Tempo activity during selected scope

Jira metadata enriches rows but does not govern inclusion.

Backlog Worked On uses an activity-based Team semantic.

Where Team context is applied to Backlog Worked On, it refers to Tempo contributor activity in scope rather than Jira ticket ownership.

---

## Canonical Columns

1. Parent Key
2. Parent Summary
3. Child Key
4. Child Summary
5. Work Item Type
6. Product Module
7. Status
8. Start Date
9. Due Date
10. Last Worklog Date
11. Priority
12. Target Release
13. Fix Version

Product Module is read-only Jira metadata. It is displayed between Work Item Type and Status and has no calculation, filtering, grouping, or row-inclusion role.

---

## Tempo Operational Rendering

Tempo-only operational rows use:

* Status = Operational
* Jira-derived fields = "-"

---

## Parent/Sub-task Rendering

If a Jira child/sub-task lacks its own summary:

Render:

```text id="nl3c5z"
[Sub-task] {Parent Summary}
```

while preserving:

* original child key
* parent-child traceability

---

## Backlog Rendering Principle

Backlog rendering prioritizes:

* operational activity visibility
* worklog traceability
* delivery context

over strict Jira hierarchy rendering.

---

# 11. Delivery Progress Governance

## Purpose

Represents operational delivery-risk monitoring.

This is NOT:

* a percentage completion tracker
* a burndown chart
* a story-point tracker

---

## Canonical Columns

1. Account
2. Team
3. Key
4. Summary
5. Status
6. Priority
7. Start Date
8. Due Date
9. Last Worklog Date
10. Days to Due
11. Delivery Health

---

## Team Semantics

In Delivery Progress, Team means Jira ticket ownership.

Tempo contributor teams may contribute activity to the work item, but they must not overwrite the Team shown in Delivery Progress.

---

## Assignee Governance

Delivery Progress must NOT display:

* Assignee columns

Reason:

* work items may contain multiple operational assignees
* readability degrades significantly

Assignee filtering remains available globally.

---

## Days-to-Due Rendering

Examples:

* 6d remaining
* 1w 1d remaining
* 2d overdue

The platform must NOT display:

* raw negative numbers
* cryptic deltas

---

## Status Stop Logic

Countdown calculations stop for:

* Done
* Closed
* Rejected
* Abandoned
* Cancelled
* On Hold
* Blocked

---

## Delivery Health Rendering

Allowed states:

* Healthy
* At Risk
* Critical
* Overdue
* Completed
* Blocked

---

## Delivery Health Colors

| State     | Rendering   |
| --------- | ----------- |
| Healthy   | Soft green  |
| At Risk   | Soft amber  |
| Critical  | Soft orange |
| Overdue   | Soft red    |
| Completed | Grey/green  |
| Blocked   | Grey/purple |

---

# 12. Bug Triage Governance

## Purpose

Bug Triage is a read-only, inventory-based operational queue for distinct Jira Bugs in the dedicated latest `Bug Triage_*` export.

It is not a KPI, calculation, reconciliation, aggregation, grouping, or forecasting surface.

## Inclusion and Team Semantics

The dedicated Bug Triage Jira export governs queue membership and Jira metadata. Every distinct valid exported key appears once by default, including unassigned issues, unmapped-assignee issues, and issues with no Tempo worklogs. The general Jira backlog export and Tempo activity must not determine membership. Tempo operational keys must not appear.

Bug Triage inherits the existing Details search behavior and established applicable Jira metadata filters. Its inventory membership and displayed values are not affected by Tempo, worklog, or activity filters. Team, Assignee, and Skill may filter queue rows through the Jira-export Assignee and Assignees CSV mapping. Jira metadata filters apply only where that metadata exists in the dedicated export; Bug Severity is not a global filter.

Team uses the governed organizational/workforce mapping from the Assignees CSV. Jira Team and Tempo Team fields must not be used or inferred. An unavailable or unmapped Assignee renders Team as `-` without removing the row.

## Canonical Columns

1. Key
2. Summary
3. Bug Severity
4. Status
5. Updated
6. Assignee
7. Team

Key, Summary, Bug Severity, Status, Updated, and Assignee are displayed directly from the dedicated export. Missing values render as `-`; no fallback or parent inheritance is permitted. Fields absent from the dedicated export are not displayed as placeholder columns. Updated is displayed exactly as stored in Jira and is not derived from Tempo. Assignee renders as `-` when unavailable. Team follows the Assignees CSV mapping. Tempo-derived columns are not permitted.

The default order is Bug Severity: Blocker, Critical, Major, Medium, Low, Enhancement, then `-`; Jira Key provides the deterministic order within each severity. User-sortable columns remain available.

The validation process writes assigned Jira issues without an Assignees CSV match to `outputs/bi_dashboard/bug_triage_unmapped_assignees.csv`. This governance report does not participate in table rendering or dashboard behavior.

## Snapshot Comparison Banner

A compact informational banner appears immediately above the Bug Severity Distribution chart. It provides the shared operational context for both that chart and the Bug Triage Details table. There is one governed snapshot-comparison dataset and one rendered banner; comparison calculations must not be duplicated.

The banner displays Full Bug Triage queue and, when an immediately previous `Bug Triage_*` export exists, Added to queue and Removed from queue. Added uses a soft red upward arrow; Removed uses a soft green downward arrow. The banner must remain visually subordinate to the Bug Triage module and must not use KPI cards or tiles.

The latest dated Bug Triage export is the current complete snapshot and the second latest is the previous complete snapshot. Current Queue, Added to queue, and Removed from queue are determined only through distinct Jira Issue Key set comparison. Summary, Bug Severity, Status, Updated, Assignee, Team, and all other fields do not participate.

The banner is informational, not a KPI. Its values describe complete successive Bug Triage exports rather than currently filtered table rows, and are not affected by Team, Assignee, global filters, Details search, or table sorting. Added to queue does not mean a Bug was created; Removed from queue does not mean a Bug was fixed, closed, or resolved. Bugs created and removed between two exports may not be observable. If no previous snapshot exists, the banner displays `No previous complete Bug Triage snapshot available.` without error.

---

## Bug Severity Distribution

Bug Severity Distribution is a display-only horizontal bar chart of the latest complete dedicated Bug Triage export. It counts each distinct nonblank Jira Issue Key once and excludes missing Bug Severity values. It is independent of all global filters and does not introduce a Bug Severity filter or severity legend.

Only severity categories with a count greater than zero render. Rendered categories preserve this canonical Jira order and must never be sorted alphabetically or by count:

1. Blocker
2. Critical
3. Major
4. Medium
5. Low
6. Enhancement

The severity color scale is an ordered operational cue, not a KPI threshold. Blocker uses the strongest muted red; Critical uses a medium muted red; Major uses a lighter muted red. If Medium, Low, or Enhancement appear in future snapshots, they use progressively lighter muted red shades. Saturated traffic-light colors, gradients, neon colors, and decorative effects are not permitted.

The approved executive visualization layout is:

1. Row 1: Hours Trend | Planned vs Unplanned Effort
2. Row 2: Program Distribution | Bug Severity Distribution

Each paired row must have equal chart-panel width and height, matching panel padding, header spacing, chart-frame structure, and footer spacing. The layout must remain responsive and stack vertically without horizontal overflow on smaller screens. Program Distribution, Planned vs Unplanned Effort, and Hours Trend retain their existing governed semantics.

Bug Severity Distribution uses no Tempo, backlog, capacity, historical snapshot, Team mapping, KPI, calculation, reconciliation, or filter input. It does not change the Bug Triage Details table, shared snapshot banner, search, CSV export, dashboard filters, Account Distribution, Delivery Progress, Backlog, reconciliation, or Tempo exclusions.

---

# 13. Date Rendering Governance

Dates must:

* remain human-readable
* follow consistent formatting
* support operational scanning

Avoid:

* verbose timestamps
* inconsistent localization
* mixed formatting styles

---

# 14. Reconciliation Rendering Governance

Dashboard rendering must support:

* reconciliation transparency
* operational traceability
* duplicate detection
* exclusion visibility

The platform must avoid:

* silent row removal
* hidden exclusion behavior
* implicit aggregation ambiguity

---

# 15. Visualization Consistency Governance

New visualizations must preserve:

* existing filter behavior
* exclusion logic
* Team governance
* Master Date governance
* Tempo/Jira semantic ownership

No visualization may independently redefine:

* weeks
* team attribution
* operational exclusions
* work-item semantics

The global five-key exclusion is resolved before visualization data reaches filters or rendering. Candidate keys are trimmed, converted to uppercase, and matched exactly. None of the five keys may appear in a chart category, tooltip, total, summary, filter option, search result, Accounts row, People row, Backlog Worked On row, Delivery Progress row, or CSV export. TEMPO-92, TEMPO-111, and TEMPO-112 are governed collectively as HR daily-registration and vacation records without inferring an individual purpose. Valid operational TEMPO-* items outside the five-key set remain operational activity. Bug Triage remains governed only by its dedicated Jira export and is unchanged.

---

# 16. Future Visualization Governance

Future AI and analytics layers must preserve:

* operational traceability
* semantic consistency
* reconciliation integrity
* filter consistency
* visualization readability
* governance alignment
