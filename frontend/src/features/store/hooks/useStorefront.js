import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addToCart,
  clearCart,
  removeFromCart,
  updateQuantity,
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

  /** Flattens a product (and optional variant) into the shape the cart stores. */
  const add = useCallback(
    (product, qty = 1, variant = null) => {
      const source = variant || product;
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
          qty,
        })
      );
    },
    [dispatch]
  );

  const setQty = useCallback((id, qty) => dispatch(updateQuantity({ _id: id, qty })), [dispatch]);
  const remove = useCallback((id) => dispatch(removeFromCart(id)), [dispatch]);
  const clear = useCallback(() => dispatch(clearCart()), [dispatch]);

  const findLine = useCallback((id) => items.find((item) => item._id === id), [items]);

  return { items, count, subtotal, add, setQty, remove, clear, findLine };
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
