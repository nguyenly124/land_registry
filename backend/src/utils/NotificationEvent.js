// utils/NotificationEvent.js
const EventEmitter = require('events');
const { createAndNotify } = require('../services/emailService');
const { UserProfile, Account ,HoSo, LandParcel } =
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
      hosoId,
      profile ? { email: profile.email, name: profile.full_name } : null
    );

    // Gửi cho tất cả cán bộ
    const canBoList = await Account.findAll({ where: { role: 'Cán bộ' } });
    for (const cb of canBoList) {
      await createAndNotify(
        io, 
        cb.account_id,
        `Hồ sơ mới: ${type} (ID: ${accountId})`,
        hosoId, 
    );
    }
  } catch (error) {
    console.error('Lỗi xử lý sự kiện hoso.submitted:', error);
  }
});

notificationEvent.on('hoso.approved', async ({ io, accountId, hosoId }) => {
  try {
    // 1. LẤY HỒ SƠ + THÔNG TIN
    const hoso = await HoSo.findByPk(hosoId, {
      include: [
        { model: Account, as: 'account', include: [{model:UserProfile, as :'UserProfile'}] },
        { model: LandParcel, as: 'parcel' }
      ]
    });

    if (!hoso) return;

    const userMessage = `Hồ sơ #${hosoId} của bạn đã được duyệt thành công!`;

    // 2. GỬI CHO NGƯỜI NỘP
    const profile = hoso.account?.UserProfile;
    await createAndNotify(
      io,
      accountId,
      userMessage,
      hosoId,
      profile ? { email: profile.email, name: profile.full_name } : null
    );

    // 3. NẾU LÀ CHUYỂN NHƯỢNG → GỬI CHO NGƯỜI NHẬN
    if (hoso.type === 'Chuyển nhượng' && hoso.receiver_info) {
      const { full_name, email, id_number } = hoso.receiver_info;

      // Tìm hoặc tạo tài khoản người nhận
      let receiverAccount = await Account.findOne({ where: { username: id_number } });
      if (!receiverAccount) {
        receiverAccount = await Account.create({
          username: id_number,
          password: require('bcrypt').hashSync(id_number, 10),
          role: 'Người dân'
        });

        await UserProfile.create({
          account_id: receiverAccount.account_id,
          full_name,
          phone: hoso.receiver_info.phone,
          email: email || null
        });
      }

      const receiverMessage = `
        Chúc mừng! Bạn đã trở thành chủ sở hữu mới của thửa đất <strong>${hoso.parcel?.parcel_code || ''}</strong>.
        <br>Hồ sơ chuyển nhượng #${hosoId} đã được duyệt.
      `;

      await createAndNotify(
        io,
        receiverAccount.account_id,
        receiverMessage,
        hosoId,
        email ? { email, name: full_name } : null
      );
    }

  } catch (error) {
    console.error('[Notification] Lỗi khi xử lý hoso.approved:', error);
  }
});

notificationEvent.on('hoso.rejected', async ({ io, accountId, hosoId, reason }) => {
  const profile = await UserProfile.findOne({ where: { account_id: accountId } });
  await createAndNotify(
    io,
    accountId,
    `Hồ sơ #${hosoId} bị từ chối. Lý do: ${reason || 'Không rõ'}.`,
    hosoId,
    profile ? { email: profile.email, name: profile.full_name } : null
  );
});

notificationEvent.on('hoso.supplement_requested', async ({ io, accountId, hosoId, reason }) => {
  const profile = await UserProfile.findOne({ where: { account_id: accountId } });
  await createAndNotify(
    io,
    accountId,
    `Hồ sơ #${hosoId} yêu cầu bổ sung . Lý do: ${reason || 'Không rõ'}.`,
    hosoId,
    profile ? { email: profile.email, name: profile.full_name } : null
  );
});
module.exports = {
  emit: (event, data) => notificationEvent.emit(event, data)
};