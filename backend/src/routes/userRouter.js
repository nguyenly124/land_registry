const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controllers/userController');
const { 
  createStaffAccountSchema,
  updateProfileSchema,
  changePasswordSchema
} = require('../validators/authSchema');

// @route   POST /api/auth/create-staff
// @desc    Tạo tài khoản cán bộ
// @access  Private (Chỉ Admin)
//thêm một middleware để kiểm tra role của người dùng
router.post('/createstaff', authMiddleware, validate(createStaffAccountSchema), userController.createStaffAccount);

// @route   PUT /api/auth/profile
// @desc    Cập nhật thông tin hồ sơ cá nhân
// @access  Private
router.put('/profile', authMiddleware, validate(updateProfileSchema), userController.updateProfile);

router.get('/getProfile',authMiddleware,userController.getProfile);

router.get('/getUsersByRole/:role',authMiddleware,userController.getUsersByRole);

router.put('/changePassword',authMiddleware,validate(changePasswordSchema),userController.changePassword);



module.exports=router