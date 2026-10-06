# MVP Business Rules

## 1. Purpose

This document defines the canonical business and operational governance rules for the AI-Assisted Delivery Management MVP platform.

It governs:

* operational semantics
* source ownership
* inclusion and exclusion rules
* reconciliation behavior
* backlog governance
* Tempo operational activity handling
* Master Date governance
* delivery-management operational logic

This document does NOT define:

* KPI formulas
* visualization rendering behavior
* UI/UX logic
* dashboard styling
* chart rendering rules

These are governed separately.

---

# 2. Authoritative Data Sources

## Tempo

Tempo is the authoritative source for:

* logged effort
* billable effort
* operational activity
* worklog dates
* worklog-level operational tracking

Tempo governs:

* Logged Engineering
* Logged Operations
* Billable
* Last Worklog Date
* worklog-driven backlog activity

---

## Jira

Jira is the authoritative source for:

* issue metadata
* issue lifecycle
* status
* priority
* summaries
* start dates
* due dates
* release metadata
* Product Module
* Bug Severity
* issue hierarchy

Jira governs:

* Key
* Summary
* Status
* Priority
* Start Date
* Due Date
* Delivery
* Target Release
* Fix Version
* Product Module
* Bug Severity
* Parent-child relationships

---

## Weekly Capacity CSV

The Weekly Capacity source is authoritative for:

* planned capacity
* planned hours
* assignee-level capacity allocation

This source governs:

* Capacity
* planned effort calculations

---

## Assignees CSV

The Assignees CSV is authoritative for:

* Team attribution
* Skill attribution
* canonical assignee mapping

By default, organizational/workforce Team attribution must not come from:

* Jira Team fields
* Tempo Team fields

This organizational/workforce Team governance applies unless a table explicitly defines a different Team semantic for ownership or activity context.

Work items without a mapped assignee/team in the Assignees CSV are outside the managed Delivery Management scope for this MVP.

Bug Triage is an explicit table-level exception for operational queue visibility: an exported Bug Triage Jira issue remains visible when it is unassigned or its Assignee has no Assignees CSV Team mapping. The table renders Team as `-` and reports the mapping exception; it does not remove the queue row.

---

## Master Date CSV

Master Date governs:

* week logic
* workday boundaries
* reporting calendar alignment

Week logic must NEVER rely on independent ISO calculations.

All week-based filtering must follow Master Date governance.

---

# 3. Valid Jira Project Scope

The following Jira issue families are valid delivery work when they appear in Tempo activity and can be mapped through Assignees CSV governance:

* AUT-*
* AB-*
* INF-*
* RFE-*
* ENG-*
* OATSD-* when the item is governed delivery work and mapped to a governed assignee/team; this does not create a Support Account or current support-activity classification
* Other Jira keys present in the governed Jira export and mapped through Assignees CSV

ENG project work items are valid delivery backlog items.

ENG-* issues must be treated the same as AUT-*, INF-*, AB-*, RFE-* and other governed Jira work items when present in Jira exports or Tempo worklogs.

ENG issues participate in:

* Backlog Worked On
* Delivery Progress
* effort reconciliation
* account reporting
* delivery metadata enrichment where Jira data exists

---

# 4. Global Exclusions

The following Tempo operational keys are globally excluded from ALL analytics, KPI, backlog, reconciliation, and utilization calculations:

* TEMPO-54
* TEMPO-92
* TEMPO-106
* TEMPO-111
* TEMPO-112

`TEMPO-92`, `TEMPO-111`, and `TEMPO-112` are HR daily-registration and vacation records. The available source data does not establish which individual key corresponds to which of those HR purposes, so no per-key purpose is inferred.

These exclusions apply to:

* KPI cards
* logged, planned, remaining, billable, utilization, variance, Work Ratio, record-count, worklog-count, and distinct-work-item calculations
* charts, filters, searches, tooltips, summaries, and CSV exports
* Accounts and People tables
* Backlog Worked On
* Delivery Progress
* reconciliation logic
* current Jira-derived analytical demand and any future Jira-derived forecasting candidate population

