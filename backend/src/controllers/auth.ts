import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
// import { PrismaClient, User } from "@prisma/client";
// const prisma = new PrismaClient();

import User, { IUser } from "../models/user.model"; // Import Mongoose User Model

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

// **********************Generate Tokens***********************

const generateAccessAndRefreshToken = async function (user: IUser) {
  try {
    const accessToken = jwt.sign(
      {
        userId: user._id, // Mongoose uses `_id`
        username: user.username,
        email: user.email,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
      expiresIn: "2h",
    });

    // Store refreshToken in the database
    user.refreshToken = refreshToken;
    await user.save(); // Save the updated user

    console.log("✅ Refresh token saved in DB");

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(`Error generating tokens: ${error}`);
  }
};

// ***********************Refresh Tokens**************************

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(406, "Refresh token required");
    }

    try {
      // Verify the refresh token
      const decodedRefreshToken = jwt.verify(
        incomingRefreshToken,
        REFRESH_TOKEN_SECRET
      ) as jwt.JwtPayload & { userId: string }; // MongoDB uses string `_id`
      console.log("decoded refreshToken :", decodedRefreshToken);

      // Find user by ID in MongoDB
      const user = await User.findById(decodedRefreshToken?.userId);
      console.log("decodedRefreshToken id: ", decodedRefreshToken.userId);

      if (!user) {
        throw new ApiError(401, "Invalid refresh token");
      }

      console.log("user refresh token: ", user.refreshToken);
      console.log("user : ", user);

      // Ensure the refresh token matches the one in the database
      if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used");
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        await generateAccessAndRefreshToken(user);

      // Update user refresh token in DB
      user.refreshToken = newRefreshToken;
      await user.save();

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };

      console.log(
        `old refreshToken: ${user.refreshToken} , new refreshToken: ${newRefreshToken}`
      );

      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              accessToken,
              refreshToken: newRefreshToken,
            },
            "Generated new access and refresh tokens successfully"
          )
        );
    } catch (error) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }
  }
);

// ***************************Register User************************

export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, email, password } = req.body;

      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: "Email already in use" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      // Save to MongoDB
      await newUser.save();

      res.status(201).json({
        message: "User registered successfully!",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

// ***************************Login User***************************

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: "Email and password are required",
        });
        return;
      }

      // Find user in MongoDB
      const user = await User.findOne({ email });
      if (!user) {
        throw new ApiError(401, "Invalid credentials");
      }

      // Validate password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new ApiError(401, "Invalid Password");
      }

      console.log("✅ User validation complete, generating tokens...");

      // Generate access and refresh tokens
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user
      );

      console.log("✅ Tokens generated successfully");

      // Update refresh token in the database
      user.refreshToken = refreshToken;
      await user.save();

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };

      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          status: 200,
          info: {
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
            },
            accessToken,
            refreshToken,
          },
          message: "User Logged in successfully",
        });
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  }
);

// ****************************Logout User*************************

export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
      throw new ApiError(401, "Unauthorized");
    }

    // Set refreshToken to null in MongoDB
    await User.findByIdAndUpdate(req.user.id, { refreshToken: null });

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  }
);

// *****************************Current User**************************

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    console.log("Fetching current user:", req.user);

    if (!req.user) {
      res
        .status(200)
        .json(new ApiResponse(200, null, "User not authenticated"));
    }

    res
      .status(200)
      .json(new ApiResponse(200, req.user, "User fetched successfully"));
  }
);
