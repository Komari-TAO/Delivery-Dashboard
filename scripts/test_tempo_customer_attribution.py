"""Customer attribution at account, worklog and Jira-item grain."""
from __future__ import annotations

import json
import unittest
from pathlib import Path

import pandas as pd

from build_web_data import jira_customer_attribution, resolve_tempo_customers


class TempoCustomerAttributionTests(unittest.TestCase):
    def resolve(self, rows):
        frame = pd.DataFrame(rows, columns=["Work Item Key", "Account Key", "Account Name", "Account Customer"])
        return resolve_tempo_customers(frame)

    def test_account_names_are_not_customer_names_and_many_accounts_can_share_a_customer(self):
        rows, issues, audit = self.resolve([
            [" eng-1 ", "A", "Contract one", "Customer"],
            ["ENG-1", "B", "Contract two", "Customer"],
            ["ENG-2", "A", "Contract one", ""],
        ])
        self.assertEqual(rows.tempoCustomerAccount.tolist(), ["Customer"] * 3)
        self.assertEqual(issues["ENG-1"]["tempoCustomerAccount"], "Customer")
        self.assertEqual(issues["ENG-2"]["tempoCustomerAccount"], "Customer")
        self.assertEqual(len(audit["accountMappings"]), 2)

    def test_conflicting_account_key_is_quarantined_without_order_dependent_selection(self):
        evidence = [["ENG-1", "A", "Contract", "C1"], ["ENG-2", "A", "Contract", "C2"]]
        rows, issues, audit = self.resolve(evidence)
        reverse, reverse_issues, reverse_audit = self.resolve(list(reversed(evidence)))
        self.assertEqual(rows.tempoCustomerAccount.tolist(), ["N/A", "N/A"])
        self.assertEqual(issues, reverse_issues)
        self.assertEqual(audit, reverse_audit)
        self.assertEqual(reverse.tempoCustomerAccount.tolist(), ["N/A", "N/A"])

    def test_multi_customer_issue_is_na_but_worklog_customers_remain_direct(self):
        rows, issues, audit = self.resolve([
            ["ENG-1", "A", "Contract A", "C1"], ["ENG-1", "B", "Contract B", "C2"],
        ])
        self.assertEqual(rows.tempoCustomerAccount.tolist(), ["C1", "C2"])
        self.assertEqual(issues["ENG-1"], {"tempoCustomerAccount": "N/A", "clientAttributionStatus": "Multiple customers"})
        self.assertEqual(audit["issueExceptions"][0]["customers"], ["C1", "C2"])

    def test_missing_or_incomplete_evidence_never_uses_jira_or_parent_fallback(self):
        _, issues, _ = self.resolve([
            ["ENG-1", "A", "Contract", "C1"], ["ENG-1", "", "C1", ""],
            ["ENG-2", "B", "Customer-shaped name", ""],
            ["ENG-3", "", "", "Unverifiable without account key"],
        ])
        jira = jira_customer_attribution(pd.Series(["eng-1", "ENG-2", "ENG-3", "ENG-4"]), issues)
        self.assertEqual(jira.tempoCustomerAccount.tolist(), ["N/A"] * 4)
        self.assertEqual(jira.iloc[3].clientAttributionStatus, "No direct Tempo worklogs")

    def test_customer_schema_is_required(self):
        with self.assertRaisesRegex(ValueError, "Account Customer"):
            resolve_tempo_customers(pd.DataFrame({"Client": ["Legacy"]}))

    def test_generated_populations_and_customer_partition(self):
        root = Path(__file__).resolve().parents[1]
        payload = json.loads((root / "web/data.js").read_text(encoding="utf-8").removeprefix("window.BI_DATA = ").removesuffix(";\n"))
        valid = {m["customers"][0] for m in payload["meta"]["clientAttribution"]["accountMappings"] if m["status"] == "Verified"} | {"N/A"}
        for dataset in ["worklogs", "backlogWorklogs", "backlog", "demand"]:
            rows = payload[dataset]
            self.assertTrue(all(row["tempoCustomerAccount"] in valid for row in rows), dataset)
            self.assertTrue(all(row["clientAttributionStatus"] for row in rows), dataset)
            if dataset in ["backlog", "demand"]:
                self.assertEqual(len(rows), len({row["key"] for row in rows}))
            totals = {client: sum(float(row.get("logged") or 0) for row in rows if row["tempoCustomerAccount"] == client) for client in valid}
            self.assertAlmostEqual(sum(totals.values()), sum(float(row.get("logged") or 0) for row in rows), places=6)
        self.assertEqual([r["tempoCustomerAccount"] for r in payload["worklogs"]], [r["tempoCustomerAccount"] for r in payload["backlogWorklogs"]])
        self.assertTrue(any(r["tempoCustomerAccount"] == "N/A" and r["clientAttributionStatus"] == "No direct Tempo worklogs" for r in payload["backlog"]))


if __name__ == "__main__":
    unittest.main(verbosity=2)
