import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  IndianRupee,
  Package,
  ShoppingCart,
  TriangleAlert,
  Users,
} from "lucide-react";
import { getDashboard } from "../../../api/adminApi";
import { useApi } from "../../../hooks/useApi";
import PageHeader from "../../../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Avatar from "../../../components/ui/Avatar";
import { Select } from "../../../components/ui/Field";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { SkeletonText } from "../../../components/ui/Skeleton";
import StatTile from "../components/StatTile";
import { OrderStatusBadge } from "../components/StatusBadge";
import {
  CategoryBarChart,
  OrdersBarChart,
  RevenueAreaChart,
  StatusDonutChart,
} from "../../../components/charts/ChartKit";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
} from "../../../lib/format";

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
];

/** Turns the range selection into the API's `from`/`interval` contract. */
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

/**
 * The dashboard's landing screen.
 *
 * Everything comes from one `/analytics/dashboard` request rather than eight,
 * so the whole screen resolves together instead of popping in panel by panel.
 */
const Overview = () => {
  const [range, setRange] = useState("30");
  const params = useMemo(() => buildRangeParams(range), [range]);

  const { data, loading, error, refetch } = useApi(getDashboard, params);

  const summary = data?.summary;
  const lowStock = data?.lowStockProducts || [];

  if (error) {
    return (
      <Card>
        <ErrorState description={error} onRetry={refetch} />
      </Card>
    );
  }

  return (
    <div className="space-y-section">
      <PageHeader
        title="Dashboard"
        description="Your store at a glance."
        actions={
          <Select
            aria-label="Date range"
            value={range}
            onChange={(event) => setRange(event.target.value)}
            options={RANGE_OPTIONS}
            className="w-[168px]"
          />
        }
      />

      {/* Headline metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile
          label="Revenue"
          value={formatCurrency(summary?.revenue?.value)}
          change={summary?.revenue?.change}
          icon={IndianRupee}
          loading={loading}
          hint="vs previous period"
        />
        <StatTile
          label="Orders"
          value={formatNumber(summary?.orders?.value)}
          change={summary?.orders?.change}
          icon={ShoppingCart}
          loading={loading}
          hint="vs previous period"
        />
        <StatTile
          label="New customers"
          value={formatNumber(summary?.customers?.value)}
          change={summary?.customers?.change}
          icon={Users}
          loading={loading}
          hint="vs previous period"
        />
        <StatTile
          label="Average order value"
          value={formatCurrency(summary?.averageOrderValue?.value)}
          change={summary?.averageOrderValue?.change}
          icon={Package}
          loading={loading}
          hint="vs previous period"
        />
      </div>

      {/* Low stock is an alert, not a metric — it earns its own row when it fires. */}
      {!loading && summary?.lowStock?.value > 0 && (
        <Card className="border-status-warning/40 bg-status-warning-bg/40">
          <CardBody className="flex flex-col sm:flex-row sm:items-center gap-3 py-3.5">
            <TriangleAlert size={18} className="text-status-warning shrink-0" aria-hidden="true" />
            <p className="type-body text-content flex-1">
              <span className="font-semibold">{summary.lowStock.value}</span>{" "}
              {summary.lowStock.value === 1 ? "product is" : "products are"} at or below the
              reorder point.
            </p>
            <Button
              as={Link}
              to="/admin/inventory?lowStock=true"
              variant="secondary"
              size="sm"
              iconRight={ArrowRight}
            >
              Review stock
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Revenue trend takes the wider column; status mix is a supporting view. */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card variant="chart" className="xl:col-span-2">
          <CardHeader
            title="Revenue over time"
            description={`Total ${formatCurrency(summary?.revenue?.value)} across the selected period`}
          />
          <RevenueAreaChart data={data?.salesTrend} loading={loading} height={300} />
        </Card>

        <Card variant="chart">
          <CardHeader title="Order status" description="Where orders currently sit" />
          <StatusDonutChart data={data?.statusDistribution} loading={loading} height={300} />
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card variant="chart">
          <CardHeader title="Orders per period" />
          <OrdersBarChart data={data?.salesTrend} loading={loading} height={280} />
        </Card>

        <Card variant="chart">
          <CardHeader title="Revenue by category" />
          <CategoryBarChart data={data?.revenueByCategory} loading={loading} height={280} />
        </Card>
      </div>

      {/* Operational lists */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Recent orders"
            actions={
              <Button as={Link} to="/admin/orders" variant="ghost" size="sm" iconRight={ArrowRight}>
                View all
              </Button>
            }
          />
          {loading ? (
            <div className="p-5">
              <SkeletonText lines={5} />
            </div>
          ) : data?.recentOrders?.length ? (
            <ul className="divide-y divide-line-subtle">
              {data.recentOrders.map((order) => (
                <li key={order._id}>
                  <Link
                    to={`/admin/orders/${order._id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-surface-hover transition-colors"
                  >
                    <Avatar
                      size="sm"
                      firstName={order.User?.firstName}
                      lastName={order.User?.lastName}
                      src={order.User?.avatar}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="type-body-strong text-content truncate">
                        {order.User?.firstName
                          ? `${order.User.firstName} ${order.User.lastName || ""}`.trim()
                          : "Guest"}
                      </p>
                      <p className="type-caption truncate">
                        {order.orderNumber} · {formatRelativeTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="type-body-strong type-numeric text-content shrink-0">
                      {formatCurrency(order.pricing?.grandTotal)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              description="Orders will appear here as soon as customers start buying."
            />
          )}
        </Card>

        <Card>
          <CardHeader title="Top products" description="By units sold" />
          {loading ? (
            <div className="p-5">
              <SkeletonText lines={5} />
            </div>
          ) : data?.topProducts?.length ? (
            <ol className="divide-y divide-line-subtle">
              {data.topProducts.map((product, index) => (
                <li key={product.productId || index} className="flex items-center gap-3 px-5 py-3">
                  <span className="w-6 h-6 rounded-md bg-surface-sunken grid place-items-center type-caption font-semibold text-content-secondary shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="type-body-strong text-content truncate">{product.name}</p>
                    <p className="type-caption truncate">{product.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="type-body-strong type-numeric text-content">
                      {formatNumber(product.unitsSold)}
                    </p>
                    <p className="type-caption type-numeric">{formatCurrency(product.revenue)}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState icon={Package} title="No sales yet" description="Top sellers appear here." />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="Low stock"
            description="Products needing a reorder"
            actions={
              <Button
                as={Link}
                to="/admin/inventory?lowStock=true"
                variant="ghost"
                size="sm"
                iconRight={ArrowRight}
              >
                Inventory
              </Button>
            }
          />
          {loading ? (
            <div className="p-5">
              <SkeletonText lines={4} />
            </div>
          ) : lowStock.length ? (
            <ul className="divide-y divide-line-subtle">
              {lowStock.map((product) => (
                <li key={product._id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="type-body-strong text-content truncate">{product.name}</p>
                    <p className="type-caption truncate">{product.category}</p>
                  </div>
                  <Badge tone={product.countInStock === 0 ? "critical" : "warning"}>
                    {product.countInStock === 0
                      ? "Out of stock"
                      : `${product.countInStock} left`}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Package}
              title="Stock levels are healthy"
              description="Nothing is below its reorder point right now."
            />
          )}
        </Card>

        <Card>
          <CardHeader
            title="New customers"
            actions={
              <Button
                as={Link}
                to="/admin/customers"
                variant="ghost"
                size="sm"
                iconRight={ArrowRight}
              >
                View all
              </Button>
            }
          />
          {loading ? (
            <div className="p-5">
              <SkeletonText lines={4} />
            </div>
          ) : data?.recentCustomers?.length ? (
            <ul className="divide-y divide-line-subtle">
              {data.recentCustomers.map((customer) => (
                <li key={customer._id} className="flex items-center gap-3 px-5 py-3">
                  <Avatar
                    size="sm"
                    firstName={customer.firstName}
                    lastName={customer.lastName}
                    src={customer.avatar}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="type-body-strong text-content truncate">
                      {`${customer.firstName} ${customer.lastName || ""}`.trim()}
                    </p>
                    <p className="type-caption truncate">{customer.email}</p>
                  </div>
                  <p className="type-caption shrink-0">{formatDate(customer.createdAt)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Users} title="No customers yet" />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Overview;
