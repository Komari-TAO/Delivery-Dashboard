# Chart and Visual Specification — CH-005A v1

> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only.

## Revision provenance and version history

Previous proposal: [Chart_and_Visual_Specification_CH004_v1.md](Chart_and_Visual_Specification_CH004_v1.md), preserved unchanged. Canonical comparison document: [Chart_and_Visual_Specification.md](Chart_and_Visual_Specification.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/user-guides/Chart_and_Visual_Specification.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob 058c0c590547de3d1a2f75624f86a0359536c743. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work.

| Version | Date / status |
| --- | --- |
| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |
| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |
| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |

## CH-005A decision and evidence boundary

This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.

Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision.

Business-facing specification for every KPI, chart, and diagram in the Delivery Management BI workspace. Source file names use the **latest matching export** under `data/raw/` (patterns from `scripts/build_web_data.py`). Field names use **`[filename].[column]`** notation.

## Global rules (all visuals)

| Rule | Description |
| --- | --- |
| Governed exclusions | Issue keys `TEMPO-54`, `TEMPO-92`, `TEMPO-106`, `TEMPO-111`, `TEMPO-112` are removed in the builder and again in the browser before any aggregation (`scripts/governed_exclusions.py`, `web/app.js`). |
| Managed teams | Teams must appear in both `*Assignees*Capacit*.csv` and `Weekly Capacity_*.csv`; other teams are dropped from governed effort and capacity. |
| Assignee canonicalization | Names are normalized and mapped via `*Assignees*Capacit*.csv.Assignee`. |
| Date range | **Tempo-backed metrics** filter on worklog `date` (from `RAW_DATA_FULL_ANALYSIS_*.csv.Work date`) between **From** and **To**. |
| Release cycle filter | Worklog `releaseCycle` is derived from `RAW_DATA_FULL_ANALYSIS_*.csv.Work date` joined to `Release Cycle*.csv` (Start Date / End Date). |
| Capacity weeks | Weekly capacity rows are included only for `Week Number` values that appear on `*Master*Date*.csv` dates inside the selected range. |

### Sidebar filters (consumer-specific applicability; Account activation is explicit)

**Client source contract (2026-10-22): Client = Tempo Customer Account**, the CSV field `Account Customer` (column S), validated using `Account Key`. Tempo Account Name, Jira Account, Jira Delivery, and legacy Jira/Tempo Client are separate concepts. Worklogs use the unique verified customer for their account key. Jira items require complete direct worklog evidence for exactly one customer; otherwise Client is `N/A`. Mapping is computed from the complete governed valid-date export before date or other UI filters, with no parent/customer inheritance. See [Calculation Governance](../governance/Calculation_Governance_CH005A_v1.md#client-attribution-2026-10-22) for conflict, incomplete-evidence and grain rules, and [validation results](../audit/CLIENT_CUSTOMER_ATTRIBUTION_VALIDATION.md) for current gaps. Both pickers and the Portfolio snapshot export use the same canonical `tempoCustomerAccount` field. Capacity is not customer allocated; current annual Portfolio KPI applicability is governed by the Portfolio KPI section below. Client = verified Tempo `Account Customer`. Portfolio Account = trimmed, case-preserved Tempo `Account Key` identity with `Account Name` for display. Account Category = Tempo `Account Category`. Jira Account = Jira `Custom field (Account)` metadata and retained planning/diagnostic use. Legacy Reporting Account labels exist only in v1 export compatibility controls; no modern Portfolio selection state or predicate uses that dimension. Matching names do not establish a Jira/Tempo relationship. The consolidated Key control scopes approved Portfolio effort directly and applicable Jira issue populations by observed membership; legacy labels are retained only in v1 export controls.

| Filter | Tempo worklogs | Jira PI backlog | Weekly capacity |
| --- | --- | --- | --- |
| Team | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` is normalized and matched to `20261009_Assignees_Capacity.csv.Assignee`; the filter value is `20261009_Assignees_Capacity.csv.Team`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee` is normalized and matched to `20261009_Assignees_Capacity.csv.Assignee`; the filter value is `20261009_Assignees_Capacity.csv.Team`. | `Weekly Capacity_20261005.csv.Assignee` is matched to `20261009_Assignees_Capacity.csv.Assignee`; the filter value is `20261009_Assignees_Capacity.csv.Team`. |
| Assignee | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`, normalized against `20261009_Assignees_Capacity.csv.Assignee`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`, normalized against `20261009_Assignees_Capacity.csv.Assignee`. | `Weekly Capacity_20261005.csv.Assignee`, normalized against `20261009_Assignees_Capacity.csv.Assignee`. |
| Skill | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` → `20261009_Assignees_Capacity.csv.Assignee` → `20261009_Assignees_Capacity.csv.Skill`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee` → `20261009_Assignees_Capacity.csv.Assignee` → `20261009_Assignees_Capacity.csv.Skill`. | `Weekly Capacity_20261005.csv.Assignee` → `20261009_Assignees_Capacity.csv.Assignee` → `20261009_Assignees_Capacity.csv.Skill`. |
| Client | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Customer`, verified with `.Account Key` -> `tempoCustomerAccount`; unresolved `N/A`. | Same Tempo `.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Issue key`; only complete verified direct evidence for one customer attributes a Jira row, otherwise `N/A`. | Not customer allocated. |
| Account | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key` identity; `.Account Name` display. Direct Key predicate for approved effort consumers. | Normalized direct Issue key = Work Item Key evidence from complete governed eligible valid-date snapshot before UI filters; observed selected-key membership, no ownership bridge. | Not applied; no Account allocation. |
| Account Category | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Category`. | Not applied; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv` has no Account Category column. | Not applied; `Weekly Capacity_20261005.csv` has no Account Category column. |
| Priority | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`, returning `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority`. | Not applied; `Weekly Capacity_20261005.csv` has no Priority column. |
| Status | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`, returning `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`. | Not applied; `Weekly Capacity_20261005.csv` has no Status column. |
| Target Release | Native Tempo fallback: `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Version Name`. Governed value: `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`, returning `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`. | Not applied; `Weekly Capacity_20261005.csv` has no Target Release column. |
| Program | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`, returning `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Program)`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Program)`. | Not applied; `Weekly Capacity_20261005.csv` has no Program column. |
| Release Cycle | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` is placed between `Release Cycle.csv.Start Date` and `Release Cycle.csv.End Date`; the filter value is `Release Cycle.csv.Release Cycle`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Fix versions` is the Jira release value used by the backlog path. | `Weekly Capacity_20261005.csv.Week Number` is matched to `Google 2026 to 2028_Master_Date.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Master Date` is placed between `Release Cycle.csv.Start Date` and `Release Cycle.csv.End Date`, returning `Release Cycle.csv.Release Cycle`. |

**Status default:** On load, the existing governed default status set is applied. Status affects supported Jira/backlog and Status-aware joined-row consumers. Governed logged effort, the annual actual-effort numerator and Account Distribution retain their Status-independent behavior; not every Tempo consumer responds identically.

Explicit **Select All** stores the currently rendered Account options and activates Account grouping. It differs from inactive **All accounts**. Search or other applicable scope can limit those options; it is not a wildcard for future Accounts. Explicit All Clients also activates Account grouping when options exist. Clear All Accounts deactivates Account selection; Client grouping returns only when Client is also cleared. Client and Account selections intersect; a selection outside the current scope does not widen it.

---

## Portfolio KPI cards (`#generalKpiGrid`)

The annual workforce measures describe a gross annual budget, before vacation and absence deductions. They do not describe future available capacity, net headroom, overtime, or net utilization.

| KPI | Calculation and source |
| --- | --- |
| Annual Gross Workforce Hours | Supplied Development + Engineering `Actual Annual Hours` from the selected Assignees_Capacity source, joined once per canonical Assignee ID. Components appear beneath the total. |
| Annual Development Capacity | Existing full-source Weekly Capacity Planned Hours sum, with blanks contributing zero. Planned Support from Support hours 2026.csv appears separately; Support is already deducted from Development. Neither represents complete net workforce capacity. |
| Actual Hours | Governed six-team Tempo effort for the same selected roster, year, dates and effort filters as the annual balance and ratio. The three cards share one calculated numerator; source coverage is shown. |
| Gross Annual Hours Balance | Full-year gross allocation for the selected roster minus governed actuals for that same roster, year, selected dates and existing effort filters. Neutral styling; a gross budget balance before absences. |
| Logged Hours / Gross Annual Hours | Governed actuals divided by the compatible gross annual allocation; gross budget consumption, not selected-week or net utilization. A zero denominator is unavailable, not 0%. |
| Demand Capacity | Existing fixed full-source Jira Effort CAP sum, unchanged. |

### Scope, year and missingness

The canonical roster is restricted to Authoring, Delivery Express, Integration, Nexus, Portal and Scoring, unique by Assignee ID. Keep valid 0% membership. Exclude Ionut, QA, BA and UX. Engineering is an annual allocation category, never another selectable workforce team or a second person record.

Team, Assignee and Skill narrow annual allocations through that roster. Date, release and effort-only selections narrow Actual Hours and the balance/ratio numerator without prorating the full-year annual baseline; the cards explain this difference. Existing governed effort ignores Status, as before. Development Capacity and Demand Capacity retain their original full-source filter behavior and are labeled accordingly.

Reporting year is derived from the selected date range. Annual allocations exist only for the declared 2026 source scope. Another year or a multi-year selection makes annual gross, balance and ratio unavailable. Never reuse 2026 allocations for another year. Missing/invalid annual values or ambiguous identities are unavailable; a confirmed zero gross allocation remains zero, with an unavailable ratio.

Supplied joiner/leaver annual adjustments are authoritative and are not prorated again. Never spread gross Engineering hours across weeks or infer net Engineering capacity/absence deductions. Support is planned reservation capacity, never additional actual effort. A full active week has a 40-hour baseline; 40 minus Development is not a vacation estimate because Support, Engineering, employment dates and partial weeks also matter.

The governed numerator uses the existing canonical contributor effort path and exact Tempo exclusions once. Actual Hours, gross balance and consumption ratio use this same numerator, as confirmed by the user. The raw full-source sourceKpis.actualHours field is retained for audit compatibility but no longer supplies the Portfolio Actual Hours card. Weekly/Iteration Hours Trend, its boundary-week and filter warnings, Team Utilization, account attribution, Delivery Progress, Backlog Worked On and Demand Management calculations are unchanged.

This section is the controlling current Portfolio card contract; older dated mappings below are historical lineage and do not override it.

---

## Hours Trend (`#trendChart`)

### Business explanation

Compares governed logged effort with available capacity for the filtered portfolio. Weekly view uses Master Date weeks. Iteration view uses the governed Release Cycle dates: effort is dated within each release cycle window, while capacity includes the full Weekly Capacity for each Master Date week touched by the selected release cycle dates.

### Chart type

Stacked bar chart for logged effort and line chart for available capacity.

### Fields

| Series | Aggregation | Fields |
| --- | --- | --- |
| Logged Engineering | Sum valid non-`TEMPO-*` worklog hours by period | `RAW_DATA_FULL_ANALYSIS_*.csv.Logged Hours`, `.Work date`, `.Work Item Key` |
| Logged Operations | Sum valid `TEMPO-*` worklog hours by period | same Tempo fields; global exclusions apply first |
| Available Capacity | Sum Weekly Capacity planned hours once per selected Master Date week | `Weekly Capacity_*.csv.Planned Hours`, `.Week Number`; Master Date `Week Number` |
| Remaining | Available Capacity − (Logged Engineering + Logged Operations) | Derived in the chart; negative values remain negative |

### Filters

Team, Assignee, Skill, Account, Account Category, Priority, Target Release, Program, and Release Cycle filters apply to governed logged worklogs. Capacity uses the applicable Team, Assignee, Skill, and Master Date scope. The Status filter does not apply to this chart. Grain: user selects Weekly or Iteration (`#trendGrain`). Date Range and release cycle selection intersect. When Client, Account, Account Category, Priority, Target Release, or Program is active, the chart identifies those effort-only filters and states that Remaining is not a like-for-like capacity balance under them.

### Rules

Managed-team governed worklogs only; global exclusions apply before aggregation. Weekly view preserves the selected partial-week treatment: any selected Master Date date includes the full Weekly Capacity for that week. Iteration view uses `Release Cycle.csv.Start Date` through `.End Date` inclusively and includes each touched Master Date week once without proration. Adjacent iterations may repeat a boundary week, so their capacity and Remaining values are not additive. A combined-period total must deduplicate weeks independently. Worklogs outside all defined release cycle dates are not assigned to an iteration and are disclosed by the chart. Iteration tooltip and accessible details expose the full release cycle dates, effective selected release cycle dates after Date Range intersection, Master Date weeks included in capacity, and any included full boundary week extending outside the effective selected dates.

### Release-cycle attribution correction

`Remaining` remains unchanged as a formula: `Available Capacity − (Logged Engineering + Logged Operations)`. The 2026-10-28 Code Freeze boundary correction normalizes Tempo worklog timestamps to calendar dates before the existing inclusive release-cycle date comparison; it does not change that formula, capacity allocation, Tempo exclusions, or unfiltered logged totals.

On the tested source snapshot, 1,397 governed worklogs totaling 2,172.899 h were newly assigned from blank release-cycle attribution. They were not reassigned between cycles. Consequently, unfiltered totals remain unchanged, while release-scoped effort and derived Remaining values can change when an affected release cycle is selected or displayed.

---

## Planned vs Unplanned Effort (`#planningChart`)

### Business explanation

Compares **how much planned vs unplanned delivery work** was executed, measured as **distinct Tempo/Jira work item keys** (bar height) with hours in the summary. Operational Tempo items are tracked separately. Supports portfolio planning discipline (PLANNED / UNPLANNED Jira labels).

### Chart type

Bar chart (Planned vs Unplanned distinct key counts); summary lists hours for Planned, Unplanned, Operations, Unclassified.

### Fields

| Concept | Fields |
| --- | --- |
| Work item key | `RAW_DATA_FULL_ANALYSIS_*.csv.Work Item Key` |
| Logged hours | `RAW_DATA_FULL_ANALYSIS_*.csv.Logged Hours` |
| Planning classification | Built in builder from `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Labels` (and parent/ancestor walk); payload `planningCategory`, `planningMetadataSource` |
| Operational Tempo keys | Keys starting with `TEMPO-` → Operations |
| tempo-ticket label | `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Labels` contains `tempo-ticket` → Operations |

### Filters

Governed logged worklogs; date range and sidebar filters; **Status ignored**.

### Rules

- One bucket per distinct work item key; hours summed across worklog rows.
- PLANNED / UNPLANNED derived from Jira labels (`PLANNED`, `UNPLANNED`); both labels → conflict handling in builder.
- Chart bars show **Planned** and **Unplanned** counts only; Operations and Unclassified appear in the footer summary.

---

## Program Distribution (`#programPieChart`)

### Business explanation

Shows **where governed Tempo hours landed by business program** (PS, MS, PD, S-GTM). Highlights program-mapped hours vs governed total and unmapped/non-program hours.

### Chart type

Pie chart with callouts; footer metrics for program-mapped, governed total, and unmapped hours.

### Fields

| Concept | Fields |
| --- | --- |
| Program on work item | `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Custom field (Program)` joined on `RAW_DATA_FULL_ANALYSIS_*.csv.Work Item Key` = `Issue key` |
| Parent program fallback | `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Custom field (Program)` on parent key when child has no program |
| Logged hours | `RAW_DATA_FULL_ANALYSIS_*.csv.Logged Hours` |

### Filters

Date range; Team; Assignee; Skill; Account; Category; Priority; Target Release; Release Cycle; **Program filter is ignored** when building slices (so the pie always shows the full program mix for the other filters). **Status ignored**.

### Rules

Governed managed-team worklogs; program resolved per worklog row in the browser (`resolveProgramForWorklog`).

---

## Bug Severity Distribution (`#bugSeverityChart`)

### Business explanation

Distinct Jira PI Backlog bugs by severity, limited to **Blocker**, **Critical**, and **Major**. This is Jira work-item inventory, not Tempo effort.

### Chart type

Horizontal bar chart.

### Fields

| Concept | Fields |
| --- | --- |
| Bug rows | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue Type` = `Bug` |
| Severity | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Bug Severity)` limited to `Blocker`, `Critical`, or `Major` |
| Distinct keys | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` (deduplicated) |

### Filters

Team; Assignee; Skill; applicable Status and observed Account membership. **Unresolved pre-existing date conflict:** retained governance says Date Range does not apply (current-export queue), but the current caller supplies filteredData().backlog, which applies Created-date range. CH-005A neither authorizes a new date rule nor changes that implementation. This exception must not be treated as resolved.

### Rules

Severity order: Blocker, Critical, Major, Medium, Low, Enhancement; empty severity excluded from distribution bars.

---

## Account Distribution (`#accountTreemap`)

### Business explanation

Treemap of governed nonoperational Tempo logged hours by Client by default. Active Client or Tempo Account selections switch it to Account distribution. Sidebar selections govern scope and grouping; Client/Account selections intersect. Legacy Reporting Account labels are export-only; modern Portfolio has no such predicate. Tile size is customer/account logged effort; tile percentage uses visible customer/account effort.

**Approval boundary:** Delivery Management G1 approval supersedes Jira Account-restricted treemap eligibility and exception-only footer rules for Account Distribution only. It does not approve unrelated historical changes or alter KPI formulas, Jira demand, exclusions, Team, Status, hierarchy, capacity, or other visualizations.

### Chart type

Treemap (SVG).

### Fields

| Concept | Exact source / payload fields |
| --- | --- |
| Client | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Customer`, verified using `.Account Key` -> `tempoCustomerAccount` and `clientAttributionStatus`; unverified picker `N/A`, tile `-` |
| Account identity / display | Same Tempo file `.Account Key` -> `tempoAccountKey` (trimmed identity), `.Account Name` -> `tempoAccount` (display `Name (Key)`); missing key -> explicit `-` |
| Effort / date | Tempo `.Logged Hours` -> `logged`; `.Billable Hours` -> `billable`; `.Work date` -> `date` |
| Operational classification | Tempo `.Work Item Key`, normalized by shared `isTempoWorkItem` after the exact five-key exclusions; never Client/Account names |
| Workforce / calendar | `20261028_Assignees_Capacity.csv` mapping; `Google 2026 to 2028_Master_Date.csv` for reporting calendar; no changed Team rules |
| Jira estimates / variance tooltip | `-`; unavailable for Tempo Client/Account identity without an authoritative bridge |

### Filters

| Sidebar state | Account Distribution |
| --- | --- |
| No active Client or Tempo Account selection | Distribution by Client |
| Client selected | Associated Account distribution |
| Tempo Account selected | Selected Account distribution |
| Explicit All Accounts | All eligible Account distribution |
| Client and Account active | Intersected Account distribution |
| Both reset | Default Client distribution |

Explicit **Select All** stores the currently rendered Account options and activates Account grouping. It differs from inactive **All accounts**. Search or other applicable scope can limit those options; it is not a wildcard for future Accounts. Explicit All Clients also activates Account grouping when options exist. Clear All Accounts deactivates Account selection; Client grouping returns only when Client is also cleared. Client and Account selections intersect; a selection outside the current scope does not widen it.

The common source is `filteredData({ ignoreAccount: true, ignoreStatus: true }).worklogs`: ignoreAccount temporarily bypasses the consolidated Portfolio Account Key predicate; the treemap renderer reapplies the selected keys after its existing eligibility checks. Existing applicable date, workforce, Client, category, priority, target-release, program and Release Cycle predicates remain. `renderAccountTreemap()` reapplies managed-team/exclusion checks and active Tempo Account keys. Selected keys remain available to clear across temporary empty scopes; changing Client does not silently replace Account selection. An active empty Account set matches no worklogs, unlike inactive All.

### Rules

Tiles contain governed managed, nonexcluded, nonoperational Tempo worklogs, including explicit missing-attribution buckets. Operational `TEMPO-*` effort is excluded from tiles by the existing issue-key classifier, never by Client/Account names. All three footer values use one applicable Client/Account-filtered Tempo scope: Total logged hours, Operational Tempo hours, and Customer/account effort. Jira Status does not filter this visual; the Reporting Account sidebar control has been removed. Date Range, Team, Assignee, Skill, Client, Account Category, Priority, Target Release, Program and existing Release Cycle state apply where implemented; active Tempo Account keys are then applied. The UI footer phrase `global filters` refers to this consumer-specific scope. Changing grouping alone preserves eligible worklogs; applying Client or Account filters can change populations and totals. Missing Client displays `-` in tiles (`N/A` in the Client picker); missing Account Key remains a `-` bucket. Only positive aggregate-hour buckets render (`logged > 0`); negative-adjustment conservation remains unapproved/unvalidated (G6).

- `accountDistributionRows()` uses encoded Client or trimmed Account Key identity with `governedTempoAccountAggregation()`. Equal Account Names with different keys remain separate; no Jira join or independent effort formula is introduced.
- All three footer measures remain visible in empty states. They reuse `peopleTotalsRow(groupPeople(W, []))` for Total/Operations; customer effort is the visible nonoperational bucket sum. Operational worklogs can also be narrowed by Client/Account selections.
- For the validated positive-hour snapshot, Total Logged 51,806.039 h = Operational Tempo 8,263.271 h + Customer/Account effort 43,542.768 h. Grouping alone conserves this unfiltered nonoperational population. These are snapshot results, not permanent formulas or historical replay evidence.
- Client tile click sets the sidebar Client filter; Account tile click selects its key, or clears Account selection when clicked again while selected. Enter/Space trigger the same action. Client can therefore affect its other existing consumers; Account Key also scopes the other approved Portfolio consumers, each under its own eligibility contract.
- No embedded selectors or independent grouping toggle remain. No chart-specific export exists. Snapshot v2 follows Account Key/Client scope with separate issue-grain records; planning v2 uses current demand snapshot scope. Explicit legacy v1 alone retains original label scope and ignores modern Account Key selection.
- Jira Account diagnostic partitions remain separate. Historical audit narratives describe earlier controls; current evidence is in [Step 3 validation](../audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md) and [Step 4 validation](../audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md). G4–G10 remain qualified there.

---

## Team Utilization (`#teamChart`)

### Business explanation

Per-team view of **planned weekly capacity** (summed for weeks in range) vs **logged hours**, plus variance and utilization rate. Answers: “Are teams over or under-planned versus actuals?”

### Chart type

Utilization bar chart (logged vs planned per team).

### Fields

| Concept | Fields |
| --- | --- |
| Logged by team | `RAW_DATA_FULL_ANALYSIS_*.csv.Logged Hours` + assignee → `*Assignees*Capacit*.csv.Team` |
| Planned capacity | `Weekly Capacity_*.csv.Planned Hours`, `Weekly Capacity_*.csv.Week Number`, `Weekly Capacity_*.csv.Assignee` |
| Week alignment | `*Master*Date*.csv.Master Date`, `*Master*Date*.csv.Week Number` |

### Filters

Governed logged worklogs (status ignored) for logged side; capacity filtered by team, assignee, skill, and weeks intersecting date range.

### Rules

Only **active managed teams** appear; utilization = logged ÷ planned (0 if no planned hours).

---

## Remaining Demand vs Logged Effort by Team (`#demandChart`)

### Business explanation

Compares **outstanding Jira remaining estimate** (demand) by team with **Tempo logged hours** in the selected period. Highlights teams carrying demand versus effort spent.

### Chart type

Grouped bar chart (remaining estimate hours vs logged hours).

### Fields

| Concept | Fields |
| --- | --- |
| Remaining demand | `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Remaining Estimate` (seconds → hours in builder) |
| Team on backlog | Assignee → `*Assignees*Capacit*.csv.Team` |
| Logged effort | `RAW_DATA_FULL_ANALYSIS_*.csv.Logged Hours` (governed, by team) |

### Filters

**Demand:** PI backlog with Team, Assignee, Skill, Account, Priority, Status, Target Release, Program, Release Cycle — **not** limited by Created date in this chart path (`demandBacklogData`). **Logged:** governed worklogs with date range and filters; status ignored for logged side.

### Rules

Managed teams only; remaining estimates summed per team.

---

## Backlog Priority (`#priorityChart`)

### Business explanation

Distribution of **PI backlog items created in the selected date range** by Jira priority. Shows incoming demand mix (Critical, High, etc.).

### Chart type

Horizontal bar chart (top 8 priorities by count).

### Fields

| Concept | Fields |
| --- | --- |
| Priority | `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Priority` |
| Created filter | `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Created` (date portion in range) |

### Filters

Full backlog filter set including **Status** and **Created date** within range.

### Rules

Count = backlog rows after filters (not distinct keys unless one row per issue in export).

---

## Engineering Work Mix (`#engineeringMixChart`)

### Business explanation

Donut of **governed engineering logged hours** split into **Bugs**, **Technical Debt**, and **Rest** (everything else non-operational). Operations (Tempo operational keys) are excluded from the donut and reported separately in validation logs.

### Chart type

Donut chart.

### Fields

| Category | Rule | Fields |
| --- | --- | --- |
| Bugs | Jira issue type matches bug patterns | `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Issue Type` |
| Technical Debt | Custom field Yes | `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Custom field (Is this technical debt ?)` |
| Rest | Other governed engineering keys | Remaining classified keys |
| Operations | `TEMPO-*` keys | `RAW_DATA_FULL_ANALYSIS_*.csv.Work Item Key` |
| Hours | Sum logged per distinct key | `RAW_DATA_FULL_ANALYSIS_*.csv.Logged Hours` |

### Filters

Governed logged worklogs; date range and sidebar filters; **Status ignored**.

### Rules

Each work item key classified once; operations keys excluded from engineering total.

---

## Work Item Types (`#typeChart`)

### Business explanation

Shows **which Jira issue types** account for the most Tempo **worklog rows** in the period (activity volume by type).

### Chart type

Horizontal bar chart (top 7 types by row count).

### Fields

| Concept | Fields |
| --- | --- |
| Issue type | `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Issue Type` joined to worklogs |
| Metric | Count of worklog rows using `RAW_DATA_FULL_ANALYSIS_*.csv.Work Item Key`. |

### Filters

**Filtered Tempo worklogs** (`raw.worklogs` path) including **Status** when status filter is active; date range and sidebar filters.

### Rules

Rows with empty issue type excluded.

---

## Details panel (tables)

### Accounts tab

**Business:** actual effort by Tempo Account Key with observed linked-issue Original and Remaining Estimates, not contractual Account budgets.

**Fields:** Tempo Account Key / Name / Logged Hours / Worklog ID; Jira Issue key / Original estimate / Remaining Estimate / Custom field (Account) as metadata.

**Filters:** direct Key for actuals (Work date, governed Status-independent path), observed full-snapshot membership for Jira estimates (existing Created-date and Status scope). Preserve workforce and other consumer-specific predicates. Account Category does not allocate Jira estimates.

**Totals and availability:** issue estimates occur once per row's distinct linked issue set, can overlap across rows, and deduplicate in the visible union footer. No-worklog issues are outside Account-row estimates and disclosed separately in issue/population evidence. Variance/ratio require the qualified complete one-Key comparison described below; otherwise Unavailable, including all union comparisons.

**Evidence / exports:** Account details expose complete eligible Jira issue evidence and selected/unlinked/other subtotals beneath the table. Snapshot v2 ignores detail text search and displayed-row limits. Legacy v1 label controls are export-only. The separate planning reconciliation uses Remaining Demand snapshot scope; it is not a Created-date or future-horizon population.

### People tab

**Business:** Assignee utilization — logged hours vs weekly planned capacity in range.

**Fields:** `*Assignees*Capacit*.csv.*`, `Weekly Capacity_*.csv.Planned Hours`, `RAW_DATA_FULL_ANALYSIS_*.csv.Logged Hours`.

**Filters:** Governed effort scope; capacity weeks from master date.

### Backlog tab

**Business:** Work items with Tempo activity in range (“backlog worked on”).

**Fields:** `backlogWorklogs` enrichment — Tempo dates plus Jira fields from PI backlog / operational mapping.

**Filters:** `backlogWorklogs` stream; date on Tempo work date; status behavior per governed rules.

### Delivery Progress tab

**Business:** In-flight delivery items with health (overdue, due soon, etc.) and logged effort.

**Fields:** Jira dates (`Due date`, `Custom field (Start date)`), status, estimates, Tempo worklogs via `backlogWorklogs`.

**Filters:** Activity in date range; **Team filter ignored** for row set (team ownership validated separately).

## Source file patterns (builder)

| Pattern | Role |
| --- | --- |
| `RAW_DATA_FULL_ANALYSIS_*.csv` | Tempo worklogs |
| `All Jira Work Items marked PI Backlog (JIRA)_*.csv` | PI backlog / Jira enrichment |
| `Weekly Capacity_*.csv` | Planned hours by week |
| `*Assignees*Capacit*.csv` | Team, skill, role, annual hours |
| `*Master*Date*.csv` | Calendar week mapping |
| `Release Cycle*.csv` | Release cycle windows |
| `data/mappings/tempo_operational_mapping.csv` | Tempo operational summaries and keys |

## Build provenance

Each data build writes `web/build-manifest.json` with SHA-256 hashes for source CSVs, `scripts/build_web_data.py`, `scripts/governed_exclusions.py`, `web/app.js`, and the generated `web/data.js` payload. See `meta.buildManifest` in the payload after the next rebuild.

---

## Exact source and field lineage (dated evidence and current overrides)

This section preserves dated field-level lineage. October 7/9/22 filenames are historical examples, not current source selection. Current October 30 Account lineage and the current Portfolio KPI contract control where stated; the builder manifest records current selected files. A value marked **Derived** is calculated by `scripts/build_web_data.py` or by the browser from the stated source fields; it is not a CSV column.

### Historical source-file selection retained from CH-004

| Source role | Exact file | Exact fields used by the dashboard |
| --- | --- | --- |
| Tempo worklogs | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv` | `Work Item Key`, `Work Item summary`, `Logged Hours`, `Billable Hours`, `Work date`, `User Account ID`, `Full name`, `Tempo Team`, `Account Key`, `Account Name`, `Account Category`, `Account Customer`, `Product Module`, `Work Item Type`, `Work Item Status`, `Priority`, `Version Name`, `Parent Key`, `Assignee ID`, `Work Item Original Estimate Hours`, `Work Item Remaining Estimate Hours`, `Task Type`, `Date created`, `Date updated`, `Tempo Worklog ID` |
| Jira PI backlog | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv` | `Issue key`, `Summary`, `Parent`, `Parent summary`, `Issue Type`, `Status`, `Status Category`, `Priority`, `Assignee`, `Reporter`, `Created`, `Updated`, `Resolved`, `Due date`, `Fix versions`, `Labels`, `Original estimate`, `Remaining Estimate`, `Custom field (Account)`, `Custom field (Bug Severity)`, `Custom field (Delivery)`, `Custom field (Is this technical debt ?)`, `Custom field (Product Module)`, `Custom field (Program)`, `Custom field (Start date)`, `Custom field (Target Release)`, `Team Id`, `Team Name`, `Custom field (Tempo Team)` |
| Assignees master | `20261009_Assignees_Capacity.csv` | `Team`, `Assignee ID`, `Assignee`, `Role`, `Skill`, `Availability`, `Annual Hours`, `Actual Annual Hours`, `Capacity Start Date`, `Capacity End Date` |
| Weekly capacity | `Weekly Capacity_20261005.csv` | `Team`, `Assignee ID`, `Assignee`, `Role`, `Skill`, `Availability`, `Total`, `Week Label`, `Week Number`, `Planned Hours` |
| Master calendar | `Google 2026 to 2028_Master_Date.csv` | `Master Date`, `Day`, `Month`, `Year`, `Weekday`, `WeekDay Name`, `Month Name`, `Week Number` |
| Release calendar | `Release Cycle.csv` | `Release Month`, `Release Cycle`, `Start Date`, `End Date` |
| Business Area mapping | `Promoters.csv` | `Business Area`, `Promoter` |
| Tempo operational mapping | `data/mappings/tempo_operational_mapping.csv` | Governed Tempo-only key classification and display mapping. It is used only where a `TEMPO-*` work item needs operational metadata not present in the Jira PI backlog export. |

### Shared derived fields

| Payload / visual field | Exact source field(s) and rule |
| --- | --- |
| `team` | **Derived** by matching `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` (and Jira `Assignee`) to `20261009_Assignees_Capacity.csv.Assignee`, then taking `20261009_Assignees_Capacity.csv.Team`. |
| `skill` | **Derived** by matching `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` or `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee` to `20261009_Assignees_Capacity.csv.Assignee`, then taking `20261009_Assignees_Capacity.csv.Skill`. |
| `releaseCycle` | **Derived** by placing `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` inside `Release Cycle.csv.Start Date` to `Release Cycle.csv.End Date`, returning `Release Cycle.csv.Release Cycle`. |
| `account` on a Tempo worklog | **Derived** by joining `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` to `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`, returning `Custom field (Account)`. The Tempo-native account display remains `Account Name`. |
| `productModule`, `priority`, `status`, `targetRelease`, `program`, `delivery` on a Tempo worklog | **Derived** from the same work-item join to the Jira fields `Custom field (Product Module)`, `Priority`, `Status`, `Custom field (Target Release)`, `Custom field (Program)`, and `Custom field (Delivery)`. |
| `planningCategory` | **Derived** from Jira `Labels`: `PLANNED`, `UNPLANNED`, `tempo-ticket`, and the `TEMPO-` key prefix determine the classification. |
| `demandHours` | **Derived** from `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate ÷ 3,600`. Empty estimates remain missing; they are never converted to zero. |
| `planningPeriod` | **Derived** from Jira `Custom field (Target Release)`. If blank, the Jira `Due date` is placed into `Release Cycle.csv.Start Date` to `End Date`. A historical target release with a future due date is classified as a backport and reassigned to the due-date release. |
| `epicWorkflowStage` | **Used only by Epic Workflow.** Jira rows where `Issue Type` is `Epic`, `Epic Lab`, or `Epic Release` are categorized from normalized `Status`: `Backlog`, `OAT - Idea`, `OAT-IDEA`, or `Placeholder` = Step 1 Demand; `To Do`, `Analysis & Prepare Development`, or `OAT - Ready for PI` = Step 2 DoR; `In Refinement`, `In Progress`, `In Development`, `In UAT / Beta`, `In Review`, `Testing`, `Waiting for Test`, `Reviewed`, `Waiting for Review`, `Ready for Development`, `Test Complete`, `Handoff for customer testing`, or `In QA` = Step 3 DoD; `Done`, `Closed`, or `Resolved` = Step 4 Done; `Rejected`, `Abandoned`, `Cancelled`, or `Canceled` = Discontinued; `Blocked`, `On Hold`, or `Pending` = Blocked; all other values = Unmapped. |
| `effortCapHours` | **Derived** from `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Effort CAP (hrs))`. Blank source values remain unavailable. |
| `originalEstimateHours` | **Derived** from `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Original estimate ÷ 3,600`. Blank source values remain unavailable. |

### Active data relationships and joins

| Relationship | Exact join rule | Coverage, fallback, and dashboard use |
| --- | --- | --- |
| Tempo worklogs → Jira work items | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` | One direct key match enriches Tempo with Jira Status, Priority, Account, Product Module, Program, and Target Release. A Tempo row with no Jira match remains Tempo-only. |
| Tempo, Jira, and Weekly Capacity → Assignees master | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`, `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`, and `Weekly Capacity_20261005.csv.Assignee` are normalized and matched to `20261009_Assignees_Capacity.csv.Assignee` | Returns `20261009_Assignees_Capacity.csv.Team`, `20261009_Assignees_Capacity.csv.Skill`, and availability. A source name with no master match is unmapped. |
| General KPI cards | `20261009_Assignees_Capacity.csv.Team` limits Annual Workforce Legal Hours to Authoring, Delivery Express, Integration, Nexus, Portal, and Scoring; then `20261009_Assignees_Capacity.csv.Actual Annual Hours` (column H) is summed. `Weekly Capacity_20261005.csv.Planned Hours` (column J), `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`, and `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Effort CAP (hrs))` are summed across their complete source datasets | Feeds fixed Annual Workforce Legal Hours, Annual Workforce Capacity, Actual Hours, and Demand Capacity. Remaining = Capacity − Actual; Utilization = Actual ÷ Capacity. These values do not change with tabs or filters. |
| Master Date → Weekly Capacity | `Weekly Capacity_20261005.csv.Week Number` = `Google 2026 to 2028_Master_Date.csv.Week Number` | Feeds date-scoped capacity visuals. The Portfolio annual KPI intentionally sums the full-year Weekly Capacity source. |
| Tempo work date → Release Cycle | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` falls between `Release Cycle.csv.Start Date` and `Release Cycle.csv.End Date` | Returns `Release Cycle.csv.Release Cycle`. |
| Jira Promoter or Reporter → Business Area | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Promoter)` **OR** `.Reporter` = `Promoters.csv.Promoter` | Returns `Promoters.csv.Business Area`. The Promoter picker accepts either Jira field; blank or unmatched values are `Other/Blank`. |
| Tempo Customer Account → Jira demand | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; Client originates in `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Customer` | Supplies the shared Portfolio and Demand Management Client filter. Jira demand with no verified Tempo Customer Account is `N/A`. |
| Jira Epic → Tempo hours | Only a direct `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` = `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` match is used. | Epic Workflow has no parent/child descendant roll-up. Direct Epic hours are shown only where that direct match exists; otherwise they are not attributed. |

### Portfolio filters: exact fields

Dated October 7/9 entries below and the earlier source-file tables are retained historical lineage, not a claim that those exports supply the current build. Current CH-005A Tempo/Jira sources are the October 30 exports, workforce/weekly sources are October 28, and exact column names retain their existing meanings. Account-related current rows are qualified below; unchanged historical KPI rows do not override the controlling Portfolio KPI contract.

| Control | Exact file and field used |
| --- | --- |
| From / To | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` filters Tempo activity. The selectable bounds are governed by `Google 2026 to 2028_Master_Date.csv.Master Date`. |
| Team | `20261009_Assignees_Capacity.csv.Team`, applied through the derived `team` mapping. |
| Assignee | `20261009_Assignees_Capacity.csv.Assignee`; Tempo activity matches normalized `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`. |
| Skill | `20261009_Assignees_Capacity.csv.Skill`, applied through the assignee-to-skill mapping. |
| Client | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Customer`, validated with `.Account Key`. Jira `.Issue key` in `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv` matches Tempo `.Work Item Key`; complete verified direct worklogs for exactly one customer are required. Missing/incomplete/ambiguous evidence is `N/A`; no name or parent inference. |
| Account (Tempo) | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key` -> `tempoAccountKey`; `.Account Name` -> `tempoAccount` display; active keys directly scope approved Portfolio effort and observed Jira membership. |
| Account Category | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Category`. |
| Priority | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority`, joined by work item key for Tempo rows. |
| Status | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`, joined by work item key for Tempo rows. |
| Target Release | Jira `Custom field (Target Release)`; Tempo-native fallback/display: `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Version Name`. |
| Program | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Program)`, joined by work item key. |
| Release Cycle | **Derived** from Tempo `Work date` and `Release Cycle.csv.Start Date`, `Release Cycle.csv.End Date`. |

### Portfolio KPIs and visuals: exact measure lineage

| Visual / displayed value | Exact file and field(s) used |
| --- | --- |
| Annual Workforce Legal Hours | Sum of `20261009_Assignees_Capacity.csv.Actual Annual Hours` (column H) where `20261009_Assignees_Capacity.csv.Team` is Authoring, Delivery Express, Integration, Nexus, Portal, or Scoring. |
| Annual Workforce Capacity | Sum of `Weekly Capacity_20261005.csv.Planned Hours` (column J) across the full source. |
| Actual Hours | Sum of all `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` source rows. |
| Remaining Period Capacity | **Derived:** full-source `Weekly Capacity_20261005.csv.Planned Hours` sum minus full-source `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` sum. |
| Annual Capacity Utilization | **Derived:** full-source `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` sum ÷ full-source `Weekly Capacity_20261005.csv.Planned Hours` sum. |
| Demand Capacity | Sum of all `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Effort CAP (hrs))` source rows. |
| Hours Trend — Logged Engineering | Sum valid non-`TEMPO-*` `Logged Hours` by Master Date week or release cycle dates. |
| Hours Trend — Logged Operations | Sum valid `TEMPO-*` `Logged Hours` by Master Date week or release cycle dates. |
| Hours Trend — Available Capacity | Sum `Weekly Capacity.Planned Hours` once per selected Master Date week; Iteration uses every Master Date week touched by its release cycle dates. |
| Planned vs Unplanned — work item count | Distinct `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; classification from Jira `Labels`. |
| Planned vs Unplanned — hours | Sum of Tempo `Logged Hours` for the same classified keys. |
| Program Distribution | Sum of Tempo `Logged Hours`; program from Jira `Custom field (Program)`. |
| Bug Severity Distribution | Distinct `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` where `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue Type` = `Bug`, grouped only by `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Bug Severity)` = `Blocker`, `Critical`, or `Major`. |
| Account Distribution | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Logged Hours` by verified `.Account Customer` or `.Account Key` after active sidebar selections; `.Account Name` is display only. All footer totals share applicable Client/Account scope; Status ignored; no legacy label predicate. |
| Team Utilization — capacity | Sum of `Weekly Capacity_20261005.csv.Planned Hours` by mapped `Team` and `Week Number`; week inclusion comes from `Google 2026 to 2028_Master_Date.csv.Week Number` and `Master Date`. |
| Team Utilization — actual | Sum of Tempo `Logged Hours` by derived team. |
| Remaining Demand vs Logged Effort — demand | Sum of Jira `Remaining Estimate ÷ 3,600` by derived team. |
| Remaining Demand vs Logged Effort — actual | Sum of Tempo `Logged Hours` by derived team. |
| Backlog Priority | Count of Jira `Issue key` by `Priority`, with Jira `Created` inside the selected dates. |
| Engineering Work Mix — Bugs | Sum of Tempo `Logged Hours` where Jira `Issue Type` identifies Bug. |
| Engineering Work Mix — Technical Debt | Sum of Tempo `Logged Hours` where Jira `Custom field (Is this technical debt ?)` is affirmative. |
| Engineering Work Mix — Rest | Sum of remaining governed, non-operational Tempo `Logged Hours`. |
| Work Item Types | Count of Tempo worklog rows (`Work Item Key`) grouped by joined Jira `Issue Type`. |

### Details panel: exact columns

| Tab and column | Exact file and field(s) used |
| --- | --- |
| Accounts — Account | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Name`; Trimmed case-preserved Key identity / Name display. Jira `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Custom field (Account)` is separate issue metadata. |
| Accounts — Original Estimate Hours | `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Original estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key`; Seconds / 3,600 once per distinct observed linked issue; row estimates overlap, union deduplicated. |
| Accounts — Remaining Estimate Hours | `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key`; Seconds / 3,600 once per linked issue; non-additive across Account rows. |
| Accounts — Logged Hours | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Tempo Worklog ID`; Sum selected unique governed worklogs by Key. |
| Accounts — Variance Hours | `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Original estimate`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Tempo Worklog ID`; Logged minus Original only under complete supported row comparison; otherwise Unavailable. Union unavailable. |
| Accounts — Logged vs Estimate % | `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Original estimate`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Tempo Worklog ID`; Logged divided by Original only under supported complete comparison and nonzero denominator; otherwise Unavailable. Union unavailable. |
| Accounts — Work Items | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key`; Distinct selected actual Tempo keys per bucket; footer unions these keys. Linked Jira estimate issue sets remain separate and may overlap. |
| People — Assignee | `20261009_Assignees_Capacity.csv.Assignee`; Tempo activity display is `Full name`. |
| People — Team / Role / Skill | `20261009_Assignees_Capacity.csv.Team`, `.Role`, `.Skill`. |
| People — Capacity | `Weekly Capacity_20261005.csv.Planned Hours`. |
| People — Logged / Billable | Tempo `Logged Hours`, `Billable Hours`. |
| People — Engineering / Operations split | Tempo `Logged Hours`; **Derived** from `Work Item Key` and the operational mapping / `TEMPO-` classification. |
| Backlog — Parent Key / Child Key | Jira `Parent` and `Issue key`; Tempo `Parent Key` is used where activity metadata is required. |
| Backlog — Child Summary | Jira `Summary`; Tempo fallback is `Work Item summary`. |
| Backlog — worklog dates | Tempo `Work date`; latest date is **Derived** with `MAX(Work date)` per item. |
| Delivery Progress — Account / Team | Jira `Custom field (Account)` and derived team from Assignees master. |
| Delivery Progress — Start / Due date | Jira `Custom field (Start date)` and `Due date`. |
| Delivery Progress — Status / Priority | Jira `Status`, `Priority`. |
| Delivery Progress — Days to Due / Delivery Health | **Derived** from Jira `Due date`, `Status`, and the latest Tempo `Work date`. |

