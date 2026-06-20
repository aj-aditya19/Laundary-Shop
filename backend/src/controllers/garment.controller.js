import Order from "../models/Order.model.js";
import { deleteImage } from "../config/cloudinary.js";

export const uploadGarmentPhotos = async (req, res) => {
  try {
    const { orderId, garmentIndex } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const idx = parseInt(garmentIndex, 10);

    if (!order.garments[idx]) {
      return res.status(404).json({
        success: false,
        message: "Garment not found",
      });
    }

    const newPhotos = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    order.garments[idx].photos.push(...newPhotos);

    await order.save();

    res.json({
      success: true,
      message: "Photos uploaded",
      garment: order.garments[idx],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateGarmentCondition = async (req, res) => {
  try {
    const { orderId, garmentIndex } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const idx = parseInt(garmentIndex, 10);

    if (!order.garments[idx]) {
      return res.status(404).json({
        success: false,
        message: "Garment not found",
      });
    }

    order.garments[idx].condition = {
      ...order.garments[idx].condition,
      ...req.body,
    };

    await order.save();

    res.json({
      success: true,
      garment: order.garments[idx],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteGarmentPhoto = async (req, res) => {
  try {
    const { orderId, garmentIndex, photoIndex } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const gIdx = parseInt(garmentIndex, 10);
    const pIdx = parseInt(photoIndex, 10);

    const photo = order.garments[gIdx]?.photos[pIdx];

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: "Photo not found",
      });
    }

    await deleteImage(photo.publicId);

    order.garments[gIdx].photos.splice(pIdx, 1);

    await order.save();

    res.json({
      success: true,
      message: "Photo deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
