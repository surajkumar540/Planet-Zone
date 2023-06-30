import { createSlice } from "@reduxjs/toolkit";

const orderSlice=createSlice({
    name:"order",
    initialState:{
        shipping:{},
        payment:{}
    },
    reducers:{
        shippingAddress:(state,action)=>{
            const obj = action.payload;
            state.shipping = obj
        },
        paymentMethod:(state,action)=>{
            const obj = action.payload;
            state.payment = obj
        }
    }
})

export const {shippingAddress, paymentMethod}=orderSlice.actions;
export default orderSlice.reducer;
