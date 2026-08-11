import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Banknote, Check, CreditCard, MapPin, ShoppingBag, Tag } from "lucide-react";

import { createOrderApi } from "../../../api/orderApi";
import { paymentInit, paymentSuccess } from "../../../api/paymentApi";
import { createAddress, getAddresses, quoteOrder } from "../../../api/storeApi";
import { useApi, useMutation } from "../../../hooks/useApi";
import Button from "../../../components/ui/Button";
import { Input, Select } from "../../../components/ui/Field";
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/States";
import { useToast } from "../../../components/ui/Toast";
import { formatCurrency } from "../../../lib/format";
import { loadScript } from "../../../utils/functions";
import cn from "../../../lib/cn";
import { Container } from "../components/Primitives";
import { toOrderCart, useCart, useSession } from "../hooks/useStorefront";

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
].map((state) => ({ value: state, label: state }));

const EMPTY_ADDRESS = {
  fullName: "",
  phoneNo: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
  landMark: "",
};

/**
 * Checkout.
 *
 * Address, delivery and payment sit on one screen rather than three: the cart
 * is already known, and every step after the address is a single choice. The
 * order total comes from `/api/orders/quote` on every change, so what is shown
 * is always what the server will charge.
 */
const Checkout = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { items, clear } = useCart();
  const { user } = useSession();

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [draft, setDraft] = useState(EMPTY_ADDRESS);
  const [showForm, setShowForm] = useState(false);
  const [couponDraft, setCouponDraft] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [online, setOnline] = useState(false);
  const [placing, setPlacing] = useState(false);

  const { data: addresses, loading: addressesLoading, refetch: refetchAddresses } =
    useApi(getAddresses, null);

  // Preselect the customer's default address so the common case is one click.
  useEffect(() => {
    if (!addresses?.length) {
      setShowForm(true);
      return;
    }
    setSelectedAddressId((current) => current || addresses[0]._id);
    setShowForm(false);
  }, [addresses]);

  const shippingAddress = useMemo(() => {
    const saved = addresses?.find((item) => item._id === selectedAddressId);
    return saved?.shippingAddress || null;
  }, [addresses, selectedAddressId]);

  const orderCart = useMemo(() => toOrderCart(items), [items]);

  const quote = useApi(
    quoteOrder,
    orderCart.length
      ? {
          cart: orderCart,
          ...(couponCode ? { couponCode } : {}),
          ...(shippingAddress ? { shippingAddress } : {}),
        }
      : null,
    { enabled: orderCart.length > 0 }
  );

  const saveAddress = useMutation(createAddress);

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out"
          description="Add something to your bag first."
          action={
            <Button as={Link} to="/shop" variant="primary">
              Browse products
            </Button>
          }
        />
      </Container>
    );
  }

  const submitAddress = async (event) => {
    event.preventDefault();
    try {
      const response = await saveAddress.mutate({ ...draft, isDefault: true });
      toast.success("Address saved");
      setDraft(EMPTY_ADDRESS);
      setShowForm(false);
      await refetchAddresses();
      setSelectedAddressId(response?.data?._id || null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save that address");
    }
  };

  const applyCoupon = () => {
    setCouponCode(couponDraft.trim().toUpperCase());
  };

  /** Places the order, running the Razorpay flow first when paying online. */
  const placeOrder = async () => {
    if (!shippingAddress) {
      toast.warning("Choose a delivery address first");
      return;
    }

    setPlacing(true);
    try {
      const payload = {
        cart: orderCart,
        shippingAddress,
        onlinePayment: online,
        ...(couponCode ? { couponCode } : {}),
      };

      if (!online) {
        const response = await createOrderApi(payload);
        clear();
        toast.success("Order placed", "You will receive a confirmation email shortly.");
        navigate(`/order/${response.orderId}`);
        return;
      }

      const ready = await loadScript();
      if (!ready) throw new Error("Could not reach the payment gateway. Check your connection.");

      const amount = quote.data?.pricing?.grandTotal;
      const init = await paymentInit({ amount });
      // `data` is the gateway's own order object; the publishable key is
      // returned alongside it at the top level.
      const gatewayOrder = init.data;

      // Razorpay drives the rest: the order is only created once the gateway
      // has confirmed and the server has verified the signature.
      await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: init.KEY_ID,
          amount: gatewayOrder.amount,
          currency: gatewayOrder.currency || "INR",
          name: "Planet",
          description: "Order payment",
          order_id: gatewayOrder.id,
          prefill: {
            name: shippingAddress.fullName,
            email: user?.email,
            contact: String(shippingAddress.phoneNo || ""),
          },
          theme: { color: "#111827" },
          handler: async (result) => {
            try {
              await paymentSuccess({
                orderCreationId: gatewayOrder.id,
                razorpayOrderId: result.razorpay_order_id,
                razorpayPaymentId: result.razorpay_payment_id,
                razorpaySignature: result.razorpay_signature,
              });

              const response = await createOrderApi({
                ...payload,
                paymentId: result.razorpay_payment_id,
              });
              clear();
              toast.success("Payment received", "Your order is confirmed.");
              navigate(`/order/${response.orderId}`);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment was cancelled")),
          },
        });
        razorpay.open();
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Could not place the order");
    } finally {
      setPlacing(false);
    }
  };

  const pricing = quote.data?.pricing;

  return (
    <Container className="py-8">
      <h1 className="type-page-title mb-6 text-content">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {/* -------------------------------- Address ------------------------------- */}
          <section className="rounded-lg border border-line-subtle bg-surface p-5">
            <h2 className="type-section-title mb-4 flex items-center gap-2 text-content">
              <MapPin size={17} className="text-content-muted" />
              Delivery address
            </h2>

            {addressesLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="space-y-3">
                {(addresses || []).map((entry) => {
                  const selected = entry._id === selectedAddressId;
                  return (
                    <button
                      key={entry._id}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(entry._id);
                        setShowForm(false);
                      }}
                      className={cn(
                        "flex w-full gap-3 rounded-md border p-4 text-left transition-colors",
                        selected
                          ? "border-accent bg-accent-subtle"
                          : "border-line hover:border-line-strong"
                      )}
                      aria-pressed={selected}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                          selected ? "border-accent bg-accent text-accent-on" : "border-line-strong"
                        )}
                      >
                        {selected && <Check size={11} />}
                      </span>
                      <span className="min-w-0">
                        <span className="block type-body-strong text-content">
                          {entry.shippingAddress.fullName}
                        </span>
                        <span className="block type-body text-content-secondary">
                          {entry.shippingAddress.address}, {entry.shippingAddress.city},{" "}
                          {entry.shippingAddress.state} — {entry.shippingAddress.pinCode}
                        </span>
                        <span className="block type-caption type-numeric text-content-muted">
                          {entry.shippingAddress.phoneNo}
                        </span>
                      </span>
                    </button>
                  );
                })}

                {!showForm && (
                  <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
                    + Add a new address
                  </Button>
                )}
              </div>
            )}

            {showForm && (
              <form onSubmit={submitAddress} className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input
                  label="Full name"
                  required
                  value={draft.fullName}
                  onChange={(event) => setDraft({ ...draft, fullName: event.target.value })}
                />
                <Input
                  label="Phone number"
                  required
                  inputMode="numeric"
                  value={draft.phoneNo}
                  onChange={(event) => setDraft({ ...draft, phoneNo: event.target.value })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Address"
                    required
                    value={draft.address}
                    onChange={(event) => setDraft({ ...draft, address: event.target.value })}
                  />
                </div>
                <Input
                  label="City"
                  required
                  value={draft.city}
                  onChange={(event) => setDraft({ ...draft, city: event.target.value })}
                />
                <Select
                  label="State"
                  required
                  placeholder="Select a state"
                  options={STATES}
                  value={draft.state}
                  onChange={(event) => setDraft({ ...draft, state: event.target.value })}
                />
                <Input
                  label="PIN code"
                  required
                  inputMode="numeric"
                  value={draft.pinCode}
                  onChange={(event) => setDraft({ ...draft, pinCode: event.target.value })}
                />
                <Input
                  label="Landmark"
                  hint="Optional"
                  value={draft.landMark}
                  onChange={(event) => setDraft({ ...draft, landMark: event.target.value })}
                />

                <div className="flex gap-2 sm:col-span-2">
                  <Button type="submit" variant="primary" loading={saveAddress.loading}>
                    Save address
                  </Button>
                  {addresses?.length > 0 && (
                    <Button variant="ghost" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* -------------------------------- Payment ------------------------------- */}
          <section className="rounded-lg border border-line-subtle bg-surface p-5">
            <h2 className="type-section-title mb-4 flex items-center gap-2 text-content">
              <CreditCard size={17} className="text-content-muted" />
              Payment method
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <PaymentOption
                icon={Banknote}
                title="Cash on delivery"
                description="Pay the courier when your order arrives."
                selected={!online}
                onSelect={() => setOnline(false)}
              />
              <PaymentOption
                icon={CreditCard}
                title="Pay online"
                description="Card, UPI or net banking via Razorpay."
                selected={online}
                onSelect={() => setOnline(true)}
              />
            </div>
          </section>

          {/* --------------------------------- Items -------------------------------- */}
          <section className="rounded-lg border border-line-subtle bg-surface p-5">
            <h2 className="type-section-title mb-4 text-content">
              Order items ({items.length})
            </h2>
            <ul className="divide-y divide-line-subtle">
              {items.map((item) => (
                <li key={`${item._id}-${item.variantSku || ""}`} className="flex gap-3 py-3">
                  <img
                    src={item.image}
                    alt=""
                    className="h-14 w-14 rounded-md bg-surface-sunken object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="type-body-strong truncate text-content">{item.name}</p>
                    <p className="type-caption type-numeric text-content-muted">
                      Qty {item.qty}
                      {item.variantSku && ` · ${item.variantSku}`}
                    </p>
                  </div>
                  <span className="type-numeric type-body text-content">
                    {formatCurrency(item.totalPrice * item.qty)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* -------------------------------- Summary -------------------------------- */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-line-subtle bg-surface p-5">
            <h2 className="type-section-title mb-4 text-content">Order summary</h2>

            <div className="mb-4">
              <label htmlFor="coupon" className="type-label mb-1.5 block text-content">
                Coupon code
              </label>
              <div className="flex gap-2">
                <Input
                  id="coupon"
                  icon={Tag}
                  placeholder="SAVE10"
                  value={couponDraft}
                  onChange={(event) => setCouponDraft(event.target.value)}
                />
                <Button onClick={applyCoupon} disabled={!couponDraft.trim()}>
                  Apply
                </Button>
              </div>
              {couponCode && quote.data?.coupon && (
                <p className="type-caption mt-1.5 text-status-good">
                  {couponCode} applied — you save{" "}
                  {formatCurrency(quote.data.coupon.discountAmount)}
                </p>
              )}
              {couponCode && quote.error && (
                <p className="type-caption mt-1.5 text-status-critical">{quote.error}</p>
              )}
            </div>

            {quote.loading || !pricing ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <dl className="space-y-2.5 border-t border-line-subtle pt-4">
                <Row label="Items" value={formatCurrency(pricing.itemsTotal)} />
                {pricing.productDiscountTotal > 0 && (
                  <Row
                    label="Product discounts"
                    value={`− ${formatCurrency(pricing.productDiscountTotal)}`}
                    tone="good"
                  />
                )}
                {pricing.couponDiscountTotal > 0 && (
                  <Row
                    label="Coupon"
                    value={`− ${formatCurrency(pricing.couponDiscountTotal)}`}
                    tone="good"
                  />
                )}
                {pricing.taxTotal > 0 && (
                  <Row label="Tax" value={formatCurrency(pricing.taxTotal)} />
                )}
                <Row
                  label="Delivery"
                  value={
                    shippingAddress
                      ? pricing.shippingTotal > 0
                        ? formatCurrency(pricing.shippingTotal)
                        : "Free"
                      : "Select an address"
                  }
                />
              </dl>
            )}

            <div className="mt-4 flex items-baseline justify-between border-t border-line-subtle pt-4">
              <span className="type-body-strong text-content">Total</span>
              <span className="type-numeric text-[1.375rem] font-semibold text-content">
                {pricing ? formatCurrency(pricing.grandTotal, { precise: true }) : "—"}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              className="mt-5"
              loading={placing}
              disabled={!shippingAddress || quote.loading || !pricing}
              onClick={placeOrder}
            >
              {online ? "Pay and place order" : "Place order"}
            </Button>

            <p className="type-caption mt-3 text-center text-content-muted">
              Prices are confirmed by the server before payment.
            </p>
          </div>
        </aside>
      </div>
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

const PaymentOption = ({ icon: Icon, title, description, selected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={cn(
      "flex gap-3 rounded-md border p-4 text-left transition-colors",
      selected ? "border-accent bg-accent-subtle" : "border-line hover:border-line-strong"
    )}
  >
    <Icon size={18} className={selected ? "text-accent-text" : "text-content-muted"} />
    <span>
      <span className="block type-body-strong text-content">{title}</span>
      <span className="block type-caption text-content-secondary">{description}</span>
    </span>
  </button>
);

export default Checkout;
