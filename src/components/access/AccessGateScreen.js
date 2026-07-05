import React, { useContext, useState } from "react";
import { AppContext } from "../appContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccessGateScreen() {
  const { state, passAccessGate } = useContext(AppContext);
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) { setError("Enter a valid email address."); return; }
    if (!handle.trim()) { setError("Pick a display name."); return; }
    if (password !== (state.accessGate?.password || "")) { setError("Incorrect password."); return; }
    passAccessGate(handle);
  };

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
      </form>
    </div>
  );
}
