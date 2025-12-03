import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
    {
        // Patient Information
        patientName: {
            type: String,
            required: [true, 'Patient name is required'],
            trim: true
        },
        patientId: {
            type: String,
            required: false,
            trim: true
        },
        patientEmail: {
            type: String,
            required: false,
            trim: true,
            lowercase: true
        },

        // Doctor Information
        doctorEmail: {
            type: String,
            required: [true, 'Doctor email is required'],
            trim: true,
            lowercase: true
        },
        doctorName: {
            type: String,
            required: false
        },

        // Prescription Details
        date: {
            type: String,
            required: [true, 'Date is required']
        },

        medication: {
            type: String,
            required: [true, 'Medication name is required'],
            trim: true
        },
        dosage: {
            type: String,
            required: [true, 'Dosage is required'],
            trim: true
        },
        duration: {
            type: String,
            required: false,
            trim: true
        },
        refills: {
            type: Number,
            default: 1,
            min: 0
        },
        instructions: {
            type: String,
            required: false,
            trim: true
        },

        // Pharmacy Information
        pharmacy: {
            type: String,
            required: false,
            trim: true
        },

        // Status
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled', 'expired'],
            default: 'active'
        },

        // Reference to medical record (if part of a medical record)
        medicalRecordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'medicalRecord',
            required: false
        },

        // Reference to original appointment (if created from appointment)
        appointmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'appointment',
            required: false
        },

        // Additional metadata
        createdBy: {
            type: String,
            required: true // Clerk user ID
        },
        updatedBy: {
            type: String,
            required: false
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries
prescriptionSchema.index({ patientEmail: 1, date: -1 });
prescriptionSchema.index({ doctorEmail: 1, date: -1 });
prescriptionSchema.index({ patientId: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ medicalRecordId: 1 });
prescriptionSchema.index({ appointmentId: 1 });

const prescriptionModel = mongoose.models.prescription || mongoose.model('prescription', prescriptionSchema);

export default prescriptionModel;