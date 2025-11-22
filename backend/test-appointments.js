/**
 * Test Script for Doctor and Appointment APIs
 * 
 * Before running:
 * 1. Make sure backend server is running: npm start
 * 2. Update BASE_URL if server is on different port
 * 3. Set up email credentials in .env (optional for email testing)
 * 
 * Run: node test-appointments.js
 */

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testDoctor = {
    name: 'Dr. Emily Thompson',
    email: 'emily.thompson@hospital.com',
    password: 'secure123',
    specialization: 'Cardiology',
    degree: 'MBBS, MD - Cardiology',
    experience: '12 years',
    fees: 200,
    address: 'City Hospital, 123 Medical Street',
    phone: '+1-555-0123',
    education: 'Harvard Medical School',
    availability: 'Mon-Fri: 9AM-5PM',
    image: '/doctors/emily-thompson.jpg'
};

const testAppointment = {
    patientName: 'John Doe',
    patientEmail: 'john.doe@example.com',
    patientPhone: '+1-555-9876',
    patientAge: 35,
    patientGender: 'male',
    appointmentDate: '2025-11-15',
    appointmentTime: '10:00 AM',
    symptoms: 'Chest pain and shortness of breath',
    additionalNotes: 'Has family history of heart disease',
    emergencyContact: '+1-555-5555',
    insuranceProvider: 'Blue Cross',
    previousConditions: 'Hypertension',
    clerkUserId: 'user_test123'
};

let createdDoctorId = null;
let createdAppointmentId = null;

// Helper function to make API calls
async function apiCall(method, endpoint, data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const result = await response.json();

        return {
            status: response.status,
            ok: response.ok,
            data: result
        };
    } catch (error) {
        console.error(`❌ Error in ${method} ${endpoint}:`, error.message);
        return { ok: false, error: error.message };
    }
}

// Test functions
async function test1_AddDoctor() {
    console.log('\n📋 TEST 1: Add New Doctor (POST /api/doctors/add)');
    console.log('─'.repeat(60));
    
    const result = await apiCall('POST', '/doctors/add', testDoctor);
    
    if (result.ok && result.data.success) {
        createdDoctorId = result.data.doctor.id;
        console.log('✅ Doctor added successfully!');
        console.log('Doctor ID:', createdDoctorId);
        console.log('Name:', result.data.doctor.name);
        console.log('Specialization:', result.data.doctor.specialization);
    } else {
        console.log('❌ Failed:', result.data.message || result.error);
    }
    
    return result.ok;
}

async function test2_GetAllDoctors() {
    console.log('\n📋 TEST 2: Get All Doctors (GET /api/doctors)');
    console.log('─'.repeat(60));
    
    const result = await apiCall('GET', '/doctors');
    
    if (result.ok && result.data.success) {
        console.log(`✅ Found ${result.data.count} doctor(s)`);
        result.data.doctors.forEach((doc, index) => {
            console.log(`  ${index + 1}. ${doc.name} - ${doc.specialization}`);
        });
    } else {
        console.log('❌ Failed:', result.data.message || result.error);
    }
    
    return result.ok;
}

async function test3_GetDoctorById() {
    console.log('\n📋 TEST 3: Get Doctor by ID (GET /api/doctors/:id)');
    console.log('─'.repeat(60));
    
    if (!createdDoctorId) {
        console.log('⚠️  Skipping - No doctor ID available');
        return false;
    }
    
    const result = await apiCall('GET', `/doctors/${createdDoctorId}`);
    
    if (result.ok && result.data.success) {
        console.log('✅ Doctor found!');
        console.log('Name:', result.data.doctor.name);
        console.log('Email:', result.data.doctor.email);
        console.log('Specialization:', result.data.doctor.specialization);
        console.log('Fees:', `$${result.data.doctor.fees}`);
    } else {
        console.log('❌ Failed:', result.data.message || result.error);
    }
    
    return result.ok;
}

async function test4_CreateAppointment() {
    console.log('\n📋 TEST 4: Create Appointment (POST /api/appointments/create)');
    console.log('─'.repeat(60));
    
    if (!createdDoctorId) {
        console.log('⚠️  Skipping - No doctor ID available');
        return false;
    }
    
    const appointmentData = {
        ...testAppointment,
        doctorId: createdDoctorId,
        doctorName: testDoctor.name,
        doctorSpecialization: testDoctor.specialization
    };
    
    const result = await apiCall('POST', '/appointments/create', appointmentData);
    
    if (result.ok && result.data.success) {
        createdAppointmentId = result.data.appointment._id;
        console.log('✅ Appointment created successfully!');
        console.log('Appointment ID:', createdAppointmentId);
        console.log('Patient:', result.data.appointment.patientName);
        console.log('Doctor:', result.data.appointment.doctorName);
        console.log('Date:', result.data.appointment.appointmentDate);
        console.log('Time:', result.data.appointment.appointmentTime);
        console.log('Status:', result.data.appointment.status);
        console.log('\n📧 Check email:', appointmentData.patientEmail);
    } else {
        console.log('❌ Failed:', result.data.message || result.error);
    }
    
    return result.ok;
}

