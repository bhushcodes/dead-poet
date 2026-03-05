const API_BASE = '';

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

  async getPosts(category, language) {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (language) params.append('language', language);
      
      const response = await fetch(`${API_BASE}/api/posts?${params}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { success: false, error: error.message };
    }
  }

  async getPost(slug) {
    try {
      const response = await fetch(`${API_BASE}/api/posts/slug/${slug}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return { success: false, error: error.message };
    }
  }

  async likePost(postId) {
    if (!this.user) return { success: false, error: 'Please login to like' };
    
    try {
      const response = await fetch(`${API_BASE}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: this.user.uid })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, error: error.message };
    }
  }

  async commentPost(postId, text) {
    if (!this.user) return { success: false, error: 'Please login to comment' };
    
    try {
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
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error commenting:', error);
      return { success: false, error: error.message };
    }
  }

  async savePost(postId) {
    if (!this.user) return { success: false, error: 'Please login to save' };
    
    try {
      const response = await fetch(`${API_BASE}/api/users/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: this.user.uid, postId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving post:', error);
      return { success: false, error: error.message };
    }
  }

  async getSavedPosts() {
    if (!this.user) return { success: false, error: 'Not logged in' };
    
    try {
      const response = await fetch(`${API_BASE}/api/users/saved/${this.user.uid}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      return { success: false, error: error.message };
    }
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
  }

  getUser() {
    return this.user;
  }
}

const api = new ApiService();
