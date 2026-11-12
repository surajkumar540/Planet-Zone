import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import {
  BadgePercent,
  Check,
  ChevronDown,
  ArrowUp,
  ChevronRight,
  Loader2,
  PackageCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import { getProductFacets } from "../../../api/productApi";
import { useApi } from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Field";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ErrorState } from "../../../components/ui/States";
import { Doodle } from "../../../components/ui/Doodles";
import { formatCurrency, formatNumber } from "../../../lib/format";
import cn from "../../../lib/cn";
import { Container } from "../components/Primitives";
import ProductCard from "../components/ProductCard";
import PriceRange from "../components/PriceRange";
import SearchBox from "../components/SearchBox";
import { useWishlistToggle } from "../hooks/useWishlist";
import useInfiniteProducts from "../hooks/useInfiniteProducts";
import { useI18n } from "../../../lib/i18n";

const SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "totalPrice:asc", label: "Price: low to high" },
  { value: "totalPrice:desc", label: "Price: high to low" },
  { value: "rating:desc", label: "Top rated" },
  { value: "name:asc", label: "Name: A–Z" },
];

const PAGE_SIZE = 12;

/** URL keys that are filters (as opposed to sort/page). */
const FILTER_KEYS = ["search", "dept", "category", "brand", "minPrice", "maxPrice", "minRating", "inStock", "onSale", "isFeatured"];

const splitList = (value) => (value ? value.split(",").filter(Boolean) : []);

/**
 * Catalogue.
 *
 * Everything lives in the URL, so a filtered view can be shared, bookmarked
 * and restored by the back button. Filters show live counts (from
 * /products/facets) that account for every other active filter, and the grid
 * keeps showing the previous results while new ones load instead of
 * flashing to skeletons.
 */
