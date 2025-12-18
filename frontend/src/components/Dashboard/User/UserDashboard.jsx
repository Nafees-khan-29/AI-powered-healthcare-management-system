import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { getUserAppointments, updateAppointmentStatus, cancelAppointment, updateAppointment } from '../../../services/appointmentService';
import { getPatientMedicalRecords, getPatientPrescriptions } from '../../../services/medicalRecordService';
import { addHealthMetric, getLatestHealthMetrics, getUserHealthMetrics, deleteHealthMetric } from '../../../services/healthMetricService';
import { createEmergencyAlert, getPatientAlerts } from '../../../services/emergencyAlertService';
import Navbar from '../../Hero-com/Navbar';
import { 
  FaCalendarAlt, 
  FaUser, 
  FaFileMedical, 
  FaHeartbeat, 
  FaPills, 
  FaBell,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaDownload,
  FaUpload,
  FaSearch,
  FaFilter,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaStar,
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
  FaTimes,
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [error, setError] = useState(null);

  // Edit appointment state
  const [isEditingAppointment, setIsEditingAppointment] = useState(false);
  const [editAppointmentData, setEditAppointmentData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    symptoms: '',
    additionalNotes: '',
    emergencyContact: '',
    insuranceProvider: '',
    previousConditions: ''
  });

  // Fetch user's appointments
  useEffect(() => {
    fetchAppointments();
  }, [user, isLoaded]);

  // Fetch medical records
  useEffect(() => {
    fetchMedicalRecords();
  }, [user, isLoaded]);

  // Fetch prescriptions
  useEffect(() => {
    fetchPrescriptions();
  }, [user, isLoaded]);

  // Listen for appointment updates from other tabs (doctor confirmations)
  useEffect(() => {
    const storageHandler = (e) => {
      if (!e) return;
      if (e.key === 'appointment_update') {
        try {
          const payload = JSON.parse(e.newValue);
          console.log('🛰️ Received appointment_update via storage:', payload);
          // Refresh user's appointments to reflect status change
          fetchAppointments();
        } catch (err) {
          console.warn('Could not parse appointment_update payload', err);
        }
      }
    };

    // Also listen for same-tab custom events
    const customEventHandler = (e) => {
      console.log('🔔 Received appointmentUpdated event:', e.detail);
      fetchAppointments();
    };

    window.addEventListener('storage', storageHandler);
    window.addEventListener('appointmentUpdated', customEventHandler);
    
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('appointmentUpdated', customEventHandler);
    };
  }, [user, isLoaded]);

  // Listen for medical record updates from doctor dashboard
  useEffect(() => {
    const storageHandler = (e) => {
      if (!e) return;
      if (e.key === 'medical_record_created') {
        try {
          const payload = JSON.parse(e.newValue);
          console.log('🛰️ Received medical_record_created via storage:', payload);
          // Refresh medical records to show new record
          fetchMedicalRecords();
        } catch (err) {
          console.warn('Could not parse medical_record_created payload', err);
        }
      }
    };

    // Also listen for same-tab custom events
    const customEventHandler = (e) => {
      console.log('🔔 Received medicalRecordCreated event:', e.detail);
      fetchMedicalRecords();
    };

    window.addEventListener('storage', storageHandler);
    window.addEventListener('medicalRecordCreated', customEventHandler);
    
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('medicalRecordCreated', customEventHandler);
    };
  }, [user, isLoaded]);

  // Listen for prescription updates from doctor dashboard
  useEffect(() => {
    const storageHandler = (e) => {
      if (!e) return;
      if (e.key === 'prescription_created') {
        try {
          const payload = JSON.parse(e.newValue);
          console.log('🛰️ Received prescription_created via storage:', payload);
          // Refresh prescriptions to show new prescription
          fetchPrescriptions();
        } catch (err) {
          console.warn('Could not parse prescription_created payload', err);
        }
      }
    };

    // Also listen for same-tab custom events
    const customEventHandler = (e) => {
      console.log('🔔 Received prescriptionCreated event:', e.detail);
      fetchPrescriptions();
    };

    window.addEventListener('storage', storageHandler);
    window.addEventListener('prescriptionCreated', customEventHandler);
    
    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener('prescriptionCreated', customEventHandler);
    };
  }, [user, isLoaded]);

  // Function to fetch appointments (can be called manually)
  const fetchAppointments = async () => {
    if (!isLoaded || !user) return;
    
    setIsLoadingAppointments(true);
    setError(null);
    
    try {
      console.log('📥 Fetching appointments for user:', user.id);
      const result = await getUserAppointments(user.id);
      console.log('✅ Appointments fetched:', result);
      
      // Transform appointments to match component format and filter out cancelled ones
      const transformedAppointments = result.appointments
        .filter(apt => apt.status !== 'cancelled') // Don't show cancelled appointments
        .map(apt => ({
          id: apt._id,
          doctor: apt.doctorName,
          specialty: apt.doctorSpecialization,
          date: apt.appointmentDate,
          time: apt.appointmentTime,
          status: apt.status,
          type: 'consultation',
          location: 'City Hospital',
          notes: apt.symptoms,
          patientName: apt.patientName,
          patientEmail: apt.patientEmail,
          patientPhone: apt.patientPhone,
          additionalNotes: apt.additionalNotes,
          medicalReports: apt.medicalReports || []
        }));
      
      setAppointments(transformedAppointments);
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      setError(error.message);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      await cancelAppointment(appointmentId, 'Patient requested cancellation');
      
      // Notify doctor dashboard about the cancellation
      try {
        localStorage.setItem('appointment_update', JSON.stringify({ 
          id: appointmentId, 
          status: 'cancelled',
          ts: Date.now(),
          cancelledBy: 'patient'
        }));
        // Also dispatch a custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('appointmentUpdated', { 
          detail: { id: appointmentId, status: 'cancelled', cancelledBy: 'patient' } 
        }));
      } catch (e) {
        console.warn('Could not write to localStorage:', e);
      }
      
      // Refresh appointments
      await fetchAppointments();
      alert('Appointment cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment: ' + error.message);
    }
  };

  // Handle view appointment details
  const handleViewAppointment = (appointment) => {
    openModal('viewAppointment', appointment);
  };

  // Handle edit appointment
  const handleEditAppointment = (appointment) => {
    setEditAppointmentData({
      appointmentDate: appointment.date,
      appointmentTime: appointment.time,
      symptoms: appointment.notes || '',
      additionalNotes: appointment.additionalNotes || '',
      emergencyContact: appointment.emergencyContact || '',
      insuranceProvider: appointment.insuranceProvider || '',
      previousConditions: appointment.previousConditions || ''
    });
    setIsEditingAppointment(true);
    openModal('editAppointment', appointment);
  };

  // Handle delete appointment (same as cancel)
  const handleDeleteAppointment = (appointmentId) => {
    handleCancelAppointment(appointmentId);
  };

  // Handle save edited appointment
  const handleSaveEditedAppointment = async () => {
    try {
      const updateData = {
        appointmentDate: editAppointmentData.appointmentDate,
        appointmentTime: editAppointmentData.appointmentTime,
        symptoms: editAppointmentData.symptoms,
        additionalNotes: editAppointmentData.additionalNotes,
        emergencyContact: editAppointmentData.emergencyContact,
        insuranceProvider: editAppointmentData.insuranceProvider,
        previousConditions: editAppointmentData.previousConditions
      };

      await updateAppointment(selectedItem.id, updateData);
      
      // Notify doctor dashboard about the appointment update
      try {
        localStorage.setItem('appointment_update', JSON.stringify({ 
          id: selectedItem.id, 
          status: selectedItem.status, // Keep the same status
          updated: true,
          ts: Date.now(),
          updatedBy: 'patient'
        }));
        // Also dispatch a custom event for same-tab updates
        window.dispatchEvent(new CustomEvent('appointmentUpdated', { 
          detail: { 
            id: selectedItem.id, 
            status: selectedItem.status, 
            updated: true,
            updatedBy: 'patient' 
          } 
        }));
      } catch (e) {
        console.warn('Could not write to localStorage:', e);
      }
      
      // Refresh appointments
      await fetchAppointments();
      setIsEditingAppointment(false);
      closeModal();
      alert('Appointment updated successfully!');
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment: ' + error.message);
    }
  };

  // Fetch medical records
  const fetchMedicalRecords = async () => {
    if (!isLoaded || !user) return;
    
    setIsLoadingMedicalRecords(true);
    try {
      console.log('📥 Fetching medical records for user:', user.primaryEmailAddress?.emailAddress);
      const response = await getPatientMedicalRecords(user.primaryEmailAddress?.emailAddress);
      console.log('✅ Medical records response:', response);
      
      // Handle API response format
      const records = response.medicalRecords || response || [];
      
      // Transform records to match component format
      const transformedRecords = records.map(record => ({
        id: record._id,
        type: record.diagnosis || record.testType || record.type || 'Medical Report',
        date: new Date(record.createdAt || record.date).toLocaleDateString(),
        doctor: record.doctorName || record.doctor || 'Unknown Doctor',
        status: record.status || 'completed',
        results: record.diagnosis || record.results || record.findings || 'Results pending',
        file: record.fileUrl || null,
        // Additional fields for detailed view
        symptoms: record.symptoms,
        treatment: record.treatment,
        notes: record.notes,
        followUp: record.followUp,
        prescriptions: record.prescriptions || []
      }));
      
      setMedicalRecords(transformedRecords);
    } catch (error) {
      console.error('❌ Error fetching medical records:', error);
      setMedicalRecords([]);
    } finally {
      setIsLoadingMedicalRecords(false);
    }
  };

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    if (!isLoaded || !user) return;
    
    setIsLoadingPrescriptions(true);
    try {
      console.log('📥 Fetching prescriptions for user:', user.primaryEmailAddress?.emailAddress);
      const response = await getPatientPrescriptions(user.primaryEmailAddress?.emailAddress);
      console.log('✅ Prescriptions response:', response);
      
      // Handle API response format
      const presc = response.prescriptions || response || [];
      
      // Transform prescriptions to match component format
      const transformedPrescriptions = presc.map(prescription => ({
        id: prescription._id,
        medication: prescription.medication,
        dosage: prescription.dosage,
        duration: prescription.duration,
        prescribedBy: prescription.doctorName || prescription.doctor || 'Unknown Doctor',
        date: new Date(prescription.createdAt || prescription.date).toLocaleDateString(),
        status: prescription.status || 'active',
        refills: prescription.refills || 0,
        instructions: prescription.instructions,
        pharmacy: prescription.pharmacy,
        medicalRecordId: prescription.medicalRecordId
      }));
      
      setPrescriptions(transformedPrescriptions);
    } catch (error) {
      console.error('❌ Error fetching prescriptions:', error);
      setPrescriptions([]);
    } finally {
      setIsLoadingPrescriptions(false);
    }
  };

  // Fetch health metrics
  const fetchHealthMetrics = async () => {
    if (!isLoaded || !user) return;
    
    setIsLoadingMetrics(true);
    try {
      console.log('📥 Fetching health metrics for user:', user.id);
      const response = await getLatestHealthMetrics(user.id);
      console.log('✅ Health metrics response:', response);
      
      if (response.success && response.metrics) {
        const metrics = response.metrics;
        setHealthMetrics({
          bloodPressure: metrics.bloodPressureSystolic && metrics.bloodPressureDiastolic 
            ? `${metrics.bloodPressureSystolic}/${metrics.bloodPressureDiastolic}` 
            : '--/--',
          heartRate: metrics.heartRate ? `${metrics.heartRate} bpm` : '-- bpm',
          temperature: metrics.temperature ? `${metrics.temperature}°F` : '-- °F',
          weight: metrics.weight ? `${metrics.weight} kg` : '-- kg',
          height: metrics.height ? `${metrics.height} cm` : '-- cm',
          bmi: metrics.bmi ? metrics.bmi.toString() : '--'
        });
      }
      
      // Also fetch history
      const historyResponse = await getUserHealthMetrics(user.id, { limit: 10 });
      if (historyResponse.success) {
        setHealthHistory(historyResponse.metrics);
      }
    } catch (error) {
      console.error('❌ Error fetching health metrics:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // Fetch emergency alerts
  const fetchEmergencyAlerts = async () => {
    if (!isLoaded || !user) return;
    
    setIsLoadingAlerts(true);
    try {
      console.log('📥 Fetching emergency alerts for user:', user.id);
      const response = await getPatientAlerts(user.id);
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

  // Fetch health metrics and alerts on mount
  useEffect(() => {
    if (activeTab === 'health-tracking') {
      fetchHealthMetrics();
      fetchEmergencyAlerts();
    }
  }, [activeTab, user, isLoaded]);

  // Medical records state
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoadingMedicalRecords, setIsLoadingMedicalRecords] = useState(false);

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);

  // Health Metrics State
  const [healthMetrics, setHealthMetrics] = useState({
    bloodPressure: '--/--',
    heartRate: '-- bpm',
    temperature: '-- °F',
    weight: '-- kg',
    height: '-- cm',
    bmi: '--'
  });
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [healthHistory, setHealthHistory] = useState([]);
  const [showAddMetricModal, setShowAddMetricModal] = useState(false);
  const [newMetric, setNewMetric] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
    bloodSugar: '',
    bloodSugarType: 'random',
    cholesterol: '',
    notes: ''
  });

  // Emergency Alert State
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [emergencyData, setEmergencyData] = useState({
    emergencyType: '',
    severity: 'medium',
    description: '',
    location: '',
    phoneNumber: '',
    currentVitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenLevel: ''
    }
  });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
    { id: 'medical-records', label: 'Medical Records', icon: FaFileMedical },
    { id: 'prescriptions', label: 'Prescriptions', icon: FaPills },
    { id: 'health-tracking', label: 'Health Tracking', icon: FaHeartbeat },
    { id: 'emergency-alerts', label: 'Emergency Alerts', icon: FaBell }
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
    setIsEditingAppointment(false);
    setEditAppointmentData({
      appointmentDate: '',
      appointmentTime: '',
      symptoms: '',
      additionalNotes: '',
      emergencyContact: '',
      insuranceProvider: '',
      previousConditions: ''
    });
  };

  const handleAppointmentAction = (action, appointment) => {
    switch (action) {
      case 'cancel':
        setAppointments(appointments.map(apt => 
          apt.id === appointment.id ? { ...apt, status: 'cancelled' } : apt
        ));
        break;
      case 'reschedule':
        openModal('rescheduleAppointment', appointment);
        break;
      default:
        break;
    }
  };

  const renderOverview = () => {
    // Check for active video call link
    const activeVideoCallAlert = emergencyAlerts.find(alert => 
      alert.videoCallLink && alert.status !== 'resolved'
    );

    return (
    <div className="space-y-6">
      {/* Active Video Call Notification */}
      {activeVideoCallAlert && (
        <div className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 rounded-2xl p-6 text-white shadow-2xl border-4 border-green-400 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FaVideo className="text-5xl animate-bounce" />
              <div>
                <h2 className="text-2xl font-bold mb-1">🎥 Video Call Available!</h2>
                <p className="text-white/90 text-lg">
                  {activeVideoCallAlert.doctorName || 'A doctor'} is waiting to connect with you
                </p>
              </div>
            </div>
            <a
              href={activeVideoCallAlert.videoCallLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-green-600 hover:bg-green-50 font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Join Now
            </a>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-400 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Patient'}!</h2>
        <p className="text-white/90">Here's your health summary for today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Upcoming</p>
              <p className="text-3xl font-bold">
                {appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'pending').length}
              </p>
            </div>
            <FaCalendarAlt className="text-4xl opacity-80" />
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Active Rx</p>
              <p className="text-3xl font-bold">
                {prescriptions.filter(rx => rx.status === 'active').length}
              </p>
            </div>
            <FaPills className="text-4xl opacity-80" />
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Records</p>
              <p className="text-3xl font-bold">{medicalRecords.length}</p>
            </div>
            <FaFileMedical className="text-4xl opacity-80" />
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">BMI</p>
              <p className="text-3xl font-bold">{healthMetrics.bmi}</p>
            </div>
            <FaHeartbeat className="text-4xl opacity-80" />
          </div>
        </div>
      </div>

      {/* Next Appointment */}
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold mb-4">Next Appointment</h3>
        {isLoadingAppointments ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <FaExclamationCircle className="text-3xl mx-auto mb-2" />
            <p className="text-sm">Unable to load appointments</p>
          </div>
        ) : appointments.find(apt => apt.status === 'confirmed') ? (
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">
                  {appointments.find(apt => apt.status === 'confirmed')?.doctor}
                </h4>
                <p className="text-blue-800">
                  {appointments.find(apt => apt.status === 'confirmed')?.specialty}
                </p>
                <p className="text-blue-700 text-sm">
                  {appointments.find(apt => apt.status === 'confirmed')?.date} at{' '}
                  {appointments.find(apt => apt.status === 'confirmed')?.time}
                </p>
                <p className="text-blue-700 text-sm">
                  {appointments.find(apt => apt.status === 'confirmed')?.location}
                </p>
              </div>
              <div className="text-right">
                <span className="status-badge confirmed">Confirmed</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FaCalendarAlt className="text-4xl mx-auto mb-4 text-gray-300" />
            <p>No upcoming appointments</p>
            <button 
              onClick={() => navigate('/appointment')}
              className="btn-primary mt-4"
            >
              <FaPlus className="mr-2" />
              Book Appointment
            </button>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {medicalRecords.slice(0, 3).map((record) => (
            <div key={record.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                record.status === 'completed' ? 'bg-cyan-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{record.type}</p>
                <p className="text-sm text-gray-700">
                  {record.date} • {record.doctor}
                </p>
              </div>
              <span className={`status-badge ${record.status}`}>
                {record.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
    );
  };

  const renderAppointments = () => (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-4">
          <select className="filter-select">
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button 
          onClick={() => navigate('/appointment')}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          Book Appointment
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {isLoadingAppointments ? (
          <div className="dashboard-card p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="dashboard-card p-12 text-center">
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
          <div className="dashboard-card p-12 text-center text-gray-500">
            <FaCalendarAlt className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">No appointments found</p>
            <p className="text-sm mb-4">Book your first appointment to get started</p>
            <button 
              onClick={() => navigate('/appointment')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-medium transition-all duration-300 inline-flex items-center gap-2"
            >
              <FaPlus />
              Book Appointment
            </button>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="dashboard-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-900">{appointment.doctor}</h4>
                    <p className="text-gray-700">{appointment.specialty}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt />
                        {appointment.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock />
                        {appointment.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt />
                        {appointment.location}
                      </span>
                    </div>
                    {appointment.notes && (
                      <p className="text-gray-700 mt-2 text-sm">{appointment.notes}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3">
                <span className={`status-badge ${appointment.status}`}>
                  {appointment.status}
                </span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewAppointment(appointment)}
                    className="action-btn view"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  
                  {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                    <>
                      <button 
                        onClick={() => handleEditAppointment(appointment)}
                        className="action-btn edit"
                        title="Edit Appointment"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="action-btn delete"
                        title="Cancel Appointment"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          ))
        )}
      </div>
    </div>
  );

  const renderMedicalRecords = () => (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-4">
          <select className="filter-select">
            <option value="all">All Types</option>
            <option value="blood-test">Blood Test</option>
            <option value="x-ray">X-Ray</option>
            <option value="ecg">ECG</option>
            <option value="mri">MRI</option>
          </select>
        </div>
        <button 
          onClick={() => openModal('uploadRecord')}
          className="btn-primary flex items-center gap-2"
        >
          <FaUpload />
          Upload Record
        </button>
      </div>

      {/* Medical Records List */}
      <div className="space-y-4">
        {isLoadingMedicalRecords ? (
          <div className="dashboard-card p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
            <p className="text-gray-600">Loading medical records...</p>
          </div>
        ) : medicalRecords.length === 0 ? (
          <div className="dashboard-card p-12 text-center text-gray-500">
            <FaFileMedical className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">No medical records found</p>
            <p className="text-sm">Your medical records will appear here when created by your doctor</p>
          </div>
        ) : (
          medicalRecords.map((record) => (
            <div key={record.id} className="dashboard-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <FaFileMedical className="text-cyan-500 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-900">{record.type}</h4>
                    <p className="text-gray-700">Dr. {record.doctor}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>{record.date}</span>
                      <span>Results: {record.results}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <span className={`status-badge ${record.status}`}>
                    {record.status}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openModal('viewRecord', record)}
                      className="action-btn view"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    
                    {record.file && (
                      <button 
                        onClick={() => openModal('downloadRecord', record)}
                        className="action-btn edit"
                        title="Download"
                      >
                        <FaDownload />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex gap-4">
          <select className="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <button 
          onClick={() => openModal('requestRefill')}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          Request Refill
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {isLoadingPrescriptions ? (
          <div className="dashboard-card p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="dashboard-card p-12 text-center text-gray-500">
            <FaPills className="text-5xl mx-auto mb-4 text-gray-300" />
            <p className="text-lg mb-2">No prescriptions found</p>
            <p className="text-sm">Your prescriptions will appear here when prescribed by your doctor</p>
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription.id} className="dashboard-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaPills className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg text-gray-900">{prescription.medication}</h4>
                    <p className="text-gray-700">Dr. {prescription.prescribedBy}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Dosage: {prescription.dosage}</span>
                      <span>Duration: {prescription.duration}</span>
                      <span>Refills: {prescription.refills}</span>
                    </div>
                    <p className="text-gray-700 mt-2 text-sm">Prescribed on {prescription.date}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-3">
                  <span className={`status-badge ${prescription.status}`}>
                    {prescription.status}
                  </span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openModal('viewPrescription', prescription)}
                      className="action-btn view"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    
                    {prescription.status === 'active' && prescription.refills > 0 && (
                      <button 
                        onClick={() => openModal('requestRefill', prescription)}
                        className="action-btn edit"
                        title="Request Refill"
                      >
                        <FaEdit />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Handle add health metric
  const handleAddHealthMetric = async () => {
    try {
      const metricData = {
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress,
        userName: user.fullName,
        ...newMetric
      };

      await addHealthMetric(metricData);
      alert('Health metric added successfully!');
      setShowAddMetricModal(false);
      setNewMetric({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
        weight: '',
        height: '',
        bloodSugar: '',
        bloodSugarType: 'random',
        cholesterol: '',
        notes: ''
      });
      fetchHealthMetrics();
    } catch (error) {
      alert('Failed to add health metric: ' + error.message);
    }
  };

  // Handle delete health metric
  const handleDeleteHealthMetric = async (metricId) => {
    if (!window.confirm('Are you sure you want to delete this health record? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteHealthMetric(metricId);
      alert('Health record deleted successfully!');
      fetchHealthMetrics();
    } catch (error) {
      alert('Failed to delete health record: ' + error.message);
    }
  };

  // Handle send emergency alert
  const handleSendEmergencyAlert = async () => {
    if (!emergencyData.emergencyType || !emergencyData.description) {
      alert('Please select emergency type and provide description');
      return;
    }

    if (!emergencyData.phoneNumber || emergencyData.phoneNumber.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const alertData = {
        patientId: user.id,
        patientEmail: user.primaryEmailAddress?.emailAddress,
        patientName: user.fullName,
        patientPhone: emergencyData.phoneNumber,
        ...emergencyData
      };

      await createEmergencyAlert(alertData);
      alert('🚨 Emergency alert sent successfully! A doctor will contact you shortly.');
      setShowEmergencyModal(false);
      setEmergencyData({
        emergencyType: '',
        severity: 'medium',
        description: '',
        location: '',
        phoneNumber: '',
        currentVitals: {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          oxygenLevel: ''
        }
      });
      fetchEmergencyAlerts();
    } catch (error) {
      alert('Failed to send emergency alert: ' + error.message);
    }
  };

  const renderHealthTracking = () => (
    <div className="space-y-6">
      {/* Emergency Alert Button */}
      <div className="dashboard-card bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-red-700 mb-2">🚨 Emergency Alert</h3>
            <p className="text-sm text-red-600">Need immediate medical attention? Alert your doctor now</p>
          </div>
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Send Emergency Alert
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => setShowAddMetricModal(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all flex items-center gap-2"
        >
          <FaPlus /> Add Health Metric
        </button>
        <button
          onClick={fetchHealthMetrics}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
        >
          Refresh
        </button>
      </div>

      {isLoadingMetrics ? (
        <div className="dashboard-card p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading health metrics...</p>
        </div>
      ) : (
        <>
          {/* Health Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="dashboard-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaHeartbeat className="text-blue-600" />
                Vital Signs
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Blood Pressure</span>
                  <span className="font-semibold">{healthMetrics.bloodPressure}</span>
                </div>
                <div className="flex justify-between">
                  <span>Heart Rate</span>
                  <span className="font-semibold">{healthMetrics.heartRate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperature</span>
                  <span className="font-semibold">{healthMetrics.temperature}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaUser className="text-cyan-600" />
                Body Metrics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Weight</span>
                  <span className="font-semibold">{healthMetrics.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span>Height</span>
                  <span className="font-semibold">{healthMetrics.height}</span>
                </div>
                <div className="flex justify-between">
                  <span>BMI</span>
                  <span className="font-semibold">{healthMetrics.bmi}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaExclamationCircle className="text-orange-600" />
                Emergency Alerts
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Sent</span>
                  <span className="font-semibold">{emergencyAlerts.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pending</span>
                  <span className="font-semibold text-orange-600">
                    {emergencyAlerts.filter(a => a.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Resolved</span>
                  <span className="font-semibold text-green-600">
                    {emergencyAlerts.filter(a => a.status === 'resolved').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Health History */}
          {healthHistory.length > 0 && (
            <div className="dashboard-card p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Health Records</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">BP</th>
                      <th className="text-left py-2">Heart Rate</th>
                      <th className="text-left py-2">Temp</th>
                      <th className="text-left py-2">Weight</th>
                      <th className="text-left py-2">Notes</th>
                      <th className="text-right py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {healthHistory.slice(0, 5).map((record, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2">{new Date(record.recordedAt).toLocaleDateString()}</td>
                        <td className="py-2">
                          {record.bloodPressureSystolic && record.bloodPressureDiastolic
                            ? `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`
                            : '--'}
                        </td>
                        <td className="py-2">{record.heartRate ? `${record.heartRate} bpm` : '--'}</td>
                        <td className="py-2">{record.temperature ? `${record.temperature}°F` : '--'}</td>
                        <td className="py-2">{record.weight ? `${record.weight} kg` : '--'}</td>
                        <td className="py-2 text-sm text-gray-600">
                          {record.notes ? (record.notes.length > 30 ? record.notes.substring(0, 30) + '...' : record.notes) : '--'}
                        </td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => handleDeleteHealthMetric(record._id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition-colors"
                            title="Delete Record"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderEmergencyAlerts = () => {
    const getSeverityColor = (severity) => {
      switch (severity) {
        case 'critical': return 'bg-red-100 border-red-300 text-red-800';
        case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
        case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
        case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
        default: return 'bg-gray-100 border-gray-300 text-gray-800';
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Emergency Alerts</h2>
            <p className="text-gray-600 mt-1">Track your emergency alerts and responses</p>
          </div>
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg inline-flex items-center gap-2"
          >
            <FaBell /> Send New Alert
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="dashboard-card bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total Alerts</p>
                <p className="text-3xl font-bold text-red-700">{emergencyAlerts.length}</p>
              </div>
              <FaBell className="text-4xl text-red-400" />
            </div>
          </div>
          
          <div className="dashboard-card bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-700">
                  {emergencyAlerts.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <FaExclamationTriangle className="text-4xl text-yellow-400" />
            </div>
          </div>
          
          <div className="dashboard-card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Responded</p>
                <p className="text-3xl font-bold text-blue-700">
                  {emergencyAlerts.filter(a => a.status === 'responded' || a.status === 'acknowledged').length}
                </p>
              </div>
              <FaCheckCircle className="text-4xl text-blue-400" />
            </div>
          </div>
          
          <div className="dashboard-card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold text-green-700">
                  {emergencyAlerts.filter(a => a.status === 'resolved').length}
                </p>
              </div>
              <FaCheckCircle className="text-4xl text-green-400" />
            </div>
          </div>
        </div>

        {/* Alerts List */}
        {isLoadingAlerts ? (
          <div className="dashboard-card p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading alerts...</p>
          </div>
        ) : emergencyAlerts.length === 0 ? (
          <div className="dashboard-card p-12 text-center">
            <FaBell className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-lg text-gray-600 mb-2">No emergency alerts sent yet</p>
            <p className="text-sm text-gray-500">Your emergency alerts will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emergencyAlerts.map(alert => (
              <div key={alert._id} className={`dashboard-card border-2 ${getSeverityColor(alert.severity)} p-6`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                      <span className="px-3 py-1 bg-white rounded-full text-xs font-bold uppercase border-2">
                        {alert.severity}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(alert.alertSentAt).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {alert.emergencyType.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                  </div>
                </div>

                <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold mb-2">Description:</h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{alert.description}</p>
                </div>

                {alert.location && (
                  <div className="bg-white bg-opacity-70 rounded-lg p-3 mb-4">
                    <p className="text-sm"><strong>Location:</strong> {alert.location}</p>
                  </div>
                )}

                {/* Video Call Link */}
                {alert.videoCallLink && (
                  <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-5 mb-4 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FaVideo className="text-2xl text-green-600 animate-pulse" />
                        <h4 className="font-bold text-green-900 text-lg">🎥 Video Call Available!</h4>
                      </div>
                      {alert.videoCallInitiatedAt && (
                        <span className="text-xs text-green-700 bg-green-200 px-3 py-1 rounded-full">
                          Initiated {new Date(alert.videoCallInitiatedAt).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-green-800 mb-4">
                      {alert.doctorName || 'A doctor'} has started a video call. Click the button below to join immediately.
                    </p>
                    <a
                      href={alert.videoCallLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                      <FaVideo className="text-xl" />
                      Join Video Call Now
                    </a>
                    <div className="mt-3 p-3 bg-white rounded-lg border border-green-300">
                      <p className="text-xs text-gray-600 mb-1">Or copy this link:</p>
                      <code className="text-xs text-gray-800 break-all block bg-gray-50 p-2 rounded">
                        {alert.videoCallLink}
                      </code>
                    </div>
                  </div>
                )}

                {alert.doctorName && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Doctor Response:</h4>
                    <p className="text-sm text-blue-800 mb-2"><strong>Doctor:</strong> {alert.doctorName}</p>
                    {alert.acknowledgedAt && (
                      <p className="text-xs text-blue-600">Acknowledged at: {new Date(alert.acknowledgedAt).toLocaleString()}</p>
                    )}
                    {alert.response && (
                      <>
                        <p className="text-sm text-blue-800 mt-3">{alert.response}</p>
                        <p className="text-xs text-blue-600 mt-2">Responded at: {new Date(alert.respondedAt).toLocaleString()}</p>
                      </>
                    )}
                  </div>
                )}

                {alert.status === 'resolved' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800"><strong>✅ Resolved:</strong> {new Date(alert.resolvedAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderModal = () => {
    if (!showModal) return null;

    const renderModalContent = () => {
      switch (modalType) {
        case 'viewAppointment':
          return (
            <div className="modal-content max-w-4xl">
              <h2 className="modal-title flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" />
                Appointment Details
              </h2>
              
              <div className="space-y-6">
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="info-group">
                    <label className="info-label">Doctor</label>
                    <p className="info-value font-semibold text-blue-700">{selectedItem.doctor}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Specialization</label>
                    <p className="info-value">{selectedItem.specialty}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Date</label>
                    <p className="info-value">{selectedItem.date}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Time</label>
                    <p className="info-value">{selectedItem.time}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Status</label>
                    <span className={`status-badge ${selectedItem.status}`}>
                      {selectedItem.status}
                    </span>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Location</label>
                    <p className="info-value">{selectedItem.location}</p>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="info-group">
                      <label className="info-label">Name</label>
                      <p className="info-value">{selectedItem.patientName}</p>
                    </div>
                    <div className="info-group">
                      <label className="info-label">Email</label>
                      <p className="info-value">{selectedItem.patientEmail}</p>
                    </div>
                    <div className="info-group">
                      <label className="info-label">Phone</label>
                      <p className="info-value">{selectedItem.patientPhone}</p>
                    </div>
                    <div className="info-group">
                      <label className="info-label">Age</label>
                      <p className="info-value">{selectedItem.patientAge || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
                  
                  {selectedItem.notes && (
                    <div className="info-group">
                      <label className="info-label">Symptoms/Reason</label>
                      <div className="info-value bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                        <p className="text-gray-800">{selectedItem.notes}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.additionalNotes && (
                    <div className="info-group">
                      <label className="info-label">Additional Notes</label>
                      <div className="info-value bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                        <p className="text-gray-800">{selectedItem.additionalNotes}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.emergencyContact && (
                    <div className="info-group">
                      <label className="info-label">Emergency Contact</label>
                      <div className="info-value bg-red-50 p-3 rounded-lg border-l-4 border-red-500">
                        <p className="text-gray-800">{selectedItem.emergencyContact}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.insuranceProvider && (
                    <div className="info-group">
                      <label className="info-label">Insurance Provider</label>
                      <div className="info-value bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                        <p className="text-gray-800">{selectedItem.insuranceProvider}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.previousConditions && (
                    <div className="info-group">
                      <label className="info-label">Previous Conditions</label>
                      <div className="info-value bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500">
                        <p className="text-gray-800">{selectedItem.previousConditions}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical Reports if available */}
                {selectedItem.medicalReports && selectedItem.medicalReports.length > 0 && (
                  <div className="info-group">
                    <label className="info-label">Attached Medical Reports</label>
                    <div className="space-y-2">
                      {selectedItem.medicalReports.map((report, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{report.filename}</p>
                              <p className="text-sm text-gray-600">
                                {(report.size / 1024).toFixed(2)} KB • {report.mimetype}
                              </p>
                            </div>
                            <button className="btn-primary text-sm">
                              <FaDownload className="mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button onClick={closeModal} className="btn-secondary">
                  Close
                </button>
                {(selectedItem.status === 'pending' || selectedItem.status === 'confirmed') && (
                  <>
                    <button 
                      onClick={() => {
                        closeModal();
                        handleEditAppointment(selectedItem);
                      }}
                      className="btn-primary"
                    >
                      <FaEdit className="mr-2" />
                      Edit Appointment
                    </button>
                  </>
                )}
              </div>
            </div>
          );

        case 'editAppointment':
          return (
            <div className="modal-content max-w-2xl">
              <h2 className="modal-title flex items-center gap-2">
                <FaEdit className="text-blue-600" />
                Edit Appointment
              </h2>
              
              <div className="space-y-6">
                {/* Doctor Information (Read-only) */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Doctor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="info-group">
                      <label className="info-label">Doctor</label>
                      <p className="info-value font-semibold">{selectedItem.doctor}</p>
                    </div>
                    <div className="info-group">
                      <label className="info-label">Specialization</label>
                      <p className="info-value">{selectedItem.specialty}</p>
                    </div>
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        value={editAppointmentData.appointmentDate}
                        onChange={(e) => setEditAppointmentData({
                          ...editAppointmentData,
                          appointmentDate: e.target.value
                        })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Time *</label>
                      <select
                        className="form-input"
                        value={editAppointmentData.appointmentTime}
                        onChange={(e) => setEditAppointmentData({
                          ...editAppointmentData,
                          appointmentTime: e.target.value
                        })}
                      >
                        <option value="">Select time</option>
                        <option value="09:00">09:00 AM</option>
                        <option value="09:30">09:30 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="10:30">10:30 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="11:30">11:30 AM</option>
                        <option value="14:00">02:00 PM</option>
                        <option value="14:30">02:30 PM</option>
                        <option value="15:00">03:00 PM</option>
                        <option value="15:30">03:30 PM</option>
                        <option value="16:00">04:00 PM</option>
                        <option value="16:30">04:30 PM</option>
                        <option value="17:00">05:00 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Symptoms/Reason for Visit</label>
                    <textarea
                      className="form-input"
                      rows="3"
                      placeholder="Describe your symptoms or reason for the appointment..."
                      value={editAppointmentData.symptoms}
                      onChange={(e) => setEditAppointmentData({
                        ...editAppointmentData,
                        symptoms: e.target.value
                      })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Additional Notes</label>
                    <textarea
                      className="form-input"
                      rows="2"
                      placeholder="Any additional information..."
                      value={editAppointmentData.additionalNotes}
                      onChange={(e) => setEditAppointmentData({
                        ...editAppointmentData,
                        additionalNotes: e.target.value
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Emergency Contact</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Name and phone number"
                        value={editAppointmentData.emergencyContact}
                        onChange={(e) => setEditAppointmentData({
                          ...editAppointmentData,
                          emergencyContact: e.target.value
                        })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Insurance Provider</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Insurance company name"
                        value={editAppointmentData.insuranceProvider}
                        onChange={(e) => setEditAppointmentData({
                          ...editAppointmentData,
                          insuranceProvider: e.target.value
                        })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Previous Medical Conditions</label>
                    <textarea
                      className="form-input"
                      rows="2"
                      placeholder="List any relevant previous conditions..."
                      value={editAppointmentData.previousConditions}
                      onChange={(e) => setEditAppointmentData({
                        ...editAppointmentData,
                        previousConditions: e.target.value
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEditedAppointment}
                  className="btn-primary"
                  disabled={!editAppointmentData.appointmentDate || !editAppointmentData.appointmentTime}
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          );
        case 'viewRecord':
          return (
            <div className="modal-content max-w-4xl">
              <h2 className="modal-title flex items-center gap-2">
                <FaFileMedical className="text-cyan-500" />
                Medical Report Details
              </h2>
              
              <div className="space-y-6">
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="info-group">
                    <label className="info-label">Report Type</label>
                    <p className="info-value font-semibold text-cyan-600">{selectedItem.type}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Date</label>
                    <p className="info-value">{selectedItem.date}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Doctor</label>
                    <p className="info-value">Dr. {selectedItem.doctor}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Status</label>
                    <span className={`status-badge ${selectedItem.status}`}>
                      {selectedItem.status}
                    </span>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <div className="info-group">
                    <label className="info-label">Diagnosis</label>
                    <div className="info-value bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <p className="text-gray-800 font-medium">{selectedItem.results}</p>
                    </div>
                  </div>

                  {/* Additional Details if available */}
                  {selectedItem.symptoms && (
                    <div className="info-group">
                      <label className="info-label">Symptoms</label>
                      <div className="info-value bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                        <p className="text-gray-800">{selectedItem.symptoms}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.treatment && (
                    <div className="info-group">
                      <label className="info-label">Treatment</label>
                      <div className="info-value bg-cyan-50 p-3 rounded-lg border-l-4 border-cyan-500">
                        <p className="text-gray-800">{selectedItem.treatment}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.notes && (
                    <div className="info-group">
                      <label className="info-label">Additional Notes</label>
                      <div className="info-value bg-blue-50 p-3 rounded-lg border-l-4 border-blue-600">
                        <p className="text-gray-800">{selectedItem.notes}</p>
                      </div>
                    </div>
                  )}

                  {selectedItem.followUp && (
                    <div className="info-group">
                      <label className="info-label">Follow-up Date</label>
                      <div className="info-value bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500">
                        <p className="text-gray-800 font-medium">{selectedItem.followUp}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Associated Prescriptions if available */}
                {selectedItem.prescriptions && selectedItem.prescriptions.length > 0 && (
                  <div className="info-group">
                    <label className="info-label">Prescribed Medications</label>
                    <div className="space-y-3">
                      {selectedItem.prescriptions.map((prescription, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{prescription.medication}</h4>
                              <p className="text-sm text-gray-600">Dosage: {prescription.dosage}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Duration: {prescription.duration}</p>
                              <p className="text-sm text-gray-600">Refills: {prescription.refills}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Download if available */}
                {selectedItem.file && (
                  <div className="info-group">
                    <label className="info-label">Attached Files</label>
                    <div className="flex items-center gap-3">
                      <button className="btn-primary flex items-center gap-2">
                        <FaDownload />
                        Download Report
                      </button>
                      <span className="text-sm text-gray-500">PDF file available</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button onClick={closeModal} className="btn-secondary">
                  Close
                </button>
                {selectedItem.file && (
                  <button className="btn-primary">
                    <FaDownload className="mr-2" />
                    Download PDF
                  </button>
                )}
              </div>
            </div>
          );

        case 'viewPrescription':
          return (
            <div className="modal-content max-w-2xl">
              <h2 className="modal-title flex items-center gap-2">
                <FaPills className="text-purple-600" />
                Prescription Details
              </h2>
              
              <div className="space-y-6">
                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="info-group">
                    <label className="info-label">Medication</label>
                    <p className="info-value font-semibold text-purple-700">{selectedItem.medication}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Prescribed Date</label>
                    <p className="info-value">{selectedItem.date}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Prescribing Doctor</label>
                    <p className="info-value">Dr. {selectedItem.prescribedBy}</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Status</label>
                    <span className={`status-badge ${selectedItem.status}`}>
                      {selectedItem.status}
                    </span>
                  </div>
                </div>

                {/* Prescription Details */}
                <div className="space-y-4">
                  <div className="info-group">
                    <label className="info-label">Dosage Instructions</label>
                    <div className="info-value bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                      <p className="text-gray-800 font-medium">{selectedItem.dosage}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="info-group">
                      <label className="info-label">Duration</label>
                      <div className="info-value bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
                        <p className="text-gray-800">{selectedItem.duration}</p>
                      </div>
                    </div>

                    <div className="info-group">
                      <label className="info-label">Refills Remaining</label>
                      <div className="info-value bg-orange-50 p-3 rounded-lg border-l-4 border-orange-500">
                        <p className="text-gray-800 font-medium">{selectedItem.refills}</p>
                      </div>
                    </div>
                  </div>

                  {/* Instructions if available */}
                  {selectedItem.instructions && (
                    <div className="info-group">
                      <label className="info-label">Special Instructions</label>
                      <div className="info-value bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
                        <p className="text-gray-800">{selectedItem.instructions}</p>
                      </div>
                    </div>
                  )}

                  {/* Pharmacy if available */}
                  {selectedItem.pharmacy && (
                    <div className="info-group">
                      <label className="info-label">Pharmacy</label>
                      <div className="info-value bg-purple-50 p-3 rounded-lg border-l-4 border-purple-500">
                        <p className="text-gray-800">{selectedItem.pharmacy}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Medical Record Reference if available */}
                {selectedItem.medicalRecordId && (
                  <div className="info-group">
                    <label className="info-label">Related Medical Report</label>
                    <div className="info-value bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 text-sm">This prescription is part of a medical report</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button onClick={closeModal} className="btn-secondary">
                  Close
                </button>
                {selectedItem.status === 'active' && selectedItem.refills > 0 && (
                  <button 
                    onClick={() => {
                      closeModal();
                      openModal('requestRefill', selectedItem);
                    }} 
                    className="btn-primary"
                  >
                    <FaEdit className="mr-2" />
                    Request Refill
                  </button>
                )}
              </div>
            </div>
          );

        case 'bookAppointment':
          return (
            <div>
              <h2 className="text-xl font-semibold mb-4">Book New Appointment</h2>
              <form className="space-y-4">
                <div>
                  <label className="form-label">Select Doctor</label>
                  <select className="form-input">
                    <option value="">Choose a doctor</option>
                    <option value="dr-sarah">Dr. Sarah Johnson - Cardiology</option>
                    <option value="dr-robert">Dr. Robert Chen - Neurology</option>
                    <option value="dr-maria">Dr. Maria Garcia - Pediatrics</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Appointment Type</label>
                  <select className="form-input">
                    <option value="">Select type</option>
                    <option value="consultation">Consultation</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                    <option value="checkup">Checkup</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Preferred Date</label>
                  <input type="date" className="form-input" />
                </div>
                <div>
                  <label className="form-label">Preferred Time</label>
                  <select className="form-input">
                    <option value="">Select time</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="02:00">02:00 PM</option>
                    <option value="03:00">03:00 PM</option>
                    <option value="04:00">04:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Notes</label>
                  <textarea 
                    className="form-input" 
                    rows="3" 
                    placeholder="Any specific concerns or symptoms..."
                  ></textarea>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          );

        default:
          return (
            <div>
              <h2 className="text-xl font-semibold mb-4">Information</h2>
              <p className="text-gray-600">Modal content not implemented yet.</p>
              <button onClick={closeModal} className="btn-primary mt-4">
                Close
              </button>
            </div>
          );
      }
    };

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-container" onClick={e => e.stopPropagation()}>
          {renderModalContent()}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Navbar - positioned outside dashboard container */}
      <Navbar />
      
      <div className="user-dashboard">
        {/* Add top padding to account for fixed navbar */}
        <div className="pt-20">
        {/* Header */}
        <div className="mb-6 relative z-1">
          <h1 className="text-3xl font-bold text-blue-950 mb-1">Patient Dashboard</h1>
          <p className="text-gray-700/80">Manage your health and appointments</p>
        </div>

      {/* Tabs */}
      <div className="dashboard-tabs-wrapper">
        <nav className="flex space-x-6 py-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-2 px-4 border-b-1 font-semibold text-sm transition-all rounded-t-lg ${
                activeTab === tab.id
                  ? ' text-black-700  border-b-4 border-blue-900 '
                  : 'text-blue-900/70 hover:text-blue-900 '
              }`}
            >
              <tab.icon className="inline mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'medical-records' && renderMedicalRecords()}
        {activeTab === 'prescriptions' && renderPrescriptions()}
        {activeTab === 'health-tracking' && renderHealthTracking()}
        {activeTab === 'emergency-alerts' && renderEmergencyAlerts()}
      </div>

      {/* Modal */}
      {renderModal()}

      {/* Add Health Metric Modal */}
      {showAddMetricModal && (
        <div className="modal-overlay" onClick={() => setShowAddMetricModal(false)}>
          <div className="modal-container max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <h2 className="modal-title flex items-center gap-2">
                <FaHeartbeat className="text-blue-600" />
                Add Health Metric
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Blood Pressure Systolic</label>
                    <input
                      type="number"
                      placeholder="120"
                      className="form-input"
                      value={newMetric.bloodPressureSystolic}
                      onChange={(e) => setNewMetric({...newMetric, bloodPressureSystolic: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Blood Pressure Diastolic</label>
                    <input
                      type="number"
                      placeholder="80"
                      className="form-input"
                      value={newMetric.bloodPressureDiastolic}
                      onChange={(e) => setNewMetric({...newMetric, bloodPressureDiastolic: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Heart Rate (bpm)</label>
                    <input
                      type="number"
                      placeholder="72"
                      className="form-input"
                      value={newMetric.heartRate}
                      onChange={(e) => setNewMetric({...newMetric, heartRate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      className="form-input"
                      value={newMetric.temperature}
                      onChange={(e) => setNewMetric({...newMetric, temperature: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="70"
                      className="form-input"
                      value={newMetric.weight}
                      onChange={(e) => setNewMetric({...newMetric, weight: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Height (cm)</label>
                    <input
                      type="number"
                      placeholder="175"
                      className="form-input"
                      value={newMetric.height}
                      onChange={(e) => setNewMetric({...newMetric, height: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Oxygen Saturation (%)</label>
                    <input
                      type="number"
                      placeholder="98"
                      className="form-input"
                      value={newMetric.oxygenSaturation}
                      onChange={(e) => setNewMetric({...newMetric, oxygenSaturation: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="form-label">Blood Sugar</label>
                    <input
                      type="number"
                      placeholder="100"
                      className="form-input"
                      value={newMetric.bloodSugar}
                      onChange={(e) => setNewMetric({...newMetric, bloodSugar: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Notes (Optional)</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Any additional notes..."
                    value={newMetric.notes}
                    onChange={(e) => setNewMetric({...newMetric, notes: e.target.value})}
                  />
                </div>

                <div className="flex gap-4">
                  <button onClick={handleAddHealthMetric} className="action-btn-primary">
                    Save Metric
                  </button>
                  <button onClick={() => setShowAddMetricModal(false)} className="action-btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Alert Modal */}
      {showEmergencyModal && (
        <div className="modal-overlay" onClick={() => setShowEmergencyModal(false)}>
          <div className="modal-container max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <h2 className="modal-title flex items-center gap-2 text-red-600">
                <FaExclamationTriangle className="text-red-600" />
                🚨 Emergency Alert
              </h2>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700">
                    This will immediately notify available doctors. Use only for genuine medical emergencies.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Emergency Type *</label>
                    <select
                      className="form-input"
                      value={emergencyData.emergencyType}
                      onChange={(e) => setEmergencyData({...emergencyData, emergencyType: e.target.value})}
                    >
                      <option value="">Select emergency type</option>
                      <option value="severe_pain">Severe Pain</option>
                      <option value="breathing_difficulty">Breathing Difficulty</option>
                      <option value="chest_pain">Chest Pain</option>
                      <option value="high_fever">High Fever</option>
                      <option value="bleeding">Bleeding</option>
                      <option value="loss_of_consciousness">Loss of Consciousness</option>
                      <option value="severe_allergic_reaction">Severe Allergic Reaction</option>
                      <option value="mental_health_crisis">Mental Health Crisis</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Severity *</label>
                    <select
                      className="form-input"
                      value={emergencyData.severity}
                      onChange={(e) => setEmergencyData({...emergencyData, severity: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Description *</label>
                  <textarea
                    className="form-input"
                    rows="4"
                    placeholder="Describe your emergency in detail..."
                    value={emergencyData.description}
                    onChange={(e) => setEmergencyData({...emergencyData, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="form-label">Current Location</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Your current location"
                    value={emergencyData.location}
                    onChange={(e) => setEmergencyData({...emergencyData, location: e.target.value})}
                  />
                </div>

                <div>
                  <label className="form-label">Contact Phone Number <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="Enter 10-digit phone number"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    value={emergencyData.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setEmergencyData({...emergencyData, phoneNumber: value});
                    }}
                    required
                  />
                  {emergencyData.phoneNumber && emergencyData.phoneNumber.length !== 10 && (
                    <p className="text-red-500 text-sm mt-1">Phone number must be exactly 10 digits</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Current Vitals (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Blood Pressure</label>
                      <input
                        type="text"
                        placeholder="120/80"
                        className="form-input"
                        value={emergencyData.currentVitals.bloodPressure}
                        onChange={(e) => setEmergencyData({
                          ...emergencyData,
                          currentVitals: {...emergencyData.currentVitals, bloodPressure: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Heart Rate</label>
                      <input
                        type="text"
                        placeholder="72 bpm"
                        className="form-input"
                        value={emergencyData.currentVitals.heartRate}
                        onChange={(e) => setEmergencyData({
                          ...emergencyData,
                          currentVitals: {...emergencyData.currentVitals, heartRate: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Temperature</label>
                      <input
                        type="text"
                        placeholder="98.6°F"
                        className="form-input"
                        value={emergencyData.currentVitals.temperature}
                        onChange={(e) => setEmergencyData({
                          ...emergencyData,
                          currentVitals: {...emergencyData.currentVitals, temperature: e.target.value}
                        })}
                      />
                    </div>
                    <div>
                      <label className="form-label">Oxygen Level</label>
                      <input
                        type="text"
                        placeholder="98%"
                        className="form-input"
                        value={emergencyData.currentVitals.oxygenLevel}
                        onChange={(e) => setEmergencyData({
                          ...emergencyData,
                          currentVitals: {...emergencyData.currentVitals, oxygenLevel: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleSendEmergencyAlert} className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all">
                    🚨 Send Emergency Alert
                  </button>
                  <button onClick={() => setShowEmergencyModal(false)} className="action-btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
