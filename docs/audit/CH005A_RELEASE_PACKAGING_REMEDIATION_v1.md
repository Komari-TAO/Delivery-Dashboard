# CH-005A Release Packaging Remediation v1

Date: 2026-11-04, Europe/Madrid. Repository: C:/AI Projects/Codex_MVP. Branch feature/initial-dashboard-import; HEAD 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a. Result: **CONDITIONALLY READY for the subsequent read-only release review. No staging, commit, push, tag or baseline update.** v0.17 remains provisional. This full local report contains exact historical line text and is excluded from publication; use the separate sanitized summary and manifest.

## Starting state and scope

Step 8 attachment 820b32e2-51f1-407d-b65f-db956aadb7e2 authorizes test/dependency remediation, narrowly editorial canonical revisions, publication summaries and this audit. Initial state equals the audited Step 7 state: 12 modified tracked paths and 30 untracked files, no staged/deleted/renamed changes; HEAD/branch unchanged. Recovery refs and stash were captured and preserved. No material drift was found. Application source/calculations, raw inputs, production payload/manifest and historical proposals/audits are protected.

Initial exact status:

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

## Four blockers and corrections

| Blocker | Correction | Validation | Remaining condition |
| --- | --- | --- | --- |
| Retired Reporting Account regression entry point | verify_account_distribution now runs public Account domain, public capacity and current synthetic browser suites. The historical CH004 verifier is preserved but never invoked. Original CH005A domain/browser programs are archived locally; active browser path is configurable. | Public entry PASS: 9 domain/KPI, 14 capacity and 28 browser groups. Isolated private entry PASS: original 11 domain, 33 browser groups and 77 Account cases. | Historical CH004 before/after label fingerprint assertions are historical scope, not an active modern UI contract. |
| Ignored private fixtures / machine dependencies | package.json and package-lock.json pin Playwright 1.62.1; installed matching Chromium or CH005A_BROWSER_EXECUTABLE. Invented fixture served in memory. Public capacity assertions split before the original private-payload boundary. requirements-test pins pandas 3.0.1 for Python 3.12 private builds. Explicit private opt-in, fixture preflight and OS-temp isolation added. | Source-only public copy, containing no production data.js or outputs, PASS. No-opt-in and missing-input checks return BLOCKED exit 2. Registry lock generation succeeded; no dependency vulnerabilities reported by npm. | Actual local run used Node 24.15.0, npm 11.12.1, Python 3.12.14, pandas 3.0.1, Playwright 1.62.1, explicitly configured system Chrome. Fresh network install/default downloaded Chromium was not separately exercised. |
| Canonical proposal headers / excluded-file links | Seven canonical metadata sections now identify canonical publication revision 1. Proposal links become canonical links; unpublished audit references point to sanitized summary; corrected dictionary v2 supersession explicit. Incorrect inline repository paths corrected. No business-definition edits. | 92 publication links/file-fragments PASS; seven canonical consistency checks and all 18 protected formula blocks PASS. Exact line ledger below. | Canonical files now deliberately differ from Step 6 source bytes; Step 6 exact-copy record remains unchanged as history. |
| Sensitive evidence / publication package | Original audits/captures remain local. New public summary omits named operational results and local paths. Exact JSON manifest classifies every modified/untracked path and flags existing tracked exposures. | Credential-pattern scan PASS for proposed source; per-file sensitivity review recorded. Raw exports/generated sensitive datasets remain excluded. | Eight files require owner approval for retained existing organization/workforce/customer examples. Existing tracked screenshots/report metadata need an ownership decision; no history rewrite authorized. |

## Coverage migration and fixture classes

The old active wrapper invoked the CH004 verifier which required a removed Reporting Account control. The modern public gate preserves default Client/selected Account grouping, explicit All, Client/Account intersection, clear/reset, active-empty, missing buckets, operational tile exclusions, same-scope three footers, tile/keyboard interaction and mobile rendering. It also covers direct effort filtering, fixed capacity denominator, four detail modes, issue-grain v2 export partitions and v1 key-independence. Multi-Account/non-additive/partial/no-log identities and literal expected synthetic legacy CSV bytes are covered by domain tests. Existing 14 synthetic capacity assertions preserve hierarchy/zero/Team/calendar semantics. The actual runtime code is not modified to satisfy tests.

A: tracked runtime modules and tools; B: invented deterministic fixture; C: authorized current production inputs and matching private captures; D: unavailable historical replay / historical-only captures. Full provisioning and commands: docs/user-guides/Release_Testing.md. Archives contain private-source reference cases and are EXCLUDE. The optional private runner's dependency on them is intentional and documented; no public test requires them. Missing private inputs cannot degrade to PASS.

Original 97-case evidence remains 84 captured legacy comparisons plus 13 supplemental filter cases. This remediation reran the 84 captured comparison loop in the isolated private domain suite; it did not freshly execute the 13 supplementary cases and does not substitute synthetic evidence for them. Historical capacity replay remains SKIPPED/unavailable. No full-platform regression pass is claimed. Initial synthetic test setup mistakes (capacity split boundary and invented expected total) were corrected before final successful runs; no production calculation was changed.

## Validation results

| Check | Final result |
| --- | --- |
| Modern public Account Distribution entry | PASS: 9 Account/KPI checks + 14 capacity checks + 28 browser groups |
| Source-only temporary workspace without private payload/outputs | PASS: same public gate |
| Isolated current-source private domain/browser gates | PASS: 11 checks, 33 browser groups, 77 Account identities; original outputs not overwritten |
| Gate without explicit private authorization flag | PASS: expected BLOCKED exit 2, no reduced-suite PASS |
| Gate with missing provisioned private inputs | PASS: expected BLOCKED exit 2 before copying/running |
| Synthetic v1 literal expected bytes / v2 issue uniqueness and sum | PASS; distinct evidence from historical 97 cases |
| Publication links and fragments / protected formulas | PASS: 92 links, seven canonicals, 18 blocks |
| Runtime, Demand, raw source, payload/manifest and original evidence hashes | PASS: no unauthorized byte changes |
| Credentials | PASS for checked patterns; no guarantee of complete organizational sensitivity clearance |
| npm dependency resolution / lockfile | PASS after authorized registry access; earlier offline/default attempts unavailable, no production files touched |
| Historical replay / 13 supplemental legacy cases | SKIPPED/not freshly executed; prior evidence retained |
| Default Playwright-downloaded browser on a fresh network install | NOT VALIDATED here; documented installation path and exact lock retained |
| git diff --check | PASS (Git reports expected LF/CRLF normalization notices) |

## Canonical before/after hashes

These are a new publication revision, not a retroactive change to the Step 6 validation. Every change is metadata, editorial provenance or reference routing. Body formulas, dates governing measures, source ownership, aggregation/filter rules and accepted exceptions remain unchanged. Complete historical source versions are preserved.

