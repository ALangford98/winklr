const CSS_VARS_LIST = [
  '--bg-app', '--bg-card', '--bg-nav', '--bg-raised', '--bg-input',
  '--text-primary', '--text-secondary', '--text-muted', '--text-meta', '--text-on-nav',
  '--accent-primary', '--accent-subtle', '--accent-success', '--accent-danger',
  '--border-subtle', '--border-hover',
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
    .map((v) => `  ${v}: ${computed.getPropertyValue(v).trim()};`)
    .join('\n');
}

// ── Static CSS ─────────────────────────────────────────────────────────────

function buildStaticCSS() {
  return `
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; background: var(--bg-app); color: var(--text-primary); font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; display: flex; flex-direction: column; }
a { text-decoration: none; color: inherit; }
button { font-family: inherit; }

/* Navbar */
.Navbar { display: flex; background: var(--bg-nav); height: 56px; align-items: stretch; position: sticky; top: 0; z-index: 10; }
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
.app-content { flex: 1; display: flex; flex-direction: column; }
.store-search-wrap { position: relative; padding: 16px 24px 0; }
.store-search-input { width: 100%; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 8px; color: var(--text-primary); font-size: 14px; padding: 8px 36px 8px 14px; outline: none; transition: border-color 0.15s; font-family: inherit; }
.store-search-input:focus { border-color: var(--accent-primary); }
.store-search-input::placeholder { color: var(--text-muted); }
.store-search-clear { position: absolute; right: 32px; top: 50%; transform: translateY(-25%); background: none; border: none; color: var(--text-muted); font-size: 13px; cursor: pointer; padding: 2px 4px; line-height: 1; border-radius: 3px; }
.store-search-clear:hover { color: var(--text-primary); }
.search-no-results { flex: 1; text-align: center; padding: 60px 24px; font-size: 13px; color: var(--text-muted); }

/* Layout */
.layout { flex: 1; padding: 24px; min-width: 0; }
.layout--grid { display: flex; flex-wrap: wrap; gap: 16px; align-content: flex-start; }
.layout--strip { display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 16px; align-items: flex-start; padding-bottom: 20px; }
.layout--strip::-webkit-scrollbar { height: 5px; }
.layout--strip::-webkit-scrollbar-thumb { background: var(--border-subtle); border-radius: 3px; }
.layout--stacked { display: flex; flex-direction: column; gap: 10px; max-width: 860px; }
.layout--stacked .tile { width: 100%; flex-direction: row; }
.layout--stacked .tile-img-wrap, .layout--stacked .tile-img-wrap--sm { width: 80px; min-width: 80px; height: 80px; }
.layout--stacked .tile--detailed .tile-img-wrap { width: 100px; min-width: 100px; height: 100px; }
.layout--featured { display: flex; flex-direction: column; gap: 20px; }
.layout-featured-slot .tile { width: 100%; flex-direction: row; height: 300px; }
.layout-featured-slot .tile-img-wrap, .layout-featured-slot .tile-img-wrap--sm { width: 45%; min-width: 45%; height: 100%; }
.layout-featured-slot .tile-body { flex: 1; padding: 28px 32px; justify-content: center; gap: 10px; }
.layout-featured-slot .tile-name { font-size: 22px !important; font-weight: 700 !important; }
.layout-featured-slot .tile-price { font-size: 17px !important; }
.layout-featured-slot .tile-meta { margin-top: 10px; }
.layout-featured-grid { display: flex; flex-wrap: wrap; gap: 16px; align-content: flex-start; }

/* Tiles */
.tile { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 10px; overflow: hidden; display: flex; color: var(--text-primary); }
.tile-img { width: 100%; height: 100%; object-fit: cover; display: block; }
.tile-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--bg-raised); color: var(--border-hover); font-size: 1.4rem; font-weight: 600; }
.tile--compact { flex-direction: row; align-items: center; width: 220px; height: 60px; }
.tile-img-wrap--sm { width: 60px; height: 60px; flex-shrink: 0; }
.tile--compact .tile-body { padding: 0 12px 0 10px; display: flex; flex-direction: column; gap: 2px; overflow: hidden; flex: 1; }
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
  const stockJson  = safeJSON(state.stockList);
  const configJson = safeJSON({
    websiteType:        state.websiteType,
    firebaseDatabaseUrl: state.integrations?.firebaseDatabaseUrl?.trim().replace(/\/$/, '') || null,
    tileConfig:         state.tileConfig,
    layoutConfig:       state.layoutConfig,
    widgets:            state.widgets,
  });

  return `
var STOCK  = ${stockJson};
var CONFIG = ${configJson};

/* ── Helpers ──────────────────────────────────────────── */
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Cart state ───────────────────────────────────────── */
var cart = JSON.parse(localStorage.getItem('wk_cart') || '[]');
var reservations = [];
var query = '';
var fbUrl = (CONFIG.firebaseDatabaseUrl || '').replace(/\/$/, '') || null;

function initReservations() {
  if (!fbUrl) {
    reservations = JSON.parse(localStorage.getItem('wk_reservations') || '[]');
    return;
  }
  var es = new EventSource(fbUrl + '/reservations.json');
  es.addEventListener('put', function(evt) {
    var payload = JSON.parse(evt.data), path = payload.path, data = payload.data;
    if (path === '/') {
      reservations = (data && typeof data === 'object')
        ? Object.keys(data).filter(function(k){ return data[k] === true; })
        : [];
    } else {
      var id = path.replace(/^\//, '');
      if (data === true) { if (reservations.indexOf(id) === -1) reservations.push(id); }
      else { reservations = reservations.filter(function(x){ return x !== id; }); }
    }
    renderTiles();
  });
  es.addEventListener('patch', function(evt) {
    var data = JSON.parse(evt.data).data;
    Object.keys(data).forEach(function(id) {
      if (data[id]) { if (reservations.indexOf(id) === -1) reservations.push(id); }
      else { reservations = reservations.filter(function(x){ return x !== id; }); }
    });
    renderTiles();
  });
}

function toggleReservation(id) {
  if (!fbUrl) {
    var idx = reservations.indexOf(id);
    if (idx !== -1) reservations.splice(idx, 1); else reservations.push(id);
    localStorage.setItem('wk_reservations', JSON.stringify(reservations));
    renderTiles();
    return;
  }
  var reserved = reservations.indexOf(id) !== -1;
  var opts = reserved
    ? { method: 'DELETE' }
    : { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: 'true' };
  fetch(fbUrl + '/reservations/' + encodeURIComponent(id) + '.json', opts).catch(function(){});
  // SSE will fire back and update reservations + re-render
}

function saveCart() { localStorage.setItem('wk_cart', JSON.stringify(cart)); }
function cartCount() { return cart.reduce(function(s,e){ return s+e.quantity; }, 0); }
function cartSubtotal() {
  return cart.reduce(function(s,e){
    var item = STOCK.find(function(i){ return i.id===e.itemId; });
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

function renderTile(item) {
  var t = CONFIG.tileConfig;
  var isRegistry = CONFIG.websiteType === 'registry';
  var isReserved = isRegistry && reservations.indexOf(item.id) !== -1;
  var price = item.price > 0 ? '<span class="tile-price">$'+item.price.toFixed(2)+'</span>' : '';
  var addBtn = isRegistry
    ? '<button class="tile-add-btn'+(isReserved?' tile-add-btn--reserved':'')+'" data-action="toggle-reserve" data-id="'+item.id+'">'+(isReserved?'Reserved &#10003;':'Reserve')+'</button>'
    : '<button class="tile-add-btn" data-action="add-to-cart" data-id="'+item.id+'">Add to cart</button>';
  if (t === 'compact') {
    var compactAction = isRegistry
      ? '<button class="tile-add-btn tile-add-btn--compact'+(isReserved?' tile-add-btn--reserved':'')+'" data-action="toggle-reserve" data-id="'+item.id+'" title="'+(isReserved?'Reserved':'Reserve')+'">'+(isReserved?'&#10003;':'+')+'</button>'
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

function renderLayout(items) {
  var l = CONFIG.layoutConfig;
  var tiles = items.map(renderTile).join('');
  if (l === 'strip')    return '<div class="layout layout--strip">'+tiles+'</div>';
  if (l === 'stacked')  return '<div class="layout layout--stacked">'+tiles+'</div>';
  if (l === 'featured') {
    if (!items.length)  return '<div class="layout layout--featured"></div>';
    var rest = items.slice(1).map(renderTile).join('');
    return '<div class="layout layout--featured">' +
      '<div class="layout-featured-slot">'+renderTile(items[0])+'</div>' +
      '<div class="layout-featured-grid">'+rest+'</div></div>';
  }
  return '<div class="layout layout--grid">'+tiles+'</div>';
}

/* ── Search ───────────────────────────────────────────── */
function matchesQuery(item, q) {
  if (!q) return true;
  var lower = q.toLowerCase();
  if (item.name.toLowerCase().indexOf(lower) !== -1) return true;
  return Object.values(item.metadata||{}).some(function(v){ return String(v).toLowerCase().indexOf(lower) !== -1; });
}

function renderTiles() {
  var filtered = STOCK.filter(function(i){ return matchesQuery(i, query); });
  var grid = document.getElementById('tile-grid');
  if (!filtered.length && query) {
    grid.innerHTML = '<p class="search-no-results">No items match &ldquo;'+esc(query)+'&rdquo;</p>';
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
  var entries = cart.map(function(e){ return {e:e, item:STOCK.find(function(s){return s.id===e.itemId;})}; }).filter(function(x){return x.item;});
  var subtotal = cartSubtotal();
  var hasPrice = entries.some(function(x){ return x.item.price > 0; });
  var body = document.getElementById('cart-body');
  if (!entries.length) { body.innerHTML = '<p class="cart-empty">Your cart is empty.</p>'; return; }

  var html = '<ul class="cart-list">';
  entries.forEach(function(x){
    var e=x.e, item=x.item;
    html += '<li class="cart-item">' +
      '<div class="cart-item-img-wrap">'+(item.image?'<img class="cart-item-img" src="'+esc(item.image)+'" alt="'+esc(item.name)+'">' : '<div class="cart-item-img-placeholder">'+esc((item.name||'?')[0].toUpperCase())+'</div>')+'</div>' +
      '<div class="cart-item-info"><span class="cart-item-name">'+esc(item.name)+'</span>'+(item.price>0?'<span class="cart-item-price">$'+(item.price*e.quantity).toFixed(2)+'</span>':'')+'</div>' +
      '<div class="cart-item-qty"><button data-action="dec-qty" data-id="'+e.itemId+'">−</button><span>'+e.quantity+'</span><button data-action="inc-qty" data-id="'+e.itemId+'">+</button></div>' +
      '<button class="cart-item-remove" data-action="remove-from-cart" data-id="'+e.itemId+'">✕</button>' +
    '</li>';
  });
  html += '</ul><div class="cart-footer">';
  if (hasPrice) html += '<div class="cart-subtotal"><span>Subtotal</span><span>$'+subtotal.toFixed(2)+'</span></div>';
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
  co.savedItems = cart.map(function(e){ return {e:e, item:STOCK.find(function(s){return s.id===e.itemId;})}; }).filter(function(x){return x.item;});
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
    '<p class="checkout-confirm-email">Confirmation will be sent to <strong>'+esc(co.form.email)+'</strong></p>'+
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
      (item.price>0?'<span class="checkout-summary-item-price">$'+(item.price*qty).toFixed(2)+'</span>':'')+
    '</li>';
  });
  html+='</ul>';
  if(hasPrice) html+='<div class="checkout-summary-totals">'+
    '<div class="checkout-summary-row"><span>Subtotal</span><span>$'+subtotal.toFixed(2)+'</span></div>'+
    '<div class="checkout-summary-row"><span>Shipping</span><span>'+(free?'Free':'$5.00')+'</span></div>'+
    '<div class="checkout-summary-row checkout-summary-row--total"><span>Total</span><span>$'+total+'</span></div></div>';
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
  if(a==='toggle-reserve')   toggleReservation(id);
  if(a==='copy-share-link') {
    try { navigator.clipboard.writeText(window.location.href).catch(function(){}); } catch(e) {}
  }
});

/* ── Init ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  initReservations();
  renderTiles(); renderCart(); initSearch(); updateFabs();
  var hasCartWidget = Object.values(CONFIG.widgets||{}).some(function(w){ return w && w.content==='Cart'; });
  var hasHelpWidget = Object.values(CONFIG.widgets||{}).some(function(w){ return w && w.content==='Help'; });
  var isRegistry = CONFIG.websiteType === 'registry';
  var cartFab = document.getElementById('cart-fab');
  if (cartFab && (hasCartWidget || isRegistry)) cartFab.style.display='none';
  var helpFab = document.getElementById('help-fab');
  if (helpFab && hasHelpWidget) helpFab.style.display='none';
  var shareFab = document.getElementById('share-fab');
  if (shareFab && isRegistry) shareFab.style.display='flex';
});
`;
}

// ── Main export ────────────────────────────────────────────────────────────

export async function generateStoreHTML(state) {
  const logoDataUrl = state.brand?.logo
    ?? await fetchAsDataUrl(`${process.env.PUBLIC_URL}/branding/wordmark-tag.svg`);
  const themeVars = buildThemeVarsCSS();
  const css       = buildStaticCSS();
  const navbar    = buildNavbarHTML(state, logoDataUrl);
  const script    = buildScriptContent(state);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Store</title>
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
  <div id="search-wrap" class="store-search-wrap" style="display:none"></div>
  <div id="tile-grid"></div>
  <footer class="app-footer">
    <span class="footer-text">Powered by</span>
    <span class="footer-brand">Winklr</span>
  </footer>
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
    <p>Browse items and add them to your cart. When you're ready, open your cart and click Checkout to complete your order.</p>
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
</div>
<script>
${script}
</script>
</body>
</html>`;
}
