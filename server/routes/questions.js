const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Question = require('../models/Question');

// Tüm soruları getir
router.get('/', async (req, res) => {
  try {
    const { search, category, username, sort = 'newest', page = 1, limit = 10 } = req.query;
    
    // Arama filtresi
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (username) filter['author.username'] = username;

    // Sıralama seçenekleri
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      mostAnswered: { answerCount: -1 },
      mostViewed: { viewCount: -1 }
    };

    const questions = await Question.find(filter)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username profileImage')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: 'username profileImage' }
      });

    const total = await Question.countDocuments(filter);

    res.json({
      questions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalQuestions: total
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Sorular yüklenirken bir hata oluştu' });
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
      tags,
      author: req.user.userId
    });

    await question.save();
    await question.populate('author', 'username profileImage');

    res.status(201).json(question);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Soru oluşturulurken bir hata oluştu' });
  }
});

// Soru detaylarını getir
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username profileImage')
      .populate({
        path: 'answers',
        populate: { path: 'author', select: 'username profileImage' }
      });

    if (!question) {
      return res.status(404).json({ message: 'Soru bulunamadı' });
    }

    // Görüntülenme sayısını artır
    question.viewCount += 1;
    await question.save();

    res.json(question);
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Soru yüklenirken bir hata oluştu' });
  }
});

// Soruya cevap ekle
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Soru bulunamadı' });
    }

    const answer = {
      content,
      author: req.user.userId,
      createdAt: new Date()
    };

    question.answers.push(answer);
    question.answerCount += 1;
    await question.save();

    await question.populate('answers.author', 'username profileImage');

    res.status(201).json(question);
  } catch (error) {
    console.error('Add answer error:', error);
    res.status(500).json({ message: 'Cevap eklenirken bir hata oluştu' });
  }
});

// Cevabı faydalı olarak işaretle
router.post('/:id/answers/:answerId/helpful', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Soru bulunamadı' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Cevap bulunamadı' });
    }

    // Kullanıcının daha önce faydalı olarak işaretleyip işaretlemediğini kontrol et
    const helpfulIndex = answer.helpfulBy.indexOf(req.user.userId);
    if (helpfulIndex === -1) {
      answer.helpfulBy.push(req.user.userId);
      answer.helpfulCount += 1;
    } else {
      answer.helpfulBy.splice(helpfulIndex, 1);
      answer.helpfulCount -= 1;
    }

    await question.save();
    res.json(answer);
  } catch (error) {
    console.error('Mark answer helpful error:', error);
    res.status(500).json({ message: 'İşlem sırasında bir hata oluştu' });
  }
});

module.exports = router; 