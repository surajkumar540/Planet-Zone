import { forwardRef, useId } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
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
      hint && <p className="type-caption">{hint}</p>
    )}
  </div>
);

const controlClasses = (invalid, className) =>
  cn(
    "w-full bg-surface text-content type-body rounded-md border transition-colors",
    "placeholder:text-content-disabled",
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-sunken",
    invalid ? "border-status-critical" : "border-line hover:border-line-strong",
    className
  );

export const Input = forwardRef(
  ({ label, hint, error, required, icon: Icon, suffix, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <div className="relative flex items-center">
          {Icon && (
            <Icon
              size={16}
              className="absolute left-3 text-content-muted pointer-events-none"
              aria-hidden="true"
            />
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error) || undefined}
            aria-required={required || undefined}
            className={controlClasses(
              error,
              cn("h-control px-3", Icon && "pl-9", suffix && "pr-10", className)
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 type-caption text-content-muted pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
      </Field>
    );
  }
);
Input.displayName = "Input";

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
          className={controlClasses(error, cn("px-3 py-2 resize-y", className))}
          {...props}
        />
      </Field>
    );
  }
);
Textarea.displayName = "Textarea";

export const Select = forwardRef(
  ({ label, hint, error, required, options = [], placeholder, className, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <Field label={label} hint={hint} error={error} required={required} htmlFor={inputId}>
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error) || undefined}
            className={controlClasses(error, cn("h-control pl-3 pr-9 appearance-none", className))}
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
Select.displayName = "Select";

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
            "peer-focus-visible:ring-2 peer-focus-visible:ring-accent-ring peer-focus-visible:ring-offset-2"
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
          {description && <span className="type-caption block mt-0.5">{description}</span>}
        </span>
      )}
    </label>
  );
};

export const Checkbox = ({ checked, onChange, label, disabled, id, indeterminate }) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer select-none",
        disabled && "opacity-60 cursor-not-allowed"
      )}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        ref={(node) => {
          if (node) node.indeterminate = Boolean(indeterminate) && !checked;
        }}
        onChange={(event) => onChange?.(event.target.checked)}
        className="w-4 h-4 rounded-sm border-line accent-[var(--accent-solid)] cursor-pointer"
      />
      {label && <span className="type-body text-content">{label}</span>}
    </label>
  );
};

export default Field;
