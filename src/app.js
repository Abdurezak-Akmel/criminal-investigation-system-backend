require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

const app = express();

// Test database connection
db.query('SELECT NOW()')
  .then(() => console.log('✅ Database connected successfully'))
  .catch(err => console.error('❌ Database connection error:', err));

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
