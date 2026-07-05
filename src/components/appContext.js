import React, { createContext, useEffect, useState } from "react";
import { createStockItem } from "../models/stockItem";
import { createDecal } from "../models/decal";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { PALETTES, hexToRgba } from "../theme/palettes";
import { ensureGoogleFontLoaded } from "../theme/fonts";
import { decodeConfigFromHash } from "../utils/shareableUrl";
import { logDeploymentPing } from "../utils/telemetry";

const AppContext = createContext();

const WIDGET_SLOTS_DEFAULT = {
  left: null, centerLeft: null, center: null, centerRight: null, right: null,
};

const THEME_DEFAULT        = { palette: "dark", primaryColor: "#316dca", custom: {} };
const BRAND_DEFAULT        = { logo: null, currencyPrefix: '$', pageTitle: '', pageSubtitle: '' };
const INTEGRATIONS_DEFAULT = { stripePublishableKey: "", mapboxToken: "", firebaseDatabaseUrl: "", ownerPasscode: "" };

const AppContextProvider = ({ children }) => {
  const [widgets, setWidgets]         = useLocalStorage("winklr_widgetSlots", WIDGET_SLOTS_DEFAULT);
  const [viewMode, setViewMode]       = useLocalStorage("winklr_viewMode", false);
  const [stockList, setStockList]     = useLocalStorage("winklr_stockList", []);
  const [tileConfig, setTileConfig]   = useLocalStorage("winklr_tileConfig", "standard");
  const [layoutConfig, setLayoutConfig] = useLocalStorage("winklr_layoutConfig", "grid");
  const [layoutAlign, setLayoutAlign] = useLocalStorage("winklr_layoutAlign", "center");
  const [searchAlign, setSearchAlign] = useLocalStorage("winklr_searchAlign", "center");
  const [theme, setTheme]             = useLocalStorage("winklr_theme", THEME_DEFAULT);
  const [customTheme, setCustomTheme] = useLocalStorage("winklr_customTheme", null);
  const [cart, setCart]               = useLocalStorage("winklr_cart", []);
  const [brand, setBrand]                   = useLocalStorage("winklr_brand", BRAND_DEFAULT);
  const [integrations, setIntegrations]     = useLocalStorage("winklr_integrations", INTEGRATIONS_DEFAULT);
  const [websiteType, setWebsiteType]       = useLocalStorage("winklr_websiteType", "store");
  const [reservations, setReservations]     = useLocalStorage("winklr_reservations", {});
  const [guestName, setGuestName]           = useLocalStorage("winklr_guestName", "");
  const [groupByCategory, setGroupByCategory] = useLocalStorage("winklr_groupByCategory", true);
  const [categoryConfig, setCategoryConfig]   = useLocalStorage("winklr_categoryConfig", {});
  const [decals, setDecals]                   = useLocalStorage("winklr_decals", []);
  const [searchQuery, setSearchQuery]       = useState("");
  const [cartOpen, setCartOpen]             = useState(false);
  const [helpOpen, setHelpOpen]             = useState(false);
  const [checkoutOpen, setCheckoutOpen]     = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [ownerUnlocked, setOwnerUnlocked]     = useState(false);

  // On mount: load config from URL hash if present, then clear the hash
  useEffect(() => {
    const config = decodeConfigFromHash(window.location.hash);
    if (!config) return;
    if (config.widgets)         setWidgets(config.widgets);
    if (config.stockList)       setStockList(config.stockList);
    if (config.tileConfig)      setTileConfig(config.tileConfig);
    if (config.layoutConfig)    setLayoutConfig(config.layoutConfig);
    if (config.layoutAlign)     setLayoutAlign(config.layoutAlign);
    if (config.searchAlign)     setSearchAlign(config.searchAlign);
    if (config.theme)           setTheme(config.theme);
    if (config.websiteType)     setWebsiteType(config.websiteType);
    if (config.integrations)    setIntegrations(config.integrations);
    if (config.groupByCategory != null) setGroupByCategory(config.groupByCategory);
    if (config.categoryConfig)  setCategoryConfig(config.categoryConfig);
    window.history.replaceState(null, "", window.location.pathname);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Anonymous, aggregate usage ping - no-ops unless TELEMETRY_FIREBASE_URL is configured
  useEffect(() => {
    logDeploymentPing({ websiteType, stockList, tileConfig, layoutConfig }, { source: "live-app" });
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
    ["--font-body", "--font-heading", "--font-nav"].forEach((key) => {
      if (theme.custom?.[key]) ensureGoogleFontLoaded(theme.custom[key]);
    });
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
  // Shape: { [itemId]: { [guestName]: quantityReservedByThatGuest } }
  useEffect(() => {
    if (!firebaseUrl) return;

    const es = new EventSource(`${firebaseUrl}/reservations.json`);

    const applyAtPath = (path, data) => {
      const segments = path.split('/').filter(Boolean);

      setReservations((prev) => {
        if (segments.length === 0) {
          const next = {};
          if (data && typeof data === 'object') {
            Object.entries(data).forEach(([itemId, guests]) => {
              if (!guests || typeof guests !== 'object') return;
              const cleaned = Object.fromEntries(Object.entries(guests).filter(([, v]) => v > 0));
              if (Object.keys(cleaned).length) next[itemId] = cleaned;
            });
          }
          return next;
        }

        if (segments.length === 1) {
          const [itemId] = segments;
          const next = { ...prev };
          if (data && typeof data === 'object') {
            const cleaned = Object.fromEntries(Object.entries(data).filter(([, v]) => v > 0));
            if (Object.keys(cleaned).length) next[itemId] = cleaned;
            else delete next[itemId];
          } else {
            delete next[itemId];
          }
          return next;
        }

        const [itemId, guest] = segments;
        const next = { ...prev };
        const itemReservations = { ...(next[itemId] || {}) };
        if (data > 0) itemReservations[guest] = data;
        else delete itemReservations[guest];
        if (Object.keys(itemReservations).length) next[itemId] = itemReservations;
        else delete next[itemId];
        return next;
      });
    };

    es.addEventListener('put', (e) => {
      const { path, data } = JSON.parse(e.data);
      applyAtPath(path, data);
    });

    es.addEventListener('patch', (e) => {
      const { path, data } = JSON.parse(e.data);
      if (!data || typeof data !== 'object') return;
      Object.entries(data).forEach(([key, val]) => {
        applyAtPath(path === '/' ? `/${key}` : `${path}/${key}`, val);
      });
    });

    return () => es.close();
  }, [firebaseUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const reserveItem = async (itemId, delta = 1, name) => {
    const guest = (name ?? guestName ?? '').trim() || 'Anonymous';
    const current = (reservations[itemId] || {})[guest] || 0;
    const next = Math.max(0, current + delta);

    const applyLocal = () =>
      setReservations((prev) => {
        const itemReservations = { ...(prev[itemId] || {}) };
        if (next === 0) delete itemReservations[guest];
        else itemReservations[guest] = next;
        const updated = { ...prev };
        if (Object.keys(itemReservations).length) updated[itemId] = itemReservations;
        else delete updated[itemId];
        return updated;
      });

    if (!firebaseUrl) { applyLocal(); return; }

    try {
      await fetch(`${firebaseUrl}/reservations/${encodeURIComponent(itemId)}/${encodeURIComponent(guest)}.json`, {
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

  const addSection = (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    setCategoryConfig((prev) => (prev[trimmed] ? prev : { ...prev, [trimmed]: {} }));
    setGroupByCategory(true);
  };

  const removeSection = (name) => {
    setCategoryConfig((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const addDecal = (image, position = {}) => {
    setDecals((prev) => [...prev, createDecal({ image, ...position })]);
  };

  const updateDecal = (id, changes) => {
    setDecals((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)));
  };

  const removeDecal = (id) => {
    setDecals((prev) => prev.filter((d) => d.id !== id));
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
    if (config.layoutAlign  != null) setLayoutAlign(config.layoutAlign);
    if (config.searchAlign  != null) setSearchAlign(config.searchAlign);
    if (config.theme        !== null) setTheme(config.theme);
    if (config.customTheme  != null) setCustomTheme(config.customTheme);
    if (config.integrations !== null) setIntegrations(config.integrations);
    if (config.websiteType    !== null) setWebsiteType(config.websiteType);
    if (config.groupByCategory != null) setGroupByCategory(config.groupByCategory);
    if (config.categoryConfig  != null) setCategoryConfig(config.categoryConfig);
    if (config.brand         != null) setBrand(config.brand);
    if (config.decals        != null) setDecals(config.decals);
  };

  const setThemeCustom = (variable, value) => {
    setTheme((prev) => ({ ...prev, custom: { ...(prev.custom || {}), [variable]: value } }));
  };

  const toggleViewMode = () => setViewMode((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        state: { widgets, viewMode, stockList, tileConfig, layoutConfig, layoutAlign, searchAlign, theme, customTheme, cart, brand, integrations, websiteType, reservations, guestName, searchQuery, groupByCategory, categoryConfig, decals },
        setWidget,
        clearWidget,
        toggleViewMode,
        addStockItem,
        removeStockItem,
        updateStockItem,
        setStockList,
        setTileConfig,
        setLayoutConfig,
        setLayoutAlign,
        setSearchAlign,
        setTheme,
        setCustomTheme,
        loadConfig,
        setSearchQuery,
        setBrand,
        setIntegrations,
        setWebsiteType,
        reserveItem,
        setGuestName,
        setGroupByCategory,
        updateCategoryConfig,
        addSection,
        removeSection,
        addDecal,
        updateDecal,
        removeDecal,
        setThemeCustom,
        cartOpen, setCartOpen,
        helpOpen, setHelpOpen,
        checkoutOpen, setCheckoutOpen,
        mobilePanelOpen, setMobilePanelOpen,
        ownerUnlocked, setOwnerUnlocked,
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
