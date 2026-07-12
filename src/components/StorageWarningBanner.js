import React, { useEffect, useState } from "react";

export default function StorageWarningBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onFailure = () => setVisible(true);
    window.addEventListener("winklr:storage-write-failed", onFailure);
    return () => window.removeEventListener("winklr:storage-write-failed", onFailure);
  }, []);

  if (!visible) return null;

  return (
    <div className="storage-warning-banner" role="alert">
      <span>
        Your changes aren't being saved - your browser's storage is full. Remove a large
        image (logo, decal, or item photo) or export your config now from the Config panel
        so you don't lose work.
      </span>
      <button
        type="button"
        className="storage-warning-dismiss"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
