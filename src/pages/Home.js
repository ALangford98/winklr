import React, { useContext } from "react";
import { AppContext } from "../components/appContext";
import StockListLoader from "../components/stock/StockListLoader";
import StockListEditor from "../components/stock/StockListEditor";
import TileConfigSelector from "../components/tiles/TileConfigSelector";
import LayoutSelector from "../components/layout/LayoutSelector";
import Layout from "../components/layout/Layout";
import EmptyState from "../components/EmptyState";
import ThemePicker from "../components/ThemePicker";
import ConfigPorter from "../components/ConfigPorter";

function matchesQuery(item, query) {
  const q = query.toLowerCase();
  if (item.name.toLowerCase().includes(q)) return true;
  return Object.values(item.metadata || {}).some((v) =>
    String(v).toLowerCase().includes(q)
  );
}

export default function Home() {
  const { state, setStockList, setSearchQuery } = useContext(AppContext);

  const query = state.searchQuery.trim();
  const filtered = query
    ? state.stockList.filter((item) => matchesQuery(item, query))
    : state.stockList;

  return (
    <div className="Home">
      {state.viewMode && (
        <aside className="edit-panel">
          <StockListLoader />
          <StockListEditor />
          <TileConfigSelector />
          <LayoutSelector />
          <ThemePicker />
          <ConfigPorter />
        </aside>
      )}

      <div className="content-area">
        {state.stockList.length > 0 && (
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
      </div>
    </div>
  );
}
