// schemas/notification.schema.js
const Joi = require('joi');

exports.markAsReadSchema = Joi.object({
    notificationId: Joi.number().integer().positive().required().messages({
        'number.base': 'ID thông báo phải là một số.',
        'number.integer': 'ID thông báo phải là số nguyên.',
        'number.positive': 'ID thông báo phải là số dương.',
        'any.required': 'ID thông báo là bắt buộc.'
    })
});