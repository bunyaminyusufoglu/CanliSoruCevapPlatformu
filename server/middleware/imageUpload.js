const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, '../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const questionsDir = path.join(uploadsDir, 'questions');
const coursesDir = path.join(uploadsDir, 'courses');

[uploadsDir, avatarsDir, questionsDir, coursesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer storage configuration
const storage = multer.memoryStorage();

// File filter - sadece resim dosyalarını kabul et
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Sadece resim dosyaları yüklenebilir (JPEG, PNG, GIF, WebP)'), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Resmi optimize et ve kaydet
 * @param {Buffer} buffer - Resim buffer'ı
 * @param {string} filename - Dosya adı
 * @param {string} folder - Klasör adı (avatars, questions, courses)
 * @param {Object} options - Optimizasyon seçenekleri
 * @returns {Promise<Object>} - Kaydedilen dosya bilgileri
 */
const optimizeAndSaveImage = async (buffer, filename, folder, options = {}) => {
  const {
    width = 800,
    height = null,
    quality = 80,
    createThumbnail = false,
    thumbnailSize = 200
  } = options;

  const timestamp = Date.now();
  const ext = 'webp';
  const basename = `${timestamp}-${filename.replace(/\.[^/.]+$/, '')}`;
  const outputFilename = `${basename}.${ext}`;
  const folderPath = path.join(uploadsDir, folder);
  const outputPath = path.join(folderPath, outputFilename);

  // Ana resmi optimize et ve kaydet
  let imageProcessor = sharp(buffer)
    .rotate() // EXIF rotation'ı otomatik uygula
    .webp({ quality });

  if (height) {
    imageProcessor = imageProcessor.resize(width, height, {
      fit: 'cover',
      position: 'center'
    });
  } else {
    imageProcessor = imageProcessor.resize(width, null, {
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  await imageProcessor.toFile(outputPath);

  const result = {
    filename: outputFilename,
    path: `/uploads/${folder}/${outputFilename}`,
    url: `/uploads/${folder}/${outputFilename}`
  };

  // Thumbnail oluştur
  if (createThumbnail) {
    const thumbnailFilename = `${basename}-thumb.${ext}`;
    const thumbnailPath = path.join(folderPath, thumbnailFilename);

    await sharp(buffer)
      .rotate()
      .resize(thumbnailSize, thumbnailSize, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 70 })
      .toFile(thumbnailPath);

    result.thumbnail = {
      filename: thumbnailFilename,
      path: `/uploads/${folder}/${thumbnailFilename}`,
      url: `/uploads/${folder}/${thumbnailFilename}`
    };
  }

  return result;
};

/**
 * Resmi sil
 * @param {string} filePath - Dosya yolu (/uploads/avatars/image.webp)
 */
const deleteImage = async (filePath) => {
  try {
    if (!filePath) return;
    
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log('Resim silindi:', fullPath);
    }

    // Thumbnail varsa onu da sil
    const thumbnailPath = fullPath.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '-thumb.$1');
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
      console.log('Thumbnail silindi:', thumbnailPath);
    }
  } catch (error) {
    console.error('Resim silinirken hata:', error);
  }
};

/**
 * Avatar yükleme middleware
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resim dosyası bulunamadı' });
    }

    // Eski avatar'ı sil
    if (req.user && req.user.avatar) {
      await deleteImage(req.user.avatar);
    }

    const result = await optimizeAndSaveImage(
      req.file.buffer,
      req.file.originalname,
      'avatars',
      {
        width: 400,
        height: 400,
        quality: 85,
        createThumbnail: true,
        thumbnailSize: 100
      }
    );

    req.uploadedImage = result;
    next();
  } catch (error) {
    console.error('Avatar yükleme hatası:', error);
    res.status(500).json({ success: false, message: 'Resim yüklenirken hata oluştu' });
  }
};

/**
 * Soru resmi yükleme middleware
 */
const uploadQuestionImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resim dosyası bulunamadı' });
    }

    const result = await optimizeAndSaveImage(
      req.file.buffer,
      req.file.originalname,
      'questions',
      {
        width: 1200,
        quality: 80,
        createThumbnail: true,
        thumbnailSize: 300
      }
    );

    req.uploadedImage = result;
    next();
  } catch (error) {
    console.error('Soru resmi yükleme hatası:', error);
    res.status(500).json({ success: false, message: 'Resim yüklenirken hata oluştu' });
  }
};

/**
 * Ders resmi yükleme middleware
 */
const uploadCourseImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resim dosyası bulunamadı' });
    }

    const result = await optimizeAndSaveImage(
      req.file.buffer,
      req.file.originalname,
      'courses',
      {
        width: 1200,
        height: 675, // 16:9 aspect ratio
        quality: 80,
        createThumbnail: true,
        thumbnailSize: 300
      }
    );

    req.uploadedImage = result;
    next();
  } catch (error) {
    console.error('Ders resmi yükleme hatası:', error);
    res.status(500).json({ success: false, message: 'Resim yüklenirken hata oluştu' });
  }
};

module.exports = {
  upload,
  uploadAvatar,
  uploadQuestionImage,
  uploadCourseImage,
  optimizeAndSaveImage,
  deleteImage
};