### Demand Management tab: exact fields

| Visual / control / value | Exact file and field(s) used |
| --- | --- |
| Demand filters — date range | Selectable bounds: `Google 2026 to 2028_Master_Date.csv.Master Date`. Demand period filtering: Jira `Custom field (Target Release)` with the `Due date` fallback described in `planningPeriod`. Tempo actual filtering: Tempo `Work date`. |
| Demand filters — Team | Same governed Team dimension as Portfolio: `20261009_Assignees_Capacity.csv.Team`, constrained to Teams present in `Weekly Capacity_20261005.csv.Team`. Jira and Tempo rows inherit Team by matching Jira `Assignee` or Tempo `Full name` to `20261009_Assignees_Capacity.csv.Assignee`. Searchable multi-select picker. |
| Demand filters — Assignee | Same governed Assignee dimension as Portfolio: `20261009_Assignees_Capacity.csv.Assignee`. It filters Jira `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`, Tempo `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`, and `Weekly Capacity_20261005.csv.Assignee`. Searchable multi-select picker. |
| Demand filters — Skill | Same governed Skill dimension as Portfolio: `20261009_Assignees_Capacity.csv.Skill`, constrained to Skills present in `Weekly Capacity_20261005.csv.Skill`. Jira, Tempo, and capacity rows inherit Skill through their matching Assignee. Searchable multi-select picker. |
| Demand filters — Client | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Customer`, joined to Jira demand through `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`. Demand with no verified Tempo Customer Account is `N/A`. Searchable multi-select picker. |
| Demand filters — Business Area | `Promoters.csv.Promoter` is matched to `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Promoter)`; the displayed value is `Promoters.csv.Business Area`. Blank or unmatched promoter is `Other/Blank`. Searchable multi-select picker. |
| Demand filters — Promoter | `Promoters.csv.Promoter`, matched with an OR relationship to `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Promoter)` **or** `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Reporter`. Values are limited to the selected Business Area(s). The same Jira-key join carries both fields to `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` rows. Blank or unmatched promoter is `Other/Blank`. The UI tooltip exposes this OR behavior. Searchable multi-select picker. |
| Demand filters — Account | Jira `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`. Searchable multi-select picker. |
| Demand filters — Product Module | Jira `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Product Module)`. Searchable multi-select picker. |
| Demand filters — Target / Planning Release | Jira `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)` is the searchable multi-select picker source. `Due date` and `Release Cycle.csv.Start Date` / `End Date` provide the documented planning-period fallback for unselected release allocation. |
| Known Outstanding Demand KPI | Sum of Jira `Remaining Estimate ÷ 3,600`; records with a blank `Remaining Estimate` are excluded from the hour sum and retained as an exception. |
| Delivered Features (%) KPI | **Derived:** `DONE feature count ÷ in-delivery feature count × 100`. Feature count includes Jira `Issue Type` = `Epic`, `Epic Basic`, `Epic Release`, or `Epic Lab`. DONE feature count uses Jira `Status` = `DONE`. In-delivery feature count uses Jira `Status` = `On Hold`, `To Do`, `In Progress`, `PMC`, `In Development`, `Testing`, `Ready for Development`, `Prepare Development`, `In Review`, `Handoff for customer testing`, `In QA`, or `OAT - Ready for PI`. This KPI is a full-source count and does not change with Demand filters. |
| Delivered Features difference KPI | **Derived:** `DONE feature count − in-delivery feature count`, using the same Issue Type and Status sets as Delivered Features (%). This KPI is a full-source count and does not change with Demand filters. |
| Actual Effort KPI | Sum of Tempo `Logged Hours`, limited by `Work date`. |
| Remaining Period Capacity KPI | **Derived:** sum of `Weekly Capacity_20261005.csv.Planned Hours` minus Tempo `Logged Hours`, aligned through `Week Number`, `Master Date`, and release dates. |
| Data Quality Exceptions KPI | Count of Jira `Issue key` where `Remaining Estimate` is blank. |
| Team × Release / Planning Period pivot | Value: Jira `Remaining Estimate ÷ 3,600`; rows/columns: derived `team` and derived `planningPeriod`. |
| Capacity versus Known Assigned Demand — Capacity | Weekly Capacity `Planned Hours`, once per canonical Assignee and Master Date week in the embedded horizon. Missing records remain unavailable. |
| Capacity versus Known Assigned Demand — Demand | Eligible open Jira `Remaining Estimate ÷ 3,600`, resolved by the panel's approved child-precedence rule and workforce mapping; no Tempo inclusion requirement. |
| Capacity versus Known Assigned Demand — Gap / Load | Capacity minus assigned demand; assigned demand divided by capacity × 100. Portfolio ratios use aggregate totals. |
| Workflow Position — ticket count | Count of Jira `Issue key` by derived `reportingStage` from Jira `Status`. |
| Workflow Position — hours | Sum of Jira `Remaining Estimate ÷ 3,600` by derived `reportingStage`. |
| Workflow Position — inline ticket details | Jira `Issue key`, `Summary`, `Assignee`→Team, `Custom field (Target Release)`/due-date planning fallback, and `Remaining Estimate`. |
| Actual Effort vs Future Demand by Account — Actual | Tempo `Logged Hours` grouped by Jira `Custom field (Account)` joined on `Work Item Key = Issue key`; `Account Name` is the Tempo fallback. |
| Actual Effort vs Future Demand by Account — Future | Jira `Remaining Estimate ÷ 3,600` grouped by `Custom field (Account)`. These two values are shown separately and are not added together. |
| Demand Data Quality — Missing Remaining Estimate | Jira `Remaining Estimate` is blank. |
| Demand Data Quality — Unassigned Team | Jira `Assignee` does not map to `20261009_Assignees_Capacity.csv.Assignee` and therefore has no `Team`. |
| Demand Data Quality — Unscheduled | Jira `Custom field (Target Release)` is blank and `Due date` cannot be placed inside any `Release Cycle.csv.Start Date` / `End Date` window. |
| Demand Data Quality — inline ticket details | Jira `Issue key`, `Summary`, `Assignee`→Team, planning period, and `Remaining Estimate`. |
| Release Predictability KPI | No source fields are currently used. The KPI displays the hardcoded empty value `—` and `TODO` until feature hierarchy, baseline commitment, and delivery-in-expected-release rules are governed. |
| Release KPI | No source fields are currently used. The KPI displays the hardcoded empty value `—` and `TODO` until its governed calculation is defined. |

---

## Strict `file.column` ledger for every displayed value

This is the authoritative, literal reference list. Every source reference below uses the required `exact-file-name.csv.exact-column-name` form. It supersedes any abbreviated source name or wildcard used in the earlier narrative sections of this document.

### Portfolio filters and KPI cards

This ledger retains dated historical mappings. Current annual-card formulas and applicability are controlled by Portfolio KPI cards above; these rows do not restore obsolete fixed-source Actual Hours or redefine annual formulas. Current CH-005A rows distinguish verified Client, Portfolio Key and export-only legacy labels; Jira Account remains metadata.

| Dashboard item | Exact `file.column` input | Derived calculation / use |
| --- | --- | --- |
| From / To selectable dates | `Google 2026 to 2028_Master_Date.csv.Master Date` | Sets the minimum and maximum selectable dates. |
| From / To applied to Tempo work | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` | Includes a Tempo row when Work date is in the selected range. |
| Team filter | `20261009_Assignees_Capacity.csv.Team`; `20261009_Assignees_Capacity.csv.Assignee`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` | Full name is normalized and matched to Assignee, then Team is used. |
| Assignee filter | `20261009_Assignees_Capacity.csv.Assignee`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` | Normalized equality match. |
| Skill filter | `20261009_Assignees_Capacity.csv.Skill`; `20261009_Assignees_Capacity.csv.Assignee`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` | Skill is obtained through the assignee match. |
| Legacy v1 export-only label — Tempo label | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Name` | Preserved dated native-Tempo label lineage; compatibility dimension, not Tempo Account Key. |
| Legacy v1 export-only label — Jira-governed account | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`; `.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Preserved dated Jira enrichment lineage; frozen v1 predicate only; no modern Portfolio predicate. |
| Client filter — verified Tempo Customer | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Customer`; `.Account Key`; `.Work Item Key`; `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Issue key` | `tempoCustomerAccount`, `clientAttributionStatus`; complete direct issue evidence for Jira grain, no parent/name inference. |
| Account filter — Tempo identity | RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key; .Account Name | Trimmed case-preserved Key; Name display; direct effort and full-snapshot observed issue membership in approved Portfolio consumers, not capacity allocation. |
| Account Category filter | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Category` | Direct filter. |
| Priority filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Jira Priority joins to Tempo by key. |
| Status filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Jira Status joins to Tempo by key. |
| Target Release filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Version Name` | Jira field is governed value; Version Name is Tempo-native fallback/display. |
| Program filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Program)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Jira Program joins to Tempo by key. |
| Release Cycle filter | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date`; `Release Cycle.csv.Start Date`; `Release Cycle.csv.End Date`; `Release Cycle.csv.Release Cycle` | Work date is placed inside Start Date–End Date and returns Release Cycle. |
| Annual Workforce Capacity | `Weekly Capacity_20261005.csv.Planned Hours` (column J); `Weekly Capacity_20261005.csv.Team`; `Weekly Capacity_20261005.csv.Assignee`; `Weekly Capacity_20261005.csv.Skill` | Sum after Team, Assignee, and Skill scope. |
| Actual Hours | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Sum after governed exclusion and active scope. |
| Annual Capacity Remaining | `Weekly Capacity_20261005.csv.Planned Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Sum(Planned Hours) − Sum(Logged Hours). |
| Annual Capacity Utilization | `Weekly Capacity_20261005.csv.Planned Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Sum(Logged Hours) ÷ Sum(Planned Hours). |
| Work item count note | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Distinct count. |

