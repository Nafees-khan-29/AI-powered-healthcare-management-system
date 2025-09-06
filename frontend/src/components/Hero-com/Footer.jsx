import React from "react";
import { FaPhone, FaFacebookF, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { MdEmail, MdLocationOn } from "react-icons/md";
import doc6 from '../../assets/assets_frontend/doc6.png';
import { useNavigate } from "react-router-dom";


const Footer = () => {
  const navigate = useNavigate(); 
  return (
    <footer className="bg-[#1c347e] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 items-center relative z-10">
        {/* Left Section */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Virtual healthcare for you
            <br />
            Real benefit for your life
          </h2>
          <button onClick={()=>navigate('/appointment')}  className="bg-cyan-500 text-white px-6 py-3 rounded-full font-medium hover:bg-cyan-600 transition">
            Make An Appointment ⭢
          </button>
          <button onClick={()=>navigate('/dashboard')}  className="bg-cyan-500 text-white px-6 py-3 rounded-full font-medium hover:bg-cyan-600 transition">
            user dashboardt ⭢
          </button>
          <div className="flex items-center gap-4 pt-6">
            <FaPhone className="text-cyan-400 text-2xl" />
            <p className="text-lg font-semibold">1-800-200-300</p>
          </div>
          <div className="flex items-center gap-4">
            <MdEmail className="text-cyan-400 text-2xl" />
            <p className="text-lg font-semibold">info@company.com</p>
          </div>
          <div className="flex items-center gap-4">
            <MdLocationOn className="text-cyan-400 text-2xl" />
            <p className="text-lg font-semibold">View All Locations</p>
          </div>
        </div>

        {/* Right Image with clip-path */}
        <div className="hidden md:block absolute top-0 right-0 w-1/2 h-full z-0">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url(${doc6})`,
              clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
            }}
          ></div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-[#1b2e66] py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-6 text-gray-300 text-sm">
          <div>
            <h4 className="text-white font-semibold mb-3">Product</h4>
            <ul className="space-y-1">
              <li>Risk Management</li>
              <li>Financial Planning</li>
              <li>Asset Allocation</li>
              <li>Retirement Planning</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Trust Service</h4>
            <ul className="space-y-1">
              <li>Truct Administration</li>
              <li>Estate Settlement</li>
              <li>Charitable Giving</li>
              <li>Special Needs Trust</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">About Us</h4>
            <ul className="space-y-1">
              <li>Our Story</li>
              <li>Locations</li>
              <li>Our Team</li>
              <li>Careers</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">News</h4>
            <ul className="space-y-1">
              <li>Latest Articles</li>
              <li>Resources</li>
              <li>Videos</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Follow Us</h4>
            <div className="flex gap-4 mt-2 text-white text-xl">
              <FaFacebookF className="hover:text-cyan-400 cursor-pointer" />
              <FaXTwitter className="hover:text-cyan-400 cursor-pointer" />
              <FaLinkedinIn className="hover:text-cyan-400 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
