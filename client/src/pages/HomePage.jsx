import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  PlusCircle,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Home,
  HeartHandshake,
  Package,
  Send,
  HelpCircle,
  ChevronDown,
  Quote
} from 'lucide-react';
import { api } from '../services/api';
import RequestCard from '../components/RequestCard';
import CategoryIcon, { CATEGORIES } from '../components/CategoryIcon';

export default function HomePage() {
  const [featuredRequests, setFeaturedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await api.requests.getRequests({ status: 'open' });
        setFeaturedRequests((data.requests || []).slice(0, 3));
      } catch (err) {
        console.error('Error loading featured requests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const faqs = [
    {
      q: 'What kind of assistance can I ask for?',
      a: 'NeighbourHelp is for everyday, non-emergency tasks such as picking up groceries or prescriptions, helping carry a heavy box or piece of furniture, garden weeding, companion walks for seniors, or tech setup. It is not for emergency or professional licensed contractor work.'
    },
    {
      q: 'Is NeighbourHelp free to use?',
      a: 'Yes! NeighbourHelp is a 100% free community platform driven by local volunteers who want to give back and support their neighbours.'
    },
    {
      q: 'How is my privacy protected?',
      a: 'We never expose your exact home address, phone number, or email on public request cards. Only your general neighbourhood is visible. Sensitive details and specific instructions are only revealed to the volunteer you approve.'
    },
    {
      q: 'What should I do in an emergency?',
      a: 'NeighbourHelp is strictly non-emergency. In any medical, fire, or safety crisis, immediately call 911, 112, or your local emergency response service.'
    },
    {
      q: 'Can I both request help and volunteer?',
      a: 'Absolutely! A single account allows you to post requests when you need an extra hand, and offer assistance to nearby neighbours whenever you have free time.'
    }
  ];

  const testimonials = [
    {
      quote: "When I injured my ankle, I couldn't carry my dog's heavy food bag up the stairs. Marcus from two streets over saw my request and helped within 30 minutes. Incredible community spirit!",
      author: "Sarah J.",
      neighbourhood: "Maplewood District",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
    },
    {
      quote: "As a retiree, it's comforting to know there are kind young neighbours like David who can help set up my video calls with family. NeighbourHelp made asking feel dignified and simple.",
      author: "Eleanor R.",
      neighbourhood: "Oak Ridge Park",
      avatar: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=120&q=80"
    },
    {
      quote: "Volunteering on weekends has helped me meet wonderful people right in my neighbourhood. Helping carry groceries or clear tree branches takes little time but makes a huge difference.",
      author: "Marcus V.",
      neighbourhood: "Maplewood District",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
    }
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-light border border-theme text-primary-brand text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hyperlocal Community Assistance Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-main leading-[1.1] tracking-tight">
                Connecting Neighbours. <br />
                <span className="text-primary-brand">Helping Communities.</span>
              </h1>

              <p className="text-base sm:text-lg text-muted-custom max-w-xl leading-relaxed">
                Need a hand carrying a heavy box, collecting groceries, or assisting an elderly family member? NeighbourHelp connects you with kind, verified volunteers nearby. Simple, safe, and community-powered.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/create-request"
                  className="px-6 py-3.5 rounded-2xl bg-primary-brand text-white font-bold text-sm hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Get Help</span>
                </Link>

                <Link
                  to="/browse"
                  className="px-6 py-3.5 rounded-2xl bg-surface border border-theme text-main font-bold text-sm hover:bg-surface-hover transition-colors shadow-xs flex items-center gap-2"
                >
                  <HeartHandshake className="w-4 h-4 text-primary-brand" />
                  <span>Become a Volunteer</span>
                </Link>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-muted-custom">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Moderated & Safe</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero Cost to Anyone</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Privacy Protected</span>
                </div>
              </div>
            </div>

            {/* Right illustration / hero card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-surface border border-theme rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-theme">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary-light flex items-center justify-center text-primary-brand font-bold">
                      NH
                    </div>
                    <div>
                      <p className="text-xs font-bold text-main">Live Community Activity</p>
                      <p className="text-[10px] text-muted-custom">Updated moments ago</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Network
                  </span>
                </div>

                {/* Micro preview items */}
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-surface-hover/70 border border-theme/60 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-main truncate">Grocery pickup for Eleanor</p>
                      <p className="text-[10px] text-muted-custom">Oak Ridge Park • Accepted by David</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  </div>

                  <div className="p-3 rounded-2xl bg-surface-hover/70 border border-theme/60 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-main truncate">Moving couch to 2nd floor</p>
                      <p className="text-[10px] text-muted-custom">Maplewood • Marcus volunteered</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-medium">Pending</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-surface-hover/70 border border-theme/60 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-main truncate">Storm branch clearance</p>
                      <p className="text-[10px] text-muted-custom">Sunnyvale Gardens • Open</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-medium">Open</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <Link
                    to="/browse"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-brand hover:underline"
                  >
                    <span>Browse all neighbourhood requests</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-theme rounded-3xl p-8 sm:p-10 shadow-custom">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-theme">
            <div className="pt-4 lg:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary-brand">1,240+</p>
              <p className="text-xs text-muted-custom font-medium mt-1">Neighbours Connected</p>
            </div>
            <div className="pt-4 lg:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary-brand">980+</p>
              <p className="text-xs text-muted-custom font-medium mt-1">Assistance Requests Completed</p>
            </div>
            <div className="pt-4 lg:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary-brand">2,500+</p>
              <p className="text-xs text-muted-custom font-medium mt-1">Volunteer Hours Given</p>
            </div>
            <div className="pt-4 lg:pt-0">
              <p className="text-3xl sm:text-4xl font-extrabold text-primary-brand">100%</p>
              <p className="text-xs text-muted-custom font-medium mt-1">Free & Non-Profit Mission</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-brand">Simple & Transparent</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-main">How NeighbourHelp Works</h2>
          <p className="text-sm text-muted-custom">
            Whether you need a helping hand or want to lend one, we make coordination effortless and safe.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* For Requesters */}
          <div className="bg-surface border border-theme rounded-3xl p-8 shadow-custom space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary-brand text-xs font-bold">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>For Requesters</span>
            </div>
            <h3 className="text-xl font-bold text-main">Need assistance? Here is how to get help:</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-primary-light text-primary-brand font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="text-sm font-semibold text-main">Post your request</h4>
                  <p className="text-xs text-muted-custom mt-0.5">Describe what you need, your general neighbourhood, and preferred date or time.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-primary-light text-primary-brand font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="text-sm font-semibold text-main">Receive volunteer offers</h4>
                  <p className="text-xs text-muted-custom mt-0.5">Nearby community members review your post and offer to help with a friendly message.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-primary-light text-primary-brand font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="text-sm font-semibold text-main">Review & Accept</h4>
                  <p className="text-xs text-muted-custom mt-0.5">You choose the volunteer you feel most comfortable with, coordinate, and mark completed!</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/create-request"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary-brand hover:underline"
              >
                <span>Post a request now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* For Volunteers */}
          <div className="bg-surface border border-theme rounded-3xl p-8 shadow-custom space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-brand/20 text-main text-xs font-bold">
              <HeartHandshake className="w-3.5 h-3.5 text-primary-brand" />
              <span>For Volunteers</span>
            </div>
            <h3 className="text-xl font-bold text-main">Want to help? Here is how to volunteer:</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-surface-hover border border-theme font-bold text-xs flex items-center justify-center shrink-0">1</span>
                <div>
                  <h4 className="text-sm font-semibold text-main">Browse local requests</h4>
                  <p className="text-xs text-muted-custom mt-0.5">Filter requests by category, neighbourhood, or urgency to find tasks suited for you.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-surface-hover border border-theme font-bold text-xs flex items-center justify-center shrink-0">2</span>
                <div>
                  <h4 className="text-sm font-semibold text-main">Submit your offer</h4>
                  <p className="text-xs text-muted-custom mt-0.5">Send a quick note introducing yourself and your availability to the requester.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-surface-hover border border-theme font-bold text-xs flex items-center justify-center shrink-0">3</span>
                <div>
                  <h4 className="text-sm font-semibold text-main">Lend a hand</h4>
                  <p className="text-xs text-muted-custom mt-0.5">Once approved, coordinate the details and bring positive change to your neighbourhood.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary-brand hover:underline"
              >
                <span>Explore available requests</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Assistance Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-brand">Everyday Support</span>
          <h2 className="text-3xl font-extrabold text-main">Assistance Categories</h2>
          <p className="text-xs sm:text-sm text-muted-custom">
            Explore the different types of neighbourhood assistance available on NeighbourHelp.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/browse?category=${encodeURIComponent(cat)}`}
              className="bg-surface border border-theme hover:border-card-theme p-5 rounded-3xl text-center group shadow-xs hover:shadow-md transition-all flex flex-col items-center justify-center gap-3"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                <CategoryIcon category={cat} className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-main leading-tight group-hover:text-primary-brand transition-colors">
                {cat}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Live Requests */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-brand">Live Opportunities</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-main">Requests Awaiting Volunteers</h2>
          </div>
          <Link
            to="/browse"
            className="text-xs font-bold text-primary-brand hover:underline flex items-center gap-1"
          >
            <span>View all requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-surface border border-theme animate-pulse" />
            ))}
          </div>
        ) : featuredRequests.length === 0 ? (
          <div className="bg-surface border border-theme rounded-3xl p-10 text-center text-muted-custom text-xs">
            No open requests at this moment. You can be the first to post one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredRequests.map((req) => (
              <RequestCard key={req._id} request={req} />
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-brand">Community Stories</span>
          <h2 className="text-3xl font-extrabold text-main">Neighbours Helping Neighbours</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-surface border border-theme rounded-3xl p-6 shadow-custom flex flex-col justify-between">
              <Quote className="w-8 h-8 text-primary-brand/30 mb-3" />
              <p className="text-xs text-muted-custom leading-relaxed mb-6 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-theme">
                <img src={t.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-theme" />
                <div>
                  <h4 className="text-xs font-bold text-main">{t.author}</h4>
                  <p className="text-[11px] text-muted-custom">📍 {t.neighbourhood}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQs Accordion */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-brand">Common Questions</span>
          <h2 className="text-3xl font-extrabold text-main">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-surface border border-theme rounded-2xl overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-main hover:bg-surface-hover transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-custom transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-muted-custom leading-relaxed border-t border-theme/60 pt-3 fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-primary-brand text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Ready to strengthen your local community?
            </h3>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Join hundreds of residents who are making everyday life easier, safer, and more connected for each other.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/create-request"
              className="px-6 py-3 rounded-2xl bg-white text-primary-brand font-bold text-xs hover:bg-white/90 transition-all shadow-md"
            >
              Ask for Help
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 transition-all"
            >
              Sign Up as Volunteer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

