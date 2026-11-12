import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Bot, ExternalLink, Info, Loader2, MessageCircle, RotateCcw, ShoppingBag, Sparkles, X } from "lucide-react";

import { askAssistant } from "../../../api/smartApi";
import { useCart } from "../hooks/useStorefront";
import { useCartFeedback } from "../hooks/useCartFeedback";
import { useToast } from "../../../components/ui/Toast";
import { getErrorMessage } from "../../../lib/apiError";
import { formatCurrency } from "../../../lib/format";
import cn from "../../../lib/cn";

/**
 * Floating shopping assistant.
 *
 * Questions go to our own API, which reads them with plain rules (category
 * words, brands, budgets like "under 2k", "cheapest", "best rated") and
 * searches the real catalogue, or answers delivery / payment / order
 * questions from the store's live settings. No AI service is involved, and
 * nothing it shows is made up: products, prices and stock come straight from
 * the database. The conversation lives in this tab only (sessionStorage).
 */

const STORE_KEY = "planet.assistant";
const WELCOME = {
  id: "welcome",
  from: "bot",
  type: "help",
  answer: "Hi! Tell me what you're looking for, e.g. \"watch under 5000\" or \"best rated laptops\". I can also answer questions about delivery, payment and orders.",
  suggestions: ["Watches under 5000", "Best rated laptops", "Cheapest womens shoes", "Is cash on delivery available?"],
};

const loadConversation = () => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE_KEY) || "null");
    return Array.isArray(saved) && saved.length ? saved : [WELCOME];
  } catch {
    return [WELCOME];
  }
};

/** "What I understood", so shoppers can see why these results came back. */
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
  ].filter(Boolean);
  if (!chips.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      <span className="type-caption text-content-muted">Searched:</span>
      {chips.map((chip) => (
        <span key={chip} className="rounded-full bg-accent-subtle px-2 py-0.5 text-[0.6875rem] font-semibold text-accent-text">
          {chip}
        </span>
      ))}
    </div>
  );
};

const ResultCard = ({ product, onAdd, onNavigate }) => {
  const inStock = product.hasVariants || product.countInStock > 0;
  return (
    <div className="flex gap-3 rounded-xl border border-line-subtle bg-surface p-2.5">
      <Link to={`/product/${product._id}`} onClick={onNavigate} className="shrink-0">
        <img src={product.image} alt="" loading="lazy" className="h-16 w-16 rounded-lg bg-surface-sunken object-cover" />
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
          <span className={cn("text-[0.6875rem] font-semibold", inStock ? (product.countInStock <= 5 && !product.hasVariants ? "text-status-warning" : "text-status-good") : "text-status-critical")}>
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

const ShoppingAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadConversation);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const { add } = useCart();
  const notifyAdded = useCartFeedback();
  const toast = useToast();

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      // ignore
    }
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ask = async (text) => {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    setMessages((current) => [...current, { id: `u${Date.now()}`, from: "user", text: question }]);
    setBusy(true);
    try {
      const response = await askAssistant(question);
      setMessages((current) => [...current, { id: `b${Date.now()}`, from: "bot", ...response.data }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { id: `e${Date.now()}`, from: "bot", type: "error", answer: `Sorry, I couldn't search just now. ${getErrorMessage(error)}` },
      ]);
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

  const reset = () => setMessages([WELCOME]);

  return (
    <>
      {/* Launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpen(true)}
            aria-label="Open the shopping assistant"
            className="fixed bottom-5 right-5 z-[70] flex h-14 items-center gap-2 rounded-full bg-accent pl-4 pr-5 text-accent-on shadow-xl ring-4 ring-[color-mix(in_srgb,var(--accent-solid)_20%,transparent)] print:hidden"
          >
            <span className="relative flex">
              <MessageCircle size={22} />
              <Sparkles size={11} className="absolute -right-1.5 -top-1.5" />
            </span>
            <span className="hidden text-[0.875rem] font-semibold sm:inline">Ask me</span>
          </motion.button>
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
            className="fixed inset-x-3 bottom-3 z-[70] flex h-[min(36rem,calc(100dvh-1.5rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[24rem]"
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 text-white"
              style={{ background: "linear-gradient(120deg, var(--promo-leaf-from), var(--promo-leaf-to))" }}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Bot size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.9375rem] font-semibold leading-tight">Shopping assistant</p>
                <p className="flex items-center gap-1 text-[0.6875rem] opacity-85" title="Answers come from our catalogue and store rules, matched with simple rules. No AI service is used.">
                  <Info size={11} /> Searches our real catalogue
                </p>
              </div>
              <button type="button" onClick={reset} aria-label="Start over" title="Start over" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15">
                <RotateCcw size={15} />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close the assistant" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15">
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
                  <div key={message.id} className="max-w-[94%]">
                    <div className={cn("rounded-2xl rounded-bl-md border px-3.5 py-2.5 text-[0.875rem] leading-relaxed", message.type === "error" ? "border-status-critical bg-status-critical-bg text-content" : "border-line-subtle bg-surface text-content")}>
                      <p>{message.answer}</p>
                      {message.note && <p className="mt-1.5 rounded-lg bg-status-warning-bg px-2.5 py-1.5 text-[0.8125rem] text-content-secondary">{message.note}</p>}
                      <Understood understood={message.understood} />
                      {message.source && (
                        <p className="mt-2 flex flex-wrap items-center gap-2 type-caption text-content-muted">
                          Source: {message.source}
                          {message.link && (
                            <Link to={message.link.to} onClick={() => setOpen(false)} className="inline-flex items-center gap-0.5 font-semibold text-accent-text hover:underline">
                              {message.link.label} <ExternalLink size={11} />
                            </Link>
                          )}
                        </p>
                      )}
                    </div>
                    {message.products?.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.products.map((product) => (
                          <ResultCard key={product._id} product={product} onAdd={handleAdd} onNavigate={() => setOpen(false)} />
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
                  </div>
                )
              )}
              {busy && (
                <p className="flex items-center gap-2 type-caption text-content-muted">
                  <Loader2 size={14} className="animate-spin" /> Searching the catalogue…
                </p>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                ask(input);
              }}
              className="flex items-center gap-2 border-t border-line-subtle bg-surface p-2.5"
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
                placeholder="e.g. shoes under 3000"
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
