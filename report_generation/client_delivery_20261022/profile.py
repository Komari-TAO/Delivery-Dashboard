import os,json,hashlib,csv,subprocess
from pathlib import Path
r=Path.cwd(); w=r/'report_generation/client_delivery_20261022'
files=[]
for base in ['data','docs','scripts','web']:
 for p in (r/base).rglob('*'):
  if p.is_file() and '__pycache__' not in str(p): files.append(p)
files += [p for p in r.glob('*.*') if p.name != '.git' and p.is_file()]
a=[{'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]
(w/'initial_files.json').write_text(json.dumps(a,indent=2))
(w/'initial_git_status.txt').write_text(subprocess.check_output(['git','status','--porcelain=v1'],text=True))
for p in (r/'data/raw').glob('*.csv'):
 with p.open(encoding='utf-8-sig',newline='') as f:
  rows=list(csv.DictReader(f)); print(p.name,len(rows)); print(list(rows[0]));
  if 'JIRA' in p.name:
   from collections import Counter
   print('types',Counter(x['Issue Type'] for x in rows));print('teams',Counter(x.get('Team Name') for x in rows))
  if 'Assignees' in p.name: print('teams',sorted(set(x['Team'] for x in rows)))

