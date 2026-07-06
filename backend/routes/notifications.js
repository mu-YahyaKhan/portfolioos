const express  = require('express');
const router   = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

// GET /api/notifications?limit=15 — recent activity formatted as notifications
router.get('/', protect, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 15, 50);
    const [notifications, unreadCount] = await Promise.all([
      Activity.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(limit),
      Activity.countDocuments({ user: req.user._id, isRead: false }),
    ]);
    res.json({ notifications, unreadCount });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/notifications/:id/read — mark one as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const note = await Activity.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id }, { isRead: true }, { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Notification not found' });
    res.json({ notification: note });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', protect, async (req, res) => {
  try {
    await Activity.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
