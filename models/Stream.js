const mongoose = require('mongoose');

const streamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Yayın başlığı zorunludur'],
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Yayıncı bilgisi zorunludur']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: [true, 'Yorum içeriği zorunludur']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Stream', streamSchema); 