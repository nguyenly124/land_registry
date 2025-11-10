exports.validate = (schema, type = "body") => (req, res, next) => {
  const data = type === "body"
    ? req.body
    : type === "params"
      ? req.params
      : req.query;

  const { error, value } = schema.validate(data, { abortEarly: false });

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

  // Gán lại dữ liệu vào đúng chỗ
  if (type === "body") req.body = value;
  else if (type === "params") req.params = value;
  else req.query = value;

  next();
};
