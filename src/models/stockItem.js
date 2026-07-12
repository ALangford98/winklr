/**
 * id: unique string — auto-generated via crypto.randomUUID() if omitted
 * name: display name for the item
 * image: URL or relative path to an image
 * price: numeric value (use 0 if not applicable)
 * metadata: open-ended key/value pairs for any extra fields (e.g. ticker, category, sku)
 * nameRequired: registry mode only - whether a guest must give their name to reserve this item
 * is_sample: marks placeholder/demo data - stripped out of every exported or shared config
 * featured: whether this item is the hero tile in the "Featured" layout (only one at a time)
 */
export const createStockItem = ({ id, name = '', image = '', price = 0, metadata = {}, categories = [], quantity = 0, nameRequired = true, is_sample = false, featured = false } = {}) => ({
  id: id ?? crypto.randomUUID(),
  name,
  image,
  price,
  metadata,
  categories,
  quantity,
  nameRequired,
  is_sample,
  featured,
});
