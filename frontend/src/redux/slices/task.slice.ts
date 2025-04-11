import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Task } from "../../types";
import axios from "axios";

// Define task state type
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

// Async thunk for fetching tasks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("http://localhost:8001/api/tasks", {
        withCredentials: true,
      });
      // console.log("task response:", response);
      return response.data.data; // Adjust based on actual API response format
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch tasks"
        );
      }
    }
  }
);

// Async thunk for adding a task
export const addTask = createAsyncThunk(
  "tasks/addTask",
  async (taskData: Omit<Task, "_id">, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:8001/api/tasks/create-task",
        taskData,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to add task"
        );
      }
    }
  }
);

// Async thunk for updating a task
export const editTask = createAsyncThunk(
  "tasks/editTask",
  async (updatedTask: Partial<Task>, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `http://localhost:8001/api/tasks/${updatedTask._id}`,
        updatedTask,
        {
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to update task"
        );
      }
    }
  }
);

// Async thunk for deleting a task
export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `http://localhost:8001/api/tasks/${taskId}`,
        {
          withCredentials: true,
        }
      );

      console.log("This is response after delete ", response.data);
      return taskId;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to delete task"
        );
      }
    }
  }
);

// Async thunk for toggleTaskCompletion
export const toggleTaskCompletion = createAsyncThunk(
  "tasks/toggleTaskCompletion",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `http://localhost:8001/api/tasks/${taskId}/toggle`,
        {}, // Adjust API payload if needed
        { withCredentials: true }
      );
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.message || "Failed to toggle completion"
        );
      }
    }
  }
);

// Create the Redux slice
const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    resetTasks: (state) => {
      state.tasks = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        if (action.payload) {
          console.log("this is task payload ", action.payload);
        }
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      })
      // Add Task
      .addCase(addTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.tasks.push(action.payload);
      })
      // Edit Task
      .addCase(editTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.tasks = state.tasks.map((task) =>
          task._id === action.payload._id ? action.payload : task
        );
      })
      // Toggle Task Completion
      .addCase(
        toggleTaskCompletion.fulfilled,
        (state, action: PayloadAction<Task>) => {
          state.tasks = state.tasks.map((task) =>
            task._id === action.payload._id ? action.payload : task
          );
        }
      )
      // Delete Task
      .addCase(deleteTask.fulfilled, (state, action) => {
        const deletedTaskId = action.meta.arg; // Extract taskId from the thunk argument
        state.tasks = state.tasks.filter((task) => task._id !== deletedTaskId);
      });
  },
});

// Export actions and reducer
export const { resetTasks } = taskSlice.actions;
export default taskSlice.reducer;
