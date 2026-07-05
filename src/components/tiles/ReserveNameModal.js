import React, { useState } from "react";

export default function ReserveNameModal({ itemName, onSuccess, onClose }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSuccess(trimmed);
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="owner-gate-modal" role="dialog" aria-modal="true" aria-label="Your name">
        <form onSubmit={handleSubmit}>
          <p className="owner-gate-title">Reserve {itemName ? `"${itemName}"` : "item"}</p>
          <p className="owner-gate-body">
            Add your name so the registry owner can see who reserved what. This helps avoid duplicate or bad-faith reservations.
          </p>
          <input
            type="text"
            className="editor-add-form-input"
            placeholder="Your name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
          <div className="owner-gate-actions">
            <button type="submit" className="selector-btn selector-btn--active" disabled={!value.trim()}>Reserve</button>
            <button type="button" className="selector-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  );
}