const Shop = () => {
  const [params, setParams] = useSearchParams();
  const { toggle, isWishlisted } = useWishlistToggle();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { t } = useI18n();

  const setParam = useCallback(
    (patch) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(patch)) {
            if (value === undefined || value === null || value === "") next.delete(key);
            else next.set(key, String(value));
          }
          // Any filter change invalidates the current page number.
          if (!("page" in patch)) next.delete("page");
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  /** Adds or removes one value of a comma-separated multi-select param. */
  const toggleListValue = (key, value) => {
    const values = splitList(params.get(key));
    const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
    setParam({ [key]: next.join(",") });
  };

  const filters = useMemo(() => {
    const result = {};
    for (const key of FILTER_KEYS) {
      const value = params.get(key);
      if (value) result[key] = value;
    }
    return result;
  }, [params]);

  const query = useMemo(() => ({ sort: params.get("sort") || "createdAt:desc", ...filters }), [params, filters]);

  const { items: products, total, loading, loadingMore, hasMore, error, loadMore, retry } = useInfiniteProducts(query, PAGE_SIZE);
  const { data: facets } = useApi(getProductFacets, filters);

  // Infinite scroll: fetch the next batch when the sentinel nears the viewport.
  const sentinel = useRef(null);
  useEffect(() => {
    const node = sentinel.current;
    if (!node || !hasMore) return undefined;
    const observer = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), {
      rootMargin: "600px 0px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, products]);

  // A "back to top" button once the shopper is well down the list.
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 1400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeCount = FILTER_KEYS.filter((key) => key !== "search" && params.get(key)).length;
  const department = facets?.departments?.find((dept) => dept._id === params.get("dept"));
  const search = params.get("search");

  const title = search
    ? t("Results for “{q}”", { q: search })
    : splitList(params.get("category")).length === 1
      ? params.get("category")
      : department?.name || t("All products");

  const clearAll = () => setParams({}, { replace: true });

  /* -------------------------------- Filter panel ------------------------------- */
  const filterPanel = (
    <div className="divide-y divide-line-subtle">
      <FilterSection title={t("Category")} count={splitList(params.get("category")).length}>
        <CheckList
          options={facets?.categories || []}
          selected={splitList(params.get("category"))}
          onToggle={(value) => toggleListValue("category", value)}
          searchPlaceholder={t("Find a category")}
        />
      </FilterSection>

      <FilterSection title={t("Price")} count={params.get("minPrice") || params.get("maxPrice") ? 1 : 0}>
        <PriceRange
          bounds={facets?.price}
          valueMin={params.get("minPrice") || ""}
          valueMax={params.get("maxPrice") || ""}
          onChange={setParam}
        />
      </FilterSection>

      <FilterSection title={t("Brand")} count={splitList(params.get("brand")).length}>
        <CheckList
          options={facets?.brands || []}
          selected={splitList(params.get("brand"))}
          onToggle={(value) => toggleListValue("brand", value)}
          searchPlaceholder={t("Find a brand")}
        />
      </FilterSection>

      <FilterSection title={t("Customer rating")} count={params.get("minRating") ? 1 : 0}>
        <div className="space-y-1">
          {(facets?.ratings || [{ stars: 4 }, { stars: 3 }, { stars: 2 }]).map(({ stars, count }) => {
            const selected = params.get("minRating") === String(stars);
            return (
              <button
                key={stars}
                type="button"
                onClick={() => setParam({ minRating: selected ? "" : stars })}
                disabled={!selected && count === 0}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors disabled:opacity-40",
                  selected ? "bg-accent-subtle" : "hover:bg-surface-hover"
                )}
              >
                <span className="flex">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <Star
                      key={index}
                      size={14}
                      className={index <= stars ? "fill-[var(--status-warning)] text-[var(--status-warning)]" : "text-line-strong"}
                    />
                  ))}
                </span>
                <span className={cn("flex-1 text-[0.8125rem]", selected ? "font-semibold text-accent-text" : "text-content-secondary")}>
                  {t("& up")}
                </span>
                {count !== undefined && <span className="type-caption type-numeric text-content-muted">{count}</span>}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title={t("Offers & availability")} count={["onSale", "inStock", "isFeatured"].filter((key) => params.get(key)).length}>
        <div className="space-y-2">
          <ToggleRow
            icon={BadgePercent}
            label={t("On sale")}
            count={facets?.onSale}
            checked={params.get("onSale") === "true"}
            onChange={(checked) => setParam({ onSale: checked ? "true" : "" })}
          />
          <ToggleRow
            icon={PackageCheck}
            label={t("In stock")}
            count={facets?.inStock}
            checked={params.get("inStock") === "true"}
            onChange={(checked) => setParam({ inStock: checked ? "true" : "" })}
          />
          <ToggleRow
            icon={Sparkles}
            label={t("Featured")}
            checked={params.get("isFeatured") === "true"}
            onChange={(checked) => setParam({ isFeatured: checked ? "true" : "" })}
          />
        </div>
      </FilterSection>
    </div>
  );

  /* ------------------------------- Active chips ------------------------------- */
  const chips = [
    ...(search ? [{ key: "search", label: `“${search}”`, clear: () => setParam({ search: "" }) }] : []),
    ...(department ? [{ key: "dept", label: department.name, clear: () => setParam({ dept: "" }) }] : []),
    ...splitList(params.get("category")).map((value) => ({ key: `c-${value}`, label: value, clear: () => toggleListValue("category", value) })),
    ...splitList(params.get("brand")).map((value) => ({ key: `b-${value}`, label: value, clear: () => toggleListValue("brand", value) })),
    ...(params.get("minPrice") || params.get("maxPrice")
      ? [{
          key: "price",
          label: `${params.get("minPrice") ? formatCurrency(params.get("minPrice")) : "₹0"} – ${params.get("maxPrice") ? formatCurrency(params.get("maxPrice")) : "any"}`,
          clear: () => setParam({ minPrice: "", maxPrice: "" }),
        }]
      : []),
    ...(params.get("minRating") ? [{ key: "rating", label: `${params.get("minRating")}★ & up`, clear: () => setParam({ minRating: "" }) }] : []),
    ...(params.get("onSale") ? [{ key: "onSale", label: "On sale", clear: () => setParam({ onSale: "" }) }] : []),
    ...(params.get("inStock") ? [{ key: "inStock", label: "In stock", clear: () => setParam({ inStock: "" }) }] : []),
    ...(params.get("isFeatured") ? [{ key: "featured", label: "Featured", clear: () => setParam({ isFeatured: "" }) }] : []),
  ];

  return (
    <>
      {/* ---------------------------------- Header --------------------------------- */}
      <section className="relative overflow-hidden border-b border-line-subtle bg-surface">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(46rem 16rem at 90% -20%, color-mix(in srgb, var(--brand-leaf-from) 13%, transparent), transparent 70%)" }}
        />
        <Doodle type="leaf" size={56} float className="absolute right-[8%] top-6 hidden text-accent-text opacity-30 md:block" />
        <Doodle type="sparkle" size={24} float delay={0.7} className="absolute right-[22%] top-14 hidden text-status-warning opacity-60 md:block" />

        <Container className="relative pb-5 pt-7">
          <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 type-caption text-content-muted">
            <Link to="/" className="hover:text-accent-text">Home</Link>
            <ChevronRight size={12} />
            <Link to="/shop" className="hover:text-accent-text">Shop</Link>
            {department && (
              <>
                <ChevronRight size={12} />
                <span className="text-content-secondary">{department.name}</span>
              </>
            )}
          </nav>

          <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-content sm:text-[2.5rem]">
            {title}
          </h1>
          <p className="mt-1 type-description" aria-live="polite">
            {loading && !products ? t("Finding products…") : total === 1 ? t("1 product") : t("{n} products", { n: formatNumber(total) })}
          </p>

          <SearchBox className="mt-4 md:hidden" size="sm" initialValue={search || ""} />

          {/* Department rail: one tap to switch the whole shelf. */}
          {facets?.departments?.length > 0 && (
            <LayoutGroup id="dept-rail">
              <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
                {[{ _id: "", name: t("All"), count: undefined }, ...facets.departments].map((dept) => {
                  const selected = (params.get("dept") || "") === dept._id;
                  return (
                    <button
                      key={dept._id || "all"}
                      type="button"
                      onClick={() => setParam({ dept: dept._id, category: "" })}
                      className={cn(
                        "relative shrink-0 rounded-full px-4 py-2 text-[0.8125rem] font-semibold transition-colors",
                        selected ? "text-accent-on" : "border border-line text-content-secondary hover:border-accent hover:text-accent-text"
                      )}
                    >
                      {selected && (
                        <motion.span
                          layoutId="dept-pill"
                          className="absolute inset-0 rounded-full bg-accent shadow-sm"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className="relative">
                        {dept.name}
                        {dept.count !== undefined && (
                          <span className={cn("ml-1.5 type-numeric font-medium", selected ? "opacity-80" : "text-content-muted")}>
                            {dept.count}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
          )}
        </Container>
      </section>

      <Container className="py-6">
        <div className="grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* --------------------------------- Sidebar -------------------------------- */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-line-subtle bg-surface px-4 py-2 [scrollbar-width:thin]">
              <div className="flex items-center justify-between py-3">
                <h2 className="flex items-center gap-2 text-[0.9375rem] font-semibold text-content">
                  <SlidersHorizontal size={16} /> {t("Filters")}
                </h2>
                {activeCount > 0 && (
                  <button type="button" onClick={clearAll} className="type-caption font-medium text-accent-text hover:underline">
                    {t("Clear all")}
                  </button>
                )}
              </div>
              {filterPanel}
            </div>
          </aside>

          {/* --------------------------------- Results -------------------------------- */}
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button icon={SlidersHorizontal} onClick={() => setSheetOpen(true)} className="lg:hidden">
                {t("Filters")}
                {activeCount > 0 && (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[0.6875rem] font-bold text-accent-on">
                    {activeCount}
                  </span>
                )}
              </Button>

              <LayoutGroup id="chips">
                <div className="flex flex-1 flex-wrap items-center gap-1.5">
                  <AnimatePresence initial={false}>
                    {chips.map((chip) => (
                      <motion.button
                        layout
                        key={chip.key}
                        type="button"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 500, damping: 32 }}
                        onClick={chip.clear}
                        className="inline-flex items-center gap-1 rounded-full bg-accent-subtle py-1 pl-3 pr-2 text-[0.8125rem] font-medium text-accent-text transition-colors hover:bg-accent hover:text-accent-on"
                      >
                        {chip.label}
                        <X size={13} />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </LayoutGroup>

              <div className="ml-auto w-48">
                <Select
                  value={params.get("sort") || "createdAt:desc"}
                  onChange={(event) => setParam({ sort: event.target.value })}
                  aria-label="Sort products"
                  options={SORT_OPTIONS.map((option) => ({ ...option, label: t(option.label) }))}
                />
              </div>
            </div>

            {/* A thin bar while new results load over the old ones. */}
            <div className="relative mb-3 h-0.5 overflow-hidden rounded-full">
              {loading && products && (
                <motion.span
                  className="absolute inset-y-0 w-1/3 rounded-full bg-accent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "300%" }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
            </div>

            {error ? (
              <ErrorState description={error} onRetry={retry} />
            ) : !products && loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <div key={index} className="overflow-hidden rounded-2xl border border-line-subtle">
                    <Skeleton className="aspect-square w-full rounded-none" />
                    <div className="space-y-2 p-3.5">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products?.length ? (
              <>
                <motion.div
                  layout
                  className={cn(
                    "grid grid-cols-2 gap-3 transition-opacity duration-200 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4",
                    loading && "pointer-events-none opacity-55"
                  )}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {products.map((product, index) => (
                      <motion.div
                        layout
                        key={product._id}
                        initial={{ opacity: 0, y: 14, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
                        transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.03, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <ProductCard product={product} onToggleWishlist={toggle} isWishlisted={isWishlisted(product._id)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
                {/* Infinite scroll: the sentinel triggers the next batch. */}
                <div ref={sentinel} className="flex flex-col items-center py-10" aria-live="polite">
                  {loadingMore ? (
                    <span className="inline-flex items-center gap-2 type-caption text-content-muted">
                      <Loader2 size={16} className="animate-spin" /> {t("Loading more…")}
                    </span>
                  ) : hasMore ? (
                    <Button variant="ghost" onClick={loadMore}>
                      {t("Show {n} more", { n: Math.min(PAGE_SIZE, total - products.length) })}
                    </Button>
                  ) : (
                    total > PAGE_SIZE && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-line-subtle bg-surface px-4 py-2 type-caption text-content-secondary">
                        <Check size={14} className="text-status-good" />
                        {t("You've seen all {n} products", { n: formatNumber(total) })}
                      </span>
                    )
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-line px-6 py-14 text-center">
                <div className="relative">
                  <Doodle type="circle" size={84} className="text-accent-text opacity-40" />
                  <Doodle type="sprout" size={40} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-text" />
                </div>
                <h2 className="font-display mt-4 text-[1.5rem] font-semibold text-content">{t("Nothing matched")}</h2>
                <p className="mt-1 max-w-[40ch] type-description">
                  {t("Try removing a filter or two, or search for something a little broader.")}
                </p>
                {(activeCount > 0 || search) && (
                  <Button variant="primary" className="mt-5" onClick={clearAll}>
                    {t("Clear all filters")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.8 }}
            whileHover={{ y: -3 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-surface-inverse px-4 py-2.5 text-[0.8125rem] font-semibold text-content-inverse shadow-xl"
          >
            <ArrowUp size={15} /> {t("Back to top")}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ------------------------------ Mobile filter sheet ------------------------------ */}
      <AnimatePresence>
        {sheetOpen && (
          <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
            <motion.div
              className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-surface shadow-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120) setSheetOpen(false);
              }}
            >
              <div className="flex justify-center pt-2.5">
                <span className="h-1.5 w-10 rounded-full bg-line-strong" />
              </div>
              <div className="flex items-center justify-between border-b border-line-subtle px-5 py-3">
                <h2 className="text-[1.0625rem] font-semibold text-content">{t("Filters")}</h2>
                <div className="flex items-center gap-3">
                  {activeCount > 0 && (
                    <button type="button" onClick={clearAll} className="type-caption font-medium text-accent-text">
                      {t("Clear all")}
                    </button>
                  )}
                  <button type="button" onClick={() => setSheetOpen(false)} aria-label="Close filters" className="rounded-md p-1 text-content-muted">
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-5">{filterPanel}</div>
              <div className="border-t border-line-subtle p-4">
                <Button variant="primary" size="lg" fullWidth onClick={() => setSheetOpen(false)}>
                  {t("Show {n} products", { n: formatNumber(total) })}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

/* --------------------------------- Pieces --------------------------------- */

/** A collapsible filter group with a count of active selections. */
const FilterSection = ({ title, count = 0, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="py-3.5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-content">
          {title}
          {count > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[0.6875rem] font-bold normal-case text-accent-on">
              {count}
            </span>
          )}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="text-content-muted">
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

/** Multi-select checkboxes with live counts, an inline search, and "show more". */
const CheckList = ({ options, selected, onToggle, searchPlaceholder }) => {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [needle, setNeedle] = useState("");

  // Selected options always stay visible, even if a count dropped to zero.
  const merged = [
    ...options,
    ...selected.filter((name) => !options.some((option) => option.name === name)).map((name) => ({ name, count: 0 })),
  ];
  const filtered = needle
    ? merged.filter((option) => option.name.toLowerCase().includes(needle.toLowerCase()))
    : merged;
  const visible = expanded || needle ? filtered : filtered.slice(0, 6);

  if (!merged.length) return <p className="type-caption text-content-muted">{t("Nothing to filter yet.")}</p>;

  return (
    <div>
      {merged.length > 8 && (
        <input
          type="text"
          value={needle}
          onChange={(event) => setNeedle(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="mb-2 h-8 w-full rounded-lg border border-line bg-surface-sunken px-2.5 text-[0.8125rem] text-content outline-none placeholder:text-content-muted focus:border-accent"
        />
      )}
      <ul className="space-y-0.5">
        {visible.map((option) => {
          const checked = selected.includes(option.name);
          const empty = !checked && option.count === 0;
          return (
            <li key={option.name}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                disabled={empty}
                onClick={() => onToggle(option.name)}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  !empty && "hover:bg-surface-hover"
                )}
              >
                <span
                  className={cn(
                    "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-all",
                    checked ? "scale-105 border-accent bg-accent text-accent-on" : "border-line-strong group-hover:border-accent"
                  )}
                >
                  <AnimatePresence>
                    {checked && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", stiffness: 600, damping: 22 }}>
                        <Check size={12} strokeWidth={3.5} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                <span className={cn("flex-1 truncate text-[0.8125rem]", checked ? "font-semibold text-content" : "text-content-secondary")}>
                  {option.name}
                </span>
                <span className="rounded-full bg-surface-sunken px-1.5 text-[0.6875rem] font-medium type-numeric text-content-muted">
                  {option.count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {!needle && filtered.length > 6 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-1.5 px-1.5 text-[0.8125rem] font-medium text-accent-text hover:underline"
        >
          {expanded ? t("Show less") : t("Show {n} more", { n: filtered.length - 6 })}
        </button>
      )}
    </div>
  );
};

/** An on/off filter row with an animated switch and a live count. */
const ToggleRow = ({ icon: Icon, label, count, checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors",
      checked ? "border-accent bg-accent-subtle" : "border-line-subtle hover:border-line"
    )}
  >
    <Icon size={16} className={checked ? "text-accent-text" : "text-content-muted"} />
    <span className={cn("flex-1 text-[0.8125rem] font-medium", checked ? "text-accent-text" : "text-content-secondary")}>
      {label}
      {count !== undefined && <span className="ml-1.5 type-numeric text-content-muted">({count})</span>}
    </span>
    <span className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-accent" : "bg-line-strong")}>
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 32 }}
        className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm", checked ? "right-0.5" : "left-0.5")}
      />
    </span>
  </button>
);


export default Shop;
