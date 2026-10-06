const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const outputDir = path.join(root, "web");

(async () => {
  const errors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("http://127.0.0.1:8765", { waitUntil: "networkidle" });
  await page.waitForSelector(".kpi-card", { timeout: 15000 });

  const initial = await page.evaluate(() => ({
    title: document.title,
    kpis: document.querySelectorAll(".kpi-card").length,
    charts: document.querySelectorAll(".chart-frame svg").length,
    rows: document.querySelectorAll("#detailTable tbody tr").length,
    logged: document.querySelector(".kpi-card strong")?.textContent || "",
  }));

  await page.click('button[data-preset="last30"]');
  await page.waitForTimeout(250);
  const last30 = await page.evaluate(() => ({
    range: document.querySelector("#rangeBadge")?.textContent || "",
    logged: document.querySelector(".kpi-card strong")?.textContent || "",
  }));

  await page.check('#teamFacet input[value="Delivery Express"]');
  await page.waitForTimeout(250);
  const teamFilter = await page.evaluate(() => ({
    chips: Array.from(document.querySelectorAll(".chip")).map((chip) => chip.textContent.trim()),
    logged: document.querySelector(".kpi-card strong")?.textContent || "",
    tableRows: document.querySelectorAll("#detailTable tbody tr").length,
  }));

  await page.screenshot({ path: path.join(outputDir, "verification-desktop.png"), fullPage: true });

  await page.setViewportSize({ width: 390, height: 920 });
  await page.screenshot({ path: path.join(outputDir, "verification-mobile.png"), fullPage: true });

  await browser.close();

  if (errors.length) {
    throw new Error(`Browser console/page errors: ${errors.join(" | ")}`);
  }
  if (initial.kpis < 6 || initial.charts < 5 || initial.rows === 0) {
    throw new Error(`Unexpected initial render: ${JSON.stringify(initial)}`);
  }
  if (initial.logged === last30.logged) {
    throw new Error(`Date preset did not change logged-hours KPI: ${JSON.stringify({ initial, last30 })}`);
  }
  if (!teamFilter.chips.some((chip) => chip.includes("Delivery Express"))) {
    throw new Error(`Team filter did not create an active filter chip: ${JSON.stringify(teamFilter)}`);
  }

  console.log(JSON.stringify({ initial, last30, teamFilter }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
