import { Request, Response, NextFunction } from "express";
import ApiError from "./ApiError"; // Ensure this matches your project structure

// Global error handler middleware
const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
};

export default errorHandler;
