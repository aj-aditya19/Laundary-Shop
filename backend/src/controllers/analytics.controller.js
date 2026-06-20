import Order from "../models/Order.model.js";
import User from "../models/User.model.js";

export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayOrders,
      monthOrders,
      pendingOrders,
      readyOrders,
      deliveredThisMonth,
      totalCustomers,
      statusCounts,
    ] = await Promise.all([
      Order.find({ createdAt: { $gte: today } }),
      Order.find({ createdAt: { $gte: monthStart } }),
      Order.countDocuments({
        status: {
          $in: [
            "received",
            "washing",
            "dry_cleaning",
            "ironing",
            "quality_check",
          ],
        },
      }),
      Order.countDocuments({ status: "ready" }),
      Order.find({
        status: "delivered",
        updatedAt: { $gte: monthStart },
      }),
      User.countDocuments({ role: "customer" }),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const todayRevenue = todayOrders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((s, o) => s + o.totalAmount, 0);

    const monthRevenue = monthOrders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((s, o) => s + o.totalAmount, 0);

    // Revenue over last 7 days
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);

      const next = new Date(d);
      next.setDate(next.getDate() + 1);

      const dayOrders = await Order.find({
        createdAt: { $gte: d, $lt: next },
        paymentStatus: "paid",
      });

      last7Days.push({
        date: d.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
        }),
        revenue: dayOrders.reduce((s, o) => s + o.totalAmount, 0),
        orders: dayOrders.length,
      });
    }

    // Top garment types
    const garmentStats = await Order.aggregate([
      { $unwind: "$garments" },
      {
        $group: {
          _id: "$garments.type",
          count: { $sum: "$garments.quantity" },
          revenue: { $sum: "$garments.totalPrice" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    res.json({
      success: true,
      stats: {
        todayOrders: todayOrders.length,
        todayRevenue,
        monthOrders: monthOrders.length,
        monthRevenue,
        pendingOrders,
        readyOrders,
        deliveredThisMonth: deliveredThisMonth.length,
        totalCustomers,
        statusCounts: statusCounts.reduce((obj, s) => {
          obj[s._id] = s.count;
          return obj;
        }, {}),
        revenueChart: last7Days,
        garmentStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCustomerStats = async (req, res) => {
  try {
    const customerId = req.user._id;

    const orders = await Order.find({
      customer: customerId,
    });

    const totalSpent = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((s, o) => s + o.totalAmount, 0);

    res.json({
      success: true,
      stats: {
        totalOrders: orders.length,
        activeOrders: orders.filter((o) => !["delivered"].includes(o.status))
          .length,
        completedOrders: orders.filter((o) => o.status === "delivered").length,
        totalSpent,
        loyaltyPoints: req.user.loyaltyPoints,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
