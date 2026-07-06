const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

const PORT = process.env.PORT || 5000;
const URI  = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolioos_db';

mongoose.connect(URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error('MongoDB error:', err.message); process.exit(1); });
