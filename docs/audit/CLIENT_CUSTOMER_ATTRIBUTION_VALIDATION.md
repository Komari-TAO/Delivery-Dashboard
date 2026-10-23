# Client = Tempo Customer Account — validation, 2026-10-22

## Sources and comparison

The active dashboard uses `scripts/build_web_data.py`, `web/dashboard-core.js`, `web/app.js`, and `web/demand.js`. The current sources are `data/raw/RAW_DATA_FULL_ANALYSIS_01_Jan_26_22_Oct_26.csv` and `data/raw/All Jira Work Items marked PI Backlog (JIRA)_20261022.csv`. Source hashes remain available in `web/build-manifest.json`. Raw CSVs and generated operational payloads remain Git-ignored.

Tempo's **`Account Customer` is column S (19)**. It is distinct from `Account Key`, `Account Name`, and legacy `Client`. The previous implementation actually populated Portfolio from Tempo's legacy `Client` and copied the first nonblank value to Jira rows. Another worklog path subsequently replaced `delivery` with Jira Delivery metadata. All Client filtering now uses the separate `tempoCustomerAccount` field; Jira Delivery metadata and its parent rules are unchanged.

The Jira extract has 32 nonblank legacy `Custom field (Client)` values. The governed Tempo evidence has 25 validated nonblank Customer Account values; their labels have **no exact overlap** with the legacy Jira labels. Comparison is diagnostic only and never an input to attribution. Examples from the same direct Jira keys:

| Legacy Jira Client | Verified Tempo customer distribution / unresolved Jira items |
| --- | --- |
| `01HKDIR (HKDir/Norway)` | HK DIR: 336; OAT: 33; N/A: 104 |
| `OAT Internal` | OAT: 90; IGNITE: 24; TAO Product Roadmap: 21; TAO OSS: 6; EPSO: 2; NSA: 1; NYCDOE: 1; N/A: 106 |
| `01PREM (OAT Premium Edition)` | TAO Product Roadmap: 85; IGNITE: 29; OAT: 13; HK DIR: 1; EPSO: 1; N/A: 29 |

These distributions demonstrate why translating Jira Client labels into customer names would be unsafe. A full cross-tab was inspected locally at `.tmp/client_attribution/jira_client_vs_tempo_customer.csv` and is deliberately not committed.

The validated customer values are ACER, BOSA, BRASOV, COMUNIDAD VALENCIANA, EPSO, HK DIR, ICELAND, IGNITE, IGNITE SPAIN, INFOSIGN - MEXCBT, INVALSI, NCCER, NIVAM, NSA, NYCDOE, NYSED, OAT, OSLO Kommune, PFS-MENJE, TAO OSS, TAO Product Roadmap, TAO STUDIO & AI, TEMPO TICKETS, UCHIDA, and UDIR. Both Client pickers expose these values plus the explicit `N/A` bucket, preserving their existing interface and interactions.

## Mapping and remaining gaps

The mapping validates co-occurring Account Key / Account Customer pairs in the complete governed valid-date Tempo export. Of 77 nonblank account keys, 75 have exactly one nonblank customer and two (`GALICIA2027`, `NAVARRA2027`) have no customer. There are no conflicting account-to-customer mappings in this snapshot. Multiple Tempo Accounts can share a customer; for example Infosign SOW accounts share INFOSIGN - MEXCBT. Account Name is retained as a distinct display dimension and never treated as Customer Account. This is validation against the supplied export, not a claim of completeness against a Tempo account registry.

Worklogs use their validated account-key mapping. Jira items use normalized direct issue-key matches, requiring complete verified worklog attribution to exactly one customer. Missing, incomplete, or multiple-customer evidence deterministically produces `N/A`. No Jira Client, Jira Account, parent, account-name similarity, first-row choice, or effort-weighted customer selection is used. Different-customer worklogs remain attributable at their own grain while unsplittable Jira counts and estimates remain `N/A`. Candidate account keys/customers and reasons are retained in `meta.clientAttribution`; no many-to-many joins or duplicated Jira rows are introduced.

| Current governed population | Result |
| --- | ---: |
| Jira items with verified customer | 1,567 |
| Jira items with no direct Tempo worklogs | 644 |
| Jira items with incomplete Tempo customer evidence | 27 |
| Jira items under N/A | 671 |
| N/A Epics in Demand workflow | 165 |
| Jira items with multiple verified customers | 0 |
| N/A worklogs | 270 |
| N/A logged hours | 535.897 |

