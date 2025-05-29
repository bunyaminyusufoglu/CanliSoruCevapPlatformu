import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../config/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Token yönetimi için yardımcı fonksiyonlar
const getStoredToken = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? JSON.parse(token) : null;
  } catch (error) {
    console.error('Token parse error:', error);
    localStorage.removeItem('token');
    return null;
  }
};

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('User parse error:', error);
    localStorage.removeItem('user');
    return null;
  }
};

// Axios instance oluştur
const api = axios.create({
  baseURL: API_ENDPOINTS.AUTH.BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz veya süresi dolmuş
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getStoredToken();
      const user = getStoredUser();

      if (token && user) {
        try {
          // Token'ın geçerliliğini kontrol et
          const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
          setCurrentUser(response.data.user);
        } catch (err) {
          console.error('Token validation error:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });

      const { token, user } = response.data;
      
      // Token ve kullanıcı bilgilerini kaydet
      localStorage.setItem('token', JSON.stringify(token));
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      const { token, user } = response.data;
      
      // Token ve kullanıcı bilgilerini kaydet
      localStorage.setItem('token', JSON.stringify(token));
      localStorage.setItem('user', JSON.stringify(user));
      
      setCurrentUser(user);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Kayıt olurken bir hata oluştu';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await api.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profil güncellenirken bir hata oluştu';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    updateProfile,
    api // Axios instance'ını dışa aç
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 