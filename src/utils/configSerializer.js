const CONFIG_VERSION = 1;

export function exportConfig(state) {
  const config = {
    version:      CONFIG_VERSION,
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
    customTheme:     state.customTheme,
    integrations:    state.integrations,
    groupByCategory: state.groupByCategory,
    categoryConfig:  state.categoryConfig,
    brand:           state.brand,
    decals:          state.decals,
    giftSuggestionsEnabled: state.giftSuggestionsEnabled,
    accessGate:      state.accessGate,
    cashFund:        state.cashFund,
  };

  const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = "winklr-config.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function parseConfigFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read file."));

    reader.onload = (e) => {
      let raw;
      try {
        raw = JSON.parse(e.target.result);
      } catch {
        reject(new Error("Invalid JSON - check the file and try again."));
        return;
      }

      if (Array.isArray(raw) || typeof raw !== "object" || raw === null) {
        reject(new Error("This looks like a stock list file, not a config. Use the stock list loader instead."));
        return;
      }

      // Loose validation: accept whatever fields are present, null out the rest
      resolve({
        siteId:          raw.siteId           ?? null,
        websiteType:     raw.websiteType     ?? null,
        widgets:         raw.widgets         ?? null,
        stockList:       Array.isArray(raw.stockList) ? raw.stockList : null,
        tileConfig:      raw.tileConfig      ?? null,
        layoutConfig:    raw.layoutConfig    ?? null,
        layoutAlign:     raw.layoutAlign     ?? null,
        searchAlign:     raw.searchAlign     ?? null,
        suggestFormAlign: raw.suggestFormAlign ?? null,
        theme:           raw.theme           ?? null,
        customTheme:     raw.customTheme     ?? null,
        integrations:    raw.integrations    ?? null,
        groupByCategory: raw.groupByCategory ?? null,
        categoryConfig:  raw.categoryConfig  ?? null,
        brand:           raw.brand           ?? null,
        decals:          Array.isArray(raw.decals) ? raw.decals : null,
        giftSuggestionsEnabled: raw.giftSuggestionsEnabled ?? null,
        accessGate:      raw.accessGate       ?? null,
        cashFund:        raw.cashFund         ?? null,
      });
    };

    reader.readAsText(file);
  });
}
