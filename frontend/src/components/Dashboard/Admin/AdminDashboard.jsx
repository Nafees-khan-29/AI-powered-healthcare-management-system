import React, { useState, useEffect } from 'react';
import Navbar from '../../Hero-com/Navbar';
import { 
  FaUsers, 
  FaUserMd, 
  FaCalendarCheck, 
  FaChartLine, 
  FaCog, 
  FaBell, 
  FaSearch,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus,
  FaDownload,
  FaFilter,
  FaSort,
  FaUserPlus,
  FaHospital,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaShieldAlt,
  FaDatabase,
  FaServer,
  FaNetworkWired,
  FaHome,
  FaQuestionCircle,
  FaSignOutAlt,
  FaComments,
  FaHeartbeat
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getAllAppointments } from '../../../services/appointmentService';
import { getAllDoctors, addDoctor, updateDoctor, deleteDoctor } from '../../../services/doctorService';
import { getCriticalAlerts, acknowledgeAlert, respondToAlert, resolveAlert } from '../../../services/emergencyAlertService';
import './AdminDashboard.css';
import Footer from '../../Hero-com/Footer';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  // Emergency Alerts state
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [showAlertResponseModal, setShowAlertResponseModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertResponse, setAlertResponse] = useState('');

  // Doctor form state
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    password: '',
    image: '',
    specialization: '',
    degree: '',
    experience: '',
    fees: '',
    address: '',
    phone: '',
    education: '',
    availability: 'Mon-Fri: 9AM-5PM'
  });

  // Mock data for demonstration
  const [stats, setStats] = useState({
    totalUsers: 1247,
    totalDoctors: 89,
    totalAppointments: 3456,
    totalRevenue: 125000,
    pendingAppointments: 23,
    activeUsers: 892,
    systemHealth: 'Excellent'
  });

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: FaHome },
    { id: 'users', label: 'User Management', icon: FaUsers },
    { id: 'doctors', label: 'Doctor Management', icon: FaUserMd },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarCheck },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'system', label: 'System', icon: FaCog },
    { id: 'messages', label: 'Messages', icon: FaComments },
    { id: 'help', label: 'Help', icon: FaQuestionCircle }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  // Filter appointments and doctors based on search query
  useEffect(() => {
    filterAppointments();
    filterDoctors();
  }, [appointments, doctors, searchQuery, filterStatus]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await getAllAppointments();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      // For demo purposes, set mock data if API fails
      setAppointments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await getAllDoctors();
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // For demo purposes, set mock data if API fails
      setDoctors([]);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (searchQuery) {
      filtered = filtered.filter(apt => 
        apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    setFilteredAppointments(filtered);
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDoctors(filtered);
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const newDoctor = {
        ...doctorForm,
        fees: parseFloat(doctorForm.fees)
      };
      
      await addDoctor(newDoctor);
      await fetchDoctors(); // Refresh the doctors list
      
      // Reset form
      setDoctorForm({
        name: '',
        email: '',
        password: '',
        image: '',
        specialization: '',
        degree: '',
        experience: '',
        fees: '',
        address: '',
        phone: '',
        education: '',
        availability: 'Mon-Fri: 9AM-5PM'
      });
      
      closeModal();
      alert('Doctor created successfully!');
    } catch (error) {
      console.error('Error creating doctor:', error);
      alert('Failed to create doctor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorFormChange = (e) => {
    const { name, value } = e.target;
    setDoctorForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditDoctor = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const updatedDoctor = {
        ...doctorForm,
        fees: parseFloat(doctorForm.fees)
      };
      
      await updateDoctor(selectedItem._id, updatedDoctor);
      await fetchDoctors(); // Refresh the doctors list
      
      closeModal();
      alert('Doctor updated successfully!');
    } catch (error) {
      console.error('Error updating doctor:', error);
      alert('Failed to update doctor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        await deleteDoctor(doctorId);
        await fetchDoctors(); // Refresh the doctors list
        alert('Doctor deleted successfully!');
      } catch (error) {
        console.error('Error deleting doctor:', error);
        alert('Failed to delete doctor. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openEditModal = (doctor) => {
    setDoctorForm({
      name: doctor.name || '',
      email: doctor.email || '',
      password: '', // Don't pre-fill password for security
      image: doctor.image || '',
      specialization: doctor.specialization || '',
      degree: doctor.degree || '',
      experience: doctor.experience || '',
      fees: doctor.fees || '',
      address: doctor.address || '',
      phone: doctor.phone || '',
      education: doctor.education || '',
      availability: doctor.availability || 'Mon-Fri: 9AM-5PM'
    });
    setSelectedItem(doctor);
    setModalType('edit-doctor');
    setShowModal(true);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilter = (status) => {
    setFilterStatus(status);
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
              onClick={() => handleTabChange('users')}
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            >
              <FaUsers className="nav-icon" />
              <span>User Management</span>
            </button>
            
            <button
              onClick={() => handleTabChange('doctors')}
              className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`}
            >
              <FaUserMd className="nav-icon" />
              <span>Doctor Management</span>
            </button>
            
            <button
              onClick={() => handleTabChange('appointments')}
              className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`}
            >
              <FaCalendarCheck className="nav-icon" />
              <span>Appointments</span>
            </button>
            
            <button
              onClick={() => handleTabChange('analytics')}
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            >
              <FaChartLine className="nav-icon" />
              <span>Analytics</span>
            </button>
            
            <button
              onClick={() => handleTabChange('system')}
              className={`nav-item ${activeTab === 'system' ? 'active' : ''}`}
            >
              <FaCog className="nav-icon" />
              <span>System Settings</span>
            </button>
            
            <button
              onClick={() => handleTabChange('messages')}
              className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            >
              <FaComments className="nav-icon" />
              <span>Messages</span>
            </button>
            
            <button
              onClick={() => handleTabChange('help')}
              className={`nav-item ${activeTab === 'help' ? 'active' : ''}`}
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
                Admin Dashboard
              </h1>
            </div>
            
            <div className="header-right">
              {/* Search Bar */}
              <div className="header-search">
                <FaSearch className="search-icon-header" />
                <input
                  type="text"
                  placeholder="Search users, doctors, appointments..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-input-header"
                />
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="dashboard-content">
            {activeTab === 'overview' && (
              <div className="overview-section">
                {/* Stats Cards */}
                <div className="summary-cards-row">
                  <div className="stat-card">
                    <div className="card-icon" style={{ backgroundColor: '#dbeafe' }}>
                      <FaUsers style={{ color: '#2563eb' }} />
                    </div>
                    <div className="card-content">
                      <div className="card-title">Total Users</div>
                      <div className="card-value">{stats.totalUsers}</div>
                      <div className="card-subtitle">Active patients in system</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="card-icon" style={{ backgroundColor: '#d1fae5' }}>
                      <FaUserMd style={{ color: '#059669' }} />
                    </div>
                    <div className="card-content">
                      <div className="card-title">Total Doctors</div>
                      <div className="card-value">{doctors.length}</div>
                      <div className="card-subtitle">Medical professionals</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="card-icon" style={{ backgroundColor: '#fce7f3' }}>
                      <FaCalendarCheck style={{ color: '#db2777' }} />
                    </div>
                    <div className="card-content">
                      <div className="card-title">Appointments</div>
                      <div className="card-value">{appointments.length}</div>
                      <div className="card-subtitle">Total bookings</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="card-icon" style={{ backgroundColor: '#fef3c7' }}>
                      <FaMoneyBillWave style={{ color: '#f59e0b' }} />
                    </div>
                    <div className="card-content">
                      <div className="card-title">Revenue</div>
                      <div className="card-value">₹{stats.totalRevenue.toLocaleString()}</div>
                      <div className="card-subtitle">Total earnings</div>
                    </div>
                  </div>
                </div>

                {/* System Overview */}
                <div className="content-grid">
                  <div className="content-card">
                    <div className="card-header">
                      <h3 className="card-heading">System Health</h3>
                      <span className="status-badge status-success">
                        <FaCheckCircle /> {stats.systemHealth}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="info-item">
                        <FaDatabase className="info-icon" />
                        <div>
                          <div className="info-label">Database Status</div>
                          <div className="info-value">Connected & Optimized</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <FaServer className="info-icon" />
                        <div>
                          <div className="info-label">Server Load</div>
                          <div className="info-value">Normal (45%)</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <FaNetworkWired className="info-icon" />
                        <div>
                          <div className="info-label">API Response Time</div>
                          <div className="info-value">125ms</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="content-card">
                    <div className="card-header">
                      <h3 className="card-heading">Quick Stats</h3>
                    </div>
                    <div className="card-body">
                      <div className="info-item">
                        <FaClock className="info-icon" />
                        <div>
                          <div className="info-label">Pending Appointments</div>
                          <div className="info-value">{stats.pendingAppointments}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <FaCheckCircle className="info-icon" />
                        <div>
                          <div className="info-label">Active Users (Today)</div>
                          <div className="info-value">{stats.activeUsers}</div>
                        </div>
                      </div>
                      <div className="info-item">
                        <FaExclamationTriangle className="info-icon" />
                        <div>
                          <div className="info-label">System Alerts</div>
                          <div className="info-value">0</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appointments' && (
              <div className="appointments-section">
                <div className="section-header">
                  <h2 className="section-title">All Appointments</h2>
                  <div className="header-actions">
                    <select
                      value={filterStatus}
                      onChange={(e) => handleFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="booked">Booked</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="content-card">
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Doctor</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr>
                            <td colSpan="5" className="text-center">
                              Loading appointments...
                            </td>
                          </tr>
                        ) : filteredAppointments.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center">
                              No appointments found
                            </td>
                          </tr>
                        ) : (
                          filteredAppointments.map((appointment) => (
                            <tr key={appointment._id}>
                              <td>
                                <div className="table-user-info">
                                  <div className="user-name">{appointment.patientName}</div>
                                  <div className="user-email">{appointment.patientEmail}</div>
                                </div>
                              </td>
                              <td>
                                <div className="table-user-info">
                                  <div className="user-name">{appointment.doctorName}</div>
                                  <div className="user-email">{appointment.doctorSpecialization}</div>
                                </div>
                              </td>
                              <td>
                                <div className="table-user-info">
                                  <div className="user-name">{appointment.appointmentDate}</div>
                                  <div className="user-email">{appointment.appointmentTime}</div>
                                </div>
                              </td>
                              <td>
                                <span className={`status-badge status-${appointment.status}`}>
                                  {appointment.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  onClick={() => openModal('view-appointment', appointment)}
                                  className="action-btn action-btn-view"
                                >
                                  <FaEye /> View
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'doctors' && (
              <div className="doctors-section">
                <div className="section-header">
                  <h2 className="section-title">Doctor Management</h2>
                  <button
                    onClick={() => openModal('create-doctor')}
                    className="btn-primary"
                  >
                    <FaPlus className="btn-icon" /> Add New Doctor
                  </button>
                </div>

                {filteredDoctors.length === 0 ? (
                  <div className="content-card text-center">
                    <p className="text-gray-500">No doctors found</p>
                  </div>
                ) : (
                  <div className="doctors-grid">
                    {Object.entries(
                      filteredDoctors.reduce((groups, doctor) => {
                        const specialization = doctor.specialization || 'General';
                        if (!groups[specialization]) {
                          groups[specialization] = [];
                        }
                        groups[specialization].push(doctor);
                        return groups;
                      }, {})
                    ).map(([specialization, doctorsInGroup]) => (
                      <div key={specialization} className="content-card">
                        <div className="card-header">
                          <h3 className="card-heading">{specialization}</h3>
                          <span className="badge">{doctorsInGroup.length} doctor{doctorsInGroup.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="table-container">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Doctor</th>
                                <th>Contact</th>
                                <th>Experience</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {doctorsInGroup.map((doctor) => (
                                <tr key={doctor._id}>
                                  <td>
                                    <div className="table-user-info">
                                      <img className="user-avatar" src={doctor.image} alt={doctor.name} />
                                      <div>
                                        <div className="user-name">{doctor.name}</div>
                                        <div className="user-email">{doctor.degree}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="table-user-info">
                                      <div className="user-name">{doctor.email}</div>
                                      <div className="user-email">{doctor.phone}</div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="table-user-info">
                                      <div className="user-name">{doctor.experience} years</div>
                                      <div className="user-email">${doctor.fees}</div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className={`status-badge ${doctor.available ? 'status-success' : 'status-danger'}`}>
                                      {doctor.available ? 'Available' : 'Unavailable'}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="action-buttons">
                                      <button 
                                        onClick={() => openEditModal(doctor)}
                                        className="action-btn action-btn-edit"
                                      >
                                        <FaEdit /> Edit
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteDoctor(doctor._id)}
                                        className="action-btn action-btn-delete"
                                      >
                                        <FaTrash /> Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(activeTab === 'users' || activeTab === 'analytics' || activeTab === 'system' || activeTab === 'messages' || activeTab === 'help') && (
              <div className="content-card text-center" style={{ padding: '3rem' }}>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h2>
                <p className="text-gray-500">This feature is coming soon...</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <Footer />
        </main>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            {modalType === 'create-doctor' && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">Add New Doctor</h3>
                  <button onClick={closeModal} className="modal-close-btn">
                    <FaBan />
                  </button>
                </div>
                
                <form onSubmit={handleCreateDoctor} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={doctorForm.name}
                        onChange={handleDoctorFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={doctorForm.email}
                        onChange={handleDoctorFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password *</label>
                      <input
                        type="password"
                        name="password"
                        value={doctorForm.password}
                        onChange={handleDoctorFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Specialization *</label>
                      <input
                        type="text"
                        name="specialization"
                        value={doctorForm.specialization}
                        onChange={handleDoctorFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Degree *</label>
                      <input
                        type="text"
                        name="degree"
                        value={doctorForm.degree}
                        onChange={handleDoctorFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Experience (years) *</label>
                      <input
                        type="text"
                        name="experience"
                        value={doctorForm.experience}
                        onChange={handleDoctorFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Consultation Fee ($) *</label>
                      <input
                        type="number"
                        name="fees"
                        value={doctorForm.fees}
                        onChange={handleDoctorFormChange}
                        required
                        min="0"
                        step="0.01"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={doctorForm.phone}
                        onChange={handleDoctorFormChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Address *</label>
                    <textarea
                      name="address"
                      value={doctorForm.address}
                      onChange={handleDoctorFormChange}
                      required
                      rows="3"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Education</label>
                    <textarea
                      name="education"
                      value={doctorForm.education}
                      onChange={handleDoctorFormChange}
                      rows="2"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Image URL *</label>
                    <input
                      type="url"
                      name="image"
                      value={doctorForm.image}
                      onChange={handleDoctorFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Availability</label>
                    <input
                      type="text"
                      name="availability"
                      value={doctorForm.availability}
                      onChange={handleDoctorFormChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? 'Creating...' : 'Create Doctor'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalType === 'edit-doctor' && selectedItem && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">Edit Doctor</h3>
                  <button onClick={closeModal} className="modal-close-btn">
                    <FaBan />
                  </button>
                </div>
                
                <form onSubmit={handleEditDoctor} className="modal-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={doctorForm.name}
                        onChange={handleDoctorFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={doctorForm.email}
                        onChange={handleDoctorFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password (leave empty to keep current)</label>
                      <input
                        type="password"
                        name="password"
                        value={doctorForm.password}
                        onChange={handleDoctorFormChange}
                        placeholder="Enter new password"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Specialization *</label>
                      <input
                        type="text"
                        name="specialization"
                        value={doctorForm.specialization}
                        onChange={handleDoctorFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Degree *</label>
                      <input
                        type="text"
                        name="degree"
                        value={doctorForm.degree}
                        onChange={handleDoctorFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Experience (years) *</label>
                      <input
                        type="text"
                        name="experience"
                        value={doctorForm.experience}
                        onChange={handleDoctorFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Consultation Fee ($) *</label>
                      <input
                        type="number"
                        name="fees"
                        value={doctorForm.fees}
                        onChange={handleDoctorFormChange}
                        required
                        min="0"
                        step="0.01"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={doctorForm.phone}
                        onChange={handleDoctorFormChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Address *</label>
                    <textarea
                      name="address"
                      value={doctorForm.address}
                      onChange={handleDoctorFormChange}
                      required
                      rows="3"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Education</label>
                    <textarea
                      name="education"
                      value={doctorForm.education}
                      onChange={handleDoctorFormChange}
                      rows="2"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Image URL *</label>
                    <input
                      type="url"
                      name="image"
                      value={doctorForm.image}
                      onChange={handleDoctorFormChange}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Availability</label>
                    <input
                      type="text"
                      name="availability"
                      value={doctorForm.availability}
                      onChange={handleDoctorFormChange}
                      className="form-input"
                    />
                  </div>
                  
                  <div className="modal-footer">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      {isLoading ? 'Updating...' : 'Update Doctor'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalType === 'view-appointment' && selectedItem && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">Appointment Details</h3>
                  <button onClick={closeModal} className="modal-close-btn">
                    <FaBan />
                  </button>
                </div>
                
                <div className="modal-body">
                  <div className="detail-grid">
                    <div className="detail-section">
                      <h4 className="detail-section-title">Patient Information</h4>
                      <div className="detail-item">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{selectedItem.patientName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{selectedItem.patientEmail}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone:</span>
                        <span className="detail-value">{selectedItem.patientPhone}</span>
                      </div>
                      {selectedItem.patientAge && (
                        <div className="detail-item">
                          <span className="detail-label">Age:</span>
                          <span className="detail-value">{selectedItem.patientAge}</span>
                        </div>
                      )}
                      {selectedItem.patientGender && (
                        <div className="detail-item">
                          <span className="detail-label">Gender:</span>
                          <span className="detail-value">{selectedItem.patientGender}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="detail-section">
                      <h4 className="detail-section-title">Doctor Information</h4>
                      <div className="detail-item">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{selectedItem.doctorName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">{selectedItem.doctorEmail}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Specialization:</span>
                        <span className="detail-value">{selectedItem.doctorSpecialization}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="detail-grid">
                    <div className="detail-section">
                      <h4 className="detail-section-title">Appointment Details</h4>
                      <div className="detail-item">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{selectedItem.appointmentDate}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Time:</span>
                        <span className="detail-value">{selectedItem.appointmentTime}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className={`status-badge status-${selectedItem.status}`}>
                          {selectedItem.status}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Fee:</span>
                        <span className="detail-value">${selectedItem.consultationFee}</span>
                      </div>
                    </div>
                    
                    <div className="detail-section">
                      <h4 className="detail-section-title">Additional Information</h4>
                      {selectedItem.symptoms && (
                        <div className="detail-item">
                          <span className="detail-label">Symptoms:</span>
                          <span className="detail-value">{selectedItem.symptoms}</span>
                        </div>
                      )}
                      {selectedItem.additionalNotes && (
                        <div className="detail-item">
                          <span className="detail-label">Notes:</span>
                          <span className="detail-value">{selectedItem.additionalNotes}</span>
                        </div>
                      )}
                      {selectedItem.emergencyContact && (
                        <div className="detail-item">
                          <span className="detail-label">Emergency Contact:</span>
                          <span className="detail-value">{selectedItem.emergencyContact}</span>
                        </div>
                      )}
                      {selectedItem.insuranceProvider && (
                        <div className="detail-item">
                          <span className="detail-label">Insurance:</span>
                          <span className="detail-value">{selectedItem.insuranceProvider}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedItem.medicalReports && selectedItem.medicalReports.length > 0 && (
                    <div className="detail-section">
                      <h4 className="detail-section-title">Medical Reports</h4>
                      <div className="reports-list">
                        {selectedItem.medicalReports.map((report, index) => (
                          <div key={index} className="report-item">
                            <span>{report.filename}</span>
                            <a href={report.path} target="_blank" rel="noopener noreferrer" className="report-download">
                              <FaDownload />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="modal-footer">
                  <button
                    onClick={closeModal}
                    className="btn-primary"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;
