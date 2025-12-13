import React, { useState, useEffect } from 'react'
import healthLogo from '../../assets/healthlogo.avif'
import { useNavigate, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/clerk-react';
import { syncUserWithBackend, getDashboardPath } from '../../services/roleService';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [userRole, setUserRole] = useState(null);
  const { user } = useUser();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get user role when logged in
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const userData = await syncUserWithBackend(user);
          setUserRole(userData.role);
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
    };

    fetchUserRole();
  }, [user]);

  const navItems = ['home', 'services', 'doctors', 'contact'];
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname === '/' ? 'home' : location.pathname.replace('/', '');
    if (navItems.includes(currentPath)) {
      setActiveItem(currentPath);
    } else if (currentPath === 'dashboard') {
      setActiveItem('dashboard');
    }
  }, [location.pathname]);

  // Handle dashboard navigation based on role
  const handleDashboardClick = () => {
    if (userRole) {
      const dashboardPath = getDashboardPath(userRole);
      navigate(dashboardPath);
      setActiveItem('dashboard');
    }
  };

  // Get dashboard label based on role
  const getDashboardLabel = () => {
    if (!userRole) return 'Dashboard';
    return userRole === 'admin' ? 'Admin Panel' : 
           userRole === 'doctor' ? 'Doctor Portal' : 
           'My Dashboard';
  };

  const handleNavClick = (item) => {
    setActiveItem(item);
    navigate(item === 'home' ? '/' : `/${item}`);
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-lg' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo with hover effect */}
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/') }>
            <img 
              src={healthLogo} 
              alt="Health Care Logo" 
              className="h-16 w-16 object-contain transform group-hover:scale-105 transition-transform duration-300"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Medicare
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <div key={item} className="relative">
                <button
                  onClick={() => handleNavClick(item)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide transition-all duration-300 ${
                    activeItem === item
                      ? 'text-white bg-blue-600 shadow-lg'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {item}
                </button>
              </div>
            ))}

            <SignedIn>
              {userRole && (
                <button
                  onClick={handleDashboardClick}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-transform hover:-translate-y-0.5"
                >
                  {getDashboardLabel()}
                </button>
              )}
            </SignedIn>
          </div>

          {/* Login Button / User Button */}
          <div className="hidden lg:block">
            <SignedOut>
              <button 
                onClick={() => navigate('/login')} 
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-base font-medium
                  hover:bg-blue-700 transform hover:scale-105 transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
              >
                Login 
              </button>
            </SignedOut>
            <SignedIn>
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-full border-2 border-blue-500 hover:border-blue-600 transition-all duration-300 shadow-md"
                  }
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile toggle */}
          <div className="lg:hidden ml-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-blue-900 hover:bg-blue-50 focus:outline-none"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`h-6 w-6 transform transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed right-4 top-[5.5rem] z-40 transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="w-72 sm:w-70 bg-white-100 px-6 pb-6 pt-3 space-y-3 shadow-2xl rounded-3xl border border-blue-100">
          {navItems.map((item) => (
            <div key={item}>
              <button
                onClick={() => {
                  navigate(item === 'home' ? '/' : `/${item}`);
                  closeMobileMenu();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wide transition-colors ${
                  activeItem === item
                    ? 'text-white bg-blue-900 shadow-lg'
                    : 'text-gray-900 bg-blue-50/80 hover:bg-blue-50'
                }`}
              >
                {item}
              </button>
            </div>
          ))}

          <SignedIn>
            {userRole && (
              <button
                onClick={() => {
                  handleDashboardClick();
                  closeMobileMenu();
                }}
                className="w-full px-4 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
              >
                {getDashboardLabel()}
              </button>
            )}
          </SignedIn>

          <SignedOut>
            <button
              onClick={() => {
                navigate('/login');
                closeMobileMenu();
              }}
              className="w-full px-4 py-3 rounded-2xl text-sm font-semibold bg-blue-900 text-white"
            >
              Login
            </button>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-blue-50">
              <span className="text-gray-700 font-medium">Account</span>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10 rounded-full border-2 border-blue-900'
                  }
                }}
              />
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  )
}

export default Navbar