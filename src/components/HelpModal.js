import React, { useContext, useEffect } from "react";
import { AppContext } from "./appContext";

const SECTIONS = [
  {
    title: "Edit Mode vs View Mode",
    body: "Use the button at the bottom-right to switch modes. Edit Mode shows the configuration panel on the left, use it to set up your store. View Mode hides all editing UI and shows only the finished storefront.",
  },
  {
    title: "Loading your stock list",
    body: "In Edit Mode, drag a file onto the drop zone or click to browse. Supported formats: JSON (array or { items: [...] }), CSV, and XLSX. You can also paste a plain text list (one item per line, with an optional \" - details\" after each name), or add, remove, and reorder items manually using the list below the drop zone.",
  },
  {
    title: "Tiles",
    body: "A tile renders one item from your stock list. Pick from three presets: Compact (small row, good for long lists), Standard (card with image), or Detailed (larger card with metadata fields).",
  },
  {
    title: "Layouts",
    body: "Layouts control how tiles are arranged. Grid fills the page in rows and columns. Strip is a single horizontal scrolling row. Stacked puts one tile per row. Featured places one large tile at the top with a grid below.",
  },
  {
    title: "Drag to reorder",
    body: "In Edit Mode, drag any tile to reorder it. The new order is saved automatically and persists on refresh.",
  },
  {
    title: "Theme",
    body: "Choose from four colour palettes (Dark, Light, Midnight, Dusk) and pick a custom accent colour with the colour picker. Your theme is saved and applied instantly.",
  },
  {
    title: "Shopping cart",
    body: "Each tile has an Add to Cart button. Click the Cart button at the bottom-right to review cart contents, adjust quantities, or clear the cart. Cart state persists across page refreshes.",
    hideFor: "registry",
  },
  {
    title: "Reserving items",
    body: "Click Reserve on an item to claim it (or part of it) so other guests know it's taken. Reservations update live for everyone viewing the page, but if two guests reserve the very last one at almost the same moment, check with each other directly to sort out who brings it.",
    onlyFor: "registry",
  },
  {
    title: "Navbar widgets",
    body: "In Edit Mode, click any + slot in the navbar to add a widget: links, a search bar, a dropdown, or a text label. Saved widgets appear in View Mode automatically.",
  },
  {
    title: "Export, Import & Share",
    body: "Use the Config panel in Edit Mode to export your full configuration as a JSON file, import a previously saved one, or copy a shareable link that encodes everything in the URL.",
  },
];

export default function HelpModal({ open, onClose }) {
  const { state } = useContext(AppContext);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sections = SECTIONS.filter((s) => {
    if (s.onlyFor) return s.onlyFor === state.websiteType;
    if (s.hideFor) return s.hideFor !== state.websiteType;
    return true;
  });

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="help-modal" role="dialog" aria-modal="true" aria-label="Help">
        <div className="help-modal-header">
          <span className="help-modal-title">How Winklr works</span>
          <button className="help-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="help-modal-body">
          {sections.map((s) => (
            <div key={s.title} className="help-section">
              <p className="help-section-title">{s.title}</p>
              <p className="help-section-body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
