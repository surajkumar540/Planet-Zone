import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Ban,
  Banknote,
  Bot,
  Check,
  ExternalLink,
  Heart,
  Info,
  LogIn,
  MessageCircle,
  Package,
  PackageSearch,
  ScanSearch,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  Sparkles,
  Tag,
  Truck,
  X,
} from "lucide-react";

import { askAssistant } from "../../../api/smartApi";
import { cancelOrder } from "../../../api/orderApi";
import { openPhotoSearch } from "./PhotoSearch";
import { useCart, useSession } from "../hooks/useStorefront";
import { useCartFeedback } from "../hooks/useCartFeedback";
import { useToast } from "../../../components/ui/Toast";
import { getErrorMessage } from "../../../lib/apiError";
import { formatCurrency } from "../../../lib/format";
import cn from "../../../lib/cn";
import { img } from "../../../lib/img";

/**
 * Floating shopping assistant: the store's help chat.
 *
 * It finds products (plain rules over the real catalogue: categories,
 * brands, budgets, "cheapest"…), tracks the shopper's own orders with a live
 * progress bar, delivery date and tracking number, cancels an order that
 * hasn't been packed yet (after an explicit confirm), shows the bag and
 * wishlist, and answers delivery / payment / returns questions from the
 * store's settings. No AI service is involved and nothing is invented.
 *
 * The conversation lives in this tab (sessionStorage) and is cleared when a
 * different person signs in, so one shopper never sees another's orders.
 */

const STORE_KEY = "planet.assistant";
const NUDGE_KEY = "planet.assistant.nudged";

const QUICK = [
  { label: "Search by photo", icon: ScanSearch, action: "photo" },
  { label: "Track my order", icon: Truck },
  { label: "My orders", icon: Package },
  { label: "What's in my bag?", icon: ShoppingBag },
  { label: "Deals on sale", icon: Tag },
  { label: "Cancel an order", icon: Ban },
  { label: "Is cash on delivery available?", icon: Banknote },
  { label: "Return policy", icon: RefreshCw },
  { label: "My wishlist", icon: Heart },
];

const welcome = (name) => ({
  id: "welcome",
  from: "bot",
  type: "help",
  answer: `Hi${name ? ` ${name}` : ""}! I can find products, track your orders, check your bag and answer questions about delivery and payment. What can I do for you?`,
  suggestions: ["Track my order", "Watches under 5000", "Best rated laptops", "Is cash on delivery available?"],
});

const loadConversation = (owner, name) => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null");
    if (saved?.owner === owner && Array.isArray(saved.messages) && saved.messages.length) return saved.messages;
  } catch {
    // ignore
  }
  return [welcome(name)];
};

const time = (value) => new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const day = (value) => new Date(value).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

/* --------------------------------- Pieces --------------------------------- */

const Understood = ({ understood }) => {
  if (!understood) return null;
  const chips = [
    ...understood.categories.slice(0, 3),
    ...understood.brands,
    understood.budget &&
      (understood.budget.min && understood.budget.max
        ? `${formatCurrency(understood.budget.min)}–${formatCurrency(understood.budget.max)}`
        : understood.budget.max
          ? `Under ${formatCurrency(understood.budget.max)}`
          : `Over ${formatCurrency(understood.budget.min)}`),
    understood.sort,
    understood.onSale && "On sale",
    understood.inStockOnly && "In stock",
    ...understood.keywords.map((word) => `"${word}"`),
    understood.ai && "AI: matched by meaning",
  ].filter(Boolean);
  if (!chips.length) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1">
      <span className="type-caption text-content-muted">Searched:</span>
      {chips.map((chip) => (
        <span key={chip} className="rounded-full bg-accent-subtle px-2 py-0.5 text-[0.6875rem] font-semibold text-accent-text">
          {chip}
        </span>
      ))}
    </div>
  );
};

