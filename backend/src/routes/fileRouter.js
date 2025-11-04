const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const fileController = require('../controllers/fileController');
const upload = require("../middlewares/uploadMiddleware")
const {uploadDocument}=require("../middlewares/cloudinaryUpload")
const {
  uploadDocumentSchema,
  deleteDocumentSchema,
  getDocumentsByHoSoIdSchema
} = require('../validators/documentSchema');
const { searchSchema } = require('../validators/searchSchema');

// @route   POST /api/hoso/submit
// @desc    Nộp hồ sơ mới
// @access  Private (Chỉ người dân)
router.post('/submit', authMiddleware, validate(uploadDocumentSchema),uploadDocument.single('file') , fileController.uploadDocument);

router.get('/:hoso_id', authMiddleware, validate(getDocumentsByHoSoIdSchema), fileController.getDocumentsByHoSoId);

router.get('/:id', authMiddleware, validate(deleteDocumentSchema), fileController.getDocumentById);

router.delete('/:doc_id', authMiddleware, validate(deleteDocumentSchema), fileController.deleteDocument);

module.exports = router;