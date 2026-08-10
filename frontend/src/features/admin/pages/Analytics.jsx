import { useMemo, useState } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { getDashboard } from "../../../api/adminApi";
import { useApi } from "../../../hooks/useApi";
import PageHeader from "../../../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Field";
import { ErrorState } from "../../../components/ui/States";
import StatTile from "../components/StatTile";
import {
  CategoryBarChart,
  ChartDataTable,
  OrdersBarChart,
  RevenueAreaChart,
  StatusDonutChart,
} from "../../../components/charts/ChartKit";
import { formatCurrency, formatNumber, humanise } from "../../../lib/format";

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
];

const buildRangeParams = (days) => {
  const from = new Date();
  from.setDate(from.getDate() - Number(days));
  from.setHours(0, 0, 0, 0);

  return {
    from: from.toISOString(),
    interval: Number(days) > 120 ? "month" : Number(days) > 45 ? "week" : "day",
  };
};

/**
 * Analytics.
 *
 * Every chart carries a table view: the palette validator flags three light-mode
 * series as sub-3:1 against the surface, and the table is the relief for that,
 * as well as the accessible path to the same numbers.
 */
const Analytics = () => {
  const [range, setRange] = useState("30");
  const [showTables, setShowTables] = useState(false);
  const params = useMemo(() => buildRangeParams(range), [range]);

  const { data, loading, error, refetch } = useApi(getDashboard, params);
  const summary = data?.summary;

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
        title="Analytics"
        description="Revenue, orders and product performance."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={showTables ? "subtle" : "secondary"}
              icon={showTables ? BarChart3 : Table2}
              onClick={() => setShowTables((current) => !current)}
            >
              {showTables ? "Hide tables" : "Show tables"}
            </Button>
            <Select
              aria-label="Date range"
              value={range}
              onChange={(event) => setRange(event.target.value)}
              options={RANGE_OPTIONS}
              className="w-[168px]"
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile
          label="Revenue"
          value={formatCurrency(summary?.revenue?.value)}
          change={summary?.revenue?.change}
          loading={loading}
        />
        <StatTile
          label="Orders"
          value={formatNumber(summary?.orders?.value)}
          change={summary?.orders?.change}
          loading={loading}
        />
        <StatTile
          label="Average order value"
          value={formatCurrency(summary?.averageOrderValue?.value)}
          change={summary?.averageOrderValue?.change}
          loading={loading}
        />
        <StatTile
          label="New customers"
          value={formatNumber(summary?.customers?.value)}
          change={summary?.customers?.change}
          loading={loading}
        />
      </div>

      <Card variant="chart">
        <CardHeader title="Revenue" description="Total sales across the selected period" />
        <RevenueAreaChart data={data?.salesTrend} loading={loading} height={320} />
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

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card variant="chart">
          <CardHeader title="Orders per period" />
          <OrdersBarChart data={data?.salesTrend} loading={loading} height={280} />
        </Card>

        <Card variant="chart">
          <CardHeader title="Order status" />
          <StatusDonutChart data={data?.statusDistribution} loading={loading} height={280} />
          {showTables && data?.statusDistribution?.length > 0 && (
            <CardBody className="border-t border-line-subtle pt-4">
              <ChartDataTable
                rows={data.statusDistribution.filter((row) => row.count > 0)}
                columns={[
                  { key: "status", header: "Status", render: (row) => humanise(row.status) },
                  { key: "count", header: "Orders", render: (row) => formatNumber(row.count) },
                ]}
              />
            </CardBody>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card variant="chart">
          <CardHeader title="Revenue by category" />
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
          <CardHeader title="Top products" description="By units sold" />
          <CardBody>
            {data?.topProducts?.length ? (
              <ChartDataTable
                rows={data.topProducts}
                columns={[
                  { key: "name", header: "Product" },
                  { key: "unitsSold", header: "Units", render: (row) => formatNumber(row.unitsSold) },
                  { key: "revenue", header: "Revenue", render: (row) => formatCurrency(row.revenue) },
                ]}
              />
            ) : (
              <p className="type-caption py-6 text-center">No sales in this period.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
