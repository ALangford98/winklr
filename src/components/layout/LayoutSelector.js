import React, { useContext } from "react";
import { AppContext } from "../appContext";

const OPTIONS = [
  { value: "grid",     label: "Grid"     },
  { value: "strip",    label: "Strip"    },
  { value: "stacked",  label: "Stacked"  },
  { value: "featured", label: "Featured" },
];

export default function LayoutSelector() {
  const { state, setLayoutConfig } = useContext(AppContext);

  return (
    <div className="layout-selector">
      <div className="selector-options">
        {OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            className={`selector-btn${state.layoutConfig === value ? " selector-btn--active" : ""}`}
            onClick={() => setLayoutConfig(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
