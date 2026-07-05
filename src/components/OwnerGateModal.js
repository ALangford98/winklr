import React, { useState } from "react";

export default function OwnerGateModal({ passcode, onSuccess, onClose }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value === passcode) onSuccess();
    else setError(true);
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="owner-gate-modal" role="dialog" aria-modal="true" aria-label="Owner access">
        <form onSubmit={handleSubmit}>
          <p className="owner-gate-title">Owner access</p>
          <p className="owner-gate-body">Enter the owner passcode to unlock Edit Mode.</p>
          <input
            type="password"
            className="editor-add-form-input"
            placeholder="Passcode"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(false); }}
            autoFocus
          />
          {error && <p className="owner-gate-error">Incorrect passcode.</p>}
          <div className="owner-gate-actions">
            <button type="submit" className="selector-btn selector-btn--active">Unlock</button>
            <button type="button" className="selector-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  );
}
