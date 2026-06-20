import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tagId: {
      type: String,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    customerPhone: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
    },

    customerAddress: {
      type: String,
    },

    items: [
      {
        type: {
          type: String,
        },
        category: String,
        quantity: Number,
        unitPrice: Number,
        serviceType: String,
        totalPrice: Number,
      },
    ],

    subtotal: {
      type: Number,
      required: true,
    },

    taxRate: {
      type: Number,
      default: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    dueAmount: {
      type: Number,
    },

    paymentMethod: {
      type: String,
    },

    notes: {
      type: String,
    },

    pdfUrl: {
      type: String,
    },

    qrCodeUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ customer: 1 });

const Invoice = mongoose.model("Invoice", invoiceSchema);

export default Invoice;
