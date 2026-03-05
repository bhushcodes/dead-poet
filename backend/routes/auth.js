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

router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    let user = await User.findOne({ uid: decodedToken.uid });
    
    if (!user) {
      user = new User({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email.split('@')[0],
        photoURL: decodedToken.picture
      });
      await user.save();
    } else {
      let changed = false;
      if (decodedToken.email && user.email !== decodedToken.email) {
        user.email = decodedToken.email;
        changed = true;
      }
      if (decodedToken.name && (!user.displayName || !user.displayName.trim())) {
        user.displayName = decodedToken.name;
        changed = true;
      }
      if (decodedToken.picture && (!user.photoURL || !user.photoURL.trim())) {
        user.photoURL = decodedToken.picture;
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
