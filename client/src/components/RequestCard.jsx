import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, HeartHandshake, Flag, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import CategoryIcon from './CategoryIcon';
import VolunteerModal from './VolunteerModal';
import ReportModal from './ReportModal';
import { useAuth } from '../context/AuthContext';

export default function RequestCard({ request, onRefresh }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVolunteerOpen, setIsVolunteerOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const requesterId = (request.requesterId?._id || request.requesterId)?.toString();
  const isOwner = user && user._id === requesterId;
  const isAcceptedVolunteer = user && request.acceptedVolunteerId && (request.acceptedVolunteerId?._id || request.acceptedVolunteerId)?.toString() === user._id;

  const canVolunteer = user && !isOwner && !isAcceptedVolunteer && ['open', 'pending'].includes(request.status);

  return (
    <>
      <div className="bg-surface border border-theme hover:border-card-theme rounded-3xl p-5 shadow-custom hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
        <div>
          {/* Header badges: Category & Status */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary-brand">
              <CategoryIcon category={request.category} className="w-3.5 h-3.5" />
              <span>{request.category}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <StatusBadge status={request.status} />
              <button
                type="button"
                onClick={() => setIsReportOpen(true)}
                className="p-1 rounded-full text-muted-custom hover:text-rose-600 hover:bg-surface-hover transition-colors opacity-60 hover:opacity-100"
                title="Report this post"
              >
                <Flag className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Title */}
          <Link to={`/requests/${request._id}`} className="block">
            <h3 className="text-base font-bold text-main line-clamp-2 group-hover:text-primary-brand transition-colors">
              {request.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="text-xs text-muted-custom mt-2 line-clamp-2 leading-relaxed">
            {request.description}
          </p>

          {/* Metadata badges */}
          <div className="mt-4 pt-3 border-t border-theme/60 space-y-2 text-xs text-muted-custom">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary-brand shrink-0" />
              <span className="font-medium truncate">{request.neighbourhood}</span>
            </div>

            {request.preferredDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-secondary-brand shrink-0" />
                <span className="truncate">{request.preferredDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info & action */}
        <div className="mt-4 pt-3 border-t border-theme flex items-center justify-between gap-3">
          {/* Requester avatar & name */}
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={
                request.requesterId?.profileImage ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(request.requesterId?.name || 'Neighbour')}`
              }
              alt=""
              className="w-6 h-6 rounded-full object-cover border border-theme shrink-0"
            />
            <span className="text-xs font-medium text-main truncate">
              {request.requesterId?.name || 'Neighbour'}
            </span>
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2">
            {isOwner ? (
              <Link
                to={`/requests/${request._id}`}
                className="px-3 py-1.5 rounded-xl bg-surface-hover text-primary-brand font-semibold text-xs border border-theme hover:bg-primary-light transition-colors flex items-center gap-1"
              >
                <span>Manage</span>
                {request.pendingOfferCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-primary-brand text-white rounded-full text-[10px]">
                    {request.pendingOfferCount}
                  </span>
                )}
              </Link>
            ) : isAcceptedVolunteer ? (
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-200">
                You're Helping
              </span>
            ) : canVolunteer ? (
              <button
                type="button"
                onClick={() => setIsVolunteerOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-primary-brand text-white font-medium text-xs hover:opacity-90 transition-opacity flex items-center gap-1 shadow-xs"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Volunteer</span>
              </button>
            ) : (
              <Link
                to={`/requests/${request._id}`}
                className="text-xs text-primary-brand font-medium hover:underline flex items-center gap-0.5"
              >
                <span>Details</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <VolunteerModal
        request={request}
        isOpen={isVolunteerOpen}
        onClose={() => setIsVolunteerOpen(false)}
        onSuccess={() => {
          if (onRefresh) onRefresh();
          navigate(`/requests/${request._id}`);
        }}
      />

      <ReportModal
        targetType="request"
        targetId={request._id}
        title={request.title}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </>
  );
}

