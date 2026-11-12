import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileSpreadsheet,
  Inbox,
  PackageCheck,
  PackageOpen,
  Plus,
  RotateCcw,
  Tag,
  TriangleAlert,
  Truck,
} from "lucide-react";

import { getToday, updateOrderStatus } from "../../../api/adminApi";
import { useApi, useMutation } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import { Card, CardHeader } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Avatar from "../../../components/ui/Avatar";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { Skeleton, SkeletonText } from "../../../components/ui/Skeleton";
import { OrderStatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatNumber, formatRelativeTime } from "../../../lib/format";
import { getErrorMessage } from "../../../lib/apiError";
import cn from "../../../lib/cn";

/** The one obvious next step for an order, as on the order page. */
const NEXT_STEP = {
  pending: { status: "confirmed", label: "Confirm" },
  confirmed: { status: "processing", label: "Start packing" },
  processing: { status: "packed", label: "Mark packed" },
  // Shipping needs a tracking number, so it opens the order instead.
  packed: { label: "Ship", openOrder: true },
  shipped: { status: "out_for_delivery", label: "Out for delivery" },
  out_for_delivery: { status: "delivered", label: "Delivered" },
};

const greeting = () => {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
};

/** Up/down chip comparing today with yesterday. */
const Delta = ({ change }) => {
  if (change === undefined || change === null) return null;
  const flat = Math.abs(change) < 0.05;
  const up = change > 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[0.75rem] font-semibold",
        flat ? "bg-surface-sunken text-content-secondary" : up ? "bg-status-good-bg text-status-good" : "bg-status-critical-bg text-status-critical"
      )}
    >
      {!flat && <Icon size={13} />}
      {flat ? "Same as yesterday" : `${Math.abs(change)}% vs yesterday`}
    </span>
  );
};

