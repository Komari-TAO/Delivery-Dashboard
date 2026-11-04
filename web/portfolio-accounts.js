(function (global) {
  "use strict";
  const issueKey = value => String(value || "").trim().toUpperCase();
  const accountKey = value => String(value || "").trim();
  const identity = value => JSON.stringify([accountKey(value)]);
  function index(worklogs, excluded = []) {
    const blocked = new Set(excluded.map(issueKey));
    const issues = new Map(), accounts = new Map();
    for (const row of worklogs) {
      const key = issueKey(row.key), account = accountKey(row.tempoAccountKey);
      if (!key || blocked.has(key) || !/^\d{4}-\d{2}-\d{2}$/.test(row.date || "")) continue;
      if (!issues.has(key)) issues.set(key, { keys: new Set(), missing: false, worklogIds: [], rows: 0 });
      const evidence = issues.get(key);
      evidence.rows++;
      if (row.worklogId) evidence.worklogIds.push(String(row.worklogId));
      if (account) evidence.keys.add(account); else evidence.missing = true;
      if (!accounts.has(account)) accounts.set(account, String(row.tempoAccount || "").trim());
    }
    return { issues, accounts };
  }
  function status(key, evidence) {
    const item = evidence.issues.get(issueKey(key));
    if (!item) return "No worklogs";
    if (!item.keys.size) return "Missing Account Keys";
    if (item.missing) return "Partially attributed";
    return item.keys.size > 1 ? "Multiple Accounts" : "Observed Account";
  }
  function worklogMatches(row, state) {
    return !state.tempoAccountsActive || state.tempoAccounts.has(identity(row.tempoAccountKey));
  }
  function issueMatches(row, evidence, state) {
    if (!state.tempoAccountsActive) return true;
    const item = evidence.issues.get(issueKey(row.key));
    return Boolean(item && ([...item.keys].some(key => state.tempoAccounts.has(identity(key)))
      || (item.missing && state.tempoAccounts.has(identity("")))));
  }
  function distinct(rows) {
    const seen = new Set();
    return rows.filter(row => { const key = issueKey(row.key); if (!key || seen.has(key)) return false; seen.add(key); return true; });
  }
  function partition(rows, evidence, state) {
    const selected = [], unlinked = [], other = [];
    for (const row of distinct(rows)) {
      if (issueMatches(row, evidence, state)) selected.push(row);
      else if (["No worklogs", "Missing Account Keys"].includes(status(row.key, evidence))) unlinked.push(row);
      else other.push(row);
    }
    return { selected, unlinked, other };
  }
  const sum = (rows, field) => rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
  function totals(rows) {
    const unique = distinct(rows);
    return { items: unique.length, original: sum(unique, "originalEstimateHours"), remaining: sum(unique, "remainingEstimateHours") };
  }
  function accountRows(issues, worklogs, evidence, state) {
    const buckets = new Map();
    const actualIdsByIssue = new Map();
    const ensure = key => {
      if (!buckets.has(key)) buckets.set(key, { accountKey: key, account: evidence.accounts.get(key) || "-", logged: 0,
        estimated: 0, remaining: 0, items: new Set(), estimateItems: new Set(), comparable: true });
      return buckets.get(key);
    };
    const issueByKey = new Map(distinct(issues).map(row => [issueKey(row.key), row]));
    for (const row of worklogs) {
      const bucket = ensure(accountKey(row.tempoAccountKey));
      bucket.logged += Number(row.logged) || 0;
      bucket.items.add(issueKey(row.key));
      const key = issueKey(row.key);
      if (!actualIdsByIssue.has(key)) actualIdsByIssue.set(key, new Set());
      if (row.worklogId) actualIdsByIssue.get(key).add(String(row.worklogId));
      if (!issueByKey.has(issueKey(row.key))) bucket.comparable = false;
    }
    for (const row of issueByKey.values()) {
      const item = evidence.issues.get(issueKey(row.key));
      if (!item) continue;
      const actualIds = actualIdsByIssue.get(issueKey(row.key)) || new Set();
      const completeActivity = item.worklogIds.length === item.rows && actualIds.size === item.worklogIds.length
        && item.worklogIds.every(id => actualIds.has(id));
      const keys = [...item.keys, ...(item.missing ? [""] : [])];
      for (const key of keys) {
        if (state.tempoAccountsActive && !state.tempoAccounts.has(identity(key))) continue;
        const bucket = ensure(key);
        bucket.estimateItems.add(issueKey(row.key));
        bucket.estimated += Number(row.originalEstimateHours) || 0;
        bucket.remaining += Number(row.remainingEstimateHours) || 0;
        if (!key || item.keys.size !== 1 || item.missing || !row.hasOriginalEstimate || !completeActivity) bucket.comparable = false;
      }
    }
    return [...buckets.values()].map(bucket => {
      // Also require the same issue population on both sides of a comparison.
      const comparable = bucket.comparable && bucket.items.size === bucket.estimateItems.size
        && [...bucket.items].every(key => bucket.estimateItems.has(key));
      return { ...bucket, attributionStatus: !bucket.accountKey ? "Missing Account Key"
        : comparable ? "Observed linked issues" : "Incomplete or non-additive comparison",
        itemCount: bucket.items.size, linkedIssueCount: bucket.estimateItems.size,
        variance: comparable ? bucket.logged - bucket.estimated : null,
        loggedVsEstimate: comparable && bucket.estimated ? bucket.logged / bucket.estimated : null };
    });
  }
  function exportCsv({ accountRows: rows, planningRows, evidence, state, scope }) {
    const header = ["Schema Version", "Record Type", "Population", "Account Key", "Account Name", "Observed Account Keys",
      "Attribution Status", "Jira Issue Key", "Jira Account", "Logged Hours", "Original Estimate Hours", "Remaining Estimate Hours", "Scope"];
    const output = [header], metadata = JSON.stringify(scope);
    rows.forEach(row => output.push(["2", "Account effort", "Selected", row.accountKey, row.account, "", row.attributionStatus,
      "", "", row.logged, "", "", metadata]));
    const groups = partition(planningRows, evidence, state);
    for (const [population, issues] of Object.entries(groups)) for (const row of issues) {
      output.push(["2", "Jira issue", population, "", "", JSON.stringify([...(evidence.issues.get(issueKey(row.key))?.keys || [])]),
        status(row.key, evidence), row.key, row.account || "", "", row.hasOriginalEstimate ? row.originalEstimateHours : "",
        row.hasRemainingEstimate ? row.remainingEstimateHours : "", metadata]);
    }
    const cell = value => /[",\r\n]/.test(String(value ?? "")) ? `"${String(value ?? "").replaceAll('"', '""')}"` : String(value ?? "");
    return output.map(row => row.map(cell).join(",")).join("\n");
  }
  const api = { index, identity, status, worklogMatches, issueMatches, distinct, partition, totals, accountRows, exportCsv };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else global.PortfolioAccounts = Object.freeze(api);
})(typeof window !== "undefined" ? window : globalThis);
