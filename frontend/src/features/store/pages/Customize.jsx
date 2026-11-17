import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpToLine,
  Check,
  Copy,
  Eye,
  FlipHorizontal2,
  FolderOpen,
  Lock,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  Ruler,
  ShoppingBag,
  Trash2,
  Truck,
  Undo2,
  Unlock,
} from "lucide-react";

import { getDesign, getMyDesigns, getStudioConfig, saveDesign, deleteDesign } from "../../../api/designApi";
import { useApi } from "../../../hooks/useApi";
import { getErrorMessage } from "../../../lib/apiError";
import cn from "../../../lib/cn";
import { formatCurrency } from "../../../lib/format";
import Button from "../../../components/ui/Button";
import Modal, { ConfirmDialog } from "../../../components/ui/Modal";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ErrorState, EmptyState } from "../../../components/ui/States";
import { useToast } from "../../../components/ui/Toast";
import { Container } from "../components/Primitives";
import { useSession } from "../hooks/useStorefront";
import { useCartFeedback } from "../hooks/useCartFeedback";
import { addToCart } from "../../../redux/reducers/cartSlice";
import { loadStudioFonts } from "../../../lib/tee/fonts";
import { luminance } from "../../../lib/tee/shirt";
import { emptyDoc, hasPrint, SIDES, withFreshIds } from "../../../lib/tee/model";
import { isOutside, renderMockup } from "../../../lib/tee/render";
import { DESIGN_H, DESIGN_W } from "../../../lib/tee/shirt";
import useDesigner from "../studio/useDesigner";
import DesignStage from "../studio/DesignStage";
import ToolPanel from "../studio/ToolPanel";

const TAB_FOR_TYPE = { text: "text", art: "art", image: "upload" };

/** Text layers left empty are dropped rather than failing the save. */
const printable = (layers) => layers.filter((layer) => layer.type !== "text" || layer.text.trim());

const sideName = (side) => (side === "front" ? "Front" : "Back");

/* ------------------------------ Selection bar ------------------------------ */

