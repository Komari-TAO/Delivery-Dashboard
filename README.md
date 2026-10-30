# OAT - CoE - Delivery Dashboard

Browser-based delivery-management dashboard for governed Tempo effort, Jira delivery demand, workforce capacity, and delivery workflow visibility.

## Start here

- [User Guide](./docs/user-guides/User_Guide.md) — how to use the dashboard.
- [Chart and Visual Specification](./docs/user-guides/Chart_and_Visual_Specification.md) — authoritative fields, relationships, KPIs, charts, and filter rules.
- [MVP Business Rules](./docs/governance/MVP_Business_Rules.md) — business/source governance.

## Data refresh

1. Put the CSV exports in `data/raw/`.
2. Build the browser payload:

   ```powershell
   python scripts/build_web_data.py
   ```

3. Serve the repository locally:

   ```powershell
   python -m http.server 8000 -d web
   ```

4. Open `http://127.0.0.1:8000/`.

The active roster, Development, Support, Tempo and Jira exports are selected explicitly in `scripts/capacity_sources.py` and `scripts/sync_dashboard.ps1`. The roster comes from the six delivery teams in `20261028_Assignees_Capacity.csv`, unique by Assignee ID; Engineering rows remain separate reconciliation metadata. Weekly Development uses `Weekly Capacity_20261028.csv` directly. `Support hours 2026.csv` is used only for the local reconciliation, not dashboard capacity formulas or actuals. Active Tempo/Jira snapshots remain dated October 30. The old `rollback-single-team.csv` is retained for recovery and optional comparison only; builds do not require it. Run `python scripts/capacity_sources.py` for the local CSV/JSON reconciliation under `outputs/capacity_reconciliation_20261030/`. Source checksums are recorded in that report and the generated manifest. Other source fields and existing chart rules are in the Chart and Visual Specification.

## Repository layout

| Path | Purpose |
| --- | --- |
| `web/` | Static dashboard UI and generated local payload. |
| `scripts/build_web_data.py` | Active payload builder. |
| `data/raw/` | Local CSV source exports; ignored by Git. |
| `data/mappings/` | Governed supporting mappings. |
| `docs/user-guides/` | Dashboard usage and detailed field specification. |
| `docs/governance/` | Business, calculation, and visualization governance. |
| `docs/audit/` | Historical architecture and risk evidence. |
| `scripts/legacy/` | Archived superseded workbook/profiling scripts; not part of the web-dashboard refresh path. |

## Validation

After a refresh, run:

```powershell
node --check web/app.js
node --check web/demand.js
python -m py_compile scripts/build_web_data.py
node scripts/verify_bi_app_chrome_cdp.mjs
```

The browser validation starts its own temporary local server and detects Chrome or Edge automatically.

`web/data.js` and `web/build-manifest.json` are generated local artifacts and are intentionally ignored because they can include derived operational data.
