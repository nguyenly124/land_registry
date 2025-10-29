// src/middlewares/passwordExpiryMiddleware.js
const dayjs = require('dayjs');

module.exports = async (req, res, next) => {
  const user = req.user; 
  if (!user.password_last_changed) return next();

  const lastChange = dayjs(user.password_last_changed);
  const expiryDate = lastChange.add(user.password_expiration_days || 30, 'day');

  if (dayjs().isAfter(expiryDate)) {
    return res.status(403).json({
      message: 'Mật khẩu của bạn đã hết hạn. Vui lòng đổi mật khẩu để tiếp tục sử dụng hệ thống.'
    });
  }

  next();
};
