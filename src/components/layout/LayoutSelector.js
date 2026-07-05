import React, { useContext, useState } from "react";
import { AppContext } from "../appContext";

const OPTIONS = [
  { value: "grid",     label: "Grid"     },
  { value: "strip",    label: "Strip"    },
  { value: "stacked",  label: "Stacked"  },
  { value: "featured", label: "Featured" },
];

const ALIGN_OPTIONS = [
  { value: "left",   label: "Left"   },
  { value: "center", label: "Center" },
  { value: "right",  label: "Right"  },
];

export default function LayoutSelector() {
  const { state, setLayoutConfig, setLayoutAlign, setSearchAlign, addSection } = useContext(AppContext);
  const [newSection, setNewSection] = useState("");

  const handleAddSection = () => {
    if (!newSection.trim()) return;
    addSection(newSection);
    setNewSection("");
  };

  return (
    <div className="layout-selector">
      <p className="selector-label">Layout</p>
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

      <p className="selector-label">Item alignment</p>
      <div className="selector-options">
        {ALIGN_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            className={`selector-btn${(state.layoutAlign || "center") === value ? " selector-btn--active" : ""}`}
            onClick={() => setLayoutAlign(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="selector-label">Search bar alignment</p>
      <div className="selector-options">
        {ALIGN_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            className={`selector-btn${(state.searchAlign || "center") === value ? " selector-btn--active" : ""}`}
            onClick={() => setSearchAlign(value)}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="selector-label">Sections</p>
      <div className="layout-section-add">
        <input
          className="editor-add-form-input"
          type="text"
          placeholder="New section name"
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSection(); } }}
        />
        <button
          type="button"
          className="layout-section-add-btn"
          onClick={handleAddSection}
          disabled={!newSection.trim()}
          title="Add section"
        >
          +
        </button>
      </div>
      <p className="layout-section-hint">
        Creates a named section you can assign items to (as a category tag in the Items panel) and reorder here.
      </p>
    </div>
  );
}
