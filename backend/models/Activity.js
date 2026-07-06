const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:    {
    type: String, required: true,
    enum: [
      'project_created', 'project_updated', 'project_deleted', 'project_image_updated',
      'skill_created', 'skill_updated', 'skill_deleted',
      'category_created', 'category_updated', 'category_deleted',
      'profile_updated', 'avatar_updated',
    ],
  },
  message: { type: String, required: true },
  isRead:  { type: Boolean, default: false },
}, { timestamps: true });

ActivitySchema.statics.log = function (user, type, message) {
  return this.create({ user, type, message }).catch(() => {});
};

module.exports = mongoose.model('Activity', ActivitySchema);
