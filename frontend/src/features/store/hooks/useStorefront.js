import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addToCart,
  clearCart,
  removeFromCart,
  updateQuantity,
  lineKey,
} from "../../../redux/reducers/cartSlice";

/**
 * Cart access for the storefront.
 *
 * The slice already owns persistence; this hook adds the derived figures every
 * screen needs (line count, indicative subtotal) so no component recomputes
 * them, and normalises a product document into a cart line in one place.
 *
 * The totals here are indicative only — checkout prices the cart server-side
 * via `/api/orders/quote`, which is what the customer is actually charged.
 */
export const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.data);

  const { count, subtotal } = useMemo(
    () =>
      items.reduce(
        (totals, item) => ({
          count: totals.count + (item.qty || 0),
          subtotal: totals.subtotal + (Number(item.totalPrice) || 0) * (item.qty || 0),
        }),
        { count: 0, subtotal: 0 }
      ),
    [items]
  );

  /**
   * Adds a product (and optional variant) to the bag.
   *
   * Returns `{ added, inBag, stock }`: how many were actually added after the
   * stock cap, and the line's new quantity, so the caller can say "you already
   * have all 3" instead of pretending the click worked.
   */
  const add = useCallback(
    (product, qty = 1, variant = null) => {
      const source = variant || product;
      const key = lineKey({ _id: product._id, variantSku: variant?.sku });
      const current = items.find((item) => lineKey(item) === key)?.qty || 0;
      const stock = Number(source.countInStock);
      const room = stock > 0 ? Math.max(0, stock - current) : qty;
      const added = Math.min(qty, room);
      if (added <= 0) return { added: 0, inBag: current, stock };

      dispatch(
        addToCart({
          _id: product._id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          image: variant?.image || product.image,
          rating: product.rating,
          price: source.price,
          discount: source.discount,
          gst: source.gst,
          totalPrice: source.totalPrice,
          countInStock: source.countInStock,
          variantSku: variant?.sku,
          variantId: variant?._id,
          qty: added,
        })
      );
      return { added, inBag: current + added, stock };
    },
    [dispatch, items]
  );

  /** `key` is the line's `lineKey` (product id plus variant SKU). */
  const setQty = useCallback((key, qty) => dispatch(updateQuantity({ key, qty })), [dispatch]);
  const remove = useCallback((key) => dispatch(removeFromCart(key)), [dispatch]);
  const clear = useCallback(() => dispatch(clearCart()), [dispatch]);

  const findLine = useCallback((key) => items.find((item) => lineKey(item) === key), [items]);

  return { items, count, subtotal, add, setQty, remove, clear, findLine, lineKey };
};

/** Session state, in the one shape the storefront cares about. */
export const useSession = () => {
  const { isUserLogged, isAdminLogged, userObj, status } = useSelector((state) => state.user);
  return { isLoggedIn: isUserLogged, isAdmin: isAdminLogged, user: userObj, status };
};

/**
 * The payload `/api/createOrder` and `/api/orders/quote` accept.
 *
 * Only identity and quantity are sent: the server looks prices up itself, so
 * anything else in a cart line would be ignored.
 */
export const toOrderCart = (items) =>
  items.map((item) => ({
    _id: item._id,
    qty: item.qty,
    ...(item.variantSku ? { variantSku: item.variantSku } : {}),
    ...(item.variantId ? { variantId: item.variantId } : {}),
  }));
