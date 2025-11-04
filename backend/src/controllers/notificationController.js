// controllers/notificationController.js
const { initModels } = require('../models/init-models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

const { Notification } = initModels(sequelize);

// === [UTILS] Tạo thông báo (dùng nội bộ từ các controller khác) ===
exports.createNotification = async (accountId, message) => {
    try {
        if (!accountId || !message) return;

        await Notification.create({
            account_id: accountId,
            message: message.trim(),
            is_read: false
        });

        console.log(`[Notification] Tạo thành công cho account_id: ${accountId}`);
    } catch (error) {
        console.error('[Notification] Lỗi khi tạo:', error);
    }
};

// === [GET] Lấy tất cả thông báo của người dùng ===
exports.getNotifications = async (req, res) => {
    try {
        const { id: accountId } = req.user;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const { count, rows } = await Notification.findAndCountAll({
            where: { account_id: accountId },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset,
            attributes: ['notification_id', 'message', 'is_read', 'created_at']
        });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách thông báo thành công.',
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server. Vui lòng thử lại.'
        });
    }
};

// === [GET] Lấy thông báo chưa đọc ===
exports.getUnreadNotifications = async (req, res) => {
    try {
        const { id: accountId } = req.user;

        const [unread, total] = await Promise.all([
            Notification.findAll({
                where: { account_id: accountId, is_read: false },
                order: [['created_at', 'DESC']],
                attributes: ['notification_id', 'message', 'created_at']
            }),
            Notification.count({ where: { account_id: accountId, is_read: false } })
        ]);

        res.status(200).json({
            success: true,
            message: 'Lấy thông báo chưa đọc thành công.',
            count: total,
            data: unread
        });
    } catch (error) {
        console.error('Lỗi khi lấy thông báo chưa đọc:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server.'
        });
    }
};

// === [PATCH] Đánh dấu 1 thông báo đã đọc ===
exports.markAsRead = async (req, res) => {
    try {
        const { id: accountId } = req.user;
        const { notificationId } = req.body;

        if (!notificationId) {
            return res.status(400).json({
                success: false,
                message: 'notificationId là bắt buộc.'
            });
        }

        const notification = await Notification.findOne({
            where: {
                notification_id: notificationId,
                account_id: accountId
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy thông báo hoặc bạn không có quyền.'
            });
        }

        if (notification.is_read) {
            return res.json({
                success: true,
                message: 'Thông báo đã được đọc từ trước.'
            });
        }

        await notification.update({ is_read: true });

        res.status(200).json({
            success: true,
            message: 'Đánh dấu đã đọc thành công.',
            data: notification
        });
    } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server.'
        });
    }
};

// === [PATCH] Đánh dấu TẤT CẢ đã đọc ===
exports.markAllAsRead = async (req, res) => {
    try {
        const { id: accountId } = req.user;

        const [updatedCount] = await Notification.update(
            { is_read: true },
            { where: { account_id: accountId, is_read: false } }
        );

        res.status(200).json({
            success: true,
            message: updatedCount > 0
                ? `Đã đánh dấu ${updatedCount} thông báo là đã đọc.`
                : 'Không có thông báo nào chưa đọc.'
        });
    } catch (error) {
        console.error('Lỗi khi đánh dấu tất cả:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server.'
        });
    }
};

// === [DELETE] Xóa thông báo ===
exports.deleteNotification = async (req, res) => {
    try {
        const { id: accountId } = req.user;
        const { notificationId } = req.params;

        const notification = await Notification.findOne({
            where: {
                notification_id: notificationId,
                account_id: accountId
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Thông báo không tồn tại hoặc bạn không có quyền.'
            });
        }

        await notification.destroy();

        res.status(200).json({
            success: true,
            message: 'Xóa thông báo thành công.'
        });
    } catch (error) {
        console.error('Lỗi khi xóa thông báo:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi server.'
        });
    }
};