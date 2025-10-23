const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : authHeader;
    if (!token) {
      return res.status(401).json({ error: 'Lütfen giriş yapın.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz oturum.' });
    }
    req.user = user; // full user document with _id, username, isAdmin, etc.
    next();
  } catch (err) {
    res.status(401).json({ error: 'Lütfen giriş yapın.' });
  }
};