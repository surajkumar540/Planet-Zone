import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImageUp, Loader2, RefreshCw, ScanSearch, ShieldCheck, Sparkles, X } from "lucide-react";

import { searchByPhoto } from "../../../api/smartApi";
import { getErrorMessage } from "../../../lib/apiError";
import { formatCurrency } from "../../../lib/format";
import cn from "../../../lib/cn";

/**
 * Search by photo, powered by a free open-source AI model (CLIP) running on
 * our own server.
 *
 * The shopper's photo is shrunk to 384 px in the browser, sent once, compared
 * against every product photo, and thrown away: it is never stored. Opened
 * from the search bar's camera button or the chat via `openPhotoSearch()`.
 */

const EVENT = "planet:photo-search";
export const openPhotoSearch = () => window.dispatchEvent(new Event(EVENT));

/** Square-ish, small JPEG: enough detail for matching, tiny to upload. */
const shrink = (file) =>
  new Promise((resolve, reject) => {
    if (!/^image\//.test(file.type)) {
      reject(new Error("Choose a photo (JPG, PNG or WebP)."));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, 384 / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file couldn't be read as a photo."));
    };
    image.src = url;
  });

const PhotoSearch = () => {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [state, setState] = useState({ status: "idle" });
  const [dragging, setDragging] = useState(false);
  const uploadRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(EVENT, show);
    return () => window.removeEventListener(EVENT, show);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const search = useCallback(async (file) => {
    try {
      const dataUrl = await shrink(file);
      setPreview(dataUrl);
      setState({ status: "searching" });
      const response = await searchByPhoto(dataUrl);
      const data = response.data;
      if (!data.ready) setState({ status: "warming", message: data.message });
      else setState({ status: "done", products: data.products });
    } catch (error) {
      setState({ status: "error", message: error.message?.startsWith("Choose") || error.message?.startsWith("That file") ? error.message : getErrorMessage(error) });
    }
  }, []);

  // While open: Escape closes, and a pasted image searches straight away.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && close();
    const onPaste = (event) => {
      const file = [...(event.clipboardData?.files || [])].find((item) => item.type.startsWith("image/"));
      if (file) search(file);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("paste", onPaste);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("paste", onPaste);
    };
  }, [open, close, search]);

  const pick = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) search(file);
  };

  const reset = () => {
    setPreview(null);
    setState({ status: "idle" });
  };

  const close_matches = state.products?.filter((product) => product.match >= 0.6) || [];
  const looser = state.products?.filter((product) => product.match < 0.6) || [];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label="Search by photo">
          <motion.div className="absolute inset-0 bg-black/55 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-line-subtle px-5 py-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ background: "linear-gradient(135deg, var(--promo-dusk-from), var(--promo-dusk-to))" }}>
                <ScanSearch size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-[1.0625rem] font-semibold text-content">
                  Search by photo
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--promo-dusk-to)_15%,transparent)] px-2 py-0.5 text-[0.6875rem] font-bold text-[color:var(--promo-dusk-to)]">
                    <Sparkles size={11} /> AI
                  </span>
                </p>
                <p className="type-caption">Snap or upload a photo of something you like and we will find similar products.</p>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full text-content-secondary hover:bg-surface-hover">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!preview ? (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    const file = event.dataTransfer.files?.[0];
                    if (file) search(file);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors",
                    dragging ? "border-accent bg-accent-subtle" : "border-line bg-surface-sunken"
                  )}
                >
                  <motion.span
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-accent-text shadow-md"
                  >
                    <ImageUp size={28} />
                  </motion.span>
                  <p className="mt-4 text-[1rem] font-semibold text-content">Drop a photo here</p>
                  <p className="mt-1 type-caption">or paste one (Ctrl+V), or choose below</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={() => uploadRef.current?.click()} className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-[0.875rem] font-semibold text-accent-on">
                      <ImageUp size={16} /> Upload a photo
                    </button>
                    <button type="button" onClick={() => cameraRef.current?.click()} className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 text-[0.875rem] font-semibold text-content hover:border-accent">
                      <Camera size={16} /> Take a photo
                    </button>
                  </div>
                  <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={pick} />
                  <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-[11rem_minmax(0,1fr)]">
                  {/* The photo being matched, with a scanning line while working */}
                  <div>
                    <div className="relative overflow-hidden rounded-2xl border border-line bg-white">
                      <img src={preview} alt="Your photo" className="aspect-square w-full object-contain" />
                      {state.status === "searching" && (
                        <motion.span
                          className="absolute inset-x-0 h-1/4"
                          style={{ background: "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--accent-solid) 45%, transparent), transparent)" }}
                          animate={{ top: ["-25%", "100%"] }}
                          transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </div>
                    <button type="button" onClick={reset} className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-line py-2 text-[0.8125rem] font-semibold text-content hover:border-accent">
                      <RefreshCw size={14} /> Try another photo
                    </button>
                  </div>

                  <div className="min-w-0">
                    {state.status === "searching" && (
                      <p className="flex items-center gap-2 py-10 text-[0.9375rem] text-content-secondary">
                        <Loader2 size={18} className="animate-spin text-accent-text" /> Looking through every product photo…
                      </p>
                    )}
                    {(state.status === "error" || state.status === "warming") && (
                      <p className={cn("rounded-xl px-4 py-3 text-[0.875rem]", state.status === "error" ? "bg-status-critical-bg text-content" : "bg-status-info-bg text-content")}>
                        {state.message}
                      </p>
                    )}
                    {state.status === "done" && (
                      <>
                        {close_matches.length ? (
                          <p className="mb-3 text-[0.9375rem] font-semibold text-content">
                            {close_matches.length} close match{close_matches.length === 1 ? "" : "es"}
                          </p>
                        ) : (
                          <p className="mb-3 rounded-xl bg-status-warning-bg px-4 py-3 text-[0.875rem] text-content">
                            Nothing in the shop looks very close. {looser.length ? "These are the nearest:" : "Try a clearer photo of a single item."}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {[...close_matches, ...looser].slice(0, 9).map((product) => (
                            <Link
                              key={product._id}
                              to={`/product/${product._id}`}
                              onClick={close}
                              className="group overflow-hidden rounded-xl border border-line-subtle bg-surface transition-all hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <div className="relative bg-white">
                                <img src={product.image} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                                <span
                                  className={cn(
                                    "absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold text-white",
                                    product.match >= 0.75 ? "bg-status-good" : product.match >= 0.6 ? "bg-accent" : "bg-black/50"
                                  )}
                                >
                                  {Math.round(product.match * 100)}% match
                                </span>
                              </div>
                              <div className="p-2.5">
                                <p className="line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-content group-hover:text-accent-text">{product.name}</p>
                                <p className="mt-0.5 type-numeric text-[0.8125rem] font-bold text-content">{formatCurrency(product.totalPrice)}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="flex items-center gap-2 border-t border-line-subtle bg-surface-sunken px-5 py-3 type-caption">
              <ShieldCheck size={14} className="shrink-0 text-status-good" />
              Matched by a free, open-source AI model on our own server. Your photo is never stored.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PhotoSearch;
