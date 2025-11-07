const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const landController = require('../controllers/landController');
const { 
  createLandSchema,
  editLandSchema 
} = require('../validators/landSchema');
const { searchSchema } =require('../validators/searchSchema')
// @route   POST /api/lands
// @desc    Tạo một thửa đất mới
// @access  Private (Chỉ cán bộ)
router.post('/', authMiddleware, validate(createLandSchema), landController.createLand);

// @route   PUT /api/lands/:id
// @desc    Chỉnh sửa thông tin thửa đất
// @access  Private (Chỉ cán bộ)
router.put('/:id', authMiddleware, validate(editLandSchema), landController.updateLand);
router.get('/search',authMiddleware,validate(searchSchema),landController.getLandsByUser);
router.get('/',authMiddleware,landController.getAllLands);
router.get('/searchid', authMiddleware, landController.searchid);
router.get('/:id',authMiddleware,landController.getLandById);

module.exports = router;