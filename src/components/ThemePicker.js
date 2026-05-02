import React, { useContext } from "react";
import { AppContext } from "./appContext";
import { PALETTES } from "../theme/palettes";

export default function ThemePicker() {
  const { state, setTheme } = useContext(AppContext);

  const handlePalette = (key) => setTheme((prev) => ({ ...prev, palette: key }));
  const handlePrimary = (e)  => setTheme((prev) => ({ ...prev, primaryColor: e.target.value }));

  return (
    <div className="theme-picker">
      <p className="selector-label">Theme</p>
      <div className="palette-swatches">
        {Object.entries(PALETTES).map(([key, palette]) => (
          <button
            key={key}
            className="palette-swatch"
            style={{
              background:  palette["--bg-card"],
              borderColor: state.theme.palette === key
                ? state.theme.primaryColor
                : palette["--border-subtle"],
            }}
            onClick={() => handlePalette(key)}
            title={palette.name}
          >
            <span
              className="palette-swatch-accent"
              style={{ background: palette["--accent-primary"] }}
            />
          </button>
        ))}
      </div>

      <p className="selector-label">Accent colour</p>
      <div className="colour-picker-row">
        <input
          type="color"
          className="colour-input"
          value={state.theme.primaryColor}
          onChange={handlePrimary}
          title="Pick accent colour"
        />
        <span className="colour-hex">{state.theme.primaryColor}</span>
      </div>
    </div>
  );
}
