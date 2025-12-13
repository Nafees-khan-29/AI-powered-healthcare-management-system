import React from "react";
import { FaPhone, FaFacebookF, FaXTwitter, FaLinkedinIn } from "react-icons/fa6";
import { MdEmail, MdLocationOn } from "react-icons/md";
import doc6 from '../../assets/assets_frontend/doc6.png';


const Footer = () => {
  return (
    <footer className="bg-[#1c347e] text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
        {/* Image Section */}
        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="w-full max-w-sm sm:max-w-md lg:max-w-none lg:w-[520px] h-72 sm:h-80 lg:h-[420px]">
            {/* Mobile/Tablet Image */}
            <div className="lg:hidden w-full h-full overflow-hidden rounded-3xl shadow-xl">
              <img
                src={doc6}
                alt="Doctor illustration"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Desktop Image with clip-path */}
            <div
              className="hidden lg:block w-full h-full overflow-hidden"
              style={{
                clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
              }}
            >
              <img
                src={doc6}
                alt="Doctor illustration"
                className="w-full h-full object-contain object-bottom"
              />
            </div>
          </div>
        </div>

        {/* Left Section */}
        <div className="order-1 lg:order-1 space-y-6 text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight lg:pr-40">
            Virtual healthcare for you
            <br />
            Real benefit for your life
          </h2>
          <div className="space-y-4">
            {[{
              icon: <FaPhone className="text-cyan-400 text-2xl" />, label: "1-800-200-300"
            }, {
              icon: <MdEmail className="text-cyan-400 text-2xl" />, label: "info@company.com"
            }, {
              icon: <MdLocationOn className="text-cyan-400 text-2xl" />, label: "View All Locations"
            }].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 justify-center lg:justify-start text-center lg:text-left"
              >
                {item.icon}
                <p className="text-base sm:text-lg font-semibold">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="bg-[#1b2e66] py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 text-gray-300 text-sm text-center sm:text-left">
          {[{
            title: "Product",
            items: ["Risk Management", "Financial Planning", "Asset Allocation", "Retirement Planning"]
          }, {
            title: "Trust Service",
            items: ["Trust Administration", "Estate Settlement", "Charitable Giving", "Special Needs Trust"]
          }, {
            title: "About Us",
            items: ["Our Story", "Locations", "Our Team", "Careers"]
          }, {
            title: "News",
            items: ["Latest Articles", "Resources", "Videos"]
          }].map((section, index) => (
            <div key={section.title + index}>
              <h4 className="text-white font-semibold mb-3 text-base">{section.title}</h4>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col items-center text-center gap-3">
            <h4 className="text-white font-semibold text-base">Follow Us</h4>
            <div className="flex gap-4 mt-2 text-white text-xl justify-center">
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
