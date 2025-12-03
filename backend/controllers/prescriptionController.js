import prescriptionModel from '../models/prescriptionModel.js';

// Create new prescription
const createPrescription = async (req, res) => {
    try {
        const {
            patientName,
            patientId,
            patientEmail,
            doctorEmail,
            doctorName,
            date,
            medication,
            dosage,
            duration,
            refills = 1,
            instructions,
            pharmacy,
            medicalRecordId,
            appointmentId,
            status = 'active'
        } = req.body;

        // Validate required fields
        if (!patientName || !doctorEmail || !date || !medication || !dosage) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: patientName, doctorEmail, date, medication, dosage'
            });
        }

        // Create prescription
        const prescription = new prescriptionModel({
            patientName,
            patientId,
            patientEmail,
            doctorEmail,
            doctorName,
            date,
            medication,
            dosage,
            duration,
            refills,
            instructions,
            pharmacy,
            medicalRecordId,
            appointmentId,
            status,
            createdBy: req.body.createdBy || doctorEmail
        });

        await prescription.save();

        res.status(201).json({
            success: true,
            message: 'Prescription created successfully',
            prescription
        });

    } catch (error) {
        console.error('Error creating prescription:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create prescription',
            error: error.message
        });
    }
};

// Get prescriptions for a specific patient
const getPatientPrescriptions = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Check if patientId is an email or actual ID
        const query = patientId.includes('@') ? { patientEmail: patientId } : { patientId };

        const prescriptions = await prescriptionModel
            .find(query)
            .sort({ date: -1 })
            .populate('medicalRecordId', 'diagnosis date')
            .populate('appointmentId', 'appointmentDate appointmentTime');

        res.json({
            success: true,
            prescriptions
        });

    } catch (error) {
        console.error('Error fetching patient prescriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prescriptions',
            error: error.message
        });
    }
};

// Get prescriptions for a specific doctor
const getDoctorPrescriptions = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // doctorId could be email or Clerk user ID
        const query = doctorId.includes('@') ? { doctorEmail: doctorId } : { createdBy: doctorId };

        const prescriptions = await prescriptionModel
            .find(query)
            .sort({ date: -1 })
            .populate('medicalRecordId', 'diagnosis date patientName')
            .populate('appointmentId', 'appointmentDate appointmentTime patientName');

        res.json({
            success: true,
            prescriptions
        });

    } catch (error) {
        console.error('Error fetching doctor prescriptions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch prescriptions',
            error: error.message
        });
    }
};

// Update prescription
const updatePrescription = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.createdAt;

        updateData.updatedBy = req.body.updatedBy || req.body.doctorEmail;
        updateData.updatedAt = new Date();

        const prescription = await prescriptionModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        res.json({
            success: true,
            message: 'Prescription updated successfully',
            prescription
        });

    } catch (error) {
        console.error('Error updating prescription:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update prescription',
            error: error.message
        });
    }
};

// Delete prescription
const deletePrescription = async (req, res) => {
    try {
        const { id } = req.params;

        const prescription = await prescriptionModel.findByIdAndDelete(id);

        if (!prescription) {
            return res.status(404).json({
                success: false,
                message: 'Prescription not found'
            });
        }

        res.json({
            success: true,
            message: 'Prescription deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting prescription:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete prescription',
            error: error.message
        });
    }
};

export {
    createPrescription,
    getPatientPrescriptions,
    getDoctorPrescriptions,
    updatePrescription,
    deletePrescription
};