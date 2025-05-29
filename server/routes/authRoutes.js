const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');

router.post('/register', async (req, res) => {
  const { ad, soyad, username, email, password, userType } = req.body;
  try { 
    // Email veya kullanıcı adı kontrolü
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email veya kullanıcı adı zaten kullanılıyor.' });
    }
    const user = new User({ ad, soyad, username, email, password, userType });
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({ token, user: userObj });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ error: 'Kullanıcı oluşturulamadı.' });
  }
});

// Tüm kullanıcıları getir (hassas bilgiler hariç)
router.get('/all', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpires') // Hassas bilgileri hariç tut
      .sort({ createdAt: -1 }); // En yeni kullanıcılar önce

    // Kullanıcı bilgilerini düzenle
    const formattedUsers = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      ad: user.ad,
      soyad: user.soyad,
      userType: user.userType,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      // İstatistikler
      questionCount: user.questionCount || 0,
      answerCount: user.answerCount || 0,
      points: user.points || 0,
      // Profil bilgileri
      profileImage: user.profileImage,
      bio: user.bio,
      // Eğitmen bilgileri
      expertise: user.expertise || [],
      rating: user.rating || 0,
      // Öğrenci bilgileri
      enrolledCourses: user.enrolledCourses || [],
      completedCourses: user.completedCourses || []
    }));

    res.json(formattedUsers);
  } catch (err) {
    console.error('Users fetch error:', err);
    res.status(500).json({ error: 'Kullanıcılar yüklenirken bir hata oluştu.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Geçersiz şifre.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

router.get('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcı bulunamadı.' });
  }
});

router.put('/user/:id', async (req, res) => {
  const { id } = req.params;
  const { ad, soyad, username, email, password } = req.body;
  try {
    const user = await User.findByIdAndUpdate(id, { ad, soyad, username, email, password }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcı güncellenemedi.' });
  }
});

router.delete('/user/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    res.json({ message: 'Kullanıcı silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcı silinemedi.' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

router.put('/profile', auth, async (req, res) => {
  try {
    const { ad, soyad, username, bio, unvan, avatar } = req.body;
    
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor.' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        ad, 
        soyad, 
        username, 
        bio, 
        unvan, 
        avatar,
        lastSeen: new Date()
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Profil güncellenemedi.' });
  }
});

router.put('/profile/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Mevcut şifre yanlış.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Şifre başarıyla güncellendi.' });
  } catch (err) {
    res.status(500).json({ error: 'Şifre güncellenemedi.' });
  }
});

// Mevcut kullanıcı bilgilerini getir
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Sunucu hatası.' });
  }
});

module.exports = router;