### Portfolio charts

| Chart and value | Exact `file.column` input | Derived calculation / use |
| --- | --- | --- |
| Hours Trend — Logged Engineering | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_22_Oct_26.csv.Logged Hours`, `.Work date`, `.Work Item Key` | Valid non-`TEMPO-*` Tempo effort, grouped by Master Date week or release cycle dates. |
| Hours Trend — Logged Operations | Same Tempo fields | Valid `TEMPO-*` effort after global exclusions, grouped by Master Date week or release cycle dates. |
| Hours Trend — Available Capacity | `Weekly Capacity_20261028.csv.Planned Hours`, `.Week Number`; `Google 2026 to 2028_Master_Date.csv.Master Date`, `.Week Number`; `Release Cycle.csv.Start Date`, `.End Date` | Weekly: full capacity for each selected Master Date week. Iteration: full capacity once for every Master Date week touched by the release cycle dates. |
| Planned vs Unplanned — key count | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Labels`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` | Distinct Work Item Key; Labels determine PLANNED, UNPLANNED, Operations, or Unclassified. |
| Planned vs Unplanned — hours | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Labels` | Sum Logged Hours within the label-derived class. |
| Program Distribution — slice | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Program)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Sum Logged Hours by joined Program. |
| Bug Severity Distribution — bar | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue Type`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Bug Severity)` | Distinct Issue key where Issue Type = `Bug`, grouped only by Bug Severity = `Blocker`, `Critical`, or `Major`. |
| Account Distribution — tile label | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Customer`, `.Account Name`, `.Account Key` | Verified Client by default; Account display name and authoritative key on active Client/Account selection. Missing attribution `-`. |
| Account Distribution — tile size | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Logged Hours`; `.Work Item Key`; `.Work date` | Sum governed nonoperational logged hours after applicable sidebar Client/Account intersection; Status ignored; no legacy label predicate; only positive aggregate buckets render (G6). |
| Account Distribution — footer values | Same Tempo fields; existing `peopleTotalsRow(groupPeople(W, []))` | Total Logged and Operational Tempo from common filtered W; customer effort from visible nonoperational buckets. No exception-only or split local/global footer. |
| Team Utilization — planned | `Weekly Capacity_20261005.csv.Planned Hours`; `Weekly Capacity_20261005.csv.Assignee`; `20261009_Assignees_Capacity.csv.Assignee`; `20261009_Assignees_Capacity.csv.Team`; `Weekly Capacity_20261005.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Master Date` | Planned Hours sums by mapped Team for Master Date weeks in range. |
| Team Utilization — logged | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`; `20261009_Assignees_Capacity.csv.Assignee`; `20261009_Assignees_Capacity.csv.Team` | Sum Logged Hours by mapped Team. |
| Team Utilization — utilization | `Weekly Capacity_20261005.csv.Planned Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Sum Logged Hours ÷ Sum Planned Hours. |
| Remaining Demand vs Logged Effort — demand | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `20261009_Assignees_Capacity.csv.Assignee`; `20261009_Assignees_Capacity.csv.Team` | Remaining Estimate ÷ 3,600, summed by mapped Team. |
| Remaining Demand vs Logged Effort — actual | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`; `20261009_Assignees_Capacity.csv.Assignee`; `20261009_Assignees_Capacity.csv.Team` | Sum Logged Hours by mapped Team. |
| Backlog Priority — category | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority` | Grouping label. |
| Backlog Priority — count | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Created` | Count Issue key after Created date filter. |
| Engineering Work Mix — Bug | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue Type`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Sum Logged Hours where joined Issue Type is Bug. |
| Engineering Work Mix — Technical Debt | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Is this technical debt ?)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Sum Logged Hours where technical-debt field is affirmative. |
| Engineering Work Mix — Rest / Operations | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Work Item Key determines `TEMPO-*` Operations; remaining governed keys are Rest. |
| Work Item Types — category | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue Type`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Issue Type joins by key. |
| Work Item Types — count | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Count Tempo worklog rows. |

### Details tables

| Table column / value | Exact `file.column` input | Derived calculation / use |
| --- | --- | --- |
| Accounts — Account | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Name` | Trimmed case-preserved Key identity / Name display. Jira `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Custom field (Account)` is separate issue metadata. |
| Accounts — Original Estimate Hours | `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Original estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key` | Seconds / 3,600 once per distinct observed linked issue; row estimates overlap, union deduplicated. |
| Accounts — Remaining Estimate Hours | `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key` | Seconds / 3,600 once per linked issue; non-additive across Account rows. |
| Accounts — Logged Hours | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Tempo Worklog ID` | Sum selected unique governed worklogs by Key. |
| Accounts — Variance Hours | `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Original estimate`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Tempo Worklog ID` | Logged minus Original only under complete supported row comparison; otherwise Unavailable. Union unavailable. |
| Accounts — Logged vs Estimate % | `All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Original estimate`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Tempo Worklog ID` | Logged divided by Original only under supported complete comparison and nonzero denominator; otherwise Unavailable. Union unavailable. |
| Accounts — Work Items | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key` | Distinct selected actual Tempo keys per bucket; footer unions these keys. Linked Jira estimate issue sets remain separate and may overlap. |
| People — Assignee | `20261009_Assignees_Capacity.csv.Assignee`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` | Master assignee label with Tempo activity match. |
| People — Team | `20261009_Assignees_Capacity.csv.Team` | Direct master field. |
| People — Capacity | `Weekly Capacity_20261005.csv.Planned Hours`; `Weekly Capacity_20261005.csv.Assignee`; `20261009_Assignees_Capacity.csv.Assignee` | Sum Planned Hours matched by Assignee. |
| People — Logged Total / Engineering / Operations | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Total is sum Logged Hours; Work Item Key classifies Operations (`TEMPO-*`) versus Engineering. |
| People — Billable | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Billable Hours` | Sum by person. |
| People — Utilization / Work Items | `Weekly Capacity_20261005.csv.Planned Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Utilization = Logged Hours ÷ Planned Hours; Work Items = distinct Work Item Key. |
| Backlog — Parent Key / Parent Summary | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Parent`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Parent summary` | Direct Jira metadata; Tempo `Parent Key` is fallback for activity rows. |
| Backlog — Child Key / Child Summary | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Summary`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item summary` | Jira fields are primary; Tempo fields are fallback. |
| Backlog — Work Item Type / Module / Status / Priority | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue Type`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Product Module)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority` | Joined to active Tempo key. |
| Backlog — Start / Due / Last Worklog Date | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Start date)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Due date`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` | Last Worklog Date = maximum Work date per active item. |
| Delivery Progress — Account / Team | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`; `20261009_Assignees_Capacity.csv.Team`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee` | Team comes from Assignee-to-Team match. |
| Delivery Progress — Parent / Child / Summary | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Parent`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Parent summary`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Summary` | Direct Jira fields. |
| Delivery Progress — Status / Priority / Start / Due | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Start date)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Due date` | Direct Jira fields. |
| Delivery Progress — Last Worklog Date / Days to Due / Delivery Health | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Due date`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status` | Last Worklog Date = maximum Work date; Days to Due and Health are derived. |

### Demand Management tab

| Dashboard value / control | Exact `file.column` input | Derived calculation / use |
| --- | --- | --- |
| Demand date selector | `Google 2026 to 2028_Master_Date.csv.Master Date` | Sets selectable bounds. |
| Demand Team filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `20261009_Assignees_Capacity.csv.Assignee`; `20261009_Assignees_Capacity.csv.Team` | Jira Assignee maps to master Team. |
| Demand Assignee filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`; `Weekly Capacity_20261005.csv.Assignee` | Multi-select picker. Selected Jira Assignee, Tempo Full name, and capacity Assignee values are retained. |
| Demand Client filter | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Customer`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` | Client comes from Tempo. Work Item Key = Issue key carries the Tempo Customer Account to the corresponding Jira demand row. No verified Client = `N/A`. |
| Demand Business Area filter | `Promoters.csv.Promoter`; `Promoters.csv.Business Area`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Promoter)` | Custom field (Promoter) matches Promoters.csv.Promoter; Business Area is returned. Blank or unmatched promoter = `Other/Blank`. |
| Demand Account filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)` | Direct field. |
| Demand Product Module filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Product Module)` | Direct field. |
| Demand Target / Planning Release filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)` | Multi-select picker source. The selected values filter only this Jira field. |
| Delivered Features (%) KPI | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue Type`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` | Count Issue Type = Epic, Epic Basic, Epic Release, or Epic Lab and Status = DONE ÷ count of the same Issue Types with Status = On Hold, TO DO, In Progress, PMC, In Development, Testing, Ready for Development, Prepare Development, In Review, Handoff for customer testing, In QA, or OAT - Ready for PI; then × 100. Full-source count; unaffected by Demand filters. |
| Delivered Features difference KPI | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue Type`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` | Count Issue Type = Epic, Epic Basic, Epic Release, or Epic Lab and Status = DONE − count of the same Issue Types with Status = On Hold, TO DO, In Progress, PMC, In Development, Testing, Ready for Development, Prepare Development, In Review, Handoff for customer testing, In QA, or OAT - Ready for PI. Full-source count; unaffected by Demand filters. |
| Known Outstanding Demand | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate` | Sum(Remaining Estimate ÷ 3,600); blank values remain exceptions. |
| Actual Effort | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` | Sum Logged Hours inside selected dates. |
| Remaining Period Capacity | `Weekly Capacity_20261005.csv.Planned Hours`; `Weekly Capacity_20261005.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Master Date`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Sum Planned Hours for selected Master Date weeks − Actual Effort. |
| Data Quality Exceptions | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate` | Count Issue key with blank Remaining Estimate. |
| Team × Release pivot — row/column values | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `20261009_Assignees_Capacity.csv.Assignee`; `20261009_Assignees_Capacity.csv.Team`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Due date`; `Release Cycle.csv.Start Date`; `Release Cycle.csv.End Date`; `Release Cycle.csv.Release Cycle` | Row/column axes are derived Team and Planning Period. |
| Team × Release pivot — cell | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate` | Sum(Remaining Estimate ÷ 3,600). |
| Capacity versus Known Assigned Demand — workforce / capacity | Weekly Capacity `Planned Hours`, `Assignee`, `Week Number`; Assignees `Assignee`, `Team`, `Skill`; Master Date `Master Date`, `Week Number` | See the scoped panel contract below. Annual source week numbers are never reused for future years. |
| Capacity versus Known Assigned Demand — demand / horizon | Jira `Issue key`, parent-key fields, `Remaining Estimate`, `Assignee`, `Status`, `Status Category`, `Custom field (Target Release)`, `Due date`; Release Cycle `Release Cycle`, `Start Date`, `End Date`; payload reporting date | Resolve hierarchy before filters, then allocate to a future Target Release or future Due Date exactly once. No logged-effort subtraction or inferred ownership. |
| Epic Workflow — eligible population | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue Type` | One distinct Jira key where Issue Type is `Epic`, `Epic Lab`, or `Epic Release`. |
| Epic Workflow — filtering | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `20261009_Assignees_Capacity.csv.Assignee`; `20261009_Assignees_Capacity.csv.Team`; `20261009_Assignees_Capacity.csv.Skill`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Due date`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Product Module)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Promoter)`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Customer`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `Promoters.csv.Promoter`; `Promoters.csv.Business Area`; `Release Cycle.csv.Start Date`; `Release Cycle.csv.End Date`; `Release Cycle.csv.Release Cycle` | Applies every Demand global filter: date/release, Team, Assignee, Skill, Client, Business Area, Promoter, Account, Product Module, and Target / Planning Release. |
| Epic Workflow — stage, count, and direct effort | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Demand = Backlog/OAT - Idea/OAT-IDEA/Placeholder; DoR = To Do/Analysis & Prepare Development/OAT - Ready for PI; DoD = In Refinement/In Progress/In Development/In UAT / Beta/In Review/Testing/Waiting for Test/Reviewed/Waiting for Review/Ready for Development/Test Complete/Handoff for customer testing/In QA; Done = Done/Closed/Resolved; Discontinued = Rejected/Abandoned/Cancelled/Canceled; Blocked = Blocked/On Hold/Pending; all remaining statuses = Unmapped. Cards show the resulting distinct Epic-record count. Each workflow step and Other Disposition Logged Hours = Sum Tempo Logged Hours where Jira Issue key = Tempo Work Item Key for that category's status keys only; no descendant roll-up. |
| Epic Workflow — detail | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Summary`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Effort CAP (hrs))`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Original estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Every workflow-step and Other Disposition detail displays direct Tempo Logged Hours and its variance to Effort Cap where the direct key match exists. |
| Actual Effort vs Future Demand by Account — Actual | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Name` | Sum Logged Hours by joined Jira account; Account Name is fallback. |
| Actual Effort vs Future Demand by Account — Future | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)` | Sum(Remaining Estimate ÷ 3,600) by Account. |
| Demand Data Quality — Missing Remaining Estimate | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` | Blank Remaining Estimate is an exception. |
| Demand Data Quality — Unassigned Team | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `20261009_Assignees_Capacity.csv.Assignee`; `20261009_Assignees_Capacity.csv.Team` | Exception when Assignee has no Team match. |
| Demand Data Quality — Unscheduled | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Due date`; `Release Cycle.csv.Start Date`; `Release Cycle.csv.End Date` | Exception when neither Target Release nor date-window fallback yields a Planning Period. |
| Demand Data Quality — inline detail | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Summary`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)` | Displays exception tickets and their source values. |
| Release Predictability KPI | `N/A` | Hardcoded empty value `—`; `TODO`; no source field is used. |
| Release KPI | `N/A` | Hardcoded empty value `—`; `TODO`; no source field is used. |

## Capacity versus Known Assigned Demand

Panel: `#capacityCoveragePanel`. Replaces only the former capacity pivot. The Team × Release matrix, Epic Workflow, Demand account comparison, quality panel and Demand source KPIs keep their existing rules. Portfolio and its v2 exports follow the separate CH-005A Account contract; this Demand panel remains independent.

