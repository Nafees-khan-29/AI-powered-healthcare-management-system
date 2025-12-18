const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient Information
  recipientId: {
    type: String,
    required: true,
    index: true
  },
  recipientType: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true
  },
  recipientEmail: {
    type: String,
    required: true
  },
  recipientPhone: {
    type: String
  },

  // Notification Details
  type: {
    type: String,
    enum: [
      'appointment_reminder',
      'appointment_confirmation',
      'appointment_cancellation',
      'appointment_rescheduled',
      'appointment_status_update',
      'medical_report_available',
      'prescription_created',
      'general'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  // Message Content
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  actionUrl: {
    type: String
  },

  // Related Entity
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['appointment', 'prescription', 'medical_record', 'other']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },

  // Delivery Channels
  channels: {
    inApp: {
      enabled: { type: Boolean, default: true },
      status: { 
        type: String, 
        enum: ['pending', 'delivered', 'read', 'failed'],
        default: 'pending'
      },
      deliveredAt: Date,
      readAt: Date
    },
    email: {
      enabled: { type: Boolean, default: true },
      status: { 
        type: String, 
        enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
        default: 'pending'
      },
      sentAt: Date,
      deliveredAt: Date,
      failureReason: String
    },
    sms: {
      enabled: { type: Boolean, default: false },
      status: { 
        type: String, 
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending'
      },
      sentAt: Date,
      deliveredAt: Date,
      failureReason: String
    },
    push: {
      enabled: { type: Boolean, default: false },
      status: { 
        type: String, 
        enum: ['pending', 'sent', 'delivered', 'failed'],
        default: 'pending'
      },
      sentAt: Date,
      deliveredAt: Date,
      failureReason: String
    }
  },

  // Scheduling
  scheduledFor: {
    type: Date,
    index: true
  },
  isScheduled: {
    type: Boolean,
    default: false
  },

  // Retry Logic
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  lastRetryAt: Date,
  nextRetryAt: Date,

  // Status
  overallStatus: {
    type: String,
    enum: ['pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  isCancelled: {
    type: Boolean,
    default: false
  },
  cancelledAt: Date,
  cancelReason: String,

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipientId: 1, recipientType: 1, overallStatus: 1 });
notificationSchema.index({ scheduledFor: 1, overallStatus: 1 });
notificationSchema.index({ 'relatedEntity.entityId': 1, 'relatedEntity.entityType': 1 });
notificationSchema.index({ createdAt: -1 });

// Methods
notificationSchema.methods.markAsRead = async function() {
  this.channels.inApp.status = 'read';
  this.channels.inApp.readAt = new Date();
  if (this.overallStatus === 'delivered') {
    this.overallStatus = 'delivered';
  }
  return this.save();
};

notificationSchema.methods.markAsSent = async function(channel) {
  if (this.channels[channel]) {
    this.channels[channel].status = 'sent';
    this.channels[channel].sentAt = new Date();
    this.updateOverallStatus();
    return this.save();
  }
};

notificationSchema.methods.markAsDelivered = async function(channel) {
  if (this.channels[channel]) {
    this.channels[channel].status = 'delivered';
    this.channels[channel].deliveredAt = new Date();
    this.updateOverallStatus();
    return this.save();
  }
};

notificationSchema.methods.markAsFailed = async function(channel, reason) {
  if (this.channels[channel]) {
    this.channels[channel].status = 'failed';
    this.channels[channel].failureReason = reason;
    this.retryCount += 1;
    
    if (this.retryCount < this.maxRetries) {
      // Calculate exponential backoff: 5min, 15min, 30min
      const backoffMinutes = Math.min(5 * Math.pow(2, this.retryCount - 1), 30);
      this.nextRetryAt = new Date(Date.now() + backoffMinutes * 60 * 1000);
      this.lastRetryAt = new Date();
    } else {
      this.overallStatus = 'failed';
    }
    
    return this.save();
  }
};

notificationSchema.methods.updateOverallStatus = function() {
  const enabledChannels = Object.entries(this.channels)
    .filter(([_, config]) => config.enabled)
    .map(([channel, _]) => channel);

  if (enabledChannels.length === 0) {
    this.overallStatus = 'failed';
    return;
  }

  const statuses = enabledChannels.map(channel => this.channels[channel].status);
  
  if (statuses.every(s => s === 'delivered' || s === 'read')) {
    this.overallStatus = 'delivered';
  } else if (statuses.every(s => s === 'failed')) {
    this.overallStatus = 'failed';
  } else if (statuses.some(s => s === 'sent' || s === 'delivered')) {
    this.overallStatus = 'sent';
  } else if (statuses.some(s => s === 'pending')) {
    this.overallStatus = 'pending';
  }
};

notificationSchema.methods.cancel = async function(reason) {
  this.isCancelled = true;
  this.cancelledAt = new Date();
  this.cancelReason = reason;
  this.overallStatus = 'cancelled';
  return this.save();
};

// Static methods
notificationSchema.statics.getUnreadCount = function(recipientId, recipientType) {
  return this.countDocuments({
    recipientId,
    recipientType,
    'channels.inApp.enabled': true,
    'channels.inApp.status': { $in: ['pending', 'delivered'] }
  });
};

notificationSchema.statics.markAllAsRead = function(recipientId, recipientType) {
  return this.updateMany(
    {
      recipientId,
      recipientType,
      'channels.inApp.status': { $in: ['pending', 'delivered'] }
    },
    {
      $set: {
        'channels.inApp.status': 'read',
        'channels.inApp.readAt': new Date()
      }
    }
  );
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
