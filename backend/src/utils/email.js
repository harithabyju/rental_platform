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

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail(mailOptions);
            console.log(`[EMAIL] SENT to ${to}: ${subject}`);
            console.log(`[EMAIL] CONTENT: ${text}`);
        } else {
            console.log('--- EMAIL MOCK (Credentials Missing) ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${text}`);
            console.log('-----------------------------------------');
            console.log('TIP: Add EMAIL_USER and EMAIL_PASS to your .env to send real emails.');
        }
    } catch (error) {
        console.error('[EMAIL] ERROR:', error.message);
    }
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { sendEmail, generateOTP };
