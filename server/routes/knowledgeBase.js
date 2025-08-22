import express from 'express';
import KnowledgeBase from '../models/KnowledgeBase.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all knowledge base articles
router.get('/', auth, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    if (category && category !== 'all') {
      query.category = category;
    }

    let articles;
    if (search) {
      articles = await KnowledgeBase.find({
        ...query,
        $text: { $search: search }
      })
        .populate('createdBy', 'name email')
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    } else {
      articles = await KnowledgeBase.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    }

    const total = await KnowledgeBase.countDocuments(query);

    res.json({
      articles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + parseInt(limit) < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get KB articles error:', error);
    res.status(500).json({
      message: 'Server error fetching knowledge base articles'
    });
  }
});

// Create knowledge base article (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        message: 'Title, content, and category are required'
      });
    }

    const article = new KnowledgeBase({
      title,
      content,
      category,
      tags: tags || [],
      createdBy: req.user._id
    });

    await article.save();
    await article.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Knowledge base article created successfully',
      article
    });
  } catch (error) {
    console.error('Create KB article error:', error);
    res.status(500).json({
      message: 'Server error creating knowledge base article'
    });
  }
});

// Update knowledge base article (admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const { title, content, category, tags, isActive } = req.body;

    const article = await KnowledgeBase.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        message: 'Knowledge base article not found'
      });
    }

    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (category) updates.category = category;
    if (tags !== undefined) updates.tags = tags;
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    Object.assign(article, updates);
    await article.save();
    await article.populate('createdBy', 'name email');

    res.json({
      message: 'Knowledge base article updated successfully',
      article
    });
  } catch (error) {
    console.error('Update KB article error:', error);
    res.status(500).json({
      message: 'Server error updating knowledge base article'
    });
  }
});

// Delete knowledge base article (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);
    if (!article) {
      return res.status(404).json({
        message: 'Knowledge base article not found'
      });
    }

    await KnowledgeBase.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Knowledge base article deleted successfully'
    });
  } catch (error) {
    console.error('Delete KB article error:', error);
    res.status(500).json({
      message: 'Server error deleting knowledge base article'
    });
  }
});

// Get single knowledge base article
router.get('/:id', auth, async (req, res) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!article || !article.isActive) {
      return res.status(404).json({
        message: 'Knowledge base article not found'
      });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.json({ article });
  } catch (error) {
    console.error('Get KB article error:', error);
    res.status(500).json({
      message: 'Server error fetching knowledge base article'
    });
  }
});

export default router;
