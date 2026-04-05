import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import bookReducer from "./books"; 
import userReducer from "./slices/userSlice";
import borrowReducer from "./slices/borrowSlice";
import popupReducer from "./slices/popupSlice";
import notificationReducer from "./slices/notificationSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        book: bookReducer,
        user: userReducer,
        borrow: borrowReducer,
        popup: popupReducer,
        notifications: notificationReducer,
    },
});

export default store;
