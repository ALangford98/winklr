import React, { useContext } from "react";
import { AppContext } from "../components/appContext";
import StockListLoader from "../components/stock/StockListLoader";
import TileConfigSelector from "../components/tiles/TileConfigSelector";
import LayoutSelector from "../components/layout/LayoutSelector";
import Layout from "../components/layout/Layout";

export default function Home() {
  const { state } = useContext(AppContext);

  return (
    <div className="Home">
      {state.viewMode && (
        <aside className="edit-panel">
          <StockListLoader />
          <TileConfigSelector />
          <LayoutSelector />
        </aside>
      )}

      {state.stockList.length > 0 ? (
        <Layout
          config={state.layoutConfig}
          items={state.stockList}
          tileConfig={state.tileConfig}
        />
      ) : (
        <p className="empty-state">
          {state.viewMode ? "Load a stock list to get started." : "No stock list loaded."}
        </p>
      )}
    </div>
  );
}
