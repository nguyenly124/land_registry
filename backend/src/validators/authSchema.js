const Joi = require('joi');

const customMessages = {
  'string.empty': '{#label} không được rỗng.',
  'string.min': '{#label} phải có ít nhất {#limit} ký tự.',
  'string.max': '{#label} không được quá {#limit} ký tự.',
  'string.alphanum': '{#label} chỉ được chứa chữ cái và số.',
  'string.length': '{#label} phải có đúng {#limit} ký tự.',
  'string.pattern.base': '{#label} không hợp lệ.',
  'any.required': '{#label} là bắt buộc.',
  'date.base': '{#label} không đúng định dạng.',
  'date.less': '{#label} phải trước ngày hiện tại.',
  'string.email': '{#label} không đúng định dạng email.',
  'string.uri': '{#label} không đúng định dạng URL.'
};

// Schema cho chức năng Đăng ký tài khoản (Người dân)
exports.registerSchema = Joi.object({
  username: Joi.string().trim().alphanum().min(3).max(30).required().messages(customMessages).label('Tên đăng nhập'),
  password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\\s]).{8,30}$')).required().messages(customMessages).label('Mật khẩu'),
  full_name: Joi.string().trim().max(200).required().messages(customMessages).label('Họ và tên'),
  dob: Joi.date().iso().less('now').messages(customMessages).label('Ngày sinh'),
  address: Joi.string().trim().max(255).allow(null, '').messages(customMessages).label('Địa chỉ'),
  phone: Joi.string().trim().pattern(new RegExp('^\\d{10,11}$')).allow(null, '').messages(customMessages).label('Số điện thoại'),
  email: Joi.string().trim().email().allow(null, '').messages(customMessages).label('Email'),
  cccd: Joi.string().trim().length(12).pattern(new RegExp('^\\d{12}$')).allow(null, '').messages(customMessages).label('Căn cước công dân'),
}).messages(customMessages);

// Schema cho chức năng Đăng nhập
exports.loginSchema = Joi.object({
  username: Joi.string().trim().required().messages(customMessages).label('Tên đăng nhập'),
  password: Joi.string().required().messages(customMessages).label('Mật khẩu'),
}).messages(customMessages);
// Schema cho chức năng Đổi mật khẩu 
exports.changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'any.required': 'Mật khẩu cũ là bắt buộc.'
  }),
  newPassword: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\\s]).{8,30}$')).required().messages({
    'string.empty': 'Mật khẩu mới không được rỗng.',
    'string.pattern.base': 'Mật khẩu mới phải từ 8 đến 30 ký tự, chỉ chứa chữ cái và số.',
    'any.required': 'Mật khẩu mới là bắt buộc.'
  }),
});
// Schema cho chức năng Tạo tài khoản Cán bộ
exports.createStaffAccountSchema = Joi.object({
  username: Joi.string().trim().alphanum().min(3).max(30).required().messages(customMessages).label('Tên đăng nhập'),
  password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9\\s]).{8,30}$')).required().messages(customMessages).label('Mật khẩu'),
  full_name: Joi.string().trim().max(200).required().messages(customMessages).label('Họ và tên'),
  dob: Joi.date().iso().less('now').messages(customMessages).label('Ngày sinh'),
  address: Joi.string().trim().max(255).allow(null, '').messages(customMessages).label('Địa chỉ'),
  phone: Joi.string().trim().pattern(new RegExp('^\\d{10,11}$')).allow(null, '').messages(customMessages).label('Số điện thoại'),
  email: Joi.string().trim().email().allow(null, '').messages(customMessages).label('Email'),
  cccd: Joi.string().trim().length(12).pattern(new RegExp('^\\d{12}$')).allow(null, '').messages(customMessages).label('Căn cước công dân'),
  position: Joi.string().trim().max(100).required().messages(customMessages).label('Chức vụ'),
  agency: Joi.string().trim().max(200).required().messages(customMessages).label('Cơ quan'),
  staff_code: Joi.string().trim().max(50).required().messages(customMessages).label('Mã cán bộ'),
}).messages(customMessages);

// Schema cho chức năng Cập nhật thông tin cá nhân
// Các trường đều optional vì người dùng có thể chỉ cập nhật một phần
exports.updateProfileSchema = Joi.object({
  full_name: Joi.string().trim().max(200).optional().messages(customMessages).label('Họ và tên'),
  dob: Joi.date().iso().less('now').optional().messages(customMessages).label('Ngày sinh'),
  address: Joi.string().trim().max(255).optional().allow(null, '').messages(customMessages).label('Địa chỉ'),
  phone: Joi.string().trim().pattern(new RegExp('^\\d{10,11}$')).optional().allow(null, '').messages(customMessages).label('Số điện thoại'),
  email: Joi.string().trim().email().optional().allow(null, '').messages(customMessages).label('Email')
}).messages(customMessages);