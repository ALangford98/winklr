/**
 * A freeform decorative image placed on the page ("sticker"), independent of
 * the item grid. x/y are pixel offsets from the top-left of the scrollable
 * page content, so a decal stays put at the spot it was dropped as the page
 * is scrolled - not relative to the viewport.
 */
export const createDecal = ({ id, image = '', x = 40, y = 40, width = 120, rotation = 0 } = {}) => ({
  id: id ?? crypto.randomUUID(),
  image,
  x,
  y,
  width,
  rotation,
});
