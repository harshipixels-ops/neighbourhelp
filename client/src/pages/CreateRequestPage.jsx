import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PlusCircle, ShieldAlert, ArrowLeft, Send, CheckCircle, Info, PhoneCall } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CategoryIcon, { CATEGORIES } from '../components/CategoryIcon';

const EMERGENCY_WORDS = [
  '911', 'ambulance', 'emergency room', 'severe bleeding', 'cardiac arrest',
  'heart attack', 'unconscious', 'choking', 'stroke', 'house fire',
  'firefighter', 'active crime', 'gunshot', 'poisoning', 'overdose',
  'suicide', 'self harm', 'kill myself', 'life threatening'
];

export default function CreateRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [neighbourhood, setNeighbourhood] = useState(user?.neighbourhood || '');
  const [preferredDate, setPreferredDate] = useState('');
  const [description, setDescription] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Real-time emergency detection
  const detectedEmergency = useMemo(() => {
    const combined = `${title} ${description} ${additionalInstructions}`.toLowerCase();
    return EMERGENCY_WORDS.find(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(combined);
    });
  }, [title, description, additionalInstructions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!title.trim() || !description.trim() || !neighbourhood.trim()) {
      setError('Please fill in all required fields (title, description, and neighbourhood).');
      return;
    }

    if (detectedEmergency) {
      setError('Emergency requests cannot be submitted on NeighbourHelp. Please call emergency services.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.requests.createRequest({
        title,
        category,
        neighbourhood,
        preferredDate,
        description,
        additionalInstructions
      });
      navigate(`/requests/${res.request._id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-custom hover:text-main transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Browse Requests</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary-brand text-xs font-bold">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Assistance Request</span>
        </div>
        <h1 className="text-3xl font-extrabold text-main tracking-tight">Ask for Community Help</h1>
        <p className="text-xs sm:text-sm text-muted-custom">
          Describe the everyday assistance you need. Nearby volunteers will be notified and can offer to help.
        </p>
      </div>

      {/* Real-time Emergency Warning if emergency keywords detected */}
      {detectedEmergency && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-900 dark:text-rose-200 text-xs space-y-2 fade-in">
          <div className="flex items-center gap-2 font-bold text-sm text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Emergency Situation Detected</span>
          </div>
          <p className="leading-relaxed">
            NeighbourHelp is strictly intended for ordinary everyday tasks (groceries, light lifting, errands). We cannot accept urgent or life-threatening emergency requests.
          </p>
          <p className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4" /> Please immediately call 911 / 112 / 999 or your local emergency dispatch.
          </p>
        </div>
      )}

      {error && !detectedEmergency && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-surface border border-theme rounded-3xl p-6 sm:p-8 shadow-custom space-y-6">
        {/* Request Title */}
        <div>
          <label className="block text-xs font-bold text-main mb-1.5">
            Request Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Help carrying heavy grocery boxes to ground floor apartment"
            className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
          />
          <p className="text-[11px] text-muted-custom mt-1">
            Keep it clear and specific so nearby neighbours know how they can assist.
          </p>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold text-main mb-2">
            Category <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-3 rounded-2xl text-left border transition-all flex items-center gap-2.5 text-xs font-semibold ${
                  category === cat
                    ? 'border-primary-brand bg-primary-light text-primary-brand ring-1 ring-primary-brand'
                    : 'border-theme bg-surface text-main hover:bg-surface-hover'
                }`}
              >
                <CategoryIcon category={cat} className="w-4 h-4 shrink-0" />
                <span className="truncate">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Neighbourhood & Preferred Date (2 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-main mb-1.5">
              General Neighbourhood / Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={neighbourhood}
              onChange={(e) => setNeighbourhood(e.target.value)}
              placeholder="e.g. Maplewood District, Block 4"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
            />
            <p className="text-[11px] text-muted-custom mt-1">
              🔒 Visible publicly. Do NOT include your exact apartment or door number here.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-main mb-1.5">
              Preferred Date & Time (Optional)
            </label>
            <input
              type="text"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              placeholder="e.g. Saturday morning around 11:00 AM"
              className="w-full px-4 py-2.5 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
            />
            <p className="text-[11px] text-muted-custom mt-1">
              Give volunteers an idea of your preferred timeline.
            </p>
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold text-main mb-1.5">
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you need help with in detail, approximate weight or time required, and any tools provided..."
            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
          />
        </div>

        {/* Additional Private Instructions */}
        <div className="p-4 rounded-2xl bg-surface-hover/70 border border-theme space-y-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary-brand shrink-0" />
            <label className="text-xs font-bold text-main">
              Private Instructions & Contact Details (Protected)
            </label>
          </div>
          <p className="text-[11px] text-muted-custom">
            These instructions (e.g. building buzzer code, specific doorway, phone number) are kept confidential and will <strong>ONLY be revealed to the volunteer you approve</strong>.
          </p>
          <textarea
            rows={2}
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="e.g. Buzz code #204, ring my mobile upon arrival: 555-0192."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-theme bg-surface text-main focus:outline-none focus:ring-2 focus:ring-primary-brand"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-theme">
          <Link
            to="/browse"
            className="px-5 py-2.5 text-xs font-semibold rounded-xl border border-theme text-main hover:bg-surface-hover transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !!detectedEmergency}
            className="px-6 py-2.5 text-xs font-bold rounded-xl bg-primary-brand text-white hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 shadow-xs"
          >
            <Send className="w-4 h-4" />
            {loading ? 'Publishing...' : 'Publish Help Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

