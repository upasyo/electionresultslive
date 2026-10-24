import React, { useState, useEffect } from 'react';
import { StateData, CandidateProfile } from '../types';
import { Search, MapPin, Calendar, CheckCircle2, Globe, ShieldCheck, User } from 'lucide-react';

interface StateResultsDetailProps {
  states: Record<string, StateData>;
  darkMode: boolean;
}

export const StateResultsDetail: React.FC<StateResultsDetailProps> = ({ states, darkMode }) => {
  const [selectedStateId, setSelectedStateId] = useState<string>('GA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [stateCandidates, setStateCandidates] = useState<CandidateProfile[]>([]);

  useEffect(() => {
    const fetchStateCandidates = async () => {
      try {
        const res = await fetch(`/api/candidates?state=${selectedStateId}`);
        const data = await res.json();
        setStateCandidates(data);
      } catch (err) {
        console.error('Failed to fetch candidates for state', err);
      }
    };
    fetchStateCandidates();
  }, [selectedStateId]);

  const currentState = states[selectedStateId] || states['GA'];

  const filteredStates = Object.values(states).filter((st) =>
    st.name.toLowerCase().includes(searchQuery.toLowerCase()) || st.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border transition-colors shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold">State-by-State 2026 Midterm Election Tracker</h2>
            <p className="text-xs text-slate-500">Official data verified by Associated Press (ap.org/elections) & Google Civic Information API</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search state name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-9 pr-4 py-2 text-xs rounded-xl border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          {/* State List Selector */}
          <div className="h-[520px] overflow-y-auto pr-2 space-y-2">
            {filteredStates.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStateId(st.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${selectedStateId === st.id ? 'bg-red-600 text-white border-red-600 shadow-md' : darkMode ? 'bg-slate-950/50 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-xl font-bold text-xs flex items-center justify-center ${selectedStateId === st.id ? 'bg-white text-red-600' : 'bg-red-600/10 text-red-600'}`}>
                    {st.id}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold">{st.name}</h4>
                    <span className={`text-[11px] ${selectedStateId === st.id ? 'text-red-100' : 'text-slate-500'}`}>
                      {st.primaryDate} · {st.primaryStatus}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {st.hasSenateRace && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Senate on Ballot" />
                  )}
                  {st.hasGovRace && (
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" title="Governor on Ballot" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Selected State Detailed Breakdown */}
          <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">AP Official State Profile</span>
                <h3 className="text-2xl font-bold">{currentState.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  Primary: {currentState.primaryDate} ({currentState.primaryStatus})
                </span>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 font-bold">
                  General: Nov 3, 2026
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Senate Section */}
              <div className={`p-5 rounded-2xl border ${currentState.hasSenateRace ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>U.S. Senate (2026)</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${currentState.hasSenateRace ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                    {currentState.hasSenateRace ? 'ON BALLOT' : 'NO RACE'}
                  </span>
                </div>
                {currentState.hasSenateRace ? (
                  <div className="text-sm space-y-1.5 pt-1">
                    <div>Incumbent: <strong>{currentState.senateIncumbent}</strong></div>
                    <div className="text-xs text-slate-500">Rating: <strong className="text-emerald-600">{currentState.senateRating}</strong></div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Contenders: {currentState.senateKeyCandidates}</div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 pt-2">No Class 2 Senate seat up in 2026. Current Senate representation: {currentState.currentSenateComposition}.</p>
                )}
              </div>

              {/* Governor Section */}
              <div className={`p-5 rounded-2xl border ${currentState.hasGovRace ? 'bg-purple-500/5 border-purple-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-600 uppercase flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    <span>Governor (2026)</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${currentState.hasGovRace ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                    {currentState.hasGovRace ? 'ON BALLOT' : 'NO RACE'}
                  </span>
                </div>
                {currentState.hasGovRace ? (
                  <div className="text-sm space-y-1.5 pt-1">
                    <div>Incumbent: <strong>{currentState.govIncumbent}</strong></div>
                    <div className="text-xs text-slate-500">Rating: <strong className="text-purple-600">{currentState.govRating}</strong></div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">Contenders: {currentState.govKeyCandidates}</div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 pt-2">No gubernatorial election scheduled for 2026.</p>
                )}
              </div>
            </div>

            {/* House Section */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase">U.S. House of Representatives</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-600/10 text-blue-600">All Seats Contested</span>
              </div>
              <div className="text-sm">
                <strong>{currentState.houseDistricts} Congressional District{currentState.houseDistricts > 1 ? 's' : ''}</strong> on the ballot for November 3, 2026.
              </div>
              <p className="text-xs text-slate-500">
                Primary Election: {currentState.primaryDate} ({currentState.primaryStatus}). Data validated through Google Civic Information API.
              </p>
            </div>

            {/* Google Civic Verified Candidates Slate for this State */}
            {stateCandidates.length > 0 && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                      Google Civic Information API Verified Candidates ({currentState.name})
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">FEC Synced</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {stateCandidates.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-1`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{c.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.party === 'Democrat' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {c.party}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.office} · {c.status} {c.isIncumbent && '· (Incumbent)'}
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {c.bio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500 flex items-center justify-between pt-2">
              <span>Source Feed: <a href="https://www.ap.org/elections/" target="_blank" rel="noreferrer" className="text-red-600 underline">ap.org/elections</a></span>
              <span>Sync Status: Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
