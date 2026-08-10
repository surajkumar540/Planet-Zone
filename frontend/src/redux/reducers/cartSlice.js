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

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    data: loadCart(),
    status: STATUSES.IDLE,
  },
  reducers: {
    addToCart: (state, action) => {
      const line = action.payload;
      const index = state.data.findIndex((item) => item._id === line._id);

      if (index === -1) {
        state.data.push(line);
      } else {
        state.data[index] = line;
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
    removeFromCart: (state, action) => {
      state.data = state.data.filter((item) => item._id !== action.payload);
      persist(state.data);
    },

    updateQuantity: (state, action) => {
      const { _id, qty } = action.payload;
      const line = state.data.find((item) => item._id === _id);
      if (line && qty > 0) {
        line.qty = qty;
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
