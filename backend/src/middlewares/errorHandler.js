//Xử lý lỗi từ cả validate và Sequelize.
const errorHandler = (err, req, res, next) => {
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Tên người dùng đã tồn tại',
    });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: err.errors.map(e => e.message),
    });
  }
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Lỗi server',
    error: err.message,
  });
  
  if (err instanceof require('multer').MulterError) {
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: "Tên field không hợp lệ!",
        tip: "Vui lòng dùng key: 'avatar' (không phải 'avata', 'file', 'photo', ...)"
      });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: "File quá lớn!",
        tip: "Kích thước tối đa: 5MB"
      });
    }
    return res.status(400).json({
      success: false,
      message: "Lỗi xử lý file upload",
      error: err.message
    });
  }
};

module.exports = errorHandler;