import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import Task from "../models/task.model";
import User from "../models/user.model";

// ****************************Create Task****************************

export const createTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { title, description, dueDate, status, isCompleted } = req.body;

    // Validate input fields
    if ([title, description, dueDate, status].some((field) => !field?.trim())) {
      throw new ApiError(400, "All fields are mandatory");
    }

    const currentUser = req.user;

    if (!currentUser?.id) {
      throw new ApiError(401, "User ID for task creation not found");
    }

    try {
      // Check if user exists in DB
      const user = await User.findById(currentUser.id);
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Create task
      const newTask = new Task({
        title,
        description,
        dueDate,
        status,
        isCompleted: isCompleted ?? false,
        user: currentUser.id,
      });

      // Save task to MongoDB
      await newTask.save();

      res
        .status(201)
        .json(new ApiResponse(201, newTask, "Task created successfully"));
    } catch (error: any) {
      throw new ApiError(500, error.message || "Task creation failed");
    }
  }
);

// *****************************Get All Tasks**************************

export const getAllTasks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const currentUserId = req.user?.id;
    console.log("current user id fetched");
    try {
      // Fetch tasks assigned to the logged-in user
      const allTasks = await Task.find({ user: currentUserId });
      console.log(typeof allTasks);

      console.log("All tasks: ", allTasks);

      if (allTasks.length === 0) {
        res
          .status(202)
          .json(
            new ApiResponse(
              202,
              allTasks,
              "No tasks found for this user, create your first task"
            )
          );
        return;
      }

      res
        .status(200)
        .json(new ApiResponse(200, allTasks, "Tasks fetched successfully"));
    } catch (error: any) {
      throw new ApiError(
        500,
        error.message || "Something went wrong while fetching tasks"
      );
    }
  }
);

// **************************** Get Task By ID (Mongoose) *****************************

export const getTaskByID = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    const currentUserId = req.user?.id;
    console.log("Current user:", currentUserId);

    try {
      const taskFound = await Task.findOne({
        _id: taskId,
        user: currentUserId,
      });

      if (!taskFound) {
        throw new ApiError(404, "Task not found");
      }

      res
        .status(200)
        .json(new ApiResponse(200, taskFound, "Task found successfully"));
    } catch (error: any) {
      throw new ApiError(500, error.message || "Error retrieving task");
    }
  }
);

// ****************************Update Task (Mongoose)*****************************
export const updateTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const taskId = req.params.taskId;
    // const updates = req.body;
    const { title, description, dueDate, status, isCompleted } = req.body;

    // console.log("Received fields, ", updates);

    if (!taskId) {
      throw new ApiError(400, "Task ID is required");
    }

    const currentUserId = req.user?.id;

    try {
      // Find the task to check ownership before updating
      const existingTask = await Task.findOne({
        _id: taskId,
        user: currentUserId,
      });

      if (!existingTask) {
        throw new ApiError(
          404,
          "Task not found or you do not have permission to update it"
        );
      }

      // **** { Method 1 of filtering out the non-undefined values for updating : takes time 400 ms}
      // // Filter out undefined fields before updating
      // const filteredUpdates = Object.fromEntries(
      //   Object.entries(updates).filter(([_, value]) => value !== undefined)
      // );

      // if (Object.keys(filteredUpdates).length === 0) {
      //   throw new ApiError(400, "No valid fields provided for update");
      // }

      // // Update only the provided fields
      // const updatedTask = await Task.findByIdAndUpdate(
      //   taskId,
      //   filteredUpdates,
      //   { new: true }
      // );

      // ***{Method 2 of filtering out the non-undefined values take time : 300ms}
      // Create an object with only defined values
      const fieldsToUpdate: Record<string, any> = {};

      if (title !== undefined) fieldsToUpdate.title = title;
      if (description !== undefined) fieldsToUpdate.description = description;
      if (dueDate !== undefined) fieldsToUpdate.dueDate = dueDate;
      if (status !== undefined) fieldsToUpdate.status = status;
      if (isCompleted !== undefined) fieldsToUpdate.isCompleted = isCompleted;

      if (Object.keys(fieldsToUpdate).length === 0) {
        throw new ApiError(400, "No valid fields provided for update");
      }

      // Perform the update with the filtered object
      const updatedTask = await Task.findByIdAndUpdate(taskId, fieldsToUpdate, {
        new: true,
      });

      if (!updatedTask) {
        throw new ApiError(400, "Task update failed");
      }

      // console.log("Updated Task:", updatedTask);

      res
        .status(200)
        .json(new ApiResponse(200, updatedTask, "Task updated successfully!"));
    } catch (error: any) {
      throw new ApiError(500, error.message || "Error updating task");
    }
  }
);

// ****************************Toggle Task Status (Mongoose)*****************************
export const toggleTaskCompletion = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const taskId = req.params.taskId;

    if (!taskId) {
      throw new ApiError(400, "Task ID is required");
    }

    const currentUserId = req.user?.id;

    try {
      // Find the task
      const task = await Task.findOne({ _id: taskId, user: currentUserId });

      if (!task) {
        throw new ApiError(
          404,
          "Task not found or you do not have permission to update it"
        );
      }

      // Toggle `isCompleted` field
      task.isCompleted = !task.isCompleted;

      await task.save(); // Save the updated task

      res.status(200).json(new ApiResponse(200, task, "Task status updated!"));
    } catch (error: any) {
      throw new ApiError(500, error.message || "Error toggling task status");
    }
  }
);

// ****************************Delete Task (Mongoose)*****************************
export const deleteTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    console.log("Task ID:", taskId);

    try {
      const taskDeleted = await Task.findByIdAndDelete(taskId);

      if (!taskDeleted) {
        throw new ApiError(404, "Task not found or already deleted");
      }

      res
        .status(200)
        .json(new ApiResponse(200, {}, "Task deleted successfully!"));
    } catch (error: any) {
      throw new ApiError(500, error.message || "Error deleting task");
    }
  }
);

// ****************************Change Task Status (Mongoose)*****************************
export const changeTaskStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { taskId, status } = req.body;
    const currentUserId = req.user?.id;

    try {
      // Find the task first
      const task = await Task.findOne({ _id: taskId, user: currentUserId });

      if (!task) {
        throw new ApiError(
          404,
          "Task not found or you do not have permission to update it"
        );
      }

      // Update the task's status
      const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { status },
        { new: true, select: "id user status" } // Select only necessary fields
      );

      if (!updatedTask) {
        throw new ApiError(500, "Failed to update task status");
      }

      res
        .status(200)
        .json(
          new ApiResponse(200, updatedTask, "Task status updated successfully!")
        );
    } catch (error: any) {
      throw new ApiError(500, error.message || "Error updating task status");
    }
  }
);
