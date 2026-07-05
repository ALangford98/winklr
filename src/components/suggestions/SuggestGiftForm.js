import React, { useContext, useState } from "react";
import { AppContext } from "../appContext";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SuggestGiftForm() {
  const { suggestGift } = useContext(AppContext);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Add an item name."); return; }
    if (!EMAIL_RE.test(email.trim())) { setError("That doesn't look like a valid email address."); return; }
    setError("");
    suggestGift({ name, quantity, email });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="suggest-gift-form suggest-gift-form--done">
        <p className="suggest-gift-thanks">Thanks! Your suggestion has been sent to the registry owner for approval.</p>
      </div>
    );
  }

  return (
    <form className="suggest-gift-form" onSubmit={handleSubmit}>
      <p className="suggest-gift-heading">Suggest a gift</p>
      <p className="suggest-gift-hint">
        Don't see something you'd like to give? Suggest it below - the registry owner
        reviews every suggestion before it's added.
      </p>
      <input
        className="editor-add-form-input"
        type="text"
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="editor-add-form-input"
        type="number"
        min="0"
        step="1"
        placeholder="Suggested quantity"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
      />
      <input
        className="editor-add-form-input"
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <p className="suggest-gift-email-note">
        We only check this looks like a real email address - it isn't verified. It's used
        so the owner can follow up with you about your suggestion, and isn't shown publicly.
      </p>
      {error && <p className="suggest-gift-error">{error}</p>}
      <button type="submit" className="selector-btn selector-btn--active">Submit suggestion</button>
    </form>
  );
}
