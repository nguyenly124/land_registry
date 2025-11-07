// landSchema.js
const Joi = require('joi');

const messages = {
  'string.empty': '{#label} không được để trống.',
  'string.max': '{#label} không được vượt quá {#limit} ký tự.',
  'number.base': '{#label} phải là số.',
  'number.positive': '{#label} phải là số dương.',
  'any.required': '{#label} là bắt buộc.',
  'number.min': '{#label} phải lớn hơn hoặc bằng {#limit}.',
  'number.max': '{#label} phải nhỏ hơn hoặc bằng {#limit}.',
};

// === TẠO MỚI ===
exports.createLandSchema = Joi.object({
  parcel_code: Joi.string().trim().max(100).required().label('Mã thửa đất'),
  address: Joi.string().trim().max(255).required().label('Địa chỉ'),
  area: Joi.number().positive().precision(2).required().label('Diện tích'),
  owner_id: Joi.number().integer().allow(null).label('ID chủ sở hữu'),
  land_type: Joi.string().trim().max(100).allow('', null).label('Loại đất'),
  certificate_number: Joi.string().trim().max(100).allow('', null).label('Số GCN'),
  certificate_issue_date: Joi.date().allow(null).label('Ngày cấp GCN'),
  registration_status: Joi.string().trim().max(50)
    .valid('Chưa cấp', 'Đang xử lý', 'Đã cấp')
    .allow('', null)
    .label('Trạng thái đăng ký'),
  latitude: Joi.number().min(-90).max(90).allow(null).label('Vĩ độ'),
  longitude: Joi.number().min(-180).max(180).allow(null).label('Kinh độ'),
}).options({ abortEarly: false });

// === CHỈNH SỬA ===
exports.editLandSchema = Joi.object({
  parcel_code: Joi.string().trim().max(100).label('Mã thửa đất'),
  address: Joi.string().trim().max(255).label('Địa chỉ'),
  area: Joi.number().positive().precision(2).label('Diện tích'),
  owner_id: Joi.number().integer().allow(null).label('ID chủ sở hữu'),
  land_type: Joi.string().trim().max(100).allow('', null).label('Loại đất'),
  certificate_number: Joi.string().trim().max(100).allow('', null).label('Số GCN'),
  certificate_issue_date: Joi.date().allow(null).label('Ngày cấp GCN'),
  registration_status: Joi.string().trim().max(50)
    .valid('Chưa cấp', 'Đang xử lý', 'Đã cấp')
    .allow('', null)
    .label('Trạng thái đăng ký'),
  latitude: Joi.number().min(-90).max(90).allow(null).label('Vĩ độ'),
  longitude: Joi.number().min(-180).max(180).allow(null).label('Kinh độ'),
}).options({ abortEarly: false });