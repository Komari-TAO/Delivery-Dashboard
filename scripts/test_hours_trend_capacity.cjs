const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "web", "data.js"), "utf8"), context);
const data = context.window.BI_DATA;

const selectedWeeks = (start, end) => new Set(data.masterDates
  .filter((row) => row.date >= start && row.date <= end)
  .map((row) => Number(row.week)));
const capacityForWeeks = (weeks) => data.capacity
  .filter((row) => weeks.has(Number(row.week)))
  .reduce((total, row) => total + Number(row.planned || 0), 0);

const week23 = capacityForWeeks(new Set([23]));
assert.equal(week23, 968.8, "Week 23 capacity must remain 968.8 h for the current governed source");
assert.deepEqual([...selectedWeeks("2026-05-31", "2026-06-01")], [23],
  "A partial date selection inside Week 23 must retain the Master Date week");
assert.equal(capacityForWeeks(selectedWeeks("2026-05-31", "2026-06-01")), week23,
  "A partial Week 23 selection must retain its full weekly capacity");

const july = data.releases.find((row) => row.cycle === "release-2026-07");
const august = data.releases.find((row) => row.cycle === "release-2026-08-lts");
assert.ok(july && august, "Adjacent 2026 release cycles must be present");
const julyWeeks = selectedWeeks(july.start, july.end);
const augustWeeks = selectedWeeks(august.start, august.end);
const combinedWeeks = selectedWeeks(july.start, august.end);
assert.ok(julyWeeks.has(23) && augustWeeks.has(23), "Week 23 must be touched by both adjacent release cycles");
assert.equal(capacityForWeeks(new Set([...julyWeeks].filter((week) => augustWeeks.has(week)))), week23,
  "The shared boundary-week capacity must be counted once in each iteration");
assert.equal(capacityForWeeks(combinedWeeks), capacityForWeeks(new Set([...julyWeeks, ...augustWeeks])),
  "A combined scope must deduplicate Master Date weeks");
assert.ok(Math.abs(capacityForWeeks(julyWeeks) + capacityForWeeks(augustWeeks) - capacityForWeeks(combinedWeeks) - week23) < 1e-9,
  "Adjacent iteration totals must repeat exactly their shared Week 23 capacity");

const clippedStart = "2026-06-01";
const clippedEnd = "2026-06-02";
const clippedWeeks = selectedWeeks(clippedStart, clippedEnd);
assert.deepEqual([...clippedWeeks], [23], "The clipped release-cycle selection must use Master Date Week 23");
const week23Dates = data.masterDates
  .filter((row) => Number(row.week) === 23 && row.date.startsWith("2026-"))
  .map((row) => row.date).sort();
assert.equal(week23Dates[0], "2026-05-31", "Week 23 must retain its governed full-week start date");
assert.equal(week23Dates.at(-1), "2026-06-06", "Week 23 must retain its governed full-week end date");
assert.ok(week23Dates.at(-1) > clippedEnd, "Full Week 23 capacity must be disclosed as extending beyond the clipped effective dates");
assert.equal(capacityForWeeks(clippedWeeks), week23, "The clipped release-cycle selection must retain full Week 23 capacity");

const appSource = fs.readFileSync(path.join(root, "web", "app.js"), "utf8");
assert.ok(appSource.includes("Full release cycle dates:"), "Iteration tooltip must disclose full release cycle dates");
assert.ok(appSource.includes("Effective selected release cycle dates:"), "Iteration tooltip must disclose the Date Range intersection");
assert.ok(appSource.includes("Master Date weeks in capacity:"), "Iteration tooltip must disclose capacity weeks");
assert.ok(appSource.includes("Full boundary-week capacity extends beyond the effective selected release cycle dates:"),
  "Iteration tooltip must disclose boundary-week extension");
assert.ok(appSource.includes("Other active filters narrow logged effort only"),
  "The chart must explain the scope of active effort-only filters");
for (const filter of ["Client", "Account", "Account Category", "Priority", "Target Release", "Program"]) {
  assert.ok(appSource.includes(`["${filter}", state.`), `The active effort-only note must identify ${filter}`);
}

const excluded = new Set(data.meta.excludedIssueKeys || []);
const validTeams = new Set(data.teams.map((row) => row.team));
const rows = data.backlogWorklogs.filter((row) => validTeams.has(row.team) && !excluded.has(row.key));
const weeklyRows = rows.filter((row) => Number(row.week) === 23);
const engineering = weeklyRows.filter((row) => !String(row.key || "").startsWith("TEMPO-"))
  .reduce((total, row) => total + Number(row.logged || 0), 0);
const operations = weeklyRows.filter((row) => String(row.key || "").startsWith("TEMPO-"))
  .reduce((total, row) => total + Number(row.logged || 0), 0);
const total = weeklyRows.reduce((sum, row) => sum + Number(row.logged || 0), 0);
assert.ok(Math.abs(engineering + operations - total) < 1e-9, "Week 23 Engineering plus Operations must reconcile to Total Logged");

const cycleGaps = rows.filter((row) => !row.releaseCycle);
assert.equal(cycleGaps.length, 0, "No governed worklogs in the current source should be omitted from the release-cycle chart");

console.log(JSON.stringify({
  status: "ok",
  week23Capacity: week23,
  adjacentIterations: [july.cycle, august.cycle],
  week23LoggedEngineering: engineering,
  week23LoggedOperations: operations,
  week23TotalLogged: total,
  clippedReleaseCycle: { start: clippedStart, end: clippedEnd, capacityWeeks: [...clippedWeeks], capacity: week23 },
}, null, 2));
