import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createTask,
  getAllTasks,
  getTaskByID,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
} from "../controllers/task.controller";

const Router = express.Router();

// Tasks API
Router.route("/create-task").post(authMiddleware, createTask);
Router.route("/").get(authMiddleware, getAllTasks);
Router.route("/:taskId").get(authMiddleware, getTaskByID);
Router.route("/:taskId/toggle").patch(authMiddleware, toggleTaskCompletion);
Router.route("/:taskId").patch(authMiddleware, updateTask);
Router.route("/:taskId").delete(authMiddleware, deleteTask);

export default Router;
