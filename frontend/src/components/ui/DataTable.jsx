import { useMemo } from "react";
import { ConfigProvider, Pagination as AntdPagination, Table } from "antd";

import { EmptyState, ErrorState } from "./States";
import cn from "../../lib/cn";

/**
 * Table for dashboard listings.
 *
 * Built on Ant Design's Table, which brings sticky headers, column
 * responsiveness, keyboard-reachable sorters and virtual-free horizontal
 * scrolling that a hand-rolled `<table>` had to reimplement badly. The column
 * contract is unchanged, so screens still describe their data rather than
 * their markup:
 *
 *   { key, header, render(row, index), sortKey, align, numeric, hideBelow, width }
 *
 * Loading, error and empty presentation stay owned here so every list behaves
 * the same way.
 */

/** `hideBelow: "md"` means "show from md up", which is antd's `responsive`. */
const RESPONSIVE = {
  sm: ["sm"],
  md: ["md"],
  lg: ["lg"],
  xl: ["xl"],
};

/** "createdAt:desc" ⇄ antd's "descend". */
const toAntdOrder = (direction) => (direction === "asc" ? "ascend" : "descend");

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
  size = "middle",
  className,
}) => {
  const [sortField, sortDirection] = (sort || "").split(":");

  const antdColumns = useMemo(
    () =>
      columns.map((column) => ({
        key: column.key,
        title: column.header,
        dataIndex: column.key,
        align: column.align,
        width: column.width,
        ellipsis: column.ellipsis,
        responsive: column.hideBelow ? RESPONSIVE[column.hideBelow] : undefined,
        // The sorter is a flag, not a comparator: rows are ordered by the API,
        // so sorting here would reorder only the page currently in hand.
        sorter: Boolean(column.sortKey) && Boolean(onSortChange),
        sortOrder: column.sortKey && sortField === column.sortKey ? toAntdOrder(sortDirection) : null,
        showSorterTooltip: false,
        className: cn(column.numeric && "type-numeric"),
        render: column.render
          ? (_value, record, index) => column.render(record, index)
          : undefined,
      })),
    [columns, onSortChange, sortDirection, sortField]
  );

  /**
   * antd reports the column that changed; translate it back into the
   * `field:direction` string the list hooks and the URL already speak.
   */
  const handleChange = (_pagination, _filters, sorter) => {
    if (!onSortChange) return;

    const changed = Array.isArray(sorter) ? sorter[0] : sorter;
    const column = columns.find((item) => item.key === changed?.columnKey);
    if (!column?.sortKey) return;

    // Clearing the sort returns to the column's descending default rather than
    // to no order at all, which the API cannot express.
    const direction = changed.order === "ascend" ? "asc" : "desc";
    onSortChange(`${column.sortKey}:${direction}`);
  };

  if (error) return <ErrorState description={error} onRetry={onRetry} />;

  const pagination =
    meta && meta.totalPages > 1
      ? {
          current: meta.page,
          pageSize: meta.limit,
          total: meta.total,
          showSizeChanger: false,
          onChange: (page) => onPageChange?.(page),
          showTotal: (total, [from, to]) => `${from}–${to} of ${total}`,
          className: "px-4",
        }
      : false;

  return (
    <ConfigProvider
      renderEmpty={() =>
        emptyState || (
          <EmptyState filtered={filtered} onClear={onClearFilters} title="No records yet" />
        )
      }
    >
      <Table
        className={cn("planet-table", className)}
        columns={antdColumns}
        dataSource={rows || []}
        rowKey={(record) => record[keyField] ?? record.key}
        loading={loading}
        size={size}
        pagination={pagination}
        onChange={handleChange}
        // The table scrolls inside its own container, so a wide column set
        // never pushes the page sideways.
        scroll={{ x: "max-content" }}
        onRow={
          onRowClick
            ? (record) => ({
                onClick: () => onRowClick(record),
                style: { cursor: "pointer" },
              })
            : undefined
        }
      />
    </ConfigProvider>
  );
};

/**
 * Standalone pager for lists that are not tables — the product grid, for one.
 * Tables get theirs from the Table itself.
 */
export const Pagination = ({ meta, onPageChange }) => {
  if (!meta) return null;
  const { page, limit, total } = meta;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-line-subtle px-4 py-3 sm:flex-row">
      <p className="type-caption text-content-muted">
        Showing{" "}
        <span className="font-medium text-content">
          {total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)}
        </span>{" "}
        of <span className="font-medium text-content">{total}</span>
      </p>

      <AntdPagination
        current={page}
        pageSize={limit}
        total={total}
        showSizeChanger={false}
        onChange={(next) => onPageChange?.(next)}
      />
    </div>
  );
};

export default DataTable;
