import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, Banknote, CreditCard, FileSpreadsheet, IndianRupee, Package, ShoppingCart, Table2, Users } from "lucide-react";

import { getDashboard } from "../../../api/adminApi";
import { useApi } from "../../../hooks/useApi";
import PageHeader from "../../../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { ErrorState } from "../../../components/ui/States";
import { SkeletonText } from "../../../components/ui/Skeleton";
import StatTile from "../components/StatTile";
import { CategoryBarChart, ChartDataTable, OrdersBarChart, RevenueAreaChart } from "../../../components/charts/ChartKit";
import { formatCurrency, formatNumber } from "../../../lib/format";
import cn from "../../../lib/cn";

const RANGES = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "12 months" },
];

const buildRangeParams = (days) => {
  const from = new Date();
  from.setDate(from.getDate() - Number(days));
  from.setHours(0, 0, 0, 0);
  return {
    from: from.toISOString(),
    // Daily buckets get unreadable past a quarter, so longer ranges roll up.
    interval: Number(days) > 120 ? "month" : Number(days) > 45 ? "week" : "day",
  };
};

/** How orders placed in the period ended up, in three plain buckets. */
const OUTCOMES = [
  { key: "delivered", label: "Delivered", statuses: ["delivered"], className: "bg-status-good" },
  {
    key: "open",
    label: "Still in progress",
    statuses: ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery"],
    className: "bg-status-info",
  },
  { key: "lost", label: "Cancelled or returned", statuses: ["cancelled", "returned", "refunded"], className: "bg-status-critical" },
];

