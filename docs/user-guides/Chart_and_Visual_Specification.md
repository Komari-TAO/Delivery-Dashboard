# Chart and Visual Specification

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

### Sidebar filters (when non-empty, they restrict rows)

| Filter | Tempo worklogs | Jira PI backlog | Bug Triage queue | Weekly capacity |
| --- | --- | --- | --- | --- |
| Team | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` is normalized and matched to `20260307_Assignees_Capacity.csv.Assignee`; the filter value is `20260307_Assignees_Capacity.csv.Team`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee` is normalized and matched to `20260307_Assignees_Capacity.csv.Assignee`; the filter value is `20260307_Assignees_Capacity.csv.Team`. | `Bug Triage_ignored.csv.Assignee` is normalized and matched to `20260307_Assignees_Capacity.csv.Assignee`; the filter value is `20260307_Assignees_Capacity.csv.Team`. | `Weekly Capacity_20261005.csv.Assignee` is matched to `20260307_Assignees_Capacity.csv.Assignee`; the filter value is `20260307_Assignees_Capacity.csv.Team`. |
| Assignee | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`, normalized against `20260307_Assignees_Capacity.csv.Assignee`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`, normalized against `20260307_Assignees_Capacity.csv.Assignee`. | `Bug Triage_ignored.csv.Assignee`, normalized against `20260307_Assignees_Capacity.csv.Assignee`. | `Weekly Capacity_20261005.csv.Assignee`, normalized against `20260307_Assignees_Capacity.csv.Assignee`. |
| Skill | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` → `20260307_Assignees_Capacity.csv.Assignee` → `20260307_Assignees_Capacity.csv.Skill`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee` → `20260307_Assignees_Capacity.csv.Assignee` → `20260307_Assignees_Capacity.csv.Skill`. | `Bug Triage_ignored.csv.Assignee` → `20260307_Assignees_Capacity.csv.Assignee` → `20260307_Assignees_Capacity.csv.Skill`. | `Weekly Capacity_20261005.csv.Assignee` → `20260307_Assignees_Capacity.csv.Assignee` → `20260307_Assignees_Capacity.csv.Skill`. |
| Account | Native Tempo account facet: `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Name`. Governed account enrichment: `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`, returning `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`. | Not applied; `Bug Triage_ignored.csv` has no Account column. | Not applied; `Weekly Capacity_20261005.csv` has no Account column. |
| Account Category | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Category`. | Not applied; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv` has no Account Category column. | Not applied; `Bug Triage_ignored.csv` has no Account Category column. | Not applied; `Weekly Capacity_20261005.csv` has no Account Category column. |
| Priority | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`, returning `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority`. | Not applied; `Bug Triage_ignored.csv` has no Priority column. | Not applied; `Weekly Capacity_20261005.csv` has no Priority column. |
| Status | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`, returning `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`. | `Bug Triage_ignored.csv.Status`; it is applied only when the Status filter is active. | Not applied; `Weekly Capacity_20261005.csv` has no Status column. |
| Target Release | Native Tempo fallback: `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Version Name`. Governed value: `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`, returning `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`. | Not applied; `Bug Triage_ignored.csv` has no Target Release column. | Not applied; `Weekly Capacity_20261005.csv` has no Target Release column. |
| Program | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`, returning `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Program)`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Program)`. | Not applied; `Bug Triage_ignored.csv` has no Program column. | Not applied; `Weekly Capacity_20261005.csv` has no Program column. |
| Release Cycle | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` is placed between `Release Cycle.csv.Start Date` and `Release Cycle.csv.End Date`; the filter value is `Release Cycle.csv.Release Cycle`. | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Fix versions` is the Jira release value used by the backlog path. | Not applied; `Bug Triage_ignored.csv` has no release-cycle column. | `Weekly Capacity_20261005.csv.Week Number` is matched to `Google 2026 to 2028_Master_Date.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Master Date` is placed between `Release Cycle.csv.Start Date` and `Release Cycle.csv.End Date`, returning `Release Cycle.csv.Release Cycle`. |

**Status default:** On load, a governed default status set is applied (open / in-progress style statuses from the Jira export). Clearing or changing status affects both backlog rows and Tempo rows joined to Jira status.

---

## KPI cards (`#kpiGrid`)

### Business explanation

Executive snapshot of **annual workforce capacity** versus **governed Tempo logged hours** in the selected date range. Answers: “How much capacity do we have for the year, how much have we logged in this period, what is left, and what utilization does that imply?”

### Metrics

