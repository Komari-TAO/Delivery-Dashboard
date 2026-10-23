"""Independent source/result reconciliation and final OOXML checks; never writes inputs."""
import json,hashlib,zipfile,xml.etree.ElementTree as E,subprocess,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];WORK=Path(__file__).resolve().parent;OUT=ROOT/'outputs/client_delivery_20261022'
d=json.loads((OUT/'report_data.json').read_text(encoding='utf-8'))
tests=json.loads((OUT/'native_excel_tests.json').read_text(encoding='utf-8-sig'))
def close(a,b):assert math.isclose(float(a),float(b),abs_tol=1e-6),(a,b)
for t in tests:
 if t['case']!='Release selection':continue
 rel=t['release'];detail=[r for r in d['detail'] if r[12]==rel]
 capacity={r[1]:r[2] for r in d['capacity'] if r[0]==rel}
 expected_assigned=sum((r[14] or 0) for r in detail if r[24])
 expected_unallocated=sum((r[14] or 0) for r in detail if r[22])
 expected_outside=sum((r[14] or 0) for r in detail if not r[24] and not r[22])
 metrics=t['metrics'];close(metrics[1],expected_assigned);close(metrics[4],expected_unallocated);close(metrics[7],expected_outside)
 close(metrics[5],sum(r[21] for r in detail));close(metrics[6],sum(r[23] for r in detail))
 vals=[v for v in capacity.values() if v is not None]
 if vals:close(metrics[0],sum(vals));close(metrics[2],sum(vals)-expected_assigned);close(metrics[3],expected_assigned/sum(vals))
 else:assert metrics[0]==metrics[2]==metrics[3]=='-'
 assert {r[0] for r in t['teams']}==set(d['teams'])
 gaps=[]
 for row in t['teams']:
  team=row[0];amount=sum((r[14] or 0) for r in detail if r[7]==team);close(row[2],amount)
  if capacity[team] is None:assert row[1]==row[3]==row[4]=='-'
  else:
   v=capacity[team];close(row[1],v);close(row[4],v-amount);close(row[5],min(v,amount));close(row[6],max(v-amount,0));close(row[7],max(amount-v,0));gaps.append(row[4])
   if v:close(row[3],amount/v)
   else:assert row[3]=='-'
  close(row[8],sum(r[21] for r in detail if r[7]==team));close(row[9],sum(r[23] for r in detail if r[7]==team))
 assert gaps==sorted(gaps)
assert next(t for t in tests if t['case']=='Zero capacity')['load']=='-'
assert next(t for t in tests if t['case']=='Demand overload')['firstTeam']=='Nexus'
final=next(t for t in tests if t['case']=='Final file')
assert final['hyperlinks']==len(d['epics']) and final['chartSeries']==3 and not final['formulaErrors']
path=OUT/'Client_Delivery_Status_and_Demand_2026-10-22.xlsx';z=zipfile.ZipFile(path)
assert z.testzip() is None
N={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main','r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
wb=E.fromstring(z.read('xl/workbook.xml'));sheets=wb.findall('s:sheets/s:sheet',N)
assert [s.attrib['name'] for s in sheets if s.attrib.get('state','visible')=='visible']==['Executive summary','Client workflow','Epic register','Demand and capacity','Demand detail','Controls and checks']
errors=[];formulas=0;cached=0
for name in z.namelist():
 if name.endswith('.xml'):E.fromstring(z.read(name))
 if re_sheet:= (name.startswith('xl/worksheets/sheet') and name.endswith('.xml')):
  tree=E.fromstring(z.read(name))
  for cell in tree.findall('.//s:sheetData/s:row/s:c',N):
   if cell.attrib.get('t')=='e':errors.append((name,cell.attrib['r']))
   if cell.find('s:f',N) is not None:
    formulas+=1
    if cell.find('s:v',N) is not None:cached+=1
assert not errors and formulas==cached
cap=E.fromstring(z.read('xl/worksheets/sheet4.xml'));assert len([e for e in cap.iter() if e.tag.endswith('}dataValidation')])==1
assert cap.find('s:autoFilter',N) is None
assert not any(n.startswith('xl/externalLinks/') or n.endswith('vbaProject.bin') for n in z.namelist())
ep=E.fromstring(z.read('xl/worksheets/sheet3.xml'));outlined=ep.findall('.//s:row[@outlineLevel="1"]',N);assert len(outlined)==len(d['epics'])
assert len(ep.findall('s:hyperlinks/s:hyperlink',N))==len(d['epics'])
original=json.loads((WORK/'initial_files.json').read_text(encoding='utf-8-sig'))
changed=[r['path'] for r in original if not Path(r['path']).exists() or hashlib.sha256(Path(r['path']).read_bytes()).hexdigest().lower()!=r['sha256'].lower()]
assert not changed,changed
current=subprocess.check_output(['git','status','--porcelain=v1'],cwd=ROOT,text=True)
(OUT/'final_git_status.txt').write_text(current,encoding='utf-8')
validation={'status':'PASS for executed arithmetic and workbook checks; PARTIAL business coverage','uniqueEpics':len(d['epics']),'uniqueJiraItems':len(d['detail']),'releaseSelectionsReconciled':3,'zeroCapacityAndOverloadTests':'PASS in native Excel','cachedFormulas':cached,'formulaErrors':errors,'existingProjectFilesHashChecked':len(original),'existingFilesChanged':changed,'visibleSheets':final['visibleSheets'],'knownLimitations':['Restricted PI Backlog Jira inventory, no full hierarchy export','No approved child-first / parent-fallback resolver; 19 mixed-level records withheld','165 Epic clients unresolved; 346 estimates missing; 2064 delivery allocations absent','Weekly capacity covers 38 of 60 managed people, 6 of 10 teams, 2026 only'],'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
(OUT/'validation.json').write_text(json.dumps(validation,indent=2),encoding='utf-8');print(json.dumps(validation,indent=2))
