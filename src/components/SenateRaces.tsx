import React, { useState } from 'react';
import { SenateRace } from '../types';
import { Search, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react';

interface SenateRacesProps {
  races: SenateRace[];
  darkMode: boolean;
}

export const SenateRaces: React.FC<SenateRacesProps> = ({ races, darkMode }) => {
  const [filterRating, setFilterRating] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRaces = races.filter((race) => {
    const matchesSearch = race.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.incumbent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      race.keyCandidates.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterRating === 'ALL' || race.rating === filterRating;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-colors shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded bg-emerald-600" />
              <h2 className="text-xl font-bold">2026 U.S. Senate Class 2 Races ({races.length} Seats)</h2>
            </div>
            <p className="text-xs text-slate-500">Official candidate roster verified by Associated Press (ap.org/elections) & Google Civic Information API</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search state, candidate, party..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 pr-4 py-2 text-xs rounded-xl border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex-wrap">
              {['ALL', 'Tossup', 'Lean D', 'Lean R', 'Safe D', 'Safe R'].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setFilterRating(rating)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filterRating === rating ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2026 Senate Battleground Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {filteredRaces.map((race) => (
            <div
              key={race.id}
              className={`p-5 rounded-2xl border transition-all ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-600 font-bold flex items-center justify-center text-xs">
                    {race.state}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold">{race.stateName} Senate</h4>
                    <span className="text-[11px] text-slate-500">Incumbent: {race.incumbent} ({race.party})</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${race.rating === 'Tossup' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' : race.rating.includes('D') ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                    {race.rating}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">{race.primaryStatus}</div>
                </div>
              </div>

              <div className="py-4 space-y-3">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-xs font-semibold text-slate-500">KEY 2026 CONTENDERS</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{race.keyCandidates}</div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {race.statusDescription}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Primary: <strong>{race.primaryDate}</strong></span>
                </span>
                <span className="font-mono text-emerald-600 font-semibold">General: Nov 3, 2026</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
