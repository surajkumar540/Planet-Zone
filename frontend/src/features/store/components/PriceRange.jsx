import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../../../lib/format";
import cn from "../../../lib/cn";

/**
 * Price filter: a histogram of matching prices with a two-thumb slider on top.
 *
 * The bars show where products actually sit, so the shopper can see that, for
 * example, most items are under ₹2,000 before dragging. Bars inside the chosen
 * range are lit; the rest fade.
 *
 * When prices span a wide range (the API reports `scale: "log"`), both the bars
 * and the slider use a logarithmic axis. Otherwise one ₹10 lakh watch would
 * squash every ₹200 product into the first few pixels of the slider.
 *
 * The URL is only updated when a thumb is released, so dragging does not fire
 * a request per pixel.
 */
const QUICK_RANGES = [
  { label: "Under ₹500", min: "", max: 499 },
  { label: "₹500–₹1,999", min: 500, max: 1999 },
  { label: "₹2,000–₹9,999", min: 2000, max: 9999 },
  { label: "₹10,000+", min: 10000, max: "" },
];

const STEPS = 1000;

/** Rounds to a "shop" number: ₹47 → ₹47, ₹1,234 → ₹1,230, ₹123,456 → ₹123,000. */
const nice = (value) => {
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(Math.max(1, value))) - 2);
  return Math.round(value / magnitude) * magnitude;
};

const PriceRange = ({ bounds, valueMin, valueMax, onChange }) => {
  const floor = Math.max(0, bounds?.min ?? 0);
  const ceil = Math.max(bounds?.max ?? 0, floor + 1);
  const isLog = bounds?.scale === "log" && floor > 0;
  const histogram = useMemo(() => bounds?.histogram || [], [bounds]);

  // Slider position (0..STEPS) <-> price, on the same axis as the bars.
  const toPrice = (position) =>
    isLog ? floor * (ceil / floor) ** (position / STEPS) : floor + ((ceil - floor) * position) / STEPS;
  const toPosition = (price) => {
    const clamped = Math.min(ceil, Math.max(floor, price));
    return isLog
      ? (Math.log(clamped / floor) / Math.log(ceil / floor)) * STEPS
      : ((clamped - floor) / (ceil - floor)) * STEPS;
  };

  const positionOf = (raw, fallback) => {
    const number = Number(raw);
    return raw === "" || raw === undefined || raw === null || Number.isNaN(number) ? fallback : toPosition(number);
  };

  const [low, setLow] = useState(positionOf(valueMin, 0));
  const [high, setHigh] = useState(positionOf(valueMax, STEPS));

  // Follow the URL (and new bounds) when they change from outside.
  useEffect(() => {
    setLow(positionOf(valueMin, 0));
    setHigh(positionOf(valueMax, STEPS));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- positionOf depends on these.
  }, [valueMin, valueMax, floor, ceil, isLog]);

  const tallest = useMemo(() => Math.max(1, ...histogram.map((bucket) => bucket.count)), [histogram]);
  const lowPrice = nice(toPrice(low));
  const highPrice = nice(toPrice(high));

  const commit = () =>
    onChange({
      minPrice: low > 0 ? lowPrice : "",
      maxPrice: high < STEPS ? highPrice : "",
    });

  return (
    <div>
      {/* Histogram: equal-width bars, matching the slider's axis. */}
      <div className="flex h-14 items-end gap-[3px] px-1" aria-hidden="true">
        {histogram.map((bucket, index) => {
          const start = (index / histogram.length) * STEPS;
          const end = ((index + 1) / histogram.length) * STEPS;
          const inside = end >= low && start <= high;
          return (
            <span
              key={`${bucket.from}-${bucket.to}`}
              title={`${formatCurrency(bucket.from)} – ${formatCurrency(bucket.to)}: ${bucket.count}`}
              className={cn("flex-1 rounded-t-sm transition-colors duration-200", inside ? "bg-accent" : "bg-line")}
              style={{ height: `${Math.max(6, (bucket.count / tallest) * 100)}%`, opacity: bucket.count ? 1 : 0.35 }}
            />
          );
        })}
      </div>

      {/* Two-thumb slider: two range inputs stacked on one track. */}
      <div className="relative mx-1 h-6">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent"
          style={{ left: `${(low / STEPS) * 100}%`, right: `${100 - (high / STEPS) * 100}%` }}
        />
        <input
          type="range"
          min={0}
          max={STEPS}
          value={low}
          aria-label="Minimum price"
          aria-valuetext={formatCurrency(lowPrice)}
          onChange={(event) => setLow(Math.min(Number(event.target.value), high - 10))}
          onPointerUp={commit}
          onKeyUp={commit}
          className="price-thumb absolute inset-0 w-full"
        />
        <input
          type="range"
          min={0}
          max={STEPS}
          value={high}
          aria-label="Maximum price"
          aria-valuetext={formatCurrency(highPrice)}
          onChange={(event) => setHigh(Math.max(Number(event.target.value), low + 10))}
          onPointerUp={commit}
          onKeyUp={commit}
          className="price-thumb absolute inset-0 w-full"
        />
      </div>

      <div className="mt-1 flex items-center justify-between type-caption type-numeric text-content-secondary">
        <span>{formatCurrency(lowPrice)}</span>
        <span>
          {formatCurrency(highPrice)}
          {high >= STEPS && "+"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK_RANGES.map((range) => {
          const selected = String(valueMin || "") === String(range.min) && String(valueMax || "") === String(range.max);
          return (
            <button
              key={range.label}
              type="button"
              onClick={() => onChange(selected ? { minPrice: "", maxPrice: "" } : { minPrice: range.min, maxPrice: range.max })}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[0.75rem] font-medium transition-colors",
                selected
                  ? "border-accent bg-accent text-accent-on"
                  : "border-line text-content-secondary hover:border-accent hover:text-accent-text"
              )}
            >
              {range.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PriceRange;
