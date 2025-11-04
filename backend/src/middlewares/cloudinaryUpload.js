const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");
require("dotenv").config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cấu hình nơi lưu trữ cho Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "land_registry/avatars", // Thư mục trên Cloudinary
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [
      { width: 500, height: 500, crop: "limit" },
      { quality: "auto" }
    ],
  },
});

const uploadCloud = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const isValid = allowed.test(file.mimetype);
    cb(isValid ? null : new Error("Chỉ chấp nhận file ảnh!"), isValid);
  },
});

const storageDocument = new CloudinaryStorage({
 cloudinary,
  params: {
    folder: "land_registry/documents", 
    allowed_formats: ["pdf", "doc", "docx", "jpg", "jpeg", "png"], 

 },
});

const uploadDocument = multer({
   storage: storageDocument,
   limits: { fileSize: 10 * 1024 * 1024 }, // Ví dụ: 10MB cho tài liệu
   fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|doc|docx/;
    const isValid = allowed.test(file.mimetype);
    cb(isValid ? null : new Error("Chỉ chấp nhận file ảnh/tài liệu!"), isValid);
   },
});
module.exports ={
  uploadCloud,
  uploadDocument,
} 
