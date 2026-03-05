const express = require('express');
const router = express.Router();
const User = require('../models/User');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    })
  });
}

function getAdminEmails() {
  return new Set(
    [process.env.ADMIN_EMAIL, ...(process.env.ADMIN_EMAILS || '').split(',')]
      .map((email) => (email || '').trim().toLowerCase())
      .filter(Boolean)
  );
}

router.post('/google', async (req, res) => {
  try {
    const { idToken, displayName, photoURL, email } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUser = await admin.auth().getUser(decodedToken.uid).catch(() => null);

    const firstNonEmpty = (...values) => {
      for (const value of values) {
        if (typeof value === 'string' && value.trim()) {
          return value.trim();
        }
      }
      return '';
    };

    const tokenEmail = firstNonEmpty(decodedToken.email, firebaseUser?.email, email);
    const tokenName = firstNonEmpty(decodedToken.name, firebaseUser?.displayName, displayName);
    const tokenPhoto = firstNonEmpty(decodedToken.picture, firebaseUser?.photoURL, photoURL);
    const isConfiguredAdmin = tokenEmail
      ? getAdminEmails().has(tokenEmail.toLowerCase())
      : false;
    
    let user = await User.findOne({ uid: decodedToken.uid });
    
    if (!user) {
      user = new User({
        uid: decodedToken.uid,
        email: tokenEmail,
        displayName: tokenName || (tokenEmail ? tokenEmail.split('@')[0] : 'User'),
        photoURL: tokenPhoto,
        role: isConfiguredAdmin ? 'admin' : 'user'
      });
      await user.save();
    } else {
      let changed = false;
      const currentPhoto = (user.photoURL || '').trim();

      if (tokenEmail && user.email !== tokenEmail) {
        user.email = tokenEmail;
        changed = true;
      }

      if (tokenName && (!user.displayName || !user.displayName.trim())) {
        user.displayName = tokenName;
        changed = true;
      }

      const shouldSyncGooglePhoto = Boolean(tokenPhoto) && (
        !currentPhoto ||
        /googleusercontent\.com|googleapis\.com/.test(currentPhoto) ||
        currentPhoto === 'https://www.google.com/favicon.ico'
      );

      if (shouldSyncGooglePhoto && user.photoURL !== tokenPhoto) {
        user.photoURL = tokenPhoto;
        changed = true;
      }

      if (isConfiguredAdmin && user.role !== 'admin') {
        user.role = 'admin';
        changed = true;
      }

      if (changed) {
        await user.save();
      }
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
    console.error('Auth error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL } = req.body;
    
    let user = await User.findOne({ uid });
    if (user) {
      return res.json({ success: true, user });
    }
    
    user = new User({ uid, email, displayName, photoURL });
    await user.save();
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/me', async (req, res) => {
  try {
    const uid = req.headers.authorization;
    if (!uid) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    const user = await User.findOne({ uid }).populate('savedPosts');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
