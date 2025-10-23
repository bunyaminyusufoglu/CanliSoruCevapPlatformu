module.exports = (req, res, next) => {
  try {
    if (!req.user || req.user.isAdmin !== true) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
    }
    next();
  } catch (err) {
    res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
  }
};


