const CONFIG_VERSION = 1;

export function exportConfig(state) {
  const config = {
    version:      CONFIG_VERSION,
    websiteType:  state.websiteType,
    widgets:      state.widgets,
    stockList:    state.stockList,
    tileConfig:   state.tileConfig,
    layoutConfig: state.layoutConfig,
    theme:        state.theme,
    integrations: state.integrations,
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
        reject(new Error("Invalid JSON — check the file and try again."));
        return;
      }

      if (Array.isArray(raw) || typeof raw !== "object" || raw === null) {
        reject(new Error("This looks like a stock list file, not a config. Use the stock list loader instead."));
        return;
      }

      // Loose validation: accept whatever fields are present, null out the rest
      resolve({
        websiteType:  raw.websiteType  ?? null,
        widgets:      raw.widgets      ?? null,
        stockList:    Array.isArray(raw.stockList) ? raw.stockList : null,
        tileConfig:   raw.tileConfig   ?? null,
        layoutConfig: raw.layoutConfig ?? null,
        theme:        raw.theme        ?? null,
        integrations: raw.integrations ?? null,
      });
    };

    reader.readAsText(file);
  });
}
