import { read, utils } from "xlsx";
import { createStockItem } from "../models/stockItem";

// Zero-width/invisible characters that ride along when a list is copied out
// of WhatsApp, Apple Notes, Word, etc. Left in place they'd become invisible
// junk inside item names (breaking search and dedupe).
const ZERO_WIDTH_RE = /[\u200b-\u200f\u2060\ufeff]/g;

// Leading bullet/number decoration: "- item", "• item", "* item", "3. item"
const BULLET_PREFIX_RE = /^\s*(?:[-–—•*·]|\d+[.)])\s*/;

/**
 * Turns a plain pasted list - one item per line - into stock items.
 * A line like "Nappies - Huggies extra care" splits on the first dash
 * (needs a space before it, so hyphenated names like "Soft-Structured
 * Carrier" stay intact) into a name plus a Details metadata field.
 */
export function parsePastedList(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.replace(ZERO_WIDTH_RE, "").replace(BULLET_PREFIX_RE, "").trim())
    .filter(Boolean)
    .map((line) => {
      const split = line.match(/\s+[-–—]\s*(.+)$/);
      const name = split ? line.slice(0, split.index).trim() : line;
      const detail = split ? split[1].trim() : "";
      return createStockItem({
        name,
        metadata: detail ? { Details: detail } : {},
      });
    });
}

// Maps column header aliases to stockItem field names.
// Anything unrecognised goes into metadata.
const FIELD_ALIASES = {
  id:         ["id"],
  name:       ["name", "title", "label", "item", "product"],
  image:      ["image", "img", "imageurl", "image_url", "thumbnail", "photo"],
  price:      ["price", "cost", "value", "amount"],
  quantity:   ["quantity", "qty", "count", "stock", "needed"],
  categories: ["category", "categories", "tag", "tags", "section"],
};

function mapRowToStockItem(row) {
  const mapped = { metadata: {} };

  for (const [rawKey, rawValue] of Object.entries(row)) {
    const normalised = rawKey.toLowerCase().replace(/[\s-]+/g, "_");
    let recognised = false;

    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(normalised)) {
        if (field === "price") mapped[field] = Number(rawValue) || 0;
        else if (field === "quantity") mapped[field] = Math.max(0, Number(rawValue) || 0);
        else if (field === "categories") {
          mapped[field] = String(rawValue ?? "").split(",").map((c) => c.trim()).filter(Boolean);
        } else mapped[field] = String(rawValue ?? "");
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
  let rows;
  if (Array.isArray(data)) {
    rows = data;
  } else {
    // Support wrapper objects like { items: [...] } — use the first array-valued property.
    // Fall back to treating the object itself as a single item.
    rows = Object.values(data).find(Array.isArray) ?? [data];
  }
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
          reject(new Error("Invalid JSON - check the file and try again."));
        }
      };
      reader.readAsText(file);
    } else if (["csv", "xlsx", "xls"].includes(ext)) {
      reader.onload = (e) => {
        try {
          resolve(parseSpreadsheet(e.target.result));
        } catch {
          reject(new Error(`Could not parse ${ext.toUpperCase()} - check the file and try again.`));
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error("Unsupported file type. Use .json, .csv, or .xlsx"));
    }
  });
}
