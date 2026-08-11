import { Link } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";

import { getAllOrders } from "../../../api/orderApi";
import { useApi, useListParams } from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Field";
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { OrderStatusBadge, PaymentStatusBadge } from "../../../components/ui/StatusBadge";
import { formatCurrency, formatDate } from "../../../lib/format";
import { Container } from "../components/Primitives";

const STATUS_OPTIONS = [
  { value: "", label: "All orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

/** A customer's own order history. */
const Orders = () => {
  const { params, setFilter } = useListParams({ limit: 10, status: "" });

  const query = { ...params };
  if (!query.status) delete query.status;

  const { data: orders, meta, loading, error, refetch } = useApi(getAllOrders, query);

  return (
    <Container className="py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="type-page-title text-content">Your orders</h1>
          <p className="type-description mt-1">
            {meta?.total ? `${meta.total} order${meta.total === 1 ? "" : "s"}` : "Order history"}
          </p>
        </div>
        <div className="w-44">
          <Select
            aria-label="Filter by status"
            options={STATUS_OPTIONS}
            value={params.status || ""}
            onChange={(event) => setFilter("status", event.target.value)}
          />
        </div>
      </header>

      {error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : orders?.length ? (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order._id}
              className="rounded-lg border border-line-subtle bg-surface p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="type-body-strong type-numeric text-content">
                    {order.orderNumber || `#${String(order._id).slice(-8).toUpperCase()}`}
                  </p>
                  <p className="type-caption text-content-muted">
                    Placed {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex -space-x-2">
                  {(order.orderItems || []).slice(0, 4).map((item, index) => (
                    <img
                      key={`${item.product || item._id}-${index}`}
                      src={item.image}
                      alt=""
                      className="h-11 w-11 rounded-md border-2 border-surface bg-surface-sunken object-cover"
                    />
                  ))}
                </div>
                <p className="type-body text-content-secondary">
                  {(order.orderItems || []).length} item
                  {(order.orderItems || []).length === 1 ? "" : "s"}
                </p>

                <div className="ml-auto flex items-center gap-4">
                  <span className="type-numeric text-[1.0625rem] font-semibold text-content">
                    {formatCurrency(order.pricing?.grandTotal)}
                  </span>
                  <Button
                    as={Link}
                    to={`/order/${order._id}`}
                    size="sm"
                    iconRight={ChevronRight}
                  >
                    View
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Once you place an order it will appear here."
          action={
            <Button as={Link} to="/shop" variant="primary">
              Start shopping
            </Button>
          }
        />
      )}
    </Container>
  );
};

export default Orders;
