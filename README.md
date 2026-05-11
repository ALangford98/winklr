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

### Navbar widget rework
- [x] Convert "Help" and "Cart" link widgets from dead routes to action triggers (Help → opens help modal, Cart → opens cart drawer)
- [x] When a Cart or Help widget is present in any navbar slot, suppress the corresponding FAB button — the navbar widget is the canonical entry point
- [x] Remove the "Home" link option (redundant in a single-page app) or replace it with a configurable external URL field
- [x] When the Search Bar widget is present in any navbar slot, hide the store search bar above the tile grid
- [x] Review the Dropdown widget — options are now chosen from available link actions (Help, Cart) and item categories; selecting an option triggers the action or filters by category

### Website types / Templates
- [x] `websiteType` field in app state (persisted to localStorage, included in JSON export/import and shareable URL)
- [x] Website type selector in the edit panel — choosing a type applies that type's default config (widgets, FABs, tile action label)
- [ ] "Reset to defaults for this type" button — re-applies the selected type's full default config on demand
- [x] Website type carried through to the static export so exported behaviour matches the selected type

#### Online Store *(default — existing behaviour)*
- Default FABs: Cart, Help
- Default tile action: "Add to cart"
- Default panels visible: all

#### Portfolio
- [ ] Default FABs: Contact (opens contact popup), Help; cart and checkout suppressed by default
- [ ] Default tile action: "View" button — links to an optional `url` field on each stock item
- [ ] Contact popup — name, email, message fields; no backend; submits via `mailto:` fallback or shows a thank-you state; exportable to the static file
- [ ] Item model extension: optional `url` field for external project / case-study links (visible in `StockListEditor` and rendered on tiles)
- [ ] Static export: Contact popup with `mailto:` submission

#### Registry
- [x] Default FABs: Help, Share (copies shareable URL); cart and checkout suppressed by default
- [x] Default tile action: "Reserve" — marks an item as reserved; reserved items show a green filled button
- [x] Reservation state persisted to `localStorage` in the static export; syncs live via Firebase when configured
- [x] Share registry: Share FAB copies the registry URL with full config encoded in the hash
- [ ] "Mark as purchased" action in edit mode — registry owner can permanently mark items fulfilled (removes from public reservation pool)
- [x] Optional quantity per item — set how many are needed (0 = unlimited); tile shows "X of Y reserved" with +/− stepper; fully reserved items show a locked "Fully Reserved ✓" state
- [ ] RSVP / message popup — name + message field (same Contact component as Portfolio, re-used)

### Functionality
- [x] Shopping cart — add/remove items, quantity management, cart sidebar or modal
- [x] Help popup / onboarding guide for first-time users
- [x] Search bar — live tile filtering by name and metadata fields
- [ ] Custom tile config builder — define field layout, font sizes, visible fields beyond the three presets

### Integrations
- [x] Integrations panel in the edit UI — fields for each supported client-side credential (Stripe publishable key, Mapbox access token)
- [x] Clear labelling distinguishing public keys (safe to export) from secret keys (managed tier only)
- [x] In-editor warning if a user pastes what looks like a secret key (starts with `sk_`)
- [x] Integration status indicators — show connected / not configured per service
- [x] Firebase Realtime Database URL — live shared reservation state synced across all visitors via SSE; setup note with required security rules shown inline; embedded in static export; falls back to `localStorage` when not configured

### Checkout
- [x] Checkout modal — triggered from the "Checkout" button in the cart drawer; overlays the page (not a new route)
- [x] Multi-step flow: (1) Contact details → (2) Delivery address → (3) Payment → (4) Confirmation
- [x] Step indicator showing current and completed steps; allow navigating back to earlier steps
- [x] Contact step — name, email, phone fields with basic required-field validation
- [x] Delivery step — address fields (line 1, line 2, city, postcode, country); Mapbox autocomplete hooks in here
- [x] Payment step — card fields; Stripe Elements hooks in here
- [x] Order summary sidebar (or collapsible panel on mobile) — visible across all steps: itemised cart, subtotal, shipping line, total
- [x] Shipping cost calculation placeholder — free shipping over $50, $5 flat rate otherwise
- [x] Confirmation step — order reference number (client-generated), summary of items and delivery address, "Continue shopping" CTA
- [x] Persist in-progress checkout form state to React state (not localStorage) so a page refresh resets it
- [ ] Accessible focus management — trap focus inside the modal, return focus to the trigger on close

