import React from 'react'
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import doc13 from '../../assets/assets_frontend/doc13.png';
const Contactbody = () => {
  return (
    <div>
      <div className="pt-20 bg-white text-gray-800">
      {/* Banner */}
      <div className="relative h-[300px] bg-blue-900 text-white flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-900/70 backdrop-blur-sm z-0" />
        <div className="z-10 text-center">
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="mt-2 text-sm">Home / Contact Us</p>
        </div>
        <img
          src={doc13} // Replace with your image if needed
          alt="Contact"
          className="absolute top-0 right-0 h-full object-cover opacity-100"
        />
      </div>

      {/* Main Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10">
        {/* Contact Form */}
        <div className="bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-6">Contact With Us</h2>
          <form className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-1/2 border px-4 py-2 rounded"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-1/2 border px-4 py-2 rounded"
              />
            </div>
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Email Address"
                className="w-1/2 border px-4 py-2 rounded"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-1/2 border px-4 py-2 rounded"
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              className="w-full border px-4 py-2 rounded"
            />
            <textarea
              placeholder="Your Message Here"
              rows="5"
              className="w-full border px-4 py-2 rounded"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Send Message →
            </button>
          </form>
        </div>

        {/* Contact Details + Map */}
        <div className="flex flex-col gap-6">
          {/* Contact Info Box */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4">Need Any Help?</h3>
            <ul className="space-y-3 text-gray-700 text-sm">
              <li className="flex items-center gap-3">
                <FaPhone className="text-blue-600" />
                +123 987 3457 363 / +456 5465 5467 443
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-blue-600" />
                info@gmail.com, doctorhelp@gmail.com
              </li>
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-blue-600" />
                457 Washington Ave, Manchester, Road USA
              </li>
            </ul>
          </div>

          {/* Google Map */}
          <div className="rounded-xl overflow-hidden shadow-md">
            <iframe
              title="Google Map"
              src="https://maps.google.com/maps?q=Manchester,%20UK&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>

    </div>
  )
}

export default Contactbody
