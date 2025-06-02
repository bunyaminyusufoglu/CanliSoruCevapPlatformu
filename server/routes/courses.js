const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Course = require('../models/Course');

// Tüm kursları getir
router.get('/', async (req, res) => {
  try {
    const { search, category, instructor, sort = 'newest', page = 1, limit = 10 } = req.query;
    
    // Arama filtresi
    const filter = {};
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) filter.category = category;
    if (instructor) filter['instructor.username'] = instructor;

    // Sıralama seçenekleri
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      mostEnrolled: { enrollmentCount: -1 },
      highestRated: { rating: -1 }
    };

    const courses = await Course.find(filter)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('instructor', 'username profileImage')
      .populate('students', 'username profileImage');

    const total = await Course.countDocuments(filter);

    res.json({
      courses,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCourses: total
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Kurslar yüklenirken bir hata oluştu' });
  }
});

// Yeni kurs oluştur
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category, price, duration, level } = req.body;

    const course = new Course({
      title,
      description,
      category,
      price,
      duration,
      level,
      instructor: req.user.userId
    });

    await course.save();
    await course.populate('instructor', 'username profileImage');

    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Kurs oluşturulurken bir hata oluştu' });
  }
});

// Kurs detaylarını getir
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'username profileImage bio')
      .populate('students', 'username profileImage')
      .populate('reviews.author', 'username profileImage');

    if (!course) {
      return res.status(404).json({ message: 'Kurs bulunamadı' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Kurs yüklenirken bir hata oluştu' });
  }
});

// Kursa kaydol
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Kurs bulunamadı' });
    }

    // Kullanıcı zaten kayıtlı mı kontrol et
    if (course.students.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Bu kursa zaten kayıtlısınız' });
    }

    course.students.push(req.user.userId);
    course.enrollmentCount += 1;
    await course.save();

    await course.populate('instructor', 'username profileImage');
    await course.populate('students', 'username profileImage');

    res.json(course);
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Kursa kaydolurken bir hata oluştu' });
  }
});

// Kursa yorum ekle
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Kurs bulunamadı' });
    }

    // Kullanıcı kursa kayıtlı mı kontrol et
    if (!course.students.includes(req.user.userId)) {
      return res.status(403).json({ message: 'Bu kursa yorum yapabilmek için kayıtlı olmalısınız' });
    }

    // Kullanıcı daha önce yorum yapmış mı kontrol et
    const existingReview = course.reviews.find(
      review => review.author.toString() === req.user.userId
    );

    if (existingReview) {
      return res.status(400).json({ message: 'Bu kursa zaten yorum yapmışsınız' });
    }

    const review = {
      rating,
      comment,
      author: req.user.userId
    };

    course.reviews.push(review);

    // Kurs puanını güncelle
    const totalRating = course.reviews.reduce((sum, review) => sum + review.rating, 0);
    course.rating = totalRating / course.reviews.length;

    await course.save();
    await course.populate('reviews.author', 'username profileImage');

    res.status(201).json(course);
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Yorum eklenirken bir hata oluştu' });
  }
});

module.exports = router; 