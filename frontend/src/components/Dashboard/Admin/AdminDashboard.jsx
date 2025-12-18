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
  FaNetworkWired
} from 'react-icons/fa';
import { getAllAppointments } from '../../../services/appointmentService';
import { getAllDoctors, addDoctor, updateDoctor, deleteDoctor } from '../../../services/doctorService';
import { getCriticalAlerts, acknowledgeAlert, respondToAlert, resolveAlert } from '../../../services/emergencyAlertService';
import './AdminDashboard.css';

const AdminDashboard = () => {
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
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'users', label: 'User Management', icon: FaUsers },
    { id: 'doctors', label: 'Doctor Management', icon: FaUserMd },
    { id: 'appointments', label: 'Appointments', icon: FaCalendarCheck },
    { id: 'analytics', label: 'Analytics', icon: FaChartLine },
    { id: 'system', label: 'System', icon: FaCog }
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
      {/* Navbar - positioned outside dashboard container */}
      <Navbar />
      
      <div className="admin-dashboard">
        {/* Add top padding to account for fixed navbar */}
        <div className="pt-20">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your healthcare application system</p>
        </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users, doctors, appointments..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <FaUsers className="text-blue-500 text-2xl mr-3" />
                <div>
                  <p className="text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <FaUserMd className="text-green-500 text-2xl mr-3" />
                <div>
                  <p className="text-gray-600">Total Doctors</p>
                  <p className="text-2xl font-bold">{doctors.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <FaCalendarCheck className="text-purple-500 text-2xl mr-3" />
                <div>
                  <p className="text-gray-600">Total Appointments</p>
                  <p className="text-2xl font-bold">{appointments.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <FaMoneyBillWave className="text-yellow-500 text-2xl mr-3" />
                <div>
                  <p className="text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Appointments</h2>
              <div className="flex space-x-4">
                <select
                  value={filterStatus}
                  onChange={(e) => handleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="booked">Booked</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          Loading appointments...
                        </td>
                      </tr>
                    ) : filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          No appointments found
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <tr key={appointment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{appointment.patientName}</div>
                              <div className="text-sm text-gray-500">{appointment.patientEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.doctorName}</div>
                            <div className="text-sm text-gray-500">{appointment.doctorSpecialization}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.appointmentDate}</div>
                            <div className="text-sm text-gray-500">{appointment.appointmentTime}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              appointment.status === 'booked' ? 'bg-green-100 text-green-800' :
                              appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => openModal('view-appointment', appointment)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <FaEye className="inline mr-1" /> View
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
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
              <button
                onClick={() => openModal('create-doctor')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <FaPlus className="mr-2" /> Add New Doctor
              </button>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">No doctors found</p>
              </div>
            ) : (
              <div className="space-y-6">
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
                  <div key={specialization} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b">
                      <h3 className="text-lg font-semibold text-gray-900">{specialization}</h3>
                      <p className="text-sm text-gray-600">{doctorsInGroup.length} doctor{doctorsInGroup.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {doctorsInGroup.map((doctor) => (
                            <tr key={doctor._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img className="h-10 w-10 rounded-full mr-3" src={doctor.image} alt={doctor.name} />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                                    <div className="text-sm text-gray-500">{doctor.degree}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{doctor.email}</div>
                                <div className="text-sm text-gray-500">{doctor.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{doctor.experience} years</div>
                                <div className="text-sm text-gray-500">${doctor.fees}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  doctor.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {doctor.available ? 'Available' : 'Unavailable'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button 
                                  onClick={() => openEditModal(doctor)}
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  <FaEdit className="inline mr-1" /> Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteDoctor(doctor._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FaTrash className="inline mr-1" /> Delete
                                </button>
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

        {(activeTab === 'users' || activeTab === 'analytics' || activeTab === 'system') && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">{tabs.find(tab => tab.id === activeTab)?.label}</h2>
            <p className="text-gray-500">This feature is coming soon...</p>
          </div>
        )}
      </div>
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {modalType === 'create-doctor' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Add New Doctor</h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <FaBan />
                  </button>
                </div>
                
                <form onSubmit={handleCreateDoctor} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={doctorForm.name}
                        onChange={handleDoctorFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={doctorForm.email}
                        onChange={handleDoctorFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type="password"
                        name="password"
                        value={doctorForm.password}
                        onChange={handleDoctorFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                      <input
                        type="text"
                        name="specialization"
                        value={doctorForm.specialization}
                        onChange={handleDoctorFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                      <input
                        type="text"
                        name="degree"
                        value={doctorForm.degree}
                        onChange={handleDoctorFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years) *</label>
                      <input
                        type="text"
                        name="experience"
                        value={doctorForm.experience}
                        onChange={handleDoctorFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($) *</label>
                      <input
                        type="number"
                        name="fees"
                        value={doctorForm.fees}
                        onChange={handleDoctorFormChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={doctorForm.phone}
                        onChange={handleDoctorFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                      name="address"
                      value={doctorForm.address}
                      onChange={handleDoctorFormChange}
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                    <textarea
                      name="education"
                      value={doctorForm.education}
                      onChange={handleDoctorFormChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                    <input
                      type="url"
                      name="image"
                      value={doctorForm.image}
                      onChange={handleDoctorFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <input
                      type="text"
                      name="availability"
                      value={doctorForm.availability}
                      onChange={handleDoctorFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Creating...' : 'Create Doctor'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalType === 'edit-doctor' && selectedItem && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Edit Doctor</h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <FaBan />
                  </button>
                </div>
                
                <form onSubmit={handleEditDoctor} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={doctorForm.name}
                        onChange={handleDoctorFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={doctorForm.email}
                        onChange={handleDoctorFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave empty to keep current)</label>
                      <input
                        type="password"
                        name="password"
                        value={doctorForm.password}
                        onChange={handleDoctorFormChange}
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                      <input
                        type="text"
                        name="specialization"
                        value={doctorForm.specialization}
                        onChange={handleDoctorFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                      <input
                        type="text"
                        name="degree"
                        value={doctorForm.degree}
                        onChange={handleDoctorFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years) *</label>
                      <input
                        type="text"
                        name="experience"
                        value={doctorForm.experience}
                        onChange={handleDoctorFormChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee ($) *</label>
                      <input
                        type="number"
                        name="fees"
                        value={doctorForm.fees}
                        onChange={handleDoctorFormChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={doctorForm.phone}
                        onChange={handleDoctorFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                      name="address"
                      value={doctorForm.address}
                      onChange={handleDoctorFormChange}
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                    <textarea
                      name="education"
                      value={doctorForm.education}
                      onChange={handleDoctorFormChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                    <input
                      type="url"
                      name="image"
                      value={doctorForm.image}
                      onChange={handleDoctorFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                    <input
                      type="text"
                      name="availability"
                      value={doctorForm.availability}
                      onChange={handleDoctorFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Updating...' : 'Update Doctor'}
                    </button>
                  </div>
                </form>
              </>
            )}

            {modalType === 'view-appointment' && selectedItem && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Appointment Details</h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                    <FaBan />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Patient Information</h4>
                      <p><strong>Name:</strong> {selectedItem.patientName}</p>
                      <p><strong>Email:</strong> {selectedItem.patientEmail}</p>
                      <p><strong>Phone:</strong> {selectedItem.patientPhone}</p>
                      {selectedItem.patientAge && <p><strong>Age:</strong> {selectedItem.patientAge}</p>}
                      {selectedItem.patientGender && <p><strong>Gender:</strong> {selectedItem.patientGender}</p>}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Doctor Information</h4>
                      <p><strong>Name:</strong> {selectedItem.doctorName}</p>
                      <p><strong>Email:</strong> {selectedItem.doctorEmail}</p>
                      <p><strong>Specialization:</strong> {selectedItem.doctorSpecialization}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Appointment Details</h4>
                      <p><strong>Date:</strong> {selectedItem.appointmentDate}</p>
                      <p><strong>Time:</strong> {selectedItem.appointmentTime}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedItem.status === 'booked' ? 'bg-green-100 text-green-800' :
                          selectedItem.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          selectedItem.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          selectedItem.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedItem.status}
                        </span>
                      </p>
                      <p><strong>Fee:</strong> ${selectedItem.consultationFee}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                      {selectedItem.symptoms && <p><strong>Symptoms:</strong> {selectedItem.symptoms}</p>}
                      {selectedItem.additionalNotes && <p><strong>Notes:</strong> {selectedItem.additionalNotes}</p>}
                      {selectedItem.emergencyContact && <p><strong>Emergency Contact:</strong> {selectedItem.emergencyContact}</p>}
                      {selectedItem.insuranceProvider && <p><strong>Insurance:</strong> {selectedItem.insuranceProvider}</p>}
                    </div>
                  </div>
                  
                  {selectedItem.medicalReports && selectedItem.medicalReports.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Medical Reports</h4>
                      <div className="space-y-2">
                        {selectedItem.medicalReports.map((report, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span>{report.filename}</span>
                            <a href={report.path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                              <FaDownload />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-4">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  </>
);
}
export default AdminDashboard;
