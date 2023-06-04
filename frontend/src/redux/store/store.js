import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "../reducers/cartSlice";
import productSlice from "../reducers/productSlice";

const store=configureStore({
    reducer:{
        cart:cartSlice,
        produts:productSlice
    }
})

export default store