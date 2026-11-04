# CH-005A Canonical Promotion Validation v1

Promotion date: 2026-11-04, Europe/Madrid. Result: **PASS — controlled local canonical promotion complete; no GitHub publication or baseline update.**

## Authority and preflight

Delivery Management's Step 6 instruction (attachment ID 82a94c88-d736-4d8d-af55-2750db52918a) explicitly authorizes exact-content replacement of the seven local canonicals only, plus this new audit. Repository C:/AI Projects/Codex_MVP; branch feature/initial-dashboard-import; initial/final HEAD 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a. Historical GitHub reference: [Komari-TAO/Delivery-Dashboard at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a).

Reviewed [revalidation addendum](CH005A_GOVERNANCE_REVALIDATION_ADDENDUM_v1.md), [original validation](CH005A_GOVERNANCE_VALIDATION_v1.md), [change matrix](CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md), [implementation acceptance evidence](CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](CH005A_EXPORT_CONTRACT_v2.md). The addendum identifies precisely the seven mappings below and records all 11 consistency checks PASS. Current candidates were compared against their approval-time hashes captured in the preceding review/correction session: all seven match. The six v1 sources and all older protected files match that review state; corrected dictionary v2 matches its creation bytes. Both dictionary corrections are present. No unapproved content drift or unresolved scoped promotion blocker was found.

All seven pre-promotion canonical texts equal pinned Git content after CRLF/LF normalization and match review-time byte hashes. Direct GitHub reads at the pinned commit returned the seven historical blobs below; they remain retrievable. No unnecessary duplicate historical backups were created. Original canonical bytes were captured in memory for failure rollback.

## Exact mappings and SHA-256 integrity

Hashes below are of actual bytes. No encoding or newline conversion was performed: each destination was written from the approved candidate Buffer and verified byte-for-byte. Data Dictionary **v2** was used; Dictionary v1 was not promoted.

| Approved candidate | Canonical destination | Pre-promotion canonical SHA-256 | Candidate SHA-256 | Post-promotion canonical SHA-256 | Result |
| --- | --- | --- | --- | --- | --- |
| [docs/governance/Data_Dictionary_CH005A_v2.md](../governance/Data_Dictionary_CH005A_v2.md) | [docs/governance/Data_Dictionary.md](../governance/Data_Dictionary.md) | 7ca12d4d67affe41f9669621329845bea097bf6622301affc4ee19e0c18e83b6 | 78266cb6e22e5db7d8fec6d80ce171ad1b7e472922fce4a189afc05298f8077c | 78266cb6e22e5db7d8fec6d80ce171ad1b7e472922fce4a189afc05298f8077c | PASS; exact bytes |
| [docs/governance/MVP_Business_Rules_CH005A_v1.md](../governance/MVP_Business_Rules_CH005A_v1.md) | [docs/governance/MVP_Business_Rules.md](../governance/MVP_Business_Rules.md) | 55dda7f9b79c95617a5ba7a77d8f95584d356de0ba42c6d568ff612d96e94878 | 2e399cf196e2598cf25ebe5821fd0329125250c7f0bea72c7569f23bdcc912ad | 2e399cf196e2598cf25ebe5821fd0329125250c7f0bea72c7569f23bdcc912ad | PASS; exact bytes |
| [docs/governance/Calculation_Governance_CH005A_v1.md](../governance/Calculation_Governance_CH005A_v1.md) | [docs/governance/Calculation_Governance.md](../governance/Calculation_Governance.md) | 62383d72fc86ba85837ad911ac5ca24bbc486f3e9247644def0375d4b926b099 | 535b729cb0f37855298548f12377427308174c5f85dd65c254e038848e27b75b | 535b729cb0f37855298548f12377427308174c5f85dd65c254e038848e27b75b | PASS; exact bytes |
| [docs/governance/KPI_Definitions_CH005A_v1.md](../governance/KPI_Definitions_CH005A_v1.md) | [docs/governance/KPI_Definitions.md](../governance/KPI_Definitions.md) | 3d96c68a9589352750edad8fb527a7dd9940b3b3b23cdf3d82776c236c1f35c1 | 7e4d861ea1caab225c6e927b3b821e2ea836a7d74d81dd84b724593c25ab9dde | 7e4d861ea1caab225c6e927b3b821e2ea836a7d74d81dd84b724593c25ab9dde | PASS; exact bytes |
| [docs/governance/Semantic_Visualization_Governance_CH005A_v1.md](../governance/Semantic_Visualization_Governance_CH005A_v1.md) | [docs/governance/Semantic_Visualization_Governance.md](../governance/Semantic_Visualization_Governance.md) | 00692b6a115bb1f6e17b4f884fd765c7f22c64c70c1c2c14eccab583d9749b7c | f0056df8b885c041865948d4f01f6d6b591e13b5269fb8e1a4f6489bab42bb66 | f0056df8b885c041865948d4f01f6d6b591e13b5269fb8e1a4f6489bab42bb66 | PASS; exact bytes |
| [docs/user-guides/Chart_and_Visual_Specification_CH005A_v1.md](../user-guides/Chart_and_Visual_Specification_CH005A_v1.md) | [docs/user-guides/Chart_and_Visual_Specification.md](../user-guides/Chart_and_Visual_Specification.md) | e423f685c05dd473af4170d725e89c2e0804f9cc24a920be9363b9df022e301e | a80bf398dce986d1bb13b150d27f682b5a1d3f46c43704726822c08e53e172c4 | a80bf398dce986d1bb13b150d27f682b5a1d3f46c43704726822c08e53e172c4 | PASS; exact bytes |
| [docs/user-guides/User_Guide_CH005A_v1.md](../user-guides/User_Guide_CH005A_v1.md) | [docs/user-guides/User_Guide.md](../user-guides/User_Guide.md) | d10d68dbd98a20f0f1a2b198cd7263781cc6ffd3b92ea5110003b17deed7413e | a045c71ba18860db1c360a3e2b7e5a577c925b6d8896b6f15c9157f7ba9b44de | a045c71ba18860db1c360a3e2b7e5a577c925b6d8896b6f15c9157f7ba9b44de | PASS; exact bytes |

