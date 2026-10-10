(function () {
  "use strict";

  const data = window.BI_DATA;
  const { escapeHtml } = window.DashboardCore;
  const $ = (id) => document.getElementById(id);
  const number = (value, digits = 0) => new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value) || 0);
  const hours = (value) => `${number(value, 1)} h`;
  const normalizePerson = (value) => String(value || "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
  const by = (rows, key) => rows.reduce((map, row) => { const value = row[key] || "Unspecified"; map.set(value, (map.get(value) || 0) + 1); return map; }, new Map());
  const sumBy = (rows, key, valueKey) => rows.reduce((map, row) => { const value = row[key] || "Unspecified"; map.set(value, (map.get(value) || 0) + (Number(row[valueKey]) || 0)); return map; }, new Map());

  const releaseByCycle = new Map((data.releases || []).map((release) => [release.cycle, release]));
  let selectedWorkflowStage = "";
  let selectedQualityException = "";
  const pickerConfig = {
    team: { label: "teams", values: () => (data.teams || []).map((row) => row.team) },
    assignee: { label: "assignees", values: () => (data.assignees || []).map((row) => row.assignee) },
    skill: { label: "skills", values: () => (data.skills || []).map((row) => row.skill) },
    client: { label: "clients", values: () => [...(data.worklogs || []).map((row) => row.delivery), ...(data.demand || []).map((row) => row.tempoClient || "Other/Blank")] },
    businessArea: { label: "business areas", values: () => [...(data.promoters || []).map((row) => row.businessArea), "Other/Blank"] },
    promoter: { label: "promoters", values: () => [...(data.promoters || []).map((row) => row.promoter), "Other/Blank"] },
    account: { label: "accounts", values: () => (data.demand || []).map((row) => row.account || "Other/Blank") },
    module: { label: "modules", values: () => (data.demand || []).map((row) => row.productModule || "Other/Blank") },
    period: { label: "releases", values: () => (data.demand || []).map((row) => row.targetRelease || "Unscheduled / N/A") },
  };
  const selectedPickers = Object.fromEntries(Object.keys(pickerConfig).map((name) => [name, new Set()]));
  const knownPromoters = new Set((data.promoters || []).map((row) => normalizePerson(row.promoter)));
  const masterByWeek = new Map();
  (data.masterDates || []).forEach((row) => {
    if (!masterByWeek.has(row.week)) masterByWeek.set(row.week, []);
    masterByWeek.get(row.week).push(row.date);
  });

  function inRange(date, start, end) { return !!date && date >= start && date <= end; }
  function releaseIntersects(period, start, end) {
    if (period === "Unscheduled / N/A") return true;
    const release = releaseByCycle.get(period);
    return !release || (release.start <= end && release.end >= start);
  }
  function pickerState(name) { return selectedPickers[name]; }
  function pickerValues(name) {
    const values = pickerConfig[name].values().filter(Boolean);
    if (name === "promoter" && pickerState("businessArea").size) {
      const selectedAreas = pickerState("businessArea");
      return [...new Set((data.promoters || []).filter((row) => selectedAreas.has(row.businessArea)).map((row) => row.promoter))].sort();
    }
    return [...new Set(values)].sort();
  }
  function promoterMatches(row, selected) {
    if (!selected.size) return true;
    const promoter = row.promoter || "Other/Blank";
    const reporter = row.reporter || "Other/Blank";
    return [...selected].some((value) => value === "Other/Blank"
      ? (!knownPromoters.has(normalizePerson(row.promoter)) && !knownPromoters.has(normalizePerson(row.reporter)))
      : normalizePerson(value) === normalizePerson(promoter) || normalizePerson(value) === normalizePerson(reporter));
  }
  function businessAreaMatches(row, selected) {
    if (!selected.size) return true;
    return selected.has(row.businessArea || "Other/Blank") || selected.has(row.reporterBusinessArea || "Other/Blank");
  }

  function pickerMetric(name, value) {
    if (name !== "assignee") return "";
    const loggedHours = (data.worklogs || [])
      .filter((row) => row.person === value)
      .reduce((total, row) => total + (Number(row.logged) || 0), 0);
    return `${number(loggedHours, 1)}h`;
  }

  function renderPicker(name) {
    const values = pickerValues(name);
    const selected = pickerState(name);
    const suffix = name[0].toUpperCase() + name.slice(1);
    const search = $(`demand${suffix}Search`).value.trim().toLowerCase();
    const facet = $(`demand${suffix}Facet`);
    const summary = $(`demand${suffix}PickerSummary`);
    const visible = values.filter((value) => value.toLowerCase().includes(search));
    facet.innerHTML = visible.map((value, index) => {
      const id = `demand-${name}-facet-${index}`;
      const metric = pickerMetric(name, value);
      return `<label class="facet" for="${id}" title="${escapeHtml(value)}"><input id="${id}" type="checkbox" data-demand-picker="${name}" value="${escapeHtml(value)}" ${selected.has(value) ? "checked" : ""} /><span class="facet-name">${escapeHtml(value)}</span>${metric ? `<span class="facet-count">${metric}</span>` : "<span></span>"}</label>`;
    }).join("") || `<div class="facet-empty">No matching values.</div>`;
    summary.textContent = selected.size ? `${selected.size} selected` : `All ${pickerConfig[name].label}`;
  }
  function togglePicker(name) {
    const suffix = name[0].toUpperCase() + name.slice(1);
    const menu = $(`demand${suffix}PickerMenu`);
    const toggle = $(`demand${suffix}PickerToggle`);
    const open = menu.hidden;
    Object.keys(pickerConfig).forEach((other) => {
      const otherSuffix = other[0].toUpperCase() + other.slice(1);
      const otherMenu = $(`demand${otherSuffix}PickerMenu`);
      const otherToggle = $(`demand${otherSuffix}PickerToggle`);
      otherMenu.hidden = true;
      otherToggle.setAttribute("aria-expanded", "false");
    });
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  }
  function initialise() {
    const dates = (data.masterDates || []).map((row) => row.date).filter(Boolean).sort();
    const start = dates[0] || data.meta.dateMin;
    const end = dates[dates.length - 1] || data.meta.dateMax;
    $("demandStartDate").min = start; $("demandStartDate").max = end; $("demandStartDate").value = start;
    $("demandEndDate").min = start; $("demandEndDate").max = end; $("demandEndDate").value = end;
    Object.keys(pickerConfig).forEach((name) => {
      const suffix = name[0].toUpperCase() + name.slice(1);
      renderPicker(name);
      $(`demand${suffix}PickerToggle`).addEventListener("click", () => togglePicker(name));
      $(`demand${suffix}Search`).addEventListener("input", () => renderPicker(name));
    });
    document.querySelectorAll(".demand-filter-rail input:not([data-demand-picker]), #demandMatrixGroup, #demandCapacityRows, #demandCapacityColumns, #demandCapacityValue").forEach((input) => input.addEventListener("change", render));
    document.querySelector(".demand-filter-rail").addEventListener("change", (event) => {
      const option = event.target.closest("input[data-demand-picker]");
      if (!option) return;
      const selected = pickerState(option.dataset.demandPicker);
      if (option.checked) selected.add(option.value);
      else selected.delete(option.value);
      renderPicker(option.dataset.demandPicker);
      if (option.dataset.demandPicker === "businessArea") renderPicker("promoter");
      render();
    });
    document.querySelector(".demand-filter-rail").addEventListener("click", (event) => {
      const action = event.target.closest("button[data-demand-picker-action]");
      if (!action) return;
      const selected = pickerState(action.dataset.demandPicker);
      selected.clear();
      if (action.dataset.demandPickerAction === "all") pickerValues(action.dataset.demandPicker).forEach((value) => selected.add(value));
      renderPicker(action.dataset.demandPicker);
      render();
    });
    $("resetDemandFilters").addEventListener("click", () => {
      $("demandStartDate").value = start;
      $("demandEndDate").value = end;
      Object.keys(pickerConfig).forEach((name) => {
        const suffix = name[0].toUpperCase() + name.slice(1);
        pickerState(name).clear();
        $(`demand${suffix}Search`).value = "";
        renderPicker(name);
      });
      selectedWorkflowStage = "";
      selectedQualityException = "";
      render();
    });
    $("demandWorkflow").addEventListener("click", (event) => {
      const stage = event.target.closest("button[data-workflow-stage]")?.dataset.workflowStage;
      if (!stage) return;
      selectedWorkflowStage = selectedWorkflowStage === stage ? "" : stage;
      render();
    });
    $("demandQuality").addEventListener("click", (event) => {
      const exception = event.target.closest("button[data-quality-exception]")?.dataset.qualityException;
      if (!exception) return;
      selectedQualityException = selectedQualityException === exception ? "" : exception;
      render();
    });
    render();
  }
  function current() {
    const filters = {
      start: $("demandStartDate").value,
      end: $("demandEndDate").value,
      teams: pickerState("team"),
      assignees: pickerState("assignee"),
      skills: pickerState("skill"),
      clients: pickerState("client"),
      businessAreas: pickerState("businessArea"),
      promoters: pickerState("promoter"),
      accounts: pickerState("account"),
      modules: pickerState("module"),
      periods: pickerState("period"),
    };
    const demand = (data.demand || []).filter((row) =>
      releaseIntersects(row.planningPeriod, filters.start, filters.end)
      && (!filters.teams.size || filters.teams.has(row.demandTeam))
      && (!filters.assignees.size || filters.assignees.has(row.assignee))
      && (!filters.skills.size || filters.skills.has(row.skill))
      && (!filters.clients.size || filters.clients.has(row.tempoClient || "Other/Blank"))
      && businessAreaMatches(row, filters.businessAreas)
      && promoterMatches(row, filters.promoters)
      && (!filters.accounts.size || filters.accounts.has(row.account || "Other/Blank"))
      && (!filters.modules.size || filters.modules.has(row.productModule || "Other/Blank"))
      && (!filters.periods.size || filters.periods.has(row.targetRelease || "Unscheduled / N/A")));
    const actual = (data.worklogs || []).filter((row) => inRange(row.date, filters.start, filters.end)
      && (!filters.teams.size || filters.teams.has(row.team))
      && (!filters.assignees.size || filters.assignees.has(row.person))
      && (!filters.skills.size || filters.skills.has(row.skill))
      && (!filters.clients.size || filters.clients.has(row.delivery || "Other/Blank"))
      && businessAreaMatches(row, filters.businessAreas)
      && promoterMatches(row, filters.promoters)
      && (!filters.accounts.size || filters.accounts.has(row.account || "Other/Blank"))
      && (!filters.modules.size || filters.modules.has(row.module || "Other/Blank"))
      && (!filters.periods.size || filters.periods.has(row.targetRelease || "Unscheduled / N/A")));
    return { filters, demand, actual };
  }
  function periodCapacity(filters) {
    const rows = [];
    (data.capacity || []).forEach((row) => {
      const dates = masterByWeek.get(row.week) || [];
      const date = dates.find((value) => inRange(value, filters.start, filters.end));
      if (!date || (filters.teams.size && !filters.teams.has(row.team)) || (filters.assignees.size && !filters.assignees.has(row.assignee)) || (filters.skills.size && !filters.skills.has(row.skill))) return;
      const period = (data.releases || []).find((release) => release.start <= date && release.end >= date)?.cycle || "Unscheduled / N/A";
      rows.push({ ...row, period });
    });
    return rows;
  }
  function renderKpis(demand, actual, capacity) {
    const known = demand.reduce((total, row) => total + (Number(row.demandHours) || 0), 0);
    const actualHours = actual.reduce((total, row) => total + (Number(row.logged) || 0), 0);
    const capacityHours = capacity.reduce((total, row) => total + (Number(row.planned) || 0), 0);
    const missing = demand.filter((row) => !row.hasRemainingEstimate).length;
    $("demandKpis").innerHTML = [
      ["Known Outstanding Demand", hours(known), "Jira Remaining Estimate; missing estimates are excluded, not zero."],
      ["Actual Effort", hours(actualHours), "Tempo Logged Hours in the selected period."],
      ["Remaining Period Capacity", hours(capacityHours - actualHours), "Weekly Capacity less Tempo actual effort in the same period."],
      ["Data Quality Exceptions", number(missing), "Tickets with no usable Remaining Estimate."],
      ["Release Predictability", "—", "TODO — hardcoded placeholder; no governed calculation."],
      ["Release KPI", "—", "TODO — hardcoded placeholder; no governed calculation."],
    ].map(([label, value, note]) => `<article class="kpi-card"><span><i class="tone"></i>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note)}</small></article>`).join("");
  }
  function renderMatrix(demand) {
    const periods = [...new Set(demand.map((row) => row.planningPeriod))].sort();
    const teams = [...new Set(demand.map((row) => row.demandTeam))].sort();
    const cells = new Map();
    demand.forEach((row) => cells.set(`${row.demandTeam}|${row.planningPeriod}`, (cells.get(`${row.demandTeam}|${row.planningPeriod}`) || 0) + (Number(row.demandHours) || 0)));
    const groupByPeriod = $("demandMatrixGroup").value === "period";
    const headers = groupByPeriod ? teams : periods;
    const rows = groupByPeriod ? periods : teams;
    const getValue = (row, column) => groupByPeriod ? cells.get(`${column}|${row}`) : cells.get(`${row}|${column}`);
    const rowLabel = groupByPeriod ? "Planning period" : "Team";
    $("demandMatrix").innerHTML = `<thead><tr><th>${rowLabel}</th>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}<th>Total known demand</th></tr></thead><tbody>${rows.map((row) => { const total = headers.reduce((sum, column) => sum + (getValue(row, column) || 0), 0); return `<tr><td>${escapeHtml(row)}</td>${headers.map((column) => `<td>${hours(getValue(row, column) || 0)}</td>`).join("")}<td><strong>${hours(total)}</strong></td></tr>`; }).join("") || `<tr><td colspan="${headers.length + 2}">No known demand for this selection.</td></tr>`}</tbody>`;
  }
  function renderCapacity(demand, actual, capacity) {
    const values = new Map();
    const get = (team, period) => {
      const safeTeam = team || "Unassigned / To Be Assigned";
      const safePeriod = period || "Unscheduled / N/A";
      const key = `${safeTeam}||${safePeriod}`;
      if (!values.has(key)) values.set(key, { team: safeTeam, period: safePeriod, planned: 0, logged: 0, known: 0 });
      return values.get(key);
    };
    capacity.forEach((row) => { get(row.team, row.period).planned += Number(row.planned) || 0; });
    actual.forEach((row) => { get(row.team, row.releaseCycle).logged += Number(row.logged) || 0; });
    demand.forEach((row) => { get(row.demandTeam, row.planningPeriod).known += Number(row.demandHours) || 0; });
    const rowDimension = $("demandCapacityRows").value;
    const columnDimension = $("demandCapacityColumns").value;
    const value = $("demandCapacityValue").value;
    if (rowDimension === columnDimension) {
      $("demandCapacityColumns").value = rowDimension === "team" ? "period" : "team";
      return renderCapacity(demand, actual, capacity);
    }
    const cellValue = (row) => ({ planned: row.planned, logged: row.logged, remaining: row.planned - row.logged, known: row.known, gap: row.planned - row.logged - row.known }[value]);
    const rows = [...new Set([...values.values()].map((row) => row[rowDimension]))].sort();
    const columns = [...new Set([...values.values()].map((row) => row[columnDimension]))].sort();
    const cells = new Map();
    [...values.values()].forEach((row) => {
      const key = `${row[rowDimension]}||${row[columnDimension]}`;
      cells.set(key, (cells.get(key) || 0) + cellValue(row));
    });
    const rowLabel = rowDimension === "team" ? "Team" : "Planning period";
    $("demandCapacity").innerHTML = `<thead><tr><th>${rowLabel}</th>${columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("")}<th>Total</th></tr></thead><tbody>${rows.map((row) => { const total = columns.reduce((sum, column) => sum + (cells.get(`${row}||${column}`) || 0), 0); return `<tr><td>${escapeHtml(row)}</td>${columns.map((column) => { const amount = cells.get(`${row}||${column}`) || 0; return `<td class="${value === "gap" || value === "remaining" ? (amount < 0 ? "negative" : "positive") : ""}">${hours(amount)}</td>`; }).join("")}<td><strong>${hours(total)}</strong></td></tr>`; }).join("") || `<tr><td colspan="${columns.length + 2}">No capacity, actual effort, or known demand for this selection.</td></tr>`}</tbody>`;
  }
  function renderWorkflow(filters, actual) {
    const stages = [
      { key: "STEP 1 - Demand", number: 1, label: "Demand", description: "Backlog · OAT - Idea · Placeholder", tone: "demand" },
      { key: "STEP 2 - DoR", number: 2, label: "DoR", description: "To Do · Analysis & Prepare Development · OAT - Ready for PI", tone: "dor" },
      { key: "STEP 3 - DoD", number: 3, label: "DoD", description: "In Refinement · In Progress · In Development · In UAT / Beta · In Review · Testing · Waiting for Test · Reviewed · Waiting for Review · Ready for Development · Test Complete · Handoff for customer testing · In QA", tone: "dod" },
      { key: "STEP 4 - Done", number: 4, label: "Done", description: "Done · Closed · Resolved", tone: "done" },
    ];
    const statusCategory = (status) => {
      const value = String(status || "").trim().toLowerCase();
      if (["backlog", "oat - idea", "oat-idea", "placeholder"].includes(value)) return "STEP 1 - Demand";
      if (["to do", "analysis & prepare development", "oat - ready for pi"].includes(value)) return "STEP 2 - DoR";
      if (["in refinement", "in progress", "in development", "in uat / beta", "in review", "testing", "waiting for test", "reviewed", "waiting for review", "ready for development", "test complete", "handoff for customer testing", "in qa"].includes(value)) return "STEP 3 - DoD";
      if (["done", "closed", "resolved"].includes(value)) return "STEP 4 - Done";
      if (["cancelled", "canceled", "rejected", "abandoned"].includes(value)) return "Discontinued";
      if (["blocked", "on hold", "pending"].includes(value)) return "Blocked";
      return "Unmapped";
    };
    const epicCandidates = (data.backlog || [])
      .filter((row) => ["epic", "epic lab", "epic release"].includes(String(row.type || "").trim().toLowerCase()))
      .filter((row) => releaseIntersects(row.targetRelease || "Unscheduled / N/A", filters.start, filters.end))
      .filter((row) => !filters.teams.size || filters.teams.has(row.team || "Unassigned / To Be Assigned"))
      .filter((row) => !filters.assignees.size || filters.assignees.has(row.assignee))
      .filter((row) => !filters.skills.size || filters.skills.has(row.skill))
      .filter((row) => !filters.clients.size || filters.clients.has(row.tempoClient || "Other/Blank"))
      .filter((row) => businessAreaMatches(row, filters.businessAreas))
      .filter((row) => promoterMatches(row, filters.promoters))
      .filter((row) => !filters.accounts.size || filters.accounts.has(row.account || "Other/Blank"))
      .filter((row) => !filters.modules.size || filters.modules.has(row.productModule || "Other/Blank"))
      .filter((row) => !filters.periods.size || filters.periods.has(row.targetRelease || "Unscheduled / N/A"))
      .map((row) => ({ ...row, epicCategory: statusCategory(row.status) }));
    const epics = Array.from(new Map(epicCandidates.map((row) => [String(row.key || "").trim().toUpperCase(), row])).values());
    const countByStage = by(epics, "epicCategory");
    const directLoggedByKey = sumBy(actual.map((row) => ({ ...row, key: String(row.key || "").trim().toUpperCase() })), "key", "logged");
    const card = (stage, disposition = false) => {
      const selected = selectedWorkflowStage === stage.key;
      const numberMarkup = disposition ? "<span class=\"workflow-stage-disposition-mark\" aria-hidden=\"true\">•</span>" : `<span class="workflow-stage-number" aria-hidden="true">${stage.number}</span>`;
      const stepMarkup = disposition ? "Other disposition" : `Step ${stage.number}`;
      const directLogged = epics.filter((row) => row.epicCategory === stage.key).reduce((total, row) => total + (directLoggedByKey.get(row.key) || 0), 0);
      const effortMarkup = `<span><strong>${hours(directLogged)}</strong><small>Direct Tempo logged hours</small></span>`;
      return `<button class="workflow-stage workflow-stage--${stage.tone}${disposition ? " workflow-stage--disposition" : ""}${selected ? " is-selected" : ""}" type="button" data-workflow-stage="${escapeHtml(stage.key)}" aria-pressed="${String(selected)}" aria-controls="demandWorkflowDetails">${numberMarkup}<span class="workflow-stage-copy"><span class="workflow-stage-step">${stepMarkup}</span><strong>${escapeHtml(stage.label)}</strong><small>${escapeHtml(stage.description)}</small></span><span class="workflow-stage-stats"><span><strong>${number(countByStage.get(stage.key) || 0)}</strong><small>Epic records</small></span>${effortMarkup}</span><span class="workflow-stage-chevron" aria-hidden="true">›</span></button>`;
    };
    const dispositions = [
      { key: "Discontinued", label: "Discontinued", description: "Rejected · Abandoned · Cancelled · Canceled", tone: "discontinued" },
      { key: "Blocked", label: "Blocked", description: "Blocked · On Hold · Pending", tone: "blocked" },
      { key: "Unmapped", label: "Unmapped", description: "Any status outside the approved Epic mapping", tone: "unmapped" },
    ];
    $("demandWorkflow").innerHTML = stages.map((stage) => card(stage)).join("")
      + `<section class="workflow-dispositions" aria-label="Other Dispositions — not a workflow step"><h4>Other Dispositions <small>Not a workflow step</small></h4>${dispositions.map((stage) => card(stage, true)).join("")}</section>`;
    renderEpicDetails(selectedWorkflowStage ? epics.filter((row) => row.epicCategory === selectedWorkflowStage) : [], selectedWorkflowStage, directLoggedByKey);
  }
  function renderAccountComparison(demand, actual) {
    const actualByAccount = sumBy(actual.map((row) => ({ account: row.account || row.tempoAccount || "No Account / Missing Account", value: row.logged })), "account", "value");
    const demandByAccount = sumBy(demand.map((row) => ({ account: row.account || "No Account / Missing Account", value: row.demandHours })), "account", "value");
    const rows = [...new Set([...actualByAccount.keys(), ...demandByAccount.keys()])].map((account) => ({ account, actual: actualByAccount.get(account) || 0, demand: demandByAccount.get(account) || 0 })).sort((a, b) => Math.max(b.actual, b.demand) - Math.max(a.actual, a.demand)).slice(0, 30);
    const maximum = Math.max(...rows.flatMap((row) => [row.actual, row.demand]), 1);
    $("demandAccountComparison").innerHTML = rows.map((row) => `<div class="account-comparison-row"><strong>${escapeHtml(row.account)}</strong><div><span>Actual <b>${hours(row.actual)}</b></span><i class="actual-bar" style="width:${(row.actual / maximum * 100).toFixed(1)}%"></i></div><div><span>Future <b>${hours(row.demand)}</b></span><i class="demand-bar" style="width:${(row.demand / maximum * 100).toFixed(1)}%"></i></div></div>`).join("") || `<div class="chart-empty">No actual effort or future demand for the selected filters.</div>`;
  }
  function renderQuality(demand) {
    const categories = ["Missing Remaining Estimate", "Unassigned Team", "Unscheduled"];
    $("demandQuality").innerHTML = categories.map((category) => { const rows = demand.filter((row) => row.dataQuality === category); return `<div class="workflow-row"><button type="button" data-quality-exception="${escapeHtml(category)}" aria-pressed="${String(selectedQualityException === category)}">${escapeHtml(category)}</button><span>${number(rows.length)} tickets</span><span>${hours(rows.reduce((total, row) => total + (Number(row.demandHours) || 0), 0))}</span></div>`; }).join("");
    renderInlineTickets("demandQualityDetails", selectedQualityException ? demand.filter((row) => row.dataQuality === selectedQualityException) : [], selectedQualityException);
  }
  function renderInlineTickets(id, rows, title) {
    const target = $(id);
    target.hidden = !title;
    if (!title) { target.innerHTML = ""; return; }
    target.innerHTML = `<h4>${escapeHtml(title)} — ticket detail</h4><div class="table-wrap"><table><thead><tr><th>Jira key</th><th>Summary</th><th>Team</th><th>Planning period</th><th>Remaining estimate</th></tr></thead><tbody>${rows.slice(0, 50).map((row) => `<tr><td><a class="jira-link" href="https://oat-sa.atlassian.net/browse/${encodeURIComponent(row.key)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.key)}</a></td><td>${escapeHtml(row.summary)}</td><td>${escapeHtml(row.demandTeam)}</td><td>${escapeHtml(row.planningPeriod)}</td><td>${row.hasRemainingEstimate ? hours(row.demandHours) : "Missing"}</td></tr>`).join("") || `<tr><td colspan="5">No matching Jira tickets.</td></tr>`}</tbody></table></div>`;
  }
  function renderEpicDetails(rows, title, directLoggedByKey) {
    const target = $("demandWorkflowDetails");
    target.hidden = !title;
    if (!title) { target.innerHTML = ""; return; }
    const note = "Logged Hours are the direct Tempo sum where Jira Issue key equals Tempo Work Item Key. No descendant roll-up is included.";
    target.innerHTML = `<h4>${escapeHtml(title)} — Epic detail</h4><p class="epic-attribution-note">${note}</p><div class="table-wrap"><table><thead><tr><th>Jira Key</th><th>Summary</th><th>Target Release</th><th>Effort Cap</th><th>Logged Hours</th><th>Variance Logged Hours − Effort Cap</th><th>Original Estimate</th><th>Status</th></tr></thead><tbody>${rows.slice(0, 50).map((row) => { const logged = directLoggedByKey.get(row.key) || 0; const loggedMarkup = hours(logged); const variance = row.hasEffortCap ? hours(logged - (Number(row.effortCapHours) || 0)) : "Unavailable"; return `<tr><td><a class="jira-link" href="https://oat-sa.atlassian.net/browse/${encodeURIComponent(row.key)}" target="_blank" rel="noopener noreferrer">${escapeHtml(row.key)}</a></td><td>${escapeHtml(row.summary)}</td><td>${escapeHtml(row.targetRelease || "Unavailable")}</td><td>${row.hasEffortCap ? hours(row.effortCapHours) : "Unavailable"}</td><td>${loggedMarkup}</td><td>${variance}</td><td>${row.hasOriginalEstimate ? hours(row.originalEstimateHours) : "Unavailable"}</td><td>${escapeHtml(row.status || "Unavailable")}</td></tr>`; }).join("") || `<tr><td colspan="8">No matching Epic records.</td></tr>`}</tbody></table></div>`;
  }
  function render() { const { filters, demand, actual } = current(); const capacity = periodCapacity(filters); renderKpis(demand, actual, capacity); renderMatrix(demand); renderCapacity(demand, actual, capacity); renderWorkflow(filters, actual); renderAccountComparison(demand, actual); renderQuality(demand); }
  initialise();
})();
