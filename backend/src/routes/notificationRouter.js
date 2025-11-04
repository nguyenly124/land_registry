// routes/notificationRouter.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware')

// === Bảo vệ tất cả route bằng JWT ===
router.use(authMiddleware);

// GET /api/notifications
router.get('/', notificationController.getNotifications);

// GET /api/notifications/unread
router.get('/unread', notificationController.getUnreadNotifications);

// put /api/notifications/mark-as-read
router.put('/mark-as-read', notificationController.markAsRead);

// put /api/notifications/mark-all-read
router.put('/mark-all-read', notificationController.markAllAsRead);

// DELETE /api/notifications/:notificationId
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;