# Release testing and fixture provisioning

## Public reproducible gates

Use Node 22 or newer (validated here with Node 24.15.0). Install locked development dependencies with npm ci, then npx playwright install chromium. Playwright is pinned to 1.62.1; its matching playwright-core/browser revision is selected by that release. Run npm test, or npm run test:domain and npm run test:browser separately. No production CSV, generated web/data.js, private capture or installed local browser is required: the browser test serves a deterministic in-memory invented payload instead of the generated dataset. Test output is console-only; no screenshot or evidence overwrite occurs.

For an approved system Chromium installation, set CH005A_BROWSER_EXECUTABLE to its executable. With no override, Playwright uses its installed browser. No machine path is hard-coded. Set the variable using your shell's environment syntax. Missing Playwright/browser is an error, not PASS. The development dependency manifests are package.json and package-lock.json; no root dependency convention existed previously. Public tests use Node built-ins plus pinned Playwright. No Python install is required for public gates. Run npm run test:docs for publication-link closure, credential-pattern screening and protected formula hashes. Organizational sensitivity review remains separate from a pattern scan.

The invented fixture includes equal Account names with distinct keys, multi-Account issues, all-missing and partial keys, a Jira-only issue, operations/exclusions, selected union estimates and v1 label differences. The public capacity suite preserves the existing 14 synthetic assertions, including parent/child precedence, confirmed zero, unavailable capacity, workforce filters and calendar authority. A synthetic annual KPI check protects gross/actual balance and zero-denominator behavior. These tests do not reproduce operational totals or prove historical 97-case equivalence.

## Dependency classification

| Dependency | Class | Resolution |
| --- | --- | --- |
| Runtime Account/export/capacity/annual modules | A: tracked source | Loaded directly by tests; no changed calculation code. |
| scripts/fixtures/portfolio-synthetic.cjs | B: invented fixture | Deterministic public payload; no source-row transformation or production identifiers. |
| Generated operational payload | C: authorized private input | Provision using authorized source exports and the existing builder; never commit. |
| Before-results, legacy capture and frozen before runtime/data | C: private captures, D when unavailable historically | Preserve the original matching snapshot/captures in private local storage. Never reconstruct an expected baseline from the current outputs under test. |
| Capacity historical baseline JSON and matching old payload | D: historical replay | Existing historical suite requires matching source fingerprints. Missing old exports remain SKIPPED/BLOCKED, not certified by public capacity tests. |
| Playwright / browser | A: reproducible tools | Exact Playwright version in package.json; install matching Chromium or explicitly configure executable. |
| Python / pandas for private builds | C: private workflow tooling | Python 3.12 (validated 3.12.14), pandas 3.0.1 in requirements-test.txt. Build setup remains separate from public JS tests. |

## Optional private reconciliation gate

The original CH-005A domain and browser programs are retained locally at scripts/legacy/test_portfolio_accounts_private.cjs and scripts/legacy/verify_portfolio_accounts_private.cjs. These archived programs contain current-source reference cases and are excluded from the public package. The obsolete verify_tempo_account_filters program is archival CH-004 evidence and is never invoked by the active public gate.

Run npm run test:private only after the data owner authorizes local access and CH005A_PRIVATE_GATE=1 is set. Without opt-in, the runner exits 2 with BLOCKED. Required artifacts include the local generated payload, outputs/ch005a/before-results.json, outputs/ch005a/before-legacy-exports.json and the complete frozen outputs/ch005a/before runtime/payload. Obtain the original matching capture set from its authorized custodian, preserving source identities; do not capture today's output and call it historical expected data. The archived test programs must also be provisioned locally. Missing required files exit 2 with BLOCKED, never a passing reduced suite. CH005A_PRIVATE_ROOT can point at an authorized provisioned repository-shaped private workspace; it is optional and defaults to the current repository.

The runner copies the local web application and private evidence to a fresh OS temporary directory, then executes there. Original generated payload and historical outputs are not overwritten. Temporary private outputs remain sensitive and subject to the local retention policy; no automatic recursive cleanup is performed. Existing production-data source setup is intentionally not reproduced in the public package. Historical capacity replay and the 13 supplemental legacy filter cases are separate retained evidence; a private run does not automatically claim their fresh execution. The historical 97-case record is 84 captured exports plus those 13 cases, and remains distinct from synthetic compatibility assertions.

## Publication evidence

See [the sanitized publication summary](../audit/CH005A_PUBLICATION_SUMMARY_v1.md) and the [canonical calculation contract](../governance/Calculation_Governance.md). All accepted limitations remain. v0.17 is provisional; no baseline file, tag or publication is created by test execution.
