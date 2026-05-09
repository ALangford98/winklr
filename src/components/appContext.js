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
const BRAND_DEFAULT        = { logo: null, currencyPrefix: '$' };
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
  const [reservations, setReservations]     = useLocalStorage("winklr_reservations", []);
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
            ? Object.keys(data).filter((k) => data[k] === true)
            : []
        );
      } else {
        const itemId = path.replace(/^\//, '');
        setReservations((prev) =>
          data === true
            ? prev.includes(itemId) ? prev : [...prev, itemId]
            : prev.filter((id) => id !== itemId)
        );
      }
    });

    es.addEventListener('patch', (e) => {
      const data = JSON.parse(e.data).data;
      setReservations((prev) => {
        let next = [...prev];
        Object.entries(data).forEach(([id, val]) => {
          if (val) { if (!next.includes(id)) next.push(id); }
          else { next = next.filter((x) => x !== id); }
        });
        return next;
      });
    });

    return () => es.close();
  }, [firebaseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleReservation = async (itemId) => {
    if (!firebaseUrl) {
      setReservations((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
      return;
    }
    const reserved = reservations.includes(itemId);
    try {
      await fetch(`${firebaseUrl}/reservations/${encodeURIComponent(itemId)}.json`, {
        method: reserved ? 'DELETE' : 'PUT',
        ...(reserved ? {} : { headers: { 'Content-Type': 'application/json' }, body: 'true' }),
      });
    } catch {
      // Network error — optimistic local update
      setReservations((prev) =>
        prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
      );
    }
    // State is updated by the SSE put/patch event that Firebase sends back
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
    if (config.websiteType  !== null) setWebsiteType(config.websiteType);
  };

  const setThemeCustom = (variable, value) => {
    setTheme((prev) => ({ ...prev, custom: { ...(prev.custom || {}), [variable]: value } }));
  };

  const toggleViewMode = () => setViewMode((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        state: { widgets, viewMode, stockList, tileConfig, layoutConfig, theme, cart, brand, integrations, websiteType, reservations, searchQuery },
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
        toggleReservation,
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
