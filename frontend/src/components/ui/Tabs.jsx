import cn from "../../lib/cn";

/**
 * Horizontal tab bar.
 *
 * Scrolls rather than wrapping on narrow screens, so the row height stays
 * predictable and the page never grows a horizontal scrollbar.
 */
const Tabs = ({ tabs, value, onChange, className }) => (
  <div
    role="tablist"
    className={cn("flex gap-1 overflow-x-auto border-b border-line-subtle", className)}
  >
    {tabs.map((tab) => {
      const active = tab.value === value;
      return (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(tab.value)}
          className={cn(
            "relative px-3.5 py-2.5 type-body-strong whitespace-nowrap transition-colors",
            "border-b-2 -mb-px",
            active
              ? "text-accent-text border-[var(--accent-solid)]"
              : "text-content-muted border-transparent hover:text-content"
          )}
        >
          <span className="flex items-center gap-2">
            {tab.icon && <tab.icon size={15} aria-hidden="true" />}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-caption",
                  active ? "bg-accent-subtle text-accent-text" : "bg-surface-sunken text-content-muted"
                )}
              >
                {tab.count}
              </span>
            )}
          </span>
        </button>
      );
    })}
  </div>
);

export default Tabs;
