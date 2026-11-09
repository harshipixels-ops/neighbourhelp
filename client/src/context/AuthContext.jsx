import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('nh_token'));
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('nh_token');
    if (!savedToken) {
      setUser(null);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.getMe();
      setUser(data.user);
      setStats(data.stats);
      // Also fetch notifications unread count
      try {
        const notifData = await api.notifications.getNotifications();
        setUnreadNotifications(notifData.unreadCount || 0);
      } catch (e) {
        // ignore notification error
      }
    } catch (err) {
      console.warn('Session expired or invalid token:', err.message);
      localStorage.removeItem('nh_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    localStorage.setItem('nh_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await fetchCurrentUser();
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    localStorage.setItem('nh_token', res.token);
    setToken(res.token);
    setUser(res.user);
    await fetchCurrentUser();
    return res;
  };

  const logout = () => {
    localStorage.removeItem('nh_token');
    setToken(null);
    setUser(null);
    setStats(null);
    setUnreadNotifications(0);
  };

  const refreshUnread = async () => {
    if (!token) return;
    try {
      const notifData = await api.notifications.getNotifications();
      setUnreadNotifications(notifData.unreadCount || 0);
    } catch (err) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        stats,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser: fetchCurrentUser,
        unreadNotifications,
        setUnreadNotifications,
        refreshUnread,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

