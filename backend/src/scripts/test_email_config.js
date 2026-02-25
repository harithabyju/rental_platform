require('dotenv').config();
const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log('--- EMAIL CONFIG CHECK ---');
console.log(`EMAIL_USER: ${emailUser}`);

if (!emailUser || emailUser.includes('your-email')) {
    console.log('❌ ERROR: EMAIL_USER is still a placeholder or empty.');
} else {
    console.log('✅ EMAIL_USER looks valid.');
}

if (!emailPass || emailPass.includes('your-app-password')) {
    console.log('❌ ERROR: EMAIL_PASS is still a placeholder or empty.');
} else {
    console.log('✅ EMAIL_PASS looks valid.');
}

if (emailUser && emailPass && !emailUser.includes('your-email') && !emailPass.includes('your-app-password')) {
    console.log('\n--- TESTING CONNECTION ---');
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: emailUser, pass: emailPass }
    });

    transporter.verify((error, success) => {
        if (error) {
            console.log('❌ CONNECTION FAILED:', error.message);
            console.log('\nTIP: Make sure you are using an "App Password", not your regular password.');
        } else {
            console.log('✅ SERVER IS READY TO TAKE OUR MESSAGES!');
        }
    });
} else {
    console.log('\n⚠️ Skipping connection test because credentials are not set correctly.');
}
