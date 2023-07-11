import { createSlice } from "@reduxjs/toolkit";

const orderSlice=createSlice({
    name:"order",
    initialState:{
        shipping:{},
        payment:{},
        price:""
    },
    reducers:{
        shippingAddress:(state,action)=>{
            const obj = action.payload;
            state.shipping = obj
        },
        paymentMethod:(state,action)=>{
            const obj = action.payload;
            state.payment = obj
        },
        setPrice:(state,action)=>{
            state.price=action.payload;
        }
    }
})

export const {shippingAddress, paymentMethod, setPrice}=orderSlice.actions;
export default orderSlice.reducer;
