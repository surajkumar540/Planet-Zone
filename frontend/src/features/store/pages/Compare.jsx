import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, Check, Info, Minus, Plus, Scale, Search, ShoppingBag, Star, ThumbsDown, ThumbsUp, Trash2, X } from "lucide-react";

import { getProductsByIds, getSimilar } from "../../../api/smartApi";
import { suggestProducts } from "../../../api/productApi";
import { useApi, useDebounced } from "../../../hooks/useApi";
import { useCart } from "../hooks/useStorefront";
import { useCartFeedback } from "../hooks/useCartFeedback";
import { COMPARE_LIMIT, useCompare } from "../hooks/useCompare";
import { useToast } from "../../../components/ui/Toast";
import Button from "../../../components/ui/Button";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { Skeleton } from "../../../components/ui/Skeleton";
import { Container, SectionHeading } from "../components/Primitives";
import { formatCurrency, formatNumber } from "../../../lib/format";
import cn from "../../../lib/cn";

/**
 * Side-by-side comparison of up to three products.
 *
 * Everything shown is the products' real data. The score is a plain weighted
 * average the shopper controls with the priority sliders, and the page shows
 * exactly how it is worked out. Pros and cons are rules over the same data
 * (cheapest, best rated, only a few left…), not opinions.
 */

/** How each priority turns into a 0–1 score across the products compared. */
const CRITERIA = [
  {
    key: "price",
    label: "Low price",
    explain: "cheapest price ÷ this price",
    score: (product, all) => Math.min(...all.map((item) => item.totalPrice)) / Math.max(product.totalPrice, 1),
  },
  {
    key: "rating",
    label: "Rating",
    explain: "star rating ÷ 5 (0 with no reviews)",
    score: (product) => (product.numReviews > 0 ? Number(product.rating) / 5 : 0),
  },
  {
    key: "reviews",
    label: "Popularity",
    explain: "number of reviews ÷ the most reviewed",
    score: (product, all) => {
      const most = Math.max(...all.map((item) => item.numReviews || 0));
      return most ? (product.numReviews || 0) / most : 0;
    },
  },
  {
    key: "discount",
    label: "Discount",
    explain: "discount ÷ the biggest discount",
    score: (product, all) => {
      const most = Math.max(...all.map((item) => Number(item.discount) || 0));
      return most ? (Number(product.discount) || 0) / most : 0;
    },
  },
  {
    key: "stock",
    label: "Availability",
    explain: "1 if 10+ in stock, less when few are left, 0 if sold out",
    score: (product) => (product.hasVariants ? 1 : Math.min(1, Math.max(0, product.countInStock) / 10)),
  },
];

const DEFAULT_WEIGHTS = { price: 3, rating: 3, reviews: 1, discount: 1, stock: 2 };

/** Rule-based pros and cons, each tied to a fact in the table. */
const prosAndCons = (product, all) => {
  const pros = [];
  const cons = [];
  const prices = all.map((item) => item.totalPrice);
  const multiple = all.length > 1;
  if (multiple && product.totalPrice === Math.min(...prices)) pros.push("Lowest price here");
  if (multiple && product.totalPrice === Math.max(...prices) && Math.min(...prices) !== Math.max(...prices)) {
    cons.push(`Costs ${formatCurrency(product.totalPrice - Math.min(...prices))} more than the cheapest`);
  }
  const rated = all.filter((item) => item.numReviews > 0);
  if (product.numReviews > 0 && multiple && rated.length && Number(product.rating) === Math.max(...rated.map((item) => Number(item.rating)))) {
    pros.push(`Best rated (${Number(product.rating).toFixed(1)}★)`);
  }
  if (product.numReviews > 0 && Number(product.rating) < 3.5) cons.push(`Lower rating (${Number(product.rating).toFixed(1)}★)`);
  if (!product.numReviews) cons.push("No reviews yet");
  if (Number(product.discount) >= 10) pros.push(`${Math.round(product.discount)}% off right now`);
  if (!product.hasVariants && product.countInStock <= 0) cons.push("Out of stock");
  else if (!product.hasVariants && product.countInStock <= 5) cons.push(`Only ${product.countInStock} left`);
  else pros.push("In stock");
  (product.attributes || []).forEach((attribute) => {
    if (/warranty/i.test(attribute.code || attribute.name) && !/no warranty/i.test(String(attribute.value))) pros.push(String(attribute.value));
    if (/return/i.test(attribute.code || attribute.name)) {
      if (/no return/i.test(String(attribute.value))) cons.push("No returns");
      else pros.push(String(attribute.value));
    }
  });
  return { pros: pros.slice(0, 5), cons: cons.slice(0, 4) };
};

