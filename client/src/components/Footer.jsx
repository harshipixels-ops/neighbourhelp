import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, HelpCircle, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-theme bg-surface mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-brand flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <span className="text-base font-extrabold text-main">
                Neighbour<span className="text-primary-brand">Help</span>
              </span>
            </div>
            <p className="text-xs text-muted-custom leading-relaxed">
              Connecting neighbours and helping communities. A trusted, moderated platform for everyday, non-emergency assistance.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-custom pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe & Moderated Platform</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-main mb-3">Explore</h4>
            <ul className="space-y-2 text-xs text-muted-custom">
              <li>
                <Link to="/" className="hover:text-primary-brand transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-primary-brand transition-colors">Browse Requests</Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-primary-brand transition-colors">How It Works</a>
              </li>
              <li>
                <Link to="/create-request" className="hover:text-primary-brand transition-colors">Get Help</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-main mb-3">Assistance Types</h4>
            <ul className="space-y-2 text-xs text-muted-custom">
              <li>
                <Link to="/browse?category=Grocery and Essentials" className="hover:text-primary-brand transition-colors">Grocery & Essentials</Link>
              </li>
              <li>
                <Link to="/browse?category=Household Assistance" className="hover:text-primary-brand transition-colors">Household Assistance</Link>
              </li>
              <li>
                <Link to="/browse?category=Elderly Assistance" className="hover:text-primary-brand transition-colors">Elderly Assistance</Link>
              </li>
              <li>
                <Link to="/browse?category=Carrying and Moving" className="hover:text-primary-brand transition-colors">Carrying & Moving</Link>
              </li>
              <li>
                <Link to="/browse?category=Errands and Deliveries" className="hover:text-primary-brand transition-colors">Errands & Deliveries</Link>
              </li>
            </ul>
          </div>

          {/* Safety & Notice */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-main mb-3">Community Safety</h4>
            <p className="text-xs text-muted-custom leading-relaxed">
              NeighbourHelp is designed strictly for routine everyday neighbourhood assistance.
            </p>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px]">
              🚨 <strong>Not an Emergency Service:</strong> In case of urgent police, fire, or medical emergencies, please immediately call 911 / 112 / 999.
            </div>
          </div>
        </div>

        <div className="border-t border-theme pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-custom">
          <p>© {new Date().getFullYear()} NeighbourHelp Platform. Built with care for stronger neighbourhoods.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary-brand" /> Hyperlocal & Privacy-First
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

