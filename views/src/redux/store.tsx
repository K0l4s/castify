import { configureStore } from '@reduxjs/toolkit'
import { authenticationSlice } from './reducer/authenticationSlide'

export default configureStore({
  reducer: {
    authen: authenticationSlice.reducer,
  },
})