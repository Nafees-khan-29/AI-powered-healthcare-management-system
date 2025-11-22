import express from 'express';
import {
    getAllDoctors,
    getDoctorById,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    toggleAvailability
} from '../controllers/doctorController.js';

const doctorRouter = express.Router();

// GET /api/doctors - Get all doctors
doctorRouter.get('/', getAllDoctors);

// GET /api/doctors/:id - Get doctor by ID
doctorRouter.get('/:id', getDoctorById);

// POST /api/doctors/add - Add new doctor (admin only)
doctorRouter.post('/add', addDoctor);

// PUT /api/doctors/:id - Update doctor info
doctorRouter.put('/:id', updateDoctor);

// PUT /api/doctors/:id/availability - Toggle doctor availability
doctorRouter.put('/:id/availability', toggleAvailability);

// DELETE /api/doctors/:id - Delete doctor
doctorRouter.delete('/:id', deleteDoctor);

export default doctorRouter;
