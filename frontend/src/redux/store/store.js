import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "../reducers/cartSlice";
import productSlice from "../reducers/productSlice";
import userSlice from "../reducers/userSlice";
import orderSlice from "../reducers/orderSlice";

const store=configureStore({
    reducer:{
        cart:cartSlice,
        products:productSlice,
        user:userSlice,
        order:orderSlice
    }
})

export default store