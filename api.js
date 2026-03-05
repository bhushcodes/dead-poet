const API_BASE = '';

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
      return { ok: response.ok, data };
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
}

class ApiService {
  constructor() {
    this.user = null;
    this.loadUser();
  }

  loadUser() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }
  }

  async parseJsonResponse(response) {
    const bodyText = await response.text();
    const trimmed = bodyText.trim();

    let data;
    try {
      data = JSON.parse(bodyText);
    } catch (_error) {
      data = null;
    }

    if (data) {
      if (!response.ok && data.error) {
        const error = new Error(data.error);
        error.retryable = data.retryable === true;
        throw error;
      }
      return data;
    }

    if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
      const error = new Error('API returned HTML instead of JSON. Check Vercel project/rewrite setup.');
      error.retryable = true;
      throw error;
    }

    const error = new Error(response.ok ? 'Invalid JSON response from API.' : `Request failed with status ${response.status}.`);
    error.retryable = response.status >= 500 || response.status === 503 || response.status === 504;
    throw error;
  }

  async fetchWithRetry(fetchFn, maxRetries = 2, delayMs = 500) {
    let lastError = null;
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const result = await fetchFn();
        if (result.success !== false || attempt === maxRetries) {
          return result;
        }
      } catch (error) {
        lastError = error;
        if (!error.retryable || attempt === maxRetries) {
          return { success: false, error: error.message };
        }
      }
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
    return { success: false, error: lastError?.message || 'Request failed after retries' };
  }

  async getPosts(category, language) {
    return this.fetchWithRetry(async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (language) params.append('language', language);
      
      const response = await fetch(`${API_BASE}/api/posts?${params}`);
      return this.parseJsonResponse(response);
    });
  }

  async getPost(slug) {
    return this.fetchWithRetry(async () => {
      const response = await fetch(`${API_BASE}/api/posts/slug/${slug}`);
      return this.parseJsonResponse(response);
    });
  }

  async likePost(postId) {
    if (!this.user) return { success: false, error: 'Please login to like' };
    
    return this.fetchWithRetry(async () => {
      const response = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: this.user.uid })
      });
      return this.parseJsonResponse(response);
    });
  }

  async commentPost(postId, text) {
    if (!this.user) return { success: false, error: 'Please login to comment' };
    
    return this.fetchWithRetry(async () => {
      const response = await fetch(`${API_BASE}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          uid: this.user.uid, 
          text,
          userName: this.user.displayName || 'Anonymous',
          userPhoto: this.user.photoURL || null
        })
      });
      return this.parseJsonResponse(response);
    });
  }

  async savePost(postId) {
    if (!this.user) return { success: false, error: 'Please login to save' };
    
    return this.fetchWithRetry(async () => {
      const response = await fetch(`${API_BASE}/api/users/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: this.user.uid, postId })
      });
      return this.parseJsonResponse(response);
    });
  }

  async getSavedPosts() {
    if (!this.user) return { success: false, error: 'Not logged in' };
    
    return this.fetchWithRetry(async () => {
      const response = await fetch(`${API_BASE}/api/users/saved/${this.user.uid}`);
      return this.parseJsonResponse(response);
    });
  }

  async downloadPost(postId) {
    try {
      await fetch(`${API_BASE}/api/posts/${postId}/download`, { method: 'POST' });
    } catch (error) {
      console.error('Error tracking download:', error);
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
    return this.user;
  }
}

const api = new ApiService();
