// Email notification templates for healthcare management system

/**
 * Base email template wrapper
 */
const baseEmailTemplate = (content, title = 'Healthcare Management System') => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .email-header h1 {
          font-size: 24px;
          margin-bottom: 5px;
        }
        .email-header p {
          font-size: 14px;
          opacity: 0.9;
        }
        .email-body {
          padding: 30px 20px;
        }
        .priority-banner {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-weight: bold;
          text-align: center;
        }
        .priority-urgent {
          background-color: #fee2e2;
          color: #991b1b;
          border-left: 4px solid #dc2626;
        }
        .priority-high {
          background-color: #fef3c7;
          color: #92400e;
          border-left: 4px solid #f59e0b;
        }
        .priority-normal {
          background-color: #dbeafe;
          color: #1e40af;
          border-left: 4px solid #3b82f6;
        }
        .info-card {
          background-color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #2563eb;
        }
        .info-card h3 {
          color: #1f2937;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .info-row {
          display: flex;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #6b7280;
          min-width: 140px;
        }
        .info-value {
          color: #111827;
        }
        .alert-box {
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .alert-info {
          background-color: #dbeafe;
          border-left: 4px solid #3b82f6;
          color: #1e40af;
        }
        .alert-warning {
          background-color: #fef3c7;
          border-left: 4px solid #f59e0b;
          color: #92400e;
        }
        .alert-success {
          background-color: #d1fae5;
          border-left: 4px solid #10b981;
          color: #065f46;
        }
        .btn-primary {
          display: inline-block;
          background-color: #2563eb;
          color: white !important;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
          font-weight: 600;
          text-align: center;
        }
        .btn-primary:hover {
          background-color: #1d4ed8;
        }
        .email-footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
        }
        .email-footer p {
          color: #6b7280;
          font-size: 13px;
          margin: 5px 0;
        }
        .icon {
          display: inline-block;
          margin-right: 8px;
        }
        @media only screen and (max-width: 600px) {
          .email-container {
            margin: 10px;
          }
          .email-body {
            padding: 20px 15px;
          }
          .info-row {
            flex-direction: column;
          }
          .info-label {
            margin-bottom: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>🏥 ${title}</h1>
          <p>Healthcare Management System</p>
        </div>
        <div class="email-body">
          ${content}
        </div>
        <div class="email-footer">
          <p><strong>Healthcare Management System</strong></p>
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>© ${new Date().getFullYear()} Healthcare Management System. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Appointment Confirmation Email
 */
exports.appointmentConfirmationTemplate = (data) => {
  const content = `
    <div class="priority-banner priority-success">
      ✅ Appointment Confirmed Successfully!
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Dear <strong>${data.patientName}</strong>,
    </p>

    <p style="margin-bottom: 20px;">
      Your appointment has been successfully confirmed. Please find the details below:
    </p>

    <div class="info-card">
      <h3>📋 Appointment Details</h3>
      <div class="info-row">
        <span class="info-label">Doctor:</span>
        <span class="info-value">Dr. ${data.doctorName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Specialization:</span>
        <span class="info-value">${data.doctorSpecialization}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${data.appointmentDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time:</span>
        <span class="info-value">${data.appointmentTime}</span>
      </div>
      ${data.symptoms ? `
      <div class="info-row">
        <span class="info-label">Reason:</span>
        <span class="info-value">${data.symptoms}</span>
      </div>
      ` : ''}
    </div>

    <div class="alert-box alert-warning">
      <strong>⚠️ Important Reminders:</strong>
      <ul style="margin: 10px 0 0 20px;">
        <li>Please arrive 10 minutes before your scheduled time</li>
        <li>Bring a valid ID and insurance card</li>
        <li>Bring any relevant medical records or test results</li>
        <li>To cancel or reschedule, please notify us at least 24 hours in advance</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/dashboard/appointments" class="btn-primary">
        View Appointment Details
      </a>
    </div>

    <p style="margin-top: 20px;">
      If you have any questions, please don't hesitate to contact us.
    </p>
  `;

  return baseEmailTemplate(content, 'Appointment Confirmed');
};

/**
 * Appointment Reminder Email
 */
exports.appointmentReminderTemplate = (data, timeframe) => {
  const priorityClass = timeframe === '30 minutes' ? 'priority-urgent' : 
                        timeframe === '2 hours' ? 'priority-high' : 'priority-normal';

  const content = `
    <div class="priority-banner ${priorityClass}">
      ⏰ Appointment Reminder - ${timeframe} away
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Dear <strong>${data.patientName}</strong>,
    </p>

    <p style="margin-bottom: 20px;">
      This is a friendly reminder that your appointment is coming up in <strong>${timeframe}</strong>.
    </p>

    <div class="info-card">
      <h3>📅 Appointment Details</h3>
      <div class="info-row">
        <span class="info-label">Doctor:</span>
        <span class="info-value">Dr. ${data.doctorName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Specialization:</span>
        <span class="info-value">${data.doctorSpecialization}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${data.appointmentDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time:</span>
        <span class="info-value">${data.appointmentTime}</span>
      </div>
    </div>

    ${timeframe === '30 minutes' ? `
      <div class="alert-box alert-warning">
        <strong>🚨 Your appointment is very soon!</strong>
        <p style="margin-top: 10px;">Please make sure you're on your way to the clinic.</p>
      </div>
    ` : `
      <div class="alert-box alert-info">
        <strong>📝 Preparation Checklist:</strong>
        <ul style="margin: 10px 0 0 20px;">
          <li>Review any symptoms or questions you want to discuss</li>
          <li>Gather your medical records and insurance information</li>
          <li>Plan to arrive 10 minutes early</li>
        </ul>
      </div>
    `}

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/dashboard/appointments" class="btn-primary">
        View Details
      </a>
    </div>
  `;

  return baseEmailTemplate(content, 'Appointment Reminder');
};

/**
 * Appointment Cancellation Email
 */
exports.appointmentCancellationTemplate = (data, reason) => {
  const content = `
    <div class="priority-banner priority-high">
      ❌ Appointment Cancelled
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Dear <strong>${data.patientName}</strong>,
    </p>

    <p style="margin-bottom: 20px;">
      Your appointment has been cancelled as requested.
    </p>

    <div class="info-card">
      <h3>📋 Cancelled Appointment Details</h3>
      <div class="info-row">
        <span class="info-label">Doctor:</span>
        <span class="info-value">Dr. ${data.doctorName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${data.appointmentDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time:</span>
        <span class="info-value">${data.appointmentTime}</span>
      </div>
      ${reason ? `
      <div class="info-row">
        <span class="info-label">Reason:</span>
        <span class="info-value">${reason}</span>
      </div>
      ` : ''}
    </div>

    <div class="alert-box alert-info">
      <strong>💡 Need to reschedule?</strong>
      <p style="margin-top: 10px;">
        You can book a new appointment anytime through your dashboard.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/appointment" class="btn-primary">
        Book New Appointment
      </a>
    </div>
  `;

  return baseEmailTemplate(content, 'Appointment Cancelled');
};

/**
 * Appointment Rescheduled Email
 */
exports.appointmentRescheduledTemplate = (oldData, newData) => {
  const content = `
    <div class="priority-banner priority-normal">
      🔄 Appointment Rescheduled
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Dear <strong>${newData.patientName}</strong>,
    </p>

    <p style="margin-bottom: 20px;">
      Your appointment has been successfully rescheduled.
    </p>

    <div class="info-card" style="background-color: #fee2e2; border-left-color: #ef4444;">
      <h3>❌ Previous Appointment</h3>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${oldData.appointmentDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time:</span>
        <span class="info-value">${oldData.appointmentTime}</span>
      </div>
    </div>

    <div class="info-card" style="background-color: #d1fae5; border-left-color: #10b981;">
      <h3>✅ New Appointment</h3>
      <div class="info-row">
        <span class="info-label">Doctor:</span>
        <span class="info-value">Dr. ${newData.doctorName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${newData.appointmentDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time:</span>
        <span class="info-value">${newData.appointmentTime}</span>
      </div>
    </div>

    <div class="alert-box alert-info">
      <strong>📝 Note:</strong>
      <p style="margin-top: 10px;">
        You will receive reminder notifications before your new appointment.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/dashboard/appointments" class="btn-primary">
        View Details
      </a>
    </div>
  `;

  return baseEmailTemplate(content, 'Appointment Rescheduled');
};

/**
 * Medical Report Ready Email
 */
exports.medicalReportReadyTemplate = (data) => {
  const content = `
    <div class="priority-banner priority-success">
      📄 Medical Report Available
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Dear <strong>${data.patientName}</strong>,
    </p>

    <p style="margin-bottom: 20px;">
      Your medical report from your recent appointment is now available.
    </p>

    <div class="info-card">
      <h3>📋 Report Details</h3>
      <div class="info-row">
        <span class="info-label">Doctor:</span>
        <span class="info-value">Dr. ${data.doctorName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Appointment Date:</span>
        <span class="info-value">${data.appointmentDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Diagnosis:</span>
        <span class="info-value">${data.diagnosis}</span>
      </div>
    </div>

    <div class="alert-box alert-info">
      <strong>💡 Important:</strong>
      <p style="margin-top: 10px;">
        Please review your medical report carefully. If you have any questions or concerns about the diagnosis or treatment plan, contact your doctor.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/dashboard/medical-records" class="btn-primary">
        View Medical Report
      </a>
    </div>
  `;

  return baseEmailTemplate(content, 'Medical Report Ready');
};

/**
 * New Prescription Email
 */
exports.newPrescriptionTemplate = (data) => {
  const content = `
    <div class="priority-banner priority-normal">
      💊 New Prescription Available
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Dear <strong>${data.patientName}</strong>,
    </p>

    <p style="margin-bottom: 20px;">
      Dr. ${data.doctorName} has prescribed a new medication for you.
    </p>

    <div class="info-card">
      <h3>💊 Prescription Details</h3>
      <div class="info-row">
        <span class="info-label">Medication:</span>
        <span class="info-value">${data.medication}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Dosage:</span>
        <span class="info-value">${data.dosage}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Duration:</span>
        <span class="info-value">${data.duration}</span>
      </div>
      ${data.instructions ? `
      <div class="info-row">
        <span class="info-label">Instructions:</span>
        <span class="info-value">${data.instructions}</span>
      </div>
      ` : ''}
    </div>

    <div class="alert-box alert-warning">
      <strong>⚠️ Important Instructions:</strong>
      <ul style="margin: 10px 0 0 20px;">
        <li>Take medication exactly as prescribed</li>
        <li>Complete the full course of treatment</li>
        <li>Report any side effects to your doctor immediately</li>
        <li>Do not share your medication with others</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/dashboard/prescriptions" class="btn-primary">
        View Prescription
      </a>
    </div>
  `;

  return baseEmailTemplate(content, 'New Prescription');
};

/**
 * Doctor Appointment Reminder
 */
exports.doctorAppointmentReminderTemplate = (data, timeframe) => {
  const priorityClass = timeframe === '30 minutes' ? 'priority-urgent' : 
                        timeframe === '2 hours' ? 'priority-high' : 'priority-normal';

  const content = `
    <div class="priority-banner ${priorityClass}">
      ⏰ Upcoming Patient Appointment - ${timeframe}
    </div>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Dear <strong>Dr. ${data.doctorName}</strong>,
    </p>

    <p style="margin-bottom: 20px;">
      You have an appointment with a patient in <strong>${timeframe}</strong>.
    </p>

    <div class="info-card">
      <h3>📅 Appointment Details</h3>
      <div class="info-row">
        <span class="info-label">Patient:</span>
        <span class="info-value">${data.patientName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span class="info-value">${data.appointmentDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Time:</span>
        <span class="info-value">${data.appointmentTime}</span>
      </div>
      ${data.symptoms ? `
      <div class="info-row">
        <span class="info-label">Chief Complaint:</span>
        <span class="info-value">${data.symptoms}</span>
      </div>
      ` : ''}
    </div>

    <div class="alert-box alert-info">
      <strong>📝 Preparation:</strong>
      <p style="margin-top: 10px;">
        Please review the patient's medical history before the appointment.
      </p>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL}/doctor-dashboard" class="btn-primary">
        View Patient Details
      </a>
    </div>
  `;

  return baseEmailTemplate(content, 'Patient Appointment Reminder');
};
