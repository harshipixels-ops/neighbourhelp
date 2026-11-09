import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  HeartHandshake,
  Check,
  X,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Lock,
  MessageSquare,
  Send,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import CategoryIcon from '../components/CategoryIcon';
import VolunteerModal from '../components/VolunteerModal';
import ReportModal from '../components/ReportModal';

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Chat message input
  const [newMsg, setNewMsg] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);

  // Feedback modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await api.requests.getRequestById(id);
      setRequest(res.request);
    } catch (err) {
      setError(err.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 w-40 bg-surface rounded-xl animate-pulse" />
        <div className="h-96 bg-surface rounded-3xl animate-pulse border border-theme" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-main">{error || 'Request not found'}</h2>
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-brand text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Browse Requests
        </Link>
      </div>
    );
  }

  const requesterId = (request.requesterId?._id || request.requesterId)?.toString();
  const isOwner = user && user._id === requesterId;
  const isAcceptedVolunteer = user && request.acceptedVolunteerId && (request.acceptedVolunteerId?._id || request.acceptedVolunteerId)?.toString() === user._id;

  const handleAcceptOffer = async (offerId) => {
    try {
      setActionLoading(true);
      await api.offers.acceptOffer(offerId);
      await fetchRequest();
    } catch (err) {
      alert(err.message || 'Failed to accept offer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to decline this volunteer offer?')) return;
    try {
      setActionLoading(true);
      await api.offers.rejectOffer(offerId);
      await fetchRequest();
    } catch (err) {
      alert(err.message || 'Failed to reject offer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawOffer = async (offerId) => {
    if (!window.confirm('Are you sure you want to withdraw your volunteer offer?')) return;
    try {
      setActionLoading(true);
      await api.offers.withdrawOffer(offerId);
      await fetchRequest();
    } catch (err) {
      alert(err.message || 'Failed to withdraw offer.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (newStatus === 'completed' && isOwner) {
      setShowFeedbackModal(true);
      return;
    }

    try {
      setActionLoading(true);
      await api.requests.updateStatus(request._id, newStatus);
      await fetchRequest();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendCoordinationMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    try {
      setMsgLoading(true);
      await api.requests.sendMessage(request._id, newMsg.trim());
      setNewMsg('');
      await fetchRequest();
    } catch (err) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setMsgLoading(false);
    }
  };

  const handleCompleteWithFeedback = async (e) => {
    e.preventDefault();
    try {
      setFeedbackLoading(true);
      await api.requests.updateStatus(request._id, 'completed');
      if (feedbackNote.trim() || feedbackRating) {
        await api.requests.sendFeedback(request._id, {
          rating: feedbackRating,
          note: feedbackNote.trim()
        });
      }
      setShowFeedbackModal(false);
      await fetchRequest();
    } catch (err) {
      alert(err.message || 'Failed to complete.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    try {
      setActionLoading(true);
      await api.requests.cancelRequest(request._id);
      await fetchRequest();
    } catch (err) {
      alert(err.message || 'Failed to cancel request.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top back & actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-custom hover:text-main transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Browse Requests</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="text-xs text-muted-custom hover:text-rose-600 flex items-center gap-1 transition-colors"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report this post</span>
        </button>
      </div>

      {/* Main Request Card */}
      <div className="bg-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-custom space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-theme">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-light text-primary-brand">
            <CategoryIcon category={request.category} className="w-4 h-4" />
            <span>{request.category}</span>
          </span>
          <StatusBadge status={request.status} />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-main leading-snug">
          {request.title}
        </h1>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-surface-hover/70 border border-theme text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-brand shrink-0" />
            <div>
              <span className="text-muted-custom block">Location</span>
              <span className="font-semibold text-main">{request.neighbourhood}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-secondary-brand shrink-0" />
            <div>
              <span className="text-muted-custom block">Preferred Date</span>
              <span className="font-semibold text-main">{request.preferredDate || 'Flexible'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-custom shrink-0" />
            <div>
              <span className="text-muted-custom block">Posted</span>
              <span className="font-semibold text-main">
                {new Date(request.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Full Description */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-main">Description</h2>
          <p className="text-xs sm:text-sm text-main leading-relaxed whitespace-pre-line bg-surface p-4 rounded-2xl border border-theme">
            {request.description}
          </p>
        </div>

        {/* Private Instructions (Only visible to Requester or Accepted Volunteer) */}
        {(isOwner || isAcceptedVolunteer) && request.additionalInstructions && (
          <div className="p-4 rounded-2xl bg-primary-light/50 border border-primary-brand/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary-brand">
              <Lock className="w-3.5 h-3.5" />
              <span>Private Instructions & Details (Confidential)</span>
            </div>
            <p className="text-xs text-main leading-relaxed">
              {request.additionalInstructions}
            </p>
          </div>
        )}

        {/* Community Gratitude Review (If completed) */}
        {request.status === 'completed' && request.completionFeedback && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Requester Gratitude & Review
              </span>
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(request.completionFeedback.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
            {request.completionFeedback.note && (
              <p className="text-xs text-emerald-900 dark:text-emerald-200 italic">
                "{request.completionFeedback.note}"
              </p>
            )}
          </div>
        )}

        {/* Requester Profile Summary Card */}
        <div className="pt-4 border-t border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={
                request.requesterId?.profileImage ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(request.requesterId?.name || 'User')}`
              }
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-theme"
            />
            <div>
              <span className="text-xs text-muted-custom block">Posted by</span>
              <span className="text-sm font-bold text-main">
                {request.requesterId?.name || 'Neighbour'}
              </span>
              {request.requesterId?.bio && (
                <p className="text-xs text-muted-custom mt-0.5 line-clamp-1 italic">
                  "{request.requesterId.bio}"
                </p>
              )}
            </div>
          </div>

          {/* Volunteer / Progress Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isOwner && !isAcceptedVolunteer && ['open', 'pending'].includes(request.status) && (
              request.myOffer ? (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200">
                    Offer Submitted ({request.myOffer.status})
                  </span>
                  {request.myOffer.status === 'pending' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleWithdrawOffer(request.myOffer._id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-600 text-xs font-medium hover:bg-rose-50"
                    >
                      Withdraw Offer
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsVolunteerModalOpen(true)}
                  className="px-5 py-2.5 rounded-2xl bg-primary-brand text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Volunteer for this Request</span>
                </button>
              )
            )}

            {/* If Accepted Volunteer actions */}
            {isAcceptedVolunteer && (
              <div className="flex items-center gap-2">
                {request.status === 'accepted' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('in_progress')}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 flex items-center gap-1.5"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Start Assistance (In Progress)</span>
                  </button>
                )}
                {['accepted', 'in_progress'].includes(request.status) && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('completed')}
                    className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark Assistance Completed</span>
                  </button>
                )}
              </div>
            )}

            {/* Requester Lifecycle Actions */}
            {isOwner && (
              <div className="flex flex-wrap items-center gap-2">
                {request.status === 'accepted' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('in_progress')}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 flex items-center gap-1"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>Mark In Progress</span>
                  </button>
                )}
                {['accepted', 'in_progress'].includes(request.status) && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('completed')}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}
                {['open', 'pending', 'accepted'].includes(request.status) && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleCancelRequest}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 text-xs font-semibold hover:bg-rose-50"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Coordination Chat Thread (Requester & Accepted Volunteer) */}
      {(isOwner || isAcceptedVolunteer) && ['accepted', 'in_progress', 'completed'].includes(request.status) && (
        <div className="bg-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-custom space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-theme">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-brand" />
              <div>
                <h3 className="text-base font-bold text-main">Coordination Notes</h3>
                <p className="text-[11px] text-muted-custom">Direct private messaging between requester & volunteer</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto p-1">
            {(!request.coordinationMessages || request.coordinationMessages.length === 0) ? (
              <p className="text-xs text-muted-custom text-center py-4 italic">
                No messages yet. Send a note to coordinate timing, arrival, or items!
              </p>
            ) : (
              request.coordinationMessages.map((m, idx) => {
                const isMe = m.senderId?.toString() === user?._id;
                return (
                  <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-muted-custom mb-1 px-1">
                      {m.senderName} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className={`px-4 py-2.5 rounded-2xl text-xs max-w-sm ${
                      isMe
                        ? 'bg-primary-brand text-white rounded-br-xs'
                        : 'bg-surface-hover text-main border border-theme rounded-bl-xs'
                    }`}>
                      {m.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {request.status !== 'completed' && (
            <form onSubmit={handleSendCoordinationMessage} className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                placeholder="Type a quick coordination message..."
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
              />
              <button
                type="submit"
                disabled={msgLoading || !newMsg.trim()}
                className="px-4 py-2 rounded-xl bg-primary-brand text-white text-xs font-semibold hover:opacity-90 flex items-center gap-1 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Requester's Offers Review Section (Visible only to owner) */}
      {isOwner && (
        <div className="bg-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-custom space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-primary-brand" />
              <h3 className="text-base font-bold text-main">Volunteer Offers Received</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-light text-primary-brand">
              {request.offers ? request.offers.length : 0} offers
            </span>
          </div>

          {(!request.offers || request.offers.length === 0) ? (
            <div className="p-8 text-center text-xs text-muted-custom bg-surface-hover/50 rounded-2xl border border-theme">
              No volunteer offers yet. Your request is visible to nearby neighbours. We will notify you as soon as someone volunteers!
            </div>
          ) : (
            <div className="divide-y divide-theme">
              {request.offers.map((offer) => (
                <div key={offer._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        offer.volunteerId?.profileImage ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(offer.volunteerId?.name || 'Volunteer')}`
                      }
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-theme shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-main">{offer.volunteerId?.name}</span>
                        <span className="text-[10px] text-muted-custom">📍 {offer.volunteerId?.neighbourhood}</span>
                      </div>
                      {offer.message && (
                        <p className="text-xs text-main bg-surface-hover p-2.5 rounded-xl border border-theme leading-relaxed">
                          "{offer.message}"
                        </p>
                      )}
                      <p className="text-[10px] text-muted-custom">
                        Offered {new Date(offer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this offer */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {offer.status === 'pending' && ['open', 'pending'].includes(request.status) ? (
                      <>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleAcceptOffer(offer._id)}
                          className="px-3.5 py-1.5 rounded-xl bg-primary-brand text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Volunteer</span>
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleRejectOffer(offer._id)}
                          className="px-3 py-1.5 rounded-xl border border-theme text-muted-custom hover:text-rose-600 text-xs font-medium hover:bg-surface-hover"
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                        offer.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        Offer {offer.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completion & Gratitude Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs fade-in">
          <div className="bg-surface border border-theme rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <h3 className="text-base font-bold text-main flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <span>Mark Assistance Completed</span>
            </h3>
            <p className="text-xs text-muted-custom">
              Thank your volunteer and leave community feedback to recognize their service!
            </p>

            <form onSubmit={handleCompleteWithFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-main mb-1.5">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= feedbackRating ? 'text-amber-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-main mb-1.5">Thank-You Note (Optional)</label>
                <textarea
                  rows={3}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="e.g. Marcus arrived right on time and was incredibly kind and helpful! Thank you!"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-theme text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {feedbackLoading ? 'Submitting...' : 'Confirm & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <VolunteerModal
        request={request}
        isOpen={isVolunteerModalOpen}
        onClose={() => setIsVolunteerModalOpen(false)}
        onSuccess={fetchRequest}
      />

      <ReportModal
        targetType="request"
        targetId={request._id}
        title={request.title}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
