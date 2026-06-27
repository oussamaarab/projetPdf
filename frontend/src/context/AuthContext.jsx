import { useCallback, useEffect, useMemo, useState } from 'react';
import AuthContext from './authContextObject';
import authService from '../services/authService';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (!mounted) return;

          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);

          const currentUser = await authService.getCurrentUser();
          if (!mounted) return;

          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch {
          if (mounted) {
            clearAuth();
          }
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, [clearAuth]);

  const handleLogin = useCallback(async (credentials) => {
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }, []);

  const handleRegister = useCallback(async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const isAdmin = useCallback(() => user?.role === 'admin', [user?.role]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
  }), [
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    handleLogin,
    handleRegister,
    handleLogout,
    updateUser,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
