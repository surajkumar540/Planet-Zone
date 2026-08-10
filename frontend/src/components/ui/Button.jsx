import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import cn from "../../lib/cn";

/**
 * Variants are named by intent rather than colour, so a re-theme never
 * requires touching call sites.
 */
const VARIANTS = {
  primary:
    "bg-accent text-accent-on hover:bg-accent-hover shadow-xs disabled:hover:bg-accent",
  secondary:
    "bg-surface text-content border border-line hover:bg-surface-hover disabled:hover:bg-surface",
  subtle: "bg-accent-subtle text-accent-text hover:bg-accent-subtle-hover",
  ghost: "text-content-secondary hover:bg-surface-hover hover:text-content",
  danger: "bg-status-critical text-white hover:opacity-90 shadow-xs",
  "danger-subtle":
    "bg-status-critical-bg text-status-critical hover:brightness-95 dark:hover:brightness-110",
  link: "text-accent-text hover:underline underline-offset-4 p-0 h-auto",
};

const SIZES = {
  sm: "h-control-sm px-2.5 gap-1.5 text-caption rounded-sm",
  md: "h-control px-3.5 gap-2 rounded-md",
  lg: "h-control-lg px-5 gap-2 rounded-md",
  icon: "h-control w-control p-0 rounded-md",
  "icon-sm": "h-control-sm w-control-sm p-0 rounded-sm",
};

/**
 * The single button in the system.
 *
 * Renders as `<button>` by default; pass `as={Link}` to keep the styling on a
 * navigation element without losing its semantics.
 */
const Button = forwardRef(
  (
    {
      as: Component = "button",
      variant = "secondary",
      size = "md",
      loading = false,
      icon: Icon,
      iconRight: IconRight,
      fullWidth = false,
      className,
      children,
      disabled,
      type,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;
    const iconOnly = size === "icon" || size === "icon-sm";

    return (
      <Component
        ref={ref}
        // Only set a type when actually rendering a button element.
        type={Component === "button" ? type || "button" : undefined}
        disabled={Component === "button" ? isDisabled : undefined}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        className={cn(
          "type-button inline-flex items-center justify-center whitespace-nowrap",
          "transition-colors duration-150 select-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          VARIANTS[variant] || VARIANTS.secondary,
          SIZES[size] || SIZES.md,
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin shrink-0" aria-hidden="true" />
        ) : (
          Icon && <Icon size={iconOnly ? 18 : 16} className="shrink-0" aria-hidden="true" />
        )}
        {!iconOnly && children}
        {!iconOnly && IconRight && !loading && (
          <IconRight size={16} className="shrink-0" aria-hidden="true" />
        )}
      </Component>
    );
  }
);

Button.displayName = "Button";

export default Button;
