import mongoose from 'mongoose';
import appointmentModel from '../models/appointmentModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Nafees:Nafees29@cluster0.oghuflz.mongodb.net/healthcare?retryWrites=true&w=majority&appName=Cluster0';

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

async function removeDuplicates() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Step 1: Fix appointments without doctor email
        console.log('Step 1: Fixing appointments without doctor email...');
        const appointmentsWithoutEmail = await appointmentModel.find({
            $or: [
                { doctorEmail: null },
                { doctorEmail: { $exists: false } },
                { doctorEmail: '' }
            ]
        });

        console.log(`Found ${appointmentsWithoutEmail.length} appointments without doctor email\n`);

        let fixed = 0;
        for (const apt of appointmentsWithoutEmail) {
            const email = doctorEmails[apt.doctorName];
            if (email) {
                await appointmentModel.findByIdAndUpdate(apt._id, { doctorEmail: email });
                console.log(`✅ Fixed: ${apt._id} - Added email ${email} for ${apt.doctorName}`);
                fixed++;
            }
        }

        console.log(`\n✅ Fixed ${fixed} appointments with doctor emails\n`);

        // Step 2: Find duplicate appointments (same doctor, date, time)
        console.log('Step 2: Finding duplicate appointments...');
        
        const allAppointments = await appointmentModel.find({ 
            status: { $in: ['pending', 'confirmed'] } 
        }).sort({ createdAt: 1 }); // Sort by creation time - oldest first

        console.log(`📋 Total active appointments: ${allAppointments.length}\n`);

        // Group by doctor + date + time
        const groups = {};
        for (const apt of allAppointments) {
            const key = `${apt.doctorEmail || apt.doctorName}|${apt.appointmentDate}|${apt.appointmentTime}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(apt);
        }

        // Find duplicates
        const duplicateGroups = Object.entries(groups).filter(([_, apts]) => apts.length > 1);

        console.log(`❌ Found ${duplicateGroups.length} slots with duplicate bookings:\n`);

        let keptCount = 0;
        let cancelledCount = 0;

        for (const [key, apts] of duplicateGroups) {
            const [doctor, date, time] = key.split('|');
            console.log(`\n🔴 Duplicate slot: ${doctor} on ${date} at ${time}`);
            console.log(`   ${apts.length} appointments found:`);

            // Keep the first one (oldest), cancel the rest
            for (let i = 0; i < apts.length; i++) {
                const apt = apts[i];
                if (i === 0) {
                    console.log(`   ✅ KEEPING: ${apt._id} - ${apt.patientName} (${apt.status}) - Created: ${apt.createdAt}`);
                    keptCount++;
                } else {
                    console.log(`   ❌ CANCELLING: ${apt._id} - ${apt.patientName} (${apt.status}) - Created: ${apt.createdAt}`);
                    await appointmentModel.findByIdAndUpdate(apt._id, {
                        status: 'cancelled',
                        cancellationReason: 'Duplicate booking - Slot already taken',
                        cancelledAt: new Date()
                    });
                    cancelledCount++;
                }
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`✅ Kept: ${keptCount} appointments (oldest per slot)`);
        console.log(`❌ Cancelled: ${cancelledCount} duplicate appointments`);
        console.log(`\n🎉 Cleanup complete! Refresh your dashboards to see the changes.`);

        await mongoose.connection.close();
        console.log('\n✅ Done!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

removeDuplicates();
