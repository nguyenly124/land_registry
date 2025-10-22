const Joi = require('joi');

const customMessages = {
  'number.min': '{#label} phải lớn hơn hoặc bằng {#limit}.',
  'any.valid': '{#label} không hợp lệ.'
};

exports.searchSchema = Joi.object({
  query: Joi.string().trim().allow('').messages(customMessages).label('Từ khóa tìm kiếm'),
  page: Joi.number().integer().min(1).default(1).messages(customMessages).label('Trang'),
  limit: Joi.number().integer().min(1).max(100).default(10).messages(customMessages).label('Giới hạn'),
  status: Joi.string().valid('Chờ xử lý', 'Đang xử lý', 'Đã duyệt', 'Từ chối').allow(null, '').messages(customMessages).label('Trạng thái'),
}).messages(customMessages);