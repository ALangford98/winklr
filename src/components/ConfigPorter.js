import React, { useContext, useRef, useState } from "react";
import { AppContext } from "./appContext";
import { exportConfig, parseConfigFile } from "../utils/configSerializer";

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

  return (
    <div className="config-porter">
      <p className="selector-label">Config</p>
      <div className="selector-options">
        <button className="selector-btn" onClick={handleExport}>
          Export
        </button>
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
      {status && (
        <p className={`loader-status${status.isError ? " loader-status--error" : ""}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
