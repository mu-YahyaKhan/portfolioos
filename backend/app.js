const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cache the DB connection across serverless invocations (Vercel reuses warm
// function instances, so we don't want to open a new connection on every request).
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolioos_db';
  await mongoose.connect(uri);
  isConnected = true;
  console.log('Connected to MongoDB');
}

// Make sure a DB connection exists before any route handler runs (there's no
// long-running startup step in the serverless environment).
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB error:', err.message);
    res.status(500).json({ message: 'Database connection error' });
  }
});

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/portfolio',  require('./routes/portfolio'));
app.use('/api/skills',     require('./routes/skills'));
app.use('/api/projects',   require('./routes/projects'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/activities',    require('./routes/activities'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard',     require('./routes/dashboard'));
app.use('/api/public',        require('./routes/public'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server error' });
});

module.exports = { app, connectDB };
