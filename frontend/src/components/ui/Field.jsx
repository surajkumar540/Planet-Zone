import { forwardRef, useId, useState } from "react";
import { Select as AntdSelect } from "antd";
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
 * A field has to read as an editable box before it is focused, so the resting
 * border is `line-strong` rather than `line`: the subtle step is right for a
 * divider between blocks of content, but on a control it dissolved into the
 * card behind it and left the input looking like plain text. The sunken fill
 * reinforces the same thing, and lifts to the plain surface on focus.
 *
 * Focus is carried by the border itself rather than an outer ring. The border
 * is a constant 1.5px so the accent can take it over on focus without the
 * control changing size and nudging the layout — the usual failure of a
 * border-only focus state.
 *
 * An invalid control keeps its red edge while focused, so the focus state
 * never hides the error.
 */
const controlClasses = (invalid, className) =>
  cn(
    "w-full text-content type-body rounded-md border-[1.5px] outline-none",
    "transition-[color,background-color,border-color] duration-150",
    "placeholder:text-content-disabled",
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:hover:border-line-strong",
    invalid
      ? "border-status-critical bg-surface"
      : cn(
          "border-line-strong bg-surface-sunken",
          "hover:border-content-muted",
          "focus:border-accent focus:bg-surface"
        ),
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

/**
 * Select.
 *
 * Ant Design's Select, wrapped so it keeps this app's field contract. The
 * hand-rolled listbox it replaces had to implement its own typeahead, flip
 * detection, scroll-into-view and outside-click handling; antd brings those
 * plus virtual scrolling for long option lists.
 *
 * `onChange` still receives an event-shaped object, so call sites keep reading
 * `event.target.value` exactly as they did with the native control.
 *
 * A native `<select>` stays behind the trigger mirroring the value. It carries
 * `required`, so the browser's own form validation keeps working — antd's
 * component is not a form control and would silently drop the required check
 * on every form using this.
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

  // Past a handful of options, scanning beats reading: turn on filtering.
  const searchable = options.length > 8;

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
      <div className="relative">
        <AntdSelect
          id={inputId}
          value={value === "" || value === undefined ? undefined : value}
          onChange={(next) =>
            onChange?.({
              target: { value: next, name },
              currentTarget: { value: next, name },
            })
          }
          options={options}
          placeholder={placeholder}
          disabled={disabled}
          status={error ? "error" : undefined}
          size={size === "sm" ? "small" : size === "lg" ? "large" : "middle"}
          className={cn("w-full", className)}
          popupMatchSelectWidth
          showSearch={searchable}
          optionFilterProp="label"
          suffixIcon={<ChevronDown size={15} className="text-content-muted" />}
          menuItemSelectedIcon={<Check size={15} />}
          {...props}
        />

        {/*
          Sized to the trigger and transparent rather than hidden outright: a
          zero-sized or `display:none` control cannot be focused, and the
          browser refuses to report a validation message it cannot anchor.
        */}
        <select
          tabIndex={-1}
          aria-hidden="true"
          required={required}
          disabled={disabled}
          name={name}
          value={value ?? ""}
          onChange={() => {}}
          className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
        >
          <option value="" />
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
