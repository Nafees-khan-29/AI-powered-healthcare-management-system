import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUser, 
  FaUserMd, 
  FaUserShield, 
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaCog,
  FaHome
} from 'react-icons/fa';
import UserDashboard from '../components/Dashboard/UserDashboard';
import DoctorDashboard from '../components/Dashboard/DoctorDashboard';
import AdminDashboard from '../components/Dashboard/AdminDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const [userRole, setUserRole] = useState('user'); // 'user', 'doctor', 'admin'
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Mock user data - in real app this would come from authentication context
  useEffect(() => {
    // Simulate user data loading
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'user',
      avatar: null
    };
    setUser(mockUser);
  }, []);

  // Mock notifications
  useEffect(() => {
    const mockNotifications = [
      { id: 1, message: 'Your appointment is confirmed for tomorrow', type: 'info', read: false },
      { id: 2, message: 'New medical record uploaded', type: 'success', read: false },
      { id: 3, message: 'Prescription refill reminder', type: 'warning', read: true }
    ];
    setNotifications(mockNotifications);
  }, []);

  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
  };

  const handleLogout = () => {
    // In real app, this would clear authentication tokens
    navigate('/');
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const renderDashboard = () => {
    switch (userRole) {
      case 'user':
        return <UserDashboard user={user} />;
      case 'doctor':
        return <DoctorDashboard user={user} />;
      case 'admin':
        return <AdminDashboard user={user} />;
      default:
        return <UserDashboard user={user} />;
    }
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(notif => !notif.read).length;
  };

  return (
    <div className="dashboard-container">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-blue-600">HealthCare</h1>
              </div>
              
              {/* Role Switcher */}
              <div className="ml-8 flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleRoleChange('user')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    userRole === 'user'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaUser className="inline mr-1" />
                  Patient
                </button>
                <button
                  onClick={() => handleRoleChange('doctor')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    userRole === 'doctor'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaUserMd className="inline mr-1" />
                  Doctor
                </button>
                <button
                  onClick={() => handleRoleChange('admin')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    userRole === 'admin'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FaUserShield className="inline mr-1" />
                  Admin
                </button>
              </div>
            </div>

            {/* Right side - Search, Notifications, Profile */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                >
                  <FaBell className="h-5 w-5" />
                  {getUnreadNotificationsCount() > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      </div>
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.type === 'success' ? 'bg-green-400' :
                                  notification.type === 'warning' ? 'bg-yellow-400' :
                                  'bg-blue-400'
                                }`} />
                              </div>
                              <div className="ml-3 flex-1">
                                <p className="text-sm text-gray-900">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {!notification.read && <span className="text-blue-600 font-medium">New</span>}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="text-gray-700">{user?.name || 'User'}</span>
                </button>

                {/* Profile Dropdown */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FaUser className="inline mr-2" />
                        Profile
                      </button>
                      <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <FaCog className="inline mr-2" />
                        Settings
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaSignOutAlt className="inline mr-2" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Dashboard Content */}
      <main className="flex-1">
        {renderDashboard()}
      </main>

      {/* Click outside handlers for dropdowns */}
      {(showNotifications || showProfileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;