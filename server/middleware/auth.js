const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token oluşturma yardımcı fonksiyonu
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      userId: user._id,
      email: user.email,
      userType: user.userType
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Refresh token middleware
const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Refresh token bulunamadı' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz refresh token' });
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

    // Kullanıcı bilgilerini request nesnesine ekle
    req.user = {
      userId: user._id,
      email: user.email,
      userType: user.userType
    };

    next();
  } catch (error) {
    console.error('Refresh token middleware error:', error);
    return res.status(401).json({ message: 'Yetkilendirme başarısız: Geçersiz token' });
  }
};

// Ana auth middleware
const auth = async (req, res, next) => {
  try {
    // Authorization header'ını kontrol et
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return refreshTokenMiddleware(req, res, next);
    }

    // Access token'ı al ve doğrula
    const accessToken = authHeader.split(' ')[1];
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // Kullanıcıyı bul
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Yetkilendirme başarısız: Kullanıcı bulunamadı' });
    }

    // Kullanıcı bilgilerini request nesnesine ekle
    req.user = {
      userId: user._id,
      email: user.email,
      userType: user.userType
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return refreshTokenMiddleware(req, res, next);
    }
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Yetkilendirme başarısız' });
  }
};

module.exports = { auth, generateTokens }; 