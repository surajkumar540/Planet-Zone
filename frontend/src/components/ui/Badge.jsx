import cn from "../../lib/cn";

/**
 * Status colours are paired with their label text, never carrying meaning
 * through colour alone.
 */
const TONES = {
  neutral: "bg-surface-sunken text-content-secondary border-line",
  accent: "bg-accent-subtle text-accent-text border-transparent",
  good: "bg-status-good-bg text-status-good border-transparent",
  warning: "bg-status-warning-bg text-status-warning border-transparent",
  serious: "bg-status-serious-bg text-status-serious border-transparent",
  critical: "bg-status-critical-bg text-status-critical border-transparent",
  info: "bg-status-info-bg text-status-info border-transparent",
};

const SIZES = {
  sm: "px-1.5 py-0.5 text-caption",
  md: "px-2 py-0.5 text-label",
};

const Badge = ({ tone = "neutral", size = "sm", dot = false, icon: Icon, className, children }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium whitespace-nowrap",
      TONES[tone] || TONES.neutral,
      SIZES[size] || SIZES.sm,
      className
    )}
  >
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" aria-hidden="true" />}
    {Icon && <Icon size={12} className="shrink-0" aria-hidden="true" />}
    {children}
  </span>
);

export default Badge;
