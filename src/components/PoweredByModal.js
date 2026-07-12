import React, { useContext, useEffect } from "react";
import { AppContext } from "./appContext";
import { WINKLR_HOMEPAGE_URL, encodeLookConfigToHash } from "../utils/shareableUrl";

export default function PoweredByModal({ open, onClose }) {
  const { state } = useContext(AppContext);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const lookUrl = WINKLR_HOMEPAGE_URL + encodeLookConfigToHash(state);

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="help-modal poweredby-modal" role="dialog" aria-modal="true" aria-label="Made with Winklr">
        <div className="help-modal-header">
          <span className="help-modal-title">Made with Winklr</span>
          <button className="help-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="help-modal-body">
          <p className="poweredby-hint">
            Winklr is a free tool for building a gift registry or storefront like this one - no code required.
          </p>
          <a className="poweredby-option" href={lookUrl} target="_blank" rel="noopener noreferrer">
            <span className="poweredby-option-title">Build one that looks like this</span>
            <span className="poweredby-option-desc">
              Starts you off with this theme, layout, and font choices, plus a few sample items to get going.
            </span>
          </a>
          <a className="poweredby-option" href={WINKLR_HOMEPAGE_URL} target="_blank" rel="noopener noreferrer">
            <span className="poweredby-option-title">Start from scratch</span>
            <span className="poweredby-option-desc">A blank Winklr project with the default look.</span>
          </a>
        </div>
      </div>
    </>
  );
}
