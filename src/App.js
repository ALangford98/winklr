import './App.css';
import './styles/home.css';
import './styles/navbar.css';
import './styles/tiles.css';
import './styles/layouts.css';
import './styles/cart.css';
import './styles/checkout.css';

import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppContext } from './components/appContext';
import Navbar from './components/navbar/Navbar';
import NavbarView from './components/view-mode/NavbarView';
import CartDrawer, { CartIcon } from './components/cart/CartDrawer';
import HelpModal from './components/HelpModal';
import CheckoutModal from './components/checkout/CheckoutModal';
import Home from './pages/Home';
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

function App() {
  const { toggleViewMode, state, cartOpen, setCartOpen, helpOpen, setHelpOpen, checkoutOpen, setCheckoutOpen } = useContext(AppContext);

  const isRegistry   = state.websiteType === 'registry';
  const cartCount    = state.cart.reduce((sum, c) => sum + c.quantity, 0);
  const hideCartFab  = isRegistry || hasWidget(state.widgets, 'link', 'Cart');
  const hideHelpFab  = hasWidget(state.widgets, 'link', 'Help');

  return (
    <Router>
      <div className="App">
        {state.viewMode ? <Navbar /> : <NavbarView />}
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>

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
          <button className="Editing" onClick={toggleViewMode}>
            {state.viewMode ? 'View Mode' : 'Edit Mode'}
          </button>
        </div>

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
        {!isRegistry && <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />}
      </div>
    </Router>
  );
}

export default App;
