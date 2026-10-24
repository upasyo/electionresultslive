import React from 'react';
import { Shield, Volume2, Tv } from 'lucide-react';

import { NationalStats } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenNarration: () => void;
  onToggleGraffiti?: () => void;
  nationalStats: NationalStats;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  darkMode,
  setDarkMode,
  onOpenNarration,
  nationalStats,
}) => {
  const isResultsAccessible = nationalStats?.isTimerOver || nationalStats?.electionDayDeskOpen;
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-6 px-6 py-3.5 border-b bg-sky-50/95 border-sky-200 text-slate-900 backdrop-blur-md shadow-sm transition-colors">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-600 via-blue-600 to-pink-500 flex items-center justify-center text-white font-black shadow-md">
            MP
          </div>
          <div>
            <span className="text-lg font-extrabold tracking-tight group-hover:text-pink-600 transition-colors block text-sky-950">
              MidtermPulse 2026
            </span>
            <span className="text-[10px] tracking-wider uppercase font-bold text-pink-600 block">
              US Election Night Desk
            </span>
          </div>
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-4 text-xs font-bold">
        {[
          { id: 'home', label: 'Dashboard' },
          { id: 'candidates', label: 'Candidates & Seats' },
          { id: 'senate', label: 'Senate (33)' },
          { id: 'house', label: 'House' },
          { id: 'governors', label: 'Governors (36)' },
          { id: 'states', label: 'State Results', restricted: !isResultsAccessible },
          { id: 'coverage', label: 'Live Coverage' },
          { id: 'livestream', label: 'Broadcast Mode' },
          { id: 'about', label: 'About' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => tab.restricted ? alert('Results portal will open after timer ends or by administrator trigger.') : setCurrentTab(tab.id)}
            className={`whitespace-nowrap shrink-0 transition-all px-2.5 py-1 rounded-lg ${
              currentTab === tab.id
                ? 'bg-sky-600 text-white font-black shadow-sm'
                : tab.restricted
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-sky-900 hover:bg-sky-100 hover:text-pink-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Zone 3: Actions & Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenNarration}
          title="Voice Narration"
          className="p-2 rounded-xl border border-sky-200 bg-white hover:bg-sky-100 text-sky-900 transition-colors shadow-sm"
        >
          <Volume2 className="w-4 h-4 text-sky-600" />
        </button>

        <button
          onClick={() => setCurrentTab('livestream')}
          title="Live Broadcast View"
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-colors shadow-sm ${
            currentTab === 'livestream' ? 'bg-pink-600 text-white' : 'bg-white hover:bg-sky-100 text-sky-900 border border-sky-200'
          }`}
        >
          <Tv className="w-3.5 h-3.5 text-pink-500" />
          <span>Stream</span>
        </button>

        <button
          onClick={() => setCurrentTab('admin')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-md"
        >
          <Shield className="w-3.5 h-3.5 text-pink-400" />
          <span>CMS Admin</span>
        </button>
      </div>
    </header>
  );
};
