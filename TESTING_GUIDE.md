# Testing Guide - Appointment System Integration

## Prerequisites

1. **Backend Running**
   ```powershell
   cd backend
   npm install
   node server.js
   ```
   Expected output: `Server running on port 3000` and `MongoDB Connected`

2. **Frontend Running**
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
   Expected output: Vite server running on `http://localhost:5173`

3. **Environment Variables**
   - Create `backend/.env` with MongoDB URI and email credentials
   - Reference: `backend/.env.example`

## Test Scenario 1: Book an Appointment (User)

### Steps:
1. **Navigate to Appointment Page**
   - Open browser: `http://localhost:5173/appointment`
   - Ensure you're logged in with Clerk

2. **Fill Patient Information (Step 1)**
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "+1234567890"
   - Age: 35
   - Gender: "Male"
   - Click "Next"

3. **Select Doctor (Step 2)**
   - Choose any doctor from the list
   - Note: Doctors should be pre-populated from backend
   - Click "Next"

4. **Choose Date & Time (Step 3)**
   - Select a future date
   - Choose time: "10:00 AM"
   - Click "Next"

5. **Enter Symptoms & Upload Files (Step 4)**
   - Symptoms: "Experiencing chest pain and shortness of breath"
   - Upload medical reports (optional): Select 1-5 files
   - Supported formats: JPEG, PNG, PDF, DOC, DOCX
   - Max size: 10MB per file
   - Click "Next"

6. **Review & Submit (Step 5)**
   - Review all information
   - Click "Confirm Booking"

### Expected Results:
✅ Success message shown
✅ Appointment ID displayed
✅ Email sent to patient (check inbox/spam)
✅ Form resets to step 1
✅ Appointment saved in database

### Check Database:
```javascript
// In MongoDB
db.appointments.find({ patientEmail: "john@example.com" })
```

## Test Scenario 2: View Appointment (User Dashboard)

### Steps:
1. **Navigate to Dashboard**
   - Go to: `http://localhost:5173/dashboard`
   - Ensure you're logged in with the same user who created the appointment

2. **Check Overview Section**
   - Look for "Next Appointment" card
   - Should show the newly created appointment with:
     - Doctor name
     - Specialization
     - Date and time
     - Location
     - Status: "pending" or "confirmed"

3. **Navigate to Appointments Tab**
   - Click on "Appointments" in the sidebar or tab
   - Should see the appointment in the list

4. **Verify Appointment Details**
   - Check: Doctor name ✅
   - Check: Specialization ✅
   - Check: Date ✅
   - Check: Time ✅
   - Check: Location ✅
   - Check: Status badge (pending/confirmed/completed) ✅

### Expected Results:
✅ Loading spinner shows initially
✅ Appointments load from backend
✅ All appointment details are correct
✅ Status badge shows correct status
✅ Action buttons visible (View, Cancel)

## Test Scenario 3: Cancel Appointment (User)

### Steps:
1. **In User Dashboard → Appointments**
   - Find the appointment you want to cancel
   - Should see status as "pending" or "confirmed"

2. **Click Cancel Button**
   - Click the "Cancel" button (trash icon or X icon)
   - Confirmation dialog should appear

3. **Confirm Cancellation**
   - Confirm the cancellation
   - Wait for API response

### Expected Results:
✅ Appointment removed from list
✅ Success message shown
✅ Appointment status changed to "cancelled" in database
✅ No errors in console

### Check Database:
```javascript
// In MongoDB
db.appointments.find({ patientEmail: "john@example.com", status: "cancelled" })
```

## Test Scenario 4: View Appointments (Doctor Dashboard)

### Steps:
1. **Login as Doctor**
   - Ensure your Clerk user has doctor role
   - Navigate to: `http://localhost:5173/dashboard`

2. **Check Doctor Dashboard**
   - Should see "Appointments" tab
   - Click on "Appointments"

3. **View Appointments Table**
   - Should see all appointments for this doctor
   - Columns: Patient, Date & Time, Type, Status, Priority, Actions

4. **Verify Appointment Data**
   - Patient name matches ✅
   - Date and time correct ✅
   - Status shows correctly ✅
   - Priority badge displays ✅

### Expected Results:
✅ Loading spinner shows initially
✅ Appointments load from backend
✅ Only this doctor's appointments are shown
✅ All appointment details are correct
✅ Action buttons visible

## Test Scenario 5: Update Appointment Status (Doctor)

### Steps:
1. **Find Pending Appointment**
   - In Doctor Dashboard → Appointments
   - Look for appointment with status "pending"

2. **Confirm Appointment**
   - Click the "Confirm" button (checkmark icon)
   - Should see confirmation request
   - Confirm the action

3. **Verify Status Update**
   - Status should change to "confirmed"
   - Status badge should update color
   - "Confirm" button should be replaced with "Mark as Completed" button

4. **Mark as Completed**
   - Click "Mark as Completed" button
   - Confirm the action
   - Status should change to "completed"

### Expected Results:
✅ Status updates immediately in UI
✅ No page refresh needed
✅ Success message shown
✅ Database updated correctly
✅ User dashboard reflects the change

### Check Database:
```javascript
// In MongoDB
db.appointments.find({ _id: ObjectId("appointment_id") })
// Should show status: "completed"
```

## Test Scenario 6: Error Handling

