# Semantic Visualization Governance — CH-005A v1

> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only.

## Revision provenance and version history

Previous proposal: [Semantic_Visualization_Governance_CH004_v1.md](Semantic_Visualization_Governance_CH004_v1.md), preserved unchanged. Canonical comparison document: [Semantic_Visualization_Governance.md](Semantic_Visualization_Governance.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/Semantic_Visualization_Governance.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob 721ffc7b983176a4dedd1f3dfe28e88b3cedfbb6. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work.

| Version | Date / status |
| --- | --- |
| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |
| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |
| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |

## CH-005A decision and evidence boundary

This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.

Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision.

## Purpose

This document defines the rendering and interaction principles for the active browser dashboard. It does not duplicate field-level calculations; [Chart and Visual Specification](../user-guides/Chart_and_Visual_Specification_CH005A_v1.md) is the authoritative source for those rules.

## Core principles

- Every displayed measure must be traceable to named CSV fields or a documented derived calculation.
- Missing, unmapped, unavailable, and `Other/Blank` values remain visible rather than being silently converted to zero.
- Charts provide a decision-oriented summary; details retain the source work-item context needed for follow-up.
- A filter uses consistent values for its governed dimension within supported consumers; applicability is consumer-specific. Client = verified Tempo `Account Customer`. Portfolio Account = trimmed, case-preserved Tempo `Account Key` identity with `Account Name` for display. Account Category = Tempo `Account Category`. Jira Account = Jira `Custom field (Account)` metadata and retained planning/diagnostic use. Legacy Reporting Account labels exist only in v1 export compatibility controls; no modern Portfolio selection state or predicate uses that dimension. Matching names do not establish a Jira/Tempo relationship.
- Direct relationships must not be presented as hierarchy roll-ups. In particular, Epic Workflow shows direct Tempo-to-Epic matches only.

## Tabs

### General KPI cards

The six Portfolio KPI cards remain visible above the tabs. Apply the current annual workforce contract: gross annual allocations follow Team/Assignee/Skill and compatible year; Actual Hours and the gross balance/consumption numerator follow applicable effort filters and ignore Status. Annual Development Capacity and Demand Capacity retain their full-source scope. Direct Tempo Account Key now scopes the approved Portfolio actual-effort numerator and other effort consumers; annual allocations remain workforce/year governed. No KPI formula or tab-switch calculation changes are introduced.

### Portfolio

Portfolio represents actual and historical delivery effort. Its filter rail, charts, and detail tables use the governed Tempo, Jira, capacity, and Assignees dimensions. Detail tables support sorting and grouping. Jira and Tempo links are rendered only when the required destination identifier is known.

The Portfolio sidebar exposes Client, Account and Account Category. Client uses verified Tempo Account Customer; Account uses trimmed, case-preserved Tempo Key with Name display. Key selection scopes approved effort consumers directly and applicable Jira populations by observed membership. Legacy v1 label controls are export-only and do not filter modern reporting.

| Sidebar state | Account Distribution |
| --- | --- |
| No active Client or Tempo Account selection | Distribution by Client |
| Client selected | Associated Account distribution |
| Tempo Account selected | Selected Account distribution |
| Explicit All Accounts | All eligible Account distribution |
| Client and Account active | Intersected Account distribution |
| Both reset | Default Client distribution |

Explicit **Select All** stores the currently rendered Account options and activates Account grouping. It differs from inactive **All accounts**. Search or other applicable scope can limit those options; it is not a wildcard for future Accounts. Explicit All Clients also activates Account grouping when options exist. Clear All Accounts deactivates Account selection; Client grouping returns only when Client is also cleared. Client and Account selections intersect; a selection outside the current scope does not widen it.

Tiles contain governed managed, nonexcluded, nonoperational Tempo worklogs, including explicit missing-attribution buckets. Operational `TEMPO-*` effort is excluded from tiles by the existing issue-key classifier, never by Client/Account names. All three footer values use one applicable Client/Account-filtered Tempo scope: Total logged hours, Operational Tempo hours, and Customer/account effort. Jira Status does not filter this visual; the Reporting Account sidebar control has been removed. Date Range, Team, Assignee, Skill, Client, Account Category, Priority, Target Release, Program and existing Release Cycle state apply where implemented; active Tempo Account keys are then applied. The UI footer phrase `global filters` refers to this consumer-specific scope. Changing grouping alone preserves eligible worklogs; applying Client or Account filters can change populations and totals. Missing Client displays `-` in tiles (`N/A` in the Client picker); missing Account Key remains a `-` bucket. Only positive aggregate-hour buckets render (`logged > 0`); negative-adjustment conservation remains unapproved/unvalidated (G6).

### Demand Management

Demand Management represents actual effort, known future demand, capacity, delivery workflow position, and release context. It is demand visibility, not forecasting.

Its filter rail uses searchable multi-select controls. Both Client pickers use only validated Tempo `Account Customer` values plus the explicit `N/A` attribution bucket. Client retains its position, styling, search, multi-select, Select All, Clear All, and reset behavior. Business Area uses a Jira Promoter **or** Reporter match to the Promoters mapping; its unmatched values remain `Other/Blank`.

Client = Tempo Customer Account, never Jira Client, Tempo Account Name, or Jira Account. Both tabs and the Portfolio snapshot export use `tempoCustomerAccount` through the shared `DashboardCore.clientValue` helper. Worklogs retain their direct account/customer attribution; Jira counts and estimates use only complete, single-customer direct issue mappings. Missing or ambiguous items remain visible under `N/A` without parent inheritance or splitting estimates. See [Calculation Governance](Calculation_Governance_CH005A_v1.md#client-attribution-2026-10-22) for the deterministic rule. Full-source KPIs and Delivered Features retain their existing exceptions; current annual Portfolio cards use the scope described above. Workforce capacity is not customer allocated. Portfolio Account Key selection does not synchronize with Demand’s independent Jira Account picker or redefine its planning behavior; CH-005B remains deferred.

Epic Workflow uses Jira Issue Type = Epic, Epic Lab, or Epic Release. A card and its inline detail represent Jira rows in the selected stage. Logged hours are direct Jira Issue key to Tempo Work Item Key matches only; descendant hierarchy attribution is not implied.

Capacity versus Known Assigned Demand replaces the capacity pivot with a six-team comparison, aggregate KPI cards, an independent future-horizon selector, and separate unallocated/exception disclosure. Its scoped source and hierarchy rules are recorded in [Calculation Governance](Calculation_Governance_CH005A_v1.md#capacity-versus-known-assigned-demand--scoped-authorization-2026-10-22). Use a common bar scale, grey capacity, pastel-blue assigned demand capped at capacity, and muted-red excess demand. Sort known gaps ascending with alphabetical ties; unavailable gaps follow. Missing values render `-`, confirmed zeros render zero, and incomplete capacity never renders as a zero bar or a valid portfolio load. The exception indicator labels its broader Team scope. Existing demand panels retain their previous semantics.

### Datasources

The Datasources tab exposes current payload freshness, source status, data-quality warnings, relationships, fallbacks, and tab-specific lineage. It is a concise operational view; the Chart and Visual Specification contains the detailed field contract.

## Interaction and accessibility

- All picker controls must expose a descriptive label, selection count, Select All, Clear All, and keyboard-usable search where the value list can be long.
- Chart labels, legends, and tooltips must state the measured unit or count.
- Clicking a chart category may apply only the matching documented filter. Account Distribution Client tiles set the sidebar Client selection; Account tiles select that Tempo Account, or clear Account selection when the selected tile is clicked again. Enter/Space use the same action. Clearing Account does not clear Client; resetting both restores Client grouping. No embedded Client/Account dropdowns or separate grouping toggle are present.
- Tables must preserve textual headers, sortable-column state, and a readable empty state.
- External Jira and Tempo links open in a new tab with safe `noopener noreferrer` behavior.

## Visual rules

- Use the existing neutral dashboard palette; color supports grouping or semantic state and must not fabricate thresholds.
- Use a clear unavailable or not-attributed state when a governed relationship is absent.
- Responsive layouts must stack panels without horizontal overflow on smaller screens.
- Business hints explain purpose, not technical implementation details.

## Change control

Any new KPI, filter, relationship, chart, table, or workflow stage requires:

1. A documented source and calculation in the Chart and Visual Specification.
2. Corresponding Datasources-tab lineage.
3. Filter, empty-state, accessibility, and data-quality behavior.
4. A rebuilt payload and validation against current source exports.


## CH-005A presentation requirements

Show residual unlinked issues in a separate companion rather than attaching them to selected Account tiles. Explain observed linked estimates, non-additive row estimates and unavailable comparison reasons in readable text. Preserve textual scope, source date and empty-state explanations alongside visuals. Export-only legacy labels must not resemble a global reporting filter. Keep existing keyboard tile actions, visible missing attribution and responsive layout; no color-only inference of ownership or comparison validity.

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
