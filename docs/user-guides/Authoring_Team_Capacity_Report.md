# Authoring Team Capacity and Effort Report

## Refresh

1. Place the latest Assignees, Weekly Capacity, Tempo, Jira, Master Date, and Release Cycle CSV exports in `data/raw/`.
2. Run `python scripts/generate_authoring_team_capacity_report.py`.
3. Run `python scripts/test_authoring_capacity_effort_report.py`.
4. Run `node scripts/build_authoring_team_capacity_workbook.mjs`.

The generated workbook is `outputs/authoring_team_capacity_effort/Authoring_Team_Capacity_and_Effort.xlsx`.

## Scope and important boundaries

- Workforce Team and Skill come only from Assignees CSV. Tempo and Jira Team values do not alter workforce membership.
- Historical effort comes only from governed Tempo worklogs. Tempo `Account Customer` is the account field used in this report; blank values appear as `[Missing Account Customer]`.
- Capacity uses Weekly Capacity rows for Master Date weeks represented by the historical Tempo date range. A report ending during a week labels current-period comparisons as partial.
- Outstanding demand uses Jira Remaining Estimate only, one time per unique Jira key, and only for eligible non-terminal Jira items assigned to an Authoring workforce member. It is shown separately from historical effort and is never added to capacity or actuals.
- Parent and child Jira keys remain distinct. The report does not infer whether a parent estimate includes child estimates.
