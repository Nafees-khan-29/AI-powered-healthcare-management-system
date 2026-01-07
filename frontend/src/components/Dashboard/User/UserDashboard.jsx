import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { getUserAppointments, updateAppointmentStatus, cancelAppointment, updateAppointment } from '../../../services/appointmentService';
import { getPatientMedicalRecords, getPatientPrescriptions } from '../../../services/medicalRecordService';
import { getUserHealthMetrics, getLatestHealthMetrics, addHealthMetric } from '../../../services/healthMetricService';
import { createEmergencyAlert, getPatientAlerts } from '../../../services/emergencyAlertService';
import Navbar from '../../Hero-com/Navbar';
import Footer from '../../Hero-com/Footer';
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
  FaArrowLeft,
  FaAmbulance,
  FaHome,
  FaComments,
  FaQuestionCircle,
  FaChartLine,
  FaSignOutAlt,
  FaSpinner,
  FaSave
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

  // Fetch health metrics on load
  useEffect(() => {
    fetchHealthMetrics();
  }, [user, isLoaded]);

  // Fetch emergency alerts on load
  useEffect(() => {
    fetchEmergencyAlerts();
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
          patientAge: apt.patientAge,
          patientGender: apt.patientGender,
          additionalNotes: apt.additionalNotes,
          emergencyContact: apt.emergencyContact,
          insuranceProvider: apt.insuranceProvider,
          previousConditions: apt.previousConditions,
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
    
    setIsLoadingHealthMetrics(true);
    try {
      console.log('📥 Fetching health metrics for user:', user.id);
      
      // Get latest health metrics
      const latestResponse = await getLatestHealthMetrics(user.id);
      console.log('✅ Latest health metrics:', latestResponse);
      
      if (latestResponse.success && latestResponse.metrics) {
        const metrics = latestResponse.metrics;
        
        // Format blood pressure from systolic/diastolic
        const bloodPressure = metrics.bloodPressureSystolic && metrics.bloodPressureDiastolic
          ? `${metrics.bloodPressureSystolic}/${metrics.bloodPressureDiastolic}`
          : 'N/A';
        
        // Calculate BMI if weight and height are available
        const bmi = metrics.weight && metrics.height
          ? (metrics.weight / Math.pow(metrics.height / 100, 2)).toFixed(1)
          : 'N/A';
        
        setHealthMetrics({
          bloodPressure: bloodPressure,
          heartRate: metrics.heartRate ? `${metrics.heartRate} bpm` : 'N/A',
          temperature: metrics.temperature ? `${metrics.temperature}°F` : 'N/A',
          weight: metrics.weight ? `${metrics.weight} kg` : 'N/A',
          height: metrics.height ? `${metrics.height} cm` : 'N/A',
          bmi: bmi,
          oxygenLevel: metrics.oxygenSaturation ? `${metrics.oxygenSaturation}%` : 'N/A'
        });
      } else {
        // Set default values if no metrics found
        setHealthMetrics({
          bloodPressure: 'No data',
          heartRate: 'No data',
          temperature: 'No data',
          weight: 'No data',
          height: 'No data',
          bmi: 'No data',
          oxygenLevel: 'No data'
        });
      }
      
      // Get health metrics history
      const historyResponse = await getUserHealthMetrics(user.id, { limit: 30 });
      if (historyResponse.success) {
        setHealthMetricsHistory(historyResponse.metrics || []);
      }
    } catch (error) {
      console.error('❌ Error fetching health metrics:', error);
      setHealthMetrics({
        bloodPressure: 'Error',
        heartRate: 'Error',
        temperature: 'Error',
        weight: 'Error',
        height: 'Error',
        bmi: 'Error',
        oxygenLevel: 'Error'
      });
    } finally {
      setIsLoadingHealthMetrics(false);
    }
  };

  // Fetch emergency alerts
  const fetchEmergencyAlerts = async () => {
    if (!isLoaded || !user) return;
    
    setIsLoadingAlerts(true);
    try {
      console.log('📥 Fetching emergency alerts for user:', user.id);
      const response = await getPatientAlerts(user.id);
      console.log('✅ Emergency alerts:', response);
      
      if (response.success) {
        setEmergencyAlerts(response.alerts || []);
      }
    } catch (error) {
      console.error('❌ Error fetching emergency alerts:', error);
      setEmergencyAlerts([]);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  // Medical records state
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [isLoadingMedicalRecords, setIsLoadingMedicalRecords] = useState(false);

  // Prescriptions state
  const [prescriptions, setPrescriptions] = useState([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);

  // Health metrics state - now dynamic
  const [healthMetrics, setHealthMetrics] = useState({
    bloodPressure: 'Loading...',
    heartRate: 'Loading...',
    temperature: 'Loading...',
    weight: 'Loading...',
    height: 'Loading...',
    bmi: 'Loading...',
    oxygenLevel: 'Loading...'
  });
  const [isLoadingHealthMetrics, setIsLoadingHealthMetrics] = useState(true);
  const [healthMetricsHistory, setHealthMetricsHistory] = useState([]);

  // Emergency alert state
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencyFormData, setEmergencyFormData] = useState({
    emergencyType: 'breathing_difficulty',
    severity: 'critical',
    patientPhone: '',
    patientEmail: '',
    description: '',
    location: '',
    currentVitals: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      oxygenLevel: ''
    }
  });
  const [isSendingAlert, setIsSendingAlert] = useState(false);

  // Health metrics form state
  const [metricsFormData, setMetricsFormData] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenLevel: ''
  });
  const [isUpdatingMetrics, setIsUpdatingMetrics] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarAlt },
    { id: 'medical-records', label: 'Medical Records', icon: FaFileMedical },
    { id: 'prescriptions', label: 'Prescriptions', icon: FaPills },
    { id: 'health-tracking', label: 'Health Tracking', icon: FaHeartbeat }
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

  // Open emergency modal with pre-filled user data
  const openEmergencyModal = () => {
    setEmergencyFormData({
      emergencyType: 'breathing_difficulty',
      severity: 'critical',
      patientPhone: user?.primaryPhoneNumber?.phoneNumber || user?.phoneNumber || '',
      patientEmail: user?.primaryEmailAddress?.emailAddress || '',
      description: '',
      location: '',
      currentVitals: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        oxygenLevel: ''
      }
    });
    setShowEmergencyModal(true);
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

  // Handle emergency alert form changes
  const handleEmergencyFormChange = (field, value) => {
    if (field.startsWith('currentVitals.')) {
      const vitalField = field.split('.')[1];
      setEmergencyFormData(prev => ({
        ...prev,
        currentVitals: {
          ...prev.currentVitals,
          [vitalField]: value
        }
      }));
    } else {
      setEmergencyFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Send emergency alert
  const handleSendEmergencyAlert = async () => {
    if (!emergencyFormData.description.trim()) {
      alert('Please provide a description of the emergency');
      return;
    }

    if (!emergencyFormData.patientPhone.trim()) {
      alert('Please provide a phone number for contact');
      return;
    }

    if (!emergencyFormData.patientEmail.trim()) {
      alert('Please provide an email address');
      return;
    }

    setIsSendingAlert(true);
    try {
      const alertData = {
        patientId: user.id,
        patientEmail: emergencyFormData.patientEmail,
        patientName: user.fullName || user.firstName + ' ' + user.lastName,
        patientPhone: emergencyFormData.patientPhone,
        emergencyType: emergencyFormData.emergencyType,
        severity: emergencyFormData.severity,
        description: emergencyFormData.description,
        location: emergencyFormData.location,
        currentVitals: emergencyFormData.currentVitals
      };

      console.log('🚨 Sending emergency alert:', alertData);
      const response = await createEmergencyAlert(alertData);
      console.log('✅ Emergency alert sent:', response);

      alert('Emergency alert sent successfully! A doctor will respond shortly.');
      
      // Reset form and close modal
      setEmergencyFormData({
        emergencyType: 'breathing_difficulty',
        severity: 'critical',
        patientPhone: '',
        patientEmail: '',
        description: '',
        location: '',
        currentVitals: {
          bloodPressure: '',
          heartRate: '',
          temperature: '',
          oxygenLevel: ''
        }
      });
      setShowEmergencyModal(false);

      // Refresh alerts list
      fetchEmergencyAlerts();
    } catch (error) {
      console.error('❌ Error sending emergency alert:', error);
      alert('Failed to send emergency alert: ' + error.message);
    } finally {
      setIsSendingAlert(false);
    }
  };

  // Handle health metrics form changes
  const handleMetricsFormChange = (field, value) => {
    setMetricsFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle health metrics update
  const handleUpdateHealthMetrics = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!metricsFormData.bloodPressure && !metricsFormData.heartRate && 
        !metricsFormData.temperature && !metricsFormData.weight && 
        !metricsFormData.height && !metricsFormData.oxygenLevel) {
      alert('Please fill in at least one health metric');
      return;
    }

    setIsUpdatingMetrics(true);
    try {
      // Parse blood pressure into systolic and diastolic
      let bloodPressureSystolic, bloodPressureDiastolic;
      if (metricsFormData.bloodPressure) {
        const bpParts = metricsFormData.bloodPressure.split('/');
        if (bpParts.length === 2) {
          bloodPressureSystolic = parseInt(bpParts[0].trim());
          bloodPressureDiastolic = parseInt(bpParts[1].trim());
        }
      }

      // Parse numeric values
      const heartRate = metricsFormData.heartRate ? parseFloat(metricsFormData.heartRate) : undefined;
      const temperature = metricsFormData.temperature ? parseFloat(metricsFormData.temperature) : undefined;
      const oxygenSaturation = metricsFormData.oxygenLevel ? parseFloat(metricsFormData.oxygenLevel) : undefined;
      const weight = metricsFormData.weight ? parseFloat(metricsFormData.weight) : undefined;
      const height = metricsFormData.height ? parseFloat(metricsFormData.height) : undefined;

      const metricsData = {
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress,
        userName: user.fullName || `${user.firstName} ${user.lastName}`,
        bloodPressureSystolic,
        bloodPressureDiastolic,
        heartRate,
        temperature,
        oxygenSaturation,
        weight,
        height,
        source: 'manual'
      };

      console.log('📊 Updating health metrics:', metricsData);
      const response = await addHealthMetric(metricsData);
      console.log('✅ Health metrics updated:', response);

      alert('Health metrics updated successfully!');
      
      // Reset form
      setMetricsFormData({
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: '',
        oxygenLevel: ''
      });
      closeModal();

      // Refresh health metrics
      fetchHealthMetrics();
    } catch (error) {
      console.error('❌ Error updating health metrics:', error);
      alert('Failed to update health metrics: ' + error.message);
    } finally {
      setIsUpdatingMetrics(false);
    }
  };

  const renderOverview = () => (
    <div className="overview-container">
      {/* Summary Cards Row */}
      <div className="summary-cards-row">
        <div className="summary-card blue">
          <div className="card-icon">
            <FaCalendarAlt />
          </div>
          <div className="card-content">
            <h3 className="card-title">Upcoming</h3>
            <p className="card-value">
              {appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'pending').length}
            </p>
            <p className="card-subtitle">Appointments</p>
          </div>
        </div>
        
        <div className="summary-card green">
          <div className="card-icon">
            <FaPills />
          </div>
          <div className="card-content">
            <h3 className="card-title">Active</h3>
            <p className="card-value">{prescriptions.filter(p => p.status === 'active').length}</p>
            <p className="card-subtitle">Prescriptions</p>
          </div>
        </div>
        
        <div className="summary-card purple">
          <div className="card-icon">
            <FaFileMedical />
          </div>
          <div className="card-content">
            <h3 className="card-title">Medical</h3>
            <p className="card-value">{medicalRecords.length}</p>
            <p className="card-subtitle">Records</p>
          </div>
        </div>
        
        <div className="summary-card orange">
          <div className="card-icon">
            <FaHeartbeat />
          </div>
          <div className="card-content">
            <h3 className="card-title">BMI</h3>
            <p className="card-value">{healthMetrics.bmi !== 'Loading...' && healthMetrics.bmi !== 'No data' ? healthMetrics.bmi : 'N/A'}</p>
            <p className="card-subtitle">Health Metric</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Next Appointment Card */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-heading">
              <FaCalendarAlt className="inline mr-2 text-blue-600" />
              Next Appointment
            </h3>
            <button 
              onClick={() => setActiveTab('appointments')}
              className="view-all-btn"
            >
              View All
            </button>
          </div>
          <div className="card-body">
            {isLoadingAppointments ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading appointments...</p>
              </div>
            ) : (() => {
              // Get the most recent upcoming appointment (pending, booked, or confirmed)
              const upcomingAppointments = appointments
                .filter(apt => ['pending', 'booked', 'confirmed'].includes(apt.status))
                .sort((a, b) => {
                  const dateA = new Date(a.date);
                  const dateB = new Date(b.date);
                  return dateA - dateB;
                });
              
              const nextAppt = upcomingAppointments[0];
              
              return nextAppt ? (
                <div className="appointment-item">
                  <div className="appointment-icon">
                    <FaUser className="text-2xl text-blue-600" />
                  </div>
                  <div className="appointment-details">
                    <h4 className="appointment-doctor">{nextAppt.doctor}</h4>
                    <p className="appointment-specialty">{nextAppt.specialty}</p>
                    <div className="appointment-meta">
                      <span className="meta-item">
                        <FaClock className="mr-1" />
                        {nextAppt.date} at {nextAppt.time}
                      </span>
                      <span className={`status-badge ${nextAppt.status}`}>
                        {nextAppt.status}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <FaCalendarAlt className="empty-icon" />
                  <p>No upcoming appointments</p>
                  <button 
                    onClick={() => setActiveTab('appointments')}
                    className="btn-primary-sm"
                  >
                    Book Appointment
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-heading">
              <FaChartLine className="inline mr-2 text-green-600" />
              Recent Activity
            </h3>
          </div>
          <div className="card-body">
            <div className="activity-list">
              {emergencyAlerts.slice(0, 3).map((alert, idx) => (
                <div key={idx} className="activity-item">
                  <div className={`activity-dot ${alert.severity}`}></div>
                  <div className="activity-content">
                    <p className="activity-title">{alert.emergencyType.replace(/_/g, ' ')}</p>
                    <p className="activity-time">{new Date(alert.alertSentAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`activity-status ${alert.status}`}>
                    {alert.status}
                  </span>
                </div>
              ))}
              {appointments.slice(0, 2).map((apt, idx) => (
                <div key={`apt-${idx}`} className="activity-item">
                  <div className="activity-dot blue"></div>
                  <div className="activity-content">
                    <p className="activity-title">Appointment with {apt.doctor}</p>
                    <p className="activity-time">{apt.date}</p>
                  </div>
                  <span className={`activity-status ${apt.status}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
              {emergencyAlerts.length === 0 && appointments.length === 0 && (
                <div className="empty-state-sm">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics Overview */}
      <div className="content-card full-width">
        <div className="card-header">
          <h3 className="card-heading">
            <FaHeartbeat className="inline mr-2 text-red-600" />
            Health Metrics Overview
          </h3>
          <button 
            onClick={() => setActiveTab('health-tracking')}
            className="view-all-btn"
          >
            View Details
          </button>
        </div>
        <div className="card-body">
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Blood Pressure</span>
              <span className="metric-value">{healthMetrics.bloodPressure}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Heart Rate</span>
              <span className="metric-value">{healthMetrics.heartRate}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Temperature</span>
              <span className="metric-value">{healthMetrics.temperature}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Weight</span>
              <span className="metric-value">{healthMetrics.weight}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Height</span>
              <span className="metric-value">{healthMetrics.height}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Oxygen Level</span>
              <span className="metric-value">{healthMetrics.oxygenLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOverviewOld = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-90">Upcoming</p>
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
        ) : (() => {
          // Get the most recent upcoming appointment (pending, booked, or confirmed)
          const upcomingAppointments = appointments
            .filter(apt => ['pending', 'booked', 'confirmed'].includes(apt.status))
            .sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateA - dateB;
            });
          
          const nextAppt = upcomingAppointments[0];
          
          return nextAppt ? (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">
                    {nextAppt.doctor}
                  </h4>
                  <p className="text-blue-800">
                    {nextAppt.specialty}
                  </p>
                  <p className="text-blue-700 text-sm">
                    {nextAppt.date} at {nextAppt.time}
                  </p>
                  <p className="text-blue-700 text-sm">
                    {nextAppt.location || 'Consultation'}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`status-badge ${nextAppt.status}`}>
                    {nextAppt.status}
                  </span>
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
          );
        })()}
      </div>

      {/* Recent Activity */}
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {medicalRecords.slice(0, 3).map((record) => (
            <div key={record.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
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

  const renderAppointments = () => (
    <div className="content-card full-width">
      <div className="card-header">
        <h3 className="card-heading">
          <FaCalendarAlt className="inline mr-2 text-blue-600" />
          My Appointments
        </h3>
        <div className="flex gap-4">
          <select className="filter-select">
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
          <button 
            onClick={() => navigate('/appointment')}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus />
            Book New
          </button>
        </div>
      </div>
      <div className="card-body">

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
        ) : (() => {
          const filteredAppointments = appointments.filter(appointment => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase().trim();
            return (
              appointment.doctor?.toLowerCase().includes(query) ||
              appointment.specialty?.toLowerCase().includes(query) ||
              appointment.date?.toLowerCase().includes(query) ||
              appointment.time?.toLowerCase().includes(query) ||
              appointment.status?.toLowerCase().includes(query) ||
              appointment.location?.toLowerCase().includes(query) ||
              appointment.notes?.toLowerCase().includes(query) ||
              appointment.symptoms?.toLowerCase().includes(query)
            );
          });

          if (filteredAppointments.length === 0 && searchQuery.trim()) {
            return (
              <div className="dashboard-card p-12 text-center text-gray-500">
                <FaSearch className="text-5xl mx-auto mb-4 text-gray-300" />
                <p className="text-lg mb-2">No appointments found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Search
                </button>
              </div>
            );
          }

          return filteredAppointments.map((appointment) => (
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
                    {appointment.medicalReports && appointment.medicalReports.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
                        <FaFileMedical />
                        <span>{appointment.medicalReports.length} Medical Report{appointment.medicalReports.length > 1 ? 's' : ''} Attached</span>
                      </div>
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
          ));
        })()}
      </div>
      </div>
    </div>
  );

  const renderMedicalRecords = () => (
    <div className="content-card full-width">
      <div className="card-header">
        <h3 className="card-heading">
          <FaFileMedical className="inline mr-2 text-cyan-600" />
          Medical Records
        </h3>
        <div className="flex gap-4">
          <select className="filter-select">
            <option value="all">All Types</option>
            <option value="blood-test">Blood Test</option>
            <option value="x-ray">X-Ray</option>
            <option value="ecg">ECG</option>
            <option value="mri">MRI</option>
          </select>
          <button 
            onClick={() => openModal('uploadRecord')}
            className="btn-primary flex items-center gap-2"
          >
            <FaUpload />
            Upload
          </button>
        </div>
      </div>
      <div className="card-body">

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
    </div>
  );

  const renderPrescriptions = () => (
    <div className="content-card full-width">
      <div className="card-header">
        <h3 className="card-heading">
          <FaPills className="inline mr-2 text-green-600" />
          My Prescriptions
        </h3>
        <div className="flex gap-4">
          <select className="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
          </select>
          <button 
            onClick={() => openModal('requestRefill')}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus />
            Request Refill
          </button>
        </div>
      </div>
      <div className="card-body">
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
    </div>
  );

  const renderHealthTracking = () => (
    <div className="space-y-6">
      {/* Emergency Alert Button */}
      <div className="content-card full-width">
        <div className="card-body">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <FaAmbulance className="text-2xl" />
                  Emergency Alert
                </h3>
                <p className="text-white/90">Need immediate medical assistance? Send an alert to available doctors.</p>
              </div>
              <button
                onClick={openEmergencyModal}
                className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors shadow-lg flex items-center gap-2"
              >
                <FaExclamationCircle />
                Send Emergency Alert
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="content-card full-width">
        <div className="card-header">
          <h3 className="card-heading">
            <FaHeartbeat className="inline mr-2 text-red-600" />
            Health Metrics
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaHeartbeat className="text-blue-600" />
            Vital Signs
          </h3>
          {isLoadingHealthMetrics ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
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
              <div className="flex justify-between">
                <span>Oxygen Level</span>
                <span className="font-semibold">{healthMetrics.oxygenLevel}</span>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaUser className="text-cyan-600" />
            Body Metrics
          </h3>
          {isLoadingHealthMetrics ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
            </div>
          ) : (
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
              <button
                onClick={() => openModal('updateMetrics')}
                className="w-full mt-3 btn-secondary text-sm"
              >
                <FaPlus className="inline mr-1" />
                Update Metrics
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaBell className="text-blue-600" />
            Reminders
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FaCheckCircle className="text-cyan-600" />
              <span>Take morning medication</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaClock className="text-blue-600" />
              <span>Blood pressure check</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaExclamationTriangle className="text-blue-600" />
              <span>Schedule follow-up</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Alerts History */}
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaAmbulance className="text-red-600" />
          Emergency Alerts History
        </h3>
        {isLoadingAlerts ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-red-500"></div>
            <p className="text-gray-600 mt-4">Loading alerts...</p>
          </div>
        ) : emergencyAlerts.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border">
            <FaAmbulance className="text-4xl mx-auto mb-4 text-gray-300" />
            <p className="text-gray-700">No emergency alerts sent</p>
            <p className="text-sm text-gray-600">Your emergency alert history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {emergencyAlerts.slice(0, 5).map((alert) => (
              <div 
                key={alert._id} 
                className={`border-l-4 p-4 rounded-lg ${
                  alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                  alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-blue-500 bg-blue-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        alert.severity === 'critical' ? 'bg-red-600 text-white' :
                        alert.severity === 'high' ? 'bg-orange-600 text-white' :
                        alert.severity === 'medium' ? 'bg-yellow-600 text-white' :
                        'bg-blue-600 text-white'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        alert.status === 'acknowledged' ? 'bg-yellow-200 text-yellow-800' :
                        alert.status === 'responded' ? 'bg-blue-200 text-blue-800' :
                        alert.status === 'resolved' ? 'bg-green-200 text-green-800' :
                        'bg-white text-gray-800 border'
                      }`}>
                        {alert.status === 'acknowledged' ? 'ACKNOWLEDGED' :
                         alert.status === 'responded' ? 'RESPONDED' :
                         alert.status === 'resolved' ? 'RESOLVED' :
                         'PENDING'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {alert.emergencyType.replace(/_/g, ' ').toUpperCase()}
                    </h4>
                    <p className="text-gray-700 text-sm mb-2">{alert.description}</p>
                    <div className="text-xs text-gray-600">
                      <p>📅 {new Date(alert.alertSentAt).toLocaleString()}</p>
                      {alert.doctorName && (
                        <p className="mt-1">👨‍⚕️ Handled by: {alert.doctorName}</p>
                      )}
                      {alert.acknowledgedAt && (
                        <p className="mt-1">✓ Acknowledged: {new Date(alert.acknowledgedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {emergencyAlerts.length > 5 && (
              <p className="text-center text-sm text-gray-600">
                Showing 5 of {emergencyAlerts.length} alerts
              </p>
            )}
          </div>
        )}
      </div>

      {/* Health Trends Chart Placeholder */}
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold mb-4">Health Trends</h3>
        <div className="bg-white rounded-lg p-8 text-center border">
          <FaHeartbeat className="text-4xl mx-auto mb-4 text-blue-300" />
          <p className="text-gray-700">Health trends chart will be displayed here</p>
          <p className="text-sm text-gray-600">Track your progress over time</p>
        </div>
      </div>
        </div>
      </div>
    </div>
  );

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
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
                        <div key={index} className="bg-white p-3 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{report.filename}</p>
                              <p className="text-sm text-gray-600">
                                {(report.size / 1024).toFixed(2)} KB • {report.mimetype}
                              </p>
                            </div>
                            <a 
                              href={`http://localhost:3000/${report.path}`}
                              download={report.filename}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary text-sm inline-flex items-center"
                            >
                              <FaDownload className="mr-1" />
                              Download
                            </a>
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
                <div className="p-4 bg-white rounded-lg border">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
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
                        <div key={index} className="bg-white p-4 rounded-lg border">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
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
                    <div className="info-value bg-white p-3 rounded-lg border">
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

        case 'updateMetrics':
          return (
            <div className="modal-content max-w-2xl">
              <h2 className="modal-title flex items-center gap-2">
                <FaHeartbeat className="text-red-600" />
                Update Health Metrics
              </h2>
              
              <form onSubmit={handleUpdateHealthMetrics} className="space-y-6">
                {/* Vital Signs Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="info-group">
                      <label className="info-label">Blood Pressure (mmHg)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 120/80"
                        value={metricsFormData.bloodPressure}
                        onChange={(e) => handleMetricsFormChange('bloodPressure', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: systolic/diastolic</p>
                    </div>

                    <div className="info-group">
                      <label className="info-label">Heart Rate (bpm)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 72"
                        value={metricsFormData.heartRate}
                        onChange={(e) => handleMetricsFormChange('heartRate', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Normal: 60-100 bpm</p>
                    </div>

                    <div className="info-group">
                      <label className="info-label">Temperature (°F)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 98.6"
                        value={metricsFormData.temperature}
                        onChange={(e) => handleMetricsFormChange('temperature', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Normal: 97-99°F</p>
                    </div>

                    <div className="info-group">
                      <label className="info-label">Oxygen Level (%)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 98"
                        value={metricsFormData.oxygenLevel}
                        onChange={(e) => handleMetricsFormChange('oxygenLevel', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Normal: 95-100%</p>
                    </div>
                  </div>
                </div>

                {/* Body Metrics Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Body Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="info-group">
                      <label className="info-label">Weight (kg)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 70"
                        value={metricsFormData.weight}
                        onChange={(e) => handleMetricsFormChange('weight', e.target.value)}
                      />
                    </div>

                    <div className="info-group">
                      <label className="info-label">Height (cm)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 175"
                        value={metricsFormData.height}
                        onChange={(e) => handleMetricsFormChange('height', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> Fill in the metrics you want to update. You don't need to fill all fields. 
                    BMI will be calculated automatically if you provide weight and height.
                  </p>
                </div>

                {/* Modal Actions */}
                <div className="modal-actions">
                  <button 
                    type="button" 
                    onClick={closeModal} 
                    className="btn-secondary"
                    disabled={isUpdatingMetrics}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={isUpdatingMetrics}
                  >
                    {isUpdatingMetrics ? (
                      <>
                        <FaSpinner className="mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Update Metrics
                      </>
                    )}
                  </button>
                </div>
              </form>
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
            onClick={() => handleTabChange('medical-records')}
            className={`nav-item ${activeTab === 'medical-records' ? 'active' : ''}`}
          >
            <FaFileMedical className="nav-icon" />
            <span>Medical Records</span>
          </button>
          
          <button
            onClick={() => handleTabChange('prescriptions')}
            className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`}
          >
            <FaPills className="nav-icon" />
            <span>Prescriptions</span>
          </button>
          
          <button
            onClick={() => handleTabChange('health-tracking')}
            className={`nav-item ${activeTab === 'health-tracking' ? 'active' : ''}`}
          >
            <FaChartLine className="nav-icon" />
            <span>Health Tracking</span>
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
                navigate('/login');
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
              User Dashboard
            </h1>
          </div>
          
          <div className="header-right">
            {/* Search Bar */}
            <div className="header-search">
              <FaSearch className="search-icon-header" />
              <input
                type="text"
                placeholder="Search appointments by doctor, specialty, date, time, status..."
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
          {activeTab === 'medical-records' && renderMedicalRecords()}
          {activeTab === 'prescriptions' && renderPrescriptions()}
          {activeTab === 'health-tracking' && renderHealthTracking()}
        </div>

        {/* Footer */}
        <Footer />
      </main>

      {/* Modal */}
      {renderModal()}

      {/* Emergency Alert Modal */}
      {showEmergencyModal && (
        <div className="modal-overlay" onClick={() => setShowEmergencyModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="modal-title flex items-center gap-2 text-red-600">
                <FaAmbulance className="text-2xl" />
                Send Emergency Alert
              </h2>
              <button 
                onClick={() => setShowEmergencyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-semibold flex items-center gap-2">
                <FaExclamationTriangle />
                This will immediately notify available doctors
              </p>
              <p className="text-red-700 text-sm mt-1">
                Use this feature only for genuine medical emergencies that require immediate attention.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSendEmergencyAlert(); }} className="space-y-4">
              {/* Patient Contact Information */}
              <div className="border-b pb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Phone Number *</label>
                    <input 
                      type="tel" 
                      className="form-input"
                      placeholder="Enter your phone number"
                      value={emergencyFormData.patientPhone}
                      onChange={(e) => handleEmergencyFormChange('patientPhone', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email Address *</label>
                    <input 
                      type="email" 
                      className="form-input"
                      placeholder="Enter your email"
                      value={emergencyFormData.patientEmail}
                      onChange={(e) => handleEmergencyFormChange('patientEmail', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Emergency Type *</label>
                  <select 
                    className="form-input"
                    value={emergencyFormData.emergencyType}
                    onChange={(e) => handleEmergencyFormChange('emergencyType', e.target.value)}
                    required
                  >
                    <option value="breathing_difficulty">Breathing Difficulty</option>
                    <option value="chest_pain">Chest Pain</option>
                    <option value="bleeding">Severe Bleeding</option>
                    <option value="loss_of_consciousness">Loss of Consciousness</option>
                    <option value="severe_allergic_reaction">Severe Allergic Reaction</option>
                    <option value="severe_pain">Severe Pain</option>
                    <option value="high_fever">High Fever</option>
                    <option value="mental_health_crisis">Mental Health Crisis</option>
                    <option value="other">Other Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Severity Level *</label>
                  <select 
                    className="form-input"
                    value={emergencyFormData.severity}
                    onChange={(e) => handleEmergencyFormChange('severity', e.target.value)}
                    required
                  >
                    <option value="critical">Critical (Life-threatening)</option>
                    <option value="high">High (Urgent)</option>
                    <option value="medium">Medium (Important)</option>
                    <option value="low">Low (Non-urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Description *</label>
                <textarea 
                  className="form-input" 
                  rows="4"
                  placeholder="Describe your emergency situation in detail..."
                  value={emergencyFormData.description}
                  onChange={(e) => handleEmergencyFormChange('description', e.target.value)}
                  required
                ></textarea>
              </div>

              <div>
                <label className="form-label">Current Location (Optional)</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Your current address or location"
                  value={emergencyFormData.location}
                  onChange={(e) => handleEmergencyFormChange('location', e.target.value)}
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Current Vitals (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Blood Pressure</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g., 120/80"
                      value={emergencyFormData.currentVitals.bloodPressure}
                      onChange={(e) => handleEmergencyFormChange('currentVitals.bloodPressure', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Heart Rate</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g., 75 bpm"
                      value={emergencyFormData.currentVitals.heartRate}
                      onChange={(e) => handleEmergencyFormChange('currentVitals.heartRate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Temperature</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g., 98.6°F"
                      value={emergencyFormData.currentVitals.temperature}
                      onChange={(e) => handleEmergencyFormChange('currentVitals.temperature', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Oxygen Level</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="e.g., 98%"
                      value={emergencyFormData.currentVitals.oxygenLevel}
                      onChange={(e) => handleEmergencyFormChange('currentVitals.oxygenLevel', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowEmergencyModal(false)} 
                  className="btn-secondary flex-1"
                  disabled={isSendingAlert}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary flex-1 bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                  disabled={isSendingAlert}
                >
                  {isSendingAlert ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaAmbulance />
                      Send Emergency Alert
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default UserDashboard;
