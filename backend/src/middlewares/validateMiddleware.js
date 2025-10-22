exports.validate = (schema) => (req, res, next) => {
  // `abortEarly: false` để nhận tất cả các lỗi validation cùng một lúc
  const { error, value } = schema.validate(req.body, { abortEarly: false });

  if (error) {
      const formattedErrors = error.details.map(err => {
        let msg = err.message.replace(/["]/g, '');
        msg = msg.charAt(0).toUpperCase() + msg.slice(1);
        if (!msg.endsWith('.')) msg += '.';
        return msg;
      });
      return res.status(400).json({
        message: 'Dữ liệu không hợp lệ.',
        errors: formattedErrors
      });
    }

  // Nếu validate thành công, gán dữ liệu đã được làm sạch vào req.body
  // và chuyển sang middleware/controller tiếp theo
  req.body = value;
  next();
};