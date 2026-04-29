import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: 'noreply@bahiastore.com',
    pass: 'Th&BO0+$3',
  },
  debug: true,
  logger: true,
  tls: {
    rejectUnauthorized: false
  }
});

async function test() {
  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('Verification successful! Sending test email...');
    
    const info = await transporter.sendMail({
      from: 'Bahia Store <noreply@bahiastore.com>',
      to: 'equipebusinessdz@gmail.com', // user's email from logs
      subject: 'Test Email Direct',
      text: 'This is a test from the scratch script',
    });
    console.log('Sent:', info.messageId);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
