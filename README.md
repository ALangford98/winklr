# Winklr

A React app for building and deploying repeating display tiles for a stock list, using a small number of predefined layout configurations.

## The Idea

Pick a layout, point it at your stock list, and Winklr renders a tile per item using one of a handful of predefined tile configs. Switch between **Edit Mode** (configure tiles, layouts, and data sources) and **View Mode** (display only, for showing the result).

Designed for quick setup: you shouldn't have to design your own grid system to display a list of products, tickers, or any other repeating record. Choose a config, plug in your list, done.

## Core Concepts

- **Stock list** — the underlying data source (a list of items the user wants to display).
- **Tile** — a single repeating unit that renders one item from the stock list.
- **Layout config** — a predefined way of arranging tiles on the page (grid, row, carousel, etc.).
- **Widget** — a configurable element that lives in the navbar/header (link, search bar, dropdown, etc.).
- **View Mode / Edit Mode** — toggle between configuring the page and displaying it.

## Predefined Layout Configs

- **Grid** — uniform tiles arranged in rows and columns.
- **Strip** — single horizontal scrolling row.
- **Stacked List** — vertical list, one tile per row, full width.
- **Featured + Grid** — one large tile on top, smaller tiles below.

## Tech Stack

- React 18
- React Router 6
- Create React App
- Context API for app state
- SheetJS (`xlsx`) for CSV / XLSX parsing
- `@dnd-kit` for drag-and-drop tile reordering
- CSS custom properties for runtime theming

## Project Structure

```
src/
├── App.js                            # Root component, view/edit mode switch
├── components/
│   ├── appContext.js                 # Global state (widgets, viewMode, stockList)
│   ├── ConfigPorter.js               # Export / import / shareable link
│   ├── EmptyState.js                 # Empty state when no stock list is loaded
│   ├── ThemePicker.js                # Palette swatches + accent colour picker
│   ├── navbar/
│   │   ├── Navbar.js                 # Edit-mode navbar with widget slots
│   │   ├── EditableWidget.js         # Slot-aware configurable widget
│   │   ├── NavbarLinks.js
│   │   ├── widgetRegistry.js         # Shared widget options + renderWidget()
│   │   └── functional-components/    # SearchBar, DropdownMenu, etc.
│   ├── stock/
│   │   ├── StockListLoader.js        # File upload UI (JSON / CSV / XLSX)
│   │   └── StockListEditor.js        # Add / remove / reorder items in edit mode
│   ├── layout/
│   │   ├── Layout.js                 # Arranges tiles with optional DnD context
│   │   └── LayoutSelector.js         # Edit-mode layout picker
│   ├── tiles/
│   │   ├── Tile.js                   # Renders one stock item (Compact / Standard / Detailed)
│   │   ├── SortableTile.js           # Tile wrapped with useSortable for drag-and-drop
│   │   └── TileConfigSelector.js     # Edit-mode tile style picker
│   └── view-mode/
│       └── NavbarView.js             # View-mode navbar
├── hooks/
│   └── useLocalStorage.js            # useState wrapper that syncs to localStorage
├── models/
│   └── stockItem.js                  # Stock item shape + factory function
├── pages/
│   └── Home.js                       # Main page
├── styles/
│   ├── home.css
│   ├── layouts.css
│   ├── navbar.css
│   └── tiles.css
├── theme/
│   └── palettes.js                   # 4 palettes (Dark, Light, Midnight, Dusk) + hexToRgba
└── utils/
    ├── configSerializer.js           # Export / import config as JSON
    ├── parseStockFile.js             # Parses JSON / CSV / XLSX into stock items
    └── shareableUrl.js               # Base64 URL hash encode / decode
```

## Getting Started

