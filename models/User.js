const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  gmail: {
    type: String,
    required: true,
    unique: true,
    
  },
  password: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  avatar: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

userSchema.index({ username: 'text' });

module.exports = mongoose.model('User', userSchema);
