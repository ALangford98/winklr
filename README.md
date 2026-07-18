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

New to the codebase? See **[QUICKSTART.md](QUICKSTART.md)** for project structure,
the live-app/static-export split, and how config state round-trips through
export/import/share.

---

## Roadmap

See **[TODO.md](TODO.md)** for the full, up-to-date public roadmap.

---

## Changelog

### [0.13.0] — 2026-07-18

#### Edit mode previews the store in an iPhone frame
On desktop (windows wider than 1024px), Edit Mode now renders the storefront inside
an iPhone-style frame — 393px screen, rounded titanium-look bezel, Dynamic Island,
side buttons — centred on a dotted stage, so you see roughly what guests on a phone
will see while you edit. A new device FAB next to the other floating buttons —
edit-mode only, hidden below 1025px where the frame can't exist — toggles the
preview between the phone frame and full desktop width, and the choice persists
(`winklr_previewDevice`). The edit sidebar widened from 260px to
`clamp(420px, 50vw, 800px)` — at least half the window on a laptop, capped on very
wide monitors. The
framed screen paints the theme's `--bg-app` itself (the content area is normally
transparent over the page background — inside the dark bezel that read as a black
screen on light themes until it painted its own). View Mode, mobile editing
(bottom-sheet panel), and the exported site are untouched: the frame wrappers are
`display: contents` everywhere except active desktop edit mode.
One honest caveat: the preview approximates mobile by constraining width — CSS
viewport media queries still see the real window, so breakpoint-specific styles
(e.g. tighter paddings under 600px) don't apply inside the frame. Verified with a
headless-Chrome screenshot of the production build.

### [0.12.0] — 2026-07-18

#### Suggest a gift and reserve it yourself
The gift suggestion form (live app and export) now has an "I'd like to reserve this
gift myself once it's approved" checkbox — unchecked by default. Ticking it reveals a
name field (prefilled with the stored guest name, required to submit) since
reservations are keyed by guest name. The intent is stored on the suggestion record;
the owner sees "«name» wants to bring it" on the pending suggestion, and on approval
the reservation is created automatically on the new item under the suggester's name,
capped at the approved quantity. The suggester's name is also saved as the browser's
guest identity so they can undo their own reservation like any other.

Verified end-to-end in headless Chrome: tick → name required → submit → owner sees
intent → approve → tile shows "1 of 1 reserved · Fully Reserved ✓" under the
suggester's name → survives reload.

### [0.11.0] — 2026-07-18

#### Edit an item's detail fields directly in the editor
The Items panel's add/edit forms now include a "Detail fields" editor for the
open-ended metadata that renders as label/value rows on detailed tiles (Type, Notes,
Price guide, paste-import Details, etc.). Previously the only way to touch these was
the export-JSON → hand-edit → re-import loop. Add/remove rows freely; a field whose
label is blanked is dropped on save. Covered by a new owner-flow test that round-trips
a field through the real editor component. Editor-only change — the exported site
already rendered item metadata, so no generator change was needed.

### [0.10.0] — 2026-07-18

#### Approved suggestions now persist — and live in a "Suggested Gifts" section
On the exported site, approving a gift suggestion only pushed the item into the
in-memory stock array: it vanished on reload and other visitors never saw it at all.
Approved items are now *derived* from the suggestion records themselves (Firebase or
localStorage) on every load, so approvals stick and appear for everyone. Approving
persists the final quantity and name onto the suggestion via PATCH, with a local
fallback when the write fails. In both the app and the export, approved suggestions
render in a dedicated **"Suggested Gifts"** section pinned at the bottom of the page,
with a default description noting these were suggested by guests (the owner can
override the heading/description via a `Suggested Gifts` entry in Categories).

