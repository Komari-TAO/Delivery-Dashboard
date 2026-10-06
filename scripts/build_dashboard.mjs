import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = process.env.DASHBOARD_ROOT
  ? path.resolve(process.env.DASHBOARD_ROOT)
  : path.resolve(__dirname, "..");
const outputDir = path.join(root, "outputs", "bi_dashboard");
const dataPath = path.join(outputDir, "dashboard_data.json");
const data = JSON.parse(await fs.readFile(dataPath, "utf8"));

const workbook = Workbook.create();

const palette = {
  ink: "#1F2937",
  muted: "#6B7280",
  navy: "#1F4E79",
  teal: "#0F766E",
  green: "#15803D",
  amber: "#B45309",
  red: "#B91C1C",
  blue: "#2563EB",
  paleBlue: "#EAF3F8",
  paleGreen: "#ECFDF5",
  paleAmber: "#FFF7ED",
  paleRed: "#FEF2F2",
  white: "#FFFFFF",
  border: "#D1D5DB",
};

function colName(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - m) / 26);
  }
  return s;
}

function address(row, col, rowCount, colCount) {
  const first = `${colName(col)}${row}`;
  const last = `${colName(col + colCount - 1)}${row + rowCount - 1}`;
  return first === last ? first : `${first}:${last}`;
}

function matrixFromObjects(items, headers) {
  return [headers, ...items.map((item) => headers.map((header) => item[header] ?? ""))];
}

function writeBlock(sheet, startRow, startCol, matrix, tableName = null) {
  const range = sheet.getRange(address(startRow, startCol, matrix.length, matrix[0].length));
  range.values = matrix;
  const header = sheet.getRange(address(startRow, startCol, 1, matrix[0].length));
  header.format = {
    fill: palette.navy,
    font: { bold: true, color: palette.white },
    wrapText: true,
  };
  if (tableName) {
    const table = sheet.tables.add(address(startRow, startCol, matrix.length, matrix[0].length), true, tableName);
    table.style = "TableStyleMedium2";
  }
  return range;
}

function setWidths(sheet, widths) {
  widths.forEach((width, idx) => {
    sheet.getRange(address(1, idx + 1, 80, 1)).format.columnWidthPx = width;
  });
}

function applyTitle(sheet, title, subtitle, widthCols = 10) {
  sheet.showGridLines = false;
  sheet.getRange(address(1, 1, 1, widthCols)).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A1").format = {
    fill: palette.navy,
    font: { bold: true, color: palette.white, size: 18 },
  };
  sheet.getRange(address(2, 1, 1, widthCols)).merge();
  sheet.getRange("A2").values = [[subtitle]];
  sheet.getRange("A2").format = {
    fill: palette.paleBlue,
    font: { color: palette.ink, size: 10 },
  };
}

function formatNumber(sheet, range, format) {
  sheet.getRange(range).format.numberFormat = format;
}

function makeSheet(name) {
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;
  return sheet;
}

function shortAccountName(value) {
  if (!value) return "";
  return value.length > 34 ? `${value.slice(0, 31)}...` : value;
}

const dashboard = makeSheet("Dashboard");
setWidths(dashboard, [140, 110, 105, 150, 160, 112, 98, 105, 90, 90, 24, 120, 120, 120, 120, 120, 120, 120, 120, 120]);
applyTitle(
  dashboard,
  data.summary.title,
  `Period: ${data.summary.period_start} to ${data.summary.period_end} | Generated: ${data.summary.generated_on}`,
  20,
);

