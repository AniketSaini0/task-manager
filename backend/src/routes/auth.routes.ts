import express from "express";
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getCurrentUser,
} from "../controllers/auth";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    message: "health check successfull",
  });
});

router.post("/register", register);
router.post("/login", login);
router.route("/refresh-token").post(refreshAccessToken);

// Protected routes
router.route("/logout").post(authMiddleware, logout);
router.route("/current-user").get(authMiddleware, getCurrentUser);

export default router;