/** One to-do: a count, what it means, and where to go to deal with it. */
const TodoCard = ({ icon: Icon, count, title, detail, to, tone = "accent", index }) => {
  const clear = !count;
  const tones = {
    accent: "bg-accent-subtle text-accent-text",
    warning: "bg-status-warning-bg text-status-warning",
    critical: "bg-status-critical-bg text-status-critical",
    info: "bg-status-info-bg text-status-info",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link
        to={to}
        className={cn(
          "group flex h-full items-start gap-3 rounded-2xl border bg-surface p-4 transition-all",
          clear ? "border-line-subtle" : "border-line hover:-translate-y-0.5 hover:border-accent hover:shadow-md"
        )}
      >
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", clear ? "bg-surface-sunken text-content-muted" : tones[tone])}>
          {clear ? <CheckCircle2 size={19} /> : <Icon size={19} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className={cn("type-numeric text-[1.5rem] font-semibold leading-none", clear ? "text-content-muted" : "text-content")}>
              {formatNumber(count || 0)}
            </span>
            <span className={cn("text-[0.875rem] font-semibold", clear ? "text-content-muted" : "text-content")}>{title}</span>
          </span>
          <span className="mt-1 block type-caption text-content-muted">{clear ? "All clear" : detail}</span>
        </span>
        {!clear && <ArrowRight size={16} className="mt-1 shrink-0 text-content-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent-text" />}
      </Link>
    </motion.div>
  );
};

/** Seven simple bars, one per day, so the week reads at a glance. */
const WeekBars = ({ days = [] }) => {
  const max = Math.max(1, ...days.map((day) => day.revenue));
  return (
    <div className="flex h-28 items-end gap-2" role="img" aria-label="Sales for the last 7 days">
      {days.map((day, index) => {
        const isToday = index === days.length - 1;
        const label = new Date(`${day.bucket}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short" });
        return (
          <div key={day.bucket} className="group relative flex flex-1 flex-col items-center gap-1.5">
            <span className="pointer-events-none absolute -top-7 whitespace-nowrap rounded-md bg-surface-inverse px-1.5 py-0.5 text-[0.6875rem] font-semibold text-content-inverse opacity-0 transition-opacity group-hover:opacity-100">
              {formatCurrency(day.revenue)} · {day.orders}
            </span>
            <motion.span
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(4, (day.revenue / max) * 84)}px` }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={cn("w-full max-w-[2.25rem] rounded-md", isToday ? "bg-accent" : "bg-accent-subtle group-hover:bg-accent group-hover:opacity-60")}
            />
            <span className={cn("text-[0.6875rem]", isToday ? "font-semibold text-content" : "text-content-muted")}>
              {isToday ? "Today" : label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Dashboard home: what needs doing today.
 *
 * Trends live in Analytics and downloadable numbers in Reports; this screen
 * answers "how is today going, and what should I do next?", with each to-do
 * linking straight to the filtered list that resolves it.
 */
const Overview = () => {
  const toast = useToast();
  const { userObj } = useSelector((state) => state.user);
  const { data, loading, error, refetch, reload } = useApi(getToday, null);
  const { mutate } = useMutation(updateOrderStatus);
  const [busyId, setBusyId] = useState(null);

  if (error) {
    return (
      <Card>
        <ErrorState description={error} onRetry={refetch} />
      </Card>
    );
  }

  const queue = data?.queue || {};
  const week = data?.week?.slice(-7) || [];
  const weekTotal = week.reduce((sum, day) => sum + day.revenue, 0);

  const advance = async (order, step) => {
    setBusyId(order._id);
    try {
      await mutate(order._id, { status: step.status });
      toast.success(`${order.orderNumber} updated`, `${step.label} done.`);
      reload();
    } catch (caught) {
      toast.error("Could not update order", getErrorMessage(caught));
    } finally {
      setBusyId(null);
    }
  };

  const todos = [
    { icon: ClipboardCheck, count: queue.toConfirm, title: "to confirm", detail: "New orders waiting for you", to: "/admin/orders?status=pending", tone: "info" },
    { icon: PackageOpen, count: queue.toPack, title: "to pack", detail: "Confirmed, not packed yet", to: "/admin/orders?status=confirmed,processing" },
    { icon: PackageCheck, count: queue.toShip, title: "ready to ship", detail: "Packed, add tracking & ship", to: "/admin/orders?status=packed" },
    { icon: Truck, count: queue.inTransit, title: "on the way", detail: "Shipped or out for delivery", to: "/admin/orders?status=shipped,out_for_delivery", tone: "info" },
    {
      icon: Banknote,
      count: queue.codToCollect?.orders,
      title: "cash to collect",
      detail: `${formatCurrency(queue.codToCollect?.amount)} due on delivery`,
      to: "/admin/orders?paymentStatus=pending",
      tone: "warning",
    },
    { icon: TriangleAlert, count: queue.lowStock, title: "low on stock", detail: "Reorder before they sell out", to: "/admin/inventory?lowStock=true", tone: "critical" },
    { icon: Inbox, count: queue.unreadMessages, title: "unread messages", detail: "From the contact form", to: "/admin/messages", tone: "info" },
    { icon: RotateCcw, count: queue.refundRequests, title: "refund requests", detail: "Waiting for review", to: "/admin/refunds", tone: "warning" },
  ];
  const openTodos = todos.filter((todo) => todo.count > 0).length;

  return (
    <div className="space-y-section">
      {/* ------------------------------- Greeting ------------------------------- */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="type-caption text-content-muted">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="font-display mt-0.5 text-[1.75rem] font-semibold leading-tight text-content">
            {greeting()}
            {userObj?.firstName ? `, ${userObj.firstName}` : ""}
          </h1>
          <p className="mt-1 type-body text-content-secondary">
            {loading
              ? "Checking what needs doing…"
              : openTodos
                ? `You have ${openTodos} thing${openTodos === 1 ? "" : "s"} to look at today.`
                : "Everything is up to date. Nice work!"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button as={Link} to="/" target="_blank" variant="secondary" icon={ExternalLink}>
            View store
          </Button>
          <Button as={Link} to="/admin/products?new=1" variant="primary" icon={Plus}>
            Add product
          </Button>
        </div>
      </div>

      {/* ----------------------------- Today's sales ---------------------------- */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr]">
        <Card className="relative overflow-hidden p-5">
          <span
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, var(--brand-leaf-from), transparent 70%)" }}
            aria-hidden="true"
          />
          <p className="type-label text-content-muted">Sales today</p>
          {loading ? (
            <Skeleton className="mt-3 h-9 w-36" />
          ) : (
            <>
              <p className="type-numeric mt-2 text-[2rem] font-semibold leading-none text-content">{formatCurrency(data?.today?.revenue)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Delta change={data?.change?.revenue} />
                <span className="type-caption text-content-muted">Yesterday {formatCurrency(data?.yesterday?.revenue)}</span>
              </div>
            </>
          )}
        </Card>
        <Card className="p-5">
          <p className="type-label text-content-muted">Orders today</p>
          {loading ? (
            <Skeleton className="mt-3 h-9 w-20" />
          ) : (
            <>
              <p className="type-numeric mt-2 text-[2rem] font-semibold leading-none text-content">{formatNumber(data?.today?.orders)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Delta change={data?.change?.orders} />
                <span className="type-caption text-content-muted">Yesterday {formatNumber(data?.yesterday?.orders)}</span>
              </div>
            </>
          )}
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <p className="type-label text-content-muted">Last 7 days</p>
            {!loading && <p className="type-numeric text-[0.9375rem] font-semibold text-content">{formatCurrency(weekTotal)}</p>}
          </div>
          {loading ? <Skeleton className="h-28 w-full" /> : <WeekBars days={week} />}
        </Card>
      </div>

      {/* ------------------------------- To-dos -------------------------------- */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[1.0625rem] font-semibold text-content">Needs your attention</h2>
          <span className="type-caption text-content-muted">Click a card to open that list</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-[5.25rem] rounded-2xl" />)
            : todos.map((todo, index) => <TodoCard key={todo.title} index={index} {...todo} />)}
        </div>
      </section>

      {/* ---------------------- Recent orders + shortcuts ---------------------- */}
      <div className="grid gap-4 xl:grid-cols-[1fr_18rem]">
        <Card>
          <CardHeader
            title="Latest orders"
            description="Move each one along without opening it"
            actions={
              <Button as={Link} to="/admin/orders" variant="ghost" size="sm" iconRight={ArrowRight}>
                All orders
              </Button>
            }
          />
          {loading ? (
            <div className="p-5">
              <SkeletonText lines={6} />
            </div>
          ) : data?.recentOrders?.length ? (
            <ul className="divide-y divide-line-subtle">
              {data.recentOrders.map((order) => {
                const step = NEXT_STEP[order.status];
                const name = order.User?.firstName ? `${order.User.firstName} ${order.User.lastName || ""}`.trim() : "Guest";
                return (
                  <li key={order._id} className="flex flex-wrap items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-hover sm:flex-nowrap">
                    <Link to={`/admin/orders/${order._id}`} className="flex min-w-0 flex-1 items-center gap-3">
                      <Avatar size="sm" firstName={order.User?.firstName} lastName={order.User?.lastName} src={order.User?.avatar} />
                      <span className="min-w-0">
                        <span className="block truncate type-body-strong text-content">{name}</span>
                        <span className="block truncate type-caption">
                          {order.orderNumber} · {formatRelativeTime(order.createdAt)} · {order.onlinePayment ? "Paid online" : "Cash on delivery"}
                        </span>
                      </span>
                    </Link>
                    <OrderStatusBadge status={order.status} />
                    <span className="type-body-strong type-numeric w-20 text-right text-content">{formatCurrency(order.pricing?.grandTotal)}</span>
                    <span className="w-32 text-right">
                      {step &&
                        (step.openOrder ? (
                          <Button as={Link} to={`/admin/orders/${order._id}`} size="sm" variant="secondary" iconRight={ArrowRight}>
                            {step.label}
                          </Button>
                        ) : (
                          <Button size="sm" variant="secondary" loading={busyId === order._id} onClick={() => advance(order, step)}>
                            {step.label}
                          </Button>
                        ))}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState icon={PackageOpen} title="No orders yet" description="They'll show up here the moment someone buys." />
          )}
        </Card>

        <Card className="p-4">
          <p className="mb-3 px-1 type-label text-content-muted">Shortcuts</p>
          <div className="grid gap-2">
            {[
              { to: "/admin/products?new=1", icon: Plus, label: "Add a product" },
              { to: "/admin/coupons", icon: Tag, label: "Create a discount" },
              { to: "/admin/analytics", icon: BarChart3, label: "See trends" },
              { to: "/admin/reports", icon: FileSpreadsheet, label: "Download a report" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-xl border border-line-subtle px-3 py-2.5 text-[0.875rem] font-medium text-content transition-colors hover:border-accent hover:bg-accent-subtle hover:text-accent-text"
              >
                <item.icon size={16} />
                <span className="flex-1">{item.label}</span>
                <ArrowRight size={14} className="text-content-muted" />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Overview;
