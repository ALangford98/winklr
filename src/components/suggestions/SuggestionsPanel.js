import React, { useContext, useState } from "react";
import { AppContext } from "../appContext";

// A suggestion's "link" is free text from a guest - rendering it as a
// clickable href without checking the scheme would let someone submit a
// `javascript:` URL that runs in the registry owner's browser the moment
// they click "View link".
const isSafeUrl = (url) => /^https?:\/\//i.test((url || "").trim());

function PendingRow({ id, suggestion, onApprove, onReject }) {
  const [qty, setQty] = useState(String(suggestion.quantity ?? 1));

  return (
    <li className="suggestion-row">
      <div className="suggestion-row-top">
        {suggestion.image && <img src={suggestion.image} alt="" className="suggestion-row-thumb" />}
        <div className="suggestion-row-info">
          <span className="suggestion-row-name">{suggestion.name}</span>
          <span className="suggestion-row-meta">
            Suggested qty: {suggestion.quantity} &middot; {suggestion.email}
            {suggestion.reserve && suggestion.reservedBy && (
              <> &middot; {suggestion.reservedBy} wants to bring it</>
            )}
          </span>
          {suggestion.link && isSafeUrl(suggestion.link) && (
            <a href={suggestion.link} target="_blank" rel="noopener noreferrer" className="suggestion-row-link">
              View link ↗
            </a>
          )}
        </div>
      </div>
      <div className="suggestion-row-actions">
        <input
          className="editor-add-form-input suggestion-qty-input"
          type="number"
          min="0"
          step="1"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          title="Final quantity to add"
        />
        <button type="button" className="suggestion-approve-btn" onClick={() => onApprove(id, qty)}>Approve</button>
        <button type="button" className="suggestion-reject-btn" onClick={() => onReject(id)}>Reject</button>
      </div>
    </li>
  );
}

export default function SuggestionsPanel() {
  const { state, approveSuggestion, rejectSuggestion, setGiftSuggestionsEnabled } = useContext(AppContext);
  const entries = Object.entries(state.suggestions || {});
  const pending = entries.filter(([, s]) => s.status === 'pending');
  const decided = entries.filter(([, s]) => s.status !== 'pending')
    .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0))
    .slice(0, 10);

  return (
    <div className="suggestions-panel">
      <label className="category-config-toggle">
        <input
          type="checkbox"
          checked={!!state.giftSuggestionsEnabled}
          onChange={(e) => setGiftSuggestionsEnabled(e.target.checked)}
        />
        <span>Let guests suggest gifts</span>
      </label>
      <p className="decals-hint">
        Guests submit a name, quantity, email, and optionally a link and a photo. Approving adds
        it to your registry with the quantity you choose below (defaults to what they suggested).
      </p>

      {pending.length === 0 ? (
        <p className="suggestions-empty">No pending suggestions.</p>
      ) : (
        <ul className="suggestions-list">
          {pending.map(([id, suggestion]) => (
            <PendingRow
              key={id}
              id={id}
              suggestion={suggestion}
              onApprove={approveSuggestion}
              onReject={rejectSuggestion}
            />
          ))}
        </ul>
      )}

      {decided.length > 0 && (
        <>
          <p className="suggestions-history-heading">Recent decisions</p>
          <ul className="suggestions-history-list">
            {decided.map(([id, s]) => (
              <li key={id} className={`suggestions-history-item suggestions-history-item--${s.status}`}>
                {s.name} <span>({s.status})</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
