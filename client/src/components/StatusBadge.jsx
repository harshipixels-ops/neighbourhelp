import React from 'react';
import { Clock, CheckCircle2, AlertCircle, PlayCircle, XCircle, UserCheck } from 'lucide-react';

export default function StatusBadge({ status, className = '' }) {
  const configs = {
    open: {
      label: 'Open for Volunteers',
      icon: Clock,
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
    },
    pending: {
      label: 'Pending Approval',
      icon: AlertCircle,
      classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
    },
    accepted: {
      label: 'Volunteer Accepted',
      icon: UserCheck,
      classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800'
    },
    in_progress: {
      label: 'In Progress',
      icon: PlayCircle,
      classes: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800'
    },
    completed: {
      label: 'Completed',
      icon: CheckCircle2,
      classes: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800'
    },
    cancelled: {
      label: 'Cancelled',
      icon: XCircle,
      classes: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
    }
  };

  const conf = configs[status] || configs.open;
  const Icon = conf.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${conf.classes} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{conf.label}</span>
    </span>
  );
}

