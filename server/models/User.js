const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
  awardedAt: { type: Date, default: Date.now },
  awardedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const userSchema = new mongoose.Schema({
  ad: { type: String, required: true },
  soyad: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { 
    type: String, 
    enum: ['student', 'teacher', 'admin'], 
    default: 'student' 
  },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  unvan: { type: String, default: '' },
  points: { type: Number, default: 0 },
  badges: [badgeSchema],
  questionCount: { type: Number, default: 0 },
  answerCount: { type: Number, default: 0 },
  helpfulAnswerCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false }
});

// Puan hesaplama metodu
userSchema.methods.calculatePoints = function() {
  return (
    this.questionCount * 5 + // Her soru için 5 puan
    this.answerCount * 10 + // Her cevap için 10 puan
    this.helpfulAnswerCount * 20 // Her faydalı cevap için 20 puan
  );
};

// Puanları güncelleme metodu
userSchema.methods.updatePoints = function() {
  this.points = this.calculatePoints();
  return this.save();
};

// Rozet ekleme metodu
userSchema.methods.addBadge = async function(badgeData, adminId) {
  this.badges.push({
    ...badgeData,
    awardedBy: adminId
  });
  return this.save();
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);