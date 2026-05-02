import React, { useContext } from "react";
import { AppContext } from "../appContext";

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export { CartIcon };

export default function CartDrawer({ open, onClose }) {
  const { state, removeFromCart, updateCartQty, clearCart } = useContext(AppContext);

  const cartItems = state.cart
    .map((entry) => ({ ...entry, item: state.stockList.find((i) => i.id === entry.itemId) }))
    .filter((e) => e.item);

  const subtotal = cartItems.reduce((sum, e) => sum + e.item.price * e.quantity, 0);
  const hasPrice = cartItems.some((e) => e.item.price > 0);

  return (
    <>
      {open && <div className="cart-backdrop" onClick={onClose} />}
      <div className={`cart-drawer${open ? " cart-drawer--open" : ""}`}>
        <div className="cart-header">
          <span className="cart-title">Cart</span>
          <button className="cart-close" onClick={onClose}>✕</button>
        </div>

        {cartItems.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map(({ itemId, quantity, item }) => (
                <li key={itemId} className="cart-item">
                  <div className="cart-item-img-wrap">
                    {item.image
                      ? <img className="cart-item-img" src={item.image} alt={item.name} />
                      : <div className="cart-item-img-placeholder">{item.name?.[0]?.toUpperCase() ?? "?"}</div>
                    }
                  </div>
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    {item.price > 0 && (
                      <span className="cart-item-price">${(item.price * quantity).toFixed(2)}</span>
                    )}
                  </div>
                  <div className="cart-item-qty">
                    <button onClick={() => updateCartQty(itemId, quantity - 1)}>−</button>
                    <span>{quantity}</span>
                    <button onClick={() => updateCartQty(itemId, quantity + 1)}>+</button>
                  </div>
                  <button className="cart-item-remove" onClick={() => removeFromCart(itemId)}>✕</button>
                </li>
              ))}
            </ul>

            <div className="cart-footer">
              {hasPrice && (
                <div className="cart-subtotal">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              )}
              <button className="cart-btn-checkout selector-btn selector-btn--active">
                Checkout
              </button>
              <button className="cart-btn-clear selector-btn" onClick={clearCart}>
                Clear cart
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
