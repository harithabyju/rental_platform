const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // or configured value
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text
        };

        // Log OTP to console for development
        console.log('--- EMAIL SENT (MOCK) ---');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${text}`);
        console.log('-------------------------');

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${to}`);
        } else {
            console.log('Email credentials not found in .env, skipping actual email send.');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw to avoid breaking the flow, just log
    }
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { sendEmail, generateOTP };