Historical pinned Git blobs:

| Canonical path | Blob |
| --- | --- |
| docs/governance/Data_Dictionary.md | 88bd711d4973b9aca5dfbd0352e16e1aaf209199 |
| docs/governance/MVP_Business_Rules.md | 440f13b1681fde54ebbaa7833323c98ce3d09b3d |
| docs/governance/Calculation_Governance.md | 1779af38f4d7caa2b72be1356f83281abc4fe9ac |
| docs/governance/KPI_Definitions.md | a61a385ee8224341c94ff829c711a2d2ed4234f6 |
| docs/governance/Semantic_Visualization_Governance.md | 721ffc7b983176a4dedd1f3dfe28e88b3cedfbb6 |
| docs/user-guides/Chart_and_Visual_Specification.md | 058c0c590547de3d1a2f75624f86a0359536c743 |
| docs/user-guides/User_Guide.md | 509da0db5928246d6845a4a792ec82a615942b3d |

## Controlled operation and content boundary

All seven replacements ran in one guarded operation using captured before/candidate bytes, with rollback to original canonical bytes on replacement or integrity failure. No failure or rollback occurred. Exactly seven existing canonical files changed. One new file was created: this audit. No candidate, historical proposal, prior audit or unrelated file was edited.

The instruction required an exact approved-content promotion, prohibiting editorial changes. Therefore original proposal titles/status headers (including local-proposal wording), provenance narratives, self/canonical references and sibling links remain verbatim. They describe the approved source version/history; this Step 6 authorization and audit establish its local canonical placement. Six documents' historical dictionary-v1 links remain as in the approved candidates; the controlling dictionary destination contains v2. This recorded metadata/link limitation is not resolved by silently editing approved content, and does not promote the erroneous dictionary v1. Any subsequent metadata/link revision requires its own authorized documentation scope.

## Governance consistency: 16 checks

Each promoted destination has the approved semantics because it is byte-identical to its verified source. The accepted exceptions remain disclosed; PASS does not mean those defects are repaired.

| # | Check | Result / meaning |
| --- | --- | --- |
| 1 | Client | PASS — Verified Tempo Account Customer; N/A unresolved. |
| 2 | Account identity | PASS — Trimmed, case-preserved Tempo Account Key. |
| 3 | Account display | PASS — Tempo Account Name; no identity bridge by matching names. |
| 4 | Account Category | PASS — Tempo Account Category; dictionary v2 correctly maps payload category. |
| 5 | Jira Account | PASS — Jira Custom field (Account) retained as metadata, diagnostics and planning. |
| 6 | Portfolio controls | PASS — One modern Account control; Reporting Account absent from sidebar/state/predicates; legacy labels export-only. |
| 7 | Observed membership | PASS — Direct Issue Key / Work Item Key / Account Key activity from complete eligible snapshot before UI filters; not contractual ownership. |
| 8 | Jira grain | PASS — Estimates remain at distinct issue grain; no allocation. |
| 9 | Tempo grain | PASS — Actuals retain source worklog grain and Worklog ID provenance. |
| 10 | Demand populations | PASS — Selected, residual unlinked and other linked populations remain distinct; unlinked not assigned to selected named Accounts. |
| 11 | Account subtotals | PASS — Per-Account estimate rows can overlap; union deduplicates issues, row subtotals non-additive. |
| 12 | Capacity | PASS — Workforce/calendar denominators not allocated to Accounts. |
| 13 | CH-004 treemap | PASS — Default Client, active Client/Account gives Account; explicit All/empty/clear/intersection/missing states preserved; operational tile exclusion and same-scope three footers retained. |
| 14 | Demand Management | PASS — Independent Jira Account picker, planning and hierarchy; CH-005B deferred. |
| 15 | Exports | PASS — Versioned v2 separate effort/issue records and snapshot/planning scope; legacy v1 retained, external v2 acceptance pending. |
| 16 | Limitations | PASS — All ten original conditions and both accepted date/measure exceptions retained; no defect resolved or alternate business rule approved. |

