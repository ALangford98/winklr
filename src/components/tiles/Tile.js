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

function AddToCartBtn({ itemId, compact = false }) {
  const { addToCart } = useContext(AppContext);
  return (
    <button
      className={`tile-add-btn${compact ? " tile-add-btn--compact" : ""}`}
      onClick={(e) => { e.stopPropagation(); addToCart(itemId); }}
    >
      {compact ? "+" : "Add to cart"}
    </button>
  );
}

function CompactTile({ item }) {
  return (
    <div className="tile tile--compact">
      <div className="tile-img-wrap tile-img-wrap--sm">
        <TileImage item={item} />
      </div>
      <div className="tile-body">
        <span className="tile-name">{item.name}</span>
        {item.price > 0 && <span className="tile-price">${item.price.toFixed(2)}</span>}
      </div>
      <AddToCartBtn itemId={item.id} compact />
    </div>
  );
}

function StandardTile({ item }) {
  return (
    <div className="tile tile--standard">
      <div className="tile-img-wrap">
        <TileImage item={item} />
      </div>
      <div className="tile-body">
        <span className="tile-name">{item.name}</span>
        {item.price > 0 && <span className="tile-price">${item.price.toFixed(2)}</span>}
        <AddToCartBtn itemId={item.id} />
      </div>
    </div>
  );
}

function DetailedTile({ item }) {
  const metaEntries = Object.entries(item.metadata || {});
  return (
    <div className="tile tile--detailed">
      <div className="tile-img-wrap">
        <TileImage item={item} />
      </div>
      <div className="tile-body">
        <span className="tile-name">{item.name}</span>
        {item.price > 0 && <span className="tile-price">${item.price.toFixed(2)}</span>}
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
        <AddToCartBtn itemId={item.id} />
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
  const Component = VARIANTS[config] ?? StandardTile;
  return <Component item={item} />;
}