/** A labelled share bar: the simplest honest picture of a split. */
const ShareBar = ({ parts }) => {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-sunken">
        {parts.map((part) =>
          part.value > 0 ? (
            <motion.span
              key={part.label}
              initial={{ width: 0 }}
              animate={{ width: `${(part.value / total) * 100}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={cn("h-full first:rounded-l-full last:rounded-r-full", part.className)}
            />
          ) : null
        )}
      </div>
      <ul className="mt-4 space-y-2.5">
        {parts.map((part) => (
          <li key={part.label} className="flex items-center gap-2.5">
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", part.className)} />
            <span className="flex-1 type-body text-content-secondary">{part.label}</span>
            <span className="type-numeric type-body-strong text-content">{part.display ?? formatNumber(part.value)}</span>
            <span className="w-11 text-right type-caption type-numeric text-content-muted">
              {total ? Math.round((part.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Analytics: how the business is trending over a chosen period, each number
 * compared with the period before it. (Today's to-dos are on the Dashboard;
 * downloadable tables are in Reports.)
 */
const Analytics = () => {
  const [range, setRange] = useState("30");
  const [showTables, setShowTables] = useState(false);
  const params = useMemo(() => buildRangeParams(range), [range]);
  const { data, loading, error, refetch } = useApi(getDashboard, params);

  if (error) {
    return (
      <Card>
        <ErrorState description={error} onRetry={refetch} />
      </Card>
    );
  }

  const summary = data?.summary;
  const rangeLabel = RANGES.find((option) => option.value === range)?.label;
  const statusCount = Object.fromEntries((data?.statusDistribution || []).map((row) => [row.status, row.count]));
  const outcomes = OUTCOMES.map((outcome) => ({
    ...outcome,
    value: outcome.statuses.reduce((sum, status) => sum + (statusCount[status] || 0), 0),
  }));
  const mix = data?.paymentMix || [];
  const cod = mix.find((row) => row.method === "cod") || { orders: 0, revenue: 0 };
  const online = mix.find((row) => row.method === "online") || { orders: 0, revenue: 0 };
  const topMax = Math.max(1, ...(data?.topProducts || []).map((product) => product.unitsSold));

  return (
    <div className="space-y-section">
      <PageHeader
        title="Analytics"
        description={`How the store is doing over the last ${rangeLabel}, compared with the ${rangeLabel} before.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Segmented range picker: one click, always visible. */}
            <div className="flex rounded-full border border-line bg-surface p-0.5" role="radiogroup" aria-label="Period">
              {RANGES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={range === option.value}
                  onClick={() => setRange(option.value)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[0.8125rem] font-medium transition-colors",
                    range === option.value ? "bg-accent text-accent-on" : "text-content-secondary hover:text-content"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button variant={showTables ? "subtle" : "secondary"} icon={showTables ? BarChart3 : Table2} onClick={() => setShowTables((current) => !current)}>
              {showTables ? "Charts only" : "Show numbers"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Revenue" icon={IndianRupee} value={formatCurrency(summary?.revenue?.value)} change={summary?.revenue?.change} loading={loading} hint="vs previous period" />
        <StatTile label="Orders" icon={ShoppingCart} value={formatNumber(summary?.orders?.value)} change={summary?.orders?.change} loading={loading} hint="vs previous period" />
        <StatTile label="Average order" icon={Package} value={formatCurrency(summary?.averageOrderValue?.value)} change={summary?.averageOrderValue?.change} loading={loading} hint="Revenue ÷ orders" />
        <StatTile label="New customers" icon={Users} value={formatNumber(summary?.customers?.value)} change={summary?.customers?.change} loading={loading} hint="Accounts created" />
      </div>

      <Card variant="chart">
        <CardHeader title="Revenue trend" description="Hover the line for the amount on each day" />
        <RevenueAreaChart data={data?.salesTrend} loading={loading} height={300} />
        {showTables && data?.salesTrend?.length > 0 && (
          <CardBody className="border-t border-line-subtle pt-4">
            <ChartDataTable
              rows={data.salesTrend}
              columns={[
                { key: "bucket", header: "Period" },
                { key: "revenue", header: "Revenue", render: (row) => formatCurrency(row.revenue) },
                { key: "orders", header: "Orders", render: (row) => formatNumber(row.orders) },
              ]}
            />
          </CardBody>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader title="How customers pay" description="Share of revenue" />
          <CardBody>
            {loading ? (
              <SkeletonText lines={3} />
            ) : (
              <>
                <ShareBar
                  parts={[
                    { label: "Cash on delivery", value: cod.revenue, display: formatCurrency(cod.revenue), className: "bg-status-warning" },
                    { label: "Paid online", value: online.revenue, display: formatCurrency(online.revenue), className: "bg-accent" },
                  ]}
                />
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line-subtle pt-4">
                  <p className="flex items-center gap-2 type-caption text-content-secondary">
                    <Banknote size={14} /> {formatNumber(cod.orders)} COD orders
                  </p>
                  <p className="flex items-center gap-2 type-caption text-content-secondary">
                    <CreditCard size={14} /> {formatNumber(online.orders)} online
                  </p>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="How orders ended up" description="Orders placed in this period" />
          <CardBody>{loading ? <SkeletonText lines={3} /> : <ShareBar parts={outcomes} />}</CardBody>
        </Card>

        <Card variant="chart">
          <CardHeader title="Orders per period" />
          <OrdersBarChart data={data?.salesTrend} loading={loading} height={220} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card variant="chart">
          <CardHeader title="Revenue by category" description="Which departments earn the most" />
          <CategoryBarChart data={data?.revenueByCategory} loading={loading} height={300} />
          {showTables && data?.revenueByCategory?.length > 0 && (
            <CardBody className="border-t border-line-subtle pt-4">
              <ChartDataTable
                rows={data.revenueByCategory}
                columns={[
                  { key: "category", header: "Category" },
                  { key: "revenue", header: "Revenue", render: (row) => formatCurrency(row.revenue) },
                  { key: "unitsSold", header: "Units", render: (row) => formatNumber(row.unitsSold) },
                ]}
              />
            </CardBody>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Best sellers"
            description="By units sold"
            actions={
              <Button as={Link} to="/admin/reports?type=products" variant="ghost" size="sm" icon={FileSpreadsheet}>
                Full list
              </Button>
            }
          />
          {loading ? (
            <div className="p-5">
              <SkeletonText lines={5} />
            </div>
          ) : data?.topProducts?.length ? (
            <ol className="divide-y divide-line-subtle">
              {data.topProducts.map((product, index) => (
                <li key={product.productId || index} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-5 shrink-0 text-center type-caption font-semibold text-content-muted">{index + 1}</span>
                  {product.image ? (
                    <img src={product.image} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="h-10 w-10 shrink-0 rounded-lg bg-surface-sunken" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate type-body-strong text-content">{product.name}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(product.unitsSold / topMax) * 100}%` }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        className="h-full rounded-full bg-accent"
                      />
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="type-body-strong type-numeric text-content">{formatNumber(product.unitsSold)} sold</p>
                    <p className="type-caption type-numeric">{formatCurrency(product.revenue)}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-10 text-center type-caption">No sales in this period.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
