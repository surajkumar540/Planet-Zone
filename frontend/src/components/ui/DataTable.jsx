import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import Button from "./Button";
import { SkeletonTable } from "./Skeleton";
import { EmptyState, ErrorState } from "./States";
import cn from "../../lib/cn";

/**
 * Table for dashboard listings.
 *
 * Columns declare their own rendering, alignment and sort key, so a screen
 * describes its data rather than repeating markup. Owns its loading, error and
 * empty presentation so every list behaves the same way.
 *
 * Responsiveness: the table scrolls horizontally inside its own container on
 * narrow screens, and columns marked `hideBelow` drop out entirely — the page
 * itself never scrolls sideways.
 */
const HIDE_CLASSES = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

const alignClass = (align) =>
  align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

const DataTable = ({
  columns,
  rows,
  keyField = "_id",
  loading = false,
  error = null,
  onRetry,
  sort,
  onSortChange,
  onRowClick,
  emptyState,
  filtered = false,
  onClearFilters,
  meta,
  onPageChange,
  className,
}) => {
  if (loading) return <SkeletonTable rows={6} columns={columns.length} />;

  if (error) {
    return <ErrorState description={error} onRetry={onRetry} />;
  }

  if (!rows || rows.length === 0) {
    return (
      emptyState || (
        <EmptyState filtered={filtered} onClear={onClearFilters} title="No records yet" />
      )
    );
  }

  const [sortField, sortDirection] = (sort || "").split(":");

  const toggleSort = (field) => {
    if (!onSortChange) return;
    const nextDirection = sortField === field && sortDirection === "desc" ? "asc" : "desc";
    onSortChange(`${field}:${nextDirection}`);
  };

  return (
    <div className={className}>
      {/* The scroll container is the table's own, so wide tables never push the page. */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-line-subtle">
              {columns.map((column) => {
                const isSorted = sortField === column.sortKey;
                const SortIcon = !isSorted
                  ? ChevronsUpDown
                  : sortDirection === "asc"
                    ? ArrowUp
                    : ArrowDown;

                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      isSorted ? (sortDirection === "asc" ? "ascending" : "descending") : undefined
                    }
                    style={column.width ? { width: column.width } : undefined}
                    className={cn(
                      "type-label text-content-muted font-medium px-4 py-3 whitespace-nowrap",
                      alignClass(column.align),
                      column.hideBelow && HIDE_CLASSES[column.hideBelow]
                    )}
                  >
                    {column.sortKey && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.sortKey)}
                        className={cn(
                          "inline-flex items-center gap-1 hover:text-content transition-colors",
                          isSorted && "text-content"
                        )}
                      >
                        {column.header}
                        <SortIcon size={13} aria-hidden="true" />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row[keyField] ?? rowIndex}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-line-subtle last:border-0 transition-colors",
                  onRowClick && "cursor-pointer hover:bg-surface-hover"
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "type-table text-content px-4 py-3",
                      alignClass(column.align),
                      column.numeric && "type-numeric",
                      column.hideBelow && HIDE_CLASSES[column.hideBelow]
                    )}
                  >
                    {column.render ? column.render(row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <Pagination meta={meta} onPageChange={onPageChange} />
      )}
    </div>
  );
};

/** Page controls, showing the visible range so the list's size is legible. */
export const Pagination = ({ meta, onPageChange }) => {
  const { page, limit, total, totalPages, hasNextPage, hasPreviousPage } = meta;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-line-subtle">
      <p className="type-caption">
        Showing <span className="text-content font-medium">{from}</span>–
        <span className="text-content font-medium">{to}</span> of{" "}
        <span className="text-content font-medium">{total}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="secondary"
          size="sm"
          icon={ChevronLeft}
          disabled={!hasPreviousPage}
          onClick={() => onPageChange?.(page - 1)}
        >
          Previous
        </Button>
        <span className="type-caption px-2">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          iconRight={ChevronRight}
          disabled={!hasNextPage}
          onClick={() => onPageChange?.(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default DataTable;
