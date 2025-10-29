const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục lưu file nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình nơi lưu trữ và tên file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); 
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// Bộ lọc chỉ cho phép một số loại file nhất định (tùy bạn chỉnh)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedTypes.includes(ext)) {
    return cb(new Error('Chỉ được phép tải lên file PDF, hình ảnh hoặc Word.'));
  }
  cb(null, true);
};

// Giới hạn dung lượng file (5MB)
const limits = {
  fileSize: 5 * 1024 * 1024
};

// Tạo instance upload
const upload = multer({
  storage,
  fileFilter,
  limits
});

module.exports = upload;
