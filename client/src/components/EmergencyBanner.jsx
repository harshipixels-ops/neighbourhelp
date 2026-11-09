import React, { useState } from 'react';
import { ShieldAlert, X, PhoneCall } from 'lucide-react';

export default function EmergencyBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 dark:bg-amber-950/30 border-b border-amber-200/50 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>
            <strong>NeighbourHelp is for non-emergency assistance only.</strong> If you or someone nearby is experiencing a medical, fire, or safety emergency, please immediately call your local emergency service{' '}
            <strong className="underline inline-flex items-center gap-0.5">
              <PhoneCall className="w-3 h-3 inline" /> 911 / 112 / 999
            </strong>.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-700 dark:text-amber-300 hover:opacity-75 p-0.5 rounded-full"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

