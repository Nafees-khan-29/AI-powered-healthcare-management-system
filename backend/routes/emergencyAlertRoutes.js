import express from 'express';
import {
  createEmergencyAlert,
  getPatientAlerts,
  getDoctorAlerts,
  acknowledgeAlert,
  respondToAlert,
  resolveAlert,
  getCriticalAlerts,
  deleteEmergencyAlert,
  sendVideoCallLink
} from '../controllers/emergencyAlertController.js';

const router = express.Router();

// Create emergency alert
router.post('/create', createEmergencyAlert);

// Get patient's alerts
router.get('/patient/:patientId', getPatientAlerts);

// Get doctor's alerts
router.get('/doctor/:doctorId', getDoctorAlerts);

// Get all critical alerts
router.get('/critical', getCriticalAlerts);

// Acknowledge alert
router.patch('/:id/acknowledge', acknowledgeAlert);

// Respond to alert
router.patch('/:id/respond', respondToAlert);

// Resolve alert
router.patch('/:id/resolve', resolveAlert);

// Send video call link to patient
router.post('/send-video-link', sendVideoCallLink);

// Delete alert
router.delete('/:id', deleteEmergencyAlert);

export default router;
