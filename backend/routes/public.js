const express  = require('express');
const router   = express.Router();
const User     = require('../models/User');
const Project  = require('../models/Project');
const Skill    = require('../models/Skill');
const Category = require('../models/Category');

// GET /api/public/:userId — sanitized public-facing portfolio data (no auth)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'Portfolio not found' });

    const [projects, skills, categories] = await Promise.all([
      Project.find({ user: user._id }).sort({ featured: -1, createdAt: -1 }),
      Skill.find({ user: user._id }).sort({ category: 1, name: 1 }),
      Category.find({ user: user._id }).sort({ name: 1 }),
    ]);

    res.json({
      profile: {
        name: user.name, title: user.title, bio: user.bio, about: user.about,
        location: user.location, website: user.website, github: user.github,
        linkedin: user.linkedin, twitter: user.twitter, avatar: user.avatar,
        email: user.email, phone: user.phone,
      },
      projects, skills, categories,
    });
  } catch (err) { res.status(500).json({ message: 'Portfolio not found' }); }
});

module.exports = router;