| KPI | Calculation | Primary fields |
| --- | --- | --- |
| Annual Workforce Capacity | Sum of assignee annual hours for scope | `*Assignees*Capacit*.csv.Actual Annual Hours`, `*Assignees*Capacit*.csv.Team`, `*Assignees*Capacit*.csv.Assignee`, `*Assignees*Capacit*.csv.Skill` |
| Actual Hours | Sum of governed managed-team logged hours | `RAW_DATA_FULL_ANALYSIS_*.csv.Logged Hours` (via enriched worklogs, exclusions applied) |
| Annual Capacity Remaining | Annual capacity minus Actual Hours | `20260307_Assignees_Capacity.csv.Actual Annual Hours`, `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` |
| Annual Capacity Utilization | Actual Hours ÷ Annual Workforce Capacity | `20260307_Assignees_Capacity.csv.Actual Annual Hours`, `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` |
| Work item count (note) | Distinct work item keys in governed logged scope | `RAW_DATA_FULL_ANALYSIS_*.csv.Work Item Key` |

### Filters

Date range; Team; Assignee; Skill; plus worklog-only filters (Account, Category, Priority, Status, Target Release, Program, Release Cycle) which also narrow which assignees/teams count toward capacity when any worklog-only filter is active.

### Rules

Uses **governed logged worklogs** (`backlogWorklogs` enrichment path): assignee/team from assignees master; excludes global TEMPO keys; excludes rows whose team is not in the managed team set.

---

## Hours Trend (`#trendChart`)

### Business explanation

Shows how **logged** and **billable** effort evolve over time for the filtered portfolio. Used to spot seasonality, delivery spikes, and billable vs non-billable drift.

### Chart type

Line chart (two series).

### Fields

| Series | Aggregation | Fields |
| --- | --- | --- |
| Logged | Sum by month or ISO week | `RAW_DATA_FULL_ANALYSIS_*.csv.Logged Hours`, `RAW_DATA_FULL_ANALYSIS_*.csv.Work date` → payload `month` or `week` (`*Master*Date*.csv.Week Number` for weeks) |
| Billable | Sum by month or week | `RAW_DATA_FULL_ANALYSIS_*.csv.Billable Hours`, same date grain |

### Filters

Team, Assignee, Skill, Account, Account Category, Priority, Target Release, Program, and Release Cycle filters apply to governed logged worklogs. The Status filter does not apply to this chart. Grain: user selects Monthly or Weekly (`#trendGrain`).

### Rules

Managed-team governed worklogs only; global exclusions applied.

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

Snapshot of the **operational Bug Triage queue** by severity (Blocker → Enhancement). This is **inventory of open triage bugs**, not Tempo effort.

### Chart type

Horizontal bar chart.

### Fields

| Concept | Fields |
| --- | --- |
| Bug rows | `Bug Triage_*.csv` where `Bug Triage_*.csv.Issue Type` = Bug |
| Severity | `Bug Triage_*.csv.Bug Severity` |
| Distinct keys | `Bug Triage_*.csv.Key` (deduplicated) |

### Filters

Team; Assignee; Skill; Status (when status filter differs from default). **Date range does not apply** (queue is current export, not time-series).

### Rules

Severity order: Blocker, Critical, Major, Medium, Low, Enhancement; empty severity excluded from distribution bars.

---

## Account Distribution (`#accountTreemap`)

### Business explanation

**Treemap of Tempo logged hours by customer account** for the selected period. Tile size = logged hours; supports click-to-filter accounts. Shows how delivery effort is spread across accounts.

### Chart type

Treemap (SVG).

### Fields

| Concept | Fields |
| --- | --- |
| Account on Tempo row | `RAW_DATA_FULL_ANALYSIS_*.csv.Account Name` (display) |
| Jira account enrichment | `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Custom field (Account)` via work item key |
| Logged / billable | `RAW_DATA_FULL_ANALYSIS_*.csv.Logged Hours`, `RAW_DATA_FULL_ANALYSIS_*.csv.Billable Hours` |
| Original estimate (tooltip context from backlog) | `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Original estimate` |

### Filters

Tempo rows: date range and sidebar filters with **Status ignored** on the Tempo stream used for treemap sizing. Backlog overlay for estimates uses **status-filtered** PI backlog.

### Rules

- Includes managed-team rows with non-empty account label; excludes governed global TEMPO keys and excluded operational items in aggregation helpers.
- Tiles require **logged > 0** in period.

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
| Metric | Count of worklog rows | `RAW_DATA_FULL_ANALYSIS_*.csv.Work Item Key` |

### Filters

**Filtered Tempo worklogs** (`raw.worklogs` path) including **Status** when status filter is active; date range and sidebar filters.

### Rules

Rows with empty issue type excluded.

---

## Details panel (tables)

### Accounts tab

**Business:** Account-level logged vs estimated hours and variance for delivery reporting.

**Fields:** `All Jira Work Items marked PI Backlog (JIRA)_*.csv.Custom field (Account)`, `Original estimate`, Tempo `Logged Hours` via enriched worklogs.

