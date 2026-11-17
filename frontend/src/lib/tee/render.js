/**
 * Draws T-shirt designs.
 *
 * One renderer serves the studio canvas, the mockups saved with an order and
 * the print-ready file staff download, so what the customer sees is exactly
 * what gets printed. Layers are positioned in design units (300 x 400, the
 * print area); `x`/`y` are the layer's centre.
 */
import { artSvg } from "./art";
import { DESIGN_H, DESIGN_W, PRINT_BOX, SHIRT_H, SHIRT_W, shirtSvg, svgImage } from "./shirt";

const FALLBACKS = `"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;

export const fontString = (layer, size = layer.size) =>
  `${layer.italic ? "italic " : ""}${layer.bold ? 700 : 400} ${size}px "${layer.font}", ${FALLBACKS}`;

let measureCtx = null;
const measurer = () => {
  if (!measureCtx) measureCtx = document.createElement("canvas").getContext("2d");
  return measureCtx;
};

/** Characters, split so emoji and accents stay whole. */
const glyphs = (text) => Array.from(text);

/** Width of one line, including letter spacing between characters. */
const lineWidth = (ctx, line, spacing) => {
  const chars = glyphs(line);
  if (chars.length === 0) return 0;
  return chars.reduce((sum, ch) => sum + ctx.measureText(ch).width, 0) + spacing * (chars.length - 1);
};

/** Curved text: the arc's angle and radius for a given straight width. */
const arcFor = (layer, width) => {
  const theta = (Math.abs(layer.curve) / 100) * Math.PI;
  return { theta, radius: width / theta };
};

/**
 * Layout of a text layer: its lines and box size in design units.
 * Curved text is laid out on one line.
 */
export const layoutText = (layer) => {
  const ctx = measurer();
  ctx.font = fontString(layer);
  const spacing = layer.letterSpacing || 0;
  const curved = Math.abs(layer.curve || 0) >= 1;
  const lines = curved ? [layer.text.replace(/\s*\n\s*/g, " ")] : layer.text.split("\n");
  const widths = lines.map((line) => lineWidth(ctx, line, spacing));
  const straight = Math.max(1, ...widths);
  const pad = (layer.strokeWidth || 0) * 2;

  if (curved) {
    const { theta, radius } = arcFor(layer, straight);
    return {
      lines,
      widths,
      curved,
      w: 2 * radius * Math.sin(theta / 2) + layer.size + pad,
      h: radius * (1 - Math.cos(theta / 2)) + layer.size * 1.25 + pad,
    };
  }
  const lineH = layer.size * (layer.lineHeight || 1.15);
  return { lines, widths, curved, w: straight + pad, h: lineH * lines.length + pad };
};

/** Box size of any layer, in design units. */
export const layerSize = (layer) => {
  if (layer.type === "text") {
    const { w, h } = layoutText(layer);
    return { w, h };
  }
  if (layer.type === "image") return { w: layer.width, h: layer.width * layer.aspect };
  return { w: layer.width, h: layer.width };
};

/* ---------------------------------- Assets --------------------------------- */

const bitmapCache = new Map();

const loadBitmap = (src) => {
  if (!bitmapCache.has(src)) {
    bitmapCache.set(
      src,
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
      })
    );
  }
  return bitmapCache.get(src);
};

const assetKey = (layer) => (layer.type === "art" ? `art:${layer.art}:${layer.color}` : layer.src);

/** Already-loaded images, for synchronous drawing. */
const ready = new Map();

/** Loads every image a set of layers needs; resolves once they can be drawn. */
export const loadAssets = async (layers) => {
  await Promise.all(
    layers
      .filter((layer) => layer.type !== "text")
      .map(async (layer) => {
        const key = assetKey(layer);
        if (ready.has(key)) return;
        const image = layer.type === "art" ? await svgImage(artSvg(layer.art, layer.color)) : await loadBitmap(layer.src);
        ready.set(key, image);
      })
  );
};

/** True when every image the layers use is loaded. */
export const assetsReady = (layers) => layers.every((layer) => layer.type === "text" || ready.has(assetKey(layer)));

/* ---------------------------------- Drawing -------------------------------- */

const drawGlyphRun = (ctx, layer, chars, positions) => {
  const passes = [];
  if (layer.strokeWidth > 0) passes.push("stroke");
  passes.push("fill");
  passes.forEach((pass, index) => {
    // The shadow goes on the first pass only, so it isn't doubled.
    if (layer.shadow && index === 0) {
      ctx.shadowColor = "rgba(0,0,0,0.38)";
      ctx.shadowBlur = layer.size * 0.12;
      ctx.shadowOffsetX = layer.size * 0.04;
      ctx.shadowOffsetY = layer.size * 0.06;
    } else {
      ctx.shadowColor = "transparent";
    }
    chars.forEach((ch, i) => {
      const { x, y, angle } = positions[i];
      ctx.save();
      ctx.translate(x, y);
      if (angle) ctx.rotate(angle);
      if (pass === "stroke") {
        ctx.lineJoin = "round";
        ctx.lineWidth = layer.strokeWidth * 2;
        ctx.strokeStyle = layer.strokeColor;
        ctx.strokeText(ch, 0, 0);
      } else {
        ctx.fillStyle = layer.color;
        ctx.fillText(ch, 0, 0);
      }
      ctx.restore();
    });
  });
  ctx.shadowColor = "transparent";
};

const drawText = (ctx, layer) => {
  const layout = layoutText(layer);
  ctx.font = fontString(layer);
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const spacing = layer.letterSpacing || 0;

  if (layout.curved) {
    const chars = glyphs(layout.lines[0]);
    const widths = chars.map((ch) => ctx.measureText(ch).width);
    const total = layout.widths[0];
    const { theta, radius } = arcFor(layer, Math.max(1, total));
    const up = layer.curve > 0;
    const pad = layer.strokeWidth || 0;
    const cy = up ? -layout.h / 2 + pad + layer.size * 0.62 + radius : layout.h / 2 - pad - layer.size * 0.62 - radius;
    let offset = 0;
    const positions = chars.map((ch, i) => {
      const a = -theta / 2 + (offset + widths[i] / 2) / radius;
      offset += widths[i] + spacing;
      const x = radius * Math.sin(a);
      const y = up ? cy - radius * Math.cos(a) : cy + radius * Math.cos(a);
      // Glyphs are drawn from their left edge; shift back by half their width along the tangent.
      const angle = up ? a : -a;
      return { x: x - (widths[i] / 2) * Math.cos(angle), y: y - (widths[i] / 2) * Math.sin(angle), angle };
    });
    drawGlyphRun(ctx, layer, chars, positions);
    return;
  }

  const lineH = layer.size * (layer.lineHeight || 1.15);
  const innerW = layout.w - (layer.strokeWidth || 0) * 2;
  layout.lines.forEach((line, row) => {
    const chars = glyphs(line);
    const width = layout.widths[row];
    let x = layer.align === "left" ? -innerW / 2 : layer.align === "right" ? innerW / 2 - width : -width / 2;
    const y = -((layout.lines.length - 1) * lineH) / 2 + row * lineH;
    const positions = chars.map((ch) => {
      const at = { x, y, angle: 0 };
      x += ctx.measureText(ch).width + spacing;
      return at;
    });
    drawGlyphRun(ctx, layer, chars, positions);
  });
};

/** Draws one layer onto a context already scaled to design units. */
export const drawLayer = (ctx, layer) => {
  if (layer.hidden) return;
  ctx.save();
  ctx.translate(layer.x, layer.y);
  if (layer.rotation) ctx.rotate((layer.rotation * Math.PI) / 180);
  if (layer.flipX) ctx.scale(-1, 1);
  ctx.globalAlpha = layer.opacity ?? 1;
  if (layer.type === "text") {
    drawText(ctx, layer);
  } else {
    const image = ready.get(assetKey(layer));
    if (image) {
      const { w, h } = layerSize(layer);
      ctx.drawImage(image, -w / 2, -h / 2, w, h);
    }
  }
  ctx.restore();
};

/**
 * Draws a side's layers into a canvas `scale` pixels per design unit, clipped
 * to the print area (nothing is printed outside it).
 */
export const drawDesign = (ctx, layers, scale) => {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.rect(0, 0, DESIGN_W, DESIGN_H);
  ctx.clip();
  layers.forEach((layer) => drawLayer(ctx, layer));
  ctx.restore();
};

/* ---------------------------------- Exports -------------------------------- */

/** Mockup of one side (shirt + design) as a JPEG data URL, for the bag and orders. */
export const renderMockup = async (hex, side, layers, { width = 720, quality = 0.86 } = {}) => {
  await loadAssets(layers);
  const scale = width / SHIRT_W;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.round(SHIRT_H * scale);
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#f4f5f2");
  bg.addColorStop(1, "#e6e8e3");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const shirt = await svgImage(shirtSvg(hex, side, `m${side}`));
  ctx.drawImage(shirt, 0, 0, canvas.width, canvas.height);

  const box = PRINT_BOX[side];
  ctx.save();
  ctx.translate(box.x * scale, box.y * scale);
  drawDesign(ctx, layers, (box.width / DESIGN_W) * scale);
  ctx.restore();
  return canvas.toDataURL("image/jpeg", quality);
};

/** Print-ready transparent PNG of one side (default 2400 x 3200, 200 dpi at 12 x 16 in). */
export const renderPrintFile = async (layers, { width = 2400 } = {}) => {
  await loadAssets(layers);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = Math.round((width * DESIGN_H) / DESIGN_W);
  drawDesign(canvas.getContext("2d"), layers, width / DESIGN_W);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
};

/** How sharp an uploaded photo will print at its current size. */
export const printQuality = (layer) => {
  if (layer.type !== "image") return null;
  const inches = (layer.width / DESIGN_W) * 12;
  const dpi = Math.round(layer.naturalWidth / inches);
  return { dpi, level: dpi >= 150 ? "great" : dpi >= 90 ? "ok" : "low" };
};

/** Width and height of a layer's box once rotated (what it covers on the shirt). */
const rotatedBounds = (layer) => {
  const { w, h } = layerSize(layer);
  const a = ((layer.rotation || 0) * Math.PI) / 180;
  return {
    bw: Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a)),
    bh: Math.abs(w * Math.sin(a)) + Math.abs(h * Math.cos(a)),
  };
};

/**
 * Keeps a layer inside the print area: too big → scaled down to fit, then
 * moved back so no edge crosses the dashed line. Returns the same object when
 * nothing had to change.
 */
export const fitInArea = (layer) => {
  let next = layer;
  for (let i = 0; i < 3; i++) {
    const { bw, bh } = rotatedBounds(next);
    const factor = Math.min(1, DESIGN_W / bw, DESIGN_H / bh);
    if (factor >= 0.999) break;
    next =
      next.type === "text"
        ? { ...next, size: Math.max(6, Math.floor(next.size * factor * 0.99 * 10) / 10) }
        : { ...next, width: Math.max(8, Math.floor(next.width * factor * 0.99 * 10) / 10) };
  }
  const { bw, bh } = rotatedBounds(next);
  const clamp = (value, half, max) => (half * 2 <= max ? Math.min(max - half, Math.max(half, value)) : max / 2);
  const x = Math.round(clamp(next.x, bw / 2, DESIGN_W) * 10) / 10;
  const y = Math.round(clamp(next.y, bh / 2, DESIGN_H) * 10) / 10;
  if (next === layer && Math.abs(x - layer.x) < 0.05 && Math.abs(y - layer.y) < 0.05) return layer;
  return { ...next, x, y };
};

/** Whether part of a layer's box falls outside the print area. */
export const isOutside = (layer) => {
  const { bw, bh } = rotatedBounds(layer);
  const slack = 2;
  return (
    layer.x - bw / 2 < -slack ||
    layer.y - bh / 2 < -slack ||
    layer.x + bw / 2 > DESIGN_W + slack ||
    layer.y + bh / 2 > DESIGN_H + slack
  );
};
