import React, { useState, useEffect } from 'react';
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
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="admin-dashboard">
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
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Admin Dashboard</h2>
          <p className="text-gray-500">Full dashboard functionality coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
