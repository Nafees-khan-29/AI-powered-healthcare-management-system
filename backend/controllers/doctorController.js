import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

export {
    getAllDoctors,
    getDoctorById,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    toggleAvailability
};
