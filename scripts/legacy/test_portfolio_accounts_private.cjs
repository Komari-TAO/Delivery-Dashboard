const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const api = require('../web/portfolio-accounts.js');
const legacy = require('../web/portfolio-legacy-export.js');
const coverage = require('../web/capacity-coverage.js');
const root = path.resolve(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8').replace(/^window\.BI_DATA\s*=\s*/, '').replace(/;\s*$/, ''));
const data = read(path.join(root, 'web/data.js'));
const referenceHashes = new Set((data.meta.buildManifest?.sourceFiles || []).map(r=>r.sha256));
const isReferenceSnapshot = referenceHashes.has('E57886118D0E40E409B7E4A1FD04EE0B0A4440AC8D934CD4952E39C0AA7CF08F')
 && referenceHashes.has('6E27430C1B712C369518427493F9FF0232880C8AEB153A2252583F1B8A7C5760');
const index = api.index(data.worklogs, data.meta.excludedIssueKeys);
const state = (keys = [], active = true) => ({tempoAccounts: new Set(keys.map(api.identity)), tempoAccountsActive: active});
const total = (rs, key) => rs.reduce((s, r) => s + (r[key] || 0), 0);
const close = (a, b) => assert(Math.abs(a-b) < 1e-7, `${a} != ${b}`);
let checks = 0;
function test(name, fn) { fn(); checks++; console.log('PASS '+name); }
test('source worklog identities and projections are unique and conserved', () => {
 assert(data.worklogs.every(r=>r.worklogId)); assert.equal(new Set(data.worklogs.map(r=>r.worklogId)).size,data.worklogs.length);
 assert.equal(data.worklogs.length,data.backlogWorklogs.length);
 data.worklogs.forEach((r,i)=>{assert.equal(r.worklogId,data.backlogWorklogs[i].worklogId);assert.equal(r.logged,data.backlogWorklogs[i].logged);});
 assert.equal(data.teams.length,6);
});
if (isReferenceSnapshot) test('snapshot direct membership distinguishes no logs and missing keys', () => {
 const counts=data.backlog.reduce((o,r)=>(o[api.status(r.key,index)]=(o[api.status(r.key,index)]||0)+1,o),{});
 assert.equal(counts['No worklogs'],674);assert.equal(counts['Missing Account Keys'],18);assert.equal(counts['Observed Account'],1602);
});
const issues=[{key:'A-1',account:'Same',originalEstimateHours:10,remainingEstimateHours:5,hasOriginalEstimate:true},{key:'A-2',account:'Same',originalEstimateHours:20,remainingEstimateHours:10,hasOriginalEstimate:true},{key:'A-3',originalEstimateHours:30,remainingEstimateHours:15},{key:'A-4',originalEstimateHours:40,remainingEstimateHours:20}];
const rows=[{key:'A-1',tempoAccountKey:'a',tempoAccount:'Same',logged:3,date:'2026-01-01',worklogId:'1'},
 {key:'A-1',tempoAccountKey:'a',tempoAccount:'Same',logged:4,date:'2026-01-02',worklogId:'2'},
 {key:'A-3',tempoAccountKey:'',logged:2,date:'2026-01-01',worklogId:'3'},
 {key:'A-4',tempoAccountKey:'a',logged:5,date:'2026-01-01',worklogId:'4'},
 {key:'A-4',tempoAccountKey:'A',tempoAccount:'Same',logged:6,date:'2026-01-01',worklogId:'5'},
 {key:'A-4',tempoAccountKey:'',logged:7,date:'2026-01-01',worklogId:'6'},
 {key:'ORPHAN-1',tempoAccountKey:'a',logged:8,date:'2026-01-01',worklogId:'7'}];
const fixture=api.index(rows);
test('case-sensitive keys and duplicate names stay distinct; labels do not bridge Jira',()=>{
 assert.equal(api.partition(issues,fixture,state(['a'])).selected.length,2);
 assert.equal(api.partition(issues,fixture,state(['A'])).selected.length,1);
 assert(!api.issueMatches(issues[1],fixture,state(['a'])));
});
test('union semijoins preserve estimates despite many worklogs and multi-account issues',()=>{
 const both=api.partition([...issues,issues[0]],fixture,state(['a','A']));assert.equal(both.selected.length,2);assert.equal(api.totals(both.selected).original,50);
 assert.equal(api.totals(api.partition(issues,fixture,state(['a'])).selected).original+api.totals(api.partition(issues,fixture,state(['A'])).selected).original,90);
});
test('missing and partial evidence is selectable without claiming ownership',()=>{
 assert.equal(api.status('A-2',fixture),'No worklogs');assert.equal(api.status('A-3',fixture),'Missing Account Keys');assert.equal(api.status('A-4',fixture),'Partially attributed');
 assert.deepEqual(api.partition(issues,fixture,state([''])).selected.map(r=>r.key),['A-3','A-4']);
});
test('inactive, active empty, complete snapshot evidence and orphan effort',()=>{
 assert.equal(api.partition(issues,fixture,state([],false)).selected.length,4);assert.equal(api.partition(issues,fixture,state()).selected.length,0);
 assert(!api.worklogMatches(rows[0],state()));assert(api.worklogMatches(rows[6],state(['a'])));
 assert(api.issueMatches(issues[0],fixture,state(['a'])));assert(!api.issueMatches({key:'PARENT-1'},fixture,state(['a'])));
});
test('selected, residual unlinked and other linked reconcile disjointly',()=>{
 const p=api.partition(issues,fixture,state(['a']));assert.equal(new Set(Object.values(p).flat().map(r=>r.key)).size,issues.length);
 assert.equal(Object.values(p).reduce((s,r)=>s+api.totals(r).original,0),100);
 const m=api.partition(issues,fixture,state(['']));assert.deepEqual(m.unlinked.map(r=>r.key),['A-2']);
});
test('unsupported account comparisons are unavailable and duplicate-name estimates stay separate',()=>{
 const result=api.accountRows(issues,rows,fixture,state([],false));assert.equal(result.find(r=>r.accountKey==='a').variance,null);assert.equal(result.find(r=>r.accountKey==='A').variance,null);
 assert(result.some(r=>r.accountKey===''));close(total(result,'logged'),35);
 const safe=api.accountRows([issues[0]],rows.slice(0,2),fixture,state(['a']));assert.equal(safe[0].variance,-3);assert.equal(safe[0].loggedVsEstimate,.7);
 const partialActivity=api.accountRows([issues[0]],rows.slice(0,1),fixture,state(['a']));assert.equal(partialActivity[0].variance,null,'a date/person/team subset cannot be compared with the whole issue estimate');
});
test('versioned exports separate effort and estimate grains and preserve filter evidence',()=>{
 const groups=api.accountRows(issues,rows,fixture,state([],false));const csv=api.exportCsv({accountRows:groups,planningRows:[...issues,issues[0]],evidence:fixture,state:state([],false),scope:{accountActive:false,report:'fixture'}});
 assert(csv.startsWith('Schema Version,Record Type'));assert.equal(csv.split('\n').filter(r=>r.startsWith('2,Jira issue,')).length,4);
 assert(csv.includes('No worklogs'));assert(csv.includes('Partially attributed'));assert(csv.includes('accountActive'));
});
if (isReferenceSnapshot) test('unchanged capacity resolver preserves the unlogged future-demand reference',()=>{
 const resolved=coverage.resolve(data),window=coverage.horizon(data,'year');const all=coverage.calculate(data,resolved,window);
 const unlogged=coverage.calculate(data,resolved,window,{},r=>api.status(r.key,index)==='No worklogs');
 assert.equal(unlogged.contributions.length,42);close(unlogged.demand,2056);close(all.demand,4934.2333);
});
const capture=path.join(root,'outputs/ch005a/before-legacy-exports.json');
if(fs.existsSync(capture))test('all captured v1 label exports remain byte-compatible',()=>{
 const old=read(path.join(root,'outputs/ch005a/before/data.js'));const s={startDate:old.meta.dateMin,endDate:old.meta.dateMax,detailSort:{accounts:{key:null,direction:null}}};
 ['teams','assignees','skills','clients','categories','priorities','targetReleases','programs','releases'].forEach(k=>s[k]=new Set());
 s.statuses=new Set(old.statuses.filter(r=>String(r.statusCategory).trim().toLowerCase()!=='done').map(r=>r.status));
 for(const c of JSON.parse(fs.readFileSync(capture,'utf8')))assert.equal(legacy.csv(old,s,new Set(c.label===null?[]:[c.label])),c.csv,c.label||'unrestricted');
});
console.log(JSON.stringify({status:'PASS',checks}));
