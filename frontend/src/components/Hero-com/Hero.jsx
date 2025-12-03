import React from 'react'
import headerImage from '../../assets/assets_frontend/header_img.png'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'

const Hero = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  const handleBookAppointment = () => {
    if (isSignedIn) {
      navigate('/appointment');
    } else {
      navigate('/login');
    }
  };

  const stats = [
    { value: '20+', label: 'Years Experience' },
    { value: '100%', label: 'Success Rate' },
    { value: '5000+', label: 'Happy Patients' }
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#5ab0ff] via-[#c9def0] to-white text-white pt-3 ">
      {/* Decorative blobs */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/20 rounded-full blur-3xl" aria-hidden />
      <div className="absolute top-24 -left-20 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl" aria-hidden />

      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16 md:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <p className="text-sm tracking-[0.3em] uppercase text-blue-900/90 pt-3">Trusted Healthcare Partner</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-blue-950">
              Compassionate care,
              <span className=" text-blue-900">exceptional results.</span>
            </h1>
            <p className="text-base sm:text-lg text-gray-700">
              ProHealth is a team of experienced medical professionals dedicated to providing the highest quality healthcare services.
            </p>

            {/* Doctor image shown beneath intro text on small/medium screens */}
            <div className="lg:hidden w-full max-w-md mx-auto">
              <div className="relative rounded-[2rem] bg-white/80 p-4 shadow-xl">
                <img
                  src={headerImage}
                  alt="Healthcare Professional"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <button
                  onClick={handleBookAppointment}
                  className="min-w-[180px] bg-blue-700 text-white px-8 py-3 rounded-full text-base font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-900 transition-transform transform hover:-translate-y-0.5"
                >
                  Book Appointment
                </button>
                <button
                  onClick={() => navigate('/assistant')}
                  className="min-w-[200px] bg-blue-700 text-white px-8 py-3 rounded-full text-base font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-900 transition-transform transform hover:-translate-y-0.5"
                >
                  AI Medical Assistant
                </button>
              </div>
              <p className="text-sm sm:text-base font-medium text-gray-700 pr-14">
                Emergency support available round-the-clock
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-4 bg-white/10 backdrop-blur-xl rounded-3xl p-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <h3 className="text-3xl font-bold text-blue-900">{stat.value}</h3>
                  <p className="text-sm text-gray-700 mt-2">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto hidden lg:block">
            <div className="absolute inset-0 bg-blue-200/40 rounded-full blur-3xl" aria-hidden />
            <div className="relative rounded-[2.5rem]  p-13 ">
              <img
                src={headerImage}
                alt="Healthcare Professional"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

  )
}

export default Hero