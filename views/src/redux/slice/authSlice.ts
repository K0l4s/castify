import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../models/User';


interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state) => {
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null; // Clear user info on logout
    },
    checkAuthStatus(state, action) {
      state.isAuthenticated = action.payload;
    },
    setAuthLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setUser(state, action) {
      console.log(action.payload);
      state.user = { ...state.user, ...action.payload };
    },
    updateAvatar(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.avatarUrl = action.payload;
      }
    },
    updateCover(state, action: PayloadAction<string>) {
      if (state.user) {
        state.user.coverUrl = action.payload;
      }
    },
    
  },
});

export const { login, logout, checkAuthStatus, setAuthLoading, setUser,updateAvatar, updateCover } = authSlice.actions;
export default authSlice.reducer;