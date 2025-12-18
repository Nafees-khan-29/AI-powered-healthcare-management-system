import mongoose from 'mongoose';

const emergencyAlertSchema = new mongoose.Schema({
  // Patient Information
  patientId: {
    type: String,
    required: true,
    index: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  
  // Doctor Information (if specific doctor)
  doctorId: {
    type: String,
    index: true
  },
  doctorEmail: {
    type: String
  },
  doctorName: {
    type: String
  },
  
  // Emergency Details
  emergencyType: {
    type: String,
    enum: [
      'severe_pain',
      'breathing_difficulty',
      'chest_pain',
      'high_fever',
      'bleeding',
      'loss_of_consciousness',
      'severe_allergic_reaction',
      'mental_health_crisis',
      'other'
    ],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  location: {
    type: String,
    maxlength: 200
  },
  
  // Current Vitals (optional)
  currentVitals: {
    bloodPressure: String,
    heartRate: String,
    temperature: String,
    oxygenLevel: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'responded', 'resolved', 'cancelled'],
    default: 'pending'
  },
  
  // Response
  respondedBy: {
    type: String
  },
  respondedAt: {
    type: Date
  },
  response: {
    type: String,
    maxlength: 1000
  },
  
  // Video Call
  videoCallLink: {
    type: String
  },
  videoCallInitiatedAt: {
    type: Date
  },
  
  // Priority
  priority: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  
  // Timestamps
  alertSentAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
emergencyAlertSchema.index({ patientId: 1, status: 1 });
emergencyAlertSchema.index({ doctorId: 1, status: 1 });
emergencyAlertSchema.index({ status: 1, alertSentAt: -1 });
emergencyAlertSchema.index({ severity: 1, status: 1 });

// Methods
emergencyAlertSchema.methods.acknowledge = function(doctorId, doctorName) {
  this.status = 'acknowledged';
  this.respondedBy = doctorId;
  this.respondedAt = new Date();
  return this.save();
};

emergencyAlertSchema.methods.respond = function(doctorId, responseMessage) {
  this.status = 'responded';
  this.respondedBy = doctorId;
  this.respondedAt = new Date();
  this.response = responseMessage;
  return this.save();
};

emergencyAlertSchema.methods.resolve = function() {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  return this.save();
};

// Static methods
emergencyAlertSchema.statics.getPendingAlerts = function(doctorId) {
  const query = { status: { $in: ['pending', 'acknowledged'] } };
  if (doctorId) {
    query.$or = [
      { doctorId: doctorId },
      { doctorId: { $exists: false } }, // Alerts not assigned to specific doctor
      { doctorId: null }
    ];
  }
  return this.find(query).sort({ priority: -1, alertSentAt: -1 });
};

emergencyAlertSchema.statics.getCriticalAlerts = function() {
  return this.find({
    severity: { $in: ['high', 'critical'] },
    status: { $in: ['pending', 'acknowledged'] }
  }).sort({ severity: -1, alertSentAt: -1 });
};

const emergencyAlertModel = mongoose.models.emergencyAlert || mongoose.model('emergencyAlert', emergencyAlertSchema);

export default emergencyAlertModel;
