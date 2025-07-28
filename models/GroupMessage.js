const mongoose = require('mongoose');



const groupMessageSchema = new mongoose.Schema({
  groupId:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },

  user:
  {
    type: String,
    required: true
  },

  message:
  {
    type: String,
    required: true
  },

  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GroupMessage', groupMessageSchema);