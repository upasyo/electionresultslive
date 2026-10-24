import React from 'react';
import { NationalStats, StateData, LiveUpdate } from '../types';
import { ThreeElectoralMap } from './ThreeElectoralMap';
import { CountdownTimer } from './CountdownTimer';
import { TrendingUp, ShieldCheck, AlertCircle, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  stats: NationalStats;
  states: Record<string, StateData>;
  updates: LiveUpdate[];
  darkMode: boolean;
  setCurrentTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  states,
  updates,
  darkMode,
  setCurrentTab,
}) => {
  return (
    <div className="space-y-8">
      {/* 2026 Election Day Official Countdown Desk */}
      <CountdownTimer
        darkMode={darkMode}
        onEnterLiveMode={() => setCurrentTab('electionday')}
      />

      {/* Hero Headline Banner */}
      <div className={`p-8 rounded-3xl border transition-colors shadow-xl ${darkMode ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 border-slate-800' : 'bg-gradient-to-r from-slate-900 via-slate-900 to-red-950 text-white'}`}>

        <div className="max-w-4xl space-y-4 text-white">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold tracking-wider uppercase">
              2026 MIDTERM ELECTIONS LIVE TRACKER
            </span>
            <span className="text-xs text-slate-400">November 3, 2026 · AP Elections (ap.org/elections) & Google Civic Information Feed</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            2026 U.S. Senate, House & Gubernatorial Races
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
            Live primary calendar, contested seats, official battleground projections, and Election Day live vote counting synchronized directly from Associated Press Elections, Google Civic, and Gemini 3.8.
          </p>
          <div className="pt-2 flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setCurrentTab('candidates')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Gemini Candidate Intelligence</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2026 Summary Cards based on ap.org/elections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Senate Card */}
        <div className={`p-6 rounded-3xl border transition-colors shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600" />
                <h3 className="text-lg font-bold">U.S. Senate (2026)</h3>
              </div>
              <p className="text-xs text-slate-500">33 Class 2 Seats on the Ballot</p>
            </div>
            <button
              onClick={() => setCurrentTab('senate')}
              className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <span>View 33 Races</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <div className="text-xs font-semibold text-red-600 uppercase">GOP Defending</div>
                <div className="text-3xl font-black font-mono tracking-tight mt-1">{stats.senate.repDefending || 20}</div>
                <div className="text-[11px] text-slate-500 mt-1">Seats</div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-xs font-semibold text-blue-600 uppercase">Dem Defending</div>
                <div className="text-3xl font-black font-mono tracking-tight mt-1">{stats.senate.demDefending || 13}</div>
                <div className="text-[11px] text-slate-500 mt-1">Seats</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
              <strong>Top 2026 Battlegrounds:</strong> Georgia (Ossoff), North Carolina (Tillis), Maine (Collins), Michigan (Peters), Texas (Cornyn).
            </div>
          </div>
        </div>

        {/* Governor Card */}
        <div className={`p-6 rounded-3xl border transition-colors shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-purple-600" />
                <h3 className="text-lg font-bold">Governors (2026)</h3>
              </div>
              <p className="text-xs text-slate-500">36 State Executives Contested</p>
            </div>
            <button
              onClick={() => setCurrentTab('governors')}
              className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1"
            >
              <span>View 36 Races</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <div className="text-xs font-semibold text-purple-600 uppercase">Open / Term-Limited</div>
                <div className="text-3xl font-black font-mono tracking-tight mt-1">{stats.governors.termLimitedOpen || 14}</div>
                <div className="text-[11px] text-slate-500 mt-1">Governorships</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-xs font-semibold text-slate-500 uppercase">Incumbent Running</div>
                <div className="text-3xl font-black font-mono tracking-tight mt-1">22</div>
                <div className="text-[11px] text-slate-500 mt-1">States</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
              <strong>Open Powerhouses:</strong> California (Newsom), Florida (DeSantis), Georgia (Kemp), Michigan (Whitmer), Ohio (DeWine).
            </div>
          </div>
        </div>

        {/* House Card */}
        <div className={`p-6 rounded-3xl border transition-colors shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <h3 className="text-lg font-bold">U.S. House (2026)</h3>
              </div>
              <p className="text-xs text-slate-500">All 435 Districts on the Ballot</p>
            </div>
            <button
              onClick={() => setCurrentTab('house')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <span>View Districts</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                <div className="text-xs font-semibold text-red-600 uppercase">Current Majority</div>
                <div className="text-3xl font-black font-mono tracking-tight mt-1">{stats.house.currentRep || 220}</div>
                <div className="text-[11px] text-slate-500 mt-1">Republicans</div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-xs font-semibold text-blue-600 uppercase">Minority</div>
                <div className="text-3xl font-black font-mono tracking-tight mt-1">{stats.house.currentDem || 215}</div>
                <div className="text-[11px] text-slate-500 mt-1">Democrats</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
              <strong>Majority Threshold:</strong> 218 seats required for control. 42 battleground swing districts identified.
            </div>
          </div>
        </div>
      </div>

      {/* Google Civic, Gemini AI & AP Verified Candidates & Seats Explorer Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-colors shadow-lg ${darkMode ? 'bg-gradient-to-r from-purple-950/40 via-slate-900 to-blue-950/40 border-purple-900/40' : 'bg-gradient-to-r from-purple-50 via-white to-blue-50 border-purple-200'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span>Powered by Google Gemini 3.8</span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Google Civic & AP Elections Sync
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              2026 Candidates, Marquee Matchups & Gemini AI Dossiers
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Access real-time Gemini-grounded political intelligence across all 33 Class 2 Senate races (including Democratic nominee <strong>James Talarico</strong> in Texas, Jon Ossoff in Georgia, Roy Cooper in NC), 36 Governors, and battleground House districts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setCurrentTab('candidates')}
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>Explore Gemini Candidate Dossiers</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentTab('senate')}
              className={`px-4 py-3 rounded-2xl border font-bold text-xs transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'}`}
            >
              Senate Class 2 (33)
            </button>
            <button
              onClick={() => setCurrentTab('governors')}
              className={`px-4 py-3 rounded-2xl border font-bold text-xs transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800'}`}
            >
              Governors (36)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 3D Map Component Matching AP Elections Layout */}
      <ThreeElectoralMap states={states} darkMode={darkMode} />

      {/* Live Breaking News Ticker from AP Wire & Google Civic */}
      <div className={`p-6 rounded-3xl border transition-colors shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
            <h3 className="text-lg font-bold">Associated Press (AP) Elections & Google Civic Live Wire</h3>
          </div>
          <button
            onClick={() => setCurrentTab('coverage')}
            className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
          >
            <span>All Wire Updates</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {updates.slice(0, 4).map((update) => (
            <div key={update.id} className="py-4 flex items-start gap-4">
              <span className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-600 text-xs font-mono font-bold shrink-0 mt-0.5">
                {update.timestamp}
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">{update.title}</h4>
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{update.category}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{update.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
