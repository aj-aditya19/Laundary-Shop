import express from "express";
import { trackByTagId } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/:tagId", trackByTagId);

export default router;
