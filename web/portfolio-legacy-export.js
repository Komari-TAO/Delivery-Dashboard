/* Frozen v1 snapshot semantics. Export-only label selection never filters Portfolio. */
(function (global) {
  "use strict";
  const label = value => { const text = String(value || "").trim(); return text && text !== "-" ? text : ""; };
  const matches = (set, value) => !set?.size || set.has(value || "");
  function rows(data, state, labels = new Set()) {
    const teams = new Set(data.teams.map(row => row.team));
    const blocked = new Set(data.meta.excludedIssueKeys);
    const people = new Map(data.assignees.map(row => [row.assignee, row]));
    const jira = new Map(data.backlog.map(row => [row.key, row]));
    const programLabel = value => { const text = String(value || "").trim(); return !text || ["-", "(blank)", "null", "undefined", "NaN"].includes(text) ? "" : text; };
    const program = row => {
      const direct = jira.get(row.key);
      const own = programLabel(direct?.program || row.program);
      if (own) return own;
      const parent = String(direct?.parentKey || row.parentKey || "").trim();
      return parent && parent !== "-" && parent !== row.key ? programLabel(jira.get(parent)?.program) : "";
    };
    const account = value => !labels.size || labels.has(label(value) || "(blank)");
    const client = row => matches(state.clients, String(row.tempoCustomerAccount || "").trim() || "N/A");
    const common = (row, person, team, skill) => matches(state.teams, team) && matches(state.assignees, person)
      && matches(state.skills, skill) && client(row) && matches(state.priorities, row.priority)
      && matches(state.targetReleases, row.targetRelease);
    const backlog = data.backlog.filter(row => {
      const person = people.get(row.assignee), team = row.team || person?.team || "", skill = row.skill || person?.skill || "";
      const date = row.createdDate || data.meta.dateMin;
      return !blocked.has(row.key) && teams.has(team) && date >= state.startDate && date <= state.endDate
        && common(row, row.assignee, team, skill) && account(row.account) && matches(state.statuses, row.status)
        && matches(state.programs, row.program) && matches(state.releases, row.release || "");
    });
    const worklogs = data.worklogs.filter(row => !blocked.has(row.key) && teams.has(row.team)
      && row.date >= state.startDate && row.date <= state.endDate && common(row, row.person, row.team, row.skill)
      && account(row.tempoAccount) && matches(state.categories, row.category)
      && matches(state.programs, program(row)) && matches(state.releases, row.releaseCycle));
    const buckets = new Map();
    const ensure = key => { if (!buckets.has(key)) buckets.set(key, { account: key, estimated: 0, logged: 0, items: new Set(), estimates: new Set() }); return buckets.get(key); };
    backlog.forEach(row => { const bucket = ensure(row.account || "(blank)"); if (row.key && bucket.estimates.has(row.key)) return;
      if (row.key) bucket.estimates.add(row.key); bucket.estimated += Number(row.originalEstimateHours) || 0; });
    worklogs.forEach(row => { const name = label(row.tempoAccount); if (name) ensure(name).logged += Number(row.logged) || 0; });
    backlog.forEach(row => { if (row.key) ensure(row.account || "(blank)").items.add(row.key); });
    return [...buckets.values()].map(row => ({ account: row.account, estimated: row.estimated, logged: row.logged,
      itemCount: row.items.size, variance: row.logged - row.estimated, loggedVsEstimate: row.estimated ? row.logged / row.estimated : 0 }));
  }
  function csv(data, state, labels = new Set()) {
    const selected = state.detailSort?.accounts;
    const numeric = new Set(["estimated", "logged", "variance", "loggedVsEstimate", "itemCount"]);
    const sort = selected?.direction && (numeric.has(selected.key) || selected.key === "account") ? selected : { key: "logged", direction: "desc" };
    const direction = sort.direction === "asc" ? 1 : -1;
    const result = rows(data, state, labels).sort((a, b) => numeric.has(sort.key)
      ? ((Number(a[sort.key]) || 0) - (Number(b[sort.key]) || 0)) * direction
      : String(a[sort.key] || "").localeCompare(String(b[sort.key] || "")) * direction);
    const output = [["Account", "Original Estimate Hours", "Logged Hours", "Variance Hours", "Logged vs Estimate %", "Work Items"],
      ...result.map(row => [row.account, row.estimated.toFixed(1), row.logged.toFixed(1), row.variance.toFixed(1), row.loggedVsEstimate.toFixed(4), row.itemCount.toFixed(0)])];
    const cell = value => /[",\n]/.test(String(value)) ? `"${String(value).replaceAll('"', '""')}"` : String(value);
    return output.map(row => row.map(cell).join(",")).join("\n");
  }
  const api = { rows, csv };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.PortfolioLegacyExport = Object.freeze(api);
})(typeof window !== "undefined" ? window : globalThis);
