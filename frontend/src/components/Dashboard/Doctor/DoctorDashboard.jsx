import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getDoctorAppointments, updateAppointmentStatus, cancelAppointment } from '../../../services/appointmentService';
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
  FaSignOutAlt
} from 'react-icons/fa';
import './DoctorDashboard.css';

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
      // The state should already be updated by optimistic update, but this ensures consistency
    };

    window.addEventListener('appointmentUpdated', handleAppointmentUpdate);
    return () => window.removeEventListener('appointmentUpdated', handleAppointmentUpdate);
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
              ? { ...apt, status: newStatus, priority: newStatus === 'confirmed' ? 'high' : apt.priority }
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
          alert(`Appointment ${newStatus === 'confirmed' ? 'confirmed' : newStatus === 'completed' ? 'completed' : 'updated'} successfully!\nNote: ${cancelledCount} other pending appointment(s) for the same slot were cancelled.` + (emails.length ? `\nCancelled patients: ${emails.join(', ')}` : ''));
        } else {
          alert(`Appointment ${newStatus === 'confirmed' ? 'confirmed' : newStatus === 'completed' ? 'completed' : 'updated'} successfully! Patient will be notified.`);
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
    { id: 'prescriptions', label: 'Prescriptions', icon: FaPills },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine }
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
      handleStatusUpdate(appointmentId, 'confirmed');
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
      confirmed: 'bg-green-100 text-green-800',
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
            <h3 className="stat-value">{analytics.totalPatients}</h3>
            <p className="stat-label">Total Patients</p>
            <span className="stat-change positive">+{analytics.patientGrowth}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-green-500">
            <FaCalendarAlt className="text-white" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{analytics.totalAppointments}</h3>
            <p className="stat-label">This Month</p>
            <span className="stat-change positive">+{analytics.appointmentGrowth}%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-yellow-500">
            <FaClock className="text-white" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{analytics.pendingToday}</h3>
            <p className="stat-label">Pending Today</p>
            <span className="stat-change neutral">No change</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-red-500">
            <FaExclamationTriangle className="text-white" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{analytics.criticalCases}</h3>
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
          {appointments.filter(apt => apt.date === '2024-01-15').map(appointment => (
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
          {medicalRecords.slice(0, 3).map(record => (
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
            <option value="confirmed">Confirmed</option>
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
                          onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                          className="btn-icon btn-success btn-sm"
                          title="Confirm Appointment"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      {appointment.status === 'confirmed' && (
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

  const renderPatients = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <button className="btn-primary">
          <FaPlus className="mr-2" />
          Add Patient
        </button>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map(patient => (
          <div key={patient.id} className="patient-card">
            <div className="patient-header">
              <div className="patient-avatar-large">
                <FaUser className="text-gray-400" />
              </div>
              <div className="patient-status">
                <span className={`status-badge ${getStatusBadge(patient.status)}`}>
                  {patient.status}
                </span>
              </div>
            </div>
            
            <div className="patient-info">
              <h3 className="patient-name">{patient.name}</h3>
              <p className="patient-id">ID: {patient.id}</p>
              <div className="patient-details">
                <div className="detail-item">
                  <span className="detail-label">Age:</span>
                  <span className="detail-value">{patient.age} years</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Gender:</span>
                  <span className="detail-value">{patient.gender}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Visit:</span>
                  <span className="detail-value">{patient.lastVisit}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Next Appointment:</span>
                  <span className="detail-value">{patient.nextAppointment}</span>
                </div>
              </div>
              
              <div className="patient-contacts">
                <div className="contact-item">
                  <FaPhone className="text-gray-400" />
                  <span className="text-sm text-gray-600">{patient.phone}</span>
                </div>
                <div className="contact-item">
                  <FaEnvelope className="text-gray-400" />
                  <span className="text-sm text-gray-600">{patient.email}</span>
                </div>
              </div>

              <div className="patient-actions">
                <button 
                  onClick={() => openModal('patient', patient)}
                  className="btn-secondary btn-sm"
                >
                  <FaEye className="mr-1" />
                  View Profile
                </button>
                <button 
                  onClick={() => openModal('edit-patient', patient)}
                  className="btn-primary btn-sm"
                >
                  <FaEdit className="mr-1" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
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
        {medicalRecords.map(record => (
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
              {prescriptions.map(prescription => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Revenue and Growth */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="analytics-card">
          <div className="analytics-header">
            <h3 className="analytics-title">Monthly Revenue</h3>
            <FaChartBar className="analytics-icon text-blue-500" />
          </div>
          <div className="analytics-value">${analytics.revenue.toLocaleString()}</div>
          <div className="analytics-change positive">
            <FaArrowUp className="mr-1" />
            +15.2% from last month
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-header">
            <h3 className="analytics-title">Patient Growth</h3>
            <FaUsers className="analytics-icon text-green-500" />
          </div>
          <div className="analytics-value">+{analytics.patientGrowth}%</div>
          <div className="analytics-change positive">
            <FaArrowUp className="mr-1" />
            +{analytics.patientGrowth}% this month
          </div>
        </div>

        <div className="analytics-card">
          <div className="analytics-header">
            <h3 className="analytics-title">Satisfaction Rate</h3>
            <FaChartLine className="analytics-icon text-yellow-500" />
          </div>
          <div className="analytics-value">{analytics.satisfactionRate}/5.0</div>
          <div className="analytics-change positive">
            <FaArrowUp className="mr-1" />
            +0.2 from last month
          </div>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
          <div className="flex space-x-2">
            <button className="btn-secondary btn-sm">
              <FaDownload className="mr-1" />
              Export
            </button>
            <button className="btn-secondary btn-sm">
              <FaFilter className="mr-1" />
              Filter
            </button>
          </div>
        </div>
        
        <div className="h-64 flex items-end justify-center space-x-8">
          {analytics.monthlyStats.map((stat, index) => (
            <div key={stat.month} className="flex flex-col items-center">
              <div className="text-sm text-gray-600 mb-2">{stat.month}</div>
              <div 
                className="bg-blue-500 rounded-t w-16 transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${(stat.revenue / 3000) * 200}px` }}
              ></div>
              <div className="text-xs text-gray-500 mt-1">${stat.revenue}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Statistics</h3>
          <div className="space-y-4">
            <div className="metric-item">
              <div className="metric-label">Completed Today</div>
              <div className="metric-value">{analytics.completedToday}</div>
              <div className="metric-bar">
                <div 
                  className="metric-bar-fill bg-green-500"
                  style={{ width: `${(analytics.completedToday / 10) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="metric-item">
              <div className="metric-label">Pending Today</div>
              <div className="metric-value">{analytics.pendingToday}</div>
              <div className="metric-bar">
                <div 
                  className="metric-bar-fill bg-yellow-500"
                  style={{ width: `${(analytics.pendingToday / 10) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="metric-item">
              <div className="metric-label">Critical Cases</div>
              <div className="metric-value">{analytics.criticalCases}</div>
              <div className="metric-bar">
                <div 
                  className="metric-bar-fill bg-red-500"
                  style={{ width: `${(analytics.criticalCases / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="quick-action-btn">
              <FaCalendarAlt className="mr-2" />
              Schedule New Appointment
            </button>
            <button className="quick-action-btn">
              <FaUser className="mr-2" />
              Add New Patient
            </button>
            <button className="quick-action-btn">
              <FaFileMedical className="mr-2" />
              Create Medical Record
            </button>
            <button className="quick-action-btn">
              <FaPills className="mr-2" />
              Write Prescription
            </button>
            <button className="quick-action-btn">
              <FaChartLine className="mr-2" />
              Generate Report
            </button>
          </div>
        </div>
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
        <div className="modal-container" onClick={e => e.stopPropagation()}>
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

  return (
    <div className="doctor-dashboard">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
        <p className="text-gray-600">Manage your patients and practice</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
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
      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'appointments' && renderAppointments()}
        {activeTab === 'patients' && renderPatients()}
        {activeTab === 'medical-records' && renderMedicalRecords()}
        {activeTab === 'prescriptions' && renderPrescriptions()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default DoctorDashboard;
