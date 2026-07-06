const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  title:    { type: String, default: '' },
  bio:      { type: String, default: '' },
  about:    { type: String, default: '' },
  location: { type: String, default: '' },
  phone:    { type: String, default: '' },
  website:  { type: String, default: '' },
  github:   { type: String, default: '' },
  linkedin: { type: String, default: '' },
  twitter:  { type: String, default: '' },
  avatar:   { type: String, default: '' },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
