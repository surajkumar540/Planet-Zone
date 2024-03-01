import { createSlice } from "@reduxjs/toolkit";
import { tokenVerify } from "../../api/devApi";
import STATUSES from "../constants/status";
import { getAdmin, getToken } from "../../utils/functions";

const userSlice = createSlice({
  name: "user",
  initialState: {
    isUserLogged: false,
    isAdminLogged: false,
    status: STATUSES.IDLE,
    userObj: {}
  },
  reducers: {
    setUserLogged: (state) => {
      state.isUserLogged = true;
      state.status = STATUSES.SUCCESS;
    },
    setAdminLogged: (state) => {
      state.isAdminLogged = true;
      state.status = STATUSES.SUCCESS;
    },
    setStatus: (state, action) => {
      state.status = action.payload
    },
    setLoggedOut: (state) => {
      state.isUserLogged = false;
      state.isAdminLogged = false;
      state.status = STATUSES.ERROR;
      localStorage.clear()
    },
    createAccount: (state, action) => {
      state.userObj = action.payload;
    }
  },
});


export const { setUserLogged, setStatus, setAdminLogged, setLoggedOut, createAccount } = userSlice.actions;

export default userSlice.reducer;

export const tokenVerificationAsync = () => {
  return async function tokenVerificationThunk(dispatch) {
    try {
      const token = getToken()
      if (!token) {
        throw new Error("Token not found")
      }
      console.log("ye chala")

      const admin = getAdmin() || false;
      const response = await tokenVerify({ admin });

      if (response.status) {

        if (admin) {
          dispatch(setAdminLogged())
        } else {
          dispatch(setUserLogged())
        }

      }
      else {
        dispatch(setLoggedOut())
      }

    } catch (err) {
      dispatch(setLoggedOut())
    }
  };
};
