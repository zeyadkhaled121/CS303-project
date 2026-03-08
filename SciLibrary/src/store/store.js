import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import bookReducer from "./books"; 
import userReducer from "./slices/userSlice"; 

const store = configureStore({
    reducer: {
        auth: authReducer,
        book: bookReducer,
        user: userReducer, 
    },
});

export default store;
