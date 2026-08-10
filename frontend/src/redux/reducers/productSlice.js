import { createSlice } from "@reduxjs/toolkit";
import { getAllProducts } from "../../api/productApi";
import STATUSES from "../constants/status";

/**
 * The storefront renders the whole catalogue on one page, so it asks for the
 * largest page the API allows rather than relying on the default page size.
 */
const STOREFRONT_PAGE_SIZE = 100;

const productSlice = createSlice({
  name: "products",
  initialState: {
    data: [],
    meta: null,
    status: STATUSES.IDLE,
    message: "",
  },
  reducers: {
    setProducts: (state, action) => {
      state.data = action.payload.items;
      state.meta = action.payload.meta || null;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
  },
});

export const { setProducts, setStatus, setMessage } = productSlice.actions;
export default productSlice.reducer;

export const fetchAllProducts =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch(setStatus(STATUSES.LOADING));

      const response = await getAllProducts({ limit: STOREFRONT_PAGE_SIZE, ...params });
      dispatch(setProducts({ items: response.data || [], meta: response.meta }));

      dispatch(setStatus(STATUSES.IDLE));
      dispatch(setMessage(""));
    } catch (error) {
      dispatch(setStatus(STATUSES.ERROR));
      dispatch(
        setMessage(error?.response?.data?.message || "We could not load products right now.")
      );
    }
  };
