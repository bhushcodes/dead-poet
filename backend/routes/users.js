const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const avatarUploadDir = process.env.VERCEL
  ? path.join('/tmp', 'avatars')
  : path.join(__dirname, '../uploads/avatars');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    try {
      fs.mkdirSync(avatarUploadDir, { recursive: true });
      cb(null, avatarUploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.png').toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.png';
    cb(null, `${req.params.uid}-${Date.now()}${safeExt}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if ((file.mimetype || '').startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image files are allowed'));
  }
});

function ensureSameUser(req, res, next) {
  const authUid = req.headers.authorization;
  if (!authUid || authUid !== req.params.uid) {
    return res.status(403).json({ success: false, error: 'Unauthorized user action' });
  }
  next();
}

router.post('/save', async (req, res) => {
  try {
    const { uid, postId } = req.body;
    const user = await User.findOne({ uid });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    if (!user.savedPosts) {
      user.savedPosts = [];
    }
    
    const saveIndex = user.savedPosts.indexOf(postId);
    if (saveIndex > -1) {
      user.savedPosts.splice(saveIndex, 1);
    } else {
      user.savedPosts.push(postId);
    }
    
    await user.save();
    res.json({ success: true, savedPosts: user.savedPosts, saved: saveIndex === -1 });
  } catch (error) {
    console.error('Save error:', error);
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
    const posts = await require('../models/Post').find({ 
      _id: { $in: savedPosts },
      isPublished: true 
    });
    
    res.json({ success: true, posts });
  } catch (error) {
    console.error('Saved posts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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

router.put('/:uid', ensureSameUser, async (req, res) => {
  try {
    const { displayName, photoURL } = req.body;
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (typeof displayName === 'string') {
      const trimmedName = displayName.trim();
      if (trimmedName) {
        user.displayName = trimmedName;
      }
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

router.post('/:uid/avatar', ensureSameUser, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image uploaded' });
    }

    const photoURL = `/uploads/avatars/${req.file.filename}`;
    user.photoURL = photoURL;
    await user.save();

    res.json({ success: true, photoURL });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:uid/activity', async (req, res) => {
  try {
    const uid = req.params.uid;
    const likedPosts = await Post.find({ likes: uid, isPublished: true }).sort({ updatedAt: -1 });

    const commentedPosts = await Post.find({ 'comments.userId': uid, isPublished: true }).sort({ updatedAt: -1 });
    const comments = [];
    commentedPosts.forEach((post) => {
      (post.comments || []).forEach((comment) => {
        if (comment.userId === uid) {
          comments.push({
            postTitle: post.title,
            postSlug: post.slug,
            text: comment.text,
            createdAt: comment.createdAt
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
