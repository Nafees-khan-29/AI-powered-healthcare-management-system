import express from 'express';
import {
    createPrescription,
    getPatientPrescriptions,
    getDoctorPrescriptions,
    updatePrescription,
    deletePrescription
} from '../controllers/prescriptionController.js';

const prescriptionRouter = express.Router();

// POST /api/prescriptions - Create new prescription
prescriptionRouter.post('/', createPrescription);

// GET /api/prescriptions/patient/:patientId - Get prescriptions for a patient
prescriptionRouter.get('/patient/:patientId', getPatientPrescriptions);

// GET /api/prescriptions/doctor/:doctorId - Get prescriptions for a doctor
prescriptionRouter.get('/doctor/:doctorId', getDoctorPrescriptions);

// PUT /api/prescriptions/:id - Update prescription
prescriptionRouter.put('/:id', updatePrescription);

// DELETE /api/prescriptions/:id - Delete prescription
prescriptionRouter.delete('/:id', deletePrescription);

export default prescriptionRouter;