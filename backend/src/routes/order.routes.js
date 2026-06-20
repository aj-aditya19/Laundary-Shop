import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  trackByTagId,
  uploadPaymentProof,
  verifyPayment,
} from "../controllers/order.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { uploadPayment } from "../config/cloudinary.js";
const router = express.Router();

router.get("/track/:tagId", trackByTagId);
router.use(protect);
router
  .route("/")
  .get(getOrders)
  .post(authorize("staff", "manager", "admin"), createOrder);
router.route("/:id").get(getOrder);
router.put(
  "/:id/status",
  authorize("staff", "manager", "admin"),
  updateOrderStatus,
);
router.post(
  "/:id/payment-proof",
  uploadPayment.single("proof"),
  uploadPaymentProof,
);
router.post(
  "/:id/verify-payment",
  authorize("staff", "manager", "admin"),
  verifyPayment,
);

export default router;