const kpiRows = [
  ["Metric", "Value"],
  ["Logged Hours", data.summary.kpis["Logged Hours"]],
  ["Billable Hours", data.summary.kpis["Billable Hours"]],
  ["Billable Mix", data.summary.kpis["Billable Mix"]],
  ["YTD Capacity Hours", data.summary.kpis["YTD Capacity Hours"]],
  ["Capacity Utilization", data.summary.kpis["Capacity Utilization"]],
  ["Active People", data.summary.kpis["Active People"]],
  ["Unique Work Items", data.summary.kpis["Unique Work Items"]],
  ["Open Backlog Items", data.summary.kpis["Open Backlog Items"]],
  ["High Risk Open Items", data.summary.kpis["High Risk Open Items"]],
];
writeBlock(dashboard, 4, 1, kpiRows, "DashboardKPIs");
formatNumber(dashboard, "B5:B6", "#,##0.0");
formatNumber(dashboard, "B7:B7", "0.0%");
formatNumber(dashboard, "B8:B8", "#,##0.0");
formatNumber(dashboard, "B9:B9", "0.0%");
formatNumber(dashboard, "B10:B13", "#,##0");
dashboard.getRange("A4:B4").format = { fill: palette.teal, font: { bold: true, color: palette.white } };
dashboard.getRange("A11:B13").format = { fill: palette.paleAmber };

const teamDashRows = [
  ["Team", "Logged", "Capacity", "Utilization", "Billable Mix"],
  ...data.team_summary.map((row) => [
    row.Team,
    row.Logged_Hours,
    row.Planned_Hours_YTD,
    row.Planned_Hours_YTD ? row.Logged_Hours / row.Planned_Hours_YTD : 0,
    row.Logged_Hours ? row.Billable_Hours / row.Logged_Hours : 0,
  ]),
];
writeBlock(dashboard, 4, 4, teamDashRows, "DashboardTeamUtilization");
formatNumber(dashboard, "E5:F20", "#,##0.0");
formatNumber(dashboard, "G5:H20", "0.0%");

const monthDashRows = [
  ["Month", "Logged", "Billable"],
  ...data.monthly_summary.map((row) => [row.Month, row.Logged_Hours, row.Billable_Hours]),
];
writeBlock(dashboard, 16, 1, monthDashRows, "DashboardMonthlyTrend");
formatNumber(dashboard, "B17:C30", "#,##0.0");

const accountsDashRows = [
  ["Account", "Category", "Logged", "Billable Mix"],
  ...data.account_summary.slice(0, 10).map((row) => [
    shortAccountName(row["Account Name"]),
    row["Account Category"],
    row.Logged_Hours,
    row.Billable_Mix,
  ]),
];
writeBlock(dashboard, 16, 5, accountsDashRows, "DashboardTopAccounts");
formatNumber(dashboard, "G17:G30", "#,##0.0");
formatNumber(dashboard, "H17:H30", "0.0%");

dashboard.getRange("A29:J29").merge();
dashboard.getRange("A29").values = [["Notes"]];
dashboard.getRange("A29").format = { fill: palette.paleBlue, font: { bold: true, color: palette.navy } };
data.summary.notes.forEach((note, idx) => {
  dashboard.getRange(address(30 + idx, 1, 1, 10)).merge();
  dashboard.getRange(`A${30 + idx}`).values = [[note]];
  dashboard.getRange(`A${30 + idx}`).format = { wrapText: true, font: { color: palette.ink, size: 9 } };
});

const teamChart = dashboard.charts.add("bar", dashboard.getRange("D4:F11"));
teamChart.title = "Logged Hours vs YTD Capacity";
teamChart.hasLegend = true;
teamChart.setPosition("L4", "T18");
const monthChart = dashboard.charts.add("line", dashboard.getRange("A16:C21"));
monthChart.title = "Monthly Logged and Billable Hours";
monthChart.hasLegend = true;
monthChart.xAxis = { axisType: "textAxis" };
monthChart.yAxis = { numberFormatCode: "#,##0" };
monthChart.setPosition("L20", "T34");

