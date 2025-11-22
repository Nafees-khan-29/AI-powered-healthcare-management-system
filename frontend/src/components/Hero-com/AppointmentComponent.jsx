import React, { useState, useRef, useEffect } from 'react';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaUpload, 
  FaFileAlt, 
  FaTrash, 
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaNotesMedical,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
  FaSpinner,
  FaHeartbeat,
  FaGraduationCap,
  FaAward,
  FaLanguage,
  FaUserMd
} from 'react-icons/fa';
import { format } from 'date-fns';
import Calendar from 'react-calendar';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { createAppointment, getBookedSlots } from '../../services/appointmentService';
import './Appointment.css';

// Enhanced time slots with availability status
const allTimeSlots = [
  { time: '09:00 AM', popular: true },
  { time: '09:30 AM', popular: false },
  { time: '10:00 AM', popular: false },
  { time: '10:30 AM', popular: false },
  { time: '11:00 AM', popular: true },
  { time: '11:30 AM', popular: false },
  { time: '02:00 PM', popular: true },
  { time: '02:30 PM', popular: false },
  { time: '03:00 PM', popular: false },
  { time: '03:30 PM', popular: false },
  { time: '04:00 PM', popular: true },
  { time: '04:30 PM', popular: false }
];

const AppointmentComponent = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [actualFiles, setActualFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const fileInputRef = useRef(null);

  // Load selected doctor from localStorage on component mount
  useEffect(() => {
    const storedDoctor = localStorage.getItem('selectedDoctor');
    if (storedDoctor) {
      try {
        setSelectedDoctor(JSON.parse(storedDoctor));
      } catch (error) {
        console.error('Error parsing stored doctor data:', error);
      }
    }
  }, []);

  // Fetch booked slots when doctor or date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDoctor?.email || !selectedDate) return;
      
      setLoadingSlots(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        console.log(`🔍 Fetching booked slots for ${selectedDoctor.email} on ${dateStr}`);
        
        const result = await getBookedSlots(selectedDoctor.email, dateStr);
        
        if (result.success) {
          console.log(`✅ Booked slots:`, result.bookedSlots);
          setBookedSlots(result.bookedSlots || []);
        } else {
          console.warn('Failed to fetch booked slots:', result.message);
          setBookedSlots([]);
        }
      } catch (error) {
        console.error('Error fetching booked slots:', error);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDoctor, selectedDate]);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    notes: '',
    symptom: '',
    emergencyContact: '',
    insuranceProvider: '',
    previousConditions: ''
  });

  const steps = [
    { id: 1, title: 'Select Date & Time', icon: FaCalendarAlt },
    { id: 2, title: 'Patient Information', icon: FaUser },
    { id: 3, title: 'Medical Details', icon: FaNotesMedical },
    { id: 4, title: 'Review & Confirm', icon: FaCheckCircle }
  ];

  // Form validation
  useEffect(() => {
    const errors = {};
    if (currentStep === 2) {
      if (!formData.name.trim()) errors.name = 'Name is required';
      if (!formData.age || formData.age < 1) errors.age = 'Valid age is required';
      if (!formData.gender) errors.gender = 'Gender is required';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!formData.email.trim()) errors.email = 'Valid email is required';
    }
    if (currentStep === 3) {
      if (!formData.symptom.trim()) errors.symptom = 'Symptoms description is required';
    }
    
    setFormErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  }, [formData, currentStep]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Store actual file objects for API upload
    setActualFiles([...actualFiles, ...files]);
    
    // Store file metadata for display
    const newFiles = files.map(file => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2),
      type: file.type,
      id: Date.now() + Math.random()
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const removeFile = (id) => {
    const index = uploadedFiles.findIndex(file => file.id === id);
    if (index !== -1) {
      setActualFiles(actualFiles.filter((_, i) => i !== index));
    }
    setUploadedFiles(uploadedFiles.filter(file => file.id !== id));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !selectedTime) {
      alert('Please select an appointment time');
      return;
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    // Check if doctor is selected
    if (!selectedDoctor) {
      alert('Please select a doctor first');
      navigate('/doctors');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare appointment data
      const appointmentData = {
        patientName: formData.name,
        patientEmail: formData.email,
        patientPhone: formData.phone,
        patientAge: parseInt(formData.age),
        patientGender: formData.gender,
        doctorId: selectedDoctor._id || 'temp-id',
        doctorName: selectedDoctor.name,
        doctorSpecialization: selectedDoctor.specialization,
        doctorEmail: selectedDoctor.email || null,
        doctorClerkUserId: selectedDoctor.clerkUserId || null,
        appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
        appointmentTime: selectedTime,
        symptoms: formData.symptom,
        additionalNotes: formData.notes,
        emergencyContact: formData.emergencyContact,
        insuranceProvider: formData.insuranceProvider,
        previousConditions: formData.previousConditions,
        clerkUserId: user?.id || null,
        userId: user?.primaryEmailAddress?.emailAddress || formData.email
      };

      console.log('📤 Creating appointment:', appointmentData);
      console.log('👨‍⚕️ Selected doctor object:', selectedDoctor);
      console.log('📧 Doctor email being sent:', selectedDoctor.email);
      
      // Call API to create appointment with files
      const result = await createAppointment(appointmentData, actualFiles);
      
      console.log('✅ Appointment created successfully:', result);
      
      // Store appointment ID
      setAppointmentId(result.appointment._id);
      
      // Show success modal
      setShowModal(true);
      
      // Clear selected doctor after successful booking
      setTimeout(() => {
        localStorage.removeItem('selectedDoctor');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      
      // Check if it's a 409 conflict error (slot already booked)
      if (error.message && error.message.includes('already booked')) {
        alert(`⚠️ Time Slot Unavailable\n\nThe selected time slot is already booked for this doctor. Please choose a different time.\n\nDoctor: ${selectedDoctor.name}\nDate: ${format(selectedDate, 'MMMM do, yyyy')}\nTime: ${selectedTime}`);
      } else {
        alert(`Failed to create appointment: ${error.message}\n\nPlease try again or contact support.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
  return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Preferred Time</h3>
              <p className="text-gray-800">Select a date and time that works best for you</p>
              </div>
              
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <Calendar 
                onChange={setSelectedDate} 
                value={selectedDate}
                minDate={new Date()}
                className="w-full max-w-md mx-auto mb-6"
              />
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
                <FaClock className="text-blue-600" />
                Available Time Slots for {format(selectedDate, 'MMMM do, yyyy')}
                {loadingSlots && <FaSpinner className="animate-spin text-blue-500 text-sm" />}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allTimeSlots.map((slot) => {
                  const isBooked = bookedSlots.includes(slot.time);
                  const isAvailable = !isBooked;
                  
                  return (
                    <button
                      key={slot.time}
                      onClick={() => isAvailable && setSelectedTime(slot.time)}
                      disabled={!isAvailable}
                      className={`relative p-3 rounded-xl text-sm font-medium transition-all transform ${
                        selectedTime === slot.time
                          ? 'bg-blue-600 text-white shadow-lg scale-105 ring-4 ring-blue-200'
                          : isAvailable
                          ? 'bg-white hover:bg-blue-50 text-gray-800 border-2 border-gray-200 hover:border-blue-300 hover:scale-105'
                          : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed opacity-60'
                      }`}
                    >
                      {slot.time}
                      {slot.popular && isAvailable && (
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                      {isBooked && (
                        <span className="absolute inset-0 bg-red-100 rounded-xl flex items-center justify-center border-2 border-red-300">
                          <span className="text-xs text-red-600 font-semibold">Booked</span>
                        </span>
                      )}
                    </button>
                  );
                })}
                </div>
              </div>
            </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Patient Information</h3>
              <p className="text-gray-600">Please provide your basic details</p>
            </div>
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Full Name *</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      required
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      formErrors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                      value={formData.name}
                      onChange={handleInputChange}
                    placeholder="Enter your full name"
                    />
                </div>
                {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                  </div>
                  
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Age *</label>
                    <input
                      type="number"
                      name="age"
                      required
                  min="1"
                  max="120"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    formErrors.age ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                      value={formData.age}
                      onChange={handleInputChange}
                  placeholder="Enter your age"
                    />
                {formErrors.age && <p className="text-red-500 text-sm">{formErrors.age}</p>}
                  </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Gender *</label>
                    <select
                      name="gender"
                      required
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    formErrors.gender ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                {formErrors.gender && <p className="text-red-500 text-sm">{formErrors.gender}</p>}
                  </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Phone Number *</label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      required
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      formErrors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                      value={formData.phone}
                      onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    />
                </div>
                {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
                  </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-gray-700 font-medium">Email Address *</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      formErrors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                    }`}
                      value={formData.email}
                      onChange={handleInputChange}
                    placeholder="Enter your email address"
                  />
                </div>
                {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Medical Information</h3>
              <p className="text-gray-600">Help us understand your health concerns better</p>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Symptoms Description *</label>
                <textarea
                  name="symptom"
                  rows="4"
                  placeholder="Please describe your symptoms, when they started, and their severity..."
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                    formErrors.symptom ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                  value={formData.symptom}
                  onChange={handleInputChange}
                />
                {formErrors.symptom && <p className="text-red-500 text-sm">{formErrors.symptom}</p>}
                  </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Additional Notes</label>
                    <textarea
                      name="notes"
                  rows="3"
                  placeholder="Any other information you'd like to share..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      value={formData.notes}
                      onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Emergency Contact</label>
                  <input
                    type="text"
                    name="emergencyContact"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Name and phone number"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-gray-700 font-medium">Insurance Provider</label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={formData.insuranceProvider}
                    onChange={handleInputChange}
                    placeholder="Insurance company name"
                  />
                </div>
                  </div>

              <div className="space-y-2">
                <label className="block text-gray-700 font-medium">Previous Medical Conditions</label>
                    <textarea
                  name="previousConditions"
                      rows="3"
                  placeholder="List any relevant medical history..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  value={formData.previousConditions}
                      onChange={handleInputChange}
                />
                  </div>

                  {/* File Upload Section */}
              <div className="space-y-4">
                <label className="block text-gray-700 font-medium">Medical Reports (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                    className="flex items-center justify-center w-full gap-3 py-4 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all hover:scale-105"
                      >
                    <FaUpload className="text-xl" />
                    <span className="font-medium">Upload Medical Reports</span>
                      </button>
                  <p className="text-sm text-gray-800 mt-2">Supports PDF, JPG, PNG, DOC files (Max 10MB each)</p>
                    </div>

                    {/* File List */}
                    {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FaFileAlt className="text-blue-600 text-xl" />
                          <div>
                            <span className="font-medium text-gray-800">{file.name}</span>
                            <span className="text-sm text-gray-800 ml-2">({file.size} MB)</span>
                          </div>
                            </div>
                            <button
                              type="button"
                          onClick={() => removeFile(file.id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Review Your Appointment</h3>
              <p className="text-gray-800">Please review all details before confirming</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Appointment Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl">
                  <h5 className="font-medium text-gray-800 mb-2">Date & Time</h5>
                  <p className="text-blue-600 font-semibold">
                    {format(selectedDate, 'MMMM do, yyyy')} at {selectedTime}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl">
                  <h5 className="font-medium text-gray-800 mb-2">Doctor</h5>
                  <p className="text-blue-600 font-semibold">
                    {selectedDoctor ? selectedDoctor.name : 'No doctor selected'}
                  </p>
                  {selectedDoctor && (
                    <p className="text-gray-800 text-sm mt-1">{selectedDoctor.specialization}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Patient Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-800">Name:</span>
                  <span className="ml-2 font-medium">{formData.name}</span>
                </div>
                <div>
                  <span className="text-gray-800">Age:</span>
                  <span className="ml-2 font-medium">{formData.age} years</span>
                </div>
                <div>
                  <span className="text-gray-800">Gender:</span>
                  <span className="ml-2 font-medium capitalize">{formData.gender}</span>
                </div>
                <div>
                  <span className="text-gray-800">Phone:</span>
                  <span className="ml-2 font-medium">{formData.phone}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-800">Email:</span>
                  <span className="ml-2 font-medium">{formData.email}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Medical Information</h4>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-700">Symptoms:</span>
                  <p className="mt-1 text-gray-800">{formData.symptom}</p>
                </div>
                {formData.notes && (
                  <div>
                    <span className="text-gray-700">Additional Notes:</span>
                    <p className="mt-1 text-gray-800">{formData.notes}</p>
                  </div>
                )}
                {uploadedFiles.length > 0 && (
                  <div>
                    <span className="text-gray-700">Attached Files:</span>
                    <p className="mt-1 text-gray-800">{uploadedFiles.length} file(s)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-blue-600 text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-900'
                  }`}>
                    {currentStep > step.id ? <FaCheckCircle /> : <step.icon />}
                  </div>
                  <span className={`mt-2 text-sm font-medium transition-colors ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-4 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Enhanced Doctor Details Card */}
          <div className="lg:col-span-1">
            {selectedDoctor ? (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all hover:scale-[1.02] sticky top-24">
                <div className="relative">
                  <img 
                    src={selectedDoctor.image || "/doctor-image.jpg"} 
                    alt={selectedDoctor.name} 
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedDoctor.name}</h2>
                    <p className="text-blue-300 text-lg mb-3">{selectedDoctor.specialization}</p>
                    <div className="flex items-center gap-2 text-white/90">
                      <FaHeartbeat className="text-red-400" />
                      <span>{selectedDoctor.specialization} Specialist</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Rating */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar key={star} className="text-yellow-400 w-5 h-5" />
                      ))}
                    </div>
                    <span className="text-gray-900 font-medium">4.9 (128 reviews)</span>
                  </div>

                  {/* Doctor Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">{selectedDoctor.experience || '15+'}+</div>
                      <div className="text-sm text-gray-900">Years Experience</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">2.5k+</div>
                      <div className="text-sm text-gray-900">Patients Treated</div>
                    </div>
                  </div>

                  {/* Qualifications */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <FaGraduationCap className="text-blue-600 text-xl" />
                      <div>
                        <div className="font-semibold text-gray-900">{selectedDoctor.education || 'MBBS, MD'}</div>
                        <div className="text-sm text-gray-900">Medical University</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <FaAward className="text-yellow-600 text-xl" />
                      <div>
                        <div className="font-semibold text-gray-900">Board Certified</div>
                        <div className="text-sm text-gray-900">Medical Board</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <FaMapMarkerAlt className="text-red-600 text-xl" />
                      <div>
                        <div className="font-semibold text-gray-900">City Hospital</div>
                        <div className="text-sm text-gray-900">Downtown Medical Center</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <FaClock className="text-purple-600 text-xl" />
                      <div>
                        <div className="font-semibold text-gray-900">Available</div>
                        <div className="text-sm text-gray-900">{selectedDoctor.availability || 'Mon-Fri: 9AM-5PM'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Change Doctor Button */}
                  <button
                    onClick={() => {
                      localStorage.removeItem('selectedDoctor');
                      navigate('/doctors');
                    }}
                    className="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Change Doctor
                  </button>

                  {/* Consultation Fee */}
                  <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
                    <div className="text-sm opacity-90">Consultation Fee</div>
                    <div className="text-3xl font-bold">700 INR</div>
                    <div className="text-sm opacity-90">Insurance accepted</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden sticky top-24">
                <div className="p-8 text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <FaUserMd className="text-5xl text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No Doctor Selected</h3>
                    <p className="text-gray-900 mb-6">
                      Please select a doctor from our specialists to continue with your appointment booking.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/doctors')}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Select a Doctor
                  </button>
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-900">
                      Browse through our experienced doctors and choose the one that best fits your needs.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    currentStep === 1
                      ? 'bg-gray-100 text-gray-800 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  <FaArrowLeft />
                  Previous
                </button>
                
                {currentStep < steps.length ? (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
                  >
                    Next
                    <FaArrowRight />
                  </button>
                ) : (
                <button
                    onClick={handleSubmit}
                    disabled={!isFormValid || isLoading}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                      !isFormValid || isLoading
                        ? 'bg-gray-300 text-gray-900 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-lg'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle />
                  Confirm Appointment
                      </>
                    )}
                </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full transform transition-all animate-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Appointment Confirmed!</h3>
              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <p className="text-gray-700 font-medium">
                  {format(selectedDate, 'MMMM do, yyyy')}
                </p>
                <p className="text-blue-600 font-bold text-xl">{selectedTime}</p>
                <p className="text-gray-600 text-sm">
                  with {selectedDoctor ? selectedDoctor.name : 'your selected doctor'}
                </p>
              </div>
              <p className="text-gray-600 mb-6">
                You will receive a confirmation email with appointment details and preparation instructions.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-all font-medium text-lg hover:scale-105"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentComponent;