| File | Step 6 promoted SHA-256 | Publication revision SHA-256 |
| --- | --- | --- |
| docs/governance/Data_Dictionary.md | 78266cb6e22e5db7d8fec6d80ce171ad1b7e472922fce4a189afc05298f8077c | 5f0ae0b9fbd6c7cf2c44f104ee54ca57bb38d9ca7dfd89bcaae618ef1e619d64 |
| docs/governance/MVP_Business_Rules.md | 2e399cf196e2598cf25ebe5821fd0329125250c7f0bea72c7569f23bdcc912ad | 19a56574e9b7e128585125aef0fe76dde81f45689482b613a221ff0b2a50e3e0 |
| docs/governance/Calculation_Governance.md | 535b729cb0f37855298548f12377427308174c5f85dd65c254e038848e27b75b | 9fe03c9523faa90d371d8932c57c2b914a5928e11ab59a848fce39c358b5abe1 |
| docs/governance/KPI_Definitions.md | 7e4d861ea1caab225c6e927b3b821e2ea836a7d74d81dd84b724593c25ab9dde | 1e8a9f376a99bca19733ac1ac1d9fae0a16db51af85d90e2b21b9ce1463df879 |
| docs/governance/Semantic_Visualization_Governance.md | f0056df8b885c041865948d4f01f6d6b591e13b5269fb8e1a4f6489bab42bb66 | dac289383a6039d15427c06c26cd71c18f328bc66bfa1cbfe61afabe2eb63079 |
| docs/user-guides/Chart_and_Visual_Specification.md | a80bf398dce986d1bb13b150d27f682b5a1d3f46c43704726822c08e53e172c4 | 9568ca4422a7f2c06f9c227b50af12c8ef9bc6790a2e08c7ba102ac3713f62e1 |
| docs/user-guides/User_Guide.md | a045c71ba18860db1c360a3e2b7e5a577c925b6d8896b6f15c9157f7ba9b44de | 7a8123d18ec3121ba476a94404e392c07981f7c30c526a2880f9366ff5b7f4c1 |

## Exact documentation line ledger

Ranges are one-based. Old/new arrays retain literal lines, including removed local provenance. This ledger is local-only evidence. Metadata/history header changes retain scoped G1/D1–D8 meaning; all remaining changes route links/filenames to canonical or published summary targets. No formula or approved business content is reinterpreted.

