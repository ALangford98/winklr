/**
 * Framework-wide usage telemetry.
 *
 * This is separate from the per-deployment Firebase URL a registry/store owner
 * sets in the Integrations panel (that one only syncs reservations for THEIR
 * site). This one is baked into the app at build time and is the same for
 * every deployment - the live app and every exported store.html - so you (the
 * person distributing this framework) can see how many sites are running it.
 *
 * Setup:
 * 1. Create a Firebase project: https://console.firebase.google.com/
 * 2. Enable Realtime Database. Rules: { "rules": { ".read": true, ".write": true } }
 *    (same open-rules tradeoff already used for reservations - see the Owner
 *    passcode notes in the Integrations panel. Anyone who finds this URL can
 *    read or write telemetry data; there is no real backend here.)
 * 3. Paste the database URL below and set an admin passcode, then rebuild.
 *
 * Leave both blank to disable telemetry and the /admin dashboard entirely -
 * no events are sent anywhere until this is filled in.
 *
 * IMPORTANT: both values ship in plain text inside the built JS bundle, so
 * treat this like the Owner passcode feature - it stops casual discovery, not
 * a determined reader of your source. Anyone with a copy of this codebase (or
 * who inspects the built bundle) can read both the URL and the passcode.
 */
export const TELEMETRY_FIREBASE_URL = "";
export const ADMIN_PASSCODE = "";
