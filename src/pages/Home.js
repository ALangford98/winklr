import React, { useContext } from "react";
import { AppContext } from "../components/appContext";
import StockListLoader from "../components/stock/StockListLoader";
import StockListEditor from "../components/stock/StockListEditor";
import TileConfigSelector from "../components/tiles/TileConfigSelector";
import LayoutSelector from "../components/layout/LayoutSelector";
import Layout from "../components/layout/Layout";
import EmptyState from "../components/EmptyState";
import ThemePicker from "../components/ThemePicker";
import BrandingEditor from "../components/BrandingEditor";
import ConfigPorter from "../components/ConfigPorter";
import IntegrationsPanel from "../components/IntegrationsPanel";
import CollapsibleSection from "../components/CollapsibleSection";

function matchesQuery(item, query) {
  const q = query.toLowerCase();
  if (item.name.toLowerCase().includes(q)) return true;
  return Object.values(item.metadata || {}).some((v) =>
    String(v).toLowerCase().includes(q)
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <span className="footer-text">Powered by</span>
      <img
        src={`${process.env.PUBLIC_URL}/branding/wordmark-lowercase.svg`}
        alt="Winklr"
        className="footer-wordmark"
      />
    </footer>
  );
}

export default function Home() {
  const { state, setStockList, setSearchQuery } = useContext(AppContext);

  const hasSearchWidget = Object.values(state.widgets).some(
    (w) => w?.type === 'function' && w?.content === 'Search'
  );

  const query = state.searchQuery.trim();
  const filtered = query
    ? state.stockList.filter((item) => matchesQuery(item, query))
    : state.stockList;

  return (
    <div className="Home">
      {state.viewMode && (
        <aside className="edit-panel">
          <CollapsibleSection title="Stock List" storageKey="stockLoader" defaultOpen={true}>
            <StockListLoader />
          </CollapsibleSection>
          <CollapsibleSection title={`Items${state.stockList.length ? ` (${state.stockList.length})` : ''}`} storageKey="stockEditor" defaultOpen={true}>
            <StockListEditor />
          </CollapsibleSection>
          <CollapsibleSection title="Tile Style" storageKey="tileConfig" defaultOpen={false}>
            <TileConfigSelector />
          </CollapsibleSection>
          <CollapsibleSection title="Layout" storageKey="layout" defaultOpen={false}>
            <LayoutSelector />
          </CollapsibleSection>
          <CollapsibleSection title="Theme" storageKey="theme" defaultOpen={false}>
            <ThemePicker />
          </CollapsibleSection>
          <CollapsibleSection title="Branding" storageKey="branding" defaultOpen={false}>
            <BrandingEditor />
          </CollapsibleSection>
          <CollapsibleSection title="Integrations" storageKey="integrations" defaultOpen={false}>
            <IntegrationsPanel />
          </CollapsibleSection>
          <CollapsibleSection title="Config" storageKey="config" defaultOpen={false}>
            <ConfigPorter />
          </CollapsibleSection>
        </aside>
      )}

      <div className="content-area">
        {state.stockList.length > 0 && !hasSearchWidget && (
          <div className="store-search-wrap">
            <input
              className="store-search-input"
              type="text"
              placeholder="Search items..."
              value={state.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {query && (
              <button
                className="store-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {state.stockList.length === 0 ? (
          <EmptyState />
        ) : filtered.length > 0 ? (
          <Layout
            config={state.layoutConfig}
            items={filtered}
            tileConfig={state.tileConfig}
            isEditMode={state.viewMode}
            onReorder={setStockList}
          />
        ) : (
          <p className="search-no-results">No items match "{state.searchQuery}"</p>
        )}

        <Footer />
      </div>
    </div>
  );
}
