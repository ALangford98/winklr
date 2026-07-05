import React, { useContext, useRef } from "react";
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
import WebsiteTypeSelector from "../components/WebsiteTypeSelector";
import CategoryConfig from "../components/CategoryConfig";
import DecalsPanel from "../components/decals/DecalsPanel";
import DecalsLayer from "../components/decals/DecalsLayer";

const SEARCH_MARGIN_CSS = { left: "0", center: "0 auto", right: "0 0 0 auto" };

function matchesQuery(item, query) {
  const q = query.toLowerCase();
  if (item.name.toLowerCase().includes(q)) return true;
  if ((item.categories || []).some((c) => c.toLowerCase().includes(q))) return true;
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

function CategorySection({ cat, items, state, onReorder }) {
  const cfg = state.categoryConfig?.[cat] || {};
  return (
    <div className="category-section">
      <div className="category-section-header">
        <h2 className="category-section-title">
          {cfg.label || cat}
        </h2>
        {cfg.description && <p className="category-section-desc">{cfg.description}</p>}
      </div>
      <Layout
        config={state.layoutConfig}
        items={items}
        tileConfig={state.tileConfig}
        align={state.layoutAlign}
        isEditMode={state.viewMode}
        onReorder={onReorder}
      />
    </div>
  );
}

function GroupedContent({ state, filtered, setStockList }) {
  const orderedCats = [
    ...Object.keys(state.categoryConfig || {}),
    ...new Set(state.stockList.flatMap((i) => i.categories || [])),
  ].filter((c, i, arr) => c && arr.indexOf(c) === i);

  const makeReorder = (cat) => (reorderedItems) => {
    setStockList((prev) => {
      const result = [...prev];
      const indices = prev.reduce((acc, item, idx) => {
        if ((item.categories || []).includes(cat)) acc.push(idx);
        return acc;
      }, []);
      indices.forEach((origIdx, newPos) => { result[origIdx] = reorderedItems[newPos]; });
      return result;
    });
  };

  const makeUncatReorder = (reorderedItems) => {
    setStockList((prev) => {
      const result = [...prev];
      const indices = prev.reduce((acc, item, idx) => {
        if (!(item.categories || []).length) acc.push(idx);
        return acc;
      }, []);
      indices.forEach((origIdx, newPos) => { result[origIdx] = reorderedItems[newPos]; });
      return result;
    });
  };

  const sections = orderedCats
    .map((cat) => ({
      cat,
      items: filtered.filter((i) => (i.categories || []).includes(cat)),
    }))
    .filter(({ items }) => items.length > 0);

  const uncategorized = filtered.filter((i) => !(i.categories || []).length);

  if (sections.length === 0 && uncategorized.length === 0) return null;

  return (
    <div className="category-groups">
      {sections.map(({ cat, items }, idx) => (
        <React.Fragment key={cat}>
          {idx > 0 && <div className="category-divider" />}
          <CategorySection
            cat={cat}
            items={items}
            state={state}
            onReorder={makeReorder(cat)}
          />
        </React.Fragment>
      ))}
      {uncategorized.length > 0 && (
        <>
          {sections.length > 0 && <div className="category-divider" />}
          <div className="category-section">
            <Layout
              config={state.layoutConfig}
              items={uncategorized}
              tileConfig={state.tileConfig}
              align={state.layoutAlign}
              isEditMode={state.viewMode}
              onReorder={makeUncatReorder}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function Home() {
  const { state, setStockList, setSearchQuery, mobilePanelOpen, setMobilePanelOpen } = useContext(AppContext);
  const contentAreaRef = useRef(null);

  const hasSearchWidget = Object.values(state.widgets).some(
    (w) => w?.type === 'function' && w?.content === 'Search'
  );

  const query = state.searchQuery.trim();
  const filtered = query
    ? state.stockList.filter((item) => matchesQuery(item, query))
    : state.stockList;

  const hasCategoryItems = state.stockList.some((i) => i.categories?.length > 0);

  return (
    <div className="Home">
      {state.viewMode && (
        <>
          {mobilePanelOpen && (
            <div className="mobile-panel-backdrop" onClick={() => setMobilePanelOpen(false)} />
          )}
          <aside className={`edit-panel${mobilePanelOpen ? ' edit-panel--open' : ''}`}>
            <button className="mobile-panel-close" onClick={() => setMobilePanelOpen(false)} aria-label="Close panel">
              <span className="mobile-panel-handle-bar" />
            </button>
            <CollapsibleSection title="Website Type" storageKey="websiteType" defaultOpen={true}>
              <WebsiteTypeSelector />
            </CollapsibleSection>
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
            <CollapsibleSection title="Categories" storageKey="categories" defaultOpen={false}>
              <CategoryConfig />
            </CollapsibleSection>
            <CollapsibleSection title="Theme" storageKey="theme" defaultOpen={false}>
              <ThemePicker />
            </CollapsibleSection>
            <CollapsibleSection title="Decals" storageKey="decals" defaultOpen={false}>
              <DecalsPanel />
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
        </>
      )}

      <div className="content-area" ref={contentAreaRef}>
        <DecalsLayer containerRef={contentAreaRef} />
        {(state.brand?.pageTitle || state.brand?.pageSubtitle) && (
          <div className="page-header">
            {state.brand.pageTitle    && <h1 className="page-header-title">{state.brand.pageTitle}</h1>}
            {state.brand.pageSubtitle && <p  className="page-header-subtitle">{state.brand.pageSubtitle}</p>}
          </div>
        )}

        {state.stockList.length > 0 && !hasSearchWidget && (
          <div className="store-search-wrap" style={{ margin: SEARCH_MARGIN_CSS[state.searchAlign] || SEARCH_MARGIN_CSS.center }}>
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
          state.groupByCategory && hasCategoryItems ? (
            <GroupedContent state={state} filtered={filtered} setStockList={setStockList} />
          ) : (
            <Layout
              config={state.layoutConfig}
              items={filtered}
              tileConfig={state.tileConfig}
              align={state.layoutAlign}
              isEditMode={state.viewMode}
              onReorder={setStockList}
            />
          )
        ) : (
          <p className="search-no-results">No items match "{state.searchQuery}"</p>
        )}

        <Footer />
      </div>
    </div>
  );
}
