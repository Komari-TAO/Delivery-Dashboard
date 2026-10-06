from __future__ import annotations

import json
import unittest
from pathlib import Path

import pandas as pd

from governed_exclusions import (
    GLOBAL_EXCLUDED_ISSUE_KEYS,
    globally_excluded_issue_mask,
    normalize_issue_key,
    partition_governed_issue_rows,
)


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_EXCLUSIONS = {
    "TEMPO-54",
    "TEMPO-92",
    "TEMPO-106",
    "TEMPO-111",
    "TEMPO-112",
}


class GlobalTempoExclusionTests(unittest.TestCase):
    def setUp(self) -> None:
        self.activity = pd.DataFrame(
            [
                {"key": key, "logged": 1.0, "planned": 2.0, "billable": 0.5, "remaining": 3.0}
                for key in sorted(EXPECTED_EXCLUSIONS)
            ]
            + [
                {"key": " tempo-54 ", "logged": 4.0, "planned": 5.0, "billable": 1.0, "remaining": 6.0},
                {"key": "tempo-92", "logged": 4.0, "planned": 5.0, "billable": 1.0, "remaining": 6.0},
                {"key": "  Tempo-106  ", "logged": 4.0, "planned": 5.0, "billable": 1.0, "remaining": 6.0},
                {"key": "tempo-111 ", "logged": 4.0, "planned": 5.0, "billable": 1.0, "remaining": 6.0},
                {"key": " TEMPO-112", "logged": 4.0, "planned": 5.0, "billable": 1.0, "remaining": 6.0},
                {"key": "TEMPO-540", "logged": 7.0, "planned": 8.0, "billable": 2.0, "remaining": 9.0},
                {"key": "TEMPO-30", "logged": 10.0, "planned": 11.0, "billable": 3.0, "remaining": 12.0},
                {"key": "ENG-123", "logged": 13.0, "planned": 14.0, "billable": 4.0, "remaining": 15.0},
            ]
        )

    def test_central_set_is_exact_and_immutable(self) -> None:
        self.assertIsInstance(GLOBAL_EXCLUDED_ISSUE_KEYS, frozenset)
        self.assertEqual(GLOBAL_EXCLUDED_ISSUE_KEYS, EXPECTED_EXCLUSIONS)
        with self.assertRaises(AttributeError):
            GLOBAL_EXCLUDED_ISSUE_KEYS.add("TEMPO-540")  # type: ignore[attr-defined]

    def test_normalization_and_exact_matching(self) -> None:
        self.assertEqual(normalize_issue_key(" tempo-54 "), "TEMPO-54")
        self.assertTrue(globally_excluded_issue_mask(pd.Series([" tempo-111 "])).iloc[0])
        self.assertFalse(globally_excluded_issue_mask(pd.Series(["TEMPO-540"])).iloc[0])

    def test_excluded_rows_contribute_zero_to_governed_metrics(self) -> None:
        governed, excluded = partition_governed_issue_rows(self.activity, "key")
        self.assertEqual(set(excluded["key"]), EXPECTED_EXCLUSIONS)
        self.assertEqual(len(excluded), 10)
        for key in EXPECTED_EXCLUSIONS:
            key_rows = governed[governed["key"] == key]
            self.assertEqual(len(key_rows), 0)
            for field in ("logged", "planned", "billable", "remaining"):
                self.assertEqual(float(key_rows[field].sum()), 0.0)

        self.assertEqual(set(governed["key"]), {"TEMPO-30", "TEMPO-540", "ENG-123"})
        self.assertEqual(len(governed), 3)
        self.assertEqual(governed["key"].nunique(), 3)

    def test_valid_operations_engineering_and_reconciliation_remain(self) -> None:
        governed, _ = partition_governed_issue_rows(self.activity, "key")
        operations = governed[governed["key"].str.startswith("TEMPO-")]["logged"].sum()
        engineering = governed[~governed["key"].str.startswith("TEMPO-")]["logged"].sum()
        logged_total = governed["logged"].sum()

        self.assertEqual(float(operations), 17.0)
        self.assertEqual(float(engineering), 13.0)
        self.assertEqual(float(logged_total), float(engineering + operations))
        self.assertIn("TEMPO-30", set(governed["key"]))
        self.assertIn("ENG-123", set(governed["key"]))

    def test_filters_cannot_reintroduce_excluded_rows(self) -> None:
        governed, _ = partition_governed_issue_rows(self.activity, "key")
        for selected_key in EXPECTED_EXCLUSIONS:
            self.assertTrue(governed[governed["key"] == selected_key].empty)

    def test_capacity_sources_are_outside_issue_exclusion(self) -> None:
        annual_capacity = pd.DataFrame({"assignee": ["A", "B"], "hours": [1800.0, 1700.0]})
        weekly_capacity = pd.DataFrame({"assignee": ["A", "B"], "planned": [40.0, 36.0]})
        annual_before = annual_capacity["hours"].sum()
        weekly_before = weekly_capacity["planned"].sum()
        partition_governed_issue_rows(self.activity, "key")
        self.assertEqual(float(annual_capacity["hours"].sum()), float(annual_before))
        self.assertEqual(float(weekly_capacity["planned"].sum()), float(weekly_before))

    def test_generated_dashboard_uses_post_exclusion_populations(self) -> None:
        data_path = ROOT / "web" / "data.js"
        text = data_path.read_text(encoding="utf-8")
        payload = json.loads(text.removeprefix("window.BI_DATA = ").removesuffix(";\n"))
        self.assertEqual(set(payload["meta"]["excludedIssueKeys"]), EXPECTED_EXCLUSIONS)

        governed_datasets = ("worklogs", "backlogWorklogs", "backlog", "tempoOperationalMappings", "tempoDescriptions")
        for dataset_name in governed_datasets:
            leaked = {
                normalize_issue_key(row.get("key"))
                for row in payload.get(dataset_name, [])
                if normalize_issue_key(row.get("key")) in EXPECTED_EXCLUSIONS
            }
            self.assertEqual(leaked, set(), dataset_name)

        worklogs = payload["worklogs"]
        logged_total = sum(float(row.get("logged") or 0) for row in worklogs)
        logged_engineering = sum(
            float(row.get("logged") or 0)
            for row in worklogs
            if not normalize_issue_key(row.get("key")).startswith("TEMPO-")
        )
        logged_operations = sum(
            float(row.get("logged") or 0)
            for row in worklogs
            if normalize_issue_key(row.get("key")).startswith("TEMPO-")
        )
        self.assertAlmostEqual(logged_total, logged_engineering + logged_operations, places=6)


if __name__ == "__main__":
    unittest.main(verbosity=2)
