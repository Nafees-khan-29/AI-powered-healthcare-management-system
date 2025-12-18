import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import nodemailer from "nodemailer";

// Email configuration with Brevo SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Send confirmation email
const sendConfirmationEmail = async (appointmentData) => {
    try {
        const mailOptions = {
            from: `ProHealth <${process.env.SENDER_EMAIL}>`,
            to: appointmentData.patientEmail,
            subject: 'Appointment Confirmed - ProHealth',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #2563eb; text-align: center;">✅ Appointment Confirmed!</h2>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1f2937; margin-top: 0;">Appointment Details:</h3>
                        <p style="margin: 10px 0;"><strong>Doctor:</strong> ${appointmentData.doctorName}</p>
                        <p style="margin: 10px 0;"><strong>Specialization:</strong> ${appointmentData.doctorSpecialization}</p>
                        <p style="margin: 10px 0;"><strong>Date:</strong> ${appointmentData.appointmentDate}</p>
                        <p style="margin: 10px 0;"><strong>Time:</strong> ${appointmentData.appointmentTime}</p>
                    </div>
                    
                    <div style="background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1e40af; margin-top: 0;">Patient Information:</h3>
                        <p style="margin: 10px 0;"><strong>Name:</strong> ${appointmentData.patientName}</p>
                        <p style="margin: 10px 0;"><strong>Email:</strong> ${appointmentData.patientEmail}</p>
                        <p style="margin: 10px 0;"><strong>Phone:</strong> ${appointmentData.patientPhone}</p>
                    </div>
                    
                    <div style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                        <p style="margin: 0; color: #92400e;"><strong>📋 Important:</strong> Please arrive 10 minutes before your scheduled time. Bring any relevant medical records.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #6b7280; font-size: 14px;">Thank you for choosing ProHealth!</p>
                        <p style="color: #6b7280; font-size: 12px;">If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email sent to:', appointmentData.patientEmail);
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        // Don't throw error - email failure shouldn't stop appointment creation
    }
};

// Create new appointment
const createAppointment = async (req, res) => {
    try {
        const {
            patientName,
            patientEmail,
            patientPhone,
            patientAge,
            patientGender,
            doctorId,
            doctorName,
            doctorSpecialization,
            doctorEmail,
            doctorClerkUserId,
            appointmentDate,
            appointmentTime,
            symptoms,
            additionalNotes,
            emergencyContact,
            insuranceProvider,
            previousConditions,
            userId,
            clerkUserId
        } = req.body;

        console.log('📋 Received appointment data:', {
            patientName,
            patientEmail,
            patientPhone,
            patientAge,
            patientGender,
            appointmentDate,
            appointmentTime,
            symptoms,
            doctorName,
            doctorSpecialization,
            doctorEmail,
            doctorClerkUserId
        });

        console.log('🔍 Doctor fields - Email:', doctorEmail, 'Clerk ID:', doctorClerkUserId);

        // Sanitize and convert data types (FormData sends everything as strings)
        const sanitizedData = {
            patientName,
            patientEmail,
            patientPhone,
            patientAge: patientAge ? parseInt(patientAge) : null,
            patientGender: patientGender ? patientGender.toLowerCase() : null,
            appointmentDate,
            appointmentTime,
            symptoms: symptoms || 'General consultation',
            additionalNotes,
            emergencyContact,
            insuranceProvider,
            previousConditions,
            userId,
            clerkUserId
        };

        // Validate required fields
        const missingFields = [];
        if (!patientName) missingFields.push('patientName');
        if (!patientEmail) missingFields.push('patientEmail');
        if (!patientPhone) missingFields.push('patientPhone');
        if (!appointmentDate) missingFields.push('appointmentDate');
        if (!appointmentTime) missingFields.push('appointmentTime');

        if (missingFields.length > 0) {
            console.error('❌ Missing required fields:', missingFields);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate phone number - must be exactly 10 digits
        const phoneRegex = /^[0-9]{10}$/;
        const cleanedPhone = patientPhone.replace(/[^0-9]/g, ''); // Remove any non-digit characters
        
        if (!phoneRegex.test(cleanedPhone)) {
            console.error('❌ Invalid phone number:', patientPhone);
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number. Please enter a valid 10-digit phone number.'
            });
        }

        // Validate appointment is not in the past
        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
        const now = new Date();
        
        if (appointmentDateTime < now) {
            console.error('❌ Cannot book appointment in the past:', {
                requestedDateTime: appointmentDateTime,
                currentDateTime: now
            });
            return res.status(400).json({
                success: false,
                message: 'Cannot book an appointment in the past. Please select a future date and time.'
            });
        }

        // Validate appointment is within working hours
        const appointmentDate_obj = new Date(appointmentDate);
        const dayOfWeek = appointmentDate_obj.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[dayOfWeek];

        // Default working schedule: Monday-Friday 9AM-5PM, Saturday & Sunday OFF
        const workingDays = [1, 2, 3, 4, 5]; // Monday to Friday
        const workingHourStart = 9; // 9 AM
        const workingHourEnd = 17; // 5 PM (17:00 in 24-hour format)

        // Check if appointment is on a working day
        if (!workingDays.includes(dayOfWeek)) {
            console.error('❌ Appointment on non-working day:', {
                date: appointmentDate,
                day: dayName
            });
            return res.status(400).json({
                success: false,
                message: `Cannot book an appointment on ${dayName}. Doctors are only available Monday through Friday.`
            });
        }

        // Parse appointment time and validate working hours
        const timeMatch = appointmentTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
        if (!timeMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid time format. Please use format: HH:MM AM/PM'
            });
        }

        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();

        // Convert to 24-hour format
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }

        // Check if time is within working hours (9 AM to 5 PM)
        if (hours < workingHourStart || hours >= workingHourEnd) {
            console.error('❌ Appointment outside working hours:', {
                time: appointmentTime,
                hours24: hours,
                workingHours: `${workingHourStart}:00 - ${workingHourEnd}:00`
            });
            return res.status(400).json({
                success: false,
                message: `Cannot book an appointment at ${appointmentTime}. Working hours are 9:00 AM to 5:00 PM, Monday through Friday.`
            });
        }

        // If appointment is at the last hour (4:00 PM - 4:59 PM), check if it ends before 5 PM
        if (hours === workingHourEnd - 1 && minutes > 30) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book an appointment after 4:30 PM as appointments last 30 minutes and clinic closes at 5:00 PM.'
            });
        }

        // Handle doctor validation - doctorId is optional if doctorName/Specialization are provided
        let doctor = null;
        let finalDoctorName = doctorName;
        let finalDoctorSpecialization = doctorSpecialization;
        let consultationFee = 0;

        if (doctorId && doctorId !== 'temp-id') {
            // Try to validate doctor exists in MongoDB
            doctor = await doctorModel.findById(doctorId);
            
            if (doctor) {
                console.log('✅ Doctor found in MongoDB:', doctor.name);
                
                // Check if doctor is available
                if (!doctor.available) {
                    return res.status(400).json({
                        success: false,
                        message: 'Doctor is currently unavailable'
                    });
                }

                // Use doctor data from database
                finalDoctorName = doctor.name;
                finalDoctorSpecialization = doctor.specialization;
                consultationFee = doctor.fees;
            } else {
                console.log('⚠️ Doctor not found in MongoDB, using provided data');
                // Doctor not in MongoDB yet (static data from frontend)
                // Use the provided doctor info instead
                if (!doctorName || !doctorSpecialization) {
                    return res.status(400).json({
                        success: false,
                        message: 'Doctor information is required'
                    });
                }
            }
        } else if (!doctorName || !doctorSpecialization) {
            // If no doctorId and no doctor details provided
            return res.status(400).json({
                success: false,
                message: 'Doctor information is required'
            });
        }

        // Handle uploaded files
        let medicalReports = [];
        if (req.files && req.files.length > 0) {
            medicalReports = req.files.map(file => ({
                filename: file.filename,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size
            }));
        }

        // Prevent double-booking: check for existing booked OR pending appointment for same doctor/date/time
        const conflictQuery = { 
            appointmentDate: sanitizedData.appointmentDate, 
            appointmentTime: sanitizedData.appointmentTime, 
            status: { $in: ['booked', 'pending'] } // Check both booked and pending appointments
        };
        if (doctorEmail) {
            conflictQuery.doctorEmail = doctorEmail.toLowerCase();
        } else if (doctorId && doctorId !== 'temp-id') {
            conflictQuery.doctorId = doctorId;
        } else {
            // fallback to doctorName (less reliable but prevents obvious duplicates)
            conflictQuery.doctorName = finalDoctorName;
        }

        const existingAppointment = await appointmentModel.findOne(conflictQuery);
        if (existingAppointment) {
            console.warn('⚠️ Conflict: Slot already taken:', {
                ...conflictQuery,
                existingStatus: existingAppointment.status,
                existingId: existingAppointment._id
            });
            return res.status(409).json({
                success: false,
                message: `This time slot is already ${existingAppointment.status === 'booked' ? 'booked' : 'pending approval'} for ${finalDoctorName}. Please choose another time.`
            });
        }

        // Create appointment
        const newAppointment = new appointmentModel({
            patientName: sanitizedData.patientName,
            patientEmail: sanitizedData.patientEmail,
            patientPhone: sanitizedData.patientPhone,
            patientAge: sanitizedData.patientAge,
            patientGender: sanitizedData.patientGender,
            doctorId: (doctorId && doctorId !== 'temp-id') ? doctorId : null,
            doctorClerkUserId: doctorClerkUserId || null,
            doctorEmail: doctorEmail || null,
            doctorName: finalDoctorName,
            doctorSpecialization: finalDoctorSpecialization,
            appointmentDate: sanitizedData.appointmentDate,
            appointmentTime: sanitizedData.appointmentTime,
            symptoms: sanitizedData.symptoms,
            additionalNotes: sanitizedData.additionalNotes,
            emergencyContact: sanitizedData.emergencyContact,
            insuranceProvider: sanitizedData.insuranceProvider,
            previousConditions: sanitizedData.previousConditions,
            medicalReports,
            userId: sanitizedData.userId,
            clerkUserId: sanitizedData.clerkUserId,
            consultationFee: consultationFee,
            status: 'pending'
        });

        await newAppointment.save();

        console.log('✅ Appointment created successfully:', newAppointment._id);
        console.log('📧 Saved doctorEmail:', newAppointment.doctorEmail);
        console.log('📅 Saved appointmentDate:', newAppointment.appointmentDate);
        console.log('⏰ Saved appointmentTime:', newAppointment.appointmentTime);
        console.log('📊 Saved status:', newAppointment.status);

        // Send confirmation email
        await sendConfirmationEmail({
            patientName: sanitizedData.patientName,
            patientEmail: sanitizedData.patientEmail,
            patientPhone: sanitizedData.patientPhone,
            doctorName: finalDoctorName,
            doctorSpecialization: finalDoctorSpecialization,
            appointmentDate: sanitizedData.appointmentDate,
            appointmentTime: sanitizedData.appointmentTime
        });

        res.status(201).json({
            success: true,
            message: 'Appointment created successfully! Confirmation email sent.',
            appointment: newAppointment
        });
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating appointment',
            error: error.message
        });
    }
};

