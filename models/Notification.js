const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Kullanıcı bilgisi zorunludur']
  },
  type: {
    type: String,
    enum: ['course', 'message', 'stream', 'system'],
    required: [true, 'Bildirim tipi zorunludur']
  },
  title: {
    type: String,
    required: [true, 'Bildirim başlığı zorunludur']
  },
  content: {
    type: String,
    required: [true, 'Bildirim içeriği zorunludur']
  },
  link: {
    type: String,
    // Bildirime tıklandığında yönlendirilecek sayfa
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    // Bildirim tipine göre ek bilgiler (örn: ders ID'si, mesaj ID'si)
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Bildirimleri getirirken sıralama için index
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema); 