**Filters:** Backlog columns use `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`. Logged columns use `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` and do not apply the Jira Status filter.

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

### Bug Triage tab

**Business:** Full operational bug queue listing from latest triage export.

**Fields:** `Bug Triage_*.csv.Key`, `Summary`, `Bug Severity`, `Status`, `Updated`, `Assignee`.

**Filters:** Team, Assignee, Skill, and Status. Team and Skill are resolved through `Bug Triage_ignored.csv.Assignee` matched to `20260307_Assignees_Capacity.csv.Assignee`; Status uses `Bug Triage_ignored.csv.Status`.

---

## Source file patterns (builder)

| Pattern | Role |
| --- | --- |
| `RAW_DATA_FULL_ANALYSIS_*.csv` | Tempo worklogs |
| `All Jira Work Items marked PI Backlog (JIRA)_*.csv` | PI backlog / Jira enrichment |
| `Bug Triage_*` | Bug triage queue |
| `Weekly Capacity_*.csv` | Planned hours by week |
| `*Assignees*Capacit*.csv` | Team, skill, role, annual hours |
| `*Master*Date*.csv` | Calendar week mapping |
| `Release Cycle*.csv` | Release cycle windows |
| `data/mappings/tempo_operational_mapping.csv` | Tempo operational summaries and keys |

## Build provenance

Each data build writes `web/build-manifest.json` with SHA-256 hashes for source CSVs, `scripts/build_web_data.py`, `scripts/governed_exclusions.py`, `web/app.js`, and the generated `web/data.js` payload. See `meta.buildManifest` in the payload after the next rebuild.

---

## Exact source and field lineage (current build)

This section is the field-level contract for the dashboard. It records the **exact file name** selected by the current build and the **exact CSV header** used for every displayed value. A value marked **Derived** is calculated by `scripts/build_web_data.py` or by the browser from the stated source fields; it is not a CSV column.

### Source files selected by the current build

| Source role | Exact file | Exact fields used by the dashboard |
| --- | --- | --- |
| Tempo worklogs | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv` | `Work Item Key`, `Work Item summary`, `Logged Hours`, `Billable Hours`, `Work date`, `User Account ID`, `Full name`, `Tempo Team`, `Account Key`, `Account Name`, `Account Category`, `Client`, `Product Module`, `Work Item Type`, `Work Item Status`, `Priority`, `Version Name`, `Parent Key`, `Assignee ID`, `Work Item Original Estimate Hours`, `Work Item Remaining Estimate Hours`, `Task Type`, `Date created`, `Date updated`, `Tempo Worklog ID` |
| Jira PI backlog | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv` | `Issue key`, `Summary`, `Parent`, `Parent summary`, `Issue Type`, `Status`, `Status Category`, `Priority`, `Assignee`, `Reporter`, `Created`, `Updated`, `Resolved`, `Due date`, `Fix versions`, `Labels`, `Original estimate`, `Remaining Estimate`, `Custom field (Account)`, `Custom field (Bug Severity)`, `Custom field (Delivery)`, `Custom field (Is this technical debt ?)`, `Custom field (Product Module)`, `Custom field (Program)`, `Custom field (Start date)`, `Custom field (Target Release)`, `Team Id`, `Team Name`, `Custom field (Tempo Team)` |
| Assignees master | `20260307_Assignees_Capacity.csv` | `Team`, `Assignee ID`, `Assignee`, `Role`, `Skill`, `Availability`, `Annual Hours`, `Actual Annual Hours`, `Capacity Start Date`, `Capacity End Date` |
| Weekly capacity | `Weekly Capacity_20261005.csv` | `Team`, `Assignee ID`, `Assignee`, `Role`, `Skill`, `Availability`, `Total`, `Week Label`, `Week Number`, `Planned Hours` |
| Master calendar | `Google 2026 to 2028_Master_Date.csv` | `Master Date`, `Day`, `Month`, `Year`, `Weekday`, `WeekDay Name`, `Month Name`, `Week Number` |
| Release calendar | `Release Cycle.csv` | `Release Month`, `Release Cycle`, `Start Date`, `End Date` |
| Business Area mapping | `Promoters.csv` | `Business Area`, `Promoter` |
| Bug Triage | `Bug Triage_ignored.csv` | `Key`, `Issue Type`, `Summary`, `Bug Severity`, `Status`, `Updated`, `Assignee` — the current file has zero rows and is not used for a populated visual. |
| Tempo operational mapping | `data/mappings/tempo_operational_mapping.csv` | Governed Tempo-only key classification and display mapping. It is used only where a `TEMPO-*` work item needs operational metadata not present in the Jira PI backlog export. |

### Shared derived fields

