import fs from 'node:fs/promises';
import path from 'node:path';
import {Workbook,SpreadsheetFile} from '@oai/artifact-tool';
const root=path.resolve(import.meta.dirname,'../..'), out=path.join(root,'outputs/client_delivery_20261022');
const d=JSON.parse(await fs.readFile(path.join(out,'report_data.json'),'utf8')), m=d.metrics;
const wb=Workbook.create(), names=['Executive summary','Client workflow','Epic register','Demand and capacity','Demand detail','Controls and checks','Source capacity','Release calendar'];
const sheets=Object.fromEntries(names.map(n=>[n,wb.worksheets.add(n)]));
const navy='#173B5E', blue='#2E75B6', pale='#EAF2F8', amber='#FFF0CC', red='#FBE4E1';
const hours='#,##0.0" h";[Red]-#,##0.0" h";0.0" h"', number='#,##0';
const C=n=>{let a='';for(n++;n;n=Math.floor((n-1)/26))a=String.fromCharCode(65+(n-1)%26)+a;return a};
const val=(s,a,v)=>s.getRange(a).values=[[v]];
const f=(s,a,v)=>s.getRange(a).formulas=[[v]];
function merge(s,a,v){s.getRange(a).unmerge();s.getRange(a).merge();val(s,a.split(':')[0],v)}
function header(s,a){s.getRange(a).format={fill:navy,font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},wrapText:true,verticalAlignment:'center',horizontalAlignment:'center',rowHeight:34}}
function note(s,row,text,end='I'){merge(s,`A${row}:${end}${row}`,text);s.getRange(`A${row}:${end}${row}`).format={wrapText:true,rowHeight:32,font:{name:'Arial',size:10,color:'#526274'}}}
function title(s,text,end='I'){end=s.name==='Controls and checks'?'B':'I';merge(s,`A2:${end}2`,text);s.getRange(`A2:${end}2`).format={font:{name:'Arial',size:16,bold:true,color:navy},rowHeight:30};s.getRange(`A3:${end}3`).format.borders={bottom:{style:'thin',color:navy}}}
function table(s,row,headers,rows,name){let end=C(headers.length-1),last=row+rows.length; const range=s.getRange(`A${row}:${end}${last}`);range.values=[headers,...rows.map(r=>r.map(x=>x??'-'))];range.format={font:{name:'Arial',size:10,color:'#24384B'},rowHeight:24,verticalAlignment:'center'};header(s,`A${row}:${end}${row}`);if(rows.length){const t=s.tables.add(`A${row}:${end}${last}`,true,name);t.style='TableStyleMedium2'}s.freezePanes.freezeRows(row);return last}
for(const s of Object.values(sheets)){s.showGridLines=false;s.getRange('A1:Y70').format.font={name:'Arial',size:10,color:'#24384B'};s.getRange('A1:Y70').format.rowHeight=22;s.getRange('A:Y').format.columnWidth=17;s.tabColor=navy}
const ep=sheets['Epic register'],det=sheets['Demand detail'],cw=sheets['Client workflow'],cap=sheets['Demand and capacity'],ex=sheets['Executive summary'],ctl=sheets['Controls and checks'],cs=sheets['Source capacity'],rc=sheets['Release calendar'];
const stages=['Demand','DoR','DoD','Done','Blocked','Discontinued','Unmapped'];
title(ep,'Epic register','O');note(ep,4,'Direct logged hours cover managed workforce only; child worklogs excluded.','I');
ep.getRange('A6:C6').values=[['Workflow','Epic count','Direct logged hours']];header(ep,'A6:C6');
const epirows=d.epics.length+17;
for(let i=0;i<7;i++){let r=7+i;val(ep,`A${r}`,stages[i]);f(ep,`B${r}`,`=COUNTIF(E18:E${epirows},A${r})`);f(ep,`C${r}`,`=SUMIF(E18:E${epirows},A${r},I18:I${epirows})`)}
ep.getRange('C7:C13').setNumberFormat(hours);ep.getRange('A7:C10').format.fill=pale;ep.getRange('A11:C13').format.fill=amber;
const eh=['Client','Epic key','Epic summary','Promoter','Workflow','Status','Target Release','Due Date','Direct logged hours','Start Date','Contributing teams (Tempo)','Effort Cap (h)','Epic Original Estimate (h)','Client attribution provenance','Issue type'];
table(ep,17,eh,d.epics,'EpicInventory');ep.getRange(`I18:I${epirows}`).setNumberFormat(hours);ep.getRange(`L18:M${epirows}`).setNumberFormat(hours);
const groups=[];let start=18;
while(start<=epirows){let stage=d.epics[start-18][4],end=start;while(end<epirows&&d.epics[end-17][4]===stage)end++;groups.push({start,end,stage});start=end+1}
ep.getRange('A:A').format.columnWidth=25;ep.getRange('B:B').format.columnWidth=17;ep.getRange('C:C').format.columnWidth=72;ep.getRange('D:D').format.columnWidth=24;ep.getRange('F:G').format.columnWidth=26;ep.getRange('K:K').format.columnWidth=30;ep.getRange('N:N').format.columnWidth=58;
title(det,'Demand detail','Q');note(det,4,'Own estimates are separate from Jira aggregate estimates. Mixed-level contributions remain unquantified pending an approved resolver.','J');
const dh=['Client','Epic key','Work item key','Parent key','Issue type','Summary','Status','Demand team allocation','Original Estimate (h)','Remaining Estimate (h)','Target Release','Due Date','Effective planning period','Planning basis','Included demand hours','Inclusion/exclusion reason','Data-quality exception','Jira aggregate Original (h)','Jira aggregate Remaining (h)','Client attribution provenance','Tempo Account names','Missing estimate flag','Unallocated flag','Hierarchy unresolved flag','Managed allocation flag'];
const dend=table(det,6,dh,d.detail,'DemandRecords');det.getRange(`I7:J${dend}`).setNumberFormat(hours);det.getRange(`O7:O${dend}`).setNumberFormat(hours);det.getRange(`R7:S${dend}`).setNumberFormat(hours);
det.getRange('A:A').format.columnWidth=24;det.getRange('F:F').format.columnWidth=75;det.getRange('G:H').format.columnWidth=27;det.getRange('K:N').format.columnWidth=26;det.getRange('P:Q').format.columnWidth=66;det.getRange('T:U').format.columnWidth=55;
title(cw,'Client workflow');note(cw,4,'Distinct Jira Epic, Epic Lab and Epic Release counts. Client is Tempo Account Customer. Unresolved attribution uses “-”.');
table(cw,6,['Client',...stages,'Total'],d.clients.map(c=>[c,...stages.map(()=>0),0]),'WorkflowByClient');
const cend=6+d.clients.length;
for(let i=7;i<=cend;i++){for(let j=1;j<=7;j++)f(cw,`${C(j)}${i}`,`=COUNTIFS('Epic register'!$A$18:$A$${epirows},A${i},'Epic register'!$E$18:$E$${epirows},${C(j)}$6)`);f(cw,`I${i}`,`=SUM(B${i}:H${i})`)}
val(cw,`A${cend+1}`,'Total');for(let j=1;j<9;j++)f(cw,`${C(j)}${cend+1}`,`=SUM(${C(j)}7:${C(j)}${cend})`);
cw.getRange(`B7:E${cend}`).conditionalFormats.add('colorScale',{colors:['#F6FAFD','#2166AC'],thresholds:['min','max']});cw.getRange(`F7:H${cend}`).conditionalFormats.add('cellIs',{operator:'greaterThan',formula:0,format:{fill:amber,font:{color:'#8A4B08'}}});cw.getRange('A:A').format.columnWidth=31;cw.getRange('B:I').format.columnWidth=13;
title(rc,'Governed release calendar','D');table(rc,5,['Release','Start Date','Code Freeze','Temporal status'],d.releases.map(r=>[r.name,r.start,r.end,r.state]),'ReleaseWindows');rc.getRange('A:A').format.columnWidth=30;rc.getRange('B:D').format.columnWidth=24;
title(cs,'Release capacity inputs','H');note(cs,4,'Weekly-grain capacity uses full Master Date weeks intersecting a release. 2026 capacity is not reused for 2027.','H');
table(cs,6,['Release','Managed team','Available hours','Valid person-week rows','Expected roster-week rows','Coverage','Master Date weeks','Capacity year'],d.capacity,'ReleaseCapacityInputs');cs.getRange(`C7:C${d.capacity.length+6}`).setNumberFormat(hours);cs.getRange('A:B').format.columnWidth=27;cs.getRange('F:G').format.columnWidth=34;
title(cap,'Demand and capacity','I');val(cap,'A4','Release');val(cap,'B4',d.defaultRelease);cap.getRange('B4:D4').merge();cap.getRange('B4:D4').format={fill:'#FFF2CC',font:{name:'Arial',size:12,bold:true,color:navy},rowHeight:28};cap.getRange('B4').dataValidation={rule:{type:'list',formula1:`'Release calendar'!$A$6:$A$${d.releases.length+5}`}};
val(cap,'E4','Release start');f(cap,'F4',`=INDEX('Release calendar'!B6:B22,MATCH(B4,'Release calendar'!A6:A22,0))`);val(cap,'G4','Code freeze');f(cap,'H4',`=INDEX('Release calendar'!C6:C22,MATCH(B4,'Release calendar'!A6:A22,0))`);
note(cap,6,'Partial known demand: restricted Jira inventory, unresolved mixed-level estimates and missing allocations limit the absorption conclusion.');
const n=d.teams.length,hstart=57,hend=hstart+n-1,csend=d.capacity.length+6;
cap.getRange(`A56:L${hend}`).values=[['Team','Available capacity','Known assigned demand','Load','Capacity gap','Demand within capacity','Unused capacity track','Overload','Missing estimates','Unresolved hierarchy','Capacity coverage','Rank'],...d.teams.map(t=>[t,...Array(11).fill(null)])];header(cap,'A56:L56');
const Dcol=c=>`'Demand detail'!$${c}$7:$${c}$${dend}`;
for(let r=hstart;r<=hend;r++){
 f(cap,`B${r}`,`=IF(COUNTIFS('Source capacity'!$A$7:$A$${csend},$B$4,'Source capacity'!$B$7:$B$${csend},A${r},'Source capacity'!$D$7:$D$${csend},">0")=0,"-",SUMIFS('Source capacity'!$C$7:$C$${csend},'Source capacity'!$A$7:$A$${csend},$B$4,'Source capacity'!$B$7:$B$${csend},A${r}))`);
 f(cap,`C${r}`,`=SUMIFS(${Dcol('O')},${Dcol('M')},$B$4,${Dcol('N')},"Target Release",${Dcol('H')},A${r})`);
 f(cap,`D${r}`,`=IF(ISNUMBER(B${r}),IF(B${r}>0,C${r}/B${r},"-"),"-")`);
 f(cap,`E${r}`,`=IF(ISNUMBER(B${r}),B${r}-C${r},"-")`);
 f(cap,`F${r}`,`=IF(ISNUMBER(B${r}),MIN(B${r},C${r}),0)`);f(cap,`G${r}`,`=IF(ISNUMBER(B${r}),MAX(B${r}-C${r},0),0)`);f(cap,`H${r}`,`=IF(ISNUMBER(B${r}),MAX(C${r}-B${r},0),C${r})`);
 f(cap,`I${r}`,`=SUMIFS(${Dcol('V')},${Dcol('M')},$B$4,${Dcol('H')},A${r})`);f(cap,`J${r}`,`=SUMIFS(${Dcol('X')},${Dcol('M')},$B$4,${Dcol('H')},A${r})`);
 f(cap,`K${r}`,`=INDEX('Source capacity'!$F$7:$F$${csend},(MATCH($B$4,'Release calendar'!$A$6:$A$22,0)-1)*${n}+${r-hstart+1})`);
 // Ascending gap places overload first, then headroom, then unavailable teams. Stable ties follow source team order.
 f(cap,`L${r}`,`=IF(ISNUMBER(E${r}),COUNTIF($E$${hstart}:$E$${hend},"<"&E${r})+COUNTIF($E$${hstart}:E${r},E${r}),COUNT($E$${hstart}:$E$${hend})+COUNTIF($E$${hstart}:E${r},"-"))`);
}
val(cs,'I6','Release/team key');for(let r=7;r<=csend;r++)f(cs,`I${r}`,`=A${r}&"~"&B${r}`);cs.getRange('I:I').format.columnWidth=53;
const metricLabels=['Available capacity (h)','Known assigned demand (h)','Capacity gap (h)','Portfolio load'];
for(let i=0;i<4;i++){let col=C(i*2);merge(cap,`${col}8:${C(i*2+1)}8`,metricLabels[i]);header(cap,`${col}8:${C(i*2+1)}8`);cap.getRange(`${col}9:${C(i*2+1)}10`).merge()}
f(cap,'A9',`=IF(COUNT(B${hstart}:B${hend})=0,"-",SUM(B${hstart}:B${hend}))`);f(cap,'C9',`=SUM(C${hstart}:C${hend})`);f(cap,'E9','=IF(ISNUMBER(A9),A9-C9,"-")');f(cap,'G9','=IF(ISNUMBER(A9),IF(A9>0,C9/A9,"-"),"-")');cap.getRange('A9:H10').format.font={name:'Arial',size:16,bold:true,color:navy};cap.getRange('A9:F10').setNumberFormat(hours);cap.getRange('G9:H10').setNumberFormat('0.0%');
val(cap,'A12','Unallocated demand (h)');f(cap,'C12',`=SUMIFS(${Dcol('O')},${Dcol('M')},$B$4,${Dcol('W')},1)`);val(cap,'E12','Missing estimates (items)');f(cap,'G12',`=SUMIFS(${Dcol('V')},${Dcol('M')},$B$4)`);
val(cap,'A13','Unresolved hierarchy (items)');f(cap,'C13',`=SUMIFS(${Dcol('X')},${Dcol('M')},$B$4)`);val(cap,'E13','Outside managed teams (h)');f(cap,'G13',`=SUMIFS(${Dcol('O')},${Dcol('M')},$B$4,${Dcol('Y')},0)-C12`);
val(cap,'A14','Teams with capacity data');f(cap,'C14',`=COUNT(B${hstart}:B${hend})`);val(cap,'E14','Managed teams');val(cap,'G14',n);cap.getRange('C12').setNumberFormat(hours);cap.getRange('G13').setNumberFormat(hours);
note(cap,16,'Capacity is the available source subtotal. Missing team capacity and partial rosters make portfolio gap and load incomplete.');
const displayStart=19,displayEnd=18+n;
cap.getRange('A18:K18').values=[['Team','Capacity (h)','Demand (h)','Load','Gap (h)','Demand within capacity','Unused capacity track','Overload','Missing estimates','Hierarchy unresolved','Coverage']];header(cap,'A18:K18');
for(let r=displayStart;r<=displayEnd;r++)for(let c=0;c<11;c++)f(cap,`${C(c)}${r}`,`=INDEX(${C(c)}${hstart}:${C(c)}${hend},MATCH(${r-displayStart+1},$L$${hstart}:$L$${hend},0))`);
cap.getRange(`B19:C${displayEnd}`).setNumberFormat(hours);cap.getRange(`E19:H${displayEnd}`).setNumberFormat(hours);cap.getRange(`D19:D${displayEnd}`).setNumberFormat('0.0%');cap.getRange(`E19:E${displayEnd}`).conditionalFormats.add('cellIs',{operator:'lessThan',formula:0,format:{fill:red,font:{color:'#A52B22',bold:true}}});cap.getRange(`I19:J${displayEnd}`).conditionalFormats.add('cellIs',{operator:'greaterThan',formula:0,format:{fill:amber}});
const chart=cap.charts.add('bar',[cap.getRange(`A18:A${displayEnd}`),cap.getRange(`F18:F${displayEnd}`),cap.getRange(`G18:G${displayEnd}`),cap.getRange(`H18:H${displayEnd}`)]);chart.title='Known demand against available capacity (hours)';chart.barOptions.direction='bar';chart.barOptions.grouping='stacked';chart.setPosition('A31','K51');chart.legend={position:'bottom',textStyle:{typeface:'Arial',fontSize:11}};chart.titleTextStyle.typeface='Arial';chart.titleTextStyle.fontSize=13;chart.xAxis={axisType:'textAxis',textStyle:{typeface:'Arial',fontSize:11}};chart.yAxis={numberFormatCode:'#,##0" h"',numberFormatSourceLinked:false,textStyle:{typeface:'Arial',fontSize:11}};[blue,'#DCE6EE','#BD493D'].forEach((color,i)=>{if(chart.series.items[i])chart.series.items[i].fill=color});
note(cap,52,'Blue = demand covered by known capacity. Grey = available headroom. Red = demand beyond capacity or demand with no capacity record.','K');note(cap,53,'Positive gap means headroom; negative gap means overload. Headroom in another team is not an allocation decision.','K');
cap.getRange('A:A').format.columnWidth=29;cap.getRange('B:C').format.columnWidth=23;cap.getRange('D:D').format.columnWidth=13;cap.getRange('E:H').format.columnWidth=22;cap.getRange('I:J').format.columnWidth=18;cap.getRange('K:K').format.columnWidth=22;
title(ex,'Client Delivery Status and Demand');note(ex,4,'For Fabiano · Report date: 22 October 2026 · Jira and Tempo snapshot: 22 October 2026');note(ex,5,'Portfolio: all 360 available Epic / Epic Lab / Epic Release records. Capacity: 10 Assignees teams; 38 of 60 people have weekly records.');
ex.getRange('A7:H7').values=[['Active Epics',null,'Epics in DoD',null,'Blocked / on hold',null,'Completed inventory',null]];header(ex,'A7:H7');
f(ex,'A8',"=SUM('Epic register'!B7:B9)");f(ex,'C8',"='Epic register'!B9");f(ex,'E8',"='Epic register'!B11");f(ex,'G8',"='Epic register'!B10");ex.getRange('A8:H8').format={font:{name:'Arial',size:16,bold:true,color:navy},rowHeight:31};note(ex,10,'Active = Demand + DoR + DoD. Blocked, Discontinued and Unmapped are separate dispositions. Done is a snapshot count.');
ex.getRange('A12:I12').values=[['Client',...stages,'Total']];header(ex,'A12:I12');for(let r=0;r<d.clients.length;r++)for(let c=0;c<9;c++)f(ex,`${C(c)}${r+13}`,`='Client workflow'!${C(c)}${r+7}`);
const exend=12+d.clients.length;ex.getRange(`B13:E${exend}`).conditionalFormats.add('colorScale',{colors:['#F6FAFD','#2166AC'],thresholds:['min','max']});ex.getRange(`F13:H${exend}`).conditionalFormats.add('cellIs',{operator:'greaterThan',formula:0,format:{fill:amber}});
let p=exend+3;merge(ex,`A${p}:I${p}`,'Selected-release capacity pressure');header(ex,`A${p}:I${p}`);val(ex,`A${p+1}`,'Release');f(ex,`B${p+1}`,"='Demand and capacity'!B4");val(ex,`E${p+1}`,'Window');f(ex,`F${p+1}`,"='Demand and capacity'!F4&\" to \"&'Demand and capacity'!H4");
for(let i=0;i<4;i++){val(ex,`A${p+3+i}`,metricLabels[i]);f(ex,`D${p+3+i}`,`='Demand and capacity'!${['A9','C9','E9','G9'][i]}`)}ex.getRange(`D${p+3}:D${p+5}`).setNumberFormat(hours);ex.getRange(`D${p+6}`).setNumberFormat('0.0%');
note(ex,p+8,`${m.missingClients} Epics lack verified Tempo Customer Account attribution; ${m.workflow.Unmapped} have unmapped workflow statuses.`);note(ex,p+9,`${m.missingEstimates} Jira items have no Remaining Estimate. ${m.missingAllocations} have no delivery-team allocation.`);note(ex,p+10,`${m.mixedRecords} records have unresolved mixed-level estimate selection. Demand is partial and cannot validate portfolio absorption.`);note(ex,p+11,'Jira inventory is restricted to the supplied PI Backlog extract. Full inventory and complete child coverage were not supplied.');
ex.getRange('A:A').format.columnWidth=31;ex.getRange('B:I').format.columnWidth=14;
title(ctl,'Controls and checks','F');
const notes=[
 ['Report status','PARTIAL — arithmetic reconciles; complete demand and capacity absorption are not validated.'],
 ['Scope',`${m.jira} Jira issues; ${m.epics} Epics; ${m.managedPeople} managed people; ${d.teams.length} managed teams.`],
 ['Epic issue types','Epic, Epic Lab, Epic Release follow web/demand.js renderWorkflow. Epic Basic is outside this approved workflow mapping.'],
 ['Active definition','Demand + DoR + DoD. Blocked, Discontinued and Unmapped are outside the four workflow steps.'],
 ['Snapshot / logged scope',`Jira 2026-10-22; Tempo ${m.tempoStart} to ${m.tempoEnd}; capacity 2026-10-16; workforce 2026-10-09.`],
 ['Customer attribution','Exact normalized Tempo Work Item Key to Jira key; use Account Customer only. No Jira Account or Tempo Client substitution.'],
 ['Parent customer fallback','No approved Customer Account parent fallback found. Existing parent fallback governs Jira metadata, not Customer Account. No inheritance applied.'],
 ['Ambiguous customers',`${m.ambiguousClients} Epic keys have multiple direct nonblank Tempo Customer Accounts. Ambiguity is unresolved “-”, never duplicated.`],
 ['Direct Epic logged hours','Managed Assignees scope; exact Epic key matches only; valid Tempo work dates; five governed exact-key exclusions. No child rollup.'],
 ['Exclusions',Array.from(['TEMPO-54','TEMPO-92','TEMPO-106','TEMPO-111','TEMPO-112']).join(', ')],
 ['Allocation authority','Delivery Management. Demand allocation is Jira Team Name as explicitly supplied. No assignee, promoter, contributor or workforce-team inference.'],
 ['Managed teams',d.teams.join(', ')],
 ['Capacity method','2026 Weekly Capacity, mapped to canonical Assignees team. Full weekly capacity when a Master Date week intersects release; no proration.'],
 ['Capacity coverage',`${m.validCapacity} valid managed person-week rows; ${m.capacityPeople}/${m.managedPeople} people. ${m.malformedCapacity} malformed source rows rejected (missing person/week/hours).`],
 ['Capacity year limitation','Weekly source has no year column. Dated 2026 extract is applied only to releases wholly within 2026. 2027 and cross-year windows show missing capacity.'],
 ['Hierarchy conflict','Forecast Resolution Specification §5.3 prohibits hierarchy-only contributor suppression; build_web_data.py contributes at distinct-key grain. No approved child-first resolver exists.'],
 ['Hierarchy treatment',`${m.mixedRecords} related nonterminal positive Remaining Estimate records withheld, not counted as zero. No child-first/parent-fallback result is claimed as validated.`],
 ['Aggregate estimates','Jira Σ estimates appear separately in Demand detail. They are never included in demand. Remaining Estimate is never Original minus logged effort.'],
 ['Hierarchy coverage',`${m.missingParents} records reference parents absent from the restricted extract. Unexported children cannot be enumerated. Full hierarchy inventory is required.`],
 ['Planning','Valid current/future Target Release uses governed dates. Future Due Date fallback remains a dated “Due date” bucket, including backports; it is never silently assigned to a release.'],
 ['Terminal work','Done, Closed, Cancelled, Canceled, Rejected, Abandoned, Resolved and Status category Done excluded from future demand.'],
 ['Unallocated demand','Included separately where quantitatively supported; excluded from assigned demand and portfolio load. Missing allocation is not a planning exception.'],
 ['Missing versus zero','Missing source numbers display “-”; actual zero remains numeric. Zero/missing capacity load is “-”. N/A is retained when supplied as planning category.'],
 ['Overlapping exceptions','Missing clients, estimates, allocation, hierarchy and planning are overlapping record flags. Do not add exception counts or hours.'],
 ['Unavailable visual references','No approved screenshot or mockup image was supplied with this request. Native Excel layout follows the written navy/blue specification.'],
 ['Refresh','Run build_data.py, then build_workbook.mjs, then finalize.py in this separate report workspace. See USAGE.txt. No external connections or macros.'],
 ['Baseline','BASELINE_v0.16_2026-08-26.txt; current governance and source-code SHA-256 fingerprints recorded below.'],
 ];
