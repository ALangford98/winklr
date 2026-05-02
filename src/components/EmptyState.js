import React, { useContext } from "react";
import { AppContext } from "./appContext";

function TileGridIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2"  y="2"  width="21" height="21" rx="3" stroke="#444c56" strokeWidth="2"/>
      <rect x="29" y="2"  width="21" height="21" rx="3" stroke="#444c56" strokeWidth="2"/>
      <rect x="2"  y="29" width="21" height="21" rx="3" stroke="#444c56" strokeWidth="2"/>
      <rect x="29" y="29" width="21" height="21" rx="3" stroke="#444c56" strokeWidth="2"/>
    </svg>
  );
}

export default function EmptyState() {
  const { state } = useContext(AppContext);
  const isEditMode = state.viewMode;

  return (
    <div className="empty-state">
      <TileGridIcon />
      <p className="empty-state-heading">
        {isEditMode ? "No stock list loaded" : "Nothing to display"}
      </p>
      <p className="empty-state-body">
        {isEditMode
          ? "Upload a .json, .csv, or .xlsx file using the panel on the left."
          : "Switch to Edit Mode to load a stock list."}
      </p>
    </div>
  );
}
