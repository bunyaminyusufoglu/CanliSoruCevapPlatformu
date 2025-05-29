const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Tüm soruları getir (arama ve filtreleme ile)
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      username, 
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Arama sorgusu oluştur
    let query = {};
    
    // Metin araması
    if (search) {
      query.$text = { $search: search };
    }
    
    // Kategori filtresi
    if (category) {
      query.category = category;
    }
    
    // Kullanıcı adına göre filtreleme
    if (username) {
      const user = await User.findOne({ username });
      if (user) {
        query.user = user._id;
      } else {
        return res.json({ questions: [], total: 0 });
      }
    }

    // Sıralama seçenekleri
    const sortOptions = {
      createdAt: { createdAt: sortOrder === 'desc' ? -1 : 1 },
      updatedAt: { updatedAt: sortOrder === 'desc' ? -1 : 1 },
      viewCount: { viewCount: sortOrder === 'desc' ? -1 : 1 },
      answerCount: { 'answers.length': sortOrder === 'desc' ? -1 : 1 }
    };

    const sort = sortOptions[sortBy] || sortOptions.createdAt;

    // Sayfalama
    const skip = (page - 1) * limit;

    // Soruları getir
    const questions = await Question.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username avatar')
      .populate('answers.user', 'username avatar');

    // Toplam soru sayısını getir
    const total = await Question.countDocuments(query);

    res.json({
      questions,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Soru listesi getirilirken hata:', error);
    res.status(500).json({ error: 'Sorular getirilirken bir hata oluştu' });
  }
});

// Yeni soru oluştur
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const question = new Question({
      title,
      content,
      category,
      tags: tags || [],
      user: req.user.id
    });

    await question.save();

    // Kullanıcının soru sayısını artır
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { questionCount: 1 }
    });

    // Puanları güncelle
    const user = await User.findById(req.user.id);
    await user.updatePoints();

    res.status(201).json(question);
  } catch (error) {
    console.error('Soru oluşturulurken hata:', error);
    res.status(500).json({ error: 'Soru oluşturulurken bir hata oluştu' });
  }
});

// Soru detayını getir
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('answers.user', 'username avatar');

    if (!question) {
      return res.status(404).json({ error: 'Soru bulunamadı' });
    }

    // Görüntülenme sayısını artır
    question.viewCount += 1;
    await question.save();

    res.json(question);
  } catch (error) {
    console.error('Soru detayı getirilirken hata:', error);
    res.status(500).json({ error: 'Soru detayı getirilirken bir hata oluştu' });
  }
});

// Soruya cevap ekle
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Soru bulunamadı' });
    }

    question.answers.push({
      content,
      user: req.user.id
    });

    await question.save();

    // Kullanıcının cevap sayısını artır
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { answerCount: 1 }
    });

    // Puanları güncelle
    const user = await User.findById(req.user.id);
    await user.updatePoints();

    // Güncellenmiş soruyu getir
    const updatedQuestion = await Question.findById(req.params.id)
      .populate('user', 'username avatar')
      .populate('answers.user', 'username avatar');

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Cevap eklenirken hata:', error);
    res.status(500).json({ error: 'Cevap eklenirken bir hata oluştu' });
  }
});

// Cevabı faydalı olarak işaretle
router.post('/:id/answers/:answerId/helpful', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Soru bulunamadı' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ error: 'Cevap bulunamadı' });
    }

    // Kullanıcı kendi cevabını faydalı olarak işaretleyemez
    if (answer.user.toString() === req.user.id) {
      return res.status(400).json({ error: 'Kendi cevabınızı faydalı olarak işaretleyemezsiniz' });
    }

    answer.isHelpful = true;
    answer.helpfulCount += 1;
    await question.save();

    // Cevap veren kullanıcının faydalı cevap sayısını artır
    await User.findByIdAndUpdate(answer.user, {
      $inc: { helpfulAnswerCount: 1 }
    });

    // Puanları güncelle
    const user = await User.findById(answer.user);
    await user.updatePoints();

    res.json({ message: 'Cevap faydalı olarak işaretlendi' });
  } catch (error) {
    console.error('Cevap işaretlenirken hata:', error);
    res.status(500).json({ error: 'Cevap işaretlenirken bir hata oluştu' });
  }
});

module.exports = router; 