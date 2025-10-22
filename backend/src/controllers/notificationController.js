const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

const { Notification } = initModels(sequelize);

// --- Hàm tạo thông báo mới ---
// Hàm này thường được gọi từ các controller khác (ví dụ: khi hồ sơ được duyệt)
exports.createNotification = async (accountId, message) => {
    try {
        await Notification.create({
            account_id: accountId,
            message: message
        });
        console.log(`Thông báo mới đã được tạo cho account_id: ${accountId}`);
    } catch (error) {
        console.error('Lỗi khi tạo thông báo:', error);
    }
};

// --- Hàm lấy tất cả thông báo của người dùng ---
exports.getNotifications = async (req, res) => {
    try {
        const { id: accountId } = req.user; // Lấy account_id từ token đã được xác thực

        const notifications = await Notification.findAll({
            where: { account_id: accountId },
            order: [['created_at', 'DESC']] // Sắp xếp theo ngày tạo giảm dần
        });

        res.status(200).json({
            message: 'Lấy danh sách thông báo thành công.',
            data: notifications
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};

// --- Hàm lấy thông báo chưa đọc ---
exports.getUnreadNotifications = async (req, res) => {
    try {
        const { id: accountId } = req.user;

        const unreadNotifications = await Notification.findAll({
            where: {
                account_id: accountId,
                is_read: false
            },
            order: [['created_at', 'DESC']]
        });

        res.status(200).json({
            message: 'Lấy danh sách thông báo chưa đọc thành công.',
            count: unreadNotifications.length,
            data: unreadNotifications
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông báo chưa đọc:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};

// --- Hàm đánh dấu thông báo đã đọc ---
exports.markAsRead = async (req, res) => {
    try {
        const { id: accountId } = req.user;
        const { notificationId } = req.body;

        const notification = await Notification.findOne({
            where: {
                notification_id: notificationId,
                account_id: accountId
            }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Không tìm thấy thông báo hoặc bạn không có quyền truy cập.' });
        }

        await notification.update({ is_read: true });

        res.status(200).json({ message: 'Thông báo đã được đánh dấu là đã đọc.', data: notification });
    } catch (error) {
        console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
        res.status(500).json({ message: 'Đã có lỗi xảy ra. Vui lòng thử lại.' });
    }
};