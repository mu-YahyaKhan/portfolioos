const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
router.post('/register',
  [ body('name').notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 }) ],
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ message: errs.array()[0].msg });
    try {
      const { name, email, password } = req.body;
      if (await User.findOne({ email })) return res.status(400).json({ message: 'Email already registered' });
      const user  = await User.create({ name, email, password });
      const token = sign(user._id);
      const userObj = user.toObject();
      delete userObj.password;
      res.status(201).json({ token, user: userObj });
    } catch (err) { res.status(500).json({ message: err.message }); }
  }
);

// POST /api/auth/login
router.post('/login',
  [ body('email').isEmail(), body('password').notEmpty() ],
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ message: errs.array()[0].msg });
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.comparePassword(password)))
        return res.status(401).json({ message: 'Invalid email or password' });
      const token = sign(user._id);
      const userObj = user.toObject();
      delete userObj.password;
      res.json({ token, user: userObj });
    } catch (err) { res.status(500).json({ message: err.message }); }
  }
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ user: req.user }));

// PUT /api/auth/change-password
router.put('/change-password',
  protect,
  [ body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 6 }) ],
  async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ message: errs.array()[0].msg });
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select('+password');
      if (!(await user.comparePassword(currentPassword)))
        return res.status(401).json({ message: 'Current password is incorrect' });
      if (currentPassword === newPassword)
        return res.status(400).json({ message: 'New password must be different from the current password' });
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password changed successfully' });
    } catch (err) { res.status(500).json({ message: err.message }); }
  }
);

module.exports = router;
