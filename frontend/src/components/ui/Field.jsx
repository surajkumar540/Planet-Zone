import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Check, ChevronDown, Eye, EyeOff, Minus, X } from "lucide-react";
import cn from "../../lib/cn";

/**
 * Shared wrapper giving every control the same label, hint and error layout,
 * and wiring the accessibility relationships between them.
 */
export const Field = ({ label, hint, error, required, htmlFor, className, children }) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    {label && (
      <label htmlFor={htmlFor} className="type-label text-content-secondary">
        {label}
        {required && (
          <span className="text-status-critical ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
    )}

    {children}

    {/* An error replaces the hint rather than stacking, so the row height is stable. */}
    {error ? (
      <p className="type-caption text-status-critical flex items-center gap-1" role="alert">
        <AlertCircle size={12} className="shrink-0" aria-hidden="true" />
        {error}
      </p>
    ) : (
      hint && <p className="type-caption text-content-muted">{hint}</p>
    )}
  </div>
);

const SIZES = {
  sm: "h-control-sm text-caption",
  md: "h-control",
  lg: "h-control-lg",
};

/**
 * The visual shell every control shares.
 *
 * Focus is a ring plus an accent border rather than a border alone: a colour
 * change on a one-pixel edge is easy to miss, and the ring is what makes the
 * focused control obvious at a glance in both themes. An invalid control keeps
 * its red edge while focused, so the focus state never hides the error.
 */
const controlClasses = (invalid, className) =>
  cn(
    "w-full bg-surface text-content type-body rounded-md border outline-none",
    "transition-[color,background-color,border-color,box-shadow] duration-150",
    "placeholder:text-content-disabled",
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:hover:border-line",
    invalid
      ? "border-status-critical focus:ring-2 focus:ring-status-critical-bg"
      : "border-line hover:border-line-strong focus:border-accent focus:ring-2 focus:ring-[var(--accent-ring)]",
    className
  );

/* ---------------------------------- Input ---------------------------------- */

export const Input = forwardRef(
  (
    {
      label,
      hint,
      error,
      required,
      icon: Icon,
      suffix,
      trailing,
      size = "md",
      clearable = false,
      onClear,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    // Only offer the clear affordance once there is something to clear.
    const showClear = clearable && !props.disabled && String(props.value ?? "").length > 0;

    return (
      <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <div className="relative flex items-center">
          {Icon && (
            <Icon
              size={16}
              className="absolute left-3 text-content-muted pointer-events-none z-10"
              aria-hidden="true"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error) || undefined}
            aria-required={required || undefined}
            required={required}
            className={controlClasses(
              error,
              cn(
                "px-3",
                SIZES[size] || SIZES.md,
                Icon && "pl-9",
                (suffix || showClear || trailing) && "pr-10",
                className
              )
            )}
            {...props}
          />

          {/* Interactive slot, vertically centred by the flex row rather than a
              hand-tuned offset that breaks with the control size. */}
          {trailing && <span className="absolute right-2 flex items-center">{trailing}</span>}

          {showClear ? (
            <button
              type="button"
              onClick={() => onClear?.()}
              aria-label="Clear"
              className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-sm text-content-muted transition-colors hover:bg-surface-hover hover:text-content"
            >
              <X size={14} />
            </button>
          ) : (
            suffix && (
              <span className="absolute right-3 type-caption text-content-muted pointer-events-none">
                {suffix}
              </span>
            )
          )}
        </div>
      </Field>
    );
  }
);
Input.displayName = "Input";

/**
 * Password field with a reveal toggle.
 *
 * Separate from `Input` because the toggle occupies the same slot as `suffix`
 * and has to stay clickable, which a decorative suffix never is. The button is
 * excluded from the tab order: it is a convenience, and stopping between every
 * password field and the next control would slow the form down for keyboard
 * users.
 */
export const PasswordInput = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      ref={ref}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="flex h-7 w-7 items-center justify-center rounded-sm text-content-muted transition-colors hover:bg-surface-hover hover:text-content"
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
      {...props}
    />
  );
});
PasswordInput.displayName = "PasswordInput";

/* -------------------------------- Textarea --------------------------------- */

export const Textarea = forwardRef(
  ({ label, hint, error, required, rows = 4, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          aria-invalid={Boolean(error) || undefined}
          required={required}
          className={controlClasses(error, cn("px-3 py-2 resize-y leading-relaxed", className))}
          {...props}
        />
      </Field>
    );
  }
);
Textarea.displayName = "Textarea";

