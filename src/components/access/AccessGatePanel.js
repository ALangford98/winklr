import React, { useContext, useState } from "react";
import { AppContext, generateAccessPassword } from "../appContext";

export default function AccessGatePanel() {
  const { state, setAccessGate } = useContext(AppContext);
  const gate = state.accessGate || { enabled: false, password: "" };
  const [show, setShow] = useState(false);

  const update = (changes) => setAccessGate((prev) => ({ ...prev, ...changes }));

  return (
    <div className="access-gate-panel">
      <label className="category-config-toggle">
        <input
          type="checkbox"
          checked={!!gate.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
        />
        <span>Require a password to view this registry</span>
      </label>
      <p className="decals-hint">
        Anyone with the link enters their email, picks a display name, and enters this
        password before they can see the registry. Share the password separately from the
        link (text message, invite card) - not in the same message as the link itself.
      </p>
      <p className="decals-hint access-gate-caveat">
        This keeps the link limited to people you've actually invited and cuts down on
        spam from strangers who stumble on it. It is <strong>not</strong> real security and
        does not protect against denial-of-service attacks - it's a client-side check
        anyone technical could bypass. Only works on the exported website, not the
        in-app "Copy link" share (see the report for why).
      </p>

      <div className="access-gate-password-row">
        <input
          className="editor-add-form-input"
          type={show ? "text" : "password"}
          placeholder="Registry password"
          value={gate.password}
          onChange={(e) => update({ password: e.target.value })}
          autoComplete="off"
        />
        <button type="button" className="selector-btn" onClick={() => setShow((s) => !s)}>
          {show ? "Hide" : "Show"}
        </button>
        <button type="button" className="selector-btn" onClick={() => update({ password: generateAccessPassword() })}>
          Generate
        </button>
      </div>
    </div>
  );
}
