import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { checkAuth } from "../../services/auth.service";

// Define the state structure
interface AuthState {
  isAuthenticated: boolean;
  loggedUserEmail: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loggedUserEmail: null,
  loading: false,
};

// Async thunk to handle authentication check
export const fetchAuthStatus = createAsyncThunk(
  "auth/fetchAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const user = await checkAuth(); // This calls your auth.service
      if (user) return user;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      } else return rejectWithValue("An unknown error occurred");
    }
  }
);

// Authentication slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<string>) => {
      state.isAuthenticated = true;
      state.loggedUserEmail = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.loggedUserEmail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAuthStatus.fulfilled, (state, action) => {
        if (action.payload) {
          state.isAuthenticated = true;
          state.loggedUserEmail = action.payload.email;
        } else {
          state.isAuthenticated = false; // Ensure it resets properly
          state.loggedUserEmail = null;
        }
        state.loading = false;
      })
      .addCase(fetchAuthStatus.rejected, (state) => {
        state.isAuthenticated = false;
        state.loggedUserEmail = null;
        state.loading = false;
      });
  },
});

// Export actions & reducer
export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
