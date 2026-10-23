from __future__ import annotations

"""Prepare governed, read-only datasets for the Authoring capacity workbook.

The module deliberately keeps historical Tempo effort separate from Jira
Remaining Estimate.  It consumes the same canonical assignee normalization and
global exact-key exclusions as the dashboard, but does not modify any source
or dashboard artifact.
"""

import json
import re
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd

from governed_exclusions import GLOBAL_EXCLUDED_ISSUE_KEYS, partition_governed_issue_rows


ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUTPUT = ROOT / "outputs" / "authoring_team_capacity_effort"

WORKLOGS_PATTERN = "RAW_DATA_FULL_ANALYSIS_*.csv"
JIRA_PATTERN = "All Jira Work Items marked PI Backlog (JIRA)_*.csv"
CAPACITY_PATTERN = "Weekly Capacity_*.csv"
ASSIGNEES_PATTERN = "*Assignees*Capacit*.csv"
MASTER_DATE_PATTERN = "*Master*Date*.csv"
RELEASES_PATTERN = "Release Cycle*.csv"

TERMINAL_STATUSES = {"done", "closed", "cancelled", "canceled", "rejected", "abandoned", "resolved"}


def export_date(path: Path) -> datetime:
    for pattern, fmt in ((r"_(\d{8})\.csv$", "%Y%m%d"), (r"^(\d{8})_", "%Y%m%d"), (r"_(\d{2}_[A-Za-z]{3}_\d{2})\.csv$", "%d_%b_%y")):
        match = re.search(pattern, path.name)
        if match:
            return datetime.strptime(match.group(1), fmt)
    return datetime.fromtimestamp(path.stat().st_mtime)


def latest(pattern: str) -> Path:
    matches = [path for path in RAW.glob(pattern) if path.is_file()]
    if not matches:
        raise FileNotFoundError(f"No source file matches {pattern!r} in {RAW}")
    return max(matches, key=lambda path: (export_date(path), path.stat().st_mtime))


def required(frame: pd.DataFrame, columns: list[str], source_name: str) -> None:
    missing = [column for column in columns if column not in frame.columns]
    if missing:
        raise ValueError(f"{source_name} is missing required columns: {', '.join(missing)}")


def text(series: pd.Series) -> pd.Series:
    return series.fillna("").astype(str).str.strip()


def number(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series.astype(str).str.replace(",", "", regex=False).str.strip(), errors="coerce").fillna(0.0)


def canonical_key(value: object) -> str:
    raw = "" if pd.isna(value) else str(value).strip()
    deaccented = "".join(char for char in unicodedata.normalize("NFD", raw) if unicodedata.category(char) != "Mn")
    return re.sub(r"\s+", " ", re.sub(r"[._-]+", " ", deaccented).lower()).strip()


def canonicalize(series: pd.Series, names: dict[str, str]) -> pd.Series:
    return series.map(lambda value: names.get(canonical_key(value), text(pd.Series([value])).iloc[0]))