#### Owner view: edit suggestions, and no more lock-out after closing
The exported site's owner view now lets the owner fix a suggestion's name (typos),
replace or add its photo (same 3MB cap as guest uploads), and adjust quantity — for
pending *and* already-approved suggestions, via a new "Approved suggestions" section
with Save/Remove. Closing the owner popup no longer strands the owner: once unlocked,
an "Owner" FAB stays available to reopen it without re-entering the passcode, and
navigating to `#owner` after page load now works too (there was no hashchange
listener before — the gate only ever opened if the hash was set at load time).

#### Share button now gives feedback
The exported site's Share button silently copied the URL (or silently failed) —
indistinguishable from doing nothing. It now flashes "Link copied ✓", falls back to a
copyable prompt when the clipboard API is unavailable, and strips the `#owner` hash
so an owner browsing their own registry never shares an owner-gate link to guests.

Verified end-to-end in headless Chrome against a freshly generated export: suggest →
edit typo → approve → appears in Suggested Gifts → survives reload → owner FAB
reopens without passcode.

### [0.9.9] — 2026-07-18

#### Stacked cards no longer overflow the screen on mobile
On phones, stacked-layout cards ran wider than the viewport: meta text and the Reserve
button spilled past the card's right edge and got cut off at the screen. Root cause:
the stacked tile body (`flex: 1`) had no `min-width: 0`, so its flex-basis resolved to
its content width — and meta values are `white-space: nowrap` by design, so a long
"Price guide" made the whole card as wide as its longest unwrapped line. Diagnosed and
verified against the actual deployed export in headless Chrome at 390px.

Fix, in the live app and the static export: `min-width: 0` on the stacked tile body
(long meta ellipsizes on desktop, as originally designed), plus a phone-width media
rule that lets stacked meta rows wrap and their values break onto their own line, so
price guides are fully readable instead of truncated. This closes part of the
"Static export: apply updated mobile styles" roadmap item; the rest of that item is
still open.

### [0.9.8] — 2026-07-18

#### Personal registry config is no longer version-controlled
`baby-shower-registry-config.json` is now gitignored and untracked (the local file is
kept), alongside `TODO.private.md`. It's personal registry data — and since config
exports carry the Cash Fund's payment details, it could end up holding bank account
numbers; that has no business in a repo. Note the file still exists in earlier
commits' history.

### [0.9.7] — 2026-07-18

#### Registry config: five gap-filler items added
Added the missing everyday items flagged in review, all non-specific (price 0 with a
"Price guide" metadata range) with verified representative photos: Wipes and Nappy bag
(Nursery & Nappies, photos from Dis-Chem), Sleep sacks (Nursery & Nappies, MACCIE's
bamboo 1.0 TOG sack as the example), Thermometer (Bath & Health, Pigeon digital as the
example), and Baby monitor (Gear, Babywombworld video monitor as the example). Items
are ordered next to their related entries (wipes after nappies, sleep sacks after
swaddles, etc.) so grouped sections read naturally.

### [0.9.6] — 2026-07-18

