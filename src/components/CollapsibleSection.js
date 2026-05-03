import React from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const CollapsibleSection = ({ title, storageKey, defaultOpen = false, children }) => {
  const [open, setOpen] = useLocalStorage(`winklr_panel_${storageKey}`, defaultOpen);

  return (
    <div className={`collapsible-section${open ? ' collapsible-section--open' : ''}`}>
      <button
        className="collapsible-header"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="collapsible-title">{title}</span>
        <svg
          className="collapsible-chevron"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="collapsible-body">{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
