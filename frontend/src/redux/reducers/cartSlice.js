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
            //Check if id is present in cart already

            // const {id,qty}=action.payload;
            state.data.push(action.payload)
            localStorage.setItem("cart",JSON.stringify(state.data))
          
        },
        removeFromCart:(state,action)=>{
            state.data.pop()
        }
    }
})


export const {addToCart,removeFromCart}=cartSlice.actions;
export default cartSlice.reducer;