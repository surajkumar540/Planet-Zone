import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { formatNumber } from "../../lib/format";
import cn from "../../lib/cn";

/**
 * Counts for each quick tab, one `limit: 1` request per tab read from
 * `meta.total`. Cheap, parallel, and always the server's real numbers.
 * Bump `version` (e.g. after a save) to refresh them.
 */
export const useTabCounts = (fetcher, baseParams, tabs, version = 0) => {
  const [counts, setCounts] = useState({});
  const key = JSON.stringify([baseParams, tabs.map((tab) => [tab.value, tab.params])]);

  useEffect(() => {
    let active = true;
    Promise.all(
      tabs.map((tab) =>
        fetcher({ ...baseParams, ...tab.params, page: 1, limit: 1 })
          .then((response) => [tab.value, response?.meta?.total ?? null])
          .catch(() => [tab.value, null])
      )
    ).then((entries) => active && setCounts(Object.fromEntries(entries)));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- compared by value via `key`.
  }, [key, version]);

  return counts;
};

/**
 * Pill tabs for the common slices of a list ("To pack", "Low stock"…),
 * each with its count. The active pill slides between tabs.
 */
export const QuickTabs = ({ tabs, value, onChange, counts = {}, id = "tabs" }) => (
  <div className="-mx-1 overflow-x-auto px-1 [scrollbar-width:none]">
    <div className="flex w-max gap-1" role="tablist">
      {tabs.map((tab) => {
        const active = tab.value === value;
        const count = counts[tab.value];
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.8125rem] font-medium transition-colors",
              active ? "text-accent-on" : "text-content-secondary hover:bg-surface-hover hover:text-content"
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-active`}
                className="absolute inset-0 rounded-full bg-accent shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            {tab.icon && <tab.icon size={14} className="relative" />}
            <span className="relative whitespace-nowrap">{tab.label}</span>
            {count !== undefined && count !== null && (
              <span
                className={cn(
                  "relative min-w-[1.375rem] rounded-full px-1.5 py-px text-center text-[0.6875rem] font-semibold type-numeric",
                  active
                    ? "bg-white/25 text-accent-on"
                    : tab.alert && count > 0
                      ? "bg-status-warning-bg text-status-warning"
                      : "bg-surface-sunken text-content-muted"
                )}
              >
                {formatNumber(count)}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

/**
 * The bar above every dashboard list: quick tabs on top, then search and
 * filters, with the number of results on the right.
 */
const ListToolbar = ({ tabs, search, filters, total, noun = "results" }) => (
  <div className="border-b border-line-subtle">
    {tabs && <div className="border-b border-line-subtle px-3 py-2.5">{tabs}</div>}
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      {search && <div className="w-full sm:max-w-sm sm:flex-1">{search}</div>}
      {filters && <div className="flex flex-wrap gap-2">{filters}</div>}
      {total !== undefined && total !== null && (
        <p className="type-caption text-content-muted sm:ml-auto">
          <span className="type-numeric font-semibold text-content">{formatNumber(total)}</span> {noun}
        </p>
      )}
    </div>
  </div>
);

export default ListToolbar;
