import { useNavigate, useSearchParams } from "react-router-dom";
import { Banknote, ChevronRight, CreditCard, Search, ShoppingCart } from "lucide-react";
import { getAdminOrders } from "../../../api/adminApi";
import { useApi, useListParams } from "../../../hooks/useApi";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import { Input, Select } from "../../../components/ui/Field";
import Avatar from "../../../components/ui/Avatar";
import { EmptyState } from "../../../components/ui/States";
import { OrderStatusBadge, PaymentStatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDateTime, formatRelativeTime } from "../../../lib/format";
import ListToolbar, { QuickTabs, useTabCounts } from "../../../components/ui/ListToolbar";

/** Work queues as tabs; several statuses share a tab where staff treat them alike. */
const TABS = [
  { value: "", label: "All", params: {} },
  { value: "pending", label: "To confirm", params: { status: "pending" }, alert: true },
  { value: "confirmed,processing", label: "To pack", params: { status: "confirmed,processing" }, alert: true },
  { value: "packed", label: "Ready to ship", params: { status: "packed" }, alert: true },
  { value: "shipped,out_for_delivery", label: "On the way", params: { status: "shipped,out_for_delivery" } },
  { value: "delivered", label: "Delivered", params: { status: "delivered" } },
  { value: "cancelled,returned,refunded", label: "Cancelled & returns", params: { status: "cancelled,returned,refunded" } },
];

const PAYMENT_OPTIONS = [
  { value: "", label: "Any payment" },
  { value: "pending", label: "Not paid yet" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "partially_refunded", label: "Partly refunded" },
];

const Orders = () => {
  const navigate = useNavigate();
  // ?status=… and ?paymentStatus=… pre-filter the list (dashboard to-do cards link here).
  const [searchParams] = useSearchParams();
  const list = useListParams({
    limit: 20,
    sort: "createdAt:desc",
    ...(searchParams.get("status") ? { status: searchParams.get("status") } : {}),
    ...(searchParams.get("paymentStatus") ? { paymentStatus: searchParams.get("paymentStatus") } : {}),
  });
  const { data, meta, loading, error, refetch } = useApi(getAdminOrders, list.params);
  const counts = useTabCounts(getAdminOrders, {}, TABS);

  const columns = [
    {
      key: "orderNumber",
      header: "Order",
      sortKey: "orderNumber",
      render: (order) => {
        const items = order.orderItems || [];
        return (
          <span className="flex items-center gap-3">
            <span className="flex -space-x-2">
              {items.slice(0, 2).map((item, index) => (
                <img
                  key={index}
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 rounded-lg border-2 border-surface bg-surface-sunken object-cover"
                />
              ))}
            </span>
            <span className="min-w-0">
              <span className="block type-body-strong text-content">{order.orderNumber}</span>
              <span className="block type-caption">
                {items.length} item{items.length === 1 ? "" : "s"}
                {items[0]?.name ? ` · ${items[0].name.slice(0, 24)}${items[0].name.length > 24 ? "…" : ""}` : ""}
              </span>
            </span>
          </span>
        );
      },
    },
    {
      key: "customer",
      header: "Customer",
      render: (order) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <Avatar size="sm" firstName={order.User?.firstName} lastName={order.User?.lastName} src={order.User?.avatar} />
          <span className="min-w-0">
            <span className="block truncate type-body text-content">
              {order.User ? `${order.User.firstName} ${order.User.lastName || ""}`.trim() : "Guest"}
            </span>
            <span className="block truncate type-caption">{order.shippingAddress?.city || order.User?.email}</span>
          </span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order) => <OrderStatusBadge status={order.status} />,
    },
    {
      key: "paymentStatus",
      header: "Payment",
      hideBelow: "lg",
      render: (order) => (
        <span className="flex flex-col items-start gap-1">
          <PaymentStatusBadge status={order.paymentStatus} />
          <span className="flex items-center gap-1 type-caption">
            {order.onlinePayment ? <CreditCard size={12} /> : <Banknote size={12} />}
            {order.onlinePayment ? "Online" : "Cash on delivery"}
          </span>
        </span>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      numeric: true,
      sortKey: "pricing.grandTotal",
      render: (order) => <span className="type-body-strong text-content">{formatCurrency(order.pricing?.grandTotal)}</span>,
    },
    {
      key: "createdAt",
      header: "Placed",
      sortKey: "createdAt",
      hideBelow: "md",
      render: (order) => (
        <span className="block">
          <span className="block type-body text-content">{formatRelativeTime(order.createdAt)}</span>
          <span className="block type-caption">{formatDateTime(order.createdAt)}</span>
        </span>
      ),
    },
    {
      key: "open",
      header: "",
      align: "right",
      render: () => <ChevronRight size={16} className="text-content-muted" />,
    },
  ];

  const activeTab = TABS.some((tab) => tab.value === (list.filters.status || "")) ? list.filters.status || "" : "";

  return (
    <div className="space-y-section">
      <PageHeader title="Orders" description="Every order, grouped by what needs doing next. Click a row to open it." />

      <Card className="overflow-hidden">
        <ListToolbar
          tabs={<QuickTabs id="orders" tabs={TABS} value={activeTab} counts={counts} onChange={(value) => list.setFilter("status", value)} />}
          search={
            <Input
              icon={Search}
              placeholder="Order number, customer or city"
              value={list.search}
              onChange={(event) => list.setSearch(event.target.value)}
              aria-label="Search orders"
              clearable
              onClear={() => list.setSearch("")}
            />
          }
          filters={
            <Select
              aria-label="Filter by payment"
              value={list.filters.paymentStatus || ""}
              onChange={(event) => list.setFilter("paymentStatus", event.target.value)}
              options={PAYMENT_OPTIONS}
              className="w-44"
            />
          }
          total={meta?.total}
          noun={meta?.total === 1 ? "order" : "orders"}
        />

        <DataTable
          columns={columns}
          rows={data}
          loading={loading}
          error={error}
          onRetry={refetch}
          sort={list.sort}
          onSortChange={list.setSort}
          onRowClick={(order) => navigate(`/admin/orders/${order._id}`)}
          meta={meta}
          onPageChange={list.setPage}
          filtered={list.hasFilters}
          onClearFilters={list.clearFilters}
          emptyState={
            <EmptyState
              icon={ShoppingCart}
              title={list.hasFilters ? "Nothing here right now" : "No orders yet"}
              description={list.hasFilters ? "No orders match this tab or search." : "Orders will appear here as customers place them."}
              filtered={list.hasFilters}
              onClear={list.clearFilters}
            />
          }
        />
      </Card>
    </div>
  );
};

export default Orders;
