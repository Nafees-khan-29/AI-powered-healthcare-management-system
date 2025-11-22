/**
 * Utility to clear cached doctor data from localStorage
 * Run this in browser console if appointments aren't showing for doctors
 */

export const clearDoctorCache = () => {
  try {
    // Get current doctor data
    const currentDoctor = localStorage.getItem('selectedDoctor');
    
    if (currentDoctor) {
      const doctor = JSON.parse(currentDoctor);
      console.log('📋 Current selected doctor:', doctor);
      console.log('📧 Has email?', !!doctor.email);
      console.log('🆔 Has clerkUserId?', !!doctor.clerkUserId);
      
      // Remove the cached doctor
      localStorage.removeItem('selectedDoctor');
      console.log('✅ Cleared selected doctor from localStorage');
      console.log('🔄 Please select a doctor again from the Doctors page');
      
      return true;
    } else {
      console.log('ℹ️ No doctor selected in localStorage');
      return false;
    }
  } catch (error) {
    console.error('❌ Error clearing doctor cache:', error);
    return false;
  }
};

// Make it available globally for easy console access
if (typeof window !== 'undefined') {
  window.clearDoctorCache = clearDoctorCache;
}

// You can also call this function directly
export default clearDoctorCache;
