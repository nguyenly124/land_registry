// src/services/emailService.js
const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');
const { Resend } = require('resend');

const models = initModels(sequelize);
const { Notification, UserProfile } = models;

const resend = new Resend(process.env.RESEND_API_KEY);

// Gửi email chung
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const { data, error } = await resend.emails.send({
      from: `Hệ thống Đất đai <no-reply@${process.env.RESEND_DOMAIN}>`,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      console.error('[Resend] Lỗi gửi email:', error);
      throw error;
    }
    console.log('[Resend] Gửi email thành công:', data.id);
    return data;
  } catch (error) {
    console.error('[sendEmail] Lỗi:', error);
    throw error;
  }
};

// Gửi OTP đăng nhập
const sendOTP = async (email, otp) => {
  const subject = 'Mã OTP Xác thực Tài khoản';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
      <h2 style="color: #1a73e8;">Xác thực tài khoản</h2>
      <p>Mã OTP của bạn là:</p>
      <h1 style="background: #f0f0f0; padding: 15px; border-radius: 8px; font-size: 32px; letter-spacing: 5px;">
        <strong>${otp}</strong>
      </h1>
      <p><small>Mã hết hạn sau <strong>5 phút</strong>.</small></p>
    </div>
  `;

  return await sendEmail(email, subject, html);
};

// Tạo thông báo + gửi email
const createAndNotify = async (io, accountId, message, hoso_id = null, sendEmailTo = null) => {
  try {
    const notification = await Notification.create({
      account_id: accountId,
      message: message,
      // is_read: false,
      hoso_id: hoso_id || null
    });

    const payload = {
      notification_id: notification.notification_id,
      message: notification.message,
      is_read: false,
      created_at: notification.created_at.toISOString(),
      hoso_id: notification.hoso_id
    };
    io.to(`user_${accountId}`).emit('new_notification', payload);

    if (sendEmailTo?.email && sendEmailTo?.name) {
      const profile = await UserProfile.findOne({ where: { account_id: accountId } });
      const fullName = profile?.full_name || sendEmailTo.name;
      const link = hoso_id 
        ? `${process.env.CLIENT_URL}/dossier/${hoso_id}` 
        : process.env.CLIENT_URL;

      const subject = 'Thông báo mới từ Hệ thống Quản lý Đất đai';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background: #f9f9f9;">
          <h2 style="color: #1a73e8;">Thông báo mới</h2>
          <p>Xin chào <strong>${fullName}</strong>,</p>
          <div style="background: white; padding: 16px; border-radius: 8px; border-left: 4px solid #1a73e8; margin: 16px 0;">
            <p style="margin: 0;"><strong>Nội dung:</strong> ${message}</p>
          </div>
          ${hoso_id ? `
            <p style="text-align: center; margin: 20px 0;">
              <a href="${link}" style="background: #1a73e8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Xem hồ sơ #${hoso_id}
              </a>
            </p>
          ` : ''}
          <hr>
          <p style="font-size: 12px; color: #777;">Email tự động - Vui lòng không trả lời.</p>
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

// Gửi OTP đặt lại mật khẩu
const sendOTPEmail = async ({ to, fullName, otp }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; text-align: center;">
      <h2 style="color: #1e40af;">Đặt lại mật khẩu</h2>
      <p>Xin chào <strong>${fullName}</strong>,</p>
      <p>Mã OTP của bạn:</p>
      <h1 style="font-size: 32px; letter-spacing: 5px; color: #1e40af;">${otp}</h1>
      <p>Hiệu lực: <strong>5 phút</strong></p>
    </div>
  `;

  await sendEmail(to, "Mã OTP đặt lại mật khẩu", html);
};

module.exports = {
  sendOTP,
  sendEmail,
  createAndNotify,
  sendOTPEmail
};