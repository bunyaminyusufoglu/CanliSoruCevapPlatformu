const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Kullanıcı profilini getir
router.get('/profile/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('badges.awardedBy', 'username');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Soru sayısını artır
router.post('/increment-question/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    user.questionCount += 1;
    await user.updatePoints();
    
    res.json({ success: true, points: user.points });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Cevap sayısını artır
router.post('/increment-answer/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    user.answerCount += 1;
    await user.updatePoints();
    
    res.json({ success: true, points: user.points });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Faydalı cevap sayısını artır
router.post('/increment-helpful/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    user.helpfulAnswerCount += 1;
    await user.updatePoints();
    
    res.json({ success: true, points: user.points });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Rozet ekle (sadece admin)
router.post('/add-badge/:id', [auth, admin], async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    await user.addBadge({ name, description, icon }, req.user._id);
    
    res.json({ 
      success: true, 
      message: 'Rozet başarıyla eklendi',
      badges: user.badges 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

// Kullanıcının rozetlerini getir
router.get('/badges/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('badges')
      .populate('badges.awardedBy', 'username');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    res.json({ success: true, badges: user.badges });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
});

module.exports = router; 