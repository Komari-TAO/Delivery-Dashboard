# CH-005A Portfolio exports — v2 contract and v1 compatibility

Date: 2026-11-03 (Europe/Madrid). Scope: Portfolio only. This is an implementation/audit record, not an amendment to authoritative governance or the CH-004 proposals.

## Versioned Portfolio CSV

The primary action downloads `delivery-bi-snapshot-v2-{start}_{end}.csv`. The reconciliation panel downloads `delivery-bi-planning-v2-{start}_{end}.csv`.

Both use these columns, in order:

1. Schema Version (`2`)
2. Record Type (`Account effort` or `Jira issue`)
3. Population
4. Account Key
5. Account Name
6. Observed Account Keys (JSON array for Jira records)
7. Attribution Status
8. Jira Issue Key
9. Jira Account (source metadata)
10. Logged Hours
11. Original Estimate Hours
12. Remaining Estimate Hours
13. Scope (JSON)

Account effort records aggregate selected governed worklogs by trimmed, case-preserved Tempo Account Key. Names are display only. Blank keys have an explicit missing-key record. These records contain logged hours and no Jira estimate values.

Jira records contain each eligible issue once across the disjoint `selected`, `unlinked` and `other` populations. They contain source Original/Remaining Estimates and no logged hours. An unavailable source estimate is blank, not a fabricated zero. Observed keys are direct activity evidence, not estimate allocation or ownership. Do not join these estimates back to worklogs and sum the expanded rows.

The snapshot's Jira population uses the existing Account detail Created Date, Status and ownership scope. Its full issue evidence and population subtotals are available beneath Account details. The planning export instead uses the Remaining Demand panel's existing snapshot scope, without introducing a Created Date or future-horizon rule. Its population subtotals and issue detail appear in the reconciliation panel. Neither changes Demand Management.

Scope JSON records report identity, source snapshot date, selected dates, active/inactive Account state, selected keys (including blank-key selection), all other Portfolio selections, membership basis, actual-effort Status applicability and source filenames/hashes. Detail text search and displayed-row limits do not filter snapshot exports; the UI states this boundary.

CSV uses quoted fields and doubled embedded quotes. Numbers are unrounded source/payload numeric values. Consumers must use Record Type and Population, rather than summing all numeric columns indiscriminately. Inactive Account includes unlinked Jira issues in `selected`; attribution status still distinguishes them. Under active Account selection, residual unlinked records exclude already selected missing-key issues.

## Retained legacy CSV

`Legacy CSV (v1)` remains available as an explicitly labelled export-only control. Its optional labels match the original Jira Account / Tempo Account Name semantics. These selections never filter modern Portfolio reports. The modern Tempo Account selection does not filter v1 output.

The original filename, six-column schema, rounding and formulas remain:

`Account, Original Estimate Hours, Logged Hours, Variance Hours, Logged vs Estimate %, Work Items`.

Other applicable legacy Portfolio filters retain their prior behavior. Supported legacy column sort selections remain supported; new v2-only sort fields fall back to the original Logged Hours descending order. Original empty-name omissions and mixed-label comparisons are preserved only in v1 for compatibility; they are not adopted by v2 reports.

Compatibility evidence: 84 captured unrestricted/single-label exports match byte-for-byte; 13 additional global-filter cases match, including all four Programs. Evidence is under `outputs/ch005a/`. v1 is not retired by CH-005A.

## Comparison and totals

Account detail estimates are labelled observed linked-issue estimates, not Account budgets. Separate Account subtotals can overlap for multi-Account issues; the union footer deduplicates Issue Key. Unsupported row comparisons and union variance/ratio show Unavailable. A supported row comparison requires one complete nonmissing Account, identical eligible issue sets, valid original estimates and complete observed source-worklog coverage for those issues. A date, contributor or Team selection that retains only part of an issue's observed worklogs suppresses the comparison. No estimate allocation is implemented. Source estimates and existing arithmetic formulas remain unchanged.

Future changes to schemas, population definitions, legacy retirement or Account ownership allocation require their own approved migration.