// Get user's appointments
const getUserAppointments = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find by userId or clerkUserId or email
        const appointments = await appointmentModel
            .find({
                $or: [
                    { userId: userId },
                    { clerkUserId: userId },
                    { patientEmail: userId }
                ]
            })
            .populate('doctorId', 'name specialization image phone')
            .sort({ appointmentDate: -1, appointmentTime: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('Error fetching user appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
};

// Get doctor's appointments
const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { status, date } = req.query;

        console.log('📋 Fetching appointments for doctor:', doctorId);

        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Doctor ID is required'
            });
        }

        // Build query - support MongoDB ObjectId, Clerk User ID, or Email
        let query = {};
        
        // Check if it's an email (contains @)
        if (doctorId.includes('@')) {
            console.log('🔍 Searching by doctor email');
            query.doctorEmail = doctorId.toLowerCase();
        }
        // Check if doctorId is a valid MongoDB ObjectId (24 character hex string)
        else if (typeof doctorId === 'string' && /^[0-9a-fA-F]{24}$/.test(doctorId)) {
            console.log('🔍 Searching by MongoDB doctorId');
            query.doctorId = doctorId;
        } 
        // Otherwise treat as Clerk user ID
        else {
            console.log('🔍 Searching by Clerk doctorClerkUserId');
            query.doctorClerkUserId = doctorId;
        }

        if (status) {
            query.status = status;
        }

        if (date) {
            query.appointmentDate = date;
        }

        console.log('🔎 Query:', JSON.stringify(query));

        const appointments = await appointmentModel
            .find(query)
            .sort({ appointmentDate: 1, appointmentTime: 1 });

        console.log(`✅ Found ${appointments.length} appointments for doctor`);

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('❌ Error fetching doctor appointments:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
};