```json
[
  {
    "file": "docs/governance/Data_Dictionary.md",
    "beforeHash": "78266cb6e22e5db7d8fec6d80ce171ad1b7e472922fce4a189afc05298f8077c",
    "afterHash": "5f0ae0b9fbd6c7cf2c44f104ee54ca57bb38d9ca7dfd89bcaae618ef1e619d64",
    "changes": [
      {
        "oldStart": 3,
        "oldEnd": 3,
        "newStart": 3,
        "newEnd": 3,
        "old": [
          "> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only."
        ],
        "new": [
          "> **Canonical CH-005A governance; publication revision 1, 2026-11-04.** Local promotion and subsequent reference-only publication edits are authorized; GitHub publication is pending."
        ]
      },
      {
        "oldStart": 5,
        "oldEnd": 5,
        "newStart": 5,
        "newEnd": 5,
        "old": [
          "## Revision provenance and version history"
        ],
        "new": [
          "## Publication provenance"
        ]
      },
      {
        "oldStart": 7,
        "oldEnd": 7,
        "newStart": 7,
        "newEnd": 7,
        "old": [
          "Immediate previous version: [Data_Dictionary_CH005A_v1.md](Data_Dictionary_CH005A_v1.md), preserved unchanged. This v2 supersedes v1 for the current promotion-candidate set only. CH-004 predecessor: [Data_Dictionary_CH004_v1.md](Data_Dictionary_CH004_v1.md), preserved unchanged. Canonical comparison document: [Data_Dictionary.md](Data_Dictionary.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/Data_Dictionary.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob 88bd711d4973b9aca5dfbd0352e16e1aaf209199. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work."
        ],
        "new": [
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1â€“D3 and D5â€“D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
        ]
      },
      {
        "oldStart": 9,
        "oldEnd": 20,
        "newStart": 9,
        "newEnd": 9,
        "old": [
          "| Version | Date / status |",
          "| --- | --- |",
          "| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |",
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4â€“G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1â€“D3/D5â€“D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |",
          "| CH-005A v2 | 2026-11-04 corrected successor: (A) exact Tempo Account Category â†’ payload category mapping; (B) limit Key identity to Portfolio Account, retaining existing label values for Client and Status. No formula, source, payload or business-rule change. |",
          "",
          "## CH-005A decision and evidence boundary",
          "",
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1â€“D3 and D5â€“D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
          "",
          "Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision."
        ],
        "new": [
          "The [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) records approval scope, retained exceptions and the private-evidence boundary. This publication revision changes metadata and references only, preserving approved business content. The original CH-005A dictionary v1 proposal was superseded by corrected v2 before canonical promotion; category mapping and Account-only Key identity corrections remain authoritative."
        ]
      },
      {
        "oldStart": 23,
        "oldEnd": 23,
        "newStart": 12,
        "newEnd": 13,
        "old": [
          "The current Delivery Management correction request accepts carrying Bug Severity Date Range versus Created-date behavior, the Original-versus-Remaining Estimate distinction, historical capacity replay limits, the Master Date fallback exception, the Jira Status category mapping issue and pending external v2 acceptance as documented unresolved exceptions. This accepts their continued disclosure for CH-005A governance alignment; it does not resolve them, approve an alternate business rule or authorize code changes. See the [revalidation addendum](../audit/CH005A_GOVERNANCE_REVALIDATION_ADDENDUM_v1.md) for the current seven-document candidate inventory and correction evidence. Existing v1 audits remain historical records; the addendum supersedes their blanket accuracy assessment for the two corrected statements. Canonical promotion is not authorized by this correction task."
        ],
        "new": [
          "",
          "The current Delivery Management correction request accepts carrying Bug Severity Date Range versus Created-date behavior, the Original-versus-Remaining Estimate distinction, historical capacity replay limits, the Master Date fallback exception, the Jira Status category mapping issue and pending external v2 acceptance as documented unresolved exceptions. This accepts their continued disclosure for CH-005A governance alignment; it does not resolve them, approve an alternate business rule or authorize code changes. See the [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) for the current seven-document candidate inventory and correction evidence. Existing v1 audits remain historical records; the addendum supersedes their blanket accuracy assessment for the two corrected statements. Canonical promotion is not authorized by this correction task."
        ]
      },
      {
        "oldStart": 139,
        "oldEnd": 139,
        "newStart": 129,
        "newEnd": 129,
        "old": [
          "The current Account resolution precedence is direct Jira Account, then immediate-parent Jira Account only if the direct key is absent from the extract and the available parent has a nonblank Account. The current MVP does not inherit when a present direct Jira record has blank Account and does not recursively traverse ancestors. See `MVP_Business_Rules_CH005A_v1.md` for business rules and `Calculation_Governance_CH005A_v1.md` for calculation scope."
        ],
        "new": [
          "The current Account resolution precedence is direct Jira Account, then immediate-parent Jira Account only if the direct key is absent from the extract and the available parent has a nonblank Account. The current MVP does not inherit when a present direct Jira record has blank Account and does not recursively traverse ancestors. See `MVP_Business_Rules.md` for business rules and `Calculation_Governance.md` for calculation scope."
        ]
      },
      {
        "oldStart": 754,
        "oldEnd": 754,
        "newStart": 744,
        "newEnd": 744,
        "old": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [The exact contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ],
        "new": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ]
      },
      {
        "oldStart": 791,
        "oldEnd": 791,
        "newStart": 781,
        "newEnd": 781,
        "old": [
          "Pre-existing date/measure wording conflicts are recorded in the [Step 5 validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ],
        "new": [
          "Pre-existing date/measure wording conflicts are recorded in the [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ]
      }
    ]
  },
  {
    "file": "docs/governance/MVP_Business_Rules.md",
    "beforeHash": "2e399cf196e2598cf25ebe5821fd0329125250c7f0bea72c7569f23bdcc912ad",
    "afterHash": "19a56574e9b7e128585125aef0fe76dde81f45689482b613a221ff0b2a50e3e0",
    "changes": [
      {
        "oldStart": 3,
        "oldEnd": 3,
        "newStart": 3,
        "newEnd": 3,
        "old": [
          "> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only."
        ],
        "new": [
          "> **Canonical CH-005A governance; publication revision 1, 2026-11-04.** Local promotion and subsequent reference-only publication edits are authorized; GitHub publication is pending."
        ]
      },
      {
        "oldStart": 5,
        "oldEnd": 5,
        "newStart": 5,
        "newEnd": 5,
        "old": [
          "## Revision provenance and version history"
        ],
        "new": [
          "## Publication provenance"
        ]
      },
      {
        "oldStart": 7,
        "oldEnd": 7,
        "newStart": 7,
        "newEnd": 7,
        "old": [
          "Previous proposal: [MVP_Business_Rules_CH004_v1.md](MVP_Business_Rules_CH004_v1.md), preserved unchanged. Canonical comparison document: [MVP_Business_Rules.md](MVP_Business_Rules.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/MVP_Business_Rules.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob 440f13b1681fde54ebbaa7833323c98ce3d09b3d. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work."
        ],
        "new": [
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1â€“D3 and D5â€“D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
        ]
      },
      {
        "oldStart": 9,
        "oldEnd": 13,
        "newStart": 9,
        "newEnd": 9,
        "old": [
          "| Version | Date / status |",
          "| --- | --- |",
          "| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |",
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4â€“G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1â€“D3/D5â€“D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
        ],
        "new": [
          "The [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) records approval scope, retained exceptions and the private-evidence boundary. This publication revision changes metadata and references only, preserving approved business content. The approved source proposal and complete historical audit trail remain preserved locally."
        ]
      },
      {
        "oldStart": 15,
        "oldEnd": 19,
        "newStart": 11,
        "newEnd": 10,
        "old": [
          "## CH-005A decision and evidence boundary",
          "",
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1â€“D3 and D5â€“D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
          "",
          "Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision."
        ],
        "new": []
      },
      {
        "oldStart": 617,
        "oldEnd": 617,
        "newStart": 608,
        "newEnd": 608,
        "old": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [The exact contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ],
        "new": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ]
      },
      {
        "oldStart": 652,
        "oldEnd": 652,
        "newStart": 643,
        "newEnd": 643,
        "old": [
          "Pre-existing date/measure wording conflicts are recorded in the [Step 5 validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ],
        "new": [
          "Pre-existing date/measure wording conflicts are recorded in the [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ]
      }
    ]
  },
  {
    "file": "docs/governance/Calculation_Governance.md",
    "beforeHash": "535b729cb0f37855298548f12377427308174c5f85dd65c254e038848e27b75b",
    "afterHash": "9fe03c9523faa90d371d8932c57c2b914a5928e11ab59a848fce39c358b5abe1",
    "changes": [
      {
        "oldStart": 3,
        "oldEnd": 3,
        "newStart": 3,
        "newEnd": 3,
        "old": [
          "> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only."
        ],
        "new": [
          "> **Canonical CH-005A governance; publication revision 1, 2026-11-04.** Local promotion and subsequent reference-only publication edits are authorized; GitHub publication is pending."
        ]
      },
      {
        "oldStart": 5,
        "oldEnd": 5,
        "newStart": 5,
        "newEnd": 5,
        "old": [
          "## Revision provenance and version history"
        ],
        "new": [
          "## Publication provenance"
        ]
      },
      {
        "oldStart": 7,
        "oldEnd": 7,
        "newStart": 7,
        "newEnd": 7,
        "old": [
          "Previous proposal: [Calculation_Governance_CH004_v1.md](Calculation_Governance_CH004_v1.md), preserved unchanged. Canonical comparison document: [Calculation_Governance.md](Calculation_Governance.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/Calculation_Governance.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob 1779af38f4d7caa2b72be1356f83281abc4fe9ac. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work."
        ],
        "new": [
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1â€“D3 and D5â€“D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
        ]
      },
      {
        "oldStart": 9,
        "oldEnd": 13,
        "newStart": 9,
        "newEnd": 9,
        "old": [
          "| Version | Date / status |",
          "| --- | --- |",
          "| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |",
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4â€“G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1â€“D3/D5â€“D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
        ],
        "new": [
          "The [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) records approval scope, retained exceptions and the private-evidence boundary. This publication revision changes metadata and references only, preserving approved business content. The approved source proposal and complete historical audit trail remain preserved locally."
        ]
      },
      {
        "oldStart": 15,
        "oldEnd": 19,
        "newStart": 11,
        "newEnd": 10,
        "old": [
          "## CH-005A decision and evidence boundary",
          "",
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1â€“D3 and D5â€“D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
          "",
          "Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision."
        ],
        "new": []
      },
      {
        "oldStart": 29,
        "oldEnd": 32,
        "newStart": 20,
        "newEnd": 23,
        "old": [
          "- `docs/MVP_Business_Rules_CH005A_v1.md`",
          "- `docs/KPI_Definitions_CH005A_v1.md`",
          "- `docs/Data_Dictionary_CH005A_v1.md`",
          "- `docs/Semantic_Visualization_Governance_CH005A_v1.md`"
        ],
        "new": [
          "- `docs/governance/MVP_Business_Rules.md`",
          "- `docs/governance/KPI_Definitions.md`",
          "- `docs/governance/Data_Dictionary.md`",
          "- `docs/governance/Semantic_Visualization_Governance.md`"
        ]
      },
      {
        "oldStart": 443,
        "oldEnd": 443,
        "newStart": 434,
        "newEnd": 434,
        "old": [
          "The hierarchy rule applies to the supplied Jira extract; unavailable descendants cannot be verified. See [implementation audit and filter matrix](../audit/CAPACITY_ASSIGNED_DEMAND_VALIDATION.md) and the [visual contract](../user-guides/Chart_and_Visual_Specification_CH005A_v1.md#capacity-versus-known-assigned-demand)."
        ],
        "new": [
          "The hierarchy rule applies to the supplied Jira extract; unavailable descendants cannot be verified. See [implementation audit and filter matrix](../audit/CAPACITY_ASSIGNED_DEMAND_VALIDATION.md) and the [visual contract](../user-guides/Chart_and_Visual_Specification.md#capacity-versus-known-assigned-demand)."
        ]
      },
      {
        "oldStart": 518,
        "oldEnd": 518,
        "newStart": 509,
        "newEnd": 509,
        "old": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [The exact contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ],
        "new": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ]
      },
      {
        "oldStart": 553,
        "oldEnd": 553,
        "newStart": 544,
        "newEnd": 544,
        "old": [
          "Pre-existing date/measure wording conflicts are recorded in the [Step 5 validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ],
        "new": [
          "Pre-existing date/measure wording conflicts are recorded in the [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ]
      }
    ]
  },
  {
    "file": "docs/governance/KPI_Definitions.md",
    "beforeHash": "7e4d861ea1caab225c6e927b3b821e2ea836a7d74d81dd84b724593c25ab9dde",
    "afterHash": "1e8a9f376a99bca19733ac1ac1d9fae0a16db51af85d90e2b21b9ce1463df879",
    "changes": [
      {
        "oldStart": 3,
        "oldEnd": 3,
        "newStart": 3,
        "newEnd": 3,
        "old": [
          "> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only."
        ],
        "new": [
          "> **Canonical CH-005A governance; publication revision 1, 2026-11-04.** Local promotion and subsequent reference-only publication edits are authorized; GitHub publication is pending."
        ]
      },
      {
        "oldStart": 5,
        "oldEnd": 5,
        "newStart": 5,
        "newEnd": 5,
        "old": [
          "## Revision provenance and version history"
        ],
        "new": [
          "## Publication provenance"
        ]
      },
      {
        "oldStart": 7,
        "oldEnd": 7,
        "newStart": 7,
        "newEnd": 7,
        "old": [
          "Previous proposal: [KPI_Definitions_CH004_v1.md](KPI_Definitions_CH004_v1.md), preserved unchanged. Canonical comparison document: [KPI_Definitions.md](KPI_Definitions.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/KPI_Definitions.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob a61a385ee8224341c94ff829c711a2d2ed4234f6. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work."
        ],
        "new": [
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1â€“D3 and D5â€“D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
        ]
      },
      {
        "oldStart": 9,
        "oldEnd": 13,
        "newStart": 9,
        "newEnd": 9,
        "old": [
          "| Version | Date / status |",
          "| --- | --- |",
          "| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |",
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4â€“G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1â€“D3/D5â€“D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
        ],
        "new": [
          "The [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) records approval scope, retained exceptions and the private-evidence boundary. This publication revision changes metadata and references only, preserving approved business content. The approved source proposal and complete historical audit trail remain preserved locally."
        ]
      },
      {
        "oldStart": 15,
        "oldEnd": 19,
        "newStart": 11,
        "newEnd": 10,
        "old": [
          "## CH-005A decision and evidence boundary",
          "",
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1â€“D3 and D5â€“D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
          "",
          "Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision."
        ],
        "new": []
      },
      {
        "oldStart": 188,
        "oldEnd": 188,
        "newStart": 179,
        "newEnd": 179,
        "old": [
          "Tempo remains authoritative for all three effort measures. Account attribution uses Jira Account metadata under the current immediate-parent fallback documented in `MVP_Business_Rules_CH005A_v1.md`. Operational TEMPO-* effort remains a valid Logged Operations population and is not an Account-attribution exception."
        ],
        "new": [
          "Tempo remains authoritative for all three effort measures. Account attribution uses Jira Account metadata under the current immediate-parent fallback documented in `MVP_Business_Rules.md`. Operational TEMPO-* effort remains a valid Logged Operations population and is not an Account-attribution exception."
        ]
      },
      {
        "oldStart": 430,
        "oldEnd": 430,
        "newStart": 421,
        "newEnd": 421,
        "old": [
          "See [CH-004 dictionary](Data_Dictionary_CH005A_v1.md#22-ch-005a-client-account-and-legacy-export-labels) for exact identities and [visual specification](../user-guides/Chart_and_Visual_Specification_CH005A_v1.md#account-distribution-accounttreemap) for the Account Distribution contract."
        ],
        "new": [
          "See [Data Dictionary](Data_Dictionary.md#22-ch-005a-client-account-and-legacy-export-labels) for exact identities and [visual specification](../user-guides/Chart_and_Visual_Specification.md#account-distribution-accounttreemap) for the Account Distribution contract."
        ]
      },
      {
        "oldStart": 524,
        "oldEnd": 524,
        "newStart": 515,
        "newEnd": 515,
        "old": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [The exact contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ],
        "new": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ]
      },
      {
        "oldStart": 559,
        "oldEnd": 559,
        "newStart": 550,
        "newEnd": 550,
        "old": [
          "Pre-existing date/measure wording conflicts are recorded in the [Step 5 validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ],
        "new": [
          "Pre-existing date/measure wording conflicts are recorded in the [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ]
      }
    ]
  },
  {
    "file": "docs/governance/Semantic_Visualization_Governance.md",
    "beforeHash": "f0056df8b885c041865948d4f01f6d6b591e13b5269fb8e1a4f6489bab42bb66",
    "afterHash": "dac289383a6039d15427c06c26cd71c18f328bc66bfa1cbfe61afabe2eb63079",
    "changes": [
      {
        "oldStart": 3,
        "oldEnd": 3,
        "newStart": 3,
        "newEnd": 3,
        "old": [
          "> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only."
        ],
        "new": [
          "> **Canonical CH-005A governance; publication revision 1, 2026-11-04.** Local promotion and subsequent reference-only publication edits are authorized; GitHub publication is pending."
        ]
      },
      {
        "oldStart": 5,
        "oldEnd": 5,
        "newStart": 5,
        "newEnd": 5,
        "old": [
          "## Revision provenance and version history"
        ],
        "new": [
          "## Publication provenance"
        ]
      },
      {
        "oldStart": 7,
        "oldEnd": 7,
        "newStart": 7,
        "newEnd": 7,
        "old": [
          "Previous proposal: [Semantic_Visualization_Governance_CH004_v1.md](Semantic_Visualization_Governance_CH004_v1.md), preserved unchanged. Canonical comparison document: [Semantic_Visualization_Governance.md](Semantic_Visualization_Governance.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/governance/Semantic_Visualization_Governance.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob 721ffc7b983176a4dedd1f3dfe28e88b3cedfbb6. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work."
        ],
        "new": [
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1â€“D3 and D5â€“D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
        ]
      },
      {
        "oldStart": 9,
        "oldEnd": 13,
        "newStart": 9,
        "newEnd": 9,
        "old": [
          "| Version | Date / status |",
          "| --- | --- |",
          "| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |",
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4â€“G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1â€“D3/D5â€“D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
        ],
        "new": [
          "The [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) records approval scope, retained exceptions and the private-evidence boundary. This publication revision changes metadata and references only, preserving approved business content. The approved source proposal and complete historical audit trail remain preserved locally."
        ]
      },
      {
        "oldStart": 15,
        "oldEnd": 19,
        "newStart": 11,
        "newEnd": 10,
        "old": [
          "## CH-005A decision and evidence boundary",
          "",
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1â€“D3 and D5â€“D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
          "",
          "Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision."
        ],
        "new": []
      },
      {
        "oldStart": 23,
        "oldEnd": 23,
        "newStart": 14,
        "newEnd": 14,
        "old": [
          "This document defines the rendering and interaction principles for the active browser dashboard. It does not duplicate field-level calculations; [Chart and Visual Specification](../user-guides/Chart_and_Visual_Specification_CH005A_v1.md) is the authoritative source for those rules."
        ],
        "new": [
          "This document defines the rendering and interaction principles for the active browser dashboard. It does not duplicate field-level calculations; [Chart and Visual Specification](../user-guides/Chart_and_Visual_Specification.md) is the authoritative source for those rules."
        ]
      },
      {
        "oldStart": 64,
        "oldEnd": 64,
        "newStart": 55,
        "newEnd": 55,
        "old": [
          "Client = Tempo Customer Account, never Jira Client, Tempo Account Name, or Jira Account. Both tabs and the Portfolio snapshot export use `tempoCustomerAccount` through the shared `DashboardCore.clientValue` helper. Worklogs retain their direct account/customer attribution; Jira counts and estimates use only complete, single-customer direct issue mappings. Missing or ambiguous items remain visible under `N/A` without parent inheritance or splitting estimates. See [Calculation Governance](Calculation_Governance_CH005A_v1.md#client-attribution-2026-10-22) for the deterministic rule. Full-source KPIs and Delivered Features retain their existing exceptions; current annual Portfolio cards use the scope described above. Workforce capacity is not customer allocated. Portfolio Account Key selection does not synchronize with Demandâ€™s independent Jira Account picker or redefine its planning behavior; CH-005B remains deferred."
        ],
        "new": [
          "Client = Tempo Customer Account, never Jira Client, Tempo Account Name, or Jira Account. Both tabs and the Portfolio snapshot export use `tempoCustomerAccount` through the shared `DashboardCore.clientValue` helper. Worklogs retain their direct account/customer attribution; Jira counts and estimates use only complete, single-customer direct issue mappings. Missing or ambiguous items remain visible under `N/A` without parent inheritance or splitting estimates. See [Calculation Governance](Calculation_Governance.md#client-attribution-2026-10-22) for the deterministic rule. Full-source KPIs and Delivered Features retain their existing exceptions; current annual Portfolio cards use the scope described above. Workforce capacity is not customer allocated. Portfolio Account Key selection does not synchronize with Demandâ€™s independent Jira Account picker or redefine its planning behavior; CH-005B remains deferred."
        ]
      },
      {
        "oldStart": 68,
        "oldEnd": 68,
        "newStart": 59,
        "newEnd": 59,
        "old": [
          "Capacity versus Known Assigned Demand replaces the capacity pivot with a six-team comparison, aggregate KPI cards, an independent future-horizon selector, and separate unallocated/exception disclosure. Its scoped source and hierarchy rules are recorded in [Calculation Governance](Calculation_Governance_CH005A_v1.md#capacity-versus-known-assigned-demand--scoped-authorization-2026-10-22). Use a common bar scale, grey capacity, pastel-blue assigned demand capped at capacity, and muted-red excess demand. Sort known gaps ascending with alphabetical ties; unavailable gaps follow. Missing values render `-`, confirmed zeros render zero, and incomplete capacity never renders as a zero bar or a valid portfolio load. The exception indicator labels its broader Team scope. Existing demand panels retain their previous semantics."
        ],
        "new": [
          "Capacity versus Known Assigned Demand replaces the capacity pivot with a six-team comparison, aggregate KPI cards, an independent future-horizon selector, and separate unallocated/exception disclosure. Its scoped source and hierarchy rules are recorded in [Calculation Governance](Calculation_Governance.md#capacity-versus-known-assigned-demand--scoped-authorization-2026-10-22). Use a common bar scale, grey capacity, pastel-blue assigned demand capped at capacity, and muted-red excess demand. Sort known gaps ascending with alphabetical ties; unavailable gaps follow. Missing values render `-`, confirmed zeros render zero, and incomplete capacity never renders as a zero bar or a valid portfolio load. The exception indicator labels its broader Team scope. Existing demand panels retain their previous semantics."
        ]
      },
      {
        "oldStart": 167,
        "oldEnd": 167,
        "newStart": 158,
        "newEnd": 158,
        "old": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [The exact contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ],
        "new": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ]
      },
      {
        "oldStart": 202,
        "oldEnd": 202,
        "newStart": 193,
        "newEnd": 193,
        "old": [
          "Pre-existing date/measure wording conflicts are recorded in the [Step 5 validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ],
        "new": [
          "Pre-existing date/measure wording conflicts are recorded in the [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ]
      }
    ]
  },
  {
    "file": "docs/user-guides/Chart_and_Visual_Specification.md",
    "beforeHash": "a80bf398dce986d1bb13b150d27f682b5a1d3f46c43704726822c08e53e172c4",
    "afterHash": "9568ca4422a7f2c06f9c227b50af12c8ef9bc6790a2e08c7ba102ac3713f62e1",
    "changes": [
      {
        "oldStart": 3,
        "oldEnd": 3,
        "newStart": 3,
        "newEnd": 3,
        "old": [
          "> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only."
        ],
        "new": [
          "> **Canonical CH-005A governance; publication revision 1, 2026-11-04.** Local promotion and subsequent reference-only publication edits are authorized; GitHub publication is pending."
        ]
      },
      {
        "oldStart": 5,
        "oldEnd": 5,
        "newStart": 5,
        "newEnd": 5,
        "old": [
          "## Revision provenance and version history"
        ],
        "new": [
          "## Publication provenance"
        ]
      },
      {
        "oldStart": 7,
        "oldEnd": 7,
        "newStart": 7,
        "newEnd": 7,
        "old": [
          "Previous proposal: [Chart_and_Visual_Specification_CH004_v1.md](Chart_and_Visual_Specification_CH004_v1.md), preserved unchanged. Canonical comparison document: [Chart_and_Visual_Specification.md](Chart_and_Visual_Specification.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/user-guides/Chart_and_Visual_Specification.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob 058c0c590547de3d1a2f75624f86a0359536c743. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work."
        ],
        "new": [
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1â€“D3 and D5â€“D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
        ]
      },
      {
        "oldStart": 9,
        "oldEnd": 13,
        "newStart": 9,
        "newEnd": 9,
        "old": [
          "| Version | Date / status |",
          "| --- | --- |",
          "| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |",
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4â€“G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1â€“D3/D5â€“D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
        ],
        "new": [
          "The [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) records approval scope, retained exceptions and the private-evidence boundary. This publication revision changes metadata and references only, preserving approved business content. The approved source proposal and complete historical audit trail remain preserved locally."
        ]
      },
      {
        "oldStart": 15,
        "oldEnd": 19,
        "newStart": 11,
        "newEnd": 10,
        "old": [
          "## CH-005A decision and evidence boundary",
          "",
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1â€“D3 and D5â€“D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
          "",
          "Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision."
        ],
        "new": []
      },
      {
        "oldStart": 36,
        "oldEnd": 36,
        "newStart": 27,
        "newEnd": 27,
        "old": [
          "**Client source contract (2026-10-22): Client = Tempo Customer Account**, the CSV field `Account Customer` (column S), validated using `Account Key`. Tempo Account Name, Jira Account, Jira Delivery, and legacy Jira/Tempo Client are separate concepts. Worklogs use the unique verified customer for their account key. Jira items require complete direct worklog evidence for exactly one customer; otherwise Client is `N/A`. Mapping is computed from the complete governed valid-date export before date or other UI filters, with no parent/customer inheritance. See [Calculation Governance](../governance/Calculation_Governance_CH005A_v1.md#client-attribution-2026-10-22) for conflict, incomplete-evidence and grain rules, and [validation results](../audit/CLIENT_CUSTOMER_ATTRIBUTION_VALIDATION.md) for current gaps. Both pickers and the Portfolio snapshot export use the same canonical `tempoCustomerAccount` field. Capacity is not customer allocated; current annual Portfolio KPI applicability is governed by the Portfolio KPI section below. Client = verified Tempo `Account Customer`. Portfolio Account = trimmed, case-preserved Tempo `Account Key` identity with `Account Name` for display. Account Category = Tempo `Account Category`. Jira Account = Jira `Custom field (Account)` metadata and retained planning/diagnostic use. Legacy Reporting Account labels exist only in v1 export compatibility controls; no modern Portfolio selection state or predicate uses that dimension. Matching names do not establish a Jira/Tempo relationship. The consolidated Key control scopes approved Portfolio effort directly and applicable Jira issue populations by observed membership; legacy labels are retained only in v1 export controls."
        ],
        "new": [
          "**Client source contract (2026-10-22): Client = Tempo Customer Account**, the CSV field `Account Customer` (column S), validated using `Account Key`. Tempo Account Name, Jira Account, Jira Delivery, and legacy Jira/Tempo Client are separate concepts. Worklogs use the unique verified customer for their account key. Jira items require complete direct worklog evidence for exactly one customer; otherwise Client is `N/A`. Mapping is computed from the complete governed valid-date export before date or other UI filters, with no parent/customer inheritance. See [Calculation Governance](../governance/Calculation_Governance.md#client-attribution-2026-10-22) for conflict, incomplete-evidence and grain rules, and [validation results](../audit/CLIENT_CUSTOMER_ATTRIBUTION_VALIDATION.md) for current gaps. Both pickers and the Portfolio snapshot export use the same canonical `tempoCustomerAccount` field. Capacity is not customer allocated; current annual Portfolio KPI applicability is governed by the Portfolio KPI section below. Client = verified Tempo `Account Customer`. Portfolio Account = trimmed, case-preserved Tempo `Account Key` identity with `Account Name` for display. Account Category = Tempo `Account Category`. Jira Account = Jira `Custom field (Account)` metadata and retained planning/diagnostic use. Legacy Reporting Account labels exist only in v1 export compatibility controls; no modern Portfolio selection state or predicate uses that dimension. Matching names do not establish a Jira/Tempo relationship. The consolidated Key control scopes approved Portfolio effort directly and applicable Jira issue populations by observed membership; legacy labels are retained only in v1 export controls."
        ]
      },
      {
        "oldStart": 257,
        "oldEnd": 257,
        "newStart": 248,
        "newEnd": 248,
        "old": [
          "- Jira Account diagnostic partitions remain separate. Historical audit narratives describe earlier controls; current evidence is in [Step 3 validation](../audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md) and [Step 4 validation](../audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md). G4â€“G10 remain qualified there."
        ],
        "new": [
          "- Jira Account diagnostic partitions remain separate. Historical audit narratives describe earlier controls; current evidence is in [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) and [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md). G4â€“G10 remain qualified there."
        ]
      },
      {
        "oldStart": 748,
        "oldEnd": 748,
        "newStart": 739,
        "newEnd": 739,
        "old": [
          "The [scoped calculation authorization](../governance/Calculation_Governance_CH005A_v1.md#capacity-versus-known-assigned-demand--scoped-authorization-2026-10-22) records differences from the parked forecast contract. Source coverage, reconciliation, screenshots, and regression limitations are in the [validation audit](../audit/CAPACITY_ASSIGNED_DEMAND_VALIDATION.md)."
        ],
        "new": [
          "The [scoped calculation authorization](../governance/Calculation_Governance.md#capacity-versus-known-assigned-demand--scoped-authorization-2026-10-22) records differences from the parked forecast contract. Source coverage, reconciliation, screenshots, and regression limitations are in the [validation audit](../audit/CAPACITY_ASSIGNED_DEMAND_VALIDATION.md)."
        ]
      },
      {
        "oldStart": 827,
        "oldEnd": 827,
        "newStart": 818,
        "newEnd": 818,
        "old": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [The exact contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ],
        "new": [
          "D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) defines 13 columns in order: Schema Version; Record Type; Population; Account Key; Account Name; Observed Account Keys; Attribution Status; Jira Issue Key; Jira Account; Logged Hours; Original Estimate Hours; Remaining Estimate Hours; Scope. Schema Version is 2."
        ]
      },
      {
        "oldStart": 862,
        "oldEnd": 862,
        "newStart": 853,
        "newEnd": 853,
        "old": [
          "Pre-existing date/measure wording conflicts are recorded in the [Step 5 validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ],
        "new": [
          "Pre-existing date/measure wording conflicts are recorded in the [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md): Bug Severity's documented date exemption differs from current Created-date implementation; retained Original-Estimate Demand-vs-Actual governance is distinct from the current Remaining-Demand visual. Neither conflict is resolved or newly approved here. Existing formulas, confirmed-zero hierarchy behavior, six-team eligibility, ownership, exclusions and Status exceptions remain governed as before."
        ]
      }
    ]
  },
  {
    "file": "docs/user-guides/User_Guide.md",
    "beforeHash": "a045c71ba18860db1c360a3e2b7e5a577c925b6d8896b6f15c9157f7ba9b44de",
    "afterHash": "7a8123d18ec3121ba476a94404e392c07981f7c30c526a2880f9366ff5b7f4c1",
    "changes": [
      {
        "oldStart": 3,
        "oldEnd": 3,
        "newStart": 3,
        "newEnd": 3,
        "old": [
          "> **Local versioned proposal, 2026-11-04. Not canonical; no promotion authorized.** Conditional acceptance covers the validated current-source Portfolio scope only."
        ],
        "new": [
          "> **Canonical CH-005A governance; publication revision 1, 2026-11-04.** Local promotion and subsequent reference-only publication edits are authorized; GitHub publication is pending."
        ]
      },
      {
        "oldStart": 5,
        "oldEnd": 5,
        "newStart": 5,
        "newEnd": 5,
        "old": [
          "## Revision provenance and version history"
        ],
        "new": [
          "## Publication provenance"
        ]
      },
      {
        "oldStart": 7,
        "oldEnd": 7,
        "newStart": 7,
        "newEnd": 7,
        "old": [
          "Previous proposal: [User_Guide_CH004_v1.md](User_Guide_CH004_v1.md), preserved unchanged. Canonical comparison document: [User_Guide.md](User_Guide.md), preserved unchanged. GitHub repository Komari-TAO/Delivery-Dashboard; branch feature/initial-dashboard-import; [pinned canonical baseline](https://github.com/Komari-TAO/Delivery-Dashboard/blob/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a/docs/user-guides/User_Guide.md). Commit 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; exact canonical blob 509da0db5928246d6845a4a792ec82a615942b3d. GitHub content/blob and local canonical text were verified in Step 5 (line-ending-normalized comparison). The pinned commit is historical comparison authority, not permission to overwrite newer local work."
        ],
        "new": [
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1â€“D3 and D5â€“D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
        ]
      },
      {
        "oldStart": 9,
        "oldEnd": 13,
        "newStart": 9,
        "newEnd": 9,
        "old": [
          "| Version | Date / status |",
          "| --- | --- |",
          "| Pinned canonical | Historical baseline at 3ca6ef0393f119582792bf5b4f2aec4c3873bf4a; unchanged. |",
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4â€“G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1â€“D3/D5â€“D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
        ],
        "new": [
          "The [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) records approval scope, retained exceptions and the private-evidence boundary. This publication revision changes metadata and references only, preserving approved business content. The approved source proposal and complete historical audit trail remain preserved locally."
        ]
      },
      {
        "oldStart": 15,
        "oldEnd": 19,
        "newStart": 11,
        "newEnd": 10,
        "old": [
          "## CH-005A decision and evidence boundary",
          "",
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1â€“D3 and D5â€“D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
          "",
          "Approval records are the user's CH-004 Step 4 attachment (ID 3c601050-42e2-42f4-9fe7-6e549dfec651), CH-005A Step 3 attachment (ID accccdd5-2856-45d6-a477-072145b6f202) and CH-005A Step 5 attachment (ID db67d8f1-af36-499b-8bed-db12cdbedd51). No named signatory, external export approval or historical acceptance is inferred. The [implementation validation](../audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md) and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) are evidence; they do not independently authorize new rules. The [governance matrix](../audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md) and [documentation validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) trace this revision."
        ],
        "new": []
      },
      {
        "oldStart": 25,
        "oldEnd": 25,
        "newStart": 16,
        "newEnd": 16,
        "old": [
          "For the authoritative field-level rules, calculations, joins, and data-quality behavior, use [Chart and Visual Specification](./Chart_and_Visual_Specification_CH005A_v1.md). This guide focuses on how to use the workspace."
        ],
        "new": [
          "For the authoritative field-level rules, calculations, joins, and data-quality behavior, use [Chart and Visual Specification](./Chart_and_Visual_Specification.md). This guide focuses on how to use the workspace."
        ]
      },
      {
        "oldStart": 161,
        "oldEnd": 161,
        "newStart": 152,
        "newEnd": 152,
        "old": [
          "See the [governance validation](../audit/CH005A_GOVERNANCE_VALIDATION_v1.md) for checks and unresolved conflicts, and [export contract](../audit/CH005A_EXPORT_CONTRACT_v2.md) for file details."
        ],
        "new": [
          "See the [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) for checks and unresolved conflicts, and [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) for file details."
        ]
      }
    ]
  }
]
```

