import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarRange, Download, FileSpreadsheet, LayoutGrid, Package, Printer, ReceiptText, TrendingUp } from "lucide-react";

import { getReport } from "../../../api/adminApi";
import { useApi } from "../../../hooks/useApi";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { SkeletonText } from "../../../components/ui/Skeleton";
import { OrderStatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDateTime, formatNumber, humanise } from "../../../lib/format";
import cn from "../../../lib/cn";

/**
 * Each report: what it answers, its columns (with the plain value used for
 * CSV), and which columns add up into the totals row.
 */
const REPORTS = {
  sales: {
    label: "Sales by day",
    icon: TrendingUp,
    about: "Revenue and order count for each day (or week/month for long periods).",
    columns: [
      { key: "bucket", header: "Date" },
      { key: "orders", header: "Orders", numeric: true, total: true, format: formatNumber },
      { key: "revenue", header: "Revenue", numeric: true, total: true, format: formatCurrency },
      { key: "aov", header: "Average order", numeric: true, format: formatCurrency, value: (row) => (row.orders ? row.revenue / row.orders : 0) },
    ],
  },
  orders: {
    label: "All orders",
    icon: ReceiptText,
    about: "Every order placed in the period, newest first.",
    columns: [
      { key: "orderNumber", header: "Order", link: (row) => `/admin/orders/${row._id}` },
      { key: "createdAt", header: "Placed", format: formatDateTime },
      { key: "customer", header: "Customer" },
      { key: "email", header: "Email" },
      { key: "items", header: "Items", numeric: true, total: true, format: formatNumber },
      { key: "payment", header: "Payment" },
      { key: "paymentStatus", header: "Paid?", format: humanise },
      { key: "status", header: "Status", render: (row) => <OrderStatusBadge status={row.status} />, format: humanise },
      { key: "total", header: "Total", numeric: true, total: true, format: formatCurrency },
    ],
  },
  products: {
    label: "Product sales",
    icon: Package,
    about: "Every product sold in the period, highest revenue first.",
    columns: [
      { key: "name", header: "Product" },
      { key: "category", header: "Category" },
      { key: "orders", header: "Orders", numeric: true, total: true, format: formatNumber },
      { key: "unitsSold", header: "Units sold", numeric: true, total: true, format: formatNumber },
      { key: "revenue", header: "Revenue", numeric: true, total: true, format: formatCurrency },
    ],
  },
  categories: {
    label: "Category sales",
    icon: LayoutGrid,
    about: "Revenue per category, to see which departments carry the store.",
    columns: [
      { key: "category", header: "Category" },
      { key: "orders", header: "Orders", numeric: true, total: true, format: formatNumber },
      { key: "unitsSold", header: "Units sold", numeric: true, total: true, format: formatNumber },
      { key: "revenue", header: "Revenue", numeric: true, total: true, format: formatCurrency },
    ],
  },
};

const PRESETS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
  { value: "custom", label: "Custom" },
];

const isoDay = (date) => date.toISOString().slice(0, 10);
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const cellValue = (column, row) => (column.value ? column.value(row) : row[column.key]);

