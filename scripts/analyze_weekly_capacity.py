from __future__ import annotations

import json
from datetime import datetime, date
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"
OUT = ROOT / "outputs" / "weekly_capacity_analysis.json"
TODAY = pd.Timestamp("2026-10-19")
EXCLUDED = {"TEMPO-54", "TEMPO-92", "TEMPO-106", "TEMPO-111", "TEMPO-112"}
TERMINAL = {"done", "closed", "rejected", "abandoned", "cancelled", "on hold"}

def newest(pattern):
    return max(RAW.glob(pattern), key=lambda p: p.stat().st_mtime)

def text(s): return s.fillna("").astype(str).str.strip()
def num(s): return pd.to_numeric(s.astype(str).str.replace(",", "", regex=False), errors="coerce")
def dparse(s): return pd.to_datetime(s, errors="coerce", dayfirst=True)
def master_parse(s): return pd.to_datetime(s, format="%d/%m/%Y", errors="coerce")
def clean(v):
    if pd.isna(v): return None
    if isinstance(v, (pd.Timestamp, datetime, date)): return v.strftime("%Y-%m-%d")
    if isinstance(v, float): return round(v, 4)
    return v
def records(df): return [{k: clean(v) for k,v in r.items()} for r in df.to_dict("records")]

assignee_p = newest("*Assignees*Capacit*.csv")
capacity_p = newest("Weekly Capacity_*.csv")
tempo_p = newest("RAW_DATA_FULL_ANALYSIS_*.csv")
jira_p = newest("All Jira Work Items marked PI Backlog (JIRA)_*.csv")
master_p = newest("*Master*Date*.csv")

assignees = pd.read_csv(assignee_p, low_memory=False)
capacity = pd.read_csv(capacity_p, low_memory=False)
tempo = pd.read_csv(tempo_p, low_memory=False)
jira = pd.read_csv(jira_p, low_memory=False)
master = pd.read_csv(master_p, low_memory=False)

master["date"] = master_parse(master["Master Date"])
week_rows = master.loc[master["date"].eq(TODAY)]
if week_rows.empty: raise ValueError("Current date not found in Master Date")
week_no = int(pd.to_numeric(week_rows.iloc[0]["Week Number"]))
this_week = master[(pd.to_numeric(master["Week Number"], errors="coerce").eq(week_no)) & master["date"].dt.year.eq(TODAY.year)].copy()
week_start, week_end = this_week["date"].min(), this_week["date"].max()

# Canonical people maps.
assignees["Assignee"] = text(assignees["Assignee"])
assignees = assignees[assignees["Assignee"].ne("")].drop_duplicates("Assignee")
people = assignees[["Team","Assignee","Role","Skill","Availability"]].copy()
people["AvailabilityPct"] = num(assignees["Availability"].astype(str).str.replace("%", "", regex=False)).fillna(0) / 100
people["Team"] = text(people["Team"]); people["Role"] = text(people["Role"]); people["Skill"] = text(people["Skill"])

capacity["Assignee"] = text(capacity["Assignee"])
capacity["Week"] = pd.to_numeric(capacity["Week Number"], errors="coerce")
capacity["Planned"] = num(capacity["Planned Hours"]).fillna(0)
cap_week = capacity[capacity["Week"].eq(week_no)].groupby("Assignee", as_index=False)["Planned"].sum()
matrix = people.merge(cap_week, on="Assignee", how="left")
matrix["Planned"] = matrix["Planned"].fillna(0)

