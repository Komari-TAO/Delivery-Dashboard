# CH-004 Step 4 — governance alignment validation v1

Date: **2026-11-03, Europe/Madrid**. Result: **local documentation proposal set complete; canonical promotion pending review**.

Seven versioned proposals and two audit documents were created. G1 is resolved by the user's supplied scoped Delivery Management approval, G2/G3 corrections are reflected in the proposals, and G4–G10 retain their assessed limitations/exception status. No application behavior or calculation changed.

## 1. Repository, authority and execution boundary

Local repository: `C:/AI Projects/Codex_MVP`; remote `origin`: `https://github.com/Komari-TAO/Delivery-Dashboard.git`. Working/reference branch: `feature/initial-dashboard-import`. Entry and final HEAD: `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a`.

The pinned commit was accessed directly through the GitHub connector (`git/commits/{sha}`), returning that exact SHA and tree `e94aadd343708063953efeeaab06e7dbe576e10e`. All seven required canonical documents were retrieved with `fetch_file`, explicit pinned ref and base64 encoding into ignored `.tmp/ch004-step4/` scratch copies. Retrieved bytes equal `git show {sha}:{path}`; computed Git blob hashes match the pinned objects. Local canonical documents equal those texts after CRLF/LF normalization. No substitute reference was used. No branch switch, fetch, merge, reset, rebase, stage, commit or push was performed for Step 4.

Historical `BASELINE_v0.3_2026-07-01.txt` remains unchanged and matches pinned blob `c097a083d6b3ed6193ced685bf4c0896bbc3b7f2`. It is the July 1 checkpoint with June 30 data, first imported at `0280c186edb2425c76c2768193daf4de1b13c8a0`; the import date is not the checkpoint date. No historical baseline was replaced or upgraded.

Entry working-tree status:

```text
 M scripts/verify_account_distribution.cjs
 M web/app.js
 M web/index.html
 M web/styles.css
?? docs/audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md
?? docs/governance/Data_Dictionary_CH004_vNext.md
?? scripts/verify_tempo_account_filters.cjs
```

These seven existing changed/untracked paths were preserved byte-for-byte. In particular, Step 2 is local/uncommitted implementation evidence, not code claimed to exist at the pinned GitHub commit. Step 3 vNext and its audit are present and preserved. No existing CH004_v1 output collision was found before creation.

## 2. Scoped governance decision and finding dispositions

Approval source: the explicit **G1 approval** and Step 3.1 dispositions in the user's Step 4 request, attached at `C:/Users/User/.codex/attachments/3c601050-42e2-42f4-9fe7-6e549dfec651/Pasted text.txt`. No separate repository approval record or complete Step 3.1 G1–G10 register was located; Step 3 itself records G1–G7. This report records the supplied decision without inventing an earlier approval date, approver identity or chronology.

> The implemented CH-004 Tempo-based Account Distribution contract supersedes the previous Jira Account-restricted treemap eligibility and exception-only footer rules for Account Distribution only.

| Approved Account Distribution behavior | Recorded contract |
| --- | --- |
| Client | Verified Tempo Account Customer (`Account Customer`). |
| Account | Tempo Account Key identity; Account Name display. |
| Inactive default | Client distribution. |
| Active Client | Associated Account distribution. |
| Active Tempo Account | Selected Account distribution. |
| Explicit All Accounts | Account distribution over stored rendered option keys; search/scope can limit options. |
| Combined Client/Account | Intersection; does not widen scope. |
| Both reset | Client distribution. Clearing Account alone retains Account grouping if Client remains active. |
| Reporting Account | Independent existing mixed-source compatibility filter; no treemap predicate. |
| Tiles | Governed managed nonoperational Tempo effort, including explicit missing-attribution buckets. |
| Footer | Total Logged, Operational Tempo, Customer/Account effort in one applicable filtered scope. |
| Jira Account diagnostics | Retained as separate diagnostic partition and metadata rules. |

