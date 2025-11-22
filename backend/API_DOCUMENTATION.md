# 🏥 Healthcare Appointment System - API Documentation

## 📋 Table of Contents
- [Doctor Routes](#doctor-routes)
- [Appointment Routes](#appointment-routes)
- [File Upload](#file-upload)
- [Email Notifications](#email-notifications)
- [Setup Instructions](#setup-instructions)

---

## 🩺 Doctor Routes

### Base URL: `/api/doctors`

### 1. Get All Doctors
```http
GET /api/doctors
```

**Query Parameters:**
- `specialization` (optional): Filter by specialization
- `available` (optional): Filter by availability (true/false)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "doctors": [
    {
      "_id": "doctor_id",
      "name": "Dr. Emily Thompson",
      "email": "emily@hospital.com",
      "specialization": "Cardiology",
      "degree": "MBBS, MD - Cardiology",
      "experience": "12 years",
      "fees": 200,
      "available": true,
      "rating": 4.5,
      "phone": "+1-555-0123"
    }
  ]
}
```

---

### 2. Get Doctor by ID
```http
GET /api/doctors/:id
```

**Response:**
```json
{
  "success": true,
  "doctor": {
    "_id": "doctor_id",
    "name": "Dr. Emily Thompson",
    "email": "emily@hospital.com",
    "specialization": "Cardiology",
    "fees": 200
  }
}
```

---

### 3. Add New Doctor (Admin Only)
```http
POST /api/doctors/add
```

**Request Body:**
```json
{
  "name": "Dr. Emily Thompson",
  "email": "emily@hospital.com",
  "password": "secure123",
  "specialization": "Cardiology",
  "degree": "MBBS, MD - Cardiology",
  "experience": "12 years",
  "fees": 200,
  "address": "City Hospital, 123 Medical Street",
  "phone": "+1-555-0123",
  "education": "Harvard Medical School",
  "availability": "Mon-Fri: 9AM-5PM",
  "image": "/doctors/emily-thompson.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor added successfully",
  "doctor": {
    "id": "doctor_id",
    "name": "Dr. Emily Thompson",
    "email": "emily@hospital.com",
    "specialization": "Cardiology"
  }
}
```

---

### 4. Update Doctor Information
```http
PUT /api/doctors/:id
```

**Request Body:**
```json
{
  "fees": 250,
  "availability": "Mon-Sat: 8AM-6PM",
  "phone": "+1-555-9999"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor updated successfully",
  "doctor": { /* updated doctor object */ }
}
```

---

### 5. Delete Doctor
```http
DELETE /api/doctors/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Doctor deleted successfully",
  "doctor": {
    "id": "doctor_id",
    "name": "Dr. Emily Thompson"
  }
}
```

---

## 📅 Appointment Routes

### Base URL: `/api/appointments`

### 1. Create New Appointment
```http
POST /api/appointments/create
```

**Content-Type:** `multipart/form-data` (if uploading files) or `application/json`

**Request Body:**
```json
{
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "+1-555-9876",
  "patientAge": 35,
  "patientGender": "male",
  "doctorId": "doctor_id_here",
  "doctorName": "Dr. Emily Thompson",
  "doctorSpecialization": "Cardiology",
  "appointmentDate": "2025-11-15",
  "appointmentTime": "10:00 AM",
  "symptoms": "Chest pain and shortness of breath",
  "additionalNotes": "Has family history of heart disease",
  "emergencyContact": "+1-555-5555",
  "insuranceProvider": "Blue Cross",
  "previousConditions": "Hypertension",
  "clerkUserId": "user_clerk_id"
}
```

**With Files (using FormData):**
```javascript
const formData = new FormData();
formData.append('patientName', 'John Doe');
formData.append('patientEmail', 'john@example.com');
// ... other fields
formData.append('medicalReports', file1);
formData.append('medicalReports', file2);
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment created successfully! Confirmation email sent.",
  "appointment": {
    "_id": "appointment_id",
    "patientName": "John Doe",
    "doctorName": "Dr. Emily Thompson",
    "appointmentDate": "2025-11-15",
    "appointmentTime": "10:00 AM",
    "status": "confirmed",
    "medicalReports": [
      {
        "filename": "report-123456.pdf",
        "path": "/uploads/medical-reports/report-123456.pdf"
      }
    ]
  }
}
```

---

### 2. Get User's Appointments
```http
GET /api/appointments/user/:userId
```

**Parameters:**
- `userId`: Can be Clerk User ID, MongoDB User ID, or email

**Response:**
```json
{
  "success": true,
  "count": 3,
  "appointments": [
    {
      "_id": "appointment_id",
      "patientName": "John Doe",
      "doctorName": "Dr. Emily Thompson",
      "appointmentDate": "2025-11-15",
      "appointmentTime": "10:00 AM",
      "status": "confirmed"
    }
  ]
}
```

---

### 3. Get Doctor's Appointments
```http
GET /api/appointments/doctor/:doctorId
```

**Query Parameters:**
- `status` (optional): Filter by status (pending, confirmed, completed, cancelled)
- `date` (optional): Filter by specific date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "appointments": [
    {
      "_id": "appointment_id",
      "patientName": "John Doe",
      "patientPhone": "+1-555-9876",
      "appointmentDate": "2025-11-15",
      "appointmentTime": "10:00 AM",
      "symptoms": "Chest pain",
      "status": "confirmed"
    }
  ]
}
```

---

### 4. Update Appointment Status
```http
PUT /api/appointments/:id/status
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid Statuses:**
- `pending`
- `confirmed`
- `completed`
- `cancelled`
- `rescheduled`

**Response:**
```json
{
  "success": true,
  "message": "Appointment status updated successfully",
  "appointment": { /* updated appointment */ }
}
```

---

### 5. Cancel Appointment
```http
DELETE /api/appointments/:id
```

**Request Body:**
```json
{
  "cancellationReason": "Patient requested cancellation"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully",
  "appointment": {
    "status": "cancelled",
    "cancellationReason": "Patient requested cancellation",
    "cancelledAt": "2025-11-10T10:30:00.000Z"
  }
}
```

---

### 6. Get All Appointments (Admin)
```http
GET /api/appointments
```

**Query Parameters:**
- `status` (optional)
- `doctorId` (optional)
- `date` (optional)

**Response:**
```json
{
  "success": true,
  "count": 25,
  "appointments": [ /* array of appointments */ ]
}
```

---

## 📤 File Upload

### Configuration
- **Middleware:** Multer
- **Storage:** Local filesystem (`/uploads/medical-reports`)
- **Max Files:** 5 per request
- **Max Size:** 10MB per file
- **Allowed Types:** JPEG, PNG, PDF, DOC, DOCX

### File Upload Example (Frontend)
```javascript
import { createAppointment } from './services/appointmentService';

const handleSubmit = async (formData, files) => {
  try {
    const result = await createAppointment(formData, files);
    console.log('Appointment created:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Accessing Uploaded Files
Files are accessible via:
```
http://localhost:3000/uploads/medical-reports/filename.pdf
```

---

## 📧 Email Notifications

### Configuration
Appointment confirmation emails are sent automatically when an appointment is created.

### Setup Gmail (Recommended)

1. **Enable 2-Step Verification:**
   - Go to your Google Account settings
   - Security → 2-Step Verification

2. **Generate App Password:**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Add to `.env` file:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   EMAIL_SERVICE=gmail
   ```

### Email Template
The confirmation email includes:
- ✅ Appointment confirmation message
- 👨‍⚕️ Doctor name and specialization
- 📅 Date and time
- 👤 Patient information
- 📋 Important instructions

### Email Example
```
Subject: Appointment Confirmed - ProHealth

✅ Appointment Confirmed!

Appointment Details:
Doctor: Dr. Emily Thompson
Specialization: Cardiology
Date: November 15, 2025
Time: 10:00 AM

Patient Information:
Name: John Doe
Email: john@example.com
Phone: +1-555-9876

📋 Important: Please arrive 10 minutes before your scheduled time.
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install nodemailer
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
PORT=3000
```

### 3. Start the Server
```bash
npm start
```

### 4. Test the APIs
```bash
node test-appointments.js
```

---

## 📊 Test Script

The `test-appointments.js` script tests all endpoints:

```bash
node test-appointments.js
```

**Tests include:**
1. ✅ Add Doctor
2. ✅ Get All Doctors
3. ✅ Get Doctor by ID
4. ✅ Create Appointment (with email)
5. ✅ Get User Appointments
6. ✅ Get Doctor Appointments
7. ✅ Update Appointment Status
8. ✅ Update Doctor Info
9. ✅ Cancel Appointment
10. ✅ Delete Doctor

---

## 🔒 Security Notes

- Passwords are hashed using bcrypt
- Email and password updates are restricted
- File uploads are validated (type and size)
- Uploaded files are stored securely
- Email credentials should never be committed to Git

---

## 📝 Frontend Integration

### Example: Create Appointment
```javascript
import { createAppointment } from './services/appointmentService';
import { useUser } from '@clerk/clerk-react';

const AppointmentForm = () => {
  const { user } = useUser();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const appointmentData = {
      patientName: formData.name,
      patientEmail: formData.email,
      patientPhone: formData.phone,
      patientAge: parseInt(formData.age),
      patientGender: formData.gender,
      doctorId: selectedDoctor._id,
      doctorName: selectedDoctor.name,
      doctorSpecialization: selectedDoctor.specialization,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      symptoms: formData.symptoms,
      clerkUserId: user?.id
    };
    
    try {
      const result = await createAppointment(appointmentData, uploadedFiles);
      alert('Appointment booked successfully! Check your email for confirmation.');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };
};
```

---

## 🎉 You're All Set!

Your appointment system is now fully functional with:
- ✅ Doctor management
- ✅ Appointment booking
- ✅ File uploads
- ✅ Email notifications
- ✅ Status management

For questions or issues, check the test script output or server logs.
