import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useUser } from '@clerk/clerk-react';
import { getAllDoctors } from '../../services/doctorService';
import { doctors as staticDoctors } from '../../assets/assets_frontend/assets.js';
import { FaSync } from 'react-icons/fa';
// import nafees from '../../assets/doctors/vivan.jpg';


const DoctorsComponent = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  // Fetch doctors from API
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getAllDoctors();
      const apiDoctors = response.doctors || [];
      
      // Merge static doctors with API doctors
      // API doctors take precedence, but we assign images to those without them
      const mergedDoctors = [
        ...staticDoctors.map(staticDoc => ({
          ...staticDoc,
          _id: staticDoc._id,
          name: staticDoc.name,
          image: staticDoc.image,
          specialization: staticDoc.speciality || staticDoc.specialization,
          degree: staticDoc.degree,
          experience: staticDoc.experience,
          fees: staticDoc.fees,
          address: staticDoc.address,
          available: true,
          availability: 'Mon-Fri: 9AM-5PM'
        })),
        ...apiDoctors.map((apiDoc, index) => ({
          ...apiDoc,
          // If API doctor doesn't have an image, assign one from static doctors
          image: apiDoc.image || staticDoctors[index % staticDoctors.length]?.image,
          // Ensure specialization field exists
          specialization: apiDoc.specialization || apiDoc.speciality || 'General',
          // Set default values for missing fields
          degree: apiDoc.degree || 'MBBS',
          experience: apiDoc.experience || 'N/A',
          fees: apiDoc.fees || 50,
          available: apiDoc.available !== undefined ? apiDoc.available : true,
          availability: apiDoc.availability || 'Mon-Fri: 9AM-5PM'
        }))
      ];
      
      setDoctors(mergedDoctors);

      // Extract unique specializations for categories
      const uniqueSpecializations = [...new Set(mergedDoctors.map(doctor => doctor.specialization).filter(Boolean))];
      setCategories(uniqueSpecializations);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Fallback to static doctors if API fails
      const fallbackDoctors = staticDoctors.map(staticDoc => ({
        ...staticDoc,
        _id: staticDoc._id,
        name: staticDoc.name,
        image: staticDoc.image,
        specialization: staticDoc.speciality || staticDoc.specialization,
        degree: staticDoc.degree,
        experience: staticDoc.experience,
        fees: staticDoc.fees,
        address: staticDoc.address,
        available: true,
        availability: 'Mon-Fri: 9AM-5PM'
      }));
      setDoctors(fallbackDoctors);
      
      const uniqueSpecializations = [...new Set(fallbackDoctors.map(doctor => doctor.specialization).filter(Boolean))];
      setCategories(uniqueSpecializations);
    } finally {
      setLoading(false);
    }
  };

  // Refresh doctors list
  const refreshDoctors = () => {
    fetchDoctors();
  };

  // Handle book appointment with authentication check
  const handleBookAppointment = (doctor) => {
    if (isSignedIn) {
      // Store selected doctor in localStorage
      localStorage.setItem('selectedDoctor', JSON.stringify(doctor));
      navigate('/appointment');
    } else {
      // Store doctor info for after login and redirect to login
      localStorage.setItem('selectedDoctor', JSON.stringify(doctor));
      navigate('/login');
    }
  };

  // Group doctors by specialization
  const doctorsBySpecialization = doctors.reduce((groups, doctor) => {
    const specialization = doctor.specialization || 'General';
    if (!groups[specialization]) {
      groups[specialization] = [];
    }
    groups[specialization].push(doctor);
    return groups;
  }, {});

  // Filter doctors based on selected category and search term
  const filteredDoctors = selectedCategory === 'All'
    ? doctors.filter(doctor =>
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.degree?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : (doctorsBySpecialization[selectedCategory] || []).filter(doctor =>
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.degree?.toLowerCase().includes(searchTerm.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-gray-50 pt-20"> {/* Added pt-20 for navbar space */}
      {/* Mobile Menu Button */}
      <div className="lg:hidden p-4">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 bg-blue-600 text-white rounded-md"
        >
          {isMenuOpen ? 'Close Menu' : 'Show Specializations'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className={`
          bg-white shadow-lg p-6 rounded-2xl
          ${isMenuOpen ? 'block' : 'hidden'}
          lg:block lg:w-64 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]
          overflow-y-auto z-10
        `}>
          <h2 className="text-xl font-bold mb-6 text-gray-800">Specializations</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                setSelectedCategory('All');
                setIsMenuOpen(false);
              }}
              className={`
                w-full text-left px-4 py-2 rounded-md transition-colors
                ${selectedCategory === 'All' 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-100 text-gray-700'}
              `}
            >
              All Doctors
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setIsMenuOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-2 rounded-md transition-colors
                  ${selectedCategory === category 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-100 text-gray-700'}
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
  <div className="flex-1 p-4 sm:p-6 lg:pl-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
              {selectedCategory === 'All' ? 'All Doctors' : `${selectedCategory} Specialists`}
            </h1>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={refreshDoctors}
                disabled={loading}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Refresh doctor list"
              >
                <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              // Loading state with skeleton placeholders
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                >
                  <div className="w-full h-64 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                    </div>
                    <div className="h-10 bg-gray-300 rounded"></div>
                  </div>
                </motion.div>
              ))
            ) : filteredDoctors.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No doctors found matching your criteria.</p>
              </div>
            ) : (
              filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="w-full h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        // Fallback to a default image if the main image fails
                        e.target.src = staticDoctors[0]?.image || '/src/assets/doctor1.jpg';
                      }}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {doctor.name}
                    </h3>
                    <p className="text-blue-600 font-medium mb-2">
                      {doctor.specialization || 'General'}
                    </p>
                    <div className="space-y-2 text-gray-900 text-sm mb-4">
                      <p>Experience: {doctor.experience || 'N/A'}</p>
                      <p>Available: {doctor.availability || 'Mon-Fri'}</p>
                      <p>Education: {doctor.education || doctor.degree || 'N/A'}</p>
                      <p>Fees: ${doctor.fees || 'N/A'}</p>
                    </div>
                    <button
                      onClick={() => handleBookAppointment(doctor)}
                      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Book Appointment
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DoctorsComponent;
