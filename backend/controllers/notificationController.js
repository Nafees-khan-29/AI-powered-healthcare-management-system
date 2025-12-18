const notificationService = require('../services/notificationService');
const reminderService = require('../services/reminderService');

// Get user notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    const { limit, skip, unreadOnly, type } = req.query;

    const options = {
      limit: parseInt(limit) || 50,
      skip: parseInt(skip) || 0,
      unreadOnly: unreadOnly === 'true',
      type: type || null
    };

    const result = await notificationService.getUserNotifications(userId, userType, options);

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    const notification = await notificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { userId, userType } = req.body;

    const result = await notificationService.markAllAsRead(userId, userType);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId, userType } = req.params;

    const Notification = require('../models/notificationModel');
    const count = await Notification.getUnreadCount(userId, userType);

    res.status(200).json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count',
      error: error.message
    });
  }
};

// Create manual notification
exports.createNotification = async (req, res) => {
  try {
    const notificationData = req.body;

    const notification = await notificationService.createNotification(notificationData);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification',
      error: error.message
    });
  }
};

// Get reminder statistics
exports.getReminderStats = async (req, res) => {
  try {
    const stats = await reminderService.getReminderStats();

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting reminder stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reminder statistics',
      error: error.message
    });
  }
};

// Trigger reminder check manually (for testing)
exports.triggerReminderCheck = async (req, res) => {
  try {
    const processed = await reminderService.triggerReminderCheck();

    res.status(200).json({
      success: true,
      message: `Processed ${processed} reminders`,
      processed
    });
  } catch (error) {
    console.error('Error triggering reminder check:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger reminder check',
      error: error.message
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.body;

    const Notification = require('../models/notificationModel');
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};
