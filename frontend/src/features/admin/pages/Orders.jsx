import { useNavigate } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { getAdminOrders } from "../../../api/adminApi";
import { useApi, useListParams } from "../../../hooks/useApi";
import PageHeader from "../../../components/ui/PageHeader";
import { Card } from "../../../components/ui/Card";
import DataTable from "../../../components/ui/DataTable";
import { Input, Select } from "../../../components/ui/Field";
import Avatar from "../../../components/ui/Avatar";
import { EmptyState } from "../../../components/ui/States";
import { OrderStatusBadge, PaymentStatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDateTime } from "../../../lib/format";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
  { value: "refunded", label: "Refunded" },
];

const PAYMENT_OPTIONS = [
  { value: "", label: "All payments" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
  { value: "partially_refunded", label: "Partially refunded" },
];

const Orders = () => {
  const navigate = useNavigate();
  const list = useListParams({ limit: 20, sort: "createdAt:desc" });
  const { data, meta, loading, error, refetch } = useApi(getAdminOrders, list.params);

  const columns = [
    {
      key: "orderNumber",
      header: "Order",
      sortKey: "orderNumber",
      render: (order) => (
        <span className="type-body-strong text-content font-mono text-caption">
          {order.orderNumber}
        </span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (order) => (
        <span className="flex items-center gap-2.5 min-w-0">
          <Avatar
            size="xs"
            firstName={order.User?.firstName}
            lastName={order.User?.lastName}
            src={order.User?.avatar}
          />
          <span className="min-w-0">
            <span className="type-body text-content block truncate">
              {order.User
                ? `${order.User.firstName} ${order.User.lastName || ""}`.trim()
                : "Guest"}
            </span>
            <span className="type-caption block truncate">{order.User?.email}</span>
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
      render: (order) => <PaymentStatusBadge status={order.paymentStatus} />,
    },
    {
      key: "items",
      header: "Items",
      align: "right",
      numeric: true,
      hideBelow: "xl",
      render: (order) => order.orderItems?.length ?? 0,
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      numeric: true,
      sortKey: "pricing.grandTotal",
      render: (order) => (
        <span className="type-body-strong text-content">
          {formatCurrency(order.pricing?.grandTotal)}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Placed",
      sortKey: "createdAt",
      hideBelow: "md",
      render: (order) => <span className="type-caption">{formatDateTime(order.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-section">
      <PageHeader title="Orders" description="Track and fulfil customer orders." />

      <Card>
        {/* Filters sit in one row above the table, wrapping rather than scrolling. */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-line-subtle">
          <Input
            icon={Search}
            placeholder="Search by order number, name or city"
            value={list.search}
            onChange={(event) => list.setSearch(event.target.value)}
            aria-label="Search orders"
            className="sm:max-w-xs"
          />
          <Select
            aria-label="Filter by status"
            value={list.filters.status || ""}
            onChange={(event) => list.setFilter("status", event.target.value)}
            options={STATUS_OPTIONS}
            className="sm:w-48"
          />
          <Select
            aria-label="Filter by payment status"
            value={list.filters.paymentStatus || ""}
            onChange={(event) => list.setFilter("paymentStatus", event.target.value)}
            options={PAYMENT_OPTIONS}
            className="sm:w-48"
          />
        </div>

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
              title="No orders yet"
              description="Orders will appear here as customers place them."
            />
          }
        />
      </Card>
    </div>
  );
};

export default Orders;