/** Adds products to the comparison by searching the catalogue. */
const AddProduct = ({ onAdd, existing }) => {
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 250);
  const { data, loading } = useApi(suggestProducts, debounced, { enabled: debounced.trim().length >= 2 });
  const results = (data?.products || []).filter((product) => !existing.includes(product._id)).slice(0, 5);
  return (
    <div className="relative">
      <label className="flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-3 focus-within:border-accent">
        <Search size={16} className="text-content-muted" />
        <span className="sr-only">Search a product to add</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a product to add…"
          className="h-full flex-1 bg-transparent text-[0.875rem] text-content outline-none placeholder:text-content-muted"
        />
      </label>
      {debounced.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-line bg-surface-overlay shadow-xl">
          {loading ? (
            <p className="p-3 type-caption">Searching…</p>
          ) : results.length ? (
            results.map((product) => (
              <button
                key={product._id}
                type="button"
                onClick={() => {
                  onAdd(product);
                  setQuery("");
                }}
                className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-surface-hover"
              >
                <img src={product.image} alt="" className="h-9 w-9 rounded-md bg-white object-cover" />
                <span className="min-w-0 flex-1 truncate text-[0.875rem] text-content">{product.name}</span>
                <Plus size={15} className="text-accent-text" />
              </button>
            ))
          ) : (
            <p className="p-3 type-caption">No products match.</p>
          )}
        </div>
      )}
    </div>
  );
};

