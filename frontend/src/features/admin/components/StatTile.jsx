import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { SkeletonStat } from "../../../components/ui/Skeleton";
import { formatPercent } from "../../../lib/format";
import cn from "../../../lib/cn";

/**
 * Headline metric with its period-over-period change.
 *
 * The delta pairs an arrow with the sign so direction is never carried by
 * colour alone, and `invertDelta` covers metrics where a rise is bad.
 */
const StatTile = ({
  label,
  value,
  change,
  icon: Icon,
  loading,
  hint,
  invertDelta = false,
  children,
}) => {
  if (loading) {
    return (
      <Card>
        <SkeletonStat />
      </Card>
    );
  }

  const hasChange = change !== undefined && change !== null;
  const isFlat = !hasChange || Math.abs(change) < 0.05;
  const isGood = invertDelta ? change < 0 : change > 0;
  const DeltaIcon = isFlat ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="type-label text-content-muted">{label}</p>
        {Icon && (
          <span className="w-8 h-8 rounded-md bg-accent-subtle text-accent-text grid place-items-center shrink-0">
            <Icon size={16} aria-hidden="true" />
          </span>
        )}
      </div>

      <p className="type-display type-numeric text-content mt-2">{value}</p>

      <div className="flex items-center gap-2 mt-2 min-h-[20px]">
        {hasChange && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 type-caption font-medium",
              isFlat
                ? "text-content-muted"
                : isGood
                  ? "text-status-good"
                  : "text-status-critical"
            )}
          >
            <DeltaIcon size={13} aria-hidden="true" />
            {isFlat ? "No change" : formatPercent(change)}
          </span>
        )}
        {hint && <span className="type-caption">{hint}</span>}
      </div>

      {children}
    </Card>
  );
};

export default StatTile;
