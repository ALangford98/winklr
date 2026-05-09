import React, { useContext } from "react";
import { AppContext } from "../appContext";

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
  const { state, addToCart, toggleReservation } = useContext(AppContext);
  const isRegistry = state.websiteType === "registry";
  const isReserved = isRegistry && (state.reservations || []).includes(item.id);

  if (isRegistry) {
    return (
      <button
        className={`tile-add-btn${compact ? " tile-add-btn--compact" : ""}${isReserved ? " tile-add-btn--reserved" : ""}`}
        onClick={(e) => { e.stopPropagation(); toggleReservation(item.id); }}
        title={isReserved ? "Reserved — click to unreserve" : "Reserve this item"}
      >
        {compact ? (isReserved ? "✓" : "+") : (isReserved ? "Reserved ✓" : "Reserve")}
      </button>
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