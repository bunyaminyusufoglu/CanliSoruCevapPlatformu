const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user has admin role
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmamaktadır.' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Lütfen giriş yapın.' });
  }
}; 