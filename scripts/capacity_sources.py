"""Explicit six-team source import and separate planned-capacity reconciliation.

Annual allocations are supplied gross values. Weekly development is authoritative;
support is already deducted from it. No net Engineering or absence rule is inferred.
"""
import csv
import hashlib
import json
import math
from pathlib import Path

import pandas as pd

TEAMS = {'Authoring', 'Delivery Express', 'Integration', 'Nexus', 'Portal', 'Scoring'}
FILES = {
    'Assignees master': '20261028_Assignees_Capacity.csv',
    'Weekly capacity': 'Weekly Capacity_20261028.csv',
    'Support reservations': 'Support hours 2026.csv',
    'Tempo worklogs': 'RAW_DATA_FULL_ANALYSIS_01_Jan_26_30_Oct_26.csv',
    'Jira PI backlog': 'All Jira Work Items marked PI Backlog (JIRA)_20261030.csv',
}
YEAR = 2026  # Declared source scope, validated against Master Date below.

def amount(value):
    value = str(value).strip().replace(',', '')
    result = float(value)
    if not math.isfinite(result) or result < 0:
        raise ValueError(f'Invalid nonnegative hours: {value}')
    return result

def read(path):
    with path.open(encoding='utf-8-sig', newline='') as f:
        return list(csv.DictReader(f))

def identifier(value):
    value = str(value).strip()
    if not value or not value.isdigit():
        raise ValueError(f'Invalid Assignee ID: {value!r}')
    return value

