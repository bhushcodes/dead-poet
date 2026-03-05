const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

router.get('/', async (req, res) => {
  try {
    const { category, language, page = 1, limit = 20 } = req.query;
    const query = { isPublished: true };
    
    if (category) query.category = category;
    if (language) query.language = language;
    
    const posts = await Post.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Post.countDocuments(query);
    
    res.json({ success: true, posts, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, isPublished: true });
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    post.views += 1;
    await post.save();
    
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/like', async (req, res) => {
  try {
    const { uid } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    if (!post.likes) {
      post.likes = [];
    }
    
    const likeIndex = post.likes.indexOf(uid);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(uid);
    }
    
    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: likeIndex === -1, likesArray: post.likes });
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/comment', async (req, res) => {
  try {
    const { uid, text, userName, userPhoto } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    if (!post.comments) {
      post.comments = [];
    }
    
    const comment = {
      userId: uid,
      userName: userName || 'Anonymous',
      userPhoto: userPhoto || null,
      text,
      createdAt: new Date()
    };
    
    post.comments.push(comment);
    await post.save();
    
    res.json({ success: true, comments: post.comments });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/download', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    post.downloads += 1;
    await post.save();
    
    res.json({ success: true, downloads: post.downloads });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
