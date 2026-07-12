import React, { useContext, useState } from 'react';
import { AppContext } from '../appContext';

const STEPS = [
  { key: 'contact',  label: 'Contact'  },
  { key: 'delivery', label: 'Delivery' },
  { key: 'payment',  label: 'Payment'  },
  { key: 'confirm',  label: 'Confirm'  },
];

const FORM_DEFAULTS = {
  name: '', email: '', phone: '',
  line1: '', line2: '', city: '', postcode: '', country: '',
  cardName: '', cardNumber: '', cardExpiry: '', cardCvc: '',
};

function isStepValid(step, form) {
  if (step === 0) return form.name.trim() && form.email.trim();
  if (step === 1) return form.line1.trim() && form.city.trim() && form.postcode.trim() && form.country;
  if (step === 2) return form.cardName.trim() && form.cardNumber.trim() && form.cardExpiry.trim() && form.cardCvc.trim();
  return true;
}

function generateOrderRef() {
  return 'WK-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ── Step indicator ─────────────────────────────────────────

function StepIndicator({ current }) {
  return (
    <div className="checkout-steps">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.key}>
          <div className={[
            'checkout-step-pip',
            i < current  ? 'checkout-step-pip--done'   : '',
            i === current ? 'checkout-step-pip--active' : '',
          ].join(' ')}>
            <div className="checkout-step-circle">
              {i < current ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className="checkout-step-label">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`checkout-step-line${i < current ? ' checkout-step-line--done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Field wrapper ──────────────────────────────────────────

function Field({ label, required, half, children }) {
  return (
    <label className={`checkout-field${half ? ' checkout-field--half' : ''}`}>
      <span className="checkout-field-label">
        {label}
        {required && <span className="checkout-required" aria-hidden="true"> *</span>}
      </span>
      {children}
    </label>
  );
}

// ── Step: Contact ──────────────────────────────────────────

function ContactStep({ form, onChange }) {
  return (
    <div className="checkout-step-form">
      <h3 className="checkout-step-heading">Contact details</h3>
      <Field label="Full name" required>
        <input
          className="checkout-input"
          type="text"
          placeholder="Jane Smith"
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          autoComplete="name"
        />
      </Field>
      <Field label="Email address" required>
        <input
          className="checkout-input"
          type="email"
          placeholder="jane@example.com"
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
          autoComplete="email"
        />
      </Field>
      <Field label="Phone number">
        <input
          className="checkout-input"
          type="tel"
          placeholder="+1 555 000 0000"
          value={form.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          autoComplete="tel"
        />
      </Field>
    </div>
  );
}

// ── Step: Delivery ─────────────────────────────────────────

function DeliveryStep({ form, onChange }) {
  return (
    <div className="checkout-step-form">
      <h3 className="checkout-step-heading">Delivery address</h3>
      <Field label="Address line 1" required>
        <input
          className="checkout-input"
          type="text"
          placeholder="123 Main Street"
          value={form.line1}
          onChange={(e) => onChange('line1', e.target.value)}
          autoComplete="address-line1"
        />
      </Field>
      <Field label="Address line 2">
        <input
          className="checkout-input"
          type="text"
          placeholder="Apartment, suite, etc."
          value={form.line2}
          onChange={(e) => onChange('line2', e.target.value)}
          autoComplete="address-line2"
        />
      </Field>
      <div className="checkout-field-row">
        <Field label="City" required half>
          <input
            className="checkout-input"
            type="text"
            placeholder="New York"
            value={form.city}
            onChange={(e) => onChange('city', e.target.value)}
            autoComplete="address-level2"
          />
        </Field>
        <Field label="Postcode" required half>
          <input
            className="checkout-input"
            type="text"
            placeholder="10001"
            value={form.postcode}
            onChange={(e) => onChange('postcode', e.target.value)}
            autoComplete="postal-code"
          />
        </Field>
      </div>
      <Field label="Country" required>
        <select
          className="checkout-input checkout-select"
          value={form.country}
          onChange={(e) => onChange('country', e.target.value)}
          autoComplete="country-name"
        >
          <option value="">Select country…</option>
          <option>Australia</option>
          <option>Canada</option>
          <option>France</option>
          <option>Germany</option>
          <option>Ireland</option>
          <option>New Zealand</option>
          <option>United Kingdom</option>
          <option>United States</option>
          <option>Other</option>
        </select>
      </Field>
    </div>
  );
}

// ── Step: Payment ──────────────────────────────────────────

function PaymentStep({ form, onChange }) {
  return (
    <div className="checkout-step-form">
      <h3 className="checkout-step-heading">Payment</h3>
      <div className="checkout-payment-notice">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <circle cx="12" cy="16" r="0.5" fill="currentColor" />
        </svg>
        Stripe integration not yet configured. These fields are a preview only.
      </div>
      <Field label="Cardholder name" required>
        <input
          className="checkout-input"
          type="text"
          placeholder="Jane Smith"
          value={form.cardName}
          onChange={(e) => onChange('cardName', e.target.value)}
          autoComplete="cc-name"
        />
      </Field>
      <Field label="Card number" required>
        <input
          className="checkout-input checkout-input--mono"
          type="text"
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          value={form.cardNumber}
          onChange={(e) => onChange('cardNumber', e.target.value)}
          autoComplete="cc-number"
        />
      </Field>
      <div className="checkout-field-row">
        <Field label="Expiry" required half>
          <input
            className="checkout-input checkout-input--mono"
            type="text"
            placeholder="MM / YY"
            maxLength={7}
            value={form.cardExpiry}
            onChange={(e) => onChange('cardExpiry', e.target.value)}
            autoComplete="cc-exp"
          />
        </Field>
        <Field label="CVC" required half>
          <input
            className="checkout-input checkout-input--mono"
            type="text"
            placeholder="123"
            maxLength={4}
            value={form.cardCvc}
            onChange={(e) => onChange('cardCvc', e.target.value)}
            autoComplete="cc-csc"
          />
        </Field>
      </div>
      <div className="checkout-secure-note">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        This is a demo checkout - no real payment is processed, and no card details leave this browser.
      </div>
    </div>
  );
}

// ── Step: Confirmation ─────────────────────────────────────

function ConfirmationStep({ orderRef, form, cartItems }) {
  return (
    <div className="checkout-confirmation">
      <div className="checkout-confirm-icon" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className="checkout-confirm-heading">Order placed!</h3>
      <p className="checkout-confirm-ref">Reference: <strong>{orderRef}</strong></p>
      <p className="checkout-confirm-email">
        This demo order was recorded on this device only - no confirmation email is sent to{' '}
        <strong>{form.email}</strong> (there's no backend to send it from). Take a screenshot of
        this reference if you need to note it down.
      </p>
      <div className="checkout-confirm-details">
        <div className="checkout-confirm-section">
          <p className="checkout-confirm-section-title">Delivering to</p>
          <address className="checkout-confirm-address">
            {form.name}<br />
            {form.line1}{form.line2 ? `, ${form.line2}` : ''}<br />
            {form.city}, {form.postcode}<br />
            {form.country}
          </address>
        </div>
        <div className="checkout-confirm-section">
          <p className="checkout-confirm-section-title">Items</p>
          <ul className="checkout-confirm-items">
            {cartItems.map(({ itemId, quantity, item }) => (
              <li key={itemId}>{item.name} <span className="checkout-confirm-qty">× {quantity}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Order summary ──────────────────────────────────────────

function OrderSummary({ cartItems, hasPrice, subtotal, cp }) {
  const shippingFree = !hasPrice || subtotal >= 50;
  const shippingCost = shippingFree ? 0 : 5;
  const total = hasPrice ? (subtotal + shippingCost).toFixed(2) : null;

  return (
    <div className="checkout-summary">
      <h3 className="checkout-summary-heading">Order summary</h3>
      <ul className="checkout-summary-list">
        {cartItems.map(({ itemId, quantity, item }) => (
          <li key={itemId} className="checkout-summary-item">
            <div className="checkout-summary-img-wrap">
              {item.image
                ? <img className="checkout-summary-img" src={item.image} alt={item.name} />
                : <div className="checkout-summary-img-placeholder">{item.name?.[0]?.toUpperCase() ?? '?'}</div>
              }
              <span className="checkout-summary-qty-badge">{quantity}</span>
            </div>
            <span className="checkout-summary-item-name">{item.name}</span>
            {item.price > 0 && (
              <span className="checkout-summary-item-price">{cp}{(item.price * quantity).toFixed(2)}</span>
            )}
          </li>
        ))}
      </ul>
      {hasPrice && (
        <div className="checkout-summary-totals">
          <div className="checkout-summary-row">
            <span>Subtotal</span>
            <span>{cp}{subtotal.toFixed(2)}</span>
          </div>
          <div className="checkout-summary-row">
            <span>Shipping</span>
            <span>{shippingFree ? 'Free' : `${cp}${shippingCost.toFixed(2)}`}</span>
          </div>
          <div className="checkout-summary-row checkout-summary-row--total">
            <span>Total</span>
            <span>{cp}{total}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────

const CheckoutModal = ({ open, onClose }) => {
  const { state, clearCart } = useContext(AppContext);
  const cp = state.brand?.currencyPrefix ?? '$';
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState(FORM_DEFAULTS);
  const [orderRef, setOrderRef] = useState('');

  const cartItems = state.cart
    .map((entry) => ({ ...entry, item: state.stockList.find((i) => i.id === entry.itemId) }))
    .filter((e) => e.item);

  const subtotal = cartItems.reduce((sum, e) => sum + (e.item.price || 0) * e.quantity, 0);
  const hasPrice = cartItems.some((e) => e.item.price > 0);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleNext = () => {
    if (step === 2) {
      setOrderRef(generateOrderRef());
      clearCart();
    }
    setStep((s) => s + 1);
  };

  const handleClose = () => {
    setStep(0);
    setForm(FORM_DEFAULTS);
    setOrderRef('');
    onClose();
  };

  if (!open) return null;

  const isConfirm = step === 3;

  return (
    <div className="checkout-backdrop" onClick={handleClose}>
      <div
        className="checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="checkout-header">
          <span className="checkout-title">Checkout</span>
          <button className="checkout-close" onClick={handleClose} aria-label="Close checkout">✕</button>
        </div>

        {!isConfirm && <StepIndicator current={step} />}

        <div className={`checkout-body${isConfirm ? ' checkout-body--confirm' : ''}`}>
          <div className="checkout-form-col">
            {step === 0 && <ContactStep    form={form} onChange={handleChange} />}
            {step === 1 && <DeliveryStep   form={form} onChange={handleChange} />}
            {step === 2 && <PaymentStep    form={form} onChange={handleChange} />}
            {step === 3 && <ConfirmationStep orderRef={orderRef} form={form} cartItems={cartItems} />}
          </div>

          {!isConfirm && (
            <div className="checkout-summary-col">
              <OrderSummary cartItems={cartItems} hasPrice={hasPrice} subtotal={subtotal} cp={cp} />
            </div>
          )}
        </div>

        <div className="checkout-footer">
          {step > 0 && step < 3 && (
            <button className="checkout-btn checkout-btn--back" onClick={() => setStep((s) => s - 1)}>
              Back
            </button>
          )}
          {step < 3 && (
            <button
              className="checkout-btn checkout-btn--primary"
              onClick={handleNext}
              disabled={!isStepValid(step, form)}
            >
              {step === 2 ? 'Place order' : 'Continue'}
            </button>
          )}
          {step === 3 && (
            <button className="checkout-btn checkout-btn--primary" onClick={handleClose}>
              Continue shopping
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