This approval applies exclusively to Account Distribution. It does not modify existing application calculations, Jira reporting/demand, global exclusions, Team semantics, parent-child inheritance, Status semantics, capacity or other visualizations. G2/G3 wording corrections describe existing consumers and measures; they do not retroactively approve historical changes.

| Finding | Disposition after Step 4 |
| --- | --- |
| G1 | Resolved by supplied scoped Delivery Management approval; candidates align the visual only. |
| G2 | Obsolete Account terminology/embedded controls corrected in proposed documents. Canonicals remain pending review. |
| G3 | Consumer/measure applicability clarified, including current annual cards, full-source exceptions and Status-independent effort. No formula change. |
| G4 | Known limitation: no authoritative Jira/Tempo bridge, effective-dated customer master or rename history. Matching names prove nothing. |
| G5 | Known limitation: frontend manifest hash predates Step 2; sync-state metadata and historical narratives differ. Neither repaired. |
| G6 | Known limitation: positive aggregate bucket rendering exists; negative/nonpositive adjustment conservation is not fully governed or validated. Current snapshot reconciliation does not close it. |
| G7 | Known limitation: historical approval chronology incomplete; import/current differences and recency do not establish approval. |
| G8 | Separate technical issue: builder ISO-week/weekday fallbacks conflict with exclusive Master Date governance. Unapproved implementation exception requiring separate remediation, unchanged here. |
| G9 | Known limitation: supporting historical capacity replay evidence/source snapshots unavailable; no replay assurance claimed. |
| G10 | Known limitation: broad historical regression assurance incomplete. Focused tests/document checks are not full historical acceptance. |

## 3. Document inventory and exact source versions

All GitHub links below are pinned to `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a` on the requested reference lineage; the canonical files have no internal numbered release. Exact source versions are the Git blobs, not a fabricated release number. The dictionary v1 uses preserved Step 3 vNext as its working draft; the other six start from unchanged local canonical text, verified equal to GitHub.

| Canonical source / pinned GitHub reference | Exact blob / last-changing commit | New local versioned proposal | Updated sections and reason |
| --- | --- | --- | --- |
| [docs/governance/Data_Dictionary.md](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/Data_Dictionary.md) | Blob `88bd711d4973b9aca5dfbd0352e16e1aaf209199`; commit `5da8adb0c866638950cbd3fbe20f23448f91e31c` | [docs/governance/Data_Dictionary_CH004_v1.md](../governance/Data_Dictionary_CH004_v1.md) | Provenance; §§2–4; §§22–27 (including G1–G10). Versioned Step 3 successor; resolve scoped G1, correct semantic buckets/types and record limitations. |
| [docs/governance/MVP_Business_Rules.md](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/MVP_Business_Rules.md) | Blob `440f13b1681fde54ebbaa7833323c98ce3d09b3d`; commit `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a` | [docs/governance/MVP_Business_Rules_CH004_v1.md](../governance/MVP_Business_Rules_CH004_v1.md) | §5; §13 Account-attribution reconciliation. Retain operational totals/Jira diagnostic partition while replacing visualization-only eligibility/footer restrictions. |
| [docs/governance/Calculation_Governance.md](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/Calculation_Governance.md) | Blob `1779af38f4d7caa2b72be1356f83281abc4fe9ac`; commit `5da8adb0c866638950cbd3fbe20f23448f91e31c` | [docs/governance/Calculation_Governance_CH004_v1.md](../governance/Calculation_Governance_CH004_v1.md) | Global Calculation Principles / Client attribution; Global Filters and KPI applicability; interim and visual Account Distribution; Account Table wording. Align affected visual/source descriptions and consumer-specific applicability; preserve formulas and table behavior. |
| [docs/governance/KPI_Definitions.md](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/KPI_Definitions.md) | Blob `a61a385ee8224341c94ff829c711a2d2ed4234f6`; commit `0280c186edb2425c76c2768193daf4de1b13c8a0` | [docs/governance/KPI_Definitions_CH004_v1.md](../governance/KPI_Definitions_CH004_v1.md) | §7; §17. Separate Jira attribution diagnostics from Tempo visual population; replace universal filter wording. |
| [docs/governance/Semantic_Visualization_Governance.md](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/Semantic_Visualization_Governance.md) | Blob `721ffc7b983176a4dedd1f3dfe28e88b3cedfbb6`; commit `5da8adb0c866638950cbd3fbe20f23448f91e31c` | [docs/governance/Semantic_Visualization_Governance_CH004_v1.md](../governance/Semantic_Visualization_Governance_CH004_v1.md) | Core principles; General KPI cards; Portfolio; Demand Management; Interaction and accessibility. Document implemented sidebar/grouping/reset/keyboard behavior and source/consumer separation. |
| [docs/user-guides/Chart_and_Visual_Specification.md](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/user-guides/Chart_and_Visual_Specification.md) | Blob `058c0c590547de3d1a2f75624f86a0359536c743`; commit `3ca6ef0393f119582792bf5b4f2aec4c3873bf4a` | [docs/user-guides/Chart_and_Visual_Specification_CH004_v1.md](../user-guides/Chart_and_Visual_Specification_CH004_v1.md) | Sidebar; Account Distribution explanation/fields/filters/rules; Portfolio exact lineage and strict ledger. Remove obsolete embedded controls and split footer scope; retain exact lineage with dated entries qualified. |
| [docs/user-guides/User_Guide.md](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/user-guides/User_Guide.md) | Blob `509da0db5928246d6845a4a792ec82a615942b3d`; commit `5da8adb0c866638950cbd3fbe20f23448f91e31c` | [docs/user-guides/User_Guide_CH004_v1.md](../user-guides/User_Guide_CH004_v1.md) | Workspace layout; General KPI cards; Portfolio; Limits and good practice. Explain actual filter interaction, grouping, reporting/export independence and current card applicability. |

