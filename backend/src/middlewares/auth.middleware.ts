import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError";
import User from "../models/user.model";

// declare global {
//   namespace Express {
//     interface Request {
//       user?: IUser; // Modify this based on your User type/interface
//     }
//   }
// }

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

// **************************** Authentication Middleware *****************************
export const authMiddleware = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]; // Extract token from Bearer Token
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken; // Extract token from cookies
    }

    if (!token) {
      throw new ApiError(401, "Unauthorized - No token provided");
    }

    try {
      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
        userId: string;
      };
      const user = await User.findById(decoded.userId).select("-password"); // Exclude password

      if (!user) {
        throw new ApiError(401, "Unauthorized - Invalid token");
      }

      console.log("user: ", user);
      // ...user.toObject(),

      req.user = { id: user._id.toString(), email: user.email.toString() };
      next();
    } catch (error) {
      throw new ApiError(403, "Forbidden - Token verification failed");
    }
  }
);