/** Quotes a CSV cell when needed, and neutralises spreadsheet formulas. */
const csvCell = (value) => {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadCsv = (filename, columns, rows) => {
  const plain = (column, row) => {
    const value = cellValue(column, row);
    if (column.key === "createdAt") return new Date(value).toISOString();
    return typeof value === "number" ? Math.round(value * 100) / 100 : value;
  };
  const lines = [columns.map((column) => csvCell(column.header)).join(",")];
  rows.forEach((row) => lines.push(columns.map((column) => csvCell(plain(column, row))).join(",")));
  // BOM so Excel reads ₹ and Indian names correctly.
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

/**
 * Reports: pick a report and a period, read it as a table, download it as
 * CSV (opens in Excel / Google Sheets) or print it.
 */
const Reports = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const type = REPORTS[searchParams.get("type")] ? searchParams.get("type") : "sales";
  const report = REPORTS[type];

  const [preset, setPreset] = useState("30");
  const [custom, setCustom] = useState({ from: isoDay(daysAgo(30)), to: isoDay(new Date()) });

  const params = useMemo(() => {
    const from = preset === "custom" ? new Date(`${custom.from}T00:00:00`) : daysAgo(Number(preset));
    const to = preset === "custom" ? new Date(`${custom.to}T23:59:59`) : new Date();
    if (preset !== "custom") from.setHours(0, 0, 0, 0);
    const days = (to - from) / 86400000;
    return { type, from: from.toISOString(), to: to.toISOString(), interval: days > 120 ? "month" : days > 45 ? "week" : "day" };
  }, [type, preset, custom]);

  const { data, loading, error, refetch } = useApi(getReport, params);
  const rows = data || [];
  const totals = Object.fromEntries(
    report.columns.filter((column) => column.total).map((column) => [column.key, rows.reduce((sum, row) => sum + (Number(cellValue(column, row)) || 0), 0)])
  );
  const periodLabel =
    preset === "custom" ? `${custom.from} to ${custom.to}` : PRESETS.find((option) => option.value === preset)?.label.toLowerCase();

  return (
    <div className="space-y-section">
      <PageHeader
        title="Reports"
        description="Pick a report and a period. Download it for Excel or Google Sheets, or print it."
        actions={
          <div className="flex gap-2 print:hidden">
            <Button variant="secondary" icon={Printer} onClick={() => window.print()} disabled={!rows.length}>
              Print
            </Button>
            <Button
              variant="primary"
              icon={Download}
              disabled={!rows.length}
              onClick={() => downloadCsv(`planet-zone-${type}-${params.from.slice(0, 10)}-to-${params.to.slice(0, 10)}.csv`, report.columns, rows)}
            >
              Download CSV
            </Button>
          </div>
        }
      />

      {/* Report picker */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 print:hidden">
        {Object.entries(REPORTS).map(([key, option]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSearchParams({ type: key }, { replace: true })}
            aria-pressed={key === type}
            className={cn(
              "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
              key === type ? "border-accent bg-accent-subtle shadow-sm" : "border-line-subtle bg-surface hover:border-line-strong"
            )}
          >
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", key === type ? "bg-accent text-accent-on" : "bg-surface-sunken text-content-secondary")}>
              <option.icon size={17} />
            </span>
            <span>
              <span className={cn("block text-[0.9375rem] font-semibold", key === type ? "text-accent-text" : "text-content")}>{option.label}</span>
              <span className="mt-0.5 block type-caption text-content-muted">{option.about}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Period */}
      <Card className="flex flex-wrap items-center gap-3 p-3 print:hidden">
        <CalendarRange size={17} className="ml-1 text-content-muted" />
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreset(option.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
                preset === option.value ? "bg-accent text-accent-on" : "bg-surface-sunken text-content-secondary hover:text-content"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              aria-label="From"
              value={custom.from}
              max={custom.to}
              onChange={(event) => setCustom((current) => ({ ...current, from: event.target.value }))}
              className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[0.875rem] text-content"
            />
            <span className="type-caption">to</span>
            <input
              type="date"
              aria-label="To"
              value={custom.to}
              min={custom.from}
              max={isoDay(new Date())}
              onChange={(event) => setCustom((current) => ({ ...current, to: event.target.value }))}
              className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[0.875rem] text-content"
            />
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line-subtle px-5 py-4">
          <h2 className="text-[1.0625rem] font-semibold text-content">
            {report.label} <span className="font-normal text-content-muted">· {periodLabel}</span>
          </h2>
          {!loading && <span className="type-caption">{formatNumber(rows.length)} rows</span>}
        </div>

        {error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : loading ? (
          <div className="p-5">
            <SkeletonText lines={8} />
          </div>
        ) : rows.length ? (
          <div className="max-h-[65vh] overflow-auto print:max-h-none">
            <table className="w-full min-w-[40rem] border-collapse text-[0.875rem]">
              <thead className="sticky top-0 z-10 bg-surface-sunken">
                <tr>
                  {report.columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={cn("whitespace-nowrap px-4 py-2.5 font-semibold text-content-secondary", column.numeric ? "text-right" : "text-left")}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row._id || row.bucket || row.category || index} className="border-t border-line-subtle hover:bg-surface-hover">
                    {report.columns.map((column) => {
                      const value = cellValue(column, row);
                      const shown = column.render ? column.render(row) : column.format ? column.format(value) : value || "—";
                      return (
                        <td key={column.key} className={cn("px-4 py-2.5 text-content", column.numeric && "type-numeric text-right")}>
                          {column.link ? (
                            <Link to={column.link(row)} className="font-medium text-accent-text hover:underline">
                              {shown}
                            </Link>
                          ) : (
                            shown
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 bg-surface-sunken">
                <tr className="border-t-2 border-line">
                  {report.columns.map((column, index) => (
                    <td key={column.key} className={cn("px-4 py-3 font-semibold text-content", column.numeric && "type-numeric text-right")}>
                      {index === 0 ? "Total" : column.total ? column.format(totals[column.key]) : ""}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <EmptyState icon={FileSpreadsheet} title="Nothing in this period" description="Try a longer period, or another report." />
        )}
      </Card>
    </div>
  );
};

export default Reports;
