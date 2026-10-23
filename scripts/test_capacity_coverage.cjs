const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const coverage = require('../web/capacity-coverage.js');
const root = path.resolve(__dirname, '..');
let tests = 0;
function test(name, run) { run(); tests++; console.log(`PASS ${name}`); }
function fixture() {
  const assignees = coverage.ENGINEERING_TEAMS.map((team) => ({assignee: team+' person', team, skill:'Backend'}));
  assignees.push({assignee:'QA person',team:'QA',skill:'QA'});
  const masterDates=[];
  for(let time=Date.parse('2026-10-22T00:00:00Z');time<=Date.parse('2027-01-15T00:00:00Z');time+=86400000){
    const date=new Date(time).toISOString().slice(0,10);
    // Deliberately synthetic calendar membership: the calculation consumes it,
    // rather than deriving production weeks with ISO calendar functions.
    masterDates.push({date,week:date<'2026-11-01'?43:date<='2026-11-06'?45:date<'2027-01-01'?53:1});
  }
  return {meta:{excludedIssueKeys:['TEMPO-54']}, releases:[{cycle:'current',start:'2026-10-01',end:'2026-11-06'}, {cycle:'old',start:'2026-01-01',end:'2026-02-01'}, {cycle:'next-year',start:'2027-01-01',end:'2027-01-15'}],
    masterDates,
    capacityCoverage:{reportingDate:'2026-10-22',capacityYear:2026,assignees,
      capacity:assignees.filter(p=>p.team!=='QA').flatMap(p=>[43,45,53].map(week=>({...p,week,planned:40}))), demand:[]}};
}
function issue(key, fields={}) {return {key,parentKey:'',type:'Task',status:'In Progress',statusCategory:'In Progress',assignee:'Authoring person',targetRelease:'current',dueDate:'',hasRemainingEstimate:true,remainingEstimateHours:20,...fields};}
function calculate(data, filters={}, mode='release', cycle='current', matches) {return coverage.calculate(data,coverage.resolve(data),coverage.horizon(data,mode,cycle),filters,matches);}
function row(m, team='Authoring') {return m.teams.find(r=>r.team===team);}
test('six teams, capacity with no demand, portfolio arithmetic and stable ties',()=>{
 const d=fixture(),m=calculate(d); assert.equal(m.teams.length,6); assert.equal(m.capacity,480); assert.equal(m.demand,0); assert.equal(m.gap,480); assert.equal(m.load,0); assert.deepEqual(m.teams.map(r=>r.team),coverage.ENGINEERING_TEAMS);
});
test('overload, zero capacity, missing capacity and denominator protection',()=>{
 const d=fixture();d.capacityCoverage.demand=[issue('A',{remainingEstimateHours:100})]; let m=calculate(d);assert.equal(row(m).gap,-20);assert.equal(row(m).load,125);assert.equal(m.teams[0].team,'Authoring');
 d.capacityCoverage.capacity.filter(r=>r.team==='Authoring').forEach(r=>r.planned=0);m=calculate(d);assert.equal(row(m).capacity,0);assert.equal(row(m).gap,-100);assert.equal(row(m).load,null);
 d.capacityCoverage.capacity.find(r=>r.team==='Authoring').planned=null;m=calculate(d);assert.equal(row(m).capacity,null);assert.equal(m.capacity,null);assert.equal(m.gap,null);assert.equal(m.load,null);assert.equal(m.demand,100);
});
test('duplicate assignee-week cannot multiply capacity',()=>{
 const d=fixture();d.capacityCoverage.capacity.push({...d.capacityCoverage.capacity[0]});const m=calculate(d);assert.equal(row(m).capacity,null);assert.equal(row(m).duplicateRecords,2);
});
test('incomplete Master Date calendar makes capacity unavailable',()=>{
 const d=fixture();d.masterDates=d.masterDates.filter(r=>r.date!=='2026-10-25');assert.equal(calculate(d).capacity,null);
});
test('parent only without estimated descendants; zero is estimated; hierarchy before filters',()=>{
 const d=fixture();d.capacityCoverage.demand=[issue('EPIC',{type:'Epic',remainingEstimateHours:900}),issue('STORY',{parentKey:'EPIC',remainingEstimateHours:80}),issue('CHILD',{parentKey:'STORY',remainingEstimateHours:10,assignee:'Nexus person'})];
 let m=calculate(d);assert.equal(m.demand,10);assert.deepEqual(m.contributions.map(r=>r.key),['CHILD']);assert.equal(calculate(d,{teams:new Set(['Authoring'])}).demand,0);
 d.capacityCoverage.demand[2].remainingEstimateHours=0;assert.equal(calculate(d).demand,0);
 d.capacityCoverage.demand[2].hasRemainingEstimate=false;d.capacityCoverage.demand[1].hasRemainingEstimate=false;m=calculate(d);assert.equal(m.demand,900);assert.equal(m.exceptions.estimate.length,2);
});
test('Epic status never suppresses active child and no independent rollup',()=>{
 const d=fixture();d.capacityCoverage.demand=[issue('EPIC',{type:'Epic',status:'Done',remainingEstimateHours:0}),issue('CHILD',{parentKey:'EPIC',remainingEstimateHours:94.75})];assert.equal(calculate(d).demand,94.75);
});
test('Story/Task fallback ignores terminal subtasks and respects paused eligible subtasks',()=>{
 for(const type of ['Story','Task']){
  const d=fixture();d.capacityCoverage.demand=[issue('PARENT',{type,remainingEstimateHours:80}),issue('CHILD',{type:'Sub-task',parentKey:'PARENT',status:'Done',statusCategory:'Done',remainingEstimateHours:10})];
  let m=calculate(d);assert.equal(m.demand,80);assert.deepEqual(m.contributions.map(r=>r.key),['PARENT']);assert.equal(m.estimationOverlaps.length,0);
  d.capacityCoverage.demand[1].status='Blocked';d.capacityCoverage.demand[1].statusCategory='In Progress';m=calculate(d);assert.equal(m.demand,10);assert.equal(m.estimationOverlaps.length,1);
 }
});
test('valid zero subtasks suppress the parent; missing, invalid and negative estimates permit fallback',()=>{
 const d=fixture();d.capacityCoverage.demand=[issue('PARENT',{type:'Story',remainingEstimateHours:80}),issue('CHILD',{type:'Sub-task',parentKey:'PARENT',remainingEstimateHours:0})];
 let m=calculate(d);assert.equal(m.demand,0);assert.deepEqual(m.contributions.map(r=>r.key),['CHILD']);assert.equal(m.estimationOverlaps[0].overlapChildren[0].estimate,0);
 for(const remainingEstimateHours of [null,-1,NaN,'invalid']){d.capacityCoverage.demand[1].remainingEstimateHours=remainingEstimateHours;m=calculate(d);assert.equal(m.demand,80);assert.equal(m.exceptions.estimate.length,1);assert.equal(m.estimationOverlaps.length,0);}
 d.capacityCoverage.demand[1].remainingEstimateHours=0;d.capacityCoverage.demand[1].hasRemainingEstimate=false;assert.equal(calculate(d).demand,80);
});
test('mixed subtasks use only eligible valid estimates and overlaps are non-additive review records',()=>{
 const d=fixture();d.capacityCoverage.demand=[issue('PARENT',{type:'Task',remainingEstimateHours:80}),issue('VALID',{type:'Sub-task',parentKey:'PARENT',remainingEstimateHours:5}),issue('ZERO',{type:'Sub-task',parentKey:'PARENT',remainingEstimateHours:0}),issue('MISSING',{type:'Sub-task',parentKey:'PARENT',remainingEstimateHours:null,hasRemainingEstimate:false}),issue('DONE',{type:'Sub-task',parentKey:'PARENT',status:'Closed',remainingEstimateHours:50})];
 const before=JSON.stringify(d);const m=calculate(d);assert.equal(m.demand,5);assert.equal(m.estimationOverlaps.length,1);const overlap=m.estimationOverlaps[0];assert.equal(overlap.remainingEstimateHours,80);assert.equal(overlap.estimate,80);assert.deepEqual(overlap.overlapChildKeys,['VALID','ZERO']);assert(overlap.exceptionFlags.some(f=>f.includes('governance review')));assert.equal(m.exceptions.hierarchy.length,0);assert.equal(m.exceptions.estimate.length,1);assert.equal(JSON.stringify(d),before);
 assert(!m.contributions.some(r=>r.key==='PARENT'));assert.equal(new Set(m.contributions.map(r=>r.key)).size,m.contributions.length);
});
test('terminal excluded; blocked and paused remain eligible; blank and invalid distinct from zero',()=>{
 const d=fixture();d.capacityCoverage.demand=[issue('DONE',{status:'Closed'}),issue('BLOCKED',{status:'Blocked'}),issue('PAUSED',{status:'On Hold'}),issue('ZERO',{remainingEstimateHours:0}),issue('MISSING',{hasRemainingEstimate:false,remainingEstimateHours:null}),issue('INVALID',{remainingEstimateHours:-1})];
 const m=calculate(d);assert.equal(m.demand,40);assert.equal(m.contributions.length,3);assert.equal(m.exceptions.estimate.length,2);
});
test('unallocated, outside Engineering, undated and invalid stay exclusive under Team filters',()=>{
 const d=fixture();d.capacityCoverage.demand=[issue('UNMAPPED',{assignee:'Unknown'}),issue('QA',{assignee:'QA person'}),issue('UNDATED',{targetRelease:'',assignee:'Unknown'}),issue('MISSING',{targetRelease:'',assignee:'Unknown',hasRemainingEstimate:false})];
 const m=calculate(d,{teams:new Set(['Nexus'])});assert.equal(m.demand,0);assert.equal(m.unallocatedHours,20);for(const c of ['unallocated','outside','unscheduled','estimate'])assert.equal(m.exceptions[c].length,1);
 assert.equal(calculate(d,{},'release','current',r=>r.key==='QA').unallocatedHours,0);
});
test('future release precedence, historical/unknown target fallback, gaps and unscheduled dates',()=>{
 const d=fixture();d.capacityCoverage.demand=[issue('PRECEDENCE',{dueDate:'2026-12-31'}),issue('BACKPORT',{targetRelease:'old',dueDate:'2026-10-30'}),issue('UNKNOWN',{targetRelease:'unknown',dueDate:'2026-11-07'}),issue('NO-DATE',{targetRelease:''})];
 let m=calculate(d);assert.equal(m.demand,40);assert.equal(m.exceptions.unscheduled.length,1);m=calculate(d,{},'year');assert.equal(m.demand,60);assert.equal(m.capacity,720);assert(coverage.horizon(d,'release','old').error);
 assert.equal(calculate(d,{},'release','next-year').capacity,null);
});
test('identity deduplication, conflicts, cycles, global exact exclusions',()=>{
 const d=fixture();const same=issue('A');d.capacityCoverage.demand=[same,{...same},issue('CYCLE-A',{parentKey:'CYCLE-B'}),issue('CYCLE-B',{parentKey:'CYCLE-A'}),issue(' tempo-54 '),issue('TEMPO-540')];let m=calculate(d);assert.equal(m.demand,40);assert.equal(m.exceptions.hierarchy.length,2);
 d.capacityCoverage.demand.push(issue('A',{remainingEstimateHours:500}));m=calculate(d);assert.equal(m.demand,20);assert.equal(m.exceptions.hierarchy.length,3);
});
test('workforce and demand-only filters, aggregate weighted load',()=>{
 const d=fixture();d.capacityCoverage.capacity.filter(r=>r.team==='Nexus').forEach(r=>r.planned=20);d.capacityCoverage.demand=[issue('A',{client:'One'}),issue('B',{assignee:'Nexus person',remainingEstimateHours:60,client:'Two'})];const base=calculate(d);const filtered=calculate(d,{},'release','current',r=>r.client==='One');assert.equal(filtered.capacity,base.capacity);assert.equal(filtered.demand,20);assert.equal(base.load,80/440*100);assert.notEqual(base.load,base.teams.reduce((s,r)=>s+r.load,0)/6);
 assert.equal(calculate(d,{assignees:new Set(['Nexus person']),skills:new Set(['Backend'])}).demand,60);assert.equal(calculate(d,{teams:new Set(['Nexus'])}).capacity,40);
});
const data=JSON.parse(fs.readFileSync(path.join(root,'web/data.js'),'utf8').replace(/^window\.BI_DATA\s*=\s*/,'').replace(/;\s*$/,''));
test('source baseline conserved, actual six-team reconciliation, no repeated contribution key',()=>{
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'outputs/capacity_assigned_demand/baseline.json'),'utf8'));
 assert.equal(data.capacity.length,baseline.baseline.capacityRows);assert.equal(data.worklogs.length,baseline.baseline.worklogRows);assert.equal(data.demand.length,baseline.baseline.demandRows);
 assert.equal(data.capacity.reduce((s,r)=>s+r.planned,0),baseline.baseline.capacityHours);assert.deepEqual(data.meta.sourceKpis,baseline.sourceKpis);
 assert(Math.abs(data.worklogs.reduce((s,r)=>s+r.logged,0)-baseline.baseline.loggedHours)<1e-7);
 assert(Math.abs(data.demand.reduce((s,r)=>s+(r.demandHours||0),0)-baseline.baseline.rawRemainingHours)<1e-7);
 const m=calculate(data,{},'year');assert.equal(m.teams.length,6);assert.equal(m.knownCapacity,12816);assert.equal(m.capacity,null);assert.equal(row(m,'Scoring').missingRecords,33);assert.equal(m.demand,m.teams.reduce((s,r)=>s+r.demand,0));assert.equal(new Set(m.contributions.map(r=>r.key)).size,m.contributions.length);
 assert(m.contributions.some(r=>r.clientAttributionStatus==='No direct Tempo worklogs'),'Unlogged Jira demand must remain eligible');
 const keys=Object.values(m.exceptions).flat().map(r=>r.key);assert.equal(new Set(keys).size,keys.length);
 const out={testsPassed:tests+1,reportingDate:m.window.reportingDate,yearEnd:{...m,contributions:m.contributions.map(r=>({key:r.key,team:r.team,estimate:r.estimate,bucket:r.bucket,planningDate:r.planningDate})),trace:m.trace.map(r=>({key:r.key,outcome:r.outcome,estimate:r.estimate})),exceptions:Object.fromEntries(Object.entries(m.exceptions).map(([k,rows])=>[k,rows.map(r=>({key:r.key,team:r.team,estimate:r.estimate,bucket:r.bucket,outcome:r.outcome,allocationState:r.allocationState,exceptionFlags:r.exceptionFlags}))]))}};
 fs.writeFileSync(path.join(root,'outputs/capacity_assigned_demand/reconciliation.json'),JSON.stringify(out,null,2));
});
console.log(`${tests} capacity coverage checks passed`);
