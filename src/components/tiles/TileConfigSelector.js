import React, { useContext } from "react";
import { AppContext } from "../appContext";

const OPTIONS = [
  { value: "compact",  label: "Compact"  },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
];

export default function TileConfigSelector() {
  const { state, setTileConfig } = useContext(AppContext);

  return (
    <div className="tile-config-selector">
      <p className="selector-label">Tile Style</p>
      <div className="selector-options">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            className={`selector-btn${state.tileConfig === value ? " selector-btn--active" : ""}`}
            onClick={() => setTileConfig(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
