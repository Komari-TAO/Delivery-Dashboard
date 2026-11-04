# MVP Business Rules — CH-005A v1

> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only.

## Revision provenance and version history

Previous proposal: [MVP_Business_Rules_CH004_v1.md](MVP_Business_Rules_CH004_v1.md), preserved unchanged. Canonical comparison document: [MVP_Business_Rules.md](MVP_Business_Rules.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/MVP_Business_Rules.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob 440f13b1681fde54ebbaa7833323c98ce3d09b3d. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work.

| Version | Date / status |
| --- | --- |
| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |
| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |
| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |

## CH-005A decision and evidence boundary

This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.

Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision.

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

No newly derived Support Account mapping or Support activity classification is approved in the current MVP. This preserves raw Tempo Account Category values, including any source Support label. OATSD-* support activity classification remains future scope; no Account mapping or classifier is introduced.

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

For Jira Account metadata attribution only, the current MVP uses the directly matched Jira Account first. It uses an immediate-parent Account only when the directly logged Jira key is absent from the current Jira extract, a parent key is available, the parent is present in that extract, and the parent Account is nonblank.

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

Client = verified Tempo `Account Customer`. Portfolio Account = trimmed, case-preserved Tempo `Account Key` identity with `Account Name` for display. Account Category = Tempo `Account Category`. Jira Account = Jira `Custom field (Account)` metadata and retained planning/diagnostic use. Legacy Reporting Account labels exist only in v1 export compatibility controls; no modern Portfolio selection state or predicate uses that dimension. Matching names do not establish a Jira/Tempo relationship.

Tiles contain governed managed, nonexcluded, nonoperational Tempo worklogs, including explicit missing-attribution buckets. Operational `TEMPO-*` effort is excluded from tiles by the existing issue-key classifier, never by Client/Account names. All three footer values use one applicable Client/Account-filtered Tempo scope: Total logged hours, Operational Tempo hours, and Customer/account effort. Jira Status does not filter this visual; the Reporting Account sidebar control has been removed. Date Range, Team, Assignee, Skill, Client, Account Category, Priority, Target Release, Program and existing Release Cycle state apply where implemented; active Tempo Account keys are then applied. The UI footer phrase `global filters` refers to this consumer-specific scope. Changing grouping alone preserves eligible worklogs; applying Client or Account filters can change populations and totals. Missing Client displays `-` in tiles (`N/A` in the Client picker); missing Account Key remains a `-` bucket. Only positive aggregate-hour buckets render (`logged > 0`); negative-adjustment conservation remains unapproved/unvalidated (G6).

| Sidebar state | Account Distribution |
| --- | --- |
| No active Client or Tempo Account selection | Distribution by Client |
| Client selected | Associated Account distribution |
| Tempo Account selected | Selected Account distribution |
| Explicit All Accounts | All eligible Account distribution |
| Client and Account active | Intersected Account distribution |
| Both reset | Default Client distribution |

Explicit **Select All** stores the currently rendered Account options and activates Account grouping. It differs from inactive **All accounts**. Search or other applicable scope can limit those options; it is not a wildcard for future Accounts. Explicit All Clients also activates Account grouping when options exist. Clear All Accounts deactivates Account selection; Client grouping returns only when Client is also cleared. Client and Account selections intersect; a selection outside the current scope does not widen it.

Client and Account grouping reconcile to the same unfiltered nonoperational effort for the validated snapshot: Total Logged **51,806.039 h**, Operational Tempo **8,263.271 h**, Customer/Account effort **43,542.768 h**. These are snapshot results, not formula constants. Prior label-based Reporting Account results can describe a different population from the CH-005A Key-based consumers; no historical equivalence is established. No historical reconciliation is claimed without supporting snapshots.

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


## CH-005A approved Portfolio Account rules

## CH-005A source ownership

| Business concept | Authority and boundary |
| --- | --- |
| Client | Tempo Account Customer, verified by Account Key; unresolved is N/A. Existing full-snapshot single-customer Jira attribution remains unchanged. |
| Portfolio Account identity | Tempo Account Key, trimmed and case-preserved; equal names with different keys remain distinct. |
| Account display / Category | Tempo Account Name / Account Category. Neither establishes Jira ownership or key membership. |
| Logged effort / worklog date | Tempo Logged Hours / Work date. Worklog ID is source provenance, not an issue or Account identity. |
| Jira metadata / Jira Account | Jira fields / Custom field (Account), retained internally for diagnostics, display and independent planning. |
| Original Estimate / Remaining Estimate | Jira, issue grain, seconds converted to hours. They are separate measures, not Account budgets. |
| Workforce / capacity / weeks | Assignees CSV / Weekly Capacity / Master Date. No Account capacity allocation. |

The Portfolio sidebar exposes Client, Account and Account Category alongside the existing controls. Reporting Account has been removed from that sidebar and from modern reporting predicates. Legacy label choices are export-only compatibility controls. Jira Account metadata remains in the data model.

## CH-005A observed relationships and activation

D2 uses normalized direct Jira Issue Key = Tempo Work Item Key to collect observed Tempo Account Keys from the complete governed eligible valid-date source snapshot **before interactive filters**. Issue keys are trimmed and uppercased; Account Keys are trimmed without case folding. The index is not rebuilt from a selected date, person or Team sample. Consumer-specific six-team/workforce eligibility remains applied by each consumer. No name, parent Account, Client or Category bridge is permitted. Observed activity is not contractual ownership; Jira metadata inheritance remains a separate existing process.

| Attribution evidence | Meaning |
| --- | --- |
| No worklogs | No eligible direct Tempo evidence; no Account can be assigned. |
| Missing Account Keys | Direct worklogs exist, but all keys are missing; distinct from no worklogs. |
| Partially attributed | Known keys and missing-key worklogs coexist. Known keys remain inspectable; the issue can also involve multiple known Accounts. |
| Multiple Accounts | More than one observed nonmissing key. The display prioritizes Partially attributed when missing evidence also exists; it does not discard the multiple keys. |
| Observed Account | Complete evidence for a single nonmissing key. This still establishes activity, not ownership. |

| Account activation state | Effect |
| --- | --- |
| Inactive/default, empty selection | Unrestricted Account predicate. Includes Jira-only issues in the selected overall issue population; attribution diagnostics still disclose them. |
| Explicit Select All | Active stored selection of currently rendered option keys; search and current scope can limit it. It is not a wildcard for future or newly eligible keys. |
| Selected keys | Direct worklog-key match; Jira issue matches any observed selected key, once in the union. Client and Account intersect. |
| Active-empty | Matches no worklogs or Jira issues. Distinct from inactive/unrestricted, and retains Account treemap grouping. |
| Clear / reset | Clear Account empties keys and deactivates; active Client still gives Account grouping. Reset also clears Client and restores existing date/Status defaults. |
| Missing-key selection | One explicit missing-key bucket, encoded as JSON array containing an empty string. Matches missing-key worklogs and issues with direct missing-key evidence, never issues with no worklogs. No Jira-name fallback. |
| Selected key unavailable after scope/refresh | Retained and clearable; cannot widen the current intersection or silently select another key. |

Checkbox and tile interactions retain their existing activation behavior; unchecking the last checkbox deactivates. A programmatically active-empty state or Select All on an empty rendered option scope remains active-empty.

## CH-005A consumer populations and estimate grain

| Consumer / measure | CH-005A filter contract; existing arithmetic retained |
| --- | --- |
| Portfolio effort KPIs; Hours Trend; Team Utilization; Planned/Unplanned; Program Distribution; Engineering Work Mix; People logged effort; Backlog Worked On; Delivery Progress activity | Direct Tempo Account Key on eligible worklogs. Preserve each consumer's date, metadata, Status exceptions, workforce/ownership and aggregation rules; Program slices still ignore Program selection. |
| Work Item Types | Direct Key on filtered native worklogs; current measure is worklog-row count by type, with its existing Status-aware path. |
| Jira inventory, priority and applicable issue estimates | Direct observed Issue Key membership in selected Account keys; one estimate/count per distinct issue in a union. Existing Jira eligibility and date/Status predicates remain. Account Category is not a Jira attribute. |
| Remaining Demand versus Logged Effort | Demand uses current Jira snapshot Remaining Estimate, independent of Created date; selected observed membership scopes issues. Actuals use selected-period direct-key worklogs and ignore Status. These are separate measures. |
| Account details and v2 snapshot | Actuals grouped by Key; Jira linked estimates use existing Created-date/Status issue scope. Per-Account estimates overlap; union deduplicated. Search can narrow visible detail totals, but exports ignore detail search/row limits. |
| Unlinked demand companion and v2 planning export | Remaining-Demand current-snapshot issue scope, without Created-date restriction. Partition into selected, residual unlinked, other linked; no attribution by Jira Account label. This is not the Demand Management capacity resolver. |
| Annual Gross Workforce Hours | Existing Team/Assignee/Skill roster and compatible-year scope; annual allocations are not divided among Accounts or prorated by worklog filters. |
| Actual Hours; Gross Annual Hours Balance; Logged Hours / Gross Annual Hours | Same governed actual-effort numerator now follows direct Account Key, plus existing effort predicates; ignores Status. Annual denominator retains roster/year scope. |
| Annual Development Capacity and Demand Capacity | Existing full-source cards; no Account/Client allocation. General cards remain Portfolio-scoped above tabs. |
| Weekly capacity and Demand capacity coverage | Existing workforce/Master Date/horizon scope; Account selections do not allocate workforce capacity. |
| Demand Management and Delivered Features exceptions | Independent Jira Account picker and existing planning/hierarchy/filter rules; CH-005B deferred. Existing full-source Delivered Features KPIs continue to ignore Demand pickers. |

For each consumer's eligible Jira issue set Q, partition after preserving its non-Account predicates. Under an active Account selection, selected issues match observed keys (or the selected missing-key bucket); residual unlinked issues have no direct worklogs or only missing keys and exclude anything already selected; other linked issues are the remaining issues. A partially attributed issue outside the selection is other linked, with its uncertainty disclosed. Under inactive Account, selected contains all Q, and residual/other are empty; unresolved attribution is still diagnosed within selected. Counts, Original Estimate and Remaining Estimate reconcile across these disjoint populations using distinct normalized issue identity. Source estimate availability flags remain intact; exports leave missing estimates blank. Existing aggregate sums retain their numeric zero contribution for unavailable values, without treating absence as a confirmed source zero.

D1 keeps residual unlinked demand visible separately from selected Account demand. Its Jira Account metadata can be inspected but never supplies a Tempo Account. Unlinked Jira demand is not part of Tempo treemap tiles or any of their three footer measures. Do not confuse this Portfolio partition with Demand Management's unlogged planning cohort.

D3: each issue contributes its Jira estimate once within a selected Account union. Separate Account rows can contain the same multi-Account issue; those estimate subtotals are **non-additive**. Account-detail footer estimates are a deduplicated union of the visible Account buckets' linked issues, not a sum of row estimates and not the full unlinked population. Worklog hours retain source Worklog ID uniqueness. There is no estimate allocation, weighting or Account budget.

D5: Account rows show key-attributed actual hours and observed linked-issue Original/Remaining Estimates. A supported comparison requires complete single-nonmissing-key evidence, the same eligible issue sets, valid Original Estimates, and coverage of every observed source Worklog ID for those issues. A date/person/Team filter can break that coverage. Otherwise variance and ratio display Unavailable with a reason; union variance/ratio are always unavailable. Where supported, the existing arithmetic is Logged minus Original, and Logged divided by Original; zero Original makes the ratio unavailable. Remaining Estimate is not substituted into those formulas. This qualification introduces no new arithmetic.

## CH-005A exports and compatibility

D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [The exact contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2.

Account effort records aggregate selected governed worklogs by case-preserved Key, including missing-key records; they have logged values and blank Jira estimates. Jira issue records contain one distinct issue across selected/unlinked/other with source estimates, blank logged values and blank Account Key/Name; Observed Account Keys is a JSON evidence array, not allocation. An unavailable source estimate is blank. Do not expand issue records onto worklogs and sum estimates. Scope JSON records selected dates, source date/files/hashes, active Account flag and keys, other selections, membership basis and actual-effort Status exception. Exports ignore detail text search and display-row limits.

Snapshot v2 uses Account-detail Jira Created-date/Status scope; planning v2 uses current Remaining-Demand snapshot scope without Created-date or new future-horizon filtering. Both retain selected-period actual effort. Filenames are delivery-bi-snapshot-v2-{start}_{end}.csv and delivery-bi-planning-v2-{start}_{end}.csv. CSV quotes fields containing commas, quotes or line breaks, doubles embedded quotes, and retains unrounded numeric values.

Legacy CSV (v1) remains available pending downstream approval. Export-only optional labels retain original mixed Jira Account / Tempo Account Name semantics and do not filter modern reports. Modern Account Key selection does not filter v1. Preserve original filename, rounding, six columns (Account; Original Estimate Hours; Logged Hours; Variance Hours; Logged vs Estimate %; Work Items), original formulas and original empty-name omissions in v1 only. Supported legacy sort fields retain behavior; v2-only sort fields fall back to Logged Hours descending. Local 97-case equivalence evidence is not downstream acceptance, and v1 is not retired.

## Current-source evidence and preserved CH-004 behavior

The October 30, 2026 snapshot reconciles Total Logged **51,806.039 h**, Operational Tempo **8,263.271 h**, and Customer/Account effort **43,542.768 h**. These are dated validation observations, never KPI constants. Client and Account grouping conserve the same unfiltered eligible nonoperational worklogs. Tiles exclude operational TEMPO-* effort after the five exact exclusions; all three footer measures share the applicable Client/Account scope and retain operational effort in Total/Operations. Only positive aggregate buckets render. Default grouping is Client; active Client or Account, including explicit All/active-empty Account, gives Account; both reset gives Client. Grouping alone changes no eligible worklogs.

The separate October 30–December 31, 2026 Demand Management capacity reference is **4,934.2333 h** known assigned demand, **42** unlogged issues and **2,056 h** unlogged demand. It uses its own hierarchy/horizon resolver. It is not the Portfolio Remaining Demand cohort, a constant or demand assigned to named Tempo Accounts.

Current CH-005A evidence records 33 browser scenario groups, 77 identity cases, 11 domain checks, source/worklog conservation and 97 legacy equivalence cases. Step 5 inspects this newer implementation and evidence; it does not substitute the CH-004 audits for CH-005A validation or rerun output-producing tests. Account-filtered populations may legitimately differ from prior label-based Reporting Account reports while formulas and classifications remain unchanged; historical equivalence has not been established.

## CH-005A implementation traceability

[Account domain module](../../web/portfolio-accounts.js): index, status, worklogMatches, issueMatches, partition, accountRows and exportCsv preserve direct keys, source IDs and distinct issue unions. [Portfolio integration](../../web/app.js): filteredData, governedLoggedWorklogRows, demandBacklogData, portfolioAccountRows, portfolioAccountTotals, snapshotCsv (snapshot/planning modes), exportScope and renderAccountTreemap apply the consumer boundaries above. [Markup](../../web/index.html) exposes one Portfolio Account control and explicit legacy export controls. [Builder](../../scripts/build_web_data.py) retains mandatory unique source Worklog ID and manifest hashes; source/calendar exceptions remain as recorded. [Legacy module](../../web/portfolio-legacy-export.js) isolates v1. [Demand implementation](../../web/demand.js) retains its independent Jira picker.

Evidence inspection covers [domain tests](../../scripts/test_portfolio_accounts.cjs), [browser verifier](../../scripts/verify_portfolio_accounts.cjs), [CH-004 verifier](../../scripts/verify_account_distribution.cjs) and the newer CH-005A outputs inventoried in the validation report. Preserved CH-004 assertions that Tempo Account affects only the treemap describe the superseded scope and are not claimed as current CH-005A regression assertions. No test/source file is changed by Step 5.

## Conditions, unresolved contradictions and change control

1. Historical capacity and reporting replay are incomplete: required prior exports are unavailable.
2. External consumer acceptance of v2 exports has not been established.
3. Legacy v1 compatibility remains required pending downstream approval.
4. The Jira Status category mapping defect remains unresolved: source Status category and the builder's requested Status Category differ.
5. The builder's ISO-week/weekday fallback remains an implementation exception to exclusive Master Date authority; it is not an approved alternate calendar rule.
6. Epic-child Jira Account mismatches and missing Jira Account values remain data-quality issues; no new inheritance is authorized.
7. Observed Tempo Account membership does not establish contractual ownership.
8. Effective-dated Account/customer history and an authoritative Jira/Tempo ownership crosswalk are unavailable.
9. Negative-adjustment treemap reconciliation remains unvalidated; the positive snapshot does not establish future conservation.
10. CH-005B remains deferred. Demand Management retains its independent Jira Account picker, planning semantics, hierarchy and filter state.

Pre-existing date/measure wording conflicts are recorded in the [Step 5 validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before.

Historical CH-004 G5 manifest/sync-state and G7 chronology observations retain their dates and evidential limits. Current CH-005A manifest hashes match current implementation; that newer evidence does not retroactively repair historical sync-state records, supply prior exports or prove historical approval chronology. G1 remains scoped; G4–G10 limitations are not closed by this proposal. Canonical promotion, v1 retirement, ownership allocation, new rules and CH-005B require separate approval.
