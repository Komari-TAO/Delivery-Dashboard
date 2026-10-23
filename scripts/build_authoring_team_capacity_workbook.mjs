import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile, Workbook } from "file:///C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const root = process.cwd();
const outputDir = path.join(root, "outputs", "authoring_team_capacity_effort");
const source = JSON.parse(await fs.readFile(path.join(outputDir, "report_data.json"), "utf8"));
const { summary } = source;
const workbook = Workbook.create();

const FONT = "Arial";
const NAVY = "#1F4E78";
const BLUE = "#D9EAF7";
const PALE_BLUE = "#EAF3F8";
const GREY = "#F3F6F8";
const AMBER = "#FFF2CC";
const RED = "#FCE4D6";
const GREEN = "#E2F0D9";
const TEXT = "#1F2937";

const hoursFormat = "#,##0.0";
const percentFormat = "0.0%";

function asDate(value) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function rows(records, headers, dateHeaders = []) {
  const dateSet = new Set(dateHeaders);
  return records.map((record) => headers.map((header) => dateSet.has(header) ? asDate(record[header]) : (record[header] ?? null)));
}

function setFont(sheet, range) {
  sheet.getRange(range).format.font = { name: FONT, size: 10, color: TEXT };
}

function heading(sheet, range, fill = NAVY) {
  const target = sheet.getRange(range);
  target.format = {
    fill,
    font: { name: FONT, size: 10, bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
  };
  target.format.borders = { preset: "all", style: "thin", color: "#FFFFFF" };
}

function section(sheet, range, text, fill = PALE_BLUE) {
  const target = sheet.getRange(range);
  target.getCell(0, 0).values = [[text]];
  target.format = {
    fill,
    font: { name: FONT, size: 10, bold: true, color: NAVY },
    verticalAlignment: "center",
  };
  target.format.borders = { bottom: { style: "thin", color: NAVY } };
}

function sheetTitle(sheet, title, subtitle, width = "N") {
  sheet.showGridLines = false;
  sheet.getRange("A2").values = [[title]];
  sheet.getRange("A2").format = { font: { name: FONT, size: 15, bold: true, color: NAVY } };
  sheet.getRange("A3").values = [[subtitle]];
  sheet.getRange("A3").format = { font: { name: FONT, size: 10, italic: true, color: "#5B6573" } };
  sheet.getRange(`A4:${width}4`).format.borders = { bottom: { style: "thin", color: NAVY } };
}

function addTable(sheet, range, name, headerRange) {
  const table = sheet.tables.add(range, true, name);
  heading(sheet, headerRange);
  return table;
}

function setWidths(sheet, widths) {
  for (const [column, width] of Object.entries(widths)) sheet.getRange(`${column}:${column}`).format.columnWidth = width;
}

function addUtilizationFormatting(range) {
  range.conditionalFormats.add("cellIs", { operator: "greaterThan", formula: 1, format: { fill: RED, font: { bold: true, color: "#9C0006" } } });
  range.conditionalFormats.add("cellIs", { operator: "lessThan", formula: 0.8, format: { fill: AMBER, font: { color: "#7F6000" } } });
}

function addOutcomeFormatting(range) {
  range.conditionalFormats.add("containsText", { text: "FAIL", format: { fill: RED, font: { bold: true, color: "#9C0006" } } });
  range.conditionalFormats.add("containsText", { text: "WARNING", format: { fill: AMBER, font: { bold: true, color: "#7F6000" } } });
  range.conditionalFormats.add("containsText", { text: "PASS", format: { fill: GREEN, font: { color: "#375623" } } });
  range.conditionalFormats.add("containsText", { text: "NOT EVALUATED", format: { fill: GREY, font: { color: "#595959" } } });
}

function createChart(sheet, type, sourceRange, title, positionStart, positionEnd, colors, legend = true, direction = "column") {
  const chart = sheet.charts.add(type, sheet.getRange(sourceRange));
  chart.title = title;
  chart.titleTextStyle.typeface = FONT;
  chart.titleTextStyle.fontSize = 12;
  chart.legend = { position: "top", textStyle: { typeface: FONT, fontSize: 10 } };
  chart.hasLegend = legend;
  chart.xAxis = { axisType: "textAxis", textStyle: { typeface: FONT, fontSize: 9 } };
  chart.yAxis = { numberFormatCode: hoursFormat, numberFormatSourceLinked: false, textStyle: { typeface: FONT, fontSize: 9 } };
  chart.barOptions.direction = direction;
  chart.barOptions.grouping = "clustered";
  chart.setPosition(positionStart, positionEnd);
  for (let index = 0; index < chart.series.items.length; index += 1) {
    chart.series.items[index].fill = colors[index] ?? NAVY;
  }
  return chart;
}

// 1. Executive Overview
const overview = workbook.worksheets.add("Executive Overview");
overview.tabColor = NAVY;
sheetTitle(
  overview,
  "Authoring Team Capacity, Effort & Demand Analysis",
  `Historical actuals: ${summary.scopeStart} to ${summary.scopeEnd}. Source snapshot: ${summary.snapshotDate}. Current reporting week may be partial.`,
  "N",
);
overview.getRange("A6:F6").values = [["Capacity", "Logged Total", "Logged Engineering", "Logged Operations", "Utilization Rate", "Remaining Capacity"]];
overview.getRange("A7:F7").values = [[summary.capacity, summary.loggedTotal, summary.loggedEngineering, summary.loggedOperations, summary.utilizationRate, summary.remainingCapacity]];
heading(overview, "A6:F6");
overview.getRange("A7:F7").format = { fill: GREY, font: { name: FONT, size: 12, bold: true, color: NAVY }, horizontalAlignment: "center", verticalAlignment: "center" };
overview.getRange("A7:D7").format.numberFormat = hoursFormat;
overview.getRange("E7").format.numberFormat = percentFormat;
overview.getRange("F7").format.numberFormat = hoursFormat;
overview.getRange("A9:B12").values = [
  ["Reporting context", "Value"],
  ["Authoring workforce members", summary.authoringMembers],
  ["Master Date weeks selected", `${Math.min(...summary.scopeWeeks)}–${Math.max(...summary.scopeWeeks)}`],
  ["Demand boundary", "Outstanding Jira Remaining Estimate is separate from historical effort and capacity."],
];
heading(overview, "A9:B9");
overview.getRange("A10:B12").format = { fill: GREY, font: { name: FONT, size: 10, color: TEXT }, wrapText: true, verticalAlignment: "center" };
overview.getRange("B10").format.numberFormat = "#,##0";

section(overview, "A15:B15", "Logged effort by Tempo Account Customer");
const accountHeaders = ["Tempo Account Customer", "Total Logged Hours"];
overview.getRange(`A16:B${16 + source.accountAllocation.length}`).values = [accountHeaders, ...rows(source.accountAllocation, accountHeaders)];
addTable(overview, `A16:B${16 + source.accountAllocation.length}`, "AccountAllocationSummary", "A16:B16");
overview.getRange(`B17:B${16 + source.accountAllocation.length}`).format.numberFormat = hoursFormat;
createChart(overview, "bar", `A16:B${16 + source.accountAllocation.length}`, "Logged Effort by Account (hours)", "D15", "N42", ["#5B9BD5"], false, "bar");

const comparisonStart = 45;
section(overview, `A${comparisonStart}:C${comparisonStart}`, "Capacity versus logged effort by assignee");
const comparisonHeaders = ["Assignee", "Capacity", "Logged Total"];
const comparisonRows = source.assigneeCapacity.map((row) => ({ Assignee: row.Assignee, Capacity: row.Capacity, "Logged Total": row["Logged Total"] }));
overview.getRange(`A${comparisonStart + 1}:C${comparisonStart + 1 + comparisonRows.length}`).values = [comparisonHeaders, ...rows(comparisonRows, comparisonHeaders)];
addTable(overview, `A${comparisonStart + 1}:C${comparisonStart + 1 + comparisonRows.length}`, "AssigneeCapacityComparison", `A${comparisonStart + 1}:C${comparisonStart + 1}`);
overview.getRange(`B${comparisonStart + 2}:C${comparisonStart + 1 + comparisonRows.length}`).format.numberFormat = hoursFormat;
createChart(overview, "bar", `A${comparisonStart + 1}:C${comparisonStart + 1 + comparisonRows.length}`, "Capacity vs Logged Effort by Assignee (hours)", "D44", "N65", ["#A5A5A5", "#4472C4"], true);
setWidths(overview, { A: 31, B: 22, C: 18, D: 16, E: 16, F: 18, G: 3, H: 14, I: 14, J: 14, K: 14, L: 14, M: 14, N: 14 });
overview.getRange("A6:F7").format.rowHeight = 24;

// 2. Assignee Capacity
const assignee = workbook.worksheets.add("Assignee Capacity");
assignee.tabColor = "#5B9BD5";
sheetTitle(assignee, "Assignee Capacity and Actual Effort", `Authoring workforce scope. Capacity reflects Master Date weeks ${Math.min(...summary.scopeWeeks)}–${Math.max(...summary.scopeWeeks)}.`, "J");
const assigneeHeaders = ["Assignee", "Skill", "Capacity", "Logged Engineering", "Logged Operations", "Logged Total", "Utilization Rate", "Remaining Capacity", "Billable Hours", "Distinct Work Items"];
assignee.getRange(`A6:J${6 + source.assigneeCapacity.length}`).values = [assigneeHeaders, ...rows(source.assigneeCapacity, assigneeHeaders)];
addTable(assignee, `A6:J${6 + source.assigneeCapacity.length}`, "AssigneeCapacity", "A6:J6");
assignee.getRange(`C7:F${6 + source.assigneeCapacity.length}`).format.numberFormat = hoursFormat;
assignee.getRange(`G7:G${6 + source.assigneeCapacity.length}`).format.numberFormat = percentFormat;
assignee.getRange(`H7:I${6 + source.assigneeCapacity.length}`).format.numberFormat = hoursFormat;
assignee.getRange(`J7:J${6 + source.assigneeCapacity.length}`).format.numberFormat = "#,##0";
addUtilizationFormatting(assignee.getRange(`G7:G${6 + source.assigneeCapacity.length}`));
assignee.getRange(`H7:H${6 + source.assigneeCapacity.length}`).conditionalFormats.add("cellIs", { operator: "lessThan", formula: 0, format: { fill: RED, font: { bold: true, color: "#9C0006" } } });
assignee.freezePanes.freezeRows(6);
setWidths(assignee, { A: 27, B: 16, C: 14, D: 19, E: 18, F: 16, G: 16, H: 19, I: 15, J: 18 });

// 3. Account Allocation Matrix
const matrix = workbook.worksheets.add("Account Allocation Matrix");
matrix.tabColor = "#70AD47";
sheetTitle(matrix, "Account Allocation Matrix", "Historical Tempo logged hours by Tempo Account Customer and Authoring assignee. [Missing Account Customer] is an explicit source-data bucket.", "H");
const matrixHeaders = Object.keys(source.accountMatrix[0]);
const matrixDataEnd = 6 + source.accountMatrix.length;
matrix.getRange(`A6:${String.fromCharCode(64 + matrixHeaders.length)}${matrixDataEnd}`).values = [matrixHeaders, ...rows(source.accountMatrix, matrixHeaders)];
addTable(matrix, `A6:${String.fromCharCode(64 + matrixHeaders.length)}${matrixDataEnd}`, "AccountAllocationMatrix", `A6:${String.fromCharCode(64 + matrixHeaders.length)}6`);
const totals = ["Grand Total", ...matrixHeaders.slice(1).map((header) => source.accountMatrix.reduce((sum, row) => sum + Number(row[header] || 0), 0))];
matrix.getRange(`A${matrixDataEnd + 1}:${String.fromCharCode(64 + matrixHeaders.length)}${matrixDataEnd + 1}`).values = [totals];
matrix.getRange(`A${matrixDataEnd + 1}:${String.fromCharCode(64 + matrixHeaders.length)}${matrixDataEnd + 1}`).format = { fill: PALE_BLUE, font: { name: FONT, size: 10, bold: true, color: NAVY } };
matrix.getRange(`B7:${String.fromCharCode(64 + matrixHeaders.length)}${matrixDataEnd + 1}`).format.numberFormat = hoursFormat;
matrix.getRange(`B7:${String.fromCharCode(64 + matrixHeaders.length - 1)}${matrixDataEnd}`).conditionalFormats.add("colorScale", { colors: ["#FFFFFF", "#BDD7EE", "#2F75B5"], thresholds: ["min", { type: "percentile", value: 50 }, "max"] });
matrix.freezePanes.freezeRows(6);
const matrixWidths = { A: 32 };
for (let index = 1; index < matrixHeaders.length; index += 1) matrixWidths[String.fromCharCode(65 + index)] = 17;
setWidths(matrix, matrixWidths);

// 4. Iteration and Capacity Trends
const iteration = workbook.worksheets.add("Iteration and Capacity Trends");
iteration.tabColor = "#4472C4";
sheetTitle(iteration, "Iteration and Capacity Trends", `Logged Engineering and Operations by governed Release Cycle. Current iteration is explicitly marked through ${summary.scopeEnd}.`, "H");
const iterationHeaders = ["Iteration", "Logged Engineering", "Logged Operations", "Logged Total", "Operations Percentage", "Scope Status"];
iteration.getRange(`A6:F${6 + source.iterationTrends.length}`).values = [iterationHeaders, ...rows(source.iterationTrends, iterationHeaders)];
addTable(iteration, `A6:F${6 + source.iterationTrends.length}`, "IterationTrends", "A6:F6");
iteration.getRange(`B7:D${6 + source.iterationTrends.length}`).format.numberFormat = hoursFormat;
iteration.getRange(`E7:E${6 + source.iterationTrends.length}`).format.numberFormat = percentFormat;
iteration.getRange(`F7:F${6 + source.iterationTrends.length}`).conditionalFormats.add("containsText", { text: "partial", format: { fill: AMBER, font: { color: "#7F6000" } } });
createChart(iteration, "bar", `A6:C${6 + source.iterationTrends.length}`, "Logged Engineering vs Operations by Iteration (hours)", "H6", "P29", ["#4472C4", "#ED7D31"], true);
iteration.freezePanes.freezeRows(6);
setWidths(iteration, { A: 23, B: 19, C: 18, D: 16, E: 19, F: 31, G: 3, H: 14, I: 14, J: 14, K: 14, L: 14, M: 14, N: 14, O: 14, P: 14 });

// 5. Skill Analysis
const skill = workbook.worksheets.add("Skill Analysis");
skill.tabColor = "#8064A2";
sheetTitle(skill, "Skill Analysis", "Authoring capacity and historical logged effort grouped by canonical Skill. Utilization totals use aggregate hours and capacity.", "G");
const skillHeaders = ["Skill", "Assignee", "Capacity", "Logged Engineering", "Logged Operations", "Logged Total", "Utilization Rate"];
skill.getRange(`A6:G${6 + source.skillAnalysis.length}`).values = [skillHeaders, ...source.skillAnalysis.map((row) => skillHeaders.map((header) => row[header] ?? null))];
heading(skill, "A6:G6");
for (let index = 0; index < source.skillAnalysis.length; index += 1) {
  const sourceRow = source.skillAnalysis[index];
  const workbookRow = 7 + index;
  if (sourceRow["Row Type"] === "Subtotal") {
    skill.getRange(`A${workbookRow}:G${workbookRow}`).format = { fill: PALE_BLUE, font: { name: FONT, size: 10, bold: true, color: NAVY } };
  }
  if (sourceRow["Row Type"] === "Grand Total") {
    skill.getRange(`A${workbookRow}:G${workbookRow}`).format = { fill: NAVY, font: { name: FONT, size: 10, bold: true, color: "#FFFFFF" } };
  }
}
skill.getRange(`C7:F${6 + source.skillAnalysis.length}`).format.numberFormat = hoursFormat;
skill.getRange(`G7:G${6 + source.skillAnalysis.length}`).format.numberFormat = percentFormat;
addUtilizationFormatting(skill.getRange(`G7:G${6 + source.skillAnalysis.length}`));
skill.freezePanes.freezeRows(6);
setWidths(skill, { A: 23, B: 27, C: 14, D: 19, E: 18, F: 16, G: 16 });

// 6. Work Item Details
const workItems = workbook.worksheets.add("Work Item Details");
workItems.tabColor = "#C55A11";
sheetTitle(workItems, "Work Item Details", "Historical Tempo effort and outstanding Jira demand are deliberately separated. Jira Remaining Estimate is never repeated on historical contributor rows.", "N");
workItems.getRange("A4").values = [["Part A — Historical work item detail (Tempo actuals). Remaining Estimate is blank here to prevent repeating one Jira estimate across multiple Tempo contributors; the issue-level value appears once in Part C."]];
workItems.getRange("A4:N4").format = { fill: GREY, font: { name: FONT, size: 9, italic: true, color: "#595959" }, wrapText: false, verticalAlignment: "center" };
const historicalHeaders = ["Assignee", "Skill", "Jira Issue Key", "Issue Type", "Summary", "Jira Status", "Account Customer", "Logged Hours", "Remaining Estimate", "Billable Hours", "Target Release", "Due Date", "Jira Ownership Team", "Iteration / Demand Classification"];
const historicalRows = source.historicalWorkItems.map((row) => ({ ...row, "Iteration / Demand Classification": row["Demand Classification"] }));
const historicalEnd = 6 + historicalRows.length;
workItems.getRange(`A6:N${historicalEnd}`).values = [historicalHeaders, ...rows(historicalRows, historicalHeaders, ["Due Date"])];
addTable(workItems, `A6:N${historicalEnd}`, "HistoricalWorkItems", "A6:N6");
workItems.getRange(`H7:J${historicalEnd}`).format.numberFormat = hoursFormat;
workItems.getRange(`L7:L${historicalEnd}`).format.numberFormat = "dd-mmm-yy";

const demandSummaryStart = historicalEnd + 3;
section(workItems, `A${demandSummaryStart}:F${demandSummaryStart}`, "Part B — Outstanding Jira demand by Jira Assignee", AMBER);
const demandSummaryHeaders = ["Assignee", "Skill", "Eligible Non-DONE Jira Items", "Remaining Estimate", "Future Iteration / Demand Classification", "Data Quality / Allocation Notes"];
workItems.getRange(`A${demandSummaryStart + 1}:F${demandSummaryStart + 1 + source.outstandingDemandSummary.length}`).values = [demandSummaryHeaders, ...rows(source.outstandingDemandSummary, demandSummaryHeaders)];
addTable(workItems, `A${demandSummaryStart + 1}:F${demandSummaryStart + 1 + source.outstandingDemandSummary.length}`, "OutstandingDemandByAssignee", `A${demandSummaryStart + 1}:F${demandSummaryStart + 1}`);
workItems.getRange(`C${demandSummaryStart + 2}:C${demandSummaryStart + 1 + source.outstandingDemandSummary.length}`).format.numberFormat = "#,##0";
workItems.getRange(`D${demandSummaryStart + 2}:D${demandSummaryStart + 1 + source.outstandingDemandSummary.length}`).format.numberFormat = hoursFormat;

const demandDetailStart = demandSummaryStart + source.outstandingDemandSummary.length + 5;
section(workItems, `A${demandDetailStart}:N${demandDetailStart}`, "Part C — Outstanding Jira demand detail (one row per Jira key)", AMBER);
const demandDetailHeaders = ["Assignee", "Skill", "Jira Issue Key", "Issue Type", "Summary", "Status", "Parent Key", "Remaining Estimate", "Target Release", "Due Date", "Jira Ownership Team", "Demand Classification", "Historical Logged Hours", "Data Quality / Allocation Notes"];
const demandDetailEnd = demandDetailStart + 1 + source.outstandingDemandDetail.length;
workItems.getRange(`A${demandDetailStart + 1}:N${demandDetailEnd}`).values = [demandDetailHeaders, ...rows(source.outstandingDemandDetail, demandDetailHeaders, ["Due Date"])];
addTable(workItems, `A${demandDetailStart + 1}:N${demandDetailEnd}`, "OutstandingDemandDetail", `A${demandDetailStart + 1}:N${demandDetailStart + 1}`);
workItems.getRange(`H${demandDetailStart + 2}:H${demandDetailEnd}`).format.numberFormat = hoursFormat;
workItems.getRange(`J${demandDetailStart + 2}:J${demandDetailEnd}`).format.numberFormat = "dd-mmm-yy";
workItems.getRange(`M${demandDetailStart + 2}:M${demandDetailEnd}`).format.numberFormat = hoursFormat;
workItems.freezePanes.freezeRows(6);
setWidths(workItems, { A: 27, B: 16, C: 17, D: 16, E: 48, F: 20, G: 26, H: 15, I: 18, J: 15, K: 24, L: 18, M: 19, N: 53 });
workItems.getRange(`E7:E${historicalEnd}`).format.wrapText = true;
workItems.getRange(`E${demandDetailStart + 2}:E${demandDetailEnd}`).format.wrapText = true;
workItems.getRange(`N${demandDetailStart + 2}:N${demandDetailEnd}`).format.wrapText = true;

// 7. Data Quality & Reconciliation
const quality = workbook.worksheets.add("Data Quality & Reconciliation");
quality.tabColor = "#A5A5A5";
sheetTitle(quality, "Data Quality and Reconciliation", "Executed extraction checks. PASS is used only for a calculation that was run against the source snapshot.", "J");
const checkHeaders = ["Check name", "Expected result", "Actual result", "Difference", "Outcome", "Explanation"];
quality.getRange(`A6:F${6 + source.checks.length}`).values = [checkHeaders, ...rows(source.checks, checkHeaders)];
addTable(quality, `A6:F${6 + source.checks.length}`, "DataQualityChecks", "A6:F6");
quality.getRange(`D7:D${6 + source.checks.length}`).format.numberFormat = hoursFormat;
addOutcomeFormatting(quality.getRange(`E7:E${6 + source.checks.length}`));
quality.getRange(`A7:F${6 + source.checks.length}`).format.wrapText = true;
quality.getRange("H6:J6").values = [["Source", "File", "Snapshot date"]];
quality.getRange(`H7:J${6 + summary.sources.length}`).values = summary.sources.map((row) => [row.Source, row.File, asDate(row["Snapshot date"])]);
heading(quality, "H6:J6");
addTable(quality, `H6:J${6 + summary.sources.length}`, "SourceSnapshot", "H6:J6");
quality.getRange(`J7:J${6 + summary.sources.length}`).format.numberFormat = "dd-mmm-yy";
quality.freezePanes.freezeRows(6);
setWidths(quality, { A: 31, B: 42, C: 44, D: 14, E: 16, F: 76, G: 3, H: 22, I: 53, J: 15 });

// Apply common font and finish validation before export.
for (const sheet of [overview, assignee, matrix, iteration, skill, workItems, quality]) {
  const used = sheet.getUsedRange();
  used.format.font = { name: FONT };
  used.format.verticalAlignment = "center";
}
// Re-apply semantic header/title fonts after the common font pass.
for (const [sheet, range] of [[overview, "A2"], [assignee, "A2"], [matrix, "A2"], [iteration, "A2"], [skill, "A2"], [workItems, "A2"], [quality, "A2"]]) {
  sheet.getRange(range).format.font = { name: FONT, size: 15, bold: true, color: NAVY };
}

workbook.recalculate();
const workbookCheck = {
  executive: (await workbook.inspect({ kind: "table", range: "Executive Overview!A6:F12", include: "values,formulas", tableMaxRows: 12, tableMaxCols: 8 })).ndjson,
  assignees: (await workbook.inspect({ kind: "table", range: "Assignee Capacity!A6:J11", include: "values,formulas", tableMaxRows: 10, tableMaxCols: 12 })).ndjson,
  dataQuality: (await workbook.inspect({ kind: "table", range: "Data Quality & Reconciliation!A6:F27", include: "values,formulas", tableMaxRows: 25, tableMaxCols: 8 })).ndjson,
};
await fs.writeFile(path.join(outputDir, "workbook_check.json"), JSON.stringify(workbookCheck, null, 2));
const errors = await workbook.inspect({ kind: "match", searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!", options: { useRegex: true, maxResults: 300 }, summary: "final formula error scan" });
await fs.writeFile(path.join(outputDir, "formula_error_scan.json"), errors.ndjson);

const renderRequests = [
  ["Executive Overview", undefined, "Executive_Overview.png"],
  ["Assignee Capacity", undefined, "Assignee_Capacity.png"],
  ["Account Allocation Matrix", undefined, "Account_Allocation_Matrix.png"],
  ["Iteration and Capacity Trends", undefined, "Iteration_and_Capacity_Trends.png"],
  ["Skill Analysis", undefined, "Skill_Analysis.png"],
  ["Work Item Details", "A1:N28", "Work_Item_Details_actuals.png"],
  ["Work Item Details", `A${demandSummaryStart}:N${demandDetailStart + 12}`, "Work_Item_Details_demand.png"],
  ["Data Quality & Reconciliation", undefined, "Data_Quality_and_Reconciliation.png"],
];
for (const [sheetName, range, fileName] of renderRequests) {
  const image = await workbook.render({ sheetName, ...(range ? { range } : { autoCrop: "all" }), scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, fileName), new Uint8Array(await image.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "Authoring_Team_Capacity_and_Effort.xlsx");
await output.save(outputPath);
const exported = await SpreadsheetFile.importXlsx(await FileBlob.load(outputPath));
const exportedSheetCheck = await exported.inspect({ kind: "sheet", include: "id,name" });
await fs.writeFile(path.join(outputDir, "exported_sheet_check.json"), exportedSheetCheck.ndjson);
console.log(JSON.stringify({ output: outputPath, sheets: 7, workbookCheck: path.join(outputDir, "workbook_check.json") }, null, 2));
