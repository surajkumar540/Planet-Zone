import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Camera,
  Download,
  Eraser,
  ImagePlus,
  Info,
  Layers,
  Maximize2,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  Shirt,
  Trash2,
  Upload,
} from "lucide-react";

import { getAllProducts } from "../../../api/productApi";
import { getProductsByIds } from "../../../api/smartApi";
import { useApi } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import { ErrorState } from "../../../components/ui/States";
import { Skeleton } from "../../../components/ui/Skeleton";
import { Container, SectionHeading } from "../components/Primitives";
import { formatCurrency } from "../../../lib/format";
import cn from "../../../lib/cn";
import { WEARABLE_CATEGORIES } from "../../../lib/tryOn";

/**
 * Try-on preview.
 *
 * A simple, honest overlay: the shopper's photo with product images placed
 * on top, which they can drag, resize, rotate and fade. It is NOT AI clothing
 * replacement (that needs paid or GPU-heavy services), and the page says so.
 *
 * Privacy: the photo is read with an object URL and drawn on a canvas in the
 * browser. It is never uploaded anywhere. Product photos have white
 * backgrounds; "remove white background" makes those pixels transparent,
 * also locally.
 */


/** A neutral figure to try things on before uploading a photo. */
const MANNEQUIN = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
  <defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef6f0"/><stop offset="1" stop-color="#dcebdf"/></linearGradient></defs>
  <rect width="600" height="800" fill="url(#bg)"/>
  <g fill="#c9d8cc">
    <circle cx="300" cy="150" r="62"/>
    <rect x="276" y="205" width="48" height="40" rx="14"/>
    <path d="M170 270 Q300 225 430 270 L455 520 Q300 560 145 520 Z"/>
    <path d="M170 275 L110 470 Q100 500 128 505 L150 500 L198 320 Z"/>
    <path d="M430 275 L490 470 Q500 500 472 505 L450 500 L402 320 Z"/>
    <path d="M190 520 L215 780 L285 780 L300 560 L315 780 L385 780 L410 520 Z"/>
  </g>
</svg>`)}`;

/** Where a newly added item starts, by category (centre x/y and width, as % of the photo). */
const placementFor = (category = "") => {
  if (/sunglass/i.test(category)) return { x: 50, y: 19, width: 26 };
  if (/watch/i.test(category)) return { x: 22, y: 60, width: 14 };
  if (/jewel/i.test(category)) return { x: 50, y: 30, width: 18 };
  if (/bag/i.test(category)) return { x: 74, y: 62, width: 30 };
  if (/dress/i.test(category)) return { x: 50, y: 58, width: 56 };
  return { x: 50, y: 46, width: 52 };
};

/** Makes near-white pixels transparent, softly, in a canvas. Cached per image. */
const cutoutCache = new Map();
const removeWhite = (src) => {
  if (cutoutCache.has(src)) return cutoutCache.get(src);
  const job = new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 900 / Math.max(image.width, image.height));
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = pixels.data;
      for (let index = 0; index < data.length; index += 4) {
        const min = Math.min(data[index], data[index + 1], data[index + 2]);
        // Whites above 245 vanish; 225–245 fade, so edges stay soft.
        if (min > 245) data[index + 3] = 0;
        else if (min > 225) data[index + 3] = Math.round(((245 - min) / 20) * data[index + 3]);
      }
      context.putImageData(pixels, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => reject(new Error("Couldn't load that product image."));
    image.src = src;
  });
  cutoutCache.set(src, job);
  job.catch(() => cutoutCache.delete(src));
  return job;
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });

let nextId = 1;

