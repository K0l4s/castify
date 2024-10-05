import { configureStore } from '@reduxjs/toolkit'
import authReducer from "../redux/slice/authenticationSlide";
export default configureStore({
  reducer: {
    authen: authReducer,
  },
})