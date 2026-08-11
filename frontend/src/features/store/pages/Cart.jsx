import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";

import Button from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/States";
import { formatCurrency } from "../../../lib/format";
import { Container, Price, QuantityStepper } from "../components/Primitives";
import { useCart, useSession } from "../hooks/useStorefront";

/**
 * The bag.
 *
 * Totals shown here are indicative: delivery, coupons and tax are settled by
 * the server at checkout, so this screen deliberately says so rather than
 * showing a grand total it cannot guarantee.
 */
const Cart = () => {
  const navigate = useNavigate();
  const { items, subtotal, setQty, remove, clear } = useCart();
  const { isLoggedIn } = useSession();

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Browse the catalogue and add something you like."
          action={
            <Button as={Link} to="/shop" variant="primary" iconRight={ArrowRight}>
              Start shopping
            </Button>
          }
        />
      </Container>
    );
  }

  const checkout = () =>
    navigate(isLoggedIn ? "/checkout" : "/login", {
      state: isLoggedIn ? undefined : { from: "/checkout" },
    });

  return (
    <Container className="py-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="type-page-title text-content">Your bag</h1>
        <Button variant="ghost" size="sm" icon={Trash2} onClick={clear}>
          Clear bag
        </Button>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <ul className="divide-y divide-line-subtle overflow-hidden rounded-lg border border-line-subtle bg-surface">
          {items.map((item) => (
            <li key={`${item._id}-${item.variantSku || ""}`} className="flex gap-4 p-4">
              <Link
                to={`/product/${item._id}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-md bg-surface-sunken"
              >
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="type-caption uppercase tracking-wide text-content-muted">
                  {item.brand}
                </p>
                <h2 className="type-card-title truncate text-content">
                  <Link to={`/product/${item._id}`} className="hover:text-accent-text">
                    {item.name}
                  </Link>
                </h2>
                {item.variantSku && (
                  <p className="type-caption type-numeric text-content-muted">
                    Option {item.variantSku}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
                  <QuantityStepper
                    value={item.qty}
                    onChange={(qty) => setQty(item._id, qty)}
                    max={Math.max(1, Math.min(10, item.countInStock || 10))}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => remove(item._id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div className="text-right">
                <Price value={item.totalPrice * item.qty} />
                {item.qty > 1 && (
                  <p className="type-caption type-numeric mt-1 text-content-muted">
                    {formatCurrency(item.totalPrice)} each
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-line-subtle bg-surface p-5">
            <h2 className="type-section-title mb-4 text-content">Summary</h2>

            <dl className="space-y-2.5">
              <div className="flex justify-between type-body">
                <dt className="text-content-secondary">Subtotal</dt>
                <dd className="type-numeric text-content">{formatCurrency(subtotal)}</dd>
              </div>
              <div className="flex justify-between type-body">
                <dt className="text-content-secondary">Delivery</dt>
                <dd className="type-caption text-content-muted">Calculated at checkout</dd>
              </div>
              <div className="flex justify-between type-body">
                <dt className="text-content-secondary">Discounts</dt>
                <dd className="type-caption text-content-muted">Apply a coupon at checkout</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-line-subtle pt-4">
              <span className="type-body-strong text-content">Estimated total</span>
              <span className="type-numeric text-[1.25rem] font-semibold text-content">
                {formatCurrency(subtotal)}
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              iconRight={ArrowRight}
              onClick={checkout}
              className="mt-5"
            >
              Checkout
            </Button>

            <Button as={Link} to="/shop" variant="ghost" fullWidth className="mt-2">
              Continue shopping
            </Button>
          </div>
        </aside>
      </div>
    </Container>
  );
};

export default Cart;