| Payload / visual field | Exact source field(s) and rule |
| --- | --- |
| `team` | **Derived** by matching `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` (and Jira `Assignee`) to `20260307_Assignees_Capacity.csv.Assignee`, then taking `20260307_Assignees_Capacity.csv.Team`. |
| `skill` | **Derived** by matching `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` or `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee` to `20260307_Assignees_Capacity.csv.Assignee`, then taking `20260307_Assignees_Capacity.csv.Skill`. |
| `releaseCycle` | **Derived** by placing `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` inside `Release Cycle.csv.Start Date` to `Release Cycle.csv.End Date`, returning `Release Cycle.csv.Release Cycle`. |
| `account` on a Tempo worklog | **Derived** by joining `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` to `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`, returning `Custom field (Account)`. The Tempo-native account display remains `Account Name`. |
| `productModule`, `priority`, `status`, `targetRelease`, `program`, `delivery` on a Tempo worklog | **Derived** from the same work-item join to the Jira fields `Custom field (Product Module)`, `Priority`, `Status`, `Custom field (Target Release)`, `Custom field (Program)`, and `Custom field (Delivery)`. |
| `planningCategory` | **Derived** from Jira `Labels`: `PLANNED`, `UNPLANNED`, `tempo-ticket`, and the `TEMPO-` key prefix determine the classification. |
| `demandHours` | **Derived** from `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate ÷ 3,600`. Empty estimates remain missing; they are never converted to zero. |
| `planningPeriod` | **Derived** from Jira `Custom field (Target Release)`. If blank, the Jira `Due date` is placed into `Release Cycle.csv.Start Date` to `End Date`. A historical target release with a future due date is classified as a backport and reassigned to the due-date release. |
| `reportingStage` | **Derived** from Jira `Status`: Backlog/To Do = `STEP 1 - Demand`; Analysis = `STEP 2 - DoR`; Ready for Development/In Development/Testing/Test Complete = `STEP 3 - DoD`; Done/Rejected/Cancelled = `STEP 4 - Done / Cancelled`; all other values = `Other / Unmapped`. |

### Portfolio filters: exact fields

| Control | Exact file and field used |
| --- | --- |
| From / To | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` filters Tempo activity. The selectable bounds are governed by `Google 2026 to 2028_Master_Date.csv.Master Date`. |
| Team | `20260307_Assignees_Capacity.csv.Team`, applied through the derived `team` mapping. |
| Assignee | `20260307_Assignees_Capacity.csv.Assignee`; Tempo activity matches normalized `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`. |
| Skill | `20260307_Assignees_Capacity.csv.Skill`, applied through the assignee-to-skill mapping. |
| Account | Tempo display facet: `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Name`; Jira-governed backlog account: `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`. |
| Account Category | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Category`. |
| Priority | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority`, joined by work item key for Tempo rows. |
| Status | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`, joined by work item key for Tempo rows. |
| Target Release | Jira `Custom field (Target Release)`; Tempo-native fallback/display: `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Version Name`. |
| Program | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Program)`, joined by work item key. |
| Release Cycle | **Derived** from Tempo `Work date` and `Release Cycle.csv.Start Date`, `Release Cycle.csv.End Date`. |

### Portfolio KPIs and visuals: exact measure lineage

| Visual / displayed value | Exact file and field(s) used |
| --- | --- |
| Annual Workforce Capacity | Sum of `20260307_Assignees_Capacity.csv.Actual Annual Hours`, scoped by `Team`, `Assignee`, and `Skill`. |
| Actual Hours | Sum of `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`. |
| Annual Capacity Remaining | **Derived:** `Actual Annual Hours` sum minus `Logged Hours` sum. |
| Annual Capacity Utilization | **Derived:** `Logged Hours` sum ÷ `Actual Annual Hours` sum. |
| Work item count | Distinct `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`. |
| Hours Trend — Logged | Sum of `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` by `Work date`; weekly grouping uses `Google 2026 to 2028_Master_Date.csv.Week Number`. |
| Hours Trend — Billable | Sum of `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Billable Hours` by the same `Work date` grain. |
| Planned vs Unplanned — work item count | Distinct `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; classification from Jira `Labels`. |
| Planned vs Unplanned — hours | Sum of Tempo `Logged Hours` for the same classified keys. |
| Program Distribution | Sum of Tempo `Logged Hours`; program from Jira `Custom field (Program)`. |
| Bug Severity Distribution | Distinct `Bug Triage_ignored.csv.Key` by `Bug Severity`, limited to `Issue Type = Bug`. The current source has zero rows. |
| Account Distribution | Sum of Tempo `Logged Hours` by `Account Name`; Jira `Custom field (Account)` supplies the governed backlog/estimate context. |
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
| Accounts — Account | Jira `Custom field (Account)`; Tempo native display/fallback is `Account Name`. |
| Accounts — Original Estimate Hours | Jira `Original estimate ÷ 3,600`. |
| Accounts — Logged Hours | Tempo `Logged Hours`. |
| Accounts — Variance Hours | **Derived:** Logged Hours minus Original Estimate Hours. |
| Accounts — Logged vs Estimate % | **Derived:** Logged Hours ÷ Original Estimate Hours. |
| Accounts — Work Items | Distinct Jira `Issue key` after the active scope. |
| People — Assignee | `20260307_Assignees_Capacity.csv.Assignee`; Tempo activity display is `Full name`. |
| People — Team / Role / Skill | `20260307_Assignees_Capacity.csv.Team`, `.Role`, `.Skill`. |
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
| Bug Triage — Key / Summary / Severity / Status / Updated / Assignee | `Bug Triage_ignored.csv.Key`, `.Summary`, `.Bug Severity`, `.Status`, `.Updated`, `.Assignee`. |

