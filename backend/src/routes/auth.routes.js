import express from "express";

import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", protect, getMe);

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

export default router;