Every candidate is a local proposal with a consistent `_CH004_v1.md` suffix. Data Dictionary v1 supersedes vNext only as the current Step 4 review draft; neither is promoted to canonical status. [Cross-document change matrix](CH004_STEP4_GOVERNANCE_CHANGE_MATRIX_v1_2026-11-03.md) records previous/proposed definitions and marks every calculation/application change **No**.

## 4. Cross-document consistency review

| Acceptance check | Result / interpretation |
| --- | --- |
| 1. Client definition | Consistent verified Tempo `Account Customer`, not Jira Client, legacy Tempo Client or Account Name. |
| 2. Account identity | Trimmed Account Key; Name display only; equal names do not merge keys in the treemap. Missing key is explicit. |
| 3. Reporting Account | Separate legacy label compatibility, consumer-specific native Tempo Name / Jira Account predicates. Same label can select different populations. |
| 4. Jira diagnostics | Existing Account-attributed engineering + exception + operational partition formula preserved, including direct/immediate-parent boundary. |
| 5. Treemap eligibility | Governed managed nonoperational Tempo worklogs, without Jira Account eligibility gate; missing buckets retained. |
| 6. Operations versus footer | Operational effort excluded from tiles, retained in applicable Total/Operations footer totals; no exclusion classifier changes. |
| 7. Grouping/reset | Default Client; active Client or Tempo Account gives Account; intersection; both cleared restores Client. |
| 8. Explicit Select All | Activates Account grouping and stores rendered option keys; inactive All is different. An active empty set matches none. |
| 9. KPI preservation | Formula/code blocks unchanged; unrelated KPI sections retained. Current annual-card descriptions use the existing card contract, not new formulas. |
| 10. Consumer-specific filtering | Tempo Account only treemap; Reporting Account existing report/export consumers; Client supported consumers; governed logged effort ignores Status. Full-source and annual exceptions explicit. |
| 11. Workforce Team | Assignees CSV remains authoritative; six-team scope, ownership/activity exceptions and Engineering allocation distinctions unchanged. |
| 12. Hierarchy | Direct Jira Account first; immediate parent only for absent direct extract row and valid parent; present blank is an exception. No recursive or customer/Account inheritance introduced. Existing demand hierarchy remains unchanged. |
| 13. Calendar | Master Date remains exclusive reporting-week/workday authority. G8 fallback is an unapproved exception, not business logic. |
| 14. Limitations | G4–G10 retained as above, with G8 separate remediation. No historical sign-off inferred. |
| 15. Traceability | Exact current affected CSV column headers checked; local implementation function anchors re-inspected; seven remote/local comparisons and formula retention checks pass. |