/* --------------------------------- Select ---------------------------------- */

/**
 * Native select, kept for the rare case where the platform picker is the right
 * answer — long option lists on mobile, or a control inside a dense table row.
 */
export const NativeSelect = forwardRef(
  (
    { label, hint, error, required, options = [], placeholder, size = "md", className, id, ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error) || undefined}
            required={required}
            className={controlClasses(
              error,
              cn("pl-3 pr-9 appearance-none cursor-pointer", SIZES[size] || SIZES.md, className)
            )}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </Field>
    );
  }
);
NativeSelect.displayName = "NativeSelect";

/** Matches an option list against typed characters for keyboard typeahead. */
const findByPrefix = (options, prefix, from = 0) => {
  const lower = prefix.toLowerCase();
  const ordered = [...options.slice(from), ...options.slice(0, from)];
  return ordered.find((option) => String(option.label).toLowerCase().startsWith(lower));
};

/**
 * Select.
 *
 * A listbox rather than a native `<select>`, because the browser's own popup
 * cannot be styled: it renders in the OS palette, so on the dark theme the
 * open list arrives as a sheet of white. This version paints the list from the
 * same tokens as everything else and gives each option room to breathe.
 *
 * The native element is still present behind the trigger, mirroring the value.
 * It carries `required`, so the browser's own form validation keeps working —
 * removing it would silently drop the required check on every form using this.
 *
 * `onChange` receives an event-shaped object, so call sites keep reading
 * `event.target.value` exactly as they did with the native control.
 */
