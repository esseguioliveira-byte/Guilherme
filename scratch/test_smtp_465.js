import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,
  secure: true, // SSL/TLS
  auth: {
    user: 'noreply@bahiastore.com',
    pass: 'Th&BO0+$3',
  },
  debug: true,
  logger: true,
  tls: {
    rejectUnauthorized: false,
    servername: 'smtp.hostinger.com'
  }
});

async function test() {
  try {
    console.log('Verifying connection (Port 465 SSL)...');
    await transporter.verify();
    console.log('Verification successful!');
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
