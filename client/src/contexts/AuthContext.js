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
  },
  withCredentials: true // Cookie'leri gönder
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Access token header'a otomatik ekleniyor
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Access token response header'dan alınıp saklanıyor
    const newAccessToken = response.headers['authorization'];
    if (newAccessToken) {
      // Yeni access token'ı header'a ekle
      api.defaults.headers.common['Authorization'] = newAccessToken;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Token yenileme denemesi yapılmamışsa ve 401 hatası alındıysa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Token yenileme isteği gönder
        const response = await api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
        
        // Yeni access token'ı header'a ekle
        const newAccessToken = response.headers['authorization'];
        api.defaults.headers.common['Authorization'] = newAccessToken;

        // Orijinal isteği yeni token ile tekrarla
        originalRequest.headers['Authorization'] = newAccessToken;
        return api(originalRequest);
      } catch (refreshError) {
        // Token yenileme başarısız olursa çıkış yap
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
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
      const user = getStoredUser();

      if (user) {
        try {
          // Token'ın geçerliliğini kontrol et
          const response = await api.get(API_ENDPOINTS.AUTH.PROFILE);
          setCurrentUser(response.data.user);
        } catch (err) {
          console.error('Token validation error:', err);
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
      console.log('Login attempt:', { email });
      setError(null);
      
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });
      console.log('Login response:', response.data);

      const { user } = response.data;
      console.log('User data received:', user);
      
      // Kullanıcı bilgilerini kaydet
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User data stored in localStorage');
      
      // Access token header'dan alınıp saklanıyor
      const accessToken = response.headers['authorization'];
      console.log('Access token received:', accessToken ? 'Yes' : 'No');
      
      if (accessToken) {
        api.defaults.headers.common['Authorization'] = accessToken;
        console.log('Access token set in axios headers');
      }
      
      setCurrentUser(user);
      console.log('Current user set in state');
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || 'Giriş yapılırken bir hata oluştu';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Register attempt:', userData);
      setError(null);
      
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      console.log('Register response:', response.data);
      
      const { user } = response.data;
      console.log('User data received:', user);
      
      // Kullanıcı bilgilerini kaydet
      localStorage.setItem('user', JSON.stringify(user));
      console.log('User data stored in localStorage');
      
      // Access token header'dan alınıp saklanıyor
      const accessToken = response.headers['authorization'];
      console.log('Access token received:', accessToken ? 'Yes' : 'No');
      
      if (accessToken) {
        api.defaults.headers.common['Authorization'] = accessToken;
        console.log('Access token set in axios headers');
      }
      
      setCurrentUser(user);
      console.log('Current user set in state');
      
      return { success: true };
    } catch (err) {
      console.error('Register error:', err.response?.data || err.message);
      const errorMessage = err.response?.data?.error || 'Kayıt olurken bir hata oluştu';
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
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
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
      const errorMessage = err.response?.data?.error || 'Profil güncellenirken bir hata oluştu';
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