table(ctl,6,['Control','Evidence / interpretation'],notes,'ControlNotes');ctl.getRange(`B7:B${6+notes.length}`).format.wrapText=true;ctl.getRange(`A7:B${6+notes.length}`).format.rowHeight=46;
let cr=notes.length+10;ctl.getRange(`A${cr}:D${cr}`).values=[['Reconciliation','Expected','Actual','Result']];header(ctl,`A${cr}:D${cr}`);
const checks=[['Unique Epic keys',m.epics,`=COUNTA('Epic register'!B18:B${epirows})`],['Workflow counts',m.epics,`=SUM('Client workflow'!I7:I${cend})`],['Workflow bands',m.epics,"=SUM('Epic register'!B7:B13)"],['Direct Epic hours',m.directHours,`=SUM('Epic register'!I18:I${epirows})`],['Included demand hours',m.includedHours,`=SUM('Demand detail'!O7:O${dend})`]];
for(let i=0;i<checks.length;i++){let r=cr+1+i;val(ctl,`A${r}`,checks[i][0]);val(ctl,`B${r}`,checks[i][1]);f(ctl,`C${r}`,checks[i][2]);f(ctl,`D${r}`,`=IF(ABS(B${r}-C${r})<0.000001,"PASS","FAIL")`)}
cr+=checks.length+4;table(ctl,cr,['Source','Filename','Snapshot','Source rows','SHA-256'],d.sources,'SourceManifest');cr+=d.sources.length+4;table(ctl,cr,['Calculation / mapping / governance file','SHA-256'],d.provenance,'GovernanceManifest');
ctl.getRange('A:A').format.columnWidth=46;ctl.getRange('B:B').format.columnWidth=105;ctl.getRange('C:C').format.columnWidth=25;ctl.getRange('D:D').format.columnWidth=20;ctl.getRange('E:E').format.columnWidth=70;
// Typed dates and readable detail rows; preserve text placeholders only for missing data.
for(let i=0;i<d.epics.length;i++)for(const [j,col] of [[7,'H'],[9,'J']])if(d.epics[i][j])val(ep,`${col}${i+18}`,new Date(d.epics[i][j]+'T00:00:00Z'));
for(let i=0;i<d.detail.length;i++)if(d.detail[i][11])val(det,`L${i+7}`,new Date(d.detail[i][11]+'T00:00:00Z'));
for(let i=0;i<d.releases.length;i++){val(rc,`B${i+6}`,new Date(d.releases[i].start+'T00:00:00Z'));val(rc,`C${i+6}`,new Date(d.releases[i].end+'T00:00:00Z'))}
ep.getRange(`H18:H${epirows}`).setNumberFormat('yyyy-mm-dd');ep.getRange(`J18:J${epirows}`).setNumberFormat('yyyy-mm-dd');det.getRange(`L7:L${dend}`).setNumberFormat('yyyy-mm-dd');rc.getRange('B6:C22').setNumberFormat('yyyy-mm-dd');cap.getRange('F4').setNumberFormat('yyyy-mm-dd');cap.getRange('H4').setNumberFormat('yyyy-mm-dd');
f(ex,`F${p+1}`,`=TEXT('Demand and capacity'!F4,"yyyy-mm-dd")&" to "&TEXT('Demand and capacity'!H4,"yyyy-mm-dd")`);
ep.getRange(`C18:C${epirows}`).format.wrapText=true;ep.getRange(`A18:O${epirows}`).format.rowHeight=44;det.getRange(`F7:F${dend}`).format.wrapText=true;det.getRange(`P7:Q${dend}`).format.wrapText=true;det.getRange(`A7:Y${dend}`).format.rowHeight=46;
note(ep,4,`${m.epics} distinct Epics. Direct logged hours: managed workforce only, ${m.tempoStart} to ${m.tempoEnd}. No child worklogs.`,'I');
note(det,4,'Own estimates and Jira aggregates are separate. Mixed-level demand is withheld pending an approved resolver.','J');
// Stable row ranges for Excel native outlines, dates, printing and file verification.
await fs.writeFile(path.join(out,'layout.json'),JSON.stringify({groups,epirows,dend,cend,exend: p+11,n,cr},null,2));
wb.recalculate();
const tests=[];
for(const rel of [d.defaultRelease,'release-2027-01','release-2027-03']){val(cap,'B4',rel);wb.recalculate();const got=cap.getRange('A9:H14').values;tests.push({release:rel,values:got,teams:cap.getRange(`A19:K${displayEnd}`).values});}
val(cap,'B4',d.defaultRelease);wb.recalculate();await fs.writeFile(path.join(out,'release_selector_tests.json'),JSON.stringify(tests,null,2));
const boundaries=[];
const capIndex=d.capacity.findIndex(x=>x[0]===d.defaultRelease&&x[1]==='Authoring'),capRow=capIndex+7,oldCap=d.capacity[capIndex][2];
val(cs,`C${capRow}`,0);wb.recalculate();boundaries.push({case:'Zero Authoring capacity',rows:cap.getRange('A19:K28').values,metrics:cap.getRange('A9:H9').values});val(cs,`C${capRow}`,oldCap);
const demandIndex=d.detail.findIndex(x=>x[7]==='Nexus'&&x[12]===d.defaultRelease&&typeof x[14]==='number'&&x[14]>0);
if(demandIndex>=0){const r=demandIndex+7,old=d.detail[demandIndex][14];val(det,`O${r}`,2000);wb.recalculate();boundaries.push({case:'Nexus demand stress test',rows:cap.getRange('A19:K28').values,metrics:cap.getRange('A9:H9').values});val(det,`O${r}`,old)}
wb.recalculate();await fs.writeFile(path.join(out,'boundary_tests.json'),JSON.stringify(boundaries,null,2));
await fs.writeFile(path.join(out,'formula_scan.json'),(await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:100},summary:'Final formula scan',maxChars:6000})).ndjson);
await fs.writeFile(path.join(out,'key_values.json'),JSON.stringify({capacity:cap.getRange('A8:H14').values,checks:ctl.getRange(`A${notes.length+11}:D${notes.length+15}`).values},null,2));
for(const [name,range,file] of [['Executive summary',`A1:I${p+11}`,'summary'],['Client workflow',`A1:I${Math.min(cend+1,30)}`,'workflow'],['Epic register','A1:I24','epics'],['Demand and capacity','A1:K53','capacity'],['Demand detail','A1:J13','demand'],['Controls and checks','A1:B18','controls']]){
 try{const img=await wb.render({sheetName:name,range,scale:1.25,format:'png'});await fs.writeFile(path.join(out,`${file}.png`),new Uint8Array(await img.arrayBuffer()));}catch(e){await fs.writeFile(path.join(out,`${file}_render_error.txt`),String(e))}
}
const output=await SpreadsheetFile.exportXlsx(wb);await output.save(path.join(out,'Client_Delivery_Status_and_Demand_2026-10-22.xlsx'));
console.log(JSON.stringify({output:out,epics:m.epics,detail:m.jira,release:d.defaultRelease}));