// Update appointment status
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        console.log(`🔄 Updating appointment ${id} to status: ${status}`);
        console.log('📦 Request body:', req.body);
        console.log('📦 Request params:', req.params);

        const validStatuses = ['pending', 'booked', 'completed', 'cancelled', 'rescheduled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Load current appointment first
        const current = await appointmentModel.findById(id);
        if (!current) {
            console.error(`❌ Appointment not found: ${id}`);
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // If booking, ensure there is no other booked appointment for same doctor/date/time
        if (status === 'booked') {
            const match = {};
            if (current.doctorEmail) match.doctorEmail = current.doctorEmail;
            else if (current.doctorId) match.doctorId = current.doctorId;
            else match.doctorName = current.doctorName;

            const conflict = await appointmentModel.findOne({
                ...match,
                appointmentDate: current.appointmentDate,
                appointmentTime: current.appointmentTime,
                status: 'booked',
                _id: { $ne: current._id }
            });

            if (conflict) {
                console.warn('⚠️ Cannot book: slot already booked by another appointment', conflict._id);
                return res.status(409).json({ success: false, message: 'This time slot has already been booked for the doctor.' });
            }
        }

        // Perform the update
        const appointment = await appointmentModel.findByIdAndUpdate(
            id,
            status === 'cancelled'
                ? { status: 'cancelled', cancellationReason: req.body.cancellationReason || 'Cancelled', cancelledAt: new Date() }
                : { status },
            { new: true }
        );

        if (!appointment) {
            console.error(`❌ Appointment not found on update: ${id}`);
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // If we've just booked this appointment, cancel other pending appointments for same slot
        let affected = { cancelled: [] };
        if (status === 'booked') {
            const match = {};
            if (appointment.doctorEmail) match.doctorEmail = appointment.doctorEmail;
            else if (appointment.doctorId) match.doctorId = appointment.doctorId;
            else match.doctorName = appointment.doctorName;

            const others = await appointmentModel.find({
                ...match,
                appointmentDate: appointment.appointmentDate,
                appointmentTime: appointment.appointmentTime,
                status: 'pending',
                _id: { $ne: appointment._id }
            });

            if (others && others.length > 0) {
                const otherIds = others.map(o => o._id);
                const affectedUsers = others.map(o => ({ id: o._id, patientEmail: o.patientEmail, userId: o.userId, clerkUserId: o.clerkUserId }));

                await appointmentModel.updateMany(
                    { _id: { $in: otherIds } },
                    { $set: { status: 'cancelled', cancellationReason: 'Slot booked by another confirmed appointment', cancelledAt: new Date() } }
                );

                affected.cancelled = affectedUsers;
            }
        }

        console.log(`✅ Appointment ${id} updated successfully to status: ${appointment.status}`);
        console.log(`📧 Appointment doctor email: ${appointment.doctorEmail}`);
        console.log(`🆔 Appointment doctor Clerk ID: ${appointment.doctorClerkUserId}`);

        res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully',
            appointment,
            affected
        });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating appointment status',
            error: error.message
        });
    }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellationReason } = req.body;

        const appointment = await appointmentModel.findByIdAndUpdate(
            id,
            {
                status: 'cancelled',
                cancellationReason,
                cancelledAt: new Date()
            },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully',
            appointment
        });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling appointment',
            error: error.message
        });
    }
};

