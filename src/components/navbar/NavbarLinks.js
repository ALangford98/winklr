import React, { useContext } from 'react';
import { AppContext } from '../appContext';

const HelpLink = () => {
  const { setHelpOpen } = useContext(AppContext);
  return (
    <button className="navbar-action-btn" onClick={() => setHelpOpen(true)}>
      Help
    </button>
  );
};

const CartLink = () => {
  const { state, setCartOpen } = useContext(AppContext);
  const count = state.cart.reduce((sum, c) => sum + c.quantity, 0);
  return (
    <button className="navbar-action-btn" onClick={() => setCartOpen(true)}>
      Cart
      {count > 0 && <span className="navbar-cart-badge">{count}</span>}
    </button>
  );
};

const LINK_COMPONENTS = { Help: <HelpLink />, Cart: <CartLink /> };

export const navbarLinksOptions = [
  { value: 'Help', label: 'Help' },
  { value: 'Cart', label: 'Cart' },
];

export const NavbarLinks = ({ selectedOption }) => LINK_COMPONENTS[selectedOption] ?? null;
