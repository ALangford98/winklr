import React, { useContext, useRef, useState } from "react";
import { AppContext } from "./appContext";
import { exportConfig, parseConfigFile } from "../utils/configSerializer";
import { encodeConfigToHash } from "../utils/shareableUrl";

export default function ConfigPorter() {
  const { state, loadConfig } = useContext(AppContext);
  const [status, setStatus] = useState(null);
  const inputRef = useRef(null);

  const handleExport = () => {
    exportConfig(state);
    setStatus({ message: "Config exported.", isError: false });
  };

  const handleImport = async (file) => {
    if (!file) return;
    try {
      const config = await parseConfigFile(file);
      loadConfig(config);
      setStatus({ message: "Config imported.", isError: false });
    } catch (err) {
      setStatus({ message: err.message, isError: true });
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleCopyLink = async () => {
    const hash = encodeConfigToHash(state);
    const url  = window.location.origin + window.location.pathname + hash;
    window.history.pushState(null, "", hash);
    try {
      await navigator.clipboard.writeText(url);
      setStatus({ message: "Link copied to clipboard.", isError: false });
    } catch {
      setStatus({ message: "Link updated — copy it from the address bar.", isError: false });
    }
  };

  return (
    <div className="config-porter">
      <div className="selector-options">
        <button className="selector-btn" onClick={handleExport}>Export</button>
        <label className="selector-btn config-import-label">
          Import
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            onChange={(e) => handleImport(e.target.files[0])}
            hidden
          />
        </label>
      </div>
      <button className="selector-btn config-share-btn" onClick={handleCopyLink}>
        Copy link
      </button>
      {status && (
        <p className={`loader-status${status.isError ? " loader-status--error" : ""}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
