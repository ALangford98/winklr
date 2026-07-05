import { TELEMETRY_FIREBASE_URL } from "../config/telemetry";

const SESSION_FLAG = "winklr_telemetry_sent";

// Fires once per browser session (not per render/reload) so a single visit
// doesn't get counted multiple times. Anonymous, aggregate, operational data
// only - no guest names, no item contents, no reservation data.
export function logDeploymentPing(state, extra = {}) {
  if (!TELEMETRY_FIREBASE_URL) return;
  if (typeof window === "undefined") return;

  try {
    if (window.sessionStorage.getItem(SESSION_FLAG)) return;
    window.sessionStorage.setItem(SESSION_FLAG, "1");
  } catch {
    // sessionStorage unavailable (e.g. private browsing) - log anyway, best effort
  }

  const payload = {
    hostname:     window.location.hostname || "unknown",
    websiteType:  state?.websiteType ?? null,
    itemCount:    Array.isArray(state?.stockList) ? state.stockList.length : null,
    tileConfig:   state?.tileConfig ?? null,
    layoutConfig: state?.layoutConfig ?? null,
    timestamp:    Date.now(),
    ...extra,
  };

  fetch(`${TELEMETRY_FIREBASE_URL.replace(/\/$/, "")}/events.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
