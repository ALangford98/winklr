import React, { createContext, useEffect } from "react";
import { createStockItem } from "../models/stockItem";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { PALETTES, hexToRgba } from "../theme/palettes";

const AppContext = createContext();

const WIDGET_SLOTS_DEFAULT = {
  left: null, centerLeft: null, center: null, centerRight: null, right: null,
};

const THEME_DEFAULT = { palette: "dark", primaryColor: "#316dca" };

const AppContextProvider = ({ children }) => {
  const [widgets, setWidgets]         = useLocalStorage("winklr_widgetSlots", WIDGET_SLOTS_DEFAULT);
  const [viewMode, setViewMode]       = useLocalStorage("winklr_viewMode", true);
  const [stockList, setStockList]     = useLocalStorage("winklr_stockList", []);
  const [tileConfig, setTileConfig]   = useLocalStorage("winklr_tileConfig", "standard");
  const [layoutConfig, setLayoutConfig] = useLocalStorage("winklr_layoutConfig", "grid");
  const [theme, setTheme]             = useLocalStorage("winklr_theme", THEME_DEFAULT);

  // Apply palette + primary colour to CSS variables whenever theme changes
  useEffect(() => {
    const palette = PALETTES[theme.palette] ?? PALETTES.dark;
    const root = document.documentElement;
    Object.entries(palette).forEach(([key, value]) => {
      if (key !== "name") root.style.setProperty(key, value);
    });
    root.style.setProperty("--accent-primary", theme.primaryColor);
    root.style.setProperty("--accent-subtle", hexToRgba(theme.primaryColor, 0.15));
  }, [theme]);

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

  const loadConfig = (config) => {
    if (config.widgets      !== null) setWidgets(config.widgets);
    if (config.stockList    !== null) setStockList(config.stockList);
    if (config.tileConfig   !== null) setTileConfig(config.tileConfig);
    if (config.layoutConfig !== null) setLayoutConfig(config.layoutConfig);
    if (config.theme        !== null) setTheme(config.theme);
  };

  const toggleViewMode = () => setViewMode((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        state: { widgets, viewMode, stockList, tileConfig, layoutConfig, theme },
        setWidget,
        clearWidget,
        toggleViewMode,
        addStockItem,
        removeStockItem,
        updateStockItem,
        setStockList,
        setTileConfig,
        setLayoutConfig,
        setTheme,
        loadConfig,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
