/* NODE_PATH must include Playwright. Optional CH004_BEFORE_DIR compares saved pre-change UI. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const digest = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
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
  const errors = [], checks = [], comparisons = [];
  const output = path.join(root, '.tmp/ch004-step2');
  await fs.mkdir(output, { recursive: true });
  try {
    async function open(before = false) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      page.on('pageerror', e => errors.push(e.message));
      page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
      const dir = before ? path.resolve(process.env.CH004_BEFORE_DIR) : path.join(root, 'web');
      const source = await fs.readFile(path.join(dir, before ? 'before-app.js' : 'app.js'), 'utf8');
      const hook = 'window.__ch = { state, update, buildUpdateContext, downloadSnapshot, renderAccountTreemap, accountFacetRows };';
      await page.route('**/app.js*', route => route.fulfill({ contentType: 'application/javascript', body: source.replace(/\}\)\(\);\s*$/, hook + '\n})();') }));
      if (before) await page.route('**/', async route => route.fulfill({ contentType: 'text/html', body: await fs.readFile(path.join(dir, 'before-index.html'), 'utf8') }));
      await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle' });
      assert.deepEqual(errors, [], 'initialization errors');
      return page;
    }
    const page = await open();
    console.log('Opened current application');
    async function set(values) {
      await page.evaluate(values => {
        for (const [k, v] of Object.entries(values)) __ch.state[k] = Array.isArray(v) ? new Set(v) : v;
        __ch.update();
      }, values);
    }
    async function fingerprint(p) {
      return digest(await p.evaluate(async () => {
        const ctx = __ch.buildUpdateContext();
        const create = URL.createObjectURL, revoke = URL.revokeObjectURL, click = HTMLAnchorElement.prototype.click;
        let csv;
        URL.createObjectURL = blob => { csv = blob.text(); return 'blob:test'; };
        URL.revokeObjectURL = () => {}; HTMLAnchorElement.prototype.click = () => {};
        try { __ch.downloadSnapshot(); } finally { URL.createObjectURL = create; URL.revokeObjectURL = revoke; HTMLAnchorElement.prototype.click = click; }
        const charts = [...document.querySelectorAll('.chart-frame')].filter(n => n.id !== 'accountTreemap').map(n => {
          const copy = n.cloneNode(true);
          copy.querySelectorAll('svg').forEach(svg => { svg.style.height = ''; if (!svg.getAttribute('style')) svg.removeAttribute('style'); });
          return [n.id, copy.innerHTML];
        });
        const values = { ctx, csv: await csv, charts, kpis: document.querySelector('#generalKpiGrid').innerHTML,
          details: document.querySelector('#detailTable').innerHTML,
          demand: document.querySelector('#demandTab')?.innerHTML,
          reportingOptions: __ch.accountFacetRows() };
        return Object.fromEntries(await Promise.all(Object.entries(values).map(async ([key,value]) => [key,
          [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value))))].map(n=>n.toString(16).padStart(2,'0')).join('')])));
      }));
    }
    async function reconcile(label, synthetic = null) {
      const result = await page.evaluate(synthetic => {
        const s = __ch.state, data = BI_DATA;
        const rows = (synthetic || data.worklogs).filter(r => data.teams.some(t => t.team === r.team)
          && !data.meta.excludedIssueKeys.includes(r.key)
          && r.date >= s.startDate && r.date <= s.endDate
          && (!s.teams.size || s.teams.has(r.team)) && (!s.assignees.size || s.assignees.has(r.person))
          && (!s.skills.size || s.skills.has(r.skill))
          && (!s.clients.size || s.clients.has(r.tempoCustomerAccount || 'N/A'))
          && (!s.tempoAccountsActive || s.tempoAccounts.has(JSON.stringify([String(r.tempoAccountKey || '').trim()]))));
        const ops = rows.filter(r => r.key.startsWith('TEMPO-'));
        const customer = rows.filter(r => !r.key.startsWith('TEMPO-'));
        const account = Boolean(s.clients.size || s.tempoAccountsActive);
        const buckets = new Map();
        customer.forEach(r => {
          const value = account ? String(r.tempoAccountKey || '').trim() : r.clientAttributionStatus === 'Verified' ? String(r.tempoCustomerAccount || '').trim() : '';
          const id = JSON.stringify([value]); buckets.set(id, (buckets.get(id) || 0) + r.logged);
        });
        const tiles = [...document.querySelectorAll('#accountTreemap .treemap-tile')].map(n => ({ id: n.dataset.account, hours: Number(n.dataset.logged), percent: Number(n.dataset.percent) }));
        const sum = rows => rows.reduce((s,r) => s + r.logged, 0);
        return { rows: rows.length, total: sum(rows), operations: sum(ops), customer: sum(customer),
          expected: [...buckets].filter(([,h]) => h > 0).sort(), tiles: tiles.sort((a,b) => a.id.localeCompare(b.id)),
          footer: Object.fromEntries([...document.querySelectorAll('#accountTreemap [data-metric]')].map(n => [n.dataset.metric, Number(n.dataset.hours)])),
          subtitle: document.querySelector('#accountTreemapSubtitle').textContent, account };
      }, synthetic);
      const close = (a,b) => assert(Math.abs(a-b) < 1e-7, `${label}: ${a} != ${b}`);
      close(result.total, result.operations + result.customer);
      for (const [metric, value] of [['total',result.total],['operations',result.operations],['customer',result.customer]]) close(result.footer[metric], value);
      assert.equal(result.tiles.length, result.expected.length, label);
      const actual = new Map(result.tiles.map(t => [t.id,t.hours]));
      for (const [id,h] of result.expected) close(actual.get(id),h);
      close(result.tiles.reduce((s,t) => s+t.hours,0),result.customer);
      close(result.tiles.reduce((s,t) => s+t.percent,0),result.customer ? 1 : 0);
      assert.equal(result.subtitle, `Tempo logged hours by ${result.account ? 'account' : 'client'}`);
      checks.push({label, ...result, expected: undefined, tiles: undefined});
      return result;
    }
    assert.equal(await page.locator('#accountDistributionClient, #accountDistributionAccount').count(), 0);
    assert.equal(await page.locator('#accountPickerToggle span').textContent(), 'Reporting Account');
    const baseline = await reconcile('default');
    console.log('PASS default reconciliation');
    // Before/after comparison includes every Reporting Account population and
    // representative rendered tables, KPI cards, charts and exact CSV bytes.
    if (process.env.CH004_BEFORE_DIR) {
      const before = await open(true);
      console.log('Opened saved pre-change application');
      const options = await before.evaluate(() => __ch.accountFacetRows().map(r => r.label));
      assert.deepEqual(await page.evaluate(() => __ch.accountFacetRows().map(r => r.label)),options);
      const cases = [[], ...options.slice(0,4).map(x => [x]), options.slice(0,3), options];
      for (const accounts of cases) {
        for (const p of [before,page]) await p.evaluate(values => { __ch.state.accounts = new Set(values); __ch.update(); }, accounts);
        assert.equal(await fingerprint(page), await fingerprint(before), `Reporting Account ${accounts}`);
        comparisons.push({accounts, pass:true});
        console.log(`PASS reporting rendered case ${comparisons.length}`);
      }
      console.log('PASS Reporting Account rendered outputs, KPI cards and CSV before/after');
      // All option values also preserve row-level reporting populations.
      async function populations(p) { return p.evaluate(options => options.map(value => {
        __ch.state.accounts = new Set([value]);
        const c = __ch.buildUpdateContext();
        const text = JSON.stringify(c);
        let hash = 2166136261;
        for (let i=0;i<text.length;i++) hash = Math.imul(hash ^ text.charCodeAt(i),16777619);
        return [value, text.length, hash >>> 0];
      }), options); }
      assert.equal(digest(await populations(page)),digest(await populations(before)));
      comparisons.push({everyReportingAccount:options.length,pass:true});
      console.log(`PASS all ${options.length} Reporting Account populations before/after`);
      await before.close();
    }
    await set({ accounts:[] });
    const fixed = await fingerprint(page);
    const reportingAccount = await page.evaluate(() => __ch.accountFacetRows()[0].label);
    await set({accounts:[reportingAccount]}); await reconcile('Reporting Account does not scope Tempo treemap');
    await set({accounts:[]});
    const clients = await page.evaluate(() => [...new Set(BI_DATA.worklogs.filter(r => r.clientAttributionStatus === 'Verified' && !r.key.startsWith('TEMPO-')).map(r => r.tempoCustomerAccount))]);
    await set({clients:[clients[0]]}); await reconcile('one Client');
    await set({clients:clients.slice(0,2)}); await reconcile('multiple Clients');
    await page.locator('#clientPickerToggle').click();
    await page.locator('#clientSelectAll').click(); await reconcile('explicit All Clients');
    await set({clients:[]});
    const ids = await page.locator('#tempoAccountFacet input').evaluateAll(ns => ns.map(n => n.value));
    await page.locator('#tempoAccountPickerToggle').click();
    await page.locator('#tempoAccountFacet input').first().check(); await reconcile('one Account through UI');
    await page.locator('#tempoAccountFacet input').nth(1).check(); await reconcile('multiple Accounts through UI');
    assert.equal(await fingerprint(page),fixed,'Tempo Account leaked to reporting/export');
    await page.locator('#tempoAccountSelectAll').click(); const all = await reconcile('explicit All Accounts');
    assert(Math.abs(all.total-baseline.total)<1e-7);
    await set({clients:clients.slice(0,2)}); await reconcile('Client/Account intersection');
    await page.locator('#tempoAccountClearAll').click(); await reconcile('Account cleared, Clients remain');
    await page.locator('#resetFilters').click(); await reconcile('reset both');
    await page.locator('#accountTreemap .treemap-tile').first().click(); await reconcile('Client tile click');
    await page.locator('#accountTreemap .treemap-tile').first().press('Enter'); await reconcile('Account tile keyboard');
    await page.locator('#activeFilters [data-clear-key="tempoAccounts"]').click(); await reconcile('clear Account chip');
    await page.locator('#resetFilters').click();
    for (const dimension of ['teams','assignees']) {
      const value = await page.evaluate(key => { const r=BI_DATA.worklogs.find(r => BI_DATA.teams.some(t=>t.team===r.team)); return key==='teams'?r.team:r.person; },dimension);
      await set({[dimension]:[value],tempoAccounts:ids,tempoAccountsActive:true}); await reconcile(dimension);
      await set({[dimension]:[]});
    }
    await set({startDate:'2026-10-01',endDate:'2026-10-15'}); await reconcile('Date range');
    await page.locator('#resetFilters').click();
    const synthetic = await page.evaluate(() => {
      const base = BI_DATA.worklogs.find(r => BI_DATA.teams.some(t=>t.team===r.team) && !r.key.startsWith('TEMPO-'));
      return [
        {...base,tempoAccount:'Shared',tempoAccountKey:'one',tempoCustomerAccount:'A',clientAttributionStatus:'Verified',logged:10},
        {...base,tempoAccount:'Shared',tempoAccountKey:'two',tempoCustomerAccount:'B',clientAttributionStatus:'Verified',logged:20},
        {...base,tempoAccount:'',tempoAccountKey:'',tempoCustomerAccount:'N/A',clientAttributionStatus:'Missing account customer',logged:5},
        {...base,key:'TEMPO-30',tempoAccountKey:'one',logged:7},
        {...base,key:'TEMPO-106',logged:999}, {...base,team:'Unmanaged',logged:999}
      ];
    });
    await set({tempoAccounts:['["one"]','["two"]','[""]'],tempoAccountsActive:true});
    await page.evaluate(rows => __ch.renderAccountTreemap(null,rows),synthetic);
    const edge = await reconcile('duplicate names, missing Client/key, operations, exclusions',synthetic);
    assert.equal(edge.tiles.length,3);
    await set({tempoAccounts:[],tempoAccountsActive:false});
    await page.evaluate(rows => __ch.renderAccountTreemap(null,rows),synthetic);
    await reconcile('missing Client in default grouping',synthetic);
    await set({tempoAccounts:[],tempoAccountsActive:true}); await reconcile('explicit All on empty option scope');
    await page.locator('#resetFilters').click();
    await page.locator('.panel-account-distribution').screenshot({path:path.join(output,'desktop.png')});
    await page.setViewportSize({width:390,height:920});
    await page.waitForFunction(() => document.querySelector('#accountTreemap svg').viewBox.baseVal.width < 400);
    await reconcile('mobile');
    await page.locator('.panel-account-distribution').screenshot({path:path.join(output,'mobile.png')});
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,'mobile overflow');
    assert.deepEqual(errors,[]);
    await fs.writeFile(path.join(output,'validation.json'),JSON.stringify({baseline,checks,comparisons,errors},null,2));
    console.log(JSON.stringify({status:'PASS',scenarios:checks.length,reportingComparisons:comparisons.length,baseline:{total:baseline.total,operations:baseline.operations,customer:baseline.customer},errors},null,2));
  } finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(e => { console.error(e); process.exitCode=1; });
