import mongoose from 'mongoose';
import appointmentModel from '../models/appointmentModel.js';

const MONGODB_URI = 'mongodb+srv://nafeeskhan:nafees123@cluster0.q5jox.mongodb.net/healthcare-db?retryWrites=true&w=majority';

// Map doctor names to their emails (from DoctorList.jsx)
const doctorEmails = {
    'Dr. Michael Chen': 'michael.chen@healthcare.com',
    'Dr. Sarah Mitchell': 'sarah.mitchell@healthcare.com',
    'Dr. Emily Rodriguez': 'emily.rodriguez@healthcare.com',
    'Dr. James Anderson': 'james.anderson@healthcare.com',
    'Dr. Priya Patel': 'priya.patel@healthcare.com',
    'Dr. Robert Taylor': 'robert.taylor@healthcare.com',
    'Dr. Lisa Zhang': 'lisa.zhang@healthcare.com',
    'Dr. David Kumar': 'david.kumar@healthcare.com',
    'Dr. Jennifer White': 'jennifer.white@healthcare.com',
    'Dr. Mohammed Hassan': 'mohammed.hassan@healthcare.com',
    'Dr. Amanda Foster': 'amanda.foster@healthcare.com',
    'Dr. Kevin Park': 'kevin.park@healthcare.com',
    'Dr. Rachel Green': 'rachel.green@healthcare.com',
    'Dr. Thomas Wright': 'thomas.wright@healthcare.com',
    'Dr. Maria Garcia': 'maria.garcia@healthcare.com'
};

async function fixAppointments() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all appointments without doctor email
        const appointmentsWithoutEmail = await appointmentModel.find({
            $or: [
                { doctorEmail: null },
                { doctorEmail: { $exists: false } }
            ]
        });

        console.log(`📋 Found ${appointmentsWithoutEmail.length} appointments without doctor email\n`);

        if (appointmentsWithoutEmail.length === 0) {
            console.log('✅ All appointments already have doctor emails!');
            await mongoose.connection.close();
            process.exit(0);
        }

        let fixed = 0;
        let notFound = 0;

        for (const apt of appointmentsWithoutEmail) {
            const email = doctorEmails[apt.doctorName];
            
            if (email) {
                console.log(`✅ Updating appointment ${apt._id.toString().substring(0, 8)}...`);
                console.log(`   Patient: ${apt.patientName}`);
                console.log(`   Doctor: ${apt.doctorName} → ${email}`);
                
                await appointmentModel.findByIdAndUpdate(apt._id, {
                    doctorEmail: email
                });
                
                fixed++;
            } else {
                console.log(`❌ No email found for doctor: ${apt.doctorName}`);
                notFound++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Fixed: ${fixed} appointments`);
        console.log(`❌ Not found: ${notFound} appointments`);

        if (fixed > 0) {
            console.log(`\n🎉 SUCCESS! The doctor dashboard should now show these appointments!`);
            console.log(`\n📋 Next steps:`);
            console.log(`1. Refresh the doctor dashboard`);
            console.log(`2. Login as the doctor (matching the appointment's doctor email)`);
            console.log(`3. You should see the appointments now!`);
        }

        await mongoose.connection.close();
        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixAppointments();
