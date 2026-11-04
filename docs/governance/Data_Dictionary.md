# Data Dictionary — CH-005A v2

> **Canonical CH-005A governance; publication revision 1, 2026-11-04.** Local promotion and subsequent reference-only publication edits are authorized; GitHub publication is pending.

## Publication provenance

Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1–D3 and D5–D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force.

The [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) records approval scope, retained exceptions and the private-evidence boundary. This publication revision changes metadata and references only, preserving approved business content. The original CH-005A dictionary v1 proposal was superseded by corrected v2 before canonical promotion; category mapping and Account-only Key identity corrections remain authoritative.



The current Delivery Management correction request accepts carrying Bug Severity Date Range versus Created-date behavior, the Original-versus-Remaining Estimate distinction, historical capacity replay limits, the Master Date fallback exception, the Jira Status category mapping issue and pending external v2 acceptance as documented unresolved exceptions. This accepts their continued disclosure for CH-005A governance alignment; it does not resolve them, approve an alternate business rule or authorize code changes. See the [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) for the current seven-document candidate inventory and correction evidence. Existing v1 audits remain historical records; the addendum supersedes their blanket accuracy assessment for the two corrected statements. Canonical promotion is not authorized by this correction task.

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

Missing or unavailable display values render as follows, except the explicit semantic attribution buckets below:

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

**Attribution exceptions:** unavailable, incomplete, or ambiguous Tempo customer attribution remains the selectable semantic bucket `N/A` in Client filters, source records and exports. The treemap displays unverified Client or missing Account Key as `-` and preserves their effort. Legacy v1 export labels alone retain the `(blank)` identity / `No Account / Missing Account` display; they are not a Portfolio sidebar dimension. Unsupported Account comparisons display Unavailable with an explanation. These are distinct semantic buckets, not a general permission to render null-like placeholders.

---

# 3. Canonical Field Definitions

| Canonical Field      | Source                        | Description                         |
| -------------------- | ----------------------------- | ----------------------------------- |
| Team                 | Assignees CSV                 | Canonical delivery team attribution |
| Skill                | Assignees CSV                 | Canonical skill attribution         |
| Assignee             | Assignees CSV / Tempo         | Canonical person mapping            |
| Client               | Tempo `Account Customer`      | Customer associated with a Tempo Account; verified by `Account Key`. Payload: `tempoCustomerAccount`, with `clientAttributionStatus`; sidebar label `Client`; unresolved global bucket `N/A`, treemap missing bucket `-`. See Section 22.1. |
| Tempo Account        | Tempo `Account Key` / `Account Name` | Tempo Account associated with a worklog. Payload: `tempoAccountKey` / `tempoAccount`; sidebar label `Account`. Trimmed, case-preserved Key identity; display `Name (Key)`; direct effort and observed issue membership in approved Portfolio consumers. See Section 22.2. |
| Legacy v1 export label | Jira Account metadata / legacy Tempo Account Name | Export-only compatibility selection; absent from modern Portfolio sidebar/state/predicates. Not Key identity or ownership. See Section 22.3. |
| Jira Account metadata | Jira `Custom field (Account)` | Original dictionary's Jira-owned `Account` concept, preserved as metadata and `account` payload field. Mandatory delivery grouping for normal Jira work items; a present-but-blank value is an exception. Existing inheritance/reporting use unchanged. |
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

**Legacy terminology boundary:** in this retained subsection, “Account” means Jira Account metadata, not the Tempo `Account` sidebar control or a verified cross-source mapping. These Jira attribution states remain valid metadata; they are not the CH-004 treemap eligibility test. The previous Jira Account-restricted treemap rule is superseded for Account Distribution only by scoped G1 approval; this Jira partition and its diagnostics remain valid outside that visualization. See Section 27.

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
| Account (Tempo sidebar) | String (Account Key identity; Account Name display) |
| Client               | String     |
| Tempo Account Key    | String     |
| Tempo Account Name   | String     |
| Legacy v1 export label | String (export-only) |
| Worklog ID | String (unique source provenance) |
| Observed Account Keys | Set of trimmed, case-preserved strings |
| Attribution status | No worklogs / Missing Account Keys / Partially attributed / Multiple Accounts / Observed Account |
| Jira Account metadata | String    |
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

