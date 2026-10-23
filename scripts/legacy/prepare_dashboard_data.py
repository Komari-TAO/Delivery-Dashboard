from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd

from governed_exclusions import partition_governed_issue_rows


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "outputs" / "bi_dashboard"

SOURCES = {
    "jira_backlog": ROOT / "All Jira Work Items marked PI Backlog (JIRA)_20260529.csv",
    "tempo_worklogs": ROOT / "RAW_DATA_FULL_ANALYSIS_01_Jan_26_29_May_26.csv",
    "weekly_capacity": ROOT / "Weekly Capacity_20260529.csv",
    "assignees_master": ROOT / "Power BI_00 20260307_Assignees_Capacity - Master Teams and Assignees PBI.csv",
    "release_cycle": ROOT / "Release Cycle - Release Cycle.csv",
}


def number(value: Any, digits: int = 2) -> float:
    if pd.isna(value):
        return 0.0
    return round(float(value), digits)


def records(df: pd.DataFrame, digits: int = 2) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for row in df.to_dict(orient="records"):
        clean: dict[str, Any] = {}
        for key, value in row.items():
            if pd.isna(value):
                clean[key] = ""
            elif isinstance(value, float):
                clean[key] = round(value, digits)
            elif isinstance(value, (pd.Timestamp, datetime)):
                clean[key] = value.strftime("%Y-%m-%d")
            else:
                clean[key] = value
        out.append(clean)
    return out


def top_counts(df: pd.DataFrame, column: str, label: str, limit: int = 12) -> pd.DataFrame:
    if column not in df.columns:
        return pd.DataFrame(columns=[label, "Items"])
    counts = (
        df[column]
        .fillna("(blank)")
        .astype(str)
        .value_counts(dropna=False)
        .head(limit)
        .reset_index()
    )
    counts.columns = [label, "Items"]
    return counts


