import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "../reducers/cartSlice";
import productSlice from "../reducers/productSlice";

const store=configureStore({
    reducer:{
        cart:cartSlice,
        products:productSlice
    }
})

export default store