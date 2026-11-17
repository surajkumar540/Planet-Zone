/**
 * Design documents and layers.
 *
 * A document is `{ color, name, front: Layer[], back: Layer[] }`. Layers are
 * plain objects (the API validates the same fields), drawn bottom to top.
 */
import { DESIGN_H, DESIGN_W } from "./shirt";

export const SIDES = ["front", "back"];

let counter = 0;
export const newId = () => `l${Date.now().toString(36)}${(counter++).toString(36)}`;

const common = () => ({
  id: newId(),
  x: DESIGN_W / 2,
  y: DESIGN_H * 0.32,
  rotation: 0,
  opacity: 1,
  flipX: false,
  locked: false,
  hidden: false,
});

export const textLayer = (overrides = {}) => ({
  ...common(),
  type: "text",
  text: "Your text",
  font: "Anton",
  size: 44,
  color: "#111111",
  bold: false,
  italic: false,
  align: "center",
  letterSpacing: 0,
  lineHeight: 1.15,
  strokeColor: "#ffffff",
  strokeWidth: 0,
  curve: 0,
  shadow: false,
  ...overrides,
});

export const artLayer = (art, overrides = {}) => ({
  ...common(),
  type: "art",
  art,
  color: "#111111",
  width: 120,
  y: DESIGN_H * 0.4,
  ...overrides,
});

export const imageLayer = ({ src, naturalWidth, naturalHeight }, overrides = {}) => {
  const aspect = naturalHeight / naturalWidth;
  // Fit inside 80% of the print area.
  const width = Math.min(DESIGN_W * 0.8, (DESIGN_H * 0.7) / aspect);
  return { ...common(), type: "image", src, naturalWidth, aspect, width, y: DESIGN_H * 0.42, ...overrides };
};

export const emptyDoc = (color = "white") => ({ name: "My design", color, front: [], back: [] });

/** Copies a layer with a new id, nudged so the copy is visible. */
export const duplicateLayer = (layer) => ({ ...layer, id: newId(), x: layer.x + 14, y: layer.y + 14, locked: false });

/** Re-ids every layer (used when a template or saved design is loaded). */
export const withFreshIds = (layers) => layers.map((layer) => ({ ...layer, id: newId() }));

export const hasPrint = (layers) => layers.some((layer) => !layer.hidden);

/** Ink colour that stands out on a fabric: light ink on dark shirts. */
export const inkFor = (isDark) => (isDark ? "#ffffff" : "#111111");
