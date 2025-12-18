const Notification = require('../models/notificationModel');
const { sendAppointmentEmail } = require('../config/email');

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(notificationData) {
    try {
      const notification = new Notification(notificationData);
      
      // If scheduled for future, mark as scheduled
      if (notificationData.scheduledFor && new Date(notificationData.scheduledFor) > new Date()) {
        notification.isScheduled = true;
        notification.overallStatus = 'pending';
      } else {
        // Send immediately
        await this.sendNotification(notification);
      }
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send notification through enabled channels
   */
  async sendNotification(notification) {
    try {
      const results = {
        inApp: null,
        email: null,
        sms: null,
        push: null
      };

      notification.overallStatus = 'processing';
      await notification.save();

      // Send through each enabled channel
      if (notification.channels.inApp.enabled) {
        results.inApp = await this.sendInAppNotification(notification);
      }

      if (notification.channels.email.enabled) {
        results.email = await this.sendEmailNotification(notification);
      }

      if (notification.channels.sms.enabled) {
        results.sms = await this.sendSMSNotification(notification);
      }

      if (notification.channels.push.enabled) {
        results.push = await this.sendPushNotification(notification);
      }

      return results;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send in-app notification
   */
  async sendInAppNotification(notification) {
    try {
      // Mark as delivered immediately for in-app
      await notification.markAsDelivered('inApp');
      return { success: true };
    } catch (error) {
      await notification.markAsFailed('inApp', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification) {
    try {
      const emailData = {
        to: notification.recipientEmail,
        subject: notification.title,
        html: this.generateEmailTemplate(notification)
      };

      await sendAppointmentEmail(emailData);
      await notification.markAsSent('email');
      
      // Simulate delivery confirmation (in real scenario, use webhook)
      setTimeout(async () => {
        await notification.markAsDelivered('email');
      }, 2000);

      return { success: true };
    } catch (error) {
      console.error('Email notification failed:', error);
      await notification.markAsFailed('email', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS notification (placeholder)
   */
  async sendSMSNotification(notification) {
    try {
      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log(`SMS to ${notification.recipientPhone}: ${notification.message}`);
      
      await notification.markAsSent('sms');
      await notification.markAsDelivered('sms');
      
      return { success: true, message: 'SMS service not implemented yet' };
    } catch (error) {
      await notification.markAsFailed('sms', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send push notification (placeholder)
   */
  async sendPushNotification(notification) {
    try {
      // TODO: Integrate with push service (Firebase, OneSignal, etc.)
      console.log(`Push notification to ${notification.recipientId}: ${notification.message}`);
      
      await notification.markAsSent('push');
      await notification.markAsDelivered('push');
      
      return { success: true, message: 'Push service not implemented yet' };
    } catch (error) {
      await notification.markAsFailed('push', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate email template
   */
  generateEmailTemplate(notification) {
    const baseTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .header {
            background-color: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: white;
            padding: 30px;
            border-radius: 0 0 5px 5px;
          }
          .priority-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .priority-high { background-color: #ef4444; color: white; }
          .priority-urgent { background-color: #dc2626; color: white; }
          .priority-normal { background-color: #3b82f6; color: white; }
          .priority-low { background-color: #6b7280; color: white; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Healthcare Management System</h1>
          </div>
          <div class="content">
            ${notification.priority !== 'normal' ? `
              <span class="priority-badge priority-${notification.priority}">
                ${notification.priority.toUpperCase()} PRIORITY
              </span>
            ` : ''}
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            ${notification.actionUrl ? `
              <a href="${notification.actionUrl}" class="button">View Details</a>
            ` : ''}
          </div>
          <div class="footer">
            <p>This is an automated message from Healthcare Management System.</p>
            <p>Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return baseTemplate;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, userType, options = {}) {
    try {
      const {
        limit = 50,
        skip = 0,
        unreadOnly = false,
        type = null
      } = options;

      const query = {
        recipientId: userId,
        recipientType: userType,
        'channels.inApp.enabled': true
      };

      if (unreadOnly) {
        query['channels.inApp.status'] = { $in: ['pending', 'delivered'] };
      }

      if (type) {
        query.type = type;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const total = await Notification.countDocuments(query);
      const unreadCount = await Notification.getUnreadCount(userId, userType);

      return {
        notifications,
        total,
        unreadCount,
        hasMore: total > (skip + limit)
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        recipientId: userId
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return await notification.markAsRead();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId, userType) {
    try {
      return await Notification.markAllAsRead(userId, userType);
    } catch (error) {
      console.error('Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * Process scheduled notifications
   */
  async processScheduledNotifications() {
    try {
      const now = new Date();
      
      const scheduledNotifications = await Notification.find({
        isScheduled: true,
        overallStatus: 'pending',
        scheduledFor: { $lte: now }
      });

      console.log(`Processing ${scheduledNotifications.length} scheduled notifications`);

      for (const notification of scheduledNotifications) {
        try {
          await this.sendNotification(notification);
          notification.isScheduled = false;
          await notification.save();
        } catch (error) {
          console.error(`Failed to send scheduled notification ${notification._id}:`, error);
        }
      }

      return scheduledNotifications.length;
    } catch (error) {
      console.error('Error processing scheduled notifications:', error);
      throw error;
    }
  }

  /**
   * Retry failed notifications
   */
  async retryFailedNotifications() {
    try {
      const now = new Date();
      
      const failedNotifications = await Notification.find({
        overallStatus: { $in: ['pending', 'processing'] },
        retryCount: { $lt: '$maxRetries' },
        nextRetryAt: { $lte: now }
      });

      console.log(`Retrying ${failedNotifications.length} failed notifications`);

      for (const notification of failedNotifications) {
        try {
          await this.sendNotification(notification);
        } catch (error) {
          console.error(`Retry failed for notification ${notification._id}:`, error);
        }
      }

      return failedNotifications.length;
    } catch (error) {
      console.error('Error retrying failed notifications:', error);
      throw error;
    }
  }

  /**
   * Create appointment reminder notifications
   */
  async createAppointmentReminders(appointment) {
    try {
      const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
      const notifications = [];

      const reminderTimes = [
        { hours: 24, type: '24_hours_before' },
        { hours: 2, type: '2_hours_before' },
        { minutes: 30, type: '30_minutes_before' }
      ];

      for (const reminder of reminderTimes) {
        let scheduledTime;
        if (reminder.hours) {
          scheduledTime = new Date(appointmentDateTime.getTime() - reminder.hours * 60 * 60 * 1000);
        } else {
          scheduledTime = new Date(appointmentDateTime.getTime() - reminder.minutes * 60 * 1000);
        }

        // Only create if scheduled time is in the future
        if (scheduledTime > new Date()) {
          // Patient notification
          const patientNotification = await this.createNotification({
            recipientId: appointment.patientId,
            recipientType: 'patient',
            recipientEmail: appointment.patientEmail,
            recipientPhone: appointment.patientPhone,
            type: 'appointment_reminder',
            priority: reminder.minutes ? 'high' : 'normal',
            title: `Appointment Reminder - ${reminder.type.replace('_', ' ')}`,
            message: `Your appointment with Dr. ${appointment.doctorName} is scheduled for ${appointment.appointmentDate} at ${appointment.appointmentTime}`,
            actionUrl: `/dashboard/appointments`,
            relatedEntity: {
              entityType: 'appointment',
              entityId: appointment._id
            },
            scheduledFor: scheduledTime,
            channels: {
              inApp: { enabled: true },
              email: { enabled: true },
              sms: { enabled: false },
              push: { enabled: false }
            }
          });

          notifications.push(patientNotification);

          // Doctor notification
          const doctorNotification = await this.createNotification({
            recipientId: appointment.doctorId,
            recipientType: 'doctor',
            recipientEmail: appointment.doctorEmail || '',
            type: 'appointment_reminder',
            priority: reminder.minutes ? 'high' : 'normal',
            title: `Appointment Reminder - ${reminder.type.replace('_', ' ')}`,
            message: `You have an appointment with ${appointment.patientName} scheduled for ${appointment.appointmentDate} at ${appointment.appointmentTime}`,
            actionUrl: `/doctor-dashboard`,
            relatedEntity: {
              entityType: 'appointment',
              entityId: appointment._id
            },
            scheduledFor: scheduledTime,
            channels: {
              inApp: { enabled: true },
              email: { enabled: true },
              sms: { enabled: false },
              push: { enabled: false }
            }
          });

          notifications.push(doctorNotification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating appointment reminders:', error);
      throw error;
    }
  }

  /**
   * Cancel appointment notifications
   */
  async cancelAppointmentNotifications(appointmentId, reason) {
    try {
      const result = await Notification.updateMany(
        {
          'relatedEntity.entityId': appointmentId,
          'relatedEntity.entityType': 'appointment',
          overallStatus: { $in: ['pending', 'scheduled'] }
        },
        {
          $set: {
            isCancelled: true,
            cancelledAt: new Date(),
            cancelReason: reason,
            overallStatus: 'cancelled'
          }
        }
      );

      return result;
    } catch (error) {
      console.error('Error cancelling appointment notifications:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
