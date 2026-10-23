(function (global) {
  "use strict";
  const ENGINEERING_TEAMS = Object.freeze(["Authoring", "Delivery Express", "Integration", "Nexus", "Portal", "Scoring"]);
  const terminal = new Set(["done", "closed", "resolved", "cancelled", "canceled", "rejected", "abandoned"]);
  const key = (value) => String(value || "").trim().toUpperCase();
  const usable = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0;
  const isTerminal = (row) => terminal.has(String(row.status || "").trim().toLowerCase()) || String(row.statusCategory || "").trim().toLowerCase() === "done";
  const selected = (values, value) => !values?.size || values.has(value);
  const sum = (rows, field) => rows.reduce((total, row) => total + row[field], 0);
  function metrics(capacity, demand) {
    return { capacity, demand, gap: capacity === null ? null : capacity - demand,
      load: capacity === null || capacity === 0 ? null : demand / capacity * 100 };
  }
  function horizon(data, mode, cycle) {
    const reportingDate = data.capacityCoverage?.reportingDate;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(reportingDate || "")) return { error: "Governed reporting date is unavailable." };
    if (mode === "year") return { mode, start: reportingDate, end: `${reportingDate.slice(0, 4)}-12-31`, reportingDate };
    const release = (data.releases || []).find((row) => row.cycle === cycle);
    if (!release || !release.start || !release.end || release.start > release.end) return { error: "A governed release window is unavailable." };
    if (release.end < reportingDate) return { error: "Historical releases have no future capacity window." };
    return { mode, cycle, start: release.start > reportingDate ? release.start : reportingDate, end: release.end, reportingDate };
  }
  function resolve(data) {
    const inputs = data.capacityCoverage;
    if (!inputs) return { error: "Refresh the governed payload to enable capacity coverage." };
    const excluded = new Set((data.meta?.excludedIssueKeys || []).map(key));
    const groups = new Map();
    for (const row of inputs.demand) {
      const identity = key(row.key);
      if (excluded.has(identity)) continue;
      if (!groups.has(identity)) groups.set(identity, []);
      groups.get(identity).push({ ...row, key: identity, parentKey: key(row.parentKey) });
    }
    const rows = [...groups.values()].map((representations) => {
      const conflict = new Set(representations.map((row) => JSON.stringify(row))).size > 1;
      return { ...representations[0], conflict, sourceRepresentations: conflict ? representations : [] };
    });
    const byKey = new Map(rows.map((row) => [row.key, row]));
    const people = new Map(inputs.assignees.map((row) => [row.assignee, row]));
    const releases = new Map((data.releases || []).map((row) => [row.cycle, row]));
    const coveredBy = new Map();
    const hierarchyExceptions = new Set();
    // Resolve the entire hierarchy before any status, team or customer selection.
    for (const row of rows) {
      const path = new Set([row.key]);
      let parent = byKey.get(row.parentKey);
      while (parent) {
        if (path.has(parent.key)) { path.forEach((identity) => hierarchyExceptions.add(identity)); break; }
        path.add(parent.key);
        if (parent.conflict) path.forEach((identity) => hierarchyExceptions.add(identity));
        if (row.conflict) path.forEach((identity) => hierarchyExceptions.add(identity));
        parent = byKey.get(parent.parentKey);
      }
    }
    // Only eligible open estimates can replace a parent's estimate. Resolve this
    // against the whole source, before presentation filters, so a hidden child
    // cannot cause the parent's estimate to reappear. Confirmed zero is valid.
    for (const row of rows) {
      if (isTerminal(row) || !row.key || row.conflict || hierarchyExceptions.has(row.key)
        || !row.hasRemainingEstimate || !usable(row.remainingEstimateHours)) continue;
      const visited = new Set([row.key]);
      let parent = byKey.get(row.parentKey);
      while (parent && !visited.has(parent.key)) {
        visited.add(parent.key);
        if (!coveredBy.has(parent.key)) coveredBy.set(parent.key, []);
        coveredBy.get(parent.key).push(row.key);
        parent = byKey.get(parent.parentKey);
      }
    }
    return { rows: rows.map((row) => {
      const person = people.get(row.assignee);
      const release = releases.get(row.targetRelease);
      const futureRelease = release && release.start <= release.end && release.end >= inputs.reportingDate;
      const futureDue = /^\d{4}-\d{2}-\d{2}$/.test(row.dueDate || "") && row.dueDate > inputs.reportingDate;
      const estimate = !row.conflict && row.hasRemainingEstimate && usable(row.remainingEstimateHours) ? row.remainingEstimateHours : null;
      let outcome = "contribution";
      if (isTerminal(row)) outcome = "terminal";
      else if (!row.key || row.conflict || hierarchyExceptions.has(row.key)) outcome = "hierarchy";
      else if (coveredBy.has(row.key)) outcome = "covered-parent";
      else if (estimate === null) outcome = "estimate";
      const team = person?.team || "";
      const allocationState = !team ? "Missing or unmapped team" : !ENGINEERING_TEAMS.includes(team) ? "Outside Engineering" : "Engineering";
      const overlapChildKeys = (coveredBy.get(row.key) || []).sort();
      const estimationOverlap = estimate !== null && overlapChildKeys.length > 0 && outcome !== "hierarchy";
      const exceptionFlags = [outcome === "hierarchy" ? "Unresolved hierarchy" : "", estimationOverlap ? "Parent/child estimation overlap — governance review" : "", estimate === null ? "Missing or invalid estimate" : "", !futureRelease && !futureDue ? "Undated or unscheduled" : "", allocationState !== "Engineering" ? allocationState : ""].filter(Boolean);
      return { ...row, team, skill: person?.skill || "", estimate, outcome, allocationState, exceptionFlags, estimationOverlap, overlapChildKeys,
        bucket: futureRelease ? "release" : futureDue ? "due" : "unscheduled",
        planningDate: futureRelease ? release.end : futureDue ? row.dueDate : null,
        release: futureRelease ? release.cycle : futureDue ? (data.releases || []).find((r) => r.start <= row.dueDate && r.end >= row.dueDate)?.cycle || "" : "" };
    }) };
  }
  function calculate(data, resolved, window, filters = {}, demandMatches = () => true) {
    if (resolved.error || window.error) return { error: resolved.error || window.error };
    const inputs = data.capacityCoverage;
    const teams = ENGINEERING_TEAMS.filter((team) => selected(filters.teams, team));
    const weeks = [...new Set((data.masterDates || []).filter((row) => row.date >= window.start && row.date <= window.end).map((row) => row.week))];
    const calendarDates = new Set((data.masterDates || []).map((row) => row.date));
    const calendarDays = [...calendarDates].filter((date) => date >= window.start && date <= window.end).length;
    const expectedDays = (Date.parse(`${window.end}T00:00:00Z`) - Date.parse(`${window.start}T00:00:00Z`)) / 86400000 + 1;
    const calendarComplete = calendarDates.has(window.start) && calendarDates.has(window.end) && calendarDays === expectedDays && weeks.length > 0;
    const yearSupported = window.start.slice(0, 4) === String(inputs.capacityYear) && window.end.slice(0, 4) === String(inputs.capacityYear);
    const capByPersonWeek = new Map();
    for (const row of inputs.capacity) {
      const identity = `${row.assignee}|${row.week}`;
      if (!capByPersonWeek.has(identity)) capByPersonWeek.set(identity, []);
      capByPersonWeek.get(identity).push(row);
    }
    const exceptions = { unallocated: [], outside: [], unscheduled: [], estimate: [], hierarchy: [] };
    const contributions = [];
    const trace = [];
    const matches = (row) => demandMatches(row) && selected(filters.assignees, row.assignee) && selected(filters.skills, row.skill);
    const inWindow = (row) => row.bucket !== "unscheduled" && (window.mode === "release"
      ? row.release === window.cycle && row.planningDate >= window.start && row.planningDate <= window.end
      : row.planningDate >= window.start && row.planningDate <= window.end);
    const byKey = new Map(resolved.rows.map((row) => [row.key, row]));
    // Governance review is a non-additive reconciliation population, independent
    // of the exclusive demand exception buckets and of assigned demand totals.
    const estimationOverlaps = resolved.rows.filter((row) => row.estimationOverlap
      && [row, ...row.overlapChildKeys.map((identity) => byKey.get(identity))].some((related) =>
        related && matches(related) && (inWindow(related) || related.bucket === "unscheduled")))
      .map((row) => ({ ...row, overlapChildren: row.overlapChildKeys.map((identity) => {
        const child = byKey.get(identity);
        return { key: child.key, estimate: child.estimate, status: child.status, outcome: child.outcome };
      }) }));
    for (const row of resolved.rows) {
      if (!matches(row)) continue;
      if (["terminal", "covered-parent"].includes(row.outcome)) { trace.push(row); continue; }
      if (!inWindow(row) && row.bucket !== "unscheduled") continue;
      // One exclusive exception category per key; its other flags remain traceable.
      const category = row.outcome === "hierarchy" ? "hierarchy" : row.outcome === "estimate" ? "estimate"
        : row.bucket === "unscheduled" ? "unscheduled" : !row.team ? "unallocated"
        : !ENGINEERING_TEAMS.includes(row.team) ? "outside" : null;
      if (category) exceptions[category].push(row);
      else if (teams.includes(row.team)) contributions.push(row);
    }
    const comparisons = teams.map((team) => {
      const workforce = inputs.assignees.filter((row) => row.team === team && selected(filters.assignees, row.assignee) && selected(filters.skills, row.skill));
      let knownCapacity = 0, missingRecords = 0, duplicateRecords = 0;
      for (const person of workforce) for (const week of weeks) {
        const records = capByPersonWeek.get(`${person.assignee}|${week}`) || [];
        if (records.length > 1) { duplicateRecords += records.length; continue; }
        if (records.length !== 1 || !usable(records[0].planned)) missingRecords++;
        else knownCapacity += records[0].planned;
      }
      const capacity = !calendarComplete || !yearSupported || missingRecords || duplicateRecords ? null : knownCapacity;
      const assigned = contributions.filter((row) => row.team === team);
      return { team, ...metrics(capacity, sum(assigned, "estimate")), knownCapacity, missingRecords, duplicateRecords, workforceCount: workforce.length, keys: assigned.map((row) => row.key) };
    }).sort((a, b) => (a.gap === null) - (b.gap === null) || (a.gap ?? 0) - (b.gap ?? 0) || a.team.localeCompare(b.team));
    const portfolioCapacity = comparisons.some((row) => row.capacity === null) ? null : sum(comparisons, "capacity");
    return { window, teams: comparisons, ...metrics(portfolioCapacity, sum(comparisons, "demand")),
      knownCapacity: sum(comparisons, "knownCapacity"), exceptions, estimationOverlaps, contributions, trace, calendarComplete, yearSupported,
      unallocatedHours: sum(exceptions.unallocated, "estimate"),
      capacityYearBasis: inputs.capacityYearBasis };
  }
  const api = Object.freeze({ ENGINEERING_TEAMS, metrics, horizon, resolve, calculate });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.CapacityCoverage = api;
})(typeof window !== "undefined" ? window : globalThis);
