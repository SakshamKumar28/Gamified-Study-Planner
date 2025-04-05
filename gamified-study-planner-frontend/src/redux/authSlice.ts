import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "./store"; // Adjust path if needed

const API_URL = "http://localhost:5000/api/auth";

// ==== Types ====
export interface User {
  id: string;
  name: string;
  email: string;
  xp: number; // Added xp property
  avatarUrl?: string; // Optional avatar URL property
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface Credentials {
  email: string;
  password: string;
}

interface RegisterData extends Credentials {
  name: string;
}

// ==== Initial State ====
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,
};

// ==== Async Thunks ====

// Register user
export const registerUser = createAsyncThunk<AuthResponse, RegisterData, { rejectValue: string }>(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/register`, userData);
      localStorage.setItem("token", res.data.token);
      return res.data;
    } catch (error: any) {
      localStorage.removeItem("token");
      return thunkAPI.rejectWithValue(error.response?.data || "Registration failed");
    }
  }
);

// Login user
export const loginUser = createAsyncThunk<AuthResponse, Credentials, { rejectValue: string }>(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const res = await axios.post(`${API_URL}/login`, userData);
      localStorage.setItem("token", res.data.token);
      return res.data;
    } catch (error: any) {
      localStorage.removeItem("token");
      return thunkAPI.rejectWithValue(error.response?.data || "Login failed");
    }
  }
);

// Fetch user
export const fetchUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem("token");
    if (!token) return rejectWithValue("No token found. Please log in.");

    try {
      const res = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.msg || "Failed to fetch user");
    }
  }
);

//logout user
export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("token");
  return null; // No payload needed for logout
}
);

// ==== Slice ====
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutUser: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Registration error";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Login error";
      })

      // Fetch User
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload;
        state.token = localStorage.getItem("token") ?? null;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload ?? "Fetch error";
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Logout error";
      });
  },
});

// ==== Selectors ====
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;

export const { logoutUser } = authSlice.actions;

export default authSlice.reducer;
