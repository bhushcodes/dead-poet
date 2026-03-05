const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

router.get('/overview', async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalViews = await Post.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalLikes = await Post.aggregate([
      { $project: { likesCount: { $size: '$likes' } } },
      { $group: { _id: null, total: { $sum: '$likesCount' } } }
    ]);
    const totalDownloads = await Post.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const totalComments = await Post.aggregate([
      { $project: { commentsCount: { $size: '$comments' } } },
      { $group: { _id: null, total: { $sum: '$commentsCount' } } }
    ]);
    
    res.json({
      success: true,
      analytics: {
        totalPosts,
        totalUsers,
        totalViews: totalViews[0]?.total || 0,
        totalLikes: totalLikes[0]?.total || 0,
        totalDownloads: totalDownloads[0]?.total || 0,
        totalComments: totalComments[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ views: -1 }).limit(10);
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/posts/popular', async (req, res) => {
  try {
    const { type } = req.query;
    const sortField = type === 'likes' ? { likes: -1 } : type === 'downloads' ? { downloads: -1 } : { views: -1 };
    const posts = await Post.find().sort(sortField).limit(10);
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
