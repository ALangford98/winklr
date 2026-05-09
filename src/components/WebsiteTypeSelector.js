import React, { useContext } from "react";
import { AppContext } from "./appContext";

const TYPES = [
  {
    id: "store",
    label: "Online Store",
    description: "Cart, checkout, and shopping features.",
  },
  {
    id: "registry",
    label: "Registry",
    description: "Gift registry for weddings, birthdays, and more.",
  },
];

export default function WebsiteTypeSelector() {
  const { state, setWebsiteType } = useContext(AppContext);

  return (
    <div className="website-type-selector">
      {TYPES.map(({ id, label, description }) => (
        <button
          key={id}
          className={`website-type-btn${state.websiteType === id ? " website-type-btn--active" : ""}`}
          onClick={() => setWebsiteType(id)}
        >
          <span className="website-type-label">{label}</span>
          <span className="website-type-desc">{description}</span>
        </button>
      ))}
    </div>
  );
}