### Stripe
- [ ] Wire Stripe publishable key from integrations state into the checkout payment step
- [ ] Load Stripe.js lazily when the payment step mounts — only if a publishable key is configured
- [ ] Render `CardElement` (or individual `CardNumberElement` / `CardExpiryElement` / `CardCvcElement`) in the payment step
- [ ] Tokenise on submit via `stripe.confirmCardPayment` or `stripe.createToken` — no server-side charge in the editor
- [ ] Disable the Pay button until the card Element reports complete
- [ ] Surface Stripe field errors inline below the card input
- [ ] On success: advance to the Confirmation step and clear the cart
- [ ] Static export: embed Stripe publishable key and Stripe.js script tag; wire up Elements in the exported storefront

### Mapbox
- [ ] Wire Mapbox access token from integrations state into the checkout flow
- [ ] Add delivery address field to checkout — autocomplete via Mapbox Geocoding API (`/geocoding/v5/mapbox.places`)
- [ ] Debounced suggestion dropdown as the user types — show formatted place names
- [ ] On suggestion select: populate structured address fields (line 1, city, postcode, country)
- [ ] Basic address validation — require a selection from suggestions rather than free-text entry
- [ ] Static export: embed Mapbox token and `mapbox-gl` / Geocoding API call in the exported storefront

### Deployment pipeline
- [x] Static export — generate a single self-contained HTML file from the current config; embeds theme CSS vars, stock data, and client-side API keys; renders a fully functional read-only storefront with basic cart and search in vanilla JS
- [ ] Static export: Stripe Elements checkout flow (card tokenisation only — no server-side charge)
- [ ] Static export: Mapbox address autocomplete at checkout
- [ ] Guided self-deployment — exported file + one-page hosting instructions (Netlify drag-and-drop, Vercel CLI, GitHub Pages)
- [ ] Managed deployment subscription tier — user provides publishable keys; Winklr hosts the frontend and provides the backend for Stripe charge confirmation, order storage, and email receipts
- [ ] Managed tier: order management dashboard
- [ ] Managed tier: webhook handling for Stripe payment confirmation
- [ ] Version 1.0.0 milestone: both tiers live end-to-end (static export working + at least one managed deployment)

### Branding
- [x] Default Winklr branding assets (mark + wordmark) displayed in navbar and footer
- [x] User logo upload in edit panel — replaces default with any image
- [x] "Powered by Winklr" footer
- [x] Configurable currency prefix (default `$`) — shown on tiles, cart, and checkout
- [ ] Store name / tagline field — displayed in navbar or hero area
- [ ] Favicon swap when custom logo is uploaded

### Mobile
- [x] Edit panel is too wide for mobile — replace the left-side panel with a bottom sheet or slide-in drawer triggered by a FAB
- [x] FAB group reduced to smaller buttons with tighter spacing on small screens
- [x] Navbar widget slots no longer overflow on narrow screens; widget editor dropdowns pinned to right edge
- [x] Cart drawer slides up as a full-width bottom sheet on screens ≤ 768 px
- [x] Brand header scrolls off screen on mobile; sticky navbar locks to top beneath it
- [x] Navbar widgets (search, dropdown) fill their slot width — no more fixed pixel widths
- [x] Edit panel content no longer overflows panel bounds (collapsible sections constrained, integration inputs get `min-width: 0`)
- [ ] Test and fix tile layout responsiveness in all four layout variants on common mobile screen sizes (375px, 390px, 414px)
- [ ] Touch target audit — ensure all interactive elements (tile buttons, cart qty controls, widget editor) meet minimum 44px tap target size
- [ ] Static export: apply updated mobile styles to generated HTML

