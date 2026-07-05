import React, { useEffect, useState } from "react";
import { TELEMETRY_FIREBASE_URL, ADMIN_PASSCODE } from "../config/telemetry";

function formatDate(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleString();
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [error, setError] = useState(false);
  const [events, setEvents] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (ADMIN_PASSCODE && passcodeInput === ADMIN_PASSCODE) setUnlocked(true);
    else setError(true);
  };

  useEffect(() => {
    if (!unlocked || !TELEMETRY_FIREBASE_URL) return;
    fetch(`${TELEMETRY_FIREBASE_URL.replace(/\/$/, "")}/events.json`)
      .then((r) => r.json())
      .then((data) => {
        const list = data && typeof data === "object" ? Object.values(data).filter(Boolean) : [];
        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setEvents(list);
      })
      .catch(() => setLoadError("Could not load telemetry data - check the database URL and rules in src/config/telemetry.js."));
  }, [unlocked]);

  if (!TELEMETRY_FIREBASE_URL || !ADMIN_PASSCODE) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h1 className="admin-title">Framework admin</h1>
          <p className="admin-body">
            Telemetry isn't configured yet. Set <code>TELEMETRY_FIREBASE_URL</code> and{" "}
            <code>ADMIN_PASSCODE</code> in <code>src/config/telemetry.js</code>, rebuild, and this
            page will show usage across every deployment that reports in.
          </p>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="admin-page">
        <form className="admin-card" onSubmit={handleUnlock}>
          <h1 className="admin-title">Framework admin</h1>
          <p className="admin-body">Enter the admin passcode to view deployment usage.</p>
          <input
            type="password"
            className="editor-add-form-input"
            placeholder="Passcode"
            value={passcodeInput}
            onChange={(e) => { setPasscodeInput(e.target.value); setError(false); }}
            autoFocus
          />
          {error && <p className="owner-gate-error">Incorrect passcode.</p>}
          <button type="submit" className="selector-btn selector-btn--active admin-unlock-btn">Unlock</button>
        </form>
      </div>
    );
  }

  const uniqueHosts = events ? new Set(events.map((e) => e.hostname).filter(Boolean)) : new Set();
  const byType = {};
  (events || []).forEach((e) => {
    const key = e.websiteType || "unknown";
    byType[key] = (byType[key] || 0) + 1;
  });

  return (
    <div className="admin-page">
      <div className="admin-card admin-card--wide">
        <h1 className="admin-title">Framework admin</h1>
        {loadError && <p className="owner-gate-error">{loadError}</p>}
        {!events ? (
          <p className="admin-body">Loading...</p>
        ) : (
          <>
            <div className="admin-stats">
              <div className="admin-stat">
                <span className="admin-stat-value">{events.length}</span>
                <span className="admin-stat-label">Total pings</span>
              </div>
              <div className="admin-stat">
                <span className="admin-stat-value">{uniqueHosts.size}</span>
                <span className="admin-stat-label">Unique domains</span>
              </div>
              {Object.entries(byType).map(([type, count]) => (
                <div className="admin-stat" key={type}>
                  <span className="admin-stat-value">{count}</span>
                  <span className="admin-stat-label">{type}</span>
                </div>
              ))}
            </div>
            {events.length === 0 ? (
              <p className="admin-body">No pings yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Domain</th><th>Type</th><th>Items</th><th>Layout</th><th>Source</th><th>When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 200).map((e, i) => (
                      <tr key={i}>
                        <td>{e.hostname || "-"}</td>
                        <td>{e.websiteType || "-"}</td>
                        <td>{e.itemCount ?? "-"}</td>
                        <td>{e.layoutConfig || "-"}</td>
                        <td>{e.source || "-"}</td>
                        <td>{formatDate(e.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
