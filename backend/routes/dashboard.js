const express  = require('express');
const router   = express.Router();
const Project  = require('../models/Project');
const Skill    = require('../models/Skill');
const Category = require('../models/Category');
const Activity = require('../models/Activity');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalProjects, totalSkills, totalCategories, featuredProjects, byStatus, recentActivities, user] =
      await Promise.all([
        Project.countDocuments({ user: userId }),
        Skill.countDocuments({ user: userId }),
        Category.countDocuments({ user: userId }),
        Project.countDocuments({ user: userId, featured: true }),
        Project.aggregate([{ $match: { user: userId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
        Activity.find({ user: userId }).sort({ createdAt: -1 }).limit(8),
        User.findById(userId),
      ]);

    // Profile completion score
    const profileFields = ['name', 'title', 'bio', 'about', 'location', 'phone', 'website', 'github', 'linkedin', 'avatar'];
    const filled = profileFields.filter(f => user[f] && String(user[f]).trim().length > 0).length;
    const profileCompletion = Math.round((filled / profileFields.length) * 100);

    const recentProjects = await Project.find({ user: userId }).sort({ updatedAt: -1 }).limit(5);

    res.json({
      totalProjects,
      totalSkills,
      totalCategories,
      featuredProjects,
      byStatus,
      recentActivities,
      recentProjects,
      userStats: {
        memberSince: user.createdAt,
        lastUpdated: user.updatedAt,
        profileCompletion,
      },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