const ToolButton = ({ icon: Icon, label, onClick, danger, active, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    aria-pressed={active}
    className={cn(
      "flex h-9 w-9 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-35",
      danger ? "text-status-critical hover:bg-status-critical-bg" : active ? "bg-accent-subtle text-accent-text" : "text-content-secondary hover:bg-surface-hover hover:text-content"
    )}
  >
    <Icon size={16} />
  </button>
);

const SelectionBar = ({ designer }) => {
  const { selected, layers, duplicate, reorder, updateLayer, removeLayer } = designer;
  const position = selected ? layers.findIndex((layer) => layer.id === selected.id) : -1;
  if (!selected) {
    return (
      <p className="flex h-11 items-center justify-center text-center type-caption text-content-muted">
        <span className="sm:hidden">Tap to select · drag to move · corners resize</span>
        <span className="hidden sm:inline">Tip: drag to move · corners resize · the round handle rotates · Shift turns off snapping</span>
      </p>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex h-11 w-fit flex-wrap items-center gap-0.5 rounded-lg border border-line-subtle bg-surface px-1 shadow-md"
      role="toolbar"
      aria-label="Selected element"
    >
      <ToolButton icon={Copy} label="Duplicate (Ctrl+D)" onClick={() => duplicate(selected.id)} />
      <ToolButton icon={ArrowUpToLine} label={position === layers.length - 1 ? "Already in front" : "Bring to front"} disabled={position === layers.length - 1} onClick={() => reorder(selected.id, Infinity)} />
      <ToolButton icon={ArrowDownToLine} label={position === 0 ? "Already at the back" : "Send to back"} disabled={position === 0} onClick={() => reorder(selected.id, -Infinity)} />
      <span className="mx-0.5 h-5 w-px bg-line" />
      <ToolButton icon={AlignHorizontalJustifyCenter} label="Centre across" onClick={() => updateLayer(selected.id, { x: DESIGN_W / 2 })} />
      <ToolButton icon={AlignVerticalJustifyCenter} label="Centre top to bottom" onClick={() => updateLayer(selected.id, { y: DESIGN_H / 2 })} />
      <ToolButton icon={FlipHorizontal2} label="Mirror" active={selected.flipX} onClick={() => updateLayer(selected.id, { flipX: !selected.flipX })} />
      <ToolButton icon={selected.locked ? Lock : Unlock} label={selected.locked ? "Unlock" : "Lock in place"} active={selected.locked} onClick={() => updateLayer(selected.id, { locked: !selected.locked })} />
      <span className="mx-0.5 h-5 w-px bg-line" />
      <ToolButton icon={Trash2} label="Delete (Del)" danger onClick={() => removeLayer(selected.id)} />
    </motion.div>
  );
};

/* ------------------------------- Saved designs ----------------------------- */

const SavedDesigns = ({ open, onClose, onOpenDesign }) => {
  const toast = useToast();
  const { data, loading, error, refetch, reload } = useApi(getMyDesigns, undefined, { enabled: open });
  const [busyId, setBusyId] = useState(null);

  const remove = async (design) => {
    setBusyId(design._id);
    try {
      await deleteDesign(design._id);
      (reload || refetch)();
    } catch (caught) {
      toast.error("Couldn't delete", getErrorMessage(caught));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Your saved designs" description="Open one to edit a copy of it. Ordered designs are kept for printing." size="lg">
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-[600/600] w-full rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState title="No saved designs yet" description="Designs are saved when you add them to your bag." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {data.map((design) => (
            <div key={design._id} className="group overflow-hidden rounded-lg border border-line-subtle bg-surface">
              <button type="button" onClick={() => onOpenDesign(design._id)} className="block w-full">
                <img src={design.previewFront} alt={design.name} className="aspect-[600/600] w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
              </button>
              <div className="flex items-center gap-1 p-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate type-caption font-medium text-content">{design.name}</p>
                  <p className="type-caption text-content-muted">{design.ordered ? "Ordered" : design.sides.map(sideName).join(" + ")}</p>
                </div>
                {!design.ordered && (
                  <Button size="icon-sm" variant="ghost" icon={Trash2} loading={busyId === design._id} aria-label={`Delete ${design.name}`} onClick={() => remove(design)} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

/* --------------------------------- Preview --------------------------------- */

const PreviewModal = ({ open, onClose, doc, hex, onAdd, adding }) => {
  const [shots, setShots] = useState(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!open) return;
    setShots(null);
    setFlipped(false);
    Promise.all(SIDES.map((side) => renderMockup(hex, side, printable(doc[side]), { width: 900, quality: 0.9 }))).then(([front, back]) => setShots({ front, back }));
  }, [open, doc, hex]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="How your shirt will look"
      description="Click the shirt to turn it around."
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Keep editing
          </Button>
          <Button variant="primary" icon={ShoppingBag} onClick={onAdd} loading={adding}>
            Add to bag
          </Button>
        </>
      }
    >
      <button type="button" onClick={() => setFlipped((value) => !value)} className="block w-full [perspective:1400px]" aria-label="Turn the shirt around">
        {shots ? (
          <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.6, ease: "easeInOut" }} className="relative aspect-[600/600] w-full [transform-style:preserve-3d]">
            <img src={shots.front} alt="Front" className="absolute inset-0 h-full w-full rounded-lg [backface-visibility:hidden]" />
            <img src={shots.back} alt="Back" className="absolute inset-0 h-full w-full rounded-lg [backface-visibility:hidden] [transform:rotateY(180deg)]" />
          </motion.div>
        ) : (
          <Skeleton className="aspect-[600/600] w-full rounded-lg" />
        )}
      </button>
      <p className="mt-2 text-center type-caption text-content-muted">{flipped ? "Back" : "Front"}</p>
    </Modal>
  );
};

/* ----------------------------------- Page ---------------------------------- */

const StudioSkeleton = () => (
  <Container className="py-8">
    <Skeleton className="mb-6 h-9 w-64" />
    <div className="grid gap-6 lg:grid-cols-[320px_1fr_320px]">
      <Skeleton className="h-[480px] rounded-xl" />
      <Skeleton className="h-[560px] rounded-xl" />
      <Skeleton className="h-[480px] rounded-xl" />
    </div>
  </Container>
);

const Customize = () => {
  const { data: config, loading, error, refetch } = useApi(getStudioConfig);
  const designer = useDesigner();
  const { doc, side, layers, selected, select, setSide, undo, redo, canUndo, canRedo } = designer;
  const { isLoggedIn } = useSession();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const notifyAdded = useCartFeedback();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const stageRef = useRef(null);
  const textRef = useRef(null);

  const [tab, setTab] = useState("templates");
  const [fontsReady, setFontsReady] = useState(false);
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showSizes, setShowSizes] = useState(false);

  useEffect(() => {
    let alive = true;
    loadStudioFonts().then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // Selecting an element opens the tool that edits it.
  useEffect(() => {
    if (selected && TAB_FOR_TYPE[selected.type] && tab !== "layers") setTab(TAB_FOR_TYPE[selected.type]);
    // Only when the selection changes, not when the tab does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  /** Opens a saved design as an editable copy. */
  const openDesign = useCallback(
    async (id) => {
      try {
        const { data } = await getDesign(id);
        designer.loadDoc({ name: data.name, color: data.color, front: withFreshIds(data.layers.front || []), back: withFreshIds(data.layers.back || []) });
        setShowSaved(false);
        toast.success(`Opened "${data.name}"`, "Changes are saved as a new design when you add it to your bag.");
      } catch (caught) {
        toast.error("Couldn't open that design", getErrorMessage(caught));
      }
    },
    [designer, toast]
  );

  // /customize?design=<id> opens a saved design (from an order or the bag).
  useEffect(() => {
    const id = params.get("design");
    if (!id || !isLoggedIn) return;
    openDesign(id);
    setParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, isLoggedIn]);

  // Keyboard shortcuts (ignored while typing in a field).
  useEffect(() => {
    const onKey = (event) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.target.isContentEditable;
      const mod = event.ctrlKey || event.metaKey;
      if (mod && event.key.toLowerCase() === "z" && !typing) {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && event.key.toLowerCase() === "y" && !typing) {
        event.preventDefault();
        redo();
        return;
      }
      if (typing || !selected) return;
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        designer.removeLayer(selected.id);
      } else if (event.key === "Escape") {
        select(null);
      } else if (mod && event.key.toLowerCase() === "d") {
        event.preventDefault();
        designer.duplicate(selected.id);
      } else if (event.key.startsWith("Arrow") && !selected.locked) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
        designer.updateLayer(selected.id, (layer) => ({ x: layer.x + delta[0], y: layer.y + delta[1] }), { coalesce: "nudge" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [designer, selected, select, undo, redo]);

  const color = useMemo(() => config?.colors?.find((c) => c.code === doc.color) || config?.colors?.[0], [config, doc.color]);
  const hex = color?.hex || "#f7f7f5";
  const dark = luminance(hex) < 0.45;
  const printedSides = SIDES.filter((s) => hasPrint(printable(doc[s])));
  const variant = config?.variants?.find((v) => v.color === color?.code && v.size === size);
  const perShirt = variant ? variant.totalPrice + printedSides.length * config.printFeePerSideWithGst : 0;
  const outside = layers.some((layer) => !layer.hidden && isOutside(layer));

  const changeColor = (next) => {
    const nextDark = luminance(next.hex) < 0.45;
    if (nextDark === dark) {
      designer.setColor(next.code);
      return;
    }
    // Black ink on a black shirt disappears: swap the default inks.
    const from = dark ? "#ffffff" : "#111111";
    const to = dark ? "#111111" : "#ffffff";
    designer.setColor(next.code, (layer) => (layer.color?.toLowerCase() === from ? { ...layer, color: to } : layer));
  };

  const addToBag = async () => {
    if (!isLoggedIn) {
      toast.info("Sign in to add your design", "Your design is kept on this device while you sign in.");
      navigate("/login", { state: { from: "/customize" } });
      return;
    }
    if (printedSides.length === 0) {
      toast.warning("Your shirt is still blank", "Add some text, art or a photo first.");
      setTab("templates");
      return;
    }
    if (!variant || variant.countInStock < qty) {
      toast.warning("Not enough in stock", variant ? `Only ${variant.countInStock} left in ${color.name}, size ${size}.` : "Pick another size.");
      return;
    }
    setAdding(true);
    try {
      await loadStudioFonts();
      const front = printable(doc.front);
      const back = printable(doc.back);
      const [previewFront, previewBack] = await Promise.all([
        renderMockup(hex, "front", front),
        hasPrint(back) ? renderMockup(hex, "back", back) : Promise.resolve(""),
      ]);
      const { data: design } = await saveDesign({ name: doc.name.trim() || "My design", color: color.code, layers: { front, back }, previewFront, previewBack });
      const label = `${color.name} / ${size} · ${design.sides.map(sideName).join(" + ")} print`;
      dispatch(
        addToCart({
          _id: config.productId,
          name: `Custom T-shirt: ${design.name}`,
          brand: config.brand,
          category: config.category,
          image: design.previewFront,
          price: variant.price + design.printFee,
          discount: variant.discount,
          gst: variant.gst,
          totalPrice: perShirt,
          countInStock: variant.countInStock,
          variantSku: variant.sku,
          variantId: variant._id,
          variantLabel: label,
          designId: design._id,
          qty,
        })
      );
      setShowPreview(false);
      notifyAdded({
        product: { _id: config.productId, name: `Custom T-shirt: ${design.name}`, image: design.previewFront, totalPrice: perShirt },
        qty,
        inBag: qty,
        variant: null,
        sourceEl: stageRef.current,
      });
    } catch (caught) {
      toast.error("Couldn't add your design", getErrorMessage(caught, "Please try again."));
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <StudioSkeleton />;
  if (error) {
    return (
      <Container className="py-16">
        <ErrorState description={error} onRetry={refetch} />
      </Container>
    );
  }
  if (!config?.available) {
    return (
      <Container className="py-16">
        <EmptyState title="The T-shirt studio is closed right now" description="Please check back soon." />
      </Container>
    );
  }

  return (
    <Container className="py-6 lg:py-8">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="type-caption font-semibold uppercase tracking-wider text-accent-text">Planet Studio</p>
          <h1 className="type-page-title text-content">Design your own T-shirt</h1>
          <p className="type-description mt-1">Your words, art and photos, printed on soft cotton. See exactly what you’ll get.</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="icon" variant="secondary" icon={Undo2} aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo} />
          <Button size="icon" variant="secondary" icon={Redo2} aria-label="Redo (Ctrl+Y)" title="Redo (Ctrl+Y)" disabled={!canRedo} onClick={redo} />
          <Button variant="ghost" icon={RotateCcw} onClick={() => setConfirmReset(true)}>
            Start over
          </Button>
          {isLoggedIn && (
            <Button variant="secondary" icon={FolderOpen} onClick={() => setShowSaved(true)}>
              My designs
            </Button>
          )}
          <Button variant="secondary" icon={Eye} onClick={() => setShowPreview(true)}>
            Preview
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)_300px] lg:items-start">
        {/* Tools */}
        <aside className="order-2 rounded-xl border border-line-subtle bg-surface p-4 lg:order-1 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <ToolPanel tab={tab} setTab={setTab} designer={designer} hex={hex} dark={dark} fontsReady={fontsReady} textRef={textRef} />
        </aside>

        {/* Stage */}
        <section className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-xl border border-line-subtle bg-surface-sunken px-3 pb-3 pt-4">
            <div className="mb-2 flex items-center justify-center">
              <div role="tablist" aria-label="Side" className="inline-flex rounded-full bg-surface p-1 shadow-xs">
                {SIDES.map((s) => (
                  <button
                    key={s}
                    role="tab"
                    type="button"
                    aria-selected={side === s}
                    onClick={() => setSide(s)}
                    className={cn("relative rounded-full px-5 py-1.5 type-button transition-colors", side === s ? "text-accent-on" : "text-content-secondary hover:text-content")}
                  >
                    {side === s && <motion.span layoutId="side-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                    <span className="relative flex items-center gap-1.5">
                      {sideName(s)}
                      {hasPrint(printable(doc[s])) && <span className={cn("h-1.5 w-1.5 rounded-full", side === s ? "bg-accent-on" : "bg-accent")} />}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div ref={stageRef}>
              <DesignStage
                designer={designer}
                hex={hex}
                fontsReady={fontsReady}
                onTextDoubleClick={() => {
                  setTab("text");
                  setTimeout(() => textRef.current?.focus(), 50);
                }}
              />
            </div>

            {outside && (
              <p className="absolute left-3 top-14 flex max-w-[60%] items-center gap-1.5 rounded-md bg-status-warning-bg px-2 py-1 type-caption text-status-warning shadow-xs">
                <AlertTriangle size={13} className="shrink-0" /> Parts outside the dashed box won’t print
              </p>
            )}
          </div>
          <div className="mt-3">
            <SelectionBar designer={designer} />
          </div>
        </section>

        {/* Order */}
        <aside className="order-3 space-y-4 rounded-xl border border-line-subtle bg-surface p-4 lg:sticky lg:top-20">
          <label className="block">
            <span className="type-caption font-semibold uppercase tracking-wide text-content-muted">Design name</span>
            <input
              value={doc.name}
              maxLength={60}
              onChange={(event) => designer.setName(event.target.value)}
              className="mt-1.5 h-control w-full rounded-md border border-line bg-surface px-3 type-body text-content focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring"
            />
          </label>

          <div>
            <p className="type-caption font-semibold uppercase tracking-wide text-content-muted">
              Shirt colour · <span className="normal-case text-content">{color?.name}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {config.colors.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => changeColor(option)}
                  title={option.name}
                  aria-label={option.name}
                  aria-pressed={option.code === color?.code}
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border border-line-strong shadow-xs transition-transform hover:scale-110",
                    option.code === color?.code && "ring-2 ring-accent ring-offset-2 ring-offset-[var(--surface-default)]"
                  )}
                  style={{ background: option.hex }}
                >
                  {option.code === color?.code && <Check size={15} style={{ color: luminance(option.hex) < 0.45 ? "#fff" : "#111" }} />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <p className="type-caption font-semibold uppercase tracking-wide text-content-muted">Size</p>
              <button type="button" onClick={() => setShowSizes((v) => !v)} className="flex items-center gap-1 type-caption text-accent-text hover:underline">
                <Ruler size={13} /> Size guide
              </button>
            </div>
            <div className="mt-2 grid grid-cols-6 gap-1.5">
              {config.sizes.map((option) => {
                const stock = config.variants.find((v) => v.color === color?.code && v.size === option.code)?.countInStock || 0;
                return (
                  <button
                    key={option.code}
                    type="button"
                    disabled={stock === 0}
                    onClick={() => setSize(option.code)}
                    aria-pressed={size === option.code}
                    className={cn(
                      "h-9 rounded-md border type-caption font-semibold transition",
                      size === option.code ? "border-accent bg-accent text-accent-on" : "border-line text-content hover:border-line-strong",
                      stock === 0 && "cursor-not-allowed text-content-disabled line-through opacity-60"
                    )}
                  >
                    {option.code}
                  </button>
                );
              })}
            </div>
            {showSizes && (
              <table className="mt-2 w-full type-caption">
                <thead>
                  <tr className="text-content-muted">
                    <th className="py-1 text-left font-medium">Size</th>
                    <th className="py-1 text-right font-medium">Chest</th>
                    <th className="py-1 text-right font-medium">Length</th>
                  </tr>
                </thead>
                <tbody className="type-numeric text-content">
                  {config.sizes.map((option) => (
                    <tr key={option.code} className={cn("border-t border-line-subtle", option.code === size && "font-semibold text-accent-text")}>
                      <td className="py-1">{option.code}</td>
                      <td className="py-1 text-right">{option.chest}″</td>
                      <td className="py-1 text-right">{option.length}″</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {variant && variant.countInStock > 0 && variant.countInStock <= 10 && (
              <p className="mt-1.5 type-caption text-status-warning">Only {variant.countInStock} left in this size</p>
            )}
          </div>

          {/* Price */}
          <dl className="space-y-1.5 rounded-lg bg-surface-sunken p-3 type-body">
            <div className="flex justify-between">
              <dt className="text-content-secondary">T-shirt ({size})</dt>
              <dd className="type-numeric text-content">{formatCurrency(variant?.totalPrice || 0)}</dd>
            </div>
            {SIDES.map((s) => (
              <div key={s} className={cn("flex justify-between", !printedSides.includes(s) && "opacity-50")}>
                <dt className="text-content-secondary">{sideName(s)} print</dt>
                <dd className="type-numeric text-content">{printedSides.includes(s) ? `+ ${formatCurrency(config.printFeePerSideWithGst)}` : "Not printed"}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-t border-line pt-2">
              <dt className="type-body-strong text-content">Per shirt</dt>
              <dd className="type-numeric text-[1.25rem] font-semibold text-content">{formatCurrency(perShirt)}</dd>
            </div>
            <p className="type-caption text-content-muted">Prices include GST.</p>
          </dl>

          <div className="flex items-center gap-2">
            <div className="flex h-control-lg items-center rounded-md border border-line">
              <button type="button" className="flex h-full w-10 items-center justify-center text-content-secondary hover:text-content disabled:opacity-40" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="One fewer">
                <Minus size={15} />
              </button>
              <span className="w-8 text-center type-numeric font-semibold text-content" aria-live="polite">
                {qty}
              </span>
              <button type="button" className="flex h-full w-10 items-center justify-center text-content-secondary hover:text-content disabled:opacity-40" onClick={() => setQty((q) => Math.min(20, q + 1))} disabled={qty >= Math.min(20, variant?.countInStock || 20)} aria-label="One more">
                <Plus size={15} />
              </button>
            </div>
            <Button variant="primary" size="lg" icon={ShoppingBag} onClick={addToBag} loading={adding} className="flex-1">
              {qty > 1 ? `Add ${qty} · ${formatCurrency(perShirt * qty)}` : "Add to bag"}
            </Button>
          </div>

          <ul className="space-y-1.5 border-t border-line-subtle pt-3 type-caption text-content-secondary">
            <li className="flex gap-2">
              <Truck size={14} className="mt-0.5 shrink-0 text-accent-text" /> Printed to order, ships in 3–5 days
            </li>
            <li className="flex gap-2">
              <Check size={14} className="mt-0.5 shrink-0 text-accent-text" /> 100% combed cotton, 180 GSM · soft water-based inks
            </li>
            <li className="flex gap-2">
              <Check size={14} className="mt-0.5 shrink-0 text-accent-text" /> Misprinted or damaged? We reprint it free. Custom prints can’t be returned otherwise.
            </li>
          </ul>
          {!isLoggedIn && (
            <p className="type-caption text-content-muted">
              <Link to="/login" state={{ from: "/customize" }} className="text-accent-text hover:underline">
                Sign in
              </Link>{" "}
              to save designs and order. Your work stays on this device meanwhile.
            </p>
          )}
        </aside>
      </div>

      <PreviewModal open={showPreview} onClose={() => setShowPreview(false)} doc={doc} hex={hex} onAdd={addToBag} adding={adding} />
      {isLoggedIn && <SavedDesigns open={showSaved} onClose={() => setShowSaved(false)} onOpenDesign={openDesign} />}
      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          designer.loadDoc(emptyDoc(doc.color));
          setConfirmReset(false);
          setTab("templates");
        }}
        title="Start a new design?"
        description="This clears both sides. You can undo it."
        confirmLabel="Clear the shirt"
      >
        <span />
      </ConfirmDialog>
    </Container>
  );
};

export default Customize;
