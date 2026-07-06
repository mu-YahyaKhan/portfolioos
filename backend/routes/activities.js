const express  = require('express');
const router   = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

// GET /api/activities?limit=10
router.get('/', protect, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const activities = await Activity.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(limit);
    res.json({ activities });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
