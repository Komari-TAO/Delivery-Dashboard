/* NODE_PATH must point to the bundled Node packages (Playwright). */
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const {chromium} = require('playwright');
const root = path.resolve(__dirname,'..');
const output = path.join(root,'outputs/capacity_assigned_demand');
(async()=>{
 await fs.mkdir(output,{recursive:true});
 const server = http.createServer(async(req,res)=>{
  try {
   const rel = new URL(req.url,'http://localhost').pathname;
   const file=path.resolve(root,'web',rel==='/'?'index.html':'.'+rel);
   if(!file.startsWith(path.join(root,'web')+path.sep))throw Error('Invalid path');
   res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':'text/html');
   res.end(await fs.readFile(file));
  }catch{res.writeHead(404);res.end();}
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const candidates=['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'];
 let executablePath;
 for(const candidate of candidates){try{await fs.access(candidate);executablePath=candidate;break;}catch{}}
 let browser;
 try{
  browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox','--disable-gpu']});
  const page=await browser.newPage({viewport:{width:1600,height:1100}});
  const errors=[], diagnostics=new Set();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'){
   if(/^Account Distribution total mismatch/.test(m.text()))diagnostics.add(m.text());else errors.push(m.text());
  }});
  const source=await fs.readFile(path.join(root,'web/demand.js'),'utf8');
  await page.route('**/demand.js',route=>route.fulfill({contentType:'application/javascript',body:source.replace(/\}\)\(\);\s*$/,'window.__coverageTest={current,coverageModel,pickerState,render};\n})();')}));
  const url=`http://127.0.0.1:${server.address().port}/`;
  await page.goto(url,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__coverageTest);
  await page.locator('[data-workspace-tab="demandTab"]').click();
  const baselineOther=await page.evaluate(()=>Object.fromEntries(['generalKpiGrid','demandWorkflow','demandMatrix','demandAccountComparison','demandQuality'].map(id=>[id,document.getElementById(id).innerHTML])));
  const getModel=()=>page.evaluate(()=>{const t=window.__coverageTest;return t.coverageModel(t.current().filters);});
  const base=await getModel();
  assert(base.estimationOverlaps.length>0);
  const overlapReview=page.locator('[aria-label="Estimation overlap governance exceptions"]');
  assert(await overlapReview.isVisible());
  await overlapReview.locator('summary').click();
  assert(await overlapReview.getByText(/Parent estimate excluded/).count()>0);
  const reviewed=base.estimationOverlaps[0];
  assert(await overlapReview.locator(`a[href$="/${reviewed.key}"]`).count()>0);
  assert.equal((await getModel()).demand,base.demand);
  await overlapReview.locator('summary').click();
  assert.equal(base.teams.length,6);assert(base.teams.some(r=>r.team==='Nexus'));
  assert.equal(await page.locator('#demandCapacity').count(),0);
  assert.equal(await page.locator('.coverage-kpi').count(),4);
  const releases=await page.locator('#coverageRelease option').evaluateAll(items=>items.map(i=>i.value));
  assert.equal(releases[0],'release-2026-12');assert(releases.includes('release-2027-06'));
  await page.locator('#capacityCoveragePanel').screenshot({path:path.join(output,'after-release.png')});
  const results=[];
  const setFilters=async(spec)=>page.evaluate(spec=>{
    const t=window.__coverageTest;
    for(const name of ['team','assignee','skill','client','account','businessArea','promoter','module','period']){
      const state=t.pickerState(name);state.clear();for(const value of spec[name]||[])state.add(value);
    }t.render();
  },spec);
  for(const spec of [{},{team:['Authoring']},{team:['Authoring','Nexus']},{team:['Nexus']},{assignee:['Kirill Gatalsky']},{skill:['Backend']},{client:['HK DIR']},{account:[base.contributions.find(r=>r.account)?.account || 'Other/Blank']},{period:['release-2026-12']},{team:['Nexus'],client:['HK DIR']},{assignee:['Kirill Gatalsky'],skill:['Full Stack']},{businessArea:['Other/Blank']},{promoter:['Other/Blank']},{module:['Other/Blank']}]){
    await setFilters(spec);const m=await getModel();
    assert.equal(m.demand,m.teams.reduce((s,r)=>s+r.demand,0));
    assert.equal(m.contributions.length,new Set(m.contributions.map(r=>r.key)).size);
    if(spec.team)assert.deepEqual(m.teams.map(r=>r.team).sort(),[...spec.team].sort());
    if(spec.assignee)assert(m.contributions.every(r=>spec.assignee.includes(r.assignee)));
    if(spec.skill)assert(m.contributions.every(r=>spec.skill.includes(r.skill)));
    if(spec.client)assert(m.contributions.every(r=>spec.client.includes(r.tempoCustomerAccount)));
    if(!spec.team&&!spec.assignee&&!spec.skill){assert.equal(m.capacity,base.capacity);assert.equal(m.knownCapacity,base.knownCapacity);}
    if(spec.team&&!spec.client){assert.equal(m.unallocatedHours,base.unallocatedHours);}
    results.push({filters:spec,capacity:m.capacity,knownCapacity:m.knownCapacity,demand:m.demand,unallocated:m.unallocatedHours});
  }
  await setFilters({});
  await page.locator('#coverageHorizon').selectOption('year');
  const year=await getModel();assert.equal(year.knownCapacity,12816);assert.equal(year.capacity,null);
  assert.equal(await page.locator('#coverageReleaseLabel').isVisible(),false);
  await page.locator('#capacityCoveragePanel').screenshot({path:path.join(output,'after-year-end.png')});
  await page.locator('#demandStartDate').fill('2025-01-01');await page.locator('#demandStartDate').dispatchEvent('change');
  await page.locator('#demandEndDate').fill('2025-02-01');await page.locator('#demandEndDate').dispatchEvent('change');
  const historical=await getModel();assert.equal(historical.demand,year.demand);assert.equal(historical.knownCapacity,year.knownCapacity);
  await page.locator('#resetDemandFilters').click();
  await page.locator('#coverageHorizon').selectOption('release');
  await page.locator('#coverageRelease').selectOption('release-2027-03');
  assert.equal((await getModel()).capacity,null);assert(await page.locator('.coverage-warning').first().isVisible());
  await page.locator('#coverageRelease').selectOption('release-2026-12');
  const otherAfter=await page.evaluate(()=>Object.fromEntries(['generalKpiGrid','demandWorkflow','demandMatrix','demandAccountComparison','demandQuality'].map(id=>[id,document.getElementById(id).innerHTML])));
  assert.deepEqual(otherAfter,baselineOther);
  await page.setViewportSize({width:390,height:844});
  await page.locator('#capacityCoveragePanel').screenshot({path:path.join(output,'after-mobile.png')});
  const dimensions=await page.locator('#capacityCoveragePanel').evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth}));
  assert(dimensions.scroll<=dimensions.width+1,JSON.stringify(dimensions));
  assert.equal(errors.length,0,errors.join('\n'));
  const report={filterScenarios:results,releaseOptions:releases,overlapReview:{releaseParents:base.estimationOverlaps.length,yearEndParents:year.estimationOverlaps.length,traceable:true,nonAdditive:true},yearEnd:{capacity:year.capacity,knownCapacity:year.knownCapacity,demand:year.demand},unrelatedDemandViewsUnchanged:true,consoleErrors:errors,existingPortfolioDiagnostics:[...diagnostics],mobile:dimensions};
  await fs.writeFile(path.join(output,'browser-validation.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({filterScenarios:results.length,consoleErrors:errors.length,mobile:dimensions,yearEnd:report.yearEnd,unrelatedDemandViewsUnchanged:true,existingPortfolioDiagnostics:diagnostics.size},null,2));
 }finally{await browser?.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
