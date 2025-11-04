const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const passwordExpiryMiddleware=require('../middlewares/passwordExpiryMiddleware');
const userController = require('../controllers/userController');
const {uploadCloud}= require('../middlewares/cloudinaryUpload')
const { 
  createStaffAccountSchema,
  updateProfileSchema,
  changePasswordSchema,
 
} = require('../validators/authSchema');
const renameField = require('../middlewares/renameField');

router.use(authMiddleware,passwordExpiryMiddleware);
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

router.post(
  "/upload-avatar",
  authMiddleware,
  uploadCloud.single("avatar"),
  userController.uploadAvatar
);

module.exports=router