### Demand Management tab: exact fields

| Visual / control / value | Exact file and field(s) used |
| --- | --- |
| Demand filters — date range | Selectable bounds: `Google 2026 to 2028_Master_Date.csv.Master Date`. Demand period filtering: Jira `Custom field (Target Release)` with the `Due date` fallback described in `planningPeriod`. Tempo actual filtering: Tempo `Work date`. |
| Demand filters — Team | Jira `Assignee` matched to `20260307_Assignees_Capacity.csv.Assignee`, returning `Team`. |
| Demand filters — Assignee | Jira `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; Tempo `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`; capacity `Weekly Capacity_20261005.csv.Assignee`. The dropdown permits multiple selections. |
| Demand filters — Client | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Client`, joined to Jira demand through `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` = `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`. Demand with no matching Tempo Client is `Other/Blank`. |
| Demand filters — Business Area | `Promoters.csv.Promoter` is matched to `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Promoter)`; the displayed value is `Promoters.csv.Business Area`. Blank or unmatched promoter is `Other/Blank`. |
| Demand filters — Account | Jira `Custom field (Account)`. |
| Demand filters — Product Module | Jira `Custom field (Product Module)`. |
| Demand filters — Target / Planning Release | Jira `Custom field (Target Release)` is the multi-select dropdown source. `Due date` and `Release Cycle.csv.Start Date` / `End Date` provide the documented planning-period fallback for unselected release allocation. |
| Known Outstanding Demand KPI | Sum of Jira `Remaining Estimate ÷ 3,600`; records with a blank `Remaining Estimate` are excluded from the hour sum and retained as an exception. |
| Actual Effort KPI | Sum of Tempo `Logged Hours`, limited by `Work date`. |
| Remaining Period Capacity KPI | **Derived:** sum of `Weekly Capacity_20261005.csv.Planned Hours` minus Tempo `Logged Hours`, aligned through `Week Number`, `Master Date`, and release dates. |
| Data Quality Exceptions KPI | Count of Jira `Issue key` where `Remaining Estimate` is blank. |
| Team × Release / Planning Period pivot | Value: Jira `Remaining Estimate ÷ 3,600`; rows/columns: derived `team` and derived `planningPeriod`. |
| Capacity versus Known Demand pivot — Capacity | `Weekly Capacity_20261005.csv.Planned Hours`, grouped by mapped `Team` and derived planning period. |
| Capacity versus Known Demand pivot — Actual effort | Tempo `Logged Hours`, grouped by derived `team` and `releaseCycle`. |
| Capacity versus Known Demand pivot — Known demand | Jira `Remaining Estimate ÷ 3,600`, grouped by derived team and planning period. |
| Capacity versus Known Demand pivot — Remaining capacity | **Derived:** Capacity minus Actual effort. |
| Capacity versus Known Demand pivot — Capacity gap | **Derived:** Capacity minus Actual effort minus Known demand. |
| Workflow Position — ticket count | Count of Jira `Issue key` by derived `reportingStage` from Jira `Status`. |
| Workflow Position — hours | Sum of Jira `Remaining Estimate ÷ 3,600` by derived `reportingStage`. |
| Workflow Position — inline ticket details | Jira `Issue key`, `Summary`, `Assignee`→Team, `Custom field (Target Release)`/due-date planning fallback, and `Remaining Estimate`. |
| Actual Effort vs Future Demand by Account — Actual | Tempo `Logged Hours` grouped by Jira `Custom field (Account)` joined on `Work Item Key = Issue key`; `Account Name` is the Tempo fallback. |
| Actual Effort vs Future Demand by Account — Future | Jira `Remaining Estimate ÷ 3,600` grouped by `Custom field (Account)`. These two values are shown separately and are not added together. |
| Demand Data Quality — Missing Remaining Estimate | Jira `Remaining Estimate` is blank. |
| Demand Data Quality — Unassigned Team | Jira `Assignee` does not map to `20260307_Assignees_Capacity.csv.Assignee` and therefore has no `Team`. |
| Demand Data Quality — Unscheduled | Jira `Custom field (Target Release)` is blank and `Due date` cannot be placed inside any `Release Cycle.csv.Start Date` / `End Date` window. |
| Demand Data Quality — inline ticket details | Jira `Issue key`, `Summary`, `Assignee`→Team, planning period, and `Remaining Estimate`. |
| Release Predictability KPI | No source fields are currently used. The KPI displays the hardcoded empty value `—` and `TODO` until feature hierarchy, baseline commitment, and delivery-in-expected-release rules are governed. |
| Release KPI | No source fields are currently used. The KPI displays the hardcoded empty value `—` and `TODO` until its governed calculation is defined. |

