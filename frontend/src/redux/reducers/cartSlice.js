import { createSlice } from "@reduxjs/toolkit";
import { fetchSingleProductApi } from "../../api/devApi";
import STATUSES from "../constants/status";

const cartItems = localStorage.getItem("cart")
  ? JSON.parse(localStorage.getItem("cart"))
  : [];

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    data: cartItems,
    status: STATUSES.IDLE,
  },
  reducers: {
    addToCart: (state, action) => {
      //Check if id is present in cart already
      const cart=action.payload;
      let existIndex;

      const existAlready=state.data.find((item,index)=>{
        existIndex=index;
        return item._id===cart._id;
      })
      if(existAlready)
      {
        //Agar exist karta hai to uss position ko mutate karke new value rakh denge
        state.data[existIndex]=cart
      }else{
        //Nahi exist karta to new item ki tarah last me push kar denge
        state.data.push(cart)
      }
      localStorage.setItem("cart", JSON.stringify(state.data));
    },
    
    removeFromCart: (state, action) => {
      const objId=action.payload;
      
      //Find index of parameter object id in redux state
      let index;
      state.data.forEach((item,idx) =>{
        index=idx;
        return item.id === objId;
      });

      //if index is not -1 then move to that index and remove 1 item from state
      if (index !== -1) {
        state.data.splice(index, 1);
      }
      localStorage.setItem("cart", JSON.stringify(state.data));
    },
    setStatus:(state,action)=>{
        state.status=action.payload
    }
  },
});

export const { addToCart, removeFromCart,setStatus } = cartSlice.actions;
export default cartSlice.reducer;

export const addToCartAsync = (getObj) => {
  return async function addToCartThunk(dispatch, getState) {    
    try {
        dispatch(setStatus(STATUSES.LOADING))
        const response = await fetchSingleProductApi(getObj.id);
        if (response.status) {
                const product = response.data;
                const newObj = {
                _id:product._id,
                brand: product.brand,
                category: product.brand,
                countInStock: product.countInStock,
                image: product.image,
                name: product.name,
                rating:product.rating,
                price: product.price,
                qty: getObj.qty,
                };
        
                dispatch(addToCart(newObj))
                dispatch(setStatus(STATUSES.IDLE))
            }

    } catch (err) {
        dispatch(setStatus(STATUSES.ERROR))
    }
  };
};