Inputs are isolated in `BI_DATA.capacityCoverage`: source-preserving capacity values, all canonical Assignees mappings (including contributing teams), Jira rows with numeric/missing Remaining Estimate preserved, the existing governed reporting date, and the capacity snapshot year. `web/capacity-coverage.js` centralizes resolution, horizon selection, and arithmetic; `web/demand.js` supplies existing Demand filter predicates and rendering.

- Header: title and user-story subtitle; Release / Through year-end dropdown; chronological, dynamically populated current/future releases; resolved inclusive date range and reporting date. Year-end uses the reporting year. A historical release has no future window.
- KPIs: available capacity, known assigned demand, capacity gap, portfolio load. Capacity and demand reconcile to team rows. Missing capacity makes affected team and portfolio capacity/gap/load unavailable; show a labelled known subtotal. A confirmed zero remains `0.0 h`; zero denominator load is `-`.
- Rows: Authoring, Delivery Express, Integration, Nexus, Portal and Scoring, subject to Team filters. Empty selected workforce means confirmed zero capacity in that scope; an expected but absent assignee-week record means unavailable capacity. Known gaps sort ascending, alphabetical ties, then unavailable gaps. Grey capacity and blue demand share one scale; blue is capped at capacity and excess is red. Missing capacity has a textual unavailable state, without a bar.
- Demand resolution: remove globally excluded exact keys first; deduplicate identical Jira identities and expose conflicts/cycles. Eligible open child estimates take precedence; use the parent's own estimate only when no eligible descendant has a valid estimate. Confirmed zero is valid; missing/invalid/negative estimates are not. Terminal subtasks permit parent fallback, while paused/blocked subtasks remain eligible. Resolve eligibility and hierarchy before presentation filters; never inherit or distribute estimates, dates or teams. Parent/child estimation overlaps appear in a separate, non-additive governance-review section with source estimates and linked parent/child Jira keys. They do not increase assigned demand or unallocated hours.
- Planning: valid current/future Target Release takes precedence, using its Code Freeze date as the allocation anchor; otherwise a future Due Date is used. Missing/invalid planning dates remain unscheduled. Selected release fallback membership uses actual governed boundaries; year-end includes anchors within that calendar horizon. Full Master Date weeks touched by the horizon are counted once without proration. Capacity from a snapshot year cannot establish availability in another year.
- Filters: reuse Team/Assignee/Skill on both sides; Client/Account/Business Area/Promoter/Product module/Target Release affect demand only. Sidebar Date Range is explicitly inapplicable here; other panels keep using it. Portfolio has separate controls/state; its extra filters do not silently become Demand filters. The [filter applicability matrix](../audit/CAPACITY_ASSIGNED_DEMAND_VALIDATION.md#filter-applicability-matrix) records every actual control and absent requested control.
- Unallocated: show only eligible, scheduled, estimated demand with missing/unmapped workforce team; exclude it from assigned KPIs. Its scope ignores Team but retains Assignee/Skill and demand-specific filters. Separate primary exception groups cover missing/unmapped team, outside Engineering, undated/unscheduled, invalid/missing estimates and hierarchy/allocation exceptions. Primary categories are exclusive; independent team/planning/estimate flags and Jira keys remain inspectable. Never label known non-Engineering demand as missing-team demand.
- Traceability: expandable assigned-demand and exception lists expose every matching Jira key, canonical team, status, planning state, estimate and parent context. Lists are not truncated; bounded vertical scrolling keeps the panel readable.
- Client: existing verified Tempo Customer Account metadata is reused independently of demand inclusion. No independent account metadata feed is available; unlogged Jira demand remains eligible with Client `N/A`. No Jira Client or inferred Account relationship is introduced.
- Interpretation: “Positive headroom means capacity exceeds known assigned estimates. It does not establish that teams can absorb unallocated, undated, or unestimated work.” The UI also states that workforce capacity is not customer-dedicated capacity.

The [scoped calculation authorization](../governance/Calculation_Governance_CH005A_v1.md#capacity-versus-known-assigned-demand--scoped-authorization-2026-10-22) records differences from the parked forecast contract. Source coverage, reconciliation, screenshots, and regression limitations are in the [validation audit](../audit/CAPACITY_ASSIGNED_DEMAND_VALIDATION.md).


## CH-005A current Account source lineage

| Field | Current selected source / use |
| --- | --- |
| Key / Name / Category / Customer | RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv.Account Key / Account Name / Account Category / Account Customer; direct effort and verified Client, with name display only. |
| Provenance / issue link | Same Tempo file Tempo Worklog ID / Work Item Key; direct normalized match to All Jira Work Items marked PI Backlog (JIRA)_20261030.csv.Issue key. Index is full governed eligible valid-date snapshot before interactive filters. |
| Jira metadata / estimates | Same Jira file Custom field (Account) / Original estimate / Remaining Estimate; no ownership crosswalk or allocation. |
| Workforce / capacity | 20261028_Assignees_Capacity.csv and Weekly Capacity_20261028.csv; unchanged canonical workforce and denominator rules. |
| Reporting calendar | Google 2026 to 2028_Master_Date.csv; exclusive authority, with existing builder fallback recorded as an exception. |

Older dated source ledger rows above retain field meanings and prior evidence; they do not identify the current input files or restore retired label predicates.

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
