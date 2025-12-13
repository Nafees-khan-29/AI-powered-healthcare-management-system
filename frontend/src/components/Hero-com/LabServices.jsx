import React from 'react';
import { FaMicroscope } from 'react-icons/fa';
import Lab1 from '../../assets/assets_frontend/Lab1.jpg';
import Lab2 from '../../assets/assets_frontend/Lab2.jpg';
import Lab4 from '../../assets/assets_frontend/Lab4.jpg';
// import Lab5 from '../../assets/assets_frontend/Lab5.jpg';
import Lab6 from '../../assets/assets_frontend/Lab6.jpg';
import Lab7 from '../../assets/assets_frontend/Lab7.jpg';
import Navbar from './Navbar';



const LabServices = () => {
  return (
    
    <div className="text-gray-800">
      {/* Hero Section */}
  <section className="relative min-h-[90vh] w-full overflow-hidden bg-slate-950 mt-20">
        <img
          src={Lab7}
          alt="Advanced Laboratory"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-blue-900/40" />
  <div className="relative z-10 w-full max-w-[1320px] mx-auto px-5 sm:px-6 pt-28 pb-18 flex flex-col gap-8">
          <div className="space-y-6 text-white max-w-4xl">
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/10 border border-white/20 text-sm tracking-widest uppercase">
              <FaMicroscope className="text-blue-200" /> Precision Lab Care
            </span>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight drop-shadow-[0_8px_25px_rgba(0,0,0,0.45)]">
              Committed to Quality Laboratory Products
            </h1>
            <p className="text-lg text-blue-100/95 drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)]">
              Precision diagnostics backed by cutting-edge automation and experienced pathologists delivering clear, reliable insights.
            </p>
            <div className="flex flex-wrap gap-4 text-lg font-medium">
              <span className="bg-white/20 px-5 py-2 rounded-xl border border-white/30">
                80+ Pathology Labs
              </span>
              <span className="bg-white/20 px-5 py-2 rounded-xl border border-white/30">
                150+ Collection Centers
              </span>
            </div>
          </div>

          <div className="text-white space-y-4">
            <p className="text-base text-blue-100/90 max-w-3xl">
              Our nationwide network ensures faster sample pickups, AI-assisted reporting, and seamless doctor collaboration for every patient.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-blue-300 pt-3">Accuracy</p>
                <p className="text-3xl font-bold">99.8%</p>
              </div>
              <div className="h-12 w-px bg-white/30 hidden sm:block self-end" />
              <p className="text-sm text-blue-100 max-w-xs pt-3">
                ISO-certified labs with AI-assisted validation for every report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 bg-white px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          {/* Image */}
          <div className="md:w-1/2 w-full">
            <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-white shadow-2xl">
              <img
                src={Lab1}
                alt="Lab Expert"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
          </div>

          {/* Text */}
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900">Experiment with the best lab products and service</h2>
            <p className="text-gray-700">
              Our labs are equipped with the latest technologies and our experts ensure accurate and timely diagnostic services.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-blue-900 font-medium">
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold">01. Highly Advanced Laboratory</h3>
                <p className="text-sm mt-2 text-gray-700">12° Temperature Controlled, fully automated testing setups.</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold">02. Comprehensive Test Menu</h3>
                <p className="text-sm mt-2 text-gray-700">Covering all critical areas from routine to complex diagnostics.</p>
              </div>
            </div>

            {/* <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
              Read More
            </button> */}
          </div>
        </div>
      </section>

      {/* Diagnostic Service Cards */}
      <section className="py-16 bg-blue-50 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10 text-blue-900">Reliable Diagnostic Services</h2>
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
                  <p className="text-gray-700 text-sm">
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