async function test5_GetUserAppointments() {
    console.log('\n📋 TEST 5: Get User Appointments (GET /api/appointments/user/:userId)');
    console.log('─'.repeat(60));
    
    const userId = testAppointment.clerkUserId;
    const result = await apiCall('GET', `/appointments/user/${userId}`);
    
    if (result.ok && result.data.success) {
        console.log(`✅ Found ${result.data.count} appointment(s) for user`);
        result.data.appointments.forEach((apt, index) => {
            console.log(`  ${index + 1}. ${apt.doctorName} - ${apt.appointmentDate} at ${apt.appointmentTime} (${apt.status})`);
        });
    } else {
        console.log('❌ Failed:', result.data.message || result.error);
    }
    
    return result.ok;
}

async function test6_GetDoctorAppointments() {
    console.log('\n📋 TEST 6: Get Doctor Appointments (GET /api/appointments/doctor/:doctorId)');
    console.log('─'.repeat(60));
    
    if (!createdDoctorId) {
        console.log('⚠️  Skipping - No doctor ID available');
        return false;
    }
    
    const result = await apiCall('GET', `/appointments/doctor/${createdDoctorId}`);
    
    if (result.ok && result.data.success) {
        console.log(`✅ Found ${result.data.count} appointment(s) for doctor`);
        result.data.appointments.forEach((apt, index) => {
            console.log(`  ${index + 1}. ${apt.patientName} - ${apt.appointmentDate} at ${apt.appointmentTime} (${apt.status})`);
        });
    } else {
        console.log('❌ Failed:', result.data.message || result.error);
    }
    
    return result.ok;
}

async function test7_UpdateAppointmentStatus() {
    console.log('\n📋 TEST 7: Update Appointment Status (PUT /api/appointments/:id/status)');
    console.log('─'.repeat(60));
    
    if (!createdAppointmentId) {
        console.log('⚠️  Skipping - No appointment ID available');
        return false;
    }
    
    const result = await apiCall('PUT', `/appointments/${createdAppointmentId}/status`, {
        status: 'completed'
    });
    
    if (result.ok && result.data.success) {
        console.log('✅ Status updated successfully!');
        console.log('New Status:', result.data.appointment.status);
    } else {
        console.log('❌ Failed:', result.data.message || result.error);
    }
    
    return result.ok;
}

async function test8_UpdateDoctor() {
    console.log('\n📋 TEST 8: Update Doctor Info (PUT /api/doctors/:id)');
    console.log('─'.repeat(60));
    
    if (!createdDoctorId) {
        console.log('⚠️  Skipping - No doctor ID available');
        return false;
    }
    
    const result = await apiCall('PUT', `/doctors/${createdDoctorId}`, {
        fees: 250,
        availability: 'Mon-Sat: 8AM-6PM'
    });
    
    if (result.ok && result.data.success) {
        console.log('✅ Doctor updated successfully!');
        console.log('New Fees:', `$${result.data.doctor.fees}`);
        console.log('New Availability:', result.data.doctor.availability);
    } else {
        console.log('❌ Failed:', result.data.message || result.error);
    }
    
    return result.ok;
}

async function test9_CancelAppointment() {
    console.log('\n📋 TEST 9: Cancel Appointment (DELETE /api/appointments/:id)');
    console.log('─'.repeat(60));
    
    if (!createdAppointmentId) {
        console.log('⚠️  Skipping - No appointment ID available');
        return false;
    }
    
    const result = await apiCall('DELETE', `/appointments/${createdAppointmentId}`, {
        cancellationReason: 'Patient requested cancellation'
    });
    
    if (result.ok && result.data.success) {
        console.log('✅ Appointment cancelled successfully!');
        console.log('Status:', result.data.appointment.status);
        console.log('Reason:', result.data.appointment.cancellationReason);
    } else {
        console.log('❌ Failed:', result.data.message || result.error);
    }
    
    return result.ok;
}

async function test10_DeleteDoctor() {
    console.log('\n📋 TEST 10: Delete Doctor (DELETE /api/doctors/:id)');
    console.log('─'.repeat(60));
    
    if (!createdDoctorId) {
        console.log('⚠️  Skipping - No doctor ID available');
        return false;
    }
    
    const result = await apiCall('DELETE', `/doctors/${createdDoctorId}`);
    
    if (result.ok && result.data.success) {
        console.log('✅ Doctor deleted successfully!');
        console.log('Deleted:', result.data.doctor.name);
    } else {
        console.log('❌ Failed:', result.data.message || result.error);
    }
    
    return result.ok;
}

// Run all tests
async function runAllTests() {
    console.log('\n' + '═'.repeat(60));
    console.log('🏥 HEALTHCARE APPOINTMENT SYSTEM - API TESTS');
    console.log('═'.repeat(60));
    console.log(`Base URL: ${BASE_URL}`);
    console.log('Starting tests...\n');
    
    const results = [];
    
    results.push(await test1_AddDoctor());
    results.push(await test2_GetAllDoctors());
    results.push(await test3_GetDoctorById());
    results.push(await test4_CreateAppointment());
    results.push(await test5_GetUserAppointments());
    results.push(await test6_GetDoctorAppointments());
    results.push(await test7_UpdateAppointmentStatus());
    results.push(await test8_UpdateDoctor());
    results.push(await test9_CancelAppointment());
    results.push(await test10_DeleteDoctor());
    
    // Summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(60));
    
    const passed = results.filter(r => r).length;
    const failed = results.filter(r => !r).length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Total: ${results.length}`);
    console.log('═'.repeat(60));
    
    if (passed === results.length) {
        console.log('\n🎉 All tests passed! Your API is working perfectly!');
    } else {
        console.log('\n⚠️  Some tests failed. Check the errors above.');
    }
}

// Run tests
runAllTests().catch(error => {
    console.error('❌ Test suite error:', error);
});
