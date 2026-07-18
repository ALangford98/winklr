import { TELEMETRY_FIREBASE_URL } from "../config/telemetry";
import { googleFontFamilyFor } from "../theme/fonts";
import { WINKLR_HOMEPAGE_URL, encodeLookConfigToHash } from "./shareableUrl";
import { sha256 } from "./sha256";

const CSS_VARS_LIST = [
  '--bg-app', '--bg-card', '--bg-nav', '--bg-raised', '--bg-input',
  '--text-primary', '--text-secondary', '--text-muted', '--text-meta', '--text-on-nav',
  '--accent-primary', '--accent-subtle', '--accent-success', '--accent-danger',
  '--border-subtle', '--border-hover',
  '--font-body', '--font-heading', '--font-nav',
];

function safeJSON(data) {
  return JSON.stringify(data).replace(/<\/script/gi, '<\\/script');
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchAsDataUrl(url) {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function buildThemeVarsCSS() {
  const computed = getComputedStyle(document.documentElement);
  return CSS_VARS_LIST
    .map((v) => {
      const val = computed.getPropertyValue(v).trim();
      // Skip unset vars entirely - a declared-but-empty custom property makes
      // var(--x, fallback) resolve to invalid rather than using the fallback.
      return val ? `  ${v}: ${val};` : null;
    })
    .filter(Boolean)
    .join('\n');
}

// ── Static CSS ─────────────────────────────────────────────────────────────

function buildStaticCSS() {
  return `
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; background: var(--bg-app); color: var(--text-primary); font-family: var(--font-body, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif); font-size: 16px; display: flex; flex-direction: column; }
a { text-decoration: none; color: inherit; }
button { font-family: inherit; }

/* Navbar */
.Navbar { display: flex; background: var(--bg-nav); height: 56px; align-items: stretch; position: sticky; top: 0; z-index: 10; font-family: var(--font-nav, inherit); }
.navbar-brand { flex-shrink: 0; padding: 0 16px; display: flex; align-items: center; border-right: 1px solid rgba(255,255,255,0.08); }
.navbar-brand-logo { height: 30px; width: auto; display: block; }
.navbar-brand-text { font-size: 17px; font-weight: 700; color: var(--text-on-nav); }
.navbar-slots { flex: 1; display: flex; align-items: stretch; min-width: 0; }
.navbar-slot { flex: 1; display: flex; align-items: center; justify-content: center; padding: 0 8px; border-right: 1px solid rgba(255,255,255,0.06); min-width: 0; }
.navbar-slot:last-child { border-right: none; }
.navbar-action-btn { background: none; border: none; color: var(--text-on-nav); font-size: 14px; cursor: pointer; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 6px; line-height: 1; white-space: nowrap; }
.navbar-action-btn:hover { color: var(--accent-primary); }
.navbar-cart-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 16px; height: 16px; padding: 0 3px; border-radius: 8px; background: var(--accent-primary); color: #fff; font-size: 10px; font-weight: 700; }
.navbar-search-input { background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 6px; color: var(--text-primary); font-size: 13px; padding: 4px 10px; outline: none; width: 140px; transition: border-color 0.15s; }
.navbar-search-input:focus { border-color: var(--accent-primary); }
.navbar-search-input::placeholder { color: var(--text-muted); }
.navbar-dropdown { background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 6px; color: var(--text-primary); font-size: 13px; padding: 4px 8px; max-width: 120px; }

/* App layout */
.app-content { flex: 1; display: flex; flex-direction: column; position: relative; }
.decal { position: absolute; z-index: 5; pointer-events: none; }
.decal img { width: 100%; height: auto; display: block; }
.store-search-wrap { position: relative; padding: 16px 24px 0; max-width: 560px; box-sizing: border-box; }
.store-search-input { width: 100%; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-primary); font-size: 14px; padding: 8px 36px 8px 14px; outline: none; transition: border-color 0.15s; font-family: inherit; }
.store-search-input:focus { border-color: var(--accent-primary); }
.store-search-input::placeholder { color: var(--text-muted); }
.store-search-clear { position: absolute; right: 32px; top: 50%; transform: translateY(-25%); background: none; border: none; color: var(--text-muted); font-size: 13px; cursor: pointer; padding: 2px 4px; line-height: 1; border-radius: 3px; }
.store-search-clear:hover { color: var(--text-primary); }
.search-no-results { flex: 1; text-align: center; padding: 60px 24px; font-size: 13px; color: var(--text-muted); }

/* Page header */
.page-header { padding: 40px 24px 8px; display: flex; flex-direction: column; gap: 8px; }
.page-header-title { margin: 0; font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1.15; font-family: var(--font-heading, inherit); }
.page-header-subtitle { margin: 0; font-size: 15px; color: var(--text-secondary); line-height: 1.5; max-width: 560px; }
@media (max-width: 768px) {
  .page-header { padding: 24px 16px 4px; }
  .page-header-title { font-size: 22px; }
}

/* Category grouping */
.category-groups { display: flex; flex-direction: column; gap: 0; }
.category-section { padding: 0; }
.category-section-header { padding: 28px 24px 10px; display: flex; flex-direction: column; gap: 6px; }
.category-section-title { margin: 0; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-primary); line-height: 1; font-family: var(--font-heading, inherit); }
.category-section-desc { margin: 0; font-size: 14px; color: var(--text-secondary); line-height: 1.5; max-width: 600px; font-weight: 400; text-transform: none; letter-spacing: 0; }
.category-divider { height: 1px; background: var(--border-subtle); margin: 8px 24px 0; }

/* Layout */
.layout { flex: 1; padding: 24px; min-width: 0; }
.layout--grid { display: flex; flex-wrap: wrap; gap: 16px; align-content: flex-start; justify-content: center; }
.layout--strip { display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 16px; align-items: flex-start; justify-content: center; padding-bottom: 20px; }
.layout--strip::-webkit-scrollbar { height: 5px; }
.layout--strip::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 3px; }
.layout--stacked { display: flex; flex-direction: column; gap: 10px; max-width: 860px; margin: 0 auto; }
.layout--stacked .tile { width: 100%; flex-direction: row; }
.layout--stacked .tile-body { flex: 1; min-width: 0; }
.layout--stacked .tile-img-wrap, .layout--stacked .tile-img-wrap--sm { width: 80px; min-width: 80px; height: 80px; }
.layout--stacked .tile--detailed .tile-img-wrap { width: 100px; min-width: 100px; height: 100px; }
.layout--featured { display: flex; flex-direction: column; gap: 20px; }
.layout-featured-slot .tile { width: 100%; flex-direction: row; height: 300px; }
.layout-featured-slot .tile-img-wrap, .layout-featured-slot .tile-img-wrap--sm { width: 45%; min-width: 45%; height: 100%; }
.layout-featured-slot .tile-body { flex: 1; padding: 28px 32px; justify-content: center; gap: 10px; }
.layout-featured-slot .tile-name { font-size: 22px !important; font-weight: 700 !important; }
.layout-featured-slot .tile-price { font-size: 17px !important; }
.layout-featured-slot .tile-meta { margin-top: 10px; }
.layout-featured-grid { display: flex; flex-wrap: wrap; gap: 16px; align-content: flex-start; justify-content: center; }

/* Tiles */
.tile { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; overflow: hidden; display: flex; color: var(--text-primary); }
.tile-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tile-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg-raised); color: var(--border-hover); font-size: 1.4rem; font-weight: 600; }
.tile--compact { flex-direction: row; align-items: center; width: 220px; height: 60px; }
.tile-img-wrap--sm { width: 60px; height: 60px; flex-shrink: 0; }
.tile--compact .tile-body { padding: 0 12px 0 10px; display: flex; flex-direction: column; gap: 2px; overflow: hidden; flex: 1; }
.tile--compact .tile-name, .tile--standard .tile-name, .tile--detailed .tile-name { font-family: var(--font-heading, inherit); }
.tile--compact .tile-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tile--compact .tile-price { font-size: 12px; color: var(--text-secondary); }
.tile--standard { flex-direction: column; width: 180px; }
.tile--standard .tile-img-wrap { width: 100%; height: 140px; }
.tile--standard .tile-body { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 4px; }
.tile--standard .tile-name { font-size: 14px; font-weight: 600; }
.tile--standard .tile-price { font-size: 13px; color: var(--text-secondary); }
.tile--detailed { flex-direction: column; width: 260px; }
.tile--detailed .tile-img-wrap { width: 100%; height: 180px; }
.tile--detailed .tile-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 5px; }
.tile--detailed .tile-name { font-size: 15px; font-weight: 600; }
.tile--detailed .tile-price { font-size: 14px; color: var(--text-secondary); }
.tile-meta { margin: 4px 0 0; display: flex; flex-direction: column; gap: 4px; }
.tile-meta-row { display: flex; gap: 6px; font-size: 12px; }
.tile-meta-row dt { color: var(--text-muted); text-transform: capitalize; flex-shrink: 0; }
.tile-meta-row dd { margin: 0; color: var(--text-meta); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tile-add-btn { background: var(--accent-subtle); border: 1px solid var(--accent-primary); border-radius: 4px; color: var(--accent-primary); font-size: 12px; padding: 4px 8px; cursor: pointer; transition: background 0.15s, color 0.15s; white-space: nowrap; font-family: inherit; }
.tile-add-btn:hover { background: var(--accent-primary); color: #fff; }
.tile-add-btn--reserved { background: var(--accent-success); border-color: var(--accent-success); color: #fff; }
.tile-add-btn--reserved:hover { opacity: 0.82; background: var(--accent-success); color: #fff; }
.tile-add-btn--compact { padding: 0; width: 26px; height: 26px; font-size: 18px; font-weight: 400; border-radius: 50%; flex-shrink: 0; margin-right: 8px; display: flex; align-items: center; justify-content: center; }
.tile--standard .tile-add-btn, .tile--detailed .tile-add-btn { margin-top: 6px; width: 100%; }
.tile-reserve-wrap { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.tile-reserve-label { font-size: 11px; color: var(--text-secondary); text-align: center; }
.tile-reserve-controls { display: flex; align-items: center; gap: 6px; }
.tile-reserve-controls .tile-add-btn { flex: 1; }
.tile-reserve-step { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; flex-shrink: 0; border-radius: 6px; background: var(--bg-raised); border: 1px solid var(--border-subtle); color: var(--text-primary); font-size: 16px; cursor: pointer; transition: border-color 0.15s; }
.tile-reserve-step:hover { border-color: var(--accent-primary); }
.tile-reserve-step--add { background: var(--accent-subtle); border-color: var(--accent-primary); color: var(--accent-primary); }
.tile-reserve-compact { display: flex; align-items: center; gap: 4px; }
.tile-reserve-compact .tile-reserve-step { width: 24px; height: 24px; font-size: 14px; border-radius: 4px; }
.tile-reserve-count { font-size: 11px; color: var(--text-secondary); min-width: 20px; text-align: center; }
.tile-reserve-full { font-size: 13px; color: var(--accent-success); font-weight: 600; }

/* Shared modal backdrop */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 299; }

/* Name prompt / owner gate */
.owner-gate-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(320px, calc(100vw - 32px)); background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; z-index: 300; padding: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
.owner-gate-modal form { display: flex; flex-direction: column; gap: 10px; }
.owner-gate-title { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
.owner-gate-body { margin: 0 0 4px; font-size: 13px; color: var(--text-secondary); }
.owner-gate-error { margin: 0; font-size: 12px; color: var(--accent-danger); }
.owner-gate-actions { display: flex; gap: 8px; margin-top: 4px; }
.owner-gate-actions .selector-btn { width: auto; flex: 1; }
.owner-gate-input { width: 100%; box-sizing: border-box; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 6px; color: var(--text-primary); font-size: 14px; padding: 8px 10px; font-family: inherit; outline: none; }
.owner-gate-input:focus { border-color: var(--accent-primary); }

/* Owner view panel */
.owner-view-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); width: min(560px, calc(100vw - 32px)); max-height: calc(100vh - 64px); background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; z-index: 300; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
.owner-view-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); flex-shrink: 0; }
.owner-view-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.owner-view-close { background: none; border: none; color: var(--text-muted); font-size: 14px; cursor: pointer; padding: 2px 6px; border-radius: 4px; line-height: 1; }
.owner-view-close:hover { color: var(--text-primary); }
.owner-view-body { overflow-y: auto; padding: 16px 20px 20px; display: flex; flex-direction: column; gap: 14px; }
.owner-view-item { border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px; }
.owner-view-item-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.owner-view-row { display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-top: 6px; }
.owner-view-release-btn { background: none; border: 1px solid var(--border-subtle); color: var(--text-secondary); border-radius: 4px; font-size: 11px; padding: 2px 6px; cursor: pointer; font-family: inherit; }
.owner-view-release-btn:hover { border-color: var(--accent-danger); color: var(--accent-danger); }
.owner-view-empty { font-size: 13px; color: var(--text-muted); text-align: center; padding: 20px 0; }
.owner-view-section-title { margin: 4px 0 -6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
.suggestion-qty-input { width: 56px; box-sizing: border-box; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-primary); font-size: 12px; padding: 4px; }

/* Suggest-a-gift form */
.suggest-gift-form { max-width: 420px; box-sizing: border-box; padding: 16px; border: 1px solid var(--border-subtle); border-radius: 10px; background: var(--bg-card); display: flex; flex-direction: column; gap: 8px; }
.suggest-gift-heading { margin: 0; font-size: 15px; font-weight: 700; color: var(--text-primary); }
.suggest-gift-hint { margin: 0 0 4px; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
.suggest-gift-email-note { margin: 0; font-size: 11px; color: var(--text-muted); line-height: 1.4; }
.suggest-gift-error { margin: 0; font-size: 12px; color: var(--accent-danger); }
.suggest-gift-form--done { align-items: center; text-align: center; }
.editor-checkbox-row { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); cursor: pointer; }
.suggest-gift-thanks { margin: 0; font-size: 13px; color: var(--text-secondary); }
.suggest-gift-image-row { display: flex; align-items: center; gap: 8px; }
.suggest-gift-image-preview { width: 36px; height: 36px; object-fit: cover; border-radius: 6px; flex-shrink: 0; border: 1px solid var(--border-subtle); }
.suggest-gift-image-btn { width: auto; flex: 1; text-align: center; cursor: pointer; }
.suggestion-row-top { display: flex; gap: 8px; align-items: flex-start; }
.suggestion-row-thumb { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; flex-shrink: 0; border: 1px solid var(--border-subtle); }
.suggestion-row-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.suggestion-row-link { font-size: 11px; color: var(--accent-primary); }
.suggestion-photo-btn { width: auto; text-align: center; cursor: pointer; font-size: 11px; }

/* Cash fund */
.cash-fund-card { max-width: 420px; box-sizing: border-box; margin: 32px auto; padding: 16px; border: 1px solid var(--border-subtle); border-radius: 10px; background: var(--bg-card); display: flex; flex-direction: column; gap: 10px; }
.cash-fund-heading { margin: 0; font-size: 15px; font-weight: 700; color: var(--text-primary); }
.cash-fund-message { margin: 0; font-size: 13px; color: var(--text-secondary); line-height: 1.5; }
.cash-fund-progress { display: flex; flex-direction: column; gap: 6px; }
.cash-fund-total { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.cash-fund-bar { height: 8px; border-radius: 4px; background: var(--bg-raised); overflow: hidden; }
.cash-fund-bar-fill { height: 100%; background: var(--accent-primary); border-radius: 4px; }
.cash-fund-bank-block { display: flex; flex-direction: column; gap: 4px; }
.cash-fund-bank-label { margin: 0; font-size: 12px; font-weight: 600; color: var(--text-primary); }
.cash-fund-bank-details { margin: 0; padding: 10px 12px; background: var(--bg-raised); border: 1px solid var(--border-subtle); border-radius: 6px; font-family: inherit; font-size: 12px; color: var(--text-secondary); white-space: pre-wrap; word-break: break-word; }
.cash-fund-form { display: flex; flex-direction: column; gap: 8px; }
.cash-fund-form-hint { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
.cash-fund-thanks { margin: 0; font-size: 13px; color: var(--text-secondary); text-align: center; }

/* Guest access gate */
.access-gate-screen { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-app); padding: 24px; box-sizing: border-box; }
.access-gate-card { width: 100%; max-width: 360px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 28px 24px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.25); }
.access-gate-title { margin: 0 0 2px; font-size: 19px; font-weight: 700; color: var(--text-primary); text-align: center; font-family: var(--font-heading, inherit); }
.access-gate-body { margin: 0 0 6px; font-size: 13px; color: var(--text-secondary); text-align: center; }
.access-gate-owner-toggle { background: none; border: none; padding: 0; color: var(--text-muted); font-size: 11px; text-decoration: underline; cursor: pointer; font-family: inherit; align-self: center; }

/* Cart drawer */
.cart-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 199; display: none; }
.cart-drawer { position: fixed; top: 0; right: 0; width: 320px; height: 100vh; background: var(--bg-card); border-left: 1px solid var(--border-subtle); z-index: 200; display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.25s ease; }
.cart-drawer--open { transform: translateX(0); }
.cart-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 18px; border-bottom: 1px solid var(--border-subtle); flex-shrink: 0; }
.cart-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.cart-close { background: none; border: none; color: var(--text-muted); font-size: 14px; cursor: pointer; padding: 2px 6px; border-radius: 4px; line-height: 1; }
.cart-close:hover { color: var(--text-primary); }
.cart-empty { margin: 40px 18px; font-size: 13px; color: var(--text-muted); text-align: center; }
.cart-list { list-style: none; margin: 0; padding: 0; flex: 1; overflow-y: auto; display: flex; flex-direction: column; }
.cart-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--border-subtle); }
.cart-item-img-wrap { width: 44px; height: 44px; border-radius: 6px; overflow: hidden; flex-shrink: 0; background: var(--bg-raised); }
.cart-item-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.cart-item-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 600; color: var(--border-hover); }
.cart-item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; overflow: hidden; min-width: 0; }
.cart-item-name { font-size: 13px; font-weight: 500; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cart-item-price { font-size: 12px; color: var(--text-secondary); }
.cart-item-qty { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.cart-item-qty button { width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; background: var(--bg-raised); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-primary); font-size: 14px; cursor: pointer; line-height: 1; padding: 0; font-family: inherit; }
.cart-item-qty button:hover { border-color: var(--border-hover); }
.cart-item-qty span { font-size: 13px; color: var(--text-primary); min-width: 16px; text-align: center; }
.cart-item-remove { background: none; border: none; color: var(--text-muted); font-size: 12px; cursor: pointer; padding: 2px 4px; border-radius: 3px; flex-shrink: 0; line-height: 1; }
.cart-item-remove:hover { color: var(--accent-danger); }
.cart-footer { display: flex; flex-direction: column; gap: 8px; padding: 14px 18px; border-top: 1px solid var(--border-subtle); flex-shrink: 0; }
.cart-subtotal { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: var(--text-primary); padding-bottom: 4px; }
.selector-btn { padding: 5px 14px; border-radius: 6px; border: 1px solid var(--border-subtle); background: none; color: var(--text-secondary); font-size: 13px; cursor: pointer; transition: border-color 0.15s, color 0.15s; font-family: inherit; width: 100%; }
.selector-btn:hover { border-color: var(--border-hover); color: var(--text-primary); }
.selector-btn--active { border-color: var(--accent-primary); color: var(--text-primary); background: var(--accent-subtle); }

/* FAB */
.fab-group { position: fixed; bottom: 20px; right: 20px; display: flex; flex-direction: column; align-items: flex-end; gap: 10px; z-index: 150; }
.cart-fab { position: relative; display: flex; align-items: center; gap: 6px; padding: 0 16px; height: 40px; border-radius: 10px; background: var(--bg-nav); color: var(--text-on-nav); border: 2px solid var(--border-subtle); cursor: pointer; font-size: 13px; font-weight: 500; transition: border-color 0.15s; font-family: inherit; }
.cart-fab:hover { border-color: var(--accent-primary); }
.cart-fab-badge { display: none; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 4px; border-radius: 9px; background: var(--accent-primary); color: #fff; font-size: 11px; font-weight: 700; line-height: 1; }

/* Checkout */
.checkout-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; }
.checkout-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; display: flex; flex-direction: column; width: min(860px, calc(100vw - 32px)); max-height: 90vh; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5); z-index: 201; }
.checkout-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid var(--border-subtle); flex-shrink: 0; }
.checkout-title { font-size: 16px; font-weight: 600; color: var(--text-primary); }
.checkout-close { background: none; border: none; color: var(--text-muted); font-size: 16px; cursor: pointer; padding: 4px 6px; border-radius: 4px; line-height: 1; font-family: inherit; }
.checkout-close:hover { color: var(--text-primary); }
.checkout-steps { display: flex; align-items: center; padding: 20px 32px; border-bottom: 1px solid var(--border-subtle); flex-shrink: 0; }
.checkout-step-pip { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
.checkout-step-circle { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border-subtle); background: var(--bg-raised); color: var(--text-muted); font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
.checkout-step-pip--active .checkout-step-circle { border-color: var(--accent-primary); background: var(--accent-subtle); color: var(--accent-primary); }
.checkout-step-pip--done .checkout-step-circle { border-color: var(--accent-success); background: rgba(63,185,80,0.12); color: var(--accent-success); }
.checkout-step-label { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
.checkout-step-pip--active .checkout-step-label { color: var(--accent-primary); font-weight: 600; }
.checkout-step-pip--done .checkout-step-label { color: var(--text-secondary); }
.checkout-step-line { flex: 1; height: 2px; background: var(--border-subtle); margin: 0 8px; align-self: flex-start; margin-top: 13px; }
.checkout-step-line--done { background: var(--accent-success); }
.checkout-body { display: flex; flex: 1; min-height: 0; overflow: hidden; }
.checkout-body--confirm { justify-content: center; }
.checkout-form-col { flex: 1; overflow-y: auto; padding: 24px 28px; min-width: 0; }
.checkout-summary-col { width: 280px; flex-shrink: 0; border-left: 1px solid var(--border-subtle); overflow-y: auto; background: var(--bg-raised); }
.checkout-step-form { display: flex; flex-direction: column; gap: 14px; max-width: 440px; }
.checkout-step-heading { margin: 0 0 4px; font-size: 15px; font-weight: 600; color: var(--text-primary); }
.checkout-field { display: flex; flex-direction: column; gap: 5px; }
.checkout-field--half { flex: 1; min-width: 0; }
.checkout-field-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); }
.checkout-required { color: var(--accent-danger); }
.checkout-field-row { display: flex; gap: 12px; }
.checkout-input { width: 100%; box-sizing: border-box; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 6px; color: var(--text-primary); font-size: 14px; padding: 8px 12px; outline: none; transition: border-color 0.15s; font-family: inherit; }
.checkout-input:focus { border-color: var(--accent-primary); }
.checkout-input::placeholder { color: var(--text-muted); }
.checkout-select { cursor: pointer; appearance: auto; }
.checkout-input--mono { font-family: ui-monospace, 'Cascadia Code', monospace; letter-spacing: 0.04em; }
.checkout-payment-notice { display: flex; align-items: flex-start; gap: 7px; font-size: 12px; color: var(--text-secondary); background: var(--bg-raised); border: 1px solid var(--border-subtle); border-radius: 6px; padding: 8px 10px; line-height: 1.4; }
.checkout-payment-notice svg { flex-shrink: 0; margin-top: 1px; }
.checkout-summary { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.checkout-summary-heading { margin: 0; font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
.checkout-summary-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.checkout-summary-item { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.checkout-summary-img-wrap { position: relative; flex-shrink: 0; }
.checkout-summary-img { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-subtle); display: block; }
.checkout-summary-img-placeholder { width: 40px; height: 40px; border-radius: 6px; background: var(--bg-card); border: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; color: var(--text-muted); }
.checkout-summary-qty-badge { position: absolute; top: -6px; right: -6px; background: var(--text-secondary); color: var(--bg-card); border-radius: 10px; min-width: 18px; height: 18px; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; padding: 0 3px; }
.checkout-summary-item-name { flex: 1; color: var(--text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.checkout-summary-item-price { color: var(--text-secondary); flex-shrink: 0; }
.checkout-summary-totals { border-top: 1px solid var(--border-subtle); padding-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.checkout-summary-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); }
.checkout-summary-row--total { font-size: 14px; font-weight: 600; color: var(--text-primary); border-top: 1px solid var(--border-subtle); padding-top: 8px; margin-top: 2px; }
.checkout-confirmation { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 32px 40px; max-width: 520px; margin: 0 auto; gap: 10px; }
.checkout-confirm-icon { width: 56px; height: 56px; border-radius: 50%; background: rgba(63,185,80,0.15); border: 2px solid var(--accent-success); color: var(--accent-success); display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.checkout-confirm-heading { margin: 0; font-size: 20px; font-weight: 700; color: var(--text-primary); }
.checkout-confirm-ref { margin: 0; font-size: 13px; color: var(--text-secondary); }
.checkout-confirm-ref strong { font-family: ui-monospace, 'Cascadia Code', monospace; color: var(--text-primary); }
.checkout-confirm-email { margin: 0; font-size: 13px; color: var(--text-muted); }
.checkout-confirm-details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; width: 100%; margin-top: 16px; text-align: left; }
.checkout-confirm-section { background: var(--bg-raised); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 12px 14px; }
.checkout-confirm-section-title { margin: 0 0 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); }
.checkout-confirm-address { font-style: normal; font-size: 13px; color: var(--text-primary); line-height: 1.6; margin: 0; }
.checkout-confirm-items { list-style: none; margin: 0; padding: 0; font-size: 13px; color: var(--text-primary); line-height: 1.8; }
.checkout-confirm-qty { color: var(--text-muted); }
.checkout-footer { display: flex; align-items: center; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid var(--border-subtle); flex-shrink: 0; }
.checkout-btn { padding: 9px 22px; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; line-height: 1; font-family: inherit; }
.checkout-btn--back { background: none; border: 1px solid var(--border-subtle); color: var(--text-secondary); }
.checkout-btn--back:hover { border-color: var(--border-hover); color: var(--text-primary); }
.checkout-btn--primary { background: var(--accent-primary); border: 1px solid var(--accent-primary); color: #fff; }
.checkout-btn--primary:hover:not(:disabled) { opacity: 0.88; }
.checkout-btn--primary:disabled { opacity: 0.35; cursor: not-allowed; }

/* Help modal */
.help-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 299; }
.help-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); width: min(400px, calc(100vw - 32px)); background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 12px; z-index: 300; display: flex; flex-direction: column; box-shadow: 0 8px 32px rgba(0,0,0,0.5); overflow: hidden; }
.help-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); flex-shrink: 0; }
.help-modal-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.help-modal-close { background: none; border: none; color: var(--text-muted); font-size: 14px; cursor: pointer; padding: 2px 6px; border-radius: 4px; line-height: 1; }
.help-modal-close:hover { color: var(--text-primary); }
.help-modal-body { padding: 16px 20px 20px; font-size: 13px; color: var(--text-secondary); line-height: 1.55; }
.help-fab { width: 40px; height: 40px; border-radius: 50%; background: var(--bg-nav); border: 2px solid var(--border-subtle); color: var(--text-on-nav); font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: border-color 0.15s; font-family: inherit; }
.help-fab:hover { border-color: var(--accent-primary); }

/* Footer */
.app-footer { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 20px 24px; margin-top: auto; border-top: 1px solid var(--border-subtle); }
.footer-text { font-size: 12px; color: var(--text-muted); }
.footer-brand { font-size: 13px; font-weight: 700; color: var(--text-muted); letter-spacing: 0.03em; }
.footer-poweredby-btn { display: flex; align-items: center; gap: 8px; background: none; border: none; padding: 4px; cursor: pointer; font-family: inherit; border-radius: 6px; }
.footer-poweredby-btn:hover { background: var(--bg-raised); }
.storage-warning-banner { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 10px 20px; background: #c0392b; color: #fff; font-size: 13px; line-height: 1.4; text-align: left; position: relative; z-index: 350; }
.storage-warning-dismiss { background: none; border: none; color: #fff; cursor: pointer; font-size: 14px; line-height: 1; flex-shrink: 0; padding: 2px 6px; opacity: 0.85; }
.storage-warning-dismiss:hover { opacity: 1; }
.poweredby-hint { margin: 0; font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
.poweredby-option { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border: 1px solid var(--border-subtle); border-radius: 8px; text-decoration: none; transition: border-color 0.15s ease; }
.poweredby-option:hover { border-color: var(--accent-primary); }
.poweredby-option-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.poweredby-option-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }

/* Responsive */
@media (max-width: 860px) { .tile--detailed { width: 220px; } }
@media (max-width: 640px) {
  .checkout-modal { top: auto; bottom: 0; left: 0; right: 0; transform: none; width: 100%; border-radius: 12px 12px 0 0; max-height: 95vh; }
  .checkout-body { flex-direction: column; }
  .checkout-summary-col { width: 100%; border-left: none; border-bottom: 1px solid var(--border-subtle); max-height: 180px; }
  .checkout-confirm-details { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .cart-drawer { width: 100%; height: 88vh; top: auto; bottom: 0; right: 0; border-left: none; border-top: 1px solid var(--border-subtle); border-radius: 16px 16px 0 0; transform: translateY(100%); }
  .cart-drawer--open { transform: translateY(0); }
  .fab-group { bottom: 12px; right: 12px; gap: 8px; }
  .cart-fab { height: 36px; padding: 0 12px; font-size: 12px; }
  .help-fab { width: 36px; height: 36px; font-size: 14px; }
  .layout { padding: 16px; }
  .layout--grid .tile, .layout-featured-grid .tile { width: 100%; }
  .layout--grid .tile--standard .tile-img-wrap, .layout--grid .tile--detailed .tile-img-wrap,
  .layout-featured-grid .tile--standard .tile-img-wrap, .layout-featured-grid .tile--detailed .tile-img-wrap { height: 180px; }
  .layout-featured-slot .tile { flex-direction: column; height: auto; }
  .layout-featured-slot .tile-img-wrap, .layout-featured-slot .tile-img-wrap--sm { width: 100%; min-width: unset; height: 220px; }
  .layout-featured-slot .tile-body { padding: 16px 20px; }
  .layout-featured-slot .tile-name { font-size: 17px !important; }
  .layout-featured-slot .tile-price { font-size: 14px !important; }
  .layout--stacked { max-width: 100%; }
  .layout--stacked .tile-meta-row { flex-wrap: wrap; }
  .layout--stacked .tile-meta-row dd { white-space: normal; overflow: visible; text-overflow: unset; }
}`;
}

// ── Navbar HTML ────────────────────────────────────────────────────────────

function buildWidgetHTML(widget) {
  if (!widget) return '';
  const c = widget.content;
  if (c === 'Cart') {
    return '<button class="navbar-action-btn" data-action="open-cart">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>' +
      'Cart<span class="navbar-cart-badge" id="navbar-cart-badge" style="display:none"></span></button>';
  }
  if (c === 'Search') {
    return '<input class="navbar-search-input" type="text" placeholder="Search…" id="navbar-search-input">';
  }
  if (c === 'Dropdown' && widget.options?.length) {
    return '<select class="navbar-dropdown">' +
      widget.options.map((o) => '<option>' + esc(o) + '</option>').join('') +
      '</select>';
  }
  if (c === 'Help') {
    return '<button class="navbar-action-btn" data-action="open-help">Help</button>';
  }
  return '';
}

function buildNavbarHTML(state, logoDataUrl) {
  const SLOTS = ['left', 'centerLeft', 'center', 'centerRight', 'right'];
  const widgets = state.widgets || {};

  const brandHTML = logoDataUrl
    ? '<img class="navbar-brand-logo" src="' + logoDataUrl + '" alt="Store logo">'
    : '<span class="navbar-brand-text">Store</span>';

  const slotsHTML = SLOTS
    .map((key) => {
      const html = buildWidgetHTML(widgets[key]);
      return html ? '<div class="navbar-slot">' + html + '</div>' : '';
    })
    .filter(Boolean)
    .join('');

  return '<nav class="Navbar"><div class="navbar-brand">' + brandHTML + '</div>' +
    (slotsHTML ? '<div class="navbar-slots">' + slotsHTML + '</div>' : '') +
    '</nav>';
}

// ── Vanilla JS storefront ──────────────────────────────────────────────────

function buildScriptContent(state) {
  const stockJson  = safeJSON((state.stockList || []).filter((item) => !item.is_sample));
  // Falls back to a fresh id if this config was never opened in the live
  // editor (e.g. hand-written config JSON) - namespaces every localStorage
  // key below so two different exported sites hosted under the same origin
  // (or the same site re-exported later) don't corrupt each other's guest
  // cart/reservations/suggestions data.
  const siteId = state.siteId || Math.random().toString(36).slice(2, 10);
  const configJson = safeJSON({
    siteId:             siteId,
    websiteType:        state.websiteType,
    firebaseDatabaseUrl: state.integrations?.firebaseDatabaseUrl?.trim().replace(/\/$/, '') || null,
    tileConfig:         state.tileConfig,
    layoutConfig:       state.layoutConfig,
    layoutAlign:        state.layoutAlign || 'center',
    searchAlign:        state.searchAlign || 'center',
    suggestFormAlign:   state.suggestFormAlign || 'center',
    widgets:            state.widgets,
    groupByCategory:    state.groupByCategory,
    categoryConfig:     state.categoryConfig,
    currencyPrefix:     state.brand?.currencyPrefix || '$',
    // Only SHA-256 fingerprints of the two passcodes ship in the exported
    // page - never the plaintext - so nobody can read them out of the
    // deployed site's source. Runtime checks compare sha256(input) to these.
    ownerPasscodeHash:  state.integrations?.ownerPasscode ? sha256(state.integrations.ownerPasscode) : '',
    telemetryUrl:       TELEMETRY_FIREBASE_URL || '',
    pageTitle:          state.brand?.pageTitle || '',
    giftSuggestionsEnabled: state.giftSuggestionsEnabled !== false,
    accessGate:         state.accessGate?.enabled && state.accessGate.password
      ? { enabled: true, passwordHash: sha256(state.accessGate.password) }
      : { enabled: false, passwordHash: '' },
    cashFund:           state.cashFund || { enabled: false },
  });

  // String.raw is load-bearing: a plain template literal *cooks* escape
  // sequences, so the regex `\/` and `\s` escapes below would ship to the
  // exported page with their backslashes stripped - turning `/\/$/` into a
  // `//` line comment (killing the whole script's parse) and the email
  // regexes into patterns that reject any address containing a literal "s".
  // Raw mode emits every backslash verbatim, so what you read here is
  // byte-for-byte what the exported <script> contains. (${...} interpolation
  // still works in raw mode; only escape processing is disabled.)
  /* eslint-disable no-useless-escape */
  return String.raw`
var STOCK  = ${stockJson};
var CONFIG = ${configJson};
var KEY_PREFIX = 'wk_' + (CONFIG.siteId || 'default') + '_';

/* ── Helpers ──────────────────────────────────────────── */
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// A suggestion's "link" is free text from a guest - rendering it as a
// clickable href without checking the scheme would let someone submit a
// javascript: URL that runs in the registry owner's browser the moment
// they click "View link".
function isSafeUrl(url) {
  return /^https?:\/\//i.test(String(url || '').trim());
}

/* ── SHA-256 (mirror of src/utils/sha256.js - keep in sync) ──────────────
   The Owner passcode and Guest Access password are embedded in this page
   only as SHA-256 fingerprints, never plaintext. Entered values are hashed
   here and compared against those fingerprints. Pure JS (not crypto.subtle)
   so it stays synchronous and works over file:// and plain http too. */
var SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function sha256(message) {
  var bytes = [];
  for (var ci = 0; ci < message.length; ci++) {
    var code = message.charCodeAt(ci);
    if (code >= 0xd800 && code <= 0xdbff && ci + 1 < message.length) {
      var lo = message.charCodeAt(ci + 1);
      if (lo >= 0xdc00 && lo <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (lo - 0xdc00);
        ci++;
      }
    }
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) bytes.push(0xc0 | (code >> 6), 0x80 | (code & 63));
    else if (code < 0x10000) bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
    else bytes.push(0xf0 | (code >> 18), 0x80 | ((code >> 12) & 63), 0x80 | ((code >> 6) & 63), 0x80 | (code & 63));
  }

  var bitLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  bytes.push(0, 0, 0, Math.floor(bitLen / 0x100000000) & 0xff);
  bytes.push((bitLen >>> 24) & 0xff, (bitLen >>> 16) & 0xff, (bitLen >>> 8) & 0xff, bitLen & 0xff);

  var h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  var h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  var w = new Array(64);

  for (var off = 0; off < bytes.length; off += 64) {
    for (var i = 0; i < 16; i++) {
      w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) | (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
    }
    for (var t = 16; t < 64; t++) {
      var s0 = ((w[t - 15] >>> 7) | (w[t - 15] << 25)) ^ ((w[t - 15] >>> 18) | (w[t - 15] << 14)) ^ (w[t - 15] >>> 3);
      var s1 = ((w[t - 2] >>> 17) | (w[t - 2] << 15)) ^ ((w[t - 2] >>> 19) | (w[t - 2] << 13)) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }

    var a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (var r = 0; r < 64; r++) {
      var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      var ch = (e & f) ^ (~e & g);
      var temp1 = (h + S1 + ch + SHA256_K[r] + w[r]) | 0;
      var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      var maj = (a & b) ^ (a & c) ^ (b & c);
      var temp2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + temp1) | 0;
      d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map(function (v) { return ('00000000' + (v >>> 0).toString(16)).slice(-8); })
    .join('');
}

function showStorageWarning() {
  var el = document.getElementById('storage-warning-banner');
  if (el) { el.style.display = 'flex'; return; }
  el = document.createElement('div');
  el.id = 'storage-warning-banner';
  el.className = 'storage-warning-banner';
  el.setAttribute('role', 'alert');
  el.innerHTML = '<span>Your browser’s storage is full, so this action may not have been saved. Try freeing up space or use a different device/browser.</span>' +
    '<button type="button" class="storage-warning-dismiss" aria-label="Dismiss">&#10005;</button>';
  el.querySelector('.storage-warning-dismiss').addEventListener('click', function(){ el.style.display = 'none'; });
  document.body.insertBefore(el, document.body.firstChild);
}

// Wraps localStorage.setItem so a full/blocked store doesn't silently
// swallow a guest or owner action - surfaces a visible banner instead.
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    showStorageWarning();
    return false;
  }
}

/* ── Cart state ───────────────────────────────────────── */
var cart = JSON.parse(localStorage.getItem(KEY_PREFIX + 'cart') || '[]');
var reservations = {}; // itemId -> { guestName: reservedCount }
var guestName = localStorage.getItem(KEY_PREFIX + 'guestName') || '';
var query = '';
var fbUrl = (CONFIG.firebaseDatabaseUrl || '').replace(/\/$/, '') || null;
var CP = CONFIG.currencyPrefix || '$';

function applyReservationAtPath(path, data) {
  var segments = path.split('/').filter(function(s){ return s; });

  if (segments.length === 0) {
    var next = {};
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(function(itemId){
        var guests = data[itemId];
        if (!guests || typeof guests !== 'object') return;
        var cleaned = {};
        Object.keys(guests).forEach(function(g){ if (guests[g] > 0) cleaned[g] = guests[g]; });
        if (Object.keys(cleaned).length) next[itemId] = cleaned;
      });
    }
    reservations = next;
  } else if (segments.length === 1) {
    var itemId = segments[0];
    if (data && typeof data === 'object') {
      var cleaned2 = {};
      Object.keys(data).forEach(function(g){ if (data[g] > 0) cleaned2[g] = data[g]; });
      if (Object.keys(cleaned2).length) reservations[itemId] = cleaned2; else delete reservations[itemId];
    } else {
      delete reservations[itemId];
    }
  } else {
    var iid = segments[0], guest = segments[1];
    var itemRes = reservations[iid] || {};
    if (data > 0) itemRes[guest] = data; else delete itemRes[guest];
    if (Object.keys(itemRes).length) reservations[iid] = itemRes; else delete reservations[iid];
  }

  renderTiles();
  renderOwnerView();
}

function initReservations() {
  if (!fbUrl) {
    reservations = JSON.parse(localStorage.getItem(KEY_PREFIX + 'reservations') || '{}');
    return;
  }
  // A malformed Firebase URL throws synchronously here rather than failing
  // gracefully - guard it so one bad paste in the owner's Integrations panel
  // can't crash the whole page for every guest.
  var es;
  try {
    es = new EventSource(fbUrl + '/reservations.json');
  } catch (e) {
    reservations = JSON.parse(localStorage.getItem(KEY_PREFIX + 'reservations') || '{}');
    return;
  }
  es.addEventListener('put', function(evt) {
    var payload = JSON.parse(evt.data);
    applyReservationAtPath(payload.path, payload.data);
  });
  es.addEventListener('patch', function(evt) {
    var payload = JSON.parse(evt.data);
    var data = payload.data;
    if (!data || typeof data !== 'object') return;
    Object.keys(data).forEach(function(key) {
      applyReservationAtPath(payload.path === '/' ? '/' + key : payload.path + '/' + key, data[key]);
    });
  });
}

function reserveItem(id, delta, name) {
  var guest = (name || guestName || '').trim() || 'Anonymous';
  var itemReservations = reservations[id] || {};
  var current = itemReservations[guest] || 0;
  var next = Math.max(0, current + delta);

  if (delta > 0) {
    var item = allStock().find(function(i){ return i.id === id; });
    var needed = item ? (item.quantity || 0) : 0;
    if (needed > 0) {
      var othersTotal = 0;
      Object.keys(itemReservations).forEach(function(g){ if (g !== guest) othersTotal += itemReservations[g]; });
      var maxForGuest = Math.max(0, needed - othersTotal);
      next = Math.min(next, maxForGuest);
      if (next === current) return;
    }
  }

  function applyLocal() {
    var nextReservations = Object.assign({}, reservations);
    var itemRes = Object.assign({}, nextReservations[id] || {});
    if (next === 0) delete itemRes[guest]; else itemRes[guest] = next;
    if (Object.keys(itemRes).length) nextReservations[id] = itemRes; else delete nextReservations[id];
    reservations = nextReservations;
    safeSetItem(KEY_PREFIX + 'reservations', JSON.stringify(reservations));
    renderTiles();
    renderOwnerView();
  }

  if (!fbUrl) { applyLocal(); return; }

  var opts = next === 0
    ? { method: 'DELETE' }
    : { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) };
  // SSE will fire back and update reservations + re-render on success; a
  // failed write (bad rules, wrong URL) never triggers that echo, so fall
  // back to a local update instead of leaving the guest's click looking dead.
  fetch(fbUrl + '/reservations/' + encodeURIComponent(id) + '/' + encodeURIComponent(guest) + '.json', opts)
    .then(function(res) { if (!res.ok) applyLocal(); })
    .catch(function() { applyLocal(); });
}

/* ── Gift suggestions ───────────────────────────────────── */
var suggestions = {};

function applySuggestionAtPath(path, data) {
  var segments = path.split('/').filter(function(s){ return s; });
  if (segments.length === 0) {
    suggestions = (data && typeof data === 'object') ? data : {};
  } else if (segments.length === 1) {
    var id = segments[0];
    if (data) suggestions[id] = data; else delete suggestions[id];
  } else {
    var sid = segments[0], field = segments[1];
    suggestions[sid] = Object.assign({}, suggestions[sid] || {});
    suggestions[sid][field] = data;
  }
  renderOwnerView();
  // Approved suggestions render as tiles (see approvedSuggestionItems), so
  // any suggestion change can change the grid.
  renderTiles();
}

function initSuggestions() {
  if (!fbUrl) {
    suggestions = JSON.parse(localStorage.getItem(KEY_PREFIX + 'suggestions') || '{}');
    return;
  }
  var es;
  try {
    es = new EventSource(fbUrl + '/suggestions.json');
  } catch (e) {
    suggestions = JSON.parse(localStorage.getItem(KEY_PREFIX + 'suggestions') || '{}');
    return;
  }
  es.addEventListener('put', function(evt) {
    var payload = JSON.parse(evt.data);
    applySuggestionAtPath(payload.path, payload.data);
  });
  es.addEventListener('patch', function(evt) {
    var payload = JSON.parse(evt.data);
    var data = payload.data;
    if (!data || typeof data !== 'object') return;
    Object.keys(data).forEach(function(key) {
      applySuggestionAtPath(payload.path === '/' ? '/'+key : payload.path+'/'+key, data[key]);
    });
  });
}

function suggestGift(name, quantity, email, link, image, reserve, reservedBy) {
  var id = 'sg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  var suggestion = { name: name, quantity: Math.max(0, Number(quantity) || 0), email: email, link: link || '', image: image || '', reserve: !!reserve, reservedBy: reserve ? (reservedBy || '').trim() : '', status: 'pending', createdAt: Date.now() };
  safeSetItem(KEY_PREFIX + 'guestEmail', email);
  if (suggestion.reservedBy) {
    // Store the reserver's identity so their eventual reservation (created on
    // approval) belongs to the same guest name they'd reserve other items under.
    guestName = suggestion.reservedBy;
    safeSetItem(KEY_PREFIX + 'guestName', guestName);
  }
  if (!fbUrl) {
    suggestions[id] = suggestion;
    safeSetItem(KEY_PREFIX + 'suggestions', JSON.stringify(suggestions));
    return Promise.resolve(true);
  }
  return fetch(fbUrl + '/suggestions/' + id + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(suggestion),
  }).then(function(res) { return res.ok; }).catch(function() { return false; });
}

function setSuggestionFields(id, fields) {
  if (!suggestions[id]) return;

  function applyLocal() {
    suggestions[id] = Object.assign({}, suggestions[id], fields);
    safeSetItem(KEY_PREFIX + 'suggestions', JSON.stringify(suggestions));
    renderOwnerView();
    renderTiles();
  }

  if (!fbUrl) { applyLocal(); return; }

  // SSE echoes the patch back on success; a failed write never does, so fall
  // back to a local update instead of leaving the owner's click looking dead.
  fetch(fbUrl + '/suggestions/' + encodeURIComponent(id) + '.json', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  }).then(function(res) { if (!res.ok) applyLocal(); }).catch(function() { applyLocal(); });
}

function setSuggestionStatus(id, status) { setSuggestionFields(id, { status: status }); }

// Approving persists status + final name/quantity on the suggestion record
// itself; the registry item is derived from that record on every load (see
// approvedSuggestionItems), so approvals survive reloads and are visible to
// every visitor - not just the session that clicked Approve.
function approveSuggestionAction(id, finalQuantity, finalName) {
  var s = suggestions[id];
  if (!s) return;
  var finalQty = Math.max(0, Number(finalQuantity) || 0);
  var wantsToBring = !!s.reserve && s.reservedBy;
  var suggestedQty = Math.max(1, Number(s.quantity) || 1);
  setSuggestionFields(id, {
    status: 'approved',
    quantity: finalQty,
    name: (finalName || '').trim() || s.name,
  });
  // The suggester asked to bring it themselves: reserve on their behalf,
  // capped at the approved quantity. The derived item id is deterministic,
  // so the reservation attaches even before the SSE echo lands.
  if (wantsToBring) {
    var reserveQty = finalQty > 0 ? Math.min(suggestedQty, finalQty) : suggestedQty;
    reserveItem('approved_' + id, reserveQty, s.reservedBy);
  }
}

var SUGGESTED_CAT = 'Suggested Gifts';

function approvedSuggestionItems() {
  return Object.keys(suggestions)
    .filter(function(id){ return suggestions[id] && suggestions[id].status === 'approved'; })
    .sort(function(a, b){ return (suggestions[a].createdAt || 0) - (suggestions[b].createdAt || 0); })
    .map(function(id){
      var s = suggestions[id];
      return {
        id: 'approved_' + id, name: s.name, image: s.image || '', price: 0,
        metadata: (s.link && isSafeUrl(s.link)) ? { Link: s.link } : {},
        categories: [SUGGESTED_CAT],
        quantity: Math.max(0, Number(s.quantity) || 0), nameRequired: true, is_sample: false,
      };
    });
}

function allStock() { return STOCK.concat(approvedSuggestionItems()); }

/* ── Cash fund ────────────────────────────────────────── */
var cashPledges = {};

function applyCashPledgeAtPath(path, data) {
  var segments = path.split('/').filter(function(s){ return s; });
  if (segments.length === 0) {
    cashPledges = (data && typeof data === 'object') ? data : {};
  } else {
    var id = segments[0];
    if (data) cashPledges[id] = data; else delete cashPledges[id];
  }
  renderOwnerView();
  renderCashFundCard();
}

function initCashPledges() {
  if (!fbUrl) {
    cashPledges = JSON.parse(localStorage.getItem(KEY_PREFIX + 'cashPledges') || '{}');
    return;
  }
  var es;
  try {
    es = new EventSource(fbUrl + '/cashPledges.json');
  } catch (e) {
    cashPledges = JSON.parse(localStorage.getItem(KEY_PREFIX + 'cashPledges') || '{}');
    return;
  }
  es.addEventListener('put', function(evt) {
    var payload = JSON.parse(evt.data);
    applyCashPledgeAtPath(payload.path, payload.data);
  });
  es.addEventListener('patch', function(evt) {
    var payload = JSON.parse(evt.data);
    var data = payload.data;
    if (!data || typeof data !== 'object') return;
    Object.keys(data).forEach(function(key) {
      applyCashPledgeAtPath(payload.path === '/' ? '/'+key : payload.path+'/'+key, data[key]);
    });
  });
}

function pledgeCash(name, email, amount, message) {
  var id = 'cp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  var pledge = { name: name || 'Anonymous', email: email, amount: Math.max(0, Number(amount) || 0), message: message || '', createdAt: Date.now() };
  safeSetItem(KEY_PREFIX + 'guestEmail', email);
  if (!fbUrl) {
    cashPledges[id] = pledge;
    safeSetItem(KEY_PREFIX + 'cashPledges', JSON.stringify(cashPledges));
    renderCashFundCard();
    return Promise.resolve(true);
  }
  return fetch(fbUrl + '/cashPledges/' + id + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pledge),
  }).then(function(res) { return res.ok; }).catch(function() { return false; });
}

function removePledgeAction(id) {
  delete cashPledges[id];
  if (!fbUrl) {
    safeSetItem(KEY_PREFIX + 'cashPledges', JSON.stringify(cashPledges));
    renderOwnerView();
    renderCashFundCard();
    return;
  }
  fetch(fbUrl + '/cashPledges/' + id + '.json', { method: 'DELETE' }).catch(function(){});
}

function cashPledgeTotal() {
  return Object.values(cashPledges).reduce(function(sum, p) { return sum + (Number(p.amount) || 0); }, 0);
}

function renderCashFundCard() {
  var container = document.getElementById('cash-fund-container');
  if (!container) return;
  var fund = CONFIG.cashFund || {};
  if (CONFIG.websiteType !== 'registry' || !fund.enabled) { container.style.display = 'none'; return; }
  container.style.display = 'block';

  var total = cashPledgeTotal();
  var goal = Number(fund.goalAmount) || 0;
  var pct = goal > 0 ? Math.min(100, Math.round((total / goal) * 100)) : 0;

  var progressHTML = '';
  if (fund.showTotalPledged || goal > 0) {
    progressHTML = '<div class="cash-fund-progress">' +
      (fund.showTotalPledged ? '<span class="cash-fund-total">' + CP + total.toFixed(2) + ' pledged' + (goal > 0 ? ' of ' + CP + goal.toFixed(2) + ' goal' : '') + '</span>' : '') +
      (goal > 0 ? '<div class="cash-fund-bar"><div class="cash-fund-bar-fill" style="width:' + pct + '%"></div></div>' : '') +
      '</div>';
  }

  function bankBlock(label, details) {
    if (!details) return '';
    return '<div class="cash-fund-bank-block">' +
      (label ? '<p class="cash-fund-bank-label">' + esc(label) + '</p>' : '') +
      '<pre class="cash-fund-bank-details">' + esc(details) + '</pre></div>';
  }
  var bankHTML = fund.bankDetailsEnabled
    ? bankBlock(fund.bankDetailsLabel, fund.bankDetails) +
      (fund.bankDetails2Enabled ? bankBlock(fund.bankDetails2Label, fund.bankDetails2) : '')
    : '';

  container.innerHTML =
    '<div class="cash-fund-card">' +
      '<p class="cash-fund-heading">' + esc(fund.title || 'Cash Fund') + '</p>' +
      (fund.message ? '<p class="cash-fund-message">' + esc(fund.message) + '</p>' : '') +
      progressHTML +
      bankHTML +
      '<form class="cash-fund-form" id="cash-fund-form">' +
        '<p class="cash-fund-form-hint">Contributing? Let us know so we can say thank you.</p>' +
        '<input class="editor-add-form-input" type="text" placeholder="Your name" id="cf-name" value="' + esc(guestName) + '">' +
        '<input class="editor-add-form-input" type="number" min="0" step="0.01" placeholder="Amount (' + esc(CP) + ')" id="cf-amount">' +
        '<input class="editor-add-form-input" type="email" placeholder="Your email" id="cf-email" value="' + esc(localStorage.getItem(KEY_PREFIX + 'guestEmail') || '') + '">' +
        '<input class="editor-add-form-input" type="text" placeholder="Message (optional)" id="cf-message">' +
        '<p class="suggest-gift-error" id="cf-error" style="display:none"></p>' +
        '<button type="submit" class="selector-btn selector-btn--active">Record my pledge</button>' +
      '</form>' +
    '</div>';

  document.getElementById('cash-fund-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var name = document.getElementById('cf-name').value.trim();
    var amount = document.getElementById('cf-amount').value;
    var email = document.getElementById('cf-email').value.trim();
    var message = document.getElementById('cf-message').value.trim();
    var err = document.getElementById('cf-error');
    if (!(Number(amount) > 0)) { err.textContent = 'Enter an amount greater than 0.'; err.style.display = 'block'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'That doesn’t look like a valid email address.'; err.style.display = 'block'; return; }
    err.style.display = 'none';
    var submitBtn = document.getElementById('cash-fund-form').querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Recording...';
    pledgeCash(name, email, amount, message).then(function(ok) {
      if (ok) {
        container.innerHTML = '<div class="cash-fund-card"><p class="cash-fund-thanks">Thanks! Your pledge has been recorded.</p></div>';
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Record my pledge';
        err.textContent = 'Something went wrong recording your pledge. Check your connection and try again.';
        err.style.display = 'block';
      }
    });
  });
}

var SUGGEST_FORM_MARGIN_CSS = { left: '32px auto 32px 24px', center: '32px auto', right: '32px 24px 32px auto' };

function initSuggestGiftForm() {
  var container = document.getElementById('suggest-gift-container');
  if (!container) return;
  if (CONFIG.websiteType !== 'registry' || !CONFIG.giftSuggestionsEnabled) { container.style.display = 'none'; return; }
  container.style.display = 'block';
  var margin = SUGGEST_FORM_MARGIN_CSS[CONFIG.suggestFormAlign] || SUGGEST_FORM_MARGIN_CSS.center;
  var savedEmail = localStorage.getItem(KEY_PREFIX + 'guestEmail') || '';
  container.innerHTML =
    '<form class="suggest-gift-form" id="suggest-gift-form" style="margin:' + margin + '">' +
      '<p class="suggest-gift-heading">Suggest a gift</p>' +
      '<p class="suggest-gift-hint">Don’t see something you’d like to give? Suggest it below - the registry owner reviews every suggestion before it’s added.</p>' +
      '<input class="editor-add-form-input" type="text" placeholder="Item name" id="sg-name">' +
      '<input class="editor-add-form-input" type="number" min="0" step="1" placeholder="Suggested quantity" id="sg-qty" value="1">' +
      '<input class="editor-add-form-input" type="url" placeholder="Link to it online (optional)" id="sg-link">' +
      '<div class="suggest-gift-image-row">' +
        '<img id="sg-image-preview" class="suggest-gift-image-preview" style="display:none">' +
        '<label class="selector-btn config-import-label suggest-gift-image-btn" id="sg-image-label">Add a photo (optional)' +
          '<input type="file" accept="image/*" id="sg-image" hidden>' +
        '</label>' +
        '<button type="button" class="suggestion-reject-btn" id="sg-image-remove" style="display:none">Remove</button>' +
      '</div>' +
      '<label class="editor-checkbox-row suggest-reserve-row"><input type="checkbox" id="sg-reserve"> <span>I&rsquo;d like to reserve this gift myself once it&rsquo;s approved</span></label>' +
      '<input class="editor-add-form-input" type="text" placeholder="Your name (for the reservation)" id="sg-guest-name" style="display:none" value="' + esc(guestName || '') + '">' +
      '<input class="editor-add-form-input" type="email" placeholder="Your email" id="sg-email" value="' + esc(savedEmail) + '">' +
      '<p class="suggest-gift-email-note">We only check this looks like a real email address - it isn’t verified. Used so the owner can follow up about your suggestion.</p>' +
      '<p class="suggest-gift-error" id="sg-error" style="display:none"></p>' +
      '<button type="submit" class="selector-btn selector-btn--active">Submit suggestion</button>' +
    '</form>';

  var imageData = '';
  var imageInput = document.getElementById('sg-image');
  var imagePreview = document.getElementById('sg-image-preview');
  var imageLabel = document.getElementById('sg-image-label');
  var imageRemove = document.getElementById('sg-image-remove');
  var err = document.getElementById('sg-error');
  imageInput.addEventListener('change', function() {
    var file = imageInput.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      err.textContent = 'That image is too large (max 3MB). Try a smaller photo.';
      err.style.display = 'block';
      imageInput.value = '';
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      imageData = e.target.result;
      imagePreview.src = imageData;
      imagePreview.style.display = 'block';
      imageLabel.textContent = 'Replace photo';
      imageRemove.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });
  imageRemove.addEventListener('click', function() {
    imageData = '';
    imageInput.value = '';
    imagePreview.style.display = 'none';
    imageLabel.textContent = 'Add a photo (optional)';
    imageRemove.style.display = 'none';
  });

  var reserveCheck = document.getElementById('sg-reserve');
  var reserveName = document.getElementById('sg-guest-name');
  reserveCheck.addEventListener('change', function() {
    reserveName.style.display = reserveCheck.checked ? 'block' : 'none';
  });

  document.getElementById('suggest-gift-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var name = document.getElementById('sg-name').value.trim();
    var qty = document.getElementById('sg-qty').value;
    var link = document.getElementById('sg-link').value.trim();
    var email = document.getElementById('sg-email').value.trim();
    var wantsReserve = reserveCheck.checked;
    var reserverName = reserveName.value.trim();
    if (!name) { err.textContent = 'Add an item name.'; err.style.display = 'block'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent = 'That doesn’t look like a valid email address.'; err.style.display = 'block'; return; }
    if (link && !isSafeUrl(link)) { err.textContent = 'Links must start with http:// or https://.'; err.style.display = 'block'; return; }
    if (wantsReserve && !reserverName) { err.textContent = 'Add your name so the reservation can be recorded for you.'; err.style.display = 'block'; return; }
    err.style.display = 'none';
    var submitBtn = document.getElementById('suggest-gift-form').querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    suggestGift(name, qty, email, link, imageData, wantsReserve, reserverName).then(function(ok) {
      if (ok) {
        container.innerHTML = '<div class="suggest-gift-form suggest-gift-form--done" style="margin:' + margin + '"><p class="suggest-gift-thanks">Thanks! Your suggestion has been sent to the registry owner for approval.</p></div>';
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit suggestion';
        err.textContent = 'Something went wrong sending your suggestion. Check your connection and try again.';
        err.style.display = 'block';
      }
    });
  });
}

/* ── Guest name prompt ─────────────────────────────────── */
function openNameModal(itemId) {
  var item = allStock().find(function(i){ return i.id === itemId; });
  document.getElementById('name-modal-container').innerHTML =
    '<div class="modal-backdrop" data-action="close-name-modal"></div>' +
    '<div class="owner-gate-modal" role="dialog" aria-modal="true">' +
      '<form id="name-modal-form">' +
        '<p class="owner-gate-title">Reserve ' + (item ? '&quot;' + esc(item.name) + '&quot;' : 'item') + '</p>' +
        '<p class="owner-gate-body">Add your name so the registry owner can see who reserved what. This helps avoid duplicate or bad-faith reservations.</p>' +
        '<input type="text" class="owner-gate-input" id="name-modal-input" placeholder="Your name" autofocus>' +
        '<div class="owner-gate-actions">' +
          '<button type="submit" class="selector-btn selector-btn--active">Reserve</button>' +
          '<button type="button" class="selector-btn" data-action="close-name-modal">Cancel</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  document.getElementById('name-modal-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var val = document.getElementById('name-modal-input').value.trim();
    if (!val) return;
    guestName = val;
    safeSetItem(KEY_PREFIX + 'guestName', val);
    reserveItem(itemId, 1, val);
    closeNameModal();
  });
}
function closeNameModal() { document.getElementById('name-modal-container').innerHTML = ''; }

/* ── Owner gate + owner view ───────────────────────────── */
var ownerUnlocked = false;
var ownerViewOpen  = false;

function openOwnerGate() {
  if (!CONFIG.ownerPasscodeHash) return;
  document.getElementById('owner-gate-container').innerHTML =
    '<div class="modal-backdrop" data-action="close-owner-gate"></div>' +
    '<div class="owner-gate-modal" role="dialog" aria-modal="true">' +
      '<form id="owner-gate-form">' +
        '<p class="owner-gate-title">Owner access</p>' +
        '<p class="owner-gate-body">Enter the owner passcode to view reservations and gift suggestions.</p>' +
        '<input type="password" class="owner-gate-input" id="owner-gate-input" autofocus>' +
        '<p class="owner-gate-error" id="owner-gate-error" style="display:none">Incorrect passcode.</p>' +
        '<div class="owner-gate-actions">' +
          '<button type="submit" class="selector-btn selector-btn--active">Unlock</button>' +
          '<button type="button" class="selector-btn" data-action="close-owner-gate">Cancel</button>' +
        '</div>' +
      '</form>' +
    '</div>';
  document.getElementById('owner-gate-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var val = document.getElementById('owner-gate-input').value;
    if (sha256(val) === CONFIG.ownerPasscodeHash) {
      ownerUnlocked = true;
      closeOwnerGate();
      openOwnerView();
    } else {
      document.getElementById('owner-gate-error').style.display = 'block';
    }
  });
}
function closeOwnerGate() { document.getElementById('owner-gate-container').innerHTML = ''; }

function openOwnerView() {
  if (!ownerUnlocked) return;
  // Once unlocked, keep a FAB around so closing the popup doesn't strand the
  // owner - it reopens without asking for the passcode again this session.
  var ownerFab = document.getElementById('owner-fab');
  if (ownerFab) ownerFab.style.display = 'flex';
  ownerViewOpen = true;
  document.getElementById('owner-view-container').innerHTML =
    '<div class="modal-backdrop" data-action="close-owner-view"></div>' +
    '<div class="owner-view-modal" role="dialog" aria-modal="true">' +
      '<div class="owner-view-header"><span class="owner-view-title">Registry activity</span>' +
        '<button class="owner-view-close" data-action="close-owner-view">✕</button></div>' +
      '<div class="owner-view-body" id="owner-view-body"></div>' +
    '</div>';
  renderOwnerView();
}
function closeOwnerView() {
  ownerViewOpen = false;
  document.getElementById('owner-view-container').innerHTML = '';
}

function renderOwnerView() {
  if (!ownerViewOpen) return;
  var body = document.getElementById('owner-view-body');
  if (!body) return;

  var html = '';

  function suggestionEditorHTML(id, s, actionsHTML) {
    return '<div class="owner-view-item">' +
      '<div class="suggestion-row-top">' +
        (s.image ? '<img src="' + esc(s.image) + '" alt="" class="suggestion-row-thumb">' : '') +
        '<div class="suggestion-row-info">' +
          '<input type="text" class="editor-add-form-input" id="name-' + id + '" value="' + esc(s.name) + '" aria-label="Item name">' +
          '<div class="owner-view-row"><span>Suggested qty ' + Math.max(0, Number(s.quantity) || 0) + ' &middot; ' + esc(s.email) +
            (s.reserve && s.reservedBy ? ' &middot; ' + esc(s.reservedBy) + ' wants to bring it' : '') + '</span></div>' +
          (s.link && isSafeUrl(s.link) ? '<a href="' + esc(s.link) + '" target="_blank" rel="noopener noreferrer" class="suggestion-row-link">View link ↗</a>' : '') +
        '</div>' +
      '</div>' +
      '<div class="owner-view-row">' +
        '<label class="selector-btn suggestion-photo-btn">' + (s.image ? 'Replace photo' : 'Add photo') +
          '<input type="file" accept="image/*" hidden data-action="suggestion-image" data-id="' + id + '">' +
        '</label>' +
      '</div>' +
      '<div class="owner-view-row">' +
        '<input type="number" min="0" step="1" class="suggestion-qty-input" id="qty-' + id + '" value="' + Math.max(0, Number(s.quantity) || 0) + '">' +
        actionsHTML +
      '</div></div>';
  }

  var pendingIds = Object.keys(suggestions).filter(function(id){ return suggestions[id].status === 'pending'; });
  if (pendingIds.length) {
    html += '<p class="owner-view-section-title">Gift suggestions</p>';
    pendingIds.forEach(function(id) {
      html += suggestionEditorHTML(id, suggestions[id],
        '<button class="owner-view-release-btn" data-action="approve-suggestion" data-id="' + id + '">Approve</button>' +
        '<button class="owner-view-release-btn" data-action="reject-suggestion" data-id="' + id + '">Reject</button>');
    });
  }

  var approvedIds = Object.keys(suggestions).filter(function(id){ return suggestions[id].status === 'approved'; });
  if (approvedIds.length) {
    html += '<p class="owner-view-section-title">Approved suggestions (shown to guests)</p>';
    approvedIds.forEach(function(id) {
      html += suggestionEditorHTML(id, suggestions[id],
        '<button class="owner-view-release-btn" data-action="save-suggestion" data-id="' + id + '">Save</button>' +
        '<button class="owner-view-release-btn" data-action="reject-suggestion" data-id="' + id + '">Remove</button>');
    });
  }

  var withReservations = allStock().filter(function(i){ return reservations[i.id] && Object.keys(reservations[i.id]).length; });
  if (withReservations.length) {
    html += '<p class="owner-view-section-title">Reservations</p>';
    withReservations.forEach(function(item) {
      var byGuest = reservations[item.id];
      html += '<div class="owner-view-item"><div class="owner-view-item-name">' + esc(item.name) + '</div>';
      Object.keys(byGuest).forEach(function(guest) {
        html += '<div class="owner-view-row"><span>' + esc(guest) + ' &times; ' + byGuest[guest] + '</span>' +
          '<button class="owner-view-release-btn" data-action="release-reservation" data-id="' + item.id + '" data-guest="' + esc(guest) + '">Release</button></div>';
      });
      html += '</div>';
    });
  }

  var pledgeIds = Object.keys(cashPledges);
  if (pledgeIds.length) {
    html += '<p class="owner-view-section-title">Cash pledges (' + CP + cashPledgeTotal().toFixed(2) + ' total)</p>';
    pledgeIds.forEach(function(id) {
      var p = cashPledges[id];
      html += '<div class="owner-view-item"><div class="owner-view-item-name">' + esc(p.name) + ' - ' + CP + Number(p.amount || 0).toFixed(2) + '</div>' +
        '<div class="owner-view-row"><span>' + esc(p.email) + (p.message ? ' &middot; “' + esc(p.message) + '”' : '') + '</span>' +
        '<button class="owner-view-release-btn" data-action="remove-pledge" data-id="' + id + '">Remove</button></div></div>';
    });
  }

  if (!pendingIds.length && !approvedIds.length && !withReservations.length && !pledgeIds.length) {
    html = '<p class="owner-view-empty">Nothing to review yet.</p>';
  }

  body.innerHTML = html;
}

function releaseReservation(itemId, guest) {
  var itemRes = reservations[itemId] || {};
  if (!(itemRes[guest] > 0)) return;

  if (!fbUrl) {
    delete itemRes[guest];
    if (Object.keys(itemRes).length) reservations[itemId] = itemRes; else delete reservations[itemId];
    safeSetItem(KEY_PREFIX + 'reservations', JSON.stringify(reservations));
    renderTiles();
    renderOwnerView();
    return;
  }

  fetch(fbUrl + '/reservations/' + encodeURIComponent(itemId) + '/' + encodeURIComponent(guest) + '.json', { method: 'DELETE' }).catch(function(){});
}

function saveCart() { safeSetItem(KEY_PREFIX + 'cart', JSON.stringify(cart)); }
function cartCount() { return cart.reduce(function(s,e){ return s+e.quantity; }, 0); }
function cartSubtotal() {
  return cart.reduce(function(s,e){
    var item = allStock().find(function(i){ return i.id===e.itemId; });
    return s + (item ? (item.price||0)*e.quantity : 0);
  }, 0);
}
function addToCart(id) {
  var e = cart.find(function(c){ return c.itemId===id; });
  if (e) e.quantity++; else cart.push({itemId:id, quantity:1});
  saveCart(); renderCart(); updateFabs();
}
function removeFromCart(id) {
  cart = cart.filter(function(c){ return c.itemId!==id; });
  saveCart(); renderCart(); updateFabs();
}
function updateQty(id, qty) {
  if (qty <= 0) { removeFromCart(id); return; }
  var e = cart.find(function(c){ return c.itemId===id; });
  if (e) { e.quantity=qty; saveCart(); renderCart(); updateFabs(); }
}
function clearCart() { cart=[]; saveCart(); renderCart(); updateFabs(); }

/* ── Tile rendering ───────────────────────────────────── */
function tileImgHTML(item) {
  if (item.image) return '<img class="tile-img" src="'+esc(item.image)+'" alt="'+esc(item.name)+'">';
  return '<div class="tile-img-placeholder">'+esc((item.name||'?')[0].toUpperCase())+'</div>';
}

function tileReserveWrapHTML(item) {
  var byGuest = reservations[item.id] || {};
  var reserved = Object.values(byGuest).reduce(function(s, n){ return s + n; }, 0);
  var mine = byGuest[guestName || 'Anonymous'] || 0;
  var needed = item.quantity || 0;
  var full = needed > 0 && reserved >= needed;
  var html = '<div class="tile-reserve-wrap">';
  if (needed > 0) html += '<span class="tile-reserve-label">'+reserved+' of '+needed+' reserved</span>';
  else if (reserved > 0) html += '<span class="tile-reserve-label">'+reserved+' reserved</span>';
  html += '<div class="tile-reserve-controls">';
  if (mine > 0) html += '<button class="tile-reserve-step" data-action="reserve-dec" data-id="'+item.id+'">−</button>';
  if (full) html += '<span class="tile-add-btn tile-add-btn--reserved">Fully Reserved ✓</span>';
  else html += '<button class="tile-add-btn" data-action="reserve-inc" data-id="'+item.id+'">Reserve</button>';
  html += '</div></div>';
  return html;
}

function tileReserveCompactHTML(item) {
  var byGuest = reservations[item.id] || {};
  var reserved = Object.values(byGuest).reduce(function(s, n){ return s + n; }, 0);
  var mine = byGuest[guestName || 'Anonymous'] || 0;
  var needed = item.quantity || 0;
  var full = needed > 0 && reserved >= needed;
  var html = '<div class="tile-reserve-compact">';
  if (mine > 0) html += '<button class="tile-reserve-step" data-action="reserve-dec" data-id="'+item.id+'">−</button>';
  if (reserved > 0) html += '<span class="tile-reserve-count">'+reserved+(needed>0?'/'+needed:'')+'</span>';
  if (!full) html += '<button class="tile-reserve-step tile-reserve-step--add" data-action="reserve-inc" data-id="'+item.id+'">+</button>';
  if (full) html += '<span class="tile-reserve-full">✓</span>';
  return html + '</div>';
}

function renderTile(item) {
  var t = CONFIG.tileConfig;
  var isRegistry = CONFIG.websiteType === 'registry';
  var price = item.price > 0 ? '<span class="tile-price">'+CP+item.price.toFixed(2)+'</span>' : '';
  var addBtn = isRegistry
    ? tileReserveWrapHTML(item)
    : '<button class="tile-add-btn" data-action="add-to-cart" data-id="'+item.id+'">Add to cart</button>';
  if (t === 'compact') {
    var compactAction = isRegistry
      ? tileReserveCompactHTML(item)
      : '<button class="tile-add-btn tile-add-btn--compact" data-action="add-to-cart" data-id="'+item.id+'" title="Add to cart">+</button>';
    return '<div class="tile tile--compact">' +
      '<div class="tile-img-wrap--sm">'+tileImgHTML(item)+'</div>' +
      '<div class="tile-body"><span class="tile-name">'+esc(item.name)+'</span>'+price+'</div>' +
      compactAction +
    '</div>';
  }
  var meta = '';
  if (t === 'detailed' && item.metadata) {
    var rows = Object.entries(item.metadata).map(function(kv){
      return '<div class="tile-meta-row"><dt>'+esc(kv[0])+'</dt><dd>'+esc(String(kv[1]))+'</dd></div>';
    }).join('');
    if (rows) meta = '<dl class="tile-meta">'+rows+'</dl>';
  }
  var cls = t === 'detailed' ? 'tile--detailed' : 'tile--standard';
  var imgH = t === 'detailed' ? '<div class="tile-img-wrap">'+tileImgHTML(item)+'</div>' : '<div class="tile-img-wrap">'+tileImgHTML(item)+'</div>';
  return '<div class="tile '+cls+'">'+imgH+'<div class="tile-body"><span class="tile-name">'+esc(item.name)+'</span>'+price+meta+addBtn+'</div></div>';
}

var JUSTIFY_CSS = { left: 'flex-start', center: 'center', right: 'flex-end' };
var STACKED_MARGIN_CSS = { left: '0', center: '0 auto', right: '0 0 0 auto' };

function renderLayout(items) {
  var l = CONFIG.layoutConfig;
  var align = CONFIG.layoutAlign || 'center';
  var justify = JUSTIFY_CSS[align] || 'center';
  var tiles = items.map(renderTile).join('');
  if (l === 'strip')    return '<div class="layout layout--strip" style="justify-content:'+justify+'">'+tiles+'</div>';
  if (l === 'stacked')  return '<div class="layout layout--stacked" style="margin:'+(STACKED_MARGIN_CSS[align] || '0 auto')+'">'+tiles+'</div>';
  if (l === 'featured') {
    if (!items.length)  return '<div class="layout layout--featured"></div>';
    var hero = items.find(function(i){ return i.featured; }) || items[0];
    var rest = items.filter(function(i){ return i !== hero; }).map(renderTile).join('');
    return '<div class="layout layout--featured">' +
      '<div class="layout-featured-slot">'+renderTile(hero)+'</div>' +
      '<div class="layout-featured-grid" style="justify-content:'+justify+'">'+rest+'</div></div>';
  }
  return '<div class="layout layout--grid" style="justify-content:'+justify+'">'+tiles+'</div>';
}

/* ── Category grouping ───────────────────────────────── */
function orderedCategories() {
  var seen = {}, list = [];
  Object.keys(CONFIG.categoryConfig || {}).forEach(function(c){ if (c && !seen[c]) { seen[c] = true; list.push(c); } });
  allStock().forEach(function(i){
    (i.categories||[]).forEach(function(c){ if (c && !seen[c]) { seen[c] = true; list.push(c); } });
  });
  // Guest-suggested gifts always render as the last section.
  var si = list.indexOf(SUGGESTED_CAT);
  if (si !== -1) { list.splice(si, 1); list.push(SUGGESTED_CAT); }
  return list;
}

function renderCategorySection(cat, items) {
  var cfg = (CONFIG.categoryConfig || {})[cat] ||
    (cat === SUGGESTED_CAT ? { label: SUGGESTED_CAT, description: 'Extra ideas suggested by our guests.' } : {});
  var align = STACKED_MARGIN_CSS[CONFIG.layoutAlign] ? CONFIG.layoutAlign : 'center';
  var html = '<div class="category-section"><div class="category-section-header" style="text-align:'+align+'">' +
    '<h2 class="category-section-title">'+esc(cfg.label || cat)+'</h2>';
  if (cfg.description) html += '<p class="category-section-desc" style="margin:'+STACKED_MARGIN_CSS[align]+'">'+esc(cfg.description)+'</p>';
  return html + '</div>' + renderLayout(items) + '</div>';
}

function renderGrouped(items) {
  var sections = orderedCategories().map(function(cat){
    return { cat: cat, items: items.filter(function(i){ return (i.categories||[]).indexOf(cat) !== -1; }) };
  }).filter(function(s){ return s.items.length > 0; });
  var uncategorized = items.filter(function(i){ return !(i.categories||[]).length; });
  if (!sections.length && !uncategorized.length) return '';

  var html = '<div class="category-groups">';
  sections.forEach(function(s, idx){
    if (idx > 0) html += '<div class="category-divider"></div>';
    html += renderCategorySection(s.cat, s.items);
  });
  if (uncategorized.length) {
    if (sections.length) html += '<div class="category-divider"></div>';
    html += '<div class="category-section">'+renderLayout(uncategorized)+'</div>';
  }
  return html + '</div>';
}

/* ── Search ───────────────────────────────────────────── */
function matchesQuery(item, q) {
  if (!q) return true;
  var lower = q.toLowerCase();
  if (item.name.toLowerCase().indexOf(lower) !== -1) return true;
  if ((item.categories||[]).some(function(c){ return c.toLowerCase().indexOf(lower) !== -1; })) return true;
  return Object.values(item.metadata||{}).some(function(v){ return String(v).toLowerCase().indexOf(lower) !== -1; });
}

function renderTiles() {
  var filtered = allStock().filter(function(i){ return matchesQuery(i, query); });
  var grid = document.getElementById('tile-grid');
  var hasCategoryItems = allStock().some(function(i){ return (i.categories||[]).length > 0; });
  if (!filtered.length && query) {
    grid.innerHTML = '<p class="search-no-results">No items match &ldquo;'+esc(query)+'&rdquo;</p>';
  } else if (CONFIG.groupByCategory && hasCategoryItems) {
    grid.innerHTML = renderGrouped(filtered);
  } else {
    grid.innerHTML = renderLayout(filtered);
  }
}

function initSearch() {
  var hasWidget = Object.values(CONFIG.widgets||{}).some(function(w){ return w && w.type==='function' && w.content==='Search'; });
  var wrap = document.getElementById('search-wrap');
  if (hasWidget || !STOCK.length) { if(wrap) wrap.style.display='none'; return; }
  if (wrap) {
    wrap.style.display = 'block';
    wrap.style.margin = ({ left: '0', center: '0 auto', right: '0 0 0 auto' })[CONFIG.searchAlign] || '0 auto';
    wrap.innerHTML = '<input class="store-search-input" type="text" placeholder="Search items..." id="search-input">' +
      '<button class="store-search-clear" id="search-clear" style="display:none">&#10005;</button>';
    document.getElementById('search-input').addEventListener('input', function(){
      query = this.value;
      var clr = document.getElementById('search-clear');
      if (clr) clr.style.display = query ? 'block' : 'none';
      renderTiles();
    });
    document.getElementById('search-clear').addEventListener('click', function(){
      query=''; this.style.display='none';
      document.getElementById('search-input').value='';
      renderTiles();
    });
  }
  var navInput = document.getElementById('navbar-search-input');
  if (navInput) {
    navInput.addEventListener('input', function(){
      query = this.value; renderTiles();
    });
  }
}

/* ── Cart UI ──────────────────────────────────────────── */
function openCart() {
  document.getElementById('cart-backdrop').style.display = 'block';
  document.getElementById('cart-drawer').classList.add('cart-drawer--open');
}
function closeCart() {
  document.getElementById('cart-backdrop').style.display = 'none';
  document.getElementById('cart-drawer').classList.remove('cart-drawer--open');
}

function renderCart() {
  var entries = cart.map(function(e){ return {e:e, item:allStock().find(function(s){return s.id===e.itemId;})}; }).filter(function(x){return x.item;});
  var subtotal = cartSubtotal();
  var hasPrice = entries.some(function(x){ return x.item.price > 0; });
  var body = document.getElementById('cart-body');
  if (!entries.length) { body.innerHTML = '<p class="cart-empty">Your cart is empty.</p>'; return; }

  var html = '<ul class="cart-list">';
  entries.forEach(function(x){
    var e=x.e, item=x.item;
    html += '<li class="cart-item">' +
      '<div class="cart-item-img-wrap">'+(item.image?'<img class="cart-item-img" src="'+esc(item.image)+'" alt="'+esc(item.name)+'">' : '<div class="cart-item-img-placeholder">'+esc((item.name||'?')[0].toUpperCase())+'</div>')+'</div>' +
      '<div class="cart-item-info"><span class="cart-item-name">'+esc(item.name)+'</span>'+(item.price>0?'<span class="cart-item-price">'+CP+(item.price*e.quantity).toFixed(2)+'</span>':'')+'</div>' +
      '<div class="cart-item-qty"><button data-action="dec-qty" data-id="'+e.itemId+'">−</button><span>'+e.quantity+'</span><button data-action="inc-qty" data-id="'+e.itemId+'">+</button></div>' +
      '<button class="cart-item-remove" data-action="remove-from-cart" data-id="'+e.itemId+'">✕</button>' +
    '</li>';
  });
  html += '</ul><div class="cart-footer">';
  if (hasPrice) html += '<div class="cart-subtotal"><span>Subtotal</span><span>'+CP+subtotal.toFixed(2)+'</span></div>';
  html += '<button class="selector-btn selector-btn--active" data-action="open-checkout">Checkout</button>' +
    '<button class="selector-btn" data-action="clear-cart">Clear cart</button></div>';
  body.innerHTML = html;
}

function updateFabs() {
  var count = cartCount();
  var badge = document.getElementById('cart-fab-badge');
  if (badge) { badge.textContent = count; badge.style.display = count ? 'flex' : 'none'; }
  var navBadge = document.getElementById('navbar-cart-badge');
  if (navBadge) { navBadge.textContent = count; navBadge.style.display = count ? 'inline-flex' : 'none'; }
}

/* ── Checkout ─────────────────────────────────────────── */
var co = {
  open:false, step:0, ref:'',
  savedItems:[],
  form:{name:'',email:'',phone:'',line1:'',line2:'',city:'',postcode:'',country:'',cardName:'',cardNumber:'',cardExpiry:'',cardCvc:''}
};

function coIsValid() {
  var f=co.form;
  if(co.step===0) return f.name.trim()&&f.email.trim();
  if(co.step===1) return f.line1.trim()&&f.city.trim()&&f.postcode.trim()&&f.country;
  if(co.step===2) return f.cardName.trim()&&f.cardNumber.trim()&&f.cardExpiry.trim()&&f.cardCvc.trim();
  return true;
}

function openCheckout() {
  co.savedItems = cart.map(function(e){ return {e:e, item:allStock().find(function(s){return s.id===e.itemId;})}; }).filter(function(x){return x.item;});
  co.open=true; closeCart(); renderCheckout();
}
function closeCheckout() {
  co.open=false; co.step=0; co.ref='';
  co.form={name:'',email:'',phone:'',line1:'',line2:'',city:'',postcode:'',country:'',cardName:'',cardNumber:'',cardExpiry:'',cardCvc:''};
  document.getElementById('checkout-container').innerHTML='';
}

/* ── Help ─────────────────────────────────────────────── */
function openHelp() {
  document.getElementById('help-backdrop').style.display='block';
  document.getElementById('help-modal').style.display='flex';
}
function closeHelp() {
  document.getElementById('help-backdrop').style.display='none';
  document.getElementById('help-modal').style.display='none';
}

/* ── Powered-by ───────────────────────────────────────── */
function openPoweredBy() {
  document.getElementById('poweredby-backdrop').style.display='block';
  document.getElementById('poweredby-modal').style.display='flex';
}
function closePoweredBy() {
  document.getElementById('poweredby-backdrop').style.display='none';
  document.getElementById('poweredby-modal').style.display='none';
}
function coNext() {
  if(co.step===2){
    co.ref='WK-'+Math.random().toString(36).slice(2,8).toUpperCase();
    clearCart();
  }
  co.step++; renderCheckout();
}
function coBack(){ co.step--; renderCheckout(); }

function coField(label, field, type, placeholder, value, required, half) {
  return '<label class="checkout-field'+(half?' checkout-field--half':'')+'">'+
    '<span class="checkout-field-label">'+esc(label)+(required?'<span class="checkout-required"> *</span>':'')+'</span>'+
    '<input class="checkout-input" type="'+type+'" placeholder="'+esc(placeholder)+'" value="'+esc(value)+'" data-co-field="'+field+'">'+
    '</label>';
}

function coStepIndicator() {
  var steps=['Contact','Delivery','Payment','Confirm'];
  var html='<div class="checkout-steps">';
  steps.forEach(function(label,i){
    var done=i<co.step, active=i===co.step;
    html+='<div class="checkout-step-pip'+(done?' checkout-step-pip--done':'')+(active?' checkout-step-pip--active':'')+'">'+
      '<div class="checkout-step-circle">'+(done?'<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>':i+1)+'</div>'+
      '<span class="checkout-step-label">'+label+'</span></div>';
    if(i<3) html+='<div class="checkout-step-line'+(done?' checkout-step-line--done':'')+'"></div>';
  });
  return html+'</div>';
}

function coFormHTML() {
  var f=co.form;
  if(co.step===0) return '<h3 class="checkout-step-heading">Contact details</h3>'+
    coField('Full name','name','text','Jane Smith',f.name,true)+
    coField('Email address','email','email','jane@example.com',f.email,true)+
    coField('Phone number','phone','tel','+1 555 000 0000',f.phone,false);
  if(co.step===1){
    var countries=['Australia','Canada','France','Germany','Ireland','New Zealand','United Kingdom','United States','Other'];
    return '<h3 class="checkout-step-heading">Delivery address</h3>'+
      coField('Address line 1','line1','text','123 Main Street',f.line1,true)+
      coField('Address line 2','line2','text','Apartment, suite, etc.',f.line2,false)+
      '<div class="checkout-field-row">'+coField('City','city','text','New York',f.city,true,true)+coField('Postcode','postcode','text','10001',f.postcode,true,true)+'</div>'+
      '<label class="checkout-field"><span class="checkout-field-label">Country<span class="checkout-required"> *</span></span>'+
      '<select class="checkout-input checkout-select" data-co-field="country"><option value="">Select country…</option>'+
      countries.map(function(c){return '<option'+(f.country===c?' selected':'')+'>'+c+'</option>';}).join('')+
      '</select></label>';
  }
  if(co.step===2) return '<h3 class="checkout-step-heading">Payment</h3>'+
    '<div class="checkout-payment-notice"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>Stripe integration not yet configured. These fields are a preview only.</div>'+
    coField('Cardholder name','cardName','text','Jane Smith',f.cardName,true)+
    '<label class="checkout-field"><span class="checkout-field-label">Card number<span class="checkout-required"> *</span></span><input class="checkout-input checkout-input--mono" type="text" placeholder="1234 5678 9012 3456" maxlength="19" value="'+esc(f.cardNumber)+'" data-co-field="cardNumber"></label>'+
    '<div class="checkout-field-row">'+
    '<label class="checkout-field checkout-field--half"><span class="checkout-field-label">Expiry<span class="checkout-required"> *</span></span><input class="checkout-input checkout-input--mono" type="text" placeholder="MM / YY" maxlength="7" value="'+esc(f.cardExpiry)+'" data-co-field="cardExpiry"></label>'+
    '<label class="checkout-field checkout-field--half"><span class="checkout-field-label">CVC<span class="checkout-required"> *</span></span><input class="checkout-input checkout-input--mono" type="text" placeholder="123" maxlength="4" value="'+esc(f.cardCvc)+'" data-co-field="cardCvc"></label></div>';

  return '<div class="checkout-confirmation">'+
    '<div class="checkout-confirm-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>'+
    '<h3 class="checkout-confirm-heading">Order placed!</h3>'+
    '<p class="checkout-confirm-ref">Reference: <strong>'+esc(co.ref)+'</strong></p>'+
    '<p class="checkout-confirm-email">This demo order was recorded on this device only - no confirmation email is sent to <strong>'+esc(co.form.email)+'</strong> (there’s no backend to send it from). Take a screenshot of this reference if you need to note it down.</p>'+
    '<div class="checkout-confirm-details">'+
      '<div class="checkout-confirm-section"><p class="checkout-confirm-section-title">Delivering to</p>'+
        '<address class="checkout-confirm-address">'+esc(f.name)+'<br>'+esc(f.line1)+(f.line2?', '+esc(f.line2):'')+'<br>'+esc(f.city)+', '+esc(f.postcode)+'<br>'+esc(f.country)+'</address></div>'+
      '<div class="checkout-confirm-section"><p class="checkout-confirm-section-title">Items</p>'+
        '<ul class="checkout-confirm-items">'+co.savedItems.map(function(x){return '<li>'+esc(x.item.name)+' <span class="checkout-confirm-qty">\xd7 '+x.e.quantity+'</span></li>';}).join('')+'</ul></div>'+
    '</div></div>';
}

function coSummaryHTML() {
  var subtotal=co.savedItems.reduce(function(s,x){return s+(x.item.price||0)*x.e.quantity;},0);
  var hasPrice=co.savedItems.some(function(x){return x.item.price>0;});
  var free=!hasPrice||subtotal>=50;
  var total=hasPrice?(subtotal+(free?0:5)).toFixed(2):null;
  var html='<div class="checkout-summary"><h3 class="checkout-summary-heading">Order summary</h3><ul class="checkout-summary-list">';
  co.savedItems.forEach(function(x){
    var item=x.item, qty=x.e.quantity;
    html+='<li class="checkout-summary-item">'+
      '<div class="checkout-summary-img-wrap">'+(item.image?'<img class="checkout-summary-img" src="'+esc(item.image)+'" alt="'+esc(item.name)+'">':'<div class="checkout-summary-img-placeholder">'+esc((item.name||'?')[0].toUpperCase())+'</div>')+
      '<span class="checkout-summary-qty-badge">'+qty+'</span></div>'+
      '<span class="checkout-summary-item-name">'+esc(item.name)+'</span>'+
      (item.price>0?'<span class="checkout-summary-item-price">'+CP+(item.price*qty).toFixed(2)+'</span>':'')+
    '</li>';
  });
  html+='</ul>';
  if(hasPrice) html+='<div class="checkout-summary-totals">'+
    '<div class="checkout-summary-row"><span>Subtotal</span><span>'+CP+subtotal.toFixed(2)+'</span></div>'+
    '<div class="checkout-summary-row"><span>Shipping</span><span>'+(free?'Free':CP+'5.00')+'</span></div>'+
    '<div class="checkout-summary-row checkout-summary-row--total"><span>Total</span><span>'+CP+total+'</span></div></div>';
  return html+'</div>';
}

function renderCheckout() {
  var container=document.getElementById('checkout-container');
  if(!co.open){container.innerHTML='';return;}
  var isConfirm=co.step===3;
  var disabled=!coIsValid();
  var html='<div class="checkout-backdrop" data-action="close-checkout"></div>'+
    '<div class="checkout-modal" role="dialog" aria-modal="true">'+
    '<div class="checkout-header"><span class="checkout-title">Checkout</span><button class="checkout-close" data-action="close-checkout">✕</button></div>';
  if(!isConfirm) html+=coStepIndicator();
  html+='<div class="checkout-body'+(isConfirm?' checkout-body--confirm':'')+'">'+
    '<div class="checkout-form-col"><div class="checkout-step-form">'+coFormHTML()+'</div></div>';
  if(!isConfirm) html+='<div class="checkout-summary-col">'+coSummaryHTML()+'</div>';
  html+='</div><div class="checkout-footer">';
  if(co.step>0&&co.step<3) html+='<button class="checkout-btn checkout-btn--back" data-action="co-back">Back</button>';
  if(co.step<3) html+='<button class="checkout-btn checkout-btn--primary" data-action="co-next"'+(disabled?' disabled':'')+'>'+(co.step===2?'Place order':'Continue')+'</button>';
  if(co.step===3) html+='<button class="checkout-btn checkout-btn--primary" data-action="close-checkout">Continue shopping</button>';
  html+='</div></div>';
  container.innerHTML=html;
  document.querySelectorAll('[data-co-field]').forEach(function(el){
    el.addEventListener('input',function(){ co.form[this.dataset.coField]=this.value; var btn=document.querySelector('[data-action="co-next"]'); if(btn) btn.disabled=!coIsValid(); });
    el.addEventListener('change',function(){ co.form[this.dataset.coField]=this.value; var btn=document.querySelector('[data-action="co-next"]'); if(btn) btn.disabled=!coIsValid(); });
  });
}

/* ── Event delegation ─────────────────────────────────── */
document.addEventListener('click', function(e) {
  var el=e.target.closest('[data-action]'); if(!el) return;
  var a=el.dataset.action, id=el.dataset.id;
  if(a==='open-cart')        openCart();
  if(a==='close-cart')       closeCart();
  if(a==='add-to-cart')      addToCart(id);
  if(a==='remove-from-cart') removeFromCart(id);
  if(a==='inc-qty')          { var ex=cart.find(function(c){return c.itemId===id;}); if(ex) updateQty(id,ex.quantity+1); }
  if(a==='dec-qty')          { var ex=cart.find(function(c){return c.itemId===id;}); if(ex) updateQty(id,ex.quantity-1); }
  if(a==='clear-cart')       clearCart();
  if(a==='open-checkout')    openCheckout();
  if(a==='close-checkout')   closeCheckout();
  if(a==='co-next'&&!el.disabled) coNext();
  if(a==='co-back')          coBack();
  if(a==='open-help')        openHelp();
  if(a==='close-help')       closeHelp();
  if(a==='open-poweredby')   openPoweredBy();
  if(a==='close-poweredby')  closePoweredBy();
  if(a==='reserve-inc') {
    var item = allStock().find(function(i){ return i.id===id; });
    var needsName = item && item.nameRequired !== false && !guestName;
    if (needsName) openNameModal(id); else reserveItem(id, 1);
  }
  if(a==='reserve-dec')          reserveItem(id, -1);
  if(a==='close-name-modal')     closeNameModal();
  if(a==='close-owner-gate')     closeOwnerGate();
  if(a==='close-owner-view')     closeOwnerView();
  if(a==='release-reservation')  releaseReservation(id, el.dataset.guest);
  if(a==='approve-suggestion') {
    var qtyInput = document.getElementById('qty-'+id);
    var nameInput = document.getElementById('name-'+id);
    var finalQty = qtyInput ? Number(qtyInput.value) || 0 : (suggestions[id] ? suggestions[id].quantity : 0);
    approveSuggestionAction(id, finalQty, nameInput ? nameInput.value : '');
  }
  if(a==='save-suggestion') {
    var sQty = document.getElementById('qty-'+id);
    var sName = document.getElementById('name-'+id);
    var fields = {};
    if (sQty) fields.quantity = Math.max(0, Number(sQty.value) || 0);
    if (sName && sName.value.trim()) fields.name = sName.value.trim();
    setSuggestionFields(id, fields);
  }
  if(a==='reject-suggestion')    setSuggestionStatus(id, 'rejected');
  if(a==='remove-pledge')        removePledgeAction(id);
  if(a==='open-owner-view')      openOwnerView();
  if(a==='copy-share-link') {
    // Strip the hash so an owner browsing #owner never hands guests an
    // owner-gate link.
    var shareUrl = window.location.href.replace(/#.*$/, '');
    var flashShareFab = function() {
      var btn = document.getElementById('share-fab');
      if (!btn) return;
      if (!btn.dataset.orig) btn.dataset.orig = btn.innerHTML;
      btn.innerHTML = 'Link copied ✓';
      setTimeout(function(){ if (btn.dataset.orig) btn.innerHTML = btn.dataset.orig; }, 2000);
    };
    var manualFallback = function() { window.prompt('Copy this link:', shareUrl); };
    try {
      navigator.clipboard.writeText(shareUrl).then(flashShareFab, manualFallback);
    } catch(e) { manualFallback(); }
  }
});

// The owner can replace/add a suggestion's photo from the owner view; the
// image is stored on the suggestion record as a data URL (same 3MB cap as
// guest uploads) so the derived tile picks it up everywhere.
document.addEventListener('change', function(ev) {
  var el = ev.target;
  if (!el || !el.dataset || el.dataset.action !== 'suggestion-image') return;
  var sid = el.dataset.id;
  var file = el.files && el.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) { alert('That image is too large (max 3MB). Try a smaller photo.'); el.value = ''; return; }
  var reader = new FileReader();
  reader.onload = function(e) { setSuggestionFields(sid, { image: e.target.result }); };
  reader.readAsDataURL(file);
});

/* ── Init ─────────────────────────────────────────────── */
function logTelemetry() {
  var url = CONFIG.telemetryUrl;
  if (!url) return;
  try {
    if (sessionStorage.getItem('winklr_telemetry_sent')) return;
    sessionStorage.setItem('winklr_telemetry_sent', '1');
  } catch (e) {}
  fetch(url.replace(/\/$/, '') + '/events.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hostname: window.location.hostname || 'unknown',
      websiteType: CONFIG.websiteType || null,
      itemCount: STOCK.length,
      tileConfig: CONFIG.tileConfig || null,
      layoutConfig: CONFIG.layoutConfig || null,
      timestamp: Date.now(),
      source: 'exported-site'
    })
  }).catch(function(){});
}

/* ── Guest access gate ──────────────────────────────────── */
function accessGatePassed() {
  // A gate with no password set would be trivially passable (blank matches
  // blank), so it isn't considered active until a real password exists.
  if (!CONFIG.accessGate || !CONFIG.accessGate.enabled || !CONFIG.accessGate.passwordHash) return true;
  try { return localStorage.getItem(KEY_PREFIX + 'gate_passed') === '1'; } catch (e) { return false; }
}

function logGuestAccess(email, handle) {
  if (!fbUrl) return;
  var id = 'g_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  fetch(fbUrl + '/guests/' + id + '.json', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email, handle: handle, timestamp: Date.now() }),
  }).catch(function(){});
}

function renderOwnerGateForm() {
  document.body.innerHTML =
    '<div class="access-gate-screen"><form class="access-gate-card" id="owner-access-form">' +
      '<h1 class="access-gate-title">Owner access</h1>' +
      '<p class="access-gate-body">Enter your Owner passcode to get straight in.</p>' +
      '<input class="editor-add-form-input" type="password" placeholder="Owner passcode" id="owner-access-input" autofocus>' +
      '<p class="owner-gate-error" id="owner-access-error" style="display:none"></p>' +
      '<button type="submit" class="selector-btn selector-btn--active">Continue</button>' +
      '<button type="button" class="access-gate-owner-toggle" id="owner-access-back">Back to guest access</button>' +
    '</form></div>';

  document.getElementById('owner-access-back').addEventListener('click', renderAccessGate);
  document.getElementById('owner-access-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var val = document.getElementById('owner-access-input').value;
    var err = document.getElementById('owner-access-error');
    if (!CONFIG.ownerPasscodeHash || sha256(val) !== CONFIG.ownerPasscodeHash) {
      err.textContent = 'Incorrect owner passcode.';
      err.style.display = 'block';
      return;
    }
    safeSetItem(KEY_PREFIX + 'gate_passed', '1');
    window.location.reload();
  });
}

function renderAccessGate() {
  document.body.innerHTML =
    '<div class="access-gate-screen"><form class="access-gate-card" id="access-gate-form">' +
      '<h1 class="access-gate-title">' + esc(CONFIG.pageTitle || 'This registry is private') + '</h1>' +
      '<p class="access-gate-body">Enter your details and the registry password to continue.</p>' +
      '<input class="editor-add-form-input" type="email" placeholder="Your email" id="gate-email" autofocus>' +
      '<input class="editor-add-form-input" type="text" placeholder="Display name" id="gate-handle">' +
      '<input class="editor-add-form-input" type="password" placeholder="Registry password" id="gate-password">' +
      '<p class="owner-gate-error" id="gate-error" style="display:none"></p>' +
      '<button type="submit" class="selector-btn selector-btn--active">Continue</button>' +
      '<button type="button" class="access-gate-owner-toggle" id="gate-owner-toggle">I’m the registry owner</button>' +
    '</form></div>';

  document.getElementById('gate-owner-toggle').addEventListener('click', renderOwnerGateForm);
  document.getElementById('access-gate-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var email = document.getElementById('gate-email').value.trim();
    var handle = document.getElementById('gate-handle').value.trim();
    var password = document.getElementById('gate-password').value;
    var err = document.getElementById('gate-error');
    function showErr(msg) { err.textContent = msg; err.style.display = 'block'; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('Enter a valid email address.'); return; }
    if (!handle) { showErr('Pick a display name.'); return; }
    if (sha256(password) !== CONFIG.accessGate.passwordHash) { showErr('Incorrect password.'); return; }
    safeSetItem(KEY_PREFIX + 'gate_passed', '1');
    safeSetItem(KEY_PREFIX + 'guestName', handle);
    safeSetItem(KEY_PREFIX + 'guestEmail', email);
    logGuestAccess(email, handle);
    window.location.reload();
  });
}

function initApp() {
  initReservations();
  initSuggestions();
  initCashPledges();
  logTelemetry();
  renderTiles(); renderCart(); initSearch(); updateFabs(); initSuggestGiftForm(); renderCashFundCard();
  var hasCartWidget = Object.values(CONFIG.widgets||{}).some(function(w){ return w && w.content==='Cart'; });
  var hasHelpWidget = Object.values(CONFIG.widgets||{}).some(function(w){ return w && w.content==='Help'; });
  var isRegistry = CONFIG.websiteType === 'registry';
  var cartFab = document.getElementById('cart-fab');
  if (cartFab && (hasCartWidget || isRegistry)) cartFab.style.display='none';
  var helpFab = document.getElementById('help-fab');
  if (helpFab && hasHelpWidget) helpFab.style.display='none';
  var shareFab = document.getElementById('share-fab');
  if (shareFab && isRegistry) shareFab.style.display='flex';
  if (window.location.hash === '#owner') openOwnerGate();
  window.addEventListener('hashchange', function() {
    if (window.location.hash === '#owner') {
      if (ownerUnlocked) openOwnerView(); else openOwnerGate();
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  if (accessGatePassed()) initApp(); else renderAccessGate();
});
`;
  /* eslint-enable no-useless-escape */
}

// ── Page header HTML ──────────────────────────────────────────────────────

function buildPageHeaderHTML(state) {
  const title = state.brand?.pageTitle;
  const subtitle = state.brand?.pageSubtitle;
  if (!title && !subtitle) return '';
  const marginByAlign = { left: '0', center: '0 auto', right: '0 0 0 auto' };
  const align = marginByAlign[state.layoutAlign] ? state.layoutAlign : 'center';
  return '<div class="page-header" style="text-align:' + align + '">' +
    (title ? '<h1 class="page-header-title">' + esc(title) + '</h1>' : '') +
    (subtitle ? '<p class="page-header-subtitle" style="margin:' + marginByAlign[align] + '">' + esc(subtitle) + '</p>' : '') +
    '</div>';
}

// ── Decals HTML ────────────────────────────────────────────────────────────

function buildDecalsHTML(state) {
  const decals = state.decals || [];
  if (!decals.length) return '';
  return decals.map((d) =>
    `<div class="decal" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;transform:rotate(${d.rotation || 0}deg)">` +
    `<img src="${esc(d.image)}" alt="">` +
    `</div>`
  ).join('');
}

// ── Main export ────────────────────────────────────────────────────────────

export async function generateStoreHTML(state) {
  const logoDataUrl = state.brand?.logo
    ?? await fetchAsDataUrl(`${process.env.PUBLIC_URL}/branding/wordmark-tag.svg`);
  const themeVars   = buildThemeVarsCSS();
  const css         = buildStaticCSS();
  const navbar      = buildNavbarHTML(state, logoDataUrl);
  const script      = buildScriptContent(state);
  const pageHeader  = buildPageHeaderHTML(state);
  const decalsHTML  = buildDecalsHTML(state);
  const pageTitle   = state.brand?.pageTitle || 'Store';
  const poweredByBlankUrl = WINKLR_HOMEPAGE_URL;
  const poweredByLookUrl  = WINKLR_HOMEPAGE_URL + encodeLookConfigToHash(state);
  const helpBodyHTML = state.websiteType === 'registry'
    ? '<p>Click "Reserve" on an item to claim it (or part of it) so other guests know it\'s taken. Reservations update live for everyone viewing this page, but if two people reserve the very last one at almost the same moment, please check with the couple/family directly to sort out who ends up bringing it.</p>'
    : '<p>Browse items and add them to your cart. When you\'re ready, open your cart and click Checkout to complete your order.</p>';

  const googleFontFamilies = [...new Set(
    ['--font-body', '--font-heading', '--font-nav']
      .map((v) => googleFontFamilyFor(state.theme?.custom?.[v]))
      .filter(Boolean)
  )];
  const fontLinks = googleFontFamilies.length
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?${googleFontFamilies.map((f) => `family=${f}`).join('&')}&display=swap" rel="stylesheet">`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(pageTitle)}</title>
${fontLinks}
<style>
:root {
${themeVars}
}
${css}
</style>
</head>
<body>
${navbar}
<div class="app-content">
  ${decalsHTML}
  ${pageHeader}
  <div id="search-wrap" class="store-search-wrap" style="display:none"></div>
  <div id="tile-grid"></div>
  <div id="cash-fund-container" style="display:none"></div>
  <div id="suggest-gift-container" style="display:none"></div>
  <footer class="app-footer">
    <button type="button" class="footer-poweredby-btn" data-action="open-poweredby">
      <span class="footer-text">Powered by</span>
      <span class="footer-brand">Winklr</span>
    </button>
  </footer>
</div>
<div id="poweredby-backdrop" class="modal-backdrop" style="display:none" data-action="close-poweredby"></div>
<div id="poweredby-modal" class="help-modal poweredby-modal" style="display:none">
  <div class="help-modal-header">
    <span class="help-modal-title">Made with Winklr</span>
    <button class="help-modal-close" data-action="close-poweredby">&#10005;</button>
  </div>
  <div class="help-modal-body">
    <p class="poweredby-hint">Winklr is a free tool for building a gift registry or storefront like this one - no code required.</p>
    <a class="poweredby-option" href="${esc(poweredByLookUrl)}" target="_blank" rel="noopener noreferrer">
      <span class="poweredby-option-title">Build one that looks like this</span>
      <span class="poweredby-option-desc">Starts you off with this theme, layout, and font choices, plus a few sample items to get going.</span>
    </a>
    <a class="poweredby-option" href="${esc(poweredByBlankUrl)}" target="_blank" rel="noopener noreferrer">
      <span class="poweredby-option-title">Start from scratch</span>
      <span class="poweredby-option-desc">A blank Winklr project with the default look.</span>
    </a>
  </div>
</div>
<div id="cart-backdrop" class="cart-backdrop"></div>
<div id="cart-drawer" class="cart-drawer">
  <div class="cart-header">
    <span class="cart-title">Cart</span>
    <button class="cart-close" data-action="close-cart">&#10005;</button>
  </div>
  <div id="cart-body"></div>
</div>
<div id="checkout-container"></div>
<div id="help-backdrop" class="help-modal-backdrop" style="display:none" data-action="close-help"></div>
<div id="help-modal" class="help-modal" style="display:none">
  <div class="help-modal-header">
    <span class="help-modal-title">Help</span>
    <button class="help-modal-close" data-action="close-help">&#10005;</button>
  </div>
  <div class="help-modal-body">
    ${helpBodyHTML}
  </div>
</div>
<div class="fab-group">
  <button id="cart-fab" class="cart-fab" data-action="open-cart">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
    Cart <span id="cart-fab-badge" class="cart-fab-badge"></span>
  </button>
  <button id="help-fab" class="help-fab" data-action="open-help">?</button>
  <button id="share-fab" class="cart-fab" style="display:none" data-action="copy-share-link">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
    Share
  </button>
  <button id="owner-fab" class="cart-fab" style="display:none" data-action="open-owner-view">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    Owner
  </button>
</div>
<div id="name-modal-container"></div>
<div id="owner-gate-container"></div>
<div id="owner-view-container"></div>
<script>
${script}
</script>
</body>
</html>`;
}
