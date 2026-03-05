const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

router.get('/', async (req, res) => {
  try {
    const { category, language } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (language) filter.language = language;
    
    const posts = await Post.find(filter).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      posts,
      total: posts.length
    });
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

    post.views = (post.views || 0) + 1;
    await post.save();
    
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

    if (!post.likes) post.likes = [];
    
    const idx = post.likes.indexOf(uid);
    if (idx > -1) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(uid);
    }
    
    await post.save();
    
    res.json({ success: true, likesArray: post.likes, liked: idx === -1 });
  } catch (error) {
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

    if (!post.comments) post.comments = [];
    
    const comment = {
      userId: uid,
      userName: userName || 'Anonymous',
      userPhoto: userPhoto || '',
      text,
      createdAt: new Date()
    };
    
    post.comments.push(comment);
    await post.save();
    
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:id/download', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      post.downloads = (post.downloads || 0) + 1;
      await post.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
