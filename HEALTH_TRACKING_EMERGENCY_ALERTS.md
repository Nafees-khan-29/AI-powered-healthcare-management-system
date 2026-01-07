# Health Tracking & Emergency Alerts - Implementation Guide

## Overview
The User Dashboard has been enhanced with **dynamic health tracking** and **emergency alert functionality**. Health metrics are now fetched from the backend API in real-time, and patients can send emergency alerts to doctors with detailed information.

## New Features

### 1. Dynamic Health Tracking
- Health metrics are now loaded dynamically from the backend API
- Displays latest vitals: Blood Pressure, Heart Rate, Temperature, Oxygen Level
- Shows body metrics: Weight, Height, BMI
- Loading states for better user experience
- Graceful error handling with appropriate messages

### 2. Emergency Alert System
Patients can send emergency alerts with the following details:

#### Alert Information
- **Emergency Type**: 11 predefined types including:
  - Breathing Difficulty
  - Chest Pain
  - Severe Bleeding
  - Unconsciousness
  - Severe Allergic Reaction
  - Stroke Symptoms
  - Heart Attack
  - Severe Pain
  - High Fever
  - Seizure
  - Other Emergency

- **Severity Levels**:
  - Critical (Life-threatening) - Red priority
  - High (Urgent) - Orange priority
  - Medium (Important) - Yellow priority
  - Low (Non-urgent) - Blue priority

- **Required Fields**:
  - Emergency type
  - Severity level
  - Detailed description

- **Optional Fields**:
  - Current location
  - Current vitals (Blood Pressure, Heart Rate, Temperature, Oxygen Level)

#### Patient Information (Auto-filled)
The system automatically includes:
- Patient ID (from Clerk)
- Patient name
- Patient email
- Patient phone number

### 3. Emergency Alerts History
- Displays past emergency alerts
- Color-coded by severity level
- Shows status (Pending, Acknowledged, In Progress, Resolved)
- Displays timestamp and handling doctor information
- Shows the 5 most recent alerts

## How to Use

### For Patients

#### Sending an Emergency Alert:
1. Navigate to the "Health Tracking" tab in your dashboard
2. Click the red "Send Emergency Alert" button at the top
3. Fill in the emergency details:
   - Select emergency type
   - Choose severity level
   - Provide detailed description
   - Optionally add location and current vitals
4. Click "Send Emergency Alert"
5. A doctor will be notified immediately via email

#### Viewing Emergency Alert Status:
1. Go to the "Health Tracking" tab
2. Scroll down to "Emergency Alerts History"
3. View your past alerts with their status and doctor responses

#### Example Alert (As shown in your request):
```
Emergency Type: BREATHING DIFFICULTY
Severity: CRITICAL PRIORITY
Status: Acknowledged
Date: 12/14/2025, 7:50:44 PM

Patient Information:
Name: nafees_ khan_29
Phone: 9480717816
Email: nafeeskhan7627@gmail.com

Description:
deded
```

### For Doctors

Doctors will receive:
- Email notification with full alert details
- Patient contact information
- Emergency type and severity
- Patient's current vitals (if provided)
- Ability to acknowledge and respond through their dashboard

## Technical Implementation

### Frontend Changes
**File**: `frontend/src/components/Dashboard/User/UserDashboard.jsx`

#### New Imports:
```javascript
import { getUserHealthMetrics, getLatestHealthMetrics, addHealthMetric } from '../../../services/healthMetricService';
import { createEmergencyAlert, getPatientAlerts } from '../../../services/emergencyAlertService';
import { FaAmbulance } from 'react-icons/fa';
```

#### New State Variables:
- `healthMetrics` - Dynamic health data
- `isLoadingHealthMetrics` - Loading state
- `healthMetricsHistory` - Historical metrics
- `emergencyAlerts` - List of patient's alerts
- `isLoadingAlerts` - Alert loading state
- `showEmergencyModal` - Modal visibility
- `emergencyFormData` - Form data for new alerts
- `isSendingAlert` - Sending state

#### New Functions:
- `fetchHealthMetrics()` - Fetches latest health metrics
- `fetchEmergencyAlerts()` - Fetches patient's alert history
- `handleEmergencyFormChange()` - Handles form input changes
- `handleSendEmergencyAlert()` - Sends emergency alert to backend

### Backend API Endpoints Used

#### Health Metrics:
- `GET /api/health-metrics/user/:userId/latest` - Get latest metrics
- `GET /api/health-metrics/user/:userId` - Get metrics history
- `POST /api/health-metrics/add` - Add new metrics

#### Emergency Alerts:
- `POST /api/emergency-alerts/create` - Create new alert
- `GET /api/emergency-alerts/patient/:patientId` - Get patient's alerts
- `PATCH /api/emergency-alerts/:id/acknowledge` - Doctor acknowledges alert
- `PATCH /api/emergency-alerts/:id/respond` - Doctor responds to alert
- `PATCH /api/emergency-alerts/:id/resolve` - Resolve alert

## UI Components

### Emergency Alert Button
- Prominent red banner at the top of Health Tracking tab
- Large, attention-grabbing design
- Clear call-to-action

### Emergency Alert Modal
- Comprehensive form with all necessary fields
- Validation for required fields
- Real-time feedback during submission
- Success/error notifications

### Alerts History Section
- Color-coded severity badges
- Status indicators
- Chronological listing
- Doctor response information

## Data Flow

1. **Patient sends alert** → Frontend validates data
2. **API call made** → Backend creates alert record
3. **Email sent** → Doctor receives notification
4. **Alert stored** → MongoDB saves alert with status "pending"
5. **Doctor responds** → Status updates to "acknowledged" → "in_progress" → "resolved"
6. **Patient sees updates** → Real-time status changes in history

## Color Coding

### Severity Levels:
- **Critical**: Red (#dc2626)
- **High**: Orange (#f59e0b)
- **Medium**: Yellow (#eab308)
- **Low**: Blue (#3b82f6)

### Status Colors:
- **Pending**: Gray
- **Acknowledged**: Yellow
- **In Progress**: Blue
- **Resolved**: Green

## Security & Privacy
- Patient information auto-filled from authenticated session
- Alerts only visible to patient and assigned doctors
- Secure API endpoints
- Email notifications use SMTP (Brevo)

## Future Enhancements
- Real-time notifications using WebSockets
- Video call integration for emergency consultations
- Geolocation services for ambulance dispatch
- Voice-to-text for emergency descriptions
- Integration with wearable devices for automatic vitals

## Testing

### Test Scenarios:
1. ✅ Send critical emergency alert
2. ✅ View alert history
3. ✅ Load dynamic health metrics
4. ✅ Handle API errors gracefully
5. ✅ Modal open/close functionality
6. ✅ Form validation

## Support
For issues or questions, check the backend logs and frontend console for error messages.

---
**Last Updated**: December 18, 2025
**Version**: 2.0
