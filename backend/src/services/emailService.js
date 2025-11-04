// src/services/emailService.js
const nodemailer = require('nodemailer'); 

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

const createAndNotify = async (io, accountId, message, sendEmailTo = null) => {
  try {
    // 1. Tạo thông báo trong DB
    const notification = await Notification.create({
      account_id: accountId,
      message: message.trim(),
      is_read: false
    });

    // 2. Gửi real-time nếu user online
    const payload = {
      notification_id: notification.notification_id,
      message: notification.message,
      created_at: notification.created_at,
      is_read: false
    };

    io.to(`user_${accountId}`).emit('new_notification', payload);

    // 3. Gửi email (nếu có)
    if (sendEmailTo && sendEmailTo.email && sendEmailTo.name) {
      const subject = 'Thông báo mới từ hệ thống';
      const html = `
        <div style="font-family: Arial; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h3>Xin chào <strong>${sendEmailTo.name}</strong>,</h3>
          <p><strong>Thông báo mới:</strong></p>
          <blockquote style="background: #f9f9f9; padding: 15px; border-left: 4px solid #1a73e8;">
            ${message}
          </blockquote>
          <p><a href="${process.env.CLIENT_URL}" style="color: #1a73e8;">Xem chi tiết tại đây</a></p>
        </div>
      `;
      await sendEmail(sendEmailTo.email, subject, html).catch(console.error);
    }

    console.log(`[Thông báo] Đã gửi đến user_${accountId}`);
    return notification;
  } catch (error) {
    console.error('[Thông báo] Lỗi:', error);
    throw error;
  }
};

module.exports = {
  sendOTP,
  sendEmail,
  createAndNotify,
  transporter
};

