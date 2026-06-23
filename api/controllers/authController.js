const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../prisma');
const nodemailer = require('nodemailer');

const sendLoginNotification = async (ip, userAgent, loginTime) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("SMTP configuration (SMTP_HOST, SMTP_USER, SMTP_PASS) is missing. Skipping login notification email.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: smtpPort == 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const mailOptions = {
    from: `"Fees Portal Alert" <${smtpUser}>`,
    to: 'anasdev1020@gmail.com',
    subject: 'Security Alert: New Login Detected',
    text: `A new login was detected on the Fees Portal.\n\nDetails:\n- Time: ${loginTime}\n- IP Address: ${ip}\n- Device/Browser: ${userAgent}\n\nIf this wasn't you, please secure your account immediately.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #e53e3e; margin-top: 0;">Security Alert: New Login</h2>
        <p>A new login was detected on the Fees Portal admin account.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 150px;">Time:</td>
            <td style="padding: 8px 0;">${loginTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">IP Address:</td>
            <td style="padding: 8px 0;"><code>${ip}</code></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Device:</td>
            <td style="padding: 8px 0;">${userAgent}</td>
          </tr>
        </table>
        <p style="font-size: 0.9em; color: #666; border-top: 1px solid #eee; padding-top: 15px;">If this was not you, please change your password or contact database administration immediately.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Login notification email sent to anasdev1020@gmail.com");
  } catch (error) {
    console.error("Failed to send login notification email:", error);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, admin.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  
  // Track IP, device, and time
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown IP';
  const userAgent = req.headers['user-agent'] || 'Unknown Device';
  const loginTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }) + ' (PKT)';

  // Send the notification email asynchronously (do not block client response)
  sendLoginNotification(ip, userAgent, loginTime);

  const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
  res.json({ token, username: admin.username });
};

exports.tempReset = async (req, res) => {
  try {
    const hashed = await bcrypt.hash('profit786@$%', 10);
    await prisma.admin.upsert({
      where: { username: 'admin' },
      update: { password: hashed },
      create: { username: 'admin', password: hashed }
    });
    res.send('<h1>Admin password has been reset/created successfully to: profit786@$%</h1>');
  } catch (err) {
    res.status(500).send('Error resetting password: ' + err.message);
  }
};
