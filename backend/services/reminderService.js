const cron = require('node-cron');
const Reminder = require('../models/reminderModel');
const Appointment = require('../models/appointmentModel');
const notificationService = require('./notificationService');

class ReminderService {
  constructor() {
    this.cronJobs = [];
  }

  /**
   * Initialize all cron jobs
   */
  initializeCronJobs() {
    console.log('🕐 Initializing reminder cron jobs...');

    // Process reminders every 5 minutes
    const reminderJob = cron.schedule('*/5 * * * *', async () => {
      console.log('⏰ Running reminder check...');
      await this.processReminders();
    });

    // Process scheduled notifications every minute
    const notificationJob = cron.schedule('* * * * *', async () => {
      await notificationService.processScheduledNotifications();
    });

    // Retry failed notifications every 10 minutes
    const retryJob = cron.schedule('*/10 * * * *', async () => {
      await notificationService.retryFailedNotifications();
    });

    // Clean up old notifications daily at 2 AM
    const cleanupJob = cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Running notification cleanup...');
      await this.cleanupOldNotifications();
    });

    this.cronJobs = [reminderJob, notificationJob, retryJob, cleanupJob];

    console.log('✅ Cron jobs initialized successfully');
  }

  /**
   * Stop all cron jobs
   */
  stopCronJobs() {
    this.cronJobs.forEach(job => job.stop());
    console.log('⏹️ All cron jobs stopped');
  }

  /**
   * Create reminders for an appointment
   */
  async createReminders(appointment) {
    try {
      const appointmentDateTime = new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`);
      
      const reminderTypes = [
        { type: '24_hours_before', hours: 24 },
        { type: '2_hours_before', hours: 2 },
        { type: '30_minutes_before', minutes: 30 }
      ];

      const reminders = [];

      for (const reminderConfig of reminderTypes) {
        let scheduledTime;
        
        if (reminderConfig.hours) {
          scheduledTime = new Date(appointmentDateTime.getTime() - reminderConfig.hours * 60 * 60 * 1000);
        } else {
          scheduledTime = new Date(appointmentDateTime.getTime() - reminderConfig.minutes * 60 * 1000);
        }

        // Only create reminder if scheduled time is in the future
        if (scheduledTime > new Date()) {
          const reminder = new Reminder({
            appointmentId: appointment._id,
            reminderType: reminderConfig.type,
            scheduledTime,
            recipients: [
              {
                userId: appointment.patientId,
                userType: 'patient',
                email: appointment.patientEmail,
                phone: appointment.patientPhone
              },
              {
                userId: appointment.doctorId,
                userType: 'doctor',
                email: appointment.doctorEmail || ''
              }
            ],
            appointmentDetails: {
              patientName: appointment.patientName,
              doctorName: appointment.doctorName,
              appointmentDate: appointment.appointmentDate,
              appointmentTime: appointment.appointmentTime,
              doctorSpecialization: appointment.doctorSpecialization
            }
          });

          await reminder.save();
          reminders.push(reminder);
        }
      }

      console.log(`✅ Created ${reminders.length} reminders for appointment ${appointment._id}`);
      return reminders;
    } catch (error) {
      // Check if error is due to duplicate reminder
      if (error.code === 11000) {
        console.log(`⚠️ Reminders already exist for appointment ${appointment._id}`);
        return [];
      }
      console.error('Error creating reminders:', error);
      throw error;
    }
  }

  /**
   * Process pending reminders
   */
  async processReminders() {
    try {
      const pendingReminders = await Reminder.getPendingReminders();

      if (pendingReminders.length === 0) {
        return;
      }

      console.log(`📨 Processing ${pendingReminders.length} pending reminders...`);

      for (const reminder of pendingReminders) {
        try {
          await this.sendReminder(reminder);
        } catch (error) {
          console.error(`Failed to send reminder ${reminder._id}:`, error);
          await reminder.markAsFailed(error.message);
        }
      }

      return pendingReminders.length;
    } catch (error) {
      console.error('Error processing reminders:', error);
      throw error;
    }
  }

  /**
   * Send a reminder
   */
  async sendReminder(reminder) {
    try {
      // Check if appointment is still valid
      const appointment = reminder.appointmentId;
      
      if (!appointment) {
        await reminder.cancel('Appointment not found');
        return;
      }

      if (appointment.status === 'cancelled') {
        await reminder.cancel('Appointment was cancelled');
        return;
      }

      // Get reminder message template
      const messageTemplate = this.getReminderMessageTemplate(reminder);

      // Send notifications to all recipients
      const notificationPromises = reminder.recipients.map(async (recipient) => {
        const notification = await notificationService.createNotification({
          recipientId: recipient.userId,
          recipientType: recipient.userType,
          recipientEmail: recipient.email,
          recipientPhone: recipient.phone,
          type: 'appointment_reminder',
          priority: reminder.reminderType === '30_minutes_before' ? 'high' : 'normal',
          title: messageTemplate.title,
          message: messageTemplate.getMessage(recipient.userType),
          actionUrl: recipient.userType === 'patient' ? '/dashboard/appointments' : '/doctor-dashboard',
          relatedEntity: {
            entityType: 'appointment',
            entityId: appointment._id
          },
          channels: {
            inApp: { enabled: true },
            email: { enabled: true },
            sms: { enabled: false },
            push: { enabled: false }
          }
        });

        // Update recipient with notification ID
        recipient.notificationId = notification._id;
        
        return notification;
      });

      await Promise.all(notificationPromises);
      await reminder.save();
      await reminder.markAsSent();

      console.log(`✅ Reminder sent successfully for appointment ${appointment._id}`);
      
      return true;
    } catch (error) {
      console.error('Error sending reminder:', error);
      throw error;
    }
  }

  /**
   * Get reminder message template
   */
  getReminderMessageTemplate(reminder) {
    const { appointmentDetails, reminderType } = reminder;

    const timeframeMap = {
      '24_hours_before': '24 hours',
      '2_hours_before': '2 hours',
      '30_minutes_before': '30 minutes'
    };

    const timeframe = timeframeMap[reminderType] || '';

    return {
      title: `Appointment Reminder - ${timeframe} away`,
      getMessage: (userType) => {
        if (userType === 'patient') {
          return `
            Hello ${appointmentDetails.patientName},
            
            This is a reminder that your appointment with Dr. ${appointmentDetails.doctorName} (${appointmentDetails.doctorSpecialization}) is coming up in ${timeframe}.
            
            📅 Date: ${appointmentDetails.appointmentDate}
            ⏰ Time: ${appointmentDetails.appointmentTime}
            
            Please make sure to arrive 10 minutes early and bring any necessary documents.
            
            If you need to reschedule or cancel, please do so at least 2 hours in advance.
          `;
        } else {
          return `
            Hello Dr. ${appointmentDetails.doctorName},
            
            This is a reminder that you have an appointment with ${appointmentDetails.patientName} in ${timeframe}.
            
            📅 Date: ${appointmentDetails.appointmentDate}
            ⏰ Time: ${appointmentDetails.appointmentTime}
            
            Please review the patient's information before the appointment.
          `;
        }
      }
    };
  }

  /**
   * Cancel reminders for an appointment
   */
  async cancelReminders(appointmentId, reason) {
    try {
      const result = await Reminder.cancelAppointmentReminders(appointmentId, reason);
      
      // Also cancel related notifications
      await notificationService.cancelAppointmentNotifications(appointmentId, reason);
      
      console.log(`✅ Cancelled ${result.modifiedCount} reminders for appointment ${appointmentId}`);
      return result;
    } catch (error) {
      console.error('Error cancelling reminders:', error);
      throw error;
    }
  }

  /**
   * Reschedule reminders for an appointment
   */
  async rescheduleReminders(appointmentId, newAppointmentDate, newAppointmentTime) {
    try {
      const newDateTime = `${newAppointmentDate}T${newAppointmentTime}`;
      
      await Reminder.rescheduleAppointmentReminders(appointmentId, newDateTime);
      
      console.log(`✅ Rescheduled reminders for appointment ${appointmentId}`);
      
      return true;
    } catch (error) {
      console.error('Error rescheduling reminders:', error);
      throw error;
    }
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  async cleanupOldNotifications() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const Notification = require('../models/notificationModel');
      
      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        overallStatus: { $in: ['delivered', 'failed', 'cancelled'] }
      });

      console.log(`🗑️ Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  }

  /**
   * Get reminder statistics
   */
  async getReminderStats() {
    try {
      const stats = {
        scheduled: await Reminder.countDocuments({ status: 'scheduled' }),
        sent: await Reminder.countDocuments({ status: 'sent' }),
        failed: await Reminder.countDocuments({ status: 'failed' }),
        cancelled: await Reminder.countDocuments({ status: 'cancelled' }),
        total: await Reminder.countDocuments()
      };

      return stats;
    } catch (error) {
      console.error('Error getting reminder stats:', error);
      throw error;
    }
  }

  /**
   * Manual trigger for testing
   */
  async triggerReminderCheck() {
    console.log('🔄 Manually triggering reminder check...');
    return await this.processReminders();
  }
}

module.exports = new ReminderService();
