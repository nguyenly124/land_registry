const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');
const { Op } = require("sequelize");
const crypto = require('crypto');
const { sendOTPEmail } = require("../services/emailService") ;
const verifyCaptcha =require('../utils/capcha')
// Khởi tạo models
const { Account, UserProfile } = initModels(sequelize);

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ;

// Chức năng Đăng ký tài khoản (Người dân)
exports.register = async (req, res) => {
    try {
        const { username, password, full_name, dob, address, phone, email, cccd } = req.body;
        
        // 1. Kiểm tra tài khoản đã tồn tại theo username, email, phone hoặc cccd
        const existingAccount = await Account.findOne({ where: { username } });
        const existingProfile = await UserProfile.findOne({
            where: {
                [Op.or]: [
                    { email },
                    { phone },
                    { cccd }
                ]
            }
        });

        if (existingAccount) {
            return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' });
        }
        if (existingProfile) {
            return res.status(409).json({ message: 'Email, số điện thoại hoặc CCCD đã được sử dụng.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const defaultRole = 'Người dân';
        const result = await sequelize.transaction(async (t) => {
            const newAccount = await Account.create({ username, password: hashedPassword, role:defaultRole }, { transaction: t });
            const newUserProfile = await UserProfile.create({
                account_id: newAccount.account_id, full_name, dob, address, phone, email, cccd
            }, { transaction: t });
            return { newAccount, newUserProfile };
        });

        res.status(201).json({ message: 'Đăng ký thành công.', account: result.newAccount, profile: result.newUserProfile });
    } catch (error) {
        console.error('Lỗi khi đăng ký:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};

// Chức năng Đăng nhập
exports.login = async (req, res) => {
  try {
    const { username, password, captcha } = req.body;

    // === 1. Tìm tài khoản ===
    const account = await Account.findOne({ where: { username } });
    if (!account) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng." });
    }

    // === 2. Kiểm tra khóa tài khoản ===
    if (account.lock_until && new Date() < account.lock_until) {
      const minutesLeft = Math.ceil((new Date(account.lock_until) - new Date()) / 60000);
      return res.status(429).json({
        message: `Tài khoản bị khóa ${minutesLeft} phút.`,
      });
    }

    // === 3. KIỂM TRA MẬT KHẨU TRƯỚC ===
    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      // === MẬT KHẨU SAI → TĂNG failed_attempts ===
      const newAttempts = account.failed_attempts + 1;
      const lockUntil = newAttempts >= 10 ? new Date(Date.now() + 30 * 60 * 1000) : null;

      await account.update({
        failed_attempts: newAttempts,
        lock_until: lockUntil,
      });

      // === SAI >= 5 LẦN → YÊU CẦU CAPTCHA (v3) ===
      if (newAttempts >= 5) {
        if (!captcha) {
          return res.status(400).json({
            message: "Đang xác minh bảo mật tự động...",
            requireCaptcha: true,
          });
        }

        const captchaResult = await verifyRecaptchaV3(captcha);
        if (!captchaResult.success || captchaResult.score < 0.5) {
          return res.status(400).json({
            message: "Xác minh bảo mật thất bại.",
            requireCaptcha: true,
          });
        }
      }

      if (newAttempts >= 10) {
        return res.status(429).json({
          message: "Tài khoản bị khóa 30 phút.",
        });
      }

      return res.status(401).json({
        message: "Tên đăng nhập hoặc mật khẩu không đúng.",
        failedAttempts: newAttempts,
        requireCaptcha: newAttempts >= 5,
      });
    }

    // === MẬT KHẨU ĐÚNG → BỎ QUA CAPTCHA, RESET ===
    await account.update({
      failed_attempts: 0,
      lock_until: null,
      last_login: new Date(),
    });

    const token = jwt.sign(
      { id: account.account_id, role: account.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: "Đăng nhập thành công.",
      token,
      user: {
        account_id: account.account_id,
        username: account.username,
        role: account.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server." });
  }
};
// Reset mật khẩu
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự." });
  }
  try {
    const account = await Account.findOne({
      include: [
        {
          model: UserProfile,
          as: "UserProfile",
          where: { email }, 
          attributes: ["full_name", "email"], 
        },
      ],
      attributes: ["account_id", "reset_token", "reset_expires"], 
    });
    if (!account) {
      
      return res.status(400).json({ message: "Email không tồn tại." });
    }
    if (account.reset_token !== otp) {
     
      return res.status(400).json({ message: "Mã OTP không đúng." });
    }

    if (!account.reset_expires || new Date() > new Date(account.reset_expires)) {
      
      return res.status(400).json({ message: "Mã OTP đã hết hạn." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await account.update({
      password: hashedPassword,
      reset_token: null,
      reset_expires: null,
    });

    res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công!",
    });
  } catch (error) {
   
    res.status(500).json({ message: "Lỗi server. Vui lòng thử lại sau." });
  }
};
//quen mat khau 
exports.forgotPassword = async (req, res) => {
 
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ." });
    }

    const account = await Account.findOne({
      include: [
        {
          model: UserProfile,
          as: "UserProfile",
          where: { email }, 
          attributes: ["full_name", "email"], 
        },
      ],
    });

    if (!account) {
      return res.status(200).json({
        success: true,
        message: "Nếu email tồn tại, mã OTP đã được gửi.",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

    await account.update({
      reset_token: otp,
      reset_expires: otpExpires,
    });

    try {
      await sendOTPEmail({
        to: email,
        fullName: account.UserProfile?.full_name || "Người dùng",
        otp,
      });
    } catch (emailError) {
      console.error("Lỗi gửi email OTP:", emailError);
      return res.status(500).json({ message: "Lỗi gửi email. Vui lòng thử lại." });
    }

    res.status(200).json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn.",
    });
  } catch (error) {
    console.error("Lỗi quên mật khẩu:", error);
    res.status(500).json({ message: "Đã có lỗi xảy ra. Vui lòng thử lại sau." });
  }
};
//Làm mới token 
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        // 1. Kiểm tra refresh token có được gửi lên không
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh Token là bắt buộc.' });
        }

        // 2. Tìm tài khoản có refresh token tương ứng trong database
        const account = await Account.findOne({ where: { refresh_token: refreshToken } });
        
        if (!account) {
            // Nếu không tìm thấy, refresh token không hợp lệ hoặc đã bị vô hiệu hóa
            return res.status(401).json({ message: 'Refresh Token không hợp lệ.' });
        }
        
        // 3. Tạo một Access Token mới
        const newAccessToken = jwt.sign(
            { id: account.account_id, role: account.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        const newRefreshToken = crypto.randomBytes(32).toString('hex');
        account.refresh_token = newRefreshToken;
        await account.save();

        res.status(200).json({
            message: 'Tạo Access Token mới thành công.',
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error('Lỗi khi làm mới token:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};


