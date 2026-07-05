const HASH_PREFIX = "#winklr=";

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
    websiteType:     state.websiteType,
    widgets:         state.widgets,
    stockList:       (state.stockList || []).filter((item) => !item.is_sample),
    tileConfig:      state.tileConfig,
    layoutConfig:    state.layoutConfig,
    layoutAlign:     state.layoutAlign,
    searchAlign:     state.searchAlign,
    theme:           state.theme,
    integrations:    state.integrations,
    groupByCategory: state.groupByCategory,
    categoryConfig:  state.categoryConfig,
  };
  return HASH_PREFIX + toBase64(JSON.stringify(config));
}

export function decodeConfigFromHash(hash) {
  if (!hash.startsWith(HASH_PREFIX)) return null;
  try {
    const raw = fromBase64(hash.slice(HASH_PREFIX.length));
    const config = JSON.parse(raw);
    return {
      websiteType:     config.websiteType     ?? null,
      widgets:         config.widgets         ?? null,
      stockList:       Array.isArray(config.stockList) ? config.stockList : null,
      tileConfig:      config.tileConfig      ?? null,
      layoutConfig:    config.layoutConfig    ?? null,
      layoutAlign:     config.layoutAlign     ?? null,
      searchAlign:     config.searchAlign     ?? null,
      theme:           config.theme           ?? null,
      integrations:    config.integrations    ?? null,
      groupByCategory: config.groupByCategory ?? null,
      categoryConfig:  config.categoryConfig  ?? null,
    };
  } catch {
    return null;
  }
}
