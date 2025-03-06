import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Task, User } from "@prisma/client";

const prisma = new PrismaClient();

//   title       String
//   description String?
//   dueDate     String
//   status      Status @default(PROGRESS)
//   user_id     Int
//   user        User   @relation(fields: [user_id], references: [id])

// ****************************Create Task****************************

export const createTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { title, description, dueDate, status, isCompleted } = req.body;
    if (
      [title, description, dueDate, status].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(401, "all fields are mandatory");
    }

    // const currentUser = await prisma.user.findUnique({where: {id: user_id}})
    const currentUser = req.user;
    console.log("current User ", currentUser);
    if (!currentUser?.id) {
      throw new ApiError(401, "user_id for task creation not found");
    }
    const user_id = currentUser.id;
    console.log(user_id);

    try {
      const createdTask = await prisma.task.create({
        data: {
          title,
          description,
          dueDate,
          status,
          isCompleted,
          user_id,
        },
        include: {
          user: true, // This will return the full User object
        },
      });

      console.log("after task creation");

      const task = await prisma.task.findUnique({
        where: { id: createdTask.id },
      });
      if (!task) {
        throw new ApiError(501, "Task was not created");
      }

      res.status(201).json(new ApiResponse(201, task, "task created"));
    } catch (error: any) {
      throw new ApiError(502, error);
    }
  }
);

// *****************************Get All Tasks**************************
export const getAllTasks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const currentUserId = req.user?.id;

    try {
      const allTasks = await prisma.task.findMany({
        where: { user_id: currentUserId },
      });

      console.log("all tasks: ", allTasks);

      //   if (!allTasks) {
      //     throw new ApiError(501, "Error getting tasks");
      //   }

      if (allTasks.length === 0) {
        res
          .status(202)
          .json(
            new ApiResponse(
              202,
              "No Tasks found for this user, create your first task"
            )
          );
      }

      res
        .status(200)
        .json(new ApiResponse(201, allTasks, "Tasks fetched successfully"));
    } catch (error) {
      throw new ApiError(400, "Something went wrong while fetching tasks");
    }
  }
);

// ****************************Get Task By Id**************************
export const getTaskByID = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const taskId = Number(req.params.taskId);
    const currentUserId = Number(req.user?.id);
    console.log("current user :", currentUserId);
    try {
      const taskFound = await prisma.task.findFirst({
        where: {
          id: taskId,
          user_id: currentUserId,
        },
      });

      if (!taskFound) {
        throw new ApiError(404, "Task not found");
      }

      res
        .status(200)
        .json(new ApiResponse(200, taskFound, "Task found successfully"));
    } catch (error: any) {
      throw new ApiError(401, error);
    }
  }
);
// ****************************Update Task(Incomplete)*****************************
export const updateTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const taskId = req.params.taskId;
    const { title, description, dueDate, status, isCompleted } = req.body;
    if ([title, description, dueDate].some((field) => field?.trim() == "")) {
      throw new ApiError(400, "Fields cannot be empty");
    }
    if (!taskId) {
      throw new ApiError(400, "Task id is required");
    }

    const currentUserId = req.user?.id;

    const data = { title, description, dueDate, status, isCompleted };

    try {
      const updatedTask = await prisma.task.update({
        where: {
          id: Number(taskId), // Ensure task ID is correctly passed
          user_id: Number(currentUserId), // Ensure task belongs to the logged-in user
        },
        data: data,
        select: {
          id: true,
          user_id: true,
          status: true,
          isCompleted: true,
        },
      });

      const newlyUpdatedTask = await prisma.task.findUnique({
        where: { id: updatedTask.id },
      });

      if (!newlyUpdatedTask) {
        throw new ApiError(400, "Task update failed");
      }
      console.log("Updated Task:", newlyUpdatedTask);

      res
        .status(200)
        .json(new ApiResponse(200, updateTask, "Task Updated successfully !"));
    } catch (error: any) {
      throw new ApiError(400, error);
    }
  }
);

// ****************************Delete Task*****************************
export const deleteTask = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { taskId } = req.params;
    console.log("task Id:", taskId);

    try {
      const taskDeleted = await prisma.task.delete({
        where: { id: Number(taskId) },
      });
      if (!taskDeleted) {
        throw new ApiError(403, "Error in deleting the task");
      }

      res.status(200).json(new ApiResponse(200, "Task Deleted !"));
    } catch (error: any) {
      throw new ApiError(404, "Task to delete does not exist", error);
    }
  }
);

// ****************************
export const ChangeStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { taskId, status } = req.body;
    const currentUserId = req.user?.id;

    try {
      const task = await prisma.task.findFirst({
        where: {
          id: Number(taskId),
          user_id: Number(currentUserId),
        },
      });

      prisma.task.update({
        where: {
          id: taskId, // Ensure task ID is correctly passed
          user_id: currentUserId, // Ensure task belongs to the logged-in user
        },
        data: {
          status: status, // Update status
        },
        select: {
          id: true,
          user_id: true,
          status: true,
        },
      });

      res.status(200).json(new ApiResponse(200, ""));
    } catch (error) {}
  }
);
