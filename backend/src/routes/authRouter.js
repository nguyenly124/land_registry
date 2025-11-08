const express = require('express');
const router = express.Router();
const { validate } = require('../middlewares/validateMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const authController = require('../controllers/authController');
const OTPcontroller =require('../controllers/OTPcontroller')
const { 
  registerSchema,
  loginSchema,
  resetPassword
} = require('../validators/authSchema');

// @route   POST /api/auth/register
// @desc    Đăng ký tài khoản người dân
// @access  Public
router.post('/register', validate(registerSchema), authController.register);

// @route   POST /api/auth/login
// @desc    Đăng nhập
// @access  Public
router.post('/login', validate(loginSchema), authController.login);
router.post('/', validate(loginSchema), authController.login);
router.post('/send-otp', OTPcontroller.sendOTP);
router.post('/verify-otp', OTPcontroller.verifyOTP);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", validate(resetPassword), authController.resetPassword);

module.exports = router;