---

## Strict `file.column` ledger for every displayed value

This is the authoritative, literal reference list. Every source reference below uses the required `exact-file-name.csv.exact-column-name` form. It supersedes any abbreviated source name or wildcard used in the earlier narrative sections of this document.

### Portfolio filters and KPI cards

| Dashboard item | Exact `file.column` input | Derived calculation / use |
| --- | --- | --- |
| From / To selectable dates | `Google 2026 to 2028_Master_Date.csv.Master Date` | Sets the minimum and maximum selectable dates. |
| From / To applied to Tempo work | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` | Includes a Tempo row when Work date is in the selected range. |
| Team filter | `20260307_Assignees_Capacity.csv.Team`; `20260307_Assignees_Capacity.csv.Assignee`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` | Full name is normalized and matched to Assignee, then Team is used. |
| Assignee filter | `20260307_Assignees_Capacity.csv.Assignee`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` | Normalized equality match. |
| Skill filter | `20260307_Assignees_Capacity.csv.Skill`; `20260307_Assignees_Capacity.csv.Assignee`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` | Skill is obtained through the assignee match. |
| Account filter — Tempo label | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Name` | Tempo-native account label. |
| Account filter — Jira-governed account | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Jira account joins to Tempo through Issue key = Work Item Key. |
| Account Category filter | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Category` | Direct filter. |
| Priority filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Jira Priority joins to Tempo by key. |
| Status filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Jira Status joins to Tempo by key. |
| Target Release filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Version Name` | Jira field is governed value; Version Name is Tempo-native fallback/display. |
| Program filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Program)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Jira Program joins to Tempo by key. |
| Release Cycle filter | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date`; `Release Cycle.csv.Start Date`; `Release Cycle.csv.End Date`; `Release Cycle.csv.Release Cycle` | Work date is placed inside Start Date–End Date and returns Release Cycle. |
| Annual Workforce Capacity | `20260307_Assignees_Capacity.csv.Actual Annual Hours` | Sum after Team, Assignee, and Skill scope. |
| Actual Hours | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Sum after governed exclusion and active scope. |
| Annual Capacity Remaining | `20260307_Assignees_Capacity.csv.Actual Annual Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Sum(Actual Annual Hours) − Sum(Logged Hours). |
| Annual Capacity Utilization | `20260307_Assignees_Capacity.csv.Actual Annual Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Sum(Logged Hours) ÷ Sum(Actual Annual Hours). |
| Work item count note | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Distinct count. |

### Portfolio charts

