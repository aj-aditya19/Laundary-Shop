import express from "express";
import User from "../models/User.model.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(protect, authorize("manager", "admin"));

router.get("/", async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ["staff", "manager"] } }).sort(
      { createdAt: -1 },
    );
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    const staff = await User.create({
      name,
      email,
      phone,
      role: role || "staff",
      password: phone,
    });
    res.status(201).json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, phone, isActive, role } = req.body;
    const staff = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, isActive, role },
      { new: true },
    );
    if (!staff)
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