```bash
npm install
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

Other scripts: `npm test`, `npm run build`.

---

## TODO

### Functionality
- [x] Shopping cart — add/remove items, quantity management, cart sidebar or modal
- [ ] Help popup / onboarding guide for first-time users
- [ ] Search bar — live tile filtering by name and metadata fields
- [ ] Custom tile config builder — define field layout, font sizes, visible fields beyond the three presets
- [ ] Mapbox API integration — delivery address autocomplete and validation at checkout
- [ ] Payment method API integration — Stripe or similar for processing orders

### Deployment pipeline
- [ ] Static export — bundle the configured store as a self-contained deployable package (no API connections required)
- [ ] Guided self-deployment — export + step-by-step hosting instructions (Netlify, Vercel, etc.)
- [ ] Managed deployment subscription tier — automated hosting on Winklr infrastructure for users who don't want to self-host
- [ ] Version 1.0.0 milestone: full end-to-end deployment pipeline (static export + managed option) live

### Polish
- [ ] Basic tests for `AppContext` reducers and the `Tile` / `Layout` components

---

## Changelog

### [0.1.1] — 2026-05-03
- Shopping cart: add/remove items from any tile variant, with quantity controls and subtotal in the drawer
- Cart state persisted to localStorage (`winklr_cart`)
- `CartDrawer` slide-in panel with item list, +/− qty controls, per-item remove, and clear cart
- Cart FAB button (bottom-right) with live item-count badge
- "Add to cart" button on all three tile variants (circular `+` on compact, full-width on standard/detailed)

### [0.1.0] — 2026-05-03
- Drag-and-drop tile reordering in edit mode using `@dnd-kit/core` and `@dnd-kit/sortable`
- `SortableTile` wrapper component with `DragOverlay` floating preview
- DnD disabled in view mode — plain tiles render unchanged

### [0.0.13] — 2026-05-02
- Shareable URL: encodes full config as a base64 URL hash (`#winklr=...`)
- Unicode-safe encoding via `TextEncoder` + `btoa`
- Config decoded and applied on mount, then hash cleared from the address bar

### [0.0.12] — 2026-05-02
- Export config as a downloadable `winklr-config.json`
- Import config from JSON file with loose field validation
- `ConfigPorter` component with Export, Import, and Copy Link controls

### [0.0.11] — 2026-05-02
- Full CSS custom property theme system — all hardcoded hex values replaced with semantic variables
- 4 predefined palettes: Dark, Light, Midnight, Dusk
- Custom accent colour picker with live `--accent-subtle` computed from the chosen hex
- `ThemePicker` component with palette swatches and `<input type="color">`

### [0.0.10] — 2026-05-02
- Winklr branding: SVG favicon, updated `<title>`, and `manifest.json`
- Empty state component with context-aware heading and body text (edit vs. view mode)

### [0.0.9] — 2026-05-02
- View mode hides all editing UI
- `NavbarView` mirrors the navbar widget config from edit mode
- Responsive breakpoints for all layout variants (860 px and 600 px)

### [0.0.8] — 2026-05-02
- Slot-based widget system redesigned as a keyed object (`{ left, centerLeft, center, centerRight, right }`)
- Widget config now persists across page refreshes
- `StockListEditor` — add, remove, and reorder items with ↑/↓ controls
- `widgetRegistry` shared `renderWidget()` used by both edit and view mode navbars

### [0.0.7] — 2026-05-02
- Collapsed two `<Router>` instances into a single top-level router
- Single-page architecture confirmed — no additional routes needed

### [0.0.6] — 2026-05-02
- `Layout` component with four variants: Grid, Strip, Stacked List, Featured + Grid
- `LayoutSelector` edit-mode picker
- Layout and tile config stored in `AppContext` and synced to `localStorage`

### [0.0.5] — 2026-05-02
- `Tile` component with three variants: Compact (row, 220×60 px), Standard (column, 180 px), Detailed (column, 260 px with metadata)
- `TileConfigSelector` edit-mode picker

### [0.0.4] — 2026-05-02
- `useLocalStorage` hook wraps `useState` and keeps all app state in sync with `localStorage`
- Config survives full page refreshes

### [0.0.3] — 2026-05-02
- `StockListLoader` file-upload UI supporting JSON, CSV, and XLSX
- `parseStockFile` utility with auto-detection of wrapper objects (`{ items: [...] }`)
- `stockItem` model with factory function (`id`, `name`, `image`, `price`, `metadata`)
- Stock list state added to `AppContext`

### [0.0.2] — 2023-12-06
- View mode / edit mode context switching wired up in `AppContext`
- Project scope and TODO defined in README

### [0.0.1] — 2023-12-04
- Initial commit: Create React App scaffold
- Editable navbar with configurable widget slots
- Edit / view mode toggle