| Chart and value | Exact `file.column` input | Derived calculation / use |
| --- | --- | --- |
| Hours Trend — Logged series | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` | Sum Logged Hours by month or week. |
| Hours Trend — Billable series | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Billable Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` | Sum Billable Hours by month or week. |
| Hours Trend — weekly bucket | `Google 2026 to 2028_Master_Date.csv.Master Date`; `Google 2026 to 2028_Master_Date.csv.Week Number` | Work date is matched to Master Date and grouped by Week Number. |
| Planned vs Unplanned — key count | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Labels`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` | Distinct Work Item Key; Labels determine PLANNED, UNPLANNED, Operations, or Unclassified. |
| Planned vs Unplanned — hours | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Labels` | Sum Logged Hours within the label-derived class. |
| Program Distribution — slice | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Program)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Sum Logged Hours by joined Program. |
| Bug Severity Distribution — bar | `Bug Triage_ignored.csv.Key`; `Bug Triage_ignored.csv.Issue Type`; `Bug Triage_ignored.csv.Bug Severity` | Distinct Key where Issue Type = Bug, grouped by Bug Severity. |
| Account Distribution — tile label | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Name` | Account display label. |
| Account Distribution — tile size | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Name` | Sum Logged Hours by Account Name. |
| Team Utilization — planned | `Weekly Capacity_20261005.csv.Planned Hours`; `Weekly Capacity_20261005.csv.Assignee`; `20260307_Assignees_Capacity.csv.Assignee`; `20260307_Assignees_Capacity.csv.Team`; `Weekly Capacity_20261005.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Master Date` | Planned Hours sums by mapped Team for Master Date weeks in range. |
| Team Utilization — logged | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`; `20260307_Assignees_Capacity.csv.Assignee`; `20260307_Assignees_Capacity.csv.Team` | Sum Logged Hours by mapped Team. |
| Team Utilization — utilization | `Weekly Capacity_20261005.csv.Planned Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Sum Logged Hours ÷ Sum Planned Hours. |
| Remaining Demand vs Logged Effort — demand | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `20260307_Assignees_Capacity.csv.Assignee`; `20260307_Assignees_Capacity.csv.Team` | Remaining Estimate ÷ 3,600, summed by mapped Team. |
| Remaining Demand vs Logged Effort — actual | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`; `20260307_Assignees_Capacity.csv.Assignee`; `20260307_Assignees_Capacity.csv.Team` | Sum Logged Hours by mapped Team. |
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
| Accounts — Account | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Name` | Jira value is governed account; Account Name is fallback display. |
| Accounts — Original Estimate Hours | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Original estimate` | Original estimate ÷ 3,600. |
| Accounts — Logged Hours | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Sum by account. |
| Accounts — Variance Hours | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Original estimate`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Logged Hours − (Original estimate ÷ 3,600). |
| Accounts — Logged vs Estimate % | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Original estimate`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Logged Hours ÷ (Original estimate ÷ 3,600). |
| Accounts — Work Items | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` | Distinct count. |
| People — Assignee | `20260307_Assignees_Capacity.csv.Assignee`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name` | Master assignee label with Tempo activity match. |
| People — Team | `20260307_Assignees_Capacity.csv.Team` | Direct master field. |
| People — Capacity | `Weekly Capacity_20261005.csv.Planned Hours`; `Weekly Capacity_20261005.csv.Assignee`; `20260307_Assignees_Capacity.csv.Assignee` | Sum Planned Hours matched by Assignee. |
| People — Logged Total / Engineering / Operations | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Total is sum Logged Hours; Work Item Key classifies Operations (`TEMPO-*`) versus Engineering. |
| People — Billable | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Billable Hours` | Sum by person. |
| People — Utilization / Work Items | `Weekly Capacity_20261005.csv.Planned Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key` | Utilization = Logged Hours ÷ Planned Hours; Work Items = distinct Work Item Key. |
| Backlog — Parent Key / Parent Summary | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Parent`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Parent summary` | Direct Jira metadata; Tempo `Parent Key` is fallback for activity rows. |
| Backlog — Child Key / Child Summary | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Summary`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item summary` | Jira fields are primary; Tempo fields are fallback. |
| Backlog — Work Item Type / Module / Status / Priority | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue Type`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Product Module)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority` | Joined to active Tempo key. |
| Backlog — Start / Due / Last Worklog Date | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Start date)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Due date`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` | Last Worklog Date = maximum Work date per active item. |
| Delivery Progress — Account / Team | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`; `20260307_Assignees_Capacity.csv.Team`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee` | Team comes from Assignee-to-Team match. |
| Delivery Progress — Parent / Child / Summary | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Parent`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Parent summary`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Summary` | Direct Jira fields. |
| Delivery Progress — Status / Priority / Start / Due | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Priority`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Start date)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Due date` | Direct Jira fields. |
| Delivery Progress — Last Worklog Date / Days to Due / Delivery Health | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Due date`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status` | Last Worklog Date = maximum Work date; Days to Due and Health are derived. |
| Bug Triage — all columns | `Bug Triage_ignored.csv.Key`; `Bug Triage_ignored.csv.Summary`; `Bug Triage_ignored.csv.Bug Severity`; `Bug Triage_ignored.csv.Status`; `Bug Triage_ignored.csv.Updated`; `Bug Triage_ignored.csv.Assignee` | Direct fields. |

### Demand Management tab

