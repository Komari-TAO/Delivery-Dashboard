/* Run after test_portfolio_accounts.cjs. NODE_PATH must include Playwright. */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..'), out=path.join(root,'outputs/ch005a');
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const close=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function parseCsv(text){const result=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if(c==='\n'&&!quoted){row.push(field);result.push(row);row=[];field='';}else field+=c;}if(field||row.length){row.push(field);result.push(row);}const header=result.shift();return result.map(row=>Object.fromEntries(header.map((key,i)=>[key,row[i]])));}
const hook='window.__ch={state,update,buildUpdateContext,filteredData,governedLoggedWorklogRows,groupPeople,peopleTotalsRow,backlogWorkedRows,deliveryProgressRows,demandBacklogData,renderAccountTreemap,renderDetails,portfolioAccountRows,portfolioAccountTotals,snapshotCsv,exportScope,portfolioAccountIndex};';
(async()=>{
 const server=http.createServer(async(req,res)=>{try{let name=new URL(req.url,'http://localhost').pathname;const before=name.startsWith('/before/');if(before)name=name.slice(7);const file=path.join(before?path.join(out,'before'):path.join(root,'web'),name==='/'?'index.html':name);res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(await fs.readFile(file));}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({...(process.env.CH005A_BROWSER_EXECUTABLE ? {executablePath:process.env.CH005A_BROWSER_EXECUTABLE} : {}),headless:true});
 const errors=[],checks=[],ledger=[];const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.route('**/app.js*',async route=>route.fulfill({contentType:'application/javascript',body:(await fs.readFile(path.join(root,'web/app.js'),'utf8')).replace(/\}\)\(\);\s*$/,hook+'\n})();')}));
  await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'networkidle'});
  assert.equal(await page.locator('#accountPicker').count(),0,'Reporting Account control retired only after migration gate');
  assert.equal(await page.evaluate(()=>Object.hasOwn(__ch.state,'accounts')),false,'no hidden legacy filter state');
  async function set(values){await page.evaluate(values=>{for(const[k,v]of Object.entries(values))__ch.state[k]=Array.isArray(v)?new Set(v):v;__ch.update();},values);}
  async function reset(){await page.locator('#resetFilters').click();}
  function pass(name){checks.push(name);console.log('PASS '+name);}
  const baseline=JSON.parse(await fs.readFile(path.join(out,'before-results.json'),'utf8'));
  const defaultResult=await page.evaluate(()=>{const c=__ch.buildUpdateContext();return {kpis:document.querySelector('#generalKpiGrid').innerHTML,demand:document.querySelector('#demandTab').innerHTML,demandRail:document.querySelector('.demand-filter-rail').innerHTML,people:__ch.peopleTotalsRow(__ch.groupPeople(c.effortData.worklogs,c.effortData.capacity)),backlog:__ch.backlogWorkedRows(c.data.backlogWorklogs),delivery:__ch.deliveryProgressRows(__ch.filteredData({ignoreTeam:true}).backlogWorklogs),charts:[...document.querySelectorAll('.chart-frame')].map(n=>{const x=n.cloneNode(true);x.querySelectorAll('svg').forEach(s=>{s.style.height='';if(!s.getAttribute('style'))s.removeAttribute('style');});return[n.id,x.innerHTML];})};});
  assert.equal(defaultResult.kpis,baseline.kpis);assert.deepEqual(defaultResult.people,baseline.people);assert.deepEqual(defaultResult.backlog,baseline.backlogWorked);assert.deepEqual(defaultResult.delivery,baseline.delivery);pass('unrestricted KPI, People, Backlog Worked On and Delivery Progress parity');
  assert.equal(defaultResult.demand,baseline.demand);assert.equal(defaultResult.demandRail,baseline.demandRail);pass('Demand Management rendered baseline and independent controls unchanged');
  const oldCharts=await page.evaluate(charts=>charts.map(([id,html])=>{const n=document.createElement('div');n.innerHTML=html;n.querySelectorAll('svg').forEach(s=>{s.style.height='';if(!s.getAttribute('style'))s.removeAttribute('style');});return[id,n.innerHTML];}),baseline.charts);
  assert.deepEqual(defaultResult.charts,oldCharts);pass('all unrestricted Portfolio chart markup, including CH-004, unchanged');
  const beforeLedger=new Map(baseline.ledger.map(r=>[r.key,r]));
  const cases=await page.evaluate(()=>{
   const teams=new Set(BI_DATA.teams.map(r=>r.team)),blocked=new Set(BI_DATA.meta.excludedIssueKeys),source=BI_DATA.worklogs.filter(r=>teams.has(r.team)&&!blocked.has(r.key));
   const keys=[...new Set(BI_DATA.worklogs.map(r=>r.tempoAccountKey))];const results=[];
   const baseJira=__ch.filteredData({ignoreAccount:true}).backlog;
   const directKeys=new Map();for(const row of BI_DATA.worklogs){if(!directKeys.has(row.key))directKeys.set(row.key,new Set());directKeys.get(row.key).add(row.tempoAccountKey);}
   for(const key of keys){__ch.state.tempoAccounts=new Set([JSON.stringify([key])]);__ch.state.tempoAccountsActive=true;
    const c=__ch.buildUpdateContext(),expected=source.filter(r=>r.tempoAccountKey===key);
    const expectedIssues=baseJira.filter(r=>directKeys.get(r.key)?.has(key));
    const ids=rs=>rs.map(r=>r.worklogId);const total=(rs,f)=>rs.reduce((s,r)=>s+(r[f]||0),0);
    results.push({key,name:BI_DATA.worklogs.find(r=>r.tempoAccountKey===key).tempoAccount,rows:c.effortData.worklogs.length,logged:total(c.effortData.worklogs,'logged'),expectedLogged:total(expected,'logged'),idsMatch:JSON.stringify(ids(c.effortData.worklogs))===JSON.stringify(ids(expected)),issuesMatch:JSON.stringify(c.data.backlog.map(r=>r.key))===JSON.stringify(expectedIssues.map(r=>r.key)),original:total(c.data.backlog,'originalEstimateHours'),remaining:total(c.data.backlog,'remainingEstimateHours')});
   }__ch.state.tempoAccounts.clear();__ch.state.tempoAccountsActive=false;return results;
  });
  for(const r of cases){assert(r.idsMatch,r.key+' worklogs');assert(r.issuesMatch,r.key+' issues');close(r.logged,r.expectedLogged);const before=beforeLedger.get(r.key);ledger.push({...r,legacyLogged:before?.legacyLogged,delta:r.logged-(before?.legacyLogged||0),explanation:'Tempo Key actuals replace Jira-derived Account labels; direct issue membership replaces Jira label matching.'});}
  pass(`all ${cases.length} Account identities preserve exact worklog membership and issue-grain estimates`);
  async function reconcile(name,synthetic=null){const result=await page.evaluate(synthetic=>{
   const s=__ch.state,source=synthetic||__ch.filteredData({ignoreAccount:true,ignoreStatus:true}).worklogs,teams=new Set(BI_DATA.teams.map(r=>r.team));
   const rows=source.filter(r=>teams.has(r.team)&&!BI_DATA.meta.excludedIssueKeys.includes(r.key)&&(!s.tempoAccountsActive||s.tempoAccounts.has(JSON.stringify([String(r.tempoAccountKey||'').trim()]))));
   const sum=rs=>rs.reduce((v,r)=>v+r.logged,0),customer=rows.filter(r=>!r.key.startsWith('TEMPO-')),ops=rows.filter(r=>r.key.startsWith('TEMPO-'));
   const account=Boolean(s.clients.size||s.tempoAccountsActive),buckets=new Map;
   customer.forEach(r=>{const id=JSON.stringify([account?String(r.tempoAccountKey||'').trim():r.clientAttributionStatus==='Verified'?String(r.tempoCustomerAccount||'').trim():'']);buckets.set(id,(buckets.get(id)||0)+r.logged);});
   return {total:sum(rows),operations:sum(ops),customer:sum(customer),expected:[...buckets].filter(([,h])=>h>0).sort(),tiles:[...document.querySelectorAll('#accountTreemap .treemap-tile')].map(n=>[n.dataset.account,Number(n.dataset.logged)]).sort(),footer:Object.fromEntries([...document.querySelectorAll('#accountTreemap [data-metric]')].map(n=>[n.dataset.metric,Number(n.dataset.hours)])),subtitle:document.querySelector('#accountTreemapSubtitle').textContent,account};
  },synthetic);
   close(result.total,result.footer.total);close(result.operations,result.footer.operations);close(result.customer,result.footer.customer);assert.equal(result.tiles.length,result.expected.length);result.expected.forEach(([id,h],i)=>{assert.equal(result.tiles[i][0],id);close(result.tiles[i][1],h);});assert.equal(result.subtitle,`Tempo logged hours by ${result.account?'account':'client'}`);pass('CH-004 '+name);return result;}
  await reset();const reference=await reconcile('default');close(reference.total,baseline.effort.hours);
  const dmHash=hash(await page.locator('#demandTab').innerHTML());const dmRail=hash(await page.locator('.demand-filter-rail').innerHTML());
  for(const key of ['ENGINEERIN','HK-DIR','']){
   await set({tempoAccounts:[JSON.stringify([key])],tempoAccountsActive:true});await reconcile('selected '+(key||'missing key'));
   const proof=await page.evaluate(()=>{const c=__ch.buildUpdateContext();const sum=(rs,f)=>rs.reduce((s,r)=>s+(r[f]||0),0);return {people:sum(__ch.groupPeople(c.effortData.worklogs,c.effortData.capacity),'loggedTotal'),actual:sum(c.effortData.worklogs,'logged'),capacity:sum(c.effortData.capacity,'planned'),allCapacity:sum(__ch.filteredData({ignoreAccount:true,ignoreStatus:true}).capacity.filter(r=>BI_DATA.teams.some(t=>t.team===r.team)),'planned'),chartCount:document.querySelectorAll('.chart-frame svg').length,backlog:__ch.backlogWorkedRows(c.data.backlogWorklogs).map(r=>r.childKey),expectedBacklog:[...new Set(c.data.backlogWorklogs.filter(r=>BI_DATA.teams.some(t=>t.team===r.team)).map(r=>r.key))]};});
   close(proof.people,proof.actual);close(proof.capacity,proof.allCapacity);assert.deepEqual(proof.backlog.sort(),proof.expectedBacklog.sort());assert(proof.chartCount>5);
   assert.equal(hash(await page.locator('#demandTab').innerHTML()),dmHash);assert.equal(hash(await page.locator('.demand-filter-rail').innerHTML()),dmRail);
  }pass('selected Account People, charts, activity, unchanged capacity and Demand Management');
  await reset();const client=await page.evaluate(()=>BI_DATA.worklogs.find(r=>r.clientAttributionStatus==='Verified'&&!r.key.startsWith('TEMPO-')).tempoCustomerAccount);
  await set({clients:[client]});await reconcile('Client selection');
  if(await page.locator('#tempoAccountPickerMenu').isHidden())await page.locator('#tempoAccountPickerToggle').click();await page.locator('#tempoAccountSelectAll').click();await reconcile('Client and explicit All Accounts intersection');
  await page.locator('#tempoAccountClearAll').click();await reconcile('Account cleared with Client active');await reset();
  if(await page.locator('#tempoAccountPickerMenu').isHidden())await page.locator('#tempoAccountPickerToggle').click();await page.locator('#tempoAccountSelectAll').click();await reconcile('explicit All Accounts');
  await set({tempoAccounts:[],tempoAccountsActive:true});await reconcile('active empty');await reset();
  await page.locator('#accountTreemap .treemap-tile').first().click();await reconcile('Client tile');await page.locator('#accountTreemap .treemap-tile').first().press('Enter');await reconcile('Account keyboard');await reset();
  const scopeCases=await page.evaluate(()=>{const r=BI_DATA.worklogs.find(r=>r.tempoAccountKey==='ENGINEERIN'&&r.targetRelease&&r.program&&r.priority&&BI_DATA.teams.some(t=>t.team===r.team));if(!r)throw Error('No Engineering scope fixture');return [{teams:[r.team]},{skills:[r.skill]},{assignees:[r.person]},{startDate:r.date,endDate:r.date},{priorities:[r.priority]},{statuses:[r.status]},{categories:[r.category]},{programs:[r.program]},{targetReleases:[r.targetRelease]},{releases:[r.releaseCycle]}];});
  for(const values of scopeCases){await set({...values,tempoAccounts:['["ENGINEERIN"]'],tempoAccountsActive:true});const scoped=await reconcile('other filter '+Object.keys(values)[0]);assert(scoped.total>0,'representative filter scope must not be an empty test');await reset();}
  const synthetic=await page.evaluate(()=>{const b=BI_DATA.worklogs.find(r=>BI_DATA.teams.some(t=>t.team===r.team)&&!r.key.startsWith('TEMPO-'));return [{...b,tempoAccount:'Shared',tempoAccountKey:'one',tempoCustomerAccount:'A',logged:10},{...b,tempoAccount:'Shared',tempoAccountKey:'two',tempoCustomerAccount:'B',logged:20},{...b,tempoAccount:'',tempoAccountKey:'',tempoCustomerAccount:'N/A',clientAttributionStatus:'Missing account customer',logged:5},{...b,key:'TEMPO-30',tempoAccountKey:'one',logged:7},{...b,key:'TEMPO-106',logged:999},{...b,team:'Unmanaged',logged:999}];});
  await set({tempoAccounts:['["one"]','["two"]','[""]'],tempoAccountsActive:true});await page.evaluate(rows=>__ch.renderAccountTreemap(null,rows),synthetic);await reconcile('duplicate names, missing attribution, operations and exclusions',synthetic);await reset();
  for(const detail of ['accounts','people','backlog','deliveryProgress']){await set({detail,teams:['Nexus'],tempoAccounts:['["ENGINEERIN"]'],tempoAccountsActive:true});assert(!/NaN|undefined/.test(await page.locator('#detailTable').innerText()));}
  pass('all Portfolio detail modes render Account-selected rows without invalid values');await reset();
  await page.locator('.detail-tabs [data-detail="accounts"]').click();await page.locator('#detailSearch').fill('ENGINEERIN');
  const searchTotals=await page.evaluate(()=>{const c=__ch.buildUpdateContext(),rows=__ch.portfolioAccountRows(c.data.backlog,c.effortData.worklogs).filter(r=>Object.values(r).join(' ').toLowerCase().includes('engineerin'));const total=__ch.portfolioAccountTotals(rows,c.data.backlog),keys=new Set(rows.flatMap(r=>[...r.estimateItems]));return {actual:total.estimated,expected:c.data.backlog.filter(r=>keys.has(r.key)).reduce((s,r)=>s+r.originalEstimateHours,0),rowCount:rows.length};});close(searchTotals.actual,searchTotals.expected);assert.equal(searchTotals.rowCount,1);pass('searched Account table footer retains a distinct visible-Account estimate union');await page.locator('#detailSearch').fill('');
  for(const key of [null,'ENGINEERIN','']){
   await set({tempoAccounts:key===null?[]:[JSON.stringify([key])],tempoAccountsActive:key!==null});
   const exports=await page.evaluate(()=>{const c=__ch.buildUpdateContext(),total=(rs,f)=>rs.reduce((s,r)=>s+(r[f]||0),0);return {csv:__ch.snapshotCsv(),planning:__ch.snapshotCsv(true),actual:total(c.effortData.worklogs,'logged'),source:__ch.filteredData({ignoreAccount:true}).backlog.filter(r=>BI_DATA.teams.some(t=>t.team===r.team)).map(r=>({key:r.key,original:r.originalEstimateHours,remaining:r.remainingEstimateHours})),planningSource:__ch.demandBacklogData({ignoreAccount:true}).map(r=>({key:r.key,original:r.originalEstimateHours,remaining:r.remainingEstimateHours}))};});
   for(const [kind,text]of [['snapshot',exports.csv],['planning',exports.planning]]){const parsed=parseCsv(text),effort=parsed.filter(r=>r['Record Type']==='Account effort'),issues=parsed.filter(r=>r['Record Type']==='Jira issue'),expected=kind==='snapshot'?exports.source:exports.planningSource;close(effort.reduce((s,r)=>s+Number(r['Logged Hours']),0),exports.actual);assert.equal(new Set(issues.map(r=>r['Jira Issue Key'])).size,issues.length);assert.equal(issues.length,expected.length);close(issues.reduce((s,r)=>s+Number(r['Original Estimate Hours']),0),expected.reduce((s,r)=>s+r.original,0));close(issues.reduce((s,r)=>s+Number(r['Remaining Estimate Hours']),0),expected.reduce((s,r)=>s+r.remaining,0));assert(effort.every(r=>r['Original Estimate Hours']===''&&r['Remaining Estimate Hours']===''));assert(issues.every(r=>r['Logged Hours']===''));assert(parsed.every(r=>JSON.parse(r.Scope).accountActive===(key!==null)));await fs.writeFile(path.join(out,`${kind}-v2-${key===null?'all':key||'missing'}.csv`),text);}
  }pass('v2 CSV parsing reconciles selected and unrestricted effort, issue estimates, missing attribution and scope');await reset();
  const old=await browser.newPage();await old.goto(`http://127.0.0.1:${server.address().port}/before/`,{waitUntil:'networkidle'});
  const dmCases=[{account:['Engineering']},{account:['HK-Dir']},{account:['Engineering','HK-Dir'],team:['Nexus']},{client:['N/A']}];const dmProof=[];
  for(const values of dmCases){for(const p of [old,page])await p.evaluate(values=>{document.querySelector('#resetDemandFilters').click();for(const[name,vals]of Object.entries(values))for(const value of vals){const input=[...document.querySelectorAll('input[data-demand-picker="'+name+'"]')].find(n=>n.value===value);if(!input)throw Error('Missing option '+value);input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));}},values);
   const snapshot=async p=>({panel:(await p.locator('#demandTab').innerHTML()).replaceAll(' style=""',''),rail:(await p.locator('.demand-filter-rail').innerHTML()).replaceAll(' style=""',''),values:await p.locator('.demand-filter-rail input').evaluateAll(ns=>ns.map(n=>[n.id,n.value,n.checked]))});assert.deepEqual(await snapshot(page),await snapshot(old));dmProof.push({values,pass:true});}
  await old.close();await page.evaluate(()=>document.querySelector('#resetDemandFilters').click());await fs.writeFile(path.join(out,'demand-management-parity.json'),JSON.stringify(dmProof,null,2));pass('independent Demand Management Account, Team and Client interactions match baseline');
  await page.locator('.detail-tabs [data-detail="accounts"]').click();
  if(await page.locator('#tempoAccountPickerMenu').isVisible())await page.locator('#tempoAccountPickerToggle').click();
  await page.screenshot({path:path.join(out,'after-desktop.png'),fullPage:true});await page.locator('.detail-panel').screenshot({path:path.join(out,'after-account-details.png')});await page.locator('#portfolioDemandReconciliation').screenshot({path:path.join(out,'after-reconciliation.png')});
  await page.setViewportSize({width:390,height:920});await page.waitForTimeout(500);await reconcile('mobile');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:path.join(out,'after-mobile.png'),fullPage:true});pass('mobile layout without horizontal overflow');
  assert.deepEqual(errors,[]);
  const retired=await page.locator('#accountPicker').count()===0;
  await fs.writeFile(path.join(out,'population-difference-ledger.json'),JSON.stringify(ledger,null,2));
  await fs.writeFile(path.join(out,'browser-validation.json'),JSON.stringify({status:'PASS',checks,reference,errors,reportingAccountRetired:retired,demandManagementBaselineUnchanged:true},null,2));
  console.log(JSON.stringify({status:'PASS',checks:checks.length,accountCases:ledger.length,reportingAccountRetired:retired,errors}));
 }finally{await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