The exclusion is applied after trimming surrounding whitespace and converting candidate keys to uppercase, using exact-key matching only. It is enforced before aggregation, classification, enrichment, joins, reconciliation, filter population, export, or rendering. These items must never appear in governed analytical outputs. Source CSVs may retain the original records for traceability.

Annual Capacity and Weekly Capacity source values are not changed by this exclusion. Bug Triage remains independent because it is governed exclusively by its dedicated Jira export.

---

# 5. Tempo Operational Governance

Tempo operational items are valid operational records.

Tempo operational items:

* remain visible unless globally excluded
* are considered operational activity
* remain included in Logged Operations, Governed Logged Total, and applicable Tempo-based utilization and effort calculations
* may appear in Backlog Worked On and Delivery Progress
* use Tempo Description List summaries
* use Tempo worklog dates
* are excluded from Account Distribution because they do not carry Jira Account metadata
* are not Account-attribution exceptions or Jira Account data-quality failures

Tempo-only operational items use:

* Status = Operational
* Jira-derived fields = "-"

Examples:

* TEMPO-30
* TEMPO-31
* TEMPO-32
* TEMPO-83
* TEMPO-108

No Support Account or Support category is approved in the current MVP. OATSD-* support activities are future roadmap scope only; this governance does not introduce an Account mapping or classification for them.

---

# 6. Logged Engineering vs Logged Operations

## Logged Engineering

Logged Engineering represents:

* non-TEMPO operational effort
* delivery execution work
* engineering delivery effort

Definition:

All logged Tempo work excluding:

* TEMPO-* operational activity
* globally excluded Tempo keys

---

## Logged Operations

Logged Operations represents:

* operational Tempo effort
* support activity
* coordination
* meetings
* administration
* operational overhead

Definition:

All valid TEMPO-* activity excluding:

* TEMPO-54
* TEMPO-92
* TEMPO-106
* TEMPO-111
* TEMPO-112

---

# 7. Backlog Governance

The canonical backlog model is:

## Backlog Worked On

This is NOT a pure Jira inventory backlog.

Backlog inclusion is governed by:

* Tempo Work Date activity
* selected filter scope
* Master Date week/workday governance

A work item appears in Backlog Worked On only if:

* Tempo activity exists in the selected scope

This answers:

* "Which work items were actively worked on during the selected period?"

Jira metadata enriches the record but does not determine inclusion.

Product Module is Jira-owned issue metadata that enriches Backlog Worked On rows only. It does not determine row inclusion and is never inferred or inherited from a parent or any other field.

Bug Triage is a dedicated inventory-based Jira operational queue supporting Product and Engineering bug triage activities. Its purpose is visibility into the current bug queue. It is not an engineering-productivity, bug-throughput, defect-trend, quality-KPI, forecasting, or delivery-performance measure.

Only the latest dedicated `Bug Triage_*` Jira export in `data/raw/` governs Bug Triage queue membership, Bug metadata, and snapshot comparison. Row inclusion, Key, Summary, Bug Severity, Status, Updated, and Assignee come from that export. The general Jira PI backlog export, Tempo activity, worklogs, logged hours, and Weekly Capacity do not participate. Every distinct valid exported key remains visible by default, including unassigned issues. Updated is displayed exactly as stored in the Jira export and is never derived from Tempo. Missing values in selected source-backed columns render as `-`; fields absent from the dedicated export are not added as placeholder columns.

Team is always resolved from the exported Jira Assignee through the governed Assignees CSV. Jira Team and Tempo Team must not be used or inferred. If a Jira Assignee is absent from the Assignees CSV, the Jira Assignee is preserved, Team renders as `-`, and the queue row remains visible.

Bug Severity is Jira-owned read-only metadata. The dashboard displays its current distribution for operational triage only. It is never inferred or inherited from a parent and introduces no KPI, delivery metric, quality score, forecasting metric, reconciliation role, grouping, aggregation, or global filter.

