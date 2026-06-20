require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User.model");

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Create admin
    const adminExists = await User.findOne({ email: "admin@sparkle.com" });
    if (!adminExists) {
      await User.create({
        name: "Admin",
        email: "admin@sparkle.com",
        password: "Admin@1234",
        phone: "9999999999",
        role: "admin",
      });
      console.log("✅ Admin created: admin@sparkle.com / Admin@1234");
    } else {
      console.log("ℹ️  Admin already exists");
    }

    // Create demo staff
    const staffExists = await User.findOne({ email: "staff@sparkle.com" });
    if (!staffExists) {
      await User.create({
        name: "Staff Member",
        email: "staff@sparkle.com",
        password: "Staff@1234",
        phone: "8888888888",
        role: "staff",
      });
      console.log("✅ Staff created: staff@sparkle.com / Staff@1234");
    }

    // Create demo customer
    const customerExists = await User.findOne({
      email: "customer@example.com",
    });
    if (!customerExists) {
      await User.create({
        name: "Demo Customer",
        email: "customer@example.com",
        password: "Customer@1234",
        phone: "7777777777",
        role: "customer",
      });
      console.log("✅ Customer created: customer@example.com / Customer@1234");
    }

    console.log("\n🎉 Seed complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
};

seed();
