import { buildDemoItems } from "../data/demoItems";
import pkg from "../../package.json";

const HASH_PREFIX = "#winklr=";

export const WINKLR_HOMEPAGE_URL = pkg.homepage;

function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(b64) {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeConfigToHash(state) {
  const config = {
    siteId:          state.siteId,
    websiteType:     state.websiteType,
    widgets:         state.widgets,
    stockList:       (state.stockList || []).filter((item) => !item.is_sample),
    tileConfig:      state.tileConfig,
    layoutConfig:    state.layoutConfig,
    layoutAlign:     state.layoutAlign,
    searchAlign:     state.searchAlign,
    suggestFormAlign: state.suggestFormAlign,
    theme:           state.theme,
    // Only the fields a guest's browser actually needs to render the page and
    // reach live sync - never the owner passcode. This link is the thing
    // that's handed straight to guests (Share FAB, "Copy link"), and the
    // owner passcode is the one thing that's supposed to distinguish a guest
    // from the owner - including it here used to mean anyone who received a
    // completely normal registry link could read it straight out of the URL
    // (or have it silently applied to their own session) and let themselves
    // into Edit Mode.
    integrations: {
      firebaseDatabaseUrl: state.integrations?.firebaseDatabaseUrl || "",
      stripePublishableKey: state.integrations?.stripePublishableKey || "",
      mapboxToken: state.integrations?.mapboxToken || "",
    },
    groupByCategory: state.groupByCategory,
    categoryConfig:  state.categoryConfig,
    giftSuggestionsEnabled: state.giftSuggestionsEnabled,
    cashFund:        state.cashFund,
    // accessGate is deliberately NOT included here: this link IS the thing the
    // gate is meant to require a separately-shared password alongside, so
    // baking the password into the same link would defeat it entirely. It's
    // only carried through JSON export/import and the static site export.
  };
  return HASH_PREFIX + toBase64(JSON.stringify(config));
}

// Builds a "look-only" shareable hash: colours, fonts, and layout choices,
// but never the real item list (or anything else personal to this owner) -
// used by the "Powered by Winklr" link so a visitor can try the same look
// with sample items instead of someone else's actual registry contents.
export function encodeLookConfigToHash(state) {
  const config = {
    websiteType:      state.websiteType,
    tileConfig:       state.tileConfig,
    layoutConfig:     state.layoutConfig,
    layoutAlign:      state.layoutAlign,
    searchAlign:      state.searchAlign,
    suggestFormAlign: state.suggestFormAlign,
    theme:            state.theme,
    groupByCategory:  state.groupByCategory,
    stockList:        buildDemoItems(),
  };
  return HASH_PREFIX + toBase64(JSON.stringify(config));
}

export function decodeConfigFromHash(hash) {
  if (!hash.startsWith(HASH_PREFIX)) return null;
  try {
    const raw = fromBase64(hash.slice(HASH_PREFIX.length));
    const config = JSON.parse(raw);
    return {
      siteId:          config.siteId           ?? null,
      websiteType:     config.websiteType     ?? null,
      widgets:         config.widgets         ?? null,
      stockList:       Array.isArray(config.stockList) ? config.stockList : null,
      tileConfig:      config.tileConfig      ?? null,
      layoutConfig:    config.layoutConfig    ?? null,
      layoutAlign:     config.layoutAlign     ?? null,
      searchAlign:     config.searchAlign     ?? null,
      suggestFormAlign: config.suggestFormAlign ?? null,
      theme:           config.theme           ?? null,
      integrations:    config.integrations    ?? null,
      groupByCategory: config.groupByCategory ?? null,
      categoryConfig:  config.categoryConfig  ?? null,
      giftSuggestionsEnabled: config.giftSuggestionsEnabled ?? null,
      cashFund:        config.cashFund         ?? null,
    };
  } catch {
    return null;
  }
}
