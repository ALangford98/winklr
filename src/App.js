import './App.css';
import './styles/home.css';
import './styles/navbar.css';
import './styles/tiles.css';
import './styles/layouts.css';
import './styles/cart.css';
import './styles/checkout.css';
import './styles/admin.css';
import './styles/suggestions.css';
import './styles/access.css';
import './styles/cashfund.css';

import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppContext } from './components/appContext';
import Navbar from './components/navbar/Navbar';
import NavbarView from './components/view-mode/NavbarView';
import CartDrawer, { CartIcon } from './components/cart/CartDrawer';
import HelpModal from './components/HelpModal';
import CheckoutModal from './components/checkout/CheckoutModal';
import OwnerGateModal from './components/OwnerGateModal';
import AccessGateScreen from './components/access/AccessGateScreen';
import Home from './pages/Home';
import Admin from './pages/Admin';
import StorageWarningBanner from './components/StorageWarningBanner';
import { encodeConfigToHash } from './utils/shareableUrl';

function hasWidget(widgets, type, content) {
  return Object.values(widgets).some((w) => w?.type === type && w?.content === content);
}

function ShareFab({ state }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const hash = encodeConfigToHash(state);
    const url  = window.location.origin + window.location.pathname + hash;
    window.history.pushState(null, "", hash);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard blocked — URL is still in the address bar
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className="cart-fab" onClick={handleShare} title="Copy registry link">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
      {copied ? "Copied!" : "Share"}
    </button>
  );
}

function StoreApp() {
  const {
    toggleViewMode, state, cartOpen, setCartOpen, helpOpen, setHelpOpen,
    checkoutOpen, setCheckoutOpen, setMobilePanelOpen, ownerUnlocked, setOwnerUnlocked,
  } = useContext(AppContext);
  const [gateOpen, setGateOpen] = useState(false);

  const isRegistry   = state.websiteType === 'registry';
  const cartCount    = state.cart.reduce((sum, c) => sum + c.quantity, 0);
  const hideCartFab  = isRegistry || hasWidget(state.widgets, 'link', 'Cart');
  const hideHelpFab  = hasWidget(state.widgets, 'link', 'Help');
  const ownerPasscode = state.integrations?.ownerPasscode;

  const handleToggleViewMode = () => {
    if (state.viewMode) {
      setMobilePanelOpen(false);
      toggleViewMode();
      return;
    }
    if (ownerPasscode && !ownerUnlocked) {
      setGateOpen(true);
      return;
    }
    toggleViewMode();
  };

  const handleGateSuccess = () => {
    setOwnerUnlocked(true);
    setGateOpen(false);
    toggleViewMode();
  };

  // A gate with no password set would be trivially passable (blank matches
  // blank) while still locking the owner out of their own session - so it
  // isn't considered "active" until a real password exists.
  if (state.accessGate?.enabled && state.accessGate?.password && !state.gatePassed) {
    return <AccessGateScreen />;
  }

  return (
    <div className="App">
      <StorageWarningBanner />
      {state.viewMode ? <Navbar /> : <NavbarView />}
      <Home />

      <div className="fab-group">
          {!hideHelpFab && (
            <button className="help-fab" onClick={() => setHelpOpen(true)} title="Help">?</button>
          )}
          {!hideCartFab && (
            <button className="cart-fab" onClick={() => setCartOpen(true)}>
              <CartIcon />
              Cart
              {cartCount > 0 && <span className="cart-fab-badge">{cartCount}</span>}
            </button>
          )}
          {isRegistry && <ShareFab state={state} />}
          {state.viewMode && (
            <button className="panel-fab" onClick={() => setMobilePanelOpen(true)} title="Edit panel">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
          )}
          <button className="Editing" onClick={handleToggleViewMode}>
            {state.viewMode ? 'View Mode' : 'Edit Mode'}
          </button>
        </div>

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
        {!isRegistry && <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />}
        {gateOpen && (
          <OwnerGateModal
            passcode={ownerPasscode}
            onSuccess={handleGateSuccess}
            onClose={() => setGateOpen(false)}
          />
        )}
      </div>
  );
}

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/*" element={<StoreApp />} />
      </Routes>
    </Router>
  );
}

export default App;
