import { useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Banknote, CalendarClock, MapPin, PartyPopper, Star, Truck, XCircle } from "lucide-react";

import { cancelOrder, getSingleOrder } from "../../../api/orderApi";
import { useApi, useMutation } from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import { ConfirmDialog } from "../../../components/ui/Modal";
import { Skeleton } from "../../../components/ui/Skeleton";
import { ErrorState } from "../../../components/ui/States";
import { OrderStatusBadge, PaymentStatusBadge } from "../../../components/ui/StatusBadge";
import { useToast } from "../../../components/ui/Toast";
import { formatCurrency, formatDateTime, humanise } from "../../../lib/format";
import cn from "../../../lib/cn";
import { Container } from "../components/Primitives";
import OrderTracker from "../components/OrderTracker";
import NotFound from "./NotFound";
import { useSession } from "../hooks/useStorefront";
import { Doodle } from "../../../components/ui/Doodles";

import { getErrorMessage } from "../../../lib/apiError";
import { img } from "../../../lib/img";
/** Statuses at which a customer can still call the order off themselves. */
const CANCELLABLE = ["pending", "confirmed", "processing"];

const addDays = (date, days) => new Date(new Date(date).getTime() + days * 86400000);
const shortDate = (date) => new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

const OrderDetail = () => {
  const { orderId } = useParams();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const justPlaced = searchParams.get("placed") === "1";

  const { data: order, loading, error, refetch, reload } = useApi(getSingleOrder, orderId);
  const { user, isAdmin } = useSession();
  const cancel = useMutation(() => cancelOrder(orderId, "Cancelled by customer"));

  if (loading && !order) {
    return (
      <Container className="py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-64 w-full rounded-lg" />
      </Container>
    );
  }

  // A bad link, or someone else's order: same answer, and it never says which.
  if ((error && /not found|invalid identifier|forbidden|not allowed/i.test(error)) || (!loading && !error && !order)) {
    return (
      <NotFound
        title="We couldn't find that order"
        description="It may belong to another account, or the link is incomplete. Your own orders are all in one place."
        backTo="/orders"
        backLabel="Your orders"
      />
    );
  }

  if (error) {
    return (
      <Container className="py-16">
        <ErrorState description={error} onRetry={refetch} />
      </Container>
    );
  }

  // Staff opening a customer's order link get the dashboard view of it,
  // with the tools to act on it, instead of the customer's page.
  const ownerId = order.User?._id || order.User;
  const isOwner = Boolean(user?._id) && String(ownerId) === String(user._id);
  if (isAdmin && !isOwner) return <Navigate to={`/admin/orders/${order._id}`} replace />;

  const canCancel = CANCELLABLE.includes(order.status);

  const handleCancel = async () => {
    try {
      await cancel.mutate();
      toast.success("Order cancelled", "Any payment made will be refunded.");
      setConfirmOpen(false);
      reload();
    } catch (caught) {
      toast.error(getErrorMessage(caught, "Could not cancel this order"));
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

      {justPlaced && isOwner && !["cancelled", "refunded"].includes(order.status) && (
        <motion.section
          initial={{ opacity: 0, y: 12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative mb-6 overflow-hidden rounded-3xl p-6 text-white shadow-lg sm:p-8"
          style={{ background: "linear-gradient(120deg, var(--promo-leaf-from), var(--promo-leaf-to))" }}
        >
          <Doodle type="sparkle" size={34} float className="absolute right-8 top-6 text-white opacity-50" />
          <Doodle type="star" size={24} float delay={0.5} className="absolute right-24 bottom-6 text-white opacity-40" />
          <Doodle type="leaf" size={60} float delay={0.3} className="absolute -bottom-3 right-1/3 hidden text-white opacity-25 sm:block" />
          <p className="flex items-center gap-2 text-[0.875rem] font-semibold uppercase tracking-[0.1em] opacity-90">
            <PartyPopper size={18} /> Order placed
          </p>
          <h2 className="font-display mt-2 text-[1.75rem] font-semibold leading-tight sm:text-[2.25rem]">Thank you for your order!</h2>
          <p className="mt-2 max-w-[56ch] text-[0.9375rem] opacity-90">
            We&apos;ve emailed your confirmation. We&apos;ll keep you posted as it&apos;s packed, shipped and on its way.
          </p>
        </motion.section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          {/* -------------------------------- Tracker ------------------------------- */}
          <section className="rounded-2xl border border-line-subtle bg-surface p-5 sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-[1.0625rem] font-semibold text-content">
                <Truck size={18} className="text-accent-text" /> Track your order
              </h2>
              {!["delivered", "cancelled", "returned", "refunded"].includes(order.status) && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-subtle px-3 py-1 text-[0.8125rem] font-semibold text-accent-text">
                  <CalendarClock size={14} />
                  Arriving by{" "}
                  {shortDate(addDays(order.createdAt, order.shipping?.maxDeliveryDays || 7))}
                </span>
              )}
            </div>
            <OrderTracker order={order} />
            {order.status === "delivered" && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-sunken p-4">
                <p className="type-body text-content-secondary">Enjoying it? Help other shoppers with a quick review.</p>
                {order.orderItems?.[0]?.product && (
                  <Button as={Link} to={`/product/${order.orderItems[0].product}`} size="sm" variant="primary" icon={Star}>
                    Write a review
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* -------------------------------- Progress ------------------------------ */}
          {order.statusHistory?.length > 0 && (
            <section className="rounded-lg border border-line-subtle bg-surface p-5">
              <h2 className="type-section-title mb-4 flex items-center gap-2 text-content">
                <Truck size={17} className="text-content-muted" />
                Activity
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
                    src={img(item.image, 160)}
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

          {!order.onlinePayment && order.paymentStatus === "pending" && !["cancelled", "refunded"].includes(order.status) && (
            <section className="rounded-2xl border border-status-warning bg-status-warning-bg p-5">
              <p className="flex items-center gap-2 font-semibold text-content">
                <Banknote size={18} className="text-status-warning" /> Cash on delivery
              </p>
              <p className="mt-1.5 type-body text-content-secondary">
                Please keep{" "}
                <span className="type-numeric font-semibold text-content">
                  {formatCurrency(order.pricing?.grandTotal, { precise: true })}
                </span>{" "}
                ready. You can pay the delivery person in cash or by UPI.
              </p>
            </section>
          )}

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
              <span className="type-body-strong text-content">
                {order.paymentStatus === "paid" ? "Total paid" : "Total to pay"}
              </span>
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
