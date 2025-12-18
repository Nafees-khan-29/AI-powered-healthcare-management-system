import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Email transporter configuration (Brevo SMTP)
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Get all doctors
const getAllDoctors = async (req, res) => {
    try {
        const { specialization, available } = req.query;
        
        let query = {};
        
        if (specialization) {
            query.specialization = specialization;
        }
        
        if (available !== undefined) {
            query.available = available === 'true';
        }
        
        const doctors = await doctorModel.find(query).select('-password');
        
        res.status(200).json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctors',
            error: error.message
        });
    }
};

// Get doctor by ID
const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const doctor = await doctorModel.findById(id).select('-password');
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        res.status(200).json({
            success: true,
            doctor
        });
    } catch (error) {
        console.error('Error fetching doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching doctor',
            error: error.message
        });
    }
};

// Add new doctor (Admin only)
const addDoctor = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            specialization,
            degree,
            experience,
            fees,
            address,
            phone,
            education,
            availability,
            image
        } = req.body;
        
        // Check if doctor already exists
        const existingDoctor = await doctorModel.findOne({ email });
        if (existingDoctor) {
            return res.status(400).json({
                success: false,
                message: 'Doctor with this email already exists'
            });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new doctor
        const newDoctor = new doctorModel({
            name,
            email,
            password: hashedPassword,
            specialization,
            degree,
            experience,
            fees,
            address,
            phone,
            education,
            availability,
            image: image || '/default-doctor.jpg',
            available: true
        });
        
        await newDoctor.save();
        
        res.status(201).json({
            success: true,
            message: 'Doctor added successfully',
            doctor: {
                id: newDoctor._id,
                name: newDoctor.name,
                email: newDoctor.email,
                specialization: newDoctor.specialization
            }
        });
    } catch (error) {
        console.error('Error adding doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding doctor',
            error: error.message
        });
    }
};

// Update doctor information
const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        // Don't allow password update through this route
        delete updateData.password;
        delete updateData.email; // Email shouldn't be updated
        
        const updatedDoctor = await doctorModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!updatedDoctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Doctor updated successfully',
            doctor: updatedDoctor
        });
    } catch (error) {
        console.error('Error updating doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating doctor',
            error: error.message
        });
    }
};

// Delete doctor
const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedDoctor = await doctorModel.findByIdAndDelete(id);
        
        if (!deletedDoctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Doctor deleted successfully',
            doctor: {
                id: deletedDoctor._id,
                name: deletedDoctor.name
            }
        });
    } catch (error) {
        console.error('Error deleting doctor:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting doctor',
            error: error.message
        });
    }
};

// Toggle doctor availability
const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        
        const doctor = await doctorModel.findById(id);
        
        if (!doctor) {
            return res.status(404).json({
                success: false,
                message: 'Doctor not found'
            });
        }
        
        doctor.available = !doctor.available;
        await doctor.save();
        
        res.status(200).json({
            success: true,
            message: `Doctor availability set to ${doctor.available ? 'available' : 'unavailable'}`,
            available: doctor.available
        });
    } catch (error) {
        console.error('Error toggling availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling availability',
            error: error.message
        });
    }
};

// Send video call link to patient for regular consultation
const sendPatientVideoCallLink = async (req, res) => {
    try {
        const { patientEmail, patientName, videoCallLink, doctorName } = req.body;

        console.log('📹 Sending patient video call link:', { patientEmail, patientName, videoCallLink, doctorName });

        if (!patientEmail || !patientName || !videoCallLink || !doctorName) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: patientEmail, patientName, videoCallLink, doctorName'
            });
        }

        // Email options
        const mailOptions = {
            from: `ProHealth Video Call <${process.env.SENDER_EMAIL}>`,
            to: patientEmail,
            subject: `🎥 Video Consultation Invitation from ${doctorName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #3b82f6; border-radius: 10px;">
                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                        <h1 style="margin: 0; font-size: 28px;">🎥 Video Consultation Invitation</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px;">${doctorName} is ready to see you</p>
                    </div>
                    
                    <div style="background-color: #eff6ff; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                        <h2 style="color: #1e40af; margin-top: 0;">Dear ${patientName},</h2>
                        <p style="color: #1e3a8a; font-size: 16px; line-height: 1.6;">
                            ${doctorName} has initiated a video consultation with you. Please join the call using the link below.
                        </p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${videoCallLink}" 
                           style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                                  color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; 
                                  font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);">
                            🎥 Join Video Call Now
                        </a>
                    </div>

                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; color: #374151; font-size: 14px;">
                            <strong>📋 Call Details:</strong>
                        </p>
                        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                            <strong>Doctor:</strong> ${doctorName}
                        </p>
                        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                            <strong>Patient:</strong> ${patientName}
                        </p>
                        <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">
                            <strong>Type:</strong> Video Consultation
                        </p>
                    </div>

                    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                            <strong>⚠️ Important:</strong> Please ensure you have a stable internet connection and your camera/microphone are working properly.
                        </p>
                    </div>

                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; color: #374151; font-size: 13px;">
                            <strong>Direct Link (Copy if needed):</strong>
                        </p>
                        <p style="margin: 0; padding: 10px; background: white; border: 1px solid #d1d5db; border-radius: 4px; 
                                  word-break: break-all; font-family: monospace; font-size: 12px; color: #3b82f6;">
                            ${videoCallLink}
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 12px; margin: 5px 0;">
                            This is an automated message from ProHealth
                        </p>
                        <p style="color: #9ca3af; font-size: 11px; margin: 5px 0;">
                            Please do not reply to this email
                        </p>
                    </div>
                </div>
            `
        };

        // Try to send email
        try {
            await transporter.sendMail(mailOptions);
            console.log('✅ Video call link email sent successfully to:', patientEmail);
            
            res.status(200).json({
                success: true,
                message: 'Video call link sent successfully',
                sentTo: patientEmail
            });
        } catch (emailError) {
            console.error('❌ Email send error:', emailError);
            res.status(500).json({
                success: false,
                message: 'Failed to send email',
                error: emailError.message
            });
        }
    } catch (error) {
        console.error('❌ Error sending patient video call link:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send video call link',
            error: error.message
        });
    }
};

export {
    getAllDoctors,
    getDoctorById,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    toggleAvailability,
    sendPatientVideoCallLink
};
