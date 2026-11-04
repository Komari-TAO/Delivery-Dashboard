# CH-004 Step 3 — proposed Data Dictionary validation

Date: **2026-11-03** (Europe/Madrid). Status: **documentation proposal complete; governance approval pending**. Step 4 has not started.

Deliverable: [Data_Dictionary_CH004_vNext.md](../governance/Data_Dictionary_CH004_vNext.md).

Exact local path: `C:/AI Projects/Codex_MVP/docs/governance/Data_Dictionary_CH004_vNext.md`.
Report path: `C:/AI Projects/Codex_MVP/docs/audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md`.

## 1. GitHub authority and repository verification

Configured fetch/push remote: `origin`, [Komari-TAO/Delivery-Dashboard](https://github.com/Komari-TAO/Delivery-Dashboard).

`git fetch origin` succeeded. Its first sandboxed attempt could not write `.git/FETCH_HEAD`; the authorized fetch was then executed with the required filesystem permission and completed successfully. This was not a GitHub access failure. No merge, rebase, reset, branch switch, commit or push occurred.

| Reference | Exact commit |
| --- | --- |
| Local working branch / HEAD, `feature/initial-dashboard-import` | `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a` |
| Fetched `origin/feature/initial-dashboard-import` (remote default) | `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a` |
| Fetched `origin/dashboard-functionality` | `5da8adb0c866638950cbd3fbe20f23448f91e31c` |
| First committed v0.3 checkpoint / repository import | `0280c186edb2425c76c2768193daf4de1b13c8a0` |

The expressly requested [BASELINE_v0.3_2026-07-01.txt](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/BASELINE_v0.3_2026-07-01.txt) remains the historical checkpoint: v0.3, dated 01-Jul-2026, using June 30 data. Its blob is `c097a083d6b3ed6193ced685bf4c0896bbc3b7f2` in both import and pinned review commits. No later baseline was substituted or modified. The import commit date is October 6; there is no claim that it is a July 1 Git commit.

Canonical documents were fetched through the GitHub connector and pinned to review commit `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a`, then compared with fetched Git objects and disk. Exact document blobs and last-changing commits are listed in the proposal's provenance table. Reviewed documents:

- `BASELINE_v0.3_2026-07-01.txt`.
- `docs/governance/Data_Dictionary.md`.
- `docs/governance/MVP_Business_Rules.md`.
- `docs/governance/KPI_Definitions.md`.
- `docs/governance/Semantic_Visualization_Governance.md`.

The current committed canonical directory is `docs/governance/`, despite v0.3's historical `docs/` paths. Also inspected local `Calculation_Governance.md`, Chart and Visual Specification's affected sections, Client/Account audit reports, current source transformations, Account Distribution tests, runtime code and HTML, current manifest and sync-state metadata.

### Local versus GitHub and historical differences

The v0.3 checkpoint is byte-identical locally and remotely. All four local canonical Markdown files equal the pinned GitHub text after CRLF/LF normalization; differences in file bytes are line endings only. None has a working-tree modification.

The original imported dictionary is not text-identical to today's committed dictionary. Between import `0280c186...` and review `3ca6ef0...`, pre-existing changes added Client/Tempo Account and the Client `N/A` exception, changed Bug Severity scope, and removed dedicated Bug Triage definitions. Business Rules gained annual workforce rules and lost the older Bug Triage text; Semantic Visualization Governance was substantially condensed; KPI Definitions and v0.3 baseline are unchanged. These are historical repository differences, not edits introduced by Step 3. No unrelated definition was removed from the pinned starting dictionary by this proposal, and no historical removal was silently restored or newly approved. Commit recency is not evidence of governance approval; the unresolved authority/history issue is G7.

### Pre-existing local changes preserved

At entry:

```text
 M scripts/verify_account_distribution.cjs
 M web/app.js
 M web/index.html
 M web/styles.css
?? scripts/verify_tempo_account_filters.cjs
```

These files contain Step 2, beyond committed HEAD. They were inspected as implementation evidence and preserved byte-for-byte. Step 2 is not represented as committed on GitHub. Production/source/payload/governance hashes were captured before documentation edits for final comparison.

## 2. Semantic comparison: old and proposed

| Subject | Pinned canonical dictionary / wider existing documentation | Proposed CH-004 description |
| --- | --- | --- |
| Client | Verified Tempo `Account Customer`, `tempoCustomerAccount`; global unresolved `N/A`. | Retains rule; adds complete direct-issue evidence, Jira-only implications, treemap `-`, global selection and grouping behavior. |
| Tempo Account | Key/name fields listed separately from Jira Account, without full sidebar activation contract. | Sidebar `Account` uses trimmed key identity, name/key display, explicit missing bucket, and independent active flag. Equal names do not merge distinct keys. |
| Jira Account | Canonical field called `Account`, with direct/immediate-parent attribution. | Retained as explicitly qualified Jira Account metadata; payload `account`, mandatory-field rule, exceptions and fallback unchanged. |
| Reporting Account | No separate canonical entry; legacy control combines Jira Account and Tempo Account Name labels. | Names existing compatibility dimension and documents source-dependent predicates, grouping, blanks, consumers and limitations. Does not establish a new Account master or bridge. |
| Account Distribution | Jira-attribution rule in Business Rules differs from implemented Tempo visual; visual spec describes embedded selectors. | Records current sidebar controls, key-based Account grouping, positive-hour nonoperational tiles, common footer population, independent Reporting Account and ignored Status. Conflicts retained explicitly. |
| Other definitions | Existing Team/Skill, effort, Capacity, dates, Status, hierarchy, forecast/allocation, exclusions and Backlog. | Retained. No KPI formula, demand population, workforce scope or Jira ownership change. |

The proposal includes version history, precise GitHub versions, source ownership and cardinalities, validation snapshot/provenance, function/test traceability, and open questions. It preserves the original dictionary. The label `Account` now requires source qualification: Tempo sidebar Account versus retained Jira Account metadata; the document does not rename the `account` payload property.

## 3. Implementation-to-documentation consistency

| Check | Result |
| --- | --- |
| Raw Client `Account Customer` -> `tempoCustomerAccount`, with verification status | Matches `resolve_tempo_customers()` and `DashboardCore.clientValue()`. |
| Raw Account `Account Key` / `Account Name` -> `tempoAccountKey` / `tempoAccount` | Exact names verified in builder and raw-to-payload audit. |
| Client ownership / Jira-only demand | Tempo verified direct evidence only; `N/A` retained; no Jira Client/Account/parent inference, estimate split, or unlogged-demand loss. |
| Identity / duplicate names | Encoded trimmed key identity; duplicate names stay separate in new Account visual. Legacy Reporting Account remains label aggregation. |
| Missing values | Missing key `[""]` and treemap `-`; global Client `N/A`; legacy Reporting `(blank)` and display `No Account / Missing Account` distinguished. |
| Filter activation | `tempoAccountsActive` distinguishes inactive empty All from explicit All, including active empty Set; clear/reset deactivate. Client Set independently controls grouping. |
| Treemap controls and grouping | No embedded dropdowns; Client/Account sidebar selections and intersection drive Account grouping; reset returns to Client. |
| Account options / Select All | Uses rendered, search/scoped option values; preserves selected keys outside changed scope; does not widen intersection or wildcard future Accounts. |
| Scope / footer | Common managed, nonexcluded Tempo population for all three footers; all applicable existing predicates except Reporting Account and Jira Status; Tempo Account applied separately. |
| Operational effort | Excluded from tiles by shared key classifier; included in applicable Total/Operations footers, not classified by customer name. |
| Reporting consumers | Existing Jira-account governed effort, Tempo-name report aggregation, Jira detail/demand paths and CSV retain their source-dependent meanings. |
| Source ownership / six teams | Tempo effort/Client/Account; Jira delivery metadata; Assignees workforce; Weekly Capacity; Master Date. Authoring, Delivery Express, Integration, Nexus, Portal, Scoring retained. |
| Positive aggregate boundary | Existing `logged > 0` bucket filter documented; current reconciliation passes, no untested negative-adjustment policy asserted. |

Assessment: the proposed affected definitions match the inspected local Step 2 implementation and completed focused tests. This is not a declaration that all pre-existing governance conflicts or all dashboard regressions are resolved.

## 4. Source snapshot and provenance

Authoritative Tempo source: `data/raw/RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv`. Payload date range: 2026-01-02 through 2026-10-30; reporting current date: 2026-10-30.

| Manifest source | SHA256 verified against disk |
| --- | --- |
| Tempo worklogs, October 30 | `E57886118D0E40E409B7E4A1FD04EE0B0A4440AC8D934CD4952E39C0AA7CF08F` |
| Jira PI backlog, October 30 | `6E27430C1B712C369518427493F9FF0232880C8AEB153A2252583F1B8A7C5760` |
| `20261028_Assignees_Capacity.csv` | `B774136A5517EFB1039C8E9BF4A6E81A53BFB6B25896705644766F72FC72D9C2` |
| `Weekly Capacity_20261028.csv` | `CBB43B6BE216534C76F1DB7B16B81CEFAC3C3077903FDEB60D19043BE57F6376` |
| `Google 2026 to 2028_Master_Date.csv` | `5A5338279C05EE5E2A7ED0BF7800D3865F240F9343C1E9A0CB9B616D29BC4123` |
| `Release Cycle.csv` | `CC0E9CDDD157728289166F83AB5380B2E0CD737869C9D519615357D2BD95DD52` |
| `Promoters.csv` | `78003388EA130490934DD8E4C4D50E623CDBA1B53C0C87ED68A545D0A8770FE1` |
| `Support hours 2026.csv` (reconciliation only) | `446EEC8792945DD05D88D330E7779BA4EBE49ADCA918670277A11B48A304302F` |
| `tempo_operational_mapping.csv` | `C2847510B266230291A7F7658BDCACA8AE4B4238BFD4421698C681C18286FE7F` |

| Reviewed implementation/build artifact | SHA256 |
| --- | --- |
| `scripts/build_web_data.py` | `523385C790793F19BEE65E76316757F53B7B6564317620D5BFD95D74E223CCFD` |
| `scripts/governed_exclusions.py` | `F101CBED05E4BF6F4F55077310CDD5893DA44880F95B630A78169EE90362E617` |
| Current `web/app.js` | `7C16B5444218625FAE1A1F95F9D95966A9039C92A923A0F5795FADDE25379F45` |
| Current `web/index.html` | `6E728D7C02E78EFD90561358EAC9D142E098942FB07478FDA837181937DC3CD8` |
| `scripts/verify_tempo_account_filters.cjs` | `60E06AECFD46CCBE7590D4E733F8FE9B0FCD28657F992C15815898F913442E22` |
| `web/build-manifest.json` | `D22B56C3EBFB2178D2FC18DF6F8B7A431F801E95247C469A9B17CC11DF8ADCD2` |
| Final `web/data.js` file bytes | `990459AD4E8E5E9E7EB981DC004C086152B0E1F31B32577314297FA7382EA5E5` |
| Saved Step 2 `before-app.js` | `16C83B440E969501A1F07A572787D0D1DDE8BE8AEDC45726C79A0CAC3074582C` |
| Saved Step 2 `before-index.html` | `4AA7234DAEB664AE74DB78D27B58C3505A912461A19AD96D7269308B154F8CF9` |

The manifest's frontend hash equals saved `before-app.js`, not current Step 2 `app.js`. All nine source hashes plus builder/exclusion-script hashes match. The unsigned-payload digest was recomputed using the builder's serialization after removing embedded `payloadSha256`: `C5FBE6134A27338B9C1427CD0E3AEA859C5ED802751540C07B416B96CC1F2426`, **PASS**. It is intentionally not a final-file-byte digest.

`data/.dashboard_sync_state.json`, dated 2026-10-30T07:16:03.0342659Z, still names `rollback-single-team.csv` and an older weekly-capacity checksum. It is historical provenance, not the current source authority. No build or sync script was run; manifests, sync state and payload remain unchanged.

### Reconciliation actually observed

| Measure | Hours |
| --- | ---: |
| Managed Logged Total | 51,806.039 |
| Operational Tempo | 8,263.271 |
| Nonoperational/customer-account | 43,542.768 |
| Client grouping, including unresolved | 43,542.768 |
| Account Key grouping, including missing key | 43,542.768 |
| Unverified Client nonoperational hours (included above) | 427.116 |
| Missing Account Key nonoperational hours (included above) | 304.533 |

Values are evidence for this snapshot, not constants. Raw-to-payload source-order comparison passed for five fields. Raw: 38,035 worklogs; excluded: 4,651; governed valid-date: 33,384; managed: 32,668. Both payload projections have 33,384 rows and must not be summed. Missing/repeated raw Tempo Worklog IDs: 0/0; IDs are not retained in payload. There are 74 verified Account/customer mappings, two missing-customer keys, no conflicting mappings. All five governed exact excluded keys remain unchanged. Grouping by Client and key conserves the same nonoperational population without joins/fan-out or Jira-based exclusion. Missing buckets remain included.

## 5. Validation executed and evidence limits

| Check executed during Step 3 | Actual result |
| --- | --- |
| Existing `.tmp/ch004_source_audit.py` | PASS, exact source/payload comparisons and reconciliation above. |
| `python -m unittest discover -s scripts -p test_tempo_customer_attribution.py` | PASS, 6 tests. |
| `python -m unittest discover -s scripts -p test_global_tempo_exclusions.py` | PASS, 7 tests. |
| `node --check web/app.js` and `node --check scripts/verify_tempo_account_filters.cjs` | PASS. |
| `node scripts/verify_tempo_account_filters.cjs`, with `CH004_BEFORE_DIR=.tmp/ch004-step2` | PASS, 21 scenarios, eight comparison entries, zero browser errors. |
| Proposed-versus-pinned-dictionary retention and Markdown checks | PASS; original 21 sections retained; Sections 1, 2 and 5–21 text-identical; unaffected canonical field/type rows and all legacy attribution paragraphs retained. Local links resolve, code fences balance, no trailing whitespace. |
| Pre-existing content preservation / Git state | PASS; all 99 captured pre-existing files retain SHA256; HEAD/branch unchanged; only two new tracked-candidate documents. |

The Python executable used was the bundled runtime at `C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`; `python` was not on PATH. Playwright was supplied via `NODE_PATH` from that runtime's `dependencies/node/node_modules`; no dependency installation was needed. The browser harness serves the existing files on loopback and uses installed Chrome headlessly.

The 21 browser scenarios cover default Client grouping; Reporting Account independence; single/multiple/All Clients; single/multiple/explicit-All Accounts; intersection; clearing Account while retaining Client; reset; Client tile click; Account keyboard action; clear Account chip; Team, Assignee and Date scope; synthetic duplicate names/missing attribution/Operations/exclusions; missing Client default grouping; active empty Account Set; and mobile bounds. The empty-Set edge is set through the harness state hook; no claim is made that a physically empty UI's Select All button was exercised.

Before/after checks compare seven representative Reporting Account states using context, unrelated charts, KPI cards, details, Demand DOM, options and exact CSV fingerprints, plus all **83** Reporting Account row populations. Saved before-files are local Step 2 evidence, not GitHub commits; hashes are recorded above. The exhaustive row-population comparison uses the existing harness fingerprint method, not a formal proof for every possible filter combination. Focused tests do not establish full Demand workflow or full legacy dashboard sign-off. Broader browser/capacity suites were not rerun for this documentation-only change. Historical 117-scenario embedded-filter results are not claimed as current execution.

Current focused evidence: `.tmp/ch004-step2/validation.json` SHA256 `A08AC5184CBEF7503107175A13339D999D9BE206E31EB6365418CD0FF1AAE1DF` (21 scenarios/eight comparisons/zero errors). Older retained `reporting-before-after.json` SHA256 `211EF8D16AAEE9F8273886D009A821D77C1828F81CB5A801CEF00E0C97751761` contains 18 scenarios/eight comparisons/zero errors. Existing source audit JSON and focused browser JSON/screenshots were refreshed only as ignored validation evidence.

## 6. Remaining governance conflicts

- **G1:** Business Rules Section 13 still restricts treemap eligibility to Jira Account-attributed engineering and describes an exception-only footer; Calculation Governance also places unresolved Jira Account work outside the tiles. Actual CH-004 visual uses Tempo identity and three footer totals. Existing Jira attribution rules are preserved, not silently replaced.
- **G2:** Other documents still use the old Account label and embedded-control/footer descriptions. This proposal documents the source-qualified labels and actual behavior; no other governance revision was created.
- **G3:** Broad KPI global-filter language conflicts with fixed-source/annual KPI exceptions and Status-independent effort. Tempo Account currently scopes only Account Distribution. Existing formulas remain unchanged.
- **G4:** No authoritative cross-source Account bridge, effective-dated customer master or rename history is supplied. Worklog evidence does not establish Jira ownership.
- **G5:** Frontend manifest/sync-state metadata and older audit narratives are stale relative to Step 2. They were documented, not repaired.
- **G6:** Nonpositive aggregate-hour buckets are filtered by existing code; this snapshot reconciles, but future negative-adjustment conservation is not signed off.
- **G7:** Historical import versus current canonical differences and the baseline's dated paths/snapshot do not prove an approval chronology. Both exact versions are traceable; later history is not treated as automatic supersession.

The proposal is consistent with current Step 2 on the requested dimensions, while governance approval and broader documentation alignment remain pending. No new business rule was implemented to resolve any conflict.

## 7. Final working-tree and change boundary

Files created by Step 3:

1. `docs/governance/Data_Dictionary_CH004_vNext.md` — proposed local revision.
2. `docs/audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md` — this validation report.

Final Git status:

```text
 M scripts/verify_account_distribution.cjs
 M web/app.js
 M web/index.html
 M web/styles.css
?? docs/audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md
?? docs/governance/Data_Dictionary_CH004_vNext.md
?? scripts/verify_tempo_account_filters.cjs
```

The five pre-existing implementation/test paths are unchanged from entry. The original dictionary, all other canonical governance documents, authoritative baseline, application code, tests, raw sources, generated payload and manifest were not modified. Temporary ignored documentation verification artifacts were created under `.tmp/`: initial hash inventory, retention validator, dictionary comparison diff and validation JSON. Existing ignored source-audit/browser evidence was refreshed by running existing checks; no application or test source was edited.

Remote refs/FETCH_HEAD were refreshed by the requested fetch. HEAD, index and working branch were not changed; nothing was staged, committed, pushed, merged, rebased or reset. **Step 3 stops here. Explicit approval is required before Step 4.**
