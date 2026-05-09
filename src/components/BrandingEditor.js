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

  const logoSrc = state.brand?.logo ?? `${process.env.PUBLIC_URL}/branding/wordmark.svg`;
  const currencyPrefix = state.brand?.currencyPrefix ?? '$';

  return (
    <div className="branding-editor">
      <div className="branding-preview">
        <img src={logoSrc} alt="Brand logo" className="branding-preview-img" />
      </div>
      <div className="selector-options">
        <label className="selector-btn config-import-label">
          Upload logo
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files[0])}
            hidden
          />
        </label>
        {state.brand?.logo && (
          <button className="selector-btn" onClick={() => update('logo', null)}>
            Reset
          </button>
        )}
      </div>

      <div className="branding-field">
        <label className="branding-field-label">Currency prefix</label>
        <input
          className="editor-add-form-input branding-currency-input"
          type="text"
          maxLength={4}
          value={currencyPrefix}
          onChange={(e) => update('currencyPrefix', e.target.value)}
          placeholder="$"
        />
      </div>
    </div>
  );
}