// src/controllers/OTPcontroller.js
const { sendOTP } = require('../services/emailService');
const { initModels } = require('../models/init-models'); 
const { sequelize } = require('../config/db');           

const { Otp } = initModels(sequelize); 

// Gửi OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Email không hợp lệ.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.upsert({ email, otp, expires });
    await sendOTP(email, otp);

    res.json({ message: 'OTP đã được gửi đến email của bạn.' });
  } catch (error) {
    console.error('Lỗi gửi OTP:', error);
    res.status(500).json({ message: 'Không thể gửi OTP. Vui lòng thử lại.' });
  }
};

// Xác thực OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ where: { email, otp } });
    if (!record || new Date(record.expires) < new Date()) {
      return res.status(400).json({ message: 'OTP không hợp lệ hoặc đã hết hạn.' });
    }

    await Otp.destroy({ where: { email } });
    res.json({ message: 'Xác thực thành công!' });
  } catch (error) {
    console.error('Lỗi xác thực OTP:', error);
    res.status(500).json({ message: 'Lỗi xác thực.' });
  }
};