import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { User } from "../../models/User";


export interface AuthenticatedUser {
  currentUser: User;
  isFetching: boolean;
  error: boolean;
  displayError: string;
}

const initialState: AuthenticatedUser = {
  currentUser: {} as User,
  isFetching: false,
  error: false,
  displayError: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isFetching = true;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isFetching = false;
      state.currentUser = action.payload;
      state.error = false;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isFetching = false;
      state.error = true;
      state.displayError = action.payload;
    },
    registerStart: (state) => {
      state.isFetching = true;
    },
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.isFetching = false;
      state.currentUser = action.payload;
      state.error = false;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isFetching = false;
      state.error = true;
      state.displayError = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
} = authSlice.actions;

export default authSlice.reducer;