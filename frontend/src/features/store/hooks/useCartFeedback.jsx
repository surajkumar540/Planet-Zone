import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";

import Button from "../../../components/ui/Button";
import { formatCurrency } from "../../../lib/format";
import { useCart } from "./useStorefront";

/**
 * "Added to bag" feedback, shared by every add-to-cart button.
 *
 * Two things happen on add:
 * 1. a copy of the product image arcs from where the customer clicked into the
 *    bag icon in the header, which then pops — the eye follows the item to
 *    where it went, so nobody wonders whether the click worked;
 * 2. a small panel drops in under the header with the item, the bag total and
 *    the two obvious next steps, then leaves on its own after a few seconds.
 */

const CartFeedbackContext = createContext(() => {});

const PANEL_MS = 4500;

/** Animates an image copy from `sourceEl` to the header bag, then bumps the badge. */
const flyToCart = (sourceEl, src) => {
  const target = document.querySelector("[data-cart-target]");
  const bump = () => window.dispatchEvent(new CustomEvent("cart:bump"));
  if (!target || !sourceEl) return bump();

  const from = sourceEl.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const size = Math.max(48, Math.min(from.width, from.height, 140));

  const ghost = document.createElement("img");
  ghost.src = src;
  ghost.alt = "";
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: `${from.left + from.width / 2 - size / 2}px`,
    top: `${from.top + from.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    objectFit: "cover",
    borderRadius: "18px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
    zIndex: "200",
    pointerEvents: "none",
    background: "var(--surface-sunken)",
  });
  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);

  const flight = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
      // The midpoint sits above the straight line, so the path arcs like a toss.
      {
        transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(0.55) rotate(-8deg)`,
        opacity: 1,
        offset: 0.55,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.1) rotate(0deg)`, opacity: 0.5 },
    ],
    { duration: 780, easing: "cubic-bezier(0.45, 0, 0.55, 1)" }
  );
  flight.onfinish = () => {
    ghost.remove();
    bump();
  };
  return undefined;
};

export const CartFeedbackProvider = ({ children }) => {
  const reduceMotion = useReducedMotion();
  const [added, setAdded] = useState(null);
  const timer = useRef(null);

  const notify = useCallback(
    ({ product, qty = 1, inBag = qty, variant = null, sourceEl = null }) => {
      const image = variant?.image || product.image;
      if (reduceMotion) window.dispatchEvent(new CustomEvent("cart:bump"));
      else flyToCart(sourceEl, image);

      setAdded({ key: Date.now(), product, qty, inBag, variant, image });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setAdded(null), PANEL_MS);
    },
    [reduceMotion]
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <CartFeedbackContext.Provider value={notify}>
      {children}
      <AddedPanel
        added={added}
        onClose={() => setAdded(null)}
        onHold={() => window.clearTimeout(timer.current)}
        onRelease={() => {
          timer.current = window.setTimeout(() => setAdded(null), 2000);
        }}
      />
    </CartFeedbackContext.Provider>
  );
};

const AddedPanel = ({ added, onClose, onHold, onRelease }) => {
  const { count, subtotal } = useCart();

  return (
    <AnimatePresence>
      {added && (
        <motion.aside
          key={added.key}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: -14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15 } }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          onMouseEnter={onHold}
          onMouseLeave={onRelease}
          className="fixed inset-x-3 top-[4.25rem] z-[60] rounded-xl border border-line bg-surface-overlay p-4 shadow-xl sm:inset-x-auto sm:right-6 sm:w-[22rem]"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 type-body-strong text-content">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.1 }}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-status-good text-white"
              >
                <Check size={12} strokeWidth={3} />
              </motion.span>
              Added to your bag
            </p>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-content-muted hover:bg-surface-hover hover:text-content"
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={added.image}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg border border-line-subtle object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate type-body-strong text-content">{added.product.name}</p>
              {added.variant && (
                <p className="truncate type-caption text-content-muted">
                  {Object.values(added.variant.options || {}).join(" · ") || added.variant.sku}
                </p>
              )}
              <p className="type-caption type-numeric text-content-secondary">
                {added.inBag > added.qty ? `+${added.qty} · ${added.inBag} in bag` : `${added.qty} ×`}{" "}
                {formatCurrency((added.variant || added.product).totalPrice)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-line-subtle pt-3 type-caption text-content-secondary">
            <span>
              Bag: {count} item{count === 1 ? "" : "s"}
            </span>
            <span className="type-numeric font-semibold text-content">{formatCurrency(subtotal)}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button as={Link} to="/cart" onClick={onClose} fullWidth>
              View bag
            </Button>
            <Button as={Link} to="/checkout" variant="primary" onClick={onClose} fullWidth>
              Checkout
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

/**
 * `notify({ product, qty, variant, sourceEl })` after adding to the cart.
 * `sourceEl` is the element the flying image starts from, usually the product image.
 */
export const useCartFeedback = () => useContext(CartFeedbackContext);

export default useCartFeedback;
