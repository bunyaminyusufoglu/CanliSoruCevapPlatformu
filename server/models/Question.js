const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Cevap içeriği zorunludur'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Soru başlığı zorunludur'],
    trim: true,
    minlength: [10, 'Başlık en az 10 karakter olmalıdır'],
    maxlength: [200, 'Başlık en fazla 200 karakter olabilir']
  },
  content: {
    type: String,
    required: [true, 'Soru içeriği zorunludur'],
    trim: true,
    minlength: [20, 'İçerik en az 20 karakter olmalıdır']
  },
  category: {
    type: String,
    required: [true, 'Kategori seçimi zorunludur'],
    enum: ['frontend', 'backend', 'database', 'devops', 'mobile']
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  viewCount: {
    type: Number,
    default: 0
  },
  answerCount: {
    type: Number,
    default: 0
  },
  isSolved: {
    type: Boolean,
    default: false
  },
  solvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Metin araması için index
questionSchema.index({ title: 'text', content: 'text' });

// Cevap sayısını güncelle
questionSchema.pre('save', function(next) {
  this.answerCount = this.answers.length;
  next();
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question; 