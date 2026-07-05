// Curated font choices. System stacks need no network request; the rest are
// Google Fonts loaded on demand via a <link> tag (both in the live app and
// baked into exported store.html files).
export const FONT_OPTIONS = [
  { label: "System default",  value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif" },
  { label: "Classic serif",   value: "Georgia, 'Times New Roman', serif" },
  { label: "Monospace",       value: "'Courier New', Consolas, monospace" },
  { label: "Playfair Display (serif)", value: "'Playfair Display', Georgia, serif", google: "Playfair+Display:wght@400;600;700" },
  { label: "Poppins (rounded sans)",   value: "'Poppins', -apple-system, sans-serif", google: "Poppins:wght@400;500;600;700" },
  { label: "Merriweather (soft serif)", value: "'Merriweather', Georgia, serif", google: "Merriweather:wght@400;700" },
];

const loadedFonts = new Set();

// Injects a Google Fonts stylesheet <link> if the given font-family value
// corresponds to one of the Google-backed FONT_OPTIONS. No-ops for system
// stacks and repeat calls for the same font.
export function ensureGoogleFontLoaded(fontValue) {
  if (typeof document === "undefined" || !fontValue) return;
  const opt = FONT_OPTIONS.find((f) => f.value === fontValue);
  if (!opt?.google || loadedFonts.has(opt.google)) return;
  loadedFonts.add(opt.google);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${opt.google}&display=swap`;
  document.head.appendChild(link);
}

export function googleFontFamilyFor(fontValue) {
  return FONT_OPTIONS.find((f) => f.value === fontValue)?.google || null;
}
