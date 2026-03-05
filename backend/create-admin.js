require('dotenv').config();
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const User = require('./models/User');

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

async function ensureFirebaseAdminUser(email, password) {
  try {
    const existing = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(existing.uid, {
      password,
      displayName: existing.displayName || 'Dead Poet Admin'
    });
    return existing;
  } catch (error) {
    if (error && error.code === 'auth/user-not-found') {
      return admin.auth().createUser({
        email,
        password,
        displayName: 'Dead Poet Admin',
        emailVerified: true
      });
    }
    throw error;
  }
}

async function ensureMongoAdminUser(firebaseUser) {
  let user = await User.findOne({ uid: firebaseUser.uid });

  if (!user) {
    user = new User({
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName || 'Dead Poet Admin',
      photoURL: firebaseUser.photoURL || '',
      role: 'admin'
    });
  } else {
    user.email = firebaseUser.email;
    if (!user.displayName || !user.displayName.trim()) {
      user.displayName = firebaseUser.displayName || 'Dead Poet Admin';
    }
    if (!user.photoURL && firebaseUser.photoURL) {
      user.photoURL = firebaseUser.photoURL;
    }
    user.role = 'admin';
  }

  await user.save();
}

async function createAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
  const adminPassword = process.env.ADMIN_PASSWORD || '';

  if (!adminEmail || !adminPassword) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this script.');
  }

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/deadpoet');

  const firebaseUser = await ensureFirebaseAdminUser(adminEmail, adminPassword);
  await ensureMongoAdminUser(firebaseUser);

  const existingEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  const adminEmails = new Set([adminEmail, ...existingEmails]);

  console.log('Admin account is ready.');
  console.log(`Admin email: ${adminEmail}`);
  console.log('Set this in env for role auto-sync:');
  console.log(`ADMIN_EMAILS=${Array.from(adminEmails).join(',')}`);
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to create admin account:', error.message);
    process.exit(1);
  });
