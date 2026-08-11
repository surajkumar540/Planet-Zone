import { Minus, Plus, Star } from "lucide-react";
import cn from "../../../lib/cn";
import { formatCurrency } from "../../../lib/format";

/**
 * Small building blocks shared across the storefront.
 *
 * They exist so a price, a rating or a page gutter looks the same on the home
 * page, the catalogue and the cart without each screen restating the rules.
 */

/** The single horizontal rhythm for every storefront screen. */
export const Container = ({ className, children, ...props }) => (
  <div className={cn("mx-auto w-full max-w-[1240px] px-4 sm:px-6", className)} {...props}>
    {children}
  </div>
);

/**
 * Money, with the pre-discount figure struck through beside it.
 *
 * `totalPrice` is what the customer pays and always leads; `price` is only
 * rendered when a discount actually makes the two differ.
 */
export const Price = ({ value, compareAt, size = "md", className }) => {
  const paid = Number(value) || 0;
  const before = Number(compareAt) || 0;
  const showCompare = before > paid;

  const sizes = {
    sm: "text-[0.9375rem]",
    md: "text-[1.0625rem]",
    lg: "text-[1.5rem]",
  };

  return (
    <span className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("type-numeric font-semibold text-content", sizes[size] || sizes.md)}>
        {formatCurrency(paid, { precise: size === "lg" })}
      </span>
      {showCompare && (
        <>
          <span className="type-numeric text-caption text-content-muted line-through">
            {formatCurrency(before)}
          </span>
          <span className="type-caption font-medium text-status-good">
            {Math.round(((before - paid) / before) * 100)}% off
          </span>
        </>
      )}
    </span>
  );
};

/** Stars plus the numeric value, so the rating is never shape-only. */
export const Rating = ({ value = 0, count, size = 14, showCount = true, className }) => (
  <span className={cn("flex items-center gap-1.5", className)}>
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            star <= Math.round(value)
              ? "fill-[var(--status-warning)] text-[var(--status-warning)]"
              : "text-line-strong"
          )}
        />
      ))}
    </span>
    <span className="type-caption type-numeric text-content-secondary">
      {value ? Number(value).toFixed(1) : "New"}
      {showCount && count > 0 && ` (${count})`}
    </span>
    <span className="sr-only">
      {value ? `Rated ${Number(value).toFixed(1)} out of 5` : "Not yet rated"}
    </span>
  </span>
);

/** Quantity control used by the cart and the product page. */
export const QuantityStepper = ({ value, onChange, min = 1, max = 99, disabled }) => {
  const clamp = (next) => Math.min(max, Math.max(min, next));

  return (
    <div className="inline-flex items-center rounded-md border border-line bg-surface">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-l-md text-content-secondary transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus size={15} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        className="type-numeric h-9 w-10 border-0 bg-transparent text-center text-body text-content outline-none"
        value={value}
        onChange={(event) => {
          const next = Number(event.target.value.replace(/\D/g, ""));
          if (next) onChange(clamp(next));
        }}
        aria-label="Quantity"
        disabled={disabled}
      />
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-r-md text-content-secondary transition-colors hover:bg-surface-hover disabled:opacity-40 disabled:hover:bg-transparent"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={15} />
      </button>
    </div>
  );
};

/** Section title with an optional aside, used between bands on the home page. */
export const SectionHeading = ({ eyebrow, title, description, action, className }) => (
  <div
    className={cn(
      "mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
      className
    )}
  >
    <div className="min-w-0">
      {eyebrow && <p className="type-overline mb-1 text-accent-text">{eyebrow}</p>}
      <h2 className="type-section-title text-[1.375rem] text-content">{title}</h2>
      {description && <p className="type-description mt-1 max-w-[60ch]">{description}</p>}
    </div>
    {action}
  </div>
);

/**
 * Product imagery.
 *
 * Every tile reserves the same aspect box before the image loads, so a grid
 * does not reflow as pictures arrive at different times.
 */
export const ProductImage = ({ src, alt, className, ratio = "square" }) => (
  <div
    className={cn(
      "overflow-hidden bg-surface-sunken",
      ratio === "square" ? "aspect-square" : "aspect-[4/5]",
      className
    )}
  >
    {src ? (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    ) : (
      <div className="flex h-full items-center justify-center type-caption text-content-disabled">
        No image
      </div>
    )}
  </div>
);
