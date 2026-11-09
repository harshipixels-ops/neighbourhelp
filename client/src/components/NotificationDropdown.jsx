import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function NotificationDropdown() {
  const { unreadNotifications, setUnreadNotifications } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.notifications.getNotifications();
      setNotifications(res.notifications || []);
      setUnreadNotifications(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.notifications.markAsRead(notif._id);
        setUnreadNotifications(prev => Math.max(0, prev - 1));
      } catch (err) {}
    }
    setIsOpen(false);
    if (notif.relatedRequestId) {
      navigate(`/requests/${notif.relatedRequestId}`);
    } else {
      navigate('/dashboard');
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMin = Math.round((now - date) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.round(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full border border-theme bg-surface hover:bg-surface-hover transition-colors text-main"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4 text-main" />
        {unreadNotifications > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-gray-900">
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface border border-theme shadow-2xl z-50 overflow-hidden fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-theme bg-surface-hover/30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-main">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-light text-primary-brand">
                  {unreadNotifications} new
                </span>
              )}
            </div>
            {notifications.some(n => !n.isRead) && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-brand hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-theme">
            {loading ? (
              <div className="p-6 text-center text-xs text-muted-custom">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-custom">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-muted-custom" />
                No notifications yet. You'll be notified when neighbours volunteer or respond!
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-surface-hover cursor-pointer transition-colors flex items-start gap-3 ${
                    !notif.isRead ? 'bg-primary-light/40 dark:bg-primary-light/10' : ''
                  }`}
                >
                  <span
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      !notif.isRead ? 'bg-primary-brand' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-main leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-muted-custom">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(notif.createdAt)}</span>
                      {notif.relatedRequestId && (
                        <span className="text-primary-brand flex items-center gap-0.5 ml-auto">
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

