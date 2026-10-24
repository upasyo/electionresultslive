import React, { useState } from 'react';
import { LiveUpdate, LiveAnnouncement } from '../types';
import { Radio, Volume2, ShieldCheck, Clock, Archive, Sparkles, Filter, Search } from 'lucide-react';

interface LiveCoverageProps {
  updates: LiveUpdate[];
  announcementArchive?: LiveAnnouncement[];
  darkMode: boolean;
  onOpenNarration: () => void;
  onReplayAnnouncement?: (text: string) => void;
}

export const LiveCoverage: React.FC<LiveCoverageProps> = ({
  updates,
  announcementArchive = [],
  darkMode,
  onOpenNarration,
  onReplayAnnouncement
}) => {
  const [activeTab, setActiveTab] = useState<'breaking_wire' | 'announcement_portal'>('breaking_wire');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAnnouncements = announcementArchive.filter(ann => 
    !searchQuery || ann.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="p-6 md:p-8 rounded-3xl border-2 transition-colors shadow-lg bg-sky-50/90 border-sky-200 text-slate-900">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-sky-200">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2 text-sky-950">
              <span>Live Election Coverage & Announcement Portal</span>
              <span className="w-2.5 h-2.5 rounded-full bg-pink-600 animate-pulse" />
            </h2>
            <p className="text-xs text-sky-800 font-medium">Real-time AP news wire bulletins and official administrator announcement archives</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNarration}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>AI Voice Narration</span>
            </button>
          </div>
        </div>

        {/* Tab Toggle: AP Breaking Wire vs Announcement Portal */}
        <div className="flex gap-2 pt-6 pb-2 border-b border-sky-200">
          <button
            onClick={() => setActiveTab('breaking_wire')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'breaking_wire'
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white text-sky-900 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            <Radio className="w-4 h-4 text-pink-500 animate-pulse" />
            <span>AP Breaking News Wire ({updates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('announcement_portal')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              activeTab === 'announcement_portal'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-white text-sky-900 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            <Archive className="w-4 h-4 text-pink-400" />
            <span>Admin Announcement Portal ({announcementArchive.length})</span>
          </button>
        </div>

        {/* TAB 1: BREAKING WIRE */}
        {activeTab === 'breaking_wire' && (
          <div className="space-y-4 pt-6 animate-in fade-in duration-200">
            {updates.map((update) => (
              <div
                key={update.id}
                className="p-5 rounded-2xl border border-sky-200 bg-white transition-all shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between pb-3 border-b border-sky-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 font-mono font-bold text-xs">
                      {update.timestamp}
                    </span>
                    <span className="text-xs font-black text-pink-600 uppercase">
                      {update.category}
                    </span>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase ${
                    update.significance === 'HIGH' ? 'bg-pink-100 text-pink-700 border border-pink-200' : 'bg-sky-100 text-sky-700'
                  }`}>
                    {update.significance} PRIORITY
                  </span>
                </div>

                <div className="py-3 space-y-1">
                  <h3 className="text-base font-bold text-sky-950">{update.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">{update.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: ANNOUNCEMENT PORTAL ARCHIVE */}
        {activeTab === 'announcement_portal' && (
          <div className="space-y-4 pt-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-pink-900 font-bold">
                <Sparkles className="w-4 h-4 text-pink-600 shrink-0" />
                <span>All broadcasted CMS administrator announcements move here after completing their on-screen duration timer.</span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-pink-200 bg-white text-xs text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {filteredAnnouncements.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-sky-200 text-sky-800 space-y-2">
                <Archive className="w-8 h-8 text-sky-400 mx-auto" />
                <p className="text-xs font-bold">No archived announcements in portal yet.</p>
                <p className="text-[11px] text-slate-500">When an announcement finishes its on-screen duration, it will automatically register in this portal.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAnnouncements.map((ann, idx) => (
                  <div
                    key={ann.id || idx}
                    className="p-4 rounded-2xl border border-pink-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-800 uppercase">OFFICIAL ANNOUNCEMENT</span>
                        <span className="text-xs text-sky-700 font-mono font-semibold">{ann.timestamp}</span>
                        {ann.targetAudience && (
                          <span className="text-[10px] text-slate-500 font-bold">Audience: [{ann.targetAudience}]</span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-sky-950">"{ann.text}"</p>
                    </div>

                    {onReplayAnnouncement && (
                      <button
                        onClick={() => onReplayAnnouncement(ann.text)}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Replay Audio</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
