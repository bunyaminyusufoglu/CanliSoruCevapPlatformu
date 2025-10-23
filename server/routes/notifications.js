const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// Bildirimleri getir
router.get('/', auth, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };
    if (type && ['course', 'message', 'stream', 'system'].includes(type)) {
      query.type = type;
    }
    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });
    res.json({ success: true, notifications, total, unreadCount, currentPage: page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Bildirimler getirilirken bir hata oluştu' });
  }
});

// Bildirimi okundu işaretle
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Bildirim bulunamadı' });
    }
    notification.isRead = true;
    await notification.save();
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Bildirim güncellenirken bir hata oluştu' });
  }
});

// Tüm bildirimleri okundu yap
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Bildirimler güncellenirken bir hata oluştu' });
  }
});

// Bildirim sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!notification) {
      return res.status(404).json({ success: false, error: 'Bildirim bulunamadı' });
    }
    res.json({ success: true, message: 'Bildirim silindi' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Bildirim silinirken bir hata oluştu' });
  }
});

module.exports = router;


