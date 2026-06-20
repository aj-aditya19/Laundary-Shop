import mongoose from "mongoose";

const garmentItemSchema = new mongoose.Schema({
  type: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  serviceType: {
    type: String,
    enum: ["wash", "dry_clean", "iron", "wash_iron", "dry_clean_iron"],
    default: "dry_clean",
  },
  specialInstructions: { type: String, default: "" },
  photos: [
    {
      url: String,
      publicId: String,
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  condition: {
    hasStain: { type: Boolean, default: false },
    hasTear: { type: Boolean, default: false },
    hasColorFade: { type: Boolean, default: false },
    looseStitching: { type: Boolean, default: false },
    missingButton: { type: Boolean, default: false },
    otherIssues: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedByName: { type: String },
  notes: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    tagId: { type: String, required: true, unique: true, uppercase: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "received",
        "washing",
        "dry_cleaning",
        "ironing",
        "quality_check",
        "ready",
        "delivered",
      ],
      default: "received",
    },
    garments: [garmentItemSchema],
    statusHistory: [statusHistorySchema],
    subtotal: { type: Number, required: true },
    taxRate: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    expectedCompletionDate: { type: Date, required: true },
    actualCompletionDate: { type: Date },
    serviceType: {
      type: String,
      enum: ["normal", "express"],
      default: "normal",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "cash" },
    paymentProof: { url: String, publicId: String, uploadedAt: Date },
    paymentVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, default: "" },
    invoiceGenerated: { type: Boolean, default: false },
    remindersSent: { type: Number, default: 0 },
    lastReminderSent: { type: Date },
  },
  { timestamps: true },
);

orderSchema.index({ tagId: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customerPhone: 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