The new drafts consistently distinguish effort attribution, source ownership, reporting compatibility and Jira metadata. No Jira-only demand is assigned to a Tempo Account without evidence. No Client-specific capacity or complete customer-demand coverage is implied. The same worklog population is not duplicated by summing `worklogs` and `backlogWorklogs` projections.

Source ownership retained:

| Business concept | Authority |
| --- | --- |
| Tempo logged effort | Tempo |
| Client | Tempo Account Customer |
| Tempo Account | Tempo Account Key / Account Name |
| Jira Account metadata | Jira |
| Workforce metadata | Assignees CSV |
| Weekly capacity | Weekly Capacity |
| Reporting calendar | Master Date |

## 5. Snapshot reconciliation and evidence limits

The existing Step 3 raw-to-payload audit and focused browser evidence were inspected, not refreshed or overwritten. A read-only in-memory sum of the existing payload confirms the same unfiltered managed snapshot:

| Measure | Hours |
| --- | ---: |
| Total Logged | 51,806.039 |
| Operational Tempo | 8,263.271 |
| Customer/Account effort | 43,542.768 |
| Client grouping, including unresolved | 43,542.768 |
| Account Key grouping, including missing key | 43,542.768 |
| Unverified Client nonoperational effort, included above | 427.116 |
| Missing Account Key nonoperational effort, included above | 304.533 |

Grouping alone changes no eligible worklog population. Applying Client/Account selection can change populations and all three displayed footer totals. Reporting Account may describe a different population because it preserves mixed-source semantics. The positive aggregate snapshot reconciles; these figures are not permanent KPI definitions or formula constants. No historical reconciliation/replay is claimed without supporting source snapshots.

Tempo source: `data/raw/RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv`; payload reporting date 2026-10-30, worklog coverage 2026-01-02 through 2026-10-30. Prior raw audit: 38,035 source rows, 4,651 exact-key excluded rows, 33,384 governed valid-date rows, 32,668 managed rows; payload projections are alternative views, not additive streams.

Existing `.tmp/ch004-step2/validation.json` contains 21 focused scenarios, eight comparison entries, all 83 Reporting Account label populations and zero browser errors. The preserved Step 3 audit records six customer-attribution and seven exclusion tests passing. Those are prior executions, not rerun Step 4 tests. The historical 117 embedded-control scenario suite is not current Step 4 evidence. No full dashboard, Demand workflow, capacity replay or broad historical acceptance is claimed.

## 6. Implementation/source traceability and preserved hashes

Local Step 2 code anchors (not GitHub pinned implementation claims):

| File | Line | Function / contract evidence |
| --- | ---: | --- |
| `web/app.js` | 289 | `inSelectedAccount()` |
| `web/app.js` | 381 | `filteredData()` |
| `web/app.js` | 461 | `governedLoggedWorklogRows()` |
| `web/app.js` | 503 | `buildUpdateContext()` |
| `web/app.js` | 762 | `renderTempoAccountFacet()` |
| `web/app.js` | 1008 | `renderKpis()` |
| `web/app.js` | 1169 | `renderCharts()` |
| `web/app.js` | 1584 | `renderAccountTreemap()` |
| `web/app.js` | 1681 | `tempoTreemapClient()` |
| `web/app.js` | 1685 | `tempoTreemapAccount()` |
| `web/app.js` | 1690 | `accountDistributionRows()` |
| `web/app.js` | 2380 | `addTreemapSummary()` |
| `web/app.js` | 3374 | `groupAccounts()` |
| `web/app.js` | 3706 | `downloadSnapshot()` |
| `web/app.js` | 3735 | `bindFacetPicker()` |
| `scripts/build_web_data.py` | 380 | `apply_master_date_week()` |
| `scripts/build_web_data.py` | 401 | `resolve_tempo_customers()` |
| `scripts/build_web_data.py` | 460 | `jira_customer_attribution()` |

