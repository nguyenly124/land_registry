const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const dossierController = require('../controllers/dossierController');
const hosoHistoryController=require('../controllers/dosserHistoryController');
const {
  submitFileSchema,
  approveHoSoSchema,
  editHoSoSchema,
  cancelHoSoSchema
} = require('../validators/fileSchema');
const { searchSchema } = require('../validators/searchSchema');

// @route   POST /api/hoso/submit
// @desc    Nộp hồ sơ mới
// @access  Private (Chỉ người dân)
router.post('/submit', authMiddleware, validate(submitFileSchema), dossierController.submitHoSo);
// @route   PUT /api/hoso/edit
// @desc    Chỉnh sửa hồ sơ
// @access  Private (Chỉ người dân)
router.put('/edit', authMiddleware, validate(editHoSoSchema), dossierController.editHoSo);

// @route   PUT /api/hoso/cancel
// @desc    Yêu cầu hủy hồ sơ
// @access  Private (Chỉ người dân)
router.put('/cancel/:hoso_id', authMiddleware, validate(cancelHoSoSchema,"params"), dossierController.cancelHoSo);

// @route   GET /api/hoso/search
// @desc    Tìm kiếm hồ sơ
// @access  Private
// Lưu ý: searchSchema được validate bằng req.query thay vì req.body
// Bạn có thể cần một middleware validate riêng cho req.query
router.get('/search', validate(searchSchema), dossierController.searchHoSo);
router.get('/getHoSoDetails',validate())
router.get('/getdetail/:id',authMiddleware,dossierController.getHoSoDetails)
router.get('/getall',authMiddleware,dossierController.getAllHoSo)
router.patch('/:hosoId/confirm', authMiddleware,dossierController.confirmProcessing);
router.patch('/:hosoId/supplement',authMiddleware, dossierController.requestSupplement);
router.patch('/:hosoId/approve',authMiddleware, dossierController.approveHoSo);
router.patch('/:hosoId/reject', authMiddleware,dossierController.rejectHoSo);
router.get('/history/:hoso_id',authMiddleware,hosoHistoryController.getHistoryByHosoId)
module.exports = router;