import Order from "../models/Order.model.js";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";

import { generateTagId } from "../utils/tagGenerator.js";

import { sendEmail, emailTemplates } from "../services/email.service.js";

const STATUS_LABELS = {
  received: "Received",
  washing: "Washing",
  dry_cleaning: "Dry Cleaning",
  ironing: "Ironing",
  quality_check: "Quality Check",
  ready: "Ready for Pickup",
  delivered: "Delivered",
};

export const createOrder = async (req, res) => {
  try {
    const { customerId, garments, serviceType, notes, expectedDays } = req.body;

    const customer = await User.findById(customerId);
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });

    const tagId = await generateTagId();
    const subtotal = garments.reduce(
      (sum, g) => sum + g.unitPrice * g.quantity,
      0,
    );
    const totalAmount = subtotal;
    const days = expectedDays || (serviceType === "express" ? 2 : 5);
    const expectedCompletionDate = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000,
    );

    const order = await Order.create({
      tagId,
      customer: customer._id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      createdBy: req.user._id,
      garments: garments.map((g) => ({
        ...g,
        totalPrice: g.unitPrice * g.quantity,
      })),
      subtotal,
      totalAmount,
      serviceType: serviceType || "normal",
      expectedCompletionDate,
      notes: notes || "",
      statusHistory: [
        {
          status: "received",
          updatedBy: req.user._id,
          updatedByName: req.user.name,
          timestamp: new Date(),
        },
      ],
    });

    await Notification.create({
      user: customer._id,
      order: order._id,
      type: "order_created",
      title: "Order Received",
      message: `Your garments have been received. Tag ID: ${tagId}. Expected ready: ${expectedCompletionDate.toDateString()}`,
      metadata: { tagId, totalAmount },
    });

    // Email notification
    if (customer.email && customer.notifications?.email !== false) {
      await sendEmail(
        customer.email,
        emailTemplates.orderCreated({
          customerName: customer.name,
          tagId,
          totalAmount,
          expectedDate: expectedCompletionDate.toDateString(),
          serviceType: serviceType || "normal",
          garments: order.garments,
        }),
      );
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      search,
      startDate,
      endDate,
    } = req.query;
    const query = {};

    if (req.user.role === "customer") {
      query.customer = req.user._id;
    }

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { tagId: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("customer", "name email phone");

    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone address")
      .populate("createdBy", "name")
      .populate("statusHistory.updatedBy", "name");

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (
      req.user.role === "customer" &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id).populate("customer");

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    const prevStatus = order.status;
    order.status = status;
    order.statusHistory.push({
      status,
      updatedBy: req.user._id,
      updatedByName: req.user.name,
      notes: notes || "",
      timestamp: new Date(),
    });

    if (status === "ready" || status === "delivered") {
      order.actualCompletionDate = new Date();
    }

    await order.save();

    const customer = order.customer;
    const notifData = {
      user: customer._id,
      order: order._id,
      type: status === "ready" ? "ready_pickup" : "status_update",
      title:
        status === "ready"
          ? "🎉 Clothes Ready for Pickup!"
          : `Order Status Updated`,
      message:
        status === "ready"
          ? `Your order ${order.tagId} is ready for pickup. Please collect at your convenience.`
          : `Order ${order.tagId} status: ${STATUS_LABELS[status]}${notes ? ". " + notes : ""}`,
      metadata: { tagId: order.tagId, status },
    };
    await Notification.create(notifData);

    if (customer.email && customer.notifications?.email !== false) {
      if (status === "ready") {
        await sendEmail(
          customer.email,
          emailTemplates.orderReady({
            customerName: customer.name,
            tagId: order.tagId,
            totalAmount: order.totalAmount,
            paymentStatus: order.paymentStatus,
          }),
        );
      } else if (prevStatus !== status) {
        await sendEmail(
          customer.email,
          emailTemplates.statusUpdate({
            customerName: customer.name,
            tagId: order.tagId,
            statusLabel: STATUS_LABELS[status],
            notes,
          }),
        );
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const trackByTagId = async (req, res) => {
  try {
    const order = await Order.findOne({ tagId: req.params.tagId.toUpperCase() })
      .select("-garments.photos -customer -createdBy")
      .populate("statusHistory.updatedBy", "name");

    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found with this Tag ID" });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadPaymentProof = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (
      req.user.role === "customer" &&
      order.customer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    order.paymentProof = {
      url: req.file.path,
      publicId: req.file.filename,
      uploadedAt: new Date(),
    };
    await order.save();

    res.json({
      success: true,
      message: "Payment proof uploaded successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const order = await Order.findById(req.params.id).populate("customer");
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.paymentStatus = "paid";
    order.paymentMethod = paymentMethod || "qr";
    order.paymentVerifiedBy = req.user._id;
    await order.save();

    await Notification.create({
      user: order.customer._id,
      order: order._id,
      type: "payment_received",
      title: "✅ Payment Confirmed",
      message: `Payment of ₹${order.totalAmount} for order ${order.tagId} has been confirmed.`,
    });

    res.json({ success: true, message: "Payment verified", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