// Update appointment details (reschedule)
const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log(`🔄 Updating appointment ${id} with data:`, updateData);

        // Validate required fields if provided
        const allowedFields = [
            'appointmentDate', 'appointmentTime', 'symptoms', 'additionalNotes',
            'emergencyContact', 'insuranceProvider', 'previousConditions'
        ];

        const filteredData = {};
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredData[key] = updateData[key];
            }
        });

        // If updating date/time, check for conflicts
        if (filteredData.appointmentDate || filteredData.appointmentTime) {
            const currentAppointment = await appointmentModel.findById(id);
            if (!currentAppointment) {
                return res.status(404).json({
                    success: false,
                    message: 'Appointment not found'
                });
            }

            const newDate = filteredData.appointmentDate || currentAppointment.appointmentDate;
            const newTime = filteredData.appointmentTime || currentAppointment.appointmentTime;

            // Check for conflicts with the same doctor
            const conflictQuery = {
                appointmentDate: newDate,
                appointmentTime: newTime,
                status: { $in: ['booked', 'pending'] }, // Check both booked and pending appointments
                _id: { $ne: id }
            };

            if (currentAppointment.doctorEmail) {
                conflictQuery.doctorEmail = currentAppointment.doctorEmail;
            } else if (currentAppointment.doctorId) {
                conflictQuery.doctorId = currentAppointment.doctorId;
            } else {
                conflictQuery.doctorName = currentAppointment.doctorName;
            }

            const existingAppointment = await appointmentModel.findOne(conflictQuery);
            if (existingAppointment) {
                return res.status(409).json({
                    success: false,
                    message: `This time slot is already ${existingAppointment.status === 'booked' ? 'booked' : 'pending approval'}. Please choose another time.`
                });
            }
        }

        // Update the appointment
        const appointment = await appointmentModel.findByIdAndUpdate(
            id,
            filteredData,
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }

        console.log(`✅ Appointment ${id} updated successfully`);

        res.status(200).json({
            success: true,
            message: 'Appointment updated successfully',
            appointment
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating appointment',
            error: error.message
        });
    }
};