const teamSheet = makeSheet("Team Performance");
setWidths(teamSheet, [142, 105, 105, 120, 95, 95, 95, 95, 95, 120]);
applyTitle(teamSheet, "Team Performance", "Logged demand, planned capacity, utilization, and billable mix.", 10);
const teamHeaders = [
  "Team",
  "Logged Hours",
  "Billable Hours",
  "Planned YTD",
  "Utilization",
  "Billable Mix",
  "Active People",
  "Work Items",
  "Worklogs",
  "Planned FY",
];
const teamMatrix = [
  teamHeaders,
  ...data.team_summary.map((row, idx) => [
    row.Team,
    row.Logged_Hours,
    row.Billable_Hours,
    row.Planned_Hours_YTD,
    `=IFERROR(B${idx + 5}/D${idx + 5},0)`,
    `=IFERROR(C${idx + 5}/B${idx + 5},0)`,
    row.Active_People,
    row.Unique_Work_Items,
    row.Worklogs,
    row.Planned_Hours_FY,
  ]),
];
writeBlock(teamSheet, 4, 1, teamMatrix, "TeamPerformance");
formatNumber(teamSheet, "B5:D20", "#,##0.0");
formatNumber(teamSheet, "E5:F20", "0.0%");
formatNumber(teamSheet, "G5:I20", "#,##0");
formatNumber(teamSheet, "J5:J20", "#,##0.0");
teamSheet.freezePanes.freezeRows(4);

const teamPerfChart = teamSheet.charts.add("bar", teamSheet.getRange("A4:D11"));
teamPerfChart.title = "Team Logged Hours and Capacity";
teamPerfChart.hasLegend = true;
teamPerfChart.setPosition("L4", "S21");

const customerSheet = makeSheet("Customer Demand");
setWidths(customerSheet, [260, 130, 135, 105, 105, 95, 95, 32, 150, 105, 105, 95]);
applyTitle(customerSheet, "Customer Demand", "Top account demand and category mix from Tempo worklogs.", 12);
const accountHeaders = ["Account Name", "Account Category", "Account Customer", "Logged Hours", "Billable Hours", "Billable Mix", "Work Items"];
const accountMatrix = [
  accountHeaders,
  ...data.account_summary.map((row, idx) => [
    row["Account Name"],
    row["Account Category"],
    row["Account Customer"],
    row.Logged_Hours,
    row.Billable_Hours,
    `=IFERROR(E${idx + 5}/D${idx + 5},0)`,
    row.Unique_Work_Items,
  ]),
];
writeBlock(customerSheet, 4, 1, accountMatrix, "TopAccounts");
formatNumber(customerSheet, "D5:E30", "#,##0.0");
formatNumber(customerSheet, "F5:F30", "0.0%");
formatNumber(customerSheet, "G5:G30", "#,##0");
const categoryMatrix = [
  ["Account Category", "Logged Hours", "Billable Hours", "Billable Mix", "Work Items"],
  ...data.category_summary.map((row) => [
    row["Account Category"],
    row.Logged_Hours,
    row.Billable_Hours,
    row.Billable_Mix,
    row.Unique_Work_Items,
  ]),
];
writeBlock(customerSheet, 4, 9, categoryMatrix, "AccountCategoryMix");
formatNumber(customerSheet, "J5:K20", "#,##0.0");
formatNumber(customerSheet, "L5:L20", "0.0%");
customerSheet.freezePanes.freezeRows(4);

const accountChart = customerSheet.charts.add("bar", customerSheet.getRange("I4:K10"));
accountChart.title = "Demand by Account Category";
accountChart.hasLegend = true;
accountChart.setPosition("A25", "H42");

