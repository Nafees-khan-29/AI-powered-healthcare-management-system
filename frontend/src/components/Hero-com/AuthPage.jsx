import React, { useState, useEffect } from "react";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import { syncUserWithBackend } from "../../services/roleService";
import "./Auth.css";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { isSignedIn, user } = useUser();

  // Sync user with backend to store role in localStorage (no redirect)
  useEffect(() => {
    const handleUserSync = async () => {
      if (isSignedIn && user) {
        console.log('👤 User signed in:', user.primaryEmailAddress?.emailAddress);
        try {
          // Sync Clerk user with backend to get and store role
          console.log('🔄 Syncing user data...');
          const userData = await syncUserWithBackend(user);
          console.log('✅ User data synced:', userData);
          // Role is now stored in localStorage, dashboard button will work
        } catch (error) {
          console.error('❌ Error syncing user:', error);
        }
      }
    };

    handleUserSync();
  }, [isSignedIn, user]);

  return (
    <div className="auth-page-wrapper">
      <div className="mobile-auth-toggle" aria-label="Switch authentication view">
        <button
          type="button"
          className={`mobile-auth-toggle-btn ${!isSignUp ? 'active' : ''}`}
          onClick={() => setIsSignUp(false)}
          aria-pressed={!isSignUp}
        >
          Sign In
        </button>
        <button
          type="button"
          className={`mobile-auth-toggle-btn ${isSignUp ? 'active' : ''}`}
          onClick={() => setIsSignUp(true)}
          aria-pressed={isSignUp}
        >
          Sign Up
        </button>
      </div>
      <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`}>
        {/* Sign Up Form */}
        <div className="form-container sign-up-container">
          <div className="form-content">
            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none bg-transparent border-none w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: 
                    "border-2 border-blue-100 bg-white/80 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-300 text-sm",
                  socialButtonsBlockButtonText: "font-medium text-blue-900 text-sm",
                  formButtonPrimary: 
                    "bg-blue-700 hover:bg-blue-900 normal-case text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30",
                  formFieldInput: 
                    "border border-gray-300 focus:border-blue-500 rounded-md px-3 py-2 text-sm",
                  formFieldLabel: "text-gray-700 font-medium text-xs",
                  footerActionLink: "text-blue-600 hover:text-blue-700 font-medium text-xs",
                  identityPreviewText: "text-gray-700 text-xs",
                  formResendCodeLink: "text-blue-600 hover:text-blue-700 text-xs",
                  dividerLine: "bg-gray-300",
                  dividerText: "text-gray-500 text-xs",
                  footer: "hidden",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                }
              }}
              routing="hash"
              signInUrl="/login"
            />
          </div>
        </div>

        {/* Sign In Form */}
        <div className="form-container sign-in-container">
          <div className="form-content">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none bg-transparent border-none w-full",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: 
                    "border-2 border-blue-100 bg-white/80 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-300 text-sm",
                  socialButtonsBlockButtonText: "font-medium text-blue-900 text-sm",
                  formButtonPrimary: 
                    "bg-blue-700 hover:bg-blue-900 normal-case text-white font-semibold rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/30",
                  formFieldInput: 
                    "border border-gray-300 focus:border-blue-500 rounded-md px-3 py-2 text-sm",
                  formFieldLabel: "text-gray-700 font-medium text-xs",
                  footerActionLink: "text-blue-600 hover:text-blue-700 font-medium text-xs",
                  identityPreviewText: "text-gray-700 text-xs",
                  formResendCodeLink: "text-blue-600 hover:text-blue-700 text-xs",
                  dividerLine: "bg-gray-300",
                  dividerText: "text-gray-500 text-xs",
                  footer: "hidden",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  socialButtonsVariant: "blockButton",
                }
              }}
              routing="hash"
              signUpUrl="/login"
            />
          </div>
        </div>

        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="overlay-title">Welcome Back!</h1>
              <p className="overlay-text">
                To keep connected with us please login with your personal info
              </p>
              <button
                className="overlay-button"
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="overlay-title">Hello, Friend!</h1>
              <p className="overlay-text">
                Enter your personal details and start journey with us
              </p>
              <button
                className="overlay-button"
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
