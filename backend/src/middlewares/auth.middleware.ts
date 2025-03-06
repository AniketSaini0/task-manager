import { Request, Response, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const prisma = new PrismaClient();

export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.cookies.accessToken;

    if (!token) {
      throw new ApiError(401, "Access denied");
    }

    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
        userId: number;
      };

      console.log("decoded token", decoded);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
      console.log("Authenticated user: ", user);

      if (!user) {
        throw new ApiError(400, "could not authenticate user");
      }

      (req as Request & { user: { id: number; email: string } }).user = {
        id: user?.id,
        email: user?.email,
      };
      next();
    } catch {
      res.status(401).json({ error: "Invalid token" });
    }
  }
);
