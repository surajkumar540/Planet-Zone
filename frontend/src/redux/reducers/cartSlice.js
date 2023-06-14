import { createSlice } from "@reduxjs/toolkit";
import { fetchSingleProductApi } from "../../api/devApi";

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

export const addToCartAsync=(obj)=>{
    return async function addToCartThunk(dispatch,getState){
        console.log("cart async call");
        try{
            const {_id,qty}=obj;
            const response=await fetchSingleProductApi(_id);
            if(response.status)
            {
                const product=response.data;
                product.qty=qty;
                console.log(product)
                
            }
        }catch(err)
        {
            console.log(err)
        }
    }
}