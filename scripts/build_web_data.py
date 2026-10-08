from __future__ import annotations

import hashlib
import json
import re
import unicodedata
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd

from governed_exclusions import (
    GLOBAL_EXCLUDED_ISSUE_KEYS,
    GLOBAL_EXCLUSION_REASONS,
    normalize_issue_key_series,
    partition_governed_issue_rows,
)


ROOT = Path(__file__).resolve().parents[1]
WEB_DIR = ROOT / "web"
RAW_DIR = ROOT / "data" / "raw"
# Accept the checked-in/exported CSV layout as well as the synchronized
# data/raw layout. This keeps local builds usable when exports are placed
# directly in data/.
if not RAW_DIR.is_dir():
    RAW_DIR = ROOT / "data"
MAPPINGS_DIR = ROOT / "data" / "mappings"

WORKLOGS_PATTERN = "RAW_DATA_FULL_ANALYSIS_*.csv"
BACKLOG_PATTERN = "All Jira Work Items marked PI Backlog (JIRA)_*.csv"
CAPACITY_PATTERN = "Weekly Capacity_*.csv"
ASSIGNEES_PATTERN = "*Assignees*Capacit*.csv"
MASTER_DATE_PATTERN = "*Master*Date*.csv"
RELEASES_PATTERN = "Release Cycle*.csv"
BUG_TRIAGE_PATTERN = "Bug Triage_*"
TEMPO_OPERATIONAL_MAPPING = MAPPINGS_DIR / "tempo_operational_mapping.csv"

PROGRAM_LABELS = {
    "PS": "PS - Professional Services",
    "MS": "MS - Managed Services",
    "PD": "PD - Product Development",
    "S-GTM": "S-GTM - Sales & Go To Market",
}


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def parse_export_date(path: Path) -> datetime:
    name = path.name
    jira_or_capacity = re.search(r"_(\d{8})\.csv$", name)
    if jira_or_capacity:
        return datetime.strptime(jira_or_capacity.group(1), "%Y%m%d")

    dated_prefix = re.search(r"^(\d{8})_", name)
    if dated_prefix:
        return datetime.strptime(dated_prefix.group(1), "%Y%m%d")

    tempo = re.search(r"_(\d{2}_[A-Za-z]{3}_\d{2})\.csv$", name)
    if tempo:
        return datetime.strptime(tempo.group(1), "%d_%b_%y")

    return datetime.fromtimestamp(path.stat().st_mtime)


def latest_csv(pattern: str) -> Path:
    matches = [path for path in RAW_DIR.glob(pattern) if path.is_file()]
    if not matches:
        raise FileNotFoundError(f"No CSV files match pattern in {RAW_DIR}: {pattern}")
    return max(matches, key=lambda path: (parse_export_date(path), path.stat().st_mtime))


def latest_two_csvs(pattern: str) -> tuple[Path, Path | None]:
    matches = sorted(
        (path for path in RAW_DIR.glob(pattern) if path.is_file()),
        key=lambda path: (parse_export_date(path), path.stat().st_mtime),
        reverse=True,
    )
    if not matches:
        raise FileNotFoundError(f"No CSV files match pattern in {RAW_DIR}: {pattern}")
    return matches[0], matches[1] if len(matches) > 1 else None


def jira_key_set(frame: pd.DataFrame) -> tuple[set[str], int]:
    keys = text(frame, "Key").str.strip().str.upper()
    keys = keys[keys.ne("")]
    return set(keys), int(len(keys) - keys.nunique())


def compare_jira_key_sets(current_keys: set[str], previous_keys: set[str]) -> dict[str, int | bool]:
    added_keys = current_keys - previous_keys
    removed_keys = previous_keys - current_keys
    current_queue = len(current_keys)
    previous_queue = len(previous_keys)
    added_to_queue = len(added_keys)
    removed_from_queue = len(removed_keys)
    return {
        "currentQueue": current_queue,
        "previousQueue": previous_queue,
        "addedToQueue": added_to_queue,
        "removedFromQueue": removed_from_queue,
        "reconciles": current_queue == previous_queue + added_to_queue - removed_from_queue,
    }


def bug_triage_snapshot_comparison(
    current_path: Path,
    current_frame: pd.DataFrame,
    previous_path: Path | None,
) -> dict[str, Any]:
    current_keys, current_duplicate_keys = jira_key_set(current_frame)
    comparison: dict[str, Any] = {
        "currentFile": current_path.name,
        "previousFile": previous_path.name if previous_path else "",
        "hasPreviousSnapshot": previous_path is not None,
        "currentQueue": len(current_keys),
        "previousQueue": None,
        "addedToQueue": None,
        "removedFromQueue": None,
        "currentDuplicateKeys": current_duplicate_keys,
        "previousDuplicateKeys": None,
        "reconciles": None,
    }
    if previous_path is None:
        return comparison

    previous_frame = pd.read_csv(previous_path, low_memory=False)
    previous_keys, previous_duplicate_keys = jira_key_set(previous_frame)
    set_comparison = compare_jira_key_sets(current_keys, previous_keys)
    comparison.update(
        {
            **set_comparison,
            "previousDuplicateKeys": previous_duplicate_keys,
        }
    )
    return comparison


def clean(value: Any) -> Any:
    if pd.isna(value):
        return ""
    if isinstance(value, (pd.Timestamp, datetime)):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, float):
        return round(float(value), 4)
    return value


def text(df: pd.DataFrame, column: str) -> pd.Series:
    if column not in df.columns:
        return pd.Series([""] * len(df), index=df.index)
    return df[column].fillna("").astype(str)


def normalize_assignee_name(value: Any) -> str:
    return "" if pd.isna(value) else re.sub(r"\s+", " ", str(value).strip())


def assignee_lookup_key(value: Any) -> str:
    normalized = normalize_assignee_name(value)
    without_accents = "".join(
        char for char in unicodedata.normalize("NFD", normalized) if unicodedata.category(char) != "Mn"
    )
    return re.sub(r"\s+", " ", re.sub(r"[._-]+", " ", without_accents).lower()).strip()


def build_assignee_name_lookup(assignees: pd.DataFrame) -> dict[str, str]:
    lookup: dict[str, str] = {}
    for value in text(assignees, "Assignee"):
        canonical_name = normalize_assignee_name(value)
        key = assignee_lookup_key(canonical_name)
        if canonical_name and key:
            lookup[key] = canonical_name
    return lookup


def canonicalize_assignee_series(series: pd.Series, assignee_lookup: dict[str, str]) -> pd.Series:
    return series.map(lambda value: assignee_lookup.get(assignee_lookup_key(value), normalize_assignee_name(value)))


