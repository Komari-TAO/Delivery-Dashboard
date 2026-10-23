from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
FILES = {
    "jira_backlog": ROOT / "All Jira Work Items marked PI Backlog (JIRA)_20260529.csv",
    "tempo_worklogs": ROOT / "RAW_DATA_FULL_ANALYSIS_01_Jan_26_29_May_26.csv",
    "weekly_capacity": ROOT / "Weekly Capacity_20260529.csv",
    "assignees_master": ROOT / "Power BI_00 20260307_Assignees_Capacity - Master Teams and Assignees PBI.csv",
    "date_master": ROOT / "Power BI_00 20260307_Master_Date - Master Date PBI.csv",
    "release_cycle": ROOT / "Release Cycle - Release Cycle.csv",
}


def compact_counts(series: pd.Series, limit: int = 12) -> list[dict[str, object]]:
    counts = series.fillna("(blank)").astype(str).value_counts(dropna=False).head(limit)
    return [{"value": idx, "count": int(value)} for idx, value in counts.items()]


def main() -> None:
    summary: dict[str, object] = {}
    for key, path in FILES.items():
        if not path.exists():
            summary[key] = {"exists": False}
            continue

        df = pd.read_csv(path, low_memory=False)
        fields = [str(col) for col in df.columns]
        item: dict[str, object] = {
            "exists": True,
            "file": path.name,
            "rows": int(len(df)),
            "columns": len(fields),
            "sample_columns": fields[:40],
        }

        for col in [
            "Status",
            "Status Category",
            "Priority",
            "Issue Type",
            "Team Name",
            "Team",
            "Tempo Team",
            "Program",
            "Account Name",
            "Account Category",
            "Account Customer",
            "Work Item Status",
            "Work Item Type",
            "Assignee",
            "Full name",
            "Role",
            "Skill",
            "Week Label",
        ]:
            if col in df.columns:
                item[f"top_{col}"] = compact_counts(df[col])

        for col in ["Logged Hours", "Billable Hours", "Planned Hours", "Total"]:
            if col in df.columns:
                nums = pd.to_numeric(df[col], errors="coerce")
                item[f"sum_{col}"] = float(nums.sum())
                item[f"mean_{col}"] = float(nums.mean()) if nums.notna().any() else None

        for col in ["Work date", "Created", "Updated", "Resolved", "Date created", "Date updated"]:
            if col in df.columns:
                parsed = pd.to_datetime(df[col], errors="coerce", dayfirst=True)
                if parsed.notna().any():
                    item[f"min_{col}"] = parsed.min().strftime("%Y-%m-%d")
                    item[f"max_{col}"] = parsed.max().strftime("%Y-%m-%d")

        summary[key] = item

    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
