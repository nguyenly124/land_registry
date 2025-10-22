const Joi = require('joi');

const customMessages = {
  'number.base': '{#label} phải là một số.',
  'number.positive': '{#label} phải là một số dương.',
  'string.empty': '{#label} không được rỗng.',
  'string.max': '{#label} không được quá {#limit} ký tự.',
  'any.required': '{#label} là bắt buộc.',
  'string.valid': '{#label} không hợp lệ.'
};

// Schema cho chức năng Tạo thửa đất mới
exports.createLandSchema = Joi.object({
  parcel_code: Joi.string().trim().max(100).required().messages(customMessages).label('Mã lô đất'),
  address: Joi.string().trim().max(255).required().messages(customMessages).label('Địa chỉ'),
  area: Joi.number().positive().required().messages(customMessages).label('Diện tích'),
  owner_id: Joi.number().integer().required().messages(customMessages).label('Mã chủ sở hữu'),
}).messages(customMessages);

// Schema cho chức năng Chỉnh sửa thông tin thửa đất
exports.editLandSchema = Joi.object({
  parcel_code: Joi.string().trim().max(100).optional().messages(customMessages).label('Mã lô đất'),
  address: Joi.string().trim().max(255).optional().messages(customMessages).label('Địa chỉ'),
  area: Joi.number().positive().optional().messages(customMessages).label('Diện tích'),
  owner_id: Joi.number().integer().optional().messages(customMessages).label('Mã chủ sở hữu'),
}).messages(customMessages);