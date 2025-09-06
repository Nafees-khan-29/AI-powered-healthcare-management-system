import React, { useState, useEffect } from 'react';
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
  FaExclamationTriangle,
  FaTimes,
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';
import './UserDashboard.css';

const UserDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock data for demonstration
  const [appointments, setAppointments] = useState([
    { 
      id: 1, 
      doctor: 'Dr. Sarah Johnson', 
      specialty: 'Cardiology', 
      date: '2024-08-18', 
      time: '10:00 AM', 
      status: 'confirmed', 
      type: 'consultation',
      location: 'City Hospital, Room 205',
      notes: 'Follow-up appointment for heart condition'
    },
    { 
      id: 2, 
      doctor: 'Dr. Robert Chen', 
      specialty: 'Neurology', 
      date: '2024-08-25', 
      time: '02:30 PM', 
      status: 'pending', 
      type: 'follow-up',
      location: 'Downtown Medical Center, Room 112',
      notes: 'Neurological examination'
    },
    { 
      id: 3, 
      doctor: 'Dr. Maria Garcia', 
      specialty: 'Pediatrics', 
      date: '2024-08-20', 
      time: '09:00 AM', 
      status: 'cancelled', 
      type: 'consultation',
      location: 'City Hospital, Room 301',
      notes: 'Annual checkup'
    }
  ]);

  const [medicalRecords, setMedicalRecords] = useState([
    { 
      id: 1, 
      type: 'Blood Test', 
      date: '2024-07-15', 
      doctor: 'Dr. Sarah Johnson', 
      status: 'completed', 
      results: 'Normal',
      file: 'blood_test_july_2024.pdf'
    },
    { 
      id: 2, 
      type: 'X-Ray', 
      date: '2024-06-20', 
      doctor: 'Dr. Robert Chen', 
      status: 'completed', 
      results: 'Clear',
      file: 'chest_xray_june_2024.pdf'
    },
    { 
      id: 3, 
      type: 'ECG', 
      date: '2024-08-10', 
      doctor: 'Dr. Sarah Johnson', 
      status: 'pending', 
      results: 'Awaiting results',
      file: null
    }
  ]);

  const [prescriptions, setPrescriptions] = useState([
    { 
      id: 1, 
      medication: 'Aspirin 100mg', 
      dosage: '1 tablet daily', 
      duration: '30 days', 
      prescribedBy: 'Dr. Sarah Johnson', 
      date: '2024-08-01', 
      status: 'active',
      refills: 2
    },
    { 
      id: 2, 
      medication: 'Metformin 500mg', 
      dosage: '1 tablet twice daily', 
      duration: '90 days', 
      prescribedBy: 'Dr. Robert Chen', 
      date: '2024-07-15', 
      status: 'active',
      refills: 1
    }
  ]);

  const [healthMetrics, setHealthMetrics] = useState({
    bloodPressure: '120/80',
    heartRate: '72 bpm',
    temperature: '98.6°F',
    weight: '70 kg',
    height: '175 cm',
    bmi: '22.9'
  });

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

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'Patient'}!</h2>
        <p className="text-blue-100">Here's your health summary for today</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Upcoming</p>
              <p className="text-3xl font-bold">
                {appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'pending').length}
              </p>
            </div>
            <FaCalendarAlt className="text-4xl text-blue-200" />
          </div>
        </div>
        
        <div className="stat-card success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Rx</p>
              <p className="text-3xl font-bold">
                {prescriptions.filter(rx => rx.status === 'active').length}
              </p>
            </div>
            <FaPills className="text-4xl text-green-200" />
          </div>
        </div>
        
        <div className="stat-card warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Records</p>
              <p className="text-3xl font-bold">{medicalRecords.length}</p>
            </div>
            <FaFileMedical className="text-4xl text-orange-200" />
          </div>
        </div>
        
        <div className="stat-card info">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100">BMI</p>
              <p className="text-3xl font-bold">{healthMetrics.bmi}</p>
            </div>
            <FaHeartbeat className="text-4xl text-cyan-200" />
          </div>
        </div>
      </div>

      {/* Next Appointment */}
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold mb-4">Next Appointment</h3>
        {appointments.find(apt => apt.status === 'confirmed') ? (
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">
                  {appointments.find(apt => apt.status === 'confirmed')?.doctor}
                </h4>
                <p className="text-blue-700">
                  {appointments.find(apt => apt.status === 'confirmed')?.specialty}
                </p>
                <p className="text-blue-600 text-sm">
                  {appointments.find(apt => apt.status === 'confirmed')?.date} at{' '}
                  {appointments.find(apt => apt.status === 'confirmed')?.time}
                </p>
                <p className="text-blue-600 text-sm">
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
            <button className="btn-primary mt-4">
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
                record.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <p className="font-medium">{record.type}</p>
                <p className="text-sm text-gray-600">
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
          onClick={() => openModal('bookAppointment')}
          className="btn-primary flex items-center gap-2"
        >
          <FaPlus />
          Book Appointment
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div key={appointment.id} className="dashboard-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600 text-xl" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{appointment.doctor}</h4>
                    <p className="text-gray-600">{appointment.specialty}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                      <p className="text-gray-600 mt-2 text-sm">{appointment.notes}</p>
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
                    onClick={() => openModal('viewAppointment', appointment)}
                    className="action-btn view"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  
                  {appointment.status === 'confirmed' && (
                    <>
                      <button 
                        onClick={() => handleAppointmentAction('reschedule', appointment)}
                        className="action-btn edit"
                        title="Reschedule"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleAppointmentAction('cancel', appointment)}
                        className="action-btn delete"
                        title="Cancel"
                      >
                        <FaTimes />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
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
        {medicalRecords.map((record) => (
          <div key={record.id} className="dashboard-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaFileMedical className="text-green-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{record.type}</h4>
                  <p className="text-gray-600">Dr. {record.doctor}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
        ))}
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
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="dashboard-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <FaPills className="text-purple-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{prescription.medication}</h4>
                  <p className="text-gray-600">Dr. {prescription.prescribedBy}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Dosage: {prescription.dosage}</span>
                    <span>Duration: {prescription.duration}</span>
                    <span>Refills: {prescription.refills}</span>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">Prescribed on {prescription.date}</p>
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
        ))}
      </div>
    </div>
  );

  const renderHealthTracking = () => (
    <div className="space-y-6">
      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FaHeartbeat className="text-red-500" />
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
            <FaUser className="text-blue-500" />
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
            <FaBell className="text-yellow-500" />
            Reminders
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FaCheckCircle className="text-green-500" />
              <span>Take morning medication</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaClock className="text-blue-500" />
              <span>Blood pressure check</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FaExclamationTriangle className="text-orange-500" />
              <span>Schedule follow-up</span>
            </div>
          </div>
        </div>
      </div>

      {/* Health Trends Chart Placeholder */}
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold mb-4">Health Trends</h3>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FaHeartbeat className="text-4xl mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">Health trends chart will be displayed here</p>
          <p className="text-sm text-gray-400">Track your progress over time</p>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showModal) return null;

    const renderModalContent = () => {
      switch (modalType) {
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
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {renderModalContent()}
        </div>
      </div>
    );
  };

  return (
    <div className="user-dashboard">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
        <p className="text-gray-600">Manage your health and appointments</p>
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
        {activeTab === 'medical-records' && renderMedicalRecords()}
        {activeTab === 'prescriptions' && renderPrescriptions()}
        {activeTab === 'health-tracking' && renderHealthTracking()}
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default UserDashboard;
