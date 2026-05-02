import React, { useContext } from "react";
import { AppContext } from "../components/appContext";
import StockListLoader from "../components/stock/StockListLoader";
import StockListEditor from "../components/stock/StockListEditor";
import TileConfigSelector from "../components/tiles/TileConfigSelector";
import LayoutSelector from "../components/layout/LayoutSelector";
import Layout from "../components/layout/Layout";
import EmptyState from "../components/EmptyState";
import ThemePicker from "../components/ThemePicker";

export default function Home() {
  const { state } = useContext(AppContext);

  return (
    <div className="Home">
      {state.viewMode && (
        <aside className="edit-panel">
          <StockListLoader />
          <StockListEditor />
          <TileConfigSelector />
          <LayoutSelector />
          <ThemePicker />
        </aside>
      )}

      {state.stockList.length > 0 ? (
        <Layout
          config={state.layoutConfig}
          items={state.stockList}
          tileConfig={state.tileConfig}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
