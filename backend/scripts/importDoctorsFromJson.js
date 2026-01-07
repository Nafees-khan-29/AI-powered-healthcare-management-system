import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import doctorModel from '../models/doctorModel.js';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Import doctors from JSON file
const importDoctors = async () => {
    try {
        // Read the doctors.json file
        const doctorsPath = path.join(__dirname, '../data/doctors.json');
        const doctorsData = JSON.parse(fs.readFileSync(doctorsPath, 'utf-8'));
        
        console.log(`📁 Found ${doctorsData.length} doctors in JSON file`);
        
        let imported = 0;
        let skipped = 0;
        
        for (const doctor of doctorsData) {
            try {
                // Check if doctor already exists by email
                const existingDoctor = await doctorModel.findOne({ email: doctor.email });
                
                if (existingDoctor) {
                    console.log(`⏭️  Skipping ${doctor.full_name} - already exists`);
                    skipped++;
                    continue;
                }
                
                // Hash the password
                const hashedPassword = await bcrypt.hash(doctor.password, 10);
                
                // Create doctor document matching the doctorModel schema
                const newDoctor = new doctorModel({
                    name: doctor.full_name,
                    email: doctor.email,
                    password: hashedPassword,
                    specialization: doctor.specialization,
                    degree: doctor.license_number || 'MD',
                    experience: calculateExperience(doctor.registration_date),
                    fees: getDefaultFees(doctor.specialization),
                    address: doctor.address,
                    phone: doctor.phone || '',
                    image: getDefaultImage(doctor.gender),
                    available: doctor.active !== false,
                    education: `${doctor.license_number} - ${doctor.hospital}`,
                    availability: 'Mon-Fri: 9AM-5PM'
                });
                
                await newDoctor.save();
                console.log(`✅ Imported ${doctor.full_name}`);
                imported++;
                
            } catch (error) {
                console.error(`❌ Error importing ${doctor.full_name}:`, error.message);
            }
        }
        
        console.log('\n📊 Import Summary:');
        console.log(`   ✅ Imported: ${imported} doctors`);
        console.log(`   ⏭️  Skipped: ${skipped} doctors (already exist)`);
        console.log(`   📝 Total: ${doctorsData.length} doctors in file`);
        
    } catch (error) {
        console.error('❌ Error importing doctors:', error);
    }
};

// Helper function to calculate years of experience
function calculateExperience(registrationDate) {
    const regDate = new Date(registrationDate);
    const now = new Date();
    const years = now.getFullYear() - regDate.getFullYear();
    return `${Math.max(years, 1)} years`;
}

// Helper function to get default fees based on specialization
function getDefaultFees(specialization) {
    const feesMap = {
        'Cardiology': 150,
        'Neurology': 160,
        'Orthopedics': 140,
        'Pediatrics': 120,
        'Dermatology': 100,
        'Psychiatry': 130,
        'Oncology': 180,
        'ENT': 110,
        'Ophthalmology': 120,
        'Gynecology': 130,
        'General Medicine': 80,
        'Surgery': 200
    };
    return feesMap[specialization] || 100;
}

// Helper function to get default doctor image
function getDefaultImage(gender) {
    if (gender === 'Female') {
        return 'https://via.placeholder.com/150?text=Dr+F';
    }
    return 'https://via.placeholder.com/150?text=Dr+M';
}

// Main execution
const main = async () => {
    console.log('🚀 Starting doctor import from JSON...\n');
    
    await connectDB();
    await importDoctors();
    
    console.log('\n✅ Import process completed!');
    process.exit(0);
};

// Run the script
main();
