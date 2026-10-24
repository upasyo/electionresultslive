import React from 'react';

interface FooterProps {
  darkMode: boolean;
}

export const Footer: React.FC<FooterProps> = ({ darkMode }) => {
  return (
    <footer className={`border-t py-12 px-6 mt-16 transition-colors ${darkMode ? 'bg-slate-950 border-slate-900 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        <div className="space-y-1 text-center md:text-left">
          <p className="font-semibold text-slate-900 dark:text-white">
            MidtermPulse 2026 — US Election Results Broadcasting Platform
          </p>
          <p className="text-xs text-slate-500">
            Official data feeds, media projections, and certified state authority metrics.
          </p>
        </div>

        <div className="text-center md:text-right space-y-1">
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Designed & Developed by Upasyo Kushari
          </p>
          <p className="text-[11px] text-slate-500">
            Election Date: November 3, 2026 · All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};
