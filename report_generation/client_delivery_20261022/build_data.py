"""Read-only reporting adapter. Run with Python; no dashboard writes or network calls."""
import sys,json,re,hashlib,subprocess
from pathlib import Path
from collections import defaultdict,Counter
import pandas as pd
sys.dont_write_bytecode=True
ROOT=Path(__file__).resolve().parents[2]
WORK=Path(__file__).resolve().parent
OUT=ROOT/'outputs/client_delivery_20261022'; OUT.mkdir(exist_ok=True,parents=True)
sys.path.insert(0,str(ROOT/'scripts'))
import build_web_data as governed
from governed_exclusions import GLOBAL_EXCLUDED_ISSUE_KEYS,partition_governed_issue_rows
DATE=pd.Timestamp('2026-10-22')
def txt(x): return '' if pd.isna(x) else str(x).strip()
def num(x):
 try: return float(str(x).replace(',','')) if txt(x) else None
 except ValueError: return None
def hrs(x):
 v=num(x); return None if v is None else v/3600
def dt(x):
 if not txt(x): return None
 v=governed.parse_jira_date(pd.Series([x])).iloc[0]
 return None if pd.isna(v) else v.strftime('%Y-%m-%d')
def records(df): return df.fillna('').to_dict('records')
paths={k:governed.latest_csv(p) for k,p in {'Jira':'All Jira Work Items marked PI Backlog (JIRA)_*.csv','Tempo':'RAW_DATA_FULL_ANALYSIS_*.csv','Capacity':'Weekly Capacity_*.csv','Assignees':'*Assignees*Capacit*.csv','Master Date':'*Master*Date*.csv','Release Calendar':'Release Cycle*.csv'}.items()}
frames={k:pd.read_csv(p,dtype=str,keep_default_na=False,low_memory=False) for k,p in paths.items()}
jira,excluded_jira=partition_governed_issue_rows(frames['Jira'],'Issue key')
tempo,excluded_tempo=partition_governed_issue_rows(frames['Tempo'],'Work Item Key')
ass=frames['Assignees']; lookup=governed.build_assignee_name_lookup(ass)
team_by_name=dict(zip(ass.Assignee,ass.Team)); teams=sorted(set(ass.Team)-{''})
tempo['person']=governed.canonicalize_assignee_series(tempo['Full name'],lookup)
tempo['date']=pd.to_datetime(tempo['Work date'],errors='coerce')
valid_tempo=tempo[tempo.date.notna()].copy()
valid_tempo['hours']=pd.to_numeric(valid_tempo['Logged Hours'],errors='coerce')
valid_tempo['team']=valid_tempo.person.map(team_by_name).fillna('')
managed_tempo=valid_tempo[valid_tempo.team.ne('')]
customer_sets=defaultdict(set); account_sets=defaultdict(set)
for r in records(valid_tempo):
 k=txt(r['Work Item Key']).upper()
 if txt(r['Account Customer']): customer_sets[k].add(txt(r['Account Customer']))
 if txt(r['Account Name']): account_sets[k].add(txt(r['Account Name']))
direct=managed_tempo.groupby('Work Item Key').hours.sum().to_dict()
contributors=managed_tempo.groupby('Work Item Key').team.apply(lambda x:', '.join(sorted(set(x)))).to_dict()
bykey={txt(r['Issue key']).upper():r for r in records(jira)}
assert len(bykey)==len(jira), 'Duplicate Jira keys require resolution'
parent_cols=[c for c in jira if c in ['Parent key','Custom field (Parent ticket)','Custom field (Epic Link)','Epic Link'] or c.startswith('Custom field (Parent ticket).') or c.startswith('Custom field (Epic Link).')]
parents={k:governed.first_available(pd.Series(r),parent_cols).upper() for k,r in bykey.items()}
children=defaultdict(list)
for k,p in parents.items():
 if p: children[p].append(k)
epic_types={'epic','epic lab','epic release'}
epic_keys={k for k,r in bykey.items() if r['Issue Type'].casefold() in epic_types}
def epic_for(k):
 seen=set()
 while k in bykey and k not in seen:
  seen.add(k)
  if k in epic_keys:return k
  k=parents.get(k,'')
 return ''
def ancestors(k):
 seen={k}; out=[]; p=parents.get(k,'')
 while p and p not in seen:
  seen.add(p);out.append(p);p=parents.get(p,'')
 return out
