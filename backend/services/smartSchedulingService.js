const Appointment = require('../models/appointmentModel');
const DoctorSchedule = require('../models/doctorScheduleModel');

class SmartSchedulingService {
  /**
   * Check if a time slot is available for a doctor
   */
  async isSlotAvailable(doctorId, appointmentDate, appointmentTime, excludeAppointmentId = null) {
    try {
      // Parse appointment date and time
      const appointmentDateTime = this.parseDateTime(appointmentDate, appointmentTime);
      
      // Get doctor schedule
      const doctorSchedule = await DoctorSchedule.findOne({ doctorId });
      if (!doctorSchedule) {
        throw new Error('Doctor schedule not found');
      }

      // Check if date is available (not on leave, working day)
      if (!doctorSchedule.isDateAvailable(appointmentDateTime)) {
        return {
          available: false,
          reason: 'Doctor is not available on this date'
        };
      }

      // Check if time is within working hours
      const workingHours = doctorSchedule.getWorkingHoursForDate(appointmentDateTime);
      if (!this.isTimeInWorkingHours(appointmentTime, workingHours)) {
        return {
          available: false,
          reason: 'Time is outside doctor\'s working hours',
          workingHours: {
            start: workingHours.startTime,
            end: workingHours.endTime,
            breakTime: workingHours.breakTime
          }
        };
      }

      // Check if time is during break
      if (this.isTimeInBreak(appointmentTime, workingHours.breakTime)) {
        return {
          available: false,
          reason: 'Time is during doctor\'s break'
        };
      }

      // Check for overlapping appointments
      const hasOverlap = await this.hasOverlappingAppointment(
        doctorId,
        appointmentDateTime,
        doctorSchedule.appointmentDuration + doctorSchedule.bufferTime,
        excludeAppointmentId
      );

      if (hasOverlap) {
        return {
          available: false,
          reason: 'Time slot is already booked'
        };
      }

      return {
        available: true,
        duration: doctorSchedule.appointmentDuration,
        bufferTime: doctorSchedule.bufferTime
      };
    } catch (error) {
      console.error('Error checking slot availability:', error);
      throw error;
    }
  }

  /**
   * Find nearest available time slot
   */
  async findNearestAvailableSlot(doctorId, preferredDate, preferredTime, priority = 'normal') {
    try {
      const doctorSchedule = await DoctorSchedule.findOne({ doctorId });
      if (!doctorSchedule) {
        throw new Error('Doctor schedule not found');
      }

      const preferredDateTime = this.parseDateTime(preferredDate, preferredTime);
      const searchStartDate = new Date(preferredDateTime);
      
      // Search for up to 14 days ahead
      const maxSearchDays = 14;
      const slotDuration = doctorSchedule.appointmentDuration + doctorSchedule.bufferTime;

      for (let dayOffset = 0; dayOffset < maxSearchDays; dayOffset++) {
        const currentDate = new Date(searchStartDate);
        currentDate.setDate(currentDate.getDate() + dayOffset);

        // Check if doctor is available on this date
        if (!doctorSchedule.isDateAvailable(currentDate)) {
          continue;
        }

        // Get all available slots for this day
        const availableSlots = await this.getAvailableSlotsForDay(
          doctorId,
          currentDate,
          doctorSchedule
        );

        if (availableSlots.length > 0) {
          // For priority appointments, try to find emergency slot first
          if ((priority === 'high' || priority === 'urgent') && doctorSchedule.emergencySlots.enabled) {
            const emergencySlot = availableSlots.find(slot => slot.isEmergency);
            if (emergencySlot) {
              return {
                found: true,
                slot: emergencySlot,
                isEmergency: true,
                daysAhead: dayOffset
              };
            }
          }

          // Return first available slot
          return {
            found: true,
            slot: availableSlots[0],
            isEmergency: false,
            daysAhead: dayOffset,
            totalSlotsAvailable: availableSlots.length
          };
        }
      }

      return {
        found: false,
        message: `No available slots found within the next ${maxSearchDays} days`
      };
    } catch (error) {
      console.error('Error finding nearest slot:', error);
      throw error;
    }
  }

  /**
   * Get all available slots for a specific day
   */
  async getAvailableSlotsForDay(doctorId, date, doctorSchedule = null) {
    try {
      if (!doctorSchedule) {
        doctorSchedule = await DoctorSchedule.findOne({ doctorId });
      }

      if (!doctorSchedule || !doctorSchedule.isDateAvailable(date)) {
        return [];
      }

      const workingHours = doctorSchedule.getWorkingHoursForDate(date);
      if (!workingHours || !workingHours.isAvailable) {
        return [];
      }

      // Get all existing appointments for this day
      const dateStr = date.toISOString().split('T')[0];
      const existingAppointments = await Appointment.find({
        doctorId,
        appointmentDate: dateStr,
        status: { $in: ['pending', 'confirmed'] }
      }).sort({ appointmentTime: 1 });

      // Generate all possible time slots
      const slots = this.generateTimeSlots(
        workingHours,
        doctorSchedule.appointmentDuration,
        doctorSchedule.bufferTime
      );

      // Filter out booked slots and add emergency slots
      const availableSlots = [];
      const bookedTimes = new Set(existingAppointments.map(apt => apt.appointmentTime));

      for (const slot of slots) {
        if (!bookedTimes.has(slot.time)) {
          availableSlots.push({
            date: dateStr,
            time: slot.time,
            duration: doctorSchedule.appointmentDuration,
            isEmergency: false
          });
        }
      }

      // Add emergency slots if enabled
      if (doctorSchedule.emergencySlots.enabled) {
        const emergencySlotsUsed = existingAppointments.filter(apt => apt.isEmergency).length;
        const emergencySlotsAvailable = doctorSchedule.emergencySlots.slotsPerDay - emergencySlotsUsed;

        if (emergencySlotsAvailable > 0 && availableSlots.length > 0) {
          // Mark some slots as emergency
          const emergencySlotCount = Math.min(emergencySlotsAvailable, 2);
          for (let i = 0; i < emergencySlotCount && i < availableSlots.length; i++) {
            availableSlots[i].isEmergency = true;
            availableSlots[i].duration = doctorSchedule.emergencySlots.duration;
          }
        }
      }

      return availableSlots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      throw error;
    }
  }

