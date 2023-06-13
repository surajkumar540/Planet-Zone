import { createSlice } from "@reduxjs/toolkit";

const cartItems=localStorage.getItem('cart')?localStorage.getItem('cart'):[]

const cartSlice=createSlice({
    name:"cart",
    initialState:{
        data:cartItems,
        status:''
    },
    reducers:{
        addToCart:(state,action)=>{
            state.data.push(action.payload)
        },
        removeFromCart:(state,action)=>{
            state.data.pop()
        }
    }
})


export const {addToCart,removeFromCart}=cartSlice.actions;
export default cartSlice.reducer;