(function (root) {
  "use strict";
  const matches = (set, value) => !set?.size || set.has(value);
  const hours = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
  function calculate(source, state, actualRows) {
    const year = Number(String(state.startDate).slice(0, 4));
    const endYear = Number(String(state.endDate).slice(0, 4));
    const unavailable = (reason) => ({ year, development: null, engineering: null, gross: null, support: null, actual: null, balance: null, ratio: null, people: null, reason });
    if (year !== endYear) return unavailable("Select a single reporting year; annual allocations cannot combine years.");
    if (!source || source.year !== year || !Array.isArray(source.people)) return unavailable(`Annual allocation data unavailable for ${year}.`);
    if (new Set(source.people.map((p) => p.assigneeId)).size !== source.people.length || new Set(source.people.map((p) => p.person)).size !== source.people.length) return unavailable("Annual roster identity is ambiguous.");
    const people = source.people.filter((p) => matches(state.teams, p.team) && matches(state.assignees, p.person) && matches(state.skills, p.skill));
    if (people.some((p) => !hours(p.development) || !hours(p.engineering) || !hours(p.support))) return unavailable("Annual allocation amounts are missing or invalid.");
    const names = new Set(people.map((p) => p.person));
    const rows = actualRows.filter((r) => names.has(r.person) && r.date >= state.startDate && r.date <= state.endDate);
    if (rows.some((r) => !hours(r.logged) || !r.date.startsWith(`${year}-`))) return unavailable("Actuals and annual allocations do not have compatible year coverage.");
    const development = people.reduce((s, p) => s + p.development, 0);
    const engineering = people.reduce((s, p) => s + p.engineering, 0);
    const gross = development + engineering;
    const actual = rows.reduce((s, r) => s + r.logged, 0);
    return { year, development, engineering, gross, actual, support: people.reduce((s, p) => s + p.support, 0), people: people.length, balance: gross - actual, ratio: gross > 0 ? actual / gross : null, reason: gross === 0 ? "Ratio unavailable: zero gross annual hours." : "" };
  }
  const api = { calculate };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.AnnualWorkforceKpis = api;
})(typeof window !== "undefined" ? window : globalThis);
