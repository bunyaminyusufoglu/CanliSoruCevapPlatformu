const express = require('express');
const router = express.Router();
const Stream = require('../models/Stream');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Tüm yayınları getir
router.get('/', async (req, res) => {
  try {
    const streams = await Stream.find({ isActive: true })
      .populate('userId', 'username')
      .sort('-createdAt');
    
    res.json({
      success: true,
      streams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Yayınlar getirilirken bir hata oluştu'
    });
  }
});

// Yeni yayın oluştur (sadece admin)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { title } = req.body;

    const stream = new Stream({
      title,
      userId: req.user._id
    });

    await stream.save();

    res.status(201).json({
      success: true,
      stream: await stream.populate('userId', 'username')
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Yayın oluşturulurken bir hata oluştu'
    });
  }
});

// Yayına yorum ekle
router.post('/comment', auth, async (req, res) => {
  try {
    const { streamId, content } = req.body;

    const stream = await Stream.findById(streamId);
    if (!stream) {
      return res.status(404).json({
        success: false,
        error: 'Yayın bulunamadı'
      });
    }

    stream.comments.push({
      userId: req.user._id,
      username: req.user.username,
      content
    });

    await stream.save();

    res.json({
      success: true,
      comment: stream.comments[stream.comments.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Yorum eklenirken bir hata oluştu'
    });
  }
});

// Yayını sonlandır (sadece admin)
router.put('/:id/end', [auth, admin], async (req, res) => {
  try {
    const stream = await Stream.findById(req.params.id);
    if (!stream) {
      return res.status(404).json({
        success: false,
        error: 'Yayın bulunamadı'
      });
    }

    stream.isActive = false;
    await stream.save();

    res.json({
      success: true,
      message: 'Yayın sonlandırıldı'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Yayın sonlandırılırken bir hata oluştu'
    });
  }
});

module.exports = router; 