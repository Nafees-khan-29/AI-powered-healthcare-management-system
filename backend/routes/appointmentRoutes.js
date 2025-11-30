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
    getBookedSlots
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

// GET /api/appointments - Get all appointments (admin)
appointmentRouter.get('/', getAllAppointments);

// PUT /api/appointments/:id/status - Update appointment status
appointmentRouter.put('/:id/status', updateAppointmentStatus);

// PUT /api/appointments/:id - Update appointment details
appointmentRouter.put('/:id', updateAppointment);

// DELETE /api/appointments/:id - Cancel appointment
appointmentRouter.delete('/:id', cancelAppointment);

export default appointmentRouter;
