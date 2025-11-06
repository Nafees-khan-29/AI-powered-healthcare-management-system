import { clerkClient } from '@clerk/clerk-sdk-node';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Clerk client
const clerk = clerkClient;

/**
 * Sync all doctors from doctors.json to Clerk
 */
const syncDoctorsToClerk = async () => {
  try {
    console.log('🚀 Starting Doctor Sync to Clerk...\n');
    console.log('=' .repeat(60));

    // Load doctors.json
    const doctorsPath = path.join(__dirname, '../data/doctors.json');
    const doctorData = await fs.readFile(doctorsPath, 'utf-8');
    const doctors = JSON.parse(doctorData);

    console.log(`📋 Found ${doctors.length} doctors to sync\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Sync each doctor
    for (let i = 0; i < doctors.length; i++) {
      const doctor = doctors[i];
      const num = i + 1;

      try {
        console.log(`[${num}/${doctors.length}] Processing: ${doctor.full_name}`);
        console.log(`   Email: ${doctor.email}`);
        console.log(`   Specialization: ${doctor.specialization}`);

        // Split full name into first and last name
        const nameParts = doctor.full_name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || nameParts[0];

        // Create user in Clerk with metadata
        const user = await clerk.users.createUser({
          emailAddress: [doctor.email],
          password: doctor.password,
          firstName: firstName,
          lastName: lastName,
          // Public metadata (visible to frontend)
          publicMetadata: {
            role: 'doctor',
            doctorId: doctor.id,
            specialization: doctor.specialization,
            hospital: doctor.hospital,
            license_number: doctor.license_number,
            phone: doctor.phone,
          },
          // Private metadata (only visible to backend)
          privateMetadata: {
            dob: doctor.dob,
            gender: doctor.gender,
            address: doctor.address,
            registration_date: doctor.registration_date,
            active: doctor.active,
            full_doctor_data: doctor,
          },
        });

        console.log(`   ✅ Successfully created Clerk account`);
        console.log(`   Clerk User ID: ${user.id}`);
        successCount++;

      } catch (error) {
        if (error.errors && error.errors[0]?.code === 'form_identifier_exists') {
          console.log(`   ⚠️  Account already exists - Skipping`);
          skipCount++;

          // Try to update metadata for existing user
          try {
            const existingUsers = await clerk.users.getUserList({
              emailAddress: [doctor.email],
            });

            if (existingUsers.data && existingUsers.data.length > 0) {
              const existingUser = existingUsers.data[0];
              
              await clerk.users.updateUserMetadata(existingUser.id, {
                publicMetadata: {
                  role: 'doctor',
                  doctorId: doctor.id,
                  specialization: doctor.specialization,
                  hospital: doctor.hospital,
                  license_number: doctor.license_number,
                  phone: doctor.phone,
                },
                privateMetadata: {
                  dob: doctor.dob,
                  gender: doctor.gender,
                  address: doctor.address,
                  registration_date: doctor.registration_date,
                  active: doctor.active,
                  full_doctor_data: doctor,
                },
              });

              console.log(`   ✅ Updated metadata for existing user`);
            }
          } catch (updateError) {
            console.log(`   ⚠️  Could not update metadata: ${updateError.message}`);
          }

        } else {
          console.log(`   ❌ Error: ${error.message}`);
          errorCount++;
        }
      }

      console.log('');
    }

    // Summary
    console.log('=' .repeat(60));
    console.log('\n📊 SYNC SUMMARY:');
    console.log(`   ✅ Successfully created: ${successCount}`);
    console.log(`   ⚠️  Already existed: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total processed: ${doctors.length}`);
    console.log('\n✅ Doctor sync completed!\n');

  } catch (error) {
    console.error('\n❌ FATAL ERROR during sync:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

/**
 * Sync admins from admins.json to Clerk
 */
const syncAdminsToClerk = async () => {
  try {
    console.log('\n🚀 Starting Admin Sync to Clerk...\n');
    console.log('=' .repeat(60));

    // Load admins.json
    const adminsPath = path.join(__dirname, '../data/admins.json');
    const adminData = await fs.readFile(adminsPath, 'utf-8');
    const admins = JSON.parse(adminData);

    console.log(`📋 Found ${admins.length} admins to sync\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Sync each admin
    for (let i = 0; i < admins.length; i++) {
      const admin = admins[i];
      const num = i + 1;

      try {
        console.log(`[${num}/${admins.length}] Processing: ${admin.full_name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Position: ${admin.position}`);

        const nameParts = admin.full_name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || nameParts[0];

        const user = await clerk.users.createUser({
          emailAddress: [admin.email],
          password: admin.password,
          firstName: firstName,
          lastName: lastName,
          publicMetadata: {
            role: 'admin',
            adminId: admin.id,
            department: admin.department,
            position: admin.position,
            hospital: admin.hospital,
            employee_id: admin.employee_id,
            permissions: admin.permissions,
          },
          privateMetadata: {
            phone: admin.phone,
            hire_date: admin.hire_date,
            active: admin.active,
            full_admin_data: admin,
          },
        });

        console.log(`   ✅ Successfully created Clerk account`);
        console.log(`   Clerk User ID: ${user.id}`);
        successCount++;

      } catch (error) {
        if (error.errors && error.errors[0]?.code === 'form_identifier_exists') {
          console.log(`   ⚠️  Account already exists - Updating metadata`);
          skipCount++;

          try {
            const existingUsers = await clerk.users.getUserList({
              emailAddress: [admin.email],
            });

            if (existingUsers.data && existingUsers.data.length > 0) {
              const existingUser = existingUsers.data[0];
              
              await clerk.users.updateUserMetadata(existingUser.id, {
                publicMetadata: {
                  role: 'admin',
                  adminId: admin.id,
                  department: admin.department,
                  position: admin.position,
                  hospital: admin.hospital,
                  employee_id: admin.employee_id,
                  permissions: admin.permissions,
                },
                privateMetadata: {
                  phone: admin.phone,
                  hire_date: admin.hire_date,
                  active: admin.active,
                  full_admin_data: admin,
                },
              });

              console.log(`   ✅ Updated metadata for existing user`);
            }
          } catch (updateError) {
            console.log(`   ⚠️  Could not update metadata: ${updateError.message}`);
          }

        } else {
          console.log(`   ❌ Error: ${error.message}`);
          errorCount++;
        }
      }

      console.log('');
    }

    // Summary
    console.log('=' .repeat(60));
    console.log('\n📊 SYNC SUMMARY:');
    console.log(`   ✅ Successfully created: ${successCount}`);
    console.log(`   ⚠️  Already existed: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📋 Total processed: ${admins.length}`);
    console.log('\n✅ Admin sync completed!\n');

  } catch (error) {
    console.error('\n❌ FATAL ERROR during sync:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

/**
 * Main function to sync both doctors and admins
 */
const syncAll = async () => {
  console.log('\n🏥 HEALTHCARE DATA SYNC TO CLERK');
  console.log('=' .repeat(60));
  console.log(`Started at: ${new Date().toLocaleString()}\n`);

  await syncDoctorsToClerk();
  await syncAdminsToClerk();

  console.log('=' .repeat(60));
  console.log('🎉 ALL DATA SYNCED SUCCESSFULLY!');
  console.log(`Completed at: ${new Date().toLocaleString()}\n`);
  
  process.exit(0);
};

// Run the sync
syncAll();
