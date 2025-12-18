import express from 'express';
import upload from '../middlewares/multer.js';
import {
    createAppointment,
    getUserAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    updateAppointment,
    getAllAppointments,
    getBookedSlots,
    checkSlotAvailability,
    getAvailableSlots,
    getDoctorAvailability,
    findNearestSlot
} from '../controllers/appointmentController.js';

const appointmentRouter = express.Router();

// POST /api/appointments/create - Book new appointment (with file upload)
appointmentRouter.post('/create', upload.array('medicalReports', 5), createAppointment);

// GET /api/appointments/user/:userId - Get user's appointments
appointmentRouter.get('/user/:userId', getUserAppointments);

// GET /api/appointments/doctor/:doctorId - Get doctor's appointments
appointmentRouter.get('/doctor/:doctorId', getDoctorAppointments);

// GET /api/appointments/booked-slots - Get booked time slots for a doctor on a specific date
appointmentRouter.get('/booked-slots', getBookedSlots);

// Smart Scheduling Routes
// POST /api/appointments/check-availability - Check if slot is available and get suggestions
appointmentRouter.post('/check-availability', checkSlotAvailability);

// GET /api/appointments/available-slots - Get all available slots for a doctor on a specific day
appointmentRouter.get('/available-slots', getAvailableSlots);

// GET /api/appointments/doctor-availability/:doctorId - Get doctor's availability for multiple days
appointmentRouter.get('/doctor-availability/:doctorId', getDoctorAvailability);

// POST /api/appointments/find-nearest-slot - Find nearest available slot
appointmentRouter.post('/find-nearest-slot', findNearestSlot);

// GET /api/appointments - Get all appointments (admin)
appointmentRouter.get('/', getAllAppointments);

// PUT /api/appointments/:id/status - Update appointment status
appointmentRouter.put('/:id/status', updateAppointmentStatus);

// PUT /api/appointments/:id - Update appointment details
appointmentRouter.put('/:id', updateAppointment);

// DELETE /api/appointments/:id - Cancel appointment
appointmentRouter.delete('/:id', cancelAppointment);

export default appointmentRouter;
