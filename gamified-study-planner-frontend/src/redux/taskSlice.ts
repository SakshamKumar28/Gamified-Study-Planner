import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "./store";

const API_URL = "http://localhost:5000/api/tasks";

// --------- Types ---------
export interface Task {
  _id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
  xp: number;
  priority?: "High" | "Medium" | "Low";
  tags?: string[];
  order?: number;
  createdAt?: string;
  updatedAt?: string;
  user?: string;
}

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
}

// --------- Initial State ---------
const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
};

// --------- Async Thunks ---------
export const fetchTasks = createAsyncThunk<Task[], void, { state: RootState }>(
  "tasks/fetchTasks",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return thunkAPI.rejectWithValue("No token available");

      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error: any) {
      console.error("Error fetching tasks:", error.response?.data || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
    }
  }
);

export const addTask = createAsyncThunk<Task, Partial<Task>, { state: RootState }>(
  "tasks/addTask",
  async (taskData, thunkAPI) => {
    try {
      console.log("Sending request to API:", taskData); // ✅ Debugging

      const token = localStorage.getItem("token");
      if (!token) return thunkAPI.rejectWithValue("No token available");

      const res = await axios.post(API_URL, taskData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return res.data;
    } catch (error: any) {
      console.error("Error in addTask:", error.response?.data || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to add task");
    }
  }
);

export const deleteTask = createAsyncThunk<string, string, { state: RootState }>(
  "tasks/deleteTask",
  async (id, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return thunkAPI.rejectWithValue("No token available");

      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return id;
    } catch (error: any) {
      console.error("Error deleting task:", error.response?.data || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete task");
    }
  }
);

export const completeTask = createAsyncThunk<Task, string, { rejectValue: string }>(
  "tasks/completeTask",
  async (taskId, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return thunkAPI.rejectWithValue("No token available");

      const res = await axios.patch(`${API_URL}/${taskId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return res.data; // ✅ Fixed: No need to destructure `task`
    } catch (error: any) {
      console.error("Error completing task:", error.response?.data || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to complete task");
    }
  }
);

export const reorderTasks = createAsyncThunk<Task[], Task[], { rejectValue: string }>(
  "tasks/reorderTasks",
  async (tasks, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return thunkAPI.rejectWithValue("No token available");

      const response = await axios.put(`${API_URL}/reorder`, { tasks }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error: any) {
      console.error("Error reordering tasks:", error.response?.data || error);
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to reorder tasks");
    }
  }
);

// --------- Slice ---------
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Add
      .addCase(addTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isLoading = false;
        state.tasks.push(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Delete
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter((task) => task._id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Complete
      .addCase(completeTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.isLoading = false;
        const index = state.tasks.findIndex((task) => task._id === action.payload?._id);
        if (index !== -1) {
          state.tasks[index] = { ...state.tasks[index], ...action.payload };
        }
      })
      .addCase(completeTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Reorder
      .addCase(reorderTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(reorderTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(reorderTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default taskSlice.reducer;

// --------- Selectors ---------
export const selectTasks = (state: RootState) => state.tasks.tasks;
export const selectTaskById = (state: RootState, taskId: string) =>
  state.tasks.tasks.find((task) => task._id === taskId);
export const selectTaskLoading = (state: RootState) => state.tasks.isLoading;
export const selectTaskError = (state: RootState) => state.tasks.error;