## Calculation protection

All 18 inherited fenced formula blocks from the historical canonicals remain present after line-ending-normalized comparison; promoted formula blocks equal the approved source blocks exactly. No application measure was recalculated. Logged Total/Engineering/Operations, Original/Remaining Estimate, capacity arithmetic, Team ownership, parent-child inheritance, confirmed-zero handling, Jira Status applicability, exclusive Master Date authority and six-team scope are unchanged from the approved proposals. Existing annual/full-source exceptions and consumer-specific date/Status applicability remain qualified; promotion adds no new allocation or measure definition.

## Retained conditions and exceptions

1. Historical reporting and capacity replay remain incomplete because prior exports are unavailable.
2. External consumer acceptance of v2 exports remains unestablished.
3. Legacy v1 export compatibility remains required pending downstream approval.
4. Jira Status category mapping remains a separate unresolved defect.
5. ISO-week/weekday fallback remains an unapproved implementation exception to exclusive Master Date governance.
6. Epic-child Jira Account mismatches and missing Jira Account values remain data-quality issues.
7. Observed Account activity does not establish contractual ownership.
8. Effective-dated Account/customer history and an authoritative Jira/Tempo ownership crosswalk remain unavailable.
9. Negative-adjustment treemap reconciliation remains unvalidated.
10. CH-005B remains deferred; Demand Management stays independent.

Separately retained: Bug Severity's Date Range exemption expectation differs from actual Jira Created-date filtering; the retained Original-Estimate comparison contract differs from the active Remaining-Demand chart. Delivery Management accepts these as documented exceptions for this promotion, without approving a new underlying business rule or authorizing remediation. Historical G5/G7 evidence retains its dates and limits. No issue is marked resolved by promotion.

## Protected-file preservation

Before operation, hashes covered 162 existing files: the seven authorized canonical destinations plus **155 protected files outside the replacement set**. Post-operation: all seven destinations match their candidate bytes; **155/155 other files unchanged, zero missing/changed**. All eight CH005A proposal versions (including erroneous dictionary v1 and corrected v2), CH004 proposals, prior audits, application code, tests, raw sources/mappings, generated payload, build manifest and acceptance outputs remain byte-identical. Every other inventoried canonical/historical document is unchanged.

Protected outside-set inventory digest: 584df1146c8ec161e08262994ac6b20c5e8cbd0d886309bf44bb49554061a448. Definition: SHA-256 of UTF-8 path + tab + lowercase file SHA-256 + LF records, sorted by JavaScript localeCompare on paths. This identifies the before/after identical 155-file inventory. Historical BASELINE_v0.3_2026-07-01.txt remains 1365b16c229fd491d07def03509c078b385eeb5c74206dfd59cd29c9dbab9cf7.

## Git working-tree status

Pre-existing modified/untracked files were preserved. The only new tracked modifications are the seven canonical destinations above; the only new untracked file is this report. Nothing was staged; index status, branch and HEAD remain unchanged. No commit, push, checkout, reset, merge, rebase, remote write or baseline update occurred. Git status below separates the initial work from the final result.

Pre-existing status:

```text
 M scripts/build_web_data.py
 M scripts/verify_account_distribution.cjs
 M web/app.js
 M web/index.html
 M web/styles.css
?? docs/audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md
?? docs/audit/CH004_STEP4_GOVERNANCE_CHANGE_MATRIX_v1_2026-11-03.md
?? docs/audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md
?? docs/audit/CH005A_EXPORT_CONTRACT_v2.md
?? docs/audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md
?? docs/audit/CH005A_GOVERNANCE_REVALIDATION_ADDENDUM_v1.md
?? docs/audit/CH005A_GOVERNANCE_VALIDATION_v1.md
?? docs/audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md
?? docs/governance/Calculation_Governance_CH004_v1.md
?? docs/governance/Calculation_Governance_CH005A_v1.md
?? docs/governance/Data_Dictionary_CH004_v1.md
?? docs/governance/Data_Dictionary_CH004_vNext.md
?? docs/governance/Data_Dictionary_CH005A_v1.md
?? docs/governance/Data_Dictionary_CH005A_v2.md
?? docs/governance/KPI_Definitions_CH004_v1.md
?? docs/governance/KPI_Definitions_CH005A_v1.md
?? docs/governance/MVP_Business_Rules_CH004_v1.md
?? docs/governance/MVP_Business_Rules_CH005A_v1.md
?? docs/governance/Semantic_Visualization_Governance_CH004_v1.md
?? docs/governance/Semantic_Visualization_Governance_CH005A_v1.md
?? docs/user-guides/Chart_and_Visual_Specification_CH004_v1.md
?? docs/user-guides/Chart_and_Visual_Specification_CH005A_v1.md
?? docs/user-guides/User_Guide_CH004_v1.md
?? docs/user-guides/User_Guide_CH005A_v1.md
?? scripts/test_portfolio_accounts.cjs
?? scripts/verify_portfolio_accounts.cjs
?? scripts/verify_tempo_account_filters.cjs
?? web/portfolio-accounts.js
?? web/portfolio-legacy-export.js
```

Final status (sorted, verified after promotion):

```text
 M docs/governance/Calculation_Governance.md
 M docs/governance/Data_Dictionary.md
 M docs/governance/KPI_Definitions.md
 M docs/governance/MVP_Business_Rules.md
 M docs/governance/Semantic_Visualization_Governance.md
 M docs/user-guides/Chart_and_Visual_Specification.md
 M docs/user-guides/User_Guide.md
 M scripts/build_web_data.py
 M scripts/verify_account_distribution.cjs
 M web/app.js
 M web/index.html
 M web/styles.css
?? docs/audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md
?? docs/audit/CH004_STEP4_GOVERNANCE_CHANGE_MATRIX_v1_2026-11-03.md
?? docs/audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md
?? docs/audit/CH005A_CANONICAL_PROMOTION_VALIDATION_v1.md
?? docs/audit/CH005A_EXPORT_CONTRACT_v2.md
?? docs/audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md
?? docs/audit/CH005A_GOVERNANCE_REVALIDATION_ADDENDUM_v1.md
?? docs/audit/CH005A_GOVERNANCE_VALIDATION_v1.md
?? docs/audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md
?? docs/governance/Calculation_Governance_CH004_v1.md
?? docs/governance/Calculation_Governance_CH005A_v1.md
?? docs/governance/Data_Dictionary_CH004_v1.md
?? docs/governance/Data_Dictionary_CH004_vNext.md
?? docs/governance/Data_Dictionary_CH005A_v1.md
?? docs/governance/Data_Dictionary_CH005A_v2.md
?? docs/governance/KPI_Definitions_CH004_v1.md
?? docs/governance/KPI_Definitions_CH005A_v1.md
?? docs/governance/MVP_Business_Rules_CH004_v1.md
?? docs/governance/MVP_Business_Rules_CH005A_v1.md
?? docs/governance/Semantic_Visualization_Governance_CH004_v1.md
?? docs/governance/Semantic_Visualization_Governance_CH005A_v1.md
?? docs/user-guides/Chart_and_Visual_Specification_CH004_v1.md
?? docs/user-guides/Chart_and_Visual_Specification_CH005A_v1.md
?? docs/user-guides/User_Guide_CH004_v1.md
?? docs/user-guides/User_Guide_CH005A_v1.md
?? scripts/test_portfolio_accounts.cjs
?? scripts/verify_portfolio_accounts.cjs
?? scripts/verify_tempo_account_filters.cjs
?? web/portfolio-accounts.js
?? web/portfolio-legacy-export.js
```

## Discrepancies and next step

No integrity failures, unexpected file changes or encoding/newline differences against approved candidates. Proposal metadata/link wording is intentionally retained as described above, not treated as an editorial permission. All existing conditional limitations remain open.

Local canonical placement is complete. Recommended next step, only after explicit Delivery Management authorization: prepare a separate GitHub baseline change with a reviewed file inventory and diff, keeping pre-existing application work outside any documentation-only publication unless separately approved. Confirm handling of retained proposal metadata/links and preserve this promotion traceability. Do not update the pinned baseline or begin that preparation, stage, commit or push as part of Step 6.