# Worklogs are governed after exact normalized exclusions and mapped to canonical assignees.
tempo["Key"] = text(tempo["Work Item Key"]).str.upper()
tempo = tempo[~tempo["Key"].isin(EXCLUDED)].copy()
tempo["Date"] = pd.to_datetime(tempo["Work date"], errors="coerce")
tempo["Assignee"] = text(tempo["Full name"])
tempo["Hours"] = num(tempo["Logged Hours"]).fillna(0)
tempo_week = tempo[tempo["Date"].between(week_start, TODAY)].copy()
tempo_week["Operations"] = tempo_week["Key"].str.startswith("TEMPO-")
logs = tempo_week.groupby("Assignee").agg(
    Logged_Engineering=("Hours", lambda s: round(float(s[~tempo_week.loc[s.index,"Operations"]].sum()),4)),
    Logged_Operations=("Hours", lambda s: round(float(s[tempo_week.loc[s.index,"Operations"]].sum()),4)),
).reset_index()
matrix = matrix.merge(logs, on="Assignee", how="left")
matrix[["Logged_Engineering","Logged_Operations"]] = matrix[["Logged_Engineering","Logged_Operations"]].fillna(0)
matrix["Logged_Total"] = matrix["Logged_Engineering"] + matrix["Logged_Operations"]
matrix["Remaining_Capacity"] = matrix["Planned"] - matrix["Logged_Total"]
matrix["Utilization"] = matrix.apply(lambda r: r.Logged_Total/r.Planned if r.Planned else None, axis=1)

# Jira column names are kept flexible because the raw export is a Jira field dump.
cols = {c.lower().strip(): c for c in jira.columns}
def col(*names):
    for n in names:
        if n.lower() in cols: return cols[n.lower()]
    return None
keyc=col("Issue key","Key"); summaryc=col("Summary"); typec=col("Issue Type"); parentc=col("Parent Key","Parent"); statusc=col("Status"); priorityc=col("Priority")
assigneec=col("Assignee"); teamc=col("Team","Jira Team","Team Name","Custom field (Scrum Team)"); origc=col("Original estimate","Original Estimate Hours"); remc=col("Remaining Estimate","Remaining Estimate Hours")
duec=col("Due Date","Due"); targetc=col("Target Release"); releasec=col("Fix Version","Delivery","Release Cycle")
def field(c): return text(jira[c]) if c else pd.Series("",index=jira.index)
items = pd.DataFrame({
    "Issue Key": field(keyc).str.upper(), "Summary": field(summaryc), "Issue Type": field(typec), "Parent Key": field(parentc).str.upper(),
    "Status": field(statusc), "Priority": field(priorityc), "Jira Assignee": field(assigneec), "Jira Team": field(teamc),
    "Original Estimate (h)": num(jira[origc]).fillna(0) / 3600 if origc else 0, "Remaining Estimate (h)": num(jira[remc]).fillna(0) / 3600 if remc else 0,
    "Due Date": dparse(jira[duec]) if duec else pd.NaT, "Target Release": field(targetc), "Delivery / Release Cycle": field(releasec),
})
items = items[items["Issue Key"].ne("") & ~items["Issue Key"].isin(EXCLUDED)].drop_duplicates("Issue Key")
items["Canonical Assignee"] = items["Jira Assignee"].where(items["Jira Assignee"].isin(set(people.Assignee)), "")
items = items.merge(people[["Assignee","Team"]].rename(columns={"Assignee":"Canonical Assignee","Team":"Workforce Team"}), on="Canonical Assignee", how="left")
items["Workforce Team"] = items["Workforce Team"].fillna("")
items["Terminal"] = items["Status"].str.casefold().isin(TERMINAL)
items["Attributable"] = items["Canonical Assignee"].ne("") | items["Workforce Team"].ne("") | items["Jira Team"].ne("")
items = items[items["Attributable"] & ~items["Terminal"]].copy()
wl_by_key = tempo_week.groupby("Key").Hours.sum()
last_by_key = tempo.groupby("Key").Date.max()
items["Current Week Logged (h)"] = items["Issue Key"].map(wl_by_key).fillna(0)
items["Last Worklog Date"] = items["Issue Key"].map(last_by_key)
items["Ownership Classification"] = items.apply(lambda r: "Assigned individual workload" if r["Canonical Assignee"] else "Team-owned but unassigned workload" if r["Jira Team"] else "Missing or unclear ownership", axis=1)
items["Weekly Allocation"] = "Unscheduled / Weekly allocation unknown"
items["Workload Classification"] = items.apply(lambda r: "Active workload with no current-week estimate" if r["Current Week Logged (h)"]>0 else "Open workload",axis=1)
items["Attribution Evidence"] = items.apply(lambda r: "Governed assignee mapping" if r["Canonical Assignee"] else "Jira ownership only; workforce Team not inferred",axis=1)

