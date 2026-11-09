import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Sun, Moon, Check } from 'lucide-react';

export default function ThemeSelector() {
  const { theme, setTheme, mode, toggleMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const themes = [
    {
      id: 'sage',
      name: 'Sage & Ivory',
      colorPreview: 'bg-[#214E3A]',
      accentPreview: 'bg-[#A8BFA5]'
    },
    {
      id: 'midnight',
      name: 'Midnight & Lavender',
      colorPreview: 'bg-[#2D3168]',
      accentPreview: 'bg-[#8782D8]'
    },
    {
      id: 'terracotta',
      name: 'Terracotta & Cream',
      colorPreview: 'bg-[#C0562F]',
      accentPreview: 'bg-[#F4A261]'
    }
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className="flex items-center gap-1.5 p-1 rounded-full border border-theme bg-surface shadow-xs">
        {/* Theme Palette Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-full text-main hover:bg-surface-hover transition-colors"
          title="Change Colour Theme"
          aria-label="Change colour theme"
        >
          <Palette className="w-3.5 h-3.5 text-primary-brand" />
          <span className="hidden sm:inline">Theme</span>
        </button>

        <span className="w-px h-4 bg-gray-200 dark:bg-gray-700" />

        {/* Light / Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleMode}
          className="p-1.5 rounded-full text-muted-custom hover:text-main hover:bg-surface-hover transition-colors"
          title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {mode === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-slate-600" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface border border-theme shadow-xl py-2 z-50 fade-in">
          <div className="px-3.5 py-2 border-b border-theme text-xs font-semibold uppercase tracking-wider text-muted-custom">
            Select Visual Theme
          </div>
          <div className="p-1 space-y-0.5">
            {themes.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition-colors ${
                  theme === t.id
                    ? 'bg-primary-light text-primary-brand font-semibold'
                    : 'text-main hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex -space-x-1">
                    <span className={`w-3.5 h-3.5 rounded-full ${t.colorPreview} ring-1 ring-white dark:ring-gray-800`} />
                    <span className={`w-3.5 h-3.5 rounded-full ${t.accentPreview} ring-1 ring-white dark:ring-gray-800`} />
                  </div>
                  <span>{t.name}</span>
                </div>
                {theme === t.id && <Check className="w-3.5 h-3.5 text-primary-brand" />}
              </button>
            ))}
          </div>

          <div className="border-t border-theme mt-1 pt-1 px-3 py-1.5 flex items-center justify-between text-xs text-muted-custom">
            <span>Appearance</span>
            <button
              onClick={toggleMode}
              className="text-primary-brand font-medium hover:underline flex items-center gap-1"
            >
              {mode === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

