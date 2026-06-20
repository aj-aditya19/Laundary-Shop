import express from "express";
import {
  getInvoices,
  generateInvoice,
  downloadInvoicePDF,
} from "../controllers/invoice.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getInvoices);
router.post(
  "/generate/:orderId",
  authorize("staff", "manager", "admin"),
  generateInvoice,
);
router.get("/:id/download", downloadInvoicePDF);

export default router;
