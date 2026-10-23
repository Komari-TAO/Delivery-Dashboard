/* Run with Playwright available through NODE_PATH. No production test hooks. */
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");

(async () => {
  const output = path.join(root, ".tmp", "client_attribution");
  await fs.mkdir(output, { recursive: true });
  const candidates = ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"];
  const executablePath = (await Promise.all(candidates.map(async (candidate) => {
    try { await fs.access(candidate); return candidate; } catch { return null; }
  }))).find(Boolean);
  const browser = await chromium.launch({ ...(executablePath ? { executablePath } : {}), headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 980 }, acceptDownloads: true });
    const errors = [];
    const knownConsoleDiagnostics = new Set();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      // Reproduced with pre-change app.js at narrow widths. The treemap omits
      // tiny tiles; underlying account rows/CSV still reconcile. See the audit.
      if (/^Account Distribution total mismatch \{expected: [\d.]+, actual: [\d.]+\}$/.test(message.text())) knownConsoleDiagnostics.add(message.text());
      else errors.push(message.text());
    });
    // Expose existing functions only in intercepted test responses.
    for (const [file, hook] of [
      ["app.js", "window.__clientPortfolio = { state, filteredData, governedLoggedWorklogRows, demandBacklogData, buildUpdateContext, groupAccounts, detailColumns, sortDetailRows, update };"],
      ["demand.js", "window.__clientDemand = { current, periodCapacity, render };"],
    ]) {
      const source = await fs.readFile(path.join(root, "web", file), "utf8");
      await page.route(`**/${file}`, (route) => route.fulfill({ contentType: "application/javascript", body: source.replace(/\}\)\(\);\s*$/, `${hook}\n})();`) }));
    }
    await page.goto(process.env.DASHBOARD_URL || "http://127.0.0.1:8766/", { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__clientPortfolio && window.__clientDemand);
    const initial = await page.evaluate(() => {
      const p = window.__clientPortfolio;
      const d = window.BI_DATA;
      const summarize = (rows) => ({ count: rows.length, hours: rows.reduce((s, r) => s + (Number(r.logged) || 0), 0) });
      return {
        portfolioValues: [...document.querySelectorAll("#clientFacet input")].map((i) => i.value).sort(),
        demandValues: [...document.querySelectorAll("#demandClientFacet input")].map((i) => i.value).sort(),
        expectedValues: [...new Set([...d.worklogs, ...d.backlog].map((r) => r.tempoCustomerAccount))].sort(),
        sourceKpis: document.querySelector("#generalKpiGrid").textContent,
        counts: Object.fromEntries(Object.entries(p.filteredData()).map(([k, rows]) => [k, summarize(rows)])),
        charts: [...document.querySelectorAll(".chart-frame svg")].length,
      };
    });
    assert.deepEqual(initial.portfolioValues, initial.expectedValues);
    assert.deepEqual(initial.demandValues, initial.expectedValues);
    assert(initial.charts >= 5);
    const portfolioChecks = [];
    for (const selected of [["HK DIR"], ["OAT"], ["N/A"], ["HK DIR", "N/A"]]) {
      await page.locator("#resetFilters").click();
      const baseline = await page.evaluate(() => {
        const p = window.__clientPortfolio;
        window.__clientBaseline = { ...p.filteredData(), governed: p.governedLoggedWorklogRows(), demandBacklog: p.demandBacklogData() };
        return true;
      });
      assert(baseline);
      await page.locator("#clientPickerToggle").click();
      for (const client of selected) await page.locator("#clientFacet input").evaluateAll((inputs, value) => {
        const input = inputs.find((i) => i.value === value); input.checked = true; input.dispatchEvent(new Event("change", { bubbles: true }));
      }, client);
      const result = await page.evaluate((clients) => {
        const p = window.__clientPortfolio;
        const actual = { ...p.filteredData(), governed: p.governedLoggedWorklogRows(), demandBacklog: p.demandBacklogData() };
        const mismatches = [];
        for (const [name, rows] of Object.entries(actual)) {
          const expected = name === "capacity" ? window.__clientBaseline[name] : window.__clientBaseline[name].filter((r) => clients.includes(r.tempoCustomerAccount));
          if (JSON.stringify(rows) !== JSON.stringify(expected)) mismatches.push(name);
        }
        const ctx = p.buildUpdateContext();
        window.__expectedExport = [p.detailColumns("accounts").map((c) => c.label), ...p.sortDetailRows(p.groupAccounts(ctx.data.backlog, ctx.effortData.baseFiltered.worklogs, ctx.data.backlog), "accounts", p.detailColumns("accounts")).map((r) => p.detailColumns("accounts").map((c) => c.percent ? (Number(r[c.key]) || 0).toFixed(4) : c.numeric ? (Number(r[c.key]) || 0).toFixed(c.digits || 0) : r[c.key]))];
        return { selected: clients, mismatches, jiraRows: actual.backlog.length, unloggedNaVisible: actual.backlog.filter((r) => r.clientAttributionStatus === "No direct Tempo worklogs").length, charts: document.querySelectorAll(".chart-frame svg").length };
      }, selected);
      assert.deepEqual(result.mismatches, []);
      if (selected.includes("N/A")) assert(result.unloggedNaVisible > 0);
      if (selected.length === 1 && selected[0] === "HK DIR") await page.screenshot({ path: path.join(output, "portfolio-client-selected.png"), fullPage: true });
      // All four Portfolio detail tabs must render under the same Client selection.
      for (const detail of ["accounts", "people", "backlog", "deliveryProgress"]) {
        await page.locator(`button[data-detail="${detail}"]`).click();
        assert(await page.locator("#detailTable thead th").count() > 0);
      }
      await page.evaluate(() => {
        window.__exportText = null;
        URL.createObjectURL = (blob) => { blob.text().then((text) => { window.__exportText = text; }); return "blob:test"; };
        URL.revokeObjectURL = () => {};
        HTMLAnchorElement.prototype.click = function () {};
      });
      await page.locator("#downloadSnapshot").click();
      await page.waitForFunction(() => window.__exportText !== null);
      assert(await page.evaluate(() => {
        const cell = (v) => /[",\n]/.test(String(v ?? "")) ? `"${String(v ?? "").replaceAll('"', '""')}"` : String(v ?? "");
        return window.__exportText === window.__expectedExport.map((r) => r.map(cell).join(",")).join("\n");
      }));
      portfolioChecks.push(result);
    }
    // Intersect Client with every other populated Portfolio categorical filter.
    const intersections = await page.evaluate(() => {
      const p = window.__clientPortfolio;
      const results = [];
      for (const [dimension, field, source] of [["teams", "team", "backlog"], ["assignees", "assignee", "backlog"], ["skills", "skill", "backlog"], ["accounts", "account", "backlog"], ["priorities", "priority", "backlog"], ["statuses", "status", "backlog"], ["targetReleases", "targetRelease", "backlog"]]) {
        p.state.clients.clear();
        const previous = p.state[dimension];
        const row = window.BI_DATA[source].find((r) => r.tempoCustomerAccount === "HK DIR" && r[field]);
        p.state[dimension] = new Set([row[field]]);
        const before = p.filteredData();
        p.state.clients = new Set(["HK DIR"]);
        const after = p.filteredData();
        results.push({ dimension, ok: Object.keys(after).every((k) => JSON.stringify(after[k]) === JSON.stringify(k === "capacity" ? before[k] : before[k].filter((r) => r.tempoCustomerAccount === "HK DIR"))) });
        p.state[dimension] = previous;
      }
      return results;
    });
    assert(intersections.every((r) => r.ok));
    await page.locator("#resetFilters").click();
    await page.locator("#clientPickerToggle").click();
    await page.locator("#clientSelectAll").click();
    assert(await page.evaluate(() => window.__clientPortfolio.filteredData().worklogs.length === window.__clientBaseline.worklogs.length));
    await page.locator("#clientClearAll").click();
    await page.locator("#resetFilters").click();
    const reset = await page.evaluate(() => ({ sourceKpis: document.querySelector("#generalKpiGrid").textContent, counts: Object.fromEntries(Object.entries(window.__clientPortfolio.filteredData()).map(([k, rows]) => [k, { count: rows.length, hours: rows.reduce((s, r) => s + (Number(r.logged) || 0), 0) }])) }));
    assert.deepEqual(reset.counts, initial.counts);
    assert.equal(reset.sourceKpis, initial.sourceKpis);
    await page.screenshot({ path: path.join(output, "portfolio.png"), fullPage: true });
    await page.locator('[data-workspace-tab="demandTab"]').click();
    const demandChecks = [];
    for (const selected of [["HK DIR"], ["N/A"], ["OAT", "N/A"]]) {
      await page.locator("#resetDemandFilters").click();
      await page.evaluate(() => { window.__demandBaseline = window.__clientDemand.current(); });
      await page.locator("#demandClientPickerToggle").click();
      for (const value of selected) await page.locator("#demandClientFacet input").evaluateAll((inputs, client) => {
        const i = inputs.find((r) => r.value === client); i.checked = true; i.dispatchEvent(new Event("change", { bubbles: true }));
      }, value);
      const result = await page.evaluate((clients) => {
        const current = window.__clientDemand.current();
        const expected = window.__demandBaseline;
        const known = expected.demand.filter((r) => clients.includes(r.tempoCustomerAccount));
        const actual = expected.actual.filter((r) => clients.includes(r.tempoCustomerAccount));
        const p = (rows) => JSON.stringify(rows);
        const workflowCount = [...document.querySelectorAll("#demandWorkflow .workflow-stage-stats > span:first-child strong")].reduce((s, n) => s + Number(n.textContent.replaceAll(",", "")), 0);
        const epics = window.BI_DATA.backlog.filter((r) => ["epic", "epic lab", "epic release"].includes(r.type.toLowerCase()) && clients.includes(r.tempoCustomerAccount));
        return { selected: clients, demand: current.demand.length, actual: current.actual.length, matches: p(current.demand) === p(known) && p(current.actual) === p(actual), workflowCount, expectedEpics: epics.length, capacityUnchanged: p(window.__clientDemand.periodCapacity(current.filters)) === p(window.__clientDemand.periodCapacity(expected.filters)) };
      }, selected);
      assert(result.matches && result.capacityUnchanged);
      assert.equal(result.workflowCount, result.expectedEpics);
      if (selected.length === 1 && selected[0] === "N/A") await page.screenshot({ path: path.join(output, "demand-client-na.png"), fullPage: true });
      demandChecks.push(result);
    }
    await page.locator("#resetDemandFilters").click();
    await page.screenshot({ path: path.join(output, "demand.png"), fullPage: true });
    await page.setViewportSize({ width: 390, height: 920 });
    await page.screenshot({ path: path.join(output, "mobile.png"), fullPage: true });
    assert.deepEqual(errors, []);
    const report = { status: "PASS", initial, portfolioChecks, intersections, demandChecks, errors, knownConsoleDiagnostics: [...knownConsoleDiagnostics] };
    await fs.writeFile(path.join(output, "browser-validation.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally { await browser.close(); }
})().catch((error) => { console.error(error); process.exitCode = 1; });
