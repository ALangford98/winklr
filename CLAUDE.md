# Instructions for AI coding agents

## Always update the changelog

**Every change you make to this repo must add an entry to the Changelog section
in [README.md](README.md).** This is not optional and not just for large
features — bug fixes, small tweaks, and doc-only changes all get an entry.

- Add a new `### [x.y.z] — YYYY-MM-DD` section above the most recent one (don't
  edit past entries). Bump the version realistically: a small fix is a patch
  bump, a new feature is a minor bump.
- Use the current date. Group related changes from the same piece of work
  under one version heading with `####` subheadings, matching the existing
  style — look at recent entries before writing new ones.
- Write it like the existing entries: what changed and why it matters, not a
  restatement of the diff.
- If the change resolves or touches something in [TODO.md](TODO.md), update
  the checkbox there too.

If you're not sure whether something is "big enough" to log — it is. Log it.

## Other things to know before making changes

- **Read [QUICKSTART.md](QUICKSTART.md) first.** It explains the project
  structure and, critically, that most features have to be built *twice*:
  once as a React component (the live app), once as hand-written vanilla
  JS/CSS in `src/utils/generateStoreHTML.js` (the static export). If you add
  or change something in the live editor that should also show up on
  exported sites, check whether `generateStoreHTML.js` needs the same change.
  Nothing enforces this at build time.
- **Config fields need three places to round-trip**, per QUICKSTART.md:
  `src/utils/configSerializer.js` (JSON export/import), `src/utils/shareableUrl.js`
  (the URL hash — keep this one light, no image data), and `loadConfig()` in
  `src/components/appContext.js`.
- `TODO.private.md` is gitignored and is the user's personal scratch file —
  never write feature work there instead of TODO.md, and never suggest
  removing it from `.gitignore`.
- Don't invent telemetry, tracking, or external network calls beyond what's
  already in `src/utils/telemetry.js` (which no-ops until the user fills in
  `src/config/telemetry.js` themselves) without asking first.
