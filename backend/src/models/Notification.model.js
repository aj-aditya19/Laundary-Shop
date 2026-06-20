import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    type: {
      type: String,
      enum: [
        "order_created",
        "status_update",
        "ready_pickup",
        "payment_received",
        "delivered",
        "reminder",
        "general",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    channel: {
      type: String,
      enum: ["in_app", "email", "whatsapp", "all"],
      default: "in_app",
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true },
);

notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
