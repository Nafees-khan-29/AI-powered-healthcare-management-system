import express from 'express';
import {
    createMedicalRecord,
    getPatientMedicalRecords,
    getDoctorMedicalRecords,
    updateMedicalRecord,
    deleteMedicalRecord
} from '../controllers/medicalRecordController.js';

const medicalRecordRouter = express.Router();

// POST /api/medical-records - Create new medical record
medicalRecordRouter.post('/', createMedicalRecord);

// GET /api/medical-records/patient/:patientId - Get medical records for a patient
medicalRecordRouter.get('/patient/:patientId', getPatientMedicalRecords);

// GET /api/medical-records/doctor/:doctorId - Get medical records for a doctor
medicalRecordRouter.get('/doctor/:doctorId', getDoctorMedicalRecords);

// PUT /api/medical-records/:id - Update medical record
medicalRecordRouter.put('/:id', updateMedicalRecord);

// DELETE /api/medical-records/:id - Delete medical record
medicalRecordRouter.delete('/:id', deleteMedicalRecord);

export default medicalRecordRouter;