## Privacy review and proposed allowlist

Exact machine-readable publication delta: docs/audit/CH005A_RELEASE_PUBLICATION_MANIFEST_v1.json. INCLUDE files are required source/tests/setup/sanitized summary and manifest. INCLUDE AFTER REVIEW files contain approved canonical snapshot/organization examples or existing tenant-specific runtime references that require organizational audience approval. EXCLUDE covers all historical proposals, full original audits, local detailed remediation report and private archives. No BLOCKED public-source dependency remains. Existing tracked files outside the delta remain in Git; this is not a claim that ignoring them removes them from history.

| Path | Git | Relationship | Classification | Sensitivity / dependency | Required action |
| --- | --- | --- | --- | --- | --- |
| docs/governance/Calculation_Governance.md |  M | CH-005A packaging | INCLUDE AFTER REVIEW | Retains approved operational snapshot examples and some previously tracked workforce/customer/source-file examples. See Release_Testing.md; public reference closure validated. | Organizational publication approval for retained examples; do not silently redact business scope. |
| docs/governance/Data_Dictionary.md |  M | CH-005A packaging | INCLUDE AFTER REVIEW | Retains approved operational snapshot examples and some previously tracked workforce/customer/source-file examples. See Release_Testing.md; public reference closure validated. | Organizational publication approval for retained examples; do not silently redact business scope. |
| docs/governance/KPI_Definitions.md |  M | CH-005A packaging | INCLUDE AFTER REVIEW | Retains approved operational snapshot examples and some previously tracked workforce/customer/source-file examples. See Release_Testing.md; public reference closure validated. | Organizational publication approval for retained examples; do not silently redact business scope. |
| docs/governance/MVP_Business_Rules.md |  M | CH-005A packaging | INCLUDE AFTER REVIEW | Retains approved operational snapshot examples and some previously tracked workforce/customer/source-file examples. See Release_Testing.md; public reference closure validated. | Organizational publication approval for retained examples; do not silently redact business scope. |
| docs/governance/Semantic_Visualization_Governance.md |  M | CH-005A packaging | INCLUDE AFTER REVIEW | Retains approved operational snapshot examples and some previously tracked workforce/customer/source-file examples. See Release_Testing.md; public reference closure validated. | Organizational publication approval for retained examples; do not silently redact business scope. |
| docs/user-guides/Chart_and_Visual_Specification.md |  M | CH-005A packaging | INCLUDE AFTER REVIEW | Retains approved operational snapshot examples and some previously tracked workforce/customer/source-file examples. See Release_Testing.md; public reference closure validated. | Organizational publication approval for retained examples; do not silently redact business scope. |
| docs/user-guides/User_Guide.md |  M | CH-005A packaging | INCLUDE AFTER REVIEW | Retains approved operational snapshot examples and some previously tracked workforce/customer/source-file examples. See Release_Testing.md; public reference closure validated. | Organizational publication approval for retained examples; do not silently redact business scope. |
| scripts/build_web_data.py |  M | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| scripts/verify_account_distribution.cjs |  M | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| web/app.js |  M | CH-005A packaging | INCLUDE AFTER REVIEW | Existing tracked tenant routes, numeric mappings and issue examples remain; review intended publication audience. See Release_Testing.md; public reference closure validated. | Approve retained organization-specific runtime references. |
| web/index.html |  M | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| web/styles.css |  M | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| docs/audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md | ?? | CH-004 | EXCLUDE | Local paths, operational values, private evidence identities or full source-line history. See Release_Testing.md; public reference closure validated. | Publish sanitized summary instead; preserve original locally. |
| docs/audit/CH004_STEP4_GOVERNANCE_CHANGE_MATRIX_v1_2026-11-03.md | ?? | CH-004 | EXCLUDE | Local paths, operational values, private evidence identities or full source-line history. See Release_Testing.md; public reference closure validated. | Publish sanitized summary instead; preserve original locally. |
| docs/audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md | ?? | CH-004 | EXCLUDE | Local paths, operational values, private evidence identities or full source-line history. See Release_Testing.md; public reference closure validated. | Publish sanitized summary instead; preserve original locally. |
| docs/audit/CH005A_CANONICAL_PROMOTION_VALIDATION_v1.md | ?? | CH-005A packaging | EXCLUDE | Local paths, operational values, private evidence identities or full source-line history. See Release_Testing.md; public reference closure validated. | Publish sanitized summary instead; preserve original locally. |
| docs/audit/CH005A_EXPORT_CONTRACT_v2.md | ?? | CH-005A packaging | EXCLUDE | Local paths, operational values, private evidence identities or full source-line history. See Release_Testing.md; public reference closure validated. | Publish sanitized summary instead; preserve original locally. |
| docs/audit/CH005A_GOVERNANCE_CHANGE_MATRIX_v1.md | ?? | CH-005A packaging | EXCLUDE | Local paths, operational values, private evidence identities or full source-line history. See Release_Testing.md; public reference closure validated. | Publish sanitized summary instead; preserve original locally. |
| docs/audit/CH005A_GOVERNANCE_REVALIDATION_ADDENDUM_v1.md | ?? | CH-005A packaging | EXCLUDE | Local paths, operational values, private evidence identities or full source-line history. See Release_Testing.md; public reference closure validated. | Publish sanitized summary instead; preserve original locally. |
| docs/audit/CH005A_GOVERNANCE_VALIDATION_v1.md | ?? | CH-005A packaging | EXCLUDE | Local paths, operational values, private evidence identities or full source-line history. See Release_Testing.md; public reference closure validated. | Publish sanitized summary instead; preserve original locally. |
| docs/audit/CH005A_PORTFOLIO_ACCOUNT_VALIDATION_2026-11-03.md | ?? | CH-005A packaging | EXCLUDE | Local paths, operational values, private evidence identities or full source-line history. See Release_Testing.md; public reference closure validated. | Publish sanitized summary instead; preserve original locally. |
| docs/audit/CH005A_PUBLICATION_SUMMARY_v1.md | ?? | CH-005A packaging | INCLUDE | No actual customer/person values or operational totals; private artifact paths are generic repository-relative provisioning names. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| docs/governance/Calculation_Governance_CH004_v1.md | ?? | CH-004 | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/governance/Calculation_Governance_CH005A_v1.md | ?? | CH-005A packaging | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/governance/Data_Dictionary_CH004_v1.md | ?? | CH-004 | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/governance/Data_Dictionary_CH004_vNext.md | ?? | CH-004 | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/governance/Data_Dictionary_CH005A_v1.md | ?? | CH-005A packaging | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/governance/Data_Dictionary_CH005A_v2.md | ?? | CH-005A packaging | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/governance/KPI_Definitions_CH004_v1.md | ?? | CH-004 | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/governance/KPI_Definitions_CH005A_v1.md | ?? | CH-005A packaging | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/governance/MVP_Business_Rules_CH004_v1.md | ?? | CH-004 | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/governance/MVP_Business_Rules_CH005A_v1.md | ?? | CH-005A packaging | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/governance/Semantic_Visualization_Governance_CH004_v1.md | ?? | CH-004 | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/governance/Semantic_Visualization_Governance_CH005A_v1.md | ?? | CH-005A packaging | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/user-guides/Chart_and_Visual_Specification_CH004_v1.md | ?? | CH-004 | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/user-guides/Chart_and_Visual_Specification_CH005A_v1.md | ?? | CH-005A packaging | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/user-guides/Release_Testing.md | ?? | CH-005A packaging | INCLUDE | No actual customer/person values or operational totals; private artifact paths are generic repository-relative provisioning names. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| docs/user-guides/User_Guide_CH004_v1.md | ?? | CH-004 | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| docs/user-guides/User_Guide_CH005A_v1.md | ?? | CH-005A packaging | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| package-lock.json | ?? | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| package.json | ?? | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| requirements-test.txt | ?? | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| scripts/fixtures/portfolio-synthetic.cjs | ?? | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| scripts/legacy/test_portfolio_accounts_private.cjs | ?? | CH-005A packaging | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| scripts/legacy/verify_portfolio_accounts_private.cjs | ?? | CH-005A packaging | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| scripts/run_portfolio_private.cjs | ?? | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. Optional private-only archives and captures must be explicitly provisioned; missing inputs exit 2. | Include only after final approved allowlist review. |
| scripts/test_capacity_public.cjs | ?? | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| scripts/test_portfolio_accounts.cjs | ?? | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| scripts/verify_portfolio_accounts.cjs | ?? | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. Pinned Playwright, configured/installed browser, tracked synthetic fixture and runtime modules; no private payload. | Include only after final approved allowlist review. |
| scripts/verify_tempo_account_filters.cjs | ?? | CH-004 | EXCLUDE | May contain historical operational references; not part of public gate. See Release_Testing.md; public reference closure validated. | Retain locally. Private archives provisioned only for explicit private gate. |
| web/portfolio-accounts.js | ?? | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| web/portfolio-legacy-export.js | ?? | CH-005A packaging | INCLUDE | No credential pattern detected; source reviewed. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| docs/audit/CH005A_RELEASE_PACKAGING_REMEDIATION_v1.md | ?? | CH-005A packaging | EXCLUDE | Local paths, operational values, private evidence identities or full source-line history. See Release_Testing.md; public reference closure validated. | Publish sanitized summary instead; preserve original locally. |
| docs/audit/CH005A_RELEASE_PUBLICATION_MANIFEST_v1.json | ?? | CH-005A packaging | INCLUDE | Repository-relative paths and classifications only; no operational rows. See Release_Testing.md; public reference closure validated. | Include only after final approved allowlist review. |
| scripts/validate_release_package.cjs | ?? | CH-005A packaging | INCLUDE | No private values. Manifest, canonical files and existing tracked reference targets. | Run before release; organizational review still required. |

