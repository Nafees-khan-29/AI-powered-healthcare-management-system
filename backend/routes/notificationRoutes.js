const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get user notifications
router.get('/:userType/:userId', notificationController.getUserNotifications);

// Get unread count
router.get('/:userType/:userId/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Create notification
router.post('/', notificationController.createNotification);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

// Get reminder statistics (admin)
router.get('/admin/reminder-stats', notificationController.getReminderStats);

// Trigger reminder check manually (admin/testing)
router.post('/admin/trigger-reminders', notificationController.triggerReminderCheck);

module.exports = router;
