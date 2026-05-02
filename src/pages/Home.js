import React, { useContext } from "react";
import { AppContext } from "../components/appContext";
import StockListLoader from "../components/stock/StockListLoader";

export default function Home() {
  const { state } = useContext(AppContext);

  return (
    <div className="Home">
      {state.viewMode && <StockListLoader />}
    </div>
  );
}
