import mongoose from 'mongoose';

const healthMetricSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  
  // Vital Signs
  bloodPressureSystolic: {
    type: Number,
    min: 0,
    max: 300
  },
  bloodPressureDiastolic: {
    type: Number,
    min: 0,
    max: 200
  },
  heartRate: {
    type: Number,
    min: 0,
    max: 300
  },
  temperature: {
    type: Number,
    min: 0,
    max: 150
  },
  oxygenSaturation: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Body Metrics
  weight: {
    type: Number,
    min: 0
  },
  height: {
    type: Number,
    min: 0
  },
  bmi: {
    type: Number,
    min: 0
  },
  
  // Blood Sugar
  bloodSugar: {
    type: Number,
    min: 0
  },
  bloodSugarType: {
    type: String,
    enum: ['fasting', 'random', 'post-meal', 'hba1c'],
    default: 'random'
  },
  
  // Additional Metrics
  cholesterol: {
    type: Number,
    min: 0
  },
  
  // Notes
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Metadata
  recordedAt: {
    type: Date,
    default: Date.now
  },
  source: {
    type: String,
    enum: ['manual', 'device', 'doctor'],
    default: 'manual'
  }
}, {
  timestamps: true
});

// Index for faster queries
healthMetricSchema.index({ userId: 1, recordedAt: -1 });
healthMetricSchema.index({ userEmail: 1, recordedAt: -1 });

// Calculate BMI automatically if weight and height are provided
healthMetricSchema.pre('save', function(next) {
  if (this.weight && this.height) {
    const heightInMeters = this.height / 100;
    this.bmi = Number((this.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  next();
});

const healthMetricModel = mongoose.models.healthMetric || mongoose.model('healthMetric', healthMetricSchema);

export default healthMetricModel;
