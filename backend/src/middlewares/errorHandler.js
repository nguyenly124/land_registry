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
};

module.exports = errorHandler;