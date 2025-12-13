import React from 'react'
import { FaEnvelope, FaMapMarkerAlt, FaPhone, FaClock, FaHeadset } from 'react-icons/fa';
import doc13 from '../../assets/assets_frontend/doc13.png';

const inputFieldClasses = 'w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-shadow shadow-sm';

const Contactbody = () => {
  return (
    <section className="pt-24 pb-20 bg-gray-200 text-gray-800">
      {/* Banner */}
      <div className="relative max-w-6xl mx-auto mb-12 px-4">
        <div className="rounded-3xl overflow-hidden bg-blue-900 text-white shadow-2xl">
          <div className="relative min-h-[320px] flex flex-col md:flex-row items-stretch">
            {/* Mobile: Background doctor image with transparency */}
            <div className="absolute md:hidden inset-0 opacity-15 overflow-hidden">
              <img
                src={doc13}
                alt="Contact"
                // loading="lazy"
                // decoding="async"
                className="w-full h-auto object-contain object-top scale-110"
              />
            </div>
            
            <div className="flex-1 p-6 md:p-10 relative z-10">
              <p className="text-blue-100 uppercase tracking-[0.4em] text-xs">We'd love to hear from you</p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mt-4">
                Let’s design your next medical experience together
              </h1>
              <p className="mt-4 text-blue-50/90 text-sm md:text-base max-w-xl">
                Reach our care coordinators 24/7. We respond faster than the industry average and provide a dedicated specialist for every query.
              </p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur">
                  <FaHeadset /> 24/7 Care Concierge
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur">
                  <FaClock /> Avg response under 15 min
                </span>
              </div>
            </div>
            
            {/* Desktop: Doctor image showing - responsive sizing */}
            <div className="hidden md:flex md:w-72 lg:w-80 xl:w-96 relative overflow-hidden items-center justify-center">
              <img
                src={doc13}
                alt="Contact"
                loading="eager"
                decoding="async"
                className="w-full h-full object-cover object-top md:scale-110 lg:scale-115 xl:scale-125"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Section */}
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
        {/* Form + Highlights */}
        <div className="space-y-8">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Avg. Reply Time', value: '15 mins' },
              { label: 'Patients Assisted', value: '12k+' },
              { label: 'Locations Covered', value: '28 cities' }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <p className="text-xs uppercase tracking-widest font-semibold text-black/100">{item.label}</p>
                <p className="text-2xl font-semibold text-blue-700 mt-2">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
            <div className="flex flex-wrap items-center gap-3 text-white-100 text-sm font-semibold mb-6">
              <span className="px-3 py-1 rounded-full bg-blue-600">Priority support</span>
              <span className="px-3 py-1 rounded-full bg-blue-600">HIPAA compliant</span>
            </div>
            <h2 className="text-3xl font-bold text-blue-900">Share your details</h2>
            <p className="text-sm text-gray-900 mt-2">Tell us how we can assist you and we’ll connect you to the right specialist.</p>
            <form className="mt-8 space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <input type="text" placeholder="First Name" className={inputFieldClasses} />
                <input type="text" placeholder="Last Name" className={inputFieldClasses} />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <input type="email" placeholder="Email Address" className={inputFieldClasses} />
                <input type="tel" placeholder="Phone Number" className={inputFieldClasses} />
              </div>
              <select className={inputFieldClasses}>
                <option>How can we help?</option>
                <option>Book a specialist</option>
                <option>Billing & insurance</option>
                <option>Partnership inquiry</option>
                <option>General question</option>
              </select>
              <textarea placeholder="Share a few details" rows="5" className={inputFieldClasses} />
              <button type="submit" className="w-full py-4 rounded-2xl text-white text-lg font-semibold bg-blue-900 hover:bg-blue-900 shadow-lg transition-transform hover:-translate-y-0.5">
                Send Secure Message →
              </button>
            </form>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 space-y-6">
            <h3 className="text-2xl font-bold text-blue-900">Talk to a human</h3>
            <p className="text-gray-900 text-sm">Skip the wait. Reach the right department directly.</p>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-gray-50">
                <FaPhone className="text-blue-900 text-xl" />
                <div>
                  <p className="text-xs uppercase font-semibold text-blue-900">Emergency line</p>
                  <p className="text-lg font-semibold text-gray-900">+91 84625 875XX</p>
                  <p className="text-xs text-gray-900">Response under 60 seconds</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl bg-gray-50">
                <FaEnvelope className="text-blue-900 text-xl" />
                <div>
                  <p className="text-xs uppercase font-semibold text-blue-900">Care team</p>
                  <p className="text-lg font-semibold text-gray-900">hello@medicare.health</p>
                  <p className="text-xs text-gray-900">Detailed reply within 6 hours</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl bg-gray-50">
                <FaHeadset className="text-blue-900 text-xl" />
                <div>
                  <p className="text-xs uppercase font-semibold text-blue-900">Virtual assistant</p>
                  <p className="text-lg font-semibold text-gray-900">Live chat in the app</p>
                  <p className="text-xs text-gray-900">Available 7 days a week</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 text-gray-800 rounded-3xl p-8 shadow-xl space-y-6">
            <div>
              <p className="text-md uppercase tracking-[0.3em] font-bold text-blue-900">Visit us</p>
              <p className="text-2xl font-semibold mt-2 text-gray-900">Mangalore, Karnataka, India</p>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <FaClock className="text-2xl text-blue-900" />
              <div>
                <p className="text-sm uppercase tracking-wide text-black">Care center hours</p>
                <p className="text-lg font-semibold text-gray-900">Mon - Sat | 7:00 AM – 10:00 PM</p>
                <p className="text-sm text-black">Weekend triage team active 24/7</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
              <iframe
                title="Google Map"
                src="https://maps.google.com/maps?q=India,%20Mangalore&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contactbody
