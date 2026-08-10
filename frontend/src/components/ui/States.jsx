import { AlertTriangle, Inbox, RefreshCw, SearchX } from "lucide-react";
import Button from "./Button";
import cn from "../../lib/cn";

/**
 * Empty state.
 *
 * Distinguishes "nothing exists yet" from "nothing matched your filters" —
 * the two need different wording and different actions, and conflating them
 * is a common way to make an app feel broken.
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description,
  action,
  filtered = false,
  onClear,
  className,
}) => (
  <div className={cn("flex flex-col items-center justify-center text-center px-6 py-14", className)}>
    <div className="w-12 h-12 rounded-full bg-surface-sunken flex items-center justify-center mb-4">
      {filtered ? (
        <SearchX size={22} className="text-content-muted" aria-hidden="true" />
      ) : (
        <Icon size={22} className="text-content-muted" aria-hidden="true" />
      )}
    </div>

    <h3 className="type-card-title text-content">
      {filtered ? "No matches found" : title}
    </h3>
    <p className="type-description mt-1 max-w-sm">
      {filtered
        ? "Try adjusting or clearing your filters to see more results."
        : description}
    </p>

    <div className="mt-5 flex items-center gap-2">
      {filtered && onClear && (
        <Button variant="secondary" onClick={onClear}>
          Clear filters
        </Button>
      )}
      {!filtered && action}
    </div>
  </div>
);

/** Error state, with the failure reason and a way to retry. */
export const ErrorState = ({
  title = "Something went wrong",
  description,
  onRetry,
  className,
}) => (
  <div
    role="alert"
    className={cn("flex flex-col items-center justify-center text-center px-6 py-14", className)}
  >
    <div className="w-12 h-12 rounded-full bg-status-critical-bg flex items-center justify-center mb-4">
      <AlertTriangle size={22} className="text-status-critical" aria-hidden="true" />
    </div>

    <h3 className="type-card-title text-content">{title}</h3>
    <p className="type-description mt-1 max-w-sm">
      {description || "We could not load this right now. Please try again."}
    </p>

    {onRetry && (
      <Button variant="secondary" icon={RefreshCw} onClick={onRetry} className="mt-5">
        Try again
      </Button>
    )}
  </div>
);

export default EmptyState;
