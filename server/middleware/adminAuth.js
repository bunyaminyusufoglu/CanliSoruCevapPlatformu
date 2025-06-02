const { auth } = require('./auth');

const adminAuth = async (req, res, next) => {
  try {
    // Önce normal auth middleware'ini çalıştır
    await auth(req, res, () => {
      // Kullanıcının admin olup olmadığını kontrol et
      if (req.user && req.user.userType === 'admin') {
        next();
      } else {
        res.status(403).json({ message: 'Bu işlem için admin yetkisi gerekiyor' });
      }
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({ message: 'Yetkilendirme başarısız' });
  }
};

module.exports = adminAuth; 