Full originals are preserved locally rather than scrubbed. Newly proposed sanitized summary and fixture contain no real customer/person rows or operational totals. Generic private capture paths are documented only to provision the optional gate. Existing tracked screenshots, reporting metadata with absolute paths, operational mapping and legacy named examples are separately flagged in the manifest; no removal or Git-history rewrite is performed. Production code retains pre-existing organization-specific URLs/mappings; packaging does not alter them.

Local-only boundaries remain data/raw/, web/data.js, web/build-manifest.json, data/.dashboard_sync_state.json, outputs/, .tmp/, installed node_modules and Python bytecode. Never force-add these to reproduce operational figures. Owner approval is required before publishing retained sensitive examples; source-pattern checks do not supply that approval.

## Protected functionality and retained exceptions

No change to Tempo Key/Client/Category mappings, Jira metadata, direct membership, linked/unlinked partition semantics, issue/worklog grains, hierarchy/confirmed zero, ownership/six teams, capacity/KPI formulas, Master Date authority, export arithmetic or independent Demand Management. Production web and builder files are byte-identical to task start. Historical reports/proposals, original CH004 verifier and private data/evidence are unchanged.

All accepted conditions remain: missing historical replay; pending external v2 consumer acceptance and required v1; Status category defect; Master Date fallback implementation exception; Epic-child Account data quality; observed membership not contractual ownership; unavailable effective-dated customer/Account history/crosswalk; negative treemap adjustment limitations; Bug Severity date conflict; Original-versus-Remaining contract distinction; deferred CH-005B. The public summary and canonicals retain these. No alternate rule or defect repair is approved here.