def load(root, compare_recovery=False):
    raw = root / 'data/raw'
    sources = [{ 'role': role, 'file': name, 'sha256': hashlib.sha256((raw/name).read_bytes()).hexdigest().upper() } for role,name in FILES.items()]
    all_people = read(raw/FILES['Assignees master'])
    roster = [r for r in all_people if r['Team'] in TEAMS]
    people = {}
    for r in roster:
        key = identifier(r['Assignee ID'])
        amount(r['Actual Annual Hours'])
        if amount(r['Availability'].strip('%')) > 100:
            raise ValueError(f'Invalid availability: {key}')
        if key in people:
            raise ValueError(f'Conflicting/duplicate canonical ID: {key}')
        people[key] = r
    if len({r['Assignee'] for r in roster}) != len(roster):
        raise ValueError('Canonical names are not unique')
    engineering = {}
    for r in all_people:
        if r['Team'] == 'Engineering' and r['Assignee ID'] in people:
            key = identifier(r['Assignee ID'])
            if key in engineering:
                raise ValueError(f'Duplicate Engineering allocation: {key}')
            engineering[key] = r
    master = read(raw/'Google 2026 to 2028_Master_Date.csv')
    dates = {}
    for r in master:
        date = pd.to_datetime(r['Master Date'], dayfirst=True)
        if date.year == YEAR:
            dates.setdefault(int(r['Week Number']), []).append(date)
    development, quarantine, date_issues = [], [], []
    artifacts = 0
    seen = set()
    for line,r in enumerate(read(raw/FILES['Weekly capacity']),2):
        # Export padding has no person, week or planned measure; other partial
        # records carry meaningful data and must be quarantined, not coalesced.
        if not any(r.get(k,'').strip() for k in ['Assignee','Week Number','Planned Hours']):
            artifacts += 1
            continue
        try:
            key = identifier(r['Assignee ID'])
            if key not in people or r['Team'] != people[key]['Team'] or r['Assignee'] != people[key]['Assignee']:
                raise ValueError('Person/team/name outside canonical roster or mismatched')
            week = int(r['Week Number'])
            if str(week) != r['Week Number'].strip() or week not in dates:
                raise ValueError('Invalid Master Date week')
            hours = amount(r['Planned Hours']) if r['Planned Hours'].strip() else None
            identity = (key,YEAR,week)
            if identity in seen:
                raise ValueError('Duplicate person/year/week')
            seen.add(identity)
            # User-confirmed annual planned-capacity convention: blank means
            # zero. Keep the original cell for protected legacy panel payloads.
            p = people[key]
            start = pd.to_datetime(p['Capacity Start Date'],dayfirst=True) if p['Capacity Start Date'] else None
            end = pd.to_datetime(p['Capacity End Date'],dayfirst=True) if p['Capacity End Date'] else None
            outside = [d for d in dates[week] if (start is not None and d < start) or (end is not None and d > end)]
            if hours and outside:
                date_issues.append({'assigneeId':key,'person':p['Assignee'],'week':week,'hours':hours,'start':p['Capacity Start Date'],'end':p['Capacity End Date'],'outsideDates':[d.strftime('%Y-%m-%d') for d in outside], 'kind':'Entire week outside dates' if len(outside)==len(dates[week]) else 'Boundary week intersects dates'})
            development.append({**r,'year':YEAR})
        except (ValueError, KeyError) as e:
            quarantine.append({'line':line,'reason':str(e),'row':r})
    with (raw/FILES['Support reservations']).open(encoding='utf-8-sig',newline='') as f:
        support_rows = list(csv.reader(f))
    weeks = [int(w) for w in support_rows[0][5:]]
    if len(set(weeks)) != len(weeks) or not set(weeks).issubset(dates):
        raise ValueError('Invalid support week columns')
    support, support_people, footer = [], set(), None
    for line,r in enumerate(support_rows[2:],3):
        if not any(r): continue
        if r[3].strip() == 'Total':
            if footer is not None: raise ValueError('Duplicate support footer')
            footer = amount(r[4]); continue
        key = identifier(r[1])
        if key not in people or key in support_people or r[0] != people[key]['Team']:
            raise ValueError(f'Invalid/duplicate support person on line {line}')
        support_people.add(key)
        values = [amount(v) if v.strip() else 0.0 for v in r[5:]]
        if len(values)!=len(weeks) or abs(sum(values)-amount(r[4]))>1e-7:
            raise ValueError(f'Support annual/weekly mismatch: {key}')
        support.extend({'assigneeId':key,'year':YEAR,'week':w,'support':v} for w,v in zip(weeks,values))
    total_support = sum(r['support'] for r in support)
    if footer is None or abs(total_support-footer)>1e-7: raise ValueError('Support footer mismatch')
    dev_by = {(r['Assignee ID'],int(r['Week Number'])):amount(r['Planned Hours']) if r['Planned Hours'].strip() else 0.0 for r in development}
    support_by = {(r['assigneeId'],r['week']):r['support'] for r in support}
    detail, reconciliation, support_exceptions = [], [], []
    for key,p in people.items():
        eng = engineering.get(key)
        for w in sorted(dates):
            dev = dev_by.get((key,w))
            sup = support_by.get((key,w),0.0)  # non-listed people have no reservations
            row = {'assigneeId':key,'person':p['Assignee'],'team':p['Team'],'year':YEAR,'week':w,'development':dev,'support':sup,'combined':None if dev is None else dev+sup,'engineeringNet':None,'hasEngineeringAllocation':eng is not None}
            detail.append(row)
            if sup and not ((sup==40 and dev==0) or (sup==20 and dev==20)):
                support_exceptions.append(row)
        own = [r for r in detail if r['assigneeId']==key]
        gross = amount(p['Actual Annual Hours']); gross_eng = amount(eng['Actual Annual Hours']) if eng else None
        dev_total = sum(r['development'] or 0 for r in own)
        sup_total = sum(r['support'] for r in own)
        reconciliation.append({'assigneeId':key,'person':p['Assignee'],'team':p['Team'],'developmentAvailability':p['Availability'],'capacityStart':p['Capacity Start Date'],'capacityEnd':p['Capacity End Date'],'grossDevelopment':gross,'grossEngineering':gross_eng,'combinedGross':gross+(gross_eng or 0),'weeklyDevelopment':dev_total,'weeklySupport':sup_total,'developmentPlusSupport':dev_total+sup_total,'absenceDeductions':None,'netEngineering':None,'developmentResidualUnexplained':gross-dev_total-sup_total,'missingDevelopmentWeeks':sum(r['development'] is None for r in own),'engineeringPercentDiagnostic':None if not eng else amount(p['Annual Hours'])*amount(eng['Availability'].strip('%'))/100,'notes':'No absence/net Engineering source. Residual is not absence. Engineering/support overlap unresolved.' if eng else 'No Engineering allocation row; net Engineering unavailable. Residual is not absence.'})
    recovery = {r['Assignee']:r for r in read(raw/'rollback-single-team.csv')} if compare_recovery else {}
    differences = []
    for r in roster:
        if not compare_recovery: continue
        old = recovery.get(r['Assignee'],{})
        fields = ['Team','Role','Skill','Availability','Actual Annual Hours','Capacity Start Date','Capacity End Date']
        diff = {k:{'recovery':old.get(k),'supplied':r[k]} for k in fields if old.get(k)!=r[k]}
        if diff: differences.append({'person':r['Assignee'],'differences':diff})
    report = {'year':YEAR,'sources':sources,'canonicalPeople':len(people),'engineeringPeople':len(engineering),'developmentRows':len(development),'excludedExportArtifacts':artifacts,'quarantine':quarantine,'capacityDateIssues':date_issues,'supportPeople':len(support_people),'supportFooter':footer,'supportExceptions':support_exceptions,'rosterDifferences':differences,'totals':{k:sum(r[k] or 0 for r in reconciliation) for k in ['grossDevelopment','grossEngineering','combinedGross','weeklyDevelopment','weeklySupport','developmentPlusSupport']},'netEngineering':None,'absenceDeductions':None,'people':reconciliation,'weekly':detail}
    report['engineeringAllocations'] = list(engineering.values())
    report['blankPlannedHoursAsZero'] = sum(not r['Planned Hours'].strip() for r in development)
    for row in reconciliation:
        p = people[row['assigneeId']]
        row['developmentPercentDiagnostic'] = amount(p['Annual Hours'])*amount(p['Availability'].strip('%'))/100
        row['developmentSuppliedMinusPercentDiagnostic'] = row['grossDevelopment']-row['developmentPercentDiagnostic']
        row['engineeringSuppliedMinusPercentDiagnostic'] = None if row['grossEngineering'] is None else row['grossEngineering']-row['engineeringPercentDiagnostic']
    report['limitations'] = ['Gross annual allocations are not net capacity. No absence/leave source or net Engineering schedule supplied.', 'Blank weekly planned hours mean zero under the confirmed annual capacity rule; protected Demand Capacity Coverage retains its existing source-cell treatment.', 'Capacity dates are checked against week boundaries only; no daily proration rule introduced.', 'Support is already deducted from Development. Actual hours are not split by reservations.', 'Percentage diagnostics are not authoritative recomputations; supplied joiner/leaver adjustments and rounding remain unchanged.']
    return pd.DataFrame(roster), pd.DataFrame(development), report

def write_reports(root, report):
    out = root/'outputs/capacity_reconciliation_20261030'
    out.mkdir(parents=True,exist_ok=True)
    (out/'reconciliation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    for key in ['people','weekly','rosterDifferences','capacityDateIssues','quarantine']:
        pd.DataFrame(report[key]).to_csv(out/f'{key}.csv',index=False)
    (out/'source-manifest.json').write_text(json.dumps({'year':YEAR,'yearBasis':'Declared 2026 source scope and Master Date calendar','sources':report['sources']},indent=2),encoding='utf-8')
    return out

if __name__ == '__main__':
    root = Path(__file__).resolve().parents[1]
    _,_,report = load(root, compare_recovery=True)
    print(write_reports(root,report))
    print(json.dumps({k:v for k,v in report.items() if k not in ['sources','people','weekly','rosterDifferences','capacityDateIssues','quarantine']},indent=2))
    print('Date issues:',len(report['capacityDateIssues']),'Quarantine:',len(report['quarantine']))