| Dashboard value / control | Exact `file.column` input | Derived calculation / use |
| --- | --- | --- |
| Demand date selector | `Google 2026 to 2028_Master_Date.csv.Master Date` | Sets selectable bounds. |
| Demand Team filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `20260307_Assignees_Capacity.csv.Assignee`; `20260307_Assignees_Capacity.csv.Team` | Jira Assignee maps to master Team. |
| Demand Assignee filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`; `Weekly Capacity_20261005.csv.Assignee` | Multi-select picker. Selected Jira Assignee, Tempo Full name, and capacity Assignee values are retained. |
| Demand Client filter | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Client`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` | Client comes from Tempo. Work Item Key = Issue key carries the Tempo Client to the corresponding Jira demand row. No mapped Client = `Other/Blank`. |
| Demand Business Area filter | `Promoters.csv.Promoter`; `Promoters.csv.Business Area`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Promoter)` | Custom field (Promoter) matches Promoters.csv.Promoter; Business Area is returned. Blank or unmatched promoter = `Other/Blank`. |
| Demand Account filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)` | Direct field. |
| Demand Product Module filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Product Module)` | Direct field. |
| Demand Target / Planning Release filter | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)` | Multi-select picker source. The selected values filter only this Jira field. |
| Known Outstanding Demand | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate` | Sum(Remaining Estimate ÷ 3,600); blank values remain exceptions. |
| Actual Effort | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date` | Sum Logged Hours inside selected dates. |
| Remaining Period Capacity | `Weekly Capacity_20261005.csv.Planned Hours`; `Weekly Capacity_20261005.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Master Date`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours` | Sum Planned Hours for selected Master Date weeks − Actual Effort. |
| Data Quality Exceptions | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate` | Count Issue key with blank Remaining Estimate. |
| Team × Release pivot — row/column values | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `20260307_Assignees_Capacity.csv.Assignee`; `20260307_Assignees_Capacity.csv.Team`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Due date`; `Release Cycle.csv.Start Date`; `Release Cycle.csv.End Date`; `Release Cycle.csv.Release Cycle` | Row/column axes are derived Team and Planning Period. |
| Team × Release pivot — cell | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate` | Sum(Remaining Estimate ÷ 3,600). |
| Capacity vs Known Demand pivot — Capacity cell | `Weekly Capacity_20261005.csv.Planned Hours`; `Weekly Capacity_20261005.csv.Assignee`; `20260307_Assignees_Capacity.csv.Assignee`; `20260307_Assignees_Capacity.csv.Team`; `Weekly Capacity_20261005.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Week Number`; `Google 2026 to 2028_Master_Date.csv.Master Date`; `Release Cycle.csv.Start Date`; `Release Cycle.csv.End Date`; `Release Cycle.csv.Release Cycle` | Sum Planned Hours by derived Team and Planning Period. |
| Capacity vs Known Demand pivot — Actual cell | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work date`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Full name`; `20260307_Assignees_Capacity.csv.Assignee`; `20260307_Assignees_Capacity.csv.Team`; `Release Cycle.csv.Start Date`; `Release Cycle.csv.End Date`; `Release Cycle.csv.Release Cycle` | Sum Logged Hours by derived Team and Release Cycle. |
| Capacity vs Known Demand pivot — Known Demand cell | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `20260307_Assignees_Capacity.csv.Assignee`; `20260307_Assignees_Capacity.csv.Team`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)` | Sum(Remaining Estimate ÷ 3,600) by derived Team and Planning Period. |
| Capacity vs Known Demand pivot — Remaining / Gap | `Weekly Capacity_20261005.csv.Planned Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate` | Remaining = Capacity − Actual. Gap = Capacity − Actual − Known Demand. |
| Workflow Position — stage | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status` | Status maps to the documented STEP 1–4 or Other / Unmapped stage. |
| Workflow Position — ticket count | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Status` | Count Issue key by derived stage. |
| Workflow Position — hours / details | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Summary`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)` | Hours = Sum(Remaining Estimate ÷ 3,600); inline detail displays the listed Jira fields. |
| Actual Effort vs Future Demand by Account — Actual | `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Logged Hours`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Work Item Key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)`; `RAW_DATA_FULL_ANALYSIS_01_Jan_26_07_Oct_26.csv.Account Name` | Sum Logged Hours by joined Jira account; Account Name is fallback. |
| Actual Effort vs Future Demand by Account — Future | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Account)` | Sum(Remaining Estimate ÷ 3,600) by Account. |
| Demand Data Quality — Missing Remaining Estimate | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key` | Blank Remaining Estimate is an exception. |
| Demand Data Quality — Unassigned Team | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `20260307_Assignees_Capacity.csv.Assignee`; `20260307_Assignees_Capacity.csv.Team` | Exception when Assignee has no Team match. |
| Demand Data Quality — Unscheduled | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Due date`; `Release Cycle.csv.Start Date`; `Release Cycle.csv.End Date` | Exception when neither Target Release nor date-window fallback yields a Planning Period. |
| Demand Data Quality — inline detail | `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Issue key`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Summary`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Assignee`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Remaining Estimate`; `All Jira Work Items marked PI Backlog (JIRA)_20261007.csv.Custom field (Target Release)` | Displays exception tickets and their source values. |
| Release Predictability KPI | `N/A` | Hardcoded empty value `—`; `TODO`; no source field is used. |
| Release KPI | `N/A` | Hardcoded empty value `—`; `TODO`; no source field is used. |