The Bug Triage validation process produces `outputs/bi_dashboard/bug_triage_unmapped_assignees.csv` with Jira Key, Summary, Jira Assignee, and the reason `Assignee not found in Assignees CSV` for each assigned queue row without a governed Team match. The report is governance evidence only and must not affect rendering, filtering, inclusion, calculations, KPIs, or reconciliation.

Bug Triage is an operational snapshot. The dashboard compares the current export with the immediately previous export using distinct Jira Issue Keys only. It reports Current Queue, Added to Queue, and Removed from Queue as changes between complete snapshots. Current Queue is the number of distinct nonblank Jira Issue Keys in the current export; Added to Queue is the current-key set minus the previous-key set; Removed from Queue is the previous-key set minus the current-key set. No other fields participate.

These snapshot values must not be interpreted as Bugs created, fixed, closed, resolved, or as Engineering throughput. The queue is intentionally ephemeral: the latest export replaces the previous operational queue, and historical bug lifecycle analysis is outside MVP scope. When no previous export exists, the dashboard states `No previous complete Bug Triage snapshot available.` and does not infer Added or Removed values. The summary does not participate in KPIs, calculations, filters, reconciliation, table inclusion, CSV export, or forecasting.

Bug ageing, MTTR, Reopened Bugs, Bug trends, historical Bug analytics, and AI Bug Intelligence are future roadmap capabilities and are outside the MVP scope.

Backlog Worked On uses an activity-based Team semantic.

When Team is used to filter Backlog Worked On, it represents Tempo contributor activity in the selected scope, not Jira ticket ownership.

---

# 8. Parent / Child Governance

Child and sub-task work items may appear independently from parent Jira rows.

The dashboard must preserve the actual Tempo work item key that received the logged work.

It must NOT replace the child key with the parent key.

---

## 8.1 Child present in Jira export

If the child work item exists in the Jira export:

* use the child Jira metadata where available
* use the parent only for parent context enrichment

---

## 8.2 Child missing from Jira export but parent exists

If a child/sub-task appears in Tempo worklogs but does not exist as a primary Jira row in the current Jira export, and its parent exists in Jira:

* preserve the child key as the work item key
* enrich delivery metadata from the parent where appropriate
* expose parent context through Parent Key and Parent Summary
* do not fabricate child-level Jira metadata

Parent inheritance may be used for:

* Parent Key
* Parent Summary
* Delivery
* Target Release
* Fix Version
* Account where available and appropriate

Parent inheritance should not override actual child metadata when child metadata exists.

### Account-resolution boundary

For Account attribution, the current MVP uses the directly matched Jira Account first. It uses an immediate-parent Account only when the directly logged Jira key is absent from the current Jira extract, a parent key is available, the parent is present in that extract, and the parent Account is nonblank.

A Jira record present in the extract with a blank Account is an unexpected data-quality, export, field-mapping, transformation, configuration, or technical exception. Account is mandatory for normal Jira work items and must not be silently masked through parent inheritance or an invented Account value.

The current MVP does not recursively traverse grandparents or higher ancestors for Account, provide configurable hierarchy normalization, or use issue-type names as fixed hierarchy rules. Those capabilities are future enhancements.

---

## 8.3 Parent fallback summary

If a child/sub-task exists in Tempo activity but lacks its own Jira summary:

* parent enrichment must be used

Canonical fallback rendering:

```text
[Sub-task] {Parent Summary}
```

Parent metadata comes from Jira hierarchy relationships.

---

# 9. Jira Export Coverage Governance

If a Tempo work item is not enriched from Jira, the cause must be classified as one of:

* absent from Jira export
* parent exists but child is absent
* key only appears as a linked reference
* item is outside managed Assignees CSV scope
* key formatting or normalization issue
* genuine join defect

The dashboard logic must not be changed until the mismatch type is understood.

