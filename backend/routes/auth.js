const express = require('express');
const router = express.Router();
const User = require('../models/User');

let admin;
try {
  admin = require('firebase-admin');
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
} catch (e) {
  console.warn('Firebase admin not initialized:', e.message);
}

function getAdminEmails() {
  const emails = [process.env.ADMIN_EMAIL];
  if (process.env.ADMIN_EMAILS) {
    emails.push(...process.env.ADMIN_EMAILS.split(',').map(e => e.trim()));
  }
  return new Set(emails.filter(Boolean).map(e => e.toLowerCase()));
}

router.post('/sync', async (req, res) => {
  try {
    const { uid, email, displayName, photoURL, role } = req.body;
    
    if (!uid) {
      return res.status(400).json({ success: false, error: 'User ID required' });
    }

    const isAdmin = email && getAdminEmails().has(email.toLowerCase());
    const finalRole = isAdmin ? 'admin' : (role || 'user');
    
    let user = await User.findOne({ uid });
    
    if (!user) {
      user = new User({
        uid,
        email: email || '',
        displayName: displayName || (email ? email.split('@')[0] : 'User'),
        photoURL: photoURL || '',
        role: finalRole,
        savedPosts: []
      });
    } else {
      if (email && email !== user.email) user.email = email;
      if (displayName && !user.displayName) user.displayName = displayName;
      if (photoURL && !user.photoURL) user.photoURL = photoURL;
      if (isAdmin) user.role = 'admin';
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
    console.error('Sync error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/google', async (req, res) => {
  try {
    const { idToken, email, displayName, photoURL } = req.body;
    
    if (!idToken || !admin) {
      return res.status(400).json({ success: false, error: 'Invalid request' });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      return res.status(400).json({ success: false, error: 'Invalid token' });
    }

    const userEmail = decodedToken.email || email;
    const isAdmin = userEmail && getAdminEmails().has(userEmail.toLowerCase());
    
    let user = await User.findOne({ uid: decodedToken.uid });
    
    if (!user) {
      user = new User({
        uid: decodedToken.uid,
        email: userEmail || '',
        displayName: decodedToken.name || displayName || (userEmail ? userEmail.split('@')[0] : 'User'),
        photoURL: decodedToken.picture || photoURL || '',
        role: isAdmin ? 'admin' : 'user',
        savedPosts: []
      });
    } else {
      if (userEmail && !user.email) user.email = userEmail;
      if (decodedToken.name && !user.displayName) user.displayName = decodedToken.name;
      if (decodedToken.picture && !user.photoURL) user.photoURL = decodedToken.picture;
      if (isAdmin) user.role = 'admin';
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
    console.error('Google auth error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