# 22. CH-005A Client, Account and legacy export labels

## 22.1 Client

**Business definition:** customer associated with a Tempo Account. **Authority:** Tempo. **Raw field:** `Account Customer`. **Transformed field:** `tempoCustomerAccount`, accompanied by `clientAttributionStatus`. **Dashboard label:** `Client`.

`resolve_tempo_customers()` validates trimmed, nonblank `Account Key` / `Account Customer` evidence across the complete governed valid-date Tempo export, before interactive filters. A key with exactly one nonblank customer is verified. A blank customer on an individual row may use that verified key mapping. Keys with no customer, conflicting customers, or no key resolve to `N/A`; conflicting evidence is not resolved by first row, largest effort, or name similarity. Account Keys are trimmed strings; no case-folding rule for Account Keys is introduced. Issue keys use the separate governed normalization.

The global Client filter uses `DashboardCore.clientValue()` and `state.clients`. An empty Client Set is unrestricted; otherwise exact canonical customer labels are selected. The default treemap groups nonoperational effort by verified Client; unverified attribution remains one visible `-` bucket. Selecting one or multiple Clients switches to Account grouping and limits eligible worklogs to those Clients. Selecting `N/A` retains unverified worklogs, which can still have known Account Keys. A Client tile click writes the same sidebar Client selection, including `N/A` for the missing tile.

For Jira records, `jira_customer_attribution()` uses only normalized direct Tempo `Work Item Key` = Jira `Issue key` evidence. Every direct worklog must be verified and all must resolve to one customer. No direct worklogs, incomplete evidence, or multiple customers means `N/A`. Multiple Tempo Accounts for one issue can establish one Client if every Account verifies the same customer. Client never comes from Jira Client, Jira Account, Account Name, parent inheritance, or a guessed bridge.

Jira-only demand remains part of unrestricted Jira reporting without Tempo evidence and is selectable under Client `N/A`. Choosing a verified Client reports verified attribution coverage, not complete customer demand. Jira counts and estimates are not split, duplicated, or assigned to a Tempo Account. Attribution uses the complete governed export; Date Range does not recalculate an issue's customer from a partial sample. Portfolio and Demand Management retain separate picker states and existing measures.


## 22.2 Account and observed membership

Portfolio Key/display and membership are defined in the CH-005A contract below. Payload tempoAccountKey is sourced from Tempo Account Key; tempoAccount is Account Name; category is sourced from Tempo `Account Category`. Native worklogs and the enriched activity projection retain the same source worklogId from mandatory, unique Tempo `Tempo Worklog ID`. Missing or duplicate IDs are build failures; an ID is not synthesized from issue/date/hours. Index construction uses the complete governed eligible valid-date snapshot before interactive filtering.

## 22.3 Legacy export labels and Jira metadata

Jira account remains Custom field (Account), including original values and current immediate-parent metadata fallback boundaries. The frozen v1 export module alone combines Jira Account and trimmed Tempo Account Name labels. Modern Portfolio Account selection uses Tempo Account Key as its identifier. Other filters, including Client and Status, may continue using their existing label-based selection values. No-worklog issues, all-missing keys, partial evidence and multiple observed keys are distinct states; the status display can prioritize partial attribution without erasing known keys.

# 23. Source ownership and relationship boundaries

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

# 24. Consumer and Account Distribution contract

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

