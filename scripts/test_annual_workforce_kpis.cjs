const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { calculate } = require('../web/annual-kpis.js');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(p,'utf8').replace(/^window.BI_DATA\s*=\s*/,'').replace(/;\s*$/,''));
const data = read(path.join(root,'web/data.js'));
const annual = data.meta.annualWorkforce;
const base = {startDate:'2026-01-01',endDate:'2026-12-31',teams:new Set(),assignees:new Set(),skills:new Set()};
const teams = new Set(data.teams.map(r=>r.team));
const rows = data.backlogWorklogs.filter(r=>teams.has(r.team)&&!data.meta.excludedIssueKeys.includes(r.key));
assert.equal(new Set(annual.people.map(p=>p.assigneeId)).size,38);
assert.equal(annual.people.length,38);
assert(!annual.people.some(p=>p.team==='Engineering'||/Ionut/i.test(p.person)));
const all = calculate(annual,base,rows);
assert.equal(all.development,57674);assert.equal(all.engineering,10058);assert.equal(all.gross,67732);assert.equal(all.support,3580);
assert(Math.abs(all.actual-rows.reduce((s,r)=>s+r.logged,0))<1e-7);
assert.equal(all.balance,all.gross-all.actual);assert.equal(all.ratio,all.actual/all.gross);
for(const key of ['teams','assignees','skills']) {
 const field={teams:'team',assignees:'person',skills:'skill'}[key];
 const values=[...new Set(annual.people.map(p=>p[field]))];
 const result=values.map(v=>calculate(annual,{...base,[key]:new Set([v])},rows));
 assert(Math.abs(result.reduce((s,r)=>s+r.gross,0)-all.gross)<1e-7);
 assert(Math.abs(result.reduce((s,r)=>s+r.actual,0)-all.actual)<1e-7);
}
const period=calculate(annual,{...base,startDate:'2026-06-01',endDate:'2026-06-02'},rows);
assert.equal(period.gross,all.gross);assert(period.actual<all.actual);
const account=rows[0].account;
const filtered=calculate(annual,base,rows.filter(r=>r.account===account));
assert.equal(filtered.gross,all.gross);assert(filtered.actual<=all.actual);
assert.equal(calculate(annual,{...base,startDate:'2027-01-01',endDate:'2027-12-31'},rows).gross,null);
assert.equal(calculate(annual,{...base,endDate:'2027-01-01'},rows).ratio,null);
assert.equal(calculate(null,base,rows).gross,null);
const zero={year:2026,people:[{assigneeId:'zero',person:'Zero',team:'Nexus',skill:'Backend',development:0,engineering:0,support:0}]};
assert.equal(calculate(zero,base,[]).gross,0);assert.equal(calculate(zero,base,[]).balance,0);assert.equal(calculate(zero,base,[]).ratio,null);
assert.equal(calculate({...zero,people:[{...zero.people[0],development:null}]},base,[]).gross,null);
assert.equal(calculate({...zero,people:[zero.people[0],zero.people[0]]},base,[]).gross,null);
// Execute the real card renderer to ensure all three cards bind to the same
// governed numerator, including zero effort, filters and unavailable years.
const vm = require('node:vm');
const app = fs.readFileSync(path.join(root,'web/app.js'),'utf8');
const render = app.slice(app.indexOf('  function renderKpis()'),app.indexOf('  function renderActiveFilters()'));
for (const scenario of [
 {state:base,rows},
 {state:{...base,teams:new Set(['Nexus'])},rows},
 {state:{...base,startDate:'2026-06-01',endDate:'2026-06-02'},rows},
 {state:{...base,accounts:new Set([account])},rows:rows.filter(r=>r.account===account)},
 {state:base,rows:[]},
 {state:{...base,startDate:'2027-01-01',endDate:'2027-12-31'},rows:[]},
]) {
 const state={clients:new Set(),accounts:new Set(),categories:new Set(),priorities:new Set(),targetReleases:new Set(),programs:new Set(),releases:new Set(),...scenario.state};
 const grid={innerHTML:'',insertAdjacentHTML(_,html){this.innerHTML+=html;}};
 const context={raw:data,state,lastUpdateContext:{effortData:{worklogs:scenario.rows}},window:{AnnualWorkforceKpis:{calculate}},colors:{},$:()=>grid,escapeHtml:String,formatNumber:(n,d)=>n.toFixed(d),formatPercent:n=>(100*n).toFixed(1)+'%'};
 vm.runInNewContext(render+'\nrenderKpis();',context);
 const expected=calculate(annual,state,scenario.rows);
 const cards=[...grid.innerHTML.matchAll(/<article class="kpi-card">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
 const actual=cards[2].match(/<strong>(.*?)<\/strong>/)[1];
 assert.equal(actual,expected.actual===null?'Unavailable':expected.actual.toFixed(1));
 assert(cards[3].includes(expected.balance===null?'Unavailable':expected.balance.toFixed(1)));
 assert(cards[4].includes(expected.ratio===null?'Unavailable':(100*expected.ratio).toFixed(1)+'%'));
 assert(!grid.innerHTML.includes('separate full-source total'));
}
console.log(JSON.stringify({status:'PASS',checks:'full-year/team/person/skill/restricted dates/effort-only/missing year/mixed years/zero/missing/duplicate identity',...all},null,2));
