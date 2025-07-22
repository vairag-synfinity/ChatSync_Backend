const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  receiverId: {
    type: String,
    default: null
  },
  receiver: {
    type: String,
    default: null
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  createdAtDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);