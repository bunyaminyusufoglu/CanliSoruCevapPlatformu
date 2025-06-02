const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, generateTokens } = require('../middleware/auth');

// Kayıt ol
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Kullanıcı adı veya email kontrolü
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Bu email adresi veya kullanıcı adı zaten kullanılıyor' 
      });
    }

    // Yeni kullanıcı oluştur
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Token oluştur
    const tokens = generateTokens(user);

    // Refresh token'ı cookie'ye kaydet
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün
    });

    // Access token'ı header'a ekle
    res.setHeader('Authorization', `Bearer ${tokens.accessToken}`);

    res.status(201).json({
      message: 'Kayıt başarılı',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Kayıt işlemi başarısız' });
  }
});

// Giriş yap
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }

    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz email veya şifre' });
    }

    // Son giriş zamanını güncelle
    user.lastLogin = new Date();
    await user.save();

    // Token oluştur
    const tokens = generateTokens(user);

    // Refresh token'ı cookie'ye kaydet
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün
    });

    // Access token'ı header'a ekle
    res.setHeader('Authorization', `Bearer ${tokens.accessToken}`);

    res.json({
      message: 'Giriş başarılı',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Giriş işlemi başarısız' });
  }
});

// Token yenile
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token bulunamadı' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Geçersiz refresh token' });
    }

    const tokens = generateTokens(user);

    // Yeni refresh token'ı cookie'ye kaydet
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 gün
    });

    // Yeni access token'ı header'a ekle
    res.setHeader('Authorization', `Bearer ${tokens.accessToken}`);

    res.json({ message: 'Token yenilendi' });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ message: 'Token yenileme başarısız' });
  }
});

// Çıkış yap
router.post('/logout', auth, async (req, res) => {
  try {
    // Refresh token cookie'sini temizle
    res.clearCookie('refreshToken');
    res.json({ message: 'Çıkış başarılı' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Çıkış işlemi başarısız' });
  }
});

// Kullanıcı bilgilerini getir
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Kullanıcı bilgileri alınamadı' });
  }
});

module.exports = router; 