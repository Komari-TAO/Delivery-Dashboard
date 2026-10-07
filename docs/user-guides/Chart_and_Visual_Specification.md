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
| Team | `team` (from assignees) | `team` | `team` | `team` |
| Assignee | `person` | `assignee` | `assigneeCanonical` | `assignee` |
| Skill | `skill` | `skill` | `skill` | `skill` |
| Account | `tempoAccount` / enriched `account` | `Custom field (Account)` | — | — |
| Account Category | `Account Category` | — | — | — |
| Priority | Jira-enriched `priority` | `Priority` | — | — |
| Status | Jira-enriched `status` | `Status` | `Status` (if filter active) | — |
| Target Release | `Version Name` / Jira `Custom field (Target Release)` | `Custom field (Target Release)` | — | — |
| Program | Jira `Custom field (Program)` | `Custom field (Program)` | — | — |
| Release Cycle | derived `releaseCycle` | `Fix versions` | — | — |

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
| Annual Capacity Remaining | Annual capacity minus Actual Hours | Same as above |
| Annual Capacity Utilization | Actual Hours ÷ Annual Workforce Capacity | Same as above |
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

All sidebar filters that apply to **governed logged worklogs**; **Status filter is ignored** for this chart (same as other governed effort charts). Grain: user selects Monthly or Weekly (`#trendGrain`).

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

**Filters:** Status-filtered backlog; Tempo worklogs with status ignored for logged columns (same as Accounts download).

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

**Filters:** Team, Assignee, Skill, Status (same as bug severity chart).

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
