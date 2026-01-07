import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getDoctorAppointments, updateAppointmentStatus, cancelAppointment } from '../../../services/appointmentService';
import { createMedicalRecord, getDoctorMedicalRecords, createPrescription, getDoctorPrescriptions, updateMedicalRecord, deleteMedicalRecord, deletePrescription } from '../../../services/medicalRecordService';
import { getDoctorAlerts, acknowledgeAlert, resolveAlert, deleteAlert, sendVideoCallLink } from '../../../services/emergencyAlertService';
import { sendPatientVideoCallLink } from '../../../services/doctorService';
import { getUserByEmail } from '../../../services/userService';
import Navbar from '../../Hero-com/Navbar';
import VideoCallRoom from '../../VideoCall/VideoCallRoom';
import Footer from '../../Hero-com/Footer';
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
  FaTimes,
  FaVideo,
  FaPhoneAlt,
  FaComments,
  FaPhoneSlash,
  FaHome,
  FaQuestionCircle,
  FaHeartbeat
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

  const removePrescription = (index) => {
    if (window.confirm('Are you sure you want to remove this prescription?')) {
      setFormData(prev => ({
        ...prev,
        prescriptions: prev.prescriptions.filter((_, i) => i !== index)
      }));
      // If we're editing this prescription, cancel the edit
      if (editingIndex === index) {
        cancelEditing();
      } else if (editingIndex > index) {
        // Adjust editing index if it's after the removed item
        setEditingIndex(editingIndex - 1);
      }
    }
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

    // Auto-add pending prescription if fields are filled but not yet added
    let finalPrescriptions = [...formData.prescriptions];
    if (newPrescription.medication && newPrescription.dosage && editingIndex === null) {
      finalPrescriptions.push({ ...newPrescription });
    }

    const reportData = {
      ...formData,
      prescriptions: finalPrescriptions,
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

// Helper function to calculate age from date of birth
const calculateAge = (dob) => {
  if (!dob) return 'N/A';
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 'N/A';
  } catch (error) {
    return 'N/A';
  }
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
  
  // Video call state
  const [activeVideoCall, setActiveVideoCall] = useState(false);
  const [videoCallData, setVideoCallData] = useState(null);
  
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

  // State for emergency alerts
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showAlertResponseModal, setShowAlertResponseModal] = useState(false);

  // State for emergency video call
  const [showVideoCall, setShowVideoCall] = useState(false);

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
      
      // Log raw consultationType from API for debugging
      if (result.appointments?.length > 0) {
        console.log('🔍 Raw appointment consultationTypes from API:');
        result.appointments.slice(0, 5).forEach(apt => {
          console.log(`  ${apt.patientName}: consultationType = ${apt.consultationType} (${typeof apt.consultationType})`);
        });
      }
      
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
            type: apt.consultationType === 'online' ? 'Online Consultation' : 'Offline Consultation',
            consultationType: apt.consultationType || 'offline',
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
        console.log('📧 Patient emails in appointments:', transformedAppointments.map(a => `${a.patientName}: ${a.email || 'NO EMAIL'}`));
        console.log('🌐 Consultation types:', transformedAppointments.map(a => `${a.patientName}: ${a.consultationType}`));
        
        setAppointments(transformedAppointments);

        // Compute real-time data from appointments (with user enrichment)
        await computeRealTimeData(transformedAppointments);
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
    fetchEmergencyAlerts();
  }, [user, isLoaded]);

  // Fetch emergency alerts
  const fetchEmergencyAlerts = async () => {
    if (!user?.id || !isLoaded) return;
    
    setIsLoadingAlerts(true);
    try {
      console.log('📥 Fetching emergency alerts for doctor:', user.id);
      const response = await getDoctorAlerts(user.id);
      console.log('✅ Emergency alerts response:', response);
      
      if (response.success) {
        setEmergencyAlerts(response.alerts);
      }
    } catch (error) {
      console.error('❌ Error fetching emergency alerts:', error);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  // Handle acknowledge alert
  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await acknowledgeAlert(alertId, user.id, user.fullName);
      alert('Alert acknowledged successfully');
      fetchEmergencyAlerts();
    } catch (error) {
      alert('Failed to acknowledge alert: ' + error.message);
    }
  };

  // Handle respond to alert


  // Handle resolve alert
  const handleResolveAlert = async (alertId) => {
    if (!window.confirm('Mark this emergency alert as resolved?')) {
      return;
    }

    try {
      await resolveAlert(alertId);
      alert('Alert resolved successfully');
      fetchEmergencyAlerts();
    } catch (error) {
      alert('Failed to resolve alert: ' + error.message);
    }
  };

  // Handle delete alert
  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this emergency alert? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteAlert(alertId);
      alert('✅ Emergency alert deleted successfully');
      fetchEmergencyAlerts();
    } catch (error) {
      alert('Failed to delete alert: ' + error.message);
    }
  };

  // Handle video call with patient
  const handleVideoCallWithPatient = async (emergencyAlert) => {
    try {
      const roomID = `emergency_${emergencyAlert._id}_${Date.now()}`;
      const videoCallLink = `${window.location.origin}/video-call?roomID=${roomID}`;
      
      // Send video call link to patient via email
      await sendVideoCallLink(emergencyAlert._id, videoCallLink, user.fullName || 'Doctor');
      
      // Show success message
      alert(`✅ Video call link sent to ${emergencyAlert.patientName} at ${emergencyAlert.patientEmail}`);
      
      // Set up video call data and show video call
      setVideoCallData({
        roomID,
        userID: user.id,
        userName: user.fullName || 'Doctor',
        patientData: {
          patientName: emergencyAlert.patientName,
          patientPhone: emergencyAlert.patientPhone,
          emergencyType: emergencyAlert.emergencyType,
          severity: emergencyAlert.severity
        }
      });
      setShowVideoCall(true);
    } catch (error) {
      console.error('Error initiating video call:', error);
      alert('Failed to send video call link. Please try again.');
    }
  };

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
  const handleStatusUpdate = async (appointmentId, newStatus, closeModalAfter = false) => {
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

        // Close modal and switch to appointments tab if requested
        if (closeModalAfter) {
          closeModal();
          setActiveTab('appointments');
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
    console.log('🗑️ handleCancelAppointment called with ID:', appointmentId);
    
    if (!appointmentId) {
      alert('Cannot cancel appointment: Invalid appointment ID');
      console.error('❌ No appointment ID provided');
      return;
    }
    
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      console.log('📞 Calling cancelAppointment API with ID:', appointmentId);
      const result = await cancelAppointment(appointmentId, 'Cancelled by doctor');
      console.log('📥 Cancel appointment result:', result);
      
      if (result.success) {
        // Remove the appointment from the local state
        setAppointments(prevAppointments =>
          prevAppointments.filter(apt => apt.id !== appointmentId)
        );
        
        // Refresh appointments to update medical records
        fetchAppointments();
        
        alert('Appointment cancelled successfully');
      } else {
        alert(result.message || 'Failed to cancel appointment');
      }
    } catch (err) {
      console.error('❌ Error cancelling appointment:', err);
      alert(`An error occurred while cancelling the appointment: ${err.message}`);
    }
  };

  // Function to compute real-time data from appointments
  const computeRealTimeData = async (appointmentsData) => {
    console.log('🔄 Computing real-time data from appointments...');

    // Filter only confirmed appointments for patients section
    const confirmedAppointments = appointmentsData.filter(apt => 
      apt.status === 'confirmed' || apt.status === 'booked'
    );
    console.log(`✅ Filtering patients: ${confirmedAppointments.length} confirmed/booked appointments out of ${appointmentsData.length} total`);
    
    // Log which appointments are confirmed/booked with their consultationType
    console.log('📋 Confirmed/booked appointments with consultationType:');
    confirmedAppointments.forEach(apt => {
      console.log(`  - ${apt.patientName} (${apt.status}): consultationType = "${apt.consultationType}"`);
    });

    // Compute unique patients - use data directly from confirmed appointments only
    const uniquePatients = {};
    confirmedAppointments.forEach(apt => {
      // Use email and phone directly from transformed appointment data
      const patientEmail = apt.email || 'N/A';
      const patientPhone = apt.phone || 'N/A';
      const patientAge = apt.age || 'N/A';
      const patientGender = apt.gender || 'N/A';
      
      console.log(`📋 Appointment data for ${apt.patientName}:`, {
        email: patientEmail,
        phone: patientPhone,
        age: patientAge,
        gender: patientGender
      });
      
      const key = patientEmail !== 'N/A' ? patientEmail : apt.patientName;
      if (!uniquePatients[key]) {
        uniquePatients[key] = {
          id: apt.patientId,
          name: apt.patientName,
          age: patientAge,
          gender: patientGender,
          phone: patientPhone,
          email: patientEmail,
          consultationType: apt.consultationType || 'offline',
          lastVisit: apt.date,
          appointmentTime: apt.time,
          nextAppointment: null,
          status: 'active',
          medicalHistory: [],
          emergencyContact: ''
        };
      }
    });
    const patientsArray = Object.values(uniquePatients);
    
    console.log('📊 Computed patients from appointments:', patientsArray.length);
    patientsArray.forEach(p => {
      console.log(`  ✅ ${p.name}: email=${p.email}, phone=${p.phone}, consultationType=${p.consultationType}`);
    });
    
    // Filter online patients
    const onlinePatients = patientsArray.filter(p => p.consultationType === 'online');
    console.log(`🌐 Online consultation patients: ${onlinePatients.length} out of ${patientsArray.length} total`);
    
    // Use patient data directly from appointments (already has email, phone, age, gender)
    setRealPatients(patientsArray);
    console.log('✅ Computed real patients from appointment data:', patientsArray.length);

    // Compute medical records from appointments
    const medicalRecordsArray = appointmentsData.map(apt => {
      const record = {
        id: apt.id || apt._id,  // Use apt.id (which is from transformed appointment) or apt._id
        patientName: apt.patientName,
        patientId: apt.patientId,
        date: apt.date || apt.appointmentDate,
        diagnosis: apt.symptoms || 'Appointment scheduled',
        symptoms: apt.symptoms || 'Not specified',
        treatment: 'To be determined during consultation',
        notes: `Appointment ${apt.status} - ${apt.symptoms || 'No additional notes'}`,
        followUp: null, // Could be enhanced
        status: apt.status === 'completed' ? 'resolved' : 'active'
      };
      return record;
    });
    setRealMedicalRecords(medicalRecordsArray);
    console.log('✅ Computed medical records:', medicalRecordsArray.length);
    console.log('📋 Sample medical record:', medicalRecordsArray[0]);

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
    { id: 'overview', label: 'Dashboard', icon: FaHome },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
    { id: 'patients', label: 'Online Patients', icon: FaUsers },
    { id: 'medical-records', label: 'Medical Records', icon: FaFileMedical },
    { id: 'medical-reports', label: 'Medical Reports', icon: FaNotesMedical },
    { id: 'prescriptions', label: 'Prescriptions', icon: FaPills },
    { id: 'emergency-alerts', label: 'Emergency Alerts', icon: FaBell },
    { id: 'messages', label: 'Messages', icon: FaComments },
    { id: 'help', label: 'Help', icon: FaQuestionCircle }
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
      handleStatusUpdate(appointmentId, 'booked', true);
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
        <div key="stat-patients" className="stat-card">
          <div className="stat-icon bg-blue-500">
            <FaUsers className="text-white" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{realAnalytics.totalPatients}</h3>
            <p className="stat-label">Total Patients</p>
            <span className="stat-change positive">+{realAnalytics.patientGrowth}%</span>
          </div>
        </div>

        <div key="stat-appointments" className="stat-card">
          <div className="stat-icon bg-green-500">
            <FaCalendarAlt className="text-white" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{realAnalytics.totalAppointments}</h3>
            <p className="stat-label">This Month</p>
            <span className="stat-change positive">+{realAnalytics.appointmentGrowth}%</span>
          </div>
        </div>

        <div key="stat-pending" className="stat-card">
          <div className="stat-icon bg-yellow-500">
            <FaClock className="text-white" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{realAnalytics.pendingToday}</h3>
            <p className="stat-label">Pending Today</p>
            <span className="stat-change neutral">No change</span>
          </div>
        </div>

        <div key="stat-critical" className="stat-card">
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
                  <span key={`status-${appointment.id}`} className={`status-badge ${getStatusBadge(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  <span key={`priority-${appointment.id}`} className={`priority-badge ${getPriorityBadge(appointment.priority)}`}>
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
              placeholder="Search by patient name, email, phone, symptoms, date, or status..."
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
                    <div className="flex flex-col gap-1">
                      <span className="appointment-type">{appointment.type}</span>
                      {appointment.medicalReports && appointment.medicalReports.length > 0 && (
                        <span 
                          className="text-xs text-blue-600 flex items-center gap-1 cursor-help" 
                          title="Click 'View Details' to access patient medical reports"
                        >
                          <FaFileMedical />
                          {appointment.medicalReports.length} Report{appointment.medicalReports.length > 1 ? 's' : ''} Attached
                        </span>
                      )}
                    </div>
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

  // Render Patients Section with Contact Information
  const renderPatients = () => {
    const filteredPatients = realPatients.filter(patient => 
      patient.consultationType === 'online' && (
        patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    const initiateVideoCall = async (patient) => {
      try {
        console.log('🎥 Starting video call initiation for patient:', patient.name);
        
        // Generate room ID based on patient and doctor info
        const roomID = `consultation_${patient.id}_${Date.now()}`;
        const videoCallLink = `${window.location.origin}/video-call?roomID=${roomID}`;
        const doctorName = `Dr. ${user.firstName} ${user.lastName}`;
        
        console.log('📧 Patient email:', patient.email);
        console.log('🔗 Video call link:', videoCallLink);
        
        // Send video call link to patient via email
        if (patient.email && patient.email !== 'N/A') {
          console.log('📤 Attempting to send video call link email...');
          console.log('📧 To:', patient.email);
          console.log('👤 Patient:', patient.name);
          console.log('👨‍⚕️ Doctor:', doctorName);
          console.log('🔗 Link:', videoCallLink);
          
          try {
            console.log('🚀 Calling sendPatientVideoCallLink API...');
            const emailResult = await sendPatientVideoCallLink(
              patient.email,
              patient.name,
              videoCallLink,
              doctorName
            );
            
            console.log('✅ Email API response:', emailResult);
            
            if (emailResult.success) {
              alert(`✅ Video call link sent successfully!\n\nPatient: ${patient.name}\nEmail: ${patient.email}\n\nThe patient will receive an email with the video call link.`);
            } else {
              throw new Error(emailResult.message || 'Unknown error');
            }
          } catch (emailError) {
            console.error('❌ Failed to send email:', emailError);
            console.error('❌ Error stack:', emailError.stack);
            alert(`⚠️ Failed to send email to ${patient.email}\n\nError: ${emailError.message}\n\nYou can still proceed with the video call, but the patient won't receive an email notification.`);
          }
        } else {
          console.warn('⚠️ No valid email address for patient:', patient.name);
          const shouldProceed = confirm(
            `⚠️ No Email Address Available\n\n` +
            `Patient "${patient.name}" doesn't have a valid email address registered.\n\n` +
            `The video call link cannot be sent via email.\n\n` +
            `Video Call Link:\n${videoCallLink}\n\n` +
            `Do you want to:\n` +
            `• Copy the link and send it manually (WhatsApp, SMS, etc.)\n` +
            `• Proceed with the video call anyway\n\n` +
            `Click OK to copy the link and proceed, or Cancel to abort.`
          );
          
          if (shouldProceed) {
            // Copy link to clipboard
            try {
              await navigator.clipboard.writeText(videoCallLink);
              alert(`✅ Video call link copied to clipboard!\n\nYou can now share it with ${patient.name} via WhatsApp, SMS, or other messaging apps.`);
            } catch (clipboardError) {
              console.error('Failed to copy to clipboard:', clipboardError);
              alert(`Video call link:\n${videoCallLink}\n\nPlease copy this link manually and share it with the patient.`);
            }
          } else {
            // User cancelled, don't proceed with video call
            return;
          }
        }
        
        // Set up video call data
        const callData = {
          roomID,
          userID: user.id,
          userName: doctorName,
          patientData: {
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            age: patient.age,
            gender: patient.gender
          }
        };
        
        console.log('🎥 Initiating video call with data:', callData);
        
        // Start video call and scroll to top
        setVideoCallData(callData);
        setActiveVideoCall(true);
        
        // Smooth scroll to top to show video call
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } catch (error) {
        console.error('❌ Error initiating video call:', error);
        console.error('❌ Error details:', error.message);
        alert(`Failed to send video call link: ${error.message}`);
      }
    };

    const initiatePhoneCall = (patient) => {
      if (patient.phone && patient.phone !== 'N/A') {
        window.location.href = `tel:${patient.phone}`;
      } else {
        alert('Phone number not available for this patient');
      }
    };

    const sendEmail = (patient) => {
      if (patient.email && patient.email !== 'N/A') {
        window.location.href = `mailto:${patient.email}`;
      } else {
        alert('Email not available for this patient');
      }
    };

    return (
      <div className="space-y-6">
        {/* Search and Stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-sm text-gray-600">
              Total Online Patients: <span className="font-bold text-blue-600">{realPatients.filter(p => p.consultationType === 'online').length}</span>
            </div>
          </div>
        </div>

        {/* Patients Grid */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No online consultation patients found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map(patient => (
              <div key={patient.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200">
                {/* Patient Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                        <FaUser className="text-3xl text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{patient.name}</h3>
                        <p className="text-blue-100 text-sm">ID: {patient.id}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Details */}
                <div className="p-6 space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-medium">Age</p>
                      <p className="text-gray-900 font-semibold">{patient.age}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Gender</p>
                      <p className="text-gray-900 font-semibold">{patient.gender}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 font-medium">Type</p>
                      <p className={`font-semibold mt-1 ${
                        patient.consultationType === 'online' 
                          ? 'text-green-700' 
                          : 'text-blue-700'
                      }`}>
                        {patient.consultationType === 'online' ? '🌐 Online Consultation' : '🏥 Offline Consultation'}
                      </p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Contact Information</h4>
                    
                    {/* Phone */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaPhone className="text-green-600 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{patient.phone}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaEnvelope className="text-blue-600 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{patient.email}</p>
                      </div>
                    </div>

                    {/* Last Visit */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FaCalendar className="text-purple-600 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Last Visit</p>
                        <p className="text-sm font-semibold text-gray-900">{patient.lastVisit || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Appointment Time */}
                    {patient.appointmentTime && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaClock className="text-orange-600 text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">Appointment Time</p>
                          <p className="text-sm font-semibold text-gray-900">{patient.appointmentTime}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Quick Actions</h4>
                    
                    {/* Video Call Button - Only for Online Consultations */}
                    {patient.consultationType === 'online' ? (
                      <button
                        onClick={() => initiateVideoCall(patient)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
                      >
                        <FaVideo className="text-lg" />
                        Start Video Call
                      </button>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-100 text-gray-600 border-2 border-dashed border-gray-300">
                        <FaVideo className="text-lg" />
                        <span className="font-medium">In-Person Consultation</span>
                      </div>
                    )}

                    {/* Phone and Email Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => initiatePhoneCall(patient)}
                        disabled={patient.phone === 'N/A'}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold text-sm ${
                          patient.phone === 'N/A'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        <FaPhoneAlt />
                        Call
                      </button>

                      <button
                        onClick={() => sendEmail(patient)}
                        disabled={patient.email === 'N/A'}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold text-sm ${
                          patient.email === 'N/A'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        <FaEnvelope />
                        Email
                      </button>
                    </div>
                  </div>

                  {/* Patient Status */}
                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="text-xs text-gray-500">Status</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      patient.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {patient.status?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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

        <button 
          onClick={() => openModal('create-medical-report')}
          className="btn-primary"
        >
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
                  <button 
                    onClick={() => handlePrintMedicalRecord(record)}
                    className="btn-secondary btn-sm"
                  >
                    <FaPrint className="mr-1" />
                    Print
                  </button>
                  <button 
                    onClick={() => {
                      console.log('🗑️ Delete clicked for record:', { id: record.id, _id: record._id, record });
                      if (!record.id && !record._id) {
                        alert('Cannot delete: Invalid record ID');
                        return;
                      }
                      handleCancelAppointment(record.id || record._id);
                    }}
                    className="btn-danger btn-sm"
                    title="Cancel Appointment"
                  >
                    <FaTrash className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Print medical record function
  const handlePrintMedicalRecord = (record) => {
    const doctorName = `Dr. ${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Record - ${record.patientName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .patient-info {
            background: #f9fafb;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .patient-info h3 {
            color: #2563eb;
            margin-top: 0;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
          }
          .info-row {
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: bold;
            color: #555;
            margin-right: 8px;
          }
          .section {
            margin: 25px 0;
            padding: 20px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .section h3 {
            color: #2563eb;
            margin-top: 0;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .section-icon {
            font-size: 20px;
          }
          .section-content {
            color: #374151;
            line-height: 1.6;
          }
          .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: bold;
          }
          .status-active {
            background: #dcfce7;
            color: #166534;
          }
          .status-completed {
            background: #dbeafe;
            color: #1e40af;
          }
          .footer {
            margin-top: 40px;
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            border-top: 2px solid #333;
            width: 250px;
            margin: 10px auto 5px;
          }
          @media print {
            body {
              padding: 20px;
            }
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 ${doctorName}</h1>
          <p>Medical Record Report</p>
          <p>Date: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        <div class="patient-info">
          <h3>Patient Information</h3>
          <div class="info-grid">
            <div class="info-row">
              <span class="info-label">Patient Name:</span>
              <span>${record.patientName}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Patient ID:</span>
              <span>${record.patientId}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Date:</span>
              <span>${record.date}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="status-badge status-${record.status || 'active'}">${(record.status || 'active').toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h3><span class="section-icon">🩺</span> Diagnosis</h3>
          <div class="section-content">${record.diagnosis}</div>
        </div>

        <div class="section">
          <h3><span class="section-icon">📋</span> Symptoms</h3>
          <div class="section-content">${record.symptoms}</div>
        </div>

        <div class="section">
          <h3><span class="section-icon">💊</span> Treatment</h3>
          <div class="section-content">${record.treatment}</div>
        </div>

        ${record.notes ? `
          <div class="section">
            <h3><span class="section-icon">📝</span> Additional Notes</h3>
            <div class="section-content">${record.notes}</div>
          </div>
        ` : ''}

        ${record.followUp ? `
          <div class="section">
            <h3><span class="section-icon">📅</span> Follow-up</h3>
            <div class="section-content">${record.followUp}</div>
          </div>
        ` : ''}

        <div class="signature-section">
          <div class="signature">
            <div class="signature-line"></div>
            <p style="margin: 5px 0;">Doctor's Signature</p>
            <p style="font-size: 12px; color: #666;">${doctorName}</p>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <p style="margin: 5px 0;">Date</p>
            <p style="font-size: 12px; color: #666;">${new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div class="footer">
          <p><strong>Confidential Medical Record</strong></p>
          <p>This document contains confidential patient information protected by medical privacy laws.</p>
          <p style="margin-top: 15px; color: #999;">Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
          ">
            🖨️ Print Record
          </button>
          <button onclick="window.close()" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
            margin-left: 10px;
          ">
            ✖️ Close
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Print prescription function
  const handlePrintPrescription = (prescription) => {
    const doctorName = `Dr. ${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescription.patientName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .prescription-box {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            padding: 25px;
            margin: 20px 0;
            background: #f9fafb;
          }
          .patient-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
          }
          .info-row {
            margin-bottom: 10px;
          }
          .info-label {
            font-weight: bold;
            color: #555;
            margin-right: 8px;
          }
          .prescription-details {
            background: white;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 20px 0;
          }
          .prescription-details h3 {
            color: #2563eb;
            margin-top: 0;
            margin-bottom: 15px;
          }
          .detail-row {
            margin: 12px 0;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .instructions {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
          }
          .instructions h4 {
            color: #f59e0b;
            margin-top: 0;
          }
          .footer {
            margin-top: 40px;
            border-top: 2px solid #e5e7eb;
            padding-top: 20px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            border-top: 2px solid #333;
            width: 250px;
            margin: 10px auto 5px;
          }
          @media print {
            body {
              padding: 20px;
            }
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏥 ${doctorName}</h1>
          <p>Healthcare Professional</p>
          <p>Date: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        <div class="patient-info">
          <div class="info-row">
            <span class="info-label">Patient Name:</span>
            <span>${prescription.patientName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Patient ID:</span>
            <span>${prescription.patientId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date Prescribed:</span>
            <span>${new Date(prescription.date || Date.now()).toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Prescription ID:</span>
            <span>${prescription._id}</span>
          </div>
        </div>

        <div class="prescription-box">
          <div class="prescription-details">
            <h3>📋 Prescription Details</h3>
            
            <div class="detail-row">
              <span class="info-label">Medication:</span>
              <span style="font-size: 18px; font-weight: bold; color: #2563eb;">${prescription.medication}</span>
            </div>
            
            <div class="detail-row">
              <span class="info-label">Dosage:</span>
              <span style="font-size: 16px; color: #059669;">${prescription.dosage}</span>
            </div>
            
            <div class="detail-row">
              <span class="info-label">Duration:</span>
              <span>${prescription.duration}</span>
            </div>
            
            <div class="detail-row">
              <span class="info-label">Refills Remaining:</span>
              <span>${prescription.refills || 0}</span>
            </div>
            
            ${prescription.frequency ? `
              <div class="detail-row">
                <span class="info-label">Frequency:</span>
                <span>${prescription.frequency}</span>
              </div>
            ` : ''}
            
            ${prescription.pharmacy ? `
              <div class="detail-row">
                <span class="info-label">Pharmacy:</span>
                <span>${prescription.pharmacy}</span>
              </div>
            ` : ''}
          </div>

          ${prescription.instructions ? `
            <div class="instructions">
              <h4>⚠️ Important Instructions</h4>
              <p>${prescription.instructions}</p>
            </div>
          ` : ''}

          ${prescription.notes ? `
            <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px;">
              <strong>Additional Notes:</strong>
              <p style="margin: 10px 0 0 0;">${prescription.notes}</p>
            </div>
          ` : ''}
        </div>

        <div class="signature-section">
          <div class="signature">
            <div class="signature-line"></div>
            <p style="margin: 5px 0;">Doctor's Signature</p>
            <p style="font-size: 12px; color: #666;">${doctorName}</p>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <p style="margin: 5px 0;">Date</p>
            <p style="font-size: 12px; color: #666;">${new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div class="footer">
          <p><strong>⚠️ Important:</strong> This prescription is valid only when accompanied by the doctor's signature.</p>
          <p>Please consult your doctor if you experience any adverse effects.</p>
          <p style="margin-top: 15px; color: #999;">This is a computer-generated prescription.</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
          ">
            🖨️ Print Prescription
          </button>
          <button onclick="window.close()" style="
            background: #6b7280;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            font-weight: bold;
            margin-left: 10px;
          ">
            ✖️ Close
          </button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

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

        <button 
          onClick={() => openModal('create-medical-report')}
          className="btn-primary"
        >
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
              {isLoadingPrescriptions ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading prescriptions...</p>
                  </td>
                </tr>
              ) : doctorPrescriptions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <FaPills className="text-5xl mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 text-lg mb-2">No prescriptions found</p>
                    <p className="text-gray-400 text-sm">Create prescriptions through medical reports</p>
                  </td>
                </tr>
              ) : (
                doctorPrescriptions.map(prescription => (
                  <tr key={prescription._id} className="hover:bg-gray-50">
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
                      {prescription.pharmacy && <div className="text-sm text-gray-500">{prescription.pharmacy}</div>}
                    </td>
                    <td className="table-cell">
                      <span className="prescription-dosage">{prescription.dosage}</span>
                    </td>
                    <td className="table-cell">
                      <span className="prescription-duration">{prescription.duration}</span>
                    </td>
                    <td className="table-cell">
                      <span className="prescription-refills">{prescription.refills || 0}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusBadge(prescription.status || 'active')}`}>
                        {prescription.status || 'active'}
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
                        <button 
                          onClick={() => handlePrintPrescription(prescription)}
                          className="btn-icon btn-secondary btn-sm" 
                          title="Print Prescription"
                        >
                          <FaPrint />
                        </button>
                        <button 
                          onClick={() => handleDeletePrescription(prescription._id)}
                          className="btn-icon btn-danger btn-sm" 
                          title="Delete Prescription"
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

  const renderEmergencyAlerts = () => {
    const pendingAlerts = emergencyAlerts.filter(a => a.status === 'pending' || a.status === 'acknowledged');
    const resolvedAlerts = emergencyAlerts.filter(a => a.status === 'resolved');
    
    const getSeverityColor = (severity) => {
      switch (severity) {
        case 'critical': return 'bg-red-100 text-red-800 border-red-300';
        case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
      }
    };

    const getStatusColor = (status) => {
      switch (status) {
        case 'pending': return 'bg-red-100 text-red-800';
        case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
        case 'responded': return 'bg-blue-100 text-blue-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-red-700">{pendingAlerts.length}</p>
              </div>
              <FaExclamationCircle className="text-4xl text-red-400" />
            </div>
          </div>
          
          <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Critical</p>
                <p className="text-3xl font-bold text-orange-700">
                  {emergencyAlerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length}
                </p>
              </div>
              <FaExclamationTriangle className="text-4xl text-orange-400" />
            </div>
          </div>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-700">{resolvedAlerts.length}</p>
              </div>
              <FaCheckCircle className="text-4xl text-green-400" />
            </div>
          </div>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total</p>
                <p className="text-3xl font-bold text-blue-700">{emergencyAlerts.length}</p>
              </div>
              <FaBell className="text-4xl text-blue-400" />
            </div>
          </div>
        </div>

        {/* Pending Alerts */}
        {pendingAlerts.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚨 Pending Emergency Alerts</h3>
            <div className="space-y-4">
              {pendingAlerts.map(alert => (
                <div key={alert._id} className={`border-2 rounded-lg p-6 ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(alert.status)}`}>
                          {alert.status}
                        </span>
                        <span className="px-3 py-1 bg-white rounded-full text-xs font-bold uppercase border-2">
                          {alert.severity} PRIORITY
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(alert.alertSentAt).toLocaleString()}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold mb-2">
                        {alert.emergencyType.replace(/_/g, ' ').toUpperCase()}
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div key="patient-info" className="bg-white bg-opacity-70 rounded-lg p-4">
                      <h5 className="font-semibold mb-2 flex items-center gap-2">
                        <FaUser /> Patient Information
                      </h5>
                      <p className="text-sm"><strong>Name:</strong> {alert.patientName}</p>
                      <p className="text-sm"><strong>Phone:</strong> <a href={`tel:${alert.patientPhone}`} className="text-blue-600 hover:underline">{alert.patientPhone}</a></p>
                      <p className="text-sm"><strong>Email:</strong> <a href={`mailto:${alert.patientEmail}`} className="text-blue-600 hover:underline">{alert.patientEmail}</a></p>
                      {alert.location && <p className="text-sm"><strong>Location:</strong> {alert.location}</p>}
                    </div>

                    {alert.currentVitals && (alert.currentVitals.bloodPressure || alert.currentVitals.heartRate) && (
                      <div key="vitals" className="bg-white bg-opacity-70 rounded-lg p-4">
                        <h5 className="font-semibold mb-2 flex items-center gap-2">
                          <FaStethoscope /> Current Vitals
                        </h5>
                        {alert.currentVitals.bloodPressure && <p className="text-sm"><strong>BP:</strong> {alert.currentVitals.bloodPressure}</p>}
                        {alert.currentVitals.heartRate && <p className="text-sm"><strong>Heart Rate:</strong> {alert.currentVitals.heartRate}</p>}
                        {alert.currentVitals.temperature && <p className="text-sm"><strong>Temperature:</strong> {alert.currentVitals.temperature}</p>}
                        {alert.currentVitals.oxygenLevel && <p className="text-sm"><strong>Oxygen:</strong> {alert.currentVitals.oxygenLevel}</p>}
                      </div>
                    )}
                  </div>

                  <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-4">
                    <h5 className="font-semibold mb-2">Description:</h5>
                    <p className="text-sm whitespace-pre-wrap">{alert.description}</p>
                  </div>

                  {alert.response && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-semibold mb-2 text-blue-900">Your Response:</h5>
                      <p className="text-sm text-blue-800">{alert.response}</p>
                      <p className="text-xs text-blue-600 mt-2">Responded at: {new Date(alert.respondedAt).toLocaleString()}</p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {alert.status === 'pending' && (
                      <button
                        onClick={() => handleAcknowledgeAlert(alert._id)}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleVideoCallWithPatient(alert)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <FaVideo /> Video Call Patient
                    </button>
                    
                    <button
                      onClick={() => handleResolveAlert(alert._id)}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Mark Resolved
                    </button>

                    <button
                      onClick={() => handleDeleteAlert(alert._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolved Alerts */}
        {resolvedAlerts.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">✅ Resolved Alerts</h3>
            <div className="space-y-4">
              {resolvedAlerts.map(alert => (
                <div key={alert._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{alert.patientName}</p>
                      <p className="text-sm text-gray-600">{alert.emergencyType.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                          RESOLVED
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.resolvedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteAlert(alert._id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1"
                        title="Delete alert"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Alerts */}
        {isLoadingAlerts ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading emergency alerts...</p>
          </div>
        ) : emergencyAlerts.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <FaBell className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">No emergency alerts</p>
            <p className="text-sm">Emergency alerts from patients will appear here</p>
          </div>
        )}
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    const renderModalContent = () => {
      switch (modalType) {
        case 'appointment':
          return (
            <div className="modal-content max-w-3xl">
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
                
                {/* Medical Reports Section */}
                {selectedItem.medicalReports && selectedItem.medicalReports.length > 0 && (
                  <div className="info-group bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <label className="info-label flex items-center gap-2 text-lg font-bold text-blue-900">
                      <FaFileMedical className="text-blue-600 text-xl" />
                      Patient Medical Reports ({selectedItem.medicalReports.length})
                    </label>
                    <p className="text-sm text-blue-700 mb-3 mt-1">
                      📄 Files uploaded by patient during appointment booking
                    </p>
                    <div className="space-y-2 mt-2">
                      {selectedItem.medicalReports.map((report, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 flex items-center gap-2">
                                <FaFileMedical className="text-blue-600" />
                                {report.filename}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Size: {(report.size / 1024).toFixed(2)} KB • Type: {report.mimetype}
                              </p>
                              {report.uploadedAt && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Uploaded: {new Date(report.uploadedAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <a 
                                href={`http://localhost:3000/${report.path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary text-sm inline-flex items-center gap-2"
                                title="View file"
                              >
                                <FaEye />
                                View
                              </a>
                              <a 
                                href={`http://localhost:3000/${report.path}`}
                                download={report.filename}
                                className="btn-secondary text-sm inline-flex items-center gap-2"
                                title="Download file"
                              >
                                <FaDownload />
                                Download
                              </a>
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

        case 'medical-record':
          return (
            <div className="modal-content">
              <h2 className="modal-title">📋 Medical Record Details</h2>
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-600">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Patient Information</h3>
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
                      <p className="info-value">{selectedItem.date}</p>
                    </div>
                    <div className="info-group">
                      <label className="info-label">Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedItem.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedItem.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(selectedItem.status || 'active').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border-l-4 border-red-500">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaStethoscope className="text-red-600" />
                    Diagnosis
                  </h3>
                  <p className="info-value text-gray-700">{selectedItem.diagnosis}</p>
                </div>

                {/* Symptoms */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-l-4 border-yellow-500">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaNotesMedical className="text-yellow-600" />
                    Symptoms
                  </h3>
                  <p className="info-value text-gray-700">{selectedItem.symptoms}</p>
                </div>

                {/* Treatment */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-600">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaPills className="text-green-600" />
                    Treatment
                  </h3>
                  <p className="info-value text-gray-700">{selectedItem.treatment}</p>
                </div>

                {/* Notes */}
                {selectedItem.notes && (
                  <div className="info-group">
                    <label className="info-label">Additional Notes</label>
                    <p className="info-value">{selectedItem.notes}</p>
                  </div>
                )}

                {/* Follow-up */}
                {selectedItem.followUp && (
                  <div className="info-group">
                    <label className="info-label">Follow-up</label>
                    <p className="info-value">{selectedItem.followUp}</p>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => handlePrintMedicalRecord(selectedItem)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <FaPrint /> Print Record
                </button>
                <button 
                  onClick={() => openModal('edit-medical-report', selectedItem)}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
                <button 
                  onClick={() => {
                    console.log('🗑️ Modal delete clicked for item:', { id: selectedItem.id, _id: selectedItem._id, selectedItem });
                    closeModal();
                    if (!selectedItem.id && !selectedItem._id) {
                      alert('Cannot delete: Invalid record ID');
                      return;
                    }
                    handleCancelAppointment(selectedItem.id || selectedItem._id);
                  }}
                  className="btn-danger inline-flex items-center gap-2"
                  title="Cancel Appointment"
                >
                  <FaTrash /> Delete
                </button>
                <button onClick={closeModal} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          );

        case 'prescription':
          return (
            <div className="modal-content">
              <h2 className="modal-title">💊 Prescription Details</h2>
              <div className="space-y-6">
                {/* Patient Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-600">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Patient Information</h3>
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
                      <label className="info-label">Date Prescribed</label>
                      <p className="info-value">{new Date(selectedItem.date || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="info-group">
                      <label className="info-label">Status</label>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedItem.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedItem.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {(selectedItem.status || 'active').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Medication Details */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-600">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Medication Details</h3>
                  <div className="space-y-3">
                    <div className="info-group">
                      <label className="info-label">Medication</label>
                      <p className="info-value text-xl font-bold text-green-700">{selectedItem.medication}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="info-group">
                        <label className="info-label">Dosage</label>
                        <p className="info-value text-lg font-semibold text-green-600">{selectedItem.dosage}</p>
                      </div>
                      <div className="info-group">
                        <label className="info-label">Duration</label>
                        <p className="info-value">{selectedItem.duration}</p>
                      </div>
                      {selectedItem.frequency && (
                        <div className="info-group">
                          <label className="info-label">Frequency</label>
                          <p className="info-value">{selectedItem.frequency}</p>
                        </div>
                      )}
                      <div className="info-group">
                        <label className="info-label">Refills</label>
                        <p className="info-value">{selectedItem.refills || 0} remaining</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pharmacy Information */}
                {selectedItem.pharmacy && (
                  <div className="info-group">
                    <label className="info-label">Pharmacy</label>
                    <p className="info-value">{selectedItem.pharmacy}</p>
                  </div>
                )}

                {/* Instructions */}
                {selectedItem.instructions && (
                  <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FaExclamationTriangle className="text-yellow-600" />
                      Important Instructions
                    </h3>
                    <p className="info-value text-gray-700">{selectedItem.instructions}</p>
                  </div>
                )}

                {/* Additional Notes */}
                {selectedItem.notes && (
                  <div className="info-group">
                    <label className="info-label">Additional Notes</label>
                    <p className="info-value">{selectedItem.notes}</p>
                  </div>
                )}

                {/* Prescription ID */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Prescription ID:</span> {selectedItem._id}
                  </p>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  onClick={() => handlePrintPrescription(selectedItem)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <FaPrint /> Print Prescription
                </button>
                <button 
                  onClick={() => openModal('edit-prescription', selectedItem)}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <FaEdit /> Edit
                </button>
                <button onClick={closeModal} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          );

        case 'edit-prescription':
          return (
            <div className="modal-content">
              <h2 className="modal-title">Edit Prescription</h2>
              <p className="text-gray-600 mb-4">Edit prescription functionality will be implemented here</p>
              <div className="modal-actions">
                <button onClick={closeModal} className="btn-secondary">
                  Close
                </button>
              </div>
            </div>
          );

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
    
    // Enhanced search filter (by patient name, email, phone, symptoms, consultation type, date, time, status)
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(apt => {
        const patientName = apt.patientName?.toLowerCase() || '';
        const patientEmail = apt.patientEmail?.toLowerCase() || '';
        const patientPhone = apt.patientPhone?.toLowerCase() || '';
        const symptoms = apt.symptoms?.toLowerCase() || '';
        const consultationType = apt.type?.toLowerCase() || '';
        const date = apt.date?.toLowerCase() || '';
        const time = apt.time?.toLowerCase() || '';
        const status = apt.status?.toLowerCase() || '';
        const patientId = apt.patientId?.toLowerCase() || '';
        
        return patientName.includes(query) ||
               patientEmail.includes(query) ||
               patientPhone.includes(query) ||
               symptoms.includes(query) ||
               consultationType.includes(query) ||
               date.includes(query) ||
               time.includes(query) ||
               status.includes(query) ||
               patientId.includes(query);
      });
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

  // Handle deleting prescription
  const handleDeletePrescription = async (prescriptionId) => {
    if (!window.confirm('Are you sure you want to delete this prescription? This action cannot be undone.')) {
      return;
    }

    try {
      await deletePrescription(prescriptionId);
      alert('Prescription deleted successfully!');
      
      // Refresh prescriptions list
      fetchDoctorPrescriptions();
      
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription. Please try again.');
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

  // Video call end handler
  const handleVideoCallEnd = () => {
    console.log('🔴 Video call ended');
    setActiveVideoCall(false);
    setVideoCallData(null);
  };

  return (
    <>
      {/* Video Call Room - Full screen overlay on top of everything */}
      {activeVideoCall && videoCallData && (
        <div className="fixed inset-0 z-[9999] bg-black animate-fadeIn">
          {/* End Call Button */}
          <div className="absolute top-4 right-4 z-[10000]">
            <button
              onClick={handleVideoCallEnd}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-2xl transition-all duration-200 hover:scale-105"
            >
              <FaPhoneSlash className="text-lg" />
              End Call
            </button>
          </div>
          
          {/* Video Call Interface */}
          <VideoCallRoom
            roomID={videoCallData.roomID}
            userID={videoCallData.userID}
            userName={videoCallData.userName}
            patientData={videoCallData.patientData}
            onCallEnd={handleVideoCallEnd}
          />
        </div>
      )}

      {/* Emergency Alert Video Call Room */}
      {showVideoCall && videoCallData && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={() => {
                setShowVideoCall(false);
                setVideoCallData(null);
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg transition-colors"
            >
              End Call
            </button>
          </div>
          <VideoCallRoom
            roomID={videoCallData.roomID}
            userID={videoCallData.userID}
            userName={videoCallData.userName}
            patientData={videoCallData.patientData}
            onCallEnd={() => {
              setShowVideoCall(false);
              setVideoCallData(null);
            }}
          />
        </div>
      )}

      {/* Main Navigation at Top */}
      <Navbar />
      
      <div className="dashboard-container">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar">
          {/* Logo */}
          <div className="sidebar-logo">
            <div className="logo-container">
              <FaHeartbeat className="text-3xl text-blue-600" />
              <span className="logo-text">ProHealth</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="sidebar-nav">
            <button
              onClick={() => handleTabChange('overview')}
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <FaHome className="nav-icon" />
              <span>Dashboard</span>
            </button>
            
            <button
              onClick={() => handleTabChange('appointments')}
              className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            >
              <FaCalendarAlt className="nav-icon" />
              <span>Appointments</span>
            </button>
            
            <button
              onClick={() => handleTabChange('patients')}
              className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`}
            >
              <FaUsers className="nav-icon" />
              <span>Online Patients</span>
            </button>
            
            <button
              onClick={() => handleTabChange('medical-records')}
              className={`nav-item ${activeTab === 'medical-records' ? 'active' : ''}`}
            >
              <FaFileMedical className="nav-icon" />
              <span>Medical Records</span>
            </button>
            
            <button
              onClick={() => handleTabChange('medical-reports')}
              className={`nav-item ${activeTab === 'medical-reports' ? 'active' : ''}`}
            >
              <FaNotesMedical className="nav-icon" />
              <span>Medical Reports</span>
            </button>
            
            <button
              onClick={() => handleTabChange('prescriptions')}
              className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
            >
              <FaPills className="nav-icon" />
              <span>Prescriptions</span>
            </button>
            
            <button
              onClick={() => handleTabChange('emergency-alerts')}
              className={`nav-item ${activeTab === 'emergency-alerts' ? 'active' : ''}`}
            >
              <FaBell className="nav-icon" />
              <span>Emergency Alerts</span>
            </button>
            
            <button
              className="nav-item"
              onClick={() => alert('Messages feature coming soon')}
            >
              <FaComments className="nav-icon" />
              <span>Messages</span>
            </button>
            
            <button
              className="nav-item"
              onClick={() => alert('Help & Support')}
            >
              <FaQuestionCircle className="nav-icon" />
              <span>Help</span>
            </button>
          </nav>

          {/* Logout Button */}
          <div className="sidebar-footer">
            <button
              className="nav-item logout-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to logout?')) {
                  window.location.href = '/login';
                }
              }}
            >
              <FaSignOutAlt className="nav-icon" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="dashboard-main">
          {/* Top Header */}
          <header className="dashboard-header">
            <div className="header-left">
              <h1 className="page-title">
                Doctor Dashboard
              </h1>
            </div>
            
            <div className="header-right">
              {/* Search Bar */}
              <div className="header-search">
                <FaSearch className="search-icon-header" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-header"
                />
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="dashboard-content">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'appointments' && renderAppointments()}
            {activeTab === 'patients' && renderPatients()}
            {activeTab === 'medical-records' && renderMedicalRecords()}
            {activeTab === 'medical-reports' && renderMedicalReports()}
            {activeTab === 'prescriptions' && renderPrescriptions()}
            {activeTab === 'emergency-alerts' && renderEmergencyAlerts()}
            {activeTab === 'messages' && (
              <div className="text-center py-12">
                <FaComments className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Messages Coming Soon</h3>
                <p className="text-gray-500">This feature is currently under development.</p>
              </div>
            )}
            {activeTab === 'help' && (
              <div className="text-center py-12">
                <FaQuestionCircle className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Help & Support</h3>
                <p className="text-gray-500">Contact support at support@prohealth.com</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <Footer />
        </main>


        {/* Modal */}
        {renderModal()}

        {/* Alert Response Modal */}
        {showAlertResponseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
                <h2 className="text-2xl font-bold">Respond to Emergency Alert</h2>
              </div>
              
              {selectedAlert && (
                <div className="p-6 space-y-6">
                  {/* Alert Summary */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-2">
                      {selectedAlert.emergencyType.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                    <p className="text-sm mb-2"><strong>Patient:</strong> {selectedAlert.patientName}</p>
                    <p className="text-sm mb-2"><strong>Severity:</strong> <span className="uppercase font-bold">{selectedAlert.severity}</span></p>
                    <p className="text-sm"><strong>Description:</strong> {selectedAlert.description}</p>
                  </div>

                  {/* Response Input */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Your Response Message *
                    </label>
                    <textarea
                      value={alertResponse}
                      onChange={(e) => setAlertResponse(e.target.value)}
                      rows="6"
                      placeholder="Provide instructions, advice, or next steps for the patient..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This message will be saved with the alert and sent to the patient.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleRespondToAlert}
                      disabled={!alertResponse.trim()}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Send Response
                    </button>
                    <button
                      onClick={() => {
                        setShowAlertResponseModal(false);
                        setSelectedAlert(null);
                        setAlertResponse('');
                      }}
                      className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorDashboard;
