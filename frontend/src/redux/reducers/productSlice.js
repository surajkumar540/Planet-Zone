import { createSlice } from "@reduxjs/toolkit";
import { getAllProducts } from "../../api/devApi";

export const STATUSES=Object.freeze({
    LOADING:"loading",
    IDLE:"idle",
    ERROR:"error"
})

const productSlice=createSlice({
    name:"products",
    initialState:{
        data:[],
        status:"idle"
    },
    reducers:{
        setProducts:(state,action)=>{
            state.data=action.payload
        },
        setStatus:(state,action)=>{
            state.status=action.payload
        }
    }
})

export const {setProducts,setStatus}=productSlice.actions;
export default productSlice.reducer;

export const fetchAllProducts=()=>{
    return async function fetchAllProductsThunk(dispatch,getState){
        try{
            dispatch(setStatus(STATUSES.LOADING))
            const response=await getAllProducts();
            dispatch(setProducts(response.data))
            dispatch(setStatus(STATUSES.IDLE))
        }catch(error)
        {
            dispatch(setStatus(STATUSES.ERROR))
            console.log(error)
        }
    }
}