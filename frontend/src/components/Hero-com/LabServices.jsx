import React from 'react';
import { FaMicroscope } from 'react-icons/fa';
import Lab1 from '../../assets/assets_frontend/Lab1.jpg';
import Lab2 from '../../assets/assets_frontend/Lab2.jpg';
import Lab4 from '../../assets/assets_frontend/Lab4.jpg';
import Lab5 from '../../assets/assets_frontend/Lab5.jpg';
import Lab6 from '../../assets/assets_frontend/Lab6.jpg';
import Navbar from './Navbar';



const LabServices = () => {
  return (
    
    <div className="text-gray-800">
      {/* Hero Section */}
      <section className="relative h-[90vh] bg-cover bg-center flex items-center justify-center text-white opacity-60"
        style={{ backgroundImage:`url(${Lab5})` }} // Change image URL
      >
        <div className="absolute inset-0 bg-blue-950/70 backdrop-blur-sm" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Committed to Quality Laboratory Products</h1>
          <div className="flex justify-center gap-6 mt-6 text-lg font-medium">
            <span className="bg-white/20 px-4 py-2 rounded-xl">80+ Pathology Labs</span>
            <span className="bg-white/20 px-4 py-2 rounded-xl">150+ Collection Centers</span>
          </div>
          <button className="mt-8 bg-white text-blue-900 font-semibold px-6 py-2 rounded hover:bg-gray-200 transition">
            Read More
          </button>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Image */}
          <div className="md:w-1/2">
            <img src={Lab1} alt="Lab Expert" className="rounded-lg shadow-md" />
          </div>

          {/* Text */}
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Experiment with the best lab products and service</h2>
            <p className="text-gray-600">
              Our labs are equipped with the latest technologies and our experts ensure accurate and timely diagnostic services.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-blue-900 font-medium">
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold">01. Highly Advanced Laboratory</h3>
                <p className="text-sm mt-2 text-gray-600">12° Temperature Controlled, fully automated testing setups.</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold">02. Comprehensive Test Menu</h3>
                <p className="text-sm mt-2 text-gray-600">Covering all critical areas from routine to complex diagnostics.</p>
              </div>
            </div>

            <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
              Read More
            </button>
          </div>
        </div>
      </section>

      {/* Diagnostic Service Cards */}
      <section className="py-16 bg-blue-50 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Reliable Diagnostic Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Blood Testing', img: `${Lab4}`},
              { title: 'Covid-19 Test', img: `${Lab2}` },
              { title: 'Microbiology', img: `${Lab6}` },
            ].map((service, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <img src={service.img} alt={service.title} className="w-full h-[200px] object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm">
                    Accurate and timely results delivered by our expert technicians and advanced equipment.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};


export default LabServices;
