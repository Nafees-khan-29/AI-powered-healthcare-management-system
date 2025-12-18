import emergencyAlertModel from '../models/emergencyAlertModel.js';
import doctorModel from '../models/doctorModel.js';
import nodemailer from 'nodemailer';

// Email configuration with Brevo SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Verify transporter connection
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Send emergency email to doctor
const sendEmergencyEmail = async (alertData) => {
  try {
    const severityColors = {
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#dc2626'
    };

    const severityLabels = {
      low: 'Low Priority',
      medium: 'Medium Priority',
      high: 'High Priority ⚠️',
      critical: 'CRITICAL EMERGENCY 🚨'
    };

    const mailOptions = {
      from: `ProHealth Emergency <${process.env.SENDER_EMAIL}>`,
      to: alertData.doctorEmail || process.env.ADMIN_EMAIL,
      subject: `🚨 EMERGENCY ALERT: ${alertData.emergencyType.replace(/_/g, ' ').toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid ${severityColors[alertData.severity]}; border-radius: 10px;">
          <div style="background: ${severityColors[alertData.severity]}; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">🚨 EMERGENCY ALERT</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">${severityLabels[alertData.severity]}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1f2937; margin-top: 0;">Patient Information:</h2>
            <p style="margin: 8px 0;"><strong>Name:</strong> ${alertData.patientName}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${alertData.patientPhone}" style="color: #2563eb; text-decoration: none;">${alertData.patientPhone}</a></p>
            <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${alertData.patientEmail}" style="color: #2563eb; text-decoration: none;">${alertData.patientEmail}</a></p>
            ${alertData.location ? `<p style="margin: 8px 0;"><strong>Location:</strong> ${alertData.location}</p>` : ''}
          </div>
          
          <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <h2 style="color: #991b1b; margin-top: 0;">Emergency Details:</h2>
            <p style="margin: 8px 0;"><strong>Type:</strong> ${alertData.emergencyType.replace(/_/g, ' ').toUpperCase()}</p>
            <p style="margin: 8px 0;"><strong>Description:</strong></p>
            <p style="background: white; padding: 15px; border-radius: 6px; color: #1f2937; line-height: 1.6;">${alertData.description}</p>
            <p style="margin: 8px 0;"><strong>Alert Time:</strong> ${new Date(alertData.alertSentAt).toLocaleString()}</p>
          </div>
          
          ${alertData.currentVitals && (alertData.currentVitals.bloodPressure || alertData.currentVitals.heartRate || alertData.currentVitals.temperature || alertData.currentVitals.oxygenLevel) ? `
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e40af; margin-top: 0;">Current Vitals:</h2>
            ${alertData.currentVitals.bloodPressure ? `<p style="margin: 8px 0;"><strong>Blood Pressure:</strong> ${alertData.currentVitals.bloodPressure}</p>` : ''}
            ${alertData.currentVitals.heartRate ? `<p style="margin: 8px 0;"><strong>Heart Rate:</strong> ${alertData.currentVitals.heartRate}</p>` : ''}
            ${alertData.currentVitals.temperature ? `<p style="margin: 8px 0;"><strong>Temperature:</strong> ${alertData.currentVitals.temperature}</p>` : ''}
            ${alertData.currentVitals.oxygenLevel ? `<p style="margin: 8px 0;"><strong>Oxygen Level:</strong> ${alertData.currentVitals.oxygenLevel}</p>` : ''}
          </div>
          ` : ''}
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
            <p style="color: #dc2626; font-weight: bold; font-size: 16px; margin-bottom: 15px;">⚠️ IMMEDIATE ATTENTION REQUIRED</p>
            <p style="color: #6b7280; font-size: 14px;">Please respond to this emergency as soon as possible.</p>
            <p style="color: #6b7280; font-size: 14px;">Contact the patient immediately at: <strong>${alertData.patientPhone}</strong></p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px;">This is an automated emergency alert from ProHealth System</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Emergency email sent to:', alertData.doctorEmail);
  } catch (error) {
    console.error('❌ Error sending emergency email:', error.message);
    // Don't throw - email failure shouldn't stop alert creation
  }
};

// Create emergency alert
const createEmergencyAlert = async (req, res) => {
  try {
    const {
      patientId,
      patientEmail,
      patientName,
      patientPhone,
      doctorId,
      doctorEmail,
      doctorName,
      emergencyType,
      severity,
      description,
      location,
      currentVitals
    } = req.body;

    // Validate required fields
    if (!patientId || !patientEmail || !patientName || !patientPhone || !emergencyType || !description) {
      return res.status(400).json({
        success: false,
        message: 'Patient information, emergency type, and description are required'
      });
    }

    // If no specific doctor provided, find available doctors
    let targetDoctorEmail = doctorEmail;
    let targetDoctorId = doctorId;
    let targetDoctorName = doctorName;

    if (!doctorEmail) {
      // Get first available doctor or admin
      const availableDoctor = await doctorModel.findOne({ available: true });
      if (availableDoctor) {
        targetDoctorEmail = availableDoctor.email;
        targetDoctorId = availableDoctor._id.toString();
        targetDoctorName = availableDoctor.name;
      }
    }

    // Create emergency alert
    const alert = new emergencyAlertModel({
      patientId,
      patientEmail,
      patientName,
      patientPhone,
      doctorId: targetDoctorId,
      doctorEmail: targetDoctorEmail,
      doctorName: targetDoctorName,
      emergencyType,
      severity: severity || 'medium',
      description,
      location,
      currentVitals,
      status: 'pending',
      priority: severity === 'critical' ? 10 : severity === 'high' ? 8 : severity === 'medium' ? 5 : 3
    });

    await alert.save();

    console.log('✅ Emergency alert created:', alert._id);

    // Send email notification
    await sendEmergencyEmail({
      ...alert.toObject(),
      doctorEmail: targetDoctorEmail
    });

    res.status(201).json({
      success: true,
      message: 'Emergency alert sent successfully',
      alert: alert
    });
  } catch (error) {
    console.error('❌ Error creating emergency alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emergency alert',
      error: error.message
    });
  }
};

// Get patient's emergency alerts
const getPatientAlerts = async (req, res) => {
  try {
    const { patientId } = req.params;

    const alerts = await emergencyAlertModel
      .find({ patientId })
      .sort({ alertSentAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts: alerts
    });
  } catch (error) {
    console.error('❌ Error fetching patient alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
};

// Get doctor's emergency alerts
const getDoctorAlerts = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { status } = req.query;

    const query = {};
    
    // Show alerts assigned to this doctor OR unassigned alerts
    query.$or = [
      { doctorId: doctorId },
      { doctorId: { $exists: false } },
      { doctorId: null }
    ];

    if (status) {
      query.status = status;
    }

    const alerts = await emergencyAlertModel
      .find(query)
      .sort({ priority: -1, alertSentAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts: alerts
    });
  } catch (error) {
    console.error('❌ Error fetching doctor alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
};

// Acknowledge emergency alert
const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, doctorName } = req.body;

    const alert = await emergencyAlertModel.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.acknowledge(doctorId, doctorName);

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully',
      alert: alert
    });
  } catch (error) {
    console.error('❌ Error acknowledging alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert',
      error: error.message
    });
  }
};

// Respond to emergency alert
const respondToAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorId, response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    const alert = await emergencyAlertModel.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.respond(doctorId, response);

    res.status(200).json({
      success: true,
      message: 'Response sent successfully',
      alert: alert
    });
  } catch (error) {
    console.error('❌ Error responding to alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send response',
      error: error.message
    });
  }
};

// Resolve emergency alert
const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await emergencyAlertModel.findById(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.resolve();

    res.status(200).json({
      success: true,
      message: 'Alert resolved successfully',
      alert: alert
    });
  } catch (error) {
    console.error('❌ Error resolving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert',
      error: error.message
    });
  }
};

// Get all critical alerts (for admin/emergency dashboard)
const getCriticalAlerts = async (req, res) => {
  try {
    const alerts = await emergencyAlertModel.getCriticalAlerts();

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts: alerts
    });
  } catch (error) {
    console.error('❌ Error fetching critical alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch critical alerts',
      error: error.message
    });
  }
};

// Delete emergency alert
const deleteEmergencyAlert = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Attempting to delete alert:', id);

    const alert = await emergencyAlertModel.findByIdAndDelete(id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    console.log('✅ Alert deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Emergency alert deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert',
      error: error.message
    });
  }
};

// Send video call link to patient
const sendVideoCallLink = async (req, res) => {
  try {
    const { alertId, videoCallLink, doctorName } = req.body;

    console.log('📹 Sending video call link to patient:', { alertId, videoCallLink, doctorName });

    // Get alert details
    const alert = await emergencyAlertModel.findById(alertId);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Update alert with video call link FIRST (before email)
    alert.videoCallLink = videoCallLink;
    alert.videoCallInitiatedAt = new Date();
    await alert.save();
    
    console.log('✅ Video call link saved to database');

    // Send email to patient with video call link
    const mailOptions = {
      from: `ProHealth Video Call <${process.env.SENDER_EMAIL}>`,
      to: alert.patientEmail,
      subject: `🎥 Video Call Invitation from Dr. ${doctorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #10b981; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 28px;">🎥 Video Call Invitation</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Dr. ${doctorName} is ready to connect with you</p>
          </div>
          
          <div style="background-color: #f0fdf4; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h2 style="color: #065f46; margin-top: 0;">Dear ${alert.patientName},</h2>
            <p style="color: #064e3b; font-size: 16px; line-height: 1.6;">
              Dr. ${doctorName} has initiated a video call regarding your emergency alert: 
              <strong>${alert.emergencyType.replace(/_/g, ' ').toUpperCase()}</strong>
            </p>
            <p style="color: #064e3b; font-size: 16px; line-height: 1.6;">
              Click the button below to join the video call immediately:
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${videoCallLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                      color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; 
                      font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
              🎥 Join Video Call Now
            </a>
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Important:</strong> This link is valid for this session. 
              Please join as soon as possible. Dr. ${doctorName} is waiting for you.
            </p>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">📋 Before Joining:</h3>
            <ul style="color: #4b5563; line-height: 1.8; padding-left: 20px;">
              <li>Ensure you have a stable internet connection</li>
              <li>Allow camera and microphone permissions when prompted</li>
              <li>Find a quiet, well-lit place for the call</li>
              <li>Have your medical information ready to discuss</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 10px;">Or copy and paste this link in your browser:</p>
            <div style="background-color: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb; word-break: break-all;">
              <code style="color: #1f2937; font-size: 13px;">${videoCallLink}</code>
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 13px;">
            <p style="margin: 5px 0;">ProHealth Emergency Services</p>
            <p style="margin: 5px 0;">For assistance, contact: ${alert.patientPhone}</p>
            <p style="margin: 15px 0 5px 0; color: #9ca3af; font-size: 12px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `
    };

    // Try to send email, but don't fail if it errors
    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Video call link email sent successfully to:', alert.patientEmail);
    } catch (emailError) {
      console.log('⚠️ Email failed but link is saved:', emailError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Video call link saved successfully (email may have failed)',
      alert
    });
  } catch (error) {
    console.error('❌ Error sending video call link:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send video call link',
      error: error.message
    });
  }
};

export {
  createEmergencyAlert,
  getPatientAlerts,
  getDoctorAlerts,
  acknowledgeAlert,
  respondToAlert,
  resolveAlert,
  getCriticalAlerts,
  deleteEmergencyAlert,
  sendVideoCallLink
};
