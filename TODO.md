# TODO / Roadmap

This is the public roadmap for Winklr. Completed items are checked off; everything
else is either in progress or planned. See [CHANGELOG](README.md#changelog) in the
README for a dated history of what shipped when.

> Keeping personal/in-progress notes? Add them to `TODO.private.md` (gitignored,
> never committed) instead of here.

---

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

#### Online Store *(default)*
- Default FABs: Cart, Help
- Default tile action: "Add to cart"
- Default panels visible: all

#### Portfolio *(not started)*
- [ ] Default FABs: Contact (opens contact popup), Help; cart and checkout suppressed by default
- [ ] Default tile action: "View" button — links to an optional `url` field on each stock item
- [ ] Contact popup — name, email, message fields; no backend; submits via `mailto:` fallback or shows a thank-you state; exportable to the static file
- [ ] Item model extension: optional `url` field for external project / case-study links (visible in `StockListEditor` and rendered on tiles)
- [ ] Static export: Contact popup with `mailto:` submission

#### Registry
- [x] Default FABs: Help, Share (copies shareable URL); cart and checkout suppressed by default
- [x] Default tile action: "Reserve" — quantity-based stepper, shows "X of Y reserved"
- [x] Reservation state persisted to `localStorage` in the static export; syncs live via Firebase when configured
- [x] Share registry: Share FAB copies the registry URL with config encoded in the hash
- [x] Reservations are keyed per guest name (`{ [itemId]: { [guestName]: quantity } }`), not just a raw count — a guest can only add to or remove *their own* reservation, not anyone else's
- [x] Per-item `nameRequired` toggle — when on (default), reserving prompts the guest for their name before it's recorded
- [x] Owner view of reservations by name — visible inline in the Items panel (edit mode) and via a hidden `#owner` view + passcode on the exported static site, with a "Release" action per reservation
- [x] Reservation quantity cap enforced in state (not just hidden by the UI) — a guest can no longer push total reservations past an item's needed quantity
- [x] Gift Suggestions — guests submit a name/quantity/email; owner approves (with an editable final quantity) or rejects from the Items panel or the exported site's owner view
- [x] Guest Access gate — optional email + display name + shared password screen in front of the whole registry, toggleable per registry; owner can generate a random password
- [ ] "Mark as purchased" action in edit mode — registry owner can permanently mark items fulfilled (removes from public reservation pool)
- [ ] RSVP / message popup — name + message field (same Contact component as Portfolio, re-used)
- [ ] Real email verification for suggestions/access gate (currently format-validated only) — would need Firebase Auth email-link sign-in or similar; a real backend dependency, not built yet

### Trust & safety
- [x] `is_sample` flag on demo/placeholder items — stripped out of JSON export, the shareable link, and the exported static site, so sample data can never leak into a real deployment; visible "Sample" badge + one-click removal in the Items panel
- [x] Owner passcode (Integrations panel) — gates switching into Edit Mode and the exported site's owner view. **Client-side check only, not real auth** — documented as such everywhere it appears; don't reuse a real password
- [x] New visitors land in View Mode by default (previously defaulted to Edit Mode, meaning a shared/exported link opened straight into the full editing panel)

### Layout & appearance
- [x] Item alignment (Left / Center / Right) for the grid, strip, and featured layouts
- [x] Search bar alignment (Left / Center / Right), independent of item alignment
- [x] Manually-created named sections — "+" button in the Layout panel creates an empty, orderable section ahead of tagging any items into it; shows up in the Categories panel for heading/description editing and can be removed while still empty
- [x] Edit panel and page content scroll independently (previously shared one page-level scroll)
- [ ] Custom tile config builder — define field layout, font sizes, visible fields beyond the three presets

### Theme
- [x] "My custom theme" — editing any colour or font auto-saves to a separate slot you can jump back to after previewing a built-in preset, without losing your edits
- [x] Terracotta preset palette
- [x] Font pickers for Body, Headings, and Navbar — a few system stacks plus a handful of Google Fonts loaded on demand (live app and exported site both)
- [x] **Decals** — freeform image "stickers" you drag anywhere on the page in Edit Mode; position sticks to that spot in the page content as it scrolls. Configurable size and rotation. Included in JSON export/import and the static export (baked in as static, non-draggable images there)

### Functionality
- [x] Shopping cart — add/remove items, quantity management, cart sidebar or modal
- [x] Help popup / onboarding guide for first-time users
- [x] Search bar — live tile filtering by name, category, and metadata fields
- [x] Sample/demo items — "Load sample items" button appears wherever the stock list is empty, so a new user or designer has real content to look at

### Integrations
- [x] Integrations panel in the edit UI — fields for each supported client-side credential (Stripe publishable key, Mapbox access token)
- [x] Clear labelling distinguishing public keys (safe to export) from secret keys (managed tier only)
- [x] In-editor warning if a user pastes what looks like a secret key (starts with `sk_`)
- [x] Integration status indicators — show connected / not configured per service
- [x] Firebase Realtime Database URL — live shared reservation state synced across all visitors via SSE; setup note with required security rules shown inline; embedded in static export; falls back to `localStorage` when not configured
- [x] Owner passcode field (see Trust & safety above)

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

### Stripe *(not started)*
- [ ] Wire Stripe publishable key from integrations state into the checkout payment step
- [ ] Load Stripe.js lazily when the payment step mounts — only if a publishable key is configured
- [ ] Render `CardElement` (or individual `CardNumberElement` / `CardExpiryElement` / `CardCvcElement`) in the payment step
- [ ] Tokenise on submit via `stripe.confirmCardPayment` or `stripe.createToken` — no server-side charge in the editor
- [ ] Disable the Pay button until the card Element reports complete
- [ ] Surface Stripe field errors inline below the card input
- [ ] On success: advance to the Confirmation step and clear the cart
- [ ] Static export: embed Stripe publishable key and Stripe.js script tag; wire up Elements in the exported storefront

### Mapbox *(not started)*
- [ ] Wire Mapbox access token from integrations state into the checkout flow
- [ ] Add delivery address field to checkout — autocomplete via Mapbox Geocoding API (`/geocoding/v5/mapbox.places`)
- [ ] Debounced suggestion dropdown as the user types — show formatted place names
- [ ] On suggestion select: populate structured address fields (line 1, city, postcode, country)
- [ ] Basic address validation — require a selection from suggestions rather than free-text entry
- [ ] Static export: embed Mapbox token and `mapbox-gl` / Geocoding API call in the exported storefront

### Deployment pipeline
- [x] Static export — generate a single self-contained HTML file from the current config; embeds theme CSS vars, stock data, and client-side API keys; renders a fully functional read-only storefront with cart/registry, search, decals, and fonts in vanilla JS
- [x] Framework usage telemetry — anonymous, aggregate pings (domain, website type, item count) from the live app and every exported site, opt-in by filling in `src/config/telemetry.js` with your own Firebase project. No-ops entirely until configured
- [x] `/admin` dashboard — passcode-gated view of telemetry pings across every deployment (total pings, unique domains, breakdown by type)
- [ ] Static export: Stripe Elements checkout flow (card tokenisation only — no server-side charge)
- [ ] Static export: Mapbox address autocomplete at checkout
- [ ] Guided self-deployment — exported file + one-page hosting instructions (Netlify drag-and-drop, Vercel CLI, GitHub Pages) — see [QUICKSTART.md](QUICKSTART.md) for the GitHub Pages path that already works today
- [ ] Managed deployment subscription tier — user provides publishable keys; Winklr hosts the frontend and provides the backend for Stripe charge confirmation, order storage, and email receipts
- [ ] Managed tier: order management dashboard
- [ ] Managed tier: webhook handling for Stripe payment confirmation
- [ ] Version 1.0.0 milestone: both tiers live end-to-end (static export working + at least one managed deployment)

### Branding
- [x] Default Winklr branding assets (mark + wordmark) displayed in navbar and footer
- [x] User logo upload in edit panel — replaces default with any image; clear "Your logo here" empty state so it's never mistaken for a real logo already being set
- [x] "Powered by Winklr" footer
- [x] Configurable currency prefix (default `$`) — shown on tiles, cart, and checkout (live app and exported site)
- [x] Page heading / subheading fields, carried through export/import and the static export
- [ ] Store name / tagline field in the navbar itself (currently only above the tile grid)
- [ ] Favicon swap when custom logo is uploaded

### Mobile
- [x] Edit panel is too wide for mobile — replaced with a bottom sheet triggered by a FAB
- [x] FAB group reduced to smaller buttons with tighter spacing on small screens
- [x] Navbar widget slots no longer overflow on narrow screens; widget editor dropdowns pinned to right edge
- [x] Cart drawer slides up as a full-width bottom sheet on screens ≤ 768 px
- [x] Brand header scrolls off screen on mobile; sticky navbar locks to top beneath it
- [x] Navbar widgets (search, dropdown) fill their slot width — no more fixed pixel widths
- [x] Edit panel content no longer overflows panel bounds (collapsible sections constrained, integration inputs get `min-width: 0`)
- [x] Item/tile grid centers by default instead of clumping to the left on an incomplete row; alignment is user-configurable (see Layout & appearance)
- [ ] Touch target audit — ensure all interactive elements (tile buttons, cart qty controls, widget editor) meet minimum 44px tap target size
- [ ] Static export: apply updated mobile styles to generated HTML

### Polish
- [ ] Basic tests for `AppContext` reducers and the `Tile` / `Layout` components
