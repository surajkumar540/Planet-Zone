import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MousePointerClick, RotateCw } from "lucide-react";

import cn from "../../../lib/cn";
import { DESIGN_H, DESIGN_W, PRINT_BOX, SHIRT_H, SHIRT_W, shirtSvg } from "../../../lib/tee/shirt";
import { assetsReady, drawDesign, layerSize, loadAssets } from "../../../lib/tee/render";

const SNAP = 4;
const pct = (value, total) => `${(value / total) * 100}%`;

/** Point (design units) inside a layer's rotated box? */
const hits = (layer, px, py) => {
  const { w, h } = layerSize(layer);
  const a = (-(layer.rotation || 0) * Math.PI) / 180;
  const dx = px - layer.x;
  const dy = py - layer.y;
  const lx = dx * Math.cos(a) - dy * Math.sin(a);
  const ly = dx * Math.sin(a) + dy * Math.cos(a);
  const pad = 4;
  return Math.abs(lx) <= w / 2 + pad && Math.abs(ly) <= h / 2 + pad;
};

/**
 * The shirt with its print area: draws the design on a canvas (the same
 * renderer as the saved mockups) and handles selecting, moving, resizing and
 * rotating layers with mouse, pen or touch. Moves snap to the centre lines.
 */
const DesignStage = ({ designer, hex, fontsReady, onTextDoubleClick }) => {
  const { side, layers, selected, select, updateLayer, begin, end } = designer;
  const areaRef = useRef(null);
  const canvasRef = useRef(null);
  const gesture = useRef(null);
  const [scale, setScale] = useState(1);
  const [assetTick, setAssetTick] = useState(0);
  const [guides, setGuides] = useState({ v: false, h: false });
  const box = PRINT_BOX[side];

  // Pixels per design unit, kept in step with the layout.
  useLayoutEffect(() => {
    const node = areaRef.current;
    if (!node) return undefined;
    const measure = () => setScale(node.clientWidth / DESIGN_W);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Photos and artwork load once, then the canvas redraws.
  useEffect(() => {
    if (assetsReady(layers)) return;
    let cancelled = false;
    loadAssets(layers)
      .catch(() => null)
      .then(() => !cancelled && setAssetTick((tick) => tick + 1));
    return () => {
      cancelled = true;
    };
  }, [layers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !scale) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(DESIGN_W * scale * dpr);
    canvas.height = Math.round(DESIGN_H * scale * dpr);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDesign(ctx, layers, scale * dpr);
  }, [layers, scale, fontsReady, assetTick]);

  const toUnits = (event) => {
    const rect = areaRef.current.getBoundingClientRect();
    return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
  };

  const startGesture = (event, mode, layer) => {
    event.stopPropagation();
    if (layer.locked) {
      gesture.current = null;
      return;
    }
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = toUnits(event);
    gesture.current = {
      mode,
      id: layer.id,
      start: point,
      origin: { x: layer.x, y: layer.y, rotation: layer.rotation || 0, size: layer.type === "text" ? layer.size : layer.width },
      startDist: Math.max(1, Math.hypot(point.x - layer.x, point.y - layer.y)),
      type: layer.type,
      pointerId: event.pointerId,
    };
    begin();
  };

  const onAreaPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    const point = toUnits(event);
    // Everything under the pointer, top first.
    const under = [...layers].reverse().filter((layer) => !layer.hidden && hits(layer, point.x, point.y));
    if (under.length === 0) {
      select(null);
      return;
    }
    // Keep the current selection if it is under the pointer (so a layer picked
    // from the Layers list can be dragged even when it sits behind another).
    const current = under.find((layer) => layer.id === selected?.id);
    const target = current || under[0];
    select(target.id);
    startGesture(event, "move", target);
    gesture.current.under = under.map((layer) => layer.id);
    gesture.current.wasSelected = Boolean(current);
  };

  const onPointerMove = (event) => {
    const g = gesture.current;
    if (!g || g.pointerId !== event.pointerId) return;
    const point = toUnits(event);

    if (g.mode === "move") {
      let x = g.origin.x + (point.x - g.start.x);
      let y = g.origin.y + (point.y - g.start.y);
      const snapV = !event.shiftKey && Math.abs(x - DESIGN_W / 2) < SNAP;
      const snapH = !event.shiftKey && Math.abs(y - DESIGN_H / 2) < SNAP;
      if (snapV) x = DESIGN_W / 2;
      if (snapH) y = DESIGN_H / 2;
      setGuides({ v: snapV, h: snapH });
      updateLayer(g.id, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }, { liveOnly: true });
    } else if (g.mode === "scale") {
      const ratio = Math.hypot(point.x - g.origin.x, point.y - g.origin.y) / g.startDist;
      const value = g.origin.size * ratio;
      const patch =
        g.type === "text"
          ? { size: Math.round(Math.max(6, Math.min(260, value)) * 10) / 10 }
          : { width: Math.round(Math.max(8, Math.min(700, value)) * 10) / 10 };
      updateLayer(g.id, patch, { liveOnly: true });
    } else if (g.mode === "rotate") {
      let angle = (Math.atan2(point.y - g.origin.y, point.x - g.origin.x) * 180) / Math.PI + 90;
      if (angle > 180) angle -= 360;
      if (!event.shiftKey) {
        const nearest = Math.round(angle / 45) * 45;
        if (Math.abs(angle - nearest) < 4) angle = nearest;
      }
      // Size is restored from the start of the drag each frame, so a layer
      // shrunk to fit while turned grows back when turned straight again.
      const size = g.type === "text" ? { size: g.origin.size } : { width: g.origin.size };
      updateLayer(g.id, { rotation: Math.round(angle), ...size }, { liveOnly: true });
    }
  };

  const onPointerUp = (event) => {
    const g = gesture.current;
    if (!g || g.pointerId !== event.pointerId) return;
    gesture.current = null;
    // A click (no drag) on an already-selected layer picks the next one
    // beneath it, so overlapping elements can all be reached.
    if (g.mode === "move" && g.wasSelected && g.under?.length > 1) {
      const point = toUnits(event);
      if (Math.hypot(point.x - g.start.x, point.y - g.start.y) < 1) {
        const next = g.under[(g.under.indexOf(g.id) + 1) % g.under.length];
        select(next);
      }
    }
    setGuides({ v: false, h: false });
    end();
  };

  const selection = useMemo(() => {
    if (!selected || selected.hidden) return null;
    const { w, h } = layerSize(selected);
    return { w: w * scale, h: h * scale, left: selected.x * scale, top: selected.y * scale };
    // fontsReady changes text measurements.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, scale, fontsReady]);

  const corners = ["-left-1.5 -top-1.5 cursor-nwse-resize", "-right-1.5 -top-1.5 cursor-nesw-resize", "-left-1.5 -bottom-1.5 cursor-nesw-resize", "-right-1.5 -bottom-1.5 cursor-nwse-resize"];

  return (
    <div className="relative mx-auto w-full max-w-[560px] select-none" style={{ aspectRatio: `${SHIRT_W} / ${SHIRT_H}` }}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={side}
          initial={{ rotateY: side === "back" ? -90 : 90, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: side === "back" ? 90 : -90, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full [&>svg]:transition-[fill]"
          style={{ transformPerspective: 1200 }}
          dangerouslySetInnerHTML={{ __html: shirtSvg(hex, side, `stage-${side}`) }}
        />
      </AnimatePresence>

      <div
        ref={areaRef}
        className="absolute touch-none"
        style={{ left: pct(box.x, SHIRT_W), top: pct(box.y, SHIRT_H), width: pct(box.width, SHIRT_W), height: pct(box.height, SHIRT_H) }}
        onPointerDown={onAreaPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={() => selected?.type === "text" && onTextDoubleClick?.()}
        role="application"
        aria-label={`${side === "front" ? "Front" : "Back"} print area. Click an element to select it; drag to move; use arrow keys to nudge.`}
      >
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

        {/* Print boundary */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 rounded-[3px] border border-dashed transition-opacity",
            selected ? "opacity-100" : "opacity-60"
          )}
          style={{ borderColor: "color-mix(in srgb, var(--accent-solid, #16a34a) 70%, transparent)" }}
        />
        {guides.v && <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-status-critical" />}
        {guides.h && <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-status-critical" />}

        {layers.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm">
              <MousePointerClick size={18} className="text-accent-text" />
            </span>
            <p className="type-caption rounded-md bg-surface px-2 py-1 text-content-secondary shadow-xs">
              Add text, art or a photo to the {side}
            </p>
          </div>
        )}

        {selection && (
          <div
            className={cn("absolute", selected.locked ? "border border-dashed border-content-muted" : "border-[1.5px] border-accent")}
            style={{
              left: selection.left,
              top: selection.top,
              width: selection.w,
              height: selection.h,
              transform: `translate(-50%, -50%) rotate(${selected.rotation || 0}deg)`,
              pointerEvents: "none",
            }}
          >
            {!selected.locked && (
              <>
                {corners.map((place) => (
                  <span
                    key={place}
                    onPointerDown={(event) => startGesture(event, "scale", selected)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    className={cn("pointer-events-auto absolute h-3 w-3 touch-none rounded-full border-2 border-accent bg-surface shadow-sm", place)}
                    aria-hidden="true"
                  />
                ))}
                <span className="pointer-events-none absolute -top-7 left-1/2 h-5 w-px -translate-x-1/2 bg-accent" />
                <span
                  onPointerDown={(event) => startGesture(event, "rotate", selected)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  className="pointer-events-auto absolute -top-10 left-1/2 flex h-6 w-6 -translate-x-1/2 cursor-grab touch-none items-center justify-center rounded-full border-2 border-accent bg-surface text-accent-text shadow-sm"
                  aria-hidden="true"
                >
                  <RotateCw size={12} />
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DesignStage;
