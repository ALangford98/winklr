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
const ACCESS_GATE_DEFAULT  = { enabled: false, password: "" };
const CASH_FUND_DEFAULT = {
  enabled: false,
  title: "Cash Fund",
  message: "",
  showTotalPledged: true,
  goalAmount: 0,
  bankDetailsEnabled: false,
  bankDetails: "",
  bankDetailsLabel: "",
  bankDetails2Enabled: false,
  bankDetails2: "",
  bankDetails2Label: "",
};

const WORDS = ["Otter", "Comet", "Maple", "Willow", "Pixel", "Harbor", "Lumen", "Cedar", "Coral", "Ember", "Aspen", "Nova"];
export function generateAccessPassword() {
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${word}${num}`;
}

const AppContextProvider = ({ children }) => {
  const [widgets, setWidgets]         = useLocalStorage("winklr_widgetSlots", WIDGET_SLOTS_DEFAULT);
  const [viewMode, setViewMode]       = useLocalStorage("winklr_viewMode", false);
  const [stockList, setStockList]     = useLocalStorage("winklr_stockList", []);
  const [tileConfig, setTileConfig]   = useLocalStorage("winklr_tileConfig", "standard");
  const [layoutConfig, setLayoutConfig] = useLocalStorage("winklr_layoutConfig", "grid");
  const [layoutAlign, setLayoutAlign] = useLocalStorage("winklr_layoutAlign", "center");
  const [searchAlign, setSearchAlign] = useLocalStorage("winklr_searchAlign", "center");
  const [suggestFormAlign, setSuggestFormAlign] = useLocalStorage("winklr_suggestFormAlign", "center");
  const [theme, setTheme]             = useLocalStorage("winklr_theme", THEME_DEFAULT);
  const [customTheme, setCustomTheme] = useLocalStorage("winklr_customTheme", null);
  const [cart, setCart]               = useLocalStorage("winklr_cart", []);
  const [brand, setBrand]                   = useLocalStorage("winklr_brand", BRAND_DEFAULT);
  const [integrations, setIntegrations]     = useLocalStorage("winklr_integrations", INTEGRATIONS_DEFAULT);
  const [websiteType, setWebsiteType]       = useLocalStorage("winklr_websiteType", "store");
  const [reservations, setReservations]     = useLocalStorage("winklr_reservations", {});
  const [guestName, setGuestName]           = useLocalStorage("winklr_guestName", "");
  const [guestEmail, setGuestEmail]         = useLocalStorage("winklr_guestEmail", "");
  const [groupByCategory, setGroupByCategory] = useLocalStorage("winklr_groupByCategory", true);
  const [categoryConfig, setCategoryConfig]   = useLocalStorage("winklr_categoryConfig", {});
  const [decals, setDecals]                   = useLocalStorage("winklr_decals", []);
  const [suggestions, setSuggestions]         = useLocalStorage("winklr_suggestions", {});
  const [giftSuggestionsEnabled, setGiftSuggestionsEnabled] = useLocalStorage("winklr_giftSuggestionsEnabled", true);
  const [accessGate, setAccessGate]           = useLocalStorage("winklr_accessGate", ACCESS_GATE_DEFAULT);
  const [cashFund, setCashFund]               = useLocalStorage("winklr_cashFund", CASH_FUND_DEFAULT);
  const [cashPledges, setCashPledges]         = useLocalStorage("winklr_cashPledges", {});
  const [gatePassed, setGatePassed]           = useLocalStorage("winklr_gatePassed", false);
  // Identifies which registry/store this browser last loaded, so a guest who
  // visits a different Winklr site afterwards (same origin, e.g. a shared
  // link or an exported site under the same domain) doesn't inherit their
  // cart/reservations/name from the previous one.
  const [siteId, setSiteId]                   = useLocalStorage("winklr_siteId", null);
  const [searchQuery, setSearchQuery]       = useState("");
  const [cartOpen, setCartOpen]             = useState(false);
  const [helpOpen, setHelpOpen]             = useState(false);
  const [checkoutOpen, setCheckoutOpen]     = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [ownerUnlocked, setOwnerUnlocked]     = useState(false);

  // On mount: load config from URL hash if present, then clear the hash
  useEffect(() => {
    const config = decodeConfigFromHash(window.location.hash);
    if (config) {
      // A siteId that doesn't match what this browser had before means this
      // link belongs to a different registry/store than whatever was last
      // open here - the old cart/reservations/guest name are not this
      // guest's relationship to this new site, so don't carry them over.
      if (config.siteId && config.siteId !== siteId) {
        setCart([]);
        setReservations({});
        setGuestName("");
        setGuestEmail("");
        setSuggestions({});
        setCashPledges({});
      }
      if (config.siteId)          setSiteId(config.siteId);
      if (config.widgets)         setWidgets(config.widgets);
      if (config.stockList)       setStockList(config.stockList);
      if (config.tileConfig)      setTileConfig(config.tileConfig);
      if (config.layoutConfig)    setLayoutConfig(config.layoutConfig);
      if (config.layoutAlign)     setLayoutAlign(config.layoutAlign);
      if (config.searchAlign)     setSearchAlign(config.searchAlign);
      if (config.suggestFormAlign) setSuggestFormAlign(config.suggestFormAlign);
      if (config.theme)           setTheme(config.theme);
      if (config.websiteType)     setWebsiteType(config.websiteType);
      if (config.integrations)    setIntegrations(config.integrations);
      if (config.groupByCategory != null) setGroupByCategory(config.groupByCategory);
      if (config.categoryConfig)  setCategoryConfig(config.categoryConfig);
      if (config.giftSuggestionsEnabled != null) setGiftSuggestionsEnabled(config.giftSuggestionsEnabled);
      if (config.cashFund)        setCashFund(config.cashFund);
      window.history.replaceState(null, "", window.location.pathname);
    }
    if (!siteId && !config?.siteId) setSiteId(crypto.randomUUID().slice(0, 8));
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

    // A malformed URL (missing protocol, stray characters) throws
    // synchronously here rather than failing gracefully - guard it so one
    // bad paste in the Integrations panel can't crash the whole app for
    // every guest viewing the site.
    let es;
    try {
      es = new EventSource(`${firebaseUrl}/reservations.json`);
    } catch {
      return;
    }

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
    const itemReservations = reservations[itemId] || {};
    const current = itemReservations[guest] || 0;
    let next = Math.max(0, current + delta);

    // Cap the total reserved across all guests at the item's needed quantity
    // (0 = unlimited). This was previously only enforced by hiding the "+"
    // button in the UI, not in state - a guest reservation could exceed the
    // requested quantity if triggered any other way.
    if (delta > 0) {
      const item = stockList.find((i) => i.id === itemId);
      const needed = item?.quantity || 0;
      if (needed > 0) {
        const othersTotal = Object.entries(itemReservations)
          .reduce((sum, [g, q]) => (g === guest ? sum : sum + q), 0);
        const maxForGuest = Math.max(0, needed - othersTotal);
        next = Math.min(next, maxForGuest);
        if (next === current) return;
      }
    }

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
      const res = await fetch(`${firebaseUrl}/reservations/${encodeURIComponent(itemId)}/${encodeURIComponent(guest)}.json`, {
        method: next === 0 ? 'DELETE' : 'PUT',
        ...(next > 0 ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(next) } : {}),
      });
      // A failed write (bad rules, wrong URL) never triggers the SSE echo the
      // UI normally waits for - fall back to a local update so the guest at
      // least sees their own click take effect instead of nothing happening.
      if (!res.ok) applyLocal();
    } catch {
      applyLocal();
    }
  };

  // Keep gift suggestions in sync with Firebase when configured. Falls back
  // to localStorage-only (visible on this device only) otherwise.
  // Shape: { [suggestionId]: { name, quantity, email, status, createdAt } }
  useEffect(() => {
    if (!firebaseUrl) return;

    let es;
    try {
      es = new EventSource(`${firebaseUrl}/suggestions.json`);
    } catch {
      return;
    }

    const applyAtPath = (path, data) => {
      const segments = path.split('/').filter(Boolean);
      setSuggestions((prev) => {
        if (segments.length === 0) {
          return (data && typeof data === 'object') ? data : {};
        }
        const [id, ...rest] = segments;
        const next = { ...prev };
        if (rest.length === 0) {
          if (data) next[id] = data; else delete next[id];
        } else {
          next[id] = { ...(next[id] || {}), [rest[0]]: data };
        }
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

  const suggestGift = async ({ name, quantity, email, link, image, reserve, reservedBy }) => {
    const id = crypto.randomUUID();
    const trimmedEmail = (email || '').trim();
    const suggestion = {
      name: (name || '').trim(),
      quantity: Math.max(0, Number(quantity) || 0),
      email: trimmedEmail,
      link: (link || '').trim(),
      image: image || '',
      reserve: !!reserve,
      reservedBy: reserve ? (reservedBy || '').trim() : '',
      status: 'pending',
      createdAt: Date.now(),
    };
    if (trimmedEmail) setGuestEmail(trimmedEmail);
    // Reserving under the same identity later (e.g. undoing) relies on the
    // stored guest name matching the one on the suggestion.
    if (suggestion.reservedBy) setGuestName(suggestion.reservedBy);

    const applyLocal = () => setSuggestions((prev) => ({ ...prev, [id]: suggestion }));

    if (!firebaseUrl) { applyLocal(); return true; }
    try {
      const res = await fetch(`${firebaseUrl}/suggestions/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(suggestion),
      });
      if (!res.ok) return false;
      return true;
    } catch {
      return false;
    }
  };

  const setSuggestionStatus = async (id, status) => {
    setSuggestions((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], status } } : prev));
    if (!firebaseUrl) return;
    try {
      await fetch(`${firebaseUrl}/suggestions/${id}/status.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(status),
      });
    } catch {
      // local state already updated above
    }
  };

  const approveSuggestion = (id, finalQuantity) => {
    const suggestion = suggestions[id];
    if (!suggestion) return;
    const finalQty = Math.max(0, Number(finalQuantity) || 0);
    // Create the item directly (not via addStockItem) so its id is known -
    // the suggester's up-front reservation needs to attach to it.
    const item = createStockItem({
      name: suggestion.name,
      quantity: finalQty,
      image: suggestion.image || '',
      metadata: suggestion.link ? { Link: suggestion.link } : {},
      categories: ['Suggested Gifts'],
      nameRequired: true,
    });
    setStockList((prev) => [...prev, item]);
    setSuggestionStatus(id, 'approved');
    if (suggestion.reserve && suggestion.reservedBy) {
      const suggestedQty = Math.max(1, Number(suggestion.quantity) || 1);
      const qty = finalQty > 0 ? Math.min(suggestedQty, finalQty) : suggestedQty;
      reserveItem(item.id, qty, suggestion.reservedBy);
    }
  };

  const rejectSuggestion = (id) => setSuggestionStatus(id, 'rejected');

  // Keep cash-fund pledges in sync with Firebase when configured. Falls back
  // to localStorage-only (visible on this device only) otherwise.
  // Shape: { [pledgeId]: { name, email, amount, message, createdAt } }
  useEffect(() => {
    if (!firebaseUrl) return;

    let es;
    try {
      es = new EventSource(`${firebaseUrl}/cashPledges.json`);
    } catch {
      return;
    }

    const applyAtPath = (path, data) => {
      const segments = path.split('/').filter(Boolean);
      setCashPledges((prev) => {
        if (segments.length === 0) {
          return (data && typeof data === 'object') ? data : {};
        }
        const [id] = segments;
        const next = { ...prev };
        if (data) next[id] = data; else delete next[id];
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

  const pledgeCash = async ({ name, email, amount, message }) => {
    const id = crypto.randomUUID();
    const trimmedEmail = (email || '').trim();
    const pledge = {
      name: (name || '').trim() || 'Anonymous',
      email: trimmedEmail,
      amount: Math.max(0, Number(amount) || 0),
      message: (message || '').trim(),
      createdAt: Date.now(),
    };
    if (pledge.amount <= 0) return false;
    if (trimmedEmail) setGuestEmail(trimmedEmail);

    const applyLocal = () => setCashPledges((prev) => ({ ...prev, [id]: pledge }));

    if (!firebaseUrl) { applyLocal(); return true; }
    try {
      const res = await fetch(`${firebaseUrl}/cashPledges/${id}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pledge),
      });
      if (!res.ok) return false;
      return true;
    } catch {
      return false;
    }
  };

  const removePledge = (id) => {
    setCashPledges((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (!firebaseUrl) return;
    fetch(`${firebaseUrl}/cashPledges/${id}.json`, { method: 'DELETE' }).catch(() => {});
  };

  const passAccessGate = (handle, email) => {
    setGatePassed(true);
    if (handle?.trim()) setGuestName(handle.trim());
    if (email?.trim()) setGuestEmail(email.trim());
  };

  // Guaranteed way back in for the owner, independent of the shared guest
  // password: matches against the separate Owner passcode (Integrations
  // panel). Only usable if that passcode has actually been set.
  const passAccessGateAsOwner = (passcode) => {
    const ownerPasscode = integrations.ownerPasscode;
    if (!ownerPasscode || passcode !== ownerPasscode) return false;
    setGatePassed(true);
    setOwnerUnlocked(true);
    return true;
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

  // Only one item can be featured at a time (the Featured layout has a single
  // hero slot) - toggling one on clears it from every other item.
  const toggleFeaturedItem = (id) => {
    setStockList((prev) => {
      const target = prev.find((item) => item.id === id);
      const nextFeatured = !target?.featured;
      return prev.map((item) => ({ ...item, featured: item.id === id ? nextFeatured : false }));
    });
  };

  const loadConfig = (config) => {
    if (config.siteId       != null) setSiteId(config.siteId);
    if (config.widgets      !== null) setWidgets(config.widgets);
    if (config.stockList    !== null) setStockList(config.stockList);
    if (config.tileConfig   !== null) setTileConfig(config.tileConfig);
    if (config.layoutConfig !== null) setLayoutConfig(config.layoutConfig);
    if (config.layoutAlign  != null) setLayoutAlign(config.layoutAlign);
    if (config.searchAlign  != null) setSearchAlign(config.searchAlign);
    if (config.suggestFormAlign != null) setSuggestFormAlign(config.suggestFormAlign);
    if (config.theme        !== null) setTheme(config.theme);
    if (config.customTheme  != null) setCustomTheme(config.customTheme);
    if (config.integrations !== null) setIntegrations(config.integrations);
    if (config.websiteType    !== null) setWebsiteType(config.websiteType);
    if (config.groupByCategory != null) setGroupByCategory(config.groupByCategory);
    if (config.categoryConfig  != null) setCategoryConfig(config.categoryConfig);
    if (config.brand         != null) setBrand(config.brand);
    if (config.decals        != null) setDecals(config.decals);
    if (config.giftSuggestionsEnabled != null) setGiftSuggestionsEnabled(config.giftSuggestionsEnabled);
    if (config.accessGate    != null) setAccessGate((prev) => ({ ...prev, ...config.accessGate }));
    if (config.cashFund      != null) setCashFund((prev) => ({ ...prev, ...config.cashFund }));
  };

  const setThemeCustom = (variable, value) => {
    setTheme((prev) => ({ ...prev, custom: { ...(prev.custom || {}), [variable]: value } }));
  };

  const toggleViewMode = () => setViewMode((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        state: { widgets, viewMode, stockList, tileConfig, layoutConfig, layoutAlign, searchAlign, suggestFormAlign, theme, customTheme, cart, brand, integrations, websiteType, reservations, guestName, guestEmail, searchQuery, groupByCategory, categoryConfig, decals, suggestions, giftSuggestionsEnabled, accessGate, gatePassed, siteId, cashFund, cashPledges },
        setWidget,
        clearWidget,
        toggleViewMode,
        addStockItem,
        removeStockItem,
        updateStockItem,
        toggleFeaturedItem,
        setStockList,
        setTileConfig,
        setLayoutConfig,
        setLayoutAlign,
        setSearchAlign,
        setSuggestFormAlign,
        setTheme,
        setCustomTheme,
        loadConfig,
        setSearchQuery,
        setBrand,
        setIntegrations,
        setWebsiteType,
        reserveItem,
        setGuestName,
        setGuestEmail,
        setGroupByCategory,
        updateCategoryConfig,
        addSection,
        removeSection,
        addDecal,
        updateDecal,
        removeDecal,
        suggestGift,
        approveSuggestion,
        rejectSuggestion,
        setGiftSuggestionsEnabled,
        setCashFund,
        pledgeCash,
        removePledge,
        setAccessGate,
        setGatePassed,
        passAccessGate,
        passAccessGateAsOwner,
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