export const Select = ({
  label,
  hint,
  error,
  required,
  options = [],
  placeholder = "Select an option",
  value,
  onChange,
  disabled,
  name,
  size = "md",
  className,
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const listId = `${inputId}-listbox`;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);

  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const nativeRef = useRef(null);
  const typeahead = useRef({ term: "", timer: 0 });

  const selectedIndex = useMemo(
    () => options.findIndex((option) => String(option.value) === String(value ?? "")),
    [options, value]
  );
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const commit = useCallback(
    (option) => {
      // Shaped like a change event so existing `event.target.value` callers work.
      onChange?.({
        target: { value: option.value, name },
        currentTarget: { value: option.value, name },
      });
      setOpen(false);
      triggerRef.current?.focus();
    },
    [name, onChange]
  );

  // Opening lands on the current selection, so arrow keys continue from there.
  const openList = useCallback(() => {
    if (disabled) return;
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }, [disabled, selectedIndex]);

  // Flip above the trigger when the list would run off the bottom of the window.
  useLayoutEffect(() => {
    if (!open) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const needed = Math.min(options.length * 36 + 8, 280);
    setDropUp(rect.bottom + needed > window.innerHeight && rect.top > needed);
  }, [open, options.length]);

  // Keep the active option in view while arrowing through a long list.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return undefined;

    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    // A scroll elsewhere on the page would leave the list detached from its
    // trigger, so close rather than chase it.
    const onScroll = (event) => {
      if (!listRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  const onKeyDown = (event) => {
    const { key } = event;

    if (!open) {
      if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " ") {
        event.preventDefault();
        openList();
      }
      return;
    }

    if (key === "Escape" || key === "Tab") {
      setOpen(false);
      if (key === "Escape") event.preventDefault();
      return;
    }

    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => {
        const step = key === "ArrowDown" ? 1 : -1;
        const next = current + step;
        if (next < 0) return options.length - 1;
        if (next >= options.length) return 0;
        return next;
      });
      return;
    }

    if (key === "Home" || key === "End") {
      event.preventDefault();
      setActiveIndex(key === "Home" ? 0 : options.length - 1);
      return;
    }

    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (options[activeIndex]) commit(options[activeIndex]);
      return;
    }

    // Typeahead: printable characters jump to the first matching label.
    if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      window.clearTimeout(typeahead.current.timer);
      typeahead.current.term += key;
      typeahead.current.timer = window.setTimeout(() => {
        typeahead.current.term = "";
      }, 600);

      const match = findByPrefix(options, typeahead.current.term, Math.max(activeIndex, 0));
      if (match) setActiveIndex(options.indexOf(match));
    }
  };

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
      <div className="relative" ref={wrapperRef}>
        <button
          ref={triggerRef}
          id={inputId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-required={required || undefined}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onKeyDown}
          className={controlClasses(
            error,
            cn(
              "flex items-center justify-between gap-2 pl-3 pr-2 text-left cursor-pointer",
              SIZES[size] || SIZES.md,
              open && !error && "border-accent ring-2 ring-[var(--accent-ring)]",
              className
            )
          )}
          {...props}
        >
          <span className={cn("truncate", !selected && "text-content-disabled")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-content-muted transition-transform duration-150",
              open && "rotate-180"
            )}
            aria-hidden="true"
          />
        </button>

        {/*
          Mirrors the value for native form validation. It sits behind the
          trigger at full size rather than being hidden outright: a zero-sized
          or display:none control cannot be focused, and the browser refuses to
          report a validation message it cannot anchor to anything.
        */}
        <select
          ref={nativeRef}
          tabIndex={-1}
          aria-hidden="true"
          required={required}
          disabled={disabled}
          name={name}
          value={value ?? ""}
          onChange={() => {}}
          className="absolute inset-0 h-full w-full opacity-0 pointer-events-none"
        >
          <option value="" />
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-labelledby={inputId}
            className={cn(
              "absolute z-50 max-h-[17.5rem] w-full overflow-y-auto rounded-md border border-line",
              "bg-surface-overlay p-1 shadow-lg animate-slide-up",
              dropUp ? "bottom-full mb-1" : "top-full mt-1"
            )}
          >
            {options.length === 0 && (
              <li className="px-2.5 py-2 type-caption text-content-muted">No options</li>
            )}

            {options.map((option, index) => {
              const isSelected = index === selectedIndex;
              const isActive = index === activeIndex;

              return (
                <li
                  key={option.value}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  // Pointer down rather than click: the trigger's blur would
                  // otherwise close the list before the click landed.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    commit(option);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2.5 py-2",
                    "type-body transition-colors",
                    isActive ? "bg-surface-hover text-content" : "text-content-secondary",
                    isSelected && "text-accent-text font-medium"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={15} className="shrink-0" aria-hidden="true" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Field>
  );
};

/* --------------------------------- Toggles --------------------------------- */

/** Accessible switch built on a checkbox so it works with native form semantics. */
export const Switch = ({ checked, onChange, label, description, disabled, id }) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "flex items-start gap-3 cursor-pointer select-none",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          checked={Boolean(checked)}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "w-9 h-5 rounded-full transition-colors",
            "bg-line-strong peer-checked:bg-accent",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-ring)] peer-focus-visible:ring-offset-2"
          )}
        />
        <span
          className={cn(
            "absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm",
            "transition-transform peer-checked:translate-x-4"
          )}
        />
      </span>

      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="type-body-strong text-content block">{label}</span>}
          {description && <span className="type-caption text-content-muted block mt-0.5">{description}</span>}
        </span>
      )}
    </label>
  );
};

/**
 * Checkbox.
 *
 * The native box is kept for semantics and hidden from view, with the visible
 * square drawn alongside it — `accent-color` alone cannot give the checked box
 * the same corner radius, border and focus ring as the rest of the controls.
 */
export const Checkbox = ({ checked, onChange, label, description, disabled, id, indeterminate }) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const isIndeterminate = Boolean(indeterminate) && !checked;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-start gap-2.5 cursor-pointer select-none",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <span className="relative inline-flex shrink-0 mt-px">
        <input
          id={inputId}
          type="checkbox"
          checked={Boolean(checked)}
          disabled={disabled}
          ref={(node) => {
            if (node) node.indeterminate = isIndeterminate;
          }}
          onChange={(event) => onChange?.(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className={cn(
            "flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-sm border",
            "transition-colors duration-150",
            checked || isIndeterminate
              ? "border-accent bg-accent text-accent-on"
              : "border-line-strong bg-surface peer-hover:border-accent",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-ring)] peer-focus-visible:ring-offset-1"
          )}
          aria-hidden="true"
        >
          {checked && <Check size={12} strokeWidth={3} />}
          {isIndeterminate && <Minus size={12} strokeWidth={3} />}
        </span>
      </span>

      {(label || description) && (
        <span className="min-w-0">
          {label && <span className="type-body text-content block">{label}</span>}
          {description && (
            <span className="type-caption text-content-muted block mt-0.5">{description}</span>
          )}
        </span>
      )}
    </label>
  );
};

export default Field;
