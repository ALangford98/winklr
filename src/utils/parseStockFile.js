import { read, utils } from "xlsx";
import { createStockItem } from "../models/stockItem";

// Maps column header aliases to stockItem field names.
// Anything unrecognised goes into metadata.
const FIELD_ALIASES = {
  id:    ["id"],
  name:  ["name", "title", "label", "item", "product"],
  image: ["image", "img", "imageurl", "image_url", "thumbnail", "photo"],
  price: ["price", "cost", "value", "amount"],
};

function mapRowToStockItem(row) {
  const mapped = { metadata: {} };

  for (const [rawKey, rawValue] of Object.entries(row)) {
    const normalised = rawKey.toLowerCase().replace(/[\s-]+/g, "_");
    let recognised = false;

    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(normalised)) {
        mapped[field] = field === "price" ? Number(rawValue) || 0 : String(rawValue ?? "");
        recognised = true;
        break;
      }
    }

    if (!recognised && rawValue !== undefined && rawValue !== "") {
      mapped.metadata[rawKey] = rawValue;
    }
  }

  return createStockItem(mapped);
}

function parseJSON(text) {
  const data = JSON.parse(text);
  const rows = Array.isArray(data) ? data : [data];
  return rows.map(mapRowToStockItem);
}

function parseSpreadsheet(arrayBuffer) {
  const workbook = read(new Uint8Array(arrayBuffer), { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = utils.sheet_to_json(sheet, { defval: "" });
  return rows.map(mapRowToStockItem);
}

export function parseStockFile(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop().toLowerCase();
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read file."));

    if (ext === "json") {
      reader.onload = (e) => {
        try {
          resolve(parseJSON(e.target.result));
        } catch {
          reject(new Error("Invalid JSON — check the file and try again."));
        }
      };
      reader.readAsText(file);
    } else if (["csv", "xlsx", "xls"].includes(ext)) {
      reader.onload = (e) => {
        try {
          resolve(parseSpreadsheet(e.target.result));
        } catch {
          reject(new Error(`Could not parse ${ext.toUpperCase()} — check the file and try again.`));
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error("Unsupported file type. Use .json, .csv, or .xlsx"));
    }
  });
}