def parse_jira_date(series: pd.Series) -> pd.Series:
    parsed = pd.to_datetime(series, format="%d/%b/%y %I:%M %p", errors="coerce")
    fallback = pd.to_datetime(series, errors="coerce", dayfirst=True)
    return parsed.fillna(fallback)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    worklogs = pd.read_csv(SOURCES["tempo_worklogs"], low_memory=False)
    backlog = pd.read_csv(SOURCES["jira_backlog"], low_memory=False)
    worklogs, _ = partition_governed_issue_rows(worklogs, "Work Item Key")
    backlog, _ = partition_governed_issue_rows(backlog, "Issue key")
    capacity = pd.read_csv(SOURCES["weekly_capacity"], low_memory=False)
    assignees = pd.read_csv(SOURCES["assignees_master"], low_memory=False)

    worklogs["Logged Hours"] = pd.to_numeric(worklogs["Logged Hours"], errors="coerce").fillna(0.0)
    worklogs["Billable Hours"] = pd.to_numeric(worklogs["Billable Hours"], errors="coerce").fillna(0.0)
    worklogs["Work date parsed"] = pd.to_datetime(worklogs["Work date"], errors="coerce")
    worklogs = worklogs[worklogs["Work date parsed"].notna()].copy()
    worklogs["Month"] = worklogs["Work date parsed"].dt.to_period("M").astype(str)
    worklogs["Week Number"] = worklogs["Work date parsed"].dt.isocalendar().week.astype(int)

    max_work_date = worklogs["Work date parsed"].max()
    max_week = int(max_work_date.isocalendar().week)
    period_start = worklogs["Work date parsed"].min().strftime("%Y-%m-%d")
    period_end = max_work_date.strftime("%Y-%m-%d")

    capacity = capacity[capacity["Assignee"].notna()].copy()
    capacity["Planned Hours"] = pd.to_numeric(capacity["Planned Hours"], errors="coerce").fillna(0.0)
    capacity["Week Number"] = pd.to_numeric(capacity["Week Number"], errors="coerce")
    capacity = capacity[capacity["Week Number"].notna()].copy()
    capacity["Week Number"] = capacity["Week Number"].astype(int)
    capacity_ytd = capacity[capacity["Week Number"] <= max_week].copy()

    team_work = (
        worklogs.groupby("Tempo Team", dropna=False)
        .agg(
            Logged_Hours=("Logged Hours", "sum"),
            Billable_Hours=("Billable Hours", "sum"),
            Worklogs=("Tempo Worklog ID", "count"),
            Unique_Work_Items=("Work Item Key", "nunique"),
            Active_People=("Full name", "nunique"),
        )
        .reset_index()
        .rename(columns={"Tempo Team": "Team"})
    )
    team_capacity_ytd = (
        capacity_ytd.groupby("Team", dropna=False)
        .agg(Planned_Hours_YTD=("Planned Hours", "sum"), Planned_People=("Assignee", "nunique"))
        .reset_index()
    )
    team_capacity_year = (
        capacity.groupby("Team", dropna=False)
        .agg(Planned_Hours_FY=("Planned Hours", "sum"))
        .reset_index()
    )
    team = team_work.merge(team_capacity_ytd, on="Team", how="outer").merge(
        team_capacity_year, on="Team", how="outer"
    )
    for col in ["Logged_Hours", "Billable_Hours", "Planned_Hours_YTD", "Planned_Hours_FY"]:
        team[col] = pd.to_numeric(team[col], errors="coerce").fillna(0.0)
    for col in ["Worklogs", "Unique_Work_Items", "Active_People", "Planned_People"]:
        team[col] = pd.to_numeric(team[col], errors="coerce").fillna(0).astype(int)
    team["Utilization"] = team.apply(
        lambda r: r["Logged_Hours"] / r["Planned_Hours_YTD"] if r["Planned_Hours_YTD"] else 0.0,
        axis=1,
    )
    team["Billable_Mix"] = team.apply(
        lambda r: r["Billable_Hours"] / r["Logged_Hours"] if r["Logged_Hours"] else 0.0,
        axis=1,
    )
    team = team.sort_values("Logged_Hours", ascending=False)

    monthly = (
        worklogs.groupby("Month")
        .agg(
            Logged_Hours=("Logged Hours", "sum"),
            Billable_Hours=("Billable Hours", "sum"),
            Worklogs=("Tempo Worklog ID", "count"),
            Unique_Work_Items=("Work Item Key", "nunique"),
            Active_People=("Full name", "nunique"),
        )
        .reset_index()
    )

    account = (
        worklogs.groupby(["Account Name", "Account Category", "Account Customer"], dropna=False)
        .agg(
            Logged_Hours=("Logged Hours", "sum"),
            Billable_Hours=("Billable Hours", "sum"),
            Unique_Work_Items=("Work Item Key", "nunique"),
        )
        .reset_index()
        .sort_values("Logged_Hours", ascending=False)
        .head(18)
    )
    account["Billable_Mix"] = account.apply(
        lambda r: r["Billable_Hours"] / r["Logged_Hours"] if r["Logged_Hours"] else 0.0,
        axis=1,
    )

    category = (
        worklogs.groupby("Account Category", dropna=False)
        .agg(
            Logged_Hours=("Logged Hours", "sum"),
            Billable_Hours=("Billable Hours", "sum"),
            Unique_Work_Items=("Work Item Key", "nunique"),
        )
        .reset_index()
        .sort_values("Logged_Hours", ascending=False)
    )
    category["Billable_Mix"] = category.apply(
        lambda r: r["Billable_Hours"] / r["Logged_Hours"] if r["Logged_Hours"] else 0.0,
        axis=1,
    )

    backlog["Created parsed"] = parse_jira_date(backlog["Created"])
    backlog["Updated parsed"] = parse_jira_date(backlog["Updated"])
    current_date = pd.Timestamp("2026-05-29")
    open_backlog = backlog[backlog["Status Category"].fillna("") != "Done"].copy()
    open_backlog["Age Days"] = (current_date - open_backlog["Created parsed"]).dt.days
    open_backlog["Age Bucket"] = pd.cut(
        open_backlog["Age Days"],
        bins=[-1, 30, 60, 90, 180, 365, 10000],
        labels=["0-30", "31-60", "61-90", "91-180", "181-365", "365+"],
    ).astype(str)

    high_risk_priority = {"Blocker", "Highest", "High", "Urgent (Overtime)"}
    high_risk_open = open_backlog[open_backlog["Priority"].isin(high_risk_priority)]

    status_category = top_counts(backlog, "Status Category", "Status Category", 10)
    priority_all = top_counts(backlog, "Priority", "Priority", 10)
    issue_type = top_counts(backlog, "Issue Type", "Issue Type", 12)
    open_priority = top_counts(open_backlog, "Priority", "Priority", 10)
    open_status = top_counts(open_backlog, "Status", "Status", 12)
    open_aging = top_counts(open_backlog, "Age Bucket", "Age Bucket", 10)

    open_projects = (
        open_backlog.groupby(["Project key", "Project name"], dropna=False)
        .size()
        .reset_index(name="Open Items")
        .sort_values("Open Items", ascending=False)
        .head(15)
    )
    open_assignees = (
        open_backlog.groupby("Assignee", dropna=False)
        .size()
        .reset_index(name="Open Items")
        .sort_values("Open Items", ascending=False)
        .head(15)
    )
    open_assignees["Assignee"] = open_assignees["Assignee"].fillna("(unassigned)")

    source_files = []
    for name, path in SOURCES.items():
        if path.exists():
            df_rows = {
                "tempo_worklogs": len(worklogs),
                "jira_backlog": len(backlog),
                "weekly_capacity": len(capacity),
                "assignees_master": len(assignees),
            }.get(name, "")
            source_files.append(
                {
                    "Source": name,
                    "File": path.name,
                    "Rows Used": df_rows,
                    "Modified": datetime.fromtimestamp(path.stat().st_mtime).strftime("%Y-%m-%d %H:%M"),
                }
            )

    total_logged = worklogs["Logged Hours"].sum()
    total_billable = worklogs["Billable Hours"].sum()
    planned_ytd = capacity_ytd["Planned Hours"].sum()
    summary = {
        "title": "Delivery Management BI Dashboard",
        "period_start": period_start,
        "period_end": period_end,
        "max_work_week": max_week,
        "generated_on": "2026-05-29",
        "kpis": {
            "Logged Hours": number(total_logged, 1),
            "Billable Hours": number(total_billable, 1),
            "Billable Mix": number(total_billable / total_logged if total_logged else 0, 4),
            "YTD Capacity Hours": number(planned_ytd, 1),
            "Capacity Utilization": number(total_logged / planned_ytd if planned_ytd else 0, 4),
            "Active People": int(worklogs["Full name"].nunique()),
            "Unique Work Items": int(worklogs["Work Item Key"].nunique()),
            "Open Backlog Items": int(len(open_backlog)),
            "High Risk Open Items": int(len(high_risk_open)),
            "Done Backlog Items": int((backlog["Status Category"] == "Done").sum()),
        },
        "notes": [
            "The Google Docs pointer file exists locally but could not be read through the Google Drive mount; this workbook was generated from the CSV sources in the workspace.",
            f"Capacity utilization compares logged hours through week {max_week} with planned capacity for weeks 1-{max_week}.",
            "Backlog health uses Jira Status Category; open backlog excludes records whose Status Category is Done.",
        ],
    }

    payload = {
        "summary": summary,
        "team_summary": records(team),
        "monthly_summary": records(monthly),
        "account_summary": records(account),
        "category_summary": records(category),
        "status_category": records(status_category, digits=0),
        "priority_all": records(priority_all, digits=0),
        "issue_type": records(issue_type, digits=0),
        "open_priority": records(open_priority, digits=0),
        "open_status": records(open_status, digits=0),
        "open_aging": records(open_aging, digits=0),
        "open_projects": records(open_projects, digits=0),
        "open_assignees": records(open_assignees, digits=0),
        "source_files": source_files,
    }

    output_path = OUTPUT_DIR / "dashboard_data.json"
    output_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(output_path)


if __name__ == "__main__":
    main()
