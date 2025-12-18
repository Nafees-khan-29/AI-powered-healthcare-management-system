const mongoose = require('mongoose');

const doctorScheduleSchema = new mongoose.Schema({
  // Doctor Reference
  doctorId: {
    type: String,
    required: true,
    index: true
  },
  doctorName: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },

  // Working Hours Configuration
  workingHours: {
    monday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      breakTime: {
        start: { type: String, default: '13:00' },
        end: { type: String, default: '14:00' }
      }
    },
    tuesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      breakTime: {
        start: { type: String, default: '13:00' },
        end: { type: String, default: '14:00' }
      }
    },
    wednesday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      breakTime: {
        start: { type: String, default: '13:00' },
        end: { type: String, default: '14:00' }
      }
    },
    thursday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      breakTime: {
        start: { type: String, default: '13:00' },
        end: { type: String, default: '14:00' }
      }
    },
    friday: {
      isAvailable: { type: Boolean, default: true },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' },
      breakTime: {
        start: { type: String, default: '13:00' },
        end: { type: String, default: '14:00' }
      }
    },
    saturday: {
      isAvailable: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '13:00' },
      breakTime: null
    },
    sunday: {
      isAvailable: { type: Boolean, default: false },
      startTime: null,
      endTime: null,
      breakTime: null
    }
  },

  // Appointment Settings
  appointmentDuration: {
    type: Number,
    default: 30, // minutes
    required: true
  },
  bufferTime: {
    type: Number,
    default: 15, // minutes between appointments
    required: true
  },
  maxAppointmentsPerDay: {
    type: Number,
    default: 16
  },

  // Leave/Unavailability
  unavailableDates: [{
    date: Date,
    reason: String,
    type: {
      type: String,
      enum: ['leave', 'holiday', 'emergency', 'conference', 'other'],
      default: 'leave'
    }
  }],

  // Emergency Slots
  emergencySlots: {
    enabled: { type: Boolean, default: true },
    slotsPerDay: { type: Number, default: 2 },
    duration: { type: Number, default: 20 } // minutes
  },

  // Online/Offline Consultation
  consultationTypes: {
    inPerson: { type: Boolean, default: true },
    video: { type: Boolean, default: true },
    phone: { type: Boolean, default: false }
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
doctorScheduleSchema.index({ doctorId: 1 }, { unique: true });

// Methods
doctorScheduleSchema.methods.isWorkingDay = function(date) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return this.workingHours[dayName]?.isAvailable || false;
};

doctorScheduleSchema.methods.isDateAvailable = function(date) {
  // Check if date is in unavailable dates
  const dateStr = date.toISOString().split('T')[0];
  const isUnavailable = this.unavailableDates.some(unavail => {
    const unavailDateStr = new Date(unavail.date).toISOString().split('T')[0];
    return unavailDateStr === dateStr;
  });
  
  return !isUnavailable && this.isWorkingDay(date);
};

doctorScheduleSchema.methods.getWorkingHoursForDate = function(date) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  return this.workingHours[dayName];
};

doctorScheduleSchema.methods.getTotalSlotsForDay = function(date) {
  const workingHours = this.getWorkingHoursForDate(date);
  if (!workingHours || !workingHours.isAvailable) return 0;

  const startTime = this.parseTime(workingHours.startTime);
  const endTime = this.parseTime(workingHours.endTime);
  
  let totalMinutes = (endTime - startTime) / (1000 * 60);
  
  // Subtract break time if exists
  if (workingHours.breakTime && workingHours.breakTime.start && workingHours.breakTime.end) {
    const breakStart = this.parseTime(workingHours.breakTime.start);
    const breakEnd = this.parseTime(workingHours.breakTime.end);
    totalMinutes -= (breakEnd - breakStart) / (1000 * 60);
  }
  
  const slotDuration = this.appointmentDuration + this.bufferTime;
  return Math.floor(totalMinutes / slotDuration);
};

doctorScheduleSchema.methods.parseTime = function(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const DoctorSchedule = mongoose.model('DoctorSchedule', doctorScheduleSchema);

module.exports = DoctorSchedule;
