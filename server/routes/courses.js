const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = file.mimetype.startsWith('video/') 
      ? 'uploads/videos' 
      : 'uploads/pdfs';
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only videos and PDFs are allowed.'));
    }
  }
});

// Tüm dersleri getir
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'username ad soyad')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    console.error('Courses fetch error:', err);
    res.status(500).json({ error: 'Dersler yüklenirken bir hata oluştu.' });
  }
});

// Yeni ders oluştur (sadece eğitmenler)
router.post('/', auth, async (req, res) => {
  try {
    // Kullanıcının eğitmen olup olmadığını kontrol et
    if (req.user.userType !== 'teacher') {
      return res.status(403).json({ error: 'Bu işlem için eğitmen yetkisi gerekiyor.' });
    }

    const course = new Course({
      ...req.body,
      instructor: req.user.id
    });

    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error('Course creation error:', err);
    res.status(400).json({ error: 'Ders oluşturulamadı.' });
  }
});

// Ders detaylarını getir
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username ad soyad')
      .populate('enrolledStudents', 'username ad soyad');
    
    if (!course) {
      return res.status(404).json({ error: 'Ders bulunamadı.' });
    }
    
    res.json(course);
  } catch (err) {
    console.error('Course fetch error:', err);
    res.status(500).json({ error: 'Ders yüklenirken bir hata oluştu.' });
  }
});

// Derse katıl
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Ders bulunamadı.' });
    }

    // Kullanıcı zaten derse kayıtlı mı kontrol et
    if (course.enrolledStudents.includes(req.user.id)) {
      return res.status(400).json({ error: 'Bu derse zaten kayıtlısınız.' });
    }

    course.enrolledStudents.push(req.user.id);
    await course.save();

    res.json({ message: 'Derse başarıyla katıldınız.' });
  } catch (err) {
    console.error('Course enrollment error:', err);
    res.status(500).json({ error: 'Derse katılırken bir hata oluştu.' });
  }
});

// Dersi güncelle (sadece eğitmen)
router.put('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Ders bulunamadı.' });
    }

    // Kullanıcının dersin eğitmeni olup olmadığını kontrol et
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Bu dersi güncelleme yetkiniz yok.' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedCourse);
  } catch (err) {
    console.error('Course update error:', err);
    res.status(500).json({ error: 'Ders güncellenirken bir hata oluştu.' });
  }
});

// Dersi sil (sadece eğitmen)
router.delete('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: 'Ders bulunamadı.' });
    }

    // Kullanıcının dersin eğitmeni olup olmadığını kontrol et
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Bu dersi silme yetkiniz yok.' });
    }

    await course.remove();
    res.json({ message: 'Ders başarıyla silindi.' });
  } catch (err) {
    console.error('Course deletion error:', err);
    res.status(500).json({ error: 'Ders silinirken bir hata oluştu.' });
  }
});

module.exports = router; 