import React, { useContext, useState } from "react";
import { AppContext } from "../appContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CashFundCard() {
  const { state, pledgeCash } = useContext(AppContext);
  const fund = state.cashFund || {};
  const currencyPrefix = state.brand?.currencyPrefix || "$";

  const [name, setName] = useState(state.guestName || "");
  const [email, setEmail] = useState(state.guestEmail || "");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!fund.enabled) return null;

  const pledges = Object.values(state.cashPledges || {});
  const total = pledges.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const goal = Number(fund.goalAmount) || 0;
  const pct = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!(Number(amount) > 0)) { setError("Enter an amount greater than 0."); return; }
    if (!EMAIL_RE.test(email.trim())) { setError("That doesn't look like a valid email address."); return; }
    setError("");
    setSubmitting(true);
    const ok = await pledgeCash({ name, email, amount, message });
    setSubmitting(false);
    if (ok) {
      setSubmitted(true);
    } else {
      setError("Something went wrong recording your pledge. Check your connection and try again.");
    }
  };

  return (
    <div className="cash-fund-card">
      <p className="cash-fund-heading">{fund.title || "Cash Fund"}</p>
      {fund.message && <p className="cash-fund-message">{fund.message}</p>}

      {(fund.showTotalPledged || goal > 0) && (
        <div className="cash-fund-progress">
          {fund.showTotalPledged && (
            <span className="cash-fund-total">
              {currencyPrefix}{total.toFixed(2)} pledged{goal > 0 ? ` of ${currencyPrefix}${goal.toFixed(2)} goal` : ""}
            </span>
          )}
          {goal > 0 && (
            <div className="cash-fund-bar">
              <div className="cash-fund-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          )}
        </div>
      )}

      {fund.bankDetailsEnabled && fund.bankDetails && (
        <div className="cash-fund-bank-block">
          {fund.bankDetailsLabel && <p className="cash-fund-bank-label">{fund.bankDetailsLabel}</p>}
          <pre className="cash-fund-bank-details">{fund.bankDetails}</pre>
        </div>
      )}
      {fund.bankDetailsEnabled && fund.bankDetails2Enabled && fund.bankDetails2 && (
        <div className="cash-fund-bank-block">
          {fund.bankDetails2Label && <p className="cash-fund-bank-label">{fund.bankDetails2Label}</p>}
          <pre className="cash-fund-bank-details">{fund.bankDetails2}</pre>
        </div>
      )}

      {submitted ? (
        <p className="cash-fund-thanks">Thanks! Your pledge has been recorded.</p>
      ) : (
        <form className="cash-fund-form" onSubmit={handleSubmit}>
          <p className="cash-fund-form-hint">Contributing? Let us know so we can say thank you.</p>
          <input
            className="editor-add-form-input"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="editor-add-form-input"
            type="number"
            min="0"
            step="0.01"
            placeholder={`Amount (${currencyPrefix})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            className="editor-add-form-input"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="editor-add-form-input"
            type="text"
            placeholder="Message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {error && <p className="suggest-gift-error">{error}</p>}
          <button type="submit" className="selector-btn selector-btn--active" disabled={submitting}>
            {submitting ? "Recording..." : "Record my pledge"}
          </button>
        </form>
      )}
    </div>
  );
}
