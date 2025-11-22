// Email Configuration Guide
// 
// For Gmail:
// 1. Go to your Google Account settings
// 2. Enable 2-Step Verification
// 3. Generate an App Password:
//    - Go to https://myaccount.google.com/apppasswords
//    - Select 'Mail' and your device
//    - Copy the generated 16-character password
// 4. Add to your .env file:
//    EMAIL_USER=your-email@gmail.com
//    EMAIL_PASSWORD=your-16-char-app-password
//
// For other email providers, check their SMTP settings

export const emailConfig = {
    service: 'gmail', // or 'outlook', 'yahoo', etc.
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
};

// Test email configuration
export const testEmailConfig = async (transporter) => {
    try {
        await transporter.verify();
        console.log('✅ Email server is ready to send messages');
        return true;
    } catch (error) {
        console.error('❌ Email configuration error:', error.message);
        console.log('\n📧 To fix this:');
        console.log('1. Add EMAIL_USER and EMAIL_PASSWORD to your .env file');
        console.log('2. For Gmail, generate an App Password (not your regular password)');
        console.log('3. Visit: https://myaccount.google.com/apppasswords');
        return false;
    }
};
