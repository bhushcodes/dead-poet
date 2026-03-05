const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

router.use(async (req, res, next) => {
  const uid = req.headers.authorization;
  if (!uid) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  
  const user = await User.findOne({ uid });
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }
  
  next();
});

router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/posts', async (req, res) => {
  try {
    const { title, content, author, category, language, slug, isPublished, order } = req.body;
    
    const existingPost = await Post.findOne({ slug });
    if (existingPost) {
      return res.status(400).json({ success: false, error: 'Slug already exists' });
    }
    
    const post = new Post({ 
      title, 
      content, 
      author, 
      category, 
      language, 
      slug, 
      isPublished: isPublished !== false,
      order: order || 0
    });
    
    await post.save();
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/posts/:id', async (req, res) => {
  try {
    const { title, content, author, category, language, slug, isPublished, order } = req.body;
    
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    if (slug !== post.slug) {
      const existingPost = await Post.findOne({ slug });
      if (existingPost) {
        return res.status(400).json({ success: false, error: 'Slug already exists' });
      }
    }
    
    post.title = title;
    post.content = content;
    post.author = author;
    post.category = category;
    post.language = language;
    post.slug = slug;
    post.isPublished = isPublished !== undefined ? isPublished : post.isPublished;
    post.order = order !== undefined ? order : post.order;
    
    await post.save();
    res.json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/users/:uid/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findOneAndUpdate({ uid: req.params.uid }, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/users/:uid', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
