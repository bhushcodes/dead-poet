const API_BASE = '';

function loadUserFromStorage() {
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
  } catch (e) {
    console.warn('Error loading user from storage:', e);
  }
  return null;
}

async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          throw new Error('Server returned HTML. Retrying...');
        }
        throw new Error('Invalid JSON response');
      }
      if (!response.ok && !data.success) {
        throw new Error(data.error || 'Request failed');
      }
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
}

class ApiService {
  constructor() {
    this.user = loadUserFromStorage();
  }

  async likePost(postId) {
    if (!this.user) return { success: false, error: 'Please login to like' };
    
    try {
      return await fetchWithRetry(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: this.user.uid })
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async commentPost(postId, text) {
    if (!this.user) return { success: false, error: 'Please login to comment' };
    
    try {
      return await fetchWithRetry(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          uid: this.user.uid, 
          text,
          userName: this.user.displayName || 'Anonymous',
          userPhoto: this.user.photoURL || null
        })
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async savePost(postId) {
    if (!this.user) return { success: false, error: 'Please login to save' };
    
    try {
      return await fetchWithRetry(`/api/users/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: this.user.uid, postId })
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getSavedPosts() {
    if (!this.user) return { success: false, error: 'Not logged in' };
    
    try {
      return await fetchWithRetry(`/api/users/saved/${this.user.uid}`);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPosts(category, language) {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (language) params.append('language', language);
      return await fetchWithRetry(`/api/posts?${params}`);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getPost(slug) {
    try {
      return await fetchWithRetry(`/api/posts/slug/${slug}`);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  setUser(user) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    this.user = null;
    localStorage.removeItem('user');
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().signOut().catch(() => {});
    }
  }

  getUser() {
    if (!this.user) {
      this.user = loadUserFromStorage();
    }
    return this.user;
  }
}

const api = new ApiService();
