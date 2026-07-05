import React, { useContext, useRef } from "react";
import { AppContext } from "./appContext";

export default function BrandingEditor() {
  const { state, setBrand } = useContext(AppContext);
  const inputRef = useRef(null);

  const update = (field, value) =>
    setBrand((prev) => ({ ...prev, [field]: value }));

  const handleUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => update('logo', e.target.result);
    reader.readAsDataURL(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const logo = state.brand?.logo ?? null;
  const currencyPrefix = state.brand?.currencyPrefix ?? '$';
  const pageTitle = state.brand?.pageTitle ?? '';
  const pageSubtitle = state.brand?.pageSubtitle ?? '';

  return (
    <div className="branding-editor">
      <label className="branding-field-label">Registry title (shown to guests)</label>
      <input
        className="editor-add-form-input"
        type="text"
        placeholder="e.g. Our Baby Shower Registry"
        value={pageTitle}
        onChange={(e) => update('pageTitle', e.target.value)}
      />

      <label className="branding-field-label">Subheading (optional)</label>
      <input
        className="editor-add-form-input"
        type="text"
        placeholder="e.g. Thank you for celebrating with us!"
        value={pageSubtitle}
        onChange={(e) => update('pageSubtitle', e.target.value)}
      />

      <label className="branding-field-label">Logo</label>
      <div
        className={`branding-preview${logo ? ' branding-preview--filled' : ''}`}
        onClick={() => inputRef.current.click()}
        title="Click to upload your logo"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current.click()}
      >
        {logo
          ? <img src={logo} alt="Your logo" className="branding-preview-img" />
          : <span className="branding-preview-empty">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Your logo here - click to upload</span>
            </span>
        }
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleUpload(e.target.files[0])}
          hidden
        />
      </div>
      {logo && (
        <div className="selector-options">
          <button type="button" className="selector-btn" onClick={() => inputRef.current.click()}>
            Replace logo
          </button>
          <button type="button" className="selector-btn" onClick={() => update('logo', null)}>
            Remove logo
          </button>
        </div>
      )}
      {!logo && (
        <p className="branding-hint">No logo yet - the Winklr mark will show in the navbar until you upload one.</p>
      )}

      <label className="branding-field-label">Currency prefix</label>
      <div className="branding-field">
        <input
          className="editor-add-form-input branding-currency-input"
          type="text"
          maxLength={4}
          value={currencyPrefix}
          onChange={(e) => update('currencyPrefix', e.target.value)}
          placeholder="$"
        />
        <span className="branding-hint">Shown before item prices, e.g. {currencyPrefix || '$'}25.00</span>
      </div>
    </div>
  );
}