# Prevent parent/child double count: where an item has parent present in selected open population, leave estimate uncounted pending hierarchy confirmation.
parent_keys=set(items["Parent Key"])
items["Parent/Child Estimate Overlap"] = items["Issue Key"].isin(parent_keys)
items["Counted Outstanding Estimate (h)"] = items.apply(lambda r: 0 if r["Parent/Child Estimate Overlap"] else r["Remaining Estimate (h)"],axis=1)

per = items[items["Canonical Assignee"].ne("")].groupby("Canonical Assignee").agg(
    Assigned_Open_Tickets=("Issue Key","nunique"), Outstanding_Estimate=("Counted Outstanding Estimate (h)","sum"),
    Unscheduled_Work_Items=("Issue Key","nunique"), Missing_Estimates=("Remaining Estimate (h)",lambda x:int((x<=0).sum()))
).reset_index().rename(columns={"Canonical Assignee":"Assignee"})
matrix = matrix.merge(per,on="Assignee",how="left")
for c in ["Assigned_Open_Tickets","Outstanding_Estimate","Unscheduled_Work_Items","Missing_Estimates"]: matrix[c]=matrix[c].fillna(0)
matrix["Confirmed Weekly Commitment (h)"] = None
matrix["Potential Additional Capacity (h)"] = None
matrix["Allocation Assessment"] = matrix.apply(lambda r: "Over Capacity" if r.Remaining_Capacity<0 else "Requires Review",axis=1)
matrix["Data Quality Notes"] = matrix.apply(lambda r: "No planned capacity" if r.Planned==0 else "Weekly allocation unsupported; planning confirmation required" if r.Unscheduled_Work_Items>0 else "No current-week source coverage; additional-assignment availability cannot be confirmed",axis=1)

team_unassigned = items[(items["Canonical Assignee"].eq("")) & (items["Workforce Team"].ne(""))].groupby("Workforce Team").agg(Open_Team_Unassigned_Tickets=("Issue Key","nunique")).reset_index().rename(columns={"Workforce Team":"Team"})
team = matrix.groupby(["Team","Skill"],dropna=False).agg(
    Governed_Assignees=("Assignee","nunique"), Weekly_Capacity=("Planned","sum"), Logged_Engineering=("Logged_Engineering","sum"), Logged_Operations=("Logged_Operations","sum"), Logged_Total=("Logged_Total","sum"), Remaining_Capacity=("Remaining_Capacity","sum"), Open_Assigned_Tickets=("Assigned_Open_Tickets","sum"), Assignees_Requires_Review=("Allocation Assessment",lambda s:int((s=="Requires Review").sum()))
).reset_index()
team = team.merge(team_unassigned,on="Team",how="left"); team["Open_Team_Unassigned_Tickets"]=team["Open_Team_Unassigned_Tickets"].fillna(0)
team["Confirmed Weekly Commitment (h)"]=None; team["Potential Additional Capacity (h)"]=None
team["Overall Skill Capacity Assessment"] = team.apply(lambda r: "Requires review" if r.Assignees_Requires_Review or r.Open_Team_Unassigned_Tickets else "No confirmed availability",axis=1)

exceptions=[]
for _,r in matrix.iterrows():
    if not r["Skill"]: exceptions.append(["",r.Assignee,r.Team,"Missing skill","Add governed skill in Assignees source"])
    if r.Planned==0: exceptions.append(["",r.Assignee,r.Team,"Missing or zero weekly capacity","Confirm capacity; excluded from available capacity"])
    if r.Unscheduled_Work_Items: exceptions.append(["",r.Assignee,r.Team,"Unreliable weekly workload allocation",f"{int(r.Unscheduled_Work_Items)} open assigned item(s); confirm weekly commitment"])
