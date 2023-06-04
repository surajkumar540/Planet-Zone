import { createSlice } from "@reduxjs/toolkit";

const productSlice=createSlice({
    name:"products",
    initialState:{
        value:0
    },
    reducers:{
        add:(state)=>{
            state.value+=1
        }
    }
})

export const {add}=productSlice.actions;
export default productSlice.reducer;