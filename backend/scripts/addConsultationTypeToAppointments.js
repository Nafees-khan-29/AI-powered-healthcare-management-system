import mongoose from 'mongoose';
import appointmentModel from '../models/appointmentModel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Update all appointments without consultationType field
const updateAppointments = async () => {
  try {
    console.log('🔄 Starting migration to add consultationType field...');
    
    // Find all appointments that don't have consultationType field
    const appointmentsWithoutType = await appointmentModel.find({
      consultationType: { $exists: false }
    });
    
    console.log(`📊 Found ${appointmentsWithoutType.length} appointments without consultationType`);
    
    if (appointmentsWithoutType.length === 0) {
      console.log('✅ All appointments already have consultationType field');
      return;
    }
    
    // Update all appointments to default to 'online'
    // Since this is a new feature, we'll default to 'online' to populate the Online Patients section
    // You can manually change specific appointments to 'offline' later if needed
    const result = await appointmentModel.updateMany(
      { consultationType: { $exists: false } },
      { $set: { consultationType: 'online' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} appointments to consultationType: 'online'`);
    console.log('📋 Migration complete!');
    
    // Show some sample updated appointments
    const sampleUpdated = await appointmentModel.find().limit(5);
    console.log('\n📋 Sample appointments after update:');
    sampleUpdated.forEach(apt => {
      console.log(`  - ${apt.patientName}: consultationType = ${apt.consultationType}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating appointments:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await updateAppointments();
  await mongoose.connection.close();
  console.log('👋 Database connection closed');
  process.exit(0);
};

main();
