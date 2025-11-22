import mongoose from 'mongoose';
import appointmentModel from '../models/appointmentModel.js';

const MONGODB_URI = 'mongodb+srv://nafeeskhan:nafees123@cluster0.q5jox.mongodb.net/healthcare-db?retryWrites=true&w=majority';

async function checkAppointments() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all appointments
        const appointments = await appointmentModel.find({}).sort({ createdAt: -1 }).limit(5);

        console.log(`📋 Found ${appointments.length} recent appointments:\n`);

        appointments.forEach((apt, index) => {
            console.log(`\n--- Appointment ${index + 1} ---`);
            console.log(`ID: ${apt._id}`);
            console.log(`Patient: ${apt.patientName}`);
            console.log(`Doctor Name: ${apt.doctorName}`);
            console.log(`Doctor Email: ${apt.doctorEmail || '❌ MISSING'}`);
            console.log(`Doctor Clerk ID: ${apt.doctorClerkUserId || '❌ MISSING'}`);
            console.log(`Status: ${apt.status}`);
            console.log(`Date: ${apt.appointmentDate}`);
            console.log(`Created: ${apt.createdAt}`);
        });

        console.log('\n\n📊 Summary:');
        const withEmail = appointments.filter(a => a.doctorEmail).length;
        const withoutEmail = appointments.filter(a => !a.doctorEmail).length;
        console.log(`✅ Appointments with doctor email: ${withEmail}`);
        console.log(`❌ Appointments without doctor email: ${withoutEmail}`);

        if (withoutEmail > 0) {
            console.log('\n⚠️  ISSUE DETECTED:');
            console.log('Appointments without doctor email cannot be found by the doctor dashboard!');
            console.log('\n🔧 SOLUTION:');
            console.log('1. Clear localStorage: localStorage.removeItem("selectedDoctor")');
            console.log('2. Select the doctor again from the Doctors page');
            console.log('3. Create a NEW appointment');
            console.log('4. Or manually update the appointments in MongoDB with the doctor email');
        }

        await mongoose.connection.close();
        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkAppointments();
