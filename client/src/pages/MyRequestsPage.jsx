import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Calendar,
  MapPin,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import CategoryIcon from '../components/CategoryIcon';

export default function MyRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const res = await api.requests.getMyRequests();
      setRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load my requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const filtered = requests.filter(r => {
    if (filterTab === 'all') return true;
    if (filterTab === 'open') return r.status === 'open';
    if (filterTab === 'pending') return r.status === 'pending';
    if (filterTab === 'active') return ['accepted', 'in_progress'].includes(r.status);
    if (filterTab === 'completed') return r.status === 'completed';
    if (filterTab === 'cancelled') return r.status === 'cancelled';
    return true;
  });

  const handleCancelRequest = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      await api.requests.cancelRequest(id);
      await fetchMyRequests();
    } catch (err) {
      alert(err.message || 'Failed to cancel.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-main tracking-tight">My Requests</h1>
          <p className="text-xs sm:text-sm text-muted-custom mt-1">
            Track and manage assistance requests you have created.
          </p>
        </div>

        <Link
          to="/create-request"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-brand text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Request</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-theme">
        {[
          { id: 'all', label: 'All Requests', count: requests.length },
          { id: 'open', label: 'Open', count: requests.filter(r => r.status === 'open').length },
          { id: 'pending', label: 'Pending Offers', count: requests.filter(r => r.status === 'pending').length },
          { id: 'active', label: 'Accepted & Active', count: requests.filter(r => ['accepted', 'in_progress'].includes(r.status)).length },
          { id: 'completed', label: 'Completed', count: requests.filter(r => r.status === 'completed').length },
          { id: 'cancelled', label: 'Cancelled', count: requests.filter(r => r.status === 'cancelled').length }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterTab(tab.id)}
            className={`px-3.5 py-2 font-semibold rounded-t-xl transition-colors flex items-center gap-1.5 shrink-0 ${
              filterTab === tab.id
                ? 'border-b-2 border-primary-brand text-primary-brand bg-primary-light/40'
                : 'text-muted-custom hover:text-main hover:bg-surface-hover'
            }`}
          >
            <span>{tab.label}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-theme text-main">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-3xl bg-surface border border-theme animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-surface border border-theme rounded-3xl p-12 text-center space-y-4 shadow-custom">
          <ClipboardList className="w-12 h-12 text-muted-custom opacity-40 mx-auto" />
          <h3 className="text-base font-bold text-main">No requests found in this view</h3>
          <p className="text-xs text-muted-custom max-w-sm mx-auto">
            {filterTab === 'all'
              ? 'You have not created any assistance requests yet.'
              : `You have no requests marked as ${filterTab}.`}
          </p>
          <Link
            to="/create-request"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-brand text-white text-xs font-semibold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create a Request</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map(req => (
            <div
              key={req._id}
              className="bg-surface border border-theme rounded-3xl p-5 shadow-custom hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-light text-primary-brand">
                    <CategoryIcon category={req.category} className="w-3 h-3" />
                    <span>{req.category}</span>
                  </span>
                  <StatusBadge status={req.status} />
                  <span className="text-[11px] text-muted-custom">
                    Posted {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <Link to={`/requests/${req._id}`} className="block">
                  <h3 className="text-base font-bold text-main hover:text-primary-brand transition-colors truncate">
                    {req.title}
                  </h3>
                </Link>

                <p className="text-xs text-muted-custom line-clamp-1">
                  {req.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-custom pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-brand" /> {req.neighbourhood}
                  </span>
                  {req.preferredDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-secondary-brand" /> {req.preferredDate}
                    </span>
                  )}
                  {req.acceptedVolunteerId && (
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      🤝 Volunteer: {req.acceptedVolunteerId.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Action right */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {req.pendingOffersCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 animate-pulse">
                    {req.pendingOffersCount} new offer{req.pendingOffersCount > 1 ? 's' : ''}
                  </span>
                )}

                <Link
                  to={`/requests/${req._id}`}
                  className="px-4 py-2 rounded-xl bg-primary-brand text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {['open', 'pending'].includes(req.status) && (
                  <button
                    type="button"
                    onClick={(e) => handleCancelRequest(req._id, e)}
                    className="p-2 rounded-xl border border-theme text-muted-custom hover:text-rose-600 hover:bg-surface-hover transition-colors"
                    title="Cancel this request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

