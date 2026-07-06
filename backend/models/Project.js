const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:           { type: String, required: true, trim: true },
  description:     { type: String, required: true },
  longDescription: { type: String, default: '' },
  techStack:       [{ type: String }],
  category:        { type: String, default: 'Uncategorized', trim: true },
  status:          { type: String, enum: ['Completed','In Progress','On Hold'], default: 'Completed' },
  liveUrl:         { type: String, default: '' },
  githubUrl:       { type: String, default: '' },
  imageUrl:        { type: String, default: '' },
  featured:        { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
