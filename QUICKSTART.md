# Quickstart for developers

Get Winklr running locally, understand the moving parts, and ship a change.

## Prerequisites

- Node.js 18+ and npm (Create React App / `react-scripts` 5)
- No backend, no database, no accounts required to run it locally

## Install & run

```bash
npm install
npm start
```

Opens at [http://localhost:3000](http://localhost:3000) in Edit Mode by default
on first load... actually it opens in **View Mode** (the clean, guest-facing
storefront) — click **Edit Mode** bottom-right to get the configuration panel.

Other scripts:

```bash
npm test         # react-scripts test (interactive watch mode)
npm run build    # production build to build/
npm run deploy   # builds, then publishes build/ to the gh-pages branch
                  # (uses the `homepage` field in package.json)
```

## The two things this app produces

1. **The live app itself** (what `npm start` runs) — a single-page React app.
   Edit Mode configures everything (items, theme, layout, integrations);
   View Mode is what a guest/customer sees. State lives in `localStorage`,
   namespaced `winklr_*` (see `src/components/appContext.js`).
2. **A static `store.html` export** — Config panel → "Export website". This is
   a *separate*, hand-written vanilla-JS/CSS re-implementation of the
   read-only storefront (`src/utils/generateStoreHTML.js`), so it runs with
   zero dependencies wherever you host it (GitHub Pages, Netlify, a plain
   S3 bucket, anything that serves static files).

**This matters for contributors:** most features need to be built twice — once
as a React component, once as the equivalent vanilla-JS/string-template code in
`generateStoreHTML.js`. If you add a feature to the live editor and it's meant
to show up on exported sites, check whether `generateStoreHTML.js` needs the
matching change. Nothing enforces this at build time; it's easy to forget.

## Project structure

```
src/
├── App.js                    # Root: routes between the store app and /admin
├── components/
│   ├── appContext.js         # Global state (React Context + useLocalStorage)
│   ├── ConfigPorter.js       # Export / import JSON config, shareable link, export website
│   ├── ThemePicker.js        # Palettes, custom colours, fonts, "my custom theme"
│   ├── OwnerGateModal.js     # Passcode prompt for Edit Mode
│   ├── decals/               # Freeform draggable "sticker" images
│   ├── stock/                # Item list loader + editor
│   ├── layout/                # Grid/strip/stacked/featured layouts + alignment + sections
│   ├── tiles/                 # Tile variants, reservation UI, name-prompt modal
│   ├── navbar/                 # Edit-mode navbar widget slots
│   ├── view-mode/              # Read-only navbar
│   └── checkout/               # Multi-step checkout modal
├── config/
│   └── telemetry.js          # Fill in your own Firebase project to enable /admin (see below)
├── data/
│   └── demoItems.js          # "Load sample items" seed data (flagged is_sample: true)
├── hooks/
│   └── useLocalStorage.js
├── models/
│   ├── stockItem.js           # Item shape + factory
│   └── decal.js               # Decal shape + factory
├── pages/
│   ├── Home.js                # Main store/registry page + edit panel
│   └── Admin.js                # /admin telemetry dashboard
├── styles/                    # Plain CSS, one file per feature area
├── theme/
│   ├── palettes.js             # Built-in colour palettes
│   └── fonts.js                 # Font options + Google Fonts loader
└── utils/
    ├── configSerializer.js      # JSON export/import
    ├── shareableUrl.js           # Base64 URL-hash encode/decode
    ├── parseStockFile.js          # JSON/CSV/XLSX → stock items
    ├── telemetry.js                # Anonymous usage ping (no-ops if unconfigured)
    └── generateStoreHTML.js        # The static-export storefront (see above)
```

## Local state model

Everything the editor touches is a `useLocalStorage("winklr_x", default)` pair
in `appContext.js` — check there first if you're looking for where a setting
lives. Config that should survive export/import or the shareable link has to
be added in **three** places to actually round-trip:

1. `src/utils/configSerializer.js` — JSON file export/import
2. `src/utils/shareableUrl.js` — the `#winklr=...` URL hash (keep this one
   light — no images/data URLs, they blow up the URL length)
3. `src/components/appContext.js` — `loadConfig()`, so an imported/shared
   config actually gets applied to state

## Enabling telemetry + the admin dashboard (optional)

By default `src/config/telemetry.js` has both values blank, so nothing is sent
anywhere and `/admin` just shows a "not configured" message. To turn it on:

1. Create a Firebase project → enable Realtime Database.
2. Set rules to `{ "rules": { ".read": true, ".write": true } }` (same
   open-rules tradeoff already used for registry reservations — there's no
   real backend here, so treat the URL as semi-public).
3. Paste the database URL and pick a passcode in `src/config/telemetry.js`.
4. Rebuild. Every session (live app + every exported `store.html`) now sends
   one anonymous ping; view them at `/admin`.

## Deploying

`npm run deploy` publishes the current build to GitHub Pages using the
`homepage` field in `package.json` — update that field first if you're
deploying your own fork. For anything else, `npm run build` produces a
standard static `build/` directory that works on any static host.

## Where things are tracked

- Public roadmap: [TODO.md](TODO.md)
- Dated history of shipped changes: [README.md](README.md#changelog)
- Personal/in-progress notes (gitignored, not part of this guide's scope):
  `TODO.private.md`
