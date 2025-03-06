import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  createTask,
  getAllTasks,
  getTaskByID,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";

const Router = express.Router();

// Tasks API
Router.route("/create-task").post(authMiddleware, createTask);
Router.route("/").get(authMiddleware, getAllTasks);
Router.route("/:taskId(\\d+)").get(authMiddleware, getTaskByID);
Router.route("/:taskId(\\d+)").patch(authMiddleware, updateTask);
Router.route("/:taskId(\\d+)").delete(authMiddleware, deleteTask);

export default Router;