workflow_map={}
groups={'Demand':['backlog','oat - idea','oat-idea','placeholder'],'DoR':['to do','analysis & prepare development','oat - ready for pi'],'DoD':['in refinement','in progress','in development','in uat / beta','in review','testing','waiting for test','reviewed','waiting for review','ready for development','test complete','handoff for customer testing','in qa'],'Done':['done','closed','resolved'],'Discontinued':['cancelled','canceled','rejected','abandoned'],'Blocked':['blocked','on hold','pending']}
for stage,statuses in groups.items():
 for status in statuses:workflow_map[status]=stage
def client(k):
 vals=customer_sets[k]
 return (next(iter(vals)),'Direct Tempo Work Item Key → Account Customer') if len(vals)==1 else ('-','Ambiguous direct Tempo customers' if vals else 'No verified Tempo Customer Account link')
def terminal(r):return r['Status'].strip().casefold() in {'done','closed','cancelled','canceled','rejected','abandoned','resolved'} or txt(r.get('Status category')).casefold()=='done'
# The current source implementation has no child-first Remaining Estimate resolver.
# Quarantine mixed positive-estimate related records rather than invent one.
mixed=set(); mixed_pairs=[]
for k,r in bykey.items():
 if terminal(r) or not (hrs(r['Remaining Estimate']) or 0)>0:continue
 for a in ancestors(k):
  if a in bykey and not terminal(bykey[a]) and (hrs(bykey[a]['Remaining Estimate']) or 0)>0:
   mixed.update([k,a]);mixed_pairs.append([a,k])
release=[]
for r in records(frames['Release Calendar']):
 s=pd.to_datetime(r['Start Date'],dayfirst=True);e=pd.to_datetime(r['End Date'],dayfirst=True)
 release.append({'name':r['Release Cycle'],'start':s.strftime('%Y-%m-%d'),'end':e.strftime('%Y-%m-%d'),'state':'Historical' if e<DATE else 'Current / future'})
release.sort(key=lambda r:r['start']);relmap={r['name']:r for r in release}
epics=[]; detail=[]
for k,r in bykey.items():
 c,prov=client(k); target=txt(r['Custom field (Target Release)']);due=dt(r['Due date']);rem=hrs(r['Remaining Estimate']);orig=hrs(r['Original estimate']);p=parents[k]
 period=target or ('N/A' if target=='N/A' else 'Unresolved');basis='Planning exception'
 rr=relmap.get(target)
 if rr and rr['end']>=DATE.strftime('%Y-%m-%d'):period=target;basis='Target Release'
 elif due and due>DATE.strftime('%Y-%m-%d'):period=due;basis='Due date (backport)' if rr else 'Due date'
 elif target=='N/A':period='N/A'
 elif rr: basis='Historical release unresolved'
 elif target:basis='Invalid Target Release'
 team=txt(r.get('Team Name'));quality=[]
 if c=='-':quality.append(prov)
 if not team:quality.append('Missing demand allocation')
 elif team not in teams:quality.append('Allocation outside managed teams')
 if rem is None:quality.append('Missing Remaining Estimate')
 if p and p not in bykey:quality.append('Parent absent from restricted Jira extract')
 if k in mixed:quality.append('Mixed-level estimate selection unresolved')
 if basis in ['Planning exception','Historical release unresolved','Invalid Target Release']:quality.append(basis)
 if txt(r['Due date']) and not due:quality.append('Invalid Due Date')
 if terminal(r): included=0;reason='Excluded: terminal status'
 elif rem is None:included=None;reason='Unquantified: missing Remaining Estimate'
 elif rem<0:included=None;reason='Withheld: negative Remaining Estimate'
 elif k in mixed:included=None;reason='Withheld: no approved child-first contributor resolver'
 elif basis not in ['Target Release','Due date','Due date (backport)']:included=0;reason='Excluded: unresolved or historical planning'
 else:included=rem;reason='Included: own Remaining Estimate; no positive ancestor/descendant overlap in extract'
 e=epic_for(k)
 detail.append([c,e or '-',k,p or '-',r['Issue Type'],r['Summary'],r['Status'],team or '-',orig,rem,target or '-',due,period,basis,included,reason,'; '.join(quality) or '-',hrs(r.get('Σ Original Estimate')),hrs(r.get('Σ Remaining Estimate')),prov,', '.join(sorted(account_sets[k])) or '-',1 if rem is None else 0,1 if not team else 0,1 if k in mixed else 0,1 if team in teams else 0])
 if k in epic_keys:
  epics.append([c,k,r['Summary'],txt(r['Custom field (Promoter)']) or '-',workflow_map.get(r['Status'].strip().casefold(),'Unmapped'),r['Status'],target or '-',due,float(direct.get(k,0)),dt(r.get('Custom field (Start date)')),contributors.get(k,'-'),num(r['Custom field (Effort CAP (hrs))']),orig,prov,r['Issue Type']])
