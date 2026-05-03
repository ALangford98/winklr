import React, { createContext, useEffect, useState } from "react";
import { createStockItem } from "../models/stockItem";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { PALETTES, hexToRgba } from "../theme/palettes";
import { decodeConfigFromHash } from "../utils/shareableUrl";

const AppContext = createContext();

const WIDGET_SLOTS_DEFAULT = {
  left: null, centerLeft: null, center: null, centerRight: null, right: null,
};

const THEME_DEFAULT  = { palette: "dark", primaryColor: "#316dca", custom: {} };
const BRAND_DEFAULT  = { logo: null };

const AppContextProvider = ({ children }) => {
  const [widgets, setWidgets]         = useLocalStorage("winklr_widgetSlots", WIDGET_SLOTS_DEFAULT);
  const [viewMode, setViewMode]       = useLocalStorage("winklr_viewMode", true);
  const [stockList, setStockList]     = useLocalStorage("winklr_stockList", []);
  const [tileConfig, setTileConfig]   = useLocalStorage("winklr_tileConfig", "standard");
  const [layoutConfig, setLayoutConfig] = useLocalStorage("winklr_layoutConfig", "grid");
  const [theme, setTheme]             = useLocalStorage("winklr_theme", THEME_DEFAULT);
  const [cart, setCart]               = useLocalStorage("winklr_cart", []);
  const [brand, setBrand]             = useLocalStorage("winklr_brand", BRAND_DEFAULT);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen]       = useState(false);
  const [helpOpen, setHelpOpen]       = useState(false);

  // On mount: load config from URL hash if present, then clear the hash
  useEffect(() => {
    const config = decodeConfigFromHash(window.location.hash);
    if (!config) return;
    if (config.widgets)      setWidgets(config.widgets);
    if (config.stockList)    setStockList(config.stockList);
    if (config.tileConfig)   setTileConfig(config.tileConfig);
    if (config.layoutConfig) setLayoutConfig(config.layoutConfig);
    if (config.theme)        setTheme(config.theme);
    window.history.replaceState(null, "", window.location.pathname);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply palette + primary colour to CSS variables whenever theme changes
  useEffect(() => {
    const palette = PALETTES[theme.palette] ?? PALETTES.dark;
    const root = document.documentElement;
    Object.entries(palette).forEach(([key, value]) => {
      if (key !== "name") root.style.setProperty(key, value);
    });
    Object.entries(theme.custom || {}).forEach(([key, value]) => {
      root.style.setProperty(key, value);
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

  const addToCart = (itemId) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.itemId === itemId);
      if (existing) return prev.map((c) => c.itemId === itemId ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { itemId, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((c) => c.itemId !== itemId));
  };

  const updateCartQty = (itemId, quantity) => {
    if (quantity <= 0) { setCart((prev) => prev.filter((c) => c.itemId !== itemId)); return; }
    setCart((prev) => prev.map((c) => c.itemId === itemId ? { ...c, quantity } : c));
  };

  const clearCart = () => setCart([]);

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

  const setThemeCustom = (variable, value) => {
    setTheme((prev) => ({ ...prev, custom: { ...(prev.custom || {}), [variable]: value } }));
  };

  const toggleViewMode = () => setViewMode((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        state: { widgets, viewMode, stockList, tileConfig, layoutConfig, theme, cart, brand, searchQuery },
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
        setSearchQuery,
        setBrand,
        setThemeCustom,
        cartOpen, setCartOpen,
        helpOpen, setHelpOpen,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
