from __future__ import annotations

"""Focused regression checks for the Authoring capacity-report extraction."""

import json
from pathlib import Path

from generate_authoring_team_capacity_report import OUTPUT, canonical_key


def close(left: float, right: float, message: str) -> None:
    if abs(left - right) > 1e-7:
        raise AssertionError(f"{message}: {left} != {right}")


def main() -> None:
    if not (OUTPUT / "report_data.json").exists():
        raise FileNotFoundError("Generate the report dataset before running these checks.")
    report = json.loads((OUTPUT / "report_data.json").read_text(encoding="utf-8"))
    summary = report["summary"]
    checks = {row["Check name"]: row for row in report["checks"]}

    assert canonical_key("Zoë.Smith") == canonical_key("Zoe Smith")
    assert canonical_key("Aleksej-Tikhanovich") == canonical_key("Aleksej Tikhanovich")
    assert int(summary["accountCustomerColumnPosition"]) == 19, "Tempo Account Customer must remain Column S in this export"

    assignee_logged = sum(float(row["Logged Total"]) for row in report["assigneeCapacity"])
    account_logged = sum(float(row["Total Logged Hours"]) for row in report["accountMatrix"])
    iteration_logged = sum(float(row["Logged Total"]) for row in report["iterationTrends"])
    skill_logged = sum(float(row["Logged Total"]) for row in report["skillAnalysis"] if row["Row Type"] == "Member")
    close(assignee_logged, float(summary["loggedTotal"]), "Assignee total reconciliation")
    close(account_logged, float(summary["loggedTotal"]), "Account matrix reconciliation")
    close(iteration_logged, float(summary["loggedTotal"]), "Iteration reconciliation")
    close(skill_logged, float(summary["loggedTotal"]), "Skill reconciliation")

    demand_keys = [row["Jira Issue Key"] for row in report["outstandingDemandDetail"]]
    assert len(demand_keys) == len(set(demand_keys)), "Outstanding demand must appear once per Jira key"
    assert all(not key.startswith("TEMPO-") for key in demand_keys), "Operational Tempo items must not appear in Jira demand"
    assert all(row["Outcome"] != "FAIL" for row in checks.values()), "Generated report contains a failed reconciliation"

    print("PASS: Authoring capacity report regression checks")


if __name__ == "__main__":
    main()
