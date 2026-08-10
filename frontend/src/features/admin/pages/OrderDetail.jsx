import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Package, Truck } from "lucide-react";
import { getOrder, updateOrderStatus } from "../../../api/adminApi";
import { useApi, useMutation } from "../../../hooks/useApi";
import { useToast } from "../../../components/ui/Toast";
import PageHeader from "../../../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { Input, Select, Textarea } from "../../../components/ui/Field";
import { ErrorState } from "../../../components/ui/States";
import { SkeletonText } from "../../../components/ui/Skeleton";
import { OrderStatusBadge, PaymentStatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDateTime, humanise } from "../../../lib/format";

/**
 * Transitions the API accepts from each status.
 *
 * Mirrored here so the form only offers legal moves; the server enforces the
 * same rules, this just avoids offering an action that is going to be refused.
 */
const NEXT_STATUSES = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["out_for_delivery", "returned"],
  out_for_delivery: ["delivered", "returned"],
  delivered: ["returned"],
  returned: ["refunded"],
  cancelled: ["refunded"],
  refunded: [],
};

const SummaryRow = ({ label, value, strong }) => (
  <div className="flex items-center justify-between gap-4 py-1.5">
    <span className={strong ? "type-body-strong text-content" : "type-body text-content-secondary"}>
      {label}
    </span>
    <span
      className={
        strong
          ? "type-body-strong type-numeric text-content"
          : "type-body type-numeric text-content-secondary"
      }
    >
      {value}
    </span>
  </div>
);

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: order, loading, error, refetch } = useApi(getOrder, id);
  const { mutate, loading: saving } = useMutation(updateOrderStatus);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [form, setForm] = useState({ status: "", note: "", trackingNumber: "", carrier: "" });

  const openStatusModal = () => {
    const [firstAllowed] = NEXT_STATUSES[order?.status] || [];
    setForm({ status: firstAllowed || "", note: "", trackingNumber: "", carrier: "" });
    setStatusModalOpen(true);
  };

  const handleStatusChange = async () => {
    try {
      await mutate(id, {
        status: form.status,
        note: form.note || undefined,
        // Tracking only means something on the dispatch transition.
        tracking:
          form.status === "shipped"
            ? { trackingNumber: form.trackingNumber, carrier: form.carrier }
            : undefined,
      });
      toast.success("Order updated", `Status changed to ${humanise(form.status)}.`);
      setStatusModalOpen(false);
      refetch();
    } catch (caught) {
      toast.error("Could not update order", caught?.response?.data?.message);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <SkeletonText lines={8} />
        </CardBody>
      </Card>
    );
  }

  if (error || !order) {
    return (
      <Card>
        <ErrorState description={error || "Order not found."} onRetry={refetch} />
      </Card>
    );
  }

  const allowedTransitions = NEXT_STATUSES[order.status] || [];
  const address = order.shippingAddress || {};

  return (
    <div className="space-y-section">
      <PageHeader
        breadcrumbs={
          <Button as={Link} to="/admin/orders" variant="link" icon={ArrowLeft} className="type-caption">
            Back to orders
          </Button>
        }
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)}`}
        actions={
          allowedTransitions.length > 0 && (
            <Button variant="primary" icon={Truck} onClick={openStatusModal}>
              Update status
            </Button>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <OrderStatusBadge status={order.status} size="md" />
        <PaymentStatusBadge status={order.paymentStatus} size="md" />
        <span className="type-caption">
          {order.onlinePayment ? "Paid online" : "Cash on delivery"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader title="Items" description={`${order.orderItems?.length || 0} line items`} />
            <ul className="divide-y divide-line-subtle">
              {order.orderItems?.map((item, index) => (
                <li key={`${item.product}-${index}`} className="flex items-center gap-3 px-5 py-3">
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="w-11 h-11 rounded-md object-cover bg-surface-sunken shrink-0"
                    onError={(event) => {
                      event.currentTarget.style.visibility = "hidden";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="type-body-strong text-content truncate">{item.name}</p>
                    <p className="type-caption truncate">
                      {item.variantLabel && `${item.variantLabel} · `}
                      {formatCurrency(item.totalPrice, { precise: true })} × {item.qty}
                    </p>
                  </div>
                  <p className="type-body-strong type-numeric text-content shrink-0">
                    {formatCurrency(item.lineTotal ?? item.totalPrice * item.qty, { precise: true })}
                  </p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Status history" />
            <CardBody>
              <ol className="relative space-y-4">
                {order.statusHistory?.length ? (
                  order.statusHistory
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="mt-1 w-2 h-2 rounded-full bg-accent shrink-0" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="type-body-strong text-content">{humanise(entry.status)}</p>
                          {entry.note && <p className="type-caption">{entry.note}</p>}
                          <p className="type-caption">{formatDateTime(entry.changedAt)}</p>
                        </div>
                      </li>
                    ))
                ) : (
                  <p className="type-caption">No history recorded.</p>
                )}
              </ol>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Summary" />
            <CardBody>
              <SummaryRow label="Items total" value={formatCurrency(order.pricing?.itemsTotal, { precise: true })} />
              {order.pricing?.productDiscountTotal > 0 && (
                <SummaryRow
                  label="Product discounts"
                  value={`−${formatCurrency(order.pricing.productDiscountTotal, { precise: true })}`}
                />
              )}
              {order.pricing?.couponDiscountTotal > 0 && (
                <SummaryRow
                  label={`Coupon${order.coupon?.code ? ` (${order.coupon.code})` : ""}`}
                  value={`−${formatCurrency(order.pricing.couponDiscountTotal, { precise: true })}`}
                />
              )}
              <SummaryRow label="Tax" value={formatCurrency(order.pricing?.taxTotal, { precise: true })} />
              <SummaryRow
                label="Delivery"
                value={
                  order.pricing?.shippingTotal
                    ? formatCurrency(order.pricing.shippingTotal, { precise: true })
                    : "Free"
                }
              />
              <div className="border-t border-line-subtle mt-2 pt-2">
                <SummaryRow
                  label="Total"
                  value={formatCurrency(order.pricing?.grandTotal, { precise: true })}
                  strong
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Delivery address" />
            <CardBody className="space-y-1">
              <p className="type-body-strong text-content flex items-center gap-2">
                <MapPin size={14} className="text-content-muted" aria-hidden="true" />
                {address.fullName}
              </p>
              <p className="type-body text-content-secondary">{address.address}</p>
              {address.landMark && <p className="type-body text-content-secondary">{address.landMark}</p>}
              <p className="type-body text-content-secondary">
                {address.city}, {address.state} {address.pinCode}
              </p>
              <p className="type-caption pt-1">Phone: {address.phoneNo}</p>
            </CardBody>
          </Card>

          {order.shipping?.trackingNumber && (
            <Card>
              <CardHeader title="Tracking" />
              <CardBody className="space-y-1">
                <p className="type-body text-content">{order.shipping.carrier || "Carrier"}</p>
                <p className="type-body-strong text-content font-mono">
                  {order.shipping.trackingNumber}
                </p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      <Modal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update order status"
        description={`Currently ${humanise(order.status)}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleStatusChange} loading={saving} disabled={!form.status}>
              Update
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="New status"
            required
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
            options={allowedTransitions.map((status) => ({
              value: status,
              label: humanise(status),
            }))}
            placeholder="Select a status"
            hint="Only transitions valid from the current status are listed."
          />

          {form.status === "shipped" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Carrier"
                placeholder="e.g. Delhivery"
                value={form.carrier}
                onChange={(event) => setForm({ ...form, carrier: event.target.value })}
              />
              <Input
                label="Tracking number"
                icon={Package}
                value={form.trackingNumber}
                onChange={(event) => setForm({ ...form, trackingNumber: event.target.value })}
              />
            </div>
          )}

          <Textarea
            label="Note"
            rows={3}
            placeholder="Optional note recorded in the order history"
            value={form.note}
            onChange={(event) => setForm({ ...form, note: event.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetail;
