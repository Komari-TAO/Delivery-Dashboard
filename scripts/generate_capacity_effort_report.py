from __future__ import annotations

"""Build report-specific, read-only evidence for the 2026 capacity report."""

import json
import re
import unicodedata
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUT = ROOT / "outputs" / "2026_capacity_effort_report"
EXCLUDED = {"TEMPO-54", "TEMPO-92", "TEMPO-106", "TEMPO-111", "TEMPO-112"}


def latest(pattern: str) -> Path:
    paths = list(RAW.glob(pattern))
    if not paths:
        raise FileNotFoundError(pattern)
    return max(paths, key=lambda p: (p.name, p.stat().st_mtime))


def txt(series: pd.Series) -> pd.Series:
    return series.fillna("").astype(str).str.strip()


def num(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series.astype(str).str.replace(",", "", regex=False), errors="coerce").fillna(0.0)


def assignee_key(value: object) -> str:
    value = "" if pd.isna(value) else str(value).strip()
    value = "".join(c for c in unicodedata.normalize("NFD", value) if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", re.sub(r"[._-]+", " ", value).lower()).strip()


def first_value(row: pd.Series, names: list[str]) -> str:
    for name in names:
        value = row.get(name, "")
        if pd.notna(value) and str(value).strip():
            return str(value).strip()
    return ""


def records(df: pd.DataFrame) -> list[dict]:
    result = []
    for row in df.to_dict("records"):
        item = {}
        for key, value in row.items():
            if pd.isna(value):
                item[key] = None
            elif isinstance(value, (pd.Timestamp,)):
                item[key] = value.strftime("%Y-%m-%d")
            elif hasattr(value, "item"):
                item[key] = value.item()
            else:
                item[key] = value
        result.append(item)
    return result


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    tempo_path = latest("RAW_DATA_FULL_ANALYSIS_*.csv")
    jira_path = latest("All Jira Work Items marked PI Backlog (JIRA)_*.csv")
    capacity_path = latest("Weekly Capacity_*.csv")
    assignees_path = latest("*Assignees*Capacit*.csv")
    master_path = latest("*Master*Date*.csv")

    assignees = pd.read_csv(assignees_path, low_memory=False)
    assignees["nameKey"] = txt(assignees["Assignee"]).map(assignee_key)
    people = assignees.drop_duplicates("nameKey").set_index("nameKey")
    team_by_person = people["Team"].to_dict()

    master = pd.read_csv(master_path, low_memory=False)
    master["date"] = pd.to_datetime(master["Master Date"], dayfirst=True, errors="coerce").dt.normalize()
    master = master[master["date"].dt.year.eq(2026)].copy()
    master["week"] = pd.to_numeric(master["Week Number"], errors="coerce")
    week_by_date = master.dropna(subset=["date", "week"]).set_index("date")["week"].astype(int).to_dict()
    week_bounds = master.dropna(subset=["date", "week"]).groupby("week")["date"].agg(["min", "max"]).reset_index()

    tempo = pd.read_csv(tempo_path, low_memory=False)
    tempo["key"] = txt(tempo["Work Item Key"]).str.upper()
    tempo["logged"] = num(tempo["Logged Hours"])
    tempo["date"] = pd.to_datetime(tempo["Work date"], errors="coerce").dt.normalize()
    tempo = tempo[(~tempo["key"].isin(EXCLUDED)) & tempo["date"].notna()].copy()
    tempo = tempo[tempo["date"].dt.year.eq(2026)].copy()
    tempo["week"] = tempo["date"].map(week_by_date)
    tempo["personKey"] = txt(tempo["Full name"]).map(assignee_key)
    tempo["Team"] = tempo["personKey"].map(team_by_person).fillna("")
    tempo["Class"] = tempo["key"].str.startswith("TEMPO-").map({True: "Operations", False: "Engineering"})

    jira = pd.read_csv(jira_path, low_memory=False)
    jira["key"] = txt(jira["Issue key"]).str.upper()
    jira = jira[(jira["key"] != "") & (~jira["key"].isin(EXCLUDED))].copy()
    parent_cols = [c for c in jira.columns if c in ["Parent key", "Custom field (Parent ticket)", "Custom field (Epic Link)", "Epic Link"] or c.startswith("Custom field (Parent ticket).") or c.startswith("Custom field (Epic Link).")]
    jira["parentKey"] = jira.apply(lambda r: first_value(r, parent_cols).upper(), axis=1)
    jira["Account"] = txt(jira["Custom field (Account)"])
    jira["Target Release"] = txt(jira["Custom field (Target Release)"])
    jira["Issue Type"] = txt(jira["Issue Type"])
    jira["Estimate Hours"] = num(jira["Original estimate"]) / 3600
    jira["Has Estimate"] = txt(jira["Original estimate"]) != ""
    jira = jira.drop_duplicates("key", keep="last")
    jira_by_key = jira.set_index("key")

    tempo["Jira Matched"] = tempo["key"].isin(jira_by_key.index)
    for column in ["Account", "Target Release", "Issue Type", "Estimate Hours", "Has Estimate", "parentKey"]:
        tempo[column] = tempo["key"].map(jira_by_key[column].to_dict())

    cutoff = tempo["date"].max()
    complete = tempo[tempo["date"] <= pd.Timestamp("2026-09-30")].copy()
    unmatched_team_hours = float(complete.loc[complete["Team"] == "", "logged"].sum())

    capacity = pd.read_csv(capacity_path, low_memory=False)
    capacity["AssigneeKey"] = txt(capacity["Assignee"]).map(assignee_key)
    capacity["Team"] = capacity["AssigneeKey"].map(team_by_person).fillna("")
    capacity["week"] = pd.to_numeric(capacity["Week Number"], errors="coerce")
    capacity["planned"] = num(capacity["Planned Hours"])
    capacity = capacity[(capacity["week"].notna()) & (capacity["Team"] != "")].copy()
    capacity["week"] = capacity["week"].astype(int)
    complete_weeks = set(week_bounds.loc[week_bounds["max"] <= pd.Timestamp("2026-09-30"), "week"].astype(int))
    cap_complete = capacity[capacity["week"].isin(complete_weeks)].copy()
    cap_people = set(cap_complete["AssigneeKey"])
    outside_capacity_hours = float(complete.loc[(complete["Team"] != "") & (~complete["personKey"].isin(cap_people)), "logged"].sum())
    capacity_comparable = unmatched_team_hours == 0 and outside_capacity_hours == 0

    cap_agg = cap_complete.groupby(["week", "Team"], as_index=False)["planned"].sum()
    log_agg = complete[complete["Team"] != ""].groupby(["week", "Team", "Class"], as_index=False)["logged"].sum()
    pivot = log_agg.pivot_table(index=["week", "Team"], columns="Class", values="logged", aggfunc="sum", fill_value=0).reset_index()
    weekly = cap_agg.merge(pivot, on=["week", "Team"], how="outer").fillna(0)
    for col in ["Engineering", "Operations"]:
        if col not in weekly:
            weekly[col] = 0.0
    weekly = weekly.merge(week_bounds, on="week", how="left")
    weekly["Logged Total Hours"] = weekly["Engineering"] + weekly["Operations"]
    weekly["Utilization Rate"] = weekly.apply(lambda r: r["Logged Total Hours"] / r["planned"] if capacity_comparable and r["planned"] else None, axis=1)
    weekly["Remaining Capacity"] = weekly.apply(lambda r: r["planned"] - r["Logged Total Hours"] if capacity_comparable else None, axis=1)
    weekly = weekly.rename(columns={"week": "Governed Week", "min": "Week Start", "max": "Week End", "planned": "Available Capacity", "Engineering": "Logged Engineering Hours", "Operations": "Logged Operations Hours"})
    weekly.insert(0, "Year", 2026)
    weekly = weekly[["Year", "Governed Week", "Week Start", "Week End", "Team", "Available Capacity", "Logged Engineering Hours", "Logged Operations Hours", "Logged Total Hours", "Utilization Rate", "Remaining Capacity"]].sort_values(["Governed Week", "Team"])

    children = set(jira.loc[jira["parentKey"] != "", "parentKey"])
    eligible_types = {"story", "task", "sub-task", "subtask"}
    matched_eng = tempo[(tempo["Class"] == "Engineering") & tempo["Jira Matched"]].copy()
    eligible = matched_eng[(matched_eng["Has Estimate"] == True) & (matched_eng["Estimate Hours"] > 0) & (matched_eng["Issue Type"].str.casefold().isin(eligible_types)) & (~matched_eng["key"].isin(children))].copy()
    estimate_by_key = jira_by_key["Estimate Hours"].to_dict()
    eligible_agg = eligible.groupby(["key", "Target Release", "Account", "Issue Type"], as_index=False)["logged"].sum()
    eligible_agg["Estimate"] = eligible_agg["key"].map(estimate_by_key)
    eligible_agg["Target Release"] = eligible_agg["Target Release"].replace("", "No Target Release")
    eligible_agg["Account"] = eligible_agg["Account"].replace("", "Unattributed / Blank")
    delivery = eligible_agg.groupby(["Target Release", "Account", "Issue Type"], as_index=False).agg({"Estimate": "sum", "logged": "sum", "key": "nunique"})
    delivery["Variance Hours"] = None
    delivery["Logged vs Estimate %"] = None
    delivery["Data Coverage / Interpretation"] = "NOT COMPARABLE — current lifecycle estimate vs 2026-only actual development hours"
    delivery = delivery.rename(columns={"Estimate": "Current Original Estimate (Jira)", "logged": "Actual Development Hours (Tempo)", "key": "Number of Eligible Work Items"})
    delivery = delivery[["Target Release", "Account", "Issue Type", "Current Original Estimate (Jira)", "Actual Development Hours (Tempo)", "Variance Hours", "Logged vs Estimate %", "Number of Eligible Work Items", "Data Coverage / Interpretation"]].sort_values(["Target Release", "Account", "Issue Type"])

    total = float(tempo["logged"].sum())
    eng = float(tempo.loc[tempo["Class"] == "Engineering", "logged"].sum())
    ops = float(tempo.loc[tempo["Class"] == "Operations", "logged"].sum())
    matched = float(tempo.loc[tempo["Jira Matched"], "logged"].sum())
    unmatched = total - matched
    estimates = jira["Has Estimate"]
    coverage = {
        "total_governed_tempo_hours": total,
        "engineering_hours": eng,
        "operations_hours": ops,
        "matched_jira_hours": matched,
        "unmatched_jira_hours": unmatched,
        "jira_match_coverage": matched / total if total else None,
        "jira_issues_with_estimates": int(estimates.sum()),
        "jira_issues_without_estimates": int((~estimates).sum()),
        "jira_issues_zero_estimate": int(((jira["Has Estimate"]) & (jira["Estimate Hours"] == 0)).sum()),
        "parent_child_positive_estimate_pairs": int(sum((jira.loc[jira["parentKey"] != "", "parentKey"].map(estimate_by_key).fillna(0) > 0) & (jira.loc[jira["parentKey"] != "", "Estimate Hours"] > 0))),
        "eligible_estimate_work_items": int(eligible_agg["key"].nunique()),
        "eligible_estimate_actual_hours": float(eligible_agg["logged"].sum()),
        "october_actual_hours_partial": float(tempo.loc[tempo["date"].dt.month.eq(10), "logged"].sum()),
        "cutoff": cutoff.strftime("%Y-%m-%d"),
        "completed_period": "2026-01-01 to 2026-09-30",
        "capacity_comparable": capacity_comparable,
        "unmapped_team_hours_completed_period": unmatched_team_hours,
        "mapped_hours_outside_capacity_roster": outside_capacity_hours,
        "completed_period_capacity": float(cap_complete["planned"].sum()),
        "completed_period_logged_hours": float(complete["logged"].sum()),
    }
    data = {"summary": coverage, "weekly": records(weekly), "delivery": records(delivery)}
    (OUT / "report_data.json").write_text(json.dumps(data, indent=2), encoding="utf-8")
    (OUT / "validation.json").write_text(json.dumps(coverage, indent=2), encoding="utf-8")
    print(json.dumps(coverage, indent=2))


if __name__ == "__main__":
    main()
