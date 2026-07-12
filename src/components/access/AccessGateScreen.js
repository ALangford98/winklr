import React, { useContext, useState } from "react";
import { AppContext } from "../appContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccessGateScreen() {
  const { state, passAccessGate, passAccessGateAsOwner } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ownerMode, setOwnerMode] = useState(false);
  const [ownerPasscodeInput, setOwnerPasscodeInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setError("Enter a valid email address."); return; }
    if (!handle.trim()) { setError("Pick a display name."); return; }
    if (password !== (state.accessGate?.password || "")) { setError("Incorrect password."); return; }
    passAccessGate(handle, email);
  };

  const handleOwnerSubmit = (e) => {
    e.preventDefault();
    if (!passAccessGateAsOwner(ownerPasscodeInput)) {
      setError("Incorrect owner passcode.");
    }
  };

  if (ownerMode) {
    return (
      <div className="access-gate-screen">
        <form className="access-gate-card" onSubmit={handleOwnerSubmit}>
          <h1 className="access-gate-title">Owner access</h1>
          <p className="access-gate-body">Enter your Owner passcode to get straight in.</p>
          <input
            className="editor-add-form-input"
            type="password"
            placeholder="Owner passcode"
            value={ownerPasscodeInput}
            onChange={(e) => { setOwnerPasscodeInput(e.target.value); setError(""); }}
            autoFocus
          />
          {error && <p className="owner-gate-error">{error}</p>}
          <button type="submit" className="selector-btn selector-btn--active">Continue</button>
          <button type="button" className="access-gate-owner-toggle" onClick={() => { setOwnerMode(false); setError(""); }}>
            Back to guest access
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="access-gate-screen">
      <form className="access-gate-card" onSubmit={handleSubmit}>
        <h1 className="access-gate-title">{state.brand?.pageTitle || "This registry is private"}</h1>
        <p className="access-gate-body">Enter your details and the registry password to continue.</p>
        <input
          className="editor-add-form-input"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />
        <input
          className="editor-add-form-input"
          type="text"
          placeholder="Display name (shown if you reserve items)"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
        />
        <input
          className="editor-add-form-input"
          type="password"
          placeholder="Registry password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="owner-gate-error">{error}</p>}
        <button type="submit" className="selector-btn selector-btn--active">Continue</button>
        <button type="button" className="access-gate-owner-toggle" onClick={() => { setOwnerMode(true); setError(""); }}>
          I'm the registry owner
        </button>
      </form>
    </div>
  );
}
