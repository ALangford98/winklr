import React from "react";
import Tile from "../tiles/Tile";

function GridLayout({ items, tileConfig }) {
  return (
    <div className="layout layout--grid">
      {items.map((item) => (
        <Tile key={item.id} item={item} config={tileConfig} />
      ))}
    </div>
  );
}

function StripLayout({ items, tileConfig }) {
  return (
    <div className="layout layout--strip">
      {items.map((item) => (
        <Tile key={item.id} item={item} config={tileConfig} />
      ))}
    </div>
  );
}

function StackedLayout({ items, tileConfig }) {
  return (
    <div className="layout layout--stacked">
      {items.map((item) => (
        <Tile key={item.id} item={item} config={tileConfig} />
      ))}
    </div>
  );
}

function FeaturedLayout({ items, tileConfig }) {
  const [featured, ...rest] = items;
  return (
    <div className="layout layout--featured">
      {featured && (
        <div className="layout-featured-slot">
          <Tile item={featured} config={tileConfig} />
        </div>
      )}
      <div className="layout-featured-grid">
        {rest.map((item) => (
          <Tile key={item.id} item={item} config={tileConfig} />
        ))}
      </div>
    </div>
  );
}

const LAYOUTS = {
  grid:     GridLayout,
  strip:    StripLayout,
  stacked:  StackedLayout,
  featured: FeaturedLayout,
};

export default function Layout({ config = "grid", items = [], tileConfig = "standard" }) {
  const Component = LAYOUTS[config] ?? GridLayout;
  return <Component items={items} tileConfig={tileConfig} />;
}
