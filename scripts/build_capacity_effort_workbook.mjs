import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "file:///C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const root = process.cwd();
const outDir = path.join(root, "outputs", "2026_capacity_effort_report");
const source = JSON.parse(await fs.readFile(path.join(outDir, "report_data.json"), "utf8"));
const s = source.summary;
const wb = Workbook.create();
const font = "Arial";
const navy = "#1F4E78";
const blue = "#D9EAF7";
const grey = "#F3F6F8";
const amber = "#FFF2CC";
const red = "#FCE4D6";

function title(sheet, text, subtitle) {
  sheet.showGridLines = false;
  sheet.getRange("A2").values = [[text]];
  sheet.getRange("A2").format = { font: { name: font, size: 15, bold: true, color: navy } };
  sheet.getRange("A3").values = [[subtitle]];
  sheet.getRange("A3").format = { font: { name: font, size: 10, italic: true, color: "#595959" } };
  sheet.getRange("A4:L4").format.borders = { bottom: { style: "thin", color: navy } };
}
function header(range) {
  range.format = { fill: navy, font: { name: font, size: 10, bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", verticalAlignment: "center", wrapText: true };
  range.format.borders = { preset: "all", style: "thin", color: "#FFFFFF" };
}
function typedDate(v) { return v ? new Date(`${v}T00:00:00`) : null; }
function clean(v) { return v === null || v === undefined ? "Not comparable" : v; }

const overview = wb.worksheets.add("Executive Overview");
overview.tabColor = navy;
title(overview, "2026 Engineering Capacity & Effort Report", "Executive management view — source cutoff 13 Oct 2026; Jan–Sep is the completed reporting period.");
overview.getRange("A6:B10").values = [
  ["Reporting scope", "2026 governed data"],
  ["Completed-period capacity comparison", s.completed_period],
  ["October actuals", `Partial through ${s.cutoff}`],
  ["Capacity comparability", s.capacity_comparable ? "COMPARABLE" : "NOT COMPARABLE"],
  ["Jira estimate comparison", "NOT COMPARABLE — lifecycle scope differs from 2026 actuals"],
];
header(overview.getRange("A6:A10"));
overview.getRange("B6:B10").format = { fill: grey, font: { name: font, size: 10 }, wrapText: true };

overview.mergeCells("A12:F12"); overview.getRange("A12").values = [["Validated actual effort"]];
header(overview.getRange("A12:F12"));
overview.getRange("A13:F14").values = [
  ["Engineering Hours", "Operations Hours", "Total Logged Hours", "Engineering %", "Operations %", "Status"],
  [s.engineering_hours, s.operations_hours, s.total_governed_tempo_hours, s.engineering_hours / s.total_governed_tempo_hours, s.operations_hours / s.total_governed_tempo_hours, "VALIDATED"],
];
header(overview.getRange("A13:F13"));
overview.getRange("A14:C14").format.numberFormat = "#,##0.0";
overview.getRange("D14:E14").format.numberFormat = "0.0%";
overview.getRange("F14").format = { fill: blue, font: { name: font, bold: true, color: navy }, horizontalAlignment: "center" };

overview.mergeCells("A16:F16"); overview.getRange("A16").values = [["Capacity utilization — completed period only"]];
header(overview.getRange("A16:F16"));
overview.getRange("A17:F18").values = [
  ["Available Capacity", "Actual Logged Hours", "Utilization Rate", "Remaining Capacity", "Status", "Reason"],
  [s.completed_period_capacity, s.completed_period_logged_hours, "Not comparable", "Not comparable", "NOT COMPARABLE", `928.8 logged hours are from mapped contributors outside the supplied capacity roster.`],
];
header(overview.getRange("A17:F17"));
overview.getRange("A18:B18").format.numberFormat = "#,##0.0";
overview.getRange("C18:F18").format = { fill: amber, font: { name: font, size: 10 }, wrapText: true, verticalAlignment: "top" };

overview.mergeCells("A20:F20"); overview.getRange("A20").values = [["Main findings"]];
header(overview.getRange("A20:F20"));
overview.getRange("A21:A25").values = [
  [`VALIDATED: ${s.total_governed_tempo_hours.toLocaleString(undefined,{maximumFractionDigits:1})} governed hours were logged through ${s.cutoff}.`],
  [`VALIDATED: Engineering accounts for ${(s.engineering_hours / s.total_governed_tempo_hours * 100).toFixed(1)}% of logged hours; Operations accounts for ${(s.operations_hours / s.total_governed_tempo_hours * 100).toFixed(1)}%.`],
  [`NOT COMPARABLE: completed-period utilization is withheld because ${s.mapped_hours_outside_capacity_roster.toFixed(1)} hours fall outside the capacity roster.`],
  [`INDICATIVE ONLY: ${s.eligible_estimate_work_items} eligible Story/Task-level items have matched 2026 development effort; current estimates are lifecycle-scoped.`],
  [`DATA QUALITY: Jira matching covers ${(s.jira_match_coverage * 100).toFixed(1)}% of governed logged hours; unmatched effort remains visible.`],
];
for (let r = 21; r <= 25; r++) overview.mergeCells(`A${r}:F${r}`);
overview.getRange("A21:A25").format = { font: { name: font, size: 10 }, wrapText: true, verticalAlignment: "top" };

overview.mergeCells("A27:F27"); overview.getRange("A27").values = [["Data quality summary"]];
header(overview.getRange("A27:F27"));
overview.getRange("A28:F33").values = [
  ["Measure", "Value", "Interpretation", "Measure", "Value", "Interpretation"],
  ["Jira-matched hours", s.matched_jira_hours, "Coverage only", "Unmatched Jira hours", s.unmatched_jira_hours, "Visible; excluded from estimate variance"],
  ["Jira matching coverage", s.jira_match_coverage, "Partial coverage", "Issues with estimates", s.jira_issues_with_estimates, "Current Jira snapshot"],
  ["Issues without estimates", s.jira_issues_without_estimates, "Missing is not zero", "Issues with zero estimates", s.jira_issues_zero_estimate, "Reported separately"],
  ["Positive parent/child pairs", s.parent_child_positive_estimate_pairs, "Parent-level estimates excluded", "October actual hours", s.october_actual_hours_partial, "Partial month"],
  ["Unattributed completed-period hours", s.unmapped_team_hours_completed_period, "No silent team assignment", "Roster-mismatch hours", s.mapped_hours_outside_capacity_roster, "Utilization withheld"],
];
header(overview.getRange("A28:F28"));
overview.getRange("B29:B33").format.numberFormat = "#,##0.0";
overview.getRange("E29:E33").format.numberFormat = "#,##0.0";
overview.getRange("B30").format.numberFormat = "0.0%";
overview.getRange("A35:F38").merge();
overview.getRange("A35").values = [["This report uses available Jira, Tempo and Weekly Capacity data for 2026. Capacity reflects weekly workforce availability, while actual effort reflects recorded worklogs. Jira estimates are progressively refined by Engineering and may not always be updated. Estimate comparisons are limited to work items with sufficient matching data. Some figures therefore represent partial coverage and should be interpreted as operational indicators rather than definitive measures of estimation accuracy."]];
overview.getRange("A35").format = { fill: grey, font: { name: font, size: 9, italic: true, color: "#595959" }, wrapText: true, verticalAlignment: "top" };
overview.getRange("A1:F40").format.font = { name: font, size: 10 };
overview.getRange("A:A").format.columnWidth = 30; overview.getRange("B:B").format.columnWidth = 18; overview.getRange("C:C").format.columnWidth = 20; overview.getRange("D:D").format.columnWidth = 21; overview.getRange("E:E").format.columnWidth = 18; overview.getRange("F:F").format.columnWidth = 42;
overview.getRange("21:25").format.rowHeight = 44; overview.getRange("35:38").format.rowHeight = 25;

const team = wb.worksheets.add("Capacity & Effort by Team");
team.tabColor = "#5B9BD5";
title(team, "Capacity & Effort by Team", "Governed weekly grain; Jan–Sep 2026 completed period. Utilization is withheld where capacity and actual roster populations do not reconcile.");
const wh = ["Year", "Governed Week", "Week Start", "Week End", "Team", "Available Capacity", "Logged Engineering Hours", "Logged Operations Hours", "Logged Total Hours", "Utilization Rate", "Remaining Capacity"];
team.getRange("A6:K6").values = [wh]; header(team.getRange("A6:K6"));
const weekRows = source.weekly.map(r => [r.Year, r["Governed Week"], typedDate(r["Week Start"]), typedDate(r["Week End"]), r.Team, r["Available Capacity"], r["Logged Engineering Hours"], r["Logged Operations Hours"], r["Logged Total Hours"], clean(r["Utilization Rate"]), clean(r["Remaining Capacity"])]);
team.getRange(`A7:K${6 + weekRows.length}`).values = weekRows;
team.tables.add(`A6:K${6 + weekRows.length}`, true, "CapacityEffortByTeam");
team.getRange(`C7:D${6 + weekRows.length}`).format.numberFormat = "dd-mmm-yy";
team.getRange(`F7:I${6 + weekRows.length}`).format.numberFormat = "#,##0.0";
team.getRange(`J7:J${6 + weekRows.length}`).format.numberFormat = "0.0%";
team.getRange(`K7:K${6 + weekRows.length}`).format.numberFormat = "#,##0.0";
team.getRange(`J7:K${6 + weekRows.length}`).format = { fill: amber, font: { name: font, size: 10 }, horizontalAlignment: "right" };
team.freezePanes.freezeRows(6);
for (const col of ["A","B","C","D","E","F","G","H","I","J","K"]) team.getRange(`${col}:${col}`).format.columnWidth = {A:9,B:14,C:14,D:14,E:20,F:18,G:23,H:22,I:19,J:16,K:19}[col];

const delivery = wb.worksheets.add("Delivery by Account Release");
delivery.tabColor = "#70AD47";
title(delivery, "Delivery Effort by Account / Release", "Indicative coverage view. Current Jira Original Estimate is lifecycle-scoped; recorded development effort is restricted to 2026, so variance and percentage are intentionally withheld.");
const dh = ["Target Release", "Account", "Issue Type", "Current Original Estimate (Jira)", "Actual Development Hours (Tempo)", "Variance Hours", "Logged vs Estimate %", "Number of Eligible Work Items", "Data Coverage / Interpretation"];
delivery.getRange("A6:I6").values = [dh]; header(delivery.getRange("A6:I6"));
const deliveryRows = source.delivery.map(r => dh.map(h => clean(r[h])));
delivery.getRange(`A7:I${6 + deliveryRows.length}`).values = deliveryRows;
delivery.tables.add(`A6:I${6 + deliveryRows.length}`, true, "DeliveryByAccountRelease");
delivery.getRange(`D7:E${6 + deliveryRows.length}`).format.numberFormat = "#,##0.0";
delivery.getRange(`F7:G${6 + deliveryRows.length}`).format = { fill: amber, font: { name: font, size: 10 }, horizontalAlignment: "center" };
delivery.freezePanes.freezeRows(6);
for (const col of ["A","B","C","D","E","F","G","H","I"]) delivery.getRange(`${col}:${col}`).format.columnWidth = {A:22,B:28,C:16,D:28,E:29,F:19,G:21,H:25,I:70}[col];

wb.recalculate();
const checks = await wb.inspect({kind: "table", range: "Executive Overview!A12:F33", include: "values,formulas", tableMaxRows: 25, tableMaxCols: 9});
await fs.writeFile(path.join(outDir, "workbook_check.json"), checks.ndjson);
const errors = await wb.inspect({kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: {useRegex: true, maxResults: 100}, summary: "final formula error scan"});
await fs.writeFile(path.join(outDir, "formula_error_scan.json"), errors.ndjson);
for (const sheetName of ["Executive Overview", "Capacity & Effort by Team", "Delivery by Account Release"]) {
  const img = await wb.render({sheetName, autoCrop: "all", scale: 1, format: "png"});
  await fs.writeFile(path.join(outDir, `${sheetName.replaceAll(" ", "_")}.png`), new Uint8Array(await img.arrayBuffer()));
}
const output = await SpreadsheetFile.exportXlsx(wb);
await output.save(path.join(outDir, "2026_Engineering_Capacity_and_Effort_Report.xlsx"));
