import { createSlice } from "@reduxjs/toolkit";
import { tokenVerify } from "../../api/userApi";
import STATUSES from "../constants/status";
import { clearSession, getToken } from "../../utils/functions";

const userSlice = createSlice({
  name: "user",
  initialState: {
    isUserLogged: false,
    isAdminLogged: false,
    status: STATUSES.IDLE,
    userObj: {},
  },
  reducers: {
    setUserLogged: (state) => {
      state.isUserLogged = true;
      state.isAdminLogged = false;
      state.status = STATUSES.SUCCESS;
    },
    setAdminLogged: (state) => {
      state.isUserLogged = true;
      state.isAdminLogged = true;
      state.status = STATUSES.SUCCESS;
    },
    setProfile: (state, action) => {
      state.userObj = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setLoggedOut: (state) => {
      state.isUserLogged = false;
      state.isAdminLogged = false;
      state.userObj = {};
      state.status = STATUSES.ERROR;
      // Only credentials are cleared; the cart is deliberately preserved.
      clearSession();
    },
    createAccount: (state, action) => {
      state.userObj = action.payload;
    },
  },
});

export const {
  setUserLogged,
  setStatus,
  setAdminLogged,
  setLoggedOut,
  setProfile,
  createAccount,
} = userSlice.actions;

export default userSlice.reducer;

/**
 * Restores the session from the stored token.
 *
 * Whether the caller is an administrator comes from the API response, not from
 * localStorage: the previous version sent a client-held flag and trusted it,
 * which meant the stored value decided which UI was rendered.
 */
export const tokenVerificationAsync = () => async (dispatch) => {
  try {
    if (!getToken()) {
      dispatch(setLoggedOut());
      return;
    }

    const response = await tokenVerify();
    if (!response?.status) {
      dispatch(setLoggedOut());
      return;
    }

    dispatch(setProfile(response.data || {}));
    dispatch(response.isAdmin ? setAdminLogged() : setUserLogged());
  } catch {
    dispatch(setLoggedOut());
  }
};
