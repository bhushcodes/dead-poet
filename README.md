# Dead Poet - Content Platform

A complete content platform for poems and stories with backend management, admin controls, and user authentication.

## Features

- **Backend System**: Node.js + Express + MongoDB
- **Admin Panel**: Full content management (add, edit, delete posts)
- **User Authentication**: Google OAuth via Firebase
- **User Features**: Like, comment, save, share, download posts
- **Content Categories**: Poems, Stories in Marathi, Hindi, English
- **Analytics**: Track views, likes, comments, downloads

## Setup Instructions

### 1. Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud)
- Firebase project (for Google Auth)

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Google Sign-in
4. Go to Project Settings → Service Accounts
5. Generate new private key and copy the JSON

### 3. Environment Configuration

Edit `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/deadpoet
PORT=3000

# Firebase Admin SDK - paste your service account JSON values
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-client-email

JWT_SECRET=your-secret-key
```

### 4. Install Dependencies & Run

```bash
cd backend
npm install
npm start
```

### 5. Migrate Existing Content

```bash
node migrate.js
```

### 6. Update Firebase Config in Frontend

Edit these files and replace `YOUR_API_KEY`, `YOUR_PROJECT_ID`, etc.:
- `admin.html`
- `post.html`

### 7. Make First User Admin

After logging in via Google, manually update the user's role in MongoDB:

```javascript
db.users.updateOne({ email: "your-email@gmail.com" }, { $set: { role: "admin" } })
```

## Project Structure

```
/backend
  /models       - MongoDB schemas
  /routes       - API endpoints
  server.js     - Express server
  migrate.js    - Data migration script
  .env          - Environment variables

/admin.html     - Admin dashboard
/post.html      - Dynamic post viewer
/api.js         - Frontend API service
```

## Access

- **Main Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin.html

## API Endpoints

- `GET /api/posts` - List posts
- `GET /api/posts/slug/:slug` - Get post by slug
- `POST /api/posts/:id/like` - Like post
- `POST /api/posts/:id/comment` - Comment on post
- `POST /api/posts/:id/download` - Track download
- `POST /api/auth/google` - Google login
- `GET /api/admin/posts` - Admin: list all posts
- `POST /api/admin/posts` - Admin: create post
- `PUT /api/admin/posts/:id` - Admin: update post
- `DELETE /api/admin/posts/:id` - Admin: delete post
- `GET /api/analytics/overview` - Analytics data
