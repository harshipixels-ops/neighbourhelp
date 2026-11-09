import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  PlayCircle,
  ExternalLink,
  MapPin,
  Calendar,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import CategoryIcon from '../components/CategoryIcon';

export default function MyVolunteeringPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyOffers = async () => {
    try {
      setLoading(true);
      const res = await api.offers.getMyOffers();
      setOffers(res.offers || []);
    } catch (err) {
      console.error('Failed to load my volunteering records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOffers();
  }, []);

  const handleWithdraw = async (offerId) => {
    if (!window.confirm('Are you sure you want to withdraw your volunteer commitment?')) return;
    try {
      setActionLoading(true);
      await api.offers.withdrawOffer(offerId);
      await fetchMyOffers();
    } catch (err) {
      alert(err.message || 'Failed to withdraw commitment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status) => {
    try {
      setActionLoading(true);
      await api.requests.updateStatus(requestId, status);
      await fetchMyOffers();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = offers.filter(o => {
    if (filterTab === 'all') return true;
    if (filterTab === 'pending') return o.status === 'pending';
    if (filterTab === 'accepted') return o.status === 'accepted' && o.request?.status !== 'completed';
    if (filterTab === 'completed') return o.request?.status === 'completed';
    if (filterTab === 'withdrawn') return o.status === 'withdrawn';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-main tracking-tight">My Volunteering</h1>
          <p className="text-xs sm:text-sm text-muted-custom mt-1">
            Track your commitments, ongoing assistance, and community impact.
          </p>
        </div>

        <Link
          to="/browse"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-brand text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs self-start sm:self-auto"
        >
          <HeartHandshake className="w-4 h-4" />
          <span>Find Requests to Help</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-theme">
        {[
          { id: 'all', label: 'All Commitments', count: offers.length },
          { id: 'pending', label: 'Pending Approval', count: offers.filter(o => o.status === 'pending').length },
          { id: 'accepted', label: 'Accepted & Active', count: offers.filter(o => o.status === 'accepted' && o.request?.status !== 'completed').length },
          { id: 'completed', label: 'Completed', count: offers.filter(o => o.request?.status === 'completed').length },
          { id: 'withdrawn', label: 'Withdrawn', count: offers.filter(o => o.status === 'withdrawn').length }
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
          <HeartHandshake className="w-12 h-12 text-muted-custom opacity-40 mx-auto" />
          <h3 className="text-base font-bold text-main">No volunteer records in this view</h3>
          <p className="text-xs text-muted-custom max-w-sm mx-auto">
            Explore open assistance requests in your neighbourhood and offer a helping hand!
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-brand text-white text-xs font-semibold"
          >
            Browse Requests
          </Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map(item => {
            const req = item.request;
            if (!req) return null;

            return (
              <div
                key={item._id}
                className="bg-surface border border-theme rounded-3xl p-5 shadow-custom hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary-light text-primary-brand">
                      <CategoryIcon category={req.category} className="w-3 h-3" />
                      <span>{req.category}</span>
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      item.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      item.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      Commitment: {item.status.toUpperCase()}
                    </span>

                    <StatusBadge status={req.status} />
                  </div>

                  <Link to={`/requests/${req._id}`} className="block">
                    <h3 className="text-base font-bold text-main hover:text-primary-brand transition-colors truncate">
                      {req.title}
                    </h3>
                  </Link>

                  {item.message && (
                    <p className="text-xs text-main bg-surface-hover/70 p-2 rounded-xl border border-theme/60 line-clamp-1 italic">
                      Your note: "{item.message}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-custom pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-brand" /> {req.neighbourhood}
                    </span>
                    {req.preferredDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-secondary-brand" /> {req.preferredDate}
                      </span>
                    )}
                    <span className="text-main font-semibold">
                      Requester: {req.requesterId?.name || 'Neighbour'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                  {item.status === 'accepted' && req.status === 'accepted' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(req._id, 'in_progress')}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 flex items-center gap-1"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Start Help</span>
                    </button>
                  )}

                  {item.status === 'accepted' && ['accepted', 'in_progress'].includes(req.status) && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleUpdateStatus(req._id, 'completed')}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  )}

                  {['pending', 'accepted'].includes(item.status) && req.status !== 'completed' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleWithdraw(item._id)}
                      className="px-3 py-1.5 rounded-xl border border-theme text-muted-custom hover:text-rose-600 text-xs font-medium hover:bg-surface-hover"
                    >
                      Withdraw
                    </button>
                  )}

                  <Link
                    to={`/requests/${req._id}`}
                    className="px-4 py-2 rounded-xl bg-primary-brand text-white text-xs font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
                  >
                    <span>View Request</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

