// Local development entry point (not used on Vercel — see api/index.js there).
const { app, connectDB } = require('./app');

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch(err => { console.error('MongoDB error:', err.message); process.exit(1); });
