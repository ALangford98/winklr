import React, { useContext, useRef, useState } from "react";
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
import SuggestionsPanel from "../components/suggestions/SuggestionsPanel";
import SuggestGiftForm from "../components/suggestions/SuggestGiftForm";
import AccessGatePanel from "../components/access/AccessGatePanel";
import PoweredByModal from "../components/PoweredByModal";
import CashFundPanel from "../components/CashFundPanel";
import CashFundCard from "../components/cashfund/CashFundCard";

const ALIGN_MARGIN_CSS = { left: "0", center: "0 auto", right: "0 0 0 auto" };

function matchesQuery(item, query) {
  const q = query.toLowerCase();
  if (item.name.toLowerCase().includes(q)) return true;
  if ((item.categories || []).some((c) => c.toLowerCase().includes(q))) return true;
  return Object.values(item.metadata || {}).some((v) =>
    String(v).toLowerCase().includes(q)
  );
}

function Footer() {
  const [poweredByOpen, setPoweredByOpen] = useState(false);
  return (
    <footer className="app-footer">
      <button
        type="button"
        className="footer-poweredby-btn"
        onClick={() => setPoweredByOpen(true)}
      >
        <span className="footer-text">Powered by</span>
        <img
          src={`${process.env.PUBLIC_URL}/branding/wordmark-lowercase.svg`}
          alt="Winklr"
          className="footer-wordmark"
        />
      </button>
      <PoweredByModal open={poweredByOpen} onClose={() => setPoweredByOpen(false)} />
    </footer>
  );
}

const SUGGESTED_CAT = "Suggested Gifts";
const SUGGESTED_CAT_FALLBACK = {
  label: SUGGESTED_CAT,
  description: "Extra ideas suggested by our guests.",
};

function CategorySection({ cat, items, state, onReorder }) {
  const cfg =
    state.categoryConfig?.[cat] ||
    (cat === SUGGESTED_CAT ? SUGGESTED_CAT_FALLBACK : {});
  const align = ALIGN_MARGIN_CSS[state.layoutAlign] ? state.layoutAlign : "center";
  return (
    <div className="category-section">
      <div className="category-section-header" style={{ textAlign: align }}>
        <h2 className="category-section-title">
          {cfg.label || cat}
        </h2>
        {cfg.description && (
          <p className="category-section-desc" style={{ margin: ALIGN_MARGIN_CSS[align] }}>
            {cfg.description}
          </p>
        )}
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

  // Guest-suggested gifts always render as the last section.
  const suggestedIdx = orderedCats.indexOf(SUGGESTED_CAT);
  if (suggestedIdx !== -1) {
    orderedCats.splice(suggestedIdx, 1);
    orderedCats.push(SUGGESTED_CAT);
  }

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
  const isRegistry = state.websiteType === 'registry';
  const headerAlign = ALIGN_MARGIN_CSS[state.layoutAlign] ? state.layoutAlign : "center";

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
            <CollapsibleSection title="Guest Access" storageKey="accessGate" defaultOpen={false}>
              <AccessGatePanel />
            </CollapsibleSection>
            <CollapsibleSection title="Stock List" storageKey="stockLoader" defaultOpen={true}>
              <StockListLoader />
            </CollapsibleSection>
            <CollapsibleSection title={`Items${state.stockList.length ? ` (${state.stockList.length})` : ''}`} storageKey="stockEditor" defaultOpen={true}>
              <StockListEditor />
            </CollapsibleSection>
            {isRegistry && (
              <CollapsibleSection
                title={`Gift Suggestions${Object.values(state.suggestions || {}).some((s) => s.status === 'pending') ? ' •' : ''}`}
                storageKey="suggestions"
                defaultOpen={false}
              >
                <SuggestionsPanel />
              </CollapsibleSection>
            )}
            {isRegistry && (
              <CollapsibleSection title="Cash Fund" storageKey="cashFund" defaultOpen={false}>
                <CashFundPanel />
              </CollapsibleSection>
            )}
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
          <div className="page-header" style={{ textAlign: headerAlign }}>
            {state.brand.pageTitle    && <h1 className="page-header-title">{state.brand.pageTitle}</h1>}
            {state.brand.pageSubtitle && (
              <p className="page-header-subtitle" style={{ margin: ALIGN_MARGIN_CSS[headerAlign] }}>
                {state.brand.pageSubtitle}
              </p>
            )}
          </div>
        )}

        {state.stockList.length > 0 && !hasSearchWidget && (
          <div className="store-search-wrap" style={{ margin: ALIGN_MARGIN_CSS[state.searchAlign] || ALIGN_MARGIN_CSS.center }}>
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

        {isRegistry && state.cashFund?.enabled && <CashFundCard />}
        {isRegistry && state.giftSuggestionsEnabled && <SuggestGiftForm align={state.suggestFormAlign} />}

        <Footer />
      </div>
    </div>
  );
}