All Jira-only counts, workflow stages, effort caps, Original Estimate, Remaining Estimate and demand measures have incomplete customer attribution. The 671 N/A items carry 18,745.85 remaining-estimate hours out of the unchanged 44,636.1001 total. Selecting a known Client therefore describes verified coverage, not complete customer demand. N/A remains available even for items with no worklogs; Jira populations are never restricted through worklog coverage when Client is unrestricted.

Capacity has no validated customer allocation. The six general source KPI cards, workforce capacity, and the two full-source Delivered Features KPIs retain their existing filter scope; they must not be interpreted as Client-specific measures. No unrelated KPI definitions or layouts were changed.

## Validation performed

Compared against a fresh pre-change build from the **same** current source CSVs:

| Conserved measure/population | Before = after |
| --- | ---: |
| Governed worklogs (each worklog dataset) | 32,934 |
| Governed Tempo Logged Hours (each worklog dataset) | 52,013.029 |
| Jira items (backlog and demand separately) | 2,238 |
| Remaining Estimate hours | 44,636.1001 |
| Weekly capacity rows | 2,014 |
| Existing fixed-source Actual Hours | 57,619.932 |

Every record field other than the replaced legacy Client storage and new attribution fields was compared row by row. Estimates, effort caps, demand, source KPIs, capacity, teams, skills, assignees, statuses, programs and release records are unchanged. Source Actual Hours remains the existing raw-source measure; it is distinct from governed logged hours after exclusions. Customer partitions reconcile to the unrestricted logged total, without duplicating worklogs or Jira items.

Automated checks:

- `python -m unittest discover -s scripts -p 'test_*.py'`: **13 tests passed**, including exclusions and six customer-attribution tests. Synthetic cases cover multiple accounts for one customer, conflicting account keys, different customers on one issue, incomplete evidence, normalized keys, missing schema and no parent/Jira fallback.
- `node scripts/verify_client_customer_filter.cjs` (Playwright on a local server): **passed**. Both value lists exactly match the validated customer population plus N/A. HK DIR, OAT, N/A and multiple selections reconcile at every Portfolio filtering entry point and in Demand actual/demand datasets. Team, Assignee, Skill, Account, Priority, Status and Target Release intersections preserve their existing conditions. All four Portfolio detail tabs render; selected CSV snapshots match the filtered account report. Select All, Clear All and reset reconcile to the original population. Epic workflow counts reconcile (HK DIR: 67; N/A: 165); capacity and fixed KPIs remain unchanged. No page runtime errors or unexpected console errors were reported; the pre-existing treemap diagnostic below is recorded separately.
- `node scripts/validate_delivery_progress_team_ownership.cjs`: **passed**, retaining Jira ticket-team ownership, including ADF-2326 under Integration rather than Nexus.
- JavaScript syntax checks and `git diff --check`: **passed**.
- Desktop and narrow-width screenshots were inspected; the existing charts, details and Client controls render. No layout/CSS changes were made.

The pre-existing broad `verify_bi_app_chrome_cdp.mjs` runner was attempted before implementation but did not emit a result and was stopped. It is not counted as a pass. The focused Playwright suite above completed the Client acceptance checks; no regression was found in completed checks. Unperformed broad-suite checks are not claimed as validated.

An expanded console check identified the existing `Account Distribution total mismatch` diagnostic during reflow. Replaying the saved pre-change `app.js` against the same conserved data reproduced it: expected 50,634.882 versus rendered 50,632.632 hours (2.25 hours omitted from tiny treemap tiles). Some full-page captures reported a 6.75-hour difference. Underlying data, customer partitions, and CSV totals reconcile. The focused suite records these specific known diagnostics separately and fails on other console errors. The treemap geometry was not changed because it is unrelated to Client attribution. This existing visual limitation remains open.

## Modified files

- Data and runtime: `scripts/build_web_data.py`, `web/dashboard-core.js`, `web/app.js`, `web/demand.js`.
- In-app source definitions: `web/index.html` (Datasources prose only; pre-existing user edits retained).
- Governance: `docs/governance/Data_Dictionary.md`, `docs/governance/Semantic_Visualization_Governance.md`, `docs/governance/Calculation_Governance.md`.
- Filter documentation: `docs/user-guides/Chart_and_Visual_Specification.md`, `docs/user-guides/User_Guide.md`.
- Tests: `scripts/test_tempo_customer_attribution.py`, `scripts/verify_client_customer_filter.cjs`.
- This validation record. Local payload/manifest were regenerated; unrelated existing report scripts and user changes were preserved.

To rerun browser validation, serve `web/` on loopback port 8766 (or set `DASHBOARD_URL`), make Playwright available through `NODE_PATH`, and run `node scripts/verify_client_customer_filter.cjs`. Local evidence and screenshots are written to `.tmp/client_attribution/`.