// Get all appointments (admin)
const getAllAppointments = async (req, res) => {
    try {
        const { status, doctorId, date } = req.query;
        
        let query = {};
        
        if (status) query.status = status;
        if (doctorId) query.doctorId = doctorId;
        if (date) query.appointmentDate = date;
        
        const appointments = await appointmentModel
            .find(query)
            .populate('doctorId', 'name specialization')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('Error fetching all appointments:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments',
            error: error.message
        });
    }
};

export {
    createAppointment,
    getUserAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    updateAppointment,
    getAllAppointments,
    getBookedSlots,
    checkSlotAvailability,
    getAvailableSlots,
    getDoctorAvailability,
    findNearestSlot
};

// Get booked time slots for a specific doctor and date
const getBookedSlots = async (req, res) => {
    try {
        const { doctorEmail, date } = req.query;

        if (!doctorEmail || !date) {
            return res.status(400).json({
                success: false,
                message: 'Doctor email and date are required'
            });
        }

        console.log(`🔍 Fetching booked slots for ${doctorEmail} on ${date}`);

        // Find all booked AND pending appointments for this doctor on this date
        // Pending appointments should also block slots until confirmed or cancelled
        const query = {
            doctorEmail: doctorEmail.toLowerCase(),
            appointmentDate: date,
            status: { $in: ['booked', 'pending'] } // Include both booked and pending
        };
        
        console.log('🔎 getBookedSlots query:', JSON.stringify(query));
        
        const bookedAppointments = await appointmentModel.find(query).select('appointmentTime status doctorEmail appointmentDate');

        console.log(`📋 Raw appointments found:`, bookedAppointments);
        
        const bookedSlots = bookedAppointments.map(apt => apt.appointmentTime);

        console.log(`✅ Found ${bookedSlots.length} booked/pending slots:`, bookedSlots);

        res.status(200).json({
            success: true,
            bookedSlots,
            count: bookedSlots.length
        });
    } catch (error) {
        console.error('Error fetching booked slots:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching booked slots',
            error: error.message
        });
    }
};

// ============================================
// SMART SCHEDULING ENDPOINTS
// ============================================

// Check slot availability with smart suggestions
const checkSlotAvailability = async (req, res) => {
    try {
        const { doctorId, appointmentDate, appointmentTime, priority } = req.body;

        if (!doctorId || !appointmentDate || !appointmentTime) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: doctorId, appointmentDate, appointmentTime'
            });
        }

        const smartSchedulingService = require('../services/smartSchedulingService');
        const result = await smartSchedulingService.validateAppointmentBooking(
            doctorId,
            appointmentDate,
            appointmentTime,
            priority || 'normal'
        );

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Error checking slot availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking slot availability',
            error: error.message
        });
    }
};

// Get available slots for a doctor on a specific day
const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: doctorId, date'
            });
        }

        const smartSchedulingService = require('../services/smartSchedulingService');
        const slots = await smartSchedulingService.getAvailableSlotsForDay(
            doctorId,
            new Date(date)
        );

        res.status(200).json({
            success: true,
            date,
            availableSlots: slots,
            count: slots.length
        });
    } catch (error) {
        console.error('Error getting available slots:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting available slots',
            error: error.message
        });
    }
};

// Get doctor's availability for multiple days
const getDoctorAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { days } = req.query;

        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required field: doctorId'
            });
        }

        const smartSchedulingService = require('../services/smartSchedulingService');
        const availability = await smartSchedulingService.getDoctorAvailability(
            doctorId,
            parseInt(days) || 7
        );

        res.status(200).json({
            success: true,
            doctorId,
            availability
        });
    } catch (error) {
        console.error('Error getting doctor availability:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting doctor availability',
            error: error.message
        });
    }
};

// Find nearest available slot
const findNearestSlot = async (req, res) => {
    try {
        const { doctorId, preferredDate, preferredTime, priority } = req.body;

        if (!doctorId || !preferredDate || !preferredTime) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: doctorId, preferredDate, preferredTime'
            });
        }

        const smartSchedulingService = require('../services/smartSchedulingService');
        const result = await smartSchedulingService.findNearestAvailableSlot(
            doctorId,
            preferredDate,
            preferredTime,
            priority || 'normal'
        );

        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Error finding nearest slot:', error);
        res.status(500).json({
            success: false,
            message: 'Error finding nearest slot',
            error: error.message
        });
    }
};
