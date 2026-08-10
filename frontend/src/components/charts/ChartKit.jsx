import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "../../theme/ThemeProvider";
import { CATEGORICAL, ORDER_STATUS_COLOR } from "../../theme/chartPalette";
import { formatCompact, formatCurrency, formatNumber, humanise } from "../../lib/format";
import { EmptyState } from "../ui/States";
import { SkeletonChart } from "../ui/Skeleton";
import cn from "../../lib/cn";

/**
 * Chart primitives for the dashboard.
 *
 * Axes and grid lines are recessive, marks are thin, and colour is read from
 * the validated categorical palette for the active mode — never from the
 * user's accent, so re-theming the interface cannot change what a chart means.
 */

/** Shared axis and grid styling, resolved per mode. */
const useChartTheme = () => {
  const { isDark } = useTheme();

  return useMemo(
    () => ({
      mode: isDark ? "dark" : "light",
      series: isDark ? CATEGORICAL.dark : CATEGORICAL.light,
      grid: isDark ? "#2a2f36" : "#eceef1",
      axis: isDark ? "#8b929c" : "#6b7280",
      tooltipBg: isDark ? "#1c2025" : "#ffffff",
      tooltipBorder: isDark ? "#2e333a" : "#e0e3e8",
      tooltipText: isDark ? "#f3f4f6" : "#111827",
      // Surface colour used for the 2px gap between adjacent fills.
      surface: isDark ? "#1a1a19" : "#fcfcfb",
    }),
    [isDark]
  );
};

const axisProps = (theme) => ({
  stroke: theme.axis,
  tick: { fill: theme.axis, fontSize: 11 },
  tickLine: false,
  axisLine: false,
});

/** Tooltip shared by every chart, so hover reads identically throughout. */
const ChartTooltip = ({ active, payload, label, formatter, labelFormatter }) => {
  const theme = useChartTheme();
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-lg border shadow-lg px-3 py-2 min-w-[140px]"
      style={{
        backgroundColor: theme.tooltipBg,
        borderColor: theme.tooltipBorder,
        color: theme.tooltipText,
      }}
    >
      <p className="type-caption mb-1.5" style={{ color: theme.axis }}>
        {labelFormatter ? labelFormatter(label) : label}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey ?? entry.name} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 type-caption" style={{ color: theme.axis }}>
            {/* The swatch carries identity; the text stays in ink tokens. */}
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            {humanise(entry.name)}
          </span>
          <span className="type-caption type-numeric font-semibold" style={{ color: theme.tooltipText }}>
            {formatter ? formatter(entry.value, entry.dataKey) : formatNumber(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

/** Wrapper handling the loading and empty cases every chart shares. */
const ChartFrame = ({ loading, isEmpty, height, emptyLabel, children }) => {
  if (loading) return <SkeletonChart height={height} />;
  if (isEmpty) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <EmptyState
          title="No data for this period"
          description={emptyLabel || "Once there is activity in this range, it will appear here."}
          className="py-0"
        />
      </div>
    );
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Revenue over time.
 *
 * A single measure on one axis — a second measure of different scale gets its
 * own chart rather than a second y-axis.
 */
export const RevenueAreaChart = ({ data = [], loading, height = 300, dataKey = "revenue" }) => {
  const theme = useChartTheme();
  const color = theme.series[0];
  const gradientId = `revenue-gradient-${theme.mode}`;

  return (
    <ChartFrame loading={loading} isEmpty={!data.length} height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="bucket" {...axisProps(theme)} minTickGap={24} />
        <YAxis {...axisProps(theme)} width={52} tickFormatter={formatCompact} />
        <Tooltip
          cursor={{ stroke: theme.axis, strokeWidth: 1, strokeDasharray: "3 3" }}
          content={<ChartTooltip formatter={(value) => formatCurrency(value)} />}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          name="Revenue"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: theme.surface }}
        />
      </AreaChart>
    </ChartFrame>
  );
};

