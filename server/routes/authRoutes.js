const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { ad, soyad, username, email, password } = req.body;
  try { 
    const user = new User({ ad, soyad, username, email, password });
    await user.save();
    res.status(201).json({ message: 'Kayıt başarılı!' });
  } catch (err) {
    res.status(400).json({ error: 'Kullanıcı oluşturulamadı.' });
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
    res.json({ token, username: user.username });
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



module.exports = router;
