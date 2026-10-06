const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "web", "data.js");
const raw = JSON.parse(
  fs.readFileSync(dataPath, "utf8")
    .replace(/^window\.BI_DATA\s*=\s*/, "")
    .replace(/;\s*$/, "")
);

const normalizeIssueKey = (value) => String(value || "").trim().toUpperCase();
const excludedIssueKeys = new Set((raw.meta.excludedIssueKeys || []).map(normalizeIssueKey));
const validTeams = new Set((raw.teams || []).map((row) => row.team).filter(Boolean));
const validAssignees = new Set((raw.assignees || []).map((row) => row.assignee).filter(Boolean));
const jiraByKey = new Map((raw.backlog || []).map((row) => [row.key, row]));
const allRowsByKey = new Map();

(raw.backlogWorklogs || []).forEach((row) => {
  if (!row.key) return;
  if (!allRowsByKey.has(row.key)) allRowsByKey.set(row.key, []);
  allRowsByKey.get(row.key).push(row);
});

function isTempoWorkItem(key) {
  return normalizeIssueKey(key).startsWith("TEMPO-");
}

function display(value) {
  const normalized = String(value || "").trim();
  return !normalized || normalized.toUpperCase() === "N/A" ? "-" : normalized;
}

function planning(value, key) {
  return isTempoWorkItem(key) ? "-" : display(value);
}

function ticketTeam(key) {
  return String(jiraByKey.get(key)?.team || "").trim();
}

function validAssigneeState(key, scopedRows) {
  const sourceRows = allRowsByKey.get(key) || scopedRows || [];
  const loggedAssignees = Array.from(new Set(
    sourceRows.map((row) => String(row.person || "").trim()).filter(Boolean)
  ));
  const invalidLoggedAssignees = loggedAssignees.filter((assignee) => !validAssignees.has(assignee));
  const jiraAssignee = String(jiraByKey.get(key)?.assignee || "").trim();
  const invalidJiraAssignee = Boolean(jiraAssignee && !validAssignees.has(jiraAssignee));
  const hasValidLoggedAssignee = loggedAssignees.some((assignee) => validAssignees.has(assignee));
  const hasValidJiraAssignee = Boolean(jiraAssignee && validAssignees.has(jiraAssignee));
  return !invalidLoggedAssignees.length
    && !invalidJiraAssignee
    && (hasValidLoggedAssignee || hasValidJiraAssignee);
}

function correctedRowsFor(selectedTeam) {
  const selectedTeams = selectedTeam ? new Set([selectedTeam]) : new Set();
  const byKey = new Map();
  (raw.backlogWorklogs || [])
    .filter((row) => row.date >= raw.meta.dateMin && row.date <= raw.meta.dateMax)
    .filter((row) => row.key && !excludedIssueKeys.has(normalizeIssueKey(row.key)))
    .filter((row) => {
      const team = ticketTeam(row.key);
      if (!team) return selectedTeams.size === 0;
      return validTeams.has(team) && (selectedTeams.size === 0 || selectedTeams.has(team));
    })
    .forEach((row) => {
      if (!byKey.has(row.key)) byKey.set(row.key, []);
      byKey.get(row.key).push(row);
    });

  const rows = [];
  byKey.forEach((sourceRows, key) => {
    if (!validAssigneeState(key, sourceRows)) return;
    const row = {
      childKey: key,
      team: display(ticketTeam(key)),
      parentKey: "",
      summary: "",
      lastWorklogDate: "",
    };
    sourceRows.forEach((source) => {
      if (!row.parentKey && source.parentKey) row.parentKey = source.parentKey;
      if (!row.summary && source.summary) row.summary = source.summary;
      if ((source.date || "") > row.lastWorklogDate) row.lastWorklogDate = source.date || "";
    });
    row.parentKey = planning(row.parentKey, row.childKey);
    if (row.parentKey === row.childKey) row.parentKey = "-";
    rows.push(row);
  });

  const parentKeys = new Set(rows.map((row) => row.parentKey).filter((key) => key && key !== "-"));
  return rows.filter((row) => !(row.parentKey === "-" && parentKeys.has(row.childKey)));
}

