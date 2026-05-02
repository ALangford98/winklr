import React, { useContext } from "react";
import { AppContext } from "../components/appContext";
import StockListLoader from "../components/stock/StockListLoader";
import TileConfigSelector from "../components/tiles/TileConfigSelector";
import Tile from "../components/tiles/Tile";

export default function Home() {
  const { state } = useContext(AppContext);

  return (
    <div className="Home">
      {state.viewMode && (
        <aside className="edit-panel">
          <StockListLoader />
          <TileConfigSelector />
        </aside>
      )}

      {state.stockList.length > 0 ? (
        <div className="tile-grid">
          {state.stockList.map((item) => (
            <Tile key={item.id} item={item} config={state.tileConfig} />
          ))}
        </div>
      ) : (
        <p className="empty-state">
          {state.viewMode ? "Load a stock list to get started." : "No stock list loaded."}
        </p>
      )}
    </div>
  );
}
