import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Clock, Loader2, Search, Sparkles, Tag, X, Camera } from "lucide-react";

import { suggestProducts } from "../../../api/productApi";
import { getCategoryTree } from "../../../api/storeApi";
import { useApi, useDebounced } from "../../../hooks/useApi";
import { formatCurrency } from "../../../lib/format";
import cn from "../../../lib/cn";
import { useI18n } from "../../../lib/i18n";
import { openPhotoSearch } from "./PhotoSearch";
import { img } from "../../../lib/img";

/**
 * Search with live suggestions, used in the header and on the shop page.
 *
 * - Focusing an empty box shows recent searches and the store's departments,
 *   so there is something useful before the first keystroke.
 * - Typing shows matching products (with photo and price), categories and
 *   brands; the typed text is highlighted in each result.
 * - Fully keyboard-driven: ↑/↓ to move, Enter to open, Esc to close; it is an
 *   ARIA combobox, so screen readers announce the options.
 * - Results are cached per query and stale responses are discarded, so fast
 *   typing never shows results for an older word.
 */

const RECENT_KEY = "planet.recentSearches";
const MAX_RECENT = 5;

const readRecent = () => {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

const saveRecent = (term) => {
  try {
    const next = [term, ...readRecent().filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Private mode: recent searches are a convenience, never a requirement.
  }
};

const removeRecent = (term) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(readRecent().filter((item) => item !== term)));
  } catch {
    // Ignore, as above.
  }
};

/** Wraps the matched part of `text` in a highlight. */
const Highlight = ({ text, query }) => {
  if (!query) return text;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index < 0) return text;
  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-accent-subtle px-0.5 font-semibold text-accent-text">
        {text.slice(index, index + query.length)}
      </mark>
      {text.slice(index + query.length)}
    </>
  );
};

