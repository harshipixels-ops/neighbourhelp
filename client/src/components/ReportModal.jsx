import React, { useState } from 'react';
import { Flag, X, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ReportModal({ targetType = 'request', targetId, title, isOpen, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState('Inappropriate content');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.reports.createReport({
        targetType,
        targetId,
        reason,
        details
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs fade-in">
      <div className="bg-surface border border-theme rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-muted-custom hover:text-main hover:bg-surface-hover transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-main">Report Content</h3>
            <p className="text-xs text-muted-custom">Help maintain community safety and trust</p>
          </div>
        </div>

        {title && (
          <p className="text-xs text-muted-custom mb-4 truncate font-medium bg-surface-hover p-2.5 rounded-xl border border-theme">
            Target: <span className="text-main font-semibold">{title}</span>
          </p>
        )}

        {success ? (
          <div className="py-6 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-main">Report Received</h4>
            <p className="text-xs text-muted-custom mt-1">Our moderation team will review this shortly. Thank you!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-main mb-1.5">Reason for report</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
              >
                <option value="Emergency situation (requires 911/emergency service)">Emergency situation (requires emergency services)</option>
                <option value="Commercial solicitation / Spam">Commercial solicitation / Spam</option>
                <option value="Inappropriate or abusive language">Inappropriate or abusive language</option>
                <option value="Safety or privacy concern">Safety or privacy concern</option>
                <option value="Suspicious or fraudulent activity">Suspicious or fraudulent activity</option>
                <option value="Other policy violation">Other policy violation</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-main mb-1.5">Additional details (Optional)</label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please describe why this content is inappropriate..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
              />
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
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

