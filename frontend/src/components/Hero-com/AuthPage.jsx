import React, { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import "./Auth.css"; // Create this file for animations

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    // Add pt-20 for navbar space and relative positioning
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 pt-20 relative">
      <div className={`container ${isSignUp ? 'right-panel-active' : ''} relative z-10`}>
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <form className="bg-white flex flex-col items-center justify-center p-8 h-full">
            <h2 className="text-2xl font-semibold mb-6">Create Account</h2>
            <button className="flex items-center justify-center w-full gap-2 border border-gray-300 rounded-md py-2 text-gray-700 hover:bg-gray-50 transition mb-4">
              <FcGoogle className="text-xl" />
              Continue with Google
            </button>
            <div className="relative w-full my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition">
              Sign Up
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <form className="bg-white flex flex-col items-center justify-center p-8 h-full">
            <h2 className="text-2xl font-semibold mb-6">Sign In</h2>
            <button className="flex items-center justify-center w-full gap-2 border border-gray-300 rounded-md py-2 text-gray-700 hover:bg-gray-50 transition mb-4">
              <FcGoogle className="text-xl" />
              Continue with Google
            </button>
            <div className="relative w-full my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">or</span>
              </div>
            </div>
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition">
              Sign In
            </button>
          </form>
        </div>

        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
              <p className="mb-6">Please login with your personal info</p>
              <button
                className="border-2 border-white text-white px-8 py-2 rounded-md hover:bg-white hover:text-blue-600 transition"
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="text-3xl font-bold mb-4">Hello, Friend!</h1>
              <p className="mb-6">Enter your details and start journey with us</p>
              <button
                className="border-2 border-white text-white px-8 py-2 rounded-md hover:bg-white hover:text-blue-600 transition"
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
