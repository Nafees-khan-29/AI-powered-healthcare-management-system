import express from 'express';
import {
  addHealthMetric,
  getUserHealthMetrics,
  getLatestHealthMetrics,
  updateHealthMetric,
  deleteHealthMetric,
  getHealthTrends
} from '../controllers/healthMetricController.js';

const router = express.Router();

// Add new health metric
router.post('/add', addHealthMetric);

// Get user's health metrics
router.get('/user/:userId', getUserHealthMetrics);

// Get latest health metrics for dashboard
router.get('/user/:userId/latest', getLatestHealthMetrics);

// Get health trends
router.get('/user/:userId/trends', getHealthTrends);

// Update health metric
router.put('/:id', updateHealthMetric);

// Delete health metric
router.delete('/:id', deleteHealthMetric);

export default router;
