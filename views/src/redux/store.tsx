// redux store
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import commentsReducer from './slice/commentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    comments: commentsReducer
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;