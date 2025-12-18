// Email Configuration Guide
// 
// Brevo SMTP Configuration
// Using Brevo (formerly Sendinblue) for reliable email delivery
//
// Current Configuration: nafeeskhan7627@gmail.com via Brevo SMTP

export const emailConfig = {
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
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
