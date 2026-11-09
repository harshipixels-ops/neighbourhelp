import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  HeartHandshake,
  ClipboardList,
  CheckCircle2,
  Clock,
  ArrowRight,
  MapPin,
  Sparkles,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import CategoryIcon from '../components/CategoryIcon';

export default function DashboardPage() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const [prof, reqs, offs] = await Promise.all([
          api.users.getProfile(),
          api.requests.getMyRequests(),
          api.offers.getMyOffers()
        ]);
        setProfileData(prof);
        setActiveRequests(reqs.requests || []);
        setActiveOffers(offs.offers || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const stats = profileData?.stats || {
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    totalVolunteered: 0,
    acceptedVolunteered: 0,
    completedVolunteerActs: 0
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-custom flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary-brand text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Community Member</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-main">
            {getGreeting()}, {user?.name || 'Neighbour'}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-custom flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary-brand" />
            <span>Active in <strong>{user?.neighbourhood}</strong></span>
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <Link
            to="/create-request"
            className="px-5 py-2.5 rounded-2xl bg-primary-brand text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ask for Help</span>
          </Link>

          <Link
            to="/browse"
            className="px-5 py-2.5 rounded-2xl bg-surface border border-theme text-main text-xs font-bold hover:bg-surface-hover transition-colors shadow-xs flex items-center gap-1.5"
          >
            <HeartHandshake className="w-4 h-4 text-primary-brand" />
            <span>Find Requests to Help</span>
          </Link>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-surface border border-theme rounded-3xl p-5 shadow-custom space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-custom">My Active Requests</span>
            <div className="w-8 h-8 rounded-xl bg-primary-light text-primary-brand flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-main">{stats.activeRequests}</p>
          <Link to="/my-requests" className="text-[11px] text-primary-brand font-semibold hover:underline block pt-1">
            Manage requests →
          </Link>
        </div>

        <div className="bg-surface border border-theme rounded-3xl p-5 shadow-custom space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-custom">Volunteered Offers</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-main">{stats.totalVolunteered}</p>
          <Link to="/my-volunteering" className="text-[11px] text-blue-600 font-semibold hover:underline block pt-1">
            View commitments →
          </Link>
        </div>

        <div className="bg-surface border border-theme rounded-3xl p-5 shadow-custom space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-custom">Accepted to Assist</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-main">{stats.acceptedVolunteered}</p>
          <span className="text-[11px] text-muted-custom block pt-1">
            Active commitments
          </span>
        </div>

        <div className="bg-surface border border-theme rounded-3xl p-5 shadow-custom space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-custom">Completed Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-main">{stats.completedRequests + stats.completedVolunteerActs}</p>
          <span className="text-[11px] text-emerald-600 font-semibold block pt-1">
            Community impact
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: My Requests Preview */}
        <div className="bg-surface border border-theme rounded-3xl p-6 shadow-custom space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-main flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary-brand" />
              <span>Recent Help Requests</span>
            </h2>
            <Link to="/my-requests" className="text-xs font-semibold text-primary-brand hover:underline">
              View all ({activeRequests.length})
            </Link>
          </div>

          {activeRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-custom bg-surface-hover/50 rounded-2xl border border-theme">
              You haven't posted any help requests yet.
              <div className="pt-2">
                <Link to="/create-request" className="text-primary-brand font-semibold hover:underline">
                  Post a request now
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRequests.slice(0, 3).map(r => (
                <Link
                  key={r._id}
                  to={`/requests/${r._id}`}
                  className="block p-3.5 rounded-2xl bg-surface-hover/70 hover:bg-surface-hover border border-theme/70 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-main truncate">{r.title}</span>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-custom">
                    <span>📍 {r.neighbourhood}</span>
                    <span>{r.pendingOffersCount || 0} offers</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: My Volunteering Commitments */}
        <div className="bg-surface border border-theme rounded-3xl p-6 shadow-custom space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-main flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-primary-brand" />
              <span>Active Volunteering</span>
            </h2>
            <Link to="/my-volunteering" className="text-xs font-semibold text-primary-brand hover:underline">
              View all ({activeOffers.length})
            </Link>
          </div>

          {activeOffers.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-custom bg-surface-hover/50 rounded-2xl border border-theme">
              You don't have any volunteer commitments right now.
              <div className="pt-2">
                <Link to="/browse" className="text-primary-brand font-semibold hover:underline">
                  Browse requests in need of help
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOffers.slice(0, 3).map(o => (
                <Link
                  key={o._id}
                  to={`/requests/${o.request?._id}`}
                  className="block p-3.5 rounded-2xl bg-surface-hover/70 hover:bg-surface-hover border border-theme/70 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-main truncate">{o.request?.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary-brand">
                      {o.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-custom">
                    <span>Requester: {o.request?.requesterId?.name || 'Neighbour'}</span>
                    <span>📍 {o.request?.neighbourhood}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

