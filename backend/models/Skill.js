const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:     { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['Frontend','Backend','Database','DevOps','Mobile','Design','Other'], default: 'Other' },
  level:    { type: Number, min: 1, max: 100, default: 50 },
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);
