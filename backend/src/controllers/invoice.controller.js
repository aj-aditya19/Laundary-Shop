import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import Invoice from "../models/Invoice.model.js";
import Order from "../models/Order.model.js";
import { generateInvoiceNumber } from "../utils/tagGenerator.js";

export const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("customer");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    let invoice = await Invoice.findOne({
      order: order._id,
    });

    if (!invoice) {
      const invoiceNumber = await generateInvoiceNumber();

      invoice = await Invoice.create({
        invoiceNumber,
        order: order._id,
        customer: order.customer._id,
        tagId: order.tagId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,

        items: order.garments.map((g) => ({
          type: g.type,
          category: g.category,
          quantity: g.quantity,
          unitPrice: g.unitPrice,
          serviceType: g.serviceType,
          totalPrice: g.totalPrice,
        })),

        subtotal: order.subtotal,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        paidAmount: order.paymentStatus === "paid" ? order.totalAmount : 0,
        dueAmount: order.paymentStatus === "paid" ? 0 : order.totalAmount,
      });

      order.invoiceGenerated = true;
      await order.save();
    }

    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
    );

    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor("#0ea5e9").text("SPARKLE DRY CLEANERS", 50, 50, {
      align: "center",
    });

    doc
      .fontSize(10)
      .fillColor("#64748b")
      .text(process.env.SHOP_ADDRESS || "Shop Address", {
        align: "center",
      });

    doc.text(`Phone: ${process.env.SHOP_PHONE || ""}`, {
      align: "center",
    });

    doc.moveDown();

    // Invoice title
    doc.fontSize(18).fillColor("#0f172a").text("INVOICE", {
      align: "center",
    });

    doc.moveDown(0.5);

    // Divider
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#e2e8f0").stroke();

    doc.moveDown(0.5);

    // Invoice Details
    doc.fontSize(10).fillColor("#0f172a");

    const leftCol = 50;
    const rightCol = 350;
    const y1 = doc.y;

    doc.text(`Invoice #: ${invoice.invoiceNumber}`, leftCol, y1);

    doc.text(`Tag ID: ${invoice.tagId}`, leftCol, y1 + 18);

    doc.text(
      `Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}`,
      leftCol,
      y1 + 36,
    );

    doc.text(
      `Status: ${invoice.paymentStatus.toUpperCase()}`,
      leftCol,
      y1 + 54,
    );

    doc.text(`Bill To: ${invoice.customerName}`, rightCol, y1);

    doc.text(`Phone: ${invoice.customerPhone}`, rightCol, y1 + 18);

    if (invoice.customerEmail) {
      doc.text(`Email: ${invoice.customerEmail}`, rightCol, y1 + 36);
    }

    doc.moveDown(4);

    // Table Header
    const tableTop = doc.y + 10;

    doc.fillColor("#0f172a").rect(50, tableTop, 495, 20).fill();

    doc.fillColor("#fff").fontSize(10);

    doc.text("Item", 55, tableTop + 5);
    doc.text("Service", 220, tableTop + 5);
    doc.text("Qty", 330, tableTop + 5);
    doc.text("Unit Price", 380, tableTop + 5);
    doc.text("Total", 470, tableTop + 5);

    // Table Rows
    let rowY = tableTop + 25;

    invoice.items.forEach((item, i) => {
      if (i % 2 === 0) {
        doc
          .fillColor("#f8fafc")
          .rect(50, rowY - 5, 495, 20)
          .fill();
      }

      doc.fillColor("#0f172a").fontSize(9);

      doc.text(`${item.type} (${item.category})`, 55, rowY);

      doc.text(item.serviceType?.replace("_", " ") || "-", 220, rowY);

      doc.text(String(item.quantity), 330, rowY);
      doc.text(`₹${item.unitPrice}`, 380, rowY);
      doc.text(`₹${item.totalPrice}`, 470, rowY);

      rowY += 20;
    });

    // Totals
    doc.moveDown(1);

    const totY = doc.y;

    doc.moveTo(50, totY).lineTo(545, totY).strokeColor("#e2e8f0").stroke();

    doc.moveDown(0.5);

    doc.fontSize(12).fillColor("#0f172a");

    doc.text(`Subtotal: ₹${invoice.subtotal}`, { align: "right" });

    if (invoice.taxAmount > 0) {
      doc.text(`Tax: ₹${invoice.taxAmount}`, { align: "right" });
    }

    doc
      .fontSize(14)
      .fillColor("#0ea5e9")
      .text(`TOTAL: ₹${invoice.totalAmount}`, { align: "right" });

    doc
      .fontSize(10)
      .fillColor(invoice.paymentStatus === "paid" ? "#10b981" : "#ef4444")
      .text(`Payment Status: ${invoice.paymentStatus.toUpperCase()}`, {
        align: "right",
      });

    // Footer
    doc.moveDown(2);

    doc
      .fontSize(8)
      .fillColor("#64748b")
      .text("Thank you for choosing Sparkle Dry Cleaners!", {
        align: "center",
      });

    doc.text("Please retain this invoice for your records.", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInvoices = async (req, res) => {
  try {
    const query =
      req.user.role === "customer" ? { customer: req.user._id } : {};

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
