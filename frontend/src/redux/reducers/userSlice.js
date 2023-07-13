import { createSlice } from "@reduxjs/toolkit";
import { tokenVerify } from "../../api/devApi";
import STATUSES from "../constants/status";
import { getAdmin } from "../../utils/functions";

const userSlice = createSlice({
  name: "user",
  initialState: {
    isUserLogged: false,
    isAdminLogged:false,
    status:STATUSES.IDLE,
    userObj:{}
  },
  reducers: {
    setUserLogged:(state)=>{
        state.isUserLogged=true
    },
    setAdminLogged:(state)=>{
        state.isAdminLogged=true
    },
    setStatus:(state,action)=>{
        state.status=action.payload
    },
    setUserJustLoggedIn:(state)=>{
        state.isUserLogged=true;
        state.status=STATUSES.IDLE;
    },
    setLoggedOut:(state)=>{
      state.isUserLogged=false;
      state.isAdminLogged=false;
      state.status=STATUSES.IDLE;
      localStorage.clear()
    },
    createAccount:(state,action)=>{
      state.userObj = action.payload;
    }
  },
});


export const { setUserLogged,setStatus,setAdminLogged,setUserJustLoggedIn,setLoggedOut,createAccount} = userSlice.actions;
export default userSlice.reducer;

export const tokenVerificationAsync = () => {
  return async function tokenVerificationThunk(dispatch) {    
    try {
        dispatch(setStatus(STATUSES.LOADING))
        
        const admin=getAdmin()||false;
        const response = await tokenVerify({admin});

        if (response.status) {       
          if(admin)
          {
            dispatch(setAdminLogged())
          }else{
            dispatch(setUserLogged())
          }
            dispatch(setStatus(STATUSES.IDLE))
        }
        else{
          dispatch(setLoggedOut())
        }
          
    } catch (err) {
      dispatch(setLoggedOut())
    }
  };
};