/** Order volume over the same buckets as the revenue chart. */
export const OrdersBarChart = ({ data = [], loading, height = 300 }) => {
  const theme = useChartTheme();

  return (
    <ChartFrame loading={loading} isEmpty={!data.length} height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="bucket" {...axisProps(theme)} minTickGap={24} />
        <YAxis {...axisProps(theme)} width={40} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: theme.grid, opacity: 0.4 }}
          content={<ChartTooltip formatter={formatNumber} />}
        />
        <Bar
          dataKey="orders"
          name="Orders"
          fill={theme.series[2]}
          // Rounded data-end anchored to the baseline.
          radius={[4, 4, 0, 0]}
          maxBarSize={34}
        />
      </BarChart>
    </ChartFrame>
  );
};

/**
 * Order status mix.
 *
 * Statuses carry fixed colours rather than categorical slots, so a status hue
 * never impersonates a data series. Zero-count statuses are dropped so the
 * legend only lists what is actually present.
 */
export const StatusDonutChart = ({ data = [], loading, height = 300 }) => {
  const theme = useChartTheme();
  const slices = useMemo(() => data.filter((entry) => entry.count > 0), [data]);
  const total = useMemo(() => slices.reduce((sum, entry) => sum + entry.count, 0), [slices]);

  return (
    <ChartFrame loading={loading} isEmpty={!slices.length} height={height}>
      <PieChart>
        <Pie
          data={slices}
          dataKey="count"
          nameKey="status"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={2}
          // A surface-coloured gap keeps adjacent arcs legible.
          stroke={theme.surface}
          strokeWidth={2}
        >
          {slices.map((entry) => (
            <Cell key={entry.status} fill={ORDER_STATUS_COLOR[entry.status] || theme.series[0]} />
          ))}
        </Pie>
        <Tooltip
          content={
            <ChartTooltip
              formatter={(value) =>
                `${formatNumber(value)} (${total ? Math.round((value / total) * 100) : 0}%)`
              }
            />
          }
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="type-caption" style={{ color: theme.axis }}>
              {humanise(value)}
            </span>
          )}
        />
      </PieChart>
    </ChartFrame>
  );
};

/** Revenue split by category, as a horizontal ranking. */
export const CategoryBarChart = ({ data = [], loading, height = 300 }) => {
  const theme = useChartTheme();

  return (
    <ChartFrame loading={loading} isEmpty={!data.length} height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" {...axisProps(theme)} tickFormatter={formatCompact} />
        <YAxis
          type="category"
          dataKey="category"
          {...axisProps(theme)}
          width={110}
          tickFormatter={(value) => (value?.length > 14 ? `${value.slice(0, 13)}…` : value)}
        />
        <Tooltip
          cursor={{ fill: theme.grid, opacity: 0.4 }}
          content={<ChartTooltip formatter={(value) => formatCurrency(value)} />}
        />
        <Bar dataKey="revenue" name="Revenue" fill={theme.series[1]} radius={[0, 4, 4, 0]} maxBarSize={22} />
      </BarChart>
    </ChartFrame>
  );
};

/** Compact trend line for stat tiles; no axes, no tooltip. */
export const Sparkline = ({ data = [], dataKey = "revenue", tone = 0, height = 40 }) => {
  const theme = useChartTheme();
  if (!data.length) return <div style={{ height }} />;

  return (
    <div style={{ height }} aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={theme.series[tone]}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Tabular view of a chart's data.
 *
 * Present so the information is never available through the chart alone,
 * which matters for screen readers and for the low-contrast series the
 * palette validator flagged.
 */
export const ChartDataTable = ({ rows, columns, className }) => (
  <div className={cn("overflow-x-auto", className)}>
    <table className="w-full">
      <thead>
        <tr className="border-b border-line-subtle">
          {columns.map((column) => (
            <th key={column.key} scope="col" className="type-label text-content-muted text-left px-3 py-2">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="border-b border-line-subtle last:border-0">
            {columns.map((column) => (
              <td key={column.key} className="type-table px-3 py-2 type-numeric">
                {column.render ? column.render(row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export { useChartTheme, ChartTooltip };
