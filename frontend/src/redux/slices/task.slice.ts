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
export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("http://localhost:8000/api/tasks", { withCredentials: true });
    return response.data.data; // Adjust based on actual API response format
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to fetch tasks");
  }
});

// Async thunk for adding a task
export const addTask = createAsyncThunk("tasks/addTask", async (taskData: Task, { rejectWithValue }) => {
  try {
    const response = await axios.post("http://localhost:8000/api/tasks", taskData, { withCredentials: true });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to add task");
  }
});

// Async thunk for updating a task
export const editTask = createAsyncThunk("tasks/editTask", async (updatedTask: Task, { rejectWithValue }) => {
  try {
    const response = await axios.put(`http://localhost:8000/api/tasks/${updatedTask.id}`, updatedTask, {
      withCredentials: true,
    });
    return response.data.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to update task");
  }
});

// Async thunk for deleting a task
export const deleteTask = createAsyncThunk("tasks/deleteTask", async (taskId: string, { rejectWithValue }) => {
  try {
    await axios.delete(`http://localhost:8000/api/tasks/${taskId}`, { withCredentials: true });
    return taskId;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Failed to delete task");
