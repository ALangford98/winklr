import React, { useContext } from "react";
import { AppContext } from "./appContext";
import { PALETTES } from "../theme/palettes";

const CUSTOM_PICKERS = [
  { label: "Page background",   variable: "--bg-app"         },
  { label: "Card background",   variable: "--bg-card"        },
  { label: "Navbar background", variable: "--bg-nav"         },
  { label: "Navbar text",       variable: "--text-on-nav"    },
  { label: "Primary text",      variable: "--text-primary"   },
  { label: "Secondary text",    variable: "--text-secondary" },
  { label: "Success colour",    variable: "--accent-success" },
  { label: "Danger colour",     variable: "--accent-danger"  },
];

export default function ThemePicker() {
  const { state, setTheme, setThemeCustom } = useContext(AppContext);
  const palette = PALETTES[state.theme.palette] ?? PALETTES.dark;

  const handlePalette = (key) =>
    setTheme((prev) => ({ ...prev, palette: key, custom: {} }));

  const handlePrimary = (e) =>
    setTheme((prev) => ({ ...prev, primaryColor: e.target.value }));

  const getColor = (variable) =>
    state.theme.custom?.[variable] ?? palette[variable] ?? "#000000";

  return (
    <div className="theme-picker">
      <p className="selector-label">Theme</p>
      <div className="palette-swatches">
        {Object.entries(PALETTES).map(([key, p]) => (
          <button
            key={key}
            className="palette-swatch"
            style={{
              background:  p["--bg-card"],
              borderColor: state.theme.palette === key
                ? state.theme.primaryColor
                : p["--border-subtle"],
            }}
            onClick={() => handlePalette(key)}
            title={p.name}
          >
            <span className="palette-swatch-accent" style={{ background: p["--accent-primary"] }} />
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

      <p className="selector-label">Customise</p>
      <div className="custom-colour-grid">
        {CUSTOM_PICKERS.map(({ label, variable }) => (
          <div key={variable} className="custom-colour-row">
            <input
              type="color"
              className="colour-input"
              value={getColor(variable)}
              onChange={(e) => setThemeCustom(variable, e.target.value)}
              title={label}
            />
            <span className="custom-colour-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
