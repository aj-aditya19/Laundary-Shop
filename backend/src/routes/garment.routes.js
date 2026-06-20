import express from "express";
import {
  uploadGarmentPhotos,
  updateGarmentCondition,
  deleteGarmentPhoto,
} from "../controllers/garment.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";
import { uploadGarment } from "../config/cloudinary.js";

const router = express.Router();

router.use(protect, authorize("staff", "manager", "admin"));
router.post(
  "/:orderId/:garmentIndex/photos",
  uploadGarment.array("photos", 10),
  uploadGarmentPhotos,
);
router.put("/:orderId/:garmentIndex/condition", updateGarmentCondition);
router.delete("/:orderId/:garmentIndex/photos/:photoIndex", deleteGarmentPhoto);

export default router;
