# KPI Definitions — CH-005A v1

> **Canonical CH-005A governance; publication revision 1, 2026-11-04.** Local promotion and subsequent reference-only publication edits are authorized; GitHub publication is pending.

## Publication provenance

Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1–D3 and D5–D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force.

The [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) records approval scope, retained exceptions and the private-evidence boundary. This publication revision changes metadata and references only, preserving approved business content. The approved source proposal and complete historical audit trail remain preserved locally.


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

Client = verified Tempo `Account Customer`. Portfolio Account = trimmed, case-preserved Tempo `Account Key` identity with `Account Name` for display. Account Category = Tempo `Account Category`. Jira Account = Jira `Custom field (Account)` metadata and retained planning/diagnostic use. Legacy Reporting Account labels exist only in v1 export compatibility controls; no modern Portfolio selection state or predicate uses that dimension. Matching names do not establish a Jira/Tempo relationship.

Tiles contain governed managed, nonexcluded, nonoperational Tempo worklogs, including explicit missing-attribution buckets. Operational `TEMPO-*` effort is excluded from tiles by the existing issue-key classifier, never by Client/Account names. All three footer values use one applicable Client/Account-filtered Tempo scope: Total logged hours, Operational Tempo hours, and Customer/account effort. Jira Status does not filter this visual; the Reporting Account sidebar control has been removed. Date Range, Team, Assignee, Skill, Client, Account Category, Priority, Target Release, Program and existing Release Cycle state apply where implemented; active Tempo Account keys are then applied. The UI footer phrase `global filters` refers to this consumer-specific scope. Changing grouping alone preserves eligible worklogs; applying Client or Account filters can change populations and totals. Missing Client displays `-` in tiles (`N/A` in the Client picker); missing Account Key remains a `-` bucket. Only positive aggregate-hour buckets render (`logged > 0`); negative-adjustment conservation remains unapproved/unvalidated (G6).

The validated CH-004 snapshot is Total Logged 51,806.039 h = Operational Tempo 8,263.271 h + Customer/Account effort 43,542.768 h. Client and Account grouping conserve the same unfiltered nonoperational effort; Client/Account filtering may narrow it. The previous label-based Reporting Account results can describe different populations from current direct-key results; historical equivalence is not established. These observations are not KPI constants or proof of historical reconciliation.

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

Only valid where Original Estimate exists. For CH-005A Account rows, also require complete single-nonmissing-key attribution, identical eligible issue sets and complete observed Worklog ID coverage. Otherwise show Unavailable with a reason; union comparison is unavailable, and a zero denominator makes the ratio unavailable.

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

The Portfolio sidebar exposes Client, Account and Account Category. Account means Tempo Account Key for approved Portfolio consumers; Demand Management retains its independent Jira Account picker. Reporting Account label choices exist only in legacy v1 export controls. Jira Status may scope lifecycle/demand measures but does not reduce governed logged effort. No Jira-only demand is assigned a Tempo Account by name equality. Team semantics, parent-child inheritance and Master Date remain unchanged.

See [Data Dictionary](Data_Dictionary.md#22-ch-005a-client-account-and-legacy-export-labels) for exact identities and [visual specification](../user-guides/Chart_and_Visual_Specification.md#account-distribution-accounttreemap) for the Account Distribution contract.

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

D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2.

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

Pre-existing date/measure wording conflicts are recorded in the [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before.

Historical CH-004 G5 manifest/sync-state and G7 chronology observations retain their dates and evidential limits. Current CH-005A manifest hashes match current implementation; that newer evidence does not retroactively repair historical sync-state records, supply prior exports or prove historical approval chronology. G1 remains scoped; G4–G10 limitations are not closed by this proposal. Canonical promotion, v1 retirement, ownership allocation, new rules and CH-005B require separate approval.
