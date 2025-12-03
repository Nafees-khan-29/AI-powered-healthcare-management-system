import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getDoctorAppointments, updateAppointmentStatus, cancelAppointment } from '../../../services/appointmentService';
import { createMedicalRecord, getDoctorMedicalRecords, createPrescription, getDoctorPrescriptions, updateMedicalRecord, deleteMedicalRecord } from '../../../services/medicalRecordService';
import Navbar from '../../Hero-com/Navbar';
import {
  FaUserMd,
  FaCalendarAlt,
  FaUsers,
  FaFileMedical,
  FaPills,
  FaChartLine,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendar,
  FaStethoscope,
  FaNotesMedical,
  FaPrescriptionBottle,
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaFilter,
  FaDownload,
  FaPrint,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaTimes
} from 'react-icons/fa';
import './DoctorDashboard.css';

const MedicalReportForm = ({ onClose, onSave, initialData = null, user, isLoaded }) => {
  const [formData, setFormData] = useState({
    patientName: initialData?.patientName || '',
    patientId: initialData?.patientId || '',
    patientEmail: initialData?.patientEmail || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    diagnosis: initialData?.diagnosis || '',
    symptoms: initialData?.symptoms || '',
    treatment: initialData?.treatment || '',
    notes: initialData?.notes || '',
    followUp: initialData?.followUp || '',
    prescriptions: initialData?.prescriptions || []
  });

  const [newPrescription, setNewPrescription] = useState({
    medication: '',
    dosage: '',
    duration: '',
    refills: 1,
    instructions: '',
    pharmacy: ''
  });

  const [editingIndex, setEditingIndex] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrescriptionChange = (e) => {
    const { name, value } = e.target;
    setNewPrescription(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addPrescription = () => {
    if (newPrescription.medication && newPrescription.dosage) {
      if (editingIndex !== null) {
        // Update existing prescription
        setFormData(prev => ({
          ...prev,
          prescriptions: prev.prescriptions.map((prescription, index) =>
            index === editingIndex ? { ...newPrescription } : prescription
          )
        }));
        setEditingIndex(null);
      } else {
        // Add new prescription
        setFormData(prev => ({
          ...prev,
          prescriptions: [...prev.prescriptions, { ...newPrescription }]
        }));
      }
      setNewPrescription({
        medication: '',
        dosage: '',
        duration: '',
        refills: 1,
        instructions: '',
        pharmacy: ''
      });
    }
  };

  const startEditingPrescription = (index) => {
    const prescription = formData.prescriptions[index];
    setNewPrescription({ ...prescription });
    setEditingIndex(index);
  };

  const cancelEditing = () => {
    setNewPrescription({
      medication: '',
      dosage: '',
      duration: '',
      refills: 1,
      instructions: '',
      pharmacy: ''
    });
    setEditingIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if user is loaded
    if (!isLoaded || !user) {
      alert('Please wait for authentication to complete.');
      return;
    }

    // Basic validation
    if (!formData.patientName || !formData.patientEmail || !formData.diagnosis) {
      alert('Please fill in at least patient name, patient email, and diagnosis');
      return;
    }

    // Get doctor's email from Clerk user object
    const doctorEmail = user?.primaryEmailAddress?.emailAddress;
    const doctorName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown Doctor';

    if (!doctorEmail) {
      alert('Doctor email not found. Please ensure you are logged in.');
      return;
    }

    // Ensure date is provided
    if (!formData.date || formData.date.trim() === '') {
      alert('Please select a date for the medical report.');
      return;
    }

    // Ensure diagnosis is provided
    if (!formData.diagnosis || formData.diagnosis.trim() === '') {
      alert('Please enter a diagnosis.');
      return;
    }

    const reportData = {
      ...formData,
      doctorEmail,
      doctorName,
      status: 'active',
      createdBy: doctorEmail, // Required by the model
      ...(initialData && { _id: initialData._id })
    };

    console.log('Submitting medical report data:', reportData);
    onSave(reportData);
  };

  return (
    <div className="modal-content max-w-4xl">
      <div className="modal-header">
        <h2 className="modal-title text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FaNotesMedical className="text-blue-600 text-2xl" />
          {initialData ? 'Edit Medical Report' : 'Create New Medical Report'}
        </h2>
        <p className="text-gray-600 mt-2">
          {initialData ? 'Update the medical report details below' : 'Fill in the patient information and medical details'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Patient Information Section */}
        <div className="form-section">
          <h3 className="section-title flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <FaUser className="text-blue-600" />
            Patient Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label text-sm font-medium text-gray-700">
                Patient Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="patientName"
                value={formData.patientName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter patient's full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label text-sm font-medium text-gray-700">
                Patient ID
              </label>
              <input
                type="text"
                name="patientId"
                value={formData.patientId}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Optional patient ID"
              />
            </div>

            <div className="form-group">
              <label className="form-label text-sm font-medium text-gray-700">
                Patient Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="patientEmail"
                value={formData.patientEmail}
                onChange={handleInputChange}
                className="form-input"
                placeholder="patient@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label text-sm font-medium text-gray-700">
                Report Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="form-label text-sm font-medium text-gray-700">
                Follow-up Date
              </label>
              <input
                type="date"
                name="followUp"
                value={formData.followUp}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Schedule follow-up appointment"
              />
            </div>
          </div>
        </div>

        {/* Medical Information Section */}
        <div className="form-section">
          <h3 className="section-title flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <FaStethoscope className="text-green-600" />
            Medical Information
          </h3>

          <div className="space-y-6">
            <div className="form-group">
              <label className="form-label text-sm font-medium text-gray-700">
                Diagnosis <span className="text-red-500">*</span>
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleInputChange}
                className="form-input h-24 resize-none"
                placeholder="Enter the medical diagnosis..."
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label text-sm font-medium text-gray-700">
                Symptoms
              </label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleInputChange}
                className="form-input h-24 resize-none"
                placeholder="Describe the patient's symptoms..."
              />
            </div>

            <div className="form-group">
              <label className="form-label text-sm font-medium text-gray-700">
                Treatment Plan
              </label>
              <textarea
                name="treatment"
                value={formData.treatment}
                onChange={handleInputChange}
                className="form-input h-24 resize-none"
                placeholder="Describe the treatment plan and recommendations..."
              />
            </div>

            <div className="form-group">
              <label className="form-label text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-input h-24 resize-none"
                placeholder="Any additional observations or notes..."
              />
            </div>
          </div>
        </div>

        {/* Prescriptions Section */}
        <div className="form-section">
          <h3 className="section-title flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <FaPills className="text-purple-600" />
            Prescriptions
          </h3>

          {/* Add Prescription Form */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200 mb-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaPlus className="text-purple-600" />
              {editingIndex !== null ? 'Edit Prescription' : 'Add New Prescription'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Medication <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="medication"
                  value={newPrescription.medication}
                  onChange={handlePrescriptionChange}
                  placeholder="e.g., Amoxicillin"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Dosage <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="dosage"
                  value={newPrescription.dosage}
                  onChange={handlePrescriptionChange}
                  placeholder="e.g., 500mg twice daily"
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={newPrescription.duration}
                  onChange={handlePrescriptionChange}
                  placeholder="e.g., 7 days"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Refills
                </label>
                <input
                  type="number"
                  name="refills"
                  value={newPrescription.refills}
                  onChange={handlePrescriptionChange}
                  min="0"
                  max="10"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Instructions
                </label>
                <input
                  type="text"
                  name="instructions"
                  value={newPrescription.instructions}
                  onChange={handlePrescriptionChange}
                  placeholder="e.g., Take with food"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Pharmacy
                </label>
                <input
                  type="text"
                  name="pharmacy"
                  value={newPrescription.pharmacy}
                  onChange={handlePrescriptionChange}
                  placeholder="e.g., CVS Pharmacy"
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={addPrescription}
                className="btn-primary px-6 py-2 flex items-center justify-center"
                disabled={!newPrescription.medication || !newPrescription.dosage}
              >
                {editingIndex !== null ? <FaEdit className="mr-2" /> : <FaPlus className="mr-2" />}
                {editingIndex !== null ? 'Update Prescription' : 'Add Prescription'}
              </button>
              {editingIndex !== null && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="btn-secondary px-6 py-2 flex items-center justify-center"
                >
                  <FaTimes className="mr-2" />
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {/* Current Prescriptions */}
          {formData.prescriptions.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <FaPills className="text-purple-600" />
                Current Prescriptions ({formData.prescriptions.length})
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.prescriptions.map((prescription, index) => (
                  <div key={index} className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="font-bold text-gray-900 text-lg mb-1">{prescription.medication}</h5>
                        <p className="text-sm text-blue-600 font-medium mb-2">{prescription.dosage}</p>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Duration:</span>
                            <span className="ml-1 text-gray-600">{prescription.duration || 'Not specified'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Refills:</span>
                            <span className="ml-1 text-gray-600">{prescription.refills}</span>
                          </div>
                          {prescription.instructions && (
                            <div className="col-span-2">
                              <span className="font-medium text-gray-700">Instructions:</span>
                              <span className="ml-1 text-gray-600">{prescription.instructions}</span>
                            </div>
                          )}
                          {prescription.pharmacy && (
                            <div className="col-span-2">
                              <span className="font-medium text-gray-700">Pharmacy:</span>
                              <span className="ml-1 text-gray-600">{prescription.pharmacy}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          type="button"
                          onClick={() => startEditingPrescription(index)}
                          className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-full transition-colors"
                          title="Edit Prescription"
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removePrescription(index)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                          title="Remove Prescription"
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.prescriptions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaPills className="text-4xl mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No prescriptions added yet</p>
              <p className="text-xs mt-1">Add prescriptions using the form above</p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="modal-actions border-t pt-6">
          <button 
            type="submit" 
            className="btn-primary flex-1 max-w-xs"
          >
            <FaNotesMedical className="mr-2" />
            {initialData ? 'Update Report' : 'Create Report'}
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-secondary flex-1 max-w-xs"
          >
            <FaTimes className="mr-2" />
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const DoctorDashboard = () => {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  
  // State for appointments
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [error, setError] = useState(null);

  // State for real-time data derived from appointments
  const [realPatients, setRealPatients] = useState([]);
  const [realMedicalRecords, setRealMedicalRecords] = useState([]);
  const [realPrescriptions, setRealPrescriptions] = useState([]);
  const [realAnalytics, setRealAnalytics] = useState({
    totalPatients: 0,
    totalAppointments: 0,
    completedToday: 0,
    pendingToday: 0,
    criticalCases: 0,
    revenue: 0,
    patientGrowth: 0,
    appointmentGrowth: 0,
    satisfactionRate: 0,
    monthlyStats: []
  });

  // State for medical records and prescriptions
  const [doctorMedicalRecords, setDoctorMedicalRecords] = useState([]);
  const [doctorPrescriptions, setDoctorPrescriptions] = useState([]);
  const [isLoadingMedicalRecords, setIsLoadingMedicalRecords] = useState(false);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);

  // Fetch appointments function (extracted for manual refresh)
  const fetchAppointments = async () => {
    if (!user?.id || !isLoaded) return;
    
    console.log('🔄 fetchAppointments called - Starting to fetch...');
    
    try {
      setIsLoadingAppointments(true);
      setError(null);
      
      // Get the doctor's email from Clerk user
      const doctorEmail = user?.primaryEmailAddress?.emailAddress;
      
      console.log('📧 Doctor email:', doctorEmail);
      
      // Use email to fetch appointments (since appointments are linked by email)
      const result = await getDoctorAppointments(doctorEmail || user.id);
      
      console.log('📥 Fetched appointments result:', result);
      console.log(`📊 Number of appointments fetched: ${result.appointments?.length || 0}`);
      
      if (result.success) {
        // Transform API response to component format
        const transformedAppointments = result.appointments
          .filter(apt => apt.status !== 'cancelled') // Filter out cancelled appointments
          .map(apt => ({
            id: apt._id,
            patientName: apt.patientName,
            patientId: apt._id.substring(0, 8).toUpperCase(),
            date: apt.appointmentDate,
            time: apt.appointmentTime,
            type: 'Consultation',
            status: apt.status,
            priority: apt.status === 'urgent' ? 'critical' : apt.status === 'confirmed' ? 'high' : 'medium',
            symptoms: apt.symptoms || 'Not specified',
            phone: apt.patientPhone,
            email: apt.patientEmail,
            age: apt.patientAge,
            gender: apt.patientGender,
            medicalReports: apt.medicalReports || []
          }));
        
        console.log('✅ Transformed appointments:', transformedAppointments);
        console.log('📝 Statuses:', transformedAppointments.map(a => `${a.patientName}: ${a.status}`));
        
        setAppointments(transformedAppointments);

        // Compute real-time data from appointments
        computeRealTimeData(transformedAppointments);
      } else {
        setError(result.message || 'Failed to load appointments');
      }
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('An error occurred while loading appointments');
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  // Fetch appointments when component mounts or user changes
  useEffect(() => {
    fetchAppointments();
  }, [user, isLoaded]);

  // Listen for appointment update events (for real-time UI updates)
  useEffect(() => {
    const handleAppointmentUpdate = (e) => {
      console.log('🔔 Received appointmentUpdated event in DoctorDashboard:', e.detail);
      // Refresh appointments to reflect changes from user dashboard
      fetchAppointments();
    };

    window.addEventListener('appointmentUpdated', handleAppointmentUpdate);
    return () => window.removeEventListener('appointmentUpdated', handleAppointmentUpdate);
  }, []);

  // Listen for localStorage changes (for cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'appointment_update') {
        console.log('🔔 Received localStorage appointment_update in DoctorDashboard');
        try {
          const payload = JSON.parse(e.newValue);
          console.log('📦 Appointment update payload:', payload);
          // Refresh appointments to reflect changes
          fetchAppointments();
        } catch (err) {
          console.warn('Could not parse appointment_update payload:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Handle appointment status update
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    console.log('🖱️ Button clicked! handleStatusUpdate triggered');
    console.log(`🔄 Updating appointment ${appointmentId} to status: ${newStatus}`);
    console.log(`📊 Current appointments count BEFORE update: ${appointments.length}`);
    console.log('🎯 Appointment ID type:', typeof appointmentId, 'Value:', appointmentId);
    console.log('🎯 New status type:', typeof newStatus, 'Value:', newStatus);
    
    try {
      console.log('⏳ Calling updateAppointmentStatus API...');
      const result = await updateAppointmentStatus(appointmentId, newStatus);
      
      console.log('✅ Update result:', result);
      console.log('✅ Updated appointment from API:', result.appointment);
      
      if (result.success) {
        console.log('🔄 Update successful! Updating local state...');
        
        // APPROACH 1: Optimistic UI update - Update the appointment in local state immediately
        setAppointments(prevAppointments => {
          console.log('� Updating appointments in state...');
          const updated = prevAppointments.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus, priority: newStatus === 'booked' ? 'high' : apt.priority }
              : apt
          );
          console.log('✅ Local state updated:', updated.find(a => a.id === appointmentId));
          return updated;
        });
        
        // APPROACH 2: Refetch from server for consistency
        console.log('🔄 Fetching appointments from server to ensure consistency...');
        await fetchAppointments();
        console.log(`📊 Appointments refetched, count: ${appointments.length}`);
        
        // Notify other tabs (user dashboards) about this update so they can refresh too
        try {
          localStorage.setItem('appointment_update', JSON.stringify({ id: appointmentId, status: newStatus, ts: Date.now() }));
          // Also dispatch a custom event for same-tab updates
          window.dispatchEvent(new CustomEvent('appointmentUpdated', { 
            detail: { id: appointmentId, status: newStatus } 
          }));
        } catch (e) {
          console.warn('Could not write to localStorage:', e);
        }

        // If API returned affected cancelled appointments, inform the doctor
        if (result.affected && result.affected.cancelled && result.affected.cancelled.length > 0) {
          const cancelledCount = result.affected.cancelled.length;
          const emails = result.affected.cancelled.map(a => a.patientEmail).filter(Boolean);
          alert(`Appointment ${newStatus === 'booked' ? 'booked' : newStatus === 'completed' ? 'completed' : 'updated'} successfully!\nNote: ${cancelledCount} other pending appointment(s) for the same slot were cancelled.` + (emails.length ? `\nCancelled patients: ${emails.join(', ')}` : ''));
        } else {
          alert(`Appointment ${newStatus === 'booked' ? 'booked' : newStatus === 'completed' ? 'completed' : 'updated'} successfully! Patient will be notified.`);
        }
      } else {
        console.error('❌ Update failed:', result.message);
        alert(result.message || 'Failed to update appointment status');
      }
    } catch (err) {
      console.error('❌ Error updating appointment status:', err);
      alert('An error occurred while updating the appointment');
    }
  };

  // Handle appointment cancellation/deletion
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      const result = await cancelAppointment(appointmentId, 'Cancelled by doctor');
      
      if (result.success) {
        // Remove the appointment from the local state
        setAppointments(prevAppointments =>
          prevAppointments.filter(apt => apt.id !== appointmentId)
        );
        alert('Appointment cancelled successfully');
      } else {
        alert(result.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('An error occurred while cancelling the appointment');
    }
  };

  // Function to compute real-time data from appointments
  const computeRealTimeData = (appointmentsData) => {
    console.log('🔄 Computing real-time data from appointments...');

    // Compute unique patients
    const uniquePatients = {};
    appointmentsData.forEach(apt => {
      const key = apt.patientEmail || apt.patientName;
      if (!uniquePatients[key]) {
        uniquePatients[key] = {
          id: apt.patientId,
          name: apt.patientName,
          age: apt.patientAge || 'N/A',
          gender: apt.patientGender || 'N/A',
          phone: apt.patientPhone || 'N/A',
          email: apt.patientEmail || 'N/A',
          lastVisit: apt.appointmentDate,
          nextAppointment: null, // Could be enhanced to find next appointment
          status: 'active',
          medicalHistory: [], // Empty for now, could be enhanced
          emergencyContact: '' // Empty for now
        };
      }
    });
    const patientsArray = Object.values(uniquePatients);
    setRealPatients(patientsArray);
    console.log('✅ Computed real patients:', patientsArray.length);

    // Compute medical records from appointments
    const medicalRecordsArray = appointmentsData.map(apt => ({
      id: apt._id,
      patientName: apt.patientName,
      patientId: apt.patientId,
      date: apt.appointmentDate,
      diagnosis: apt.symptoms || 'Appointment scheduled',
      symptoms: apt.symptoms || 'Not specified',
      treatment: 'To be determined during consultation',
      notes: `Appointment ${apt.status} - ${apt.symptoms || 'No additional notes'}`,
      followUp: null, // Could be enhanced
      status: apt.status === 'completed' ? 'resolved' : 'active'
    }));
    setRealMedicalRecords(medicalRecordsArray);
    console.log('✅ Computed medical records:', medicalRecordsArray.length);

    // For prescriptions, we'll keep dummy data for now as there's no prescription system yet
    // In a real system, prescriptions would be a separate collection
    setRealPrescriptions([]);

    // Compute analytics
    const totalPatients = patientsArray.length;
    const totalAppointments = appointmentsData.length;
    const today = new Date().toISOString().split('T')[0];
    const completedToday = appointmentsData.filter(apt => apt.status === 'completed' && apt.date === today).length;
    const pendingToday = appointmentsData.filter(apt => apt.status === 'pending' && apt.date === today).length;
    const criticalCases = appointmentsData.filter(apt => apt.status === 'urgent').length;

    const analyticsData = {
      totalPatients,
      totalAppointments,
      completedToday,
      pendingToday,
      criticalCases,
      revenue: 0, // Would need pricing system
      patientGrowth: 0, // Would need historical data
      appointmentGrowth: 0, // Would need historical data
      satisfactionRate: 0, // Would need feedback system
      monthlyStats: [] // Would need historical data
    };
    setRealAnalytics(analyticsData);
    console.log('✅ Computed analytics:', analyticsData);
  };

  // Mock data for other sections (keep existing)
  const patients = [
    {
      id: 'P001',
      name: 'John Smith',
      age: 35,
      gender: 'Male',
      phone: '+1-555-0123',
      email: 'john.smith@email.com',
      lastVisit: '2024-01-10',
      nextAppointment: '2024-01-15',
      status: 'active',
      medicalHistory: ['Hypertension', 'Diabetes'],
      emergencyContact: 'Mary Smith (+1-555-0127)'
    },
    {
      id: 'P002',
      name: 'Sarah Johnson',
      age: 28,
      gender: 'Female',
      phone: '+1-555-0124',
      email: 'sarah.johnson@email.com',
      lastVisit: '2024-01-08',
      nextAppointment: '2024-01-15',
      status: 'active',
      medicalHistory: ['Asthma'],
      emergencyContact: 'David Johnson (+1-555-0128)'
    },
    {
      id: 'P003',
      name: 'Michael Brown',
      age: 42,
      gender: 'Male',
      phone: '+1-555-0125',
      email: 'michael.brown@email.com',
      lastVisit: '2024-01-12',
      nextAppointment: '2024-01-15',
      status: 'active',
      medicalHistory: ['Heart disease'],
      emergencyContact: 'Lisa Brown (+1-555-0129)'
    }
  ];

  const medicalRecords = [
    {
      id: 1,
      patientName: 'John Smith',
      patientId: 'P001',
      date: '2024-01-10',
      diagnosis: 'Hypertension, Type 2 Diabetes',
      symptoms: 'High blood pressure, frequent urination, fatigue',
      treatment: 'Lisinopril 10mg daily, Metformin 500mg twice daily',
      notes: 'Patient shows improvement with current medication. Continue monitoring blood pressure.',
      followUp: '2024-01-25',
      status: 'active'
    },
    {
      id: 2,
      patientName: 'Sarah Johnson',
      patientId: 'P002',
      date: '2024-01-08',
      diagnosis: 'Asthma exacerbation',
      symptoms: 'Wheezing, shortness of breath, chest tightness',
      treatment: 'Albuterol inhaler as needed, Prednisone 20mg daily for 5 days',
      notes: 'Patient responded well to treatment. Asthma is now under control.',
      followUp: '2024-01-22',
      status: 'resolved'
    }
  ];

  const prescriptions = [
    {
      id: 1,
      patientName: 'John Smith',
      patientId: 'P001',
      date: '2024-01-10',
      medication: 'Lisinopril 10mg',
      dosage: '1 tablet daily',
      duration: '30 days',
      refills: 3,
      status: 'active',
      notes: 'Take in the morning. Monitor for dizziness.',
      pharmacy: 'CVS Pharmacy'
    },
    {
      id: 2,
      patientName: 'John Smith',
      patientId: 'P001',
      date: '2024-01-10',
      medication: 'Metformin 500mg',
      dosage: '1 tablet twice daily with meals',
      duration: '30 days',
      refills: 3,
      status: 'active',
      notes: 'Take with food to reduce stomach upset.',
      pharmacy: 'CVS Pharmacy'
    },
    {
      id: 3,
      patientName: 'Sarah Johnson',
      patientId: 'P002',
      date: '2024-01-08',
      medication: 'Albuterol Inhaler',
      dosage: '2 puffs as needed for shortness of breath',
      duration: '90 days',
      refills: 2,
      status: 'active',
      notes: 'Use before exercise and as needed for symptoms.',
      pharmacy: 'Walgreens'
    }
  ];

  const analytics = {
    totalPatients: 156,
    totalAppointments: 23,
    completedToday: 8,
    pendingToday: 5,
    criticalCases: 2,
    revenue: 2840,
    patientGrowth: 12.5,
    appointmentGrowth: 8.3,
    satisfactionRate: 4.8,
    monthlyStats: [
      { month: 'Jan', patients: 142, appointments: 89, revenue: 2840 },
      { month: 'Dec', patients: 138, appointments: 82, revenue: 2650 },
      { month: 'Nov', patients: 135, appointments: 78, revenue: 2510 }
    ]
  };
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUserMd },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
    { id: 'patients', label: 'Patients', icon: FaUsers },
    { id: 'medical-records', label: 'Medical Records', icon: FaFileMedical },
    { id: 'medical-reports', label: 'Medical Reports', icon: FaNotesMedical },
    { id: 'prescriptions', label: 'Prescriptions', icon: FaPills },
    // { id: 'analytics', label: 'Analytics', icon: FaChartLine }
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedItem(null);
  };

  const handleAppointmentAction = (appointmentId, action) => {
    console.log(`Action: ${action} for appointment ${appointmentId}`);
    
    if (action === 'confirm') {
      handleStatusUpdate(appointmentId, 'booked');
    } else if (action === 'complete') {
      handleStatusUpdate(appointmentId, 'completed');
    } else if (action === 'reschedule') {
      // TODO: Implement reschedule functionality
      alert('Reschedule functionality coming soon!');
      closeModal();
    } else {
      closeModal();
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      booked: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      urgent: 'bg-red-100 text-red-800',
      active: 'bg-blue-100 text-blue-800',
      resolved: 'bg-gray-100 text-gray-800'
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return priorityClasses[priority] || 'bg-gray-100 text-gray-800';
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-icon bg-blue-500">
            <FaUsers className="text-white" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{realAnalytics.totalPatients}</h3>
            <p className="stat-label">Total Patients</p>
            <span className="stat-change positive">+{realAnalytics.patientGrowth}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green-500">
            <FaCalendarAlt className="text-white" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{realAnalytics.totalAppointments}</h3>
            <p className="stat-label">This Month</p>
            <span className="stat-change positive">+{realAnalytics.appointmentGrowth}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-yellow-500">
            <FaClock className="text-white" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{realAnalytics.pendingToday}</h3>
            <p className="stat-label">Pending Today</p>
            <span className="stat-change neutral">No change</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-red-500">
            <FaExclamationTriangle className="text-white" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{realAnalytics.criticalCases}</h3>
            <p className="stat-label">Critical Cases</p>
            <span className="stat-change negative">Requires attention</span>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
          <button className="btn-primary">
            <FaPlus className="mr-2" />
            Add Appointment
          </button>
        </div>
        
        <div className="space-y-3">
          {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).map(appointment => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-time">
                <FaClock className="text-blue-500" />
                <span className="font-medium">{appointment.time}</span>
              </div>
              <div className="appointment-details">
                <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
                <p className="text-sm text-gray-600">{appointment.type}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`status-badge ${getStatusBadge(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  <span className={`priority-badge ${getPriorityBadge(appointment.priority)}`}>
                    {appointment.priority}
                  </span>
                </div>
              </div>
              <div className="appointment-actions">
                <button 
                  onClick={() => openModal('appointment', appointment)}
                  className="btn-secondary btn-sm"
                >
                  <FaEye className="mr-1" />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Medical Records */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Medical Records</h3>
        <div className="space-y-3">
          {realMedicalRecords.slice(0, 3).map(record => (
            <div key={record.id} className="medical-record-card">
              <div className="record-header">
                <h4 className="font-medium text-gray-900">{record.patientName}</h4>
                <span className="text-sm text-gray-500">{record.date}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{record.diagnosis}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`status-badge ${getStatusBadge(record.status)}`}>
                  {record.status}
                </span>
                <button 
                  onClick={() => openModal('medical-record', record)}
                  className="btn-secondary btn-sm"
                >
                  <FaEye className="mr-1" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="booked">Booked</option>
            <option value="pending">Pending</option>
            <option value="urgent">Urgent</option>
          </select>

          <select 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
          </select>
        </div>

        <button className="btn-primary">
          <FaPlus className="mr-2" />
          New Appointment
        </button>
      </div>

      {/* Appointments Table */}
      {isLoadingAppointments ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-red-500 mb-4">
            <FaExclamationCircle className="text-5xl mx-auto mb-3" />
            <p className="text-lg font-semibold">Error Loading Appointments</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary mt-4"
          >
            Try Again
          </button>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <FaCalendarAlt className="text-5xl mx-auto mb-4 text-gray-300" />
          <p className="text-lg mb-2">No appointments found</p>
          <p className="text-sm">You don't have any appointments yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Results count */}
        {(filterStatus !== 'all' || filterDate !== 'all' || searchQuery) && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredAppointments.length}</span> of <span className="font-semibold text-gray-900">{appointments.length}</span> appointments
            </p>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Patient</th>
                <th className="table-header">Date & Time</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Priority</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <FaFilter className="text-5xl mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg mb-2">No appointments match your filters</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map(appointment => (
                <tr key={appointment.id} className="hover:bg-gray-50">
                  <td className="table-cell">
                    <div className="patient-info">
                      <div className="patient-avatar">
                        <FaUser className="text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-500">ID: {appointment.patientId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-gray-900">{appointment.date}</div>
                    <div className="text-sm text-gray-500">{appointment.time}</div>
                  </td>
                  <td className="table-cell">
                    <span className="appointment-type">{appointment.type}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${getStatusBadge(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`priority-badge ${getPriorityBadge(appointment.priority)}`}>
                      {appointment.priority}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="action-buttons">
                      {appointment.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(appointment.id, 'booked')}
                          className="btn-icon btn-success btn-sm"
                          title="Book Appointment"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      {appointment.status === 'booked' && (
                        <button 
                          onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                          className="btn-icon btn-primary btn-sm"
                          title="Mark as Completed"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      <button 
                        onClick={() => openModal('appointment', appointment)}
                        className="btn-icon btn-primary btn-sm"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => openModal('edit-appointment', appointment)}
                        className="btn-icon btn-secondary btn-sm"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleCancelAppointment(appointment.id)}
                        className="btn-icon btn-danger btn-sm"
                        title="Cancel Appointment"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
        </div>
      )}
    </div>
  );

 

  const renderMedicalRecords = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search medical records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button className="btn-primary">
          <FaPlus className="mr-2" />
          New Record
        </button>
      </div>

      {/* Medical Records */}
      <div className="space-y-4">
        {realMedicalRecords.map(record => (
          <div key={record.id} className="medical-record-card-large">
            <div className="record-header-large">
              <div className="record-patient-info">
                <h3 className="record-patient-name">{record.patientName}</h3>
                <p className="record-patient-id">ID: {record.patientId}</p>
                <p className="record-date">{record.date}</p>
              </div>
              <div className="record-status">
                <span className={`status-badge ${getStatusBadge(record.status)}`}>
                  {record.status}
                </span>
              </div>
            </div>
            
            <div className="record-content">
              <div className="record-section">
                <h4 className="record-section-title">
                  <FaStethoscope className="mr-2" />
                  Diagnosis
                </h4>
                <p className="record-section-content">{record.diagnosis}</p>
              </div>
              
              <div className="record-section">
                <h4 className="record-section-title">
                  <FaNotesMedical className="mr-2" />
                  Symptoms
                </h4>
                <p className="record-section-content">{record.symptoms}</p>
              </div>
              
              <div className="record-section">
                <h4 className="record-section-title">
                  <FaPills className="mr-2" />
                  Treatment
                </h4>
                <p className="record-section-content">{record.treatment}</p>
              </div>
              
              <div className="record-section">
                <h4 className="record-section-title">
                  <FaNotesMedical className="mr-2" />
                  Notes
                </h4>
                <p className="record-section-content">{record.notes}</p>
              </div>
              
              <div className="record-footer">
                <div className="record-followup">
                  <span className="followup-label">Follow-up:</span>
                  <span className="followup-date">{record.followUp}</span>
                </div>
                
                <div className="record-actions">
                  <button 
                    onClick={() => openModal('medical-record', record)}
                    className="btn-secondary btn-sm"
                  >
                    <FaEye className="mr-1" />
                    View Full
                  </button>
                  <button 
                    onClick={() => openModal('edit-medical-record', record)}
                    className="btn-primary btn-sm"
                  >
                    <FaEdit className="mr-1" />
                    Edit
                  </button>
                  <button className="btn-secondary btn-sm">
                    <FaPrint className="mr-1" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search prescriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button className="btn-primary">
          <FaPlus className="mr-2" />
          New Prescription
        </button>
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-header">Patient</th>
                <th className="table-header">Medication</th>
                <th className="table-header">Dosage</th>
                <th className="table-header">Duration</th>
                <th className="table-header">Refills</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {realPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FaPills className="text-5xl mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg mb-2">No prescriptions found</p>
                    <p className="text-gray-400 text-sm">Prescription system not yet implemented</p>
                  </td>
                </tr>
              ) : (
                realPrescriptions.map(prescription => (
                  <tr key={prescription.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="patient-info">
                        <div className="patient-avatar">
                          <FaUser className="text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{prescription.patientName}</div>
                          <div className="text-sm text-gray-500">ID: {prescription.patientId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">{prescription.medication}</div>
                      <div className="text-sm text-gray-500">{prescription.pharmacy}</div>
                    </td>
                    <td className="table-cell">
                      <span className="prescription-dosage">{prescription.dosage}</span>
                    </td>
                    <td className="table-cell">
                      <span className="prescription-duration">{prescription.duration}</span>
                    </td>
                    <td className="table-cell">
                      <span className="prescription-refills">{prescription.refills}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusBadge(prescription.status)}`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="action-buttons">
                        <button 
                          onClick={() => openModal('prescription', prescription)}
                          className="btn-icon btn-primary btn-sm"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button 
                          onClick={() => openModal('edit-prescription', prescription)}
                          className="btn-icon btn-secondary btn-sm"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button className="btn-icon btn-secondary btn-sm" title="Print">
                          <FaPrint />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderMedicalReports = () => (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Medical Reports</h2>
            <p className="text-gray-600 mt-1">Create and manage detailed medical reports for your patients</p>
          </div>
          <button
            onClick={() => openModal('create-medical-report')}
            className="btn-primary"
          >
            <FaPlus className="mr-2" />
            Create Medical Report
          </button>
        </div>
      </div>

      {/* Medical Reports List */}
      <div className="space-y-4">
        {isLoadingMedicalRecords ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading medical reports...</p>
          </div>
        ) : doctorMedicalRecords.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <FaNotesMedical className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">No medical reports found</p>
            <p className="text-sm">Create your first medical report to get started</p>
          </div>
        ) : (
          doctorMedicalRecords.map(record => (
            <div key={record._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{record.patientName}</h3>
                  <p className="text-sm text-gray-500">Patient ID: {record.patientId}</p>
                  <p className="text-sm text-gray-500">Date: {new Date(record.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`status-badge ${getStatusBadge(record.status || 'active')}`}>
                    {record.status || 'active'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openModal('view-medical-report', record)}
                      className="btn-icon btn-primary btn-sm"
                      title="View Report"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => openModal('edit-medical-report', record)}
                      className="btn-icon btn-secondary btn-sm"
                      title="Edit Report"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteMedicalReport(record._id)}
                      className="btn-icon btn-danger btn-sm"
                      title="Delete Report"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Diagnosis</h4>
                  <p className="text-sm text-gray-600">{record.diagnosis}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
                  <p className="text-sm text-gray-600">{record.symptoms}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Treatment</h4>
                  <p className="text-sm text-gray-600">{record.treatment}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Follow-up</h4>
                  <p className="text-sm text-gray-600">{record.followUp || 'Not scheduled'}</p>
                </div>
              </div>

              {record.prescriptions && record.prescriptions.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Prescriptions</h4>
                  <div className="space-y-2">
                    {record.prescriptions.map((prescription, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{prescription.medication}</p>
                            <p className="text-sm text-gray-600">{prescription.dosage}</p>
                            {prescription.instructions && (
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Instructions:</span> {prescription.instructions}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm text-gray-500 ml-4">
                            <p>{prescription.duration || 'N/A'}</p>
                            <p>{prescription.refills} refill{prescription.refills !== 1 ? 's' : ''}</p>
                            {prescription.pharmacy && <p className="text-xs">{prescription.pharmacy}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

 

  const renderModal = () => {
    if (!showModal) return null;

    const renderModalContent = () => {
      switch (modalType) {
        case 'appointment':
          return (
            <div className="modal-content">
              <h2 className="modal-title">Appointment Details</h2>
              <div className="space-y-4">
                <div className="info-group">
                  <label className="info-label">Patient Name</label>
                  <p className="info-value">{selectedItem.patientName}</p>
                </div>
                <div className="info-group">
                  <label className="info-label">Date & Time</label>
                  <p className="info-value">{selectedItem.date} at {selectedItem.time}</p>
                </div>
                <div className="info-group">
                  <label className="info-label">Type</label>
                  <p className="info-value">{selectedItem.type}</p>
                </div>
                <div className="info-group">
                  <label className="info-label">Symptoms</label>
                  <p className="info-value">{selectedItem.symptoms}</p>
                </div>
                <div className="info-group">
                  <label className="info-label">Contact</label>
                  <p className="info-value">{selectedItem.phone} | {selectedItem.email}</p>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => handleAppointmentAction(selectedItem.id, 'confirm')}
                  className="btn-primary"
                >
                  Confirm Appointment
                </button>
                <button 
                  onClick={() => handleAppointmentAction(selectedItem.id, 'reschedule')}
                  className="btn-secondary"
                >
                  Reschedule
                </button>
                <button onClick={closeModal} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          );

        case 'patient':
          return (
            <div className="modal-content">
              <h2 className="modal-title">Patient Profile</h2>
              <div className="space-y-4">
                <div className="info-group">
                  <label className="info-label">Patient ID</label>
                  <p className="info-value">{selectedItem.id}</p>
                </div>
                <div className="info-group">
                  <label className="info-label">Name</label>
                  <p className="info-value">{selectedItem.name}</p>
                </div>
                <div className="info-group">
                  <label className="info-label">Age & Gender</label>
                  <p className="info-value">{selectedItem.age} years, {selectedItem.gender}</p>
                </div>
                <div className="info-group">
                  <label className="info-label">Medical History</label>
                  <p className="info-value">{selectedItem.medicalHistory.join(', ')}</p>
                </div>
                <div className="info-group">
                  <label className="info-label">Emergency Contact</label>
                  <p className="info-value">{selectedItem.emergencyContact}</p>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => openModal('edit-patient', selectedItem)}
                  className="btn-primary"
                >
                  Edit Profile
                </button>
                <button onClick={closeModal} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          );

        case 'create-medical-report':
          return <MedicalReportForm onClose={closeModal} onSave={handleSaveMedicalReport} user={user} isLoaded={isLoaded} />;

        case 'view-medical-report':
          return (
            <div className="modal-content">
              <h2 className="modal-title">Medical Report Details</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="info-group">
                    <label className="info-label">Patient Name</label>
                    <p className="info-value">{selectedItem.patientName}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Patient ID</label>
                    <p className="info-value">{selectedItem.patientId}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Date</label>
                    <p className="info-value">{new Date(selectedItem.date).toLocaleDateString()}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Status</label>
                    <p className="info-value">{selectedItem.status || 'Active'}</p>
                  </div>
                </div>

                <div className="info-group">
                  <label className="info-label">Diagnosis</label>
                  <p className="info-value">{selectedItem.diagnosis}</p>
                </div>

                <div className="info-group">
                  <label className="info-label">Symptoms</label>
                  <p className="info-value">{selectedItem.symptoms}</p>
                </div>

                <div className="info-group">
                  <label className="info-label">Treatment</label>
                  <p className="info-value">{selectedItem.treatment}</p>
                </div>

                <div className="info-group">
                  <label className="info-label">Notes</label>
                  <p className="info-value">{selectedItem.notes}</p>
                </div>

                <div className="info-group">
                  <label className="info-label">Follow-up Date</label>
                  <p className="info-value">{selectedItem.followUp || 'Not scheduled'}</p>
                </div>

                {selectedItem.prescriptions && selectedItem.prescriptions.length > 0 && (
                  <div className="info-group">
                    <label className="info-label">Prescriptions</label>
                    <div className="space-y-3">
                      {selectedItem.prescriptions.map((prescription, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <strong className="text-gray-900">{prescription.medication}</strong>
                              <p className="text-sm text-gray-600 mt-1">{prescription.dosage}</p>
                              {prescription.instructions && (
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">Instructions:</span> {prescription.instructions}
                                </p>
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Duration:</span> {prescription.duration || 'Not specified'}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Refills:</span> {prescription.refills}
                              </p>
                              {prescription.pharmacy && (
                                <p className="text-sm">
                                  <span className="font-medium">Pharmacy:</span> {prescription.pharmacy}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => openModal('edit-medical-report', selectedItem)}
                  className="btn-primary"
                >
                  Edit Report
                </button>
                <button onClick={closeModal} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          );

        case 'edit-medical-report':
          return <MedicalReportForm onClose={closeModal} onSave={handleSaveMedicalReport} initialData={selectedItem} user={user} isLoaded={isLoaded} />;

        default:
          return (
            <div className="modal-content">
              <h2 className="modal-title">Details</h2>
              <p className="text-gray-600">Modal content for {modalType}</p>
              <div className="modal-actions">
                <button onClick={closeModal} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          );
      }
    };

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-container-large" onClick={e => e.stopPropagation()}>
          {renderModalContent()}
        </div>
      </div>
    );
  };

  // Filter appointments based on search, status, and date filters
  const getFilteredAppointments = () => {
    let filtered = [...appointments];
    
    // Search filter (by patient name)
    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Status filter
    if (filterStatus && filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }
    
    // Date filter
    if (filterDate && filterDate !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date);
        aptDate.setHours(0, 0, 0, 0);
        
        if (filterDate === 'today') {
          return aptDate.getTime() === today.getTime();
        } else if (filterDate === 'tomorrow') {
          return aptDate.getTime() === tomorrow.getTime();
        } else if (filterDate === 'week') {
          return aptDate >= today && aptDate <= nextWeek;
        }
        return true;
      });
    }
    
    return filtered;
  };

  const filteredAppointments = getFilteredAppointments();

  // Handle saving medical report
  const handleSaveMedicalReport = async (reportData) => {
    try {
      if (reportData._id) {
        // Update existing report
        await updateMedicalRecord(reportData._id, reportData);
        alert('Medical report updated successfully!');
      } else {
        // Create new report
        await createMedicalRecord(reportData);
        alert('Medical report created successfully!');
        
        // Notify user dashboard about the new medical record
        try {
          localStorage.setItem('medical_record_created', JSON.stringify({ 
            patientEmail: reportData.patientEmail,
            ts: Date.now() 
          }));
          // Also dispatch a custom event for same-tab updates
          window.dispatchEvent(new CustomEvent('medicalRecordCreated', { 
            detail: { patientEmail: reportData.patientEmail } 
          }));
        } catch (e) {
          console.warn('Could not write to localStorage:', e);
        }
        
        // Also notify about prescriptions if any were created
        if (reportData.prescriptions && reportData.prescriptions.length > 0) {
          try {
            localStorage.setItem('prescription_created', JSON.stringify({ 
              patientEmail: reportData.patientEmail,
              ts: Date.now() 
            }));
            window.dispatchEvent(new CustomEvent('prescriptionCreated', { 
              detail: { patientEmail: reportData.patientEmail } 
            }));
          } catch (e) {
            console.warn('Could not write to localStorage for prescriptions:', e);
          }
        }
      }

      // Refresh medical records
      fetchDoctorMedicalRecords();
      
      // Refresh prescriptions if any were included in the report
      if (reportData.prescriptions && reportData.prescriptions.length > 0) {
        fetchDoctorPrescriptions();
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving medical report:', error);
      alert('Failed to save medical report. Please try again.');
    }
  };

  // Handle deleting medical report
  const handleDeleteMedicalReport = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this medical report? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMedicalRecord(recordId);
      alert('Medical report deleted successfully!');
      
      // Refresh medical records
      fetchDoctorMedicalRecords();
      
      // Also refresh prescriptions as they might be associated with the deleted record
      fetchDoctorPrescriptions();
      
    } catch (error) {
      console.error('Error deleting medical report:', error);
      alert('Failed to delete medical report. Please try again.');
    }
  };

  // Fetch doctor's medical records
  const fetchDoctorMedicalRecords = async () => {
    if (!user?.id || !isLoaded) return;

    try {
      setIsLoadingMedicalRecords(true);
      const doctorEmail = user?.primaryEmailAddress?.emailAddress;
      const result = await getDoctorMedicalRecords(doctorEmail || user.id);

      if (result.success) {
        setDoctorMedicalRecords(result.medicalRecords);
      }
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setIsLoadingMedicalRecords(false);
    }
  };

  // Fetch doctor's prescriptions
  const fetchDoctorPrescriptions = async () => {
    if (!user?.id || !isLoaded) return;

    try {
      setIsLoadingPrescriptions(true);
      const doctorEmail = user?.primaryEmailAddress?.emailAddress;
      const result = await getDoctorPrescriptions(doctorEmail || user.id);

      if (result.success) {
        setDoctorPrescriptions(result.prescriptions);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setIsLoadingPrescriptions(false);
    }
  };

  // Fetch medical records and prescriptions when component mounts
  useEffect(() => {
    fetchDoctorMedicalRecords();
    fetchDoctorPrescriptions();
  }, [user, isLoaded]);

  return (
    <>
      {/* Navbar - positioned outside dashboard container */}
      <Navbar />
      
      <div className="doctor-dashboard">
        {/* Add top padding to account for fixed navbar */}
        <div className="pt-20 ">
        {/* Header */}
        {/* <div className="">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
          <p className="text-gray-600">Manage your patients and practice</p>
        </div> */}

      {/* Tabs */}
      <div className="mb-6 bg-white p-6">
        <div className="border-b border-gray-200 bg-white">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="inline mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content bg-white">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'appointments' && renderAppointments()}
        {/* {activeTab === 'patients' && renderPatients()} */}
        {activeTab === 'medical-records' && renderMedicalRecords()}
        {activeTab === 'medical-reports' && renderMedicalReports()}
        {activeTab === 'prescriptions' && renderPrescriptions()}
        {/* {activeTab === 'analytics' && renderAnalytics()} */}
      </div>

      {/* Modal */}
      {renderModal()}
        </div>
      </div>
    </>
  );
};

export default DoctorDashboard;
