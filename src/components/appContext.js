import React, { createContext } from "react";
import { createStockItem } from "../models/stockItem";
import { useLocalStorage } from "../hooks/useLocalStorage";

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [widgets, setWidgets] = useLocalStorage("winklr_widgets", []);
  const [viewMode, setViewMode] = useLocalStorage("winklr_viewMode", true);
  const [stockList, setStockList] = useLocalStorage("winklr_stockList", []);

  const addWidget = (widget) => {
    setWidgets((prevWidgets) => [...prevWidgets, widget]);
  };

  const removeWidget = (index) => {
    setWidgets((prevWidgets) => {
      const updatedWidgets = [...prevWidgets];
      updatedWidgets.splice(index, 1);
      return updatedWidgets;
    });
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
    setViewMode((prevMode) => !prevMode);
  };

  const updateState = (newState) => {
    setWidgets(newState.widgets || []);
    // You can add more logic to update other state values here
  };

  return (
    <AppContext.Provider
      value={{
        state: {
          widgets,
          viewMode,
          stockList,
        },
        updateState,
        addWidget,
        removeWidget,
        toggleViewMode,
        addStockItem,
        removeStockItem,
        updateStockItem,
        setStockList,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