for _,r in items.iterrows():
    if not r["Canonical Assignee"]: exceptions.append([r["Issue Key"],"",r["Workforce Team"],"Unassigned work item / unclear workforce ownership","Validate Jira ownership and assign through planning"])
    if r["Remaining Estimate (h)"]<=0: exceptions.append([r["Issue Key"],r["Canonical Assignee"],r["Workforce Team"],"Missing or zero estimate","Add or validate remaining estimate"])
    if pd.isna(r["Due Date"]): exceptions.append([r["Issue Key"],r["Canonical Assignee"],r["Workforce Team"],"Missing planning date","Confirm due date or weekly allocation"])
    if r["Parent/Child Estimate Overlap"]: exceptions.append([r["Issue Key"],r["Canonical Assignee"],r["Workforce Team"],"Parent/child estimate overlap","Validate hierarchy estimate ownership before totaling"])
exceptions += [["", "", "", "Stale source data", "Tempo/Jira/Weekly Capacity exports are dated 2026-10-16; report cutoff is 2026-10-19."], ["", "", "", "Jira inventory coverage", "Only PI Backlog-labelled Jira export is available; complete Jira inventory cannot be confirmed."]]
exc=pd.DataFrame(exceptions,columns=["Issue Key","Assignee","Team","Exception Type","Recommended Validation Action"])

method=[
    ["Report generation", "2026-10-19 (Europe/Madrid); cutoff 2026-10-19"], ["Master Date reporting week", f"Week {week_no}: {week_start:%Y-%m-%d} to {week_end:%Y-%m-%d}"],
    ["Sources", f"Tempo: {tempo_p.name}; Jira: {jira_p.name}; Weekly Capacity: {capacity_p.name}; Assignees: {assignee_p.name}; Master Date: {master_p.name}"],
    ["Source snapshot dates", "Tempo, Jira, and Weekly Capacity filenames are dated 2026-10-16. Assignees is dated 2026-10-09. Current-day coverage is not established."],
    ["Governance reviewed", "MVP_Business_Rules.md; KPI_Definitions.md; Data_Dictionary.md; Semantic_Visualization_Governance.md; BASELINE_v0.16_2026-08-26.txt"],
    ["Exclusions", "Exact normalized: TEMPO-54, TEMPO-92, TEMPO-106, TEMPO-111, TEMPO-112."],
    ["Inclusion and mapping", "Capacity is from Weekly Capacity. Workforce team, role and skill are from Assignees. Tempo uses Full name mapped only when canonical. Jira is limited to current PI Backlog export."],
    ["Status handling", "Excluded terminal statuses: Done, Closed, Rejected, Abandoned, Cancelled, On Hold. Other statuses remain open."],
    ["Estimate handling", "Jira Original/Remaining Estimate fields were exported in seconds and converted to hours. Remaining Estimate is reference only. No weekly allocation is inferred. Parent rows with child items are excluded from outstanding estimate totals pending hierarchy validation."],
    ["Potential additional capacity", "Left unquantified unless confirmed current-week outstanding effort is supported. Positive remaining capacity is not confirmed availability."],
    ["Capacity reconciliation", f"Matrix planned capacity {matrix.Planned.sum():.2f} h equals Weekly Capacity current-week source {cap_week.Planned.sum():.2f} h."],
    ["Tempo reconciliation", f"Matrix logged total {matrix.Logged_Total.sum():.2f} h equals governed Tempo current-week total {tempo_week.Hours.sum():.2f} h."],
    ["Jira limitation", "The available export is labelled PI Backlog. Jira items outside that export cannot be identified, except Tempo items that lack Jira metadata and are recorded as exceptions where present."],
]

payload={"meta":{"today":"2026-10-19","week_no":week_no,"week_start":week_start.strftime("%Y-%m-%d"),"week_end":week_end.strftime("%Y-%m-%d"),"files":[str(x.name) for x in [tempo_p,jira_p,capacity_p,assignee_p,master_p]]},"matrix":records(matrix),"team":records(team),"items":records(items),"exceptions":records(exc),"method":method,"totals":{"capacity":float(matrix.Planned.sum()),"logged":float(matrix.Logged_Total.sum()),"people":int(len(matrix)),"requires_review":int((matrix["Allocation Assessment"]=="Requires Review").sum()),"open_items":int(len(items)),"team_unassigned":int(len(items[items["Canonical Assignee"].eq("")]))}}
OUT.parent.mkdir(exist_ok=True)
OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding="utf-8")
print(OUT)
