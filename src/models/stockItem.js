/**
 * id: unique string — auto-generated via crypto.randomUUID() if omitted
 * name: display name for the item
 * image: URL or relative path to an image
 * price: numeric value (use 0 if not applicable)
 * metadata: open-ended key/value pairs for any extra fields (e.g. ticker, category, sku)
 */
export const createStockItem = ({ id, name = '', image = '', price = 0, metadata = {} } = {}) => ({
  id: id ?? crypto.randomUUID(),
  name,
  image,
  price,
  metadata,
});
