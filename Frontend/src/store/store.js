import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import popupReducer from "./slices/popUpSlice";
import bookReducer from "./slices/bookSlice";
import userReducer from "./slices/userSlice";
import borrowReducer from './slices/borrowSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    popup: popupReducer,
    book: bookReducer,
    user: userReducer,
borrow: borrowReducer,  },
});
