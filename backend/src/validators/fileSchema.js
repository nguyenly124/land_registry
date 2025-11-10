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
  type: Joi.string().valid('Đăng ký sử dụng', 'Chuyển nhượng').required(),
  parcelId: Joi.number().integer().optional(),
  receiver_info: Joi.object({ // THÊM DÒNG NÀY
    full_name: Joi.string().required(),
    id_number: Joi.string().required(),
    phone: Joi.string().required(),
    address: Joi.string().required()
  }).optional()
});

// Schema cho chức năng Duyệt hồ sơ
exports.approveHoSoSchema = Joi.object({
  hosoId: Joi.number().integer().required().messages(customMessages).label('Mã hồ sơ'),
  action: Joi.string().valid('Đã duyệt', 'Từ chối').required().messages(customMessages).label('Trạng thái duyệt'),
}).messages(customMessages);

// Schema cho chức năng Chỉnh sửa hồ sơ (để người dân sửa lại)
// Các trường đều optional vì người dùng có thể chỉ muốn sửa một phần.
exports.editHoSoSchema = Joi.object({
  hosoId: Joi.number().integer().required().messages(customMessages).label('Mã hồ sơ'),
  type: Joi.string().trim().max(100).optional().messages(customMessages).label('Loại hồ sơ'),
  parcelId: Joi.number().integer().optional().allow(null).messages(customMessages).label('Mã thửa đất'),
}).messages(customMessages);

// Schema cho chức năng Yêu cầu hủy hồ sơ
exports.cancelHoSoSchema = Joi.object({
  hoso_id: Joi.number().integer().required().messages(customMessages).label('Mã hồ sơ'),
}).messages(customMessages);