Sidebar markup is `web/index.html:131–154` (Tempo Account and Reporting Account), and current Datasources lineage is at line 525. `web/app.js:3742` activates explicit All; Clear All deactivates at line 3748; Reset deactivates at line 3824. `scripts/verify_tempo_account_filters.cjs` covers single/multiple/All selections, intersection, clear/reset/chip, keyboard, duplicate names/missing attribution, scoped footers, active-empty set and mobile bounds. `scripts/verify_account_distribution.cjs` is its compatibility entry point. `web/annual-kpis.js:5` and `web/app.js:1008` retain annual calculation/rendering scope; inspected for G3 only.

Source headers verified: Tempo Account Customer/Key/Name, Work Item Key, Work date, Logged/Billable Hours; Jira Issue key/Custom field (Account); Assignees Assignee/Team/Skill; Weekly Capacity Week Number/Planned Hours; Master Date Master Date/Week Number/WeekDay Name. Dated October 7/9/22 source rows in unrelated preserved Chart Specification sections are historical lineage; new affected rows identify current October 30 sources. The controlling existing annual Portfolio card section overrides older dated KPI mappings. Old `docs/*.md` code-formatted references in Calculation Governance Purpose remain historical path text; actual canonical locations are in this inventory.

| Inspected retained artifact | SHA256 |
| --- | --- |
| `BASELINE_v0.3_2026-07-01.txt` | `1365B16C229FD491D07DEF03509C078B385EEB5C74206DFD59CD29C9DBAB9CF7` |
| `docs/governance/Data_Dictionary_CH004_vNext.md` | `D237B560CCAA8222A9126AAF13FBB86438C466FA1D745F9E9346F531434D2BE4` |
| `docs/audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md` | `2E5F78C09EB0FBDC07FB74E0D0C4C1C494247A459625C7DE4105DB854B3B34AE` |
| `web/app.js` | `7C16B5444218625FAE1A1F95F9D95966A9039C92A923A0F5795FADDE25379F45` |
| `web/index.html` | `6E728D7C02E78EFD90561358EAC9D142E098942FB07478FDA837181937DC3CD8` |
| `web/annual-kpis.js` | `363391A1E15AFF026355B839D5C36DBB408BA07993E3FD2C3DE1AA3DC03C0F24` |
| `web/data.js` | `990459AD4E8E5E9E7EB981DC004C086152B0E1F31B32577314297FA7382EA5E5` |
| `web/build-manifest.json` | `D22B56C3EBFB2178D2FC18DF6F8B7A431F801E95247C469A9B17CC11DF8ADCD2` |
| `data/.dashboard_sync_state.json` | `C092407CFEE2B12B4C2531F7B3D0C6E9EB3669A51C36851E4099B64BC920DE9A` |
| `scripts/build_web_data.py` | `523385C790793F19BEE65E76316757F53B7B6564317620D5BFD95D74E223CCFD` |
| `scripts/verify_account_distribution.cjs` | `E2D46B4F0FEDF532C5B5BC7E07D327E3735E63352680D56B9E43D67C500EC1BA` |
| `scripts/verify_tempo_account_filters.cjs` | `60E06AECFD46CCBE7590D4E733F8FE9B0FCD28657F992C15815898F913442E22` |
| `.tmp/ch004-step2/validation.json` | `A08AC5184CBEF7503107175A13339D999D9BE206E31EB6365418CD0FF1AAE1DF` |
| `.tmp/ch004-source-audit.json` | `0C303BEA9538452239C6D55D252AEF6853D45FEF8D70D27E79618CE229EA1742` |

