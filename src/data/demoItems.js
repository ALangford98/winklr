import { createStockItem } from "../models/stockItem";

// Sample items shown when the stock list is empty, so a designer or new
// user has something populated to look at instead of a blank panel.
const DEMO_ITEM_SEEDS = [
  {
    name: "Ceramic Coffee Mug",
    price: 12.5,
    categories: ["Kitchen"],
    metadata: { Material: "Ceramic", Colour: "Sky blue" },
  },
  {
    name: "Cutlery Set",
    price: 0,
    categories: ["Kitchen"],
    metadata: { Type: "Non-specific" },
    quantity: 4,
  },
  {
    name: "Throw Blanket",
    price: 45,
    categories: ["Living Room"],
    metadata: { Size: "150 x 200cm", Material: "Cotton" },
  },
  {
    name: "Scented Candle",
    price: 8,
    categories: ["Living Room"],
    metadata: { Scent: "Vanilla" },
  },
  {
    name: "Desk Lamp",
    price: 32.99,
    categories: ["Extras"],
    metadata: { Type: "Specific", Notes: "Adjustable arm, warm light" },
    quantity: 1,
  },
  {
    name: "Board Game",
    price: 0,
    categories: ["Extras"],
    metadata: { Notes: "Any strategy game for 2-4 players" },
    quantity: 1,
  },
];

export function buildDemoItems() {
  return DEMO_ITEM_SEEDS.map((seed) => createStockItem({ ...seed, is_sample: true }));
}
