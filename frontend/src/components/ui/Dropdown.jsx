import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import cn from "../../lib/cn";

/**
 * Popover menu anchored to a trigger.
 *
 * Closes on outside click and on Escape, and flips its horizontal alignment so
 * it cannot open off the edge of the viewport.
 */
const Dropdown = ({ trigger, children, align = "end", className, menuClassName }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div onClick={() => setOpen((current) => !current)}>
        {typeof trigger === "function" ? trigger({ open }) : trigger}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.13, ease: [0.16, 1, 0.3, 1] }}
            // Closing on click lets menu items act without managing state themselves.
            onClick={() => setOpen(false)}
            className={cn(
              "absolute z-50 mt-1.5 min-w-[190px] py-1",
              "rounded-lg border border-line bg-surface-overlay shadow-lg",
              align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
              menuClassName
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownItem = ({
  icon: Icon,
  children,
  onClick,
  tone = "default",
  disabled,
  as: Component = "button",
  ...props
}) => (
  <Component
    type={Component === "button" ? "button" : undefined}
    role="menuitem"
    disabled={Component === "button" ? disabled : undefined}
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-2.5 px-3 py-2 type-body text-left transition-colors",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      tone === "danger"
        ? "text-status-critical hover:bg-status-critical-bg"
        : "text-content-secondary hover:bg-surface-hover hover:text-content"
    )}
    {...props}
  >
    {Icon && <Icon size={15} className="shrink-0" aria-hidden="true" />}
    {children}
  </Component>
);

export const DropdownLabel = ({ children }) => (
  <p className="type-overline px-3 pt-2 pb-1">{children}</p>
);

export const DropdownSeparator = () => <div className="h-px bg-line-subtle my-1" role="separator" />;

export default Dropdown;
