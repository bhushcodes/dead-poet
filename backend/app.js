require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const corsOptions = allowedOrigins.length
  ? {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('CORS origin not allowed'));
      },
      credentials: true
    }
  : {
      origin: true,
      credentials: true
    };

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
const uploadStaticDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadStaticDir));

let cached = global.__mongooseConn;
if (!cached) {
  cached = global.__mongooseConn = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/deadpoet';
    cached.promise = mongoose
      .connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
        maxPoolSize: 10
      })
      .then((mongooseInstance) => mongooseInstance)
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    return res.status(503).json({ 
      success: false, 
      error: 'Database temporarily unavailable. Please try again.',
      retryable: true 
    });
  }
});

const requestTimeout = 10000;
app.use((req, res, next) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      return res.status(504).json({ 
        success: false, 
        error: 'Request timed out. Please try again.',
        retryable: true 
      });
    }
  }, requestTimeout);
  
  res.on('finish', () => clearTimeout(timeout));
  next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API is live' });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  return res.status(500).json({ 
    success: false, 
    error: 'Internal server error. Please try again.',
    retryable: true 
  });
});

module.exports = app;
