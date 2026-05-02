import React, { useContext, useRef, useState } from "react";
import { AppContext } from "../appContext";
import { parseStockFile } from "../../utils/parseStockFile";

export default function StockListLoader() {
  const { state, setStockList } = useContext(AppContext);
  const [status, setStatus] = useState(null); // { message, isError }
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    try {
      const items = await parseStockFile(file);
      setStockList(items);
      setStatus({ message: `${items.length} item${items.length !== 1 ? "s" : ""} loaded from ${file.name}`, isError: false });
    } catch (err) {
      setStatus({ message: err.message, isError: true });
    }
  };

  const handleChange = (e) => handleFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleClear = () => {
    setStockList([]);
    setStatus(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const hasItems = state.stockList.length > 0;

  return (
    <div
      className="stock-list-loader"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <p className="loader-label">Stock List</p>

      {!hasItems ? (
        <label className="loader-drop-zone">
          <input
            ref={inputRef}
            type="file"
            accept=".json,.csv,.xlsx,.xls"
            onChange={handleChange}
            hidden
          />
          <span>Drop a file here or <u>browse</u></span>
          <span className="loader-hint">.json · .csv · .xlsx</span>
        </label>
      ) : (
        <div className="loader-loaded">
          <span>{state.stockList.length} items loaded</span>
          <button className="loader-clear" onClick={handleClear}>Clear</button>
        </div>
      )}

      {status && (
        <p className={`loader-status ${status.isError ? "loader-status--error" : ""}`}>
          {status.message}
        </p>
      )}
    </div>
  );
}
