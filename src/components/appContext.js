import React, { createContext } from "react";
import { createStockItem } from "../models/stockItem";
import { useLocalStorage } from "../hooks/useLocalStorage";

const AppContext = createContext();

const WIDGET_SLOTS_DEFAULT = {
  left: null, centerLeft: null, center: null, centerRight: null, right: null,
};

const AppContextProvider = ({ children }) => {
  // New key avoids loading stale array-shaped data from the old "winklr_widgets" key
  const [widgets, setWidgets] = useLocalStorage("winklr_widgetSlots", WIDGET_SLOTS_DEFAULT);
  const [viewMode, setViewMode] = useLocalStorage("winklr_viewMode", true);
  const [stockList, setStockList] = useLocalStorage("winklr_stockList", []);
  const [tileConfig, setTileConfig] = useLocalStorage("winklr_tileConfig", "standard");
  const [layoutConfig, setLayoutConfig] = useLocalStorage("winklr_layoutConfig", "grid");

  const setWidget = (slot, widget) => {
    setWidgets((prev) => ({ ...prev, [slot]: widget }));
  };

  const clearWidget = (slot) => {
    setWidgets((prev) => ({ ...prev, [slot]: null }));
  };

  const addStockItem = (item) => {
    setStockList((prev) => [...prev, createStockItem(item)]);
  };

  const removeStockItem = (id) => {
    setStockList((prev) => prev.filter((item) => item.id !== id));
  };

  const updateStockItem = (id, changes) => {
    setStockList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...changes, id } : item))
    );
  };

  const toggleViewMode = () => {
    setViewMode((prev) => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        state: { widgets, viewMode, stockList, tileConfig, layoutConfig },
        setWidget,
        clearWidget,
        toggleViewMode,
        addStockItem,
        removeStockItem,
        updateStockItem,
        setStockList,
        setTileConfig,
        setLayoutConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
