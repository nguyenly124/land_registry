
const Joi = require('joi');

// Schema cho hàm uploadDocument
exports.uploadDocumentSchema = Joi.object({
    hoso_id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID hồ sơ phải là một số.',
        'number.integer': 'ID hồ sơ phải là số nguyên.',
        'number.positive': 'ID hồ sơ phải là số dương.',
        'any.required': 'ID hồ sơ là bắt buộc.'
    })
});

// Schema cho hàm getDocumentsByHoSoId
exports.getDocumentsByHoSoIdSchema = Joi.object({
    hoso_id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID hồ sơ phải là một số.',
        'number.integer': 'ID hồ sơ phải là số nguyên.',
        'number.positive': 'ID hồ sơ phải là số dương.',
        'any.required': 'ID hồ sơ là bắt buộc.'
    })
});

// Schema cho hàm deleteDocument
exports.deleteDocumentSchema = Joi.object({
    doc_id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID tài liệu phải là một số.',
        'number.integer': 'ID tài liệu phải là số nguyên.',
        'number.positive': 'ID tài liệu phải là số dương.',
        'any.required': 'ID tài liệu là bắt buộc.'
    })
});