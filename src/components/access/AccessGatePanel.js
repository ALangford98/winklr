import React, { useContext, useState } from "react";
import { AppContext, generateAccessPassword } from "../appContext";

export default function AccessGatePanel() {
  const { state, setAccessGate, setGatePassed } = useContext(AppContext);
  const gate = state.accessGate || { enabled: false, password: "" };
  const ownerPasscode = state.integrations?.ownerPasscode || "";
  const [show, setShow] = useState(false);

  const update = (changes) => setAccessGate((prev) => ({ ...prev, ...changes }));

  const handleToggle = (checked) => {
    update({ enabled: checked });
    // Whoever is sitting in this panel flipping the switch is - by definition -
    // already past the point of needing to be gated. Without this, ticking the
    // box immediately boots the person turning it on to the gate screen too.
    if (checked) setGatePassed(true);
  };

  const isActive = gate.enabled && gate.password.trim();

  return (
    <div className="access-gate-panel">
      <label className="category-config-toggle">
        <input
          type="checkbox"
          checked={!!gate.enabled}
          onChange={(e) => handleToggle(e.target.checked)}
        />
        <span>Require a password to view this registry</span>
      </label>
      <p className="decals-hint">
        Anyone with the link enters their email, picks a display name, and enters this
        password before they can see the registry. Share the password separately from the
        link (text message, invite card) - not in the same message as the link itself.
      </p>
      {gate.enabled && !gate.password.trim() && (
        <p className="decals-hint access-gate-warn">
          Not active yet - set a password below. Until then this switch has no effect.
        </p>
      )}
      <p className="decals-hint access-gate-caveat">
        This keeps the link limited to people you've actually invited and cuts down on
        spam from strangers who stumble on it. It is <strong>not</strong> real security and
        does not protect against denial-of-service attacks - it's a client-side check
        anyone technical could bypass. Only works on the exported website, not the
        in-app "Copy link" share (see the report for why). The exported site carries only
        a scrambled fingerprint (SHA-256 hash) of this password - never the password itself.
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

      {isActive && (
        ownerPasscode ? (
          <p className="decals-hint access-gate-recovery">
            If you ever forget this password or land on a fresh browser, you can always get
            back in with your <strong>Owner passcode</strong> instead (there's a link for it
            on the gate screen).
          </p>
        ) : (
          <p className="decals-hint access-gate-warn">
            You haven't set an Owner passcode (Integrations panel). Without one, if you forget
            this password or lose access on a new device, there's no way back in. Set one as
            a safety net before you rely on this gate.
          </p>
        )
      )}
    </div>
  );
}
