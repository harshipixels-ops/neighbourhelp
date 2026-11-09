import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, HeartHandshake, CheckCircle2, Save, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [name, setName] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await api.users.getProfile();
        setProfileData(data);
        if (data.user) {
          setName(data.user.name || '');
          setNeighbourhood(data.user.neighbourhood || '');
          setBio(data.user.bio || '');
          setProfileImage(data.user.profileImage || '');
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');
      await api.users.updateProfile({
        name,
        neighbourhood,
        bio,
        profileImage
      });
      await refreshUser();
      setSuccessMessage('Profile information saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const stats = profileData?.stats || {
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    totalVolunteered: 0,
    acceptedVolunteered: 0,
    completedVolunteerActs: 0
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="h-64 rounded-3xl bg-surface animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-main tracking-tight">Your Community Profile</h1>
        <p className="text-xs sm:text-sm text-muted-custom mt-1">
          Manage your personal introduction, location, and review your community activity.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-custom flex flex-col sm:flex-row items-center gap-6">
        <img
          src={profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}`}
          alt={name}
          className="w-24 h-24 rounded-full object-cover border-4 border-primary-light shadow-md shrink-0"
        />

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold text-main">{name}</h2>
            {user?.role === 'admin' && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                Administrator
              </span>
            )}
          </div>
          <p className="text-xs text-muted-custom flex items-center justify-center sm:justify-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-primary-brand" />
            <span>{neighbourhood || 'Location not set'}</span>
          </p>
          <p className="text-xs text-muted-custom flex items-center justify-center sm:justify-start gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
          </p>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-theme sm:pl-6 text-center">
          <div>
            <p className="text-xl font-black text-primary-brand">{stats.completedRequests}</p>
            <p className="text-[10px] text-muted-custom uppercase font-semibold">Completed Requests</p>
          </div>
          <div>
            <p className="text-xl font-black text-secondary-brand">{stats.acceptedVolunteered}</p>
            <p className="text-[10px] text-muted-custom uppercase font-semibold">Volunteer Acts</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-custom space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-theme">
          <User className="w-5 h-5 text-primary-brand" />
          <h3 className="text-base font-bold text-main">Edit Profile Details</h3>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-main mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-main mb-1.5">Email Address (Login ID)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-theme bg-surface-hover/70 text-muted-custom cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-custom mt-1">🔒 Kept strictly private, never exposed publicly.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-main mb-1.5">Neighbourhood / District</label>
              <input
                type="text"
                required
                value={neighbourhood}
                onChange={(e) => setNeighbourhood(e.target.value)}
                placeholder="e.g. Maplewood District"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-main mb-1.5">Profile Avatar Image URL</label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-main mb-1.5">
              Personal Bio / Introduction (Optional)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell neighbours a little bit about yourself, how long you've lived in the area, or what you enjoy helping with..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-theme">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary-brand text-white font-bold text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