def num(df: pd.DataFrame, column: str) -> pd.Series:
    if column not in df.columns:
        return pd.Series([0.0] * len(df), index=df.index)
    normalized = df[column].astype(str).str.replace(",", "", regex=False).str.strip()
    return pd.to_numeric(normalized, errors="coerce").fillna(0.0)


def parse_worklog_date(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce")


def parse_jira_date(series: pd.Series) -> pd.Series:
    parsed = pd.to_datetime(series, format="%d/%b/%y %I:%M %p", errors="coerce")
    fallback = pd.to_datetime(series, errors="coerce", dayfirst=True)
    return parsed.fillna(fallback)


def parse_simple_date(series: pd.Series) -> pd.Series:
    return pd.to_datetime(series, errors="coerce", dayfirst=True)


def format_date_series(series: pd.Series) -> pd.Series:
    parsed = parse_jira_date(series)
    return parsed.dt.strftime("%Y-%m-%d").fillna("")


def release_for_date(date_value: pd.Timestamp, releases: pd.DataFrame) -> str:
    if pd.isna(date_value):
        return ""
    mask = (releases["Start"] <= date_value) & (releases["End"] >= date_value)
    if not mask.any():
        return ""
    return str(releases.loc[mask, "Release Cycle"].iloc[0])


def as_records(df: pd.DataFrame) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for row in df.to_dict(orient="records"):
        rows.append({key: clean(value) for key, value in row.items()})
    return rows


def first_available(row: pd.Series, columns: list[str]) -> str:
    for column in columns:
        value = row.get(column, "")
        if pd.notna(value) and str(value).strip():
            return str(value).strip()
    return ""


def normalize_program(value: Any) -> str:
    raw_value = "" if pd.isna(value) else str(value).strip()
    if not raw_value:
        return ""
    for code, label in PROGRAM_LABELS.items():
        if raw_value == label or raw_value.upper() == code or raw_value.upper().startswith(f"{code} "):
            return label
    return ""


def split_labels(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(part).strip() for part in value if str(part).strip()]
    raw_value = "" if pd.isna(value) else str(value).strip()
    if not raw_value:
        return []
    return [part.strip() for part in re.split(r"[,;]", raw_value) if part.strip()]


def planning_label_category(value: Any) -> str:
    labels = {label.upper() for label in split_labels(value)}
    has_planned = "PLANNED" in labels
    has_unplanned = "UNPLANNED" in labels
    if has_planned and has_unplanned:
        return "Conflict"
    if has_planned:
        return "Planned"
    if has_unplanned:
        return "Unplanned"
    return ""


def has_label(value: Any, label: str) -> bool:
    expected = label.strip().upper()
    return any(part.strip().upper() == expected for part in split_labels(value))


def resolve_planning_classification(key: Any, parent_key: Any, jira_records: dict[str, dict[str, str]]) -> dict[str, Any]:
    normalized_key = str(key or "").strip().upper()
    normalized_parent_key = str(parent_key or "").strip().upper()
    if normalized_key.startswith("TEMPO-"):
        return {
            "category": "Operations",
            "metadataSource": "Tempo operational key",
            "labels": "",
            "sourceKey": normalized_key,
            "ancestorDepth": 0,
            "parentLabels": "",
            "parentCategory": "",
            "inheritedFromParent": False,
            "conflict": False,
            "parentConflict": False,
            "inspectedKeys": normalized_key,
            "missingKeys": "",
            "reason": "Operational Tempo key",
        }

    inspected: list[str] = []
    missing: list[str] = []
    current_key = normalized_key
    depth = 0
    parent_labels = ""
    parent_category = ""

    while current_key:
        if current_key in inspected:
            return {
                "category": "Unclassified",
                "metadataSource": "",
                "labels": "",
                "sourceKey": "",
                "ancestorDepth": depth,
                "parentLabels": parent_labels,
                "parentCategory": parent_category,
                "inheritedFromParent": False,
                "conflict": False,
                "parentConflict": False,
                "inspectedKeys": ", ".join(inspected),
                "missingKeys": ", ".join(missing),
                "reason": "Parent hierarchy cycle detected",
            }

        record = jira_records.get(current_key)
        if not record:
            missing.append(current_key)
            if depth == 0 and normalized_parent_key:
                current_key = normalized_parent_key
                depth = 1
                continue
            return {
                "category": "Unclassified",
                "metadataSource": "",
                "labels": "",
                "sourceKey": "",
                "ancestorDepth": depth,
                "parentLabels": parent_labels,
                "parentCategory": parent_category,
                "inheritedFromParent": False,
                "conflict": False,
                "parentConflict": False,
                "inspectedKeys": ", ".join(inspected),
                "missingKeys": ", ".join(missing),
                "reason": "Jira key not found in Jira export" if depth == 0 else "Parent key missing from Jira export",
            }

        inspected.append(current_key)
        labels = record.get("labels", "")
        category = planning_label_category(labels)
        if depth == 1:
            parent_labels = labels
            parent_category = category

        if has_label(labels, "tempo-ticket"):
            return {
                "category": "Operations",
                "metadataSource": "Jira tempo-ticket label" if depth == 0 else "Jira ancestor tempo-ticket label",
                "labels": labels,
                "sourceKey": current_key,
                "ancestorDepth": depth,
                "parentLabels": parent_labels,
                "parentCategory": parent_category,
                "inheritedFromParent": depth == 1,
                "conflict": category == "Conflict",
                "parentConflict": depth == 1 and category == "Conflict",
                "inspectedKeys": ", ".join(inspected),
                "missingKeys": ", ".join(missing),
                "reason": "Operational Jira tempo-ticket label",
            }

        if category == "Conflict":
            return {
                "category": "Unclassified",
                "metadataSource": "",
                "labels": labels,
                "sourceKey": current_key,
                "ancestorDepth": depth,
                "parentLabels": parent_labels,
                "parentCategory": parent_category,
                "inheritedFromParent": False,
                "conflict": True,
                "parentConflict": depth >= 1,
                "inspectedKeys": ", ".join(inspected),
                "missingKeys": ", ".join(missing),
                "reason": "Conflicting labels",
            }

        if category in {"Planned", "Unplanned"}:
            if depth == 0:
                source = "Jira issue label"
            elif depth == 1:
                source = "Jira parent label"
            else:
                source = "Jira ancestor label"
            return {
                "category": category,
                "metadataSource": source,
                "labels": labels,
                "sourceKey": current_key,
                "ancestorDepth": depth,
                "parentLabels": parent_labels,
                "parentCategory": parent_category,
                "inheritedFromParent": depth == 1,
                "conflict": False,
                "parentConflict": False,
                "inspectedKeys": ", ".join(inspected),
                "missingKeys": ", ".join(missing),
                "reason": "",
            }

        next_parent = str(record.get("parentKey", "") or "").strip().upper()
        if not next_parent:
            return {
                "category": "Unclassified",
                "metadataSource": "",
                "labels": "",
                "sourceKey": "",
                "ancestorDepth": depth,
                "parentLabels": parent_labels,
                "parentCategory": parent_category,
                "inheritedFromParent": False,
                "conflict": False,
                "parentConflict": False,
                "inspectedKeys": ", ".join(inspected),
                "missingKeys": ", ".join(missing),
                "reason": "Child has no Planned/Unplanned label and parent has no Planned/Unplanned label",
            }

        current_key = next_parent
        depth += 1

    return {
        "category": "Unclassified",
        "metadataSource": "",
        "labels": "",
        "sourceKey": "",
        "ancestorDepth": depth,
        "parentLabels": parent_labels,
        "parentCategory": parent_category,
        "inheritedFromParent": False,
        "conflict": False,
        "parentConflict": False,
        "inspectedKeys": ", ".join(inspected),
        "missingKeys": ", ".join(missing),
        "reason": "Parent relationship not resolved",
    }


def apply_master_date_week(worklogs: pd.DataFrame, master_date: pd.DataFrame) -> None:
    master_dates = master_date.copy()
    master_dates["date"] = parse_simple_date(master_dates["Master Date"]).dt.strftime("%Y-%m-%d")
    master_dates["week"] = pd.to_numeric(master_dates["Week Number"], errors="coerce")
    master_dates = master_dates[master_dates["date"].notna() & master_dates["week"].notna()].copy()
    master_dates["week"] = master_dates["week"].astype(int)
    master_dates["isWorkday"] = text(master_dates, "WeekDay Name").isin(
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    )

    week_by_date = dict(zip(master_dates["date"], master_dates["week"]))
    is_workday_by_date = dict(zip(master_dates["date"], master_dates["isWorkday"]))
    worklog_dates = worklogs["date"].dt.strftime("%Y-%m-%d")
    fallback_week = worklogs["date"].dt.isocalendar().week.astype(int)
    worklogs["week"] = worklog_dates.map(week_by_date).fillna(fallback_week).astype(int)
    worklogs["isWorkday"] = worklog_dates.map(is_workday_by_date).fillna(worklogs["date"].dt.dayofweek < 5)


def main() -> None:
    WEB_DIR.mkdir(parents=True, exist_ok=True)

    worklogs_path = latest_csv(WORKLOGS_PATTERN)
    backlog_path = latest_csv(BACKLOG_PATTERN)
    capacity_path = latest_csv(CAPACITY_PATTERN)
    assignees_path = latest_csv(ASSIGNEES_PATTERN)
    master_date_path = latest_csv(MASTER_DATE_PATTERN)
    releases_path = latest_csv(RELEASES_PATTERN)
    bug_triage_path, previous_bug_triage_path = latest_two_csvs(BUG_TRIAGE_PATTERN)
    tempo_operational_mapping_path = TEMPO_OPERATIONAL_MAPPING

    master_date = pd.read_csv(master_date_path)
    master_dates_out = master_date.copy()
    master_dates_out["date"] = parse_simple_date(master_dates_out["Master Date"]).dt.strftime("%Y-%m-%d")
    master_dates_out["week"] = pd.to_numeric(master_dates_out["Week Number"], errors="coerce")
    master_dates_out = master_dates_out[
        master_dates_out["date"].notna() & master_dates_out["week"].notna()
    ].copy()
    master_dates_out["week"] = master_dates_out["week"].astype(int)
    master_dates_out = master_dates_out[["date", "week"]]
    releases = pd.read_csv(releases_path)
    releases["Start"] = parse_simple_date(releases["Start Date"])
    releases["End"] = parse_simple_date(releases["End Date"])
    tempo_operational_mapping = pd.read_csv(tempo_operational_mapping_path, low_memory=False)
    tempo_operational_mapping, _ = partition_governed_issue_rows(tempo_operational_mapping, "Key")
    tempo_summary_by_key = dict(
        zip(
            text(tempo_operational_mapping, "Key").str.strip().str.upper(),
            text(tempo_operational_mapping, "Summary").str.strip(),
        )
    )

    assignees = pd.read_csv(assignees_path, low_memory=False)
    assignee_name_lookup = build_assignee_name_lookup(assignees)
    team_by_assignee = dict(zip(text(assignees, "Assignee"), text(assignees, "Team")))
    skill_by_assignee = dict(zip(text(assignees, "Assignee"), text(assignees, "Skill")))
    role_by_assignee = dict(zip(text(assignees, "Assignee"), text(assignees, "Role")))
    availability_by_assignee = dict(zip(text(assignees, "Assignee"), text(assignees, "Availability")))

    worklogs = pd.read_csv(worklogs_path, low_memory=False)
    worklogs, excluded_worklogs = partition_governed_issue_rows(worklogs, "Work Item Key")
    excluded_tempo_summary = [
        {
            "key": key,
            "reason": GLOBAL_EXCLUSION_REASONS[key],
            "rows": int((excluded_worklogs["Work Item Key"] == key).sum()),
            "loggedHours": float(
                num(excluded_worklogs.loc[excluded_worklogs["Work Item Key"] == key], "Logged Hours").sum()
            ),
            "billableHours": float(
                num(excluded_worklogs.loc[excluded_worklogs["Work Item Key"] == key], "Billable Hours").sum()
            ),
            "jiraRows": 0,
            "originalEstimateHours": 0.0,
            "remainingEstimateHours": 0.0,
        }
        for key in sorted(GLOBAL_EXCLUDED_ISSUE_KEYS)
    ]
    worklogs["date"] = parse_worklog_date(worklogs["Work date"])
    worklogs = worklogs[worklogs["date"].notna()].copy()
    worklog_date_min = worklogs["date"].min().strftime("%Y-%m-%d")
    worklog_date_max = worklogs["date"].max().strftime("%Y-%m-%d")
    apply_master_date_week(worklogs, master_date)
    worklogs["month"] = worklogs["date"].dt.to_period("M").astype(str)
    worklogs["releaseCycle"] = worklogs["date"].apply(lambda d: release_for_date(d, releases))
    worklog_person = canonicalize_assignee_series(text(worklogs, "Full name"), assignee_name_lookup)
    worklogs_out = pd.DataFrame(
        {
            "key": text(worklogs, "Work Item Key"),
            "summary": text(worklogs, "Work Item summary"),
            "parentKey": normalize_issue_key_series(text(worklogs, "Parent Key")),
            "parentSummary": "",
            "date": worklogs["date"].dt.strftime("%Y-%m-%d"),
            "week": worklogs["week"],
            "isWorkday": worklogs["isWorkday"],
            "month": worklogs["month"],
            "team": worklog_person.map(team_by_assignee).fillna(""),
            "person": worklog_person,
            "assigneeId": text(worklogs, "Assignee ID"),
            "account": "",
            "tempoAccount": text(worklogs, "Account Name"),
            "category": text(worklogs, "Account Category"),
            "delivery": text(worklogs, "Client"),
            "program": "",
            "itemType": "",
            "tempoItemType": text(worklogs, "Work Item Type"),
            "status": "",
            "statusCategory": "",
            "tempoStatus": text(worklogs, "Work Item Status"),
            "priority": text(worklogs, "Priority"),
            "module": text(worklogs, "Product Module"),
            "taskType": text(worklogs, "Task Type"),
            "releaseCycle": worklogs["releaseCycle"],
            "version": text(worklogs, "Version Name"),
            "targetRelease": text(worklogs, "Version Name"),
            "logged": num(worklogs, "Logged Hours"),
            "billable": num(worklogs, "Billable Hours"),
        }
    )
    worklogs_out["skill"] = worklogs_out["person"].map(skill_by_assignee).fillna("")
    worklogs_out["role"] = worklogs_out["person"].map(role_by_assignee).fillna("")
    backlog_worklogs_out = worklogs_out.copy()

    backlog = pd.read_csv(backlog_path, low_memory=False)
    backlog, excluded_backlog = partition_governed_issue_rows(backlog, "Issue key")
    excluded_summary_by_key = {row["key"]: row for row in excluded_tempo_summary}
    for key in sorted(GLOBAL_EXCLUDED_ISSUE_KEYS):
        excluded_jira_rows = excluded_backlog.loc[excluded_backlog["Issue key"] == key]
        summary = excluded_summary_by_key[key]
        summary["jiraRows"] = int(len(excluded_jira_rows))
        summary["originalEstimateHours"] = float(num(excluded_jira_rows, "Original estimate").sum() / 3600)
        summary["remainingEstimateHours"] = float(num(excluded_jira_rows, "Remaining Estimate").sum() / 3600)
    backlog["createdDate"] = parse_jira_date(backlog["Created"])
    backlog["updatedDate"] = parse_jira_date(backlog["Updated"])
    backlog["resolvedDate"] = parse_jira_date(backlog["Resolved"])
    start_columns = [col for col in backlog.columns if col == "Custom field (Start date)" or col.startswith("Custom field (Start date).")]
    parent_key_columns = [
        col
        for col in backlog.columns
        if col in ["Parent key", "Custom field (Parent ticket)", "Custom field (Epic Link)", "Epic Link"]
        or col.startswith("Custom field (Parent ticket).")
        or col.startswith("Custom field (Epic Link).")
    ]
    backlog["jiraStartDate"] = format_date_series(backlog.apply(lambda row: first_available(row, start_columns), axis=1))
    backlog["jiraDueDate"] = format_date_series(text(backlog, "Due date"))
    backlog["jiraParentKey"] = normalize_issue_key_series(
        backlog.apply(lambda row: first_available(row, parent_key_columns), axis=1)
    )
    backlog["jiraParentSummary"] = text(backlog, "Parent summary")
    export_current_date = max(
        pd.Timestamp(parse_export_date(worklogs_path)),
        pd.Timestamp(parse_export_date(backlog_path)),
        worklogs["date"].max(),
    )
    current_date = export_current_date.normalize()
    fix_columns = [col for col in backlog.columns if col == "Fix versions" or col.startswith("Fix versions.")]
    label_columns = [col for col in backlog.columns if col == "Labels" or col.startswith("Labels.")]
    backlog["release"] = backlog.apply(lambda row: first_available(row, fix_columns), axis=1)
    backlog["labels"] = backlog.apply(
        lambda row: ", ".join(
            value
            for value in (first_available(row, [column]) for column in label_columns)
            if value
        ),
        axis=1,
    )
    backlog_assignee = canonicalize_assignee_series(text(backlog, "Assignee"), assignee_name_lookup)
    backlog_team = backlog_assignee.map(team_by_assignee).fillna("")
    backlog_skill = backlog_assignee.map(skill_by_assignee).fillna("")
    backlog_program = text(backlog, "Custom field (Program)").map(normalize_program)
    backlog_out = pd.DataFrame(
        {
            "key": text(backlog, "Issue key"),
            "summary": text(backlog, "Summary"),
            "parentKey": backlog["jiraParentKey"],
            "parentSummary": backlog["jiraParentSummary"],
            "createdDate": backlog["createdDate"].dt.strftime("%Y-%m-%d"),
            "updatedDate": backlog["updatedDate"].dt.strftime("%Y-%m-%d"),
            "resolvedDate": backlog["resolvedDate"].dt.strftime("%Y-%m-%d"),
            "startDate": backlog["jiraStartDate"],
            "dueDate": backlog["jiraDueDate"],
            "projectKey": text(backlog, "Project key"),
            "projectName": text(backlog, "Project name"),
            "type": text(backlog, "Issue Type"),
            "status": text(backlog, "Status"),
            "statusCategory": text(backlog, "Status Category"),
            "priority": text(backlog, "Priority"),
            "bugSeverity": text(backlog, "Custom field (Bug Severity)"),
            "productModule": text(backlog, "Custom field (Product Module)"),
            "team": backlog_team,
            "skill": backlog_skill,
            "assignee": backlog_assignee.replace("", "(unassigned)"),
            "reporter": text(backlog, "Reporter"),
            "release": backlog["release"],
            "labels": backlog["labels"],
            "technicalDebt": text(backlog, "Custom field (Is this technical debt ?)"),
            "delivery": text(backlog, "Custom field (Delivery)"),
            "targetRelease": text(backlog, "Custom field (Target Release)"),
            "program": backlog_program,
            "account": text(backlog, "Custom field (Account)"),
            "originalEstimateHours": num(backlog, "Original estimate") / 3600,
            "remainingEstimateHours": num(backlog, "Remaining Estimate") / 3600,
            "hasRemainingEstimate": text(backlog, "Remaining Estimate").str.strip().ne(""),
        }
    )
    summary_by_key = dict(zip(backlog_out["key"], backlog_out["summary"]))
    missing_parent_summary = backlog_out["parentSummary"].fillna("").astype(str).str.strip().eq("") & backlog_out["parentKey"].fillna("").astype(str).str.strip().ne("")
    backlog_out.loc[missing_parent_summary, "parentSummary"] = backlog_out.loc[missing_parent_summary, "parentKey"].map(summary_by_key).fillna("")

    # Governed Demand layer. It is deliberately separate from the MVP's
    # historical Tempo calculations and provides one demand record per Jira item.
    release_end_by_cycle = dict(zip(text(releases, "Release Cycle"), releases["End"]))
    demand_out = backlog_out.copy()
    demand_out["demandHours"] = demand_out["remainingEstimateHours"].where(demand_out["hasRemainingEstimate"], None)
    demand_out["demandTeam"] = demand_out["team"].where(demand_out["team"].str.strip().ne(""), "Unassigned / To Be Assigned")
    demand_out["planningPeriod"] = demand_out["targetRelease"].fillna("").astype(str).str.strip()
    demand_out["allocationType"] = "Target Release"
    demand_out.loc[demand_out["planningPeriod"].eq(""), "allocationType"] = "Unscheduled / N/A"
    due_dates = pd.to_datetime(demand_out["dueDate"], errors="coerce")
    for index, due_date in due_dates.items():
        target_release = demand_out.at[index, "planningPeriod"]
        target_end = release_end_by_cycle.get(target_release)
        if target_release and target_end is not None and pd.notna(due_date) and due_date > current_date and target_end < current_date:
            demand_out.at[index, "planningPeriod"] = release_for_date(due_date, releases) or "Unscheduled / N/A"
            demand_out.at[index, "allocationType"] = "Backport"
        elif not target_release and pd.notna(due_date):
            inferred_period = release_for_date(due_date, releases)
            if inferred_period:
                demand_out.at[index, "planningPeriod"] = inferred_period
                demand_out.at[index, "allocationType"] = "Due Date fallback"
    demand_out.loc[demand_out["planningPeriod"].eq(""), "planningPeriod"] = "Unscheduled / N/A"
    status_key = demand_out["status"].fillna("").astype(str).str.strip().str.casefold()
    demand_out["reportingStage"] = "Other / Unmapped"
    demand_out.loc[status_key.str.contains("backlog|to do", regex=True), "reportingStage"] = "STEP 1 - Demand"
    demand_out.loc[status_key.str.contains("analysis", regex=True), "reportingStage"] = "STEP 2 - DoR"
    demand_out.loc[status_key.str.contains("ready for development|in development|testing|test complete", regex=True), "reportingStage"] = "STEP 3 - DoD"
    demand_out.loc[status_key.str.contains("done|rejected|cancelled", regex=True), "reportingStage"] = "STEP 4 - Done / Cancelled"
    demand_out["dorDod"] = "Other / Unmapped"
    demand_out.loc[demand_out["reportingStage"].isin(["STEP 1 - Demand", "STEP 2 - DoR"]), "dorDod"] = "DoR"
    demand_out.loc[demand_out["reportingStage"].isin(["STEP 3 - DoD", "STEP 4 - Done / Cancelled"]), "dorDod"] = "DoD"
    demand_out["dataQuality"] = ""
    demand_out.loc[~demand_out["hasRemainingEstimate"], "dataQuality"] = "Missing Remaining Estimate"
    demand_out.loc[demand_out["demandTeam"].eq("Unassigned / To Be Assigned"), "dataQuality"] = demand_out["dataQuality"].mask(demand_out["dataQuality"].eq(""), "Unassigned Team")
    demand_out.loc[demand_out["planningPeriod"].eq("Unscheduled / N/A"), "dataQuality"] = demand_out["dataQuality"].mask(demand_out["dataQuality"].eq(""), "Unscheduled")
    jira_by_key = backlog_out.set_index("key")
    jira_records = {
        str(row["key"]).strip().upper(): {
            "key": str(row["key"]).strip(),
            "parentKey": str(row.get("parentKey", "") or "").strip(),
            "labels": str(row.get("labels", "") or "").strip(),
        }
        for row in backlog_out.to_dict(orient="records")
        if str(row.get("key", "") or "").strip()
    }
    for worklog_frame in (worklogs_out, backlog_worklogs_out):
        worklog_frame["account"] = worklog_frame["key"].map(jira_by_key["account"].to_dict()).fillna("")
        worklog_frame["program"] = worklog_frame["key"].map(jira_by_key["program"].to_dict()).fillna("")
        worklog_frame["itemType"] = worklog_frame["key"].map(jira_by_key["type"].to_dict()).fillna("")
        worklog_frame["productModule"] = worklog_frame["key"].map(jira_by_key["productModule"].to_dict()).fillna("")
        worklog_frame["technicalDebt"] = worklog_frame["key"].map(jira_by_key["technicalDebt"].to_dict()).fillna("")
        worklog_frame["status"] = worklog_frame["key"].map(jira_by_key["status"].to_dict()).fillna("")
        worklog_frame["statusCategory"] = worklog_frame["key"].map(jira_by_key["statusCategory"].to_dict()).fillna("")

    tempo_parent_keys = backlog_worklogs_out["parentKey"].fillna("").astype(str).str.strip()
    jira_fields = {
        "summary": "summary",
        "parentKey": "parentKey",
        "parentSummary": "parentSummary",
        "productModule": "productModule",
        "priority": "priority",
        "status": "status",
        "startDate": "startDate",
        "dueDate": "dueDate",
        "delivery": "delivery",
        "targetRelease": "targetRelease",
        "fixVersion": "release",
    }
    for output_field, jira_field in jira_fields.items():
        backlog_worklogs_out[output_field] = backlog_worklogs_out["key"].map(jira_by_key[jira_field].to_dict()).fillna("")
    missing_parent_key = backlog_worklogs_out["parentKey"].fillna("").astype(str).str.strip().eq("") & tempo_parent_keys.ne("")
    backlog_worklogs_out.loc[missing_parent_key, "parentKey"] = tempo_parent_keys[missing_parent_key]
    parent_summary_by_key = jira_by_key["summary"].to_dict()
    missing_parent_summary = backlog_worklogs_out["parentSummary"].fillna("").astype(str).str.strip().eq("") & backlog_worklogs_out["parentKey"].fillna("").astype(str).str.strip().ne("")
    backlog_worklogs_out.loc[missing_parent_summary, "parentSummary"] = backlog_worklogs_out.loc[missing_parent_summary, "parentKey"].map(parent_summary_by_key).fillna("")
    direct_jira_mask = backlog_worklogs_out["key"].isin(jira_by_key.index)
    parent_inheritance_key = backlog_worklogs_out["key"].fillna("").astype(str).str.strip().str.upper()
    parent_jira_mask = (
        ~direct_jira_mask
        & ~parent_inheritance_key.str.startswith("TEMPO-")
        & backlog_worklogs_out["parentKey"].isin(jira_by_key.index)
    )
    parent_inherited_mask = pd.Series(False, index=backlog_worklogs_out.index)
    parent_inheritance_fields = {
        "account": "account",
        "delivery": "delivery",
        "targetRelease": "targetRelease",
        "fixVersion": "release",
    }
    for output_field, jira_field in parent_inheritance_fields.items():
        parent_values = backlog_worklogs_out["parentKey"].map(jira_by_key[jira_field].to_dict()).fillna("")
        missing_output = backlog_worklogs_out[output_field].fillna("").astype(str).str.strip().eq("")
        inheritance_mask = parent_jira_mask & missing_output & parent_values.astype(str).str.strip().ne("")
        backlog_worklogs_out.loc[inheritance_mask, output_field] = parent_values[inheritance_mask]
        parent_inherited_mask |= inheritance_mask
    normalized_backlog_worklog_keys = backlog_worklogs_out["key"].fillna("").astype(str).str.strip().str.upper()
    tempo_key_mask = normalized_backlog_worklog_keys.str.startswith("TEMPO-")
    planning_results = [
        resolve_planning_classification(row["key"], row["parentKey"], jira_records)
        for row in backlog_worklogs_out[["key", "parentKey"]].to_dict(orient="records")
    ]
    planning_result_frame = pd.DataFrame(planning_results, index=backlog_worklogs_out.index)
    backlog_worklogs_out["planningLabels"] = planning_result_frame["labels"]
    backlog_worklogs_out["planningCategory"] = planning_result_frame["category"]
    backlog_worklogs_out["planningMetadataSource"] = planning_result_frame["metadataSource"]
    backlog_worklogs_out["planningConflict"] = planning_result_frame["conflict"]
    backlog_worklogs_out["planningParentLabels"] = planning_result_frame["parentLabels"]
    backlog_worklogs_out["planningParentCategory"] = planning_result_frame["parentCategory"]
    backlog_worklogs_out["planningInheritedFromParent"] = planning_result_frame["inheritedFromParent"]
    backlog_worklogs_out["planningParentConflict"] = planning_result_frame["parentConflict"]
    backlog_worklogs_out["planningSourceKey"] = planning_result_frame["sourceKey"]
    backlog_worklogs_out["planningAncestorDepth"] = planning_result_frame["ancestorDepth"]
    backlog_worklogs_out["planningInspectedKeys"] = planning_result_frame["inspectedKeys"]
    backlog_worklogs_out["planningMissingKeys"] = planning_result_frame["missingKeys"]
    backlog_worklogs_out["planningUnclassifiedReason"] = planning_result_frame["reason"]
    mapped_tempo_mask = normalized_backlog_worklog_keys.isin(tempo_summary_by_key.keys())
    tempo_descriptions_for_rows = normalized_backlog_worklog_keys.map(tempo_summary_by_key).fillna("")
    backlog_worklogs_out.loc[mapped_tempo_mask, "summary"] = tempo_descriptions_for_rows[mapped_tempo_mask]
    backlog_worklogs_out.loc[tempo_key_mask, "parentKey"] = "N/A"
    backlog_worklogs_out.loc[tempo_key_mask, "parentSummary"] = "N/A"
    backlog_worklogs_out.loc[tempo_key_mask, "priority"] = "Operational"
    backlog_worklogs_out.loc[tempo_key_mask, "status"] = "Operational"
    backlog_worklogs_out.loc[tempo_key_mask, "statusCategory"] = "Operational"
    backlog_worklogs_out.loc[tempo_key_mask, "startDate"] = "N/A"
    backlog_worklogs_out.loc[tempo_key_mask, "dueDate"] = "N/A"
    backlog_worklogs_out.loc[tempo_key_mask, "delivery"] = "N/A"
    backlog_worklogs_out.loc[tempo_key_mask, "targetRelease"] = "N/A"
    backlog_worklogs_out.loc[tempo_key_mask, "fixVersion"] = "N/A"
    backlog_worklogs_out["metadataSource"] = ""
    backlog_worklogs_out.loc[direct_jira_mask, "metadataSource"] = "Jira"
    backlog_worklogs_out.loc[parent_inherited_mask, "metadataSource"] = "Jira parent"
    backlog_worklogs_out.loc[mapped_tempo_mask, "metadataSource"] = "Tempo operational mapping"
    backlog_worklogs_out["tempoDescriptionFound"] = mapped_tempo_mask

    capacity = pd.read_csv(capacity_path, low_memory=False)
    capacity = capacity[capacity["Assignee"].notna()].copy()
    capacity["week"] = pd.to_numeric(capacity["Week Number"], errors="coerce")
    capacity = capacity[capacity["week"].notna()].copy()
    capacity["week"] = capacity["week"].astype(int)
    capacity_out = pd.DataFrame(
        {
            "team": text(capacity, "Assignee").map(team_by_assignee).fillna(""),
            "assignee": text(capacity, "Assignee"),
            "role": text(capacity, "Assignee").map(role_by_assignee).fillna(""),
            "skill": text(capacity, "Assignee").map(skill_by_assignee).fillna(""),
            "availability": text(capacity, "Assignee").map(availability_by_assignee).fillna(""),
            "week": capacity["week"],
            "planned": num(capacity, "Planned Hours"),
        }
    )
    capacity_out = capacity_out[capacity_out["team"].str.strip().ne("")].copy()

    assignees_out = pd.DataFrame(
        {
            "team": text(assignees, "Team"),
            "assignee": text(assignees, "Assignee"),
            "role": text(assignees, "Role"),
            "skill": text(assignees, "Skill"),
            "availability": text(assignees, "Availability"),
            "annualHours": num(assignees, "Actual Annual Hours"),
        }
    )

    assignee_teams = {team for team in assignees_out["team"].dropna().unique() if str(team).strip()}
    capacity_teams = {team for team in capacity_out["team"].dropna().unique() if str(team).strip()}
    valid_team_set = assignee_teams & capacity_teams
    team_dimension_rows = []
    for team in sorted(valid_team_set):
        team_assignees = assignees_out[assignees_out["team"] == team]
        team_capacity = capacity_out[capacity_out["team"] == team]
        team_dimension_rows.append(
            {
                "team": team,
                "assigneeCount": int(team_assignees["assignee"].replace("", pd.NA).dropna().nunique()),
                "capacityRecords": int(len(team_capacity)),
                "annualHours": float(team_assignees["annualHours"].sum()),
                "plannedHours": float(team_capacity["planned"].sum()),
            }
        )
    teams_out = pd.DataFrame(team_dimension_rows)
    bug_triage = pd.read_csv(bug_triage_path, low_memory=False)
    bug_triage_snapshot_summary = bug_triage_snapshot_comparison(
        bug_triage_path,
        bug_triage,
        previous_bug_triage_path,
    )
    bug_triage["normalizedKey"] = text(bug_triage, "Key").str.strip().str.upper()
    bug_triage_valid = bug_triage[
        text(bug_triage, "Issue Type").str.strip().str.casefold().eq("bug")
        & bug_triage["normalizedKey"].ne("")
    ].copy()
    bug_triage_source_rows = int(len(bug_triage_valid))
    bug_triage_distinct_keys = int(bug_triage_valid["normalizedKey"].nunique())
    bug_triage_duplicate_keys = int(bug_triage_source_rows - bug_triage_distinct_keys)
    bug_triage_valid = bug_triage_valid.drop_duplicates(subset=["normalizedKey"], keep="first").copy()
    bug_triage_assignee = text(bug_triage_valid, "Assignee").map(normalize_assignee_name)
    bug_triage_assignee_canonical = canonicalize_assignee_series(bug_triage_assignee, assignee_name_lookup)
    bug_triage_out = pd.DataFrame(
        {
            "key": text(bug_triage_valid, "Key").str.strip(),
            "normalizedKey": bug_triage_valid["normalizedKey"],
            "summary": text(bug_triage_valid, "Summary"),
            "bugSeverity": text(bug_triage_valid, "Bug Severity"),
            "status": text(bug_triage_valid, "Status"),
            "updated": text(bug_triage_valid, "Updated"),
            "assignee": bug_triage_assignee,
            "assigneeCanonical": bug_triage_assignee_canonical,
            "team": bug_triage_assignee_canonical.map(team_by_assignee).fillna(""),
            "skill": bug_triage_assignee_canonical.map(skill_by_assignee).fillna(""),
        }
    )
    bug_triage_assigned = bug_triage_out["assignee"].fillna("").astype(str).str.strip().ne("")
    bug_triage_mapping_exceptions = bug_triage_out.loc[
        bug_triage_assigned & bug_triage_out["team"].fillna("").astype(str).str.strip().eq(""),
        ["key", "assignee"],
    ].to_dict(orient="records")
    bug_severity_counts = bug_triage_out["bugSeverity"].fillna("").astype(str).str.strip().replace("", "-")
    bug_triage_summary = {
        "sourceFile": bug_triage_path.name,
        "sourceRows": int(len(bug_triage)),
        "validBugRows": bug_triage_source_rows,
        "distinctKeys": bug_triage_distinct_keys,
        "duplicateKeys": bug_triage_duplicate_keys,
        "availableColumns": list(bug_triage.columns.drop("normalizedKey")),
        "severityDistribution": {value: int((bug_severity_counts == value).sum()) for value in sorted(bug_severity_counts.unique())},
        "assignedKeys": int(bug_triage_assigned.sum()),
        "unassignedKeys": int((~bug_triage_assigned).sum()),
        "assigneeTeamMappingExceptions": bug_triage_mapping_exceptions,
    }
    program_counts = backlog_out["program"].fillna("").astype(str).str.strip()
    programs_out = pd.DataFrame(
        [
            {"program": program, "count": int((program_counts == program).sum())}
            for program in PROGRAM_LABELS.values()
            if int((program_counts == program).sum()) > 0
        ]
    )
    program_summary = {
        "source": "Jira Custom field (Program)",
        "recordsWithProgram": int(program_counts.ne("").sum()),
        "recordsWithoutProgram": int(program_counts.eq("").sum()),
        "values": as_records(programs_out),
    }
    status_counts = backlog_out["status"].fillna("").astype(str).str.strip()
    status_categories = backlog_out.set_index("status")["statusCategory"].to_dict()
    statuses_out = pd.DataFrame(
        [
            {
                "status": status,
                "statusCategory": status_categories.get(status, ""),
                "jiraRecords": int((status_counts == status).sum()),
            }
            for status in sorted(status_counts[status_counts.ne("")].unique())
        ]
    )
    status_summary = {
        "sourceTable": "Jira PI backlog",
        "sourceField": "Status",
        "join": "Tempo Work Item Key -> Jira Issue key",
        "recordsWithStatus": int(status_counts.ne("").sum()),
        "recordsWithoutStatus": int(status_counts.eq("").sum()),
        "tempoRowsWithJiraStatus": int(worklogs_out["status"].fillna("").astype(str).str.strip().ne("").sum()),
        "tempoRowsWithoutJiraStatus": int(worklogs_out["status"].fillna("").astype(str).str.strip().eq("").sum()),
        "values": as_records(statuses_out),
    }
    worklogs_out.loc[~worklogs_out["team"].isin(valid_team_set), "team"] = ""
    backlog_worklogs_out.loc[~backlog_worklogs_out["team"].isin(valid_team_set), "team"] = ""
    backlog_out.loc[~backlog_out["team"].isin(valid_team_set), "team"] = ""
    assignees_out = assignees_out[assignees_out["team"].isin(valid_team_set)].copy()
    capacity_out = capacity_out[capacity_out["team"].isin(valid_team_set)].copy()

    assignee_skills = assignees_out["skill"].fillna("").astype(str).str.strip()
    valid_skill_set = {skill for skill in assignee_skills.unique() if skill}
    skill_dimension_rows = []
    for skill in sorted(valid_skill_set):
        skill_assignees = assignees_out[assignees_out["skill"] == skill]
        skill_capacity = capacity_out[capacity_out["skill"] == skill]
        skill_dimension_rows.append(
            {
                "skill": skill,
                "assigneeCount": int(skill_assignees["assignee"].replace("", pd.NA).dropna().nunique()),
                "capacityRecords": int(len(skill_capacity)),
                "annualHours": float(skill_assignees["annualHours"].sum()),
                "plannedHours": float(skill_capacity["planned"].sum()),
            }
        )
    skills_out = pd.DataFrame(skill_dimension_rows)
    skill_summary = {
        "source": "Assignees Skill",
        "assigneesWithSkill": int(assignee_skills.ne("").sum()),
        "assigneesWithoutSkill": int(assignee_skills.eq("").sum()),
        "values": as_records(skills_out),
    }
    issue_type_counts = worklogs_out["itemType"].fillna("").astype(str).str.strip()
    issue_types_out = pd.DataFrame(
        [
            {"issueType": issue_type, "tempoWorklogRows": int((issue_type_counts == issue_type).sum())}
            for issue_type in sorted(issue_type_counts[issue_type_counts.ne("")].unique())
        ]
    )
    issue_type_summary = {
        "sourceTable": "Jira PI backlog",
        "sourceField": "Issue Type",
        "join": "Tempo Work Item Key -> Jira Issue key",
        "metric": "Tempo worklog row count",
        "recordsWithJiraIssueType": int(issue_type_counts.ne("").sum()),
        "recordsWithoutJiraIssueType": int(issue_type_counts.eq("").sum()),
        "values": as_records(issue_types_out),
    }

    release_out = pd.DataFrame(
        {
            "month": text(releases, "Release Month"),
            "cycle": text(releases, "Release Cycle"),
            "start": releases["Start"].dt.strftime("%Y-%m-%d"),
            "end": releases["End"].dt.strftime("%Y-%m-%d"),
        }
    )

    builder_path = Path(__file__).resolve()
    app_js_path = WEB_DIR / "app.js"
    source_manifest = [
        {"role": "Tempo worklogs", "file": worklogs_path.name, "path": str(worklogs_path.relative_to(ROOT)), "sha256": file_sha256(worklogs_path), "rows": int(len(worklogs_out))},
        {"role": "Jira PI backlog", "file": backlog_path.name, "path": str(backlog_path.relative_to(ROOT)), "sha256": file_sha256(backlog_path), "rows": int(len(backlog_out))},
        {"role": "Jira Bug Triage queue", "file": bug_triage_path.name, "path": str(bug_triage_path.relative_to(ROOT)), "sha256": file_sha256(bug_triage_path), "rows": int(len(bug_triage_out))},
        {"role": "Weekly capacity", "file": capacity_path.name, "path": str(capacity_path.relative_to(ROOT)), "sha256": file_sha256(capacity_path), "rows": int(len(capacity_out))},
        {"role": "Assignees master", "file": assignees_path.name, "path": str(assignees_path.relative_to(ROOT)), "sha256": file_sha256(assignees_path), "rows": int(len(assignees_out))},
        {"role": "Master date", "file": master_date_path.name, "path": str(master_date_path.relative_to(ROOT)), "sha256": file_sha256(master_date_path), "rows": int(len(master_date))},
        {"role": "Release cycles", "file": releases_path.name, "path": str(releases_path.relative_to(ROOT)), "sha256": file_sha256(releases_path), "rows": int(len(release_out))},
        {"role": "Tempo operational mapping", "file": tempo_operational_mapping_path.name, "path": str(tempo_operational_mapping_path.relative_to(ROOT)), "sha256": file_sha256(tempo_operational_mapping_path), "rows": int(len(tempo_operational_mapping))},
    ]

    payload = {
        "meta": {
            "generatedOn": current_date.strftime("%Y-%m-%d"),
            "dateMin": worklog_date_min,
            "dateMax": worklog_date_max,
            "currentDate": current_date.strftime("%Y-%m-%d"),
            "sources": [
                {"name": item["role"], "file": item["file"], "rows": item["rows"]}
                for item in source_manifest
            ],
            "buildManifest": {
                "builderScript": str(builder_path.relative_to(ROOT)),
                "builderSha256": file_sha256(builder_path),
                "frontendScript": str(app_js_path.relative_to(ROOT)),
                "frontendSha256": file_sha256(app_js_path) if app_js_path.is_file() else "",
                "governedExclusionsScript": "scripts/governed_exclusions.py",
                "governedExclusionsSha256": file_sha256(ROOT / "scripts" / "governed_exclusions.py"),
                "sourceFiles": source_manifest,
            },
            "notes": [
                "The local .gdoc files are Google Drive shortcuts; their document body was not exposed by the mounted filesystem.",
                "Date range filters Tempo worklogs by work date; the Backlog detail table uses Tempo Work Date, Jira metadata for Jira-linked items, and tempo_operational_mapping.csv metadata for mapped Tempo operational items.",
                "The exact keys TEMPO-54, TEMPO-92, TEMPO-106, TEMPO-111, and TEMPO-112 are globally excluded before aggregation, classification, enrichment, joins, reconciliation, filter population, export, or rendering.",
                "Capacity uses weekly planned hours and compares only weeks covered by the selected date range.",
                "Team dimension is sourced from Assignees master and constrained to teams with weekly capacity records.",
                "Skill dimension is sourced from Assignees master and filters worklogs, Jira demand, and capacity through assignee mapping.",
                "Account dimension is sourced from Jira Custom field (Account) and joined to Tempo worklogs by work item key.",
                "Program dimension is sourced from Jira Custom field (Program) and joined to Tempo worklogs by work item key.",
                "Backlog and Delivery Progress metadata inherits Account, Delivery, Target Release, and Fix Version from the Jira parent only when a child Tempo work item is absent from the Jira export and the parent exists; the child key is preserved.",
                "Work Item Types dimension is sourced from Jira Issue Type and joined to Tempo worklogs by work item key; the chart metric is Tempo worklog row count.",
                "Status dimension is sourced from Jira Status and joined to Tempo worklogs by work item key; selecting a status filters both Jira demand rows and matched Tempo worklogs.",
                "Bug Triage is an inventory-based Jira queue from the dedicated Bug Triage export. Jira Updated is displayed exactly as exported; Tempo does not participate in this table.",
            ],
            "programSummary": program_summary,
            "statusSummary": status_summary,
            "skillSummary": skill_summary,
            "issueTypeSummary": issue_type_summary,
            "bugTriageSummary": bug_triage_summary,
            "bugTriageSnapshotComparison": bug_triage_snapshot_summary,
            "excludedIssueKeys": sorted(GLOBAL_EXCLUDED_ISSUE_KEYS),
            "excludedTempoWorkItems": excluded_tempo_summary,
        },
        "teams": as_records(teams_out),
        "skills": as_records(skills_out),
        "programs": as_records(programs_out),
        "statuses": as_records(statuses_out),
        "issueTypes": as_records(issue_types_out),
        "worklogs": as_records(worklogs_out),
        "backlogWorklogs": as_records(backlog_worklogs_out),
        "tempoOperationalMappings": as_records(tempo_operational_mapping),
        "tempoDescriptions": as_records(tempo_operational_mapping),
        "backlog": as_records(backlog_out),
        "demand": as_records(demand_out),
        "bugTriage": as_records(bug_triage_out),
        "capacity": as_records(capacity_out),
        "assignees": as_records(assignees_out),
        "masterDates": as_records(master_dates_out),
        "releases": as_records(release_out),
    }

    data_path = WEB_DIR / "data.js"
    unsigned_body = "window.BI_DATA = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n"
    payload["meta"]["buildManifest"]["payloadSha256"] = hashlib.sha256(unsigned_body.encode("utf-8")).hexdigest().upper()
    data_js_body = "window.BI_DATA = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n"
    data_path.write_text(data_js_body, encoding="utf-8")

    manifest_path = WEB_DIR / "build-manifest.json"
    manifest_path.write_text(
        json.dumps(payload["meta"]["buildManifest"], ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(data_path)
    print(manifest_path)


if __name__ == "__main__":
    main()

