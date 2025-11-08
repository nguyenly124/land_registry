// src/services/emailService.js
const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');
const nodemailer = require('nodemailer'); 

const models = initModels(sequelize);
const { Notification, UserProfile, Account } = models;
// Tạo transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Kiểm tra kết nối
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Kết nối thất bại:', error);
  } else {
    console.log('SMTP sẵn sàng!');
  }
});
// email thông báo 
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: `"Hệ thống Đất đai" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // fallback text
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
};
//mail otp

const sendOTP = async (email, otp) => {
  const subject = 'Mã OTP Xác thực Tài khoản';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #1a73e8;">Xác thực tài khoản</h2>
      <p>Mã OTP của bạn là:</p>
      <h1 style="background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; font-size: 32px; letter-spacing: 5px;">
        <strong>${otp}</strong>
      </h1>
      <p><small>Mã này hết hạn sau <strong>5 phút</strong>.</small></p>
      <hr>
      <p style="color: #666; font-size: 12px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    </div>
  `;

  return await sendEmail(email, subject, html);
};

const createAndNotify = async (io, accountId, message, hoso_id = null, sendEmailTo = null) => {
  try {
    // 1. Tạo thông báo trong DB (có hoso_id)
    const notification = await Notification.create({
      account_id: accountId,
      message: message.trim(),
      hoso_id: hoso_id || null
    });

    // 2. Gửi Socket.IO realtime
    const payload = {
      notification_id: notification.notification_id,
      message: notification.message,
      is_read: false,
      created_at: notification.created_at.toISOString(),
      hoso_id: notification.hoso_id // GỬI hoso_id
    };
    io.to(`user_${accountId}`).emit('new_notification', payload);

    // 3. Gửi email (nếu có)
    if (sendEmailTo?.email && sendEmailTo?.name) {
      const profile = await UserProfile.findOne({ where: { account_id: accountId } });
      const fullName = profile?.full_name || sendEmailTo.name;
      const link = hoso_id 
        ? `${process.env.CLIENT_URL}/dossier/${hoso_id}` 
        : process.env.CLIENT_URL;

      const subject = 'Thông báo mới từ Hệ thống Quản lý Đất đai';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background: #f9f9f9;">
          <h2 style="color: #1a73e8; margin-bottom: 10px;">Thông báo mới</h2>
          <p>Xin chào <strong>${fullName}</strong>,</p>
          
          <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #1a73e8; margin: 16px 0;">
            <p style="margin: 0; font-size: 15px;"><strong>Nội dung:</strong></p>
            <p style="margin: 8px 0 0; color: #333;">${message}</p>
          </div>

          ${hoso_id ? `
            <p style="margin: 16px 0;">
              <a href="${link}" style="background: #1a73e8; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Xem hồ sơ #${hoso_id}
              </a>
            </p>
          ` : ''}

          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">
            Đây là email tự động. Vui lòng không trả lời.
          </p>
        </div>
      `;

      await sendEmail(sendEmailTo.email, subject, html).catch(err => 
        console.error(`[Email] Gửi thất bại đến ${sendEmailTo.email}:`, err)
      );
    }

    return notification;
  } catch (error) {
    console.error('[createAndNotify] Lỗi:', error);
    throw error;
  }
};
const sendOTPEmail = async ({ to, fullName, otp }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #1e40af;">Xác nhận đặt lại mật khẩu</h2>
      <p>Xin chào <strong>${fullName}</strong>,</p>
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e40af;">
          ${otp}
        </span>
      </div>
      <p>Mã OTP có hiệu lực trong <strong>5 phút</strong>.</p>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      <hr>
      <p style="font-size: 12px; color: #666;">Hệ thống quản lý hồ sơ đất đai</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Hệ thống quản lý" <${process.env.SMTP_USER}>`,
    to,
    subject: "Mã OTP đặt lại mật khẩu",
    html,
  });
};
module.exports = {
  sendOTP,
  sendEmail,
  createAndNotify,
  transporter,
  sendOTPEmail
};

