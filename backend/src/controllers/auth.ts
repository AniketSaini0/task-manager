import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

// **********************Generate Tokens***********************

const generateAccessAndRefreshToken = async function (user: User) {
  try {
    // const user = await User.findById(userId);

    const accessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: "2h",
    });
    // strong the generated refreshToken to user but need to save the user after this.
    user.refreshToken = refreshToken;

    console.log("refresh token saved in DB");
    // bypassing the default validation that is done by mongoDB
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error(String(error));
  }
};

// ***********************Refresh Tokens**************************

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(406, "Refresh token required");
    }

    // jwt.verify gives us back what ever we used inside jwt.sign for generated the token
    // which in this case was the user._id (check in generateRefreshToken in user.models)
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      REFRESH_TOKEN_SECRET
    ) as jwt.JwtPayload & { userId: number };
    console.log("decoded refreshToken :", decodedRefreshToken);

    const user = await prisma.user.findUnique({
      where: { id: decodedRefreshToken?.userId },
    });

    console.log("decodedRefreshToken id: ", decodedRefreshToken.userid);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    console.log("user refresh token: ", user.refreshToken);
    console.log("user : ", user);

    // we also need to verify if the refresh token is active , compare it with the one stored in DB
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user);

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
            user: accessToken,
            refreshToken: newRefreshToken,
          },
          "generated access and refresh token again successfully"
        )
      );
  }
);

// ***************************Register User************************

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    res.json({
      message: "User registered!",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

// ***************************Login User***************************

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: "Email and password are required",
        });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        throw new ApiError(401, "Invalid credentials");
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new ApiError(401, "Invalid Password");
      }

      console.log("user validation complete, proceeding to generate tokens...");
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user
      );
      const loggedInUser = prisma.user.findUnique({
        where: { email },
      });

      console.log("Tokens generated, logged in user: ", loggedInUser);

      const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV == "production",
      };

      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
          status: 200,
          info: {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          message: "User Logged in successfully",
        });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  }
);

// ****************************Logout User*************************

export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.id) {
      throw new ApiError(401, "Unauthorized");
    }

    // Update the user's refreshToken to null (Prisma does not support 'undefined')
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null },
    });

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
    console.log(req.user);
    res
      .status(200)
      .json(new ApiResponse(200, req.user, "User fetched successfully"));
  }
);
