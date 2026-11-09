import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Heart,
  PlusCircle,
  Compass,
  LayoutDashboard,
  ClipboardList,
  HeartHandshake,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeSelector from './ThemeSelector';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinkClasses = ({ isActive }) =>
    `text-xs font-semibold px-3 py-2 rounded-xl transition-colors ${
      isActive
        ? 'bg-primary-light text-primary-brand'
        : 'text-main hover:bg-surface-hover'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-theme transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-2xl bg-primary-brand flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-main block leading-tight">
              Neighbour<span className="text-primary-brand">Help</span>
            </span>
            <span className="text-[10px] text-muted-custom font-medium block">
              Connecting Neighbours
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <NavLink to="/" className={navLinkClasses}>
            Home
          </NavLink>
          <NavLink to="/browse" className={navLinkClasses}>
            Browse Requests
          </NavLink>
          <a href="/#how-it-works" className="text-xs font-semibold px-3 py-2 rounded-xl text-main hover:bg-surface-hover transition-colors">
            How It Works
          </a>

          {user && (
            <>
              <NavLink to="/dashboard" className={navLinkClasses}>
                Dashboard
              </NavLink>
              <NavLink to="/my-requests" className={navLinkClasses}>
                My Requests
              </NavLink>
              <NavLink to="/my-volunteering" className={navLinkClasses}>
                My Volunteering
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`
              }
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        {/* Right Action Icons & Auth Profile */}
        <div className="flex items-center gap-2.5">
          <ThemeSelector />

          {user ? (
            <>
              <NotificationDropdown />

              <Link
                to="/create-request"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-brand text-white text-xs font-semibold hover:opacity-90 transition-opacity shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Get Help</span>
              </Link>

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 rounded-full border border-theme hover:bg-surface-hover transition-colors"
                  aria-label="User profile options"
                >
                  <img
                    src={user.profileImage || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface border border-theme shadow-xl py-2 z-50 fade-in">
                    <div className="px-4 py-2 border-b border-theme">
                      <p className="text-xs font-bold text-main truncate">{user.name}</p>
                      <p className="text-[11px] text-muted-custom truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary-light text-primary-brand">
                        📍 {user.neighbourhood}
                      </span>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-main hover:bg-surface-hover transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-muted-custom" />
                        <span>Profile & Settings</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-main hover:bg-surface-hover transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-muted-custom" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/my-requests"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-main hover:bg-surface-hover transition-colors"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-muted-custom" />
                        <span>My Requests</span>
                      </Link>

                      <Link
                        to="/my-volunteering"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-main hover:bg-surface-hover transition-colors"
                      >
                        <HeartHandshake className="w-3.5 h-3.5 text-muted-custom" />
                        <span>My Volunteering</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-semibold"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin Moderation</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-theme pt-1 px-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full border border-theme text-main hover:bg-surface-hover transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-primary-brand text-white hover:opacity-90 transition-opacity shadow-xs"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-main hover:bg-surface-hover"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-theme bg-surface px-4 pt-3 pb-6 space-y-2 fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-xs font-semibold text-main hover:bg-surface-hover"
          >
            Home
          </Link>
          <Link
            to="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-xs font-semibold text-main hover:bg-surface-hover"
          >
            Browse Requests
          </Link>

          {user ? (
            <>
              <Link
                to="/create-request"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-bold text-primary-brand bg-primary-light"
              >
                + Create Help Request
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-main hover:bg-surface-hover"
              >
                Dashboard
              </Link>
              <Link
                to="/my-requests"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-main hover:bg-surface-hover"
              >
                My Requests
              </Link>
              <Link
                to="/my-volunteering"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-main hover:bg-surface-hover"
              >
                My Volunteering
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-semibold text-main hover:bg-surface-hover"
              >
                Profile & Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30"
                >
                  Admin Moderation
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                Log Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-xl border border-theme text-xs font-semibold text-main"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-xl bg-primary-brand text-white text-xs font-semibold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

