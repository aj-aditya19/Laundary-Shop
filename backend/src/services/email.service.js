import nodemailer from "nodemailer";

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls: { rejectUnauthorized: false },
  });

export const emailTemplates = {
  orderCreated: (data) => ({
    subject: `✅ Order Received - ${data.tagId} | Sparkle Dry Cleaners`,
    html: `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0ea5e9,#06b6d4);padding:32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;">✨ SPARKLE DRY CLEANERS</h1>
        <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Professional Laundry & Dry Cleaning</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#38bdf8;margin-top:0;">Order Confirmed!</h2>
        <p>Dear <strong>${data.customerName}</strong>,</p>
        <p>Your garments have been received. Here are your order details:</p>
        <div style="background:#1e293b;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #334155;">
          <p style="margin:4px 0;"><span style="color:#94a3b8;">Tag ID:</span> <strong style="color:#38bdf8;font-size:18px;">${data.tagId}</strong></p>
          <p style="margin:4px 0;"><span style="color:#94a3b8;">Total Amount:</span> <strong>₹${data.totalAmount}</strong></p>
          <p style="margin:4px 0;"><span style="color:#94a3b8;">Expected Ready:</span> <strong>${data.expectedDate}</strong></p>
          <p style="margin:4px 0;"><span style="color:#94a3b8;">Service Type:</span> <strong>${data.serviceType === "express" ? "⚡ Express" : "📦 Normal"}</strong></p>
        </div>
        <div style="background:#1e293b;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #334155;">
          <h3 style="color:#38bdf8;margin-top:0;font-size:16px;">Garments Received</h3>
          ${data.garments.map((g) => `<p style="margin:4px 0;color:#cbd5e1;">• ${g.quantity}x ${g.type} (${g.serviceType}) - ₹${g.totalPrice}</p>`).join("")}
        </div>
        <p>You can track your order anytime using your Tag ID at our website.</p>
        <a href="${process.env.FRONTEND_URL}/track" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#06b6d4);color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:8px;">Track Your Order</a>
      </div>
      <div style="background:#1e293b;padding:20px;text-align:center;font-size:12px;color:#64748b;">
        <p style="margin:0;">${process.env.SHOP_NAME} | ${process.env.SHOP_PHONE} | ${process.env.SHOP_ADDRESS}</p>
      </div>
    </div>`,
  }),
  orderReady: (data) => ({
    subject: `🎉 Your Order is Ready - ${data.tagId} | Sparkle Dry Cleaners`,
    html: `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;letter-spacing:2px;">✨ SPARKLE DRY CLEANERS</h1>
        <div style="font-size:48px;margin:16px 0;">🎉</div>
        <h2 style="color:#fff;margin:0;">Your clothes are ready!</h2>
      </div>
      <div style="padding:32px;">
        <p>Dear <strong>${data.customerName}</strong>,</p>
        <p>Great news! Your garments have been cleaned, pressed, and are ready for collection.</p>
        <div style="background:#1e293b;border-radius:8px;padding:20px;margin:20px 0;border:1px solid #334155;">
          <p style="margin:4px 0;"><span style="color:#94a3b8;">Tag ID:</span> <strong style="color:#10b981;font-size:18px;">${data.tagId}</strong></p>
          <p style="margin:4px 0;"><span style="color:#94a3b8;">Amount to Pay:</span> <strong style="color:#fbbf24;">₹${data.totalAmount}</strong></p>
          <p style="margin:4px 0;"><span style="color:#94a3b8;">Payment Status:</span> <strong>${data.paymentStatus === "paid" ? "✅ Paid" : "⏳ Pending"}</strong></p>
        </div>
        <div style="background:#064e3b;border:1px solid #10b981;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:0;color:#6ee7b7;font-size:14px;">⏰ Please collect within 30 days. Unclaimed garments may incur storage charges.</p>
        </div>
        <p><strong>Shop Hours:</strong><br>Monday–Saturday: 9:00 AM – 8:00 PM<br>Sunday: 10:00 AM – 6:00 PM</p>
      </div>
      <div style="background:#1e293b;padding:20px;text-align:center;font-size:12px;color:#64748b;">
        <p style="margin:0;">${process.env.SHOP_NAME} | ${process.env.SHOP_PHONE}</p>
      </div>
    </div>`,
  }),
  statusUpdate: (data) => ({
    subject: `📦 Order Update - ${data.tagId} | ${data.statusLabel}`,
    html: `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#0ea5e9,#06b6d4);padding:32px;text-align:center;">
        <h1 style="margin:0;color:#fff;font-size:24px;">✨ SPARKLE DRY CLEANERS</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#38bdf8;">Order Status Updated</h2>
        <p>Dear <strong>${data.customerName}</strong>,</p>
        <p>Your order status has been updated.</p>
        <div style="background:#1e293b;border-radius:8px;padding:20px;margin:20px 0;">
          <p><span style="color:#94a3b8;">Tag ID:</span> <strong style="color:#38bdf8;">${data.tagId}</strong></p>
          <p><span style="color:#94a3b8;">New Status:</span> <strong style="color:#10b981;">${data.statusLabel}</strong></p>
          ${data.notes ? `<p><span style="color:#94a3b8;">Notes:</span> ${data.notes}</p>` : ""}
        </div>
        <a href="${process.env.FRONTEND_URL}/track" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#06b6d4);color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">Track Order</a>
      </div>
    </div>`,
  }),
};

export const sendEmail = async (to, template) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log("⚠️ Email not configured, skipping:", template.subject);
      return false;
    }

    const transporter = createTransporter();

    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        `Sparkle Dry Cleaners <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    });

    return true;
  } catch (error) {
    console.error("Email send error:", error.message);
    return false;
  }
};

export default { sendEmail, emailTemplates };