function previousFixChangedScenarios() {
  const byKey = new Map();
  (raw.backlogWorklogs || [])
    .filter((row) => row.date >= raw.meta.dateMin && row.date <= raw.meta.dateMax)
    .filter((row) => row.key && !excludedIssueKeys.has(normalizeIssueKey(row.key)))
    .filter((row) => validTeams.has(row.team))
    .forEach((row) => {
      if (!byKey.has(row.key)) {
        byKey.set(row.key, {
          key: row.key,
          tempoTeams: new Set(),
          lastWorklogDate: "",
          summary: row.summary || "",
        });
      }
      const item = byKey.get(row.key);
      item.tempoTeams.add(row.team);
      if ((row.date || "") > item.lastWorklogDate) item.lastWorklogDate = row.date || "";
      if (!item.summary && row.summary) item.summary = row.summary;
    });

  const changed = [];
  byKey.forEach((item, key) => {
    const jira = jiraByKey.get(key);
    const jiraTeam = String(jira?.team || "").trim();
    if (!jiraTeam) return;
    Array.from(item.tempoTeams).sort().forEach((tempoTeam) => {
      if (tempoTeam !== jiraTeam) {
        changed.push({
          childKey: key,
          jiraTeam,
          previousFixTeamUnderTempoFilter: tempoTeam,
          summary: jira?.summary || item.summary || "",
          lastWorklogDate: item.lastWorklogDate,
        });
      }
    });
  });
  return changed;
}

const nexus = correctedRowsFor("Nexus");
const integration = correctedRowsFor("Integration");
const changed = previousFixChangedScenarios();
const adfTempoContributorTeams = Array.from(new Set(
  (raw.backlogWorklogs || []).filter((row) => row.key === "ADF-2326").map((row) => row.team)
)).sort();

const result = {
  adfJiraTeam: ticketTeam("ADF-2326"),
  adfTempoContributorTeams,
  correctedNexus: {
    rowCount: nexus.length,
    visibleTeams: Array.from(new Set(nexus.map((row) => row.team))).sort(),
    adfRows: nexus.filter((row) => row.childKey === "ADF-2326"),
    invalidRows: nexus.filter((row) => row.team !== "Nexus").slice(0, 5),
  },
  correctedIntegration: {
    rowCount: integration.length,
    visibleTeams: Array.from(new Set(integration.map((row) => row.team))).sort(),
    adfRows: integration.filter((row) => row.childKey === "ADF-2326"),
    invalidRows: integration.filter((row) => row.team !== "Integration").slice(0, 5),
  },
  previousFixChangedScenarioCount: changed.length,
  previousFixDistinctTicketsChanged: new Set(changed.map((row) => row.childKey)).size,
  previousFixAdf2326Rows: changed.filter((row) => row.childKey === "ADF-2326"),
  previousFixChangedSample: changed.slice(0, 10),
};

if (result.adfJiraTeam !== "Integration") {
  throw new Error(`ADF-2326 Jira team expected Integration, got ${result.adfJiraTeam || "-"}`);
}
if (result.correctedNexus.adfRows.length || result.correctedNexus.invalidRows.length) {
  throw new Error(`Nexus validation failed: ${JSON.stringify(result.correctedNexus)}`);
}
if (!result.correctedIntegration.adfRows.length || result.correctedIntegration.invalidRows.length) {
  throw new Error(`Integration validation failed: ${JSON.stringify(result.correctedIntegration)}`);
}
if (result.correctedIntegration.adfRows.some((row) => row.team !== "Integration")) {
  throw new Error(`ADF-2326 rendered with wrong team: ${JSON.stringify(result.correctedIntegration.adfRows)}`);
}
if (!result.previousFixAdf2326Rows.some((row) => row.previousFixTeamUnderTempoFilter === "Nexus")) {
  throw new Error(`Previous-fix ADF-2326 Nexus reassignment was not detected: ${JSON.stringify(result.previousFixAdf2326Rows)}`);
}

console.log(JSON.stringify(result, null, 2));
