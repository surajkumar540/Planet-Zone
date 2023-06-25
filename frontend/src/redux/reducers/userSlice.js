import { createSlice } from "@reduxjs/toolkit";
import { tokenVerify } from "../../api/devApi";
import STATUSES from "../constants/status";

const userSlice = createSlice({
  name: "user",
  initialState: {
    isLogged: false,
    status:STATUSES.IDLE
  },
  reducers: {
    setLogged:(state,action)=>{
        state.isLogged=action.payload
    },
    setStatus:(state,action)=>{
        state.status=action.payload
    },
    setUserJustLoggedIn:(state)=>{
        state.isLogged=true;
        state.status=STATUSES.IDLE;
    }
  },
});

export const { setLogged,setStatus,setUserJustLoggedIn} = userSlice.actions;
export default userSlice.reducer;

export const tokenVerificationAsync = () => {
  return async function tokenVerificationThunk(dispatch) {    
    try {
        dispatch(setStatus(STATUSES.LOADING))
        const response = await tokenVerify();
        dispatch(setLogged(response.status))
        if (response.status) {       
            dispatch(setStatus(STATUSES.IDLE))
        }else{
            dispatch(setStatus(STATUSES.ERROR))
        }

    } catch (err) {
        dispatch(setStatus(STATUSES.ERROR))
    }
  };
};