### Polish
- [ ] Basic tests for `AppContext` reducers and the `Tile` / `Layout` components

---

## Changelog

### [0.2.2] — 2026-05-11

#### Registry
- **Item quantities** — each item now has a `quantity` field (0 = unlimited); set it in the Add/Edit item form with a context-aware placeholder ("Quantity needed" in registry mode)
- Registry tiles replaced the single reserve toggle with a `−` / `Reserve` / `+` stepper: shows "X of Y reserved" when a quantity is set, plain "X reserved" when unlimited
- "Fully Reserved ✓" state locks the tile when the reserved count reaches the target quantity
- Reservation state changed from a flat `string[]` to `{ [itemId]: number }` — Firebase now stores counts; SSE listener updated to parse numbers instead of booleans

### [0.2.1] — 2026-05-09

#### Mobile
- Edit panel is now a **bottom sheet** on screens ≤ 768 px — slides up from the bottom with a backdrop, drag handle, and close button; triggered by a new "Edit" FAB
- Brand header sits above the sticky navbar on mobile; scrolls away naturally, leaving only the navbar locked to the top
- Same mobile brand bar applied to view mode (`NavbarView`)
- All mobile breakpoints unified at 768 px (was 600 px) across navbar, layout, cart, and panel styles
- Navbar widgets (search bar, dropdown) now fill their slot width proportionally — fixed pixel widths removed
- Edit panel `overflow-x: hidden` at all sizes; collapsible section children get `min-width: 0` to prevent content bleed
- Navbar widget editor dropdown no longer clipped on mobile (removed `overflow: hidden` on `.navbar-slots`)

#### Items
- **Category tags** — add comma-separated tags to any item in the editor; displayed as interactive chips with `×` to remove; stored as `item.categories[]`
- Item search now matches against category tags in addition to name and metadata

#### Dropdown widget
- Dropdown options are now chosen from a structured checkbox list in the widget editor — available actions are the configured link widgets (Help, Cart) plus any item category in the current stock list
- Selecting an option triggers the corresponding action (opens Help/Cart) or applies a category filter; resets to placeholder after selection

#### Branding
- **Currency prefix** — configurable in the Branding panel (default `$`, max 4 chars); applied consistently on tiles, cart drawer, and checkout summary

### [0.2.0] — 2026-05-09

#### Website types
- New **Website Type** selector in the edit panel — Online Store and Registry; type is persisted to localStorage, included in JSON config export/import, and carried through to the static export
- Switching types applies default FAB and tile-action behaviour for that type without touching items, theme, or layout

#### Registry mode
- Tile action changes from "Add to cart" to "Reserve / Reserved ✓" in registry mode; reserved items show a green filled button; tapping again unreserves
- Cart FAB and checkout modal suppressed in registry mode; **Share FAB** added — copies the full config-encoded registry URL to the clipboard
- Reservation state persisted to `localStorage` in the editor and in the static export

#### Firebase integration
- **Firebase Realtime Database URL** field added to the Integrations panel — public URL input (not masked), with inline security-rules setup note
- When configured, reservations sync live across all visitors via Server-Sent Events (SSE); the Firebase URL is embedded in the static export
- Falls back to `localStorage`-only when no URL is configured

#### Item management
- **Photo upload** — file picker in the Add item and Edit item forms; images stored as embedded data URLs (no server required); works in both the editor and static export
- **Inline item editing** — new ✎ button on each item row opens an edit form; change name, price, or photo without deleting and re-adding
- **Item thumbnails** — each row in the editor list now shows a small preview image (or initial letter if no image is set)

