import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "../reducers/cartSlice";
import userSlice from "../reducers/userSlice";

const store=configureStore({
    reducer:{
        cart:cartSlice,
        user:userSlice
    }
})

export default store