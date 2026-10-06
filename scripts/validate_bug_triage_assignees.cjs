const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dataPath = path.join(root, "web", "data.js");
const outputDir = path.join(root, "outputs", "bi_dashboard");
const outputPath = path.join(outputDir, "bug_triage_unmapped_assignees.csv");

const data = JSON.parse(
  fs.readFileSync(dataPath, "utf8")
    .replace(/^window\.BI_DATA\s*=\s*/, "")
    .replace(/;\s*$/, "")
);

const rows = data.bugTriage || [];
const value = (input) => String(input || "").trim();
const keys = rows.map((row) => value(row.key));
const duplicateKeys = keys.filter((key, index) => key && keys.indexOf(key) !== index);

if (duplicateKeys.length) {
  throw new Error(`Duplicate Bug Triage Jira Keys: ${JSON.stringify([...new Set(duplicateKeys)])}`);
}

const mappedRows = rows.filter((row) => value(row.assignee) && value(row.team));
const unmappedRows = rows.filter((row) => value(row.assignee) && !value(row.team));
const unassignedRows = rows.filter((row) => !value(row.assignee));
const reportRows = unmappedRows.map((row) => ({
  "Jira Key": value(row.key),
  Summary: value(row.summary),
  "Jira Assignee": value(row.assignee),
  Reason: "Assignee not found in Assignees CSV",
}));

const headers = ["Jira Key", "Summary", "Jira Assignee", "Reason"];
const csvValue = (input) => {
  const text = String(input || "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
const csv = [
  headers.join(","),
  ...reportRows.map((row) => headers.map((header) => csvValue(row[header])).join(",")),
].join("\r\n");

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, `${csv}\r\n`, "utf8");

console.log(JSON.stringify({
  report: outputPath,
  totalBugTriageRows: rows.length,
  distinctJiraKeys: new Set(keys).size,
  mappedIssueRows: mappedRows.length,
  mappedDistinctAssignees: new Set(mappedRows.map((row) => value(row.assignee))).size,
  unmappedIssueRows: unmappedRows.length,
  unmappedDistinctAssignees: new Set(unmappedRows.map((row) => value(row.assignee))).size,
  unassignedIssues: unassignedRows.length,
}, null, 2));
