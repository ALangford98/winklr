import React, { useContext } from "react";
import { AppContext } from "./appContext";
import { PALETTES } from "../theme/palettes";
import { FONT_OPTIONS, ensureGoogleFontLoaded } from "../theme/fonts";

const CUSTOM_PICKERS = [
  { label: "Page background",   variable: "--bg-app"         },
  { label: "Card background",   variable: "--bg-card"        },
  { label: "Navbar background", variable: "--bg-nav"         },
  { label: "Navbar text",       variable: "--text-on-nav"    },
  { label: "Primary text",      variable: "--text-primary"   },
  { label: "Secondary text",    variable: "--text-secondary" },
  { label: "Outline colour",    variable: "--border-subtle"  },
  { label: "Success colour",    variable: "--accent-success" },
  { label: "Danger colour",     variable: "--accent-danger"  },
];

const FONT_PICKERS = [
  { label: "Body text", variable: "--font-body",    hint: "everything else" },
  { label: "Headings",  variable: "--font-heading", hint: "titles, item names" },
  { label: "Navbar",    variable: "--font-nav",      hint: "brand, links" },
];

export default function ThemePicker() {
  const { state, setTheme, setCustomTheme } = useContext(AppContext);
  const palette = PALETTES[state.theme.palette] ?? PALETTES.dark;
  const customTheme = state.customTheme;
  const isCustomActive = !!customTheme && JSON.stringify(state.theme) === JSON.stringify(customTheme);

  const handlePalette = (key) =>
    setTheme((prev) => ({ ...prev, palette: key, custom: {} }));

  const handlePrimary = (e) => {
    const next = { ...state.theme, primaryColor: e.target.value };
    setTheme(next);
    setCustomTheme(next);
  };

  const handleCustomVar = (variable, value) => {
    const next = { ...state.theme, custom: { ...(state.theme.custom || {}), [variable]: value } };
    setTheme(next);
    setCustomTheme(next);
  };

  const getColor = (variable) =>
    state.theme.custom?.[variable] ?? palette[variable] ?? "#000000";

  const getFont = (variable) =>
    state.theme.custom?.[variable] ?? FONT_OPTIONS[0].value;

  const customPalette = customTheme ? (PALETTES[customTheme.palette] ?? PALETTES.dark) : null;

  return (
    <div className="theme-picker">
      <p className="selector-label">Palette</p>
      <div className="palette-swatches">
        {Object.entries(PALETTES).map(([key, p]) => (
          <button
            key={key}
            className="palette-swatch"
            style={{
              background:  p["--bg-card"],
              borderColor: state.theme.palette === key && !isCustomActive
                ? state.theme.primaryColor
                : p["--border-subtle"],
            }}
            onClick={() => handlePalette(key)}
            title={p.name}
          >
            <span className="palette-swatch-accent" style={{ background: p["--accent-primary"] }} />
          </button>
        ))}
        {customTheme && (
          <button
            className="palette-swatch palette-swatch--custom"
            style={{
              background:  customTheme.custom?.["--bg-card"] ?? customPalette["--bg-card"],
              borderColor: isCustomActive ? customTheme.primaryColor : customPalette["--border-subtle"],
            }}
            onClick={() => setTheme(customTheme)}
            title="My custom theme - your saved edits"
          >
            <span className="palette-swatch-accent" style={{ background: customTheme.primaryColor }} />
          </button>
        )}
      </div>
      {customTheme && (
        <p className="theme-custom-hint">
          {isCustomActive ? "Editing your custom theme." : "The dashed swatch is your saved custom theme."}
        </p>
      )}

      <p className="selector-label">Colours</p>
      <div className="custom-colour-grid">
        <div className="custom-colour-row">
          <input
            type="color"
            className="colour-input"
            value={state.theme.primaryColor}
            onChange={handlePrimary}
            title="Accent colour - used for buttons, links and highlights"
          />
          <span className="custom-colour-label">
            Accent colour <span className="custom-colour-hint">(buttons, links)</span>
          </span>
        </div>
        {CUSTOM_PICKERS.map(({ label, variable }) => (
          <div key={variable} className="custom-colour-row">
            <input
              type="color"
              className="colour-input"
              value={getColor(variable)}
              onChange={(e) => handleCustomVar(variable, e.target.value)}
              title={label}
            />
            <span className="custom-colour-label">{label}</span>
          </div>
        ))}
      </div>

      <p className="selector-label">Fonts</p>
      <div className="custom-colour-grid">
        {FONT_PICKERS.map(({ label, variable, hint }) => (
          <div key={variable} className="custom-colour-row">
            <select
              className="font-select"
              value={getFont(variable)}
              onChange={(e) => {
                handleCustomVar(variable, e.target.value);
                ensureGoogleFontLoaded(e.target.value);
              }}
              style={{ fontFamily: getFont(variable) }}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
              ))}
            </select>
            <span className="custom-colour-label">
              {label} <span className="custom-colour-hint">({hint})</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
