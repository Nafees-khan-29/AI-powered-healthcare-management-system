import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        // Patient Information
        patientName: {
            type: String,
            required: [true, 'Patient name is required'],
            trim: true
        },
        patientEmail: {
            type: String,
            required: [true, 'Patient email is required'],
            trim: true,
            lowercase: true
        },
        patientPhone: {
            type: String,
            required: [true, 'Patient phone is required'],
            trim: true
        },
        patientAge: {
            type: Number,
            required: false,  // Made optional
            min: 0
        },
        patientGender: {
            type: String,
            required: false,  // Made optional
            enum: ['male', 'female', 'other', 'Male', 'Female', 'Other']  // Allow both cases
        },
        
        // Doctor Information
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'doctor',
            required: false  // Made optional since we might not have all doctors in DB yet
        },
        doctorClerkUserId: {
            type: String,
            required: false  // Clerk User ID of the doctor (for linking to Clerk accounts)
        },
        doctorEmail: {
            type: String,
            required: false,
            trim: true,
            lowercase: true
        },
        doctorName: {
            type: String,
            required: true
        },
        doctorSpecialization: {
            type: String,
            required: true
        },
        
        // Appointment Details
        appointmentDate: {
            type: String,
            required: [true, 'Appointment date is required']
        },
        appointmentTime: {
            type: String,
            required: [true, 'Appointment time is required']
        },
        
        // Medical Information
        symptoms: {
            type: String,
            required: false,  // Made optional since not all appointments need symptoms
            trim: true
        },
        additionalNotes: {
            type: String,
            trim: true
        },
        emergencyContact: {
            type: String,
            trim: true
        },
        insuranceProvider: {
            type: String,
            trim: true
        },
        previousConditions: {
            type: String,
            trim: true
        },
        
        // Medical Reports/Files
        medicalReports: [{
            filename: String,
            path: String,
            mimetype: String,
            size: Number,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }],
        
        // Status Management
        status: {
            type: String,
            enum: ['pending', 'booked', 'completed', 'cancelled', 'rescheduled'],
            default: 'pending'
        },
        
        // User Reference (Clerk User ID or MongoDB User ID)
        userId: {
            type: String,
            required: false
        },
        clerkUserId: {
            type: String,
            required: false
        },
        
        // Consultation Fee
        consultationFee: {
            type: Number,
            default: 150
        },
        
        // Payment Status
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending'
        },
        
        // Cancellation Info
        cancellationReason: {
            type: String,
            trim: true
        },
        cancelledAt: {
            type: Date
        }
    },
    {
        timestamps: true
    }
);

// Indexes for faster queries
appointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
appointmentSchema.index({ doctorClerkUserId: 1, status: 1 });
appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ clerkUserId: 1 });
appointmentSchema.index({ patientEmail: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });
// Compound index for checking time slot conflicts
appointmentSchema.index({ doctorEmail: 1, appointmentDate: 1, appointmentTime: 1 });
appointmentSchema.index({ doctorName: 1, appointmentDate: 1, appointmentTime: 1 });

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel;