const SearchBox = ({ placeholder, className, size = "md", onNavigate, initialValue = "" }) => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const listId = useId();
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  const [value, setValue] = useState(initialValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState(readRecent);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const query = useDebounced(value.trim(), 180);
  const cache = useRef(new Map());
  const latest = useRef("");

  const { data: tree } = useApi(getCategoryTree, null, { cacheTime: 5 * 60 * 1000 });
  const departments = (tree || []).slice(0, 6);

  // Cycling hints ("Search “Laptops”…") built from real categories, shown only
  // while the box is empty and idle, so it never moves under someone typing.
  const [focused, setFocused] = useState(false);
  const hints = useMemo(() => {
    const names = (tree || []).flatMap((dept) => (dept.children || []).map((child) => child.name)).slice(0, 8);
    return [placeholder || t("Search products, brands and more"), ...names.map((name) => `${t("Search")} “${name}”…`)];
  }, [tree, placeholder, t]);
  const [hintIndex, setHintIndex] = useState(0);
  const showHint = !value && !focused;
  useEffect(() => {
    if (!showHint || hints.length < 2) return undefined;
    const timer = setInterval(() => setHintIndex((index) => index + 1), 2600);
    return () => clearInterval(timer);
  }, [showHint, hints.length]);

  useEffect(() => setValue(initialValue), [initialValue]);

  // Fetch suggestions for the settled query.
  useEffect(() => {
    if (!query) {
      setResults(null);
      setLoading(false);
      return;
    }
    latest.current = query;
    if (cache.current.has(query)) {
      setResults(cache.current.get(query));
      return;
    }
    setLoading(true);
    suggestProducts(query)
      .then((response) => {
        cache.current.set(query, response.data);
        if (latest.current === query) setResults(response.data);
      })
      .catch(() => {
        if (latest.current === query) setResults({ products: [], categories: [], brands: [] });
      })
      .finally(() => {
        if (latest.current === query) setLoading(false);
      });
  }, [query]);

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const go = useCallback(
    (to, term) => {
      if (term) {
        saveRecent(term);
        setRecent(readRecent());
      }
      setOpen(false);
      setActive(-1);
      inputRef.current?.blur();
      navigate(to);
      onNavigate?.();
    },
    [navigate, onNavigate]
  );

  const searchFor = (term) => go(`/shop?search=${encodeURIComponent(term)}`, term);

  /** Every selectable row, in display order, for keyboard navigation. */
  const options = useMemo(() => {
    if (!value.trim()) {
      return [
        ...recent.map((term) => ({ kind: "recent", key: `r-${term}`, label: term, run: () => searchFor(term) })),
        ...departments.map((dept) => ({
          kind: "dept",
          key: `d-${dept._id}`,
          label: dept.name,
          run: () => go(`/shop?dept=${dept._id}`),
        })),
      ];
    }
    if (!results) return [];
    return [
      ...results.products.map((product) => ({
        kind: "product",
        key: `p-${product._id}`,
        product,
        label: product.name,
        run: () => go(`/product/${product._id}`, value.trim()),
      })),
      ...results.categories.map((category) => ({
        kind: "category",
        key: `c-${category._id}`,
        label: category.name,
        run: () =>
          go(
            category.isDepartment
              ? `/shop?dept=${category._id}`
              : `/shop?category=${encodeURIComponent(category.name)}`
          ),
      })),
      ...results.brands.map((brand) => ({
        kind: "brand",
        key: `b-${brand}`,
        label: brand,
        run: () => go(`/shop?brand=${encodeURIComponent(brand)}`),
      })),
      { kind: "all", key: "all", label: value.trim(), run: () => searchFor(value.trim()) },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps -- go/searchFor are stable enough per render.
  }, [value, results, recent, departments]);

  useEffect(() => setActive(-1), [results, value]);

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % Math.max(options.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index <= 0 ? options.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active >= 0 && options[active]) options[active].run();
      else if (value.trim()) searchFor(value.trim());
      else go("/shop");
    }
  };

  const typed = value.trim();
  const showPanel = open && (typed ? Boolean(results) || loading : options.length > 0);
  const sections = typed
    ? [
        { kind: "product", title: t("Products") },
        { kind: "category", title: t("Categories") },
        { kind: "brand", title: t("Brands") },
      ]
    : [
        { kind: "recent", title: t("Recent searches") },
        { kind: "dept", title: t("Shop by department") },
      ];

  const rowClass = (index) =>
    cn(
      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
      index === active ? "bg-surface-hover" : "hover:bg-surface-hover"
    );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="search-glow">
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-muted"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-label="Search products"
          value={value}
          placeholder={showHint ? "" : placeholder || t("Search products, brands and more")}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full rounded-full border-0 bg-surface pl-9 pr-[4.5rem] text-content outline-none transition-all",
            "placeholder:text-content-muted focus:shadow-[0_0_0_4px_var(--accent-subtle)]",
            "[&::-webkit-search-cancel-button]:hidden",
            size === "sm" ? "h-9 text-[0.875rem]" : "h-10 text-[0.9375rem]"
          )}
        />
        {showHint && (
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 left-9 right-[4.5rem] flex items-center overflow-hidden text-content-muted",
              size === "sm" ? "text-[0.875rem]" : "text-[0.9375rem]"
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={hintIndex}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="truncate"
              >
                {hints[hintIndex % hints.length]}
              </motion.span>
            </AnimatePresence>
          </span>
        )}
        <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <button
            type="button"
            onClick={openPhotoSearch}
            aria-label="Search by photo"
            title="Search by photo (AI)"
            className="flex h-7 w-7 items-center justify-center rounded-full text-content-muted transition-colors hover:bg-accent-subtle hover:text-accent-text"
          >
            <Camera size={16} />
          </button>
          {loading ? (
            <Loader2 size={15} className="animate-spin text-content-muted" />
          ) : value ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
              }}
              className="text-content-muted hover:text-content"
            >
              <X size={15} />
            </button>
          ) : null}
        </span>
      </div>
      </div>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] min-w-[18rem] overflow-y-auto rounded-2xl border border-line bg-surface-overlay p-2 shadow-xl"
          >
            {typed && results && options.length === 1 && (
              <div className="px-3 py-6 text-center">
                <p className="type-body-strong text-content">{t("No matches for “{q}”", { q: typed })}</p>
                <p className="mt-1 type-caption text-content-muted">{t("Try a shorter word or a brand name.")}</p>
              </div>
            )}

            {sections.map((section) => {
              const rows = options
                .map((option, index) => ({ option, index }))
                .filter(({ option }) => option.kind === section.kind);
              if (!rows.length) return null;
              return (
                <div key={section.kind} className="mb-1">
                  <p className="flex items-center justify-between px-2.5 pb-1 pt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-content-muted">
                    {section.title}
                    {section.kind === "recent" && (
                      <button
                        type="button"
                        className="normal-case tracking-normal text-accent-text hover:underline"
                        onClick={() => {
                          try {
                            localStorage.removeItem(RECENT_KEY);
                          } catch {
                            // Ignore.
                          }
                          setRecent([]);
                        }}
                      >
                        {t("Clear")}
                      </button>
                    )}
                  </p>

                  {section.kind === "product" ? (
                    rows.map(({ option, index }) => (
                      <button
                        key={option.key}
                        id={`${listId}-${index}`}
                        type="button"
                        role="option"
                        aria-selected={index === active}
                        onMouseEnter={() => setActive(index)}
                        onClick={option.run}
                        className={rowClass(index)}
                      >
                        <img
                          src={img(option.product.image, 96)}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-lg border border-line-subtle bg-surface-sunken object-cover"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.875rem] text-content">
                            <Highlight text={option.product.name} query={typed} />
                          </span>
                          <span className="block truncate type-caption text-content-muted">
                            {option.product.brand} · {option.product.category}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block type-numeric text-[0.875rem] font-semibold text-content">
                            {formatCurrency(option.product.totalPrice)}
                          </span>
                          {option.product.discount > 0 && (
                            <span className="block text-[0.6875rem] font-semibold text-status-critical">
                              {Math.round(option.product.discount)}% off
                            </span>
                          )}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className={cn(section.kind === "dept" || section.kind === "brand" ? "flex flex-wrap gap-1.5 px-1.5 pb-1" : "")}>
                      {rows.map(({ option, index }) =>
                        section.kind === "dept" || section.kind === "brand" ? (
                          <button
                            key={option.key}
                            id={`${listId}-${index}`}
                            type="button"
                            role="option"
                            aria-selected={index === active}
                            onMouseEnter={() => setActive(index)}
                            onClick={option.run}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
                              index === active
                                ? "border-accent bg-accent-subtle text-accent-text"
                                : "border-line text-content-secondary hover:border-accent hover:text-accent-text"
                            )}
                          >
                            {section.kind === "brand" ? <Tag size={13} /> : <Sparkles size={13} />}
                            <Highlight text={option.label} query={typed} />
                          </button>
                        ) : (
                          <div key={option.key} className="group flex items-center">
                            <button
                              id={`${listId}-${index}`}
                              type="button"
                              role="option"
                              aria-selected={index === active}
                              onMouseEnter={() => setActive(index)}
                              onClick={option.run}
                              className={cn(rowClass(index), "flex-1")}
                            >
                              {section.kind === "recent" ? (
                                <Clock size={15} className="shrink-0 text-content-muted" />
                              ) : (
                                <Sparkles size={15} className="shrink-0 text-accent-text" />
                              )}
                              <span className="flex-1 truncate text-[0.875rem] text-content">
                                <Highlight text={option.label} query={typed} />
                              </span>
                              <ArrowUpRight size={14} className="shrink-0 text-content-muted" />
                            </button>
                            {section.kind === "recent" && (
                              <button
                                type="button"
                                aria-label={`Remove ${option.label} from recent searches`}
                                onClick={() => {
                                  removeRecent(option.label);
                                  setRecent(readRecent());
                                }}
                                className="ml-1 rounded-md p-1.5 text-content-muted opacity-0 transition-opacity hover:text-content group-hover:opacity-100"
                              >
                                <X size={13} />
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {typed && results && (
              <button
                id={`${listId}-${options.length - 1}`}
                type="button"
                role="option"
                aria-selected={active === options.length - 1}
                onMouseEnter={() => setActive(options.length - 1)}
                onClick={() => searchFor(typed)}
                className={cn(
                  "mt-1 flex w-full items-center justify-between rounded-lg border-t border-line-subtle px-2.5 py-2.5 text-[0.875rem] font-semibold text-accent-text transition-colors",
                  active === options.length - 1 ? "bg-accent-subtle" : "hover:bg-accent-subtle"
                )}
              >
                {t("See all results for “{q}”", { q: typed })}
                <kbd className="rounded border border-line px-1.5 py-0.5 text-[0.6875rem] font-medium text-content-muted">
                  Enter
                </kbd>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBox;