epics.sort(key=lambda x:(list(groups).index(x[4]) if x[4] in groups else 6,x[0],x[1]))
detail.sort(key=lambda x:x[2])
master=frames['Master Date'].copy();master['date']=pd.to_datetime(master['Master Date'],dayfirst=True,errors='coerce');master['week']=pd.to_numeric(master['Week Number'],errors='coerce')
cap=frames['Capacity'].copy();cap['person']=governed.canonicalize_assignee_series(cap['Assignee'],lookup);cap['team']=cap.person.map(team_by_name).fillna('');cap['week']=pd.to_numeric(cap['Week Number'],errors='coerce');cap['hours']=pd.to_numeric(cap['Planned Hours'],errors='coerce')
valid_cap=cap[cap.Assignee.ne('') & cap.week.notna() & cap.hours.notna() & cap.team.ne('')].copy()
assert not valid_cap.duplicated(['person','week']).any(), 'Duplicate managed capacity person/week'
caps=[]
for rel in release:
 md=master[(master.date>=rel['start'])&(master.date<=rel['end'])];weeks=set(md.week.dropna().astype(int))
 year_ok=rel['start']>='2026-01-01' and rel['end']<='2026-12-31'
 for team in teams:
  z=valid_cap[(valid_cap.team==team)&valid_cap.week.isin(weeks)] if year_ok else valid_cap.iloc[0:0]
  expected=len(ass[ass.Team==team])*len(weeks)
  coverage='Complete' if len(z)==expected and expected else ('Partial roster' if len(z) else 'Missing capacity')
  caps.append([rel['name'],team,float(z.hours.sum()) if len(z) else None,len(z),expected,coverage,', '.join(map(str,sorted(weeks))),2026 if year_ok else None])
clients=sorted(set(x[0] for x in epics));counts=Counter(x[4] for x in epics)
source_rows=[]
for k,p in paths.items():
 source_rows.append([k,p.name,governed.parse_export_date(p).strftime('%Y-%m-%d') if k in ['Jira','Tempo','Capacity','Assignees'] else 'Undated source',len(frames[k]),hashlib.sha256(p.read_bytes()).hexdigest()])
provenance=[]
for p in list((ROOT/'docs/governance').glob('*.md'))+[ROOT/'BASELINE_v0.16_2026-08-26.txt',ROOT/'scripts/build_web_data.py',ROOT/'web/demand.js',ROOT/'scripts/governed_exclusions.py']:
 provenance.append([str(p.relative_to(ROOT)),hashlib.sha256(p.read_bytes()).hexdigest()])
metrics={'epics':len(epics),'jira':len(detail),'workflow':dict(counts),'missingClients':sum(x[0]=='-' for x in epics),'ambiguousClients':sum(len(customer_sets[x[1]])>1 for x in epics),'missingEstimates':sum(x[9] is None for x in detail),'missingAllocations':sum(x[7]=='-' for x in detail),'mixedRecords':len(mixed),'mixedPairs':len(mixed_pairs),'missingParents':sum(bool(p) and p not in bykey for p in parents.values()),'malformedCapacity':int(len(cap)-len(cap[cap.Assignee.ne('') & cap.week.notna() & cap.hours.notna()])),'validCapacity':len(valid_cap),'directHours':sum(x[8] for x in epics),'includedHours':sum(x[14] or 0 for x in detail),'tempoStart':valid_tempo.date.min().strftime('%Y-%m-%d'),'tempoEnd':valid_tempo.date.max().strftime('%Y-%m-%d'),'managedPeople':len(ass),'capacityPeople':valid_cap.person.nunique()}
data={'date':'2026-10-22','epics':epics,'detail':detail,'clients':clients,'teams':teams,'releases':release,'capacity':caps,'sources':source_rows,'provenance':provenance,'metrics':metrics,'mixedPairs':mixed_pairs,'defaultRelease':next(r['name'] for r in release if r['end']>='2026-10-22')}
(OUT/'report_data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
assert len({x[1] for x in epics})==len(epics)
assert sum(counts.values())==len(epics)
assert abs(metrics['directHours']-float(managed_tempo[managed_tempo['Work Item Key'].isin(epic_keys)].hours.sum()))<1e-7
print(json.dumps(metrics,indent=2))