D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. The canonical schema in this Data Dictionary, under [CH-005A exports and compatibility](#ch-005a-exports-and-compatibility), defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2.

Account effort records aggregate selected governed worklogs by case-preserved Key, including missing-key records; they have logged values and blank Jira estimates. Jira issue records contain one distinct issue across selected/unlinked/other with source estimates, blank logged values and blank Account Key/Name; Observed Account Keys is a JSON evidence array, not allocation. An unavailable source estimate is blank. Do not expand issue records onto worklogs and sum estimates. Scope JSON records selected dates, source date/files/hashes, active Account flag and keys, other selections, membership basis and actual-effort Status exception. Exports ignore detail text search and display-row limits.

Snapshot v2 uses Account-detail Jira Created-date/Status scope; planning v2 uses current Remaining-Demand snapshot scope without Created-date or new future-horizon filtering. Both retain selected-period actual effort. Filenames are delivery-bi-snapshot-v2-{start}_{end}.csv and delivery-bi-planning-v2-{start}_{end}.csv. CSV quotes fields containing commas, quotes or line breaks, doubles embedded quotes, and retains unrounded numeric values.

Legacy CSV (v1) remains available pending downstream approval. Export-only optional labels retain original mixed Jira Account / Tempo Account Name semantics and do not filter modern reports. Modern Account Key selection does not filter v1. Preserve original filename, rounding, six columns (Account; Original Estimate Hours; Logged Hours; Variance Hours; Logged vs Estimate %; Work Items), original formulas and original empty-name omissions in v1 only. Supported legacy sort fields retain behavior; v2-only sort fields fall back to Logged Hours descending. Local 97-case equivalence evidence is not downstream acceptance, and v1 is not retired.

# 25. Snapshot reconciliation and validation evidence

## Current-source evidence and preserved CH-004 behavior

The October 30, 2026 snapshot reconciles Total Logged **51,806.039 h**, Operational Tempo **8,263.271 h**, and Customer/Account effort **43,542.768 h**. These are dated validation observations, never KPI constants. Client and Account grouping conserve the same unfiltered eligible nonoperational worklogs. Tiles exclude operational TEMPO-* effort after the five exact exclusions; all three footer measures share the applicable Client/Account scope and retain operational effort in Total/Operations. Only positive aggregate buckets render. Default grouping is Client; active Client or Account, including explicit All/active-empty Account, gives Account; both reset gives Client. Grouping alone changes no eligible worklogs.

The separate October 30–December 31, 2026 Demand Management capacity reference is **4,934.2333 h** known assigned demand, **42** unlogged issues and **2,056 h** unlogged demand. It uses its own hierarchy/horizon resolver. It is not the Portfolio Remaining Demand cohort, a constant or demand assigned to named Tempo Accounts.

Current CH-005A evidence records 33 browser scenario groups, 77 identity cases, 11 domain checks, source/worklog conservation and 97 legacy equivalence cases. Step 5 inspects this newer implementation and evidence; it does not substitute the CH-004 audits for CH-005A validation or rerun output-producing tests. Account-filtered populations may legitimately differ from prior label-based Reporting Account reports while formulas and classifications remain unchanged; historical equivalence has not been established.

# 26. Implementation and test traceability

Index, partition, distinct issue, Account rows and CSV: [portfolio-accounts.js](../../web/portfolio-accounts.js). Consumer integration, activation, v2 actions, details and treemap: [app.js](../../web/app.js). Source Worklog ID/manifest: [builder](../../scripts/build_web_data.py). Frozen labels: [legacy export module](../../web/portfolio-legacy-export.js). Independent planning: [demand.js](../../web/demand.js). Current-source tests and manifests are inventoried in the Step 5 validation.

# 27. Open governance conflicts and semantic questions

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

Pre-existing date/measure wording conflicts are recorded in the [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before.

Historical CH-004 G5 manifest/sync-state and G7 chronology observations retain their dates and evidential limits. Current CH-005A manifest hashes match current implementation; that newer evidence does not retroactively repair historical sync-state records, supply prior exports or prove historical approval chronology. G1 remains scoped; G4–G10 limitations are not closed by this proposal. Canonical promotion, v1 retirement, ownership allocation, new rules and CH-005B require separate approval.
