import React, { useState, useEffect } from 'react';
import { NationalStats, StateData, AdminConfig } from '../types';
import { Tv, Radio, Volume2, ShieldCheck, Play, Pause, ArrowDownUp } from 'lucide-react';

interface LiveStreamModeProps {
  stats: NationalStats;
  states: Record<string, StateData>;
  adminConfig: AdminConfig;
  onOpenNarration: () => void;
}

export const LiveStreamMode: React.FC<LiveStreamModeProps> = ({ stats, states, adminConfig, onOpenNarration }) => {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isAutoScrolling) {
      let scrollDir = 1;
      interval = setInterval(() => {
        window.scrollBy({ top: scrollDir * 2, behavior: 'smooth' });
        if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 50) {
          scrollDir = -1;
        } else if (window.scrollY <= 10) {
          scrollDir = 1;
        }
      }, 50);
    } else {
      if ((window as any).__broadcastScrollInterval) {
        clearInterval((window as any).__broadcastScrollInterval);
      }
    }
    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        {/* Broadcast Header Bar */}
        <div className="bg-red-600 px-6 py-3 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <span className="font-black tracking-wider text-sm">{adminConfig.streamTitle}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${isAutoScrolling ? 'bg-white text-red-600 shadow-md' : 'bg-red-700 text-white hover:bg-red-800'}`}
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>{isAutoScrolling ? 'Pause Broadcast Auto-Scroll' : 'Start Broadcast Auto-Scroll'}</span>
            </button>
            <span className="text-xs font-mono font-bold bg-black/30 px-3 py-1 rounded-lg">1920 × 1080p · RTMPS Active</span>
          </div>
        </div>

        {/* 1080p Broadcast Preview / Embed */}
        <div className="relative aspect-video bg-slate-900 flex flex-col justify-between p-8 overflow-hidden">
          {/* Top Ticker Overlay */}
          <div className="flex items-center justify-between bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 z-10">
            <div className="flex items-center gap-4">
              <span className="px-2.5 py-1 rounded bg-red-600 text-white font-bold text-xs">AP & CNN FEED</span>
              <span className="text-sm font-semibold">{adminConfig.headline}</span>
            </div>
            <div className="text-xs font-mono text-slate-400">{stats.lastUpdateTimestamp}</div>
          </div>

          {/* Center Content / Embedded Stream Player */}
          <div className="absolute inset-0 pt-20 pb-16 px-8 flex items-center justify-center">
            <div className="w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-black relative flex items-center justify-center">
              <iframe
                src={adminConfig.youtubeEmbedUrl}
                title={adminConfig.streamTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Bottom Broadcast Ticker */}
          <div className="flex items-center justify-between bg-black/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 z-10">
            <div className="text-xs font-medium text-slate-300">
              Data synchronized via AP Elections API & Google Civic Information API · CNN Live Feed
            </div>
            <button
              onClick={onOpenNarration}
              className="flex items-center gap-2 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice Narration Active</span>
            </button>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h4 className="font-bold text-sm">YouTube Live & RTMP Broadcasting</h4>
            <p className="text-xs text-slate-400">Stream Key: <code className="text-red-400">{adminConfig.rtmpStreamKey}</code></p>
          </div>
          <a
            href="https://studio.youtube.com"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Open YouTube Studio
          </a>
        </div>
      </div>
    </div>
  );
};
