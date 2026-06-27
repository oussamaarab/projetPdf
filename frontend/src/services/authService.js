import api from './api';

const authService = {
  // Get CSRF cookie before login/register (required for Sanctum)
  async getCsrfCookie() {
    try {
      const baseURL = import.meta.env.VITE_API_URL.replace('/api', '');
      await api.get(`${baseURL}/sanctum/csrf-cookie`);
    } catch (error) {
      console.error('CSRF cookie error:', error);
    }
  },

  // Register new user
  async register(userData) {
    await this.getCsrfCookie();
    const response = await api.post('/register', userData);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  async login(credentials) {
    await this.getCsrfCookie();
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  async logout() {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  async getCurrentUser() {
    const response = await api.get('/user');
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  // Get stored user
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Update user profile
  async updateProfile(userData) {
    const response = await api.put('/user/profile', userData);
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Change password
  async changePassword(passwordData) {
    const response = await api.put('/user/password', passwordData);
    return response.data;
  },
};

export default authService;