#### Mobile
- Cart drawer slides up as a full-width bottom sheet on screens ≤ 600 px (matching the checkout modal pattern)
- FAB group uses smaller buttons and tighter spacing on small screens
- Navbar widget slots no longer overflow on narrow screens; widget editor dropdowns pinned to the right edge to stay in viewport

#### Export fixes
- Winklr wordmark SVG now fetched and embedded as a data URL at export time — was falling back to plain "Store" text
- Help navbar widget now renders correctly in the exported HTML
- Help FAB and help modal added to the exported HTML; FAB is suppressed when a Help widget is present in the navbar (matching the React app behaviour)

### [0.1.8] — 2026-05-06
- Fixed the rendering of branding in the exported site

### [0.1.7] — 2026-05-05
- **Export website** button in the Config panel generates a self-contained `store.html` file
- Exported file is fully offline-capable: embeds live theme CSS variables, all tile/layout/cart/checkout styles, and stock data
- Vanilla JS storefront renders all 4 layout variants, all 3 tile variants, search filtering, cart drawer, and the 4-step checkout modal
- Navbar widgets configured in the editor (Cart button, Search, Dropdown) carry over to the exported page
- Custom logo embedded as a data URL if one is uploaded; falls back to "Store" text
- Cart state persists to `localStorage` in the exported page

### [0.1.6] — 2026-05-03
- Checkout modal — 4-step flow (Contact → Delivery → Payment → Confirmation) triggered from the cart drawer
- Step indicator with completed-step checkmarks and animated connecting lines
- Contact step: name, email (required), phone (optional)
- Delivery step: address line 1/2, city, postcode, country select; city + postcode in a two-column row
- Payment step: cardholder name, card number, expiry, CVC; placeholder notice for Stripe integration
- Confirmation step: generated order reference, delivery address summary, items ordered
- Order summary sidebar across all steps: item thumbnails with qty badges, subtotal, shipping, total
- Shipping: free over $50, $5 flat rate otherwise
- "Continue shopping" on confirmation clears the modal and resets form state
- Responsive: slides up as a bottom sheet on mobile with summary scrollable at top

### [0.1.5] — 2026-05-03
- Integrations panel in the edit UI — Stripe publishable key and Mapbox access token fields
- Keys masked by default with a show/hide toggle
- Status badge per service: "Not configured", "Configured", or "⚠ Secret key detected"
- Red warning shown inline if a pasted value looks like a secret key (`sk_` or `sk.` prefix)
- Integration keys stored in `localStorage` (`winklr_integrations`) and included in JSON config export/import
- Keys intentionally excluded from shareable URL encoding (public keys only travel in downloads)
- Added functionality to collapse panel sections

### [0.1.4] — 2026-05-03
- Fixed FAB and Edit Mode button text colour in light mode — all use `--text-on-nav` which is always legible against the navbar background
- Added 4 new colour palettes: Forest, Sunset, Ocean, Rose (8 total)
- Custom colour pickers for all major UI variables (page/card/nav backgrounds, text, success, danger) — selecting a palette resets custom overrides
- Winklr branding assets in navbar (mark icon) and footer (wordmark); user can upload a custom logo in the Branding panel
- "Powered by Winklr" footer at the bottom of the content area

### [0.1.2] — 2026-05-03
- Live search bar above the tile grid — filters by item name and any metadata field
- Navbar search widget now functional — uses the same shared `searchQuery` state
- Clear button appears when query is active; "no results" message when nothing matches
- Help modal: "?" FAB button opens a scrollable overlay covering all nine core concepts; closes on backdrop click or Escape
- "Help" and "Cart" link widgets converted from dead routes to action triggers (open their respective modal/drawer)
- Cart and Help FAB buttons suppressed when the corresponding navbar widget is present
- Store search bar suppressed when a Search Bar navbar widget is present
- "Home" link option removed (redundant in single-page app)
- Dropdown widget now accepts configurable options via comma-separated input in the widget editor
- Saved navbar widgets now render their actual component in edit mode (Cart/Help/Search are functional from the navbar in both modes)

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
