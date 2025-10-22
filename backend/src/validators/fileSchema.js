const Joi = require('joi');

const customMessages = {
  'number.base': '{#label} phải là một số.',
  'number.positive': '{#label} phải là một số dương.',
  'string.empty': '{#label} không được rỗng.',
  'string.max': '{#label} không được quá {#limit} ký tự.',
  'any.required': '{#label} là bắt buộc.',
  'string.valid': '{#label} không hợp lệ.'
};

// Schema cho chức năng Nộp hồ sơ mới
exports.submitFileSchema = Joi.object({
  type: Joi.string().trim().max(100).required().messages(customMessages).label('Loại hồ sơ'),
  parcelId: Joi.number().integer().allow(null).messages(customMessages).label('Mã thửa đất'),
}).messages(customMessages);

// Schema cho chức năng Duyệt hồ sơ
exports.approveFileSchema = Joi.object({
  hosoId: Joi.number().integer().required().messages(customMessages).label('Mã hồ sơ'),
  action: Joi.string().valid('Đã duyệt', 'Từ chối').required().messages(customMessages).label('Trạng thái duyệt'),
}).messages(customMessages);

// Schema cho chức năng Chỉnh sửa hồ sơ (để người dân sửa lại)
// Các trường đều optional vì người dùng có thể chỉ muốn sửa một phần.
exports.editFileSchema = Joi.object({
  hosoId: Joi.number().integer().required().messages(customMessages).label('Mã hồ sơ'),
  type: Joi.string().trim().max(100).optional().messages(customMessages).label('Loại hồ sơ'),
  parcelId: Joi.number().integer().optional().allow(null).messages(customMessages).label('Mã thửa đất'),
}).messages(customMessages);

// Schema cho chức năng Yêu cầu hủy hồ sơ
exports.cancelFileSchema = Joi.object({
  hosoId: Joi.number().integer().required().messages(customMessages).label('Mã hồ sơ'),
}).messages(customMessages);