const Compare = () => {
  const compare = useCompare();
  const { add } = useCart();
  const notifyAdded = useCartFeedback();
  const toast = useToast();
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [showHow, setShowHow] = useState(false);

  const ids = (compare?.items || []).map((item) => item._id);
  const { data, loading, error, refetch } = useApi(getProductsByIds, { ids }, { enabled: ids.length > 0 });
  const products = useMemo(() => (ids.length ? (data || []).filter((product) => ids.includes(product._id)) : []), [data, ids]);
  // With room left, suggest close matches to the first product.
  const suggestions = useApi(getSimilar, { id: ids[0], limit: 6 }, { enabled: ids.length > 0 && ids.length < COMPARE_LIMIT });
  const suggested = (suggestions.data || []).filter((product) => !ids.includes(product._id)).slice(0, ids.length === 1 ? 6 : 3);

  const scored = useMemo(() => {
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0) || 1;
    return products.map((product) => {
      const parts = CRITERIA.map((criterion) => ({
        key: criterion.key,
        value: Math.max(0, Math.min(1, criterion.score(product, products))),
        weight: weights[criterion.key],
      }));
      const score = Math.round((parts.reduce((sum, part) => sum + part.value * part.weight, 0) / totalWeight) * 100);
      return { product, parts, score, ...prosAndCons(product, products) };
    });
  }, [products, weights]);

  const best = scored.length > 1 ? [...scored].sort((a, b) => b.score - a.score)[0] : null;
  const bestReasons = best
    ? CRITERIA.filter((criterion) => weights[criterion.key] > 0)
        .filter((criterion) => {
          const mine = best.parts.find((part) => part.key === criterion.key).value;
          return scored.every((entry) => entry.parts.find((part) => part.key === criterion.key).value <= mine + 1e-9);
        })
        .map((criterion) => criterion.label.toLowerCase())
    : [];

  // Table rows: core facts, then every specification any product has.
  const rows = useMemo(() => {
    const core = [
      { label: "Price", get: (p) => p.totalPrice, show: (v) => formatCurrency(v), best: "min" },
      { label: "MRP (before discount, incl. tax)", get: (p) => Math.round(p.price * (1 + (p.gst || 0) / 100)), show: (v) => formatCurrency(v) },
      { label: "Discount", get: (p) => Math.round(Number(p.discount) || 0), show: (v) => (v ? `${v}%` : "—"), best: "max" },
      { label: "Brand", get: (p) => p.brand },
      { label: "Category", get: (p) => p.category },
      { label: "Rating", get: (p) => (p.numReviews ? Number(p.rating) : 0), show: (v, p) => (p.numReviews ? `${v.toFixed(1)}★ (${formatNumber(p.numReviews)})` : "No reviews"), best: "max" },
      { label: "In stock", get: (p) => (p.hasVariants ? null : p.countInStock), show: (v) => (v === null ? "Varies by option" : v > 0 ? formatNumber(v) : "Sold out"), best: "max" },
      { label: "Weight", get: (p) => p.weightGrams || 0, show: (v) => (v ? `${v} g` : "—") },
    ];
    const specNames = [...new Set(products.flatMap((product) => (product.attributes || []).map((attribute) => attribute.name)))];
    const specs = specNames.map((name) => ({
      label: name,
      get: (p) => (p.attributes || []).find((attribute) => attribute.name === name)?.value ?? "—",
      show: (v) => String(v),
    }));
    return [...core, ...specs].filter((row) => products.some((product) => row.get(product) !== 0 && row.get(product) !== "—"));
  }, [products]);

  const addToBag = (product) => {
    const result = add(product, 1);
    if (!result.added) {
      toast.info("Already in your bag", `You have all ${result.inBag} in stock in your bag.`);
      return;
    }
    notifyAdded({ product, qty: result.added, inBag: result.inBag });
  };

  if (!compare) return null;

  return (
    <Container className="py-8">
      <SectionHeading
        eyebrow="Side by side"
        title="Compare products"
        description={`Pick up to ${COMPARE_LIMIT} products. Set what matters to you and we'll show which fits best, and why.`}
        action={
          ids.length > 0 && (
            <Button variant="ghost" icon={Trash2} onClick={compare.clear}>
              Clear all
            </Button>
          )
        }
      />

      {ids.length < COMPARE_LIMIT && (
        <div className="mb-6 max-w-md">
          <AddProduct onAdd={compare.toggle} existing={ids} />
        </div>
      )}

      {!ids.length ? (
        <EmptyState
          icon={Scale}
          title="Nothing to compare yet"
          description="Tap the scales icon on any product, or search above to add one."
          action={
            <Button as={Link} to="/shop" variant="primary">
              Browse the shop
            </Button>
          }
        />
      ) : error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : loading && !products.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {ids.map((id) => (
            <Skeleton key={id} className="h-80 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Not enough to compare yet, or room for one more: suggestions. */}
          {suggested.length > 0 && (
            <section className={cn("rounded-2xl border p-5", products.length < 2 ? "border-accent bg-accent-subtle" : "border-line-subtle bg-surface")}>
              <h2 className="text-[1.0625rem] font-semibold text-content">
                {products.length < 2 ? "Add at least one more product to compare" : "Add a third product?"}
              </h2>
              <p className="mt-0.5 type-caption">
                {products.length < 2
                  ? `Comparing needs two or three products. Here are close matches to ${products[0]?.name || "your pick"}, or search above.`
                  : "Close matches you might want to weigh up too."}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {suggested.map((product) => (
                  <div key={product._id} className="flex flex-col overflow-hidden rounded-xl border border-line-subtle bg-surface">
                    <Link to={`/product/${product._id}`} className="block bg-white">
                      <img src={product.image} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col p-2.5">
                      <p className="line-clamp-2 text-[0.75rem] font-semibold leading-snug text-content">{product.name}</p>
                      <p className="mt-0.5 type-numeric text-[0.8125rem] font-bold text-content">{formatCurrency(product.totalPrice)}</p>
                      <button
                        type="button"
                        onClick={() => compare.toggle(product)}
                        className="mt-auto inline-flex items-center justify-center gap-1 rounded-full bg-accent px-2 py-1.5 text-[0.75rem] font-semibold text-accent-on hover:opacity-90"
                        style={{ marginTop: "0.5rem" }}
                      >
                        <Plus size={13} /> Compare
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {products.length >= 2 && (<>
          {/* Priorities */}
          <section className="rounded-2xl border border-line-subtle bg-surface p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[1.0625rem] font-semibold text-content">What matters most to you?</h2>
              <button type="button" onClick={() => setShowHow((value) => !value)} className="inline-flex items-center gap-1 type-caption font-semibold text-accent-text hover:underline">
                <Info size={13} /> How the score works
              </button>
            </div>
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
              {CRITERIA.map((criterion) => (
                <label key={criterion.key} className="block">
                  <span className="flex items-center justify-between text-[0.8125rem] font-medium text-content">
                    {criterion.label}
                    <span className="type-caption">{["Off", "Low", "Some", "Medium", "High", "Top"][weights[criterion.key]]}</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={weights[criterion.key]}
                    onChange={(event) => setWeights((current) => ({ ...current, [criterion.key]: Number(event.target.value) }))}
                    className="mt-2 w-full accent-[var(--accent-solid)]"
                    aria-label={`Importance of ${criterion.label}`}
                  />
                </label>
              ))}
            </div>
            {showHow && (
              <div className="mt-4 rounded-xl bg-surface-sunken p-4 type-caption leading-relaxed text-content-secondary">
                <p className="mb-2 font-semibold text-content">Score = weighted average of these, × 100:</p>
                <ul className="space-y-1">
                  {CRITERIA.map((criterion) => (
                    <li key={criterion.key}>
                      <b>{criterion.label}</b> (weight {weights[criterion.key]}): {criterion.explain}
                    </li>
                  ))}
                </ul>
                <p className="mt-2">Scores only compare the products on this page; they are not ratings.</p>
              </div>
            )}
          </section>

          {/* Recommendation */}
          {best && (
            <motion.section
              key={best.product._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-4 rounded-2xl p-5 text-white"
              style={{ background: "linear-gradient(120deg, var(--promo-leaf-from), var(--promo-leaf-to))" }}
            >
              <Award size={30} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] opacity-85">Best match for your priorities</p>
                <p className="font-display text-[1.375rem] font-semibold leading-tight">{best.product.name}</p>
                <p className="mt-0.5 text-[0.875rem] opacity-90">
                  Scores {best.score}/100
                  {bestReasons.length ? `, leading on ${bestReasons.join(", ")}` : ""}.
                </p>
              </div>
              {!best.product.hasVariants && best.product.countInStock > 0 && (
                <button type="button" onClick={() => addToBag(best.product)} className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[0.875rem] font-semibold text-[color:var(--promo-leaf-from)]">
                  <ShoppingBag size={16} /> Add to bag
                </button>
              )}
            </motion.section>
          )}

          </>)}

          {/* Product columns: score, pros and cons, actions */}
          <div className={cn("grid gap-4", scored.length === 3 ? "md:grid-cols-3" : scored.length === 2 ? "md:grid-cols-2" : "max-w-sm")}>
            {scored.map(({ product, score, pros, cons }) => {
              const isBest = best?.product._id === product._id;
              const inStock = product.hasVariants || product.countInStock > 0;
              return (
                <article key={product._id} className={cn("relative flex flex-col rounded-2xl border bg-surface p-4", isBest ? "border-accent shadow-lg" : "border-line-subtle")}>
                  <button
                    type="button"
                    onClick={() => compare.remove(product._id)}
                    aria-label={`Remove ${product.name} from compare`}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-surface-sunken text-content-muted hover:text-content"
                  >
                    <X size={15} />
                  </button>
                  <Link to={`/product/${product._id}`} className="block overflow-hidden rounded-xl bg-white">
                    <img src={product.image} alt="" className="aspect-square w-full object-cover" />
                  </Link>
                  <p className="mt-3 type-caption uppercase tracking-wide">{product.brand}</p>
                  <Link to={`/product/${product._id}`} className="line-clamp-2 font-semibold text-content hover:text-accent-text">
                    {product.name}
                  </Link>
                  <p className="mt-1 type-numeric text-[1.125rem] font-bold text-content">{formatCurrency(product.totalPrice)}</p>

                  {scored.length > 1 && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-baseline justify-between">
                        <span className="type-caption">Match score</span>
                        <span className={cn("type-numeric font-bold", isBest ? "text-accent-text" : "text-content")}>{score}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-sunken">
                        <motion.div animate={{ width: `${score}%` }} className={cn("h-full rounded-full", isBest ? "bg-accent" : "bg-line-strong")} />
                      </div>
                    </div>
                  )}

                  <ul className="mt-4 space-y-1.5">
                    {pros.map((pro) => (
                      <li key={pro} className="flex items-start gap-2 text-[0.8125rem] text-content">
                        <ThumbsUp size={14} className="mt-0.5 shrink-0 text-status-good" /> {pro}
                      </li>
                    ))}
                    {cons.map((con) => (
                      <li key={con} className="flex items-start gap-2 text-[0.8125rem] text-content-secondary">
                        <ThumbsDown size={14} className="mt-0.5 shrink-0 text-status-critical" /> {con}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4">
                    {product.hasVariants ? (
                      <Button as={Link} to={`/product/${product._id}`} fullWidth>
                        Choose options
                      </Button>
                    ) : (
                      <Button variant={isBest ? "primary" : "secondary"} icon={ShoppingBag} fullWidth disabled={!inStock} onClick={() => addToBag(product)}>
                        {inStock ? "Add to bag" : "Out of stock"}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Spec table with differences highlighted */}
          {products.length > 1 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-[1.0625rem] font-semibold text-content">
                Details side by side
                <span className="rounded-full bg-status-warning-bg px-2 py-0.5 text-[0.6875rem] font-semibold text-status-warning">Highlighted rows differ</span>
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-line-subtle bg-surface">
                <table className="w-full min-w-[36rem] border-collapse text-[0.875rem]">
                  <thead>
                    <tr className="bg-surface-sunken">
                      <th scope="col" className="w-48 px-4 py-3 text-left type-caption font-semibold uppercase tracking-wide">Detail</th>
                      {products.map((product) => (
                        <th key={product._id} scope="col" className="px-4 py-3 text-left font-semibold text-content">
                          <span className="line-clamp-1">{product.name}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const values = products.map((product) => row.get(product));
                      const differs = new Set(values.map((value) => JSON.stringify(value))).size > 1;
                      const numeric = values.filter((value) => typeof value === "number");
                      const bestValue = row.best && numeric.length > 1 ? (row.best === "min" ? Math.min(...numeric) : Math.max(...numeric)) : null;
                      return (
                        <tr key={row.label} className={cn("border-t border-line-subtle", differs && "[&>td]:bg-[color-mix(in_srgb,var(--status-warning-bg)_55%,transparent)]")}>
                          <th scope="row" className="px-4 py-2.5 text-left font-medium text-content-secondary">
                            <span className="flex items-center gap-1.5">
                              {differs ? <span className="h-1.5 w-1.5 rounded-full bg-status-warning" aria-label="Differs" /> : <Minus size={10} className="text-content-disabled" aria-label="Same" />}
                              {row.label}
                            </span>
                          </th>
                          {products.map((product, index) => {
                            const value = values[index];
                            const isBestCell = differs && bestValue !== null && value === bestValue;
                            return (
                              <td key={product._id} className="px-4 py-2.5 text-content">
                                <span className="inline-flex items-center gap-1.5">
                                  {row.show ? row.show(value, product) : value}
                                  {isBestCell && (
                                    <span className="inline-flex items-center gap-0.5 rounded-full bg-status-good-bg px-1.5 py-px text-[0.625rem] font-bold text-status-good">
                                      <Check size={10} /> Best
                                    </span>
                                  )}
                                </span>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 flex items-center gap-1 type-caption">
                <Star size={12} /> Ratings come only from verified buyers. Specifications are as listed by each product.
              </p>
            </section>
          )}
        </div>
      )}
    </Container>
  );
};

export default Compare;
