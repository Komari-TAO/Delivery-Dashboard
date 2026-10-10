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

The build chooses the latest matching export in `data/raw/`. See the Chart and Visual Specification for current file patterns and exact field names.

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
