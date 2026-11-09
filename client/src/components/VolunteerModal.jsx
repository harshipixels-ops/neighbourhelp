import React, { useState } from 'react';
import { HeartHandshake, X, Send, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function VolunteerModal({ request, isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.requests.volunteer(request._id, message);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit volunteer offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs fade-in">
      <div className="bg-surface border border-theme rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-muted-custom hover:text-main hover:bg-surface-hover transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-light flex items-center justify-center text-primary-brand">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-main">Volunteer to Assist</h3>
            <p className="text-xs text-muted-custom">Lend a helping hand to your neighbour</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-surface-hover border border-theme mb-4">
          <p className="text-xs font-semibold text-main truncate">{request.title}</p>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-custom">
            <span>📍 {request.neighbourhood}</span>
            {request.preferredDate && <span>🗓 {request.preferredDate}</span>}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-main mb-1.5">
              Friendly message or note (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Hi! I live nearby on Elmwood. I have a trolley and would be happy to help you Saturday afternoon!"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
            />
            <p className="text-[11px] text-muted-custom mt-1">
              The requester will review your offer and can accept it to coordinate directly with you.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-xl border border-theme text-main hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-primary-brand text-white hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {loading ? 'Submitting...' : 'Send Volunteer Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