const TryOn = () => {
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const stageRef = useRef(null);
  const fileRef = useRef(null);

  const [photo, setPhoto] = useState({ src: MANNEQUIN, sample: true });
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [cutouts, setCutouts] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [filter, setFilter] = useState("All");

  const catalogue = useApi(getAllProducts, { category: WEARABLE_CATEGORIES.join(","), limit: 60, sort: "rating:desc" }, { cacheTime: 5 * 60 * 1000 });
  const requestedId = searchParams.get("product");
  const requested = useApi(getProductsByIds, { ids: requestedId ? [requestedId] : [] }, { enabled: Boolean(requestedId) });

  const products = useMemo(() => catalogue.data || [], [catalogue.data]);
  const shown = filter === "All" ? products : products.filter((product) => product.category === filter);
  const selected = items.find((item) => item.id === selectedId) || null;

  // Revoke uploaded-photo URLs when replaced or on leave.
  useEffect(() => () => photo.src.startsWith("blob:") && URL.revokeObjectURL(photo.src), [photo.src]);

  const update = useCallback((id, patch) => setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item))), []);

  /** Adds a product, or swaps it into the selected layer when `replace` is set. */
  const place = useCallback(
    (product, replace = false) => {
      if (replace && selectedId) {
        update(selectedId, { product, cutout: false });
        return;
      }
      const id = nextId++;
      setItems((current) => [...current, { id, product, ...placementFor(product.category), rotation: 0, opacity: 0.95, cutout: true }]);
      setSelectedId(id);
    },
    [selectedId, update]
  );

  // Arriving from a product page (?product=id) puts that product on straight away.
  const placedRequested = useRef(false);
  useEffect(() => {
    const product = requested.data?.[0];
    if (product && !placedRequested.current) {
      placedRequested.current = true;
      place(product);
    }
  }, [requested.data, place]);

  // Prepare cut-outs for layers that want them.
  useEffect(() => {
    items.forEach((item) => {
      if (item.cutout && !cutouts[item.product.image]) {
        removeWhite(item.product.image)
          .then((url) => setCutouts((current) => ({ ...current, [item.product.image]: url })))
          .catch(() => update(item.id, { cutout: false }));
      }
    });
  }, [items, cutouts, update]);

  const onUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      toast.error("That isn't an image", "Choose a JPG, PNG or WebP photo.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Photo too large", "Choose a photo under 15 MB.");
      return;
    }
    setPhoto({ src: URL.createObjectURL(file), sample: false });
  };

  /* ------------------------------- Dragging -------------------------------- */
  const startDrag = (event, item, mode) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(item.id);
    const stage = stageRef.current.getBoundingClientRect();
    const start = { x: event.clientX, y: event.clientY, item: { ...item } };
    const centre = { x: stage.left + (item.x / 100) * stage.width, y: stage.top + (item.y / 100) * stage.height };
    const onMove = (moveEvent) => {
      if (mode === "move") {
        update(item.id, {
          x: Math.min(100, Math.max(0, start.item.x + ((moveEvent.clientX - start.x) / stage.width) * 100)),
          y: Math.min(100, Math.max(0, start.item.y + ((moveEvent.clientY - start.y) / stage.height) * 100)),
        });
      } else if (mode === "resize") {
        const distance = Math.hypot(moveEvent.clientX - centre.x, moveEvent.clientY - centre.y);
        const startDistance = Math.hypot(start.x - centre.x, start.y - centre.y) || 1;
        update(item.id, { width: Math.min(150, Math.max(5, start.item.width * (distance / startDistance))) });
      } else if (mode === "rotate") {
        const angle = (Math.atan2(moveEvent.clientY - centre.y, moveEvent.clientX - centre.x) * 180) / Math.PI;
        update(item.id, { rotation: Math.round(angle + 90) });
      }
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  /** Arrow keys nudge the selected layer; +/- resize; Delete removes. */
  const onKeyDown = (event) => {
    if (!selected) return;
    const step = event.shiftKey ? 5 : 1;
    const moves = { ArrowLeft: { x: -step }, ArrowRight: { x: step }, ArrowUp: { y: -step }, ArrowDown: { y: step } };
    if (moves[event.key]) {
      event.preventDefault();
      const move = moves[event.key];
      update(selected.id, { x: selected.x + (move.x || 0), y: selected.y + (move.y || 0) });
    } else if (event.key === "+" || event.key === "=") update(selected.id, { width: Math.min(150, selected.width + step) });
    else if (event.key === "-") update(selected.id, { width: Math.max(5, selected.width - step) });
    else if (event.key === "Delete" || event.key === "Backspace") removeItem(selected.id);
  };

  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedId(null);
  };

  const resetAll = () => {
    setItems((current) => current.map((item) => ({ ...item, ...placementFor(item.product.category), rotation: 0, opacity: 0.95 })));
  };

  /* ------------------------------- Download -------------------------------- */
  const download = async () => {
    setDownloading(true);
    try {
      const base = await loadImage(photo.src);
      const width = Math.min(1600, base.naturalWidth || 600);
      const height = Math.round(width * ((base.naturalHeight || 800) / (base.naturalWidth || 600)));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(base, 0, 0, width, height);
      for (const item of items) {
        const src = item.cutout && cutouts[item.product.image] ? cutouts[item.product.image] : item.product.image;
        const image = await loadImage(src);
        const drawWidth = (item.width / 100) * width;
        const drawHeight = drawWidth * (image.naturalHeight / image.naturalWidth);
        context.save();
        context.globalAlpha = item.opacity;
        context.translate((item.x / 100) * width, (item.y / 100) * height);
        context.rotate((item.rotation * Math.PI) / 180);
        context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        context.restore();
      }
      const link = document.createElement("a");
      link.download = "planet-zone-try-on.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      toast.error("Couldn't create the image", "Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const categories = useMemo(() => ["All", ...WEARABLE_CATEGORIES.filter((name) => products.some((product) => product.category === name))], [products]);

  return (
    <Container className="py-8">
      <SectionHeading
        eyebrow="Try it on"
        title="Virtual try-on preview"
        description="Upload a photo of yourself, then place clothes and accessories from the shop on it to get a feel for the look."
      />

      <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-line-subtle bg-surface p-4 sm:flex-row sm:items-center sm:gap-6">
        <p className="flex items-start gap-2 type-caption text-content-secondary">
          <Info size={15} className="mt-0.5 shrink-0 text-status-info" />
          This is a simple overlay preview, not a realistic AI fitting. Products won&apos;t bend to your body, so treat it as a rough idea of colour and style.
        </p>
        <p className="flex items-start gap-2 type-caption text-content-secondary sm:shrink-0">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-status-good" />
          Your photo stays on your device: it is never uploaded.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ------------------------------- Stage ------------------------------- */}
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button variant="primary" icon={photo.sample ? Upload : Camera} onClick={() => fileRef.current?.click()}>
              {photo.sample ? "Upload your photo" : "Change photo"}
            </Button>
            <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onUpload} />
            <Button icon={RotateCcw} onClick={resetAll} disabled={!items.length}>
              Reset positions
            </Button>
            <Button icon={Trash2} onClick={() => { setItems([]); setSelectedId(null); }} disabled={!items.length}>
              Remove all
            </Button>
            <Button icon={Download} onClick={download} loading={downloading} disabled={!items.length}>
              Download
            </Button>
          </div>

          <div
            ref={stageRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={() => setSelectedId(null)}
            aria-label="Try-on preview. Select a layer, then use arrow keys to move it and plus or minus to resize."
            className="relative mx-auto w-full max-w-[34rem] touch-none select-none overflow-hidden rounded-2xl border border-line bg-surface-sunken shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <img src={photo.src} alt={photo.sample ? "Sample figure" : "Your photo"} draggable={false} className="block w-full" />
            {photo.sample && (
              <span className="absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[0.75rem] font-semibold text-white backdrop-blur">
                Sample figure: upload your own photo
              </span>
            )}

            {items.map((item) => {
              const active = item.id === selectedId;
              const src = item.cutout && cutouts[item.product.image] ? cutouts[item.product.image] : item.product.image;
              return (
                <div
                  key={item.id}
                  onPointerDown={(event) => startDrag(event, item, "move")}
                  className={cn("absolute cursor-move", active && "z-10")}
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: `${item.width}%`,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
                    opacity: item.opacity,
                  }}
                  role="button"
                  aria-label={`${item.product.name} layer`}
                  aria-pressed={active}
                >
                  <img src={src} alt="" draggable={false} crossOrigin="anonymous" className="pointer-events-none block w-full" />
                  {active && (
                    <>
                      <span className="pointer-events-none absolute inset-0 rounded-md border-2 border-dashed border-accent" />
                      <span
                        onPointerDown={(event) => startDrag(event, item, "resize")}
                        className="absolute -bottom-3 -right-3 flex h-7 w-7 cursor-nwse-resize items-center justify-center rounded-full bg-accent text-accent-on shadow-md"
                        title="Drag to resize"
                      >
                        <Maximize2 size={13} />
                      </span>
                      <span
                        onPointerDown={(event) => startDrag(event, item, "rotate")}
                        className="absolute -top-9 left-1/2 flex h-7 w-7 -translate-x-1/2 cursor-grab items-center justify-center rounded-full bg-surface text-accent-text shadow-md ring-1 ring-line"
                        title="Drag to rotate"
                      >
                        <RotateCw size={13} />
                      </span>
                    </>
                  )}
                </div>
              );
            })}

            {!items.length && (
              <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
                <span className="flex items-center gap-2 rounded-full bg-black/55 px-4 py-2 text-[0.8125rem] text-white backdrop-blur">
                  <Shirt size={15} /> Pick a product on the right to try it on
                </span>
              </div>
            )}
          </div>

          {/* Selected layer controls */}
          {selected && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mt-4 max-w-[34rem] rounded-2xl border border-line-subtle bg-surface p-4">
              <div className="mb-3 flex items-center gap-3">
                <img src={selected.product.image} alt="" className="h-10 w-10 rounded-lg bg-white object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.875rem] font-semibold text-content">{selected.product.name}</p>
                  <Link to={`/product/${selected.product._id}`} className="type-caption font-semibold text-accent-text hover:underline">
                    View product · {formatCurrency(selected.product.totalPrice)}
                  </Link>
                </div>
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => removeItem(selected.id)} className="text-status-critical">
                  Remove
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { key: "width", label: "Size", min: 5, max: 150, unit: "%" },
                  { key: "rotation", label: "Rotate", min: -180, max: 180, unit: "°" },
                  { key: "opacity", label: "Opacity", min: 0.2, max: 1, step: 0.05, unit: "" },
                ].map((control) => (
                  <label key={control.key} className="block">
                    <span className="flex justify-between type-caption">
                      {control.label}
                      <span className="type-numeric">
                        {control.key === "opacity" ? `${Math.round(selected.opacity * 100)}%` : `${Math.round(selected[control.key])}${control.unit}`}
                      </span>
                    </span>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      step={control.step || 1}
                      value={selected[control.key]}
                      onChange={(event) => update(selected.id, { [control.key]: Number(event.target.value) })}
                      className="mt-1 w-full accent-[var(--accent-solid)]"
                    />
                  </label>
                ))}
              </div>
              <label className="mt-3 flex items-center gap-2 text-[0.8125rem] text-content">
                <input
                  type="checkbox"
                  checked={selected.cutout}
                  onChange={(event) => update(selected.id, { cutout: event.target.checked })}
                  className="h-4 w-4 accent-[var(--accent-solid)]"
                />
                <Eraser size={14} className="text-content-muted" /> Remove white background
              </label>
              <p className="mt-2 type-caption">Tip: drag to move, use the corner to resize and the top handle to rotate. Picking another product below swaps this layer.</p>
            </motion.div>
          )}
        </div>

        {/* ------------------------------ Products ------------------------------ */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line-subtle bg-surface p-4">
            <p className="mb-3 flex items-center gap-2 text-[0.9375rem] font-semibold text-content">
              <Layers size={16} className="text-accent-text" />
              {selected ? "Swap the selected item" : "Add to your look"}
            </p>
            <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
              {categories.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFilter(name)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-[0.75rem] font-medium transition-colors",
                    filter === name ? "bg-accent text-accent-on" : "bg-surface-sunken text-content-secondary hover:text-content"
                  )}
                >
                  {name}
                </button>
              ))}
            </div>
            {catalogue.error ? (
              <ErrorState description={catalogue.error} onRetry={catalogue.refetch} />
            ) : catalogue.loading && !products.length ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }, (_, index) => (
                  <Skeleton key={index} className="aspect-square rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid max-h-[32rem] grid-cols-3 gap-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
                {shown.map((product) => {
                  const onStage = items.some((item) => item.product._id === product._id);
                  return (
                    <button
                      key={product._id}
                      type="button"
                      onClick={() => place(product, Boolean(selected))}
                      title={product.name}
                      aria-label={`${selected ? "Swap in" : "Try on"} ${product.name}`}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-xl border-2 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md",
                        onStage ? "border-accent" : "border-transparent"
                      )}
                    >
                      <img src={product.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-4 text-left text-[0.625rem] font-semibold leading-tight text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {product.name}
                      </span>
                      {!selected && (
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-on opacity-0 shadow transition-opacity group-hover:opacity-100">
                          <ImagePlus size={11} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </Container>
  );
};

export default TryOn;
