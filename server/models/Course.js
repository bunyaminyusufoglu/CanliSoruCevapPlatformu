const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: [true, 'Puan zorunludur'],
    min: [1, 'Puan en az 1 olmalıdır'],
    max: [5, 'Puan en fazla 5 olabilir']
  },
  comment: {
    type: String,
    required: [true, 'Yorum zorunludur'],
    trim: true,
    minlength: [10, 'Yorum en az 10 karakter olmalıdır'],
    maxlength: [500, 'Yorum en fazla 500 karakter olabilir']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Kurs başlığı zorunludur'],
    trim: true,
    minlength: [10, 'Başlık en az 10 karakter olmalıdır'],
    maxlength: [200, 'Başlık en fazla 200 karakter olabilir']
  },
  description: {
    type: String,
    required: [true, 'Kurs açıklaması zorunludur'],
    trim: true,
    minlength: [50, 'Açıklama en az 50 karakter olmalıdır']
  },
  category: {
    type: String,
    required: [true, 'Kategori seçimi zorunludur'],
    enum: ['frontend', 'backend', 'database', 'devops', 'mobile']
  },
  price: {
    type: Number,
    required: [true, 'Fiyat zorunludur'],
    min: [0, 'Fiyat 0\'dan küçük olamaz']
  },
  duration: {
    type: Number,
    required: [true, 'Süre zorunludur'],
    min: [1, 'Süre en az 1 saat olmalıdır']
  },
  level: {
    type: String,
    required: [true, 'Seviye seçimi zorunludur'],
    enum: ['beginner', 'intermediate', 'advanced']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reviews: [reviewSchema],
  enrollmentCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Metin araması için index
courseSchema.index({ title: 'text', description: 'text' });

// Öğrenci sayısını güncelle
courseSchema.pre('save', function(next) {
  this.enrollmentCount = this.students.length;
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course; 