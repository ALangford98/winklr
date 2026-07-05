import React, { useContext, useState } from "react";
import { AppContext } from "../appContext";
import ReserveNameModal from "./ReserveNameModal";

function Placeholder({ name }) {
  return (
    <div className="tile-img-placeholder">
      {name ? name[0].toUpperCase() : "?"}
    </div>
  );
}

function TileImage({ item }) {
  if (!item.image) return <Placeholder name={item.name} />;
  return <img className="tile-img" src={item.image} alt={item.name} />;
}

function TileActionBtn({ item, compact = false }) {
  const { state, addToCart, reserveItem, setGuestName } = useContext(AppContext);
  const isRegistry = state.websiteType === "registry";
  const [showNameModal, setShowNameModal] = useState(false);

  if (isRegistry) {
    const itemReservations = (state.reservations || {})[item.id] || {};
    const reserved  = Object.values(itemReservations).reduce((sum, n) => sum + n, 0);
    const myGuest   = (state.guestName || '').trim() || 'Anonymous';
    const mine      = itemReservations[myGuest] || 0;
    const needed    = item.quantity || 0;
    const full      = needed > 0 && reserved >= needed;
    const needsName = item.nameRequired !== false && !state.guestName?.trim();

    const handleReserve = () => {
      if (needsName) { setShowNameModal(true); return; }
      reserveItem(item.id, 1);
    };

    const handleNameSuccess = (name) => {
      setGuestName(name);
      reserveItem(item.id, 1, name);
      setShowNameModal(false);
    };

    const nameModal = showNameModal && (
      <ReserveNameModal
        itemName={item.name}
        onSuccess={handleNameSuccess}
        onClose={() => setShowNameModal(false)}
      />
    );

    if (compact) {
      return (
        <div className="tile-reserve-compact" onClick={(e) => e.stopPropagation()}>
          {mine > 0 && (
            <button className="tile-reserve-step" onClick={() => reserveItem(item.id, -1)}>−</button>
          )}
          {reserved > 0 && <span className="tile-reserve-count">{reserved}{needed > 0 ? `/${needed}` : ''}</span>}
          {!full && (
            <button className="tile-reserve-step tile-reserve-step--add" onClick={handleReserve}>+</button>
          )}
          {full && <span className="tile-reserve-full">✓</span>}
          {nameModal}
        </div>
      );
    }

    return (
      <div className="tile-reserve-wrap" onClick={(e) => e.stopPropagation()}>
        {needed > 0 && (
          <span className="tile-reserve-label">
            {reserved} of {needed} reserved
          </span>
        )}
        {needed === 0 && reserved > 0 && (
          <span className="tile-reserve-label">{reserved} reserved</span>
        )}
        <div className="tile-reserve-controls">
          {mine > 0 && (
            <button className="tile-reserve-step" onClick={() => reserveItem(item.id, -1)} title="Remove one of your reservations">−</button>
          )}
          {full ? (
            <span className="tile-add-btn tile-add-btn--reserved">Fully Reserved ✓</span>
          ) : (
            <button className="tile-add-btn" onClick={handleReserve}>
              Reserve
            </button>
          )}
        </div>
        {nameModal}
      </div>
    );
  }

  return (
    <button
      className={`tile-add-btn${compact ? " tile-add-btn--compact" : ""}`}
      onClick={(e) => { e.stopPropagation(); addToCart(item.id); }}
    >
      {compact ? "+" : "Add to cart"}
    </button>
  );
}

function CompactTile({ item, cp }) {
  return (
    <div className="tile tile--compact">
      <div className="tile-img-wrap tile-img-wrap--sm">
        <TileImage item={item} />
      </div>
      <div className="tile-body">
        <span className="tile-name">{item.name}</span>
        {item.price > 0 && <span className="tile-price">{cp}{item.price.toFixed(2)}</span>}
      </div>
      <TileActionBtn item={item} compact />
    </div>
  );
}

function StandardTile({ item, cp }) {
  return (
    <div className="tile tile--standard">
      <div className="tile-img-wrap">
        <TileImage item={item} />
      </div>
      <div className="tile-body">
        <span className="tile-name">{item.name}</span>
        {item.price > 0 && <span className="tile-price">{cp}{item.price.toFixed(2)}</span>}
        <TileActionBtn item={item} />
      </div>
    </div>
  );
}

function DetailedTile({ item, cp }) {
  const metaEntries = Object.entries(item.metadata || {});
  return (
    <div className="tile tile--detailed">
      <div className="tile-img-wrap">
        <TileImage item={item} />
      </div>
      <div className="tile-body">
        <span className="tile-name">{item.name}</span>
        {item.price > 0 && <span className="tile-price">{cp}{item.price.toFixed(2)}</span>}
        {metaEntries.length > 0 && (
          <dl className="tile-meta">
            {metaEntries.map(([k, v]) => (
              <div key={k} className="tile-meta-row">
                <dt>{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
          </dl>
        )}
        <TileActionBtn item={item} />
      </div>
    </div>
  );
}

const VARIANTS = {
  compact: CompactTile,
  standard: StandardTile,
  detailed: DetailedTile,
};

export default function Tile({ item, config = "standard" }) {
  const { state } = useContext(AppContext);
  const cp = state.brand?.currencyPrefix ?? '$';
  const Component = VARIANTS[config] ?? StandardTile;
  return <Component item={item} cp={cp} />;
}