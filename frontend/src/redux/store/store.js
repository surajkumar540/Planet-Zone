import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "../reducers/cartSlice";
import productSlice from "../reducers/productSlice";
import userSlice from "../reducers/userSlice";

const store=configureStore({
    reducer:{
        cart:cartSlice,
        products:productSlice,
        user:userSlice
    }
})

export default store