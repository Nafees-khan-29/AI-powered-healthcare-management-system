import React from 'react';
import { BsArrowRight, BsLinkedin, BsTwitter } from 'react-icons/bs';
import { FaHeartbeat, FaStethoscope, FaUserMd, FaHospital, FaFacebookF } from 'react-icons/fa';
import { GiMedicines } from 'react-icons/gi';
import './Serve.css'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';



import doc1 from '../../assets/assets_frontend/doc1.png';
import doc2 from '../../assets/assets_frontend/doc2.png';
import doc3 from '../../assets/assets_frontend/doc3.png';
import doc4 from '../../assets/assets_frontend/doc4.png';
import doc5 from '../../assets/assets_frontend/doc5.png';
import doc6 from '../../assets/assets_frontend/doc6.png';
import doc7 from '../../assets/assets_frontend/doc7.png';
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

const doctors = [
  {
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    image: doc1,
    description: "Specialized in cardiovascular diseases with 15+ years of experience.",
    availability: "Mon - Fri",
    education: "MD - Cardiology, MBBS"
  },
  {
    name: "Dr. Michael Chen",
    specialty: "Neurologist",
    image: doc2,
    description: "Expert in neurological disorders and brain surgery.",
    availability: "Tue - Sat",
    education: "MD - Neurology, MBBS"
  },
  {
    name: "Dr. Emily Brown",
    specialty: "Pediatrician",
    image: doc3,
    description: "Dedicated to providing comprehensive care for children.",
    availability: "Mon - Sat",
    education: "MD - Pediatrics, MBBS"
  },
  {
    name: "Dr. James Wilson",
    specialty: "Orthopedic Surgeon",
    image: doc4,
    description: "Specialized in joint replacement and sports injuries.",
    availability: "Wed - Sun",
    education: "MD - Orthopedics, MBBS"
  },
  {
    name: "Dr. Maria Rodriguez",
    specialty: "Dermatologist",
    image: doc5,
    description: "Expert in skin conditions and cosmetic dermatology with 12+ years experience.",
    availability: "Mon - Thu",
    education: "MD - Dermatology, MBBS"
  },
  {
    name: "Dr. David Kim",
    specialty: "Oncologist",
    image: doc6,
    description: "Specialized in cancer treatment and innovative therapy approaches.",
    availability: "Tue - Sat",
    education: "MD - Oncology, MBBS"
  },
  {
    name: "Dr. Lisa Thompson",
    specialty: "Psychiatrist",
    image: doc7,
    description: "Dedicated to mental health and psychological well-being.",
    availability: "Mon - Fri",
    education: "MD - Psychiatry, MBBS"
  }
];


const Services = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {/* Services Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive healthcare services to meet all your medical needs with expert care and modern facilities.
            </p>
          </div>

          {/* Services Cards */}
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
            {services.map((service, index) => (
              <div key={index} className="cube-container">
                <div className="cube is-rotating">
                  {/* Front Face */}
                  <div className={`cube-face cube-front ${service.frontColor} text-white p-6 rounded-lg shadow-lg`}>
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        {service.icon}
                        <h3 className="text-xl font-semibold mt-4">{service.title}</h3>
                      </div>
                      <div className="flex justify-end">
                        <BsArrowRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Back Face */}
                  <div className={`cube-face cube-back ${service.backColor} text-white p-6 rounded-lg shadow-lg`}>
                    <div className="flex flex-col justify-center items-center h-full text-center">
                      <h3 className="text-xl font-semibold mb-3">More Info</h3>
                      <p className="text-sm mb-4">{service.description}</p>
                      <button 
                        onClick={() => navigate('/Services')} 
                        className="mt-2 px-4 py-2 bg-white text-blue-900 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>

                  {/* Right Face */}
                  <div className={`cube-face cube-right ${service.frontColor} text-white p-6 rounded-lg shadow-lg`}>
                    <div className="flex flex-col justify-center items-center h-full text-center">
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                      <div className="mt-4 transform scale-150">
                        {service.icon}
                      </div>
                    </div>
                  </div>

                  {/* Left Face */}
                  <div className={`cube-face cube-left ${service.backColor} text-white p-6 rounded-lg shadow-lg`}>
                    <div className="flex flex-col justify-center items-center h-full text-center">
                      <h3 className="text-xl font-semibold">Contact Us</h3>
                      <p className="text-sm mt-4">Available 24/7</p>
                    </div>
                  </div>

                  {/* Top Face */}
                  <div className={`cube-face cube-top ${service.frontColor} text-white p-6 rounded-lg shadow-lg`}>
                    <div className="flex justify-center items-center h-full">
                      {service.icon}
                    </div>
                  </div>

                  {/* Bottom Face */}
                  <div className={`cube-face cube-bottom ${service.backColor} text-white p-6 rounded-lg shadow-lg`}>
                    <div className="flex justify-center items-center h-full">
                      <BsArrowRight className="w-8 h-8" />
                    </div>
                  </div>
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
            <p className="text-gray-600 max-w-2xl mx-auto">
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
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
                <div className="text-gray-600">
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
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our team of highly qualified and experienced medical professionals is dedicated to providing exceptional healthcare services.
            </p>
          </div>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={30}
            navigation
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
          >
            {doctors.map((doctor, index) => (
              <SwiperSlide key={index} className="flex justify-center">
                <div className="group [perspective:1000px] w-full max-w-sm">
                  <div className="relative w-full h-[420px] duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

                    {/* Front Side */}
                    <div className="absolute w-full h-full bg-white rounded-2xl overflow-hidden shadow-md [backface-visibility:hidden]">
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="w-full h-60 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-xl font-semibold text-gray-800">{doctor.name}</h3>
                        <p className="text-sm text-blue-600">{doctor.specialty}</p>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div className="absolute w-full h-full bg-blue-50 rounded-2xl shadow-lg p-4 text-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                      <h3 className="text-lg font-bold text-blue-800 mb-1">{doctor.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{doctor.description}</p>
                      <p className="text-sm text-gray-700 mb-1">
                        <span className="font-semibold">Available:</span> {doctor.availability}
                      </p>
                      <p className="text-sm text-gray-700 mb-4">
                        <span className="font-semibold">Education:</span> {doctor.education}
                      </p>

                      <div className="flex gap-4 justify-center mb-4 text-blue-600">
                        <a href="#"><FaFacebookF /></a>
                        <a href="#"><BsTwitter /></a>
                        <a href="#"><BsLinkedin /></a>
                      </div>

                      <button
                        onClick={() => navigate('/appointment')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
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

    </>
  );
};

export default Services;