const backlogSheet = makeSheet("Backlog Health");
setWidths(backlogSheet, [150, 90, 32, 150, 90, 32, 150, 90, 32, 185, 90, 240, 90]);
applyTitle(backlogSheet, "Backlog Health", "PI backlog shape, open-priority pressure, aging, and ownership concentration.", 13);
writeBlock(backlogSheet, 4, 1, matrixFromObjects(data.status_category, ["Status Category", "Items"]), "StatusCategory");
writeBlock(backlogSheet, 4, 4, matrixFromObjects(data.open_priority, ["Priority", "Items"]), "OpenPriority");
writeBlock(backlogSheet, 4, 7, matrixFromObjects(data.open_aging, ["Age Bucket", "Items"]), "OpenAging");
writeBlock(backlogSheet, 4, 10, matrixFromObjects(data.open_projects, ["Project key", "Project name", "Open Items"]), "OpenProjects");
writeBlock(backlogSheet, 18, 1, matrixFromObjects(data.open_status, ["Status", "Items"]), "OpenStatus");
writeBlock(backlogSheet, 18, 4, matrixFromObjects(data.issue_type, ["Issue Type", "Items"]), "IssueType");
writeBlock(backlogSheet, 18, 7, matrixFromObjects(data.open_assignees, ["Assignee", "Open Items"]), "OpenAssignees");
formatNumber(backlogSheet, "B5:B30", "#,##0");
formatNumber(backlogSheet, "E5:E30", "#,##0");
formatNumber(backlogSheet, "H5:H30", "#,##0");
formatNumber(backlogSheet, "L5:L30", "#,##0");
formatNumber(backlogSheet, "B19:B35", "#,##0");
formatNumber(backlogSheet, "E19:E35", "#,##0");
formatNumber(backlogSheet, "H19:H35", "#,##0");

const priorityChart = backlogSheet.charts.add("bar", backlogSheet.getRange("D4:E12"));
priorityChart.title = "Open Items by Priority";
priorityChart.hasLegend = false;
priorityChart.setPosition("J18", "Q34");

const notesSheet = makeSheet("Data Notes");
setWidths(notesSheet, [170, 420, 90, 130, 170, 520]);
applyTitle(notesSheet, "Data Notes", "Source files, definitions, and caveats used in this workbook.", 6);
writeBlock(notesSheet, 4, 1, matrixFromObjects(data.source_files, ["Source", "File", "Rows Used", "Modified"]), "SourceFiles");
notesSheet.getRange("A13:F13").merge();
notesSheet.getRange("A13").values = [["Metric Definitions"]];
notesSheet.getRange("A13").format = { fill: palette.paleBlue, font: { bold: true, color: palette.navy } };
const definitions = [
  ["Logged Hours", "Sum of Tempo Logged Hours for work dates in the workbook period."],
  ["Billable Mix", "Billable Hours divided by Logged Hours."],
  ["YTD Capacity", `Planned Hours from valid person/week capacity rows through week ${data.summary.max_work_week}.`],
  ["Capacity Utilization", "Logged Hours divided by YTD Capacity Hours."],
  ["Open Backlog", "Jira PI Backlog records where Status Category is not Done."],
  ["High Risk Open", "Open backlog with priority Blocker, Highest, High, or Urgent (Overtime)."],
];
writeBlock(notesSheet, 14, 1, [["Metric", "Definition"], ...definitions], "MetricDefinitions");
notesSheet.getRange("B15:B25").format = { wrapText: true };
notesSheet.getRange("A24:F24").merge();
notesSheet.getRange("A24").values = [["Caveats"]];
notesSheet.getRange("A24").format = { fill: palette.paleAmber, font: { bold: true, color: palette.amber } };
data.summary.notes.forEach((note, idx) => {
  notesSheet.getRange(address(25 + idx, 1, 1, 6)).merge();
  notesSheet.getRange(`A${25 + idx}`).values = [[note]];
  notesSheet.getRange(`A${25 + idx}`).format = { wrapText: true, font: { color: palette.ink } };
});

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
  maxChars: 2000,
});
console.log(errors.ndjson);

for (const sheetName of ["Dashboard", "Team Performance", "Customer Demand", "Backlog Health", "Data Notes"]) {
  const preview = await workbook.render({ sheetName, autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, `${sheetName.replaceAll(" ", "_").toLowerCase()}_preview.png`), new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
const outputPath = path.join(outputDir, "delivery_management_bi_dashboard.xlsx");
await output.save(outputPath);
console.log(outputPath);
process.exitCode = 0;
