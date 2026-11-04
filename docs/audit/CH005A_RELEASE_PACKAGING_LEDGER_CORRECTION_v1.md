# CH-005A release-packaging ledger correction v1

Date: 2026-11-04. Local corrective evidence; excluded from publication. The original remediation report is unchanged. Its Canonical before/after hashes section (line 91) was correct; its Exact documentation line ledger section (line 105 onward) decoded UTF-8 text incorrectly while generating literal arrays. This was an evidence-encoding defect, not a semantic canonical defect.

## Exact recovery

Each preserved proposal below was hashed and matched to the original ledger beforeHash. Each Step 8 publication canonical was hashed and matched to afterHash before any Step 10 edit. Diffs were independently regenerated with Python -X utf8, json input/output and difflib.SequenceMatcher(autojunk=False). All seven old/new arrays below are correct Unicode and retain one-based oldStart/oldEnd/newStart/newEnd coordinates. An insertion has end less than start. Replaying each change in reverse order on source splitlines reproduces the Step 8 canonical exactly, including its final LF. Use UTF-8 explicitly; do not rely on Windows' default code page.

The recovered text is read from verified files, not repaired by guessing characters. Source proposals identify original approved content; new arrays identify metadata/reference-only publication edits. Full arrays are local-only evidence. No business, formula, filter, date or aggregation rule is changed by ledger correction.

| Canonical | Verified approved source | Approved source SHA-256 | Step 8 publication SHA-256 |
| --- | --- | --- | --- |
| docs/governance/Data_Dictionary.md | docs/governance/Data_Dictionary_CH005A_v2.md | 78266cb6e22e5db7d8fec6d80ce171ad1b7e472922fce4a189afc05298f8077c | 5f0ae0b9fbd6c7cf2c44f104ee54ca57bb38d9ca7dfd89bcaae618ef1e619d64 |
| docs/governance/MVP_Business_Rules.md | docs/governance/MVP_Business_Rules_CH005A_v1.md | 2e399cf196e2598cf25ebe5821fd0329125250c7f0bea72c7569f23bdcc912ad | 19a56574e9b7e128585125aef0fe76dde81f45689482b613a221ff0b2a50e3e0 |
| docs/governance/Calculation_Governance.md | docs/governance/Calculation_Governance_CH005A_v1.md | 535b729cb0f37855298548f12377427308174c5f85dd65c254e038848e27b75b | 9fe03c9523faa90d371d8932c57c2b914a5928e11ab59a848fce39c358b5abe1 |
| docs/governance/KPI_Definitions.md | docs/governance/KPI_Definitions_CH005A_v1.md | 7e4d861ea1caab225c6e927b3b821e2ea836a7d74d81dd84b724593c25ab9dde | 1e8a9f376a99bca19733ac1ac1d9fae0a16db51af85d90e2b21b9ce1463df879 |
| docs/governance/Semantic_Visualization_Governance.md | docs/governance/Semantic_Visualization_Governance_CH005A_v1.md | f0056df8b885c041865948d4f01f6d6b591e13b5269fb8e1a4f6489bab42bb66 | dac289383a6039d15427c06c26cd71c18f328bc66bfa1cbfe61afabe2eb63079 |
| docs/user-guides/Chart_and_Visual_Specification.md | docs/user-guides/Chart_and_Visual_Specification_CH005A_v1.md | a80bf398dce986d1bb13b150d27f682b5a1d3f46c43704726822c08e53e172c4 | 9568ca4422a7f2c06f9c227b50af12c8ef9bc6790a2e08c7ba102ac3713f62e1 |
| docs/user-guides/User_Guide.md | docs/user-guides/User_Guide_CH005A_v1.md | a045c71ba18860db1c360a3e2b7e5a577c925b6d8896b6f15c9157f7ba9b44de | 7a8123d18ec3121ba476a94404e392c07981f7c30c526a2880f9366ff5b7f4c1 |

