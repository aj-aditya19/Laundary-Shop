import express from "express";

import {
  getDashboardStats,
  getCustomerStats,
} from "../controllers/analytics.controller.js";

import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get(
  "/dashboard",
  authorize("staff", "manager", "admin"),
  getDashboardStats,
);

router.get("/customer", getCustomerStats);

export default router;
