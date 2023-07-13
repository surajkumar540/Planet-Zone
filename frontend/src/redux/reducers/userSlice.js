import { createSlice } from "@reduxjs/toolkit";
import { tokenVerify } from "../../api/devApi";
import STATUSES from "../constants/status";

const userSlice = createSlice({
  name: "user",
  initialState: {
    isLogged: false,
    status:STATUSES.IDLE,
    userObj:{}
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
    },
    setUserJustLoggedOut:(state)=>{
      state.isLogged=false;
      state.status=STATUSES.IDLE;
      localStorage.clear()
    },
    createAccount:(state,action)=>{
      state.userObj = action.payload;
    }
  },
});


export const { setLogged,setStatus,setUserJustLoggedIn,setUserJustLoggedOut,createAccount} = userSlice.actions;
export default userSlice.reducer;

export const tokenVerificationAsync = () => {
  return async function tokenVerificationThunk(dispatch) {    
    try {
        dispatch(setStatus(STATUSES.LOADING))
        const response = await tokenVerify();
        dispatch(setLogged(response.status))
        if (response.status) {       
            dispatch(setStatus(STATUSES.IDLE))
        }
        else{
          dispatch(setStatus(STATUSES.ERROR))
          localStorage.clear()
        }
          
    } catch (err) {
        dispatch(setLogged(false))
        dispatch(setStatus(STATUSES.ERROR))
        localStorage.clear();
    }
  };
};
