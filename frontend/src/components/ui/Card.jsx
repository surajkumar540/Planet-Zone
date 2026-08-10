import cn from "../../lib/cn";

/**
 * The surface every dashboard panel sits on.
 *
 * `variant="chart"` switches to the surface the data-viz palette was validated
 * against, so series colours keep their measured contrast.
 */
export const Card = ({ variant = "default", className, children, ...props }) => (
  <div
    className={cn(
      "rounded-lg border border-line-subtle shadow-xs",
      variant === "chart" ? "bg-surface-chart" : "bg-surface-raised",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ title, description, actions, className, children }) => (
  <div
    className={cn(
      "flex items-start justify-between gap-4 px-5 py-4 border-b border-line-subtle",
      className
    )}
  >
    <div className="min-w-0">
      {title && <h3 className="type-card-title text-content truncate">{title}</h3>}
      {description && <p className="type-caption mt-0.5">{description}</p>}
      {children}
    </div>
    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

export const CardBody = ({ className, children, ...props }) => (
  <div className={cn("p-5", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children }) => (
  <div className={cn("px-5 py-3 border-t border-line-subtle bg-surface-sunken", className)}>
    {children}
  </div>
);

export default Card;
