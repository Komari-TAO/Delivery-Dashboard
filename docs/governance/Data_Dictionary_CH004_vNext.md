# Data Dictionary

> **CH-004 vNext — proposed local revision, 2026-11-03. Pending governance approval.**
> Records the existing local Step 2 implementation. It does not replace the canonical Data Dictionary or approve changes to other governance documents. Sections 1–21 retain the GitHub dictionary except the Client/Account entries, related types, and an explicit qualification of legacy Jira Account terminology. Sections 22–27 document the affected dimensions, relationships, treemap, evidence, and conflicts.

## Revision provenance and version history

Repository: [Komari-TAO/Delivery-Dashboard](https://github.com/Komari-TAO/Delivery-Dashboard). Working and fetched reference branch: `feature/initial-dashboard-import`. Pinned review commit: `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a` (2026-10-30). `git fetch origin` completed on 2026-11-03 without changing HEAD or the working branch. The fetched branch tip equals local HEAD. The other fetched branch, `dashboard-functionality`, points to `5da8adb0c866638950cbd3fbe20f23448f91e31c`; no branch switch was needed.

Approved historical checkpoint: [BASELINE_v0.3_2026-07-01.txt](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/BASELINE_v0.3_2026-07-01.txt), Version v0.3, dated 01-Jul-2026. Its unchanged blob is `c097a083d6b3ed6193ced685bf4c0896bbc3b7f2`; its first repository commit is `0280c186edb2425c76c2768193daf4de1b13c8a0` (2026-10-06 import). The checkpoint date is not a Git commit date. Its historical snapshot is 2026-06-30, not the Step 2 snapshot below. Later baseline files are present but are not substituted for v0.3.

The canonical documents were read directly through GitHub at the pinned review commit and compared to fetched Git objects and local files. They have no internal release number; their exact versions are the blobs below. The checkpoint names `docs/*.md`; the committed canonical location is now `docs/governance/`.

| Document at pinned review commit | Git blob | Last-changing commit |
| --- | --- | --- |
| `BASELINE_v0.3_2026-07-01.txt` | `c097a083d6b3ed6193ced685bf4c0896bbc3b7f2` | `0280c186edb2425c76c2768193daf4de1b13c8a0` |
| [Data_Dictionary.md](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/Data_Dictionary.md) | `88bd711d4973b9aca5dfbd0352e16e1aaf209199` | `5da8adb0c866638950cbd3fbe20f23448f91e31c` |
| [MVP_Business_Rules.md](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/MVP_Business_Rules.md) | `440f13b1681fde54ebbaa7833323c98ce3d09b3d` | `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a` |
| [KPI_Definitions.md](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/KPI_Definitions.md) | `a61a385ee8224341c94ff829c711a2d2ed4234f6` | `0280c186edb2425c76c2768193daf4de1b13c8a0` |
| [Semantic_Visualization_Governance.md](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/Semantic_Visualization_Governance.md) | `721ffc7b983176a4dedd1f3dfe28e88b3cedfbb6` | `5da8adb0c866638950cbd3fbe20f23448f91e31c` |

Local v0.3 is byte-identical to GitHub. The four local Markdown documents are text-identical after CRLF/LF normalization and have no Git working-tree changes. This proposal starts from that pinned current dictionary while retaining v0.3 as the requested historical authority. It does not claim that a newer commit automatically supersedes an approved rule; conflicts and historical drift are recorded in Section 27.

| Version | Date | Status and scope |
| --- | --- | --- |
| GitHub canonical dictionary, blob `88bd711d4973b9aca5dfbd0352e16e1aaf209199` | 2026-10-23 | Starting dictionary; original `Data_Dictionary.md` retained. |
| CH-004 vNext | 2026-11-03 | Proposed documentation of local Step 2 dimensions and Account Distribution; no Step 4 revision. |

---

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

Missing or unavailable values must render as (except the explicit Client attribution bucket below):

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

**Client exception:** unavailable, incomplete, or ambiguous Tempo customer attribution is the selectable semantic bucket `N/A`. This exception applies to Client filters, source records, and exports; it is not a general placeholder change.

---

# 3. Canonical Field Definitions

| Canonical Field      | Source                        | Description                         |
| -------------------- | ----------------------------- | ----------------------------------- |
| Team                 | Assignees CSV                 | Canonical delivery team attribution |
| Skill                | Assignees CSV                 | Canonical skill attribution         |
| Assignee             | Assignees CSV / Tempo         | Canonical person mapping            |
| Client               | Tempo `Account Customer`      | Customer associated with a Tempo Account; verified by `Account Key`. Payload: `tempoCustomerAccount`, with `clientAttributionStatus`; sidebar label `Client`; unresolved global bucket `N/A`, treemap missing bucket `-`. See Section 22.1. |
| Tempo Account        | Tempo `Account Key` / `Account Name` | Tempo Account associated with a worklog. Payload: `tempoAccountKey` / `tempoAccount`; sidebar label `Account`. Key identity; display `Name (Key)`; distinct from Reporting Account. See Section 22.2. |
| Reporting Account    | Jira Account metadata / legacy Tempo Account Name | Existing mixed-source compatibility dimension; sidebar label `Reporting Account`; label-based `state.accounts` selection. Not Tempo Account Key or an authoritative enterprise Account. See Section 22.3. |
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

**Legacy terminology boundary:** in this retained subsection, “Account” means Jira Account metadata, not the Tempo `Account` sidebar control or a verified cross-source mapping. These Jira attribution states remain valid metadata; they are not the CH-004 treemap eligibility test. The existing canonical documents' different treemap restriction is recorded as conflict G1 in Section 27.

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
| Client               | String     |
| Tempo Account Key    | String     |
| Tempo Account Name   | String     |
| Reporting Account    | String     |
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

# 22. CH-004 Client, Account, and Reporting Account

## 22.1 Client

**Business definition:** customer associated with a Tempo Account. **Authority:** Tempo. **Raw field:** `Account Customer`. **Transformed field:** `tempoCustomerAccount`, accompanied by `clientAttributionStatus`. **Dashboard label:** `Client`.

`resolve_tempo_customers()` validates trimmed, nonblank `Account Key` / `Account Customer` evidence across the complete governed valid-date Tempo export, before interactive filters. A key with exactly one nonblank customer is verified. A blank customer on an individual row may use that verified key mapping. Keys with no customer, conflicting customers, or no key resolve to `N/A`; conflicting evidence is not resolved by first row, largest effort, or name similarity. Account Keys are trimmed strings; no case-folding rule for Account Keys is introduced. Issue keys use the separate governed normalization.

The global Client filter uses `DashboardCore.clientValue()` and `state.clients`. An empty Client Set is unrestricted; otherwise exact canonical customer labels are selected. The default treemap groups nonoperational effort by verified Client; unverified attribution remains one visible `-` bucket. Selecting one or multiple Clients switches to Account grouping and limits eligible worklogs to those Clients. Selecting `N/A` retains unverified worklogs, which can still have known Account Keys. A Client tile click writes the same sidebar Client selection, including `N/A` for the missing tile.

For Jira records, `jira_customer_attribution()` uses only normalized direct Tempo `Work Item Key` = Jira `Issue key` evidence. Every direct worklog must be verified and all must resolve to one customer. No direct worklogs, incomplete evidence, or multiple customers means `N/A`. Multiple Tempo Accounts for one issue can establish one Client if every Account verifies the same customer. Client never comes from Jira Client, Jira Account, Account Name, parent inheritance, or a guessed bridge.

Jira-only demand remains part of unrestricted Jira reporting without Tempo evidence and is selectable under Client `N/A`. Choosing a verified Client reports verified attribution coverage, not complete customer demand. Jira counts and estimates are not split, duplicated, or assigned to a Tempo Account. Attribution uses the complete governed export; Date Range does not recalculate an issue's customer from a partial sample. Portfolio and Demand Management retain separate picker states and existing measures.

## 22.2 Account (Tempo Account)

**Business definition:** Tempo Account associated with a Tempo worklog. **Authority:** Tempo. **Raw fields:** `Account Key`, `Account Name`. **Transformed fields:** `tempoAccountKey`, `tempoAccount`. **Portfolio sidebar label:** `Account`.

Account Key is the preferred stable identifier and the implemented identity. `tempoTreemapAccount()` returns trimmed `tempoAccountKey`; `tempoAccountId()` encodes it as `JSON.stringify([key])`, for example `["ENGINEERIN"]`. Account Name is a display label. Picker and tiles show `Name (Key)` for a known key, or `- (Key)` if the name is missing. Equal names with different keys remain separate Accounts. A missing key has the single encoded identity `[""]` and display `-`, even when a name exists. It is retained without fallback to name identity, Jira Account, Client, or an invented key. Same-key rows share an Account; current display helpers take the first source row/bucket label, not a governed rename history.

Independent sidebar state is `state.tempoAccounts` (Set of encoded keys) plus `state.tempoAccountsActive` (Boolean). These values filter Account Distribution and its three footer measures. They are not predicates in `filteredData()`, `governedLoggedWorklogRows()`, `demandBacklogData()`, the Account detail report, or snapshot export. Sidebar placement does not imply that this selection reallocates Jira demand, changes other reporting populations, or filters workforce capacity. Reporting Account retains its existing consumers.

| Action/state | Implemented activation and effect |
| --- | --- |
| Initial/inactive All | Empty `tempoAccounts`, `tempoAccountsActive = false`; no Account restriction. With no Client selection, group by Client. |
| Select one or more Account checkboxes | `toggleFilter()` updates the Set and sets active to `set.size > 0`; selected keys restrict worklogs and force Account grouping. Unchecking the final checkbox deactivates. |
| Explicit Select All Accounts | `bindFacetPicker()` stores currently rendered option values and sets active to `true`, independently of Set size. Account grouping remains even when every displayed Account is selected. |
| Explicit All on an empty option scope | Empty Set with active `true` matches no worklogs and retains Account grouping. This differs from inactive All; activation is not inferred from selected-count equality. |
| Clear All Accounts / clear Account chip | Empty Set and active `false`; Client selection, if present, continues Account grouping. |
| Reset | Clears Client and Account selections and sets active `false`; returns to Client grouping and existing reset date/status defaults. |
| Account tile click or Enter/Space | Sets one encoded Account and active `true`, or clears/deactivates when clicking the selected tile; Client remains selected. |

Select All enumerates rendered picker inputs, so a search or scoped option list can limit the explicit selection. It is a stored selection, not a wildcard for future data or newly eligible Accounts. Options derive from managed `filteredData({ ignoreAccount: true, ignoreStatus: true }).worklogs`, including operational Accounts. Already selected keys remain available to clear. Client, Date Range, Team, Assignee, Skill and other applicable Tempo predicates restrict options; Reporting Account does not. Selections outside a new Client scope remain stored but cannot widen the intersection; no automatic reassignment occurs.

Client and Account selections intersect at worklog grain. Account selection is not Jira Account ownership. No authoritative Account-to-Jira ownership bridge is implemented.

## 22.3 Reporting Account

**Business definition:** existing compatibility dimension used by cross-source reporting. **Portfolio sidebar label:** `Reporting Account`. It preserves the previous global Account control's bindings, values, transformations, and consumers. It is neither Tempo Account Key nor a new authoritative enterprise Account dimension.

| Source/projection | Existing fields and transformation |
| --- | --- |
| Jira backlog | CSV `Custom field (Account)` -> `backlog.account`; `demand` starts as a copy of backlog and retains `account`. |
| Tempo delivery enrichment | Direct issue-key dictionary lookup copies Jira `account` into both worklog projections' `account`. `backlogWorklogs` additionally permits existing conditional immediate-parent fallback. |
| Tempo-native reporting | CSV `Account Name` -> `worklogs.tempoAccount`; legacy aggregation uses trimmed name, not `tempoAccountKey`. |

Jira fallback remains direct Jira Account first; immediate parent only if the direct Jira row is absent, the parent is present, and its Account is nonblank. A present direct Jira row with blank Account remains an exception. No recursive ancestry, changed Team ownership, or Client/Tempo Account inheritance is introduced. Operational `TEMPO-*` rows are not assigned invented Jira Account metadata.

`accountFacetRows()` combines Jira and Tempo labels through `groupAccounts()`:

- Managed Jira rows contribute Original Estimate by Jira Account, deduplicated by issue key within the bucket; filtered Jira rows contribute distinct item counts.
- `governedTempoAccountAggregation()` with its default dimension contributes managed, nonexcluded Tempo logged hours by trimmed Account Name. This legacy path skips blank or `-` Tempo names and includes valid operational effort with a nonblank name. Omission from a named-account report does not remove effort from governed totals or the CH-004 treemap's missing-key bucket.
- Jira blank Account forms `(blank)`, displayed as `No Account / Missing Account`. This existing compatibility label differs from Client `N/A` and treemap `-`.
- Buckets combine on matching label strings. Jira grouping uses `row.account` as supplied (or `(blank)`); Tempo grouping trims through `accountLabel()`. Selection normalizes through `accountFilterValue()` (trim, treat `-`/empty as `(blank)`). No key-based join or new case-insensitive enterprise normalization is implied. Same-name Tempo Accounts can merge here, unlike the key-based treemap.

Selections use `state.accounts` and `inSelectedAccount()` against labels; empty selections are unrestricted. `filteredData().worklogs` compares Tempo `row.tempoAccount`; its backlog and `backlogWorklogs` compare Jira-derived `row.account`. `governedLoggedWorklogRows()` and `demandBacklogData()` also compare Jira-derived `row.account`. One label can therefore select different populations in different consumers. A selected Tempo name does not prove Jira ownership; identical names cannot reconcile the systems by themselves.

Downstream Portfolio consumers retain this contract: Account options/detail table; People; Backlog Worked On; Delivery Progress; trend, planning, Team Utilization, Engineering Work Mix and Program effort; remaining-demand comparisons; backlog priority/severity; Tempo work-item-type chart; and `downloadSnapshot()` Account CSV. Governed effort continues to ignore Jira Status where already required and keeps its existing Jira Account predicate. Capacity remains workforce/date governed. Existing annual/source KPI rules are unchanged; new Tempo Account state is absent from them.

Demand Management retains independent `selectedPickers` Account state and Jira `row.account` predicates, with existing `Other/Blank` selection values. Its account-comparison display retains `row.account || row.tempoAccount || "No Account / Missing Account"` for actuals. The new Portfolio Account control does not synchronize with or replace Demand's Account filter. Demand capacity coverage, workflow, quality, counts, Original Estimate, Remaining Estimate and unlogged Jira population retain their meanings.

# 23. Source ownership and relationship boundaries

| Business concept | Authoritative source |
| --- | --- |
| Logged effort | Tempo (`Logged Hours`, carried as `logged`) |
| Client | Tempo Account Customer (`Account Customer`) validated by Account Key |
| Tempo Account | Tempo `Account Key` / `Account Name` |
| Jira Account metadata | Jira `Custom field (Account)` |
| Workforce metadata | Assignees CSV |
| Capacity | Weekly Capacity |
| Reporting weeks | Master Date (`Master Date`, `Week Number`) |

Tempo `Work date` supplies worklog `date`. Client and Account do not own Team, Capacity, Jira Status, issue hierarchy, or the calendar.

| Relationship | Implemented cardinality and limitations |
| --- | --- |
| Client -> Tempo Accounts | One verified Client may have many Accounts. A verified Account Key resolves to one customer in the supplied export; missing/conflicting evidence is unresolved. The export is not a complete or effective-dated Tempo Account registry. |
| Tempo Account -> worklogs | One Account can appear in many worklogs; each worklog carries one key or a missing key. Missing rows are not discarded or assigned by display name. |
| Jira issue -> Tempo worklogs / Accounts | One issue can have zero, one, or many direct worklogs and multiple Tempo Accounts. This is execution evidence, not ownership. Multiple Accounts may imply one Client or ambiguous Client; estimates remain at issue grain. |
| Jira-only item -> Client / Tempo Account | No Tempo evidence is required for unrestricted Jira reporting. Client is `N/A` without verified direct evidence; no Tempo Account is invented. |
| Jira Account <-> Tempo Account | No governed mapping or cardinality is established. Label equality does not establish a relationship. Reporting Account is compatibility aggregation only. |
| Workforce/date -> effort | Existing assignee mapping and Master Date rules determine scope; no Client/Tempo Account capacity allocation exists. |

The managed six-team population remains **Authoring, Delivery Express, Integration, Nexus, Portal, Scoring**. Engineering allocation metadata does not add a seventh delivery team. Documentation does not change roster, exclusions, grain, or parent/child rules.

# 24. Account Distribution semantic contract

The treemap shows nonoperational Tempo logged effort by Client or Tempo Account. It has no embedded Client/Account dropdowns; sidebar Client and Account control scope and grouping. Reporting Account does not filter it. There is no independent grouping toggle or residual local dropdown state.

| Filter state | Treemap grouping |
| --- | --- |
| Default Client and Account filters (both inactive) | Client |
| One or multiple Clients selected | Account |
| One or multiple Tempo Accounts selected | Account |
| All Tempo Accounts explicitly selected | Account |
| Both Client and Account active | Account, intersected |
| Both filters reset | Client |

Grouping condition: `state.clients.size || state.tempoAccountsActive`. Explicit All Clients has a nonempty Client Set when options exist and also groups by Account. Clearing Account returns to Client grouping only if no Client selection remains active.

`renderCharts()` supplies `filteredData({ ignoreAccount: true, ignoreStatus: true }).worklogs`. Here `ignoreAccount` means the **legacy Reporting Account** predicate; it does not deactivate Tempo Account selection. Date Range, Team, Assignee, Skill, Client, Account Category, Priority, Target Release, Program and Release Cycle predicates still apply where implemented, including hidden/parked filter state. Jira Status is ignored for this logged-effort visual. `renderAccountTreemap()` retains managed teams, reapplies global exclusions, and applies active Tempo Account keys.

This produces one eligible worklog population W for all three footer measures. Tiles use its nonoperational subset E, classified by the existing normalized `TEMPO-` issue-key test after exclusions. Names such as `TEMPO TICKETS`, `Operations`, or `Support` do not classify activity. Operational worklogs O remain in applicable logged-hours footers; Client/Account selections can narrow them too.

| Footer (existing label) | Definition and filter scope |
| --- | --- |
| Total logged hours (global filters) | Existing `peopleTotalsRow(groupPeople(W, []))` Logged Total: engineering plus operational effort in W. |
| Operational Tempo hours (global filters) | Existing Logged Operations from the same W; valid operational `TEMPO-*` work only. |
| Customer/account effort (global filters) | Sum of visible positive-hour nonoperational Client/Account buckets from E, including explicit missing attribution. |

For the validated positive-hour snapshot, Total = Operational Tempo + Customer/account effort. Tile percentages divide by visible customer/account effort, not Total including Operations. `accountDistributionRows()` encodes identity before aggregation so missing buckets survive, and retains aggregate buckets with `logged > 0`. No negative-hour/adjustment policy is introduced; see G6. Grouping alone retains eligible worklogs. Client/Account filtering can change totals by changing W. Explicit All covering the whole eligible option population preserves default totals; Select All after search can cover a subset.

Account tiles use trimmed keys, not names. Jira estimates cannot be assigned to these Accounts; estimate/variance tooltips remain unavailable. Missing key and unverified Client hours are retained without Jira inference. The generic footer label `global filters` means this treemap's applicable sidebar scope, excluding Reporting Account and Jira Status.

# 25. Snapshot reconciliation and validation evidence

These are **snapshot validation results, not permanent business constants or metric definitions**. The authoritative logged-effort source is `data/raw/RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv`, SHA256 `E57886118D0E40E409B7E4A1FD04EE0B0A4440AC8D934CD4952E39C0AA7CF08F`. Source cutoff/current date is 2026-10-30; payload observed worklog range is 2026-01-02 to 2026-10-30. Unfiltered means governed six-team scope and full observed dates, not all raw records or the June checkpoint.

| Measure | Hours |
| --- | ---: |
| Total logged | 51,806.039 |
| Operational Tempo | 8,263.271 |
| Nonoperational/customer-account | 43,542.768 |
| Nonoperational grouped by verified Client plus missing bucket | 43,542.768 |
| Nonoperational grouped by Tempo Account Key plus missing bucket | 43,542.768 |

The existing `.tmp/ch004_source_audit.py` was rerun on 2026-11-03. It reads CSV/current payload without rebuilding, uses existing exclusion/date/customer functions, compares each raw-to-payload Account Name, Account Key, resolved customer, logged hour and date in source order, and independently sums/groups managed worklogs. All five field comparisons passed; no row fan-out occurs.

There are 38,035 raw worklogs, 4,651 excluded rows, 33,384 governed valid-date rows in each of `worklogs` and `backlogWorklogs`, and 32,668 managed worklogs. The two payload projections are not populations to add together. Source Tempo Worklog IDs have no missing/duplicate values; the payload does not retain them, so this evidence creates no future deduplication rule. Exact excluded keys remain `TEMPO-54`, `TEMPO-92`, `TEMPO-106`, `TEMPO-111`, `TEMPO-112`, normalized under existing governance before analytics. Invalid work dates and unmanaged workforce rows follow existing build/runtime scope.

Nonoperational unverified-Client effort is **427.116 h**; missing Account Key effort is **304.533 h**. These are different gaps with possible overlap, not additive exception totals. Both remain explicit buckets. The export verifies 74 Account Keys to one customer, has two keys with no customer, and no conflicting mappings. Across all 33,384 worklogs, 23,052 Tempo/Jira Account labels differ; this supports keeping dimensions distinct and is not a selection rule.

Provenance is in local `web/build-manifest.json`, payload `meta.buildManifest`, and historical `data/.dashboard_sync_state.json`. All nine listed source-file hashes and builder/exclusion-script hashes were checked against disk. Supporting sources include Jira `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv`, roster `20261028_Assignees_Capacity.csv`, weekly `Weekly Capacity_20261028.csv`, and `Google 2026 to 2028_Master_Date.csv`; full hashes are in the validation report.

The manifest's `payloadSha256` digests the builder's **unsigned serialized payload**, before embedding the digest, not final `web/data.js` bytes. Recomputing that serialization yields `C5FBE6134A27338B9C1427CD0E3AEA859C5ED802751540C07B416B96CC1F2426`, matching the manifest. Final data.js SHA256 is `990459AD4E8E5E9E7EB981DC004C086152B0E1F31B32577314297FA7382EA5E5`; that different digest is expected. Recorded frontend hash `16C83B440E969501A1F07A572787D0D1DDE8BE8AEDC45726C79A0CAC3074582C` predates Step 2; current `web/app.js` is `7C16B5444218625FAE1A1F95F9D95966A9039C92A923A0F5795FADDE25379F45`. This manifest does not fingerprint the current frontend. Sync state is historical (2026-10-30T07:16:03.0342659Z), listing an older roster and weekly checksum; it is not preferred over verified current manifest/raw files. Nothing was regenerated to correct these records.

Step 2 evidence reviewed: `.tmp/ch004-step2/validation.json` (21 scenarios, zero errors) and `reporting-before-after.json` in the same directory (18 scenarios, eight comparison entries, zero errors). The latter compares rendered outputs/CSV for seven representative Reporting Account states and populations for all 83 labels against saved pre-change files. During Step 3, `verify_tempo_account_filters.cjs` was rerun with `CH004_BEFORE_DIR`: **21 scenarios, eight comparison entries, all 83 label populations, zero errors, PASS**. Its refreshed `validation.json` combines current scenarios and before/after comparisons. Six customer-attribution and seven exclusion Python tests passed. These are focused checks; no full-suite sign-off is claimed. See [validation report](../audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md).

Earlier `outputs/CH-004_architectural_conflict_2026-11-03.txt` and `outputs/CH-004_follow_up_validation_2026-10-28.txt` describe a pre-Step-2 gate and older controls. Their conclusions that the separate control is unimplemented are historical. The committed `ACCOUNT_DISTRIBUTION_OPERATIONAL_EFFORT_VALIDATION.md` also describes old embedded controls and local/global footer scopes. These records remain unchanged; dates alone do not supersede inspected code and focused evidence.

# 26. Implementation and test traceability

Paths/line anchors refer to inspected **local Step 2** files, not the GitHub review commit. Implementation is uncommitted and identified by hashes in the validation report.

| Semantic contract | Implementation evidence | Test evidence |
| --- | --- | --- |
| Verified Client, Jira-only `N/A`, no inferred fallback | `scripts/build_web_data.py:401 resolve_tempo_customers`, `:460 jira_customer_attribution`; `web/dashboard-core.js:4 clientValue`; `web/app.js:294 inSelectedClient` | `scripts/test_tempo_customer_attribution.py`; historical broader `verify_client_customer_filter.cjs` evidence |
| Exact raw/payload fields | `scripts/build_web_data.py:570–571` (`Account Name`, `Account Key`), `:588` (`Logged Hours`) | Existing `.tmp/ch004_source_audit.py` and JSON |
| Key identity, duplicate names, missing key, options | `web/app.js:752 tempoAccountId`, `:756 tempoAccountDisplay`, `:762 renderTempoAccountFacet`, `:1685 tempoTreemapAccount`, `:1690 accountDistributionRows` | `scripts/verify_tempo_account_filters.cjs` synthetic duplicate-name/missing-key case |
| Active All, reset, intersection, tile actions | `web/app.js:16–17` state, `:1630` tile callback, `:3668 toggleFilter`, `:3735 bindFacetPicker`, reset handler | Focused browser suite: Client/Account single/multiple/All, reset/chip, empty active Set, intersection, keyboard |
| Footer scope and operational separation | `web/app.js:1174` call, `:1584 renderAccountTreemap`, `:2380 addTreemapSummary`, existing `groupPeople` / `peopleTotalsRow` | Focused default/All/Team/Assignee/Date/Operations/exclusion/mobile checks; source audit |
| Reporting Account preserved | `web/app.js:289 inSelectedAccount`, `:381 filteredData`, `:461 governedLoggedWorklogRows`, `:523 demandBacklogData`, `:664 accountFacetRows`, `:3374 groupAccounts`, `:3706 downloadSnapshot` | Focused optional `CH004_BEFORE_DIR` comparison against saved `before-app.js` / `before-index.html` |
| Jira metadata / inheritance | `scripts/build_web_data.py:687` source, `:746` enrichment, existing parent-fallback block | Retained governance and transformation inspection; no new inheritance tests/changes |
| Sidebar labels / removed dropdowns | `web/index.html:131` Account, `:148` Reporting Account, treemap panel, `:525` lineage | Focused suite checks labels and absence of embedded selectors |
| Independent Demand Account | `web/demand.js:25`, `:29`, `:186`, `:196`, `:241`, `:313`, `:338` | Code inspection; before/after fingerprint includes Demand DOM, not full Demand workflow acceptance |
| Five-key exclusions | `scripts/governed_exclusions.py`, build partition/runtime guards | `scripts/test_global_tempo_exclusions.py` |

`scripts/verify_account_distribution.cjs` is now a compatibility entry point requiring `verify_tempo_account_filters.cjs`; it is not the old 117-scenario embedded-control suite. Those historical outcomes are not current CH-004 execution.

# 27. Open governance conflicts and semantic questions

| ID | Existing authority / limitation | CH-004 evidence and disposition |
| --- | --- | --- |
| G1 | `MVP_Business_Rules.md` Section 13 says treemap tiles contain only Jira Account-attributed engineering, with an exception-only footer. `Calculation_Governance.md` also puts unresolved Jira Account effort outside the treemap. `KPI_Definitions.md` Section 7 and retained dictionary text define that Jira partition. | Current visual uses Tempo Client/keys, includes nonoperational Jira-attribution exceptions in explicit Tempo buckets, and has Total/Operations/customer footers. Preserve Jira partition as a distinct concept; record implemented visual without silently changing those rules. Step 4 needs explicit reconciliation. |
| G2 | Canonical dictionary calls the Jira field `Account`; detailed visual specification still describes embedded dropdowns, old label-based Account filtering, and local/global footer scopes. | Qualify Jira metadata; document Tempo sidebar `Account`, legacy `Reporting Account`, and actual common footer scope. Do not rename payload fields or revise other documents. |
| G3 | `KPI_Definitions.md` Section 17 says all KPIs inherit global Account/Status; Semantic Visualization Governance says six cards remain fixed; 2026-10-30 Business Rules define filter-aware annual actuals. | Preserve source/annual KPI exceptions and logged-effort Status handling. New Tempo Account scopes only Account Distribution. Step 4 should clarify applicability per consumer; no new KPI rule is granted here. |
| G4 | No cross-system Account bridge, effective-dated customer registry, or key/name history is supplied. | Keep worklog evidence and label compatibility distinct. No Jira ownership/estimate split inferred. Conflicting customers remain `N/A`; same-key name changes use first-label display. |
| G5 | Frontend manifest hash and sync-state capacity/roster provenance predate current state; older audit reports describe different implementations. | Record verified sources/build/payload and current hashes separately. No manifest, sync-state, or baseline repair in Step 3. |
| G6 | Aggregation retains only positive-hour buckets; conservation for negative/nonpositive buckets and future name/customer changes is not defined by current evidence. | Current snapshot fully reconciles. No new adjustment or identity-history policy is introduced; future-source semantics require a separate decision. |
| G7 | v0.3 references historical paths/June data. The repository import's dictionary differs from today's canonical version, including pre-existing Bug Triage removals and later Client definitions. | Keep baseline blob unchanged and identify exact current versions. No approval chronology is inferred from recency. These differences are not introduced, restored, or declared newly approved by CH-004. |

Sections 5–21 retain Team, Skill, Key, Summary, Status, dates, Release Cycle/forecast/allocation, Capacity, Logged Engineering/Operations/Total, Delivery Health, exclusions, Master Date, and Backlog semantics. Original Estimate, Remaining Estimate, Demand Management, workforce ownership and parent inheritance are not redefined. The original overlapping Purpose statements about visualization behavior remain outside this edit's scope. Production code, sources, payloads, tests, other governance documents, and authoritative baseline remain untouched by Step 3. **Stop at this proposal and validation report; broader governance changes require explicit Step 4 approval.**
