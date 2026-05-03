import './App.css';
import './styles/home.css';
import './styles/navbar.css';
import './styles/tiles.css';
import './styles/layouts.css';
import './styles/cart.css';

import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppContext } from './components/appContext';
import Navbar from './components/navbar/Navbar';
import NavbarView from './components/view-mode/NavbarView';
import CartDrawer, { CartIcon } from './components/cart/CartDrawer';
import HelpModal from './components/HelpModal';
import Home from './pages/Home';

function App() {
  const { toggleViewMode, state } = useContext(AppContext);
  const [cartOpen, setCartOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const cartCount = state.cart.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <Router>
      <div className="App">
        {state.viewMode ? <Navbar /> : <NavbarView />}
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>

        <div className="fab-group">
          <button className="help-fab" onClick={() => setHelpOpen(true)} title="Help">?</button>
          <button className="cart-fab" onClick={() => setCartOpen(true)}>
            <CartIcon />
            Cart
            {cartCount > 0 && <span className="cart-fab-badge">{cartCount}</span>}
          </button>
          <button className="Editing" onClick={toggleViewMode}>
            {state.viewMode ? 'View Mode' : 'Edit Mode'}
          </button>
        </div>

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      </div>
    </Router>
  );
}

export default App;