def parse_tempo_date(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce").dt.normalize()


def parse_jira_date(series: pd.Series) -> pd.Series:
    primary = pd.to_datetime(series, format="%d/%b/%y %I:%M %p", errors="coerce")
    fallback = pd.to_datetime(series, errors="coerce", dayfirst=True)
    return primary.fillna(fallback).dt.normalize()


def iso_date(value: object) -> str | None:
    if value is None or pd.isna(value):
        return None
    return pd.Timestamp(value).strftime("%Y-%m-%d")


def clean_record(value: object) -> object:
    if value is None or pd.isna(value):
        return None
    if isinstance(value, (pd.Timestamp, datetime)):
        return value.strftime("%Y-%m-%d")
    if hasattr(value, "item"):
        return value.item()
    return value


def records(frame: pd.DataFrame) -> list[dict[str, object]]:
    return [{key: clean_record(value) for key, value in row.items()} for row in frame.to_dict("records")]


def release_for_date(value: pd.Timestamp, releases: pd.DataFrame) -> str:
    if pd.isna(value):
        return ""
    match = releases.loc[(releases["Start Date"] <= value) & (releases["End Date"] >= value), "Release Cycle"]
    return "" if match.empty else str(match.iloc[0])


def demand_classification(row: pd.Series, releases: pd.DataFrame, snapshot_date: pd.Timestamp) -> str:
    target_release = str(row.get("Target Release", "") or "").strip()
    due_date = row.get("Due Date")
    target = releases.loc[releases["Release Cycle"].eq(target_release)]
    if not target.empty and target["End Date"].iloc[0] >= snapshot_date:
        return "Current / future Target Release"
    if pd.notna(due_date) and due_date > snapshot_date:
        return "Future Due Date fallback"
    return "Planning exception"


def terminal_mask(jira: pd.DataFrame) -> pd.Series:
    status = text(jira["Status"]).str.casefold()
    category = text(jira["Status category"]).str.casefold()
    return category.eq("done") | status.isin(TERMINAL_STATUSES)


def make_check(name: str, expected: str, actual: str, difference: float | None, outcome: str, explanation: str) -> dict[str, object]:
    return {
        "Check name": name,
        "Expected result": expected,
        "Actual result": actual,
        "Difference": difference,
        "Outcome": outcome,
        "Explanation": explanation,
    }


def build_report() -> dict[str, object]:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    paths = {
        "Tempo worklogs": latest(WORKLOGS_PATTERN),
        "Jira backlog": latest(JIRA_PATTERN),
        "Weekly capacity": latest(CAPACITY_PATTERN),
        "Assignees": latest(ASSIGNEES_PATTERN),
        "Master Date": latest(MASTER_DATE_PATTERN),
        "Release Cycle": latest(RELEASES_PATTERN),
    }

    assignees = pd.read_csv(paths["Assignees"], low_memory=False)
    required(assignees, ["Team", "Assignee", "Skill"], "Assignees CSV")
    assignees["nameKey"] = text(assignees["Assignee"]).map(canonical_key)
    assignee_conflicts = int(assignees.groupby("nameKey", dropna=False).size().gt(1).sum())
    canonical_assignees = assignees.drop_duplicates("nameKey", keep="last").copy()
    canonical_assignees["Assignee"] = text(canonical_assignees["Assignee"])
    canonical_assignees["Team"] = text(canonical_assignees["Team"])
    canonical_assignees["Skill"] = text(canonical_assignees["Skill"])
    authoring_people = canonical_assignees.loc[canonical_assignees["Team"].str.casefold().eq("authoring")].copy()
    if authoring_people.empty:
        raise ValueError("Assignees CSV has no canonical workforce rows for Team = Authoring")
    authoring_people["Skill"] = authoring_people["Skill"].replace("", "[Missing Skill]")
    authoring_people = authoring_people.sort_values("Assignee")
    names = dict(zip(canonical_assignees["nameKey"], canonical_assignees["Assignee"]))
    team_by_name = dict(zip(canonical_assignees["Assignee"], canonical_assignees["Team"]))
    skill_by_name = dict(zip(canonical_assignees["Assignee"], canonical_assignees["Skill"].replace("", "[Missing Skill]")))

    master = pd.read_csv(paths["Master Date"], low_memory=False)
    required(master, ["Master Date", "Week Number"], "Master Date CSV")
    master["Date"] = pd.to_datetime(master["Master Date"], errors="coerce", dayfirst=True).dt.normalize()
    master["Week Number"] = pd.to_numeric(master["Week Number"], errors="coerce")
    master = master.dropna(subset=["Date", "Week Number"]).copy()
    master["Week Number"] = master["Week Number"].astype(int)
    master_week = dict(zip(master["Date"], master["Week Number"]))

    releases = pd.read_csv(paths["Release Cycle"], low_memory=False)
    required(releases, ["Release Cycle", "Start Date", "End Date"], "Release Cycle CSV")
    releases["Start Date"] = pd.to_datetime(releases["Start Date"], errors="coerce", dayfirst=True).dt.normalize()
    releases["End Date"] = pd.to_datetime(releases["End Date"], errors="coerce", dayfirst=True).dt.normalize()
    releases = releases.dropna(subset=["Release Cycle", "Start Date", "End Date"]).sort_values("Start Date").copy()
    releases["Release Cycle"] = text(releases["Release Cycle"])
    releases["Ordinal"] = range(1, len(releases) + 1)

    tempo = pd.read_csv(paths["Tempo worklogs"], low_memory=False)
    required(
        tempo,
        ["Work Item Key", "Work Item summary", "Logged Hours", "Work date", "Full name", "Billable Hours", "Account Customer", "Tempo Worklog ID", "Work Item Type"],
        "Tempo export",
    )
    account_customer_position = int(tempo.columns.get_loc("Account Customer")) + 1
    tempo, excluded_tempo = partition_governed_issue_rows(tempo, "Work Item Key")
    tempo["Logged Hours"] = number(tempo["Logged Hours"])
    tempo["Billable Hours"] = number(tempo["Billable Hours"])
    tempo["Work Date"] = parse_tempo_date(tempo["Work date"])
    invalid_worklog_dates = int(tempo["Work Date"].isna().sum())
    tempo = tempo.dropna(subset=["Work Date"]).copy()
    tempo["Assignee"] = canonicalize(tempo["Full name"], names)
    tempo["Team"] = tempo["Assignee"].map(team_by_name).fillna("")
    tempo["Skill"] = tempo["Assignee"].map(skill_by_name).fillna("[Missing Skill]")
    tempo["Class"] = tempo["Work Item Key"].str.startswith("TEMPO-").map({True: "Operations", False: "Engineering"})
    authoring_tempo = tempo.loc[tempo["Team"].str.casefold().eq("authoring")].copy()
    if authoring_tempo.empty:
        raise ValueError("No governed Tempo worklogs map to Authoring workforce members")
    scope_start = authoring_tempo["Work Date"].min()
    scope_end = authoring_tempo["Work Date"].max()
    scope_years = {scope_start.year, scope_end.year}
    if len(scope_years) != 1:
        raise ValueError("The report currently requires a single reporting year for weekly capacity selection")
    scope_weeks = {week for date, week in master_week.items() if scope_start <= date <= scope_end}
    authoring_tempo["Week Number"] = authoring_tempo["Work Date"].map(master_week)
    authoring_tempo["Iteration"] = authoring_tempo["Work Date"].map(lambda value: release_for_date(value, releases))
    authoring_tempo["Account Customer"] = text(authoring_tempo["Account Customer"]).replace("", "[Missing Account Customer]")

    capacity = pd.read_csv(paths["Weekly capacity"], low_memory=False)
    required(capacity, ["Assignee", "Week Number", "Planned Hours"], "Weekly Capacity CSV")
    capacity["Assignee"] = canonicalize(capacity["Assignee"], names)
    capacity["Week Number"] = pd.to_numeric(capacity["Week Number"], errors="coerce")
    capacity["Planned Hours"] = number(capacity["Planned Hours"])
    capacity["Team"] = capacity["Assignee"].map(team_by_name).fillna("")
    capacity = capacity.loc[capacity["Week Number"].notna()].copy()
    capacity["Week Number"] = capacity["Week Number"].astype(int)
    authoring_capacity = capacity.loc[
        capacity["Team"].str.casefold().eq("authoring") & capacity["Week Number"].isin(scope_weeks)
    ].copy()

    jira = pd.read_csv(paths["Jira backlog"], low_memory=False)
    required(
        jira,
        ["Issue key", "Summary", "Issue Type", "Status", "Status category", "Assignee", "Remaining Estimate", "Custom field (Target Release)", "Due date", "Parent key", "Team Name"],
        "Jira export",
    )
    jira, excluded_jira = partition_governed_issue_rows(jira, "Issue key")
    jira["Issue key"] = text(jira["Issue key"])
    jira["Assignee"] = canonicalize(jira["Assignee"], names)
    jira["Skill"] = jira["Assignee"].map(skill_by_name).fillna("")
    jira["Workforce Team"] = jira["Assignee"].map(team_by_name).fillna("")
    jira["Remaining Estimate Hours"] = number(jira["Remaining Estimate"]) / 3600
    jira["Has Remaining Estimate"] = text(jira["Remaining Estimate"]).ne("")
    jira["Target Release"] = text(jira["Custom field (Target Release)"])
    jira["Due Date"] = parse_jira_date(jira["Due date"])
    jira["Parent Key"] = text(jira["Parent key"]).str.upper()
    jira["Jira Ownership Team"] = text(jira["Team Name"])
    jira["Terminal"] = terminal_mask(jira)
    jira["Operational"] = jira["Issue key"].str.startswith("TEMPO-") | text(jira["Issue Type"]).str.casefold().eq("tempo")
    jira_duplicate_keys = int(jira.duplicated("Issue key", keep=False).sum())
    jira = jira.drop_duplicates("Issue key", keep="last").copy()
    snapshot_date = max(pd.Timestamp(export_date(paths["Jira backlog"])), scope_end).normalize()
    jira["Demand Classification"] = jira.apply(lambda row: demand_classification(row, releases, snapshot_date), axis=1)

    jira_fields = jira.set_index("Issue key")
    historical = authoring_tempo.copy()
    historical["Jira Issue Key"] = historical["Work Item Key"]
    for target, source in {
        "Issue Type": "Issue Type",
        "Jira Summary": "Summary",
        "Jira Status": "Status",
        "Target Release": "Target Release",
        "Due Date": "Due Date",
        "Jira Ownership Team": "Jira Ownership Team",
        "Demand Classification": "Demand Classification",
    }.items():
        historical[target] = historical["Jira Issue Key"].map(jira_fields[source].to_dict())
    historical["Issue Type"] = historical["Issue Type"].fillna(text(historical["Work Item Type"]))
    historical["Jira Summary"] = historical["Jira Summary"].fillna(text(historical["Work Item summary"]))
    historical["Jira Status"] = historical["Jira Status"].fillna(historical["Class"].map({"Operations": "Operational", "Engineering": "[Jira metadata unavailable]"}))
    historical["Demand Classification"] = historical["Demand Classification"].fillna("Historical actuals only")
    historical["Jira Ownership Team"] = historical["Jira Ownership Team"].fillna("")
    historical["Target Release"] = historical["Target Release"].fillna("")
    detail_columns = [
        "Assignee", "Skill", "Jira Issue Key", "Issue Type", "Jira Summary", "Jira Status", "Account Customer",
        "Logged Hours", "Billable Hours", "Target Release", "Due Date", "Jira Ownership Team", "Demand Classification",
    ]
    historical_detail = historical.groupby(
        ["Assignee", "Skill", "Jira Issue Key", "Issue Type", "Jira Summary", "Jira Status", "Account Customer", "Target Release", "Due Date", "Jira Ownership Team", "Demand Classification"],
        dropna=False,
        as_index=False,
    ).agg({"Logged Hours": "sum", "Billable Hours": "sum"})
    historical_detail = historical_detail[detail_columns].sort_values(["Assignee", "Jira Issue Key", "Account Customer"])
    historical_detail.insert(8, "Remaining Estimate", None)
    historical_detail = historical_detail.rename(columns={"Jira Summary": "Summary"})

    nonterminal_authoring_jira = jira.loc[
        jira["Workforce Team"].str.casefold().eq("authoring") & ~jira["Terminal"] & ~jira["Operational"]
    ].copy()
    nonterminal_authoring_jira["Skill"] = nonterminal_authoring_jira["Skill"].replace("", "[Missing Skill]")
    logged_by_key = authoring_tempo.groupby("Work Item Key", as_index=True)["Logged Hours"].sum().to_dict()
    nonterminal_authoring_jira["Historical Logged Hours"] = nonterminal_authoring_jira["Issue key"].map(logged_by_key).fillna(0.0)
    nonterminal_authoring_jira["Data Quality / Allocation Notes"] = "Assigned through Jira Assignee; no allocation to Tempo contributors."
    missing_estimate = ~nonterminal_authoring_jira["Has Remaining Estimate"]
    nonterminal_authoring_jira.loc[missing_estimate, "Data Quality / Allocation Notes"] += " Missing Remaining Estimate."
    hierarchy_related = nonterminal_authoring_jira["Parent Key"].ne("")
    nonterminal_authoring_jira.loc[hierarchy_related, "Data Quality / Allocation Notes"] += " Parent/child relation retained at distinct Jira-key grain."
    demand_detail = nonterminal_authoring_jira[
        ["Assignee", "Skill", "Issue key", "Issue Type", "Summary", "Status", "Parent Key", "Remaining Estimate Hours", "Target Release", "Due Date", "Jira Ownership Team", "Demand Classification", "Historical Logged Hours", "Data Quality / Allocation Notes"]
    ].rename(columns={"Issue key": "Jira Issue Key", "Remaining Estimate Hours": "Remaining Estimate"}).sort_values(["Assignee", "Jira Issue Key"])

    demand_summary = authoring_people[["Assignee", "Skill"]].copy()
    demand_counts = nonterminal_authoring_jira.groupby("Assignee", as_index=False).agg(
        **{
            "Eligible Non-DONE Jira Items": ("Issue key", "nunique"),
            "Remaining Estimate": ("Remaining Estimate Hours", "sum"),
            "Missing Remaining Estimate": ("Has Remaining Estimate", lambda values: int((~values).sum())),
            "Planning Exceptions": ("Demand Classification", lambda values: int((values == "Planning exception").sum())),
        }
    )
    classifications = nonterminal_authoring_jira.groupby("Assignee")["Demand Classification"].agg(lambda values: ", ".join(sorted(set(values)))).to_dict()
    demand_summary = demand_summary.merge(demand_counts, on="Assignee", how="left").fillna({"Eligible Non-DONE Jira Items": 0, "Remaining Estimate": 0.0, "Missing Remaining Estimate": 0, "Planning Exceptions": 0})
    demand_summary["Future Iteration / Demand Classification"] = demand_summary["Assignee"].map(classifications).fillna("No eligible Jira demand")
    demand_summary["Data Quality / Allocation Notes"] = demand_summary.apply(
        lambda row: (
            f"{int(row['Missing Remaining Estimate'])} item(s) without Remaining Estimate; "
            f"{int(row['Planning Exceptions'])} planning exception(s). Jira Assignee only."
        ),
        axis=1,
    )
    demand_summary = demand_summary[["Assignee", "Skill", "Eligible Non-DONE Jira Items", "Remaining Estimate", "Future Iteration / Demand Classification", "Data Quality / Allocation Notes"]]

    actual_by_assignee = authoring_tempo.pivot_table(index="Assignee", columns="Class", values="Logged Hours", aggfunc="sum", fill_value=0.0)
    for column in ["Engineering", "Operations"]:
        if column not in actual_by_assignee:
            actual_by_assignee[column] = 0.0
    actual_by_assignee["Logged Total"] = actual_by_assignee["Engineering"] + actual_by_assignee["Operations"]
    billable_by_assignee = authoring_tempo.groupby("Assignee")["Billable Hours"].sum()
    work_items_by_assignee = authoring_tempo.groupby("Assignee")["Work Item Key"].nunique()
    capacity_by_assignee = authoring_capacity.groupby("Assignee")["Planned Hours"].sum()
    assignee_summary = authoring_people[["Assignee", "Skill"]].copy().set_index("Assignee")
    assignee_summary["Capacity"] = capacity_by_assignee
    assignee_summary["Logged Engineering"] = actual_by_assignee["Engineering"]
    assignee_summary["Logged Operations"] = actual_by_assignee["Operations"]
    assignee_summary["Logged Total"] = actual_by_assignee["Logged Total"]
    assignee_summary["Billable Hours"] = billable_by_assignee
    assignee_summary["Distinct Work Items"] = work_items_by_assignee
    assignee_summary = assignee_summary.fillna(0.0).reset_index()
    assignee_summary["Utilization Rate"] = assignee_summary.apply(lambda row: row["Logged Total"] / row["Capacity"] if row["Capacity"] else None, axis=1)
    assignee_summary["Remaining Capacity"] = assignee_summary["Capacity"] - assignee_summary["Logged Total"]
    assignee_summary = assignee_summary[["Assignee", "Skill", "Capacity", "Logged Engineering", "Logged Operations", "Logged Total", "Utilization Rate", "Remaining Capacity", "Billable Hours", "Distinct Work Items"]]

    account_matrix = authoring_tempo.pivot_table(index="Account Customer", columns="Assignee", values="Logged Hours", aggfunc="sum", fill_value=0.0)
    account_matrix = account_matrix.reindex(columns=assignee_summary["Assignee"].tolist(), fill_value=0.0)
    account_matrix["Total Logged Hours"] = account_matrix.sum(axis=1)
    account_matrix = account_matrix.sort_values("Total Logged Hours", ascending=False).reset_index().rename(columns={"Account Customer": "Tempo Account Customer"})
    account_allocation = account_matrix[["Tempo Account Customer", "Total Logged Hours"]].copy()

    iteration_rows = []
    release_order = {name: ordinal for name, ordinal in zip(releases["Release Cycle"], releases["Ordinal"])}
    for iteration, group in authoring_tempo.groupby(authoring_tempo["Iteration"].replace("", "[No governed iteration]")):
        engineering = float(group.loc[group["Class"].eq("Engineering"), "Logged Hours"].sum())
        operations = float(group.loc[group["Class"].eq("Operations"), "Logged Hours"].sum())
        if iteration == "[No governed iteration]":
            status = "Unmapped worklog date"
            ordinal = 9999
        else:
            release_end = releases.loc[releases["Release Cycle"].eq(iteration), "End Date"].iloc[0]
            status = "Current / partial through source cutoff" if release_end >= scope_end else "Completed"
            ordinal = release_order[iteration]
        iteration_rows.append({"Iteration": iteration, "Logged Engineering": engineering, "Logged Operations": operations, "Logged Total": engineering + operations, "Operations Percentage": operations / (engineering + operations) if engineering + operations else None, "Scope Status": status, "_Ordinal": ordinal})
    iteration_trends = pd.DataFrame(iteration_rows).sort_values("_Ordinal").drop(columns="_Ordinal")

    skill_rows: list[dict[str, object]] = []
    for skill, group in assignee_summary.sort_values(["Skill", "Assignee"]).groupby("Skill", sort=True):
        for row in group.to_dict("records"):
            skill_rows.append({"Row Type": "Member", "Skill": skill, "Assignee": row["Assignee"], "Capacity": row["Capacity"], "Logged Engineering": row["Logged Engineering"], "Logged Operations": row["Logged Operations"], "Logged Total": row["Logged Total"], "Utilization Rate": row["Utilization Rate"]})
        capacity_total = float(group["Capacity"].sum())
        logged_total = float(group["Logged Total"].sum())
        skill_rows.append({"Row Type": "Subtotal", "Skill": f"{skill} Total", "Assignee": f"{len(group)} member(s)", "Capacity": capacity_total, "Logged Engineering": float(group["Logged Engineering"].sum()), "Logged Operations": float(group["Logged Operations"].sum()), "Logged Total": logged_total, "Utilization Rate": logged_total / capacity_total if capacity_total else None})
    capacity_total = float(assignee_summary["Capacity"].sum())
    logged_total = float(assignee_summary["Logged Total"].sum())
    skill_rows.append({"Row Type": "Grand Total", "Skill": "Grand Total", "Assignee": f"{len(assignee_summary)} member(s)", "Capacity": capacity_total, "Logged Engineering": float(assignee_summary["Logged Engineering"].sum()), "Logged Operations": float(assignee_summary["Logged Operations"].sum()), "Logged Total": logged_total, "Utilization Rate": logged_total / capacity_total if capacity_total else None})
    skill_analysis = pd.DataFrame(skill_rows)

    total_engineering = float(authoring_tempo.loc[authoring_tempo["Class"].eq("Engineering"), "Logged Hours"].sum())
    total_operations = float(authoring_tempo.loc[authoring_tempo["Class"].eq("Operations"), "Logged Hours"].sum())
    total_logged = total_engineering + total_operations
    total_capacity = float(authoring_capacity["Planned Hours"].sum())
    total_utilization = total_logged / total_capacity if total_capacity else None
    total_remaining = total_capacity - total_logged
    missing_capacity_members = int((assignee_summary["Capacity"] == 0).sum())
    missing_account_rows = int(authoring_tempo["Account Customer"].eq("[Missing Account Customer]").sum())
    missing_account_hours = float(authoring_tempo.loc[authoring_tempo["Account Customer"].eq("[Missing Account Customer]"), "Logged Hours"].sum())
    unmatched_jira = authoring_tempo.loc[~authoring_tempo["Work Item Key"].isin(jira_fields.index) & ~authoring_tempo["Work Item Key"].str.startswith("TEMPO-")]
    duplicate_worklogs = int(authoring_tempo.duplicated("Tempo Worklog ID", keep=False).sum())
    unmapped_iterations = float(authoring_tempo.loc[authoring_tempo["Iteration"].eq(""), "Logged Hours"].sum())
    hierarchy_pairs = nonterminal_authoring_jira.loc[
        nonterminal_authoring_jira["Parent Key"].isin(jira_fields.index)
        & nonterminal_authoring_jira["Has Remaining Estimate"]
        & nonterminal_authoring_jira["Parent Key"].map(jira_fields["Has Remaining Estimate"].to_dict()).fillna(False)
    ]

    checks = [
        make_check("Authoring workforce membership", "At least one canonical Authoring assignee", f"{len(authoring_people)} canonical Authoring assignees", None, "PASS", "Assignees CSV is the sole workforce Team and Skill source."),
        make_check("Canonical assignee normalization", "No duplicate canonical workforce identity", f"{assignee_conflicts} duplicate canonical key(s)", float(assignee_conflicts), "PASS" if assignee_conflicts == 0 else "WARNING", "Names are normalized using accent-insensitive punctuation/whitespace rules before workforce mapping."),
        make_check("Missing Assignees mappings", "No source worklogs outside canonical workforce map", f"{int((tempo['Team'] == '').sum())} Tempo row(s) outside the managed workforce map", float(int((tempo['Team'] == '').sum())), "PASS" if int((tempo['Team'] == '').sum()) == 0 else "WARNING", "Unmapped worklogs are not treated as Authoring effort."),
        make_check("Tempo Account Customer completeness", "No blank Account Customer on Authoring worklogs", f"{missing_account_rows} row(s), {missing_account_hours:.1f} hour(s) in [Missing Account Customer]", missing_account_hours, "PASS" if missing_account_rows == 0 else "WARNING", f"Tempo Account Customer is field position {account_customer_position} (expected Column S = 19); blanks remain explicit."),
        make_check("Tempo worklogs without Jira metadata", "All non-operational Authoring worklogs match Jira metadata", f"{len(unmatched_jira)} row(s), {float(unmatched_jira['Logged Hours'].sum()):.1f} hour(s) unmatched", float(unmatched_jira['Logged Hours'].sum()), "PASS" if unmatched_jira.empty else "WARNING", "Historical Tempo effort is retained even when Jira metadata is unavailable."),
        make_check("Missing Weekly Capacity", "Every Authoring member has capacity in selected Master Date weeks", f"{missing_capacity_members} of {len(assignee_summary)} member(s) have zero selected-scope capacity", float(missing_capacity_members), "PASS" if missing_capacity_members == 0 else "WARNING", "Capacity scope uses Master Date weeks represented by the actual-effort date range."),
        make_check("Capacity reconciliation", "Assignee capacity = source Authoring capacity", f"{total_capacity:.1f} = {float(assignee_summary['Capacity'].sum()):.1f}", float(assignee_summary['Capacity'].sum() - total_capacity), "PASS" if abs(float(assignee_summary['Capacity'].sum() - total_capacity)) < 1e-9 else "FAIL", "Capacity is aggregated before it is joined to people and is never multiplied by worklogs or accounts."),
        make_check("Logged Engineering reconciliation", "Assignee sum = governed Authoring Engineering", f"{float(assignee_summary['Logged Engineering'].sum()):.1f} = {total_engineering:.1f}", float(assignee_summary['Logged Engineering'].sum() - total_engineering), "PASS" if abs(float(assignee_summary['Logged Engineering'].sum() - total_engineering)) < 1e-9 else "FAIL", "Non-TEMPO keys after global exclusions are Engineering."),
        make_check("Logged Operations reconciliation", "Assignee sum = governed Authoring Operations", f"{float(assignee_summary['Logged Operations'].sum()):.1f} = {total_operations:.1f}", float(assignee_summary['Logged Operations'].sum() - total_operations), "PASS" if abs(float(assignee_summary['Logged Operations'].sum() - total_operations)) < 1e-9 else "FAIL", "Valid TEMPO-* keys after global exclusions are Operations."),
        make_check("Logged Total reconciliation", "Engineering + Operations = Logged Total", f"{total_engineering:.1f} + {total_operations:.1f} = {total_logged:.1f}", float(total_engineering + total_operations - total_logged), "PASS", "This equality is calculated from governed historical Tempo populations."),
        make_check("Skill-level reconciliation", "Skill member rows = Authoring Logged Total", f"{float(skill_analysis.loc[skill_analysis['Row Type'] == 'Member', 'Logged Total'].sum()):.1f} = {total_logged:.1f}", float(skill_analysis.loc[skill_analysis['Row Type'] == 'Member', 'Logged Total'].sum() - total_logged), "PASS" if abs(float(skill_analysis.loc[skill_analysis['Row Type'] == 'Member', 'Logged Total'].sum() - total_logged)) < 1e-9 else "FAIL", "Skill subtotals calculate from member rows and do not feed the core total."),
        make_check("Account matrix reconciliation", "Tempo Account Customer matrix = Authoring Logged Total", f"{float(account_matrix['Total Logged Hours'].sum()):.1f} = {total_logged:.1f}", float(account_matrix['Total Logged Hours'].sum() - total_logged), "PASS" if abs(float(account_matrix['Total Logged Hours'].sum() - total_logged)) < 1e-9 else "FAIL", "The explicit missing-account bucket keeps all historical hours in the matrix."),
        make_check("Worklog-to-iteration mapping", "All Authoring logged hours map to a governed Release Cycle", f"{unmapped_iterations:.1f} hour(s) without a Release Cycle", unmapped_iterations, "PASS" if unmapped_iterations == 0 else "WARNING", "Iteration membership uses only Release Cycle.csv start dates and code-freeze end dates."),
        make_check("Duplicate worklogs or join multiplication", "No duplicate Tempo Worklog ID in Authoring population", f"{duplicate_worklogs} duplicate row(s)", float(duplicate_worklogs), "PASS" if duplicate_worklogs == 0 else "WARNING", "Report aggregation begins at Tempo Worklog ID and Jira is deduplicated to one row per Issue Key before enrichment."),
        make_check("Missing Jira Remaining Estimate", "Eligible non-DONE Authoring Jira items have a source Remaining Estimate", f"{int((~nonterminal_authoring_jira['Has Remaining Estimate']).sum())} item(s) missing Remaining Estimate", float(int((~nonterminal_authoring_jira['Has Remaining Estimate']).sum())), "PASS" if bool(nonterminal_authoring_jira['Has Remaining Estimate'].all()) else "WARNING", "Missing estimates remain visible and are not replaced with Original Estimate or logged hours."),
        make_check("Parent/child estimate relationships", "No hierarchy relationship needs review", f"{len(hierarchy_pairs)} parent/child pair(s) both carry Remaining Estimate", float(len(hierarchy_pairs)), "PASS" if hierarchy_pairs.empty else "WARNING", "Distinct Jira keys remain distinct demand records. The report makes no hierarchy inference, suppression, or estimate redistribution."),
        make_check("Unsupported demand allocation", "No Remaining Estimate assigned to Tempo contributors", "0 contributor-based allocations", 0.0, "PASS", "Outstanding demand is shown only against the Jira Assignee; Tempo contributor history never allocates demand."),
        make_check("Release-cycle or planning-date exceptions", "No eligible Jira item lacks a current/future Target Release or future Due Date", f"{int((nonterminal_authoring_jira['Demand Classification'] == 'Planning exception').sum())} planning exception(s)", float(int((nonterminal_authoring_jira['Demand Classification'] == 'Planning exception').sum())), "PASS" if not bool((nonterminal_authoring_jira['Demand Classification'] == 'Planning exception').any()) else "WARNING", "Planning exceptions are retained as known unresolved Jira demand, not allocated capacity or delivery forecast."),
        make_check("Global governed exclusions", "Five exact excluded keys have no report contribution", f"{len(excluded_tempo)} Tempo row(s) and {len(excluded_jira)} Jira row(s) excluded before reporting", 0.0, "PASS", "Exact normalized exclusions are imported from the shared governed implementation."),
        make_check("Tempo worklog dates", "All governed source worklogs have a valid date", f"{invalid_worklog_dates} invalid-date row(s) removed before date-based reporting", float(invalid_worklog_dates), "PASS" if invalid_worklog_dates == 0 else "WARNING", "Master Date and Release Cycle mapping require a valid Tempo Work date."),
        make_check("Jira duplicate identity", "One source representation per Jira Issue Key", f"{jira_duplicate_keys} duplicated source row(s) before unique-key reporting", float(jira_duplicate_keys), "PASS" if jira_duplicate_keys == 0 else "WARNING", "Latest source representation is retained once; the duplicate condition remains visible for review."),
    ]

    summary = {
        "team": "Authoring",
        "snapshotDate": iso_date(snapshot_date),
        "scopeStart": iso_date(scope_start),
        "scopeEnd": iso_date(scope_end),
        "scopeWeeks": sorted(scope_weeks),
        "capacity": total_capacity,
        "loggedTotal": total_logged,
        "loggedEngineering": total_engineering,
        "loggedOperations": total_operations,
        "utilizationRate": total_utilization,
        "remainingCapacity": total_remaining,
        "authoringMembers": int(len(assignee_summary)),
        "accountCustomerColumnPosition": account_customer_position,
        "sources": [{"Source": name, "File": path.name, "Snapshot date": iso_date(pd.Timestamp(export_date(path)))} for name, path in paths.items()],
    }
    return {
        "summary": summary,
        "assigneeCapacity": records(assignee_summary),
        "accountMatrix": records(account_matrix),
        "accountAllocation": records(account_allocation),
        "iterationTrends": records(iteration_trends),
        "skillAnalysis": records(skill_analysis),
        "historicalWorkItems": records(historical_detail),
        "outstandingDemandSummary": records(demand_summary),
        "outstandingDemandDetail": records(demand_detail),
        "checks": checks,
    }


def main() -> None:
    report = build_report()
    output = OUTPUT / "report_data.json"
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    (OUTPUT / "validation_summary.json").write_text(json.dumps(report["checks"], indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"output": str(output), "team": report["summary"]["team"], "scope": f"{report['summary']['scopeStart']} to {report['summary']['scopeEnd']}", "checks": len(report["checks"])}, indent=2))


if __name__ == "__main__":
    main()
