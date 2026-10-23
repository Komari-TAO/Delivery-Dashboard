(function (global) {
  "use strict";
  global.DashboardCore = Object.freeze({
    clientValue(row) {
      return String(row.tempoCustomerAccount || "").trim() || "N/A";
    },
    clonePayload(payload) {
      if (typeof structuredClone === "function") return structuredClone(payload);
      return JSON.parse(JSON.stringify(payload));
    },
    escapeHtml(value) {
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    },
    parseDataScript(text) {
      return JSON.parse(text.replace(/^window\.BI_DATA\s*=\s*/, "").replace(/;\s*$/, ""));
    },
  });
})(window);
