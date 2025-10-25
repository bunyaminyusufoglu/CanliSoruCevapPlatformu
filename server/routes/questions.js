const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const auth = require('../middleware/auth');

// Tüm soruları getir (sayfalama ile)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    
    const query = {};
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const questions = await Question.find(query)
      .populate('author', 'username')
      .populate('answers.author', 'username')
      .populate('answers.replies.author', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

    res.json({
      success: true,
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tek soruyu getir
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username')
      .populate('answers.author', 'username')
      .populate('answers.replies.author', 'username');

    if (!question) {
      return res.status(404).json({ success: false, error: 'Soru bulunamadı' });
    }

    // Görüntülenme sayısını artır
    question.views += 1;
    await question.save();

    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
      author: req.user.id
    });

    await question.save();
    await question.populate('author', 'username');

    res.status(201).json({ success: true, question });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Soruya cevap ekle
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Soru bulunamadı' });
    }

    question.answers.push({
      content,
      author: req.user.id
    });

    await question.save();
    await question.populate('answers.author', 'username');

    res.json({ success: true, question });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Cevaba yanıt ekle
router.post('/:id/answers/:answerId/replies', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Soru bulunamadı' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ success: false, error: 'Cevap bulunamadı' });
    }

    // Cevaba yanıt ekle
    answer.replies = answer.replies || [];
    answer.replies.push({
      content,
      author: req.user.id,
      createdAt: new Date()
    });

    await question.save();
    await question.populate('answers.author', 'username');
    await question.populate('answers.replies.author', 'username');

    res.json({ success: true, question });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Cevabı kabul et
router.put('/:id/answers/:answerId/accept', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Soru bulunamadı' });
    }

    // Sadece soru sahibi cevabı kabul edebilir
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Bu işlem için yetkiniz yok' });
    }

    const answer = question.answers.id(req.params.answerId);
    if (!answer) {
      return res.status(404).json({ success: false, error: 'Cevap bulunamadı' });
    }

    // Diğer cevapları kabul edilmemiş yap
    question.answers.forEach(ans => {
      ans.isAccepted = false;
    });

    // Bu cevabı kabul et
    answer.isAccepted = true;
    question.isResolved = true;

    await question.save();

    res.json({ success: true, question });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Soruyu güncelle
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Soru bulunamadı' });
    }

    // Sadece soru sahibi güncelleyebilir
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Bu işlem için yetkiniz yok' });
    }

    question.title = title || question.title;
    question.content = content || question.content;
    question.category = category || question.category;
    question.tags = tags || question.tags;

    await question.save();
    await question.populate('author', 'username');

    res.json({ success: true, question });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Soruyu sil
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, error: 'Soru bulunamadı' });
    }

    // Sadece soru sahibi silebilir
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Bu işlem için yetkiniz yok' });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Soru silindi' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
