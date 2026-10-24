import React from 'react';
import { ShieldCheck, Info, Award } from 'lucide-react';

interface AboutViewProps {
  darkMode: boolean;
}

export const AboutView: React.FC<AboutViewProps> = ({ darkMode }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className={`p-8 rounded-3xl border transition-colors shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-600 flex items-center justify-center font-bold">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold">About MidtermPulse 2026</h2>
            <p className="text-xs text-slate-500">Professional US Election Results Broadcasting Platform</p>
          </div>
        </div>

        <div className="py-6 space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Status Disclosures</h3>
            <p>
              MidtermPulse distinguishes official results, media projections, and unofficial estimates rather than presenting them as interchangeable:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>LIVE RESULTS:</strong> Newly received vote totals reported by state and county election boards.</li>
              <li><strong>PROJECTED:</strong> Major broadcast news desks and decision teams have projected a statistical winner.</li>
              <li><strong>OFFICIAL:</strong> Relevant county or state authority has officially declared the preliminary result.</li>
              <li><strong>CERTIFIED:</strong> Final results have been fully certified by state election commissioners.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Authorized 2026 Data Providers</h3>
            <p>
              Data feeds and primary election schedules are ingested from the <strong>Associated Press (AP) Elections service (<a href="https://www.ap.org/elections/" target="_blank" rel="noreferrer" className="text-red-600 underline">ap.org/elections</a>)</strong> and the <strong>Google Civic Information API</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Class 2 U.S. Senate Seats:</strong> 33 Senate seats contested across the 50 states on November 3, 2026.</li>
              <li><strong>36 Gubernatorial Seats:</strong> 36 state executive offices, including 14 open or term-limited seats (CA, FL, GA, MI, OH).</li>
              <li><strong>All 435 U.S. House Districts:</strong> Complete national congressional district tracking.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Technology & Architecture</h3>
            <p>
              Built with React, Vite, Tailwind CSS, Express, and Three.js 3D spatial electoral mapping. Supports automated background polling, YouTube livestream broadcasting, and AI voice narration synthesis.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-red-600" />
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Platform Creditation</h4>
                <p className="text-xs text-slate-500">Designed & Developed by Upasyo Kushari</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-red-600/10 text-red-600 font-bold">
              November 3, 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
