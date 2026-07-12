import React, { useContext, useRef, useState } from "react";
import { AppContext } from "../appContext";
import { parseStockFile, parsePastedList } from "../../utils/parseStockFile";

export default function StockListLoader() {
  const { state, setStockList } = useContext(AppContext);
  const [status, setStatus] = useState(null); // { message, isError }
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    // The drop zone stays active even after a list is loaded (so you can
    // drag a replacement file onto it) - confirm first so an accidental
    // drop can't silently wipe out a hand-built list.
    if (state.stockList.length > 0) {
      const ok = window.confirm(
        `This will replace your current ${state.stockList.length} item${state.stockList.length !== 1 ? "s" : ""} with the contents of "${file.name}". Continue?`
      );
      if (!ok) return;
    }
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

  const pendingPasteItems = pasteOpen ? parsePastedList(pasteText) : [];

  const handlePasteAdd = () => {
    if (!pendingPasteItems.length) return;
    // Appends rather than replaces - pasting a list is "add these to my
    // registry", unlike a file import which is "this file IS my registry".
    setStockList((prev) => [...prev, ...pendingPasteItems]);
    setStatus({
      message: `${pendingPasteItems.length} item${pendingPasteItems.length !== 1 ? "s" : ""} added from pasted list`,
      isError: false,
    });
    setPasteText("");
    setPasteOpen(false);
  };

  const hasItems = state.stockList.length > 0;

  return (
    <div
      className="stock-list-loader"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
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

      {!pasteOpen ? (
        <button
          type="button"
          className="loader-paste-toggle"
          onClick={() => setPasteOpen(true)}
        >
          …or paste a list of items
        </button>
      ) : (
        <div className="loader-paste-area">
          <textarea
            className="loader-paste-textarea"
            placeholder={"One item per line, with an optional dash for details, e.g.\nNappies - Huggies extra care\nPolaroid camera\nSwaddles - large, cotton muslin"}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={8}
            autoFocus
          />
          <p className="loader-hint">
            Each line becomes an item; anything after a " - " goes into its Details field.
            Items are added to your existing list, and you can edit or remove them below afterwards.
          </p>
          <div className="selector-options">
            <button
              type="button"
              className="selector-btn selector-btn--active"
              onClick={handlePasteAdd}
              disabled={!pendingPasteItems.length}
            >
              Add {pendingPasteItems.length || ""} item{pendingPasteItems.length !== 1 ? "s" : ""}
            </button>
            <button
              type="button"
              className="selector-btn"
              onClick={() => { setPasteOpen(false); setPasteText(""); }}
            >
              Cancel
            </button>
          </div>
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