### Test Loading States:
1. **Slow Network Simulation**
   - Open browser DevTools → Network tab
   - Throttle to "Slow 3G"
   - Navigate to dashboard
   - **Expected**: Loading spinner appears while fetching

### Test Error States:
1. **Backend Offline**
   - Stop the backend server
   - Try to view appointments in dashboard
   - **Expected**: Error message displayed with "Try Again" button

2. **Invalid Data**
   - Try to create appointment with missing fields
   - **Expected**: Validation error messages

3. **File Upload Errors**
   - Try to upload file larger than 10MB
   - **Expected**: Error message about file size
   - Try to upload unsupported file type (.exe, .zip)
   - **Expected**: Error message about file type

### Test Empty States:
1. **No Appointments**
   - Login with a new user who has no appointments
   - Go to dashboard
   - **Expected**: Empty state message with "Book Appointment" button

## Test Scenario 7: File Uploads

### Steps:
1. **Create Appointment with Files**
   - Follow Test Scenario 1
   - In Step 4, upload medical reports:
     - File 1: test-report.pdf (< 10MB)
     - File 2: x-ray.jpg (< 10MB)
     - File 3: lab-results.png (< 10MB)

2. **Verify Upload**
   - Files should appear in upload preview
   - Each file should show name and size
   - Remove button should work

3. **Submit Appointment**
   - Complete the booking
   - Check backend `uploads/medical-reports/` folder
   - Files should be saved with unique names

### Expected Results:
✅ All files uploaded successfully
✅ Files visible in preview before submit
✅ Files saved in backend uploads folder
✅ File paths stored in database
✅ Can view files in appointment details

## Test Scenario 8: Email Notifications

### Steps:
1. **Create Appointment**
   - Follow Test Scenario 1
   - Use a real email address you can access

2. **Check Email**
   - Wait 1-2 minutes
   - Check inbox for confirmation email
   - Check spam folder if not in inbox

3. **Verify Email Content**
   - Subject: "Appointment Confirmation"
   - Contains: Patient name, doctor name, date, time, symptoms
   - Contains: Appointment ID
   - Professional HTML formatting

### Expected Results:
✅ Email received within 2 minutes
✅ All details correct
✅ HTML formatting works
✅ No errors in backend logs

### Troubleshooting Email:
- If email not received:
  1. Check backend console for email errors
  2. Verify EMAIL_USER and EMAIL_PASSWORD in .env
  3. Ensure Gmail "Less secure app access" is enabled OR use App Password
  4. Check spam folder

## Test Scenario 9: Real-Time Data Sync

### Steps:
1. **Open Two Browser Windows**
   - Window 1: User dashboard (logged in as patient)
   - Window 2: Doctor dashboard (logged in as doctor)

2. **Create Appointment**
   - In a third window, create a new appointment
   - Patient: Current logged-in user
   - Doctor: Current logged-in doctor

3. **Check User Dashboard**
   - Refresh Window 1 (user dashboard)
   - New appointment should appear

4. **Check Doctor Dashboard**
   - Refresh Window 2 (doctor dashboard)
   - New appointment should appear in doctor's list

5. **Update Status from Doctor Dashboard**
   - In Window 2, confirm the appointment
   - Status changes to "confirmed"

6. **Verify in User Dashboard**
   - Refresh Window 1
   - Status should show "confirmed"

### Expected Results:
✅ Appointment appears in both dashboards
✅ Data is consistent across dashboards
✅ Status updates reflect in both views
✅ No data discrepancies

## Performance Tests

### Test 1: Large Appointment List
1. Create 20+ appointments
2. Navigate to dashboard
3. **Expected**: Page loads within 2 seconds
4. **Expected**: Smooth scrolling and interaction

### Test 2: Multiple File Uploads
1. Upload 5 files (each ~5MB)
2. **Expected**: Upload completes within 10 seconds
3. **Expected**: Progress indication during upload
4. **Expected**: All files saved correctly

### Test 3: Search and Filter
1. Create appointments with different statuses
2. Use status filter dropdown
3. **Expected**: Instant filtering
4. Use search to find patient name
5. **Expected**: Results appear immediately

## Browser Compatibility

Test the application in:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)

## Mobile Responsiveness

Test on:
- ✅ Mobile (375px width)
- ✅ Tablet (768px width)
- ✅ Desktop (1024px+ width)

## Common Issues & Solutions

### Issue: Appointments not showing
**Solution**: 
- Check if user is logged in
- Verify user ID in Clerk matches database
- Check backend logs for errors
- Ensure MongoDB is connected

### Issue: File upload fails
**Solution**:
- Check file size (max 10MB)
- Verify file type is allowed
- Ensure backend uploads directory exists and is writable
- Check browser console for errors

### Issue: Email not sending
**Solution**:
- Verify email credentials in .env
- Use Gmail app-specific password
- Check backend console for email errors
- Test with nodemailer test account

### Issue: Status update doesn't work
**Solution**:
- Verify user has doctor role
- Check appointment ID is correct
- Ensure backend route is accessible
- Review network tab for API errors

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No broken UI elements
- ✅ All API calls return 200/201 status
- ✅ Data persists in database
- ✅ Email notifications sent
- ✅ File uploads work correctly
- ✅ Loading and error states display properly
- ✅ Real-time updates work across dashboards

---

**Happy Testing! 🧪**

If you find any issues, check:
1. Backend logs (server console)
2. Browser console (F12)
3. Network tab (F12)
4. MongoDB data (using MongoDB Compass or CLI)
