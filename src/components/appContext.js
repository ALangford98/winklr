import React, { createContext, useEffect, useState } from "react";
import { createStockItem } from "../models/stockItem";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { PALETTES, hexToRgba } from "../theme/palettes";
import { decodeConfigFromHash } from "../utils/shareableUrl";

const AppContext = createContext();

const WIDGET_SLOTS_DEFAULT = {
  left: null, centerLeft: null, center: null, centerRight: null, right: null,
};

const THEME_DEFAULT        = { palette: "dark", primaryColor: "#316dca", custom: {} };
const BRAND_DEFAULT        = { logo: null, currencyPrefix: '$', pageTitle: '', pageSubtitle: '' };
const INTEGRATIONS_DEFAULT = { stripePublishableKey: "", mapboxToken: "", firebaseDatabaseUrl: "" };

const AppContextProvider = ({ children }) => {
  const [widgets, setWidgets]         = useLocalStorage("winklr_widgetSlots", WIDGET_SLOTS_DEFAULT);
  const [viewMode, setViewMode]       = useLocalStorage("winklr_viewMode", true);
  const [stockList, setStockList]     = useLocalStorage("winklr_stockList", []);
  const [tileConfig, setTileConfig]   = useLocalStorage("winklr_tileConfig", "standard");
  const [layoutConfig, setLayoutConfig] = useLocalStorage("winklr_layoutConfig", "grid");
  const [theme, setTheme]             = useLocalStorage("winklr_theme", THEME_DEFAULT);
  const [cart, setCart]               = useLocalStorage("winklr_cart", []);
  const [brand, setBrand]                   = useLocalStorage("winklr_brand", BRAND_DEFAULT);
  const [integrations, setIntegrations]     = useLocalStorage("winklr_integrations", INTEGRATIONS_DEFAULT);
  const [websiteType, setWebsiteType]       = useLocalStorage("winklr_websiteType", "store");
  const [reservations, setReservations]     = useLocalStorage("winklr_reservations", {});
  const [groupByCategory, setGroupByCategory] = useLocalStorage("winklr_groupByCategory", true);
  const [categoryConfig, setCategoryConfig]   = useLocalStorage("winklr_categoryConfig", {});
  const [searchQuery, setSearchQuery]       = useState("");
  const [cartOpen, setCartOpen]             = useState(false);
  const [helpOpen, setHelpOpen]             = useState(false);
  const [checkoutOpen, setCheckoutOpen]     = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  // On mount: load config from URL hash if present, then clear the hash
  useEffect(() => {
    const config = decodeConfigFromHash(window.location.hash);
    if (!config) return;
    if (config.widgets)      setWidgets(config.widgets);
    if (config.stockList)    setStockList(config.stockList);
    if (config.tileConfig)   setTileConfig(config.tileConfig);
    if (config.layoutConfig) setLayoutConfig(config.layoutConfig);
    if (config.theme)        setTheme(config.theme);
    if (config.websiteType)  setWebsiteType(config.websiteType);
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

  const firebaseUrl = integrations.firebaseDatabaseUrl?.trim().replace(/\/$/, '') || null;

  // Keep reservations in sync with Firebase when a database URL is configured.
  // Falls back to localStorage when not configured.
  useEffect(() => {
    if (!firebaseUrl) return;

    const es = new EventSource(`${firebaseUrl}/reservations.json`);

    es.addEventListener('put', (e) => {
      const { path, data } = JSON.parse(e.data);
      if (path === '/') {
        setReservations(
          data && typeof data === 'object'
            ? Object.fromEntries(Object.entries(data).filter(([, v]) => v > 0))
            : {}
        );
      } else {
        const itemId = path.replace(/^\//, '');
        setReservations((prev) => {
          const next = { ...prev };
          if (data > 0) next[itemId] = data;
          else delete next[itemId];
          return next;
        });
      }
    });

    es.addEventListener('patch', (e) => {
      const data = JSON.parse(e.data).data;
      setReservations((prev) => {
        const next = { ...prev };
        Object.entries(data).forEach(([id, val]) => {
          if (val > 0) next[id] = val;
          else delete next[id];
        });
        return next;
      });
    });

    return () => es.close();
  }, [firebaseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const reserveItem = async (itemId, delta = 1) => {
    const current = (reservations[itemId] || 0);
    const next = Math.max(0, current + delta);

    const applyLocal = () =>
      setReservations((prev) => {
        const updated = { ...prev };
        if (next === 0) delete updated[itemId];
        else updated[itemId] = next;
        return updated;
      });

    if (!firebaseUrl) { applyLocal(); return; }

    try {
      await fetch(`${firebaseUrl}/reservations/${encodeURIComponent(itemId)}.json`, {
        method: next === 0 ? 'DELETE' : 'PUT',
        ...(next > 0 ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) } : {}),
      });
    } catch {
      applyLocal();
    }
    // State updated by the SSE event Firebase sends back
  };

  const updateCategoryConfig = (category, changes) => {
    setCategoryConfig((prev) => ({
      ...prev,
      [category]: { ...(prev[category] || {}), ...changes },
    }));
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
    if (config.integrations !== null) setIntegrations(config.integrations);
    if (config.websiteType    !== null) setWebsiteType(config.websiteType);
    if (config.groupByCategory != null) setGroupByCategory(config.groupByCategory);
    if (config.categoryConfig  != null) setCategoryConfig(config.categoryConfig);
  };

  const setThemeCustom = (variable, value) => {
    setTheme((prev) => ({ ...prev, custom: { ...(prev.custom || {}), [variable]: value } }));
  };

  const toggleViewMode = () => setViewMode((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        state: { widgets, viewMode, stockList, tileConfig, layoutConfig, theme, cart, brand, integrations, websiteType, reservations, searchQuery, groupByCategory, categoryConfig },
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
        setIntegrations,
        setWebsiteType,
        reserveItem,
        setGroupByCategory,
        updateCategoryConfig,
        setThemeCustom,
        cartOpen, setCartOpen,
        helpOpen, setHelpOpen,
        checkoutOpen, setCheckoutOpen,
        mobilePanelOpen, setMobilePanelOpen,
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