  /**
   * Validate appointment booking request
   */
  async validateAppointmentBooking(doctorId, appointmentDate, appointmentTime, priority = 'normal') {
    try {
      // Check slot availability
      const slotCheck = await this.isSlotAvailable(doctorId, appointmentDate, appointmentTime);
      
      if (!slotCheck.available) {
        // Try to find nearest available slot
        const nearestSlot = await this.findNearestAvailableSlot(
          doctorId,
          appointmentDate,
          appointmentTime,
          priority
        );

        return {
          valid: false,
          reason: slotCheck.reason,
          suggestion: nearestSlot.found ? {
            date: nearestSlot.slot.date,
            time: nearestSlot.slot.time,
            daysAhead: nearestSlot.daysAhead,
            isEmergency: nearestSlot.isEmergency
          } : null,
          workingHours: slotCheck.workingHours
        };
      }

      return {
        valid: true,
        duration: slotCheck.duration,
        bufferTime: slotCheck.bufferTime
      };
    } catch (error) {
      console.error('Error validating appointment:', error);
      throw error;
    }
  }

  /**
   * Check for overlapping appointments
   */
  async hasOverlappingAppointment(doctorId, appointmentDateTime, totalDuration, excludeAppointmentId = null) {
    try {
      const dateStr = appointmentDateTime.toISOString().split('T')[0];
      const appointmentTime = this.formatTime(appointmentDateTime);

      // Calculate time range
      const startTime = appointmentDateTime;
      const endTime = new Date(appointmentDateTime.getTime() + totalDuration * 60 * 1000);

      // Find all appointments for this doctor on this date
      const query = {
        doctorId,
        appointmentDate: dateStr,
        status: { $in: ['pending', 'confirmed'] }
      };

      if (excludeAppointmentId) {
        query._id = { $ne: excludeAppointmentId };
      }

      const appointments = await Appointment.find(query);

      // Check for overlaps
      for (const apt of appointments) {
        const aptDateTime = this.parseDateTime(apt.appointmentDate, apt.appointmentTime);
        const aptDuration = apt.duration || 30; // default 30 minutes
        const aptBufferTime = apt.bufferTime || 15; // default 15 minutes buffer
        const aptEndTime = new Date(aptDateTime.getTime() + (aptDuration + aptBufferTime) * 60 * 1000);

        // Check if times overlap
        if (
          (startTime >= aptDateTime && startTime < aptEndTime) ||
          (endTime > aptDateTime && endTime <= aptEndTime) ||
          (startTime <= aptDateTime && endTime >= aptEndTime)
        ) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking overlap:', error);
      throw error;
    }
  }

  /**
   * Generate time slots for a day
   */
  generateTimeSlots(workingHours, appointmentDuration, bufferTime) {
    const slots = [];
    const slotInterval = appointmentDuration + bufferTime;

    const startTime = this.parseTime(workingHours.startTime);
    const endTime = this.parseTime(workingHours.endTime);

    let currentTime = new Date(startTime);

    while (currentTime < endTime) {
      const timeStr = this.formatTime(currentTime);

      // Check if time is not in break
      if (!this.isTimeInBreak(timeStr, workingHours.breakTime)) {
        slots.push({
          time: timeStr,
          duration: appointmentDuration
        });
      }

      currentTime = new Date(currentTime.getTime() + slotInterval * 60 * 1000);
    }

    return slots;
  }

  /**
   * Helper: Parse time string to Date object
   */
  parseTime(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Helper: Parse date and time to DateTime
   */
  parseDateTime(dateStr, timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Helper: Format time from Date object
   */
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Helper: Check if time is within working hours
   */
  isTimeInWorkingHours(timeStr, workingHours) {
    if (!workingHours || !workingHours.isAvailable) return false;

    const time = this.parseTime(timeStr);
    const startTime = this.parseTime(workingHours.startTime);
    const endTime = this.parseTime(workingHours.endTime);

    return time >= startTime && time < endTime;
  }

  /**
   * Helper: Check if time is during break
   */
  isTimeInBreak(timeStr, breakTime) {
    if (!breakTime || !breakTime.start || !breakTime.end) return false;

    const time = this.parseTime(timeStr);
    const breakStart = this.parseTime(breakTime.start);
    const breakEnd = this.parseTime(breakTime.end);

    return time >= breakStart && time < breakEnd;
  }

  /**
   * Get doctor's availability for next N days
   */
  async getDoctorAvailability(doctorId, days = 7) {
    try {
      const doctorSchedule = await DoctorSchedule.findOne({ doctorId });
      if (!doctorSchedule) {
        throw new Error('Doctor schedule not found');
      }

      const availability = [];
      const startDate = new Date();

      for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + i);

        if (doctorSchedule.isDateAvailable(currentDate)) {
          const slots = await this.getAvailableSlotsForDay(doctorId, currentDate, doctorSchedule);
          
          availability.push({
            date: currentDate.toISOString().split('T')[0],
            dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
            availableSlots: slots.length,
            slots: slots
          });
        }
      }

      return availability;
    } catch (error) {
      console.error('Error getting doctor availability:', error);
      throw error;
    }
  }
}

module.exports = new SmartSchedulingService();