## Corrected exact Step 8 ledger

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
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1–D3 and D5–D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
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
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |",
          "| CH-005A v2 | 2026-11-04 corrected successor: (A) exact Tempo Account Category → payload category mapping; (B) limit Key identity to Portfolio Account, retaining existing label values for Client and Status. No formula, source, payload or business-rule change. |",
          "",
          "## CH-005A decision and evidence boundary",
          "",
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
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
    ],
    "verifiedSource": "docs/governance/Data_Dictionary_CH005A_v2.md"
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
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1–D3 and D5–D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
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
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
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
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
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
    ],
    "verifiedSource": "docs/governance/MVP_Business_Rules_CH005A_v1.md"
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
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1–D3 and D5–D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
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
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
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
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
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
    ],
    "verifiedSource": "docs/governance/Calculation_Governance_CH005A_v1.md"
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
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1–D3 and D5–D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
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
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
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
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
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
    ],
    "verifiedSource": "docs/governance/KPI_Definitions_CH005A_v1.md"
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
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1–D3 and D5–D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
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
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
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
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
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
          "Client = Tempo Customer Account, never Jira Client, Tempo Account Name, or Jira Account. Both tabs and the Portfolio snapshot export use `tempoCustomerAccount` through the shared `DashboardCore.clientValue` helper. Worklogs retain their direct account/customer attribution; Jira counts and estimates use only complete, single-customer direct issue mappings. Missing or ambiguous items remain visible under `N/A` without parent inheritance or splitting estimates. See [Calculation Governance](Calculation_Governance_CH005A_v1.md#client-attribution-2026-10-22) for the deterministic rule. Full-source KPIs and Delivered Features retain their existing exceptions; current annual Portfolio cards use the scope described above. Workforce capacity is not customer allocated. Portfolio Account Key selection does not synchronize with Demand’s independent Jira Account picker or redefine its planning behavior; CH-005B remains deferred."
        ],
        "new": [
          "Client = Tempo Customer Account, never Jira Client, Tempo Account Name, or Jira Account. Both tabs and the Portfolio snapshot export use `tempoCustomerAccount` through the shared `DashboardCore.clientValue` helper. Worklogs retain their direct account/customer attribution; Jira counts and estimates use only complete, single-customer direct issue mappings. Missing or ambiguous items remain visible under `N/A` without parent inheritance or splitting estimates. See [Calculation Governance](Calculation_Governance.md#client-attribution-2026-10-22) for the deterministic rule. Full-source KPIs and Delivered Features retain their existing exceptions; current annual Portfolio cards use the scope described above. Workforce capacity is not customer allocated. Portfolio Account Key selection does not synchronize with Demand’s independent Jira Account picker or redefine its planning behavior; CH-005B remains deferred."
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
    ],
    "verifiedSource": "docs/governance/Semantic_Visualization_Governance_CH005A_v1.md"
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
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1–D3 and D5–D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
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
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
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
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
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
          "- Jira Account diagnostic partitions remain separate. Historical audit narratives describe earlier controls; current evidence is in [Step 3 validation](../audit/CH004_DATA_DICTIONARY_VALIDATION_2026-11-03.md) and [Step 4 validation](../audit/CH004_STEP4_GOVERNANCE_VALIDATION_v1_2026-11-03.md). G4–G10 remain qualified there."
        ],
        "new": [
          "- Jira Account diagnostic partitions remain separate. Historical audit narratives describe earlier controls; current evidence is in [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) and [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md). G4–G10 remain qualified there."
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
    ],
    "verifiedSource": "docs/user-guides/Chart_and_Visual_Specification_CH005A_v1.md"
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
          "Historical governance reference: [pinned GitHub record](https://github.com/Komari-TAO/Delivery-Dashboard/tree/3ca6ef0393f119582792bf5b4f2aec4c3873bf4a). CH-004 G1 approval is limited to Account Distribution. CH-005A D1–D3 and D5–D8 cover the approved Portfolio consolidation; D4 defers Demand Management consolidation. Approval is conditional on the documented current-source scope. The accepted unresolved exceptions remain in force."
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
          "| CH-004 v1 | 2026-11-03 proposal; scoped G1 treemap approval, G2/G3 documentation corrections, remaining G4–G10 qualifications preserved. |",
          "| CH-005A v1 | 2026-11-04 successor; D1–D3/D5–D8 Portfolio consolidation, D4 deferred; documentation-only, conditional scope. |"
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
          "This local proposal records conditional acceptance for the validated current-source Portfolio scope. The user's CH-004 Step 4 instruction approved G1 for Account Distribution only: remove Jira Account-restricted tile eligibility and the exception-only footer. G2/G3 were documentation corrections, not additional business approvals. CH-005A D1–D3 and D5–D8 authorize the Portfolio changes below; D4 explicitly defers Demand Management consolidation to CH-005B. The Step 5 request authorizes this documentation alignment, not canonical promotion or implementation changes.",
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
    ],
    "verifiedSource": "docs/user-guides/User_Guide_CH005A_v1.md"
  }
]
```

## Step 10 authorized reference correction

File: docs/governance/Data_Dictionary.md. Before SHA-256: 5f0ae0b9fbd6c7cf2c44f104ee54ca57bb38d9ca7dfd89bcaae618ef1e619d64. After SHA-256: 399b64db4df3828e2fb97127927ef11e49dbfe990029f6a84f270b07999a391c.

Exact original prefix:

```text
D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. [publication evidence summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) defines 13 columns in order:
```

Exact replacement prefix:

```text
D6: snapshot v2 and planning v2 are explicitly versioned, not externally accepted. The canonical schema in this Data Dictionary, under [CH-005A exports and compatibility](#ch-005a-exports-and-compatibility), defines 13 columns in order:
```

The rest of that paragraph, including all 13 names and their order, remains byte-identical. Reversing this single prefix replacement reproduces the exact Step 8 dictionary. No field/type/export behavior or ownership changes. The other six canonicals are unchanged. The Step 8 reconstruction above uses the pre-Step-10 dictionary hash; the current hash is separately recorded here, not retroactively substituted.

## Summary v2 correction

Summary v1 remains unchanged, SHA-256 016364c456d24505aa7d646ba3e38d695443d65e142417d4d92248c820cae199. Summary v2 SHA-256 56539116108adeb4a7b7bff908aae3bbdf6d863901968918ed0f23a88388121d. Only title v1 → v2 and this exact sentence replacement differ:

```json
{
  "old": "Private captures, raw exports, generated payloads, operational ledgers and screenshots are excluded from the publication package.",
  "new": "Private captures, raw exports, generated payloads, operational ledgers and private/generated screenshots are excluded from the proposed publication package. Historical verification screenshots already tracked in Git remain in the repository and Git history unless separately authorized for removal. They have not been cleared by this review for privacy; no modification, regeneration, removal or redistribution is authorized here."
}
```

Tracked historical screenshots remain in the repository/history and are not cleared for privacy. No screenshot has been modified, removed, regenerated or redistributed.

## Publication reference strategy and validation

Summary v2 supersedes v1 as the current publication explanation. Existing canonical references to v1 remain outside this task's edit authorization; v1 is retained in the package as a historical compatibility dependency, interpreted with v2's explicit clarification. Manifest v1 remains an immutable compatibility input for the existing documentation validator; manifest v2 alone controls proposed staging decisions. Do not use v1 as a staging allowlist. No other canonical or test was changed to route these references.

Manifest v2 and this full ledger remain local-only. Excluding the new manifest from publication avoids a circular self-file hash: all actual publication candidates have ordinary full-byte SHA-256 values in manifest v2. The pending approval register is also local-only. Public/private setup and accepted limitations remain as documented.

Safe validation: public Account/KPI and capacity tests, existing read-only documentation validator and independent v2 manifest/link/hash checks. Detailed outcomes are reported in the completion response; browser/private artifact-producing gates are not claimed freshly rerun. All 18 protected formula blocks remain exact. Publication approvals remain PENDING; no staging/commit/push/tag/baseline operation is authorized.
