const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, default: 'भूषण' },
  category: { 
    type: String, 
    enum: ['poem', 'story', 'other'], 
    required: true 
  },
  language: { 
    type: String, 
    enum: ['marathi', 'hindi', 'english'], 
    required: true 
  },
  slug: { type: String, required: true, unique: true },
  views: { type: Number, default: 0 },
  likes: [{ type: String }],
  comments: [{ 
    userId: { type: String },
    userName: { type: String },
    userPhoto: { type: String },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  downloads: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Post', postSchema);
