import healthMetricModel from '../models/healthMetricModel.js';

// Add new health metric
const addHealthMetric = async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      temperature,
      oxygenSaturation,
      weight,
      height,
      bloodSugar,
      bloodSugarType,
      cholesterol,
      notes,
      source
    } = req.body;

    // Validate required fields
    if (!userId || !userEmail || !userName) {
      return res.status(400).json({
        success: false,
        message: 'User information is required'
      });
    }

    // Create new health metric
    const healthMetric = new healthMetricModel({
      userId,
      userEmail,
      userName,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      temperature,
      oxygenSaturation,
      weight,
      height,
      bloodSugar,
      bloodSugarType,
      cholesterol,
      notes,
      source: source || 'manual',
      recordedAt: new Date()
    });

    await healthMetric.save();

    console.log('✅ Health metric added successfully:', healthMetric._id);

    res.status(201).json({
      success: true,
      message: 'Health metric added successfully',
      metric: healthMetric
    });
  } catch (error) {
    console.error('❌ Error adding health metric:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add health metric',
      error: error.message
    });
  }
};

// Get user's health metrics
const getUserHealthMetrics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30, startDate, endDate } = req.query;

    const query = { userId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.recordedAt = {};
      if (startDate) query.recordedAt.$gte = new Date(startDate);
      if (endDate) query.recordedAt.$lte = new Date(endDate);
    }

    const metrics = await healthMetricModel
      .find(query)
      .sort({ recordedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: metrics.length,
      metrics: metrics
    });
  } catch (error) {
    console.error('❌ Error fetching health metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health metrics',
      error: error.message
    });
  }
};

// Get latest health metrics for dashboard
const getLatestHealthMetrics = async (req, res) => {
  try {
    const { userId } = req.params;

    const latestMetric = await healthMetricModel
      .findOne({ userId })
      .sort({ recordedAt: -1 });

    if (!latestMetric) {
      return res.status(200).json({
        success: true,
        message: 'No health metrics found',
        metrics: null
      });
    }

    res.status(200).json({
      success: true,
      metrics: latestMetric
    });
  } catch (error) {
    console.error('❌ Error fetching latest metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch latest metrics',
      error: error.message
    });
  }
};

// Update health metric
const updateHealthMetric = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedMetric = await healthMetricModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedMetric) {
      return res.status(404).json({
        success: false,
        message: 'Health metric not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Health metric updated successfully',
      metric: updatedMetric
    });
  } catch (error) {
    console.error('❌ Error updating health metric:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health metric',
      error: error.message
    });
  }
};

// Delete health metric
const deleteHealthMetric = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMetric = await healthMetricModel.findByIdAndDelete(id);

    if (!deletedMetric) {
      return res.status(404).json({
        success: false,
        message: 'Health metric not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Health metric deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting health metric:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete health metric',
      error: error.message
    });
  }
};

// Get health trends (aggregated data)
const getHealthTrends = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const metrics = await healthMetricModel
      .find({
        userId,
        recordedAt: { $gte: startDate }
      })
      .sort({ recordedAt: 1 });

    // Format data for charts
    const trends = {
      bloodPressure: metrics
        .filter(m => m.bloodPressureSystolic && m.bloodPressureDiastolic)
        .map(m => ({
          date: m.recordedAt,
          systolic: m.bloodPressureSystolic,
          diastolic: m.bloodPressureDiastolic
        })),
      heartRate: metrics
        .filter(m => m.heartRate)
        .map(m => ({
          date: m.recordedAt,
          value: m.heartRate
        })),
      weight: metrics
        .filter(m => m.weight)
        .map(m => ({
          date: m.recordedAt,
          value: m.weight
        })),
      temperature: metrics
        .filter(m => m.temperature)
        .map(m => ({
          date: m.recordedAt,
          value: m.temperature
        })),
      bloodSugar: metrics
        .filter(m => m.bloodSugar)
        .map(m => ({
          date: m.recordedAt,
          value: m.bloodSugar,
          type: m.bloodSugarType
        }))
    };

    res.status(200).json({
      success: true,
      trends: trends,
      totalRecords: metrics.length
    });
  } catch (error) {
    console.error('❌ Error fetching health trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health trends',
      error: error.message
    });
  }
};

export {
  addHealthMetric,
  getUserHealthMetrics,
  getLatestHealthMetrics,
  updateHealthMetric,
  deleteHealthMetric,
  getHealthTrends
};