Items outside managed Assignees CSV scope should be excluded from delivery governance reconciliation unless explicitly added to the Assignees dataset.

---

# 10. Last Worklog Date Governance

Last Worklog Date is governed exclusively by Tempo Work Date.

Definition:

Latest Tempo worklog date for the work item within the selected scope.

This field must NEVER be derived from:

* Jira Updated Date
* Jira Created Date
* Jira Resolution Date

---

# 11. Delivery Progress Governance

Delivery Progress is an operational risk-monitoring view.

It is NOT:

* a percentage completion tracker
* a sprint burndown
* a story-point completion engine

The purpose is:

* due-date visibility
* overdue monitoring
* delivery-risk visibility
* stalled work detection
* operational execution tracking

Delivery Progress uses an ownership-based Team semantic.

In Delivery Progress, Team represents Jira ticket ownership for the work item.

Tempo contributor teams may explain which teams logged activity against the work item, but they must not overwrite Delivery Progress ownership.

---

# 12. Due-Date Governance

Days-to-due calculations apply only to active delivery statuses.

Countdown tracking stops for statuses such as:

* Done
* Closed
* Rejected
* Abandoned
* Cancelled
* On Hold
* Blocked

Completed or paused items must not continue overdue accumulation.

---

# 13. Reconciliation Governance

Reconciliation validation must verify:

* work item counts
* rendered rows
* exclusion compliance
* Team mapping consistency
* Master Date week consistency
* Tempo/Jira enrichment consistency
* parent-child enrichment consistency
* unmanaged/out-of-scope item classification

Validation must detect:

* missing rows
* duplicate rows
* excluded operational keys
* reconciliation mismatches
* unmatched Jira joins
* unmanaged work items

### Account-attribution reconciliation

Account Distribution is not a complete Tempo reconciliation visual. For every applicable filtered scope:

```text
Governed Logged Total
= Account-attributed engineering effort
+ Engineering Account-attribution exceptions
+ Operational TEMPO-* effort
```

Each governed worklog belongs to exactly one population. The treemap displays only Account-attributed engineering effort; its footer reports only engineering Account-attribution exceptions. Operational TEMPO-* effort appears in neither while remaining governed operational effort.

An engineering Account-attribution exception is a non-TEMPO worklog whose Account cannot be resolved from Jira records available to the platform. It must distinguish a key absent from the restricted extract, a present-but-blank Account, and hierarchy, normalization, join, mapping, or transformation failure. A missing extract record does not show that the Jira ticket does not exist.

### Validated BOSAN evidence

The current restricted extract contained BOSAN-4, BOSAN-171, and BOSAN-221, each with Account `BOSA Contract 2026` directly; no inheritance was required. BOSAN-38 was visible in Jira with that Account and `PI-Backlog` but absent from the restricted extract, so its unresolved effort was an extract-coverage exception rather than a hierarchy failure. Simulated recursive traversal recovered no additional BOSAN effort from the current payload because the required records were unavailable. This is evidence for the current extract, not a general calculation rule.

---

# 14. Canonical Operational Principle

Operational activity is governed by Tempo.

Delivery metadata is governed by Jira.

Organizational/workforce Team and skill ownership are governed by Assignees CSV, except where a table explicitly uses Team to mean Jira ticket ownership or Tempo contributor activity.

Week logic is governed exclusively by Master Date.

Parent enrichment is allowed only to improve delivery context and must never corrupt the original Tempo work item key.

---

# 15. Current Approved Operational Implementation

The approved interim implementation uses Date Range as the active historical reporting filter. Date Range governs historical Tempo execution metrics, and Capacity selection is derived from the Master Date weeks represented by the selected Date Range.

Remaining Demand is a current Jira snapshot and does not change when only Date Range changes.

Release Cycle governance remains approved, but dashboard functionality is currently parked. The visible Release Cycle filter is intentionally hidden pending governed Version 2.1 implementation. This is an implementation-status decision only and does not redefine Release Cycle business governance.
