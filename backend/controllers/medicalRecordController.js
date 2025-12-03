import medicalRecordModel from '../models/medicalRecordModel.js';
import prescriptionModel from '../models/prescriptionModel.js';

// Create new medical record
const createMedicalRecord = async (req, res) => {
    try {
        console.log('Received medical record creation request');
        console.log('Request body:', JSON.stringify(req.body, null, 2));

        const {
            patientName,
            patientId,
            patientEmail,
            doctorEmail,
            doctorName,
            date,
            diagnosis,
            symptoms,
            treatment,
            notes,
            followUp,
            prescriptions,
            appointmentId,
            status = 'active'
        } = req.body;

        console.log('Extracted fields:', {
            patientName: !!patientName,
            doctorEmail: !!doctorEmail,
            date: !!date,
            diagnosis: !!diagnosis,
            createdBy: !!req.body.createdBy
        });

        // Validate required fields
        if (!patientName || !doctorEmail || !date || !diagnosis) {
            console.log('Missing required fields validation failed');
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: patientName, doctorEmail, date, diagnosis'
            });
        }

        // Create medical record
        const medicalRecord = new medicalRecordModel({
            patientName,
            patientId,
            patientEmail,
            doctorEmail,
            doctorName,
            date,
            diagnosis,
            symptoms,
            treatment,
            notes,
            followUp,
            prescriptions: prescriptions || [],
            appointmentId,
            status,
            createdBy: req.body.createdBy || doctorEmail
        });

        await medicalRecord.save();

        // If prescriptions are included, also create separate prescription records
        if (prescriptions && prescriptions.length > 0) {
            const prescriptionPromises = prescriptions.map(prescription => {
                const newPrescription = new prescriptionModel({
                    patientName,
                    patientId,
                    patientEmail,
                    doctorEmail,
                    doctorName,
                    date,
                    medication: prescription.medication,
                    dosage: prescription.dosage,
                    duration: prescription.duration,
                    refills: prescription.refills || 1,
                    instructions: prescription.instructions,
                    medicalRecordId: medicalRecord._id,
                    appointmentId,
                    status: 'active',
                    createdBy: doctorEmail
                });
                return newPrescription.save();
            });

            await Promise.all(prescriptionPromises);
        }

        res.status(201).json({
            success: true,
            message: 'Medical record created successfully',
            medicalRecord
        });

    } catch (error) {
        console.error('Error creating medical record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create medical record',
            error: error.message
        });
    }
};

// Get medical records for a specific patient
const getPatientMedicalRecords = async (req, res) => {
    try {
        const { patientId } = req.params;

        // Check if patientId is an email or actual ID
        const query = patientId.includes('@') ? { patientEmail: patientId } : { patientId };

        const medicalRecords = await medicalRecordModel
            .find(query)
            .sort({ date: -1 })
            .populate('appointmentId', 'appointmentDate appointmentTime symptoms');

        res.json({
            success: true,
            medicalRecords
        });

    } catch (error) {
        console.error('Error fetching patient medical records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch medical records',
            error: error.message
        });
    }
};

// Get medical records for a specific doctor
const getDoctorMedicalRecords = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // doctorId could be email or Clerk user ID
        const query = doctorId.includes('@') ? { doctorEmail: doctorId } : { createdBy: doctorId };

        const medicalRecords = await medicalRecordModel
            .find(query)
            .sort({ date: -1 })
            .populate('appointmentId', 'appointmentDate appointmentTime symptoms patientName');

        res.json({
            success: true,
            medicalRecords
        });

    } catch (error) {
        console.error('Error fetching doctor medical records:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch medical records',
            error: error.message
        });
    }
};

// Update medical record
const updateMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.createdAt;

        updateData.updatedBy = req.body.updatedBy || req.body.doctorEmail;
        updateData.updatedAt = new Date();

        const medicalRecord = await medicalRecordModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!medicalRecord) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found'
            });
        }

        // Update associated prescriptions if prescriptions array is provided
        if (updateData.prescriptions) {
            // Delete existing prescriptions for this medical record
            await prescriptionModel.deleteMany({ medicalRecordId: id });

            // Create new prescriptions
            if (updateData.prescriptions.length > 0) {
                const prescriptionPromises = updateData.prescriptions.map(prescription => {
                    const newPrescription = new prescriptionModel({
                        patientName: medicalRecord.patientName,
                        patientId: medicalRecord.patientId,
                        patientEmail: medicalRecord.patientEmail,
                        doctorEmail: medicalRecord.doctorEmail,
                        doctorName: medicalRecord.doctorName,
                        date: medicalRecord.date,
                        medication: prescription.medication,
                        dosage: prescription.dosage,
                        duration: prescription.duration,
                        refills: prescription.refills || 1,
                        instructions: prescription.instructions,
                        medicalRecordId: medicalRecord._id,
                        appointmentId: medicalRecord.appointmentId,
                        status: 'active',
                        createdBy: medicalRecord.createdBy
                    });
                    return newPrescription.save();
                });

                await Promise.all(prescriptionPromises);
            }
        }

        res.json({
            success: true,
            message: 'Medical record updated successfully',
            medicalRecord
        });

    } catch (error) {
        console.error('Error updating medical record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update medical record',
            error: error.message
        });
    }
};

// Delete medical record
const deleteMedicalRecord = async (req, res) => {
    try {
        const { id } = req.params;

        const medicalRecord = await medicalRecordModel.findByIdAndDelete(id);

        if (!medicalRecord) {
            return res.status(404).json({
                success: false,
                message: 'Medical record not found'
            });
        }

        // Also delete associated prescriptions
        await prescriptionModel.deleteMany({ medicalRecordId: id });

        res.json({
            success: true,
            message: 'Medical record deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting medical record:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete medical record',
            error: error.message
        });
    }
};

export {
    createMedicalRecord,
    getPatientMedicalRecords,
    getDoctorMedicalRecords,
    updateMedicalRecord,
    deleteMedicalRecord
};