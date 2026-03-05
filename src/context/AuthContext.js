// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage token on mount
  useEffect(() => {
    const token = localStorage.getItem('mt_token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/auth/me')
        .then(res => setUser(res.user))
        .catch(() => { localStorage.removeItem('mt_token'); delete api.defaults.headers.common['Authorization']; })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('mt_token', res.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.token}`;
    setUser(res.user);
    return res.user;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('mt_token', res.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.token}`;
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('mt_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out');
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/me', data);
    setUser(res.user);
    return res.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
