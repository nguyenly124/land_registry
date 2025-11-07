// utils/NotificationEvent.js
const EventEmitter = require('events');
const { createAndNotify } = require('../services/emailService');
const { UserProfile, Account } =
  require('../models/init-models')(require('../config/db').sequelize);

class NotificationEvent extends EventEmitter {}

const notificationEvent = new NotificationEvent();

// ĐĂNG KÝ CÁC SỰ KIỆN 
notificationEvent.on('hoso.submitted', async ({ io, accountId, type, hosoId, parcelId }) => {
  try {
    const profile = await UserProfile.findOne({ where: { account_id: accountId } });
    const message = parcelId
      ? `Hồ sơ "${type}" cho thửa đất #${parcelId} đã được nộp.`
      : `Hồ sơ "${type}" đã được nộp thành công.`;

    // Gửi cho người dân
    await createAndNotify(
      io,
      accountId,
      message,
      profile ? { email: profile.email, name: profile.full_name } : null
    );

    // Gửi cho tất cả cán bộ
    const canBoList = await Account.findAll({ where: { role: 'Cán bộ' } });
    for (const cb of canBoList) {
      await createAndNotify(io, cb.account_id, `Hồ sơ mới: ${type} (ID: ${accountId})`);
    }
  } catch (error) {
    console.error('Lỗi xử lý sự kiện hoso.submitted:', error);
  }
});

notificationEvent.on('hoso.approved', async ({ io, accountId, hosoId }) => {
  const profile = await UserProfile.findOne({ where: { account_id: accountId } });
  await createAndNotify(
    io,
    accountId,
    `Hồ sơ #${hosoId} đã được duyệt.`,
    profile ? { email: profile.email, name: profile.full_name } : null
  );
});

notificationEvent.on('hoso.rejected', async ({ io, accountId, hosoId, reason }) => {
  const profile = await UserProfile.findOne({ where: { account_id: accountId } });
  await createAndNotify(
    io,
    accountId,
    `Hồ sơ #${hosoId} bị từ chối. Lý do: ${reason || 'Không rõ'}.`,
    profile ? { email: profile.email, name: profile.full_name } : null
  );
});

notificationEvent.on('hoso.supplement_requested', async ({ io, accountId, hosoId, reason }) => {
  const profile = await UserProfile.findOne({ where: { account_id: accountId } });
  await createAndNotify(
    io,
    accountId,
    `Hồ sơ #${hosoId} yêu cầu bổ sung . Lý do: ${reason || 'Không rõ'}.`,
    profile ? { email: profile.email, name: profile.full_name } : null
  );
});
module.exports = {
  emit: (event, data) => notificationEvent.emit(event, data)
};