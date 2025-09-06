import React, { useState, useEffect } from 'react'
import healthLogo from '../../assets/healthlogo.avif'
import { Navigate, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const serviceItems = [
    'General Checkup',
    'madical Care',
    'Physical Services',
    'Laboratory Services'
  ];
  const navigate =useNavigate();

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-lg' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-20 items-center">
          {/* Logo with hover effect */}
          <div className="flex-shrink-0 flex items-center gap-2 group">
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
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-6">
              {/* Menu items with active state */}
              {['home', 'services', 'doctors', 'contact'].map((item) => (
                <div key={item} className="relative">
                  <button 
                    onClick={() => {
                      setActiveItem(item);
                if (item === 'services') {
                  setIsServicesOpen(!isServicesOpen);
                } else {
                   navigate(item === 'home' ? '/' : `/${item}`);// 👈 this handles navigation
                }
                    }}
                    className={`px-4 py-2 rounded-md text-base font-medium uppercase transition-all duration-300
                      ${activeItem === item 
                        ? 'text-white bg-blue-600' 
                        : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                      }`}
                  >
                    {item}
                    {item === 'services' && (
                      <span className="ml-1 inline-block transform transition-transform duration-200">
                        ▼
                      </span>
                    )}
                  </button>

                  {/* Services Dropdown */}
                  {item === 'services' && isServicesOpen && (
                    <div className="absolute left-0 mt-2 w-56 rounded-md shadow-xl 
                      bg-white border border-gray-100">
                      <div className="py-2">
                        {serviceItems.map((service) => (
                          <button onClick={() => navigate('/Services')}
                            key={service}
                            className="block w-full text-left px-4 py-3 text-gray-700 font-medium
                              hover:bg-gray-50 hover:text-blue-600 transition-all duration-300"
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Login Button */}
          <div   className="hidden md:block">
            <button onClick={()=>navigate('/login')} className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-base font-medium
              hover:bg-blue-700 transform hover:scale-105 transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md">
              Login 
            </button>
          </div>

          {/* Mobile menu updates */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white
                hover:bg-blue-500/50 focus:outline-none transition-colors duration-300"
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

      {/* Mobile Menu with updated styling */}
      <div
        className={`md:hidden transition-all duration-300 transform ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-lg border-t border-blue-100 px-2 pt-2 pb-3 space-y-1">
          {['home', 'services', 'doctors', 'contact'].map((item) => (
            <button
              key={item}
              className="w-full text-left px-4 py-3 rounded-md text-base font-medium
                uppercase transition-colors duration-300 text-gray-700
                hover:bg-blue-500/10 hover:text-blue-600"
            >
              {item}
            </button>
          ))}
          <button onClick={()=>navigate('/login')} className="w-full text-left px-4 py-3 rounded-lg text-base font-medium
            bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300">
            Login 
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar