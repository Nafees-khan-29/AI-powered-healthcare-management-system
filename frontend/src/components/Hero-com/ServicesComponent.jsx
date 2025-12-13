import React from 'react';
import { BsLinkedin, BsTwitter } from 'react-icons/bs';
import { FaHeartbeat, FaStethoscope, FaUserMd, FaHospital, FaFacebookF } from 'react-icons/fa';
import { GiMedicines } from 'react-icons/gi';
import './Serve.css'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';



import { doctors as doctorsList } from '../../assets/assets_frontend/assets';
import { useNavigate } from 'react-router-dom';




const services = [
  {
    icon: <FaHeartbeat className="w-12 h-12" />,
    title: "Laboratory Services",
    description: "Comprehensive lab testing and diagnostics with state-of-the-art equipment",
    frontColor: "bg-blue-900",
    backColor: "bg-blue-800"
  },
  {
    icon: <FaStethoscope className="w-12 h-12" />,
    title: "General Checkup",
    description: "Regular health assessments and preventive care consultations",
    frontColor: "bg-cyan-500",
    backColor: "bg-cyan-400"
  },
  {
    icon: <FaUserMd className="w-12 h-12" />,
    title: "Medical Care",
    description: "Expert medical care from experienced healthcare professionals",
    frontColor: "bg-blue-900",
    backColor: "bg-blue-800"
  },
  {
    icon: <GiMedicines className="w-12 h-12" />,
    title: "Pharmacy Services",
    description: "Full-service pharmacy with prescription and OTC medications",
    frontColor: "bg-cyan-500",
    backColor: "bg-cyan-400"
  }
];

const Services = () => {
  const navigate = useNavigate();
  
  // Get first 7 doctors from assets.js
  const doctors = doctorsList.slice(0, 7).map(doctor => ({
    name: doctor.name,
    specialty: doctor.speciality,
    image: doctor.image,
    description: doctor.about,
    availability: "Mon - Fri", // Default availability
    education: `${doctor.degree} - ${doctor.speciality}`,
    experience: doctor.experience,
    hospital: doctor.hospital
  }));

  return (
    <>
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Services Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-black/80 max-w-2xl mx-auto">
              We offer comprehensive healthcare services to meet all your medical needs with expert care and modern facilities.
            </p>
          </div>

          {/* Services Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-8">
            {services.map((service, index) => (
              <div
                key={index}
                className={`${service.frontColor} text-white rounded-2xl shadow-lg p-6 flex flex-col justify-between transition-transform duration-300 hover:-translate-y-2`}
              >
                <div>
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-white/20">
                    {service.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mt-5">{service.title}</h3>
                  <p className="text-sm text-white/90 mt-3 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-white/80">Available 24/7</span>
                  <button
                    onClick={() => navigate('/Services')}
                    className="px-4 py-2 bg-white text-blue-900 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Why Choose Us
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Leading Healthcare Provider
            </h2>
            <p className="text-black/80 max-w-2xl mx-auto">
              We deliver exceptional medical services with cutting-edge technology and compassionate care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Expert Medical Team",
                description: "Our healthcare professionals bring years of experience and expertise to provide you with the best medical care.",
                icon: <FaUserMd className="w-12 h-12 text-blue-600" />
              },
              {
                title: "Modern Equipment",
                description: "State-of-the-art medical facilities and advanced diagnostic equipment for accurate treatment.",
                icon: <FaHospital className="w-12 h-12 text-blue-600" />
              },
              {
                title: "Emergency Care",
                description: "24/7 emergency services with rapid response times and dedicated emergency specialists.",
                icon: <FaHeartbeat className="w-12 h-12 text-blue-600" />
              }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-blue-600 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-black/80">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics Row */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "20+", label: "Specialist Doctors" },
              { number: "1000+", label: "Satisfied Patients" },
              { number: "15+", label: "Years Experience" },
              { number: "24/7", label: "Emergency Care" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-black/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expert Doctors Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Our Medical Experts
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
              Meet Our Expert Doctors
            </h2>
            <p className="text-black/600 max-w-2xl mx-auto">
              Our team of highly qualified and experienced medical professionals is dedicated to providing exceptional healthcare services.
            </p>
          </div>

          <div className="relative">
            <button
              className="swiper-nav-prev absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-1/2 w-16 h-16 rounded-full border border-blue-600 bg-white text-blue-600 text-4xl shadow-lg transition hover:bg-blue-600 hover:text-white"
              aria-label="Previous doctors"
            >
              ‹
            </button>
            <button
              className="swiper-nav-next absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-1/2 w-16 h-16 rounded-full border border-blue-600 bg-white text-blue-600 text-4xl shadow-lg transition hover:bg-blue-600 hover:text-white"
              aria-label="Next doctors"
            >
              ›
            </button>

            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={30}
              navigation={{
                prevEl: '.swiper-nav-prev',
                nextEl: '.swiper-nav-next'
              }}
              pagination={{ clickable: true }}
              breakpoints={{
                0: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
            >
              {doctors.map((doctor, index) => (
                <SwiperSlide key={index} className="flex justify-center items-center py-4">
                  <div className="group [perspective:1000px] w-full max-w-sm mx-auto">
                  <div className="relative w-full h-[420px] duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

                    {/* Front Side */}
                    <div className="absolute w-full h-full bg-white rounded-2xl overflow-hidden shadow-md [backface-visibility:hidden] flex flex-col items-center text-center p-6 gap-4">
                      <div className="w-36 h-36 rounded-full overflow-hidden shadow-lg border-4 border-white bg-gray-100">
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-blue-800">{doctor.name}</h3>
                        <p className="text-sm text-blue-600">{doctor.specialty}</p>
                      </div>
                      <p className="text-sm text-black/600">
                        {doctor.description}
                      </p>
                    </div>

                    {/* Back Side */}
                    <div className="absolute w-full h-full bg-blue-50 rounded-2xl shadow-lg p-6 text-center [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center gap-4">
                      <h3 className="text-xl font-bold text-blue-800">{doctor.name}</h3>
                      <p className="text-sm text-black/600">
                        {doctor.description}
                      </p>
                      <div className="text-sm text-black/600">
                        <p>
                          <span className="font-semibold">Available:</span> {doctor.availability}
                        </p>
                        <p>
                          <span className="font-semibold">Education:</span> {doctor.education}
                        </p>
                      </div>

                      <div className="flex gap-4 justify-center text-blue-600 text-lg">
                        <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                        <a href="#" aria-label="Twitter"><BsTwitter /></a>
                        <a href="#" aria-label="LinkedIn"><BsLinkedin /></a>
                      </div>

                      <button
                        onClick={() => {
                          // Get the original doctor object from doctorsList
                          const selectedDoctor = doctorsList[index];
                          // Store the selected doctor in localStorage
                          localStorage.setItem('selectedDoctor', JSON.stringify(selectedDoctor));
                          // Navigate to appointment page
                          navigate('/appointment');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-full"
                      >
                        Book Now
                      </button>
                    </div>

                  </div>
                </div>
              </SwiperSlide>
            ))}
            </Swiper>
          </div>
        </div>
      </div>

    </>
  );
};

export default Services;
