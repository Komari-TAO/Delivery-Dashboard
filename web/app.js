(function () {
  "use strict";

  const { clonePayload, escapeHtml, parseDataScript } = window.DashboardCore;

  let raw = applyGlobalIssueExclusions(window.BI_DATA);
  let lastUpdateContext = null;
  const state = {
    startDate: raw.meta.dateMin,
    endDate: raw.meta.dateMax,
    teams: new Set(),
    assignees: new Set(),
    skills: new Set(),
    clients: new Set(),
    accounts: new Set(),
    categories: new Set(),
    priorities: new Set(),
    statuses: new Set(),
    targetReleases: new Set(),
    programs: new Set(),
    releases: new Set(),
    detail: "accounts",
    detailSearch: "",
    detailGroupBy: "",
    detailSort: {
      accounts: { key: null, direction: null },
      people: { key: null, direction: null },
      backlog: { key: null, direction: null },
      deliveryProgress: { key: null, direction: null },
      bugTriage: { key: null, direction: null },
    },
    assigneeSearch: "",
    clientSearch: "",
    accountSearch: "",
    targetReleaseSearch: "",
    programSearch: "",
    trendGrain: "month",
  };

  const colors = {
    blue: "#1f5f8b",
    gray: "#94a3b8",
    teal: "#14766f",
    green: "#26804a",
    amber: "#b7791f",
    red: "#b83232",
    violet: "#6d5bd0",
    slate: "#546173",
    grid: "#d9e0e8",
    text: "#172033",
    muted: "#687385",
  };

  const DEFAULT_DETAIL_SORTS = {
    accounts: { key: "logged", direction: "desc" },
    people: { key: "loggedTotal", direction: "desc" },
    backlog: { key: "lastWorklogDate", direction: "desc" },
    deliveryProgress: { key: "deliveryHealth", direction: "asc" },
    bugTriage: { key: "bugSeverity", direction: "asc" },
  };
  const BUG_SEVERITY_ORDER = ["Blocker", "Critical", "Major", "Medium", "Low", "Enhancement", "-"];
  const BUG_SEVERITY_DISTRIBUTION_ORDER = ["Blocker", "Critical", "Major"];
  const BUG_SEVERITY_DISTRIBUTION_COLORS = {
    Blocker: "#8f4a4d",
    Critical: "#a96567",
    Major: "#bd8586",
    Medium: "#cba1a2",
    Low: "#d7babc",
    Enhancement: "#e3d1d2",
  };
  const UNMAPPED_ACCOUNT_LABEL = "No Account / Missing Account";
  // Tempo export files expose account keys and team names, but not the numeric IDs
  // required by the Tempo UI routes. Keep only confirmed mappings here.
  const TEMPO_ACCOUNT_IDS = Object.freeze({ Engineering: "143" });
  const TEMPO_TEAM_IDS = Object.freeze({ Architecture: "41", Architects: "41" });
  const TEMPO_APP_BASE = "https://oat-sa.atlassian.net/jira/apps/fa75e928-007a-4af4-9530-76503bcd4cba/ea7fda46-2015-4367-bd93-992fbf0c58ca";
  const DELIVERY_HEALTH_ORDER = {
    Overdue: 0,
    Critical: 0,
    "Due soon": 1,
    "At Risk": 1,
    Healthy: 2,
    "No due date": 3,
    "Not applicable": 3,
    Blocked: 3,
    Completed: 4,
    "-": 3,
  };

  let canonicalAssigneeByLookupKey = buildCanonicalAssigneeLookup();
  let excludedIssueKeys = governedExcludedIssueKeys(raw);
  let teamByPerson = new Map(raw.assignees.map((row) => [normalizeAssigneeName(row.assignee), row.team]));
  let skillByPerson = new Map(raw.assignees.map((row) => [normalizeAssigneeName(row.assignee), row.skill]));
  let validTeamSet = new Set(((raw.teams?.length ? raw.teams : raw.assignees) || []).map((row) => row.team).filter(Boolean));
  let validSkillSet = new Set(((raw.skills?.length ? raw.skills : raw.assignees) || []).map((row) => row.skill).filter(Boolean));
  let validAssigneeSet = new Set((raw.assignees || []).map((row) => row.assignee).filter(Boolean));
  let jiraByKey = new Map((raw.backlog || []).map((row) => [row.key, row]));
  let deliveryWorklogsByKey = groupRowsByKey(raw.backlogWorklogs || raw.worklogs || []);
  let dataLastModified = null;

  const $ = (id) => document.getElementById(id);

  function normalizeIssueKey(value) {
    return String(value || "").trim().toUpperCase();
  }

  function governedExcludedIssueKeys(payload) {
    const configuredKeys = payload?.meta?.excludedIssueKeys
      || (payload?.meta?.excludedTempoWorkItems || []).map((item) => item.key);
    return Object.freeze(Array.from(new Set(configuredKeys.map(normalizeIssueKey).filter(Boolean))).sort());
  }

  function applyGlobalIssueExclusions(payload) {
    const next = clonePayload(payload);
    const configuredKeys = new Set(governedExcludedIssueKeys(next));
    ["worklogs", "backlogWorklogs", "backlog", "tempoOperationalMappings", "tempoDescriptions"].forEach((dataset) => {
      if (!Array.isArray(next?.[dataset])) return;
      next[dataset].forEach((row) => {
        row.key = normalizeIssueKey(row.key);
      });
      next[dataset] = next[dataset].filter((row) => !configuredKeys.has(row.key));
    });
    return next;
  }

  function groupRowsByKey(rows) {
    const map = new Map();
    (rows || []).forEach((row) => {
      const key = row.key || "";
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    return map;
  }

  function normalizeAssigneeName(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function assigneeLookupKey(value) {
    return normalizeAssigneeName(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function buildCanonicalAssigneeLookup() {
    const lookup = new Map();
    (raw.assignees || []).forEach((row) => {
      const canonicalName = normalizeAssigneeName(row.assignee);
      const key = assigneeLookupKey(canonicalName);
      if (canonicalName && key) lookup.set(key, canonicalName);
    });
    return lookup;
  }

  function canonicalAssigneeName(value) {
    const normalized = normalizeAssigneeName(value);
    return canonicalAssigneeByLookupKey.get(assigneeLookupKey(normalized)) || normalized;
  }

  function governedTeamForPerson(value) {
    return teamByPerson.get(canonicalAssigneeName(value)) || "";
  }

  function governedSkillForPerson(value) {
    return skillByPerson.get(canonicalAssigneeName(value)) || "";
  }

  function enrichGovernedWorklog(row) {
    const person = canonicalAssigneeName(row.person);
    return {
      ...row,
      person,
      team: governedTeamForPerson(person),
      skill: governedSkillForPerson(person),
    };
  }

  function rebuildLookups(resetDefaultStatuses = false) {
    excludedIssueKeys = governedExcludedIssueKeys(raw);
    canonicalAssigneeByLookupKey = buildCanonicalAssigneeLookup();
    teamByPerson = new Map(raw.assignees.map((row) => [normalizeAssigneeName(row.assignee), row.team]));
    skillByPerson = new Map(raw.assignees.map((row) => [normalizeAssigneeName(row.assignee), row.skill]));
    validTeamSet = new Set(((raw.teams?.length ? raw.teams : raw.assignees) || []).map((row) => row.team).filter(Boolean));
    validSkillSet = new Set(((raw.skills?.length ? raw.skills : raw.assignees) || []).map((row) => row.skill).filter(Boolean));
    validAssigneeSet = new Set((raw.assignees || []).map((row) => row.assignee).filter(Boolean));
    jiraByKey = new Map((raw.backlog || []).map((row) => [row.key, row]));
    deliveryWorklogsByKey = groupRowsByKey(raw.backlogWorklogs || raw.worklogs || []);
    state.teams.forEach((team) => {
      if (!validTeamSet.has(team)) state.teams.delete(team);
    });
    state.skills.forEach((skill) => {
      if (!validSkillSet.has(skill)) state.skills.delete(skill);
    });
    if (resetDefaultStatuses) {
      resetStatusDefaults();
    } else {
      const availableStatuses = new Set((raw.statuses || []).map((row) => row.status).filter(Boolean));
      state.statuses.forEach((status) => {
        if (!availableStatuses.has(status)) state.statuses.delete(status);
      });
    }
  }

  async function refreshDataIfChanged() {
    try {
      const head = await fetch("./data.js", { method: "HEAD", cache: "no-store" });
      const lastModified = head.headers.get("last-modified") || "";
      if (lastModified && dataLastModified === lastModified) return;

      const response = await fetch(`./data.js?refresh=${Date.now()}`, { cache: "no-store" });
      const nextRaw = parseDataScript(await response.text());
      const previousMax = raw.meta.dateMax;
      const shouldResetStatusDefaults = isDefaultStatusSelection();
      raw = applyGlobalIssueExclusions(nextRaw);
      dataLastModified = lastModified;
      rebuildLookups(shouldResetStatusDefaults);

      $("startDate").min = raw.meta.dateMin;
      $("startDate").max = raw.meta.dateMax;
      $("endDate").min = raw.meta.dateMin;
      $("endDate").max = raw.meta.dateMax;
      if (state.endDate === previousMax) state.endDate = raw.meta.dateMax;
      if (state.startDate < raw.meta.dateMin) state.startDate = raw.meta.dateMin;
      if (state.endDate > raw.meta.dateMax) state.endDate = raw.meta.dateMax;
      update();
    } catch (error) {
      console.warn("Dashboard data refresh check failed", error);
    }
  }

  function formatNumber(value, digits = 0) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(Number.isFinite(value) ? value : 0);
  }

  function formatPercent(value) {
    return `${formatNumber((Number.isFinite(value) ? value : 0) * 100, 1)}%`;
  }

  function formatCompactPercent(value) {
    const percent = (Number.isFinite(value) ? value : 0) * 100;
    if (Math.abs(percent) >= 1000) return `${formatNumber(percent / 1000, 1)}k%`;
    return `${formatNumber(percent, 1)}%`;
  }

  function parseDate(value) {
    return new Date(`${value}T00:00:00`);
  }

  function clampDate(value) {
    if (value < raw.meta.dateMin) return raw.meta.dateMin;
    if (value > raw.meta.dateMax) return raw.meta.dateMax;
    return value;
  }

  function inDateRange(value) {
    return value >= state.startDate && value <= state.endDate;
  }

  function selectedDateRangeDays() {
    const start = parseDate(state.startDate);
    const end = parseDate(state.endDate);
    return Math.floor((end - start) / 86400000) + 1;
  }

  function inSet(set, value) {
    return set.size === 0 || set.has(value || "");
  }

  function inSelectedAssignee(value) {
    if (state.assignees.size === 0) return true;
    const canonicalValue = canonicalAssigneeName(value);
    if (state.assignees.has(canonicalValue) || state.assignees.has(value || "")) return true;
    return Array.from(state.assignees).some((selected) => canonicalAssigneeName(selected) === canonicalValue);
  }

  function accountFilterValue(value) {
    return accountLabel(value) || "(blank)";
  }

  function inSelectedAccount(value) {
    // Empty selections stay unrestricted; Select All must cover every visible reportable bucket.
    return state.accounts.size === 0 || state.accounts.has(accountFilterValue(value));
  }

  function clientFilterValue(value) {
    return String(value || "").trim() || "Other/Blank";
  }

  function inSelectedClient(value) {
    return state.clients.size === 0 || state.clients.has(clientFilterValue(value));
  }

  function inSelectedStatus(value) {
    return state.statuses.size === 0 || state.statuses.has(value || "");
  }

  function hasWorklogOnlyFilters(options = {}) {
    const includeStatus = options.includeStatus !== false;
    return (
      state.accounts.size ||
      state.clients.size ||
      state.categories.size ||
      state.priorities.size ||
      (includeStatus && state.statuses.size) ||
      state.targetReleases.size ||
      state.programs.size ||
      state.releases.size
    );
  }

  function masterTeamLabels() {
    const teams = raw.teams?.length
      ? raw.teams.map((row) => row.team)
      : raw.assignees.map((row) => row.team);
    return Array.from(new Set(teams.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }

  function activeTeamLabels() {
    return masterTeamLabels().filter((team) => inSet(state.teams, team));
  }

  function masterSkillRows() {
    if (raw.skills?.length) {
      return raw.skills.map((row) => ({ label: row.skill, count: row.assigneeCount || 0 })).filter((row) => row.label);
    }
    return top(groupCount(raw.assignees.filter((row) => row.skill), "skill"), "count", 20);
  }

  function backlogTeam(row) {
    return row.team || governedTeamForPerson(row.assignee) || "";
  }

  function backlogSkill(row) {
    return row.skill || governedSkillForPerson(row.assignee) || "";
  }

  function normalizeStatus(value) {
    return String(value || "").trim().toLowerCase();
  }

  function defaultStatusLabels() {
    return (raw.statuses || [])
      .filter((row) => normalizeStatus(row.statusCategory) !== "done")
      .map((row) => row.status)
      .filter(Boolean);
  }

  function resetStatusDefaults() {
    state.statuses = new Set(defaultStatusLabels());
  }

  function setEquals(left, right) {
    if (left.size !== right.size) return false;
    for (const value of left) {
      if (!right.has(value)) return false;
    }
    return true;
  }

  function isDefaultStatusSelection() {
    return setEquals(state.statuses, new Set(defaultStatusLabels()));
  }

  function isStatusFilterActive() {
    return state.statuses.size > 0 && !isDefaultStatusSelection();
  }

  function isTempoWorkItem(key) {
    return normalizeIssueKey(key).startsWith("TEMPO-");
  }

  function isExcludedOperationalItem(key) {
    return excludedIssueKeys.includes(normalizeIssueKey(key));
  }

  function filteredData(options = {}) {
    const ignoreStatus = Boolean(options.ignoreStatus);
    const ignoreTeam = Boolean(options.ignoreTeam);
    const ignoreAssignee = Boolean(options.ignoreAssignee);
    const ignoreAccount = Boolean(options.ignoreAccount);
    const ignoreProgram = Boolean(options.ignoreProgram);
    const selectedMasterDateWeeks = new Set(
      (raw.masterDates || [])
        .filter((row) => row.date >= state.startDate && row.date <= state.endDate)
        .map((row) => Number(row.week))
        .filter(Number.isFinite),
    );

    const worklogs = raw.worklogs.filter((row) => {
      return (
        inDateRange(row.date) &&
        (ignoreTeam || inSet(state.teams, row.team)) &&
        (ignoreAssignee || inSelectedAssignee(row.person)) &&
        inSet(state.skills, row.skill) &&
        inSelectedClient(row.delivery) &&
        (ignoreAccount || inSelectedAccount(row.tempoAccount)) &&
        inSet(state.categories, row.category) &&
        inSet(state.priorities, row.priority) &&
        (ignoreStatus || inSelectedStatus(row.status)) &&
        inSet(state.targetReleases, row.targetRelease) &&
        (ignoreProgram || inSet(state.programs, programFilterValueForWorklog(row))) &&
        inSet(state.releases, row.releaseCycle)
      );
    });

    const backlog = raw.backlog.filter((row) => {
      const rowTeam = backlogTeam(row);
      const rowSkill = backlogSkill(row);
      const release = row.release || "";
      return (
        inDateRange(row.createdDate || raw.meta.dateMin) &&
        (ignoreTeam || inSet(state.teams, rowTeam)) &&
        (ignoreAssignee || inSelectedAssignee(row.assignee)) &&
        inSet(state.skills, rowSkill) &&
        inSelectedClient(row.tempoClient) &&
        (ignoreAccount || inSelectedAccount(row.account)) &&
        inSet(state.priorities, row.priority) &&
        (ignoreStatus || inSelectedStatus(row.status)) &&
        inSet(state.targetReleases, row.targetRelease) &&
        (ignoreProgram || inSet(state.programs, row.program)) &&
        inSet(state.releases, release)
      );
    });

    const backlogWorklogs = (raw.backlogWorklogs || raw.worklogs).filter((row) => {
      const statusActive = isStatusFilterActive();
      return (
        inDateRange(row.date) &&
        !isExcludedOperationalItem(row.key) &&
        (ignoreTeam || inSet(state.teams, row.team)) &&
        (ignoreAssignee || inSelectedAssignee(row.person)) &&
        inSet(state.skills, row.skill) &&
        inSelectedClient(row.delivery) &&
        (ignoreAccount || inSelectedAccount(row.account)) &&
        inSet(state.categories, row.category) &&
        inSet(state.priorities, row.priority) &&
        (ignoreStatus || !statusActive || inSelectedStatus(row.status)) &&
        inSet(state.targetReleases, row.targetRelease) &&
        (ignoreProgram || inSet(state.programs, programFilterValueForWorklog(row))) &&
        inSet(state.releases, row.releaseCycle)
      );
    });

    const capacity = raw.capacity.filter((row) => {
      return (
        selectedMasterDateWeeks.has(Number(row.week)) &&
        (ignoreTeam || inSet(state.teams, row.team)) &&
        (ignoreAssignee || inSelectedAssignee(row.assignee)) &&
        inSet(state.skills, row.skill)
      );
    });

    const bugTriage = (raw.bugTriage || []).filter((row) => {
      return (
        inSet(state.teams, row.team) &&
        inSelectedAssignee(row.assigneeCanonical || row.assignee) &&
        inSet(state.skills, row.skill) &&
        (!isStatusFilterActive() || inSelectedStatus(row.status))
      );
    });

    return { worklogs, backlog, backlogWorklogs, bugTriage, capacity };
  }

  function governedLoggedWorklogRows(options = {}) {
    const ignoreTeam = Boolean(options.ignoreTeam);
    const ignoreAssignee = Boolean(options.ignoreAssignee);
    const ignoreAccount = Boolean(options.ignoreAccount);
    const ignoreProgram = Boolean(options.ignoreProgram);
    const sourceRows = raw.backlogWorklogs || raw.worklogs;

    return sourceRows.map(enrichGovernedWorklog).filter((row) => {
      return (
        inDateRange(row.date) &&
        !isExcludedOperationalItem(row.key) &&
        (ignoreTeam || inSet(state.teams, row.team)) &&
        (ignoreAssignee || inSelectedAssignee(row.person)) &&
        inSet(state.skills, row.skill) &&
        inSelectedClient(row.delivery) &&
        (ignoreAccount || inSelectedAccount(row.account)) &&
        inSet(state.categories, row.category) &&
        inSet(state.priorities, row.priority) &&
        inSet(state.targetReleases, row.targetRelease) &&
        (ignoreProgram || inSet(state.programs, programFilterValueForWorklog(row))) &&
        inSet(state.releases, row.releaseCycle)
      );
    });
  }

  function managedLoggedScope(rows) {
    const worklogs = rows.filter((row) => validTeamSet.has(row.team));
    const unmanagedWorklogs = rows.filter((row) => !validTeamSet.has(row.team));
    return { worklogs, unmanagedWorklogs };
  }

  function reportGovernedLoggedScope(unmanagedWorklogs) {
    if (!unmanagedWorklogs.length) return;
    console.info("Governed Logged Hours unmanaged rows excluded", {
      reason: "Assignee/team cannot be governed through Assignees CSV",
      rows: unmanagedWorklogs.length,
      loggedHours: Number(sum(unmanagedWorklogs, "logged").toFixed(4)),
      assignees: Array.from(new Set(unmanagedWorklogs.map((row) => row.person || "(blank)"))).sort((a, b) => a.localeCompare(b)),
      keys: Array.from(new Set(unmanagedWorklogs.map((row) => row.key || "(blank)"))).sort((a, b) => a.localeCompare(b)),
    });
  }

  function buildUpdateContext() {
    const baseFiltered = filteredData({ ignoreStatus: true });
    const scope = managedLoggedScope(governedLoggedWorklogRows());
    reportGovernedLoggedScope(scope.unmanagedWorklogs);
    const effortData = {
      worklogs: scope.worklogs,
      backlog: baseFiltered.backlog.filter((row) => validTeamSet.has(backlogTeam(row))),
      capacity: baseFiltered.capacity.filter((row) => validTeamSet.has(row.team)),
      unmanagedWorklogs: scope.unmanagedWorklogs,
      baseFiltered,
    };
    const data = filteredData();
    const programWorklogs = managedLoggedScope(governedLoggedWorklogRows({ ignoreProgram: true })).worklogs;
    return { data, effortData, programWorklogs };
  }

  function loggedEffortData() {
    return buildUpdateContext().effortData;
  }

  function demandBacklogData() {
    return raw.backlog.filter((row) => {
      const rowTeam = backlogTeam(row);
      const rowSkill = backlogSkill(row);
      const release = row.release || "";
      return (
        validTeamSet.has(rowTeam) &&
        inSet(state.teams, rowTeam) &&
        inSelectedAssignee(row.assignee) &&
        inSet(state.skills, rowSkill) &&
        inSelectedClient(row.tempoClient) &&
        inSelectedAccount(row.account) &&
        inSet(state.priorities, row.priority) &&
        inSelectedStatus(row.status) &&
        inSet(state.targetReleases, row.targetRelease) &&
        inSet(state.programs, row.program) &&
        inSet(state.releases, release)
      );
    });
  }

  function programDistributionEffortData() {
    const scope = managedLoggedScope(governedLoggedWorklogRows({ ignoreProgram: true }));
    return scope.worklogs;
  }

  function peopleDetailData() {
    const data = filteredData({ ignoreStatus: true });
    const scope = managedLoggedScope(governedLoggedWorklogRows());
    return {
      worklogs: scope.worklogs,
      capacity: data.capacity.filter((row) => validTeamSet.has(row.team)),
    };
  }

  function sum(rows, field) {
    return rows.reduce((total, row) => total + (Number(row[field]) || 0), 0);
  }

  function distinctCount(rows, field) {
    return new Set(rows.map((row) => row[field]).filter(Boolean)).size;
  }

  function groupSum(rows, keyField, valueFields) {
    const map = new Map();
    rows.forEach((row) => {
      const key = row[keyField] || "(blank)";
      if (!map.has(key)) {
        map.set(key, { label: key });
        valueFields.forEach((field) => map.get(key)[field] = 0);
        map.get(key).count = 0;
      }
      const bucket = map.get(key);
      valueFields.forEach((field) => bucket[field] += Number(row[field]) || 0);
      bucket.count += 1;
    });
    return Array.from(map.values());
  }

  function groupCount(rows, keyField) {
    const map = new Map();
    rows.forEach((row) => {
      const key = row[keyField] || "(blank)";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map, ([label, count]) => ({ label, count }));
  }

  function groupDistinctCount(rows, keyField, distinctField) {
    const map = new Map();
    rows.forEach((row) => {
      const key = row[keyField] || "(blank)";
      const distinctValue = row[distinctField] || "";
      if (!distinctValue) return;
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(distinctValue);
    });
    return Array.from(map, ([label, values]) => ({ label, count: values.size }));
  }

  function top(list, field, limit = 10) {
    return list.sort((a, b) => (b[field] || 0) - (a[field] || 0)).slice(0, limit);
  }

  function parseTargetReleaseLabel(label) {
    const match = /^release-(\d{4})-(\d{2})(-lts)?$/i.exec(String(label || "").trim());
    if (!match) return null;
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return null;
    return {
      label: String(label || "").trim(),
      year,
      month,
      isLts: Boolean(match[3]),
    };
  }

  function compareTargetReleaseLabels(a, b) {
    const aLabel = String(a || "");
    const bLabel = String(b || "");
    if (aLabel === "(blank)" || bLabel === "(blank)") {
      if (aLabel === bLabel) return 0;
      return aLabel === "(blank)" ? -1 : 1;
    }
    if (aLabel === "not_required" || bLabel === "not_required") {
      if (aLabel === bLabel) return 0;
      return aLabel === "not_required" ? -1 : 1;
    }

    const parsedA = parseTargetReleaseLabel(aLabel);
    const parsedB = parseTargetReleaseLabel(bLabel);
    if (parsedA && parsedB) {
      return (
        parsedB.year - parsedA.year ||
        parsedB.month - parsedA.month ||
        Number(parsedA.isLts) - Number(parsedB.isLts) ||
        parsedA.label.localeCompare(parsedB.label)
      );
    }
    if (parsedA || parsedB) return parsedA ? -1 : 1;
    return aLabel.localeCompare(bLabel);
  }

  function sortTargetReleaseFacetRows(rows) {
    return rows.slice().sort((a, b) => compareTargetReleaseLabels(a.label, b.label));
  }

  function accountLabel(value) {
    const label = String(value || "").trim();
    return label && label !== "-" ? label : "";
  }

  function addAccountKey(map, account, key) {
    const label = accountLabel(account);
    const itemKey = String(key || "").trim();
    if (!label || !itemKey) return;
    if (!map.has(label)) map.set(label, new Set());
    map.get(label).add(itemKey);
  }

  function accountFacetRows() {
    const data = filteredData({ ignoreAccount: true });
    const tempoData = filteredData({ ignoreAccount: true, ignoreStatus: true });
    return groupAccounts(data.backlog, tempoData.worklogs, data.backlog)
      .filter((row) => row.itemCount || row.estimated || row.logged)
      .sort((a, b) => {
        if ((b.itemCount || 0) !== (a.itemCount || 0)) return (b.itemCount || 0) - (a.itemCount || 0);
        if ((b.logged || 0) !== (a.logged || 0)) return (b.logged || 0) - (a.logged || 0);
        if ((b.estimated || 0) !== (a.estimated || 0)) return (b.estimated || 0) - (a.estimated || 0);
        return String(a.account || "").localeCompare(String(b.account || ""));
      })
      .map((row) => ({ label: row.account, count: row.itemCount }));
  }

  function renderFacets() {
    const teamCounts = new Map(
      groupCount(raw.worklogs.filter((row) => validTeamSet.has(row.team)), "team")
        .map((row) => [row.label, row.count]),
    );
    const teams = masterTeamLabels().map((team) => ({ label: team, count: teamCounts.get(team) || 0 }));
    const assigneeCountRows = managedLoggedScope(governedLoggedWorklogRows({ ignoreAssignee: true })).worklogs
      .filter((row) => Number(row.logged) > 0);
    const assignees = top(
      groupSum(assigneeCountRows, "person", ["logged"]),
      "logged",
      120,
    )
      .map((row) => ({ label: row.label, count: row.logged }))
      .filter((row) => row.label.toLowerCase().includes(state.assigneeSearch.toLowerCase()))
      .slice(0, 40);
    const skills = masterSkillRows();
    const clientCounts = new Map();
    (raw.worklogs || []).forEach((row) => {
      const client = clientFilterValue(row.delivery);
      clientCounts.set(client, (clientCounts.get(client) || 0) + 1);
    });
    (raw.backlog || []).forEach((row) => {
      const client = clientFilterValue(row.tempoClient);
      clientCounts.set(client, (clientCounts.get(client) || 0) + 1);
    });
    const clients = Array.from(clientCounts, ([label, count]) => ({ label, count }))
      .sort((left, right) => left.label.localeCompare(right.label))
      .filter((row) => row.label.toLowerCase().includes(state.clientSearch.toLowerCase()));
    const accounts = accountFacetRows()
      .filter((row) => accountTableDisplayValue(row.label).toLowerCase().includes(state.accountSearch.toLowerCase()));
    const categories = top(groupCount(raw.worklogs, "category"), "count", 20);
    const priorities = top(groupCount(raw.worklogs, "priority"), "count", 20);
    const statuses = raw.statuses?.length
      ? raw.statuses.map((row) => ({ label: row.status, count: row.jiraRecords || 0 })).filter((row) => row.label)
      : top(groupCount(raw.backlog.filter((row) => row.status), "status"), "count", 80);
    const targetReleases = sortTargetReleaseFacetRows(groupCount(raw.worklogs, "targetRelease"))
      .filter((row) => row.label.toLowerCase().includes(state.targetReleaseSearch.toLowerCase()))
      .slice(0, 30);
    const programs = (raw.programs?.length
      ? raw.programs.map((row) => ({ label: row.program, count: row.count || 0 }))
      : top(groupCount(raw.backlog.filter((row) => row.program), "program"), "count", 80))
      .filter((row) => row.label.toLowerCase().includes(state.programSearch.toLowerCase()))
      .slice(0, 30);
    const releases = raw.releases
      .slice()
      .sort((a, b) => String(a.start || "").localeCompare(String(b.start || "")) || String(a.cycle || "").localeCompare(String(b.cycle || "")))
      .map((row) => ({ label: row.cycle, count: 0 }))
      .filter((row) => row.label);
    renderFacet("teamFacet", teams, state.teams, "teams", { showCounts: false });
    updateTeamPickerSummary(teams.length);
    renderFacet("assigneeFacet", assignees, state.assignees, "assignees", { countDigits: 1, countSuffix: "h" });
    updateAssigneePickerSummary(assignees.length);
    renderFacet("skillFacet", skills, state.skills, "skills");
    updateSkillPickerSummary(skills.length);
    renderFacet("clientFacet", clients, state.clients, "clients");
    updateClientPickerSummary(clients.length);
    renderFacet("accountFacet", accounts, state.accounts, "accounts", { labelFormatter: accountTableDisplayValue });
    updateAccountPickerSummary(accounts.length);
    renderFacet("categoryFacet", categories, state.categories, "categories");
    updateCategoryPickerSummary(categories.length);
    renderFacet("priorityFacet", priorities, state.priorities, "priorities");
    updatePriorityPickerSummary(priorities.length);
    renderFacet("statusFacet", statuses, state.statuses, "statuses");
    updateStatusPickerSummary(statuses.length);
    renderFacet("targetReleaseFacet", targetReleases, state.targetReleases, "targetReleases");
    updateTargetReleasePickerSummary(targetReleases.length);
    renderFacet("programFacet", programs, state.programs, "programs");
    updateProgramPickerSummary(programs.length);
    renderFacet("releaseFacet", releases, state.releases, "releases");
    updateReleasePickerSummary(releases.length);
  }

  function renderFacet(elementId, rows, set, stateKey, options = {}) {
    $(elementId).innerHTML = rows
      .map((row) => {
        const id = `${elementId}-${hash(row.label)}`;
        const checked = set.has(row.label) ? "checked" : "";
        const countDigits = options.countDigits ?? 0;
        const countSuffix = options.countSuffix || "";
        const displayLabel = options.labelFormatter ? options.labelFormatter(row.label, row) : row.label;
        const count = options.showCounts === false || (!options.showZeroCounts && !row.count)
          ? "<span></span>"
          : `<span class="facet-count">${formatNumber(row.count, countDigits)}${escapeHtml(countSuffix)}</span>`;
        return `
          <label class="facet" for="${id}" title="${escapeHtml(displayLabel)}">
            <input id="${id}" type="checkbox" data-state="${stateKey}" value="${escapeHtml(row.label)}" ${checked} />
            <span class="facet-name">${escapeHtml(displayLabel)}</span>
            ${count}
          </label>
        `;
      })
      .join("");
  }

  function updateReleasePickerSummary(availableCount = 0) {
    const selected = state.releases.size;
    const summary = $("releasePickerSummary");
    summary.textContent = selected ? `${formatNumber(selected)} selected` : "All cycles";
    summary.title = selected ? `${formatNumber(selected)} of ${formatNumber(availableCount)} cycles selected` : "All cycles included";
  }

  function releaseOptionValues() {
    return Array.from(document.querySelectorAll('#releaseFacet input[data-state="releases"]'))
      .map((input) => input.value);
  }

  function setReleasePickerOpen(open) {
    $("releasePickerMenu").hidden = !open;
    $("releasePickerToggle").setAttribute("aria-expanded", String(open));
  }

  function updateTeamPickerSummary(availableCount = 0) {
    const selected = state.teams.size;
    const summary = $("teamPickerSummary");
    summary.textContent = selected ? `${formatNumber(selected)} selected` : "All teams";
    summary.title = selected ? `${formatNumber(selected)} of ${formatNumber(availableCount)} teams selected` : "All teams included";
  }

  function teamOptionValues() {
    return Array.from(document.querySelectorAll('#teamFacet input[data-state="teams"]'))
      .map((input) => input.value);
  }

  function setTeamPickerOpen(open) {
    $("teamPickerMenu").hidden = !open;
    $("teamPickerToggle").setAttribute("aria-expanded", String(open));
  }

  function updateAssigneePickerSummary(availableCount = 0) {
    const selected = state.assignees.size;
    const summary = $("assigneePickerSummary");
    summary.textContent = selected ? `${formatNumber(selected)} selected` : "All assignees";
    summary.title = selected ? `${formatNumber(selected)} of ${formatNumber(availableCount)} assignees selected` : "All assignees included";
  }

  function assigneeOptionValues() {
    return Array.from(document.querySelectorAll('#assigneeFacet input[data-state="assignees"]'))
      .map((input) => input.value);
  }

  function setAssigneePickerOpen(open) {
    $("assigneePickerMenu").hidden = !open;
    $("assigneePickerToggle").setAttribute("aria-expanded", String(open));
  }

  function updateSkillPickerSummary(availableCount = 0) {
    const selected = state.skills.size;
    const summary = $("skillPickerSummary");
    summary.textContent = selected ? `${formatNumber(selected)} selected` : "All skills";
    summary.title = selected ? `${formatNumber(selected)} of ${formatNumber(availableCount)} skills selected` : "All skills included";
  }

  function skillOptionValues() {
    return Array.from(document.querySelectorAll('#skillFacet input[data-state="skills"]'))
      .map((input) => input.value);
  }

  function setSkillPickerOpen(open) {
    $("skillPickerMenu").hidden = !open;
    $("skillPickerToggle").setAttribute("aria-expanded", String(open));
  }

  function updateClientPickerSummary(availableCount = 0) {
    const selected = state.clients.size;
    const summary = $("clientPickerSummary");
    summary.textContent = selected ? `${formatNumber(selected)} selected` : "All clients";
    summary.title = selected ? `${formatNumber(selected)} of ${formatNumber(availableCount)} clients selected` : "All clients included";
  }

  function clientOptionValues() {
    return Array.from(document.querySelectorAll('#clientFacet input[data-state="clients"]'))
      .map((input) => input.value);
  }

  function setClientPickerOpen(open) {
    $("clientPickerMenu").hidden = !open;
    $("clientPickerToggle").setAttribute("aria-expanded", String(open));
  }

  function updateAccountPickerSummary(availableCount = 0) {
    const selected = state.accounts.size;
    const summary = $("accountPickerSummary");
    summary.textContent = selected ? `${formatNumber(selected)} selected` : "All accounts";
    summary.title = selected
      ? `${formatNumber(selected)} of ${formatNumber(availableCount)} accounts selected`
      : "All reportable accounts included.";
  }

  function accountOptionValues() {
    return Array.from(document.querySelectorAll('#accountFacet input[data-state="accounts"]'))
      .map((input) => input.value);
  }

  function setAccountPickerOpen(open) {
    $("accountPickerMenu").hidden = !open;
    $("accountPickerToggle").setAttribute("aria-expanded", String(open));
  }

  function updateCategoryPickerSummary(availableCount = 0) {
    const selected = state.categories.size;
    const summary = $("categoryPickerSummary");
    summary.textContent = selected ? `${formatNumber(selected)} selected` : "All categories";
    summary.title = selected ? `${formatNumber(selected)} of ${formatNumber(availableCount)} categories selected` : "All categories included";
  }

  function categoryOptionValues() {
    return Array.from(document.querySelectorAll('#categoryFacet input[data-state="categories"]'))
      .map((input) => input.value);
  }

  function setCategoryPickerOpen(open) {
    $("categoryPickerMenu").hidden = !open;
    $("categoryPickerToggle").setAttribute("aria-expanded", String(open));
  }

  function updatePriorityPickerSummary(availableCount = 0) {
    const selected = state.priorities.size;
    const summary = $("priorityPickerSummary");
    summary.textContent = selected ? `${formatNumber(selected)} selected` : "All priorities";
    summary.title = selected ? `${formatNumber(selected)} of ${formatNumber(availableCount)} priorities selected` : "All priorities included";
  }

  function priorityOptionValues() {
    return Array.from(document.querySelectorAll('#priorityFacet input[data-state="priorities"]'))
      .map((input) => input.value);
  }

  function setPriorityPickerOpen(open) {
    $("priorityPickerMenu").hidden = !open;
    $("priorityPickerToggle").setAttribute("aria-expanded", String(open));
  }

  function updateStatusPickerSummary(availableCount = 0) {
    const selected = state.statuses.size;
    const summary = $("statusPickerSummary");
    if (isDefaultStatusSelection()) {
      summary.textContent = "Default statuses";
      summary.title = `${formatNumber(selected)} of ${formatNumber(availableCount)} default open/active statuses selected`;
      return;
    }
    summary.textContent = selected ? `${formatNumber(selected)} selected` : "No statuses";
    summary.title = selected ? `${formatNumber(selected)} of ${formatNumber(availableCount)} statuses selected` : "No statuses selected";
  }

  function statusOptionValues() {
    return Array.from(document.querySelectorAll('#statusFacet input[data-state="statuses"]'))
      .map((input) => input.value);
  }

  function setStatusPickerOpen(open) {
    $("statusPickerMenu").hidden = !open;
    $("statusPickerToggle").setAttribute("aria-expanded", String(open));
  }

  function updateTargetReleasePickerSummary(availableCount = 0) {
    const selected = state.targetReleases.size;
    const summary = $("targetReleasePickerSummary");
    summary.textContent = selected ? `${formatNumber(selected)} selected` : "All target releases";
    summary.title = selected ? `${formatNumber(selected)} of ${formatNumber(availableCount)} target releases selected` : "All target releases included";
  }

  function targetReleaseOptionValues() {
    return Array.from(document.querySelectorAll('#targetReleaseFacet input[data-state="targetReleases"]'))
      .map((input) => input.value);
  }

  function setTargetReleasePickerOpen(open) {
    $("targetReleasePickerMenu").hidden = !open;
    $("targetReleasePickerToggle").setAttribute("aria-expanded", String(open));
  }

  function updateProgramPickerSummary(availableCount = 0) {
    const selected = state.programs.size;
    const summary = $("programPickerSummary");
    summary.textContent = selected ? `${formatNumber(selected)} selected` : "All programs";
    summary.title = selected ? `${formatNumber(selected)} of ${formatNumber(availableCount)} programs selected` : "All programs included";
  }

  function programOptionValues() {
    return Array.from(document.querySelectorAll('#programFacet input[data-state="programs"]'))
      .map((input) => input.value);
  }

  function setProgramPickerOpen(open) {
    $("programPickerMenu").hidden = !open;
    $("programPickerToggle").setAttribute("aria-expanded", String(open));
  }

  function hash(value) {
    let h = 0;
    for (let i = 0; i < value.length; i += 1) h = Math.imul(31, h) + value.charCodeAt(i) | 0;
    return Math.abs(h);
  }

  function renderKpis() {
    const sourceKpis = raw.meta.sourceKpis || {};
    const legalHours = Number(sourceKpis.annualWorkforceLegalHours) || 0;
    const annualCapacity = Number(sourceKpis.annualWorkforceCapacity) || 0;
    const actualHours = Number(sourceKpis.actualHours) || 0;
    const demandCapacity = Number(sourceKpis.demandCapacity) || 0;
    const remainingHours = annualCapacity - actualHours;
    const utilization = annualCapacity ? actualHours / annualCapacity : 0;

    const kpis = [
      { label: "Annual Workforce Legal Hours", value: formatNumber(legalHours, 1), note: "Actual Annual Hours for the six governed global-filter teams.", color: colors.slate },
      { label: "Annual Workforce Capacity", value: formatNumber(annualCapacity, 1), note: "Sum of Weekly Capacity Planned Hours (column J).", color: colors.teal },
      { label: "Actual Hours", value: formatNumber(actualHours, 1), note: "Sum of RAW_DATA_FULL_ANALYSIS Logged Hours.", color: colors.blue },
      { label: "Remaining Period Capacity", value: formatNumber(remainingHours, 1), note: "Annual Workforce Capacity minus Actual Hours.", color: remainingHours < 0 ? colors.red : colors.green },
      { label: "Annual Capacity Utilization", value: formatPercent(utilization), note: "Actual Hours divided by Annual Workforce Capacity.", color: utilization > 1 ? colors.amber : colors.violet },
      { label: "Demand Capacity", value: formatNumber(demandCapacity, 1), note: "Sum of Jira Effort Cap.", color: colors.violet },
    ];

    $("generalKpiGrid").innerHTML = kpis
      .map((kpi) => `
        <article class="kpi-card">
          <span><i class="tone" style="background:${kpi.color}"></i>${escapeHtml(kpi.label)}</span>
          <strong>${kpi.value}</strong>
          <small>${escapeHtml(kpi.note)}</small>
        </article>
      `)
      .join("");
  }

  function renderActiveFilters() {
    const chips = [];
    const filterSpecs = [
      ["teams", "Team"],
      ["assignees", "Assignee"],
      ["skills", "Skill"],
      ["clients", "Client"],
      ["accounts", "Account"],
      ["categories", "Category"],
      ["priorities", "Priority"],
      ["statuses", "Status"],
      ["targetReleases", "Target Release"],
      ["programs", "Program"],
      ["releases", "Release"],
    ];
    filterSpecs.forEach(([key, label]) => {
      if (key === "statuses") {
        if (!isDefaultStatusSelection()) {
          const selectedStatuses = Array.from(state.statuses).sort((a, b) => a.localeCompare(b));
          if (selectedStatuses.length <= 3) {
            selectedStatuses.forEach((value) => chips.push({ key, label, value }));
          } else {
            chips.push({ key, label, value: `${formatNumber(state.statuses.size)} selected`, resetDefaultStatuses: true });
          }
        }
        return;
      }
      if (key === "teams") {
        const selectedTeams = Array.from(state.teams).sort((a, b) => a.localeCompare(b));
        if (selectedTeams.length > 3) {
          chips.push({ key, label, value: `${formatNumber(selectedTeams.length)} selected`, clearSet: true });
        } else {
          selectedTeams.forEach((value) => chips.push({ key, label, value }));
        }
        return;
      }
      if (key === "assignees") {
        const selectedAssignees = Array.from(state.assignees).sort((a, b) => a.localeCompare(b));
        if (selectedAssignees.length > 3) {
          chips.push({ key, label, value: `${formatNumber(selectedAssignees.length)} selected`, clearSet: true });
        } else {
          selectedAssignees.forEach((value) => chips.push({ key, label, value }));
        }
        return;
      }
      if (key === "skills") {
        const selectedSkills = Array.from(state.skills).sort((a, b) => a.localeCompare(b));
        if (selectedSkills.length > 3) {
          chips.push({ key, label, value: `${formatNumber(selectedSkills.length)} selected`, clearSet: true });
        } else {
          selectedSkills.forEach((value) => chips.push({ key, label, value }));
        }
        return;
      }
      if (key === "accounts") {
        const selectedAccounts = Array.from(state.accounts).sort((a, b) => a.localeCompare(b));
        if (selectedAccounts.length > 3) {
          chips.push({ key, label, value: `${formatNumber(selectedAccounts.length)} selected`, clearSet: true });
        } else {
          selectedAccounts.forEach((value) => chips.push({ key, label, value: accountTableDisplayValue(value), rawValue: value }));
        }
        return;
      }
      if (key === "categories") {
        const selectedCategories = Array.from(state.categories).sort((a, b) => a.localeCompare(b));
        if (selectedCategories.length > 3) {
          chips.push({ key, label, value: `${formatNumber(selectedCategories.length)} selected`, clearSet: true });
        } else {
          selectedCategories.forEach((value) => chips.push({ key, label, value }));
        }
        return;
      }
      if (key === "priorities") {
        const selectedPriorities = Array.from(state.priorities);
        if (selectedPriorities.length > 3) {
          chips.push({ key, label, value: `${formatNumber(selectedPriorities.length)} selected`, clearSet: true });
        } else {
          selectedPriorities.forEach((value) => chips.push({ key, label, value }));
        }
        return;
      }
      if (key === "targetReleases") {
        const selectedTargetReleases = Array.from(state.targetReleases).sort((a, b) => a.localeCompare(b));
        if (selectedTargetReleases.length > 3) {
          chips.push({ key, label, value: `${formatNumber(selectedTargetReleases.length)} selected`, clearSet: true });
        } else {
          selectedTargetReleases.forEach((value) => chips.push({ key, label, value }));
        }
        return;
      }
      if (key === "programs") {
        const selectedPrograms = Array.from(state.programs).sort((a, b) => a.localeCompare(b));
        if (selectedPrograms.length > 3) {
          chips.push({ key, label, value: `${formatNumber(selectedPrograms.length)} selected`, clearSet: true });
        } else {
          selectedPrograms.forEach((value) => chips.push({ key, label, value }));
        }
        return;
      }
      state[key].forEach((value) => chips.push({ key, label, value }));
    });

    $("activeFilters").innerHTML = chips
      .map((chip) => {
        const action = chip.resetDefaultStatuses
          ? 'data-reset-default-statuses="true"'
          : chip.clearSet
            ? `data-clear-key="${chip.key}"`
            : `data-remove-key="${chip.key}" data-remove-value="${escapeHtml(chip.rawValue ?? chip.value)}"`;
        const ariaLabel = chip.clearSet ? `Clear ${chip.label} selection` : `Remove ${chip.value}`;
        return `
        <span class="chip">${chip.label}: ${escapeHtml(chip.value)}
          <button type="button" ${action} aria-label="${escapeHtml(ariaLabel)}">x</button>
        </span>
      `;
      })
      .join("");
  }

  function renderCharts(data, effortData, programWorklogs = programDistributionEffortData()) {
    renderTrendChart(effortData.worklogs);
    renderPlanningChart(effortData.worklogs || []);
    renderProgramPieChart(programWorklogs);
    renderBugSeverityDistributionChart(data.backlog || []);
    renderAccountTreemap(data, effortData.baseFiltered.worklogs);
    renderTeamChart(effortData.worklogs, effortData.capacity);
    renderRemainingDemandChart(effortData.worklogs, demandBacklogData());
    renderPriorityChart(data.backlog);
    renderEngineeringWorkMixChart(effortData.worklogs || []);
    renderTypeChart(data.worklogs);
  }

  function chartParts(containerId) {
    const frame = $(containerId);
    const canvas = frame.querySelector(".chart-canvas") || frame;
    const meta = frame.querySelector(".chart-meta");
    return { frame, canvas, meta };
  }

  function resetChartFrame(containerId) {
    const { canvas, meta } = chartParts(containerId);
    canvas.innerHTML = "";
    if (meta) meta.innerHTML = "";
  }

  function chartContentTarget(containerId) {
    const { frame, meta } = chartParts(containerId);
    return meta || frame;
  }

  function chartSvg(containerId, height = 320) {
    resetChartFrame(containerId);
    const { canvas } = chartParts(containerId);
    const width = Math.max(360, canvas.clientWidth || 640);
    const resolvedHeight = Math.max(height, canvas.clientHeight || 0);
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("role", "img");
    const chartLabels = {
      trendChart: "Logged and billable hours trend",
      planningChart: "Planned versus unplanned effort",
      programPieChart: "Logged hours by program",
      bugSeverityChart: "Bug severity distribution",
      teamChart: "Team capacity and utilization",
      demandChart: "Remaining demand versus logged effort by team",
      engineeringMixChart: "Engineering work mix",
    };
    svg.setAttribute("aria-label", chartLabels[containerId] || "Dashboard chart");
    svg.style.height = `${resolvedHeight}px`;
    canvas.appendChild(svg);
    return { el: canvas, svg, width, height: resolvedHeight };
  }

  function emptyChart(containerId, message) {
    resetChartFrame(containerId);
    chartParts(containerId).canvas.innerHTML = `<div class="chart-empty">${escapeHtml(message)}</div>`;
  }

  function addSvg(svg, tag, attrs, text) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    svg.appendChild(node);
    return node;
  }

  function addTitle(node, text) {
    const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
    title.textContent = text;
    node.appendChild(title);
    return node;
  }

  function renderTrendChart(worklogs) {
    const grain = state.trendGrain;
    const rows = Array.from(
      worklogs.reduce((map, row) => {
        const key = grain === "week" ? `W${String(row.week).padStart(2, "0")}` : row.month;
        if (!map.has(key)) map.set(key, { label: key, logged: 0, billable: 0 });
        map.get(key).logged += Number(row.logged) || 0;
        map.get(key).billable += Number(row.billable) || 0;
        return map;
      }, new Map()).values(),
    ).sort((a, b) => a.label.localeCompare(b.label));

    if (!rows.length) return emptyChart("trendChart", "No worklog data for the selected filters.");

    const { svg, width, height } = chartSvg("trendChart", 290);
    const margin = { top: 18, right: 24, bottom: 54, left: 62 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const maxY = Math.max(...rows.map((row) => Math.max(row.logged, row.billable))) * 1.12 || 1;
    const x = (i) => margin.left + (rows.length === 1 ? innerW / 2 : (i / (rows.length - 1)) * innerW);
    const y = (v) => margin.top + innerH - (v / maxY) * innerH;

    drawGrid(svg, margin, innerW, innerH, maxY);
    drawLine(svg, rows, "logged", x, y, colors.blue);
    drawLine(svg, rows, "billable", x, y, colors.amber);

    rows.forEach((row, i) => {
      if (i % Math.ceil(rows.length / 8) === 0 || rows.length <= 8) {
        addSvg(svg, "text", { x: x(i), y: height - 20, "text-anchor": "middle", fill: colors.muted, "font-size": 11 }, row.label);
      }
    });
    addLegend("trendChart", [
      ["Logged", colors.blue],
      ["Billable", colors.amber],
    ]);
  }

  function drawGrid(svg, margin, innerW, innerH, maxY) {
    for (let i = 0; i <= 4; i += 1) {
      const y = margin.top + (innerH / 4) * i;
      addSvg(svg, "line", { x1: margin.left, x2: margin.left + innerW, y1: y, y2: y, stroke: colors.grid, "stroke-dasharray": "4 4" });
      const value = maxY - (maxY / 4) * i;
      addSvg(svg, "text", { x: margin.left - 10, y: y + 4, "text-anchor": "end", fill: colors.muted, "font-size": 11 }, compact(value));
    }
  }

  function drawLine(svg, rows, field, x, y, color) {
    const points = rows.map((row, i) => `${x(i)},${y(row[field])}`).join(" ");
    addSvg(svg, "polyline", { points, fill: "none", stroke: color, "stroke-width": 3, "stroke-linecap": "round", "stroke-linejoin": "round" });
    rows.forEach((row, i) => addSvg(svg, "circle", { cx: x(i), cy: y(row[field]), r: 3.5, fill: color }));
  }

  function renderTeamChart(worklogs, capacity) {
    const loggedByTeam = new Map(
      groupSum(worklogs.filter((row) => validTeamSet.has(row.team)), "team", ["logged"])
        .map((row) => [row.label, row.logged]),
    );
    const capacityByTeam = new Map(
      groupSum(capacity.filter((row) => validTeamSet.has(row.team)), "team", ["planned"])
        .map((row) => [row.label, row.planned]),
    );
    const rows = activeTeamLabels().map((team) => ({
      label: team,
      logged: loggedByTeam.get(team) || 0,
      planned: capacityByTeam.get(team) || 0,
    })).map((row) => ({
      ...row,
      variance: (row.planned || 0) - (row.logged || 0),
      utilization: row.planned ? (row.logged || 0) / row.planned : 0,
    }));
    if (!rows.length) return emptyChart("teamChart", "No team data for the selected filters.");
    utilizationBars("teamChart", rows);
  }

  function renderRemainingDemandChart(worklogs, backlog) {
    const loggedByTeam = new Map(
      groupSum(worklogs.filter((row) => validTeamSet.has(row.team)), "team", ["logged"])
        .map((row) => [row.label, row.logged]),
    );
    const remainingByTeam = new Map();
    backlog.forEach((row) => {
      const team = backlogTeam(row);
      if (!validTeamSet.has(team)) return;
      remainingByTeam.set(team, (remainingByTeam.get(team) || 0) + (Number(row.remainingEstimateHours) || 0));
    });

    const rows = activeTeamLabels().map((team) => ({
      label: team,
      logged: loggedByTeam.get(team) || 0,
      remaining: remainingByTeam.get(team) || 0,
    }));

    if (!rows.length) return emptyChart("demandChart", "No remaining demand or logged effort data for the selected filters.");
    remainingDemandBars("demandChart", rows);
  }

  function renderPriorityChart(backlog) {
    const rows = top(groupCount(backlog, "priority"), "count", 8);
    if (!rows.length) return emptyChart("priorityChart", "No backlog for the selected filters.");
    horizontalBars("priorityChart", rows, "count", colors.red, "priorities");
  }

  function renderTypeChart(worklogs) {
    const rows = top(groupCount(worklogs.filter((row) => String(row.itemType || "").trim()), "itemType"), "count", 7);
    if (!rows.length) return emptyChart("typeChart", "No Jira issue type data for the selected filters.");
    horizontalBars("typeChart", rows, "count", colors.violet, null);
  }

  function bugSeverityDistributionRows(backlogRows) {
    const counts = new Map(BUG_SEVERITY_DISTRIBUTION_ORDER.map((severity) => [severity, 0]));
    const seenKeys = new Set();

    (backlogRows || []).forEach((row) => {
      if (String(row.type || "").trim().toLowerCase() !== "bug") return;
      const key = String(row.key || "").trim();
      if (!key || seenKeys.has(key)) return;
      seenKeys.add(key);
      const severity = String(row.bugSeverity || "").trim();
      if (counts.has(severity)) counts.set(severity, counts.get(severity) + 1);
    });

    return BUG_SEVERITY_DISTRIBUTION_ORDER
      .map((severity) => ({
        label: severity,
        count: counts.get(severity),
      }))
      .filter((row) => row.count > 0);
  }

  function renderBugSeverityDistributionChart(backlogRows) {
    const rows = bugSeverityDistributionRows(backlogRows);
    if (!rows.length) {
      return emptyChart("bugSeverityChart", "No Major, Blocker, or Critical Jira bugs for the selected filters.");
    }
    horizontalBars("bugSeverityChart", rows, "count", (row) => BUG_SEVERITY_DISTRIBUTION_COLORS[row.label], null, {
      height: 220,
      maxRowHeight: 46,
      tooltip: (row) => `${row.label}\n${formatNumber(row.count)} Bugs`,
    });
  }

  function renderEngineeringWorkMixChart(worklogs) {
    const mix = engineeringWorkMixRows(worklogs);
    if (!mix.engineeringLoggedHours) {
      logEngineeringWorkMixValidation(mix);
      return emptyChart("engineeringMixChart", "No governed engineering effort for the selected filters.");
    }
    engineeringWorkMixDonut("engineeringMixChart", mix);
    logEngineeringWorkMixValidation(mix);
  }

  function renderAccountTreemap(data, tempoWorklogs) {
    const scope = accountDistributionScope(tempoWorklogs || []);
    const rows = accountTreemapRows(data, scope.tempoAccounts);
    const totalLogged = rows.reduce((total, row) => total + row.logged, 0);
    if (!rows.length || totalLogged <= 0) {
      emptyChart("accountTreemap", "No account-attributed engineering effort for the selected filters.");
      renderAccountAttributionExceptionFooter(scope.exceptions);
      return;
    }

    const { svg, width, height } = chartSvg("accountTreemap", 390);
    const tiles = treemapTiles(rows, { x: 0, y: 0, width, height });
    const renderedTotal = tiles.reduce((total, tile) => total + tile.data.logged, 0);
    if (Math.abs(renderedTotal - totalLogged) > 0.0001) {
      console.error("Account Distribution total mismatch", { expected: totalLogged, actual: renderedTotal });
    }

    tiles.forEach((tile) => {
      const row = tile.data;
      const selected = state.accounts.has(row.filterValue);
      const fill = accountTreemapFill(row.filterValue);
      const stroke = selected ? colors.text : "rgba(255,255,255,0.9)";
      const percentage = totalLogged ? row.logged / totalLogged : 0;
      const group = addSvg(svg, "g", {
        class: `treemap-tile clickable${selected ? " selected" : ""}`,
        "data-account": row.filterValue,
        "data-logged": String(row.logged),
        "data-percent": String(percentage),
      });
      const rect = addSvg(group, "rect", {
        x: tile.x,
        y: tile.y,
        width: Math.max(0, tile.width),
        height: Math.max(0, tile.height),
        rx: 3,
        fill,
        stroke,
        "stroke-width": selected ? 3 : 1,
      });
      addTitle(group, accountTreemapTooltip(row, percentage));
      group.addEventListener("click", (event) => {
        if (!(event.ctrlKey || event.metaKey)) {
          const onlySelected = state.accounts.size === 1 && state.accounts.has(row.filterValue);
          state.accounts.clear();
          if (!onlySelected) state.accounts.add(row.filterValue);
          update();
          return;
        }
        toggleFilter("accounts", row.filterValue);
      });

      const labelPad = 8;
      const labelWidth = Math.max(0, tile.width - labelPad * 2);
      const canShowLabel = tile.width >= 68 && tile.height >= 48;
      const canShowDetails = tile.width >= 92 && tile.height >= 72;
      const textFill = colors.text;
      if (canShowLabel) {
        const maxChars = Math.max(6, Math.floor(labelWidth / 7));
        addSvg(group, "text", {
          x: tile.x + labelPad,
          y: tile.y + 18,
          fill: textFill,
          "font-size": 12,
          "font-weight": 800,
        }, truncate(row.accountDisplay, maxChars));
      }
      if (canShowDetails) {
        addSvg(group, "text", {
          x: tile.x + labelPad,
          y: tile.y + 38,
          fill: textFill,
          "font-size": 12,
          "font-weight": 700,
        }, `${formatNumber(row.logged, 1)} h`);
        addSvg(group, "text", {
          x: tile.x + labelPad,
          y: tile.y + 56,
          fill: textFill,
          "font-size": 11,
        }, formatPercent(percentage));
      }
      rect.setAttribute("aria-label", `${row.accountDisplay}: ${formatNumber(row.logged, 1)} hours, ${formatPercent(percentage)}`);
    });

    addTreemapSummary(totalLogged);
    renderAccountAttributionExceptionFooter(scope.exceptions);
  }

  function renderProgramPieChart(worklogs) {
    const { rows, unresolvedRows } = programDistributionRows(worklogs);
    const programMappedLogged = rows.reduce((total, row) => total + row.logged, 0);
    const governedLoggedTotal = programDistributionExpectedTotal(worklogs);
    const unmappedLogged = Math.max(0, governedLoggedTotal - programMappedLogged);
    if (!rows.length || programMappedLogged <= 0) {
      logProgramDistributionValidation(rows, governedLoggedTotal, unresolvedRows);
      return emptyChart("programPieChart", "No Program effort for the selected filters.");
    }

    const chartHeight = 390;
    const { svg, width, height } = chartSvg("programPieChart", chartHeight);
    const centerX = Math.round(width * 0.5);
    const centerY = Math.round(height * 0.42);
    const radius = Math.max(78, Math.min(122, Math.min(width * 0.22, height * 0.32)));
    let startAngle = -Math.PI / 2;

    const labelPlacements = [];
    rows.forEach((row, index) => {
      const percentage = programMappedLogged ? row.logged / programMappedLogged : 0;
      const endAngle = startAngle + percentage * Math.PI * 2;
      const midAngle = startAngle + (endAngle - startAngle) / 2;
      const slice = percentage >= 0.999999
        ? addSvg(svg, "circle", {
          cx: centerX,
          cy: centerY,
          r: radius,
          fill: programPieFill(index),
          stroke: "#ffffff",
          "stroke-width": 2,
        })
        : addSvg(svg, "path", {
          d: pieSlicePath(centerX, centerY, radius, startAngle, endAngle),
          fill: programPieFill(index),
          stroke: "#ffffff",
          "stroke-width": 2,
        });
      addTitle(slice, programPieTooltip(row, percentage));
      labelPlacements.push({ row, index, percentage, midAngle });
      startAngle = endAngle;
    });

    labelPlacements.forEach(({ row, index, percentage, midAngle }) => {
      const internalRadius = percentage < 0.06 ? radius * 0.78 : radius * 0.6;
      const x = centerX + Math.cos(midAngle) * internalRadius;
      const y = centerY + Math.sin(midAngle) * internalRadius;
      addSvg(svg, "text", {
        x,
        y: y - 4,
        "text-anchor": "middle",
        fill: colors.text,
        "font-size": percentage < 0.06 ? 9 : 11,
        "font-weight": 700,
      }, `${formatNumber(row.logged, 1)} h`);
      addSvg(svg, "text", {
        x,
        y: y + 11,
        "text-anchor": "middle",
        fill: colors.text,
        "font-size": percentage < 0.06 ? 9 : 11,
        "font-weight": 700,
      }, formatPercent(percentage));

      const outside = programCalloutPosition(row, width, centerX, centerY, radius, midAngle);
      const edge = polarPoint(centerX, centerY, radius * 0.98, midAngle);
      addSvg(svg, "line", {
        x1: edge.x,
        y1: edge.y,
        x2: outside.x + (outside.anchor === "start" ? -6 : 6),
        y2: outside.y,
        stroke: programPieFill(index),
        "stroke-width": 1.5,
      });
      addSvg(svg, "text", {
        x: outside.x,
        y: outside.y + 4,
        "text-anchor": outside.anchor,
        fill: colors.text,
        "font-size": 11,
        "font-weight": 800,
      }, truncate(row.label, width < 560 ? 18 : 30));
    });

    addProgramTotalMetric(svg, width / 6, height, ["Program-mapped", "Logged Hours"], programMappedLogged);
    addProgramTotalMetric(svg, width / 2, height, ["Governed", "Logged Total"], governedLoggedTotal);
    addProgramTotalMetric(svg, (width * 5) / 6, height, ["Unmapped / Non-Program", "Logged Hours"], unmappedLogged);

    logProgramDistributionValidation(rows, governedLoggedTotal, unresolvedRows);
  }

  function renderPlanningChart(worklogs) {
    const rows = planningEffortRows(worklogs);
    const totalFilteredHours = rows.reduce((total, row) => total + row.logged, 0);
    if (!rows.length || totalFilteredHours <= 0) {
      return emptyChart("planningChart", "No Tempo logged hours for the selected filters.");
    }

    const planned = rows.find((row) => row.category === "Planned") || planningBucket("Planned");
    const unplanned = rows.find((row) => row.category === "Unplanned") || planningBucket("Unplanned");
    const operations = rows.find((row) => row.category === "Operations") || planningBucket("Operations");
    const unclassified = rows.find((row) => row.category === "Unclassified") || planningBucket("Unclassified");
    const classifiedHours = planned.logged + unplanned.logged;
    const barRows = [planned, unplanned];
    const { svg, width, height } = chartSvg("planningChart", 250);
    const margin = { top: 24, right: 26, bottom: 52, left: 44 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const maxCount = Math.max(...barRows.map((row) => row.itemCount), 1);
    const band = innerW / barRows.length;
    const barW = Math.max(58, Math.min(110, band * 0.45));
    const fills = {
      Planned: "#b8d5ee",
      Unplanned: "#e7b4ab",
    };

    drawGrid(svg, margin, innerW, innerH, maxCount);
    barRows.forEach((row, index) => {
      const barHeight = (row.itemCount / maxCount) * innerH;
      const x = margin.left + index * band + (band - barW) / 2;
      const y = margin.top + innerH - barHeight;
      const fill = fills[row.category];
      const tooltip = [
        row.category,
        `Distinct Tempo issue keys: ${formatNumber(row.itemCount)}`,
        `Tempo logged hours: ${formatNumber(row.logged, 1)}`,
        `Classified effort: ${classifiedHours ? formatPercent(row.logged / classifiedHours) : "n/a"}`,
      ].join("\n");
      const rect = addSvg(svg, "rect", {
        x,
        y,
        width: barW,
        height: Math.max(0, barHeight),
        rx: 3,
        fill,
      });
      addTitle(rect, tooltip);
      addSvg(svg, "text", {
        x: x + barW / 2,
        y: barHeight > 24 ? y + Math.min(28, barHeight / 2 + 5) : y - 8,
        "text-anchor": "middle",
        fill: barHeight > 24 ? "#ffffff" : colors.text,
        "font-size": 18,
        "font-weight": 800,
      }, formatNumber(row.itemCount));
      addSvg(svg, "text", {
        x: x + barW / 2,
        y: margin.top + innerH + 18,
        "text-anchor": "middle",
        fill: colors.text,
        "font-size": 12,
        "font-weight": 800,
      }, row.category);
    });

    addPlanningSummary({ planned, unplanned, operations, unclassified, classifiedHours });
    logPlanningValidation(rows, totalFilteredHours);
  }

  function planningBucket(category) {
    return {
      category,
      logged: 0,
      itemCount: 0,
      inheritedKeys: new Set(),
      ownLabelKeys: new Set(),
      parentLabelKeys: new Set(),
      ancestorLabelKeys: new Set(),
      conflictKeys: new Set(),
      operationalKeys: new Set(),
      unclassifiedReasons: new Map(),
      keys: new Set(),
    };
  }

  function planningCategory(row) {
    const key = String(row.key || "").trim().toUpperCase();
    if (isTempoWorkItem(key)) return "Operations";
    const category = String(row.planningCategory || "").trim();
    if (category === "Operations") return category;
    if (category === "Planned" || category === "Unplanned") return category;
    return "Unclassified";
  }

  function planningEffortRows(worklogs) {
    const byKey = new Map();
    worklogs.forEach((row) => {
      const key = String(row.key || "(missing key)").trim().toUpperCase();
      if (!byKey.has(key)) {
        const category = planningCategory(row);
        byKey.set(key, {
          key,
          category,
          logged: 0,
          metadataSource: row.planningMetadataSource || "",
          inherited: row.planningMetadataSource === "Jira parent label" || row.planningMetadataSource === "Jira ancestor label",
          conflict: row.planningConflict === true || row.planningParentConflict === true,
          operational: category === "Operations",
          unclassifiedReason: row.planningUnclassifiedReason || "",
        });
      }
      const item = byKey.get(key);
      item.logged += Number(row.logged) || 0;
      if (!item.metadataSource && row.planningMetadataSource) item.metadataSource = row.planningMetadataSource;
      item.inherited = item.inherited || row.planningMetadataSource === "Jira parent label";
      item.inherited = item.inherited || row.planningMetadataSource === "Jira ancestor label";
      item.conflict = item.conflict || row.planningConflict === true || row.planningParentConflict === true;
      item.operational = item.operational || planningCategory(row) === "Operations";
      if (!item.unclassifiedReason && row.planningUnclassifiedReason) item.unclassifiedReason = row.planningUnclassifiedReason;
    });

    const buckets = new Map([
      ["Planned", planningBucket("Planned")],
      ["Unplanned", planningBucket("Unplanned")],
      ["Operations", planningBucket("Operations")],
      ["Unclassified", planningBucket("Unclassified")],
    ]);

    byKey.forEach((item) => {
      const bucket = buckets.get(item.category) || buckets.get("Unclassified");
      bucket.logged += item.logged;
      bucket.keys.add(item.key);
      if (item.inherited) bucket.inheritedKeys.add(item.key);
      if (item.metadataSource === "Jira issue label") bucket.ownLabelKeys.add(item.key);
      if (item.metadataSource === "Jira parent label") bucket.parentLabelKeys.add(item.key);
      if (item.metadataSource === "Jira ancestor label") bucket.ancestorLabelKeys.add(item.key);
      if (item.conflict) bucket.conflictKeys.add(item.key);
      if (item.operational) bucket.operationalKeys.add(item.key);
      if (item.category === "Unclassified" && item.unclassifiedReason) {
        bucket.unclassifiedReasons.set(
          item.unclassifiedReason,
          (bucket.unclassifiedReasons.get(item.unclassifiedReason) || 0) + 1,
        );
      }
    });

    return Array.from(buckets.values()).map((bucket) => ({
      ...bucket,
      itemCount: bucket.keys.size,
    }));
  }

  function addPlanningSummary({ planned, unplanned, operations, unclassified, classifiedHours }) {
    const el = chartContentTarget("planningChart");
    const plannedPercent = classifiedHours ? planned.logged / classifiedHours : 0;
    const unplannedPercent = classifiedHours ? unplanned.logged / classifiedHours : 0;
    const summary = document.createElement("div");
    summary.className = "planning-summary";
    summary.innerHTML = [
      planningSummaryRow("Planned", `${formatNumber(planned.logged, 1)} h (${formatPercent(plannedPercent)})`),
      planningSummaryRow("Unplanned", `${formatNumber(unplanned.logged, 1)} h (${formatPercent(unplannedPercent)})`),
      planningSummaryRow("Operations", `${formatNumber(operations.logged, 1)} h`),
      planningSummaryRow("Unclassified", `${formatNumber(unclassified.logged, 1)} h`),
      `<div class="planning-note">Planned/Unplanned % excludes Operations and Unclassified work.</div>`,
    ].join("");
    el.appendChild(summary);
  }

  function planningSummaryRow(label, value) {
    return `<div class="planning-summary-row"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(value)}</span></div>`;
  }

  function logPlanningValidation(rows, totalFilteredHours) {
    const byCategory = new Map(rows.map((row) => [row.category, row]));
    const planned = byCategory.get("Planned") || planningBucket("Planned");
    const unplanned = byCategory.get("Unplanned") || planningBucket("Unplanned");
    const operations = byCategory.get("Operations") || planningBucket("Operations");
    const unclassified = byCategory.get("Unclassified") || planningBucket("Unclassified");
    const reconciledTotal = planned.logged + unplanned.logged + operations.logged + unclassified.logged;
    const inheritedLabelCount = rows.reduce((total, row) => total + row.inheritedKeys.size, 0);
    const ownLabelCount = rows.reduce((total, row) => total + row.ownLabelKeys.size, 0);
    const parentLabelCount = rows.reduce((total, row) => total + row.parentLabelKeys.size, 0);
    const ancestorLabelCount = rows.reduce((total, row) => total + row.ancestorLabelKeys.size, 0);
    const conflictingLabelCount = rows.reduce((total, row) => total + row.conflictKeys.size, 0);
    const operationalKeyCount = operations.operationalKeys.size;
    const reconcilesExactly = Math.abs(reconciledTotal - totalFilteredHours) < 0.000001;
    const unclassifiedReasons = Object.fromEntries(unclassified.unclassifiedReasons);
    console.debug("Planned vs Unplanned Effort validation", {
      totalFilteredTempoHoursAfterExclusions: Number(totalFilteredHours.toFixed(4)),
      plannedHours: Number(planned.logged.toFixed(4)),
      unplannedHours: Number(unplanned.logged.toFixed(4)),
      operationsHours: Number(operations.logged.toFixed(4)),
      unclassifiedHours: Number(unclassified.logged.toFixed(4)),
      plannedUnplannedOperationsUnclassifiedTotal: Number(reconciledTotal.toFixed(4)),
      inheritedLabelCount,
      ownLabelCount,
      parentLabelCount,
      ancestorLabelCount,
      conflictingLabelCount,
      operationalKeysCount: operationalKeyCount,
      tempoOperationalKeysCount: operationalKeyCount,
      unclassifiedReasons,
      totalsReconcileExactly: reconcilesExactly,
    });
  }

  function engineeringWorkMixBucket(label) {
    return {
      label,
      logged: 0,
      keys: new Set(),
    };
  }

  function isTechnicalDebtValue(value) {
    return String(value || "").trim().toLowerCase() === "yes";
  }

  function isBugWorkType(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "bug" || normalized.endsWith(" bug") || normalized.includes("- bug");
  }

  function engineeringWorkMixCategory(item) {
    if (item.operational) return "Operations";
    if (isBugWorkType(item.itemType)) return "Bugs";
    if (isTechnicalDebtValue(item.technicalDebt)) return "Technical Debt";
    return "Rest";
  }

  function engineeringWorkMixRows(worklogs) {
    const byKey = new Map();
    worklogs.forEach((row) => {
      const key = String(row.key || "").trim().toUpperCase();
      if (!key || isExcludedOperationalItem(key)) return;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          logged: 0,
          itemType: String(row.itemType || "").trim(),
          technicalDebt: String(row.technicalDebt || "").trim(),
          operational: isTempoWorkItem(key),
        });
      }
      const item = byKey.get(key);
      item.logged += Number(row.logged) || 0;
      if (!item.itemType && row.itemType) item.itemType = String(row.itemType || "").trim();
      if (!item.technicalDebt && row.technicalDebt) item.technicalDebt = String(row.technicalDebt || "").trim();
    });

    const buckets = new Map([
      ["Bugs", engineeringWorkMixBucket("Bugs")],
      ["Technical Debt", engineeringWorkMixBucket("Technical Debt")],
      ["Rest", engineeringWorkMixBucket("Rest")],
      ["Operations", engineeringWorkMixBucket("Operations")],
    ]);

    byKey.forEach((item) => {
      const category = engineeringWorkMixCategory(item);
      const bucket = buckets.get(category) || buckets.get("Rest");
      bucket.logged += item.logged;
      bucket.keys.add(item.key);
    });

    const rows = ["Bugs", "Technical Debt", "Rest"]
      .map((label) => buckets.get(label))
      .map((bucket) => ({
        label: bucket.label,
        logged: bucket.logged,
        itemCount: bucket.keys.size,
      }));
    const engineeringLoggedHours = rows.reduce((total, row) => total + row.logged, 0);
    const operations = buckets.get("Operations");
    return {
      rows,
      operations: {
        logged: operations.logged,
        itemCount: operations.keys.size,
      },
      engineeringLoggedHours,
      governedEngineeringDistinctItems: rows.reduce((total, row) => total + row.itemCount, 0),
    };
  }

  function engineeringWorkMixFill(label) {
    if (label === "Bugs") return "#e7b4ab";
    if (label === "Technical Debt") return "#e8d5a3";
    return "#b8d5ee";
  }

  function donutSlicePath(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const outerStart = polarPoint(cx, cy, outerRadius, startAngle);
    const outerEnd = polarPoint(cx, cy, outerRadius, endAngle);
    const innerEnd = polarPoint(cx, cy, innerRadius, endAngle);
    const innerStart = polarPoint(cx, cy, innerRadius, startAngle);
    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
      "Z",
    ].join(" ");
  }

  function engineeringWorkMixTooltip(row, percentage) {
    return [
      `Category: ${row.label}`,
      `Logged Hours: ${formatNumber(row.logged, 1)}`,
      `Percentage of governed engineering hours: ${formatPercent(percentage)}`,
      `Distinct Work Items: ${formatNumber(row.itemCount)}`,
    ].join("\n");
  }

  function engineeringWorkMixSummaryText(mix) {
    const notes = ["Rest includes governed engineering work that is neither Bug nor Technical Debt."];
    if (mix.operations.logged > 0 || mix.operations.itemCount > 0) {
      notes.push(`Operations excluded from denominator: ${formatNumber(mix.operations.logged, 1)} h across ${formatNumber(mix.operations.itemCount)} items.`);
    }
    return notes.join(" ");
  }

  function engineeringWorkMixCalloutValue(row, percentage) {
    return `${formatNumber(row.logged, 1)} h | ${formatPercent(percentage)} | ${formatNumber(row.itemCount)} items`;
  }

  function engineeringWorkMixCalloutSpec(label, width, height) {
    const specs = {
      Rest: {
        textX: Math.max(118, Math.round(width * 0.31)),
        textY: Math.round(height * 0.49),
        anchor: "end",
      },
      Bugs: {
        textX: Math.min(width - 22, Math.round(width * 0.72)),
        textY: Math.round(height * 0.26),
        anchor: "start",
      },
      "Technical Debt": {
        textX: Math.min(width - 22, Math.round(width * 0.72)),
        textY: Math.round(height * 0.72),
        anchor: "start",
      },
    };
    return specs[label] || specs.Rest;
  }

  function renderEngineeringMixCallout(svg, row, percentage, geom) {
    const spec = engineeringWorkMixCalloutSpec(row.label, geom.width, geom.height);

    addSvg(svg, "text", {
      x: spec.textX,
      y: spec.textY,
      "text-anchor": spec.anchor,
      fill: colors.text,
      "font-size": 12,
      "font-weight": 700,
    }, row.label);
    addSvg(svg, "text", {
      x: spec.textX,
      y: spec.textY + 16,
      "text-anchor": spec.anchor,
      fill: colors.muted,
      "font-size": 10.5,
    }, engineeringWorkMixCalloutValue(row, percentage));
  }

  function renderEngineeringMixCalloutFallback(containerId, rows, total) {
    const summary = document.createElement("div");
    summary.className = "mix-callout-fallback";
    summary.innerHTML = rows.map((row) => {
      const percentage = total ? row.logged / total : 0;
      return [
        `<div class="mix-callout-fallback-row">`,
        `<strong>${escapeHtml(row.label)}</strong>`,
        `<span>${escapeHtml(engineeringWorkMixCalloutValue(row, percentage))}</span>`,
        "</div>",
      ].join("");
    }).join("");
    chartContentTarget(containerId).appendChild(summary);
  }

  function renderEngineeringMixSummary(containerId, mix) {
    const summary = document.createElement("div");
    summary.className = "mix-summary mix-summary-note-only";
    const note = document.createElement("div");
    note.className = "mix-note";
    note.textContent = engineeringWorkMixSummaryText(mix);
    summary.appendChild(note);
    chartContentTarget(containerId).appendChild(summary);
  }

  function engineeringWorkMixDonut(containerId, mix) {
    const rows = mix.rows.filter((row) => row.logged > 0);
    if (!rows.length) {
      return emptyChart(containerId, "No classified engineering effort for the selected filters.");
    }

    const { svg, width, height } = chartSvg(containerId, 240);
    const centerX = Math.round(width * 0.48);
    const centerY = Math.round(height * 0.5);
    const outerRadius = Math.max(70, Math.min(92, Math.min(width * 0.17, height * 0.34)));
    const innerRadius = outerRadius * 0.62;
    let startAngle = -Math.PI / 2;
    const callouts = [];

    rows.forEach((row) => {
      const percentage = mix.engineeringLoggedHours ? row.logged / mix.engineeringLoggedHours : 0;
      const endAngle = startAngle + percentage * Math.PI * 2;
      const slice = addSvg(svg, "path", {
        d: donutSlicePath(centerX, centerY, outerRadius, innerRadius, startAngle, endAngle),
        fill: engineeringWorkMixFill(row.label),
        stroke: "#ffffff",
        "stroke-width": 2,
      });
      addTitle(slice, engineeringWorkMixTooltip(row, percentage));
      callouts.push({
        row,
        percentage,
        midAngle: startAngle + (endAngle - startAngle) / 2,
      });

      startAngle = endAngle;
    });

    if (width < 430) {
      renderEngineeringMixCalloutFallback(containerId, rows, mix.engineeringLoggedHours);
    } else {
      callouts.forEach(({ row, percentage, midAngle }) => {
        renderEngineeringMixCallout(svg, row, percentage, {
          centerX,
          centerY,
          outerRadius,
          midAngle,
          width,
          height,
        });
      });
    }
    renderEngineeringMixSummary(containerId, mix);
  }

  function logEngineeringWorkMixValidation(mix) {
    const categorizedTotal = mix.rows.reduce((total, row) => total + row.logged, 0);
    const validation = {
      categoryHours: mix.rows.map((row) => ({
        category: row.label,
        loggedHours: Number(row.logged.toFixed(4)),
        workItems: row.itemCount,
      })),
      governedEngineeringLoggedHours: Number(mix.engineeringLoggedHours.toFixed(4)),
      categorizedEngineeringLoggedHours: Number(categorizedTotal.toFixed(4)),
      excludedOperationsLoggedHours: Number(mix.operations.logged.toFixed(4)),
      totalsReconcileExactly: Math.abs(categorizedTotal - mix.engineeringLoggedHours) < 0.000001,
      classifiedOnceAndOnlyOnce: mix.governedEngineeringDistinctItems === mix.rows.reduce((total, row) => total + row.itemCount, 0),
    };
    console.info("Engineering Work Mix validation", validation);
  }

  function accountDistributionScope(worklogs) {
    return {
      tempoAccounts: governedTempoAccountAggregation(worklogs),
      exceptions: [],
    };
  }

  function governedTempoAccountAggregation(worklogs) {
    const map = new Map();
    worklogs.filter((row) => (
      validTeamSet.has(row.team)
      && !isExcludedOperationalItem(row.key)
      && Boolean(accountLabel(row.tempoAccount))
    )).forEach((row) => {
      const account = accountLabel(row.tempoAccount);
      if (!map.has(account)) {
        map.set(account, {
          account,
          logged: 0,
          billable: 0,
          items: new Set(),
          assignees: new Set(),
          teams: new Set(),
          programs: new Set(),
        });
      }
      const item = map.get(account);
      item.logged += Number(row.logged) || 0;
      item.billable += Number(row.billable) || 0;
      if (row.key) item.items.add(row.key);
      if (row.person) item.assignees.add(row.person);
      if (row.team) item.teams.add(row.team);
      if (row.program) item.programs.add(row.program);
    });
    return map;
  }

  function accountTreemapRows(data, tempoAccounts) {
    const map = new Map();
    const ensureBucket = (account) => {
      const filterValue = accountFilterValue(account);
      if (!map.has(filterValue)) {
        map.set(filterValue, {
          account: filterValue,
          accountDisplay: filterValue === "(blank)" ? "(No Account)" : accountTableDisplayValue(filterValue),
          filterValue,
          logged: 0,
          billable: 0,
          estimated: 0,
          items: new Set(),
          assignees: new Set(),
          teams: new Set(),
          programs: new Set(),
          deliveryHealth: "Completed",
        });
      }
      return map.get(filterValue);
    };

    tempoAccounts.forEach((tempoAccount) => {
      const item = ensureBucket(tempoAccount.account);
      item.logged += tempoAccount.logged;
      item.billable += tempoAccount.billable;
      tempoAccount.items.forEach((key) => item.items.add(key));
      tempoAccount.assignees.forEach((assignee) => item.assignees.add(assignee));
      tempoAccount.teams.forEach((team) => item.teams.add(team));
      tempoAccount.programs.forEach((program) => item.programs.add(program));
    });

    const estimatedKeys = new Set();
    data.backlog.filter((row) => validTeamSet.has(backlogTeam(row))).forEach((row) => {
      const account = accountLabel(row.account);
      if (!account) return;
      const item = ensureBucket(account);
      const estimateKey = `${item.filterValue}|${row.key || ""}`;
      if (row.key && estimatedKeys.has(estimateKey)) return;
      if (row.key) estimatedKeys.add(estimateKey);
      item.estimated += Number(row.originalEstimateHours) || 0;
      if (row.key) item.items.add(row.key);
      if (row.assignee) item.assignees.add(row.assignee);
      const team = backlogTeam(row);
      if (team) item.teams.add(team);
      if (row.program) item.programs.add(row.program);
      item.deliveryHealth = riskierDeliveryHealth(item.deliveryHealth, row.deliveryHealth);
    });

    return Array.from(map.values())
      .filter((row) => row.logged > 0)
      .map((row) => ({
        ...row,
        itemCount: row.items.size,
        assigneeCount: row.assignees.size,
        teamsList: Array.from(row.teams).sort((a, b) => a.localeCompare(b)),
        programsList: Array.from(row.programs).sort((a, b) => a.localeCompare(b)),
        variance: row.logged - row.estimated,
        variancePercent: row.estimated ? (row.logged - row.estimated) / row.estimated : null,
      }))
      .sort((a, b) => (b.logged - a.logged) || a.accountDisplay.localeCompare(b.accountDisplay));
  }

  function riskierDeliveryHealth(a, b) {
    return (DELIVERY_HEALTH_ORDER[b] ?? 3) < (DELIVERY_HEALTH_ORDER[a] ?? 3) ? b : a;
  }

  function accountTreemapFill(account) {
    const palette = [
      "#d8ecf3",
      "#e4e1f4",
      "#dcefdc",
      "#f7e3d4",
      "#f3dce7",
      "#d9eadf",
      "#e8edf7",
      "#f5e8c8",
      "#d7eef0",
      "#eadff0",
      "#e7ead1",
      "#dde7f2",
    ];
    let hash = 0;
    String(account || "").split("").forEach((char) => {
      hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    });
    return palette[Math.abs(hash) % palette.length];
  }

  function addTreemapSummary(totalLogged) {
    const el = $("accountTreemap");
    const summary = document.createElement("div");
    summary.className = "treemap-summary";
    summary.textContent = `Total logged hours (selected period): ${formatNumber(totalLogged, 1)} h`;
    el.appendChild(summary);
  }

  function renderAccountAttributionExceptionFooter(exceptions) {
    const keys = new Set(
      exceptions
        .map((row) => String(row.key || "").trim().toUpperCase())
        .filter(Boolean),
    );
    if (!keys.size) return;
    const loggedHours = sum(exceptions, "logged");
    const footer = document.createElement("div");
    footer.className = "account-attribution-exception";
    footer.textContent = `Account attribution note: ${formatNumber(keys.size)} engineering Jira work items (${formatNumber(loggedHours, 1)} h) could not be attributed from the current Jira source extract. These items remain included in governed logged effort. Operational TEMPO-* activities are excluded.`;
    $("accountTreemap").appendChild(footer);
  }

  function accountTreemapTooltip(row, percentage) {
    const lines = [
      `Account: ${row.accountDisplay}`,
      `Logged Hours: ${formatNumber(row.logged, 1)}`,
      `Percentage of filtered total: ${formatPercent(percentage)}`,
      `Billable Hours: ${formatNumber(row.billable, 1)}`,
      `Original Estimate: ${formatNumber(row.estimated, 1)}`,
      `Variance Hours: ${formatNumber(row.variance, 1)}`,
      `Variance %: ${row.variancePercent === null ? "n/a" : formatPercent(row.variancePercent)}`,
      `Work Items: ${formatNumber(row.itemCount)}`,
      `Number of Assignees: ${formatNumber(row.assigneeCount)}`,
      `Teams contributing hours: ${row.teamsList.length ? row.teamsList.join(", ") : "-"}`,
      `Programs contributing hours: ${row.programsList.length ? row.programsList.join(", ") : "-"}`,
    ];
    return lines.join("\n");
  }

  function programDistributionRows(worklogs) {
    const map = new Map();
    const unresolved = new Map();
    worklogs.forEach((row) => {
      const resolved = resolveProgramForWorklog(row);
      if (!resolved.label) {
        const key = String(row.key || "(missing key)").trim();
        if (!unresolved.has(key)) {
          unresolved.set(key, {
            key,
            logged: 0,
            parentKey: resolved.parentKey || "",
            reason: resolved.reason,
          });
        }
        unresolved.get(key).logged += Number(row.logged) || 0;
        return;
      }
      const label = resolved.label;
      if (state.programs.size && !state.programs.has(label)) return;
      if (!map.has(label)) map.set(label, { label, logged: 0 });
      map.get(label).logged += Number(row.logged) || 0;
    });
    return {
      rows: Array.from(map.values()).sort((a, b) => (b.logged - a.logged) || a.label.localeCompare(b.label)),
      unresolvedRows: Array.from(unresolved.values()).sort((a, b) => (b.logged - a.logged) || a.key.localeCompare(b.key)),
    };
  }

  function programLabelValue(value) {
    const label = String(value || "").trim();
    if (!label || label === "-" || label === "(blank)" || label.toLowerCase() === "null" || label.toLowerCase() === "undefined" || label === "NaN") return "";
    return label;
  }

  function resolveProgramForWorklog(row) {
    const key = String(row.key || "").trim();
    const jiraRow = jiraByKey.get(key);
    const childProgram = programLabelValue(jiraRow?.program || row.program);
    if (childProgram) return { label: childProgram, source: jiraRow?.program ? "jira-child" : "worklog-enriched" };

    const parentKey = programParentKey(row, jiraRow);
    const parentProgram = parentKey ? programLabelValue(jiraByKey.get(parentKey)?.program) : "";
    if (parentProgram) return { label: parentProgram, source: "jira-parent", parentKey };

    return {
      label: "",
      source: "",
      parentKey,
      reason: jiraRow ? "Jira-linked worklog has no child or parent Program" : "No Jira metadata found for worklog key",
    };
  }

  function programFilterValueForWorklog(row) {
    return resolveProgramForWorklog(row).label || "";
  }

  function programParentKey(row, jiraRow) {
    const parentKey = String(jiraRow?.parentKey || row.parentKey || "").trim();
    if (!parentKey || parentKey === "-" || parentKey === String(row.key || "").trim()) return "";
    return parentKey;
  }

  function loggedTotalAfterOperationalExclusions(worklogs) {
    return sum(worklogs, "logged");
  }

  function programDistributionExpectedTotal(worklogs) {
    return worklogs.reduce((total, row) => {
      const resolved = resolveProgramForWorklog(row);
      if (state.programs.size) {
        if (resolved.label && !state.programs.has(resolved.label)) return total;
      }
      return total + (Number(row.logged) || 0);
    }, 0);
  }

  function programCalloutPosition(row, width, centerX, centerY, radius, midAngle) {
    if (row.label === "S-GTM - Sales & Go To Market") {
      const preferredX = centerX + radius + 72;
      const hasRoom = preferredX + 190 <= width;
      return {
        x: hasRoom ? preferredX : width - 14,
        y: centerY - radius - 18,
        anchor: hasRoom ? "start" : "end",
      };
    }
    const outsideRadius = radius + 34;
    return {
      x: centerX + Math.cos(midAngle) * outsideRadius,
      y: centerY + Math.sin(midAngle) * outsideRadius,
      anchor: Math.cos(midAngle) >= 0 ? "start" : "end",
    };
  }

  function programPieFill(index) {
    const palette = [
      "#d8ecf3",
      "#f7e3d4",
      "#f3dce7",
      "#d9eadf",
      "#f5e8c8",
      "#eadff0",
      "#d7eef0",
      "#e8edf7",
      "#e7ead1",
      "#d8ecf3",
    ];
    return palette[index % palette.length];
  }

  function pieSlicePath(cx, cy, radius, startAngle, endAngle) {
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const start = polarPoint(cx, cy, radius, startAngle);
    const end = polarPoint(cx, cy, radius, endAngle);
    return [
      `M ${cx} ${cy}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  }

  function polarPoint(cx, cy, radius, angle) {
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  }

  function programPieTooltip(row, percentage) {
    return [
      `Program: ${row.label}`,
      `Logged Hours: ${formatNumber(row.logged, 1)}`,
      `Percentage of filtered total: ${formatPercent(percentage)}`,
    ].join("\n");
  }

  function addProgramTotalMetric(svg, x, height, labelLines, value) {
    labelLines.forEach((line, index) => {
      addSvg(svg, "text", {
        x,
        y: height - 62 + (index * 13),
        "text-anchor": "middle",
        fill: colors.text,
        "font-size": 10,
        "font-weight": 700,
      }, line);
    });
    addSvg(svg, "text", {
      x,
      y: height - 24,
      "text-anchor": "middle",
      fill: colors.text,
      "font-size": 18,
      "font-weight": 800,
    }, `${formatNumber(value, 1)} h`);
  }

  function logProgramDistributionValidation(rows, governedLoggedTotal, unresolvedRows = []) {
    const programMappedLogged = rows.reduce((total, row) => total + row.logged, 0);
    const percentTotal = programMappedLogged ? rows.reduce((total, row) => total + (row.logged / programMappedLogged), 0) : 0;
    const unmappedLogged = Math.max(0, governedLoggedTotal - programMappedLogged);
    const totalsReconcile = Math.abs((programMappedLogged + unmappedLogged) - governedLoggedTotal) < 0.11;
    const percentagesReconcile = programMappedLogged <= 0 || Math.abs(percentTotal - 1) < 0.000001;
    const invalidProgramSlices = rows.filter((row) => !programLabelValue(row.label));
    const unmappedGroups = groupedUnmappedProgramRows(unresolvedRows);
    const validation = {
      programSliceTotalsByProgram: rows.map((row) => ({
        program: row.label,
        loggedHours: Number(row.logged.toFixed(4)),
      })),
      programMappedLoggedHours: Number(programMappedLogged.toFixed(4)),
      governedLoggedTotal: Number(governedLoggedTotal.toFixed(4)),
      unmappedNonProgramLoggedHours: Number(unmappedLogged.toFixed(4)),
      reconciliation: {
        leftSide: Number((programMappedLogged + unmappedLogged).toFixed(4)),
        rightSide: Number(governedLoggedTotal.toFixed(4)),
        reconciles: totalsReconcile,
      },
      percentagesReconcile,
      unmappedWorkItems: unmappedGroups,
    };
    console.info("Program Distribution validation", validation);
    if (invalidProgramSlices.length) {
      console.warn("Program Distribution invalid Program slices", {
        invalidProgramSlices: invalidProgramSlices.map((row) => row.label),
      });
    }
    if (!totalsReconcile || !percentagesReconcile) {
      console.warn("Program Distribution reconciliation warning", validation);
    }
  }

  function groupedUnmappedProgramRows(unresolvedRows) {
    const groups = {
      tempoOperationalWorkItems: [],
      jiraWorkItemsWithoutProgramMapping: [],
    };
    unresolvedRows.forEach((row) => {
      const item = {
        key: row.key,
        loggedHours: Number(row.logged.toFixed(4)),
        reason: row.reason,
      };
      if (String(row.key || "").trim().toUpperCase().startsWith("TEMPO-")) {
        groups.tempoOperationalWorkItems.push(item);
      } else {
        groups.jiraWorkItemsWithoutProgramMapping.push(item);
      }
    });
    return groups;
  }

  function treemapTiles(rows, bounds) {
    const total = rows.reduce((sum, row) => sum + row.logged, 0);
    return splitTreemap(rows, bounds, total);
  }

  function splitTreemap(rows, bounds, total) {
    if (!rows.length || total <= 0 || bounds.width <= 0 || bounds.height <= 0) return [];
    if (rows.length === 1) return [{ ...bounds, data: rows[0] }];

    const half = total / 2;
    let running = 0;
    let splitIndex = 0;
    rows.forEach((row, index) => {
      if (running < half) {
        running += row.logged;
        splitIndex = index + 1;
      }
    });
    splitIndex = Math.max(1, Math.min(rows.length - 1, splitIndex));
    const first = rows.slice(0, splitIndex);
    const second = rows.slice(splitIndex);
    const firstTotal = first.reduce((sum, row) => sum + row.logged, 0);
    const ratio = firstTotal / total;
    const gap = 2;

    if (bounds.width >= bounds.height) {
      const firstWidth = Math.max(0, Math.round(bounds.width * ratio) - gap / 2);
      const secondWidth = Math.max(0, bounds.width - firstWidth - gap);
      return [
        ...splitTreemap(first, { x: bounds.x, y: bounds.y, width: firstWidth, height: bounds.height }, firstTotal),
        ...splitTreemap(second, { x: bounds.x + firstWidth + gap, y: bounds.y, width: secondWidth, height: bounds.height }, total - firstTotal),
      ];
    }

    const firstHeight = Math.max(0, Math.round(bounds.height * ratio) - gap / 2);
    const secondHeight = Math.max(0, bounds.height - firstHeight - gap);
    return [
      ...splitTreemap(first, { x: bounds.x, y: bounds.y, width: bounds.width, height: firstHeight }, firstTotal),
      ...splitTreemap(second, { x: bounds.x, y: bounds.y + firstHeight + gap, width: bounds.width, height: secondHeight }, total - firstTotal),
    ];
  }

  function utilizationTone(value) {
    if (!Number.isFinite(value) || value === 0) return colors.muted;
    if (value > 1) return colors.red;
    if (value >= 0.85) return colors.green;
    return colors.amber;
  }

  function estimationTone(value) {
    if (!Number.isFinite(value) || value === 0) return colors.muted;
    if (value > 1.1) return colors.red;
    if (value >= 0.9) return colors.green;
    return colors.amber;
  }

  function utilizationBars(containerId, rows) {
    const { svg, width, height } = chartSvg(containerId, 340);
    const margin = { top: 34, right: 22, bottom: 58, left: 58 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const maxY = Math.max(...rows.flatMap((row) => [row.logged || 0, row.planned || 0])) * 1.14 || 1;
    const band = innerW / rows.length;
    const barW = Math.max(10, Math.min(26, (band - 18) / 2));

    drawGrid(svg, margin, innerW, innerH, maxY);

    rows.forEach((row, i) => {
      const centerX = margin.left + i * band + band / 2;
      const capacityHeight = ((row.planned || 0) / maxY) * innerH;
      const loggedHeight = ((row.logged || 0) / maxY) * innerH;
      const capacityX = centerX - barW - 2;
      const loggedX = centerX + 2;
      const capacityY = margin.top + innerH - capacityHeight;
      const loggedY = margin.top + innerH - loggedHeight;
      const labelY = Math.min(capacityY, loggedY) - 9;
      const utilizationLabel = row.planned ? formatPercent(row.utilization) : "n/a";
      const tooltip = [
        row.label,
        `Capacity Hours: ${formatNumber(row.planned, 1)}`,
        `Logged Hours: ${formatNumber(row.logged, 1)}`,
        `Variance Hours: ${formatNumber(row.variance, 1)}`,
        `Utilization: ${utilizationLabel}`,
      ].join("\n");

      const capacityBar = addSvg(svg, "rect", {
        x: capacityX,
        y: capacityY,
        width: barW,
        height: Math.max(0, capacityHeight),
        rx: 2,
        fill: colors.gray,
        class: "clickable",
      });
      addTitle(capacityBar, tooltip);
      capacityBar.addEventListener("click", () => toggleFilter("teams", row.label));

      const loggedBar = addSvg(svg, "rect", {
        x: loggedX,
        y: loggedY,
        width: barW,
        height: Math.max(0, loggedHeight),
        rx: 2,
        fill: colors.blue,
        class: "clickable",
      });
      addTitle(loggedBar, tooltip);
      loggedBar.addEventListener("click", () => toggleFilter("teams", row.label));

      const label = addSvg(svg, "text", {
        x: centerX,
        y: Math.max(16, labelY),
        "text-anchor": "middle",
        fill: utilizationTone(row.utilization),
        "font-size": 12,
        "font-weight": 800,
        class: "clickable",
      }, utilizationLabel);
      addTitle(label, tooltip);
      label.addEventListener("click", () => toggleFilter("teams", row.label));

      addSvg(svg, "text", {
        x: centerX,
        y: margin.top + innerH + 20,
        "text-anchor": "middle",
        fill: colors.muted,
        "font-size": 11,
      }, truncate(row.label, 13));
    });

    addLegend(containerId, [
      ["Capacity Hours", colors.gray],
      ["Logged Hours", colors.blue],
      ["Utilization % label", colors.amber],
    ]);
  }

  function remainingDemandBars(containerId, rows) {
    const { svg, width, height } = chartSvg(containerId, 340);
    const margin = { top: 34, right: 22, bottom: 58, left: 58 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const maxY = Math.max(...rows.flatMap((row) => [row.remaining || 0, row.logged || 0])) * 1.14 || 1;
    const band = innerW / rows.length;
    const barW = Math.max(10, Math.min(24, (band - 20) / 2));

    drawGrid(svg, margin, innerW, innerH, maxY);

    rows.forEach((row, i) => {
      const centerX = margin.left + i * band + band / 2;
      const remainingHeight = ((row.remaining || 0) / maxY) * innerH;
      const loggedHeight = ((row.logged || 0) / maxY) * innerH;
      const remainingX = centerX - barW - 3;
      const loggedX = centerX + 3;
      const remainingY = margin.top + innerH - remainingHeight;
      const loggedY = margin.top + innerH - loggedHeight;
      const tooltip = [
        `Team: ${row.label}`,
        `Remaining Demand: ${formatNumber(row.remaining, 1)}`,
        `Logged Effort: ${formatNumber(row.logged, 1)}`,
      ].join("\n");

      const remainingBar = addSvg(svg, "rect", {
        x: remainingX,
        y: remainingY,
        width: barW,
        height: Math.max(0, remainingHeight),
        rx: 2,
        fill: colors.teal,
        class: "clickable",
      });
      addTitle(remainingBar, tooltip);
      remainingBar.addEventListener("click", () => toggleFilter("teams", row.label));

      const loggedBar = addSvg(svg, "rect", {
        x: loggedX,
        y: loggedY,
        width: barW,
        height: Math.max(0, loggedHeight),
        rx: 2,
        fill: colors.blue,
        class: "clickable",
      });
      addTitle(loggedBar, tooltip);
      loggedBar.addEventListener("click", () => toggleFilter("teams", row.label));

      addSvg(svg, "text", {
        x: centerX,
        y: margin.top + innerH + 20,
        "text-anchor": "middle",
        fill: colors.muted,
        "font-size": 11,
      }, truncate(row.label, 13));
    });

    addLegend(containerId, [
      ["Remaining Demand", colors.teal],
      ["Logged Effort", colors.blue],
    ]);
    const footnote = document.createElement("p");
    footnote.className = "chart-footnote";
    footnote.style.cssText = "margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.35;";
    footnote.textContent = "Remaining Demand uses Jira Remaining Estimate for open work items in the selected delivery scope. Logged Effort uses governed Tempo worklogs within the selected Date Range. This chart compares outstanding work with actual effort logged; it is not an estimation accuracy view.";
    chartContentTarget(containerId).appendChild(footnote);

    if (selectedDateRangeDays() > 31) {
      const warning = document.createElement("p");
      warning.className = "chart-footnote chart-warning";
      warning.style.cssText = "margin:4px 0 0;color:var(--amber);font-size:12px;line-height:1.35;";
      warning.textContent = "Long Date Range selected: Logged Effort is cumulative over the selected period, while Remaining Demand reflects current open Jira work. Use shorter operational windows for workload pressure analysis.";
      chartContentTarget(containerId).appendChild(warning);
    }
  }

  function groupedBars(containerId, rows, fields, labels, palette, filterKey) {
    const { svg, width, height } = chartSvg(containerId);
    const margin = { top: 18, right: 22, bottom: 70, left: 58 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;
    const maxY = Math.max(...rows.flatMap((row) => fields.map((field) => row[field] || 0))) * 1.12 || 1;
    const band = innerW / rows.length;
    const barW = Math.max(8, Math.min(28, (band - 16) / fields.length));
    drawGrid(svg, margin, innerW, innerH, maxY);

    rows.forEach((row, i) => {
      fields.forEach((field, j) => {
        const h = ((row[field] || 0) / maxY) * innerH;
        const x = margin.left + i * band + (band - fields.length * barW) / 2 + j * barW;
        const y = margin.top + innerH - h;
        const rect = addSvg(svg, "rect", { x, y, width: barW - 2, height: Math.max(0, h), rx: 2, fill: palette[j], class: filterKey ? "clickable" : "" });
        if (filterKey) rect.addEventListener("click", () => toggleFilter(filterKey, row.label));
      });
      addSvg(svg, "text", { x: margin.left + i * band + band / 2, y: height - 28, "text-anchor": "middle", fill: colors.muted, "font-size": 11 }, truncate(row.label, 13));
    });
    addLegend(containerId, labels.map((label, idx) => [label, palette[idx]]));
  }

  function horizontalBars(containerId, rows, field, color, filterKey, options = {}) {
    const { svg, width, height } = chartSvg(containerId, options.height || 320);
    const margin = { top: 18, right: 44, bottom: 22, left: 122 };
    const innerW = width - margin.left - margin.right;
    const rowH = Math.min(options.maxRowHeight || 30, (height - margin.top - margin.bottom) / rows.length);
    const maxX = Math.max(...rows.map((row) => row[field] || 0)) || 1;
    rows.forEach((row, i) => {
      const y = margin.top + i * rowH + 4;
      const w = ((row[field] || 0) / maxX) * innerW;
      const tooltip = options.tooltip ? options.tooltip(row) : `${row.label}: ${formatNumber(row[field])}`;
      const fill = typeof color === "function" ? color(row, i) : Array.isArray(color) ? color[i % color.length] : color;
      addSvg(svg, "text", { x: margin.left - 10, y: y + rowH / 2 + 4, "text-anchor": "end", fill: colors.text, "font-size": 12 }, truncate(row.label, 18));
      const rect = addSvg(svg, "rect", { x: margin.left, y, width: Math.max(2, w), height: rowH - 8, rx: 3, fill, class: filterKey ? "clickable" : "" });
      addTitle(rect, tooltip);
      if (filterKey) rect.addEventListener("click", () => toggleFilter(filterKey, row.label));
      addSvg(svg, "text", { x: margin.left + w + 8, y: y + rowH / 2 + 4, fill: colors.muted, "font-size": 12 }, compact(row[field]));
    });
  }

  function addLegend(containerId, items) {
    const el = chartContentTarget(containerId);
    const legend = document.createElement("div");
    legend.className = "legend";
    legend.innerHTML = items.map(([label, color]) => `<span><i style="background:${color}"></i>${escapeHtml(label)}</span>`).join("");
    el.appendChild(legend);
  }

  function compact(value) {
    const num = Number(value) || 0;
    if (Math.abs(num) >= 1000) return `${formatNumber(num / 1000, num >= 10000 ? 0 : 1)}k`;
    return formatNumber(num, 0);
  }

  function truncate(value, max) {
    const str = String(value || "");
    return str.length > max ? `${str.slice(0, max - 1)}...` : str;
  }

  function renderDetails(data, effortData = loggedEffortData()) {
    const activityDrivenDetail = state.detail === "backlog" || state.detail === "deliveryProgress";
    const detailData = activityDrivenDetail ? data : effortData;
    const search = state.detailSearch.toLowerCase();
    let subtitle = "";
    let columns = [];
    let rows = [];

    if (state.detail === "accounts") {
      subtitle = "Account delivery effort";
      rows = groupAccounts(data.backlog, effortData.baseFiltered.worklogs, data.backlog);
      columns = detailColumns("accounts");
    } else if (state.detail === "people") {
      const peopleData = { worklogs: effortData.worklogs, capacity: effortData.capacity };
      subtitle = "Assignees and capacity";
      rows = groupPeople(peopleData.worklogs, peopleData.capacity);
      columns = detailColumns("people");
    } else if (state.detail === "backlog") {
      subtitle = "Backlog worked on";
      rows = backlogWorkedRows(detailData.backlogWorklogs || []);
      columns = detailColumns("backlog");
    } else if (state.detail === "bugTriage") {
      subtitle = "Jira operational bug queue";
      rows = bugTriageRows(data.bugTriage || []);
      columns = detailColumns("bugTriage");
    } else {
      subtitle = "Delivery Progress";
      rows = deliveryProgressRows(filteredData({ ignoreTeam: true }).backlogWorklogs || []);
      columns = detailColumns("deliveryProgress");
    }

    if (search) {
      rows = rows.filter((row) => Object.values(row).join(" ").toLowerCase().includes(search));
    }
    if (state.detail === "deliveryProgress") {
      validateDeliveryProgressTeamRows(rows);
      validateDeliveryProgressKnownOwnership(rows);
    }
    let footerRow = null;
    if (state.detail === "accounts") footerRow = accountTotalsRow(rows);
    else if (state.detail === "people") footerRow = peopleTotalsRow(rows);
    rows = sortDetailRows(rows, state.detail, columns).slice(0, state.detail === "accounts" ? 120 : state.detail === "people" ? 80 : 120);
    if (state.detailGroupBy) {
      rows.sort((left, right) => String(left[state.detailGroupBy] || "").localeCompare(String(right[state.detailGroupBy] || "")));
    }

    $("detailSubtitle").textContent = subtitle;
    renderDetailGroupControl(columns);
    $("detailTable").innerHTML = tableHtml(columns, rows, state.detail, footerRow, state.detailGroupBy);
    const deliveryLegend = $("deliveryLegend");
    if (deliveryLegend) deliveryLegend.hidden = state.detail !== "deliveryProgress";
  }

  function renderBugTriageSnapshotSummary() {
    const container = $("bugTriageSnapshotSummary");
    if (!container) return;
    const comparison = raw.meta.bugTriageSnapshotComparison || {};
    container.hidden = false;

    const currentQueue = Number(comparison.currentQueue) || 0;
    if (!comparison.hasPreviousSnapshot) {
      container.innerHTML = `
        <div class="bug-triage-snapshot-current">Full Bug Triage queue: <strong>${formatNumber(currentQueue)}</strong></div>
        <div class="bug-triage-snapshot-context">No previous complete Bug Triage snapshot available.</div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="bug-triage-snapshot-current">Full Bug Triage queue: <strong>${formatNumber(currentQueue)}</strong></div>
      <div class="bug-triage-snapshot-context">Compared with the previous complete snapshot</div>
      <div class="bug-triage-snapshot-changes">
        <span class="bug-triage-snapshot-added"><span aria-hidden="true">↑</span> ${formatNumber(comparison.addedToQueue)} Added to queue</span>
        <span class="bug-triage-snapshot-removed"><span aria-hidden="true">↓</span> ${formatNumber(comparison.removedFromQueue)} Removed from queue</span>
      </div>
    `;
  }
  function detailColumns(mode) {
    if (mode === "accounts") {
      return [
        { key: "account", label: "Account", formatter: accountTableDisplayValue },
        { key: "estimated", label: "Original Estimate Hours", numeric: true, digits: 1 },
        { key: "logged", label: "Logged Hours", numeric: true, digits: 1 },
        { key: "variance", label: "Variance Hours", numeric: true, digits: 1 },
        { key: "loggedVsEstimate", label: "Logged vs Estimate %", numeric: true, percent: true },
        { key: "itemCount", label: "Work Items", numeric: true },
      ];
    }
    if (mode === "people") {
      return [
        { key: "person", label: "Assignee" },
        { key: "team", label: "Team" },
        { key: "capacity", label: "Capacity", numeric: true, digits: 1 },
        { key: "loggedTotal", label: "Logged Total", numeric: true, digits: 1 },
        { key: "loggedEngineering", label: "Logged Engineering", numeric: true, digits: 1 },
        { key: "loggedOperations", label: "Logged Operations", numeric: true, digits: 1 },
        { key: "utilization", label: "Utilization Rate", numeric: true, percent: true },
        { key: "billable", label: "Billable", numeric: true, digits: 1 },
        { key: "itemCount", label: "Work Items", numeric: true },
      ];
    }
    if (mode === "deliveryProgress") {
      return [
        { key: "account", label: "Account" },
        { key: "team", label: "Team" },
        { key: "parentKey", label: "Parent Key" },
        { key: "parentSummary", label: "Parent Summary" },
        { key: "childKey", label: "Child Key", healthKey: true },
        { key: "childSummary", label: "Child Summary" },
        { key: "status", label: "Status" },
        { key: "priority", label: "Priority" },
        { key: "startDate", label: "Start Date" },
        { key: "dueDate", label: "Due Date" },
        { key: "lastWorklogDate", label: "Last Worklog Date" },
        { key: "daysToDue", label: "Days to Due" },
        { key: "deliveryHealth", label: "Delivery Health", health: true },
      ];
    }
    if (mode === "bugTriage") {
      return [
        { key: "key", label: "Key", emphasize: true },
        { key: "summary", label: "Summary" },
        { key: "bugSeverity", label: "Bug Severity" },
        { key: "status", label: "Status" },
        { key: "updated", label: "Updated" },
        { key: "assignee", label: "Assignee" },
        { key: "team", label: "Team" },
      ];
    }
    return [
      { key: "parentKey", label: "Parent Key" },
      { key: "parentSummary", label: "Parent Summary" },
      { key: "childKey", label: "Child Key", emphasize: true },
      { key: "childSummary", label: "Child Summary" },
      { key: "workItemType", label: "Work Item Type" },
      { key: "productModule", label: "Product Module" },
      { key: "status", label: "Status" },
      { key: "startDate", label: "Start Date" },
      { key: "dueDate", label: "Due Date" },
      { key: "lastWorklogDate", label: "Last Worklog Date" },
      { key: "priority", label: "Priority" },
      { key: "targetRelease", label: "Target Release" },
      { key: "fixVersion", label: "Fix Version" },
    ];
  }

  function detailDisplayValue(value) {
    const normalized = String(value || "").trim();
    return !normalized || normalized.toUpperCase() === "N/A" ? "-" : normalized;
  }

  function accountTableDisplayValue(value) {
    return value === "(blank)" ? UNMAPPED_ACCOUNT_LABEL : value;
  }

  function detailPlanningValue(value, key) {
    return isTempoWorkItem(key) ? "-" : detailDisplayValue(value);
  }

  function isChildActivityRow(row) {
    return [row.itemType, row.tempoItemType]
      .some((value) => /sub[- ]?task|child/i.test(String(value || "")));
  }

  function detailSummaryValue(row) {
    const summary = detailDisplayValue(row.summary);
    const parentSummary = detailPlanningValue(row.parentSummary, row.key);
    if (!isTempoWorkItem(row.key) && summary === "-" && parentSummary !== "-" && isChildActivityRow(row)) {
      return `[Sub-task] ${parentSummary}`;
    }
    return summary;
  }

  function jiraAssigneeForKey(key) {
    return String(jiraByKey.get(key)?.assignee || "").trim();
  }

  function deliveryProgressTicketTeamForKey(key) {
    const jiraRow = jiraByKey.get(key);
    if (!jiraRow) return "";
    return backlogTeam(jiraRow);
  }

  function deliveryProgressTicketTeamInScope(team) {
    if (!team) return state.teams.size === 0;
    return validTeamSet.has(team) && inSet(state.teams, team);
  }

  function deliveryProgressAssigneeState(key, scopedRows = []) {
    const sourceRows = deliveryWorklogsByKey.get(key) || scopedRows || [];
    const loggedAssignees = Array.from(new Set(sourceRows.map((row) => String(row.person || "").trim()).filter(Boolean)));
    const invalidLoggedAssignees = loggedAssignees.filter((assignee) => !validAssigneeSet.has(assignee));
    const jiraAssignee = jiraAssigneeForKey(key);
    const invalidJiraAssignee = Boolean(jiraAssignee && !validAssigneeSet.has(jiraAssignee));
    const hasValidLoggedAssignee = loggedAssignees.some((assignee) => validAssigneeSet.has(assignee));
    const hasValidJiraAssignee = Boolean(jiraAssignee && validAssigneeSet.has(jiraAssignee));

    return {
      valid: !invalidLoggedAssignees.length
        && !invalidJiraAssignee
        && (hasValidLoggedAssignee || hasValidJiraAssignee),
      loggedAssignees,
      invalidLoggedAssignees,
      jiraAssignee,
      invalidJiraAssignee,
    };
  }

  function deliveryParentKey(row) {
    const parentKey = detailPlanningValue(row.parentKey, row.key);
    if (parentKey === "-" || parentKey === row.key) return "-";
    return parentKey;
  }

  function bugTriageRows(queueRows) {
    return (queueRows || [])
      .map((row) => ({
        key: detailDisplayValue(row.key),
        summary: detailDisplayValue(row.summary),
        bugSeverity: detailDisplayValue(row.bugSeverity),
        status: detailDisplayValue(row.status),
        updated: detailDisplayValue(row.updated),
        assignee: detailDisplayValue(row.assignee),
        team: detailDisplayValue(row.team),
      }));
  }

  function backlogWorkedRows(worklogs) {
    const rowsByKey = new Map();
    worklogs.filter((row) => validTeamSet.has(row.team)).forEach((row) => {
      const key = row.key || "";
      if (!key || isExcludedOperationalItem(key)) return;
      if (!rowsByKey.has(key)) {
        rowsByKey.set(key, {
          key,
          summary: "",
          parentKey: "",
          parentSummary: "",
          itemType: "",
          tempoItemType: "",
          productModule: "",
          status: "",
          startDate: "",
          dueDate: "",
          lastWorklogDate: "",
          priority: "",
          delivery: "",
          targetRelease: "",
          fixVersion: "",
        });
      }
      const item = rowsByKey.get(key);
      if (!item.summary && row.summary) item.summary = row.summary;
      if (!item.parentKey && row.parentKey) item.parentKey = row.parentKey;
      if (!item.parentSummary && row.parentSummary) item.parentSummary = row.parentSummary;
      if (!item.itemType && row.itemType) item.itemType = row.itemType;
      if (!item.tempoItemType && row.tempoItemType) item.tempoItemType = row.tempoItemType;
      if (!item.productModule && row.productModule) item.productModule = row.productModule;
      if (!item.status && row.status) item.status = row.status;
      if (!item.startDate && row.startDate) item.startDate = row.startDate;
      if (!item.dueDate && row.dueDate) item.dueDate = row.dueDate;
      if (!item.priority && row.priority) item.priority = row.priority;
      if (!item.delivery && row.delivery) item.delivery = row.delivery;
      if (!item.targetRelease && row.targetRelease) item.targetRelease = row.targetRelease;
      if (!item.fixVersion && row.fixVersion) item.fixVersion = row.fixVersion;
      if ((row.date || "") > item.lastWorklogDate) item.lastWorklogDate = row.date || "";
    });

    const displayValue = (value) => {
      const normalized = String(value || "").trim();
      return !normalized || normalized.toUpperCase() === "N/A" ? "-" : normalized;
    };
    const isTempoKey = (key) => String(key || "").toUpperCase().startsWith("TEMPO-");
    const planningValue = (value, key) => isTempoKey(key) ? "-" : displayValue(value);
    const isChildWorkItem = (row) => [row.itemType, row.tempoItemType]
      .some((value) => /sub[- ]?task|child/i.test(String(value || "")));
    const summaryValue = (row) => {
      const summary = displayValue(row.summary);
      const parentSummary = planningValue(row.parentSummary, row.key);
      if (!isTempoKey(row.key) && summary === "-" && parentSummary !== "-" && isChildWorkItem(row)) {
        return `[Sub-task] ${parentSummary}`;
      }
      return summary;
    };
    const workItemTypeValue = (row) => displayValue(row.itemType || row.tempoItemType);
    return Array.from(rowsByKey.values()).map((row) => ({
      parentKey: planningValue(row.parentKey, row.key),
      parentSummary: planningValue(row.parentSummary, row.key),
      childKey: row.key,
      childSummary: summaryValue(row),
      workItemType: workItemTypeValue(row),
      productModule: planningValue(row.productModule, row.key),
      status: displayValue(row.status),
      startDate: planningValue(row.startDate, row.key),
      dueDate: planningValue(row.dueDate, row.key),
      lastWorklogDate: row.lastWorklogDate,
      priority: planningValue(row.priority, row.key),
      delivery: planningValue(row.delivery, row.key),
      targetRelease: planningValue(row.targetRelease, row.key),
      fixVersion: planningValue(row.fixVersion, row.key),
    }));
  }

  function deliveryProgressRows(worklogs) {
    const candidateRowsByKey = groupRowsByKey((worklogs || []).filter((row) => {
      const key = row.key || "";
      const team = deliveryProgressTicketTeamForKey(key);
      return key && !isExcludedOperationalItem(key) && deliveryProgressTicketTeamInScope(team);
    }));
    const rowsByKey = new Map();
    candidateRowsByKey.forEach((sourceRows, key) => {
      const assigneeState = deliveryProgressAssigneeState(key, sourceRows);
      if (!assigneeState.valid) return;
      const team = deliveryProgressTicketTeamForKey(key);
      sourceRows.forEach((row) => {
        if (!rowsByKey.has(key)) {
          rowsByKey.set(key, {
            key,
            account: "",
            team,
            summary: "",
            parentKey: "",
            parentSummary: "",
            itemType: "",
            tempoItemType: "",
            status: "",
            statusCategory: "",
            startDate: "",
            dueDate: "",
            lastWorklogDate: "",
            priority: "",
          });
        }
        const item = rowsByKey.get(key);
        if (!item.account && row.account) item.account = row.account;
        if (!item.summary && row.summary) item.summary = row.summary;
        if (!item.parentKey && row.parentKey) item.parentKey = row.parentKey;
        if (!item.parentSummary && row.parentSummary) item.parentSummary = row.parentSummary;
        if (!item.itemType && row.itemType) item.itemType = row.itemType;
        if (!item.tempoItemType && row.tempoItemType) item.tempoItemType = row.tempoItemType;
        if (!item.status && row.status) item.status = row.status;
        if (!item.statusCategory && row.statusCategory) item.statusCategory = row.statusCategory;
        if (!item.startDate && row.startDate) item.startDate = row.startDate;
        if (!item.dueDate && row.dueDate) item.dueDate = row.dueDate;
        if (!item.priority && row.priority) item.priority = row.priority;
        if ((row.date || "") > item.lastWorklogDate) item.lastWorklogDate = row.date || "";
      });
    });

    const rows = Array.from(rowsByKey.values()).map((row) => {
      const dueState = deliveryDueState(row);
      const parentKey = deliveryParentKey(row);
      return {
        key: row.key,
        account: detailPlanningValue(row.account, row.key),
        team: detailDisplayValue(row.team),
        parentKey,
        parentSummary: parentKey === "-" ? "-" : detailPlanningValue(row.parentSummary, row.key),
        childKey: row.key,
        childSummary: detailSummaryValue(row),
        status: isTempoWorkItem(row.key) ? "Operational" : detailDisplayValue(row.status),
        priority: detailPlanningValue(row.priority, row.key),
        startDate: detailPlanningValue(row.startDate, row.key),
        dueDate: detailPlanningValue(row.dueDate, row.key),
        lastWorklogDate: detailDisplayValue(row.lastWorklogDate),
        daysToDue: dueState.label,
        daysToDueValue: dueState.days,
        deliveryHealth: dueState.health,
        healthSubjectKey: row.key,
        healthSubjectLabel: `Child Key: ${row.key}`,
      };
    });

    const parentKeys = new Set(rows.map((row) => row.parentKey).filter((key) => key && key !== "-"));
    return rows.filter((row) => !(row.parentKey === "-" && parentKeys.has(row.childKey)));
  }

  function validateDeliveryProgressTeamRows(rows) {
    if (!state.teams.size) return;
    const selectedTeams = new Set(Array.from(state.teams).filter((team) => validTeamSet.has(team)));
    if (!selectedTeams.size) return;
    const invalidRows = rows.filter((row) => !selectedTeams.has(row.team));
    if (!invalidRows.length) return;
    console.error("Delivery Progress team filter validation failed", {
      selectedTeams: Array.from(selectedTeams).sort((a, b) => a.localeCompare(b)),
      invalidRows: invalidRows.slice(0, 10).map((row) => ({
        childKey: row.childKey || row.key,
        team: row.team,
      })),
      invalidRowCount: invalidRows.length,
    });
  }

  function validateDeliveryProgressKnownOwnership(rows) {
    const selectedTeams = new Set(Array.from(state.teams).filter((team) => validTeamSet.has(team)));
    const adfRows = rows.filter((row) => (row.childKey || row.key) === "ADF-2326");
    const adfTicketTeam = deliveryProgressTicketTeamForKey("ADF-2326");
    const errors = [];

    if (adfTicketTeam !== "Integration") {
      errors.push({ check: "ADF-2326 Jira ticket team", expected: "Integration", actual: adfTicketTeam || "-" });
    }
    adfRows
      .filter((row) => row.team !== "Integration")
      .forEach((row) => errors.push({ check: "ADF-2326 visible team", expected: "Integration", actual: row.team || "-", childKey: row.childKey || row.key }));
    if (selectedTeams.size && !selectedTeams.has("Integration") && adfRows.length) {
      errors.push({
        check: "ADF-2326 excluded by non-Integration team filter",
        selectedTeams: Array.from(selectedTeams).sort((a, b) => a.localeCompare(b)),
        actualRows: adfRows.map((row) => ({ childKey: row.childKey || row.key, team: row.team })),
      });
    }
    if (selectedTeams.size === 1 && selectedTeams.has("Integration")) {
      const adfSourceAvailable = (filteredData({ ignoreTeam: true }).backlogWorklogs || [])
        .some((row) => row.key === "ADF-2326");
      if (adfSourceAvailable && !adfRows.length) {
        errors.push({ check: "ADF-2326 included by Integration team filter", expected: "present", actual: "missing" });
      }
    }

    if (errors.length) {
      console.error("Delivery Progress known ownership validation failed", errors);
    }
  }

  function deliveryDueState(row) {
    if (isTempoWorkItem(row.key)) return { label: "-", days: null, health: "Not applicable" };
    const status = normalizeStatus(row.status);
    const statusCategory = normalizeStatus(row.statusCategory);
    if (status.includes("blocked") || status.includes("on hold")) return { label: "-", days: null, health: "Not applicable" };
    if (statusCategory === "done" || ["done", "closed", "resolved", "rejected", "abandoned", "cancelled", "canceled"].includes(status)) {
      return { label: "-", days: null, health: "Completed" };
    }

    const dueDate = detailDisplayValue(row.dueDate);
    if (dueDate === "-") return { label: "-", days: null, health: "No due date" };
    const currentDate = raw.meta.currentDate || raw.meta.dateMax;
    const days = Math.round((parseDate(dueDate) - parseDate(currentDate)) / 86400000);
    if (!Number.isFinite(days)) return { label: "-", days: null, health: "No due date" };
    if (days < 0) return { label: `${durationLabel(Math.abs(days))} overdue`, days, health: "Overdue" };
    if (days <= 7) return { label: `${durationLabel(days)} remaining`, days, health: "Due soon" };
    return { label: `${durationLabel(days)} remaining`, days, health: "Healthy" };
  }

  function durationLabel(days) {
    if (days >= 7) {
      const weeks = Math.floor(days / 7);
      const remainder = days % 7;
      return remainder ? `${weeks}w ${remainder}d` : `${weeks}w`;
    }
    return `${days}d`;
  }

  function currentDetailSort(mode) {
    const selected = state.detailSort[mode] || {};
    if (selected.key && selected.direction) return selected;
    return DEFAULT_DETAIL_SORTS[mode];
  }

  function sortDetailRows(rows, mode, columns) {
    const sort = currentDetailSort(mode);
    const column = columns.find((item) => item.key === sort.key) || {};
    const direction = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const deliveryCompare = mode === "deliveryProgress" ? compareDeliveryProgressRows(a, b, sort.key, direction) : null;
      if (deliveryCompare !== null) return deliveryCompare;
      const bugTriageCompare = mode === "bugTriage" ? compareBugTriageRows(a, b, sort.key, direction) : null;
      if (bugTriageCompare !== null) return bugTriageCompare;
      if (column.numeric) {
        return ((Number(a[sort.key]) || 0) - (Number(b[sort.key]) || 0)) * direction;
      }
      return String(a[sort.key] || "").localeCompare(String(b[sort.key] || "")) * direction;
    });
  }

  function bugTriageOrder(value, order) {
    const normalized = detailDisplayValue(value);
    const index = order.indexOf(normalized);
    return index === -1 ? order.length : index;
  }

  function compareBugTriageRows(a, b, key, direction) {
    if (key !== "bugSeverity") return null;
    const severityCompare = (bugTriageOrder(a.bugSeverity, BUG_SEVERITY_ORDER) - bugTriageOrder(b.bugSeverity, BUG_SEVERITY_ORDER)) * direction;
    return severityCompare || a.key.localeCompare(b.key);
  }

  function compareDeliveryProgressRows(a, b, key, direction) {
    if (key === "deliveryHealth") {
      const healthCompare = ((DELIVERY_HEALTH_ORDER[a.deliveryHealth] ?? 99) - (DELIVERY_HEALTH_ORDER[b.deliveryHealth] ?? 99)) * direction;
      if (healthCompare) return healthCompare;
      return compareDeliveryDates(a, b, "dueDate", 1) || compareDeliveryDates(a, b, "lastWorklogDate", -1) || (a.childKey || a.key || "").localeCompare(b.childKey || b.key || "");
    }
    if (key === "daysToDue") {
      const aValue = Number.isFinite(a.daysToDueValue) ? a.daysToDueValue : Number.POSITIVE_INFINITY;
      const bValue = Number.isFinite(b.daysToDueValue) ? b.daysToDueValue : Number.POSITIVE_INFINITY;
      return (aValue - bValue) * direction;
    }
    if (["startDate", "dueDate", "lastWorklogDate"].includes(key)) {
      return compareDeliveryDates(a, b, key, direction);
    }
    return null;
  }

  function compareDeliveryDates(a, b, key, direction) {
    const aMissing = !a[key] || a[key] === "-";
    const bMissing = !b[key] || b[key] === "-";
    if (aMissing !== bMissing) return aMissing ? 1 : -1;
    if (aMissing && bMissing) return 0;
    return String(a[key]).localeCompare(String(b[key])) * direction;
  }
  function cycleDetailSort(mode, key) {
    const current = state.detailSort[mode] || {};
    if (current.key !== key) {
      state.detailSort[mode] = { key, direction: "asc" };
    } else if (current.direction === "asc") {
      state.detailSort[mode] = { key, direction: "desc" };
    } else {
      state.detailSort[mode] = { key: null, direction: null };
    }
  }

  function groupAccounts(backlog, worklogs, filteredBacklog = backlog) {
    const map = new Map();
    const ensureBucket = (account) => {
      if (!map.has(account)) {
        map.set(account, {
          account,
          estimated: 0,
          logged: 0,
          items: new Set(),
          estimateItems: new Set(),
        });
      }
      return map.get(account);
    };

    backlog.filter((row) => validTeamSet.has(backlogTeam(row))).forEach((row) => {
      const account = row.account || "(blank)";
      const item = ensureBucket(account);
      if (row.key && item.estimateItems.has(row.key)) return;
      if (row.key) item.estimateItems.add(row.key);
      item.estimated += Number(row.originalEstimateHours) || 0;
    });

    governedTempoAccountAggregation(worklogs).forEach((tempoAccount) => {
      const item = ensureBucket(tempoAccount.account);
      item.logged += tempoAccount.logged;
    });

    filteredBacklog.filter((row) => validTeamSet.has(backlogTeam(row))).forEach((row) => {
      const account = row.account || "(blank)";
      if (row.key) ensureBucket(account).items.add(row.key);
    });

    return Array.from(map.values()).map((row) => ({
      account: row.account,
      estimated: row.estimated,
      logged: row.logged,
      itemCount: row.items.size,
      loggedVsEstimate: row.estimated ? row.logged / row.estimated : 0,
      variance: row.logged - row.estimated,
    }));
  }

  function groupPeople(worklogs, capacity) {
    const map = new Map();
    const emptyPerson = (person, team) => ({
      person,
      team,
      logged: 0,
      loggedTotal: 0,
      loggedEngineering: 0,
      loggedOperations: 0,
      billable: 0,
      capacity: 0,
      personId: "",
      items: new Set(),
    });

    worklogs.forEach((row) => {
      const rowKey = row.key || "";
      if (isExcludedOperationalItem(rowKey)) return;

      const key = row.person || "(blank)";
      if (!map.has(key)) map.set(key, emptyPerson(key, row.team));
      const item = map.get(key);
      if (!item.personId && row.assigneeId) item.personId = row.assigneeId;
      const logged = Number(row.logged) || 0;
      if (isTempoWorkItem(rowKey)) {
        item.loggedOperations += logged;
      } else {
        item.loggedEngineering += logged;
      }
      item.logged += logged;
      item.billable += Number(row.billable) || 0;
      if (rowKey) item.items.add(rowKey);
    });
    capacity.forEach((row) => {
      const key = row.assignee || "(blank)";
      if (!map.has(key)) map.set(key, emptyPerson(key, row.team));
      map.get(key).capacity += Number(row.planned) || 0;
    });
    return Array.from(map.values()).map((row) => {
      const loggedTotal = row.loggedEngineering + row.loggedOperations;
      return {
        ...row,
        logged: loggedTotal,
        loggedTotal,
        itemCount: row.items.size,
        utilization: row.capacity ? loggedTotal / row.capacity : 0,
      };
    });
  }

  function accountTotalsRow(rows) {
    const estimated = rows.reduce((total, row) => total + (Number(row.estimated) || 0), 0);
    const logged = rows.reduce((total, row) => total + (Number(row.logged) || 0), 0);
    const itemCount = rows.reduce((total, row) => total + (Number(row.itemCount) || 0), 0);
    return {
      account: "TOTAL",
      estimated,
      logged,
      variance: logged - estimated,
      loggedVsEstimate: estimated ? logged / estimated : 0,
      itemCount,
    };
  }

  function peopleTotalsRow(rows) {
    const capacity = rows.reduce((total, row) => total + (Number(row.capacity) || 0), 0);
    const loggedTotal = rows.reduce((total, row) => total + (Number(row.loggedTotal) || 0), 0);
    return {
      person: "TOTAL",
      team: "",
      capacity,
      loggedTotal,
      loggedEngineering: rows.reduce((total, row) => total + (Number(row.loggedEngineering) || 0), 0),
      loggedOperations: rows.reduce((total, row) => total + (Number(row.loggedOperations) || 0), 0),
      utilization: capacity ? loggedTotal / capacity : 0,
      billable: rows.reduce((total, row) => total + (Number(row.billable) || 0), 0),
      itemCount: rows.reduce((total, row) => total + (Number(row.itemCount) || 0), 0),
    };
  }

  function tableHtml(columns, rows, mode, footerRow = null) {
    const explicitSort = state.detailSort[mode] || {};
    const head = `<thead><tr>${columns.map((column) => {
      const marker = explicitSort.key === column.key ? (explicitSort.direction === "asc" ? "^" : "v") : "";
      return `<th class="${detailCellClass(column)}">
        <button type="button" class="sort-header ${detailCellClass(column)}" data-sort-key="${escapeHtml(column.key)}">
          <span>${escapeHtml(column.label)}</span><span class="sort-mark">${marker}</span>
        </button>
      </th>`;
    }).join("")}</tr></thead>`;
    let previousGroup = null;
    const body = rows.map((row) => {
      const groupValue = state.detailGroupBy ? detailDisplayValue(row[state.detailGroupBy]) : null;
      const group = state.detailGroupBy && groupValue !== previousGroup
        ? `<tr class="group-row"><td colspan="${columns.length}">${escapeHtml(columns.find((column) => column.key === state.detailGroupBy)?.label || "Group")}: ${escapeHtml(groupValue)}</td></tr>`
        : "";
      previousGroup = groupValue;
      return `${group}<tr>${columns.map((column) => `<td class="${detailCellClass(column)}">${formatDetailCell(row, column)}</td>`).join("")}</tr>`;
    }).join("");
    const foot = footerRow
      ? `<tfoot><tr class="totals-row">${columns.map((column) => `<td class="${detailCellClass(column)}">${formatDetailCell(footerRow, column)}</td>`).join("")}</tr></tfoot>`
      : "";
    return `${head}<tbody>${body || `<tr><td colspan="${columns.length}">No matching rows.</td></tr>`}</tbody>${foot}`;
  }

  function detailCellClass(column) {
    return [
      column.numeric ? "num" : "",
      column.health ? "health-cell" : "",
      column.healthKey ? "health-key-cell" : "",
      column.emphasize ? "emphasis-cell" : "",
    ].filter(Boolean).join(" ");
  }

  function formatDetailCell(row, column) {
    const value = row[column.key];
    if (column.healthKey) return formatHealthSubjectKey(value, row);
    if (column.health) return formatDeliveryHealth(value, row);
    if (["key", "parentKey", "childKey"].includes(column.key)) return formatJiraIssueLink(value, column.emphasize);
    if (column.key === "account") return formatTempoEntityLink(value, TEMPO_ACCOUNT_IDS, "accounts/account");
    if (column.key === "team") return formatTempoEntityLink(value, TEMPO_TEAM_IDS, "teams/team");
    if (column.key === "person") return formatJiraPersonLink(value, row.personId);
    if (column.emphasize) return `<strong class="table-emphasis">${escapeHtml(value)}</strong>`;
    if (column.formatter) return escapeHtml(column.formatter(value, row));
    if (column.percent) return formatPercent(Number(value) || 0);
    if (column.numeric) return formatNumber(Number(value) || 0, column.digits || 0);
    return escapeHtml(value);
  }

  function formatJiraIssueLink(value, emphasize = false) {
    const key = String(value || "").trim();
    if (!key || key === "-") return "-";
    const label = emphasize ? `<strong class="table-emphasis">${escapeHtml(key)}</strong>` : escapeHtml(key);
    return `<a class="jira-link" href="https://oat-sa.atlassian.net/browse/${encodeURIComponent(key)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  }

  function formatTempoEntityLink(value, ids, route) {
    const label = detailDisplayValue(value);
    const id = ids[label];
    if (!id) return escapeHtml(label);
    return `<a class="tempo-link" href="${TEMPO_APP_BASE}/${route}/${encodeURIComponent(id)}/" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  }

  function formatJiraPersonLink(value, accountId) {
    const label = detailDisplayValue(value);
    if (!accountId || label === "-") return escapeHtml(label);
    return `<a class="jira-link" href="https://oat-sa.atlassian.net/people/${encodeURIComponent(accountId)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  }

  function renderDetailGroupControl(columns) {
    const select = $("detailGroupBy");
    if (!select) return;
    const allowed = columns.filter((column) => !column.numeric && !column.percent && !column.health).map((column) => column.key);
    if (!allowed.includes(state.detailGroupBy)) state.detailGroupBy = "";
    select.innerHTML = `<option value="">No grouping</option>${columns.filter((column) => allowed.includes(column.key)).map((column) => `<option value="${escapeHtml(column.key)}">${escapeHtml(column.label)}</option>`).join("")}`;
    select.value = state.detailGroupBy;
  }

  function formatHealthSubjectKey(value, row) {
    const label = detailDisplayValue(value);
    const title = `Health based on ${row.healthSubjectLabel || `Child Key: ${label}`}`;
    const issue = label === "-" ? "-" : `<a class="jira-link" href="https://oat-sa.atlassian.net/browse/${encodeURIComponent(label)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    return `<span class="health-key ${deliveryHealthClass(row.deliveryHealth)}" title="${escapeHtml(title)}">${issue}</span>`;
  }

  function formatDeliveryHealth(value, row) {
    const label = detailDisplayValue(value);
    const title = `Health based on ${row.healthSubjectLabel || `Child Key: ${row.childKey || row.key || ""}`}`;
    return `<span class="health-badge ${deliveryHealthClass(label)}" title="${escapeHtml(title)}"><span class="health-dot"></span>${escapeHtml(label)}</span>`;
  }

  function deliveryHealthClass(value) {
    if (["Overdue", "Critical"].includes(value)) return "health-red";
    if (["Due soon", "At Risk"].includes(value)) return "health-amber";
    if (value === "Healthy") return "health-blue";
    if (value === "Completed") return "health-green";
    return "health-grey";
  }

  function renderFooter() {
    const sources = (raw.meta.sources || []).filter((source) => source.name !== "Jira Bug Triage queue");
    $("sourceSummary").textContent = sources.map((source) => `${source.name}: ${formatNumber(source.rows)} rows`).join(" | ");
    const manifest = raw.meta.buildManifest || {};
    const generated = raw.meta.generatedOn || "unknown date";
    $("dataFreshness").textContent = `Data freshness: built ${generated} · ${sources.length} sources`;
    renderDataQuality(manifest);
  }

  function renderDataQuality(manifest) {
    const sources = (raw.meta.sources || []).filter((source) => source.name !== "Jira Bug Triage queue");
    const zeroSources = sources.filter((source) => Number(source.rows) === 0);
    const excluded = raw.meta.excludedTempoWorkItems || [];
    const summary = $("dataQualitySummary");
    const sourceList = $("dataQualitySources");
    if (!summary || !sourceList) return;
    const warningCount = zeroSources.length;
    summary.innerHTML = `<div class="quality-status ${warningCount ? "warning" : "ok"}">${warningCount ? `${warningCount} source warning${warningCount === 1 ? "" : "s"}` : "No empty source datasets detected"}</div><div class="quality-facts"><span>Last synchronized: ${escapeHtml(raw.meta.generatedOn || "not available")}</span><span>Excluded governed items: ${formatNumber(excluded.length)}</span><span>Payload hash: ${escapeHtml(manifest.payloadSha256 || "not available")}</span></div>`;
    sourceList.innerHTML = sources.map((source) => { const hasRows = Number(source.rows) > 0; const status = hasRows ? "Synchronized" : "Empty"; return `<div class="quality-source ${hasRows ? "ok" : "warning"}"><strong>${escapeHtml(source.name)}</strong><span>${escapeHtml(status)} · ${formatNumber(source.rows)} rows · ${escapeHtml(source.file)}</span></div>`; }).join("");
  }

  function setWorkspaceTab(tabId) {
    document.querySelector(".app-shell").dataset.activeTab = tabId;
    document.querySelector(".workspace").dataset.activeTab = tabId;
    document.querySelectorAll(".workspace-tab").forEach((tab) => {
      const active = tab.dataset.workspaceTab === tabId;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".workspace-tab-panel").forEach((panel) => {
      panel.hidden = panel.id !== tabId;
      panel.classList.toggle("active", panel.id === tabId);
    });
    document.querySelectorAll("[data-workspace-surface]").forEach((surface) => {
      surface.hidden = surface.dataset.workspaceSurface !== tabId;
    });
    const tabTitles = {
      portfolioTab: ["PowerBI-style workspace", "Delivery Portfolio Overview"],
      qualityTab: ["Source governance", "Datasources and sync status"],
      demandTab: ["Governed demand visibility", "Demand Management"],
    };
    const [eyebrow, title] = tabTitles[tabId] || tabTitles.portfolioTab;
    $("workspaceEyebrow").textContent = eyebrow;
    $("workspaceTitle").textContent = title;
    if (tabId === "portfolioTab" && lastUpdateContext) renderKpis();
  }

  function updateRangeBadge() {
    $("rangeBadge").textContent = `${state.startDate} to ${state.endDate}`;
  }

  function update() {
    $("startDate").value = state.startDate;
    $("endDate").value = state.endDate;
    $("trendGrain").value = state.trendGrain;
    updateRangeBadge();
    renderFacets();
    lastUpdateContext = buildUpdateContext();
    const { data, effortData, programWorklogs } = lastUpdateContext;
    renderKpis();
    renderActiveFilters();
    renderCharts(data, effortData, programWorklogs);
    renderDetails(data, effortData);
    renderFooter();
  }

  function relayoutCharts() {
    if (!lastUpdateContext) return;
    const { data, effortData, programWorklogs } = lastUpdateContext;
    renderCharts(data, effortData, programWorklogs);
  }

  function toggleFilter(key, value) {
    const set = state[key];
    if (set.has(value)) set.delete(value);
    else set.add(value);
    update();
  }

  function setPreset(preset) {
    const max = parseDate(raw.meta.dateMax);
    if (preset === "full") {
      state.startDate = raw.meta.dateMin;
      state.endDate = raw.meta.dateMax;
    } else if (preset === "last30") {
      const start = new Date(max);
      start.setDate(start.getDate() - 29);
      state.startDate = clampDate(start.toISOString().slice(0, 10));
      state.endDate = raw.meta.dateMax;
    } else if (preset === "last60") {
      const start = new Date(max);
      start.setDate(start.getDate() - 59);
      state.startDate = clampDate(start.toISOString().slice(0, 10));
      state.endDate = raw.meta.dateMax;
    } else if (preset === "qtd") {
      const reference = parseDate(raw.meta.currentDate || raw.meta.dateMax);
      const year = reference.getFullYear();
      const quarterIndex = Math.floor(reference.getMonth() / 3);
      const quarterStart = new Date(year, quarterIndex * 3, 1);
      const quarterEnd = new Date(year, quarterIndex * 3 + 3, 0);
      state.startDate = clampDate(quarterStart.toISOString().slice(0, 10));
      state.endDate = clampDate(quarterEnd.toISOString().slice(0, 10));
    }
    document.querySelectorAll(".segmented button").forEach((button) => {
      button.classList.toggle("active", button.dataset.preset === preset);
    });
    update();
  }

  function downloadSnapshot() {
    const ctx = lastUpdateContext || buildUpdateContext();
    const { data, effortData } = ctx;
    const columns = detailColumns("accounts");
    const rows = sortDetailRows(groupAccounts(data.backlog, effortData.baseFiltered.worklogs, data.backlog), "accounts", columns);
    const csvRows = [
      columns.map((column) => column.label),
      ...rows.map((row) => columns.map((column) => {
        const value = row[column.key];
        if (column.percent) return (Number(value) || 0).toFixed(4);
        if (column.numeric) return (Number(value) || 0).toFixed(column.digits || 0);
        return value;
      })),
    ];
    const csv = csvRows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `delivery-bi-snapshot-${state.startDate}_${state.endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function csvCell(value) {
    const str = String(value ?? "");
    return /[",\n]/.test(str) ? `"${str.replaceAll('"', '""')}"` : str;
  }

  function bindFacetPicker(prefix, stateKey, setOpen, optionValues) {
    $(`${prefix}PickerToggle`).addEventListener("click", () => {
      setOpen($(`${prefix}PickerMenu`).hidden);
    });
    $(`${prefix}SelectAll`).addEventListener("click", () => {
      state[stateKey].clear();
      optionValues().forEach((value) => state[stateKey].add(value));
      update();
      setOpen(true);
    });
    $(`${prefix}ClearAll`).addEventListener("click", () => {
      state[stateKey].clear();
      update();
      setOpen(true);
    });
  }

  function bindEvents() {
    $("startDate").min = raw.meta.dateMin;
    $("startDate").max = raw.meta.dateMax;
    $("endDate").min = raw.meta.dateMin;
    $("endDate").max = raw.meta.dateMax;

    $("startDate").addEventListener("change", (event) => {
      state.startDate = clampDate(event.target.value);
      if (state.startDate > state.endDate) state.endDate = state.startDate;
      update();
    });
    $("endDate").addEventListener("change", (event) => {
      state.endDate = clampDate(event.target.value);
      if (state.endDate < state.startDate) state.startDate = state.endDate;
      update();
    });
    $("trendGrain").addEventListener("change", (event) => {
      state.trendGrain = event.target.value;
      update();
    });
    $("assigneeSearch").addEventListener("input", (event) => {
      state.assigneeSearch = event.target.value;
      renderFacets();
    });
    $("clientSearch").addEventListener("input", (event) => {
      state.clientSearch = event.target.value;
      renderFacets();
    });
    $("accountSearch").addEventListener("input", (event) => {
      state.accountSearch = event.target.value;
      renderFacets();
    });
    $("targetReleaseSearch").addEventListener("input", (event) => {
      state.targetReleaseSearch = event.target.value;
      renderFacets();
    });
    $("programSearch").addEventListener("input", (event) => {
      state.programSearch = event.target.value;
      renderFacets();
    });
    $("detailSearch").addEventListener("input", (event) => {
      state.detailSearch = event.target.value;
      renderDetails(filteredData());
    });
    $("detailGroupBy").addEventListener("change", (event) => {
      state.detailGroupBy = event.target.value;
      renderDetails(filteredData());
    });
    $("detailTable").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-sort-key]");
      if (!button) return;
      cycleDetailSort(state.detail, button.dataset.sortKey);
      renderDetails(filteredData());
    });
    $("resetFilters").addEventListener("click", () => {
      state.startDate = raw.meta.dateMin;
      state.endDate = raw.meta.dateMax;
      [
        "teams",
        "assignees",
        "skills",
        "clients",
        "accounts",
        "categories",
        "priorities",
        "targetReleases",
        "programs",
        "releases",
      ].forEach((key) => state[key].clear());
      resetStatusDefaults();
      state.detailSearch = "";
      state.assigneeSearch = "";
      state.clientSearch = "";
      state.accountSearch = "";
      state.targetReleaseSearch = "";
      state.programSearch = "";
      $("detailSearch").value = "";
      $("assigneeSearch").value = "";
      $("clientSearch").value = "";
      $("accountSearch").value = "";
      $("targetReleaseSearch").value = "";
      $("programSearch").value = "";
      document.querySelectorAll(".segmented button").forEach((button) => button.classList.toggle("active", button.dataset.preset === "full"));
      update();
    });
    $("downloadSnapshot").addEventListener("click", downloadSnapshot);

    bindFacetPicker("team", "teams", setTeamPickerOpen, teamOptionValues);
    bindFacetPicker("assignee", "assignees", setAssigneePickerOpen, assigneeOptionValues);
    bindFacetPicker("skill", "skills", setSkillPickerOpen, skillOptionValues);
    bindFacetPicker("client", "clients", setClientPickerOpen, clientOptionValues);
    bindFacetPicker("account", "accounts", setAccountPickerOpen, accountOptionValues);
    bindFacetPicker("category", "categories", setCategoryPickerOpen, categoryOptionValues);
    bindFacetPicker("priority", "priorities", setPriorityPickerOpen, priorityOptionValues);
    bindFacetPicker("status", "statuses", setStatusPickerOpen, statusOptionValues);
    bindFacetPicker("targetRelease", "targetReleases", setTargetReleasePickerOpen, targetReleaseOptionValues);
    bindFacetPicker("program", "programs", setProgramPickerOpen, programOptionValues);
    bindFacetPicker("release", "releases", setReleasePickerOpen, releaseOptionValues);

    document.querySelector(".segmented").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-preset]");
      if (button) setPreset(button.dataset.preset);
    });

    document.body.addEventListener("change", (event) => {
      const input = event.target.closest("input[data-state]");
      if (!input) return;
      toggleFilter(input.dataset.state, input.value);
    });

    $("activeFilters").addEventListener("click", (event) => {
      const button = event.target.closest("button[data-remove-key]");
      const statusReset = event.target.closest("button[data-reset-default-statuses]");
      const clearButton = event.target.closest("button[data-clear-key]");
      if (statusReset) {
        resetStatusDefaults();
        update();
        return;
      }
      if (clearButton) {
        state[clearButton.dataset.clearKey].clear();
        update();
        return;
      }
      if (!button) return;
      state[button.dataset.removeKey].delete(button.dataset.removeValue);
      update();
    });

    document.querySelector(".detail-tabs").addEventListener("click", (event) => {
      const tab = event.target.closest(".tab");
      if (!tab) return;
      state.detail = tab.dataset.detail;
      state.detailGroupBy = "";
      document.querySelectorAll(".tab").forEach((button) => button.classList.toggle("active", button === tab));
      renderFacets();
      renderDetails(filteredData());
    });

    document.querySelector(".workspace-tabs").addEventListener("click", (event) => {
      const tab = event.target.closest(".workspace-tab");
      if (tab) setWorkspaceTab(tab.dataset.workspaceTab);
    });

    window.addEventListener("resize", debounce(relayoutCharts, 150));
  }

  function debounce(fn, wait) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  resetStatusDefaults();
  bindEvents();
  setWorkspaceTab("portfolioTab");
  document.querySelector('.segmented button[data-preset="full"]').classList.add("active");
  update();
  refreshDataIfChanged();
  window.setInterval(refreshDataIfChanged, 5 * 60 * 1000);
})();
