import { createSlice } from "@reduxjs/toolkit";
import { fetchSingleProductApi } from "../../api/productApi";
import STATUSES from "../constants/status";

const CART_KEY = "cart";

const loadCart = () => {
  try {
    const stored = localStorage.getItem(CART_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupt storage should not prevent the app from starting.
    return [];
  }
};

const persist = (items) => localStorage.setItem(CART_KEY, JSON.stringify(items));

/**
 * A line is one sellable unit: the product, plus the variant when there is
 * one. Two sizes of the same shirt are two lines, not one overwriting the other.
 */
export const lineKey = (item) => `${item._id}::${item.variantSku || ""}`;

/** Most a line may hold: the stock it was added with, when that is known. */
const stockCap = (line) =>
  Number.isFinite(line.countInStock) && line.countInStock > 0 ? line.countInStock : Infinity;

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    data: loadCart(),
    status: STATUSES.IDLE,
  },
  reducers: {
    /**
     * Adds `qty` of a unit to the bag.
     *
     * Adding something already in the bag increases its quantity — it used to
     * replace the line, so adding 1 more of an item you had 3 of left you with 1.
     * The total never exceeds the stock the line was added with.
     */
    addToCart: (state, action) => {
      const line = action.payload;
      const key = lineKey(line);
      const index = state.data.findIndex((item) => lineKey(item) === key);

      if (index === -1) {
        state.data.push({ ...line, qty: Math.min(line.qty, stockCap(line)) });
      } else {
        const existing = state.data[index];
        // Fresh catalogue fields (price, stock) win; the quantity accumulates.
        state.data[index] = {
          ...existing,
          ...line,
          qty: Math.min(existing.qty + line.qty, stockCap(line)),
        };
      }
      persist(state.data);
    },

    /**
     * Removes a single line by product id.
     *
     * The previous implementation walked the array with `forEach` and kept the
     * last index it saw, so it always removed the final item regardless of
     * which one was requested.
     */
    /** Removes one line; the payload is its `lineKey`. */
    removeFromCart: (state, action) => {
      state.data = state.data.filter((item) => lineKey(item) !== action.payload);
      persist(state.data);
    },

    /** Sets a line's quantity; `key` is its `lineKey`. */
    updateQuantity: (state, action) => {
      const { key, qty } = action.payload;
      const line = state.data.find((item) => lineKey(item) === key);
      if (line && qty > 0) {
        line.qty = Math.min(qty, stockCap(line));
        persist(state.data);
      }
    },

    clearCart: (state) => {
      state.data = [];
      persist(state.data);
    },

    setStatus: (state, action) => {
      state.status = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, setStatus, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;

/**
 * Adds a product to the cart using freshly fetched catalogue data.
 *
 * Prices held here are for display only; the server re-prices the whole cart
 * at checkout, so a stale local copy cannot affect what is charged.
 */
export const addToCartAsync = (getObj) => async (dispatch) => {
  try {
    dispatch(setStatus(STATUSES.LOADING));

    const response = await fetchSingleProductApi(getObj.id);
    if (!response?.status) throw new Error("Product unavailable");

    const product = response.data;
    dispatch(
      addToCart({
        _id: product._id,
        brand: product.brand,
        category: product.category,
        countInStock: product.countInStock,
        image: product.image,
        name: product.name,
        rating: product.rating,
        price: product.price,
        qty: getObj.qty || 1,
        gst: product.gst,
        discount: product.discount,
        totalPrice: product.totalPrice,
      })
    );
    dispatch(setStatus(STATUSES.IDLE));
  } catch {
    dispatch(setStatus(STATUSES.ERROR));
  }
};