Current raw source hashes and builder hash match the manifest's source/builder entries. The frontend manifest hash still matches the prior frontend rather than current Step 2 `web/app.js`; sync-state historical capacity/roster naming also remains a documented G5 limitation. Neither manifest nor sync-state was regenerated. Existing source/customer/exclusion test files and browser evidence remain unchanged.

## 7. Documentation checks and remaining conflicts

Executed only documentation/read-only checks:

- Confirmed repository/branch/HEAD/remote and preserved entry Git status.
- Retrieved all seven pinned GitHub documents without touching local canonical files; compared exact bytes to Git objects, source blobs to the pinned tree, and normalized local text to retrieved sources.
- Compared every proposal against both pinned GitHub and current canonical text; generated 14 ignored unified diffs, plus the dictionary predecessor diff. Reviewed affected-section changes and retained content.
- Verified complete source-text reconstruction after reversing the recorded edits; independently checked untouched heading sections and all original fenced formula/code blocks.
- Checked current CSV field headers, source/manifest hashes, function anchors, sidebar markup and retained focused evidence. Recomputed only a read-only snapshot sum from the existing payload.
- Checked Markdown fences, trailing whitespace, local link targets and the new explicit anchor targets; checked consistent proposal status, scope and limitation wording.
- Compared pre/post SHA256 inventories for all pre-existing protected files, plus tracked/visible untracked files. Verified only nine intended new documentation files appear in Git status.

No production/test source, source CSV, transformation, generated payload, dashboard interaction or canonical calculation was modified. No builder, sync process or application regression suite was run for this documentation-only step. Scratch retrievals, hash inventories, comparison diffs and documentation validation scripts/results live under ignored `.tmp/ch004-step4/`; they are review support, not additional authoritative proposals.

Remaining material limits are G4–G10. Canonical documents still contain pre-CH-004 wording because this task expressly preserves them; v1 is the review set for later promotion. Existing unrelated dictionary Purpose overlap and Calculation Governance historical/future demand wording remain outside scope; this approval does not reconcile unrelated demand definitions. Earlier historical audit narratives and stale metadata remain evidence with their original dates, not current visual authority. No additional unresolved contradiction in the affected approved CH-004 contract was found.

## 8. Files created and final working-tree status

- `docs/governance/Data_Dictionary_CH004_v1.md`
- `docs/governance/MVP_Business_Rules_CH004_v1.md`
- `docs/governance/Calculation_Governance_CH004_v1.md`
- `docs/governance/KPI_Definitions_CH004_v1.md`
- `docs/governance/Semantic_Visualization_Governance_CH004_v1.md`
- `docs/user-guides/Chart_and_Visual_Specification_CH004_v1.md`
- `docs/user-guides/User_Guide_CH004_v1.md`
- `docs/audit/CH004_STEP4_GOVERNANCE_CHANGE_MATRIX_v1_2026-11-03.md`
- `docs/audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md`

Final working-tree status (all entry changes preserved; all Step 4 additions untracked proposals):

```text
 M scripts/verify_account_distribution.cjs
 M web/app.js
 M web/index.html
 M web/styles.css
?? docs/audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md
?? docs/audit/CH004_STEP4_GOVERNANCE_CHANGE_MATRIX_v1_2026-11-03.md
?? docs/audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md
?? docs/governance/Calculation_Governance_CH004_v1.md
?? docs/governance/Data_Dictionary_CH004_v1.md
?? docs/governance/Data_Dictionary_CH004_vNext.md
?? docs/governance/KPI_Definitions_CH004_v1.md
?? docs/governance/MVP_Business_Rules_CH004_v1.md
?? docs/governance/Semantic_Visualization_Governance_CH004_v1.md
?? docs/user-guides/Chart_and_Visual_Specification_CH004_v1.md
?? docs/user-guides/User_Guide_CH004_v1.md
?? scripts/verify_tempo_account_filters.cjs
```

All 321 pre-existing protected files and all entry tracked/visible untracked files remain byte-identical. HEAD, working branch and staged diff are unchanged. Nothing was committed or pushed. Step 4 stops at these local proposals; no canonical promotion is authorized.
