import Order from "../models/Order.model.js";
import Invoice from "../models/Invoice.model.js";

export const generateTagId = async () => {
  const year = new Date().getFullYear();
  const prefix = `DC-${year}-`;

  const lastOrder = await Order.findOne(
    { tagId: { $regex: `^${prefix}` } },
    { tagId: 1 },
    { sort: { createdAt: -1 } },
  );

  let nextNum = 1001;

  if (lastOrder) {
    const lastNum = parseInt(lastOrder.tagId.replace(prefix, ""));

    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }

  const tagId = `${prefix}${nextNum}`;

  const exists = await Order.findOne({ tagId });

  if (exists) {
    return generateTagId();
  }

  return tagId;
};

export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, "0");

  const prefix = `INV-${year}${month}-`;

  const lastInvoice = await Invoice.findOne(
    { invoiceNumber: { $regex: `^${prefix}` } },
    { invoiceNumber: 1 },
    { sort: { createdAt: -1 } },
  );

  let nextNum = 1;

  if (lastInvoice) {
    const lastNum = parseInt(lastInvoice.invoiceNumber.replace(prefix, ""));

    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }

  return `${prefix}${String(nextNum).padStart(4, "0")}`;
};
