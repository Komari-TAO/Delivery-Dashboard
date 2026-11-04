# MVP Business Rules

> **CH-004 v1 — Step 4 local review candidate, 2026-11-03. Not canonical; promotion pending Delivery Management review.**
> Canonical source: `docs/governance/MVP_Business_Rules.md`; GitHub reference `feature/initial-dashboard-import` pinned to `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a`. Exact blob/version, scoped G1 approval, G2/G3 corrections, G4–G10 limitations and validation: [Step 4 report](../audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md). Revision history: pinned canonical → CH-004 v1; no calculation or application-behavior change.

## Annual workforce allocation scope (2026-10-30)

Annual Portfolio reporting uses the 38 canonical Assignee IDs in Authoring, Delivery Express, Integration, Nexus, Portal and Scoring. Preserve 0% membership. Engineering is a separate annual allocation category for those same people; it does not replace delivery membership, add headcount, or change attribution of actual work. Ionut, QA, Business Analysis and UX are outside this roster.

The Portfolio Actual Hours card, gross annual balance and gross consumption ratio share the same governed, filtered actual effort for the compatible reporting year and roster. The raw full-source actual-hour aggregate remains audit metadata; it is not the Portfolio numerator. Existing effort Status handling and all other chart/Demand rules remain unchanged.

Supplied annual Development and Engineering amounts are gross allocations before absence deductions. Retain supplied joiner/leaver adjustments without further proration. Team/person/skill scope follows the canonical roster; partial date or effort filters do not prorate annual amounts. Show unavailable for missing years, mixed-year selections or incompatible scope. The KPI formula contract is in the Chart and Visual Specification.

Weekly Capacity blanks mean zero planned hours for the annual Development sum. Existing Demand Capacity Coverage missingness and chart behavior remain unchanged. Support is already deducted from Weekly Development and remains a separate planned reservation, never actual logged Support. Gross annual Engineering must not be added to net weekly capacity or distributed across weeks.

A full active week has a 40-hour baseline. Differences from 40 Development hours do not establish vacation: reservations, employment dates and partial weeks also matter. No net Engineering or missing absence data is inferred. Gross balances and consumption ratios must not imply net availability, overtime or net utilization. Preserve the existing Tempo exclusions and single counting of actual work.

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

Annual Capacity and Weekly Capacity source values are not changed by this exclusion.

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
* are excluded from Account Distribution tiles by the existing operational issue-key classification; applicable Total logged hours and Operational Tempo footer totals retain them after the visual’s applicable filters
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

The retained **Jira Account attribution diagnostic partition** applies for each applicable reporting scope. It is distinct from the approved Tempo-based Account Distribution population:

```text
Governed Logged Total
= Account-attributed engineering effort
+ Engineering Account-attribution exceptions
+ Operational TEMPO-* effort
```

Each governed worklog belongs to exactly one Jira attribution diagnostic population. This partition remains valid outside Account Distribution; it no longer governs treemap eligibility or an exception-only footer.

**Approval boundary:** Delivery Management G1 approval supersedes Jira Account-restricted treemap eligibility and exception-only footer rules for Account Distribution only. It does not approve unrelated historical changes or alter KPI formulas, Jira demand, exclusions, Team, Status, hierarchy, capacity, or other visualizations.

Client = verified Tempo `Account Customer`. Account = Tempo `Account Key` identity and `Account Name` display. Reporting Account = independent existing mixed Jira/Tempo compatibility dimension. Jira Account = Jira metadata and retained attribution diagnostics; matching names do not establish a Jira/Tempo bridge.

Tiles contain governed managed, nonexcluded, nonoperational Tempo worklogs, including explicit missing-attribution buckets. Operational `TEMPO-*` effort is excluded from tiles by the existing issue-key classifier, never by Client/Account names. All three footer values use one applicable Client/Account-filtered Tempo scope: Total logged hours, Operational Tempo hours, and Customer/account effort. Reporting Account and Jira Status do not filter this visual. Date Range, Team, Assignee, Skill, Client, Account Category, Priority, Target Release, Program and existing Release Cycle state apply where implemented; active Tempo Account keys are then applied. The UI footer phrase `global filters` refers to this consumer-specific scope. Changing grouping alone preserves eligible worklogs; applying Client or Account filters can change populations and totals. Missing Client displays `-` in tiles (`N/A` in the Client picker); missing Account Key remains a `-` bucket. Only positive aggregate-hour buckets render (`logged > 0`); negative-adjustment conservation remains unapproved/unvalidated (G6).

| Sidebar state | Account Distribution |
| --- | --- |
| No active Client or Tempo Account selection | Distribution by Client |
| Client selected | Associated Account distribution |
| Tempo Account selected | Selected Account distribution |
| Explicit All Accounts | All eligible Account distribution |
| Client and Account active | Intersected Account distribution |
| Both reset | Default Client distribution |

Explicit **Select All** stores the currently rendered Account options and activates Account grouping. It differs from inactive **All accounts**. Search or other applicable scope can limit those options; it is not a wildcard for future Accounts. Explicit All Clients also activates Account grouping when options exist. Clear All Accounts deactivates Account selection; Client grouping returns only when Client is also cleared. Client and Account selections intersect; a selection outside the current scope does not widen it.

Client and Account grouping reconcile to the same unfiltered nonoperational effort for the validated snapshot: Total Logged **51,806.039 h**, Operational Tempo **8,263.271 h**, Customer/Account effort **43,542.768 h**. These are snapshot results, not formula constants. Reporting Account can describe a different population under retained mixed-source semantics. No historical reconciliation is claimed without supporting snapshots.

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