## Git integrity and next controlled step

Final expected status (sorted; checked after this report is created):

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
?? docs/audit/CH005A_PUBLICATION_SUMMARY_v1.md
?? docs/audit/CH005A_RELEASE_PACKAGING_REMEDIATION_v1.md
?? docs/audit/CH005A_RELEASE_PUBLICATION_MANIFEST_v1.json
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
?? docs/user-guides/Release_Testing.md
?? docs/user-guides/User_Guide_CH004_v1.md
?? docs/user-guides/User_Guide_CH005A_v1.md
?? package-lock.json
?? package.json
?? requirements-test.txt
?? scripts/fixtures/portfolio-synthetic.cjs
?? scripts/legacy/test_portfolio_accounts_private.cjs
?? scripts/legacy/verify_portfolio_accounts_private.cjs
?? scripts/run_portfolio_private.cjs
?? scripts/test_capacity_public.cjs
?? scripts/test_portfolio_accounts.cjs
?? scripts/validate_release_package.cjs
?? scripts/verify_portfolio_accounts.cjs
?? scripts/verify_tempo_account_filters.cjs
?? web/portfolio-accounts.js
?? web/portfolio-legacy-export.js
```

Branch/HEAD and recovery/stash refs unchanged. No staging, commit, push, baseline file or tag. v0.17 remains provisional. Next step is a read-only review of the exact manifest, owner decisions on eight INCLUDE AFTER REVIEW paths and existing tracked exposures, test/dependency outputs, editorial hash/line ledger and publication closure. Do not begin staging/publication until that review and explicit Delivery Management authorization. Remaining outcome is CONDITIONALLY READY on those approvals and environment portability confirmation; no application redesign or CH-005B is initiated.
