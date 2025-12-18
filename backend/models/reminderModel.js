const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  // Appointment Reference
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true
  },

  // Reminder Configuration
  reminderType: {
    type: String,
    enum: ['24_hours_before', '2_hours_before', '30_minutes_before', 'custom'],
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true,
    index: true
  },

  // Recipients
  recipients: [{
    userId: String,
    userType: {
      type: String,
      enum: ['patient', 'doctor']
    },
    email: String,
    phone: String,
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notification'
    }
  }],

  // Status
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'failed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  sentAt: Date,
  failedAt: Date,
  cancelledAt: Date,
  cancelReason: String,

  // Execution Details
  executionAttempts: {
    type: Number,
    default: 0
  },
  lastAttemptAt: Date,
  errorMessage: String,

  // Metadata
  appointmentDetails: {
    patientName: String,
    doctorName: String,
    appointmentDate: String,
    appointmentTime: String,
    doctorSpecialization: String
  }
}, {
  timestamps: true
});

// Indexes
reminderSchema.index({ scheduledTime: 1, status: 1 });
reminderSchema.index({ appointmentId: 1, reminderType: 1 }, { unique: true });

// Methods
reminderSchema.methods.markAsSent = async function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

reminderSchema.methods.markAsFailed = async function(error) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.errorMessage = error;
  this.executionAttempts += 1;
  this.lastAttemptAt = new Date();
  return this.save();
};

reminderSchema.methods.cancel = async function(reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  return this.save();
};

// Static methods
reminderSchema.statics.getPendingReminders = function() {
  const now = new Date();
  return this.find({
    status: 'scheduled',
    scheduledTime: { $lte: now }
  }).populate('appointmentId');
};

reminderSchema.statics.cancelAppointmentReminders = async function(appointmentId, reason) {
  return this.updateMany(
    { appointmentId, status: 'scheduled' },
    {
      $set: {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason
      }
    }
  );
};

reminderSchema.statics.rescheduleAppointmentReminders = async function(appointmentId, newAppointmentDate) {
  const reminders = await this.find({ appointmentId, status: 'scheduled' });
  
  const appointmentDateTime = new Date(newAppointmentDate);
  
  for (const reminder of reminders) {
    let newScheduledTime;
    
    switch (reminder.reminderType) {
      case '24_hours_before':
        newScheduledTime = new Date(appointmentDateTime.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '2_hours_before':
        newScheduledTime = new Date(appointmentDateTime.getTime() - 2 * 60 * 60 * 1000);
        break;
      case '30_minutes_before':
        newScheduledTime = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);
        break;
      default:
        continue;
    }
    
    // Only update if new time is in the future
    if (newScheduledTime > new Date()) {
      reminder.scheduledTime = newScheduledTime;
      await reminder.save();
    } else {
      // Cancel if the new time is in the past
      await reminder.cancel('Rescheduled time has passed');
    }
  }
};

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
