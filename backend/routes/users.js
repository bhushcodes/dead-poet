const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const avatarDir = process.env.VERCEL 
  ? path.join('/tmp', 'avatars') 
  : path.join(__dirname, '../uploads/avatars');

try {
  fs.mkdirSync(avatarDir, { recursive: true });
} catch (e) {}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${req.params.uid}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage, limits: { fileSize: 3 * 1024 * 1024 } });

router.get('/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        savedPosts: user.savedPosts || [],
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/:uid', async (req, res) => {
  try {
    const authUid = req.headers.authorization;
    if (authUid !== req.params.uid) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { displayName, photoURL } = req.body;
    if (typeof displayName === 'string' && displayName.trim()) {
      user.displayName = displayName.trim();
    }
    if (photoURL === null) {
      user.photoURL = '';
    } else if (typeof photoURL === 'string') {
      user.photoURL = photoURL.trim();
    }

    await user.save();
    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        savedPosts: user.savedPosts || [],
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/:uid/avatar', upload.single('avatar'), async (req, res) => {
  try {
    const authUid = req.headers.authorization;
    if (authUid !== req.params.uid) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    user.photoURL = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    res.json({ success: true, photoURL: user.photoURL });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/save', async (req, res) => {
  try {
    const { uid, postId } = req.body;
    const user = await User.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!user.savedPosts) user.savedPosts = [];
    
    const idx = user.savedPosts.indexOf(postId);
    if (idx > -1) {
      user.savedPosts.splice(idx, 1);
    } else {
      user.savedPosts.push(postId);
    }
    
    await user.save();
    res.json({ success: true, savedPosts: user.savedPosts, saved: idx === -1 });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/saved/:uid', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const savedPosts = user.savedPosts || [];
    const posts = await Post.find({ _id: { $in: savedPosts }, isPublished: true });
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:uid/activity', async (req, res) => {
  try {
    const uid = req.params.uid;
    const likedPosts = await Post.find({ likes: uid, isPublished: true }).sort({ updatedAt: -1 });
    
    const commentedPosts = await Post.find({ 'comments.userId': uid, isPublished: true });
    const comments = [];
    commentedPosts.forEach(post => {
      post.comments.forEach(c => {
        if (c.userId === uid) {
          comments.push({
            postTitle: post.title,
            postSlug: post.slug,
            text: c.text,
            createdAt: c.createdAt
          });
        }
      });
    });
    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, likedPosts, comments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
