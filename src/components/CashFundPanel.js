import React, { useContext } from "react";
import { AppContext } from "./appContext";

export default function CashFundPanel() {
  const { state, setCashFund, removePledge } = useContext(AppContext);
  const fund = state.cashFund || {};
  const pledges = Object.entries(state.cashPledges || {})
    .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));
  const currencyPrefix = state.brand?.currencyPrefix || "$";
  const total = pledges.reduce((sum, [, p]) => sum + (Number(p.amount) || 0), 0);

  const update = (changes) => setCashFund((prev) => ({ ...prev, ...changes }));

  return (
    <div className="cash-fund-panel">
      <label className="category-config-toggle">
        <input
          type="checkbox"
          checked={!!fund.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
        />
        <span>Let guests contribute cash instead of (or as well as) items</span>
      </label>

      {fund.enabled && (
        <>
          <label className="branding-field-label">Heading</label>
          <input
            className="editor-add-form-input"
            type="text"
            placeholder="e.g. Honeymoon Fund"
            value={fund.title || ""}
            onChange={(e) => update({ title: e.target.value })}
          />

          <label className="branding-field-label">Message to guests (optional)</label>
          <textarea
            className="category-config-textarea"
            placeholder="e.g. We'd love your help towards our first house instead of another toaster!"
            value={fund.message || ""}
            onChange={(e) => update({ message: e.target.value })}
            rows={2}
          />

          <label className="category-config-toggle">
            <input
              type="checkbox"
              checked={!!fund.showTotalPledged}
              onChange={(e) => update({ showTotalPledged: e.target.checked })}
            />
            <span>Show the running total pledged</span>
          </label>

          <label className="branding-field-label">Goal amount (optional)</label>
          <div className="branding-field">
            <input
              className="editor-add-form-input branding-currency-input"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={fund.goalAmount || ""}
              onChange={(e) => update({ goalAmount: Math.max(0, Number(e.target.value) || 0) })}
            />
            <span className="branding-hint">Leave at 0 to hide the goal progress bar.</span>
          </div>

          <label className="category-config-toggle">
            <input
              type="checkbox"
              checked={!!fund.bankDetailsEnabled}
              onChange={(e) => update({ bankDetailsEnabled: e.target.checked })}
            />
            <span>Show payment details (bank transfer, PayPal, Venmo, etc.)</span>
          </label>
          {fund.bankDetailsEnabled && (
            <>
              <textarea
                className="category-config-textarea"
                placeholder={"e.g.\nBank transfer: Jane Smith, Sort code 12-34-56, Account 12345678\nor PayPal.me/janesmith"}
                value={fund.bankDetails || ""}
                onChange={(e) => update({ bankDetails: e.target.value })}
                rows={4}
              />
              <p className="decals-hint">
                Shown as plain text to every guest who can view this page - only include details
                you're comfortable publishing to anyone with the link.
              </p>
            </>
          )}

          <p className="decals-hint">
            Guests transfer money to you directly outside the app (there's no real payment
            processing here) and can optionally record a pledge so you and other guests can see
            what's been contributed.
          </p>

          {pledges.length > 0 && (
            <>
              <p className="suggestions-history-heading">
                Pledges recorded ({currencyPrefix}{total.toFixed(2)} total)
              </p>
              <ul className="suggestions-list">
                {pledges.map(([id, p]) => (
                  <li key={id} className="suggestion-row">
                    <div className="suggestion-row-info">
                      <span className="suggestion-row-name">
                        {p.name} - {currencyPrefix}{Number(p.amount || 0).toFixed(2)}
                      </span>
                      <span className="suggestion-row-meta">{p.email}</span>
                      {p.message && <span className="suggestion-row-meta">"{p.message}"</span>}
                    </div>
                    <button
                      type="button"
                      className="suggestion-reject-btn"
                      onClick={() => removePledge(id)}
                      title="Remove this pledge"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
