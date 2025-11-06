// Quick test to check if role detection works
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testRoleCheck(email) {
  console.log(`\n🔍 Testing role check for: ${email}`);
  console.log('='.repeat(60));

  // Check in doctors.json
  const doctorData = await fs.readFile(
    path.join(__dirname, 'data/doctors.json'),
    'utf-8'
  );
  const doctors = JSON.parse(doctorData);
  const doctor = doctors.find((d) => d.email === email && d.active);

  if (doctor) {
    console.log('✅ FOUND IN DOCTORS.JSON:');
    console.log(`   Name: ${doctor.full_name}`);
    console.log(`   Email: ${doctor.email}`);
    console.log(`   Specialization: ${doctor.specialization}`);
    console.log(`   Role: doctor`);
    return { role: 'doctor', user: doctor };
  }

  // Check in admins.json
  const adminData = await fs.readFile(
    path.join(__dirname, 'data/admins.json'),
    'utf-8'
  );
  const admins = JSON.parse(adminData);
  const admin = admins.find((a) => a.email === email && a.active);

  if (admin) {
    console.log('✅ FOUND IN ADMINS.JSON:');
    console.log(`   Name: ${admin.full_name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Department: ${admin.department}`);
    console.log(`   Role: admin`);
    return { role: 'admin', user: admin };
  }

  console.log('❌ NOT FOUND - Defaulting to user role');
  return { role: 'user', user: null };
}

// Test with the doctor emails
const testEmails = [
  'sarahmitchell@healthcare.com',
  'sarah.mitchell@healthcare.com',
  'michael.chen@healthcare.com',
  'admin@healthcare.com',
];

console.log('\n🧪 ROLE DETECTION TEST');
console.log('='.repeat(60));

for (const email of testEmails) {
  await testRoleCheck(email);
}

console.log('\n' + '='.repeat(60));
console.log('✅ Test completed!\n');
