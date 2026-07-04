require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/areas', require('./routes/areaRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/zakat', require('./routes/zakatRoutes'));
app.use('/api/fitra', require('./routes/fitraRoutes'));
app.use('/api/atiya', require('./routes/atiyaRoutes'));

app.get('/', (_, res) => res.json({ ok: true, name: 'Kutiyana Malik Anjuman API' }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

async function ensureDefaultAdmin() {
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      const defaultPassword = 'profit786@$%';
      const hashed = await bcrypt.hash(defaultPassword, 10);
      await prisma.admin.create({
        data: {
          username: 'admin',
          password: hashed
        }
      });
      console.log('Default admin user (admin / profit786@$%) created successfully!');
    }
  } catch (err) {
    console.error('Error ensuring default admin user exists:', err);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`API running on http://localhost:${PORT}`);
  await ensureDefaultAdmin();
});
