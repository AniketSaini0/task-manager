import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import taskReducer from "./slices/task.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
  },
});

// TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