const ProductResult = ({ product, onAdd, onNavigate }) => {
  const inStock = product.hasVariants || product.countInStock > 0;
  return (
    <div className="flex gap-3 rounded-xl border border-line-subtle bg-surface p-2.5">
      <Link to={`/product/${product._id}`} onClick={onNavigate} className="shrink-0">
        <img src={img(product.image, 160)} alt="" loading="lazy" className="h-16 w-16 rounded-lg bg-white object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/product/${product._id}`} onClick={onNavigate} className="line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-content hover:text-accent-text">
          {product.name}
        </Link>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.75rem]">
          <span className="type-numeric font-bold text-content">{formatCurrency(product.totalPrice)}</span>
          {product.discount > 0 && <span className="font-semibold text-status-good">−{Math.round(product.discount)}%</span>}
          {product.numReviews > 0 && <span className="text-content-muted">★ {Number(product.rating).toFixed(1)}</span>}
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className={cn("text-[0.6875rem] font-semibold", inStock ? (!product.hasVariants && product.countInStock <= 5 ? "text-status-warning" : "text-status-good") : "text-status-critical")}>
            {product.hasVariants ? "Pick a size/colour" : inStock ? (product.countInStock <= 5 ? `Only ${product.countInStock} left` : "In stock") : "Out of stock"}
          </span>
          {product.hasVariants ? (
            <Link to={`/product/${product._id}`} onClick={onNavigate} className="rounded-full border border-line px-2.5 py-1 text-[0.6875rem] font-semibold text-content hover:border-accent">
              View
            </Link>
          ) : (
            <button
              type="button"
              disabled={!inStock}
              onClick={() => onAdd(product)}
              className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[0.6875rem] font-semibold text-accent-on transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShoppingBag size={12} /> Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/** One order: what's in it, where it is, when it arrives, and what you can do. */
const OrderResult = ({ order, onCancel, onNavigate }) => {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const ended = ["cancelled", "refunded", "returned"].includes(order.status);
  const doneCount = order.steps.filter((step) => step.done).length;
  const packing = order.status === "processing";

  const cancel = async () => {
    setBusy(true);
    await onCancel(order);
    setBusy(false);
    setConfirming(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-line-subtle bg-surface">
      <div className="flex items-center gap-3 p-3">
        <div className="flex -space-x-3">
          {order.items.slice(0, 2).map((item, index) => (
            <img key={index} src={img(item.image, 96)} alt="" className="h-11 w-11 rounded-lg border-2 border-surface bg-white object-cover" />
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.8125rem] font-bold text-content">{order.orderNumber}</p>
          <p className="truncate type-caption">
            {order.itemCount} item{order.itemCount === 1 ? "" : "s"} · {formatCurrency(order.total)} · {order.payment}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold capitalize",
            ended ? "bg-status-critical-bg text-status-critical" : order.status === "delivered" ? "bg-status-good-bg text-status-good" : "bg-status-info-bg text-status-info"
          )}
        >
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      {!ended && (
        <div className="px-3 pb-2">
          {/* Five-step tracker */}
          <div className="flex items-center">
            {order.steps.map((step, index) => (
              <div key={step.status} className="flex flex-1 items-center last:flex-none">
                <span
                  title={`${step.label}${step.at ? ` · ${time(step.at)}` : ""}`}
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    step.done ? "bg-accent text-accent-on" : packing && index === 1 ? "bg-accent-subtle text-accent-text ring-2 ring-accent" : "bg-surface-sunken text-content-disabled"
                  )}
                >
                  {step.done ? <Check size={11} strokeWidth={3} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                </span>
                {index < order.steps.length - 1 && (
                  <span className={cn("mx-0.5 h-0.5 flex-1 rounded-full", index < doneCount - 1 ? "bg-accent" : "bg-line")} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[0.625rem] text-content-muted">
            <span>Confirmed</span>
            <span>Shipped</span>
            <span>Delivered</span>
          </div>
        </div>
      )}

      <div className="space-y-1 border-t border-line-subtle bg-surface-sunken px-3 py-2 text-[0.75rem] text-content-secondary">
        {order.status === "delivered" && order.deliveredAt && (
          <p className="flex items-center gap-1.5">
            <Check size={13} className="text-status-good" /> Delivered on {day(order.deliveredAt)}
          </p>
        )}
        {order.expectedBy && (
          <p className="flex items-center gap-1.5">
            <Truck size={13} className="text-accent-text" /> Arriving by <b className="text-content">{day(order.expectedBy)}</b>
            {order.city ? ` to ${order.city}` : ""}
          </p>
        )}
        {order.tracking && (
          <p className="flex items-center gap-1.5">
            <PackageSearch size={13} /> Tracking {order.tracking.number}
            {order.tracking.carrier ? ` (${order.tracking.carrier})` : ""}
          </p>
        )}
        {order.lastUpdate && (
          <p className="type-caption">
            Last update: {order.lastUpdate.status.replace(/_/g, " ")}, {time(order.lastUpdate.at)}
          </p>
        )}
        {order.payment === "Cash on delivery" && order.paymentStatus === "pending" && !ended && (
          <p className="flex items-center gap-1.5 text-status-warning">
            <Banknote size={13} /> Keep {formatCurrency(order.total)} ready for delivery
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 p-2.5">
        <Link
          to={`/order/${order._id}`}
          onClick={onNavigate}
          className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[0.75rem] font-semibold text-content hover:border-accent"
        >
          View details <ExternalLink size={11} />
        </Link>
        {order.cancellable &&
          (confirming ? (
            <span className="flex items-center gap-1.5 text-[0.75rem]">
              <span className="text-content-secondary">Cancel this order?</span>
              <button type="button" disabled={busy} onClick={cancel} className="rounded-full bg-status-critical px-3 py-1.5 font-semibold text-white disabled:opacity-60">
                {busy ? "Cancelling…" : "Yes, cancel"}
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="rounded-full px-2 py-1.5 font-semibold text-content-secondary hover:text-content">
                Keep it
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="rounded-full px-3 py-1.5 text-[0.75rem] font-semibold text-status-critical hover:bg-status-critical-bg">
              Cancel order
            </button>
          ))}
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-line-subtle bg-surface px-4 py-3" aria-label="Assistant is typing">
    {[0, 1, 2].map((index) => (
      <motion.span
        key={index}
        className="h-2 w-2 rounded-full bg-content-muted"
        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.15 }}
      />
    ))}
  </div>
);

/* ------------------------------- The assistant ------------------------------- */

const ShoppingAssistant = () => {
  const { user, isLoggedIn } = useSession();
  const owner = isLoggedIn ? user?._id || "user" : "guest";
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => loadConversation(owner, user?.firstName));
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [nudge, setNudge] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const { add, items: bag, subtotal, count } = useCart();
  const notifyAdded = useCartFeedback();
  const toast = useToast();

  // A different shopper (sign in / out) starts a fresh, private conversation.
  const lastOwner = useRef(owner);
  useEffect(() => {
    if (lastOwner.current !== owner) {
      lastOwner.current = owner;
      setMessages([welcome(user?.firstName)]);
    }
  }, [owner, user?.firstName]);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify({ owner, messages: messages.slice(-30) }));
    } catch {
      // ignore
    }
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }));
  }, [messages, open, owner, busy]);

  useEffect(() => {
    if (!open) return undefined;
    setNudge(false);
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // One friendly nudge per visit, a few seconds in, never on checkout.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(NUDGE_KEY) === "1";
    } catch {
      seen = true;
    }
    if (seen || open || pathname.startsWith("/checkout")) return undefined;
    const timer = setTimeout(() => {
      setNudge(true);
      try {
        sessionStorage.setItem(NUDGE_KEY, "1");
      } catch {
        // ignore
      }
    }, 9000);
    return () => clearTimeout(timer);
  }, [open, pathname]);

  const push = (message) => setMessages((current) => [...current, { id: `${message.from}${Date.now()}${Math.random()}`, at: Date.now(), ...message }]);

  /** Answered right here, from the bag in this browser. */
  const bagAnswer = () =>
    count
      ? { from: "bot", type: "bag", answer: `You have ${count} item${count === 1 ? "" : "s"} in your bag, ${formatCurrency(subtotal)} so far.`, bag: bag.slice(0, 4) }
      : { from: "bot", type: "text", answer: "Your bag is empty. Tell me what you're after and I'll find it.", suggestions: ["Deals on sale", "Best rated products"] };

  const ask = async (text) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    push({ from: "user", text: question });
    if (/\b(my )?(bag|cart|basket)\b/i.test(question) && !/\b(bags?|handbags?) (under|for|below)\b/i.test(question) && /\b(my|in|what'?s)\b/i.test(question)) {
      setBusy(true);
      setTimeout(() => {
        push(bagAnswer());
        setBusy(false);
      }, 350);
      return;
    }
    setBusy(true);
    try {
      const response = await askAssistant(question);
      push({ from: "bot", ...response.data });
    } catch (error) {
      push({ from: "bot", type: "error", answer: `Sorry, I couldn't do that just now. ${getErrorMessage(error)}` });
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = (product) => {
    const result = add(product, 1);
    if (!result.added) {
      toast.info("Already in your bag", `You have all ${result.inBag} in stock in your bag.`);
      return;
    }
    notifyAdded({ product, qty: result.added, inBag: result.inBag });
  };

  const handleCancel = async (order) => {
    try {
      await cancelOrder(order._id, "Cancelled by customer from chat");
      setMessages((current) =>
        current.map((message) =>
          message.orders
            ? { ...message, orders: message.orders.map((item) => (item._id === order._id ? { ...item, status: "cancelled", cancellable: false, expectedBy: null } : item)) }
            : message
        )
      );
      push({
        from: "bot",
        type: "text",
        answer: `Done: order ${order.orderNumber} is cancelled.${order.payment === "Paid online" ? " Your online payment will be refunded to the original method." : " Nothing was charged, as it was cash on delivery."}`,
      });
    } catch (error) {
      push({ from: "bot", type: "error", answer: `I couldn't cancel ${order.orderNumber}: ${getErrorMessage(error)}` });
    }
  };

  const close = () => setOpen(false);

  return (
    <>
      {/* Launcher + nudge */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-2 print:hidden"
          >
            <AnimatePresence>
              {nudge && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative max-w-[15rem] rounded-2xl rounded-br-md border border-line bg-surface p-3 pr-8 text-[0.8125rem] text-content shadow-xl"
                >
                  <button type="button" onClick={() => setNudge(false)} aria-label="Dismiss" className="absolute right-2 top-2 text-content-muted hover:text-content">
                    <X size={14} />
                  </button>
                  <button type="button" onClick={() => setOpen(true)} className="text-left">
                    <b>Need a hand?</b> I can track your order or find something in your budget.
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              type="button"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setOpen(true)}
              aria-label="Open the shopping assistant"
              className="flex h-14 items-center gap-2 rounded-full bg-accent pl-4 pr-5 text-accent-on shadow-xl ring-4 ring-[color-mix(in_srgb,var(--accent-solid)_20%,transparent)]"
            >
              <span className="relative flex">
                <MessageCircle size={22} />
                <Sparkles size={11} className="absolute -right-1.5 -top-1.5" />
              </span>
              <span className="hidden text-[0.875rem] font-semibold sm:inline">Ask me</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Shopping assistant"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-x-3 bottom-3 z-[70] flex h-[min(40rem,calc(100dvh-1.5rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[25rem]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ background: "linear-gradient(120deg, var(--promo-leaf-from), var(--promo-leaf-to))" }}>
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <Bot size={20} />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#86efac] ring-2 ring-[color:var(--promo-leaf-from)]" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.9375rem] font-semibold leading-tight">Planet Zone help</p>
                <p className="flex items-center gap-1 text-[0.6875rem] opacity-85" title="Answers come from our catalogue, your account and store rules. No AI service is used.">
                  <Info size={11} /> {isLoggedIn ? `Signed in as ${user?.firstName || "you"}` : "Products, orders & delivery"}
                </p>
              </div>
              <button type="button" onClick={() => setMessages([welcome(user?.firstName)])} aria-label="Start over" title="Start over" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15">
                <RotateCcw size={15} />
              </button>
              <button type="button" onClick={close} aria-label="Close the assistant" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-surface-canvas px-3 py-4" aria-live="polite">
              {messages.map((message) =>
                message.from === "user" ? (
                  <div key={message.id} className="flex justify-end">
                    <p className="max-w-[80%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2 text-[0.875rem] text-accent-on">{message.text}</p>
                  </div>
                ) : (
                  <motion.div key={message.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="max-w-[95%]">
                    <div
                      className={cn(
                        "rounded-2xl rounded-bl-md border px-3.5 py-2.5 text-[0.875rem] leading-relaxed",
                        message.type === "error" ? "border-status-critical bg-status-critical-bg text-content" : "border-line-subtle bg-surface text-content"
                      )}
                    >
                      <p>{message.answer}</p>
                      {message.note && <p className="mt-1.5 rounded-lg bg-status-warning-bg px-2.5 py-1.5 text-[0.8125rem] text-content-secondary">{message.note}</p>}
                      <Understood understood={message.understood} />
                      {(message.source || message.link) && (
                        <p className="mt-2 flex flex-wrap items-center gap-2 type-caption text-content-muted">
                          {message.source && <>Source: {message.source}</>}
                          {message.link && message.type !== "signin" && (
                            <Link to={message.link.to} onClick={close} className="inline-flex items-center gap-0.5 font-semibold text-accent-text hover:underline">
                              {message.link.label} <ExternalLink size={11} />
                            </Link>
                          )}
                        </p>
                      )}
                      {message.type === "signin" && (
                        <Link
                          to={message.link.to}
                          state={{ from: pathname }}
                          onClick={close}
                          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[0.8125rem] font-semibold text-accent-on"
                        >
                          <LogIn size={14} /> Sign in
                        </Link>
                      )}
                    </div>

                    {message.orders?.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.orders.map((order) => (
                          <OrderResult key={order._id} order={order} onCancel={handleCancel} onNavigate={close} />
                        ))}
                      </div>
                    )}

                    {message.bag?.length > 0 && (
                      <div className="mt-2 overflow-hidden rounded-2xl border border-line-subtle bg-surface">
                        {message.bag.map((item) => (
                          <div key={`${item._id}${item.variantSku || ""}`} className="flex items-center gap-3 border-b border-line-subtle px-3 py-2 last:border-0">
                            <img src={img(item.image, 96)} alt="" className="h-10 w-10 rounded-lg bg-white object-cover" />
                            <span className="min-w-0 flex-1 truncate text-[0.8125rem] text-content">{item.name}</span>
                            <span className="type-caption">×{item.qty}</span>
                          </div>
                        ))}
                        <div className="flex gap-2 p-2.5">
                          <Link to="/cart" onClick={close} className="flex-1 rounded-full border border-line py-2 text-center text-[0.8125rem] font-semibold text-content hover:border-accent">
                            View bag
                          </Link>
                          <Link to="/checkout" onClick={close} className="flex-1 rounded-full bg-accent py-2 text-center text-[0.8125rem] font-semibold text-accent-on">
                            Checkout
                          </Link>
                        </div>
                      </div>
                    )}

                    {message.products?.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.products.map((product) => (
                          <ProductResult key={product._id} product={product} onAdd={handleAdd} onNavigate={close} />
                        ))}
                      </div>
                    )}

                    {message.suggestions?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {message.suggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => ask(suggestion)}
                            className="rounded-full border border-line bg-surface px-3 py-1 text-[0.75rem] font-medium text-content-secondary transition-colors hover:border-accent hover:text-accent-text"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                    {message.at && <p className="mt-1 pl-1 text-[0.625rem] text-content-disabled">{new Date(message.at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</p>}
                  </motion.div>
                )
              )}
              {busy && <TypingDots />}
            </div>

            {/* Quick actions */}
            <div className="flex gap-1.5 overflow-x-auto border-t border-line-subtle bg-surface px-2.5 pt-2.5 [scrollbar-width:none]">
              {QUICK.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    if (action.action === "photo") {
                      close();
                      openPhotoSearch();
                    } else ask(action.label);
                  }}
                  disabled={busy}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-surface-sunken px-3 py-1.5 text-[0.75rem] font-medium text-content-secondary transition-colors hover:bg-accent-subtle hover:text-accent-text disabled:opacity-50"
                >
                  <action.icon size={13} />
                  {action.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 bg-surface p-2.5"
            >
              <label htmlFor="assistant-input" className="sr-only">
                Ask the shopping assistant
              </label>
              <input
                id="assistant-input"
                ref={inputRef}
                value={input}
                maxLength={200}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about products or your orders…"
                autoComplete="off"
                className="h-11 flex-1 rounded-full bg-surface-sunken px-4 text-[0.875rem] text-content outline-none ring-accent placeholder:text-content-muted focus:ring-2"
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                aria-label="Send"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-accent-on transition-opacity disabled:opacity-40"
              >
                <ArrowUp size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ShoppingAssistant;
