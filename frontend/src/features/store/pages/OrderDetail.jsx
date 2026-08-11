import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Package, Truck, XCircle } from "lucide-react";

import { cancelOrder, getSingleOrder } from "../../../api/orderApi";
import { useApi, useMutation } from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/Modal";
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState, ErrorState } from "../../../components/ui/States";
import { OrderStatusBadge, PaymentStatusBadge } from "../../../components/ui/StatusBadge";
import { useToast } from "../../../components/ui/Toast";
import { formatCurrency, formatDateTime, humanise } from "../../../lib/format";
import cn from "../../../lib/cn";
import { Container } from "../components/Primitives";

/** Statuses at which a customer can still call the order off themselves. */
const CANCELLABLE = ["pending", "confirmed", "processing", "packed"];

const OrderDetail = () => {
  const { orderId } = useParams();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: order, loading, error, refetch } = useApi(getSingleOrder, orderId);
  const cancel = useMutation(() => cancelOrder(orderId, "Cancelled by customer"));

  if (loading) {
    return (
      <Container className="py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-64 w-full rounded-lg" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-16">
        <ErrorState description={error} onRetry={refetch} />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-16">
        <EmptyState icon={Package} title="Order not found" />
      </Container>
    );
  }

  const canCancel = CANCELLABLE.includes(order.status);

  const handleCancel = async () => {
    try {
      await cancel.mutate();
      toast.success("Order cancelled", "Any payment made will be refunded.");
      setConfirmOpen(false);
      refetch();
    } catch (caught) {
      toast.error(caught?.response?.data?.message || "Could not cancel this order");
    }
  };

  return (
    <Container className="py-8">
      <Button as={Link} to="/orders" variant="ghost" size="sm" icon={ArrowLeft} className="mb-4">
        All orders
      </Button>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="type-page-title type-numeric text-content">
            {order.orderNumber || `#${String(order._id).slice(-8).toUpperCase()}`}
          </h1>
          <p className="type-description mt-1">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
          {canCancel && (
            <Button
              variant="danger-subtle"
              size="sm"
              icon={XCircle}
              onClick={() => setConfirmOpen(true)}
            >
              Cancel order
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* -------------------------------- Progress ------------------------------ */}
          {order.statusHistory?.length > 0 && (
            <section className="rounded-lg border border-line-subtle bg-surface p-5">
              <h2 className="type-section-title mb-4 flex items-center gap-2 text-content">
                <Truck size={17} className="text-content-muted" />
                Progress
              </h2>
              <ol className="relative space-y-4 border-l border-line pl-5">
                {order.statusHistory.map((entry, index) => (
                  <li key={`${entry.status}-${index}`} className="relative">
                    <span
                      className={cn(
                        "absolute -left-[1.6875rem] top-1 h-3 w-3 rounded-full border-2 border-surface",
                        index === order.statusHistory.length - 1
                          ? "bg-accent"
                          : "bg-line-strong"
                      )}
                    />
                    <p className="type-body-strong text-content">{humanise(entry.status)}</p>
                    <p className="type-caption text-content-muted">
                      {formatDateTime(entry.changedAt)}
                    </p>
                    {entry.note && (
                      <p className="type-caption mt-0.5 text-content-secondary">{entry.note}</p>
                    )}
                  </li>
                ))}
              </ol>

              {order.shipping?.trackingNumber && (
                <p className="mt-4 rounded-md bg-surface-sunken p-3 type-body text-content-secondary">
                  Tracking:{" "}
                  <span className="type-numeric text-content">
                    {order.shipping.trackingNumber}
                  </span>
                  {order.shipping.carrier && ` · ${order.shipping.carrier}`}
                </p>
              )}
            </section>
          )}

          {/* --------------------------------- Items -------------------------------- */}
          <section className="rounded-lg border border-line-subtle bg-surface p-5">
            <h2 className="type-section-title mb-4 text-content">Items</h2>
            <ul className="divide-y divide-line-subtle">
              {(order.orderItems || []).map((item, index) => (
                <li key={`${item.product}-${index}`} className="flex gap-4 py-3">
                  <img
                    src={item.image}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-md bg-surface-sunken object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="type-body-strong text-content">
                      {item.product ? (
                        <Link to={`/product/${item.product}`} className="hover:text-accent-text">
                          {item.name}
                        </Link>
                      ) : (
                        item.name
                      )}
                    </p>
                    <p className="type-caption type-numeric text-content-muted">
                      Qty {item.qty}
                      {item.variantSku && ` · ${item.variantSku}`}
                    </p>
                  </div>
                  <span className="type-numeric type-body text-content">
                    {formatCurrency((item.totalPrice ?? item.price) * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-line-subtle bg-surface p-5">
            <h2 className="type-section-title mb-3 flex items-center gap-2 text-content">
              <MapPin size={17} className="text-content-muted" />
              Delivery address
            </h2>
            <address className="type-body not-italic text-content-secondary">
              <span className="block type-body-strong text-content">
                {order.shippingAddress?.fullName}
              </span>
              {order.shippingAddress?.address}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
              <br />
              <span className="type-numeric">{order.shippingAddress?.pinCode}</span>
              <br />
              <span className="type-numeric">{order.shippingAddress?.phoneNo}</span>
            </address>
          </section>

          <section className="rounded-lg border border-line-subtle bg-surface p-5">
            <h2 className="type-section-title mb-3 text-content">Payment summary</h2>
            <dl className="space-y-2.5">
              <Row label="Items" value={formatCurrency(order.pricing?.itemsTotal)} />
              {order.pricing?.discountTotal > 0 && (
                <Row
                  label="Discounts"
                  value={`− ${formatCurrency(order.pricing.discountTotal)}`}
                  tone="good"
                />
              )}
              {order.pricing?.taxTotal > 0 && (
                <Row label="Tax" value={formatCurrency(order.pricing.taxTotal)} />
              )}
              <Row
                label="Delivery"
                value={
                  order.pricing?.shippingTotal > 0
                    ? formatCurrency(order.pricing.shippingTotal)
                    : "Free"
                }
              />
            </dl>
            <div className="mt-3 flex items-baseline justify-between border-t border-line-subtle pt-3">
              <span className="type-body-strong text-content">Total paid</span>
              <span className="type-numeric text-[1.25rem] font-semibold text-content">
                {formatCurrency(order.pricing?.grandTotal, { precise: true })}
              </span>
            </div>
            <p className="type-caption mt-2 text-content-muted">
              {order.onlinePayment ? "Paid online" : "Cash on delivery"}
            </p>
          </section>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleCancel}
        title="Cancel this order?"
        description="Stock will be released and any payment refunded. This cannot be undone."
        confirmLabel="Cancel order"
        tone="danger"
        loading={cancel.loading}
      />
    </Container>
  );
};

const Row = ({ label, value, tone }) => (
  <div className="flex justify-between type-body">
    <dt className="text-content-secondary">{label}</dt>
    <dd className={cn("type-numeric", tone === "good" ? "text-status-good" : "text-content")}>
      {value}
    </dd>
  </div>
);

export default OrderDetail;
