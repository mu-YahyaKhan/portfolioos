import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);
export const SERVER = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API = axios.create({ baseURL: `${SERVER}/api` });

// Avatars/images may be old local-upload paths (e.g. "/uploads/xyz.png") or
// full Cloudinary URLs (e.g. "https://res.cloudinary.com/..."). Only prefix
// with SERVER when it's a relative local-upload path.
export const resolveImg = url => (url && url.startsWith('/uploads')) ? `${SERVER}${url}` : url;
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && window.location.pathname.startsWith('/dashboard')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.get('/auth/me')
        .then(r => setUser(r.data.user))
        .catch(() => { localStorage.removeItem('token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (name, email, password) => {
    const { data } = await API.post('/auth/register', { name, email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = u => setUser(u);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, API }}>
      {children}
    </AuthContext.Provider>
  );
};
