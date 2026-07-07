// Vercel serverless entry point. Vercel's Node builder treats a module that
// exports an (req, res) handler as a function — an Express app already is one.
const { app } = require('../app');

module.exports = app;
