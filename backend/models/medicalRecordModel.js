import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
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

        // Medical Record Details
        date: {
            type: String,
            required: [true, 'Date is required']
        },

        // Medical Information
        diagnosis: {
            type: String,
            required: [true, 'Diagnosis is required'],
            trim: true
        },
        symptoms: {
            type: String,
            required: false,
            trim: true
        },
        treatment: {
            type: String,
            required: false,
            trim: true
        },
        notes: {
            type: String,
            required: false,
            trim: true
        },

        // Follow-up Information
        followUp: {
            type: String,
            required: false
        },

        // Prescriptions (embedded in medical record)
        prescriptions: [{
            medication: {
                type: String,
                required: true
            },
            dosage: {
                type: String,
                required: true
            },
            duration: {
                type: String,
                required: false
            },
            refills: {
                type: Number,
                default: 1,
                min: 0
            },
            instructions: {
                type: String,
                required: false
            }
        }],

        // Status
        status: {
            type: String,
            enum: ['active', 'resolved', 'follow-up', 'archived'],
            default: 'active'
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
medicalRecordSchema.index({ patientEmail: 1, date: -1 });
medicalRecordSchema.index({ doctorEmail: 1, date: -1 });
medicalRecordSchema.index({ patientId: 1 });
medicalRecordSchema.index({ status: 1 });
medicalRecordSchema.index({ appointmentId: 1 });

const medicalRecordModel = mongoose.models.medicalRecord || mongoose.model('medicalRecord', medicalRecordSchema);

export default medicalRecordModel;