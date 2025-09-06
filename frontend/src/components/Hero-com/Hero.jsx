import React from 'react'
import headerImage from '../../assets/assets_frontend/header_img.png'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const navigate = useNavigate();
  return (
<div className="relative bg-gradient-to-r from-[#54a6f4] via-[#c4d7e6] to-[#ffffff] min-h-screen text-white">
  {/* Header nav space */}
  <div className="h-16"></div>

  {/* Main content */}
  <div className="max-w-7xl mx-auto px-4 py-8">
    <div className="flex flex-col md:flex-row items-center justify-between gap-16">
      {/* Left Content */}
      <div className="w-full md:w-1/2 space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
          Compassionate care,
          <span className="block mt-2">exceptional results.</span>
        </h1>
        <p className="text-gray-200 text-lg max-w-xl leading-relaxed">
          ProHealth is a team of experienced medical professionals dedicated to providing the highest quality healthcare services.
        </p>

        {/* ✅ Book Appointment Button */}
       

        {/* Statistics */}
        <div className="flex justify-between mt-20 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg ">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white">20+</h3>
            <p className="text-gray-200 text-sm mt-2">Years Experience</p>
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white">95%</h3>
            <p className="text-gray-200 text-sm mt-2">Success Rate</p>
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-bold text-white">5,000+</h3>
            <p className="text-gray-200 text-sm mt-2">Happy Patients</p>
          </div>
        </div>
                <button
          onClick={() => navigate('/login')}
         className="bg-blue-600 text-white px-6 py-3 rounded-full text-base font-medium
              hover:bg-blue-700 transform hover:scale-105 transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md "
        >
          Book Appointment
        </button>

      </div>

      {/* Right Image */}
      <div className="w-full md:w-1/2 relative">
        <div className="absolute inset-0 bg-white/5 rounded-full filter blur-3xl"></div>
        <img
          src={headerImage}
          alt="Healthcare Professional"
          className="w-full h-auto object-contain relative z-10"
        />
      </div>
    </div>
  </div>
</div>

  )
}

export default Hero