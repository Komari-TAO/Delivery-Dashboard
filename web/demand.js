(function () {
  "use strict";

  const data = window.BI_DATA;
  const { escapeHtml } = window.DashboardCore;
  const $ = (id) => document.getElementById(id);
  const number = (value, digits = 0) => new Intl.NumberFormat("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value) || 0);
  const hours = (value) => `${number(value, 1)} h`;
  const by = (rows, key) => rows.reduce((map, row) => { const value = row[key] || "Unspecified"; map.set(value, (map.get(value) || 0) + 1); return map; }, new Map());
  const sumBy = (rows, key, valueKey) => rows.reduce((map, row) => { const value = row[key] || "Unspecified"; map.set(value, (map.get(value) || 0) + (Number(row[valueKey]) || 0)); return map; }, new Map());

  const releaseByCycle = new Map((data.releases || []).map((release) => [release.cycle, release]));
  let selectedWorkflowStage = "";
  let selectedQualityException = "";
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
  function populate(id, values) {
    const select = $(id);
    const current = select.value;
    select.innerHTML = `<option value="">All ${escapeHtml(select.labels?.[0]?.textContent?.replace("All ", "") || "values")}</option>` + values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
    if (values.includes(current)) select.value = current;
  }
  function initialise() {
    const dates = (data.masterDates || []).map((row) => row.date).filter(Boolean).sort();
    const start = dates[0] || data.meta.dateMin;
    const end = dates[dates.length - 1] || data.meta.dateMax;
    $("demandStartDate").min = start; $("demandStartDate").max = end; $("demandStartDate").value = start;
    $("demandEndDate").min = start; $("demandEndDate").max = end; $("demandEndDate").value = end;
    populate("demandTeamFilter", [...new Set((data.demand || []).map((row) => row.demandTeam).filter(Boolean))].sort());
    populate("demandClientFilter", [...new Set((data.demand || []).map((row) => row.delivery).filter(Boolean))].sort());
    populate("demandAccountFilter", [...new Set((data.demand || []).map((row) => row.account).filter(Boolean))].sort());
    populate("demandModuleFilter", [...new Set((data.demand || []).map((row) => row.productModule).filter(Boolean))].sort());
    populate("demandPeriodFilter", [...new Set((data.demand || []).map((row) => row.planningPeriod).filter(Boolean))].sort());
    document.querySelectorAll(".demand-filter-rail input, .demand-filter-rail select, #demandMatrixGroup, #demandCapacityRows, #demandCapacityColumns, #demandCapacityValue").forEach((input) => input.addEventListener("change", render));
    $("resetDemandFilters").addEventListener("click", () => {
      $("demandStartDate").value = start;
      $("demandEndDate").value = end;
      ["demandTeamFilter", "demandClientFilter", "demandAccountFilter", "demandModuleFilter", "demandPeriodFilter"].forEach((id) => { $(id).value = ""; });
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
      team: $("demandTeamFilter").value,
      client: $("demandClientFilter").value,
      account: $("demandAccountFilter").value,
      module: $("demandModuleFilter").value,
      period: $("demandPeriodFilter").value,
    };
    const demand = (data.demand || []).filter((row) =>
      releaseIntersects(row.planningPeriod, filters.start, filters.end)
      && (!filters.team || row.demandTeam === filters.team)
      && (!filters.client || row.delivery === filters.client)
      && (!filters.account || row.account === filters.account)
      && (!filters.module || row.productModule === filters.module)
      && (!filters.period || row.planningPeriod === filters.period));
    const actual = (data.worklogs || []).filter((row) => inRange(row.date, filters.start, filters.end)
      && (!filters.team || row.team === filters.team)
      && (!filters.client || row.delivery === filters.client)
      && (!filters.account || row.account === filters.account)
      && (!filters.module || row.module === filters.module));
    return { filters, demand, actual };
  }
  function periodCapacity(filters) {
    const rows = [];
    (data.capacity || []).forEach((row) => {
      const dates = masterByWeek.get(row.week) || [];
      const date = dates.find((value) => inRange(value, filters.start, filters.end));
      if (!date || (filters.team && row.team !== filters.team)) return;
      const period = (data.releases || []).find((release) => release.start <= date && release.end >= date)?.cycle || "Unscheduled / N/A";
      if (filters.period && period !== filters.period) return;
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
  function renderWorkflow(demand) {
    const stages = ["STEP 1 - Demand", "STEP 2 - DoR", "STEP 3 - DoD", "STEP 4 - Done / Cancelled", "Other / Unmapped"];
    const hoursByStage = sumBy(demand, "reportingStage", "demandHours");
    const countByStage = by(demand, "reportingStage");
    $("demandWorkflow").innerHTML = stages.map((stage) => `<div class="workflow-row"><button type="button" data-workflow-stage="${escapeHtml(stage)}" aria-pressed="${String(selectedWorkflowStage === stage)}">${escapeHtml(stage)}</button><span>${number(countByStage.get(stage) || 0)} tickets</span><span>${hours(hoursByStage.get(stage) || 0)}</span></div>`).join("");
    renderInlineTickets("demandWorkflowDetails", selectedWorkflowStage ? demand.filter((row) => row.reportingStage === selectedWorkflowStage) : [], selectedWorkflowStage);
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
  function render() { const { filters, demand, actual } = current(); const capacity = periodCapacity(filters); renderKpis(demand, actual, capacity); renderMatrix(demand); renderCapacity(demand, actual, capacity); renderWorkflow(demand); renderAccountComparison(demand, actual); renderQuality(demand); }
  initialise();
})();
