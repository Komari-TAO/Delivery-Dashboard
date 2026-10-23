/* NODE_PATH must include Playwright. Uses test-only response injection. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');

(async () => {
  const server = http.createServer(async (req, res) => {
    try {
      const name = new URL(req.url, 'http://localhost').pathname;
      const file = path.join(root, 'web', name === '/' ? 'index.html' : name);
      res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
      res.end(await fs.readFile(file));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const errors = [];
  const output = path.join(root, '.tmp', 'account-operations');
  await fs.mkdir(output, { recursive: true });
  const baselineFile = path.join(output, 'before-app.js');
  const hasBaseline = await fs.access(baselineFile).then(() => true, () => false);
  try {
    async function open(baseline) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error' && (!baseline || !m.text().startsWith('Account Distribution total mismatch'))) errors.push(m.text()); });
      const source = await fs.readFile(baseline && hasBaseline ? baselineFile : path.join(root, 'web/app.js'), 'utf8');
      const hook = `window.__treemap = { state, filteredData, buildUpdateContext, renderAccountTreemap, update, downloadSnapshot, isTempoWorkItem, groupPeople, peopleTotalsRow, engineeringWorkMixRows };
        window.__treemapSignature = function compact(value) {
          if (Array.isArray(value)) {
            let hash = 2166136261;
            value.forEach(row => { const text = JSON.stringify(row); for (let i=0; i<text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619); });
            return { length: value.length, hash: hash >>> 0 };
          }
          if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, compact(v)]));
          return value;
        };`;
      await page.route('**/app.js', route => route.fulfill({ contentType: 'application/javascript', body: source.replace(/\}\)\(\);\s*$/, `${hook}\n})();`) }));
      await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
      return page;
    }
    const old = await open(true);
    const before = await old.evaluate(() => {
      const p = __treemap, ctx = p.buildUpdateContext();
      return { governedHours: ctx.effortData.baseFiltered.worklogs.filter(r => BI_DATA.teams.some(t => t.team === r.team)).reduce((s,r) => s+r.logged,0),
        tileHours: [...document.querySelectorAll('#accountTreemap .treemap-tile')].reduce((s,n) => s+Number(n.dataset.logged),0),
        footer: document.querySelector('#accountTreemap .treemap-summary').textContent,
        missingAccountHours: ctx.effortData.baseFiltered.worklogs.filter(r => BI_DATA.teams.some(t => t.team === r.team) && !r.tempoAccount).reduce((s,r) => s+r.logged,0),
        context: JSON.stringify(__treemapSignature(ctx)),
      };
    });
    await old.close();
    const page = await open(false);
    assert.equal(await page.evaluate(() => JSON.stringify(__treemapSignature(__treemap.buildUpdateContext()))), before.context);
    // The whole unrelated DOM, shared context and snapshot export must survive local changes.
    const fingerprint = () => page.evaluate(async () => {
      let csv = '';
      const create = URL.createObjectURL, revoke = URL.revokeObjectURL, click = HTMLAnchorElement.prototype.click;
      URL.createObjectURL = blob => { window.__csv = blob.text(); return 'blob:test'; };
      URL.revokeObjectURL = () => {}; HTMLAnchorElement.prototype.click = () => {};
      __treemap.downloadSnapshot(); csv = await window.__csv;
      URL.createObjectURL = create; URL.revokeObjectURL = revoke; HTMLAnchorElement.prototype.click = click;
      const values = { context: __treemapSignature(__treemap.buildUpdateContext()), state: Object.fromEntries(Object.entries(__treemap.state).map(([k,v]) => [k, v instanceof Set ? [...v] : v])), csv,
        kpis: document.querySelector('#generalKpiGrid').innerHTML, table: document.querySelector('#detailTable').innerHTML };
      for (const chart of document.querySelectorAll('.chart-frame')) if (chart.id !== 'accountTreemap') {
        const clone = chart.cloneNode(true);
        // Existing responsive reflow adjusts the SVG CSS height. Compare all
        // chart data, text, geometry and styling except this viewport sizing.
        clone.querySelectorAll('svg').forEach(svg => { svg.style.height = ''; if (!svg.getAttribute('style')) svg.removeAttribute('style'); });
        values[`chart:${chart.id}`] = clone.innerHTML;
      }
      return Object.fromEntries(await Promise.all(Object.entries(values).map(async ([k,v]) => [k, [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(v))))].map(n => n.toString(16).padStart(2,'0')).join('')])));
    });
    const fixed = await fingerprint();
    const checks = [];
    async function reconcile(label) {
      const r = await page.evaluate(() => {
        const client = document.querySelector('#accountDistributionClient').value;
        const account = document.querySelector('#accountDistributionAccount').value;
        const rows = __treemap.buildUpdateContext().effortData.baseFiltered.worklogs.filter(r => BI_DATA.teams.some(t => t.team === r.team));
        const clientKey = r => JSON.stringify([r.clientAttributionStatus === 'Verified' ? String(r.tempoCustomerAccount || '').trim() : '']);
        const accountKey = r => JSON.stringify([String(r.tempoAccountKey || '').trim()]);
        const customerRows = rows.filter(r => !__treemap.isTempoWorkItem(r.key));
        const totals = __treemap.peopleTotalsRow(__treemap.groupPeople(rows, []));
        const mix = __treemap.engineeringWorkMixRows(rows);
        const visible = customerRows.filter(r => (!client || clientKey(r) === client) && (!account || accountKey(r) === account));
        const expected = visible.reduce((s,r) => s+r.logged,0);
        const tiles = [...document.querySelectorAll('#accountTreemap .treemap-tile')];
        return { expected, rendered: tiles.reduce((s,n) => s+Number(n.dataset.logged),0), percent: tiles.reduce((s,n) => s+Number(n.dataset.percent),0),
          total: totals.loggedTotal, operations: totals.loggedOperations, engineering: totals.loggedEngineering,
          mixOperations: mix.operations.logged, mixEngineering: mix.engineeringLoggedHours,
          footer: Object.fromEntries([...document.querySelectorAll('#accountTreemap .treemap-summary [data-metric]')].map(n => [n.dataset.metric, { hours: Number(n.dataset.hours), text: n.textContent }])),
          local: Boolean(client || account),
          tileCount: tiles.length, bucketCount: new Set(visible.filter(r => r.logged > 0).map(client || account ? accountKey : clientKey)).size,
          rectsPositive: tiles.every(n => Number(n.querySelector('rect').getAttribute('width')) > 0 && Number(n.querySelector('rect').getAttribute('height')) > 0),
          subtitle: document.querySelector('#accountTreemapSubtitle').textContent };
      });
      assert(Math.abs(r.expected - r.rendered) < 1e-7, `${label}: hours`);
      assert.equal(r.tileCount, r.bucketCount, `${label}: buckets`);
      assert(Math.abs(r.percent - (r.expected ? 1 : 0)) < 1e-9, `${label}: percentages`);
      for (const [metric, expected] of [['total', r.total], ['operations', r.operations], ['customer', r.expected]]) {
        assert(Math.abs(r.footer[metric].hours - expected) < 1e-7, `${label}: ${metric} footer`);
        const displayed = Number(r.footer[metric].text.match(/: ([\d,.]+) h$/)[1].replaceAll(',', ''));
        assert(Math.abs(displayed - expected) <= 0.050000001, `${label}: ${metric} rounding`);
        assert(r.footer[metric].text.includes(metric === 'customer' ? '(global + local filters)' : '(global filters)'), `${label}: scope label`);
      }
      assert(Math.abs(r.operations - r.mixOperations) < 1e-7 && Math.abs(r.engineering - r.mixEngineering) < 1e-7, `${label}: existing governed calculations`);
      assert(Math.abs(r.total - r.operations - r.engineering) < 1e-7, `${label}: full reconciliation`);
      if (!r.local) assert(Math.abs(r.total - r.operations - r.expected) < 1e-7, `${label}: three-value reconciliation`);
      assert(r.rectsPositive, `${label}: geometry`);
      checks.push({ label, ...r });
    }
    await reconcile('All Clients / All Accounts');
    assert(Math.abs(checks[0].total - before.governedHours) < 1e-7);
    assert(Math.abs(checks[0].expected + checks[0].operations - before.governedHours) < 1e-7);
    const clients = await page.locator('#accountDistributionClient option').evaluateAll(ns => ns.map(n => n.value).filter(Boolean));
    for (const client of clients) {
      await page.selectOption('#accountDistributionClient', client);
      await reconcile(`Client ${client}`);
      assert.equal(await page.locator('#accountTreemapSubtitle').textContent(), 'Tempo logged hours by account');
      const accounts = await page.locator('#accountDistributionAccount option').evaluateAll(ns => ns.map(n => n.value).filter(Boolean));
      for (const account of accounts) {
        await page.selectOption('#accountDistributionAccount', account);
        await reconcile(`Client ${client} Account ${account}`);
      }
      await page.selectOption('#accountDistributionAccount', '');
    }
    await page.selectOption('#accountDistributionClient', '');
    const allAccounts = await page.locator('#accountDistributionAccount option').evaluateAll(ns => ns.map(n => n.value).filter(Boolean));
    await page.selectOption('#accountDistributionAccount', allAccounts[0]);
    await reconcile('Account across All Clients');
    const incompatible = await page.evaluate(() => {
      const key = JSON.parse(document.querySelector('#accountDistributionAccount').value)[0];
      const actual = new Set(BI_DATA.worklogs.filter(r => r.tempoAccountKey === key).map(r => JSON.stringify([r.clientAttributionStatus === 'Verified' ? r.tempoCustomerAccount : ''])));
      return [...document.querySelector('#accountDistributionClient').options].map(o => o.value).find(v => v && !actual.has(v));
    });
    await page.selectOption('#accountDistributionClient', incompatible);
    assert.equal(await page.locator('#accountDistributionAccount').inputValue(), '');
    await page.selectOption('#accountDistributionClient', '');
    await page.locator('#accountTreemap .treemap-tile').first().click();
    assert(await page.locator('#accountDistributionClient').inputValue());
    await page.locator('#accountTreemap .treemap-tile').first().press('Enter');
    assert.equal(await page.locator('#accountTreemap .selected').count(), 1);
    const after = await fingerprint();
    assert.deepEqual(after, fixed, 'Local filters leaked');
    // Preserve the Client through empty global scopes, restore on clearing them.
    const selectedClient = await page.locator('#accountDistributionClient').inputValue();
    for (const [dimension, value] of [['teams', 'Authoring'], ['skills', 'Full Stack'], ['assignees', 'Janos Pribelszki'], ['accounts', 'HK-Dir'], ['priorities', 'Major'], ['statuses', 'Done'], ['clients', 'HK DIR']]) {
      await page.evaluate(([key, value]) => { __treemap.state[key] = new Set([value]); __treemap.update(); }, [dimension, value]);
      await reconcile(`Global ${dimension}`);
      assert.equal(await page.locator('#accountDistributionClient').inputValue(), selectedClient);
      await page.evaluate(key => { __treemap.state[key] = new Set(); __treemap.update(); }, dimension);
    }
    await page.evaluate(() => { __treemap.state.startDate = '2026-01-02'; __treemap.state.endDate = '2026-01-09'; __treemap.update(); });
    await reconcile('Tempo Work Date range');
    await page.selectOption('#accountDistributionAccount', '');
    await page.selectOption('#accountDistributionClient', '');
    await page.setViewportSize({ width: 390, height: 920 });
    await reconcile('Mobile');
    assert(await page.locator('.account-distribution-controls select').evaluateAll(ns => ns.every(n => n.getBoundingClientRect().right <= innerWidth + 1)), 'Mobile controls overflow');
    await page.locator('.panel-account-distribution').screenshot({ path: path.join(output, 'mobile.png') });
    await page.setViewportSize({ width: 1440, height: 980 });
    await page.evaluate(() => { __treemap.state.startDate = BI_DATA.meta.dateMin; __treemap.state.endDate = BI_DATA.meta.dateMax; __treemap.update(); });
    await reconcile('Reset local filters');
    await page.selectOption('#accountDistributionClient', '["TEMPO TICKETS"]');
    await reconcile('Nonoperational work under TEMPO TICKETS remains');
    await page.selectOption('#accountDistributionClient', '');
    await page.locator('.panel-account-distribution').screenshot({ path: path.join(output, 'desktop.png') });
    // Synthetic edge cases use the real renderer and existing dimensions.
    await page.evaluate(() => {
      const base = BI_DATA.worklogs[0];
      __treemap.renderAccountTreemap(null, [
        { ...base, tempoCustomerAccount: 'One', clientAttributionStatus: 'Verified', tempoAccount: 'Shared', tempoAccountKey: 'key1', logged: 10 },
        { ...base, tempoCustomerAccount: 'Two', clientAttributionStatus: 'Verified', tempoAccount: 'Shared', tempoAccountKey: 'key2', logged: 20 },
        { ...base, tempoCustomerAccount: '', clientAttributionStatus: 'Missing account customer', tempoAccount: '', tempoAccountKey: '', logged: 5 },
        { ...base, key: 'TEMPO-30', tempoCustomerAccount: 'One', clientAttributionStatus: 'Verified', tempoAccount: 'Shared', tempoAccountKey: 'key1', logged: 1 },
        { ...base, key: BI_DATA.meta.excludedIssueKeys[0], logged: 999 },
        { ...base, team: 'Unmanaged', logged: 999 },
      ]);
    });
    assert.equal(await page.locator('#accountTreemap .treemap-tile').count(), 3);
    const syntheticTotals = await page.locator('#accountTreemap [data-metric]').evaluateAll(ns => Object.fromEntries(ns.map(n => [n.dataset.metric, Number(n.dataset.hours)])));
    assert.deepEqual(syntheticTotals, { total: 36, operations: 1, customer: 35 });
    await page.selectOption('#accountDistributionAccount', '["key1"]');
    assert.equal(await page.locator('#accountTreemap .treemap-tile').count(), 1);
    assert.equal(await page.locator('#accountTreemap .treemap-tile').getAttribute('data-logged'), '10');
    const selectedTotals = await page.locator('#accountTreemap [data-metric]').evaluateAll(ns => Object.fromEntries(ns.map(n => [n.dataset.metric, Number(n.dataset.hours)])));
    assert.deepEqual(selectedTotals, { total: 36, operations: 1, customer: 10 });
    await page.selectOption('#accountDistributionAccount', '');
    await page.evaluate(() => __treemap.renderAccountTreemap(null, [{ ...BI_DATA.worklogs[0], key: 'TEMPO-30', logged: 7 }]));
    assert.equal(await page.locator('#accountTreemap .treemap-tile').count(), 0);
    const operationOnly = await page.locator('#accountTreemap [data-metric]').evaluateAll(ns => Object.fromEntries(ns.map(n => [n.dataset.metric, Number(n.dataset.hours)])));
    assert.deepEqual(operationOnly, { total: 7, operations: 7, customer: 0 });
    assert.deepEqual(errors, []);
    const { context, ...baseline } = before;
    await fs.writeFile(path.join(output, 'validation.json'), JSON.stringify({ hasBaseline, baseline, checks, errors }, null, 2));
    console.log(JSON.stringify({ baseline, scenarios: checks.length, status: 'PASS', errors }, null, 2));
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