#### Registry config: camping cot and travel system added to Gear
Two new big-ticket items in `baby-shower-registry-config.json`, both under Gear with
verified photos and current prices: the Joie Commuter Change and Snooze camping cot in
Linen Grey (R3 399.99 at Dis-Chem, with Dis-Chem's product photo) and the Belecoo
3-in-1 Travel System in Grey (R3 999 at Clicks; Clicks blocks scraping, so the photo
and the R3 499 direct price come from Belecoo's own SA storefront).

### [0.9.5] — 2026-07-18

#### Cash Fund: second bank account for international guests
The Cash Fund's payment details section can now hold two accounts instead of one —
useful when some guests are abroad and transferring to a local account is a pain for
them. In the Cash Fund panel, once "Show payment details" is on, a new "Add a second
account (e.g. for guests abroad)" toggle reveals a second details textarea, and both
accounts get an optional label field (e.g. "South African account (ZAR)" /
"International account (SWIFT/IBAN)") so guests can tell them apart. Labels render as
small headings above each details block on the guest-facing card, in the live app and
the static export. Existing configs are unaffected: the new fields default to empty/off
and ride through JSON export/import, the shareable URL, and `loadConfig()` with the
whole `cashFund` object, so no serializer changes were needed.

### [0.9.4] — 2026-07-18

#### Page heading/subheading alignment + stacked-layout buttons line up
Two follow-ups to 0.9.3's alignment fix, in both the live app and the static export:

- The page heading and subheading had the same bug as the category headers — the
  title centered (inherited from the `.App` boilerplate) while the subtitle's
  `max-width: 560px` box stayed left. The page header now takes its alignment
  explicitly from the Layout alignment setting, same as category headers.
- In the stacked layout, `.tile-body` never got the `flex: 1` the featured layout
  has, so each row's body — and the Reserve/Add-to-cart button, which fills the
  body's width — was only as wide as that tile's text. Buttons ended at a different
  x-position on every row. The body now fills the row, so buttons (and prices/meta)
  share the same right edge across all stacked tiles.

### [0.9.3] — 2026-07-18

#### Category heading and description no longer misalign
In the live app, the category section heading rendered centered while its description
hugged the left edge. Root cause: the CRA-boilerplate `.App { text-align: center }` is
inherited by everything, so the full-width heading centered its text, but the
description — capped at `max-width: 600px` with no auto margins — stayed pinned left.
The exported site has no `.App` wrapper, so exports were left-aligned throughout:
the two implementations silently disagreed.

Both now set the section header's alignment explicitly from the Layout alignment
setting (left/center/right), with the description box's margins following along, so
heading and description always share an edge — in the live app and in exports, and
immune to inherited `text-align` from ancestors. Unrecognised alignment values fall
back to center (also keeps the exported inline style injection-safe).

### [0.9.2] — 2026-07-18

#### Registry config: photos for the remaining items
Every registry item in `baby-shower-registry-config.json` except **Clothes** now has a
product photo (19 of 20, all verified resolving). Since Takealot/Clicks block image
scraping, the remaining photos were sourced via the Shopify product-JSON endpoints of
SA stores that don't (Precious Cargo, MACCIE, Snuggletime, Toy Kingdom, A-Zee, Orms)
plus Dis-Chem's catalog API. Non-specific items got representative example photos
(e.g. a Hape rattle for "Toys", a NUK 2-pack for "Pacifiers", a Joie chair for the
high chair — noted as "photo is an example" where it could set price expectations).
Price guides were corrected where the sourced product disagreed with the earlier
estimate: swaddles now "R350 – R420", feeding pillow starts at the R350 Snuggletime
Snuggle Pillow, Polaroid guide notes the Gen 3 at R3 000 from Orms. Clothes stays
photo-less: every SA clothing retailer checked (Ackermans, Babies R Us, Mr Price,
Edgars, Woolworths) blocks automated fetches.

### [0.9.1] — 2026-07-17

#### Registry config filled in with real SA prices and product photos
`baby-shower-registry-config.json` (the importable demo/personal registry config) now
carries researched South African retail prices and product photographs instead of
placeholder zeros and empty image fields. Branded items (Huggies Extra Care, the two
Snuggletime SnuggleRoo carriers, Pigeon SofTouch bottles, Polaroid Now) get their actual
current price in the `price` field plus a hotlinked product photo from the retailer's
CDN (Dis-Chem and Snuggletime — verified resolving; Takealot/Clicks block hotlink
scraping, so those items keep manual-photo slots). Non-specific items keep `price: 0`
(so no misleading price renders on the tile) and instead carry a "Price guide" range and
a "From" retailer list in metadata, which the detailed tile layout renders as rows.

Also fixed two content bugs from the original paste-import: the **Feeding pillow** item
was missing from the list entirely (now added under Feeding), and **Bottles** carried
the pacifiers' "must pass the triangle test" note instead of its actual spec, "Pigeon
SofTouch (Peristaltic Plus)".

### [0.9.0] — 2026-07-12

#### Paste a list of items
The Stock List panel now has an "…or paste a list of items" option: paste a plain text
list (like one shared over WhatsApp), one item per line, and each line becomes a registry
item. Anything after a ` - ` on a line goes into the item's Details field, so
"Nappies - Huggies extra care" becomes an item named "Nappies" with "Huggies extra care"
shown in its details. Pasted items are *added* to the existing list (unlike a file
import, which replaces it), and are normal items afterwards - editable, removable,
taggable below.

The parser is deliberately tolerant of real-world copy/paste mess, verified against an
actual registry list pasted from a phone: invisible zero-width characters that ride
along from WhatsApp/Notes are stripped (they'd otherwise silently break search and
dedupe), leading bullets/numbering are removed, sloppy spacing around the dash parses
fine, and hyphenated names like "Soft-Structured Carrier" stay whole because only a
dash *with a space before it* splits name from details.

### [0.8.0] — 2026-07-06

#### Exported sites were completely broken - fixed, and now actually tested
While preparing the export flow for a real deployment, discovered that **every
`store.html` this app has ever exported had a dead script**: the export template is a
giant JS template literal, and template literals *cook* escape sequences - so the
regex `/\/$/` in the generated code shipped as `//$/` (a line comment that swallowed
the rest of the statement and broke the whole script's parse), and the email regexes
shipped as patterns that rejected any address containing a literal "s". ESLint's
`no-useless-escape` warning had been flagging exactly this and was suppressed with an
incorrect "emitted verbatim" justification comment. Nobody had ever actually opened an
export in a browser until now - all prior verification checked the pre-interpolation
source, which is exactly the text that *doesn't* ship.

- Fixed by emitting the script template with `String.raw`, so every backslash ships
  byte-for-byte; also fixed an `\'` in the storage-warning string with the same
  cooked-escape problem.
- Added real end-to-end coverage so this class of bug can't come back silently: a test
  now generates an actual `store.html`, loads it into a scripted DOM, drives the Guest
  Access gate form with a wrong then a right password, and asserts the outcome. Also
  smoke-tested both gated and open exports visually in headless Chrome.

#### Exported sites no longer contain any plaintext secrets
The exported page used to embed the Owner passcode and Guest Access password in
plaintext - readable by anyone who pressed View Source on the deployed site. Both now
ship only as SHA-256 fingerprints, and the gate/owner-view checks hash the entered
value and compare fingerprints:

- New `src/utils/sha256.js` (synchronous pure-JS, verified against Node's native
  crypto across block-boundary and unicode edge cases), with the same implementation
  inlined into the exported page; a test extracts the inlined copy from a real export
  and confirms both produce identical digests.
- Still a client-side check, not real auth - and a weak passcode can be brute-forced
  offline from its hash - but the passcode itself can no longer be read out of the
  page, which is what matters most if it was ever reused elsewhere. Panel copy updated
  to reflect this.

#### Scoped Firebase rules guidance
The Integrations panel's setup note used to recommend fully-open database rules. It
now recommends rules scoped to only the four paths the app uses, with the guest
access log (which contains guest emails) set **write-only** so nobody - including
someone with the database URL from the page source - can download the email list.

### [0.7.2] — 2026-07-06

#### Empty navbar no longer shows as a bar of blank dividers
In View Mode, an unconfigured navbar (the common case for a fresh registry - no widgets
added yet) rendered a full-width row of empty, dashed-border slots next to the brand logo,
since every slot got its own bordered `<li>` whether or not it had a widget in it. Fixed
`NavbarView.js` to only render slots that actually produce content, so an empty navbar is
just the logo with no dividers. The exported static site (`buildNavbarHTML` in
`generateStoreHTML.js`) already filtered these out correctly - only the live app had the
regression.

### [0.7.1] — 2026-07-06

#### Security review before deploying
Went looking specifically for secrets leaking into the frontend and other deployment
risks, since that's an easy thing to get wrong in an app with no backend. Found and fixed
two real issues, and confirmed a few other things are fine as-is:

- **Fixed: the shareable "Copy link" leaked the Owner passcode.** `encodeConfigToHash()`
  was embedding the entire `integrations` object - including the Owner passcode - into
  the link handed straight to guests (Share FAB, and the Copy link button in the Config
  panel). Anyone who received a completely normal registry link could read the owner's
  passcode straight out of the URL (it's just base64, no real encryption), and since
  that's the same passcode used to gate the exported site's owner view, it also
  compromised the deployed site's admin access. Fixed to only carry the fields guests
  actually need (Firebase URL, Stripe/Mapbox public keys) - the passcode now travels
  only through JSON export (a private backup file) and the static site export (already
  disclosed there as a client-side-only check). Added a disclosure note to the Config
  panel explaining exactly what each sharing method includes.
- **Fixed: a gift suggestion's "link" field could execute script in the owner's
  browser.** The link a guest submits was rendered as a clickable `<a href>` with no
  scheme check, so a `javascript:` URL would run when the owner clicked "View link" -
  classic stored XSS via URL scheme, in both the live app and the exported site. Now
  validated on submit and, more importantly, re-checked at render time (`isSafeUrl()`)
  so a suggestion arriving any other way - a direct Firebase write, an older cached
  value - still can't render as an executable link.
- **Confirmed clean**: no hardcoded API keys, private keys, or committed `.env` files
  anywhere in the repo or its git history. Every place user-submitted text gets rendered
  in the exported site already runs through `esc()` for HTML-escaping - checked
  systematically across items, categories, suggestions, cash pledges, and checkout.
- **Known accepted risk, documented rather than "fixed"**: this app has no backend, so
  the Firebase Realtime Database rules needed for reservations/suggestions/pledges to
  sync (`{ ".read": true, ".write": true }`) are genuinely open to anyone who has the
  URL - not just through the app's UI, but via any raw HTTP request. Same tradeoff
  already disclosed for the Owner passcode and Guest Access password: fine for a small
  trusted audience, not something to reuse for anything sensitive.
- **Noted, not yet fixed**: `xlsx` (used to parse imported CSV/XLSX stock lists) has two
  known, currently-unpatched vulnerabilities upstream (prototype pollution, ReDoS) with
  no fixed version on the public npm registry. Risk is bounded - it only runs when the
  *owner* imports a file, not triggerable by a guest - but worth knowing about before
  opening a stock-list file from someone else. All other `npm audit` findings are
  build-tooling dependencies that never ship in the production bundle.

Added `src/__tests__/security.test.js` covering both fixes as regressions, and polyfilled
`TextEncoder`/`TextDecoder` in `setupTests.js` (jsdom doesn't provide them, so the
shareable-link code was previously untested).

### [0.7.0] — 2026-07-05

#### Cash Fund
Registries can now accept cash contributions instead of (or alongside) physical items.
Turned on per-registry from a new "Cash Fund" panel in the edit sidebar:
- Custom heading and an optional message to guests.
- Optional running total pledged, and an optional goal amount with a progress bar.
- Optional payment/bank details field (free text, so it fits bank transfer, PayPal.me,
  Venmo, or whatever the owner actually uses) - shown as plain text to anyone with the
  link, same trust model as the registry link itself.
- Guests can record a pledge (name, email, amount, optional message) so the owner - and
  other guests, if the total is shown - can see what's been contributed. There's no real
  payment processing anywhere in this; money changes hands outside the app the same way
  a bank transfer or PayPal payment always has, and the pledge is just a record of it.
- Owner can remove any pledge (accidental double-entries, pranks) from the same panel.
- Built in both the live app (`CashFundPanel.js`, `CashFundCard.js`) and the static export
  (`generateStoreHTML.js`), wired through `configSerializer.js` and `shareableUrl.js` like
  every other config field.

#### A pass at making the app harder to break by accident
Went through both sides of the app - the person building a registry and the guests using
it - looking for places where a careless click or a slow connection could silently lose
data or lie about what happened. Fixed:
- **Silent data loss on a full/blocked browser storage**: every write now surfaces a
  visible warning banner instead of failing invisibly while the UI still looks saved.
- **False "success" messages**: gift suggestions, cash pledges, and reservations now
  check the actual Firebase response (`fetch` only rejects on a network failure, not on
  an HTTP error code) before telling a guest something worked. A failed reservation or
  pledge now falls back to a local update instead of a dead-looking button; a failed
  suggestion/pledge now shows a real error instead of a cheerful "Thanks!".
- **Cross-site data bleed**: a new per-site `siteId`, carried through every config
  round-trip, namespaces every localStorage key. Two different exported registries (or
  two different shared links) opened in the same browser no longer inherit each other's
  cart, reservations, or guest name.
- **Import overwrite guardrails**: dragging a new file onto an already-loaded stock list,
  or importing a config JSON file, now asks for confirmation first instead of silently
  replacing everything.
- **Oversized image uploads**: logos, decals, item photos, and suggestion photos are
  capped at 3MB with a clear error, instead of silently blowing the storage quota.
- **Malformed Firebase URLs no longer crash the page** for every visitor - guarded with
  a try/catch and an inline validation hint in the Integrations panel.
- **Spreadsheet imports** now recognise `quantity`/`qty` and `category`/`categories`/`tag`
  column headers (previously silently dropped into metadata).
- **Category tags** are now deduplicated case-insensitively as you type them, so
  "Kitchen" and "kitchen" don't become two different sections.
- Decals can no longer be dragged to negative coordinates where they'd become invisible
  and unreachable.
- Rewrote the checkout confirmation and payment-step copy, which previously implied a
  real email confirmation and encrypted Stripe payment were happening when neither is
  wired up yet - now honestly describes it as a local-only demo.
- Added an honest note about reservation sync timing to the Help modal (registries only),
  and a "Reserving items" section that only shows for registries (previously guests saw
  cart/checkout help text that didn't apply to their site type at all).

#### Tests
Added `src/__tests__/ownerFlows.test.js` and `src/__tests__/guestFlows.test.js`, exercising
the real `AppContext` (no mocking) end-to-end for both sides of the app: item CRUD,
config/stock-file import including the new column aliases, the access-gate
lockout-prevention and owner-passcode bypass, cash fund configuration and pledge removal,
gift suggestions and cash pledges (including what happens when the Firebase write actually
fails), guest email autofill across forms, and a full guest journey through a
password-protected gate to the storefront.

### [0.6.3] — 2026-07-05

#### "Powered by Winklr" now links back to Winklr
Clicking the footer badge (both in the live editor and every exported site) opens a small
popup with two options, instead of doing nothing:
- **Build one that looks like this** - opens the Winklr app pre-loaded with the current
  colours, fonts, and layout choices, but with the built-in sample items instead of this
  page's real item list (or anyone's personal data).
- **Start from scratch** - opens a blank Winklr app with the default look.

The "look-only" link reuses the existing shareable-URL hash mechanism (`#winklr=...`), so no
new persisted config field was needed - `encodeLookConfigToHash()` in `shareableUrl.js` just
builds a narrower version of that same payload. Built in both the live app
(`PoweredByModal.js`) and the static export (`generateStoreHTML.js`), per the dual-build rule.

### [0.6.2] — 2026-07-05

#### Featured items, and gift-suggestion email/link/photo/alignment
- Item list editor: each item now has a star toggle to mark it as the "featured" item, used by
  the Featured layout as the hero (only one item can be featured at a time). Mirrored into the
  static export's `renderLayout()`.
- Gift suggestions now prefill the guest's email if they already entered one to get past the
  Access Gate, so they don't have to type it twice.
- Guests can attach an optional link and photo to a gift suggestion; both show up for the owner
  in the suggestions panel and carry through onto the item once approved.
- The "Suggest a gift" form now has its own Left/Center/Right alignment control (registry sites
  only), matching the pattern already used for items and the search bar.
- All of the above was built twice, once in the live app and once in `generateStoreHTML.js` for
  the exported static site, per this repo's dual-build rule.

### [0.6.1] — 2026-07-05

#### Guest Access gate: lockout fixes
Found in response to a direct question ("make sure not to lock admin users out") right after
the gate shipped in 0.6.0 - two real ways an owner could get shut out of their own registry:

- Ticking "Require a password" re-rendered the app immediately, and the owner had never
  themselves "passed" the gate they were only just creating - so turning it on booted them
  to the gate screen mid-edit. Fixed: enabling the toggle now marks the person doing it as
  already past the gate.
- A gate enabled with no password typed yet was trivially bypassable (an empty submitted
  password matched the empty stored one) while still locking the owner out per the bug
  above. Fixed: the gate is only considered active once a non-empty password exists, in
  both the live app and the exported site.
- Added a genuine safety net: an "I'm the registry owner" link on the gate screen (live app
  and exported site) that accepts the separate Owner passcode instead of the shared guest
  password - so losing or forgetting the guest password, or opening on a new device, no
  longer means being locked out entirely, as long as an Owner passcode was set. The Access
  panel now warns if the gate is active without one.

### [0.6.0] — 2026-07-05

#### Gift suggestions
- New **Gift Suggestions** panel (registry mode) — guests submit an item name, a suggested quantity, and an email address via a form on the storefront; the owner reviews pending suggestions in Edit Mode (or via the exported site's owner view) and can Approve (adding it to the registry with an owner-editable quantity) or Reject
- Synced via the same optional Firebase Realtime Database as reservations, with a localStorage-only fallback (see caveat below)
- Email is format-validated only, not verified - the UI is explicit about this rather than implying real verification
- On the exported static site, approving a suggestion adds it to the live view immediately for that browser session, but this does not persist across reloads or to other visitors - the owner needs to add it for real in the live editor and re-export to make it permanent

#### Guest access gate
- New **Guest Access** toggle - requires anyone visiting the registry (live app or exported site) to enter an email, a display name, and a shared password before seeing anything, including the Edit Mode toggle
- Owner sets the password manually or generates a random one; display name doubles as the reservation guest name so guests aren't asked twice
- Deliberately excluded from the "Copy link" shareable URL, since that link is the exact thing the gate is meant to require a separately-shared password alongside - baking the password into the same link would defeat it. Only works via JSON export/import and the exported static site
- This is a spam/casual-access deterrent, not real security and **not DDoS protection** - documented as such in the panel itself

#### Correctness fix
- Reservation quantity cap is now enforced in state (both the live app and the exported site), not just by hiding the "+" button in the UI - a guest could previously reserve past an item's needed quantity if triggered any other way. Found while writing the new reservation test suite

#### Testing
- Added `src/__tests__/reservations.test.js` - real (non-mocked) tests against `appContext`'s reservation logic: unlimited items, quantity-capped items, multiple guests sharing a capped item, a guest unable to decrement another guest's reservation, and the anonymous-guest fallback
- Fixed `App.test.js`, which was broken on two counts: it asserted text from the original create-react-app template that no longer exists, and it rendered `<App />` without the required `AppContextProvider` ancestor
- Added a `crypto.randomUUID` polyfill in `setupTests.js` for jsdom environments where it isn't available

### [0.5.0] — 2026-07-05

#### Decals
- New **Decals** section (Theme category) — upload an image and drag it anywhere on the page in Edit Mode; position sticks to that spot in the scrollable content, not the viewport
- Per-decal size and rotation sliders in the panel
- Included in JSON export/import; baked into the static export as static (non-draggable) positioned images; intentionally excluded from the shareable-link hash to keep URLs short (same treatment as the branding logo)

#### Documentation
- Replaced the stale inline TODO in this README with **[TODO.md](TODO.md)**, rewritten against the actual current state of the app
- Added **[QUICKSTART.md](QUICKSTART.md)** — install/run, project structure, the live-app/static-export duplication contributors need to know about, and how to enable telemetry
- Added `TODO.private.md` (gitignored) for personal/in-progress notes that shouldn't be public
- Added `CLAUDE.md` with repo-specific instructions for AI coding agents, including that the changelog must be updated for every change

### [0.4.1] — 2026-07-05

#### Layout
- Edit panel and page content now scroll independently — previously they shared one page-level scroll, so a long item list would scroll the settings panel along with it
- Search bar alignment (Left / Center / Right), independent of item alignment; fixed the exported static site missing the `max-width` that made the alignment control meaningful there

### [0.4.0] — 2026-07-05

#### Registry trust & safety
- Reservations are now keyed per guest name (`{ [itemId]: { [guestName]: quantity } }`) instead of a flat count — a guest can only add to or remove *their own* reservation, not anyone else's
- Per-item `nameRequired` toggle (default on) — reserving prompts the guest for their name first, so the registry owner can see who reserved what
- Owner view of reservations by name, with a "Release" action — shown inline in the Items panel in Edit Mode, and via a hidden `#owner` view + passcode on the exported static site
- Owner passcode (Integrations panel) gates switching into Edit Mode and the exported owner view — documented everywhere as a client-side check only, not real authentication
- New visitors now land in View Mode by default (was Edit Mode) — a shared or exported link no longer opens straight into the full editing panel

#### Layout & sections
- Item alignment (Left / Center / Right) for grid/strip/featured layouts, replacing a previous hardcoded center
- Manually-created named sections — "+" button in the Layout panel creates an empty, orderable section before any items are tagged into it

#### Theme
- "My custom theme" — editing any colour or font auto-saves to a separate slot, restorable after previewing a built-in preset
- Terracotta preset palette
- Font pickers for Body, Headings, and Navbar — system stacks plus a few Google Fonts, loaded on demand in both the live app and exported sites

#### Sample data
- `is_sample` flag on demo/placeholder items — stripped from JSON export, the shareable link, and the exported static site; visible "Sample" badge and one-click bulk removal in the Items panel
- "Load sample items" button appears wherever the stock list is empty (main view and Items panel) so a new user or designer has real content to look at

#### Framework telemetry
- Optional, anonymous usage ping (domain, website type, item count) from the live app and every exported site — opt-in by filling in `src/config/telemetry.js` with your own Firebase project; no-ops entirely until configured
- `/admin` route — passcode-gated dashboard showing total pings, unique domains, and a breakdown by website type

#### Bug fixes
- Fixed a dead CSS selector (`.layout--detailed` → `.tile--detailed`) that meant the tablet tile-width rule never applied
- `box-sizing: border-box` added to the search bar wrapper so its `max-width` behaves consistently with the exported site

### [0.3.1] — 2026-07-05

#### Branding & theme clarity
- Branding logo picker no longer defaults to showing the Winklr wordmark where a real logo would go — empty state now reads "Your logo here" with a clear upload affordance, plus a hint explaining what shows in the navbar until one is uploaded
- Registry title, subheading, and currency fields now have persistent labels instead of placeholder-only text
- "Accent colour" folded into the same Colours grid as every other customisable variable instead of sitting in its own separate block
- Added an editable "Outline colour" swatch (`--border-subtle`) — this CSS variable already drove borders throughout the app but had no control exposed for it

### [0.3.0] — 2026-07-05

#### Sharing & export correctness
- Fixed the shareable link (Copy link) silently dropping `integrations` (breaking live cross-guest reservation sync via Firebase), `groupByCategory`, and `categoryConfig`
- Fixed JSON config export/import dropping `brand` (page title, subheading, currency, logo) entirely
- Exported static site (`store.html`) fixes to match the live editor: honours the configured currency prefix instead of a hardcoded `$`, renders the page heading/subheading, supports category-grouped sections, and models reservations by quantity (`X of Y reserved`) instead of a plain boolean — the old boolean model was also incompatible with the live app's Firebase schema if the two ever shared a database

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
