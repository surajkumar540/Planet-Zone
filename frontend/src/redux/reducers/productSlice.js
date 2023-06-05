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
        status:"idle",
        message:""
    },
    reducers:{
        setProducts:(state,action)=>{
            state.data=action.payload
        },
        setStatus:(state,action)=>{
            state.status=action.payload
        },
        setMessage:(state,action)=>{
            state.message=action.payload
        }
    }
})

export const {setProducts,setStatus,setMessage}=productSlice.actions;
export default productSlice.reducer;

export const fetchAllProducts=()=>{
    return async function fetchAllProductsThunk(dispatch,getState){
        try{
            dispatch(setStatus(STATUSES.LOADING))
            const response=await getAllProducts();
            dispatch(setProducts(response.data))
            dispatch(setStatus(STATUSES.IDLE))
            dispatch(setMessage("Data fetch successfully"))
        }catch(error)
        {
            dispatch(setStatus(STATUSES.ERROR))
            dispatch(setMessage("Something is wrong"))
            console.log(error)
        }
    }
}