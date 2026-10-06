import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const debugPort = 9300 + Math.floor(Math.random() * 500);
const appUrl = "http://127.0.0.1:8765";
const webDir = path.join(root, "web");
const userDataDir = path.join(root, ".tmp", `codex_bi_cdp_${Date.now()}`);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseDashboardNumber(value) {
  return Number(String(value || "").replaceAll(",", "").replace("%", "")) || 0;
}

async function waitForJson(url, timeoutMs = 10000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      await sleep(150);
    }
  }
  throw new Error(`Timed out waiting for ${url}`);
}

class Cdp {
  constructor(wsUrl) {
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
    this.ws = new WebSocket(wsUrl);
    this.openPromise = new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result || {});
      } else if (message.method) {
        this.events.push(message);
      }
    });
  }

  async open() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    await this.openPromise;
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  async eval(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) {
      const details = result.exceptionDetails.exception?.description || result.exceptionDetails.text || "Runtime evaluation failed";
      throw new Error(details);
    }
    return result.result.value;
  }

  close() {
    this.ws.close();
  }
}

async function capture(cdp, name) {
  const result = await cdp.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  await fs.writeFile(path.join(webDir, name), Buffer.from(result.data, "base64"));
}

await fs.mkdir(userDataDir, { recursive: true });

const chromeProcess = spawn(chrome, [
  "--headless=new",
  "--disable-gpu",
  "--disable-gpu-sandbox",
  "--disable-crash-reporter",
  "--no-first-run",
  "--remote-allow-origins=*",
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDir}`,
  "--window-size=1440,980",
  appUrl,
], { stdio: "ignore" });

try {
  const pages = await waitForJson(`http://127.0.0.1:${debugPort}/json`);
  const page = pages.find((item) => item.type === "page" && item.url.startsWith("http"))
    || pages.find((item) => item.type === "page")
    || pages[0];
  const cdp = new Cdp(page.webSocketDebuggerUrl);
  await cdp.open();
  await cdp.send("Runtime.enable");
  await cdp.send("Page.enable");
  await cdp.send("Page.navigate", { url: appUrl });
  await sleep(1000);
  const ready = await cdp.eval(`new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (document.querySelector(".kpi-card") && document.querySelector("#startDate") && document.querySelector("#endDate")) resolve(true);
      else if (Date.now() - started > 10000) resolve(false);
      else setTimeout(tick, 100);
    };
    tick();
  })`);
  if (!ready) {
    const snapshot = await cdp.eval(`({ href: location.href, title: document.title, kpis: document.querySelectorAll(".kpi-card").length, body: document.body.innerText.slice(0, 500) })`);
    snapshot.events = cdp.events
      .filter((event) => ["Runtime.exceptionThrown", "Runtime.consoleAPICalled"].includes(event.method))
      .map((event) => event.params)
      .slice(0, 20);
    throw new Error(`App did not become ready: ${JSON.stringify(snapshot)}`);
  }

  await cdp.eval(`window.__verifyAssigneeFacetHours = () => {
    const parseFacetNumber = (value) => Number(String(value || "").replace(/h$/, "").replaceAll(",", "")) || 0;
    const rendered = Array.from(document.querySelectorAll("#assigneeFacet .facet")).map((facet) => ({
      label: facet.querySelector(".facet-name")?.textContent.trim() || "",
      count: parseFacetNumber(facet.querySelector(".facet-count")?.textContent.trim() || ""),
    }));
    const start = document.querySelector("#startDate")?.value || window.BI_DATA.meta.dateMin;
    const end = document.querySelector("#endDate")?.value || window.BI_DATA.meta.dateMax;
    const selectedStatuses = new Set(Array.from(document.querySelectorAll("#statusFacet input:checked")).map((input) => input.value));
    const defaultStatuses = new Set((window.BI_DATA.statuses || [])
      .filter((row) => String(row.statusCategory || "").trim().toLowerCase() !== "done")
      .map((row) => row.status)
      .filter(Boolean));
    const statusIsDefault = selectedStatuses.size === defaultStatuses.size
      && Array.from(defaultStatuses).every((status) => selectedStatuses.has(status));
    const statusIsActive = selectedStatuses.size > 0 && !statusIsDefault;
    const validTeams = new Set((window.BI_DATA.teams || []).map((row) => row.team).filter(Boolean));
    const validAssignees = new Set((window.BI_DATA.assignees || []).map((row) => row.assignee).filter(Boolean));
    const totals = new Map();
    window.BI_DATA.worklogs
      .filter((row) => row.date >= start && row.date <= end)
      .filter((row) => validTeams.has(row.team))
      .filter((row) => !statusIsActive || selectedStatuses.has(row.status || ""))
      .filter((row) => Number(row.logged) > 0)
      .forEach((row) => {
        const label = row.person || "(blank)";
        totals.set(label, (totals.get(label) || 0) + (Number(row.logged) || 0));
      });
    const expected = Array.from(totals, ([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40);
    const mismatches = expected
      .map((row, index) => ({
        label: row.label,
        expected: Number(row.count.toFixed(1)),
        rendered: rendered[index]?.count,
        renderedLabel: rendered[index]?.label,
      }))
      .filter((row) => row.label !== row.renderedLabel || Math.abs((row.rendered || 0) - row.expected) > 0.11);
    const vladExpected = expected.find((row) => row.label === "Vladyslav Byndych");
    const vladRendered = rendered.find((row) => row.label === "Vladyslav Byndych");
    return {
      start,
      end,
      statusIsActive,
      expectedRows: expected.length,
      renderedRows: rendered.length,
      firstExpected: expected[0] || null,
      firstRendered: rendered[0] || null,
      vladExpected: vladExpected ? Number(vladExpected.count.toFixed(1)) : null,
      vladRendered: vladRendered?.count ?? null,
      mismatches: mismatches.slice(0, 5),
    };
  }`);

  await cdp.eval(`window.__verifyAccountFacetCounts = (targetAccount = "HK-Dir") => {
    const parseFacetNumber = (value) => Number(String(value || "").replaceAll(",", "")) || 0;
    const rendered = Array.from(document.querySelectorAll("#accountFacet .facet")).map((facet) => ({
      label: facet.querySelector(".facet-name")?.textContent.trim() || "",
      count: parseFacetNumber(facet.querySelector(".facet-count")?.textContent.trim() || ""),
    }));
    const selectedValues = (selector) => new Set(Array.from(document.querySelectorAll(selector + " input:checked")).map((input) => input.value));
    const start = document.querySelector("#startDate")?.value || window.BI_DATA.meta.dateMin;
    const end = document.querySelector("#endDate")?.value || window.BI_DATA.meta.dateMax;
    const selected = {
      teams: selectedValues("#teamFacet"),
      assignees: selectedValues("#assigneeFacet"),
      skills: selectedValues("#skillFacet"),
      weeks: selectedValues("#weekFacet"),
      categories: selectedValues("#categoryFacet"),
      priorities: selectedValues("#priorityFacet"),
      statuses: selectedValues("#statusFacet"),
      deliveries: selectedValues("#deliveryFacet"),
      targetReleases: selectedValues("#targetReleaseFacet"),
      programs: selectedValues("#programFacet"),
      releases: selectedValues("#releaseFacet"),
    };
    const inSet = (set, value) => set.size === 0 || set.has(value || "");
    const isoWeek = (value) => {
      const date = new Date(String(value) + "T00:00:00");
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const day = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - day);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return String(Math.ceil(((d - yearStart) / 86400000 + 1) / 7));
    };
    const validTeams = new Set((window.BI_DATA.teams || []).map((row) => row.team).filter(Boolean));
    const teamByPerson = new Map((window.BI_DATA.assignees || []).map((row) => [row.assignee, row.team]));
    const skillByPerson = new Map((window.BI_DATA.assignees || []).map((row) => [row.assignee, row.skill]));
    const defaultStatuses = new Set((window.BI_DATA.statuses || [])
      .filter((row) => String(row.statusCategory || "").trim().toLowerCase() !== "done")
      .map((row) => row.status)
      .filter(Boolean));
    const backlogTeam = (row) => row.team || teamByPerson.get(row.assignee) || "";
    const backlogSkill = (row) => row.skill || skillByPerson.get(row.assignee) || "";
    const statusIsDefault = selected.statuses.size === defaultStatuses.size
      && Array.from(defaultStatuses).every((status) => selected.statuses.has(status));
    const statusIsActive = selected.statuses.size > 0 && !statusIsDefault;
    const accountLabel = (value) => {
      const label = String(value || "").trim();
      return label && label !== "-" ? label : "";
    };
    const addAccountKey = (map, account, key) => {
      const label = accountLabel(account);
      const itemKey = String(key || "").trim();
      if (!label || !itemKey) return;
      if (!map.has(label)) map.set(label, new Set());
      map.get(label).add(itemKey);
    };
    const filteredBacklog = (window.BI_DATA.backlog || []).filter((row) => {
      const created = row.createdDate || window.BI_DATA.meta.dateMin;
      return created >= start && created <= end
        && inSet(selected.teams, backlogTeam(row))
        && inSet(selected.assignees, row.assignee)
        && inSet(selected.skills, backlogSkill(row))
        && inSet(selected.weeks, isoWeek(created))
        && inSet(selected.priorities, row.priority)
        && inSet(selected.statuses, row.status)
        && inSet(selected.deliveries, row.delivery)
        && inSet(selected.targetReleases, row.targetRelease)
        && inSet(selected.programs, row.program)
        && inSet(selected.releases, row.release || "");
    });
    const activeDetail = document.querySelector(".tab.active")?.dataset.detail || "accounts";
    const counts = new Map();
    filteredBacklog
      .filter((row) => validTeams.has(backlogTeam(row)))
      .forEach((row) => addAccountKey(counts, row.account, row.key));
    const expected = Array.from(counts, ([label, keys]) => ({ label, count: keys.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 40);
    const renderedByLabel = new Map(rendered.map((row) => [row.label, row.count]));
    const mismatches = expected
      .map((row) => ({
        label: row.label,
        expected: row.count,
        rendered: renderedByLabel.get(row.label),
      }))
      .filter((row) => row.expected !== row.rendered);
    const targetExpected = expected.find((row) => row.label === targetAccount) || null;
    const targetRendered = rendered.find((row) => row.label === targetAccount) || null;
    const rawBacklogKeyUniverse = new Set((window.BI_DATA.backlog || []).map((row) => row.key).filter(Boolean));
    const targetExpectedKeys = counts.get(targetAccount) || new Set();
    const rawBacklogKeys = new Set((window.BI_DATA.backlog || []).filter((row) => row.account === targetAccount).map((row) => row.key).filter(Boolean));
    const filteredWorklogRows = (window.BI_DATA.worklogs || []).filter((row) => row.account === targetAccount && row.date >= start && row.date <= end);
    return {
      activeDetail,
      start,
      end,
      statusIsActive,
      renderedRows: rendered.length,
      expectedRows: expected.length,
      targetAccount,
      targetExpected: targetExpected?.count ?? null,
      targetRendered: targetRendered?.count ?? null,
      rawBacklogCount: (window.BI_DATA.backlog || []).filter((row) => row.account === targetAccount).length,
      rawBacklogDistinctKeys: rawBacklogKeys.size,
      filteredTempoWorklogRows: filteredWorklogRows.length,
      duplicateRawBacklogKeys: (window.BI_DATA.backlog || []).filter((row) => row.account === targetAccount).length - rawBacklogKeys.size,
      targetExpectedKeysOutsideRawBacklog: Array.from(targetExpectedKeys).filter((key) => !rawBacklogKeyUniverse.has(key)).length,
      firstExpected: expected[0] || null,
      firstRendered: rendered[0] || null,
      mismatches: mismatches.slice(0, 5),
    };
  }`);

  const initial = await cdp.eval(`({
    title: document.title,
    kpis: document.querySelectorAll(".kpi-card").length,
    labels: Array.from(document.querySelectorAll(".kpi-card span")).map((el) => el.textContent.trim()),
    charts: document.querySelectorAll(".chart-frame svg").length,
    rows: document.querySelectorAll("#detailTable tbody tr").length,
    annualCapacity: Array.from(document.querySelectorAll(".kpi-card")).find((card) => card.querySelector("span")?.textContent.trim() === "Annual Workforce Capacity")?.querySelector("strong")?.textContent || "",
    actualHours: Array.from(document.querySelectorAll(".kpi-card")).find((card) => card.querySelector("span")?.textContent.trim() === "Actual Hours")?.querySelector("strong")?.textContent || "",
    expectedActualHours: (() => {
      const start = document.querySelector("#startDate")?.value || window.BI_DATA.meta.dateMin;
      const end = document.querySelector("#endDate")?.value || window.BI_DATA.meta.dateMax;
      const validTeams = new Set((window.BI_DATA.teams || []).map((row) => row.team).filter(Boolean));
      return window.BI_DATA.worklogs
        .filter((row) => validTeams.has(row.team) && row.date >= start && row.date <= end)
        .reduce((total, row) => total + (Number(row.logged) || 0), 0);
    })(),
    utilizationRate: Array.from(document.querySelectorAll(".kpi-card")).find((card) => card.querySelector("span")?.textContent.trim() === "Annual Capacity Utilization")?.querySelector("strong")?.textContent || "",
    excludedIssueKeys: window.BI_DATA.meta.excludedIssueKeys || [],
    excludedTempoWorkItems: window.BI_DATA.meta.excludedTempoWorkItems || [],
    excludedTempoKeysPresent: (() => {
      const excludedKeys = new Set(window.BI_DATA.meta.excludedIssueKeys || []);
      return Array.from(new Set(window.BI_DATA.worklogs.map((row) => row.key).filter((key) => excludedKeys.has(String(key || "").trim().toUpperCase())))).sort();
    })(),
    demandTitle: document.querySelector("#demandChart")?.closest(".panel")?.querySelector("h3")?.textContent.trim() || "",
    demandLegend: Array.from(document.querySelectorAll("#demandChart .legend span")).map((item) => item.textContent.trim()),
    demandTooltips: Array.from(document.querySelectorAll("#demandChart svg title")).map((title) => title.textContent).slice(0, 4),
    demandAccuracyLabels: Array.from(document.querySelectorAll("#demandChart svg text")).map((text) => text.textContent).filter((text) => text.includes("%")).slice(0, 10),
    oldDemandChartPresent: Boolean(document.querySelector("#categoryChart")),
    prioritySubtitle: document.querySelector("#priorityChart")?.closest(".panel")?.querySelector("p")?.textContent.trim() || "",
    statusSummary: window.BI_DATA.meta.statusSummary || {},
    statusValues: (window.BI_DATA.statuses || []).map((row) => row.status),
    statusFacetLabels: Array.from(document.querySelectorAll("#statusFacet .facet-name")).map((el) => el.textContent.trim()),
    defaultCheckedStatuses: Array.from(document.querySelectorAll("#statusFacet input:checked")).map((el) => el.value),
    nonDoneStatusValues: (window.BI_DATA.statuses || []).filter((row) => String(row.statusCategory || "").trim().toLowerCase() !== "done").map((row) => row.status),
    doneCategoryStatuses: (window.BI_DATA.statuses || []).filter((row) => String(row.statusCategory || "").trim().toLowerCase() === "done").map((row) => row.status),
    activeFilterChips: Array.from(document.querySelectorAll(".chip")).map((chip) => chip.textContent.trim()),
    rawDataStatuses: Array.from(new Set([
      ...window.BI_DATA.worklogs.map((row) => row.status),
      ...window.BI_DATA.backlog.map((row) => row.status)
    ].filter(Boolean))).sort(),
    priorityExpectedCounts: (() => {
      const start = document.querySelector("#startDate")?.value || window.BI_DATA.meta.dateMin;
      const end = document.querySelector("#endDate")?.value || window.BI_DATA.meta.dateMax;
      const selectedStatuses = new Set(Array.from(document.querySelectorAll("#statusFacet input:checked")).map((input) => input.value));
      const counts = {};
      window.BI_DATA.backlog
        .filter((row) => selectedStatuses.has(row.status) && (row.createdDate || window.BI_DATA.meta.dateMin) >= start && (row.createdDate || window.BI_DATA.meta.dateMin) <= end)
        .forEach((row) => counts[row.priority || "(blank)"] = (counts[row.priority || "(blank)"] || 0) + 1);
      return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8));
    })(),
    priorityRenderedCounts: (() => {
      const parseCount = (value) => value.endsWith("k") ? Number(value.slice(0, -1)) * 1000 : Number(value.replaceAll(",", ""));
      const texts = Array.from(document.querySelectorAll("#priorityChart svg text")).map((text) => text.textContent.trim());
      const counts = {};
      for (let i = 0; i < texts.length; i += 2) {
        if (texts[i] && texts[i + 1]) counts[texts[i]] = parseCount(texts[i + 1]);
      }
      return counts;
    })(),
    typeSubtitle: document.querySelector("#typeChart")?.closest(".panel")?.querySelector("p")?.textContent.trim() || "",
    typeExpectedCounts: (() => {
      const start = document.querySelector("#startDate")?.value || window.BI_DATA.meta.dateMin;
      const end = document.querySelector("#endDate")?.value || window.BI_DATA.meta.dateMax;
      const selectedStatuses = new Set(Array.from(document.querySelectorAll("#statusFacet input:checked")).map((input) => input.value));
      const counts = {};
      window.BI_DATA.worklogs
        .filter((row) => selectedStatuses.has(row.status) && row.itemType && row.date >= start && row.date <= end)
        .forEach((row) => counts[row.itemType] = (counts[row.itemType] || 0) + 1);
      return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7));
    })(),
    typeRenderedCounts: (() => {
      const counts = {};
      Array.from(document.querySelectorAll("#typeChart svg title")).forEach((title) => {
        const match = title.textContent.trim().match(/^(.+): ([\\d,]+)$/);
        if (match) counts[match[1]] = Number(match[2].replaceAll(",", ""));
      });
      return counts;
    })(),
    issueTypeSummary: window.BI_DATA.meta.issueTypeSummary || {},
    jiraIssueTypes: Array.from(new Set(window.BI_DATA.backlog.map((row) => row.type).filter(Boolean))).sort(),
    worklogIssueTypes: Array.from(new Set(window.BI_DATA.worklogs.map((row) => row.itemType).filter(Boolean))).sort(),
    teamChartTooltips: Array.from(document.querySelectorAll("#teamChart svg title")).map((title) => title.textContent).slice(0, 4),
    teamExpectedLoggedByTeam: (() => {
      const start = document.querySelector("#startDate")?.value || window.BI_DATA.meta.dateMin;
      const end = document.querySelector("#endDate")?.value || window.BI_DATA.meta.dateMax;
      const validTeams = new Set((window.BI_DATA.teams || []).map((row) => row.team).filter(Boolean));
      const totals = {};
      window.BI_DATA.worklogs
        .filter((row) => validTeams.has(row.team) && row.date >= start && row.date <= end)
        .forEach((row) => totals[row.team] = (totals[row.team] || 0) + (Number(row.logged) || 0));
      return Object.fromEntries(Object.entries(totals).sort((a, b) => a[0].localeCompare(b[0])));
    })(),
    teamRenderedLoggedByTeam: (() => {
      const totals = {};
      Array.from(document.querySelectorAll("#teamChart svg title")).forEach((title) => {
        const text = title.textContent.trim();
        const team = text.split("\\n")[0];
        const logged = text.match(/Logged Hours: ([\\d,.]+)/)?.[1];
        if (team && logged && totals[team] === undefined) totals[team] = Number(logged.replaceAll(",", ""));
      });
      return Object.fromEntries(Object.entries(totals).sort((a, b) => a[0].localeCompare(b[0])));
    })(),
    utilizationLabels: Array.from(document.querySelectorAll("#teamChart svg text")).map((text) => text.textContent).filter((text) => text.includes("%")).slice(0, 10),
    masterTeams: (window.BI_DATA.teams || []).map((row) => row.team).filter(Boolean),
    teamFacetLabels: Array.from(document.querySelectorAll("#teamFacet .facet-name")).map((el) => el.textContent.trim()),
    rawDataTeams: Array.from(new Set([
      ...window.BI_DATA.worklogs.map((row) => row.team),
      ...window.BI_DATA.backlog.map((row) => row.team),
      ...window.BI_DATA.capacity.map((row) => row.team),
      ...window.BI_DATA.assignees.map((row) => row.team)
    ].filter(Boolean))).sort(),
    demandTeams: Array.from(new Set(Array.from(document.querySelectorAll("#demandChart svg title")).map((title) => title.textContent.match(/^Team: ([^\\n]+)/)?.[1]).filter(Boolean))).sort(),
    utilizationTeams: Array.from(new Set(Array.from(document.querySelectorAll("#teamChart svg title")).map((title) => title.textContent.split("\\n")[0]).filter(Boolean))).sort(),
    programSummary: window.BI_DATA.meta.programSummary || {},
    programValues: (window.BI_DATA.programs || []).map((row) => row.program),
    programFacetLabels: Array.from(document.querySelectorAll("#programFacet .facet-name")).map((el) => el.textContent.trim()),
    rawDataPrograms: Array.from(new Set([
      ...window.BI_DATA.worklogs.map((row) => row.program),
      ...window.BI_DATA.backlog.map((row) => row.program)
    ].filter(Boolean))).sort(),
    skillSummary: window.BI_DATA.meta.skillSummary || {},
    skillValues: (window.BI_DATA.skills || []).map((row) => row.skill),
    skillFacetLabels: Array.from(document.querySelectorAll("#skillFacet .facet-name")).map((el) => el.textContent.trim()),
    rawDataSkills: Array.from(new Set([
      ...window.BI_DATA.worklogs.map((row) => row.skill),
      ...window.BI_DATA.backlog.map((row) => row.skill),
      ...window.BI_DATA.capacity.map((row) => row.skill),
      ...window.BI_DATA.assignees.map((row) => row.skill)
    ].filter(Boolean))).sort(),
    accountHeaders: Array.from(document.querySelectorAll("#detailTable thead th")).map((th) => th.textContent.trim().replace(/\\s+/g, " ")),
    accountValidation: (() => {
      const start = document.querySelector("#startDate")?.value || window.BI_DATA.meta.dateMin;
      const end = document.querySelector("#endDate")?.value || window.BI_DATA.meta.dateMax;
      const selectedStatuses = new Set(Array.from(document.querySelectorAll("#statusFacet input:checked")).map((input) => input.value));
      const inSelectedStatus = (status) => selectedStatuses.size === 0 || selectedStatuses.has(status || "");
      const validTeams = new Set((window.BI_DATA.teams || []).map((row) => row.team).filter(Boolean));
      const backlog = window.BI_DATA.backlog.filter((row) => validTeams.has(row.team) && (row.createdDate || window.BI_DATA.meta.dateMin) >= start && (row.createdDate || window.BI_DATA.meta.dateMin) <= end);
      const worklogs = window.BI_DATA.worklogs.filter((row) => validTeams.has(row.team) && row.date >= start && row.date <= end);
      const accounts = new Map();
      const ensureAccount = (account) => {
        if (!accounts.has(account)) accounts.set(account, { account, estimated: 0, logged: 0, keys: new Set(), estimateKeys: new Set() });
        return accounts.get(account);
      };
      backlog.forEach((row) => {
        const item = ensureAccount(row.account || "(blank)");
        if (row.key && item.estimateKeys.has(row.key)) return;
        if (row.key) item.estimateKeys.add(row.key);
        item.estimated += Number(row.originalEstimateHours) || 0;
      });
      worklogs.forEach((row) => {
        const account = String(row.tempoAccount || "").trim();
        if (!account || account === "-") return;
        ensureAccount(account).logged += Number(row.logged) || 0;
      });
      backlog.filter((row) => inSelectedStatus(row.status)).forEach((row) => {
        if (row.key) ensureAccount(row.account || "(blank)").keys.add(row.key);
      });
      const rows = Array.from(accounts.values()).map((row) => ({
        account: row.account,
        estimated: row.estimated,
        logged: row.logged,
        loggedVsEstimate: row.estimated ? row.logged / row.estimated : 0,
        itemCount: row.keys.size,
        variance: row.logged - row.estimated,
      })).sort((a, b) => b.logged - a.logged);
      const renderedLogged = Array.from(document.querySelectorAll("#detailTable tbody tr td:nth-child(3)")).map((td) => Number(td.textContent.replaceAll(",", "")) || 0);
      return {
        distinctAccounts: rows.length,
        totalWorkItems: rows.reduce((total, row) => total + row.itemCount, 0),
        totalEstimate: rows.reduce((total, row) => total + row.estimated, 0),
        totalLogged: rows.reduce((total, row) => total + row.logged, 0),
        totalVariance: rows.reduce((total, row) => total + row.variance, 0),
        firstAccount: rows[0]?.account || "",
        firstRenderedAccount: document.querySelector("#detailTable tbody tr td:first-child")?.textContent.trim() || "",
        renderedLogged,
      };
    })(),
    assigneeFacetValidation: window.__verifyAssigneeFacetHours(),
    accountFacetValidation: window.__verifyAccountFacetCounts("HK-Dir"),
    filterCounts: {
      assignees: document.querySelectorAll("#assigneeFacet input").length,
      skills: document.querySelectorAll("#skillFacet input").length,
      accounts: document.querySelectorAll("#accountFacet input").length,
      targetReleases: document.querySelectorAll("#targetReleaseFacet input").length,
      programs: document.querySelectorAll("#programFacet input").length,
      statuses: document.querySelectorAll("#statusFacet input").length
    }
  })`);

  const globalExclusionUiValidation = await cdp.eval(`(async () => {
    const normalizeKey = (value) => String(value || "").trim().toUpperCase();
    const excludedKeys = window.BI_DATA.meta.excludedIssueKeys || [];
    const governedDatasets = ["worklogs", "backlogWorklogs", "backlog", "tempoOperationalMappings", "tempoDescriptions"];
    const analyticalLeaks = Object.fromEntries(governedDatasets.map((dataset) => [
      dataset,
      Array.from(new Set((window.BI_DATA[dataset] || [])
        .map((row) => normalizeKey(row.key))
        .filter((key) => excludedKeys.includes(key)))).sort(),
    ]));
    const renderedText = [
      document.body.innerText,
      ...Array.from(document.querySelectorAll("svg title")).map((node) => node.textContent || ""),
      ...Array.from(document.querySelectorAll("input")).map((node) => node.value || ""),
    ].join("\\n").toUpperCase();
    const renderedLeaks = excludedKeys.filter((key) => renderedText.includes(key));

    const searchLeaks = [];
    for (const detail of ["backlog", "deliveryProgress"]) {
      document.querySelector('button[data-detail="' + detail + '"]')?.click();
      const search = document.querySelector("#detailSearch");
      for (const key of excludedKeys) {
        search.value = key;
        search.dispatchEvent(new Event("input", { bubbles: true }));
        const tableText = document.querySelector("#detailTable")?.innerText.toUpperCase() || "";
        if (tableText.includes(key)) searchLeaks.push({ detail, key });
      }
      search.value = "";
      search.dispatchEvent(new Event("input", { bubbles: true }));
    }
    document.querySelector('button[data-detail="accounts"]')?.click();

    let capturedBlob = null;
    const originalCreateObjectURL = URL.createObjectURL;
    URL.createObjectURL = (blob) => {
      capturedBlob = blob;
      return originalCreateObjectURL(blob);
    };
    document.querySelector("#downloadSnapshot")?.click();
    const csvText = capturedBlob ? await capturedBlob.text() : "";
    URL.createObjectURL = originalCreateObjectURL;
    const csvLeaks = excludedKeys.filter((key) => csvText.toUpperCase().includes(key));

    return { analyticalLeaks, renderedLeaks, searchLeaks, csvCaptured: Boolean(csvText), csvLeaks };
  })()`);

  const accountSort = await cdp.eval(`(() => {
    const values = (selector) => Array.from(document.querySelectorAll(selector)).map((td) => td.textContent.trim());
    const numbers = (selector) => values(selector).map((value) => Number(value.replaceAll(",", "")) || 0);
    const isAsc = (items) => items.every((item, index) => index === 0 || items[index - 1].localeCompare(item) <= 0);
    const isDesc = (items) => items.every((item, index) => index === 0 || items[index - 1].localeCompare(item) >= 0);
    const numsDesc = (items) => items.every((item, index) => index === 0 || items[index - 1] >= item);
    document.querySelector('#detailTable button[data-sort-key="account"]').click();
    const ascAccounts = values("#detailTable tbody tr td:first-child");
    document.querySelector('#detailTable button[data-sort-key="account"]').click();
    const descAccounts = values("#detailTable tbody tr td:first-child");
    document.querySelector('#detailTable button[data-sort-key="account"]').click();
    const resetLogged = numbers("#detailTable tbody tr td:nth-child(3)");
    return {
      ascSorted: isAsc(ascAccounts),
      descSorted: isDesc(descAccounts),
      resetLoggedDescending: numsDesc(resetLogged),
      resetFirstAccount: values("#detailTable tbody tr td:first-child")[0] || ""
    };
  })()`);

  await cdp.eval(`(() => {
    const end = new Date(window.BI_DATA.meta.dateMax + "T00:00:00");
    const start = new Date(end);
    start.setDate(start.getDate() - 29);
    const input = document.querySelector("#startDate");
    input.value = start.toISOString().slice(0, 10);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  })()`);
  await sleep(350);
  const last30 = await cdp.eval(`({
    range: document.querySelector("#rangeBadge")?.textContent || "",
    actualHours: Array.from(document.querySelectorAll(".kpi-card")).find((card) => card.querySelector("span")?.textContent.trim() === "Actual Hours")?.querySelector("strong")?.textContent || "",
    utilizationRate: Array.from(document.querySelectorAll(".kpi-card")).find((card) => card.querySelector("span")?.textContent.trim() === "Annual Capacity Utilization")?.querySelector("strong")?.textContent || "",
    assigneeFacetValidation: window.__verifyAssigneeFacetHours(),
    accountFacetValidation: window.__verifyAccountFacetCounts("HK-Dir")
  })`);

  await cdp.eval(`document.querySelector("#resetFilters").click()`);
  await sleep(350);
  await cdp.eval(`document.querySelector('.tab[data-detail="backlog"]').click()`);
  await sleep(350);
  const backlogAccountFacet = await cdp.eval(`window.__verifyAccountFacetCounts("HK-Dir")`);
  await cdp.eval(`document.querySelector('.tab[data-detail="deliveryProgress"]').click()`);
  await sleep(350);
  const deliveryProgressAccountFacet = await cdp.eval(`window.__verifyAccountFacetCounts("HK-Dir")`);
  await cdp.eval(`document.querySelector('.tab[data-detail="accounts"]').click()`);
  await sleep(350);

  await cdp.eval(`document.querySelector('#teamFacet input[value="Delivery Express"]').click()`);
  await sleep(350);
  const teamFilter = await cdp.eval(`({
    chips: Array.from(document.querySelectorAll(".chip")).map((chip) => chip.textContent.trim()),
    actualHours: Array.from(document.querySelectorAll(".kpi-card")).find((card) => card.querySelector("span")?.textContent.trim() === "Actual Hours")?.querySelector("strong")?.textContent || "",
    tableRows: document.querySelectorAll("#detailTable tbody tr").length
  })`);

  await cdp.eval(`Array.from(document.querySelectorAll("#programFacet input")).find((input) => input.value === "PS - Professional Services")?.click()`);
  await sleep(350);
  const programFilter = await cdp.eval(`({
    chips: Array.from(document.querySelectorAll(".chip")).map((chip) => chip.textContent.trim()),
    actualHours: Array.from(document.querySelectorAll(".kpi-card")).find((card) => card.querySelector("span")?.textContent.trim() === "Actual Hours")?.querySelector("strong")?.textContent || "",
    tableRows: document.querySelectorAll("#detailTable tbody tr").length
  })`);

  await cdp.eval(`Array.from(document.querySelectorAll("#skillFacet input")).find((input) => input.value === "Frontend")?.click()`);
  await sleep(350);
  const skillFilter = await cdp.eval(`({
    chips: Array.from(document.querySelectorAll(".chip")).map((chip) => chip.textContent.trim()),
    actualHours: Array.from(document.querySelectorAll(".kpi-card")).find((card) => card.querySelector("span")?.textContent.trim() === "Actual Hours")?.querySelector("strong")?.textContent || "",
    annualCapacity: Array.from(document.querySelectorAll(".kpi-card")).find((card) => card.querySelector("span")?.textContent.trim() === "Annual Workforce Capacity")?.querySelector("strong")?.textContent || "",
    tableRows: document.querySelectorAll("#detailTable tbody tr").length
  })`);

  await cdp.eval(`document.querySelector("#resetFilters").click()`);
  await sleep(350);
  const statusToSelect = await cdp.eval(`(window.BI_DATA.statuses.find((row) => row.status === "DONE") || window.BI_DATA.statuses.find((row) => row.status === "Done") || window.BI_DATA.statuses.find((row) => row.status === "Closed") || window.BI_DATA.statuses.find((row) => row.statusCategory === "Done") || window.BI_DATA.statuses[0] || {}).status || ""`);
  if (!statusToSelect) throw new Error("No Jira Status values are available to test.");
  const checkedStatusesBeforeDoneTest = await cdp.eval(`Array.from(document.querySelectorAll("#statusFacet input:checked")).map((input) => input.value)`);
  for (const status of checkedStatusesBeforeDoneTest) {
    await cdp.eval(`Array.from(document.querySelectorAll("#statusFacet input")).find((input) => input.value === ${JSON.stringify(status)})?.click()`);
  }
  await sleep(350);
  await cdp.eval(`window.__verifyAccountWorkItems = (selectedStatus = null) => {
    const start = document.querySelector("#startDate")?.value || window.BI_DATA.meta.dateMin;
    const end = document.querySelector("#endDate")?.value || window.BI_DATA.meta.dateMax;
    const selectedStatuses = selectedStatus ? new Set([selectedStatus]) : new Set();
    const inSelectedStatus = (status) => selectedStatuses.size === 0 || selectedStatuses.has(status || "");
    const validTeams = new Set((window.BI_DATA.teams || []).map((row) => row.team).filter(Boolean));
    const backlog = window.BI_DATA.backlog.filter((row) => validTeams.has(row.team) && (row.createdDate || window.BI_DATA.meta.dateMin) >= start && (row.createdDate || window.BI_DATA.meta.dateMin) <= end && inSelectedStatus(row.status));
    const worklogs = window.BI_DATA.worklogs.filter((row) => validTeams.has(row.team) && row.date >= start && row.date <= end && inSelectedStatus(row.status));
    const accounts = new Map();
    const ensureAccount = (account) => {
      if (!accounts.has(account)) accounts.set(account, { account, logged: 0, keys: new Set(), estimateKeys: new Set() });
      return accounts.get(account);
    };
    backlog.forEach((row) => {
      const item = ensureAccount(row.account || "(blank)");
      if (row.key && item.estimateKeys.has(row.key)) return;
      if (row.key) item.estimateKeys.add(row.key);
    });
    worklogs.forEach((row) => {
      const account = String(row.tempoAccount || "").trim();
      if (!account || account === "-") return;
      ensureAccount(account).logged += Number(row.logged) || 0;
    });
    backlog.forEach((row) => {
      if (row.key) ensureAccount(row.account || "(blank)").keys.add(row.key);
    });
    const expectedRows = Array.from(accounts.values())
      .map((row) => ({
        account: row.account === "(blank)" ? "No Account / Missing Account" : row.account,
        logged: row.logged,
        itemCount: row.keys.size,
      }))
      .sort((a, b) => b.logged - a.logged)
      .slice(0, 120);
    const renderedRows = Array.from(document.querySelectorAll("#detailTable tbody tr"))
      .map((tr) => ({ account: tr.cells[0]?.textContent.trim() || "", itemCount: Number((tr.cells[5]?.textContent || "0").replaceAll(",", "")) || 0 }))
      .filter((row) => row.account && row.account !== "No matching rows.");
    const mismatches = expectedRows
      .map((row, index) => ({ account: row.account, expected: row.itemCount, rendered: renderedRows[index]?.itemCount, renderedAccount: renderedRows[index]?.account }))
      .filter((row) => row.expected !== row.rendered || row.account !== row.renderedAccount);
    return {
      selectedStatus,
      expectedRows: expectedRows.length,
      renderedRows: renderedRows.length,
      expectedTotal: expectedRows.reduce((total, row) => total + row.itemCount, 0),
      renderedTotal: renderedRows.reduce((total, row) => total + row.itemCount, 0),
      mismatches: mismatches.slice(0, 5),
    };
  }`);
  const accountWorkItemsWithNoStatus = await cdp.eval(`window.__verifyAccountWorkItems(null)`);
  await cdp.eval(`Array.from(document.querySelectorAll("#statusFacet input")).find((input) => input.value === ${JSON.stringify(statusToSelect)})?.click()`);
  await sleep(350);
  const accountWorkItemsWithSelectedStatus = await cdp.eval(`window.__verifyAccountWorkItems(${JSON.stringify(statusToSelect)})`);
  await cdp.eval(`document.querySelector('.tab[data-detail="backlog"]').click()`);
  await sleep(150);
  const statusFilter = await cdp.eval(`((selectedStatus) => ({
    selectedStatus,
    accountFacetValidation: window.__verifyAccountFacetCounts("HK-Dir"),
    chips: Array.from(document.querySelectorAll(".chip")).map((chip) => chip.textContent.trim()),
    actualHours: Array.from(document.querySelectorAll(".kpi-card")).find((card) => card.querySelector("span")?.textContent.trim() === "Actual Hours")?.querySelector("strong")?.textContent || "",
    expectedActualHours: (() => {
      const start = document.querySelector("#startDate")?.value || window.BI_DATA.meta.dateMin;
      const end = document.querySelector("#endDate")?.value || window.BI_DATA.meta.dateMax;
      const validTeams = new Set((window.BI_DATA.teams || []).map((row) => row.team).filter(Boolean));
      return window.BI_DATA.worklogs
        .filter((row) => validTeams.has(row.team) && row.date >= start && row.date <= end)
        .reduce((total, row) => total + (Number(row.logged) || 0), 0);
    })(),
    detailSubtitle: document.querySelector("#detailSubtitle")?.textContent.trim() || "",
    backlogDetailStatuses: (() => {
      const headers = Array.from(document.querySelectorAll("#detailTable thead th"))
        .map((th) => th.querySelector(".sort-header span:first-child")?.textContent.trim() || "");
      const statusIndex = headers.indexOf("Status");
      if (statusIndex < 0) return [];
      return Array.from(document.querySelectorAll("#detailTable tbody tr"))
        .map((tr) => tr.cells[statusIndex]?.textContent.trim() || "")
        .filter(Boolean);
    })(),
    priorityExpectedCounts: (() => {
      const start = document.querySelector("#startDate")?.value || window.BI_DATA.meta.dateMin;
      const end = document.querySelector("#endDate")?.value || window.BI_DATA.meta.dateMax;
      const counts = {};
      window.BI_DATA.backlog
        .filter((row) => row.status === selectedStatus && (row.createdDate || window.BI_DATA.meta.dateMin) >= start && (row.createdDate || window.BI_DATA.meta.dateMin) <= end)
        .forEach((row) => counts[row.priority || "(blank)"] = (counts[row.priority || "(blank)"] || 0) + 1);
      return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8));
    })(),
    priorityRenderedCounts: (() => {
      const counts = {};
      Array.from(document.querySelectorAll("#priorityChart svg title")).forEach((title) => {
        const match = title.textContent.trim().match(/^(.+): ([\\d,]+)$/);
        if (match) counts[match[1]] = Number(match[2].replaceAll(",", ""));
      });
      return counts;
    })(),
    typeExpectedCounts: (() => {
      const start = document.querySelector("#startDate")?.value || window.BI_DATA.meta.dateMin;
      const end = document.querySelector("#endDate")?.value || window.BI_DATA.meta.dateMax;
      const counts = {};
      window.BI_DATA.worklogs
        .filter((row) => row.status === selectedStatus && row.itemType && row.date >= start && row.date <= end)
        .forEach((row) => counts[row.itemType] = (counts[row.itemType] || 0) + 1);
      return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7));
    })(),
    typeRenderedCounts: (() => {
      const counts = {};
      Array.from(document.querySelectorAll("#typeChart svg title")).forEach((title) => {
        const match = title.textContent.trim().match(/^(.+): ([\\d,]+)$/);
        if (match) counts[match[1]] = Number(match[2].replaceAll(",", ""));
      });
      return counts;
    })()
  }))(${JSON.stringify(statusToSelect)})`);

  await cdp.eval(`document.querySelector("#resetFilters").click()`);
  await sleep(350);
  await cdp.eval(`document.querySelector('#teamFacet input[value="Authoring"]')?.click()`);
  await cdp.eval(`(() => {
    const start = document.querySelector("#startDate");
    const end = document.querySelector("#endDate");
    start.value = "2026-06-01";
    start.dispatchEvent(new Event("change", { bubbles: true }));
    end.value = "2026-06-05";
    end.dispatchEvent(new Event("change", { bubbles: true }));
  })()`);
  await cdp.eval(`document.querySelector('.tab[data-detail="backlog"]').click()`);
  await sleep(350);
  const backlogWeek23 = await cdp.eval(`(() => {
    const headers = Array.from(document.querySelectorAll("#detailTable thead th"))
      .map((th) => th.querySelector(".sort-header span:first-child")?.textContent.trim() || "");
    const col = (name) => headers.indexOf(name);
    const rows = Array.from(document.querySelectorAll("#detailTable tbody tr"))
      .map((tr) => Array.from(tr.cells).map((cell) => cell.textContent.trim()))
      .filter((cells) => cells[col("Child Key")] && cells[col("Child Key")] !== "No matching rows.");
    const renderedKeys = rows.map((cells) => cells[col("Child Key")]).sort((a, b) => a.localeCompare(b));
    const excludedKeys = window.BI_DATA.meta.excludedIssueKeys || [];
    const renderedRowsByKey = new Map(rows.map((cells) => [cells[col("Child Key")], {
      key: cells[col("Child Key")] || "",
      summary: cells[col("Child Summary")] || "",
      parentKey: cells[col("Parent Key")] || "",
      parentSummary: cells[col("Parent Summary")] || "",
      productModule: cells[col("Product Module")] || "",
      status: cells[col("Status")] || "",
      startDate: cells[col("Start Date")] || "",
      dueDate: cells[col("Due Date")] || "",
      lastWorklogDate: cells[col("Last Worklog Date")] || "",
      priority: cells[col("Priority")] || "",
      targetRelease: cells[col("Target Release")] || "",
      fixVersion: cells[col("Fix Version")] || "",
    }]));
    const renderedLastWorklogDates = Object.fromEntries(rows.map((cells) => [cells[col("Child Key")], cells[col("Last Worklog Date")]]));
    const renderedDateValues = rows.map((cells) => cells[col("Last Worklog Date")]).filter(Boolean);
    const renderedDatesDescending = renderedDateValues.every((value, index, values) => index === 0 || values[index - 1] >= value);
    const expectedRows = (window.BI_DATA.backlogWorklogs || [])
      .filter((row) => row.team === "Authoring")
      .filter((row) => String(row.week) === "23")
      .filter((row) => row.isWorkday !== false)
      .filter((row) => row.date >= "2026-06-01" && row.date <= "2026-06-05");
    const expectedByKey = new Map();
    expectedRows.forEach((row) => {
      if (!row.key) return;
      if (!expectedByKey.has(row.key)) {
        expectedByKey.set(row.key, {
          lastWorklogDate: "",
          summary: row.summary || "",
          parentKey: row.parentKey || "",
          parentSummary: row.parentSummary || "",
          status: row.status || "",
          startDate: row.startDate || "",
          dueDate: row.dueDate || "",
          priority: row.priority || "",
          targetRelease: row.targetRelease || "",
          fixVersion: row.fixVersion || "",
          itemType: row.itemType || "",
          tempoItemType: row.tempoItemType || "",
        });
      }
      const item = expectedByKey.get(row.key);
      if ((row.date || "") > item.lastWorklogDate) item.lastWorklogDate = row.date || "";
      if (!item.summary && row.summary) item.summary = row.summary;
      if (!item.parentKey && row.parentKey) item.parentKey = row.parentKey;
      if (!item.parentSummary && row.parentSummary) item.parentSummary = row.parentSummary;
      if (!item.status && row.status) item.status = row.status;
      if (!item.startDate && row.startDate) item.startDate = row.startDate;
      if (!item.dueDate && row.dueDate) item.dueDate = row.dueDate;
      if (!item.priority && row.priority) item.priority = row.priority;
      if (!item.targetRelease && row.targetRelease) item.targetRelease = row.targetRelease;
      if (!item.fixVersion && row.fixVersion) item.fixVersion = row.fixVersion;
      if (!item.itemType && row.itemType) item.itemType = row.itemType;
      if (!item.tempoItemType && row.tempoItemType) item.tempoItemType = row.tempoItemType;
    });
    const expectedKeys = Array.from(expectedByKey.keys()).sort((a, b) => a.localeCompare(b));
    const jiraByKey = new Map((window.BI_DATA.backlog || []).map((row) => [row.key, row]));
    const tempoDescriptionByKey = new Map((window.BI_DATA.tempoOperationalMappings || window.BI_DATA.tempoDescriptions || []).map((row) => [
      String(row.Key || row.key || "").trim().toUpperCase(),
      row.Summary || row.summary || "",
    ]));
    const display = (value) => {
      const normalized = String(value || "").trim();
      return !normalized || normalized.toUpperCase() === "N/A" ? "-" : normalized;
    };
    const isChild = (row) => [row.itemType, row.tempoItemType].some((value) => /sub[- ]?task|child/i.test(String(value || "")));
    const expectedJiraSummary = (key) => {
      const jira = jiraByKey.get(key) || {};
      const source = expectedByKey.get(key) || {};
      const summary = display(jira.summary);
      if (summary !== "-") return summary;
      const parentSummary = display(source.parentSummary || jira.parentSummary);
      if (parentSummary !== "-" && isChild(source)) return "[Sub-task] " + parentSummary;
      return "-";
    };
    const unmatchedJiraKeys = expectedKeys.filter((key) => !key.startsWith("TEMPO-") && !jiraByKey.has(key));
    const tempoOperationalKeys = expectedKeys.filter((key) => tempoDescriptionByKey.has(String(key || "").trim().toUpperCase()));
    const tempoDescriptionMismatches = tempoOperationalKeys.filter((key) => (renderedRowsByKey.get(key)?.summary || "") !== (tempoDescriptionByKey.get(String(key || "").trim().toUpperCase()) || ""));
    const jiraSummaryMismatches = expectedKeys
      .filter((key) => jiraByKey.has(key))
      .filter((key) => (renderedRowsByKey.get(key)?.summary || "") !== expectedJiraSummary(key));
    const productModuleMismatches = expectedKeys
      .filter((key) => {
        const expected = key.startsWith("TEMPO-") ? "-" : display(jiraByKey.get(key)?.productModule);
        return (renderedRowsByKey.get(key)?.productModule || "") !== expected;
      })
      .map((key) => ({
        key,
        expected: key.startsWith("TEMPO-") ? "-" : display(jiraByKey.get(key)?.productModule),
        actual: renderedRowsByKey.get(key)?.productModule || "",
      }));
    const tempoPlanningMismatches = tempoOperationalKeys.filter((key) => {
      const row = renderedRowsByKey.get(key) || {};
      return row.status !== "Operational"
        || row.parentKey !== "-"
        || row.parentSummary !== "-"
        || row.priority !== "-"
        || row.startDate !== "-"
        || row.dueDate !== "-"
        || row.targetRelease !== "-"
        || row.fixVersion !== "-";
    });
    const jiraPlanningMismatches = expectedKeys
      .filter((key) => jiraByKey.has(key))
      .flatMap((key) => {
        const jira = jiraByKey.get(key) || {};
        const rendered = renderedRowsByKey.get(key) || {};
        const checks = [
          ["parentKey", jira.parentKey],
          ["parentSummary", jira.parentSummary],
          ["startDate", jira.startDate],
          ["dueDate", jira.dueDate],
          ["priority", jira.priority],
          ["targetRelease", jira.targetRelease],
          ["fixVersion", jira.release],
        ];
        return checks
          .filter(([field, expected]) => rendered[field] !== display(expected))
          .map(([field, expected]) => ({ key, field, expected: display(expected), actual: rendered[field] || "" }));
      });
    return {
      headers,
      expectedKeys,
      renderedKeys,
      excludedRenderedKeys: renderedKeys.filter((key) => excludedKeys.includes(key)),
      excludedSourceKeys: Array.from(new Set((window.BI_DATA.backlogWorklogs || []).map((row) => row.key).filter((key) => excludedKeys.includes(key)))).sort(),
      expectedCount: expectedKeys.length,
      renderedCount: renderedKeys.length,
      missing: expectedKeys.filter((key) => !renderedKeys.includes(key)),
      extra: renderedKeys.filter((key) => !expectedKeys.includes(key)),
      expectedDateRange: Array.from(new Set(expectedRows.map((row) => row.date))).sort(),
      expectedLastWorklogDates: Object.fromEntries(Array.from(expectedByKey.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([key, row]) => [key, row.lastWorklogDate])),
      renderedLastWorklogDates: Object.fromEntries(Object.entries(renderedLastWorklogDates).sort((a, b) => a[0].localeCompare(b[0]))),
      renderedDatesDescending,
      unmatchedJiraKeys,
      tempoOperationalKeys,
      tempoDescriptionMismatches,
      jiraSummaryMismatches,
      productModuleMismatches,
      tempoPlanningMismatches,
      jiraPlanningMismatches,
    };
  })()`);

  await cdp.eval(`document.querySelector('.tab[data-detail="deliveryProgress"]')?.click()`);
  await sleep(250);
  const deliveryWeek23 = await cdp.eval(`(() => {
    const headers = Array.from(document.querySelectorAll("#detailTable thead th"))
      .map((th) => th.querySelector(".sort-header span:first-child")?.textContent.trim() || "");
    const childKeyIndex = headers.indexOf("Child Key");
    const rows = Array.from(document.querySelectorAll("#detailTable tbody tr"))
      .map((tr) => Array.from(tr.cells).map((cell) => cell.textContent.trim()))
      .filter((cells) => childKeyIndex >= 0 && cells[childKeyIndex] && cells[childKeyIndex] !== "No matching rows.");
    const renderedKeys = rows.map((cells) => cells[childKeyIndex]).sort((a, b) => a.localeCompare(b));
    const excludedKeys = window.BI_DATA.meta.excludedIssueKeys || [];
    const expectedRows = (window.BI_DATA.backlogWorklogs || [])
      .filter((row) => String(row.week) === "23")
      .filter((row) => row.isWorkday !== false)
      .filter((row) => row.date >= "2026-06-01" && row.date <= "2026-06-05");
    const validAssignees = new Set((window.BI_DATA.assignees || []).map((row) => row.assignee).filter(Boolean));
    const jiraByKey = new Map((window.BI_DATA.backlog || []).map((row) => [row.key, row]));
    const allWorklogsByKey = new Map();
    (window.BI_DATA.backlogWorklogs || []).forEach((row) => {
      const key = row.key || "";
      if (!key) return;
      if (!allWorklogsByKey.has(key)) allWorklogsByKey.set(key, []);
      allWorklogsByKey.get(key).push(row);
    });
    const assigneeStateValid = (key) => {
      const sourceRows = allWorklogsByKey.get(key) || [];
      const loggedAssignees = Array.from(new Set(sourceRows.map((row) => String(row.person || "").trim()).filter(Boolean)));
      const invalidLoggedAssignees = loggedAssignees.filter((assignee) => !validAssignees.has(assignee));
      const jiraAssignee = String(jiraByKey.get(key)?.assignee || "").trim();
      const invalidJiraAssignee = Boolean(jiraAssignee && !validAssignees.has(jiraAssignee));
      const hasValidLoggedAssignee = loggedAssignees.some((assignee) => validAssignees.has(assignee));
      const hasValidJiraAssignee = Boolean(jiraAssignee && validAssignees.has(jiraAssignee));
      return !invalidLoggedAssignees.length && !invalidJiraAssignee && (hasValidLoggedAssignee || hasValidJiraAssignee);
    };
    const expectedByKey = new Map();
    expectedRows.forEach((row) => {
      const ticketTeam = String(jiraByKey.get(row.key)?.team || "").trim();
      if (!row.key || ticketTeam !== "Authoring" || !assigneeStateValid(row.key)) return;
      if (!expectedByKey.has(row.key)) expectedByKey.set(row.key, { key: row.key, parentKey: "" });
      if (!expectedByKey.get(row.key).parentKey && row.parentKey && row.parentKey !== row.key) {
        expectedByKey.get(row.key).parentKey = row.parentKey;
      }
    });
    const expectedProgressRows = Array.from(expectedByKey.values()).map((row) => ({
      key: row.key,
      parentKey: row.parentKey || "-",
    }));
    const parentKeys = new Set(expectedProgressRows.map((row) => row.parentKey).filter((key) => key && key !== "-"));
    const expectedKeys = expectedProgressRows
      .filter((row) => !(row.parentKey === "-" && parentKeys.has(row.key)))
      .map((row) => row.key)
      .sort((a, b) => a.localeCompare(b));
    return {
      headers,
      expectedKeys,
      renderedKeys,
      expectedCount: expectedKeys.length,
      renderedCount: renderedKeys.length,
      missing: expectedKeys.filter((key) => !renderedKeys.includes(key)),
      extra: renderedKeys.filter((key) => !expectedKeys.includes(key)),
      expectedDateRange: Array.from(new Set(expectedRows.map((row) => row.date))).sort(),
      excludedRenderedKeys: renderedKeys.filter((key) => excludedKeys.includes(key)),
      excludedSourceKeys: Array.from(new Set((window.BI_DATA.backlogWorklogs || []).map((row) => row.key).filter((key) => excludedKeys.includes(key)))).sort(),
    };
  })()`);

  const ab424ParentValidation = await cdp.eval(`(() => {
    const sourceRows = (window.BI_DATA.backlogWorklogs || []).filter((row) => row.key === "AB-424");
    const jiraRows = window.BI_DATA.backlog || [];
    const jiraChild = jiraRows.find((row) => row.key === "AB-424") || null;
    const jiraParent = jiraRows.find((row) => row.key === "AB-405") || null;
    return {
      sourceRowCount: sourceRows.length,
      childInJiraBacklog: Boolean(jiraChild),
      tempoItemTypes: Array.from(new Set(sourceRows.map((row) => row.tempoItemType || row.itemType).filter(Boolean))).sort(),
      tempoParentKeys: Array.from(new Set(sourceRows.map((row) => row.parentKey).filter(Boolean))).sort(),
      enrichedParentSummaries: Array.from(new Set(sourceRows.map((row) => row.parentSummary).filter(Boolean))).sort(),
      childSummaries: Array.from(new Set(sourceRows.map((row) => row.summary).filter(Boolean))).sort(),
      parentJiraKey: jiraParent?.key || "",
      parentJiraSummary: jiraParent?.summary || "",
    };
  })()`);

  await cdp.eval(`document.querySelector("#resetFilters")?.click()`);
  await sleep(350);
  await cdp.eval(`document.querySelector('button[data-detail="backlog"]')?.click()`);
  await sleep(250);
  await cdp.eval(`(() => {
    const search = document.querySelector("#detailSearch");
    search.value = "AB-424";
    search.dispatchEvent(new Event("input", { bubbles: true }));
  })()`);
  await sleep(250);
  const ab424RenderedValidation = await cdp.eval(`(() => {
    const headers = Array.from(document.querySelectorAll("#detailTable thead th"))
      .map((th) => th.querySelector(".sort-header span:first-child")?.textContent.trim() || "");
    const col = (name) => headers.indexOf(name);
    const rows = Array.from(document.querySelectorAll("#detailTable tbody tr"))
      .map((tr) => Array.from(tr.cells).map((cell) => cell.textContent.trim()))
      .filter((cells) => cells[col("Child Key")] && cells[col("Child Key")] !== "No matching rows.");
    const row = rows.find((cells) => cells[col("Child Key")] === "AB-424") || [];
    return {
      rowCount: rows.length,
      key: row[col("Child Key")] || "",
      summary: row[col("Child Summary")] || "",
      parentKey: row[col("Parent Key")] || "",
      parentSummary: row[col("Parent Summary")] || "",
      status: row[col("Status")] || "",
      lastWorklogDate: row[col("Last Worklog Date")] || "",
    };
  })()`);
  await cdp.eval(`document.querySelector("#resetFilters")?.click()`);
  await sleep(350);
  await cdp.eval(`document.querySelector('button[data-detail="deliveryProgress"]')?.click()`);
  await sleep(350);
  const deliveryProgressValidation = await cdp.eval(`(() => {
    const excludedKeys = window.BI_DATA.meta.excludedIssueKeys || [];
    const allowedHealth = new Set(["Healthy", "Due soon", "Overdue", "Completed", "Not applicable", "No due date"]);
    const healthOrder = { Overdue: 0, "Due soon": 1, Healthy: 2, "No due date": 3, "Not applicable": 3, Completed: 4 };
    const validTeams = new Set((window.BI_DATA.teams || []).map((row) => row.team).filter(Boolean));
    const validAssignees = new Set((window.BI_DATA.assignees || []).map((row) => row.assignee).filter(Boolean));
    const headers = Array.from(document.querySelectorAll("#detailTable thead th"))
      .map((th) => th.querySelector(".sort-header span:first-child")?.textContent.trim() || "");
    const col = (name) => headers.indexOf(name);
    const rowCells = () => Array.from(document.querySelectorAll("#detailTable tbody tr"))
      .map((tr) => Array.from(tr.cells).map((cell) => cell.textContent.trim()))
      .filter((cells) => cells[col("Child Key")] && cells[col("Child Key")] !== "No matching rows.");
    const renderedRows = () => rowCells().map((cells) => ({
      account: cells[col("Account")] || "",
      team: cells[col("Team")] || "",
      key: cells[col("Child Key")] || "",
      summary: cells[col("Child Summary")] || "",
      status: cells[col("Status")] || "",
      priority: cells[col("Priority")] || "",
      startDate: cells[col("Start Date")] || "",
      dueDate: cells[col("Due Date")] || "",
      lastWorklogDate: cells[col("Last Worklog Date")] || "",
      daysToDue: cells[col("Days to Due")] || "",
      deliveryHealth: cells[col("Delivery Health")] || "",
    }));
    const display = (value) => {
      const normalized = String(value || "").trim();
      return !normalized || normalized.toUpperCase() === "N/A" ? "-" : normalized;
    };
    const isTempo = (key) => String(key || "").toUpperCase().startsWith("TEMPO-");
    const planning = (value, key) => isTempo(key) ? "-" : display(value);
    const normalizeStatus = (value) => String(value || "").trim().toLowerCase();
    const parseDate = (value) => new Date(String(value) + "T00:00:00");
    const jiraByKey = new Map((window.BI_DATA.backlog || []).map((row) => [row.key, row]));
    const ticketTeam = (key) => String(jiraByKey.get(key)?.team || "").trim();
    const allWorklogsByKey = new Map();
    (window.BI_DATA.backlogWorklogs || []).forEach((row) => {
      const key = row.key || "";
      if (!key) return;
      if (!allWorklogsByKey.has(key)) allWorklogsByKey.set(key, []);
      allWorklogsByKey.get(key).push(row);
    });
    const assigneeStateValid = (key) => {
      const loggedAssignees = Array.from(new Set((allWorklogsByKey.get(key) || [])
        .map((row) => String(row.person || "").trim())
        .filter(Boolean)));
      const jiraAssignee = String(jiraByKey.get(key)?.assignee || "").trim();
      const invalidLoggedAssignees = loggedAssignees.filter((assignee) => !validAssignees.has(assignee));
      const invalidJiraAssignee = Boolean(jiraAssignee && !validAssignees.has(jiraAssignee));
      const hasValidLoggedAssignee = loggedAssignees.some((assignee) => validAssignees.has(assignee));
      const hasValidJiraAssignee = Boolean(jiraAssignee && validAssignees.has(jiraAssignee));
      return !invalidLoggedAssignees.length && !invalidJiraAssignee && (hasValidLoggedAssignee || hasValidJiraAssignee);
    };
    const durationLabel = (days) => {
      if (days >= 7) {
        const weeks = Math.floor(days / 7);
        const remainder = days % 7;
        return remainder ? String(weeks) + "w " + String(remainder) + "d" : String(weeks) + "w";
      }
      return String(days) + "d";
    };
    const isChild = (row) => [row.itemType, row.tempoItemType].some((value) => /sub[- ]?task|child/i.test(String(value || "")));
    const summary = (row) => {
      const ownSummary = display(row.summary);
      const parentSummary = planning(row.parentSummary, row.key);
      if (!isTempo(row.key) && ownSummary === "-" && parentSummary !== "-" && isChild(row)) return "[Sub-task] " + parentSummary;
      return ownSummary;
    };
    const dueState = (row) => {
      if (isTempo(row.key)) return { label: "-", days: null, health: "Not applicable" };
      const status = normalizeStatus(row.status);
      const statusCategory = normalizeStatus(row.statusCategory);
      if (status.includes("blocked") || status.includes("on hold")) return { label: "-", days: null, health: "Not applicable" };
      if (statusCategory === "done" || ["done", "closed", "resolved", "rejected", "abandoned", "cancelled", "canceled"].includes(status)) return { label: "-", days: null, health: "Completed" };
      const dueDate = display(row.dueDate);
      if (dueDate === "-") return { label: "-", days: null, health: "No due date" };
      const currentDate = window.BI_DATA.meta.currentDate || window.BI_DATA.meta.dateMax;
      const days = Math.round((parseDate(dueDate) - parseDate(currentDate)) / 86400000);
      if (!Number.isFinite(days)) return { label: "-", days: null, health: "No due date" };
      if (days < 0) return { label: durationLabel(Math.abs(days)) + " overdue", days, health: "Overdue" };
      if (days <= 7) return { label: durationLabel(days) + " remaining", days, health: "Due soon" };
      return { label: durationLabel(days) + " remaining", days, health: "Healthy" };
    };
    const sourceRows = (window.BI_DATA.backlogWorklogs || [])
      .filter((row) => row.date >= window.BI_DATA.meta.dateMin && row.date <= window.BI_DATA.meta.dateMax)
      .filter((row) => !excludedKeys.includes(row.key))
      .filter((row) => {
        const team = ticketTeam(row.key);
        return !team || validTeams.has(team);
      })
      .filter((row) => assigneeStateValid(row.key));
    const byKey = new Map();
    sourceRows.forEach((row) => {
      const key = row.key || "";
      if (!key) return;
      if (!byKey.has(key)) {
        byKey.set(key, {
          key,
          account: "",
          team: ticketTeam(key),
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
      const item = byKey.get(key);
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
    let expectedAllRows = Array.from(byKey.values()).map((row) => {
      const state = dueState(row);
      return {
        account: planning(row.account, row.key),
        team: display(row.team),
        key: row.key,
        parentKey: planning(row.parentKey, row.key) === row.key ? "-" : planning(row.parentKey, row.key),
        summary: summary(row),
        status: isTempo(row.key) ? "Operational" : display(row.status),
        priority: planning(row.priority, row.key),
        startDate: planning(row.startDate, row.key),
        dueDate: planning(row.dueDate, row.key),
        lastWorklogDate: display(row.lastWorklogDate),
        daysToDue: state.label,
        daysToDueValue: state.days,
        deliveryHealth: state.health,
      };
    });
    const expectedParentKeys = new Set(expectedAllRows.map((row) => row.parentKey).filter((key) => key && key !== "-"));
    expectedAllRows = expectedAllRows.filter((row) => !(row.parentKey === "-" && expectedParentKeys.has(row.key)));
    const compareDates = (a, b, key, direction) => {
      const aMissing = !a[key] || a[key] === "-";
      const bMissing = !b[key] || b[key] === "-";
      if (aMissing !== bMissing) return aMissing ? 1 : -1;
      if (aMissing && bMissing) return 0;
      return String(a[key]).localeCompare(String(b[key])) * direction;
    };
    expectedAllRows.sort((a, b) => {
      const healthCompare = ((healthOrder[a.deliveryHealth] ?? 99) - (healthOrder[b.deliveryHealth] ?? 99));
      if (healthCompare) return healthCompare;
      return compareDates(a, b, "dueDate", 1) || compareDates(a, b, "lastWorklogDate", -1) || a.key.localeCompare(b.key);
    });
    const expectedVisible = expectedAllRows.slice(0, 120);
    let visibleRows = renderedRows();
    const fields = ["account", "team", "key", "summary", "status", "priority", "startDate", "dueDate", "lastWorklogDate", "daysToDue", "deliveryHealth"];
    const visibleMismatches = expectedVisible
      .map((expected, index) => ({ expected, actual: visibleRows[index] || null, index }))
      .filter(({ expected, actual }) => !actual || fields.some((field) => expected[field] !== actual[field]))
      .slice(0, 5);
    const invalidHealth = visibleRows.filter((row) => !allowedHealth.has(row.deliveryHealth));
    const rawNegativeDays = visibleRows.filter((row) => /^-\d/.test(row.daysToDue));
    const terminalStopViolations = visibleRows.filter((row) => ["Completed", "Not applicable"].includes(row.deliveryHealth) && row.daysToDue !== "-");
    const overdueFormatViolations = visibleRows.filter((row) => row.deliveryHealth === "Overdue" && !/overdue$/.test(row.daysToDue));
    const excludedRenderedKeys = visibleRows.map((row) => row.key).filter((key) => excludedKeys.includes(key));
    const firstTempoKey = (sourceRows.find((row) => isTempo(row.key)) || {}).key || "";
    const readRenderedKey = (key) => {
      const search = document.querySelector("#detailSearch");
      search.value = key;
      search.dispatchEvent(new Event("input", { bubbles: true }));
      return renderedRows().find((row) => row.key === key) || null;
    };
    const tempoRendered = firstTempoKey ? readRenderedKey(firstTempoKey) : null;
    const overdueExpected = expectedAllRows.find((row) => row.deliveryHealth === "Overdue") || null;
    const overdueRendered = overdueExpected ? readRenderedKey(overdueExpected.key) : null;
    const terminalExpected = expectedAllRows.find((row) => ["Completed", "Not applicable"].includes(row.deliveryHealth)) || null;
    const terminalRendered = terminalExpected ? readRenderedKey(terminalExpected.key) : null;
    const search = document.querySelector("#detailSearch");
    search.value = "";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    const sampleMatches = (expected, actual) => Boolean(expected && actual && fields.every((field) => expected[field] === actual[field]));
    return {
      detailSubtitle: document.querySelector("#detailSubtitle")?.textContent.trim() || "",
      headers,
      expectedTotalRows: expectedAllRows.length,
      renderedVisibleRows: visibleRows.length,
      visibleMismatches,
      invalidHealth,
      rawNegativeDays,
      terminalStopViolations,
      overdueFormatViolations,
      excludedRenderedKeys,
      excludedSourceKeys: Array.from(new Set((window.BI_DATA.backlogWorklogs || []).map((row) => row.key).filter((key) => excludedKeys.includes(key)))).sort(),
      firstTempoKey,
      tempoRendered,
      tempoOperationalValid: !firstTempoKey || Boolean(tempoRendered && tempoRendered.status === "Operational" && tempoRendered.account === "-" && tempoRendered.priority === "-" && tempoRendered.startDate === "-" && tempoRendered.dueDate === "-" && tempoRendered.daysToDue === "-"),
      overdueSample: overdueExpected ? { expected: overdueExpected, actual: overdueRendered, renderedMatches: sampleMatches(overdueExpected, overdueRendered) } : null,
      terminalStopSample: terminalExpected ? { expected: terminalExpected, actual: terminalRendered, renderedMatches: sampleMatches(terminalExpected, terminalRendered) } : null,
    };
  })()`);

  await cdp.eval(`document.querySelector("#resetFilters")?.click()`);
  await sleep(350);
  await cdp.eval(`document.querySelector('button[data-detail="deliveryProgress"]')?.click()`);
  await cdp.eval(`document.querySelector('#teamFacet input[value="Nexus"]')?.click()`);
  await sleep(350);
  const deliveryProgressNexusTeamValidation = await cdp.eval(`(() => {
    const headers = Array.from(document.querySelectorAll("#detailTable thead th"))
      .map((th) => th.querySelector(".sort-header span:first-child")?.textContent.trim() || "");
    const col = (name) => headers.indexOf(name);
    const rows = Array.from(document.querySelectorAll("#detailTable tbody tr"))
      .map((tr) => Array.from(tr.cells).map((cell) => cell.textContent.trim()))
      .filter((cells) => cells[col("Child Key")] && cells[col("Child Key")] !== "No matching rows.")
      .map((cells) => ({
        account: cells[col("Account")] || "",
        team: cells[col("Team")] || "",
        childKey: cells[col("Child Key")] || "",
        childSummary: cells[col("Child Summary")] || "",
        lastWorklogDate: cells[col("Last Worklog Date")] || "",
      }));
    const visibleTeams = Array.from(new Set(rows.map((row) => row.team))).sort((a, b) => a.localeCompare(b));
    const invalidRows = rows.filter((row) => row.team !== "Nexus");
    const activeTeamChecked = Boolean(document.querySelector('#teamFacet input[value="Nexus"]')?.checked);
    const activeChips = Array.from(document.querySelectorAll(".chip")).map((chip) => chip.textContent.trim());
    return {
      activeTeamChecked,
      activeChips,
      visibleRowCount: rows.length,
      visibleTeams,
      adfRows: rows.filter((row) => row.childKey === "ADF-2326"),
      invalidRows: invalidRows.slice(0, 10),
      sample: rows.slice(0, 8),
    };
  })()`);

  await cdp.eval(`document.querySelector("#resetFilters")?.click()`);
  await sleep(350);
  await cdp.eval(`document.querySelector('button[data-detail="deliveryProgress"]')?.click()`);
  await cdp.eval(`document.querySelector('#teamFacet input[value="Integration"]')?.click()`);
  await sleep(350);
  const deliveryProgressAdfIntegrationValidation = await cdp.eval(`(() => {
    const search = document.querySelector("#detailSearch");
    search.value = "ADF-2326";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    const headers = Array.from(document.querySelectorAll("#detailTable thead th"))
      .map((th) => th.querySelector(".sort-header span:first-child")?.textContent.trim() || "");
    const col = (name) => headers.indexOf(name);
    const rows = Array.from(document.querySelectorAll("#detailTable tbody tr"))
      .map((tr) => Array.from(tr.cells).map((cell) => cell.textContent.trim()))
      .filter((cells) => cells[col("Child Key")] && cells[col("Child Key")] !== "No matching rows.")
      .map((cells) => ({
        account: cells[col("Account")] || "",
        team: cells[col("Team")] || "",
        childKey: cells[col("Child Key")] || "",
        childSummary: cells[col("Child Summary")] || "",
        lastWorklogDate: cells[col("Last Worklog Date")] || "",
      }));
    const adfRows = rows.filter((row) => row.childKey === "ADF-2326");
    search.value = "";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    return {
      activeTeamChecked: Boolean(document.querySelector('#teamFacet input[value="Integration"]')?.checked),
      visibleTeams: Array.from(new Set(rows.map((row) => row.team))).sort((a, b) => a.localeCompare(b)),
      adfRows,
      invalidRows: rows.filter((row) => row.team !== "Integration").slice(0, 10),
    };
  })()`);

  await capture(cdp, "verification-desktop.png");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 920,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await cdp.eval(`window.dispatchEvent(new Event("resize"))`);
  await sleep(350);
  await capture(cdp, "verification-mobile.png");

  if (initial.kpis !== 4 || initial.charts < 5 || initial.rows < 1) {
    throw new Error(`Unexpected initial render: ${JSON.stringify(initial)}`);
  }
  for (const required of ["Annual Workforce Capacity", "Actual Hours", "Annual Capacity Remaining", "Annual Capacity Utilization"]) {
    if (!initial.labels.includes(required)) {
      throw new Error(`Missing required KPI card: ${required}. Labels: ${JSON.stringify(initial.labels)}`);
    }
  }
  const retiredKpis = ["Billable", "Open Backlog", "High Risk Open"];
  if (initial.labels.some((label) => retiredKpis.some((retired) => label.includes(retired)))) {
    throw new Error(`Retired KPI card is still present: ${JSON.stringify(initial.labels)}`);
  }
  if (initial.oldDemandChartPresent || initial.demandTitle !== "Remaining Demand vs Logged Effort by Team") {
    throw new Error(`Demand chart replacement did not render correctly: ${JSON.stringify(initial)}`);
  }
  if (initial.prioritySubtitle.toLowerCase().includes("open")) {
    throw new Error(`Backlog Priority subtitle still implies open-only logic: ${initial.prioritySubtitle}`);
  }
  if (
    initial.statusSummary.sourceTable !== "Jira PI backlog" ||
    initial.statusSummary.sourceField !== "Status" ||
    (initial.statusSummary.recordsWithStatus || 0) < 1 ||
    (initial.statusSummary.tempoRowsWithJiraStatus || 0) < 1
  ) {
    throw new Error(`Status source summary was not generated correctly: ${JSON.stringify(initial.statusSummary)}`);
  }
  const statusSet = new Set(initial.statusValues);
  if (initial.statusFacetLabels.some((label) => !label || label.toLowerCase().includes("blank"))) {
    throw new Error(`Status filter includes a blank value: ${JSON.stringify(initial.statusFacetLabels)}`);
  }
  if (JSON.stringify([...initial.statusFacetLabels].sort()) !== JSON.stringify([...initial.statusValues].sort())) {
    throw new Error(`Status filter is not driven by Jira status dimension: ${JSON.stringify({ values: initial.statusValues, facet: initial.statusFacetLabels })}`);
  }
  if (JSON.stringify([...initial.defaultCheckedStatuses].sort()) !== JSON.stringify([...initial.nonDoneStatusValues].sort())) {
    throw new Error(`Default status selection is not all non-Done statuses: ${JSON.stringify({
      checked: initial.defaultCheckedStatuses,
      expected: initial.nonDoneStatusValues,
      done: initial.doneCategoryStatuses,
    })}`);
  }
  if (initial.defaultCheckedStatuses.some((status) => initial.doneCategoryStatuses.includes(status))) {
    throw new Error(`Done-category status is checked by default: ${JSON.stringify({
      checked: initial.defaultCheckedStatuses,
      done: initial.doneCategoryStatuses,
    })}`);
  }
  if (initial.activeFilterChips.some((chip) => /^Status:/i.test(chip))) {
    throw new Error(`Default status selection should not flood active filter chips: ${JSON.stringify(initial.activeFilterChips)}`);
  }
  for (const status of initial.rawDataStatuses) {
    if (!statusSet.has(status)) {
      throw new Error(`Status value is not sourced from Jira Status dimension: ${status}. Status state: ${JSON.stringify({
        values: initial.statusValues,
        raw: initial.rawDataStatuses,
      })}`);
    }
  }
  if (JSON.stringify(initial.priorityRenderedCounts) !== JSON.stringify(initial.priorityExpectedCounts)) {
    throw new Error(`Backlog Priority chart does not count all Jira backlog priorities: ${JSON.stringify({
      rendered: initial.priorityRenderedCounts,
      expected: initial.priorityExpectedCounts,
    })}`);
  }
  if (!/jira issue type/i.test(initial.typeSubtitle) || /tempo demand distribution|tempo issue/i.test(initial.typeSubtitle)) {
    throw new Error(`Work Item Types subtitle does not identify Jira Issue Type lineage: ${initial.typeSubtitle}`);
  }
  if (JSON.stringify(initial.typeRenderedCounts) !== JSON.stringify(initial.typeExpectedCounts)) {
    throw new Error(`Work Item Types chart does not count Tempo rows by Jira Issue Type: ${JSON.stringify({
      rendered: initial.typeRenderedCounts,
      expected: initial.typeExpectedCounts,
    })}`);
  }
  const jiraIssueTypeSet = new Set(initial.jiraIssueTypes);
  for (const issueType of initial.worklogIssueTypes) {
    if (!jiraIssueTypeSet.has(issueType)) {
      throw new Error(`Work Item Types contains a value not present in Jira Issue Type: ${JSON.stringify({
        issueType,
        jiraIssueTypes: initial.jiraIssueTypes,
        worklogIssueTypes: initial.worklogIssueTypes,
      })}`);
    }
  }
  if (
    initial.issueTypeSummary.sourceTable !== "Jira PI backlog" ||
    initial.issueTypeSummary.sourceField !== "Issue Type" ||
    initial.issueTypeSummary.metric !== "Tempo worklog row count" ||
    (initial.issueTypeSummary.recordsWithJiraIssueType || 0) < 1
  ) {
    throw new Error(`Work Item Types source summary is not valid: ${JSON.stringify(initial.issueTypeSummary)}`);
  }
  if (initial.demandLegend.some((label) => /Billable|Account Category|Demand Mix/i.test(label))) {
    throw new Error(`Demand chart still references retired billable/category logic: ${JSON.stringify(initial.demandLegend)}`);
  }
  if (!initial.demandTooltips.some((text) => text.includes("Team:") && text.includes("Remaining Demand:") && text.includes("Logged Effort:"))) {
    throw new Error(`Demand chart tooltip does not expose required remaining-demand and logged-effort values: ${JSON.stringify(initial.demandTooltips)}`);
  }
  if (initial.demandAccuracyLabels.length) {
    throw new Error(`Remaining Demand chart must not imply estimation accuracy percentages: ${JSON.stringify(initial.demandAccuracyLabels)}`);
  }
  const requiredCurrentTeams = ["Authoring", "Delivery Express", "Integration", "Nexus", "Portal", "Scoring"];
  const forbiddenTeams = ["Engineering", "Red Team", "Operations", "Product Management"];
  const masterTeamSet = new Set(initial.masterTeams);
  for (const required of requiredCurrentTeams) {
    if (!masterTeamSet.has(required)) {
      throw new Error(`Missing required Assignees/capacity team: ${required}. Master teams: ${JSON.stringify(initial.masterTeams)}`);
    }
  }
  for (const forbidden of forbiddenTeams) {
    if (initial.masterTeams.includes(forbidden) || initial.teamFacetLabels.includes(forbidden) || initial.rawDataTeams.includes(forbidden) || initial.demandTeams.includes(forbidden) || initial.utilizationTeams.includes(forbidden)) {
      throw new Error(`Forbidden non-Assignees team is visible: ${forbidden}. Team state: ${JSON.stringify({
        masterTeams: initial.masterTeams,
        teamFacetLabels: initial.teamFacetLabels,
        rawDataTeams: initial.rawDataTeams,
        demandTeams: initial.demandTeams,
        utilizationTeams: initial.utilizationTeams,
      })}`);
    }
  }
  for (const team of [...initial.teamFacetLabels, ...initial.rawDataTeams, ...initial.demandTeams, ...initial.utilizationTeams]) {
    if (!masterTeamSet.has(team)) {
      throw new Error(`Team value is not sourced from Assignees/capacity master dimension: ${team}. Master teams: ${JSON.stringify(initial.masterTeams)}`);
    }
  }
  if (JSON.stringify(initial.teamFacetLabels) !== JSON.stringify(initial.masterTeams)) {
    throw new Error(`Team filter is not driven by master team dimension: ${JSON.stringify({ master: initial.masterTeams, facet: initial.teamFacetLabels })}`);
  }
  const requiredPrograms = ["PS - Professional Services", "MS - Managed Services", "PD - Product Development", "S-GTM - Sales & Go To Market"];
  for (const required of requiredPrograms) {
    if (!initial.programValues.includes(required) || !initial.programFacetLabels.includes(required) || !initial.rawDataPrograms.includes(required)) {
      throw new Error(`Missing required Jira Program value: ${required}. Program state: ${JSON.stringify({
        summary: initial.programSummary,
        values: initial.programValues,
        facet: initial.programFacetLabels,
        raw: initial.rawDataPrograms,
      })}`);
    }
  }
  if (initial.programFacetLabels.some((label) => !label || label.toLowerCase().includes("blank"))) {
    throw new Error(`Program filter includes a blank value: ${JSON.stringify(initial.programFacetLabels)}`);
  }
  if ((initial.programSummary.recordsWithProgram || 0) < 1 || !Array.isArray(initial.programSummary.values) || initial.programSummary.values.length < 4) {
    throw new Error(`Program summary was not generated correctly: ${JSON.stringify(initial.programSummary)}`);
  }
  const requiredSkills = ["Backend", "Frontend", "Full Stack"];
  const skillSet = new Set(initial.skillValues);
  for (const required of requiredSkills) {
    if (!skillSet.has(required) || !initial.skillFacetLabels.includes(required) || !initial.rawDataSkills.includes(required)) {
      throw new Error(`Missing required Assignees Skill value: ${required}. Skill state: ${JSON.stringify({
        summary: initial.skillSummary,
        values: initial.skillValues,
        facet: initial.skillFacetLabels,
        raw: initial.rawDataSkills,
      })}`);
    }
  }
  if (initial.skillFacetLabels.some((label) => !label || label.toLowerCase().includes("blank"))) {
    throw new Error(`Skill filter includes a blank value: ${JSON.stringify(initial.skillFacetLabels)}`);
  }
  for (const skill of [...initial.skillFacetLabels, ...initial.rawDataSkills]) {
    if (!skillSet.has(skill)) {
      throw new Error(`Skill value is not sourced from Assignees master dimension: ${skill}. Skill state: ${JSON.stringify({
        values: initial.skillValues,
        facet: initial.skillFacetLabels,
        raw: initial.rawDataSkills,
      })}`);
    }
  }
  if (JSON.stringify([...initial.skillFacetLabels].sort()) !== JSON.stringify([...initial.skillValues].sort())) {
    throw new Error(`Skill filter is not driven by Assignees skill dimension: ${JSON.stringify({ values: initial.skillValues, facet: initial.skillFacetLabels })}`);
  }
  if ((initial.skillSummary.assigneesWithSkill || 0) < 1 || !Array.isArray(initial.skillSummary.values) || initial.skillSummary.values.length < 3) {
    throw new Error(`Skill summary was not generated correctly: ${JSON.stringify(initial.skillSummary)}`);
  }
  const requiredAccountHeaders = [
    "Account",
    "Original Estimate Hours",
    "Logged Hours",
    "Variance Hours",
    "Logged vs Estimate %",
    "Work Items",
  ];
  if (JSON.stringify(initial.accountHeaders) !== JSON.stringify(requiredAccountHeaders)) {
    throw new Error(`Accounts table headers do not match the requested delivery-effort view: ${JSON.stringify(initial.accountHeaders)}`);
  }
  for (const retired of ["Remaining Estimate Hours", "Category", "Customer", "Billable", "Billable Mix", "Done Work Items", "Open / In Progress Work Items", "Done %"]) {
    if (initial.accountHeaders.some((header) => header.includes(retired))) {
      throw new Error(`Accounts table still contains retired billable-analysis column: ${retired}. Headers: ${JSON.stringify(initial.accountHeaders)}`);
    }
  }
  if ((initial.accountValidation.distinctAccounts || 0) < 1 || (initial.accountValidation.totalWorkItems || 0) < 1) {
    throw new Error(`Accounts table validation totals are empty: ${JSON.stringify(initial.accountValidation)}`);
  }
  if (initial.accountValidation.firstAccount !== initial.accountValidation.firstRenderedAccount) {
    throw new Error(`Accounts table default sort is not Logged Hours descending: ${JSON.stringify(initial.accountValidation)}`);
  }
  if (!initial.accountValidation.renderedLogged.every((value, index, items) => index === 0 || items[index - 1] >= value)) {
    throw new Error(`Accounts table rendered rows are not sorted by Logged Hours descending by default: ${JSON.stringify(initial.accountValidation.renderedLogged)}`);
  }
  if (!accountSort.ascSorted || !accountSort.descSorted || !accountSort.resetLoggedDescending) {
    throw new Error(`Accounts table sorting cycle failed: ${JSON.stringify(accountSort)}`);
  }
  for (const accountWorkItems of [accountWorkItemsWithNoStatus, accountWorkItemsWithSelectedStatus]) {
    if (
      accountWorkItems.expectedRows !== accountWorkItems.renderedRows ||
      accountWorkItems.expectedTotal !== accountWorkItems.renderedTotal ||
      accountWorkItems.mismatches.length
    ) {
      throw new Error(`Accounts table Work Items do not respect status filters: ${JSON.stringify(accountWorkItems)}`);
    }
  }
  const accountFacetScenarios = [
    ["initial", initial.accountFacetValidation],
    ["last30", last30.accountFacetValidation],
    ["backlog", backlogAccountFacet],
    ["deliveryProgress", deliveryProgressAccountFacet],
    ["statusFilter", statusFilter.accountFacetValidation],
  ];
  for (const [label, validation] of accountFacetScenarios) {
    if (
      validation.targetExpected !== validation.targetRendered ||
      validation.mismatches.length
    ) {
      throw new Error(`Account facet counts do not reconcile to distinct filtered work-item keys for ${label}: ${JSON.stringify(validation)}`);
    }
    if (validation.filteredTempoWorklogRows > 0 && validation.targetRendered === validation.filteredTempoWorklogRows) {
      throw new Error(`Account facet appears to count Tempo worklog rows for ${label}: ${JSON.stringify(validation)}`);
    }
    if (validation.targetExpectedKeysOutsideRawBacklog !== 0) {
      throw new Error(`Account facet includes generated keys outside raw Jira backlog for ${label}: ${JSON.stringify(validation)}`);
    }
  }
  if (initial.accountFacetValidation.targetRendered === initial.accountFacetValidation.rawBacklogCount) {
    throw new Error(`HK-Dir Account facet still shows the raw backlog count in the default Accounts context: ${JSON.stringify(initial.accountFacetValidation)}`);
  }
  if (initial.accountFacetValidation.rawBacklogCount < 1 || initial.accountFacetValidation.targetRendered < 1) {
    throw new Error(`HK-Dir Account facet did not render a positive filtered count in the default Accounts context: ${JSON.stringify(initial.accountFacetValidation)}`);
  }
  if (initial.accountFacetValidation.targetRendered === last30.accountFacetValidation.targetRendered) {
    throw new Error(`HK-Dir Account facet did not react to the Last 30 Days date range: ${JSON.stringify({ initial: initial.accountFacetValidation, last30: last30.accountFacetValidation })}`);
  }
  if (backlogAccountFacet.targetRendered === statusFilter.accountFacetValidation.targetRendered) {
    throw new Error(`HK-Dir Account facet did not react to a Jira Status filter in Backlog context: ${JSON.stringify({ backlogAccountFacet, status: statusFilter.accountFacetValidation })}`);
  }
  if (
    initial.accountFacetValidation.targetRendered !== backlogAccountFacet.targetRendered ||
    initial.accountFacetValidation.targetRendered !== deliveryProgressAccountFacet.targetRendered
  ) {
    throw new Error(`HK-Dir Account facet changed when only switching tabs: ${JSON.stringify({
      initial: initial.accountFacetValidation,
      backlogAccountFacet,
      deliveryProgressAccountFacet,
    })}`);
  }
  if (process.env.VERIFY_ACCOUNT_FACET_ONLY === "1") {
    console.log(JSON.stringify({
      initial: initial.accountFacetValidation,
      last30: last30.accountFacetValidation,
      backlog: backlogAccountFacet,
      deliveryProgress: deliveryProgressAccountFacet,
      statusFilter: statusFilter.accountFacetValidation,
    }, null, 2));
    cdp.close();
    chromeProcess.kill();
    process.exit(0);
  }
  if (!initial.teamChartTooltips.some((text) => text.includes("Capacity Hours:") && text.includes("Logged Hours:") && text.includes("Variance Hours:") && text.includes("Utilization:"))) {
    throw new Error(`Team chart tooltip does not expose required utilization values: ${JSON.stringify(initial.teamChartTooltips)}`);
  }
  for (const [team, expected] of Object.entries(initial.teamExpectedLoggedByTeam)) {
    const rendered = initial.teamRenderedLoggedByTeam[team];
    if (Math.abs((rendered || 0) - expected) > 0.11) {
      throw new Error(`Team Utilization logged hours should use all mapped Tempo hours and ignore Jira Status: ${JSON.stringify({
        team,
        rendered,
        expected,
        renderedByTeam: initial.teamRenderedLoggedByTeam,
        expectedByTeam: initial.teamExpectedLoggedByTeam,
      })}`);
    }
  }
  if ((initial.teamRenderedLoggedByTeam.Authoring || 0) < 3900) {
    throw new Error(`Authoring Team Utilization logged hours regressed: ${JSON.stringify(initial.teamRenderedLoggedByTeam)}`);
  }
  if (!initial.utilizationLabels.length) {
    throw new Error("Team utilization chart does not show utilization percentage labels.");
  }
  if (initial.excludedTempoKeysPresent.length) {
    throw new Error(`Non-delivery Tempo work items are still present in delivery effort data: ${JSON.stringify({
      present: initial.excludedTempoKeysPresent,
      summary: initial.excludedTempoWorkItems,
    })}`);
  }
  const requiredExcludedKeys = ["TEMPO-54", "TEMPO-92", "TEMPO-106", "TEMPO-111", "TEMPO-112"];
  if (JSON.stringify([...initial.excludedIssueKeys].sort()) !== JSON.stringify([...requiredExcludedKeys].sort())) {
    throw new Error(`Central governed exclusion set is not the required exact five-key set: ${JSON.stringify(initial.excludedIssueKeys)}`);
  }
  for (const requiredKey of requiredExcludedKeys) {
    if (!initial.excludedTempoWorkItems.some((item) => item.key === requiredKey && item.rows > 0)) {
      throw new Error(`Missing excluded Tempo work item summary for ${requiredKey}: ${JSON.stringify(initial.excludedTempoWorkItems)}`);
    }
  }
  if (Math.abs(parseDashboardNumber(initial.actualHours) - initial.expectedActualHours) > 0.11) {
    throw new Error(`Actual Hours KPI should use centralized mapped Tempo delivery effort and ignore Jira Status: ${JSON.stringify({
      actual: initial.actualHours,
      expected: initial.expectedActualHours,
    })}`);
  }
  for (const [filter, count] of Object.entries(initial.filterCounts)) {
    if (count < 1) throw new Error(`Expected ${filter} filter options to render: ${JSON.stringify(initial.filterCounts)}`);
  }
  if (initial.actualHours === last30.actualHours) {
    throw new Error(`Date preset did not change the Actual Hours KPI: ${JSON.stringify({ initial, last30 })}`);
  }
  for (const assigneeFacetValidation of [initial.assigneeFacetValidation, last30.assigneeFacetValidation]) {
    if (
      assigneeFacetValidation.expectedRows !== assigneeFacetValidation.renderedRows ||
      assigneeFacetValidation.mismatches.length
    ) {
      throw new Error(`Assignee facet counts should reconcile to filtered logged hours: ${JSON.stringify(assigneeFacetValidation)}`);
    }
  }
  const analyticalLeakDatasets = Object.entries(globalExclusionUiValidation.analyticalLeaks)
    .filter(([, keys]) => keys.length)
    .map(([dataset, keys]) => ({ dataset, keys }));
  if (
    analyticalLeakDatasets.length
    || globalExclusionUiValidation.renderedLeaks.length
    || globalExclusionUiValidation.searchLeaks.length
    || !globalExclusionUiValidation.csvCaptured
    || globalExclusionUiValidation.csvLeaks.length
  ) {
    throw new Error(`Global exclusion leaked into analytical data, rendering, search, filters, tooltips, or CSV export: ${JSON.stringify(globalExclusionUiValidation)}`);
  }
  if (
    initial.assigneeFacetValidation.vladRendered == null ||
    last30.assigneeFacetValidation.vladRendered == null ||
    Math.abs(initial.assigneeFacetValidation.vladRendered - last30.assigneeFacetValidation.vladRendered) <= 0.11
  ) {
    throw new Error(`Vladyslav Byndych Assignee facet hours should react to date range changes: ${JSON.stringify({
      initial: initial.assigneeFacetValidation,
      last30: last30.assigneeFacetValidation,
    })}`);
  }
  if (!teamFilter.chips.some((chip) => chip.includes("Delivery Express"))) {
    throw new Error(`Team filter chip missing: ${JSON.stringify(teamFilter)}`);
  }
  if (!programFilter.chips.some((chip) => chip.includes("PS - Professional Services"))) {
    throw new Error(`Program filter chip missing or not selectable: ${JSON.stringify(programFilter)}`);
  }
  if (!skillFilter.chips.some((chip) => chip.includes("Frontend"))) {
    throw new Error(`Skill filter chip missing or not selectable: ${JSON.stringify(skillFilter)}`);
  }
  if (!statusFilter.chips.some((chip) => chip.includes(`Status: ${statusFilter.selectedStatus}`))) {
    throw new Error(`Status filter chip missing or not selectable: ${JSON.stringify(statusFilter)}`);
  }
  if (Math.abs(parseDashboardNumber(statusFilter.actualHours) - statusFilter.expectedActualHours) > 0.11) {
    throw new Error(`Status filter should not reduce the Actual Hours KPI from centralized Tempo delivery effort: ${JSON.stringify(statusFilter)}`);
  }
  if (JSON.stringify(statusFilter.priorityRenderedCounts) !== JSON.stringify(statusFilter.priorityExpectedCounts)) {
    throw new Error(`Status filter did not recalculate Backlog Priority from Jira statuses: ${JSON.stringify(statusFilter)}`);
  }
  if (JSON.stringify(statusFilter.typeRenderedCounts) !== JSON.stringify(statusFilter.typeExpectedCounts)) {
    throw new Error(`Status filter did not recalculate Work Item Types from joined Jira statuses: ${JSON.stringify(statusFilter)}`);
  }
  if (statusFilter.detailSubtitle !== "Backlog worked on") {
    throw new Error(`Backlog detail view does not use the worked-on definition: ${JSON.stringify(statusFilter)}`);
  }
  if (statusFilter.backlogDetailStatuses.some((status) => status !== statusFilter.selectedStatus)) {
    throw new Error(`Backlog detail table includes records outside the selected status: ${JSON.stringify(statusFilter)}`);
  }
  const requiredBacklogHeaders = ["Parent Key", "Parent Summary", "Child Key", "Child Summary", "Work Item Type", "Product Module", "Status", "Start Date", "Due Date", "Last Worklog Date", "Priority", "Target Release", "Fix Version"];
  if (JSON.stringify(backlogWeek23.headers) !== JSON.stringify(requiredBacklogHeaders)) {
    throw new Error(`Backlog table columns are not the required set: ${JSON.stringify(backlogWeek23)}`);
  }
  if (backlogWeek23.headers.some((header) => /age/i.test(header))) {
    throw new Error(`Backlog table still exposes Age: ${JSON.stringify(backlogWeek23.headers)}`);
  }
  if (JSON.stringify(backlogWeek23.expectedDateRange) !== JSON.stringify(["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05"])) {
    throw new Error(`Week 23 did not resolve to the expected Authoring workweek: ${JSON.stringify(backlogWeek23)}`);
  }
  if (backlogWeek23.excludedSourceKeys.length || backlogWeek23.excludedRenderedKeys.length || backlogWeek23.expectedKeys.some((key) => initial.excludedIssueKeys.includes(key))) {
    throw new Error(`Excluded Tempo governance keys are present in Backlog activity data: ${JSON.stringify(backlogWeek23)}`);
  }
  if (backlogWeek23.missing.length || backlogWeek23.extra.length || backlogWeek23.expectedCount !== backlogWeek23.renderedCount) {
    throw new Error(`Backlog table does not reconcile to distinct Tempo keys for Authoring Week 23: ${JSON.stringify(backlogWeek23)}`);
  }
  if (JSON.stringify(backlogWeek23.renderedLastWorklogDates) !== JSON.stringify(backlogWeek23.expectedLastWorklogDates)) {
    throw new Error(`Backlog Last Worklog Date does not match latest Tempo Work Date in context: ${JSON.stringify(backlogWeek23)}`);
  }
  if (backlogWeek23.jiraSummaryMismatches.length) {
    throw new Error(`Backlog Jira summaries are missing or mismatched: ${JSON.stringify(backlogWeek23)}`);
  }
  if (backlogWeek23.productModuleMismatches.length) {
    throw new Error(`Backlog Product Module values are not directly sourced from Jira: ${JSON.stringify(backlogWeek23)}`);
  }
  if (backlogWeek23.tempoDescriptionMismatches.length) {
    throw new Error(`Backlog Tempo operational summaries do not match tempo_operational_mapping.csv: ${JSON.stringify(backlogWeek23)}`);
  }
  if (backlogWeek23.tempoPlanningMismatches.length) {
    throw new Error(`Backlog Tempo operational rows do not display governed dash planning fields: ${JSON.stringify(backlogWeek23)}`);
  }
  if (backlogWeek23.jiraPlanningMismatches.length) {
    throw new Error(`Backlog Jira planning fields are missing or mismatched: ${JSON.stringify(backlogWeek23)}`);
  }
  if (!backlogWeek23.renderedDatesDescending) {
    throw new Error(`Backlog default sort is not Last Worklog Date descending: ${JSON.stringify(backlogWeek23)}`);
  }
  const requiredDeliveryProgressHeaders = ["Account", "Team", "Parent Key", "Parent Summary", "Child Key", "Child Summary", "Status", "Priority", "Start Date", "Due Date", "Last Worklog Date", "Days to Due", "Delivery Health"];
  if (JSON.stringify(deliveryWeek23.headers) !== JSON.stringify(requiredDeliveryProgressHeaders)) {
    throw new Error(`Delivery Progress table columns are not canonical: ${JSON.stringify(deliveryWeek23)}`);
  }
  if (deliveryWeek23.headers.some((header) => /assignee/i.test(header))) {
    throw new Error(`Delivery Progress must not expose Assignee columns: ${JSON.stringify(deliveryWeek23.headers)}`);
  }
  if (JSON.stringify(deliveryWeek23.expectedDateRange) !== JSON.stringify(["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-04", "2026-06-05"])) {
    throw new Error(`Delivery Progress Week 23 did not resolve through Master Date workdays: ${JSON.stringify(deliveryWeek23)}`);
  }
  if (deliveryWeek23.excludedSourceKeys.length || deliveryWeek23.excludedRenderedKeys.length || deliveryWeek23.expectedKeys.some((key) => initial.excludedIssueKeys.includes(key))) {
    throw new Error(`Excluded Tempo governance keys are present in Delivery Progress activity data: ${JSON.stringify(deliveryWeek23)}`);
  }
  if (deliveryWeek23.missing.length || deliveryWeek23.extra.length || deliveryWeek23.expectedCount !== deliveryWeek23.renderedCount) {
    throw new Error(`Delivery Progress does not reconcile to distinct Tempo keys for Authoring Week 23: ${JSON.stringify(deliveryWeek23)}`);
  }
  if (ab424ParentValidation.sourceRowCount < 1
    || !ab424ParentValidation.tempoItemTypes.includes("OAT - Sub-Task")
    || !ab424ParentValidation.tempoParentKeys.includes("AB-405")
    || !ab424ParentValidation.parentJiraSummary
    || !ab424ParentValidation.enrichedParentSummaries.includes(ab424ParentValidation.parentJiraSummary)
    || ab424ParentValidation.parentJiraKey !== "AB-405") {
    throw new Error(`AB-424 parent enrichment did not resolve through Tempo Parent Key -> Jira parent summary: ${JSON.stringify(ab424ParentValidation)}`);
  }
  if (ab424RenderedValidation.key !== "AB-424"
    || ab424RenderedValidation.summary !== `[Sub-task] ${ab424ParentValidation.parentJiraSummary}`
    || ab424RenderedValidation.parentKey !== "AB-405"
    || ab424RenderedValidation.parentSummary !== ab424ParentValidation.parentJiraSummary) {
    throw new Error(`AB-424 rendered Backlog row does not show the child summary fallback: ${JSON.stringify({ ab424RenderedValidation, ab424ParentValidation })}`);
  }

  if (deliveryProgressValidation.detailSubtitle !== "Delivery Progress") {
    throw new Error(`Delivery Progress subtitle did not render: ${JSON.stringify(deliveryProgressValidation)}`);
  }
  if (JSON.stringify(deliveryProgressValidation.headers) !== JSON.stringify(requiredDeliveryProgressHeaders)) {
    throw new Error(`Delivery Progress canonical headers changed: ${JSON.stringify(deliveryProgressValidation.headers)}`);
  }
  if (deliveryProgressValidation.visibleMismatches.length) {
    throw new Error(`Delivery Progress visible rows do not match governed Tempo/Jira semantics: ${JSON.stringify(deliveryProgressValidation.visibleMismatches)}`);
  }
  if (deliveryProgressValidation.invalidHealth.length) {
    throw new Error(`Delivery Progress rendered invalid health states: ${JSON.stringify(deliveryProgressValidation.invalidHealth)}`);
  }
  if (deliveryProgressValidation.rawNegativeDays.length || deliveryProgressValidation.overdueFormatViolations.length) {
    throw new Error(`Delivery Progress Days-to-Due did not render as readable text: ${JSON.stringify(deliveryProgressValidation)}`);
  }
  if (deliveryProgressValidation.terminalStopViolations.length) {
    throw new Error(`Delivery Progress terminal/paused statuses are still accumulating due-date deltas: ${JSON.stringify(deliveryProgressValidation.terminalStopViolations)}`);
  }
  if (deliveryProgressValidation.excludedSourceKeys.length || deliveryProgressValidation.excludedRenderedKeys.length) {
    throw new Error(`Excluded Tempo keys appear in Delivery Progress source/rendered data: ${JSON.stringify(deliveryProgressValidation)}`);
  }
  if (!deliveryProgressValidation.tempoOperationalValid) {
    throw new Error(`Tempo operational item did not render with governed Delivery Progress placeholders: ${JSON.stringify(deliveryProgressValidation.tempoRendered)}`);
  }
  if (!deliveryProgressValidation.overdueSample || !deliveryProgressValidation.overdueSample.renderedMatches) {
    throw new Error(`Delivery Progress overdue calculation could not be validated from rendered rows: ${JSON.stringify(deliveryProgressValidation.overdueSample)}`);
  }
  if (!deliveryProgressValidation.terminalStopSample || !deliveryProgressValidation.terminalStopSample.renderedMatches) {
    throw new Error(`Delivery Progress terminal stop logic could not be validated from rendered rows: ${JSON.stringify(deliveryProgressValidation.terminalStopSample)}`);
  }
  if (!deliveryProgressNexusTeamValidation.activeTeamChecked) {
    throw new Error(`Nexus team filter was not active for Delivery Progress validation: ${JSON.stringify(deliveryProgressNexusTeamValidation)}`);
  }
  if (!deliveryProgressNexusTeamValidation.visibleRowCount) {
    throw new Error(`Nexus team filter produced no Delivery Progress rows to validate: ${JSON.stringify(deliveryProgressNexusTeamValidation)}`);
  }
  if (deliveryProgressNexusTeamValidation.invalidRows.length || JSON.stringify(deliveryProgressNexusTeamValidation.visibleTeams) !== JSON.stringify(["Nexus"])) {
    throw new Error(`Delivery Progress includes teams outside selected Nexus filter: ${JSON.stringify(deliveryProgressNexusTeamValidation)}`);
  }
  if (deliveryProgressNexusTeamValidation.adfRows.length) {
    throw new Error(`ADF-2326 must not appear under Nexus-owned Delivery Progress rows: ${JSON.stringify(deliveryProgressNexusTeamValidation.adfRows)}`);
  }
  if (!deliveryProgressAdfIntegrationValidation.activeTeamChecked) {
    throw new Error(`Integration team filter was not active for ADF-2326 validation: ${JSON.stringify(deliveryProgressAdfIntegrationValidation)}`);
  }
  if (!deliveryProgressAdfIntegrationValidation.adfRows.length) {
    throw new Error(`ADF-2326 must appear under Integration-owned Delivery Progress rows: ${JSON.stringify(deliveryProgressAdfIntegrationValidation)}`);
  }
  if (deliveryProgressAdfIntegrationValidation.adfRows.some((row) => row.team !== "Integration")) {
    throw new Error(`ADF-2326 must render with Integration team ownership: ${JSON.stringify(deliveryProgressAdfIntegrationValidation.adfRows)}`);
  }

  await cdp.eval(`document.querySelector("#resetFilters")?.click()`);
  await sleep(350);
  await cdp.eval(`document.querySelector('button[data-detail="bugTriage"]')?.click()`);
  await sleep(350);
  const bugTriageValidation = await cdp.eval(`(() => {
    const headers = Array.from(document.querySelectorAll("#detailTable thead th"))
      .map((th) => th.querySelector(".sort-header span:first-child")?.textContent.trim() || "");
    const rows = Array.from(document.querySelectorAll("#detailTable tbody tr"))
      .filter((tr) => tr.cells.length === headers.length)
      .map((tr) => Object.fromEntries(headers.map((header, index) => [header, tr.cells[index]?.textContent.trim() || ""])));
    const normalizedKey = (value) => String(value || "").trim().toUpperCase();
    const sourceByKey = new Map((window.BI_DATA.bugTriage || []).map((row) => [normalizedKey(row.key), row]));
    const normalize = (value) => {
      const text = String(value || "").trim();
      return !text || text.toUpperCase() === "N/A" ? "-" : text;
    };
    const mismatches = rows.flatMap((row) => {
      const source = sourceByKey.get(normalizedKey(row.Key));
      if (!source) {
        return [{ key: row.Key, reason: "not in the dedicated Bug Triage queue" }];
      }
      const expected = {
        Summary: normalize(source.summary),
        "Bug Severity": normalize(source.bugSeverity),
        Status: normalize(source.status),
        Updated: normalize(source.updated),
        Assignee: normalize(source.assignee),
        Team: normalize(source.team),
      };
      return Object.entries(expected)
        .filter(([field, value]) => row[field] !== value)
        .map(([field, expectedValue]) => ({ key: row.Key, field, expected: expectedValue, actual: row[field] }));
    });
    const targetKey = rows[0]?.Key || "";
    const snapshotComparison = window.BI_DATA.meta?.bugTriageSnapshotComparison || {};
    const snapshotBanner = document.querySelector("#bugTriageSnapshotSummary");
    const snapshotBannerText = snapshotBanner?.textContent.replace(/\\s+/g, " ").trim() || "";
    const search = document.querySelector("#detailSearch");
    search.value = targetKey;
    search.dispatchEvent(new Event("input", { bubbles: true }));
    const searchRows = Array.from(document.querySelectorAll("#detailTable tbody tr"))
      .filter((tr) => tr.cells.length === headers.length)
      .map((tr) => tr.cells[0]?.textContent.trim() || "");
    search.value = "";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    return {
      headers,
      renderedRows: rows.length,
      renderedDistinctKeys: new Set(rows.map((row) => normalizedKey(row.Key))).size,
      sourceDistinctKeys: sourceByKey.size,
      missingQueueKeys: Array.from(sourceByKey.keys()).filter((key) => !rows.some((row) => normalizedKey(row.Key) === key)),
      mismatches: mismatches.slice(0, 10),
      tempoRows: rows.filter((row) => /^TEMPO-/i.test(row.Key)).map((row) => row.Key),
      unassignedRows: rows.filter((row) => row.Assignee === "-" && row.Team === "-").length,
      snapshotComparison,
      snapshotBannerHidden: Boolean(snapshotBanner?.hidden),
      snapshotBannerText,
      search: { targetKey, renderedKeys: searchRows },
    };
  })()`);
  const requiredBugTriageHeaders = ["Key", "Summary", "Bug Severity", "Status", "Updated", "Assignee", "Team"];
  if (JSON.stringify(bugTriageValidation.headers) !== JSON.stringify(requiredBugTriageHeaders)) {
    throw new Error(`Bug Triage table columns are not canonical: ${JSON.stringify(bugTriageValidation.headers)}`);
  }
  if (
    !bugTriageValidation.renderedRows
    || bugTriageValidation.renderedRows !== bugTriageValidation.sourceDistinctKeys
    || bugTriageValidation.renderedDistinctKeys !== bugTriageValidation.sourceDistinctKeys
    || bugTriageValidation.missingQueueKeys.length
    || bugTriageValidation.mismatches.length
    || bugTriageValidation.tempoRows.length
  ) {
    throw new Error(`Bug Triage queue rendering validation failed: ${JSON.stringify(bugTriageValidation)}`);
  }
  if (!bugTriageValidation.unassignedRows) {
    throw new Error(`Bug Triage did not preserve unassigned queue rows: ${JSON.stringify(bugTriageValidation)}`);
  }
  if (bugTriageValidation.search.renderedKeys.length !== 1 || bugTriageValidation.search.renderedKeys[0] !== bugTriageValidation.search.targetKey) {
    throw new Error(`Bug Triage Details search did not filter the active tab: ${JSON.stringify(bugTriageValidation.search)}`);
  }
  const snapshot = bugTriageValidation.snapshotComparison;
  if (
    snapshot.currentQueue !== bugTriageValidation.sourceDistinctKeys
    || snapshot.currentDuplicateKeys !== 0
    || !snapshot.currentFile
    || bugTriageValidation.snapshotBannerHidden
    || !bugTriageValidation.snapshotBannerText.includes(`Full Bug Triage queue: ${snapshot.currentQueue}`)
  ) {
    throw new Error(`Bug Triage current snapshot summary is invalid: ${JSON.stringify(bugTriageValidation)}`);
  }
  if (snapshot.hasPreviousSnapshot) {
    if (
      !snapshot.previousFile
      || snapshot.previousDuplicateKeys !== 0
      || snapshot.currentQueue !== snapshot.previousQueue + snapshot.addedToQueue - snapshot.removedFromQueue
      || snapshot.reconciles !== true
      || !bugTriageValidation.snapshotBannerText.includes(`${snapshot.addedToQueue} Added to queue`)
      || !bugTriageValidation.snapshotBannerText.includes(`${snapshot.removedFromQueue} Removed from queue`)
    ) {
      throw new Error(`Bug Triage previous snapshot comparison is invalid: ${JSON.stringify(bugTriageValidation)}`);
    }
  } else if (!bugTriageValidation.snapshotBannerText.includes("No previous complete Bug Triage snapshot available.")) {
    throw new Error(`Bug Triage one-snapshot fallback is invalid: ${JSON.stringify(bugTriageValidation)}`);
  }
  if (/New Bugs|Bugs Fixed|Bugs Closed/i.test(bugTriageValidation.snapshotBannerText)) {
    throw new Error(`Bug Triage snapshot banner uses prohibited lifecycle wording: ${JSON.stringify(bugTriageValidation.snapshotBannerText)}`);
  }

  cdp.close();
  console.log(JSON.stringify({
    status: "PASS",
    exclusions: globalExclusionUiValidation,
    rendered: {
      kpis: initial.kpis,
      charts: initial.charts,
      initialDetailRows: initial.rows,
      annualCapacity: initial.annualCapacity,
      actualHours: initial.actualHours,
    },
    reconciliation: {
      deliveryRows: deliveryProgressValidation.expectedTotalRows,
      nexusOwnershipRows: deliveryProgressNexusTeamValidation.visibleRowCount,
      adf2326IntegrationRows: deliveryProgressAdfIntegrationValidation.adfRows.length,
    },
    bugTriage: {
      rows: bugTriageValidation.renderedRows,
      distinctKeys: bugTriageValidation.renderedDistinctKeys,
      unassignedRows: bugTriageValidation.unassignedRows,
      searchTarget: bugTriageValidation.search.targetKey,
    },
  }, null, 2));
} finally {
  chromeProcess.kill();
}

