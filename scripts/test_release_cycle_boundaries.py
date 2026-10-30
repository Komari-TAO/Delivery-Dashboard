"""Regression coverage for inclusive, calendar-date release-cycle assignment."""

from __future__ import annotations

import unittest
from pathlib import Path
import sys

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_web_data import parse_worklog_date, release_for_date


class ReleaseCycleBoundaryTests(unittest.TestCase):
    def test_code_freeze_date_is_inclusive_at_all_times(self) -> None:
        releases = pd.DataFrame(
            {
                "Release Cycle": ["release-test"],
                "Start": [pd.Timestamp("2026-06-01")],
                "End": [pd.Timestamp("2026-06-05")],
            }
        )
        timestamps = pd.Series(
            [
                "2026-05-31 23:59:59",
                "2026-06-05 00:00:00",
                "2026-06-05 12:34:56",
                "2026-06-05 23:59:59",
                "2026-06-06 00:00:00",
            ]
        )

        # This exactly mirrors the worklog pipeline: release comparisons use
        # calendar dates, while Master Date continues to supply week membership.
        assigned = [
            release_for_date(worklog_date, releases)
            for worklog_date in parse_worklog_date(timestamps).dt.normalize()
        ]

        self.assertEqual(
            assigned,
            ["", "release-test", "release-test", "release-test", ""],
        )


if __name__ == "__main__":
    unittest.main()
