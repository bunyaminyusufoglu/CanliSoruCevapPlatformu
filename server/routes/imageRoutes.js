const express = require('express');
const router = express.Router();
const { upload, uploadAvatar, uploadQuestionImage, uploadCourseImage } = require('../middleware/imageUpload');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Question = require('../models/Question');

/**
 * @route   POST /api/images/avatar
 * @desc    Kullanıcı avatar resmi yükle
 * @access  Private
 */
router.post('/avatar', auth, upload.single('avatar'), uploadAvatar, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    // Avatar yolunu güncelle
    user.avatar = req.uploadedImage.url;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar başarıyla yüklendi',
      avatar: req.uploadedImage.url,
      thumbnail: req.uploadedImage.thumbnail?.url
    });
  } catch (error) {
    console.error('Avatar kaydetme hatası:', error);
    res.status(500).json({ success: false, message: 'Avatar kaydedilirken hata oluştu' });
  }
});

/**
 * @route   POST /api/images/question
 * @desc    Soru resmi yükle
 * @access  Private
 */
router.post('/question', auth, upload.single('image'), uploadQuestionImage, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Resim başarıyla yüklendi',
      image: req.uploadedImage.url,
      thumbnail: req.uploadedImage.thumbnail?.url
    });
  } catch (error) {
    console.error('Soru resmi yükleme hatası:', error);
    res.status(500).json({ success: false, message: 'Resim yüklenirken hata oluştu' });
  }
});

/**
 * @route   POST /api/images/course
 * @desc    Ders resmi yükle
 * @access  Private (Admin)
 */
router.post('/course', auth, upload.single('image'), uploadCourseImage, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Yetkiniz yok' });
    }

    res.json({
      success: true,
      message: 'Resim başarıyla yüklendi',
      image: req.uploadedImage.url,
      thumbnail: req.uploadedImage.thumbnail?.url
    });
  } catch (error) {
    console.error('Ders resmi yükleme hatası:', error);
    res.status(500).json({ success: false, message: 'Resim yüklenirken hata oluştu' });
  }
});

/**
 * @route   POST /api/images/upload
 * @desc    Genel resim yükleme (soru/cevap içeriğinde kullanılmak üzere)
 * @access  Private
 */
router.post('/upload', auth, upload.single('image'), uploadQuestionImage, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Resim başarıyla yüklendi',
      url: req.uploadedImage.url,
      thumbnail: req.uploadedImage.thumbnail?.url
    });
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    res.status(500).json({ success: false, message: 'Resim yüklenirken hata oluştu' });
  }
});

module.exports = router;

