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

// Wrap multer to return JSON errors instead of generic 500
const handleCourseUpload = (req, res, next) => {
  const fields = upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]);
  fields(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: 'Dosya boyutu 100MB sınırını aşıyor.' });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
    // Custom errors from fileFilter etc.
    return res.status(400).json({ success: false, message: err?.message || 'Dosya yükleme hatası.' });
  });
};

// Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('comments.user', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, courses });
  } catch (error) {
    console.error('Dersler getirilirken hata:', error);
    res.status(500).json({ success: false, message: 'Dersler getirilirken bir hata oluştu' });
  }
});

// Add new course (admin only)
router.post('/', auth, adminAuth, handleCourseUpload, async (req, res) => {
  try {
    const { title, description } = req.body;
    const videoFile = req.files?.video?.[0];
    const pdfFile = req.files?.pdf?.[0];

    const course = new Course({
      title,
      description,
      videoUrl: videoFile ? `/uploads/videos/${videoFile.filename}` : null,
      pdfUrl: pdfFile ? `/uploads/pdfs/${pdfFile.filename}` : null
    });

    await course.save();
    res.json({ success: true, course });
  } catch (error) {
    console.error('Ders eklenirken hata:', error);
    res.status(500).json({ success: false, message: 'Ders eklenirken bir hata oluştu' });
  }
});

// Add comment to course (authenticated users)
router.post('/comment', auth, async (req, res) => {
  try {
    const { courseId, content } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Ders bulunamadı' });
    }

    course.comments.push({
      user: req.user._id,
      content
    });

    await course.save();
    
    const updatedCourse = await Course.findById(courseId)
      .populate('comments.user', 'username');
    
    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    console.error('Yorum eklenirken hata:', error);
    res.status(500).json({ success: false, message: 'Yorum eklenirken bir hata oluştu' });
  }
});

// Delete course (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Ders bulunamadı' });
    }

    // Delete associated files
    if (course.videoUrl) {
      const videoPath = path.join(__dirname, '..', course.videoUrl);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }
    
    if (course.pdfUrl) {
      const pdfPath = path.join(__dirname, '..', course.pdfUrl);
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }

    await course.remove();
    res.json({ success: true, message: 'Ders başarıyla silindi' });
  } catch (error) {
    console.error('Ders silinirken hata:', error);
    res.status(500).json({ success: false, message: 'Ders silinirken bir hata oluştu' });
  }
});

// List all courses (admin)
router.get('/admin/list', auth, adminAuth, async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Dersler getirilemedi' });
  }
});

// Update course basic fields (admin)
router.put('/admin/:id', auth, adminAuth, async (req, res) => {
  try {
    const { title, description } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );
    if (!course) return res.status(404).json({ success: false, message: 'Ders bulunamadı' });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ders güncellenemedi' });
  }
});

// Update course (admin only)
router.put('/:id', auth, adminAuth, handleCourseUpload, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Ders bulunamadı' });
    }

    const { title, description } = req.body;
    const videoFile = req.files?.video?.[0];
    const pdfFile = req.files?.pdf?.[0];

    // Eski dosyaları sil
    if (videoFile && course.videoUrl) {
      const oldVideoPath = path.join(__dirname, '..', course.videoUrl);
      if (fs.existsSync(oldVideoPath)) {
        fs.unlinkSync(oldVideoPath);
      }
    }
    if (pdfFile && course.pdfUrl) {
      const oldPdfPath = path.join(__dirname, '..', course.pdfUrl);
      if (fs.existsSync(oldPdfPath)) {
        fs.unlinkSync(oldPdfPath);
      }
    }

    // Dersi güncelle
    course.title = title;
    course.description = description;
    if (videoFile) {
      course.videoUrl = `/uploads/videos/${videoFile.filename}`;
    }
    if (pdfFile) {
      course.pdfUrl = `/uploads/pdfs/${pdfFile.filename}`;
    }

    await course.save();
    
    const updatedCourse = await Course.findById(course._id)
      .populate('comments.user', 'username');
    
    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    console.error('Ders güncellenirken hata:', error);
    res.status(500).json({ success: false, message: 'Ders güncellenirken bir hata oluştu' });
  }
});

module.exports = router; 