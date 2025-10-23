import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    const loadProfile = async () => {
      try {
        const base = process.env.REACT_APP_API_URL || '/api';
        const res = await axios.get(base + '/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
      } catch (e) {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
  };

  const value = useMemo(() => ({ user, setUser, logout, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


