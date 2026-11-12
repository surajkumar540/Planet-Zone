import { useId } from "react";
import cn from "../../lib/cn";

/**
 * Planet Zone brand mark: a single leaf with a curved midrib and a short stem.
 *
 * Colours come from the --brand-* tokens, not the accent. The accent is a user
 * preference and can be blue or purple; the brand has to stay recognisably
 * green whatever the interface is themed. Each theme gets its own steps:
 * - light: a deep green leaf with a near-white vein, so it does not wash out
 *   against white surfaces;
 * - dark: a brighter, lighter green with a vein in the canvas colour, so the
 *   leaf glows slightly instead of sinking into the background.
 */
export const LogoMark = ({ size = 28, className, title }) => {
  // useId returns ":r1:", which is not valid inside url(#…).
  const gradientId = `planet-leaf-${useId().replace(/:/g, "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      className={cn("shrink-0", className)}
    >
      {title && <title>{title}</title>}
      <defs>
        <linearGradient id={gradientId} x1="6" y1="26" x2="27" y2="5" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--brand-leaf-to)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand-leaf-from)" }} />
        </linearGradient>
      </defs>

      {/* Stem */}
      <path
        d="M8 24 L4.5 27.5"
        stroke="var(--brand-leaf-to)"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      {/* Leaf body: asymmetric, so it reads as a leaf rather than a lens. */}
      <path d="M8 24 C6.5 13.5 13.5 5.5 27 5 C26.5 18.5 18.5 25.5 8 24 Z" fill={`url(#${gradientId})`} />
      {/* Midrib, curving with the leaf */}
      <path
        d="M8 24 C12.5 19.5 17 14.5 22 9.5"
        stroke="var(--brand-vein)"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
};

const SIZES = {
  sm: { mark: 22, text: "text-[0.9375rem]", gap: "gap-1.5" },
  md: { mark: 28, text: "text-[1.0625rem]", gap: "gap-2" },
  lg: { mark: 34, text: "text-[1.25rem]", gap: "gap-2.5" },
};

/** Mark plus "Planet Zone" wordmark. `showText={false}` gives the mark alone. */
const Logo = ({ size = "md", showText = true, className }) => {
  const scale = SIZES[size] || SIZES.md;
  return (
    <span className={cn("inline-flex items-center", scale.gap, className)}>
      <LogoMark size={scale.mark} title={showText ? undefined : "Planet Zone"} />
      {showText && (
        <span className={cn("font-semibold tracking-tight text-content leading-none", scale.text)}>
          Planet <span className="text-[color:var(--brand-text)]">Zone</span>
        </span>
      )}
    </span>
  );
};

export default Logo;
