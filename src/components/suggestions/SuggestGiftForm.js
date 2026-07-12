import React, { useContext, useRef, useState } from "react";
import { AppContext } from "../appContext";
import { readImageFileAsDataUrl } from "../../utils/readImageFile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MARGIN_CSS = {
  left:   "32px auto 32px 24px",
  center: "32px auto",
  right:  "32px 24px 32px auto",
};

export default function SuggestGiftForm({ align }) {
  const { state, suggestGift } = useContext(AppContext);
  const margin = MARGIN_CSS[align] || MARGIN_CSS.center;
  const fileRef = useRef(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [email, setEmail] = useState(state.guestEmail || "");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file) => {
    if (!file) return;
    try {
      setImage(await readImageFileAsDataUrl(file));
      setError("");
    } catch (err) {
      setError(err.message);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!name.trim()) { setError("Add an item name."); return; }
    if (!EMAIL_RE.test(email.trim())) { setError("That doesn't look like a valid email address."); return; }
    if (link.trim() && !/^https?:\/\//i.test(link.trim())) { setError("Links must start with http:// or https://."); return; }
    setError("");
    setSubmitting(true);
    const ok = await suggestGift({ name, quantity, email, link, image });
    setSubmitting(false);
    if (ok) {
      setSubmitted(true);
    } else {
      setError("Something went wrong sending your suggestion. Check your connection and try again.");
    }
  };

  if (submitted) {
    return (
      <div className="suggest-gift-form suggest-gift-form--done" style={{ margin }}>
        <p className="suggest-gift-thanks">Thanks! Your suggestion has been sent to the registry owner for approval.</p>
      </div>
    );
  }

  return (
    <form className="suggest-gift-form" style={{ margin }} onSubmit={handleSubmit}>
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
        type="url"
        placeholder="Link to it online (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <div className="suggest-gift-image-row">
        {image && <img src={image} alt="" className="suggest-gift-image-preview" />}
        <label className="selector-btn config-import-label suggest-gift-image-btn">
          {image ? "Replace photo" : "Add a photo (optional)"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFile(e.target.files[0])}
            hidden
          />
        </label>
        {image && (
          <button type="button" className="suggestion-reject-btn" onClick={() => setImage("")}>Remove</button>
        )}
      </div>
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
      <button type="submit" className="selector-btn selector-btn--active" disabled={submitting}>
        {submitting ? "Sending..." : "Submit suggestion"}
      </button>
    </form>
  );
}
