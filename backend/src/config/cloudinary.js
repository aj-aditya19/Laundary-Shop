import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const garmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sparkle/garments",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 1200,
        height: 1200,
        crop: "limit",
        quality: "auto:good",
      },
    ],
  },
});

const paymentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "sparkle/payments",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 800,
        height: 800,
        crop: "limit",
        quality: "auto:good",
      },
    ],
  },
});

const uploadGarment = multer({
  storage: garmentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

const uploadPayment = multer({
  storage: paymentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

const deleteImage = async (publicId) => {
  if (publicId) {
    await cloudinary.uploader.destroy(publicId);
  }
};

export { cloudinary, uploadGarment, uploadPayment, deleteImage };
