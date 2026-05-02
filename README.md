# Winklr

A simple React app for creating repeating display tiles for a stock list, using a small number of predefined layout configurations.

## The Idea

Pick a layout, point it at your stock list, and Winklr renders a tile per item using one of a handful of predefined tile configs. Switch between **Edit Mode** (configure tiles, layouts, and data sources) and **View Mode** (display only, for showing the result).

Designed for quick setup: you shouldn't have to design your own grid system to display a list of products, tickers, or any other repeating record. Choose a config, plug in your list, done.

## Core Concepts

- **Stock list** — the underlying data source (a list of items the user wants to display).
- **Tile** — a single repeating unit that renders one item from the stock list.
- **Layout config** — a predefined way of arranging tiles on the page (grid, row, carousel, etc.).
- **Widget** — a configurable element that lives in the navbar/header (link, search bar, dropdown, etc.).
- **View Mode / Edit Mode** — toggle between configuring the page and displaying it.

## Predefined Layout Configs (planned)

- **Grid** — uniform tiles arranged in rows and columns.
- **Strip** — single horizontal scrolling row.
- **Stacked List** — vertical list, one tile per row, full width.
- **Featured + Grid** — one large tile on top, smaller tiles below.
- **Compact Cards** — dense card layout for high item counts.

## Tech Stack

- React 18
- React Router 6
- Create React App
- Context API for app state
- SheetJS (`xlsx`) for CSV / XLSX parsing

## Project Structure

```
src/
├── App.js                            # Root component, view/edit mode switch
├── components/
│   ├── appContext.js                 # Global state (widgets, viewMode, stockList)
│   ├── navbar/
│   │   ├── Navbar.js                 # Edit-mode navbar with widget slots
│   │   ├── EditableWidget.js         # Configurable widget slot
│   │   ├── NavbarLinks.js
│   │   └── functional-components/    # SearchBar, DropdownMenu, etc.
│   ├── stock/
│   │   └── StockListLoader.js        # File upload UI (JSON / CSV / XLSX)
│   ├── tiles/
│   │   ├── Tile.js                   # Renders one stock item (Compact / Standard / Detailed)
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
│   ├── navbar.css
│   └── tiles.css
└── utils/
    └── parseStockFile.js             # Parses JSON / CSV / XLSX into stock items
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

### Foundations
- [x] Define the stock list data model (id, name, image, price, metadata, etc.)
- [x] Add stock list state to `AppContext` (currently only tracks widgets and view mode)
- [x] Decide on stock list data source: JSON file upload or CSV / XLSX
- [x] Add persistence so config survives a page refresh (localStorage)

### Tiles
- [x] Create a `Tile` component that renders one stock list item
- [x] Build 2–3 predefined tile configs (Compact, Standard, Detailed)
- [x] Tile selector UI in edit mode
- [x] Style each tile config in `styles/`

### Layouts
- [ ] Create a `Layout` component that takes a config + stock list and renders the tiles
- [ ] Implement Grid layout
- [ ] Implement Strip (horizontal row) layout
- [ ] Implement Stacked List layout
- [ ] Implement Featured + Grid layout
- [ ] Layout selector UI in edit mode

### Pages / Routing
- [ ] Flesh out `Home.js` to host the layout + tiles
- [ ] Decide whether multiple pages/views are needed, or just one display

### Edit Mode UX
- [ ] Wire up the existing `EditableWidget` slots end-to-end
- [ ] Form for adding/removing/reordering stock list items
- [ ] Visual preview of layout/tile choices before applying
- [ ] Fix `addWidget` placeholder in `App.js` (currently passes empty object)

### View Mode UX
- [ ] Hide all editing UI in view mode
- [ ] Make sure `NavbarView` mirrors the navbar config from edit mode
- [ ] Responsive behavior for each layout

### Polish
- [ ] Replace CRA boilerplate favicon and manifest with Winklr branding
- [ ] Light/dark theme toggle
- [ ] Empty state when no stock list is loaded
- [ ] Basic tests for `AppContext` reducers and the `Tile` / `Layout` components

### Stretch
- [ ] Export/import config as JSON
- [ ] Shareable URL that encodes the config
- [ ] Drag-and-drop tile reordering
- [ ] Custom tile config builder (beyond the predefined ones)
