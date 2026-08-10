import cn from "../../lib/cn";

/**
 * Loading placeholder.
 *
 * Skeletons mirror the shape of the content they stand in for, so the layout
 * does not jump when real data replaces them.
 */
export const Skeleton = ({ className, ...props }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-md bg-surface-sunken",
      "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer",
      "after:bg-gradient-to-r after:from-transparent after:via-black/[0.04] after:to-transparent",
      "dark:after:via-white/[0.06]",
      className
    )}
    aria-hidden="true"
    {...props}
  />
);

export const SkeletonText = ({ lines = 3, className }) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        className={cn("h-3.5", index === lines - 1 ? "w-2/3" : "w-full")}
      />
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="p-5 space-y-3" role="status" aria-label="Loading">
    <div className="flex gap-4">
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="h-3 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4 items-center">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-9 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonStat = () => (
  <div className="p-5 space-y-3">
    <Skeleton className="h-3 w-24" />
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-3 w-20" />
  </div>
);

export const SkeletonChart = ({ height = 280 }) => (
  <div className="p-5" style={{ height }} role="status" aria-label="Loading chart">
    <div className="h-full flex items-end gap-2">
      {[45, 70, 55, 85, 60, 92, 48, 76, 66, 88, 52, 70].map((value, index) => (
        <Skeleton key={index} className="flex-1 rounded-t-md" style={{ height: `${value}%` }} />
      ))}
    </div>
  </div>
);

export default Skeleton;
