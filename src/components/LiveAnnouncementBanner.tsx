import React, { useState, useEffect } from 'react';
import { Volume2, X, Radio, Clock, ArrowRight } from 'lucide-react';
import { LiveAnnouncement } from '../types';

interface LiveAnnouncementBannerProps {
  announcement: LiveAnnouncement;
  onDismiss: () => void;
  onReplay: () => void;
  onSentToArchive?: (announcement: LiveAnnouncement) => void;
  darkMode: boolean;
}

export const LiveAnnouncementBanner: React.FC<LiveAnnouncementBannerProps> = ({
  announcement,
  onDismiss,
  onReplay,
  onSentToArchive,
  darkMode,
}) => {
  const totalDuration = announcement.durationSeconds || 20;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalDuration);

  useEffect(() => {
    setSecondsRemaining(totalDuration);
  }, [announcement.id, totalDuration]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onSentToArchive) onSentToArchive(announcement);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [announcement, onDismiss, onSentToArchive, totalDuration]);

  const progressPct = Math.max(0, Math.min(100, (secondsRemaining / totalDuration) * 100));

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[95%] max-w-4xl animate-in slide-in-from-top-4 duration-300">
      <div className="p-5 rounded-3xl border-2 shadow-2xl backdrop-blur-xl bg-white/95 border-pink-500 text-slate-900 shadow-pink-200/50 overflow-hidden relative">
        {/* Top Countdown Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-blue-600 to-pink-500 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            {/* Pulsing On-Air Indicator */}
            <div className="w-12 h-12 rounded-2xl bg-pink-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-pink-500/30">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-600 text-white animate-pulse">
                  OFFICIAL LIVE ANNOUNCEMENT
                </span>
                <span className="text-xs font-bold text-sky-800">
                  {announcement.timestamp}
                </span>

                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-sky-100 text-sky-900 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-pink-500" />
                  <span>Visible for {secondsRemaining}s</span>
                </span>

                {announcement.targetAudience && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-pink-100 text-pink-800 border border-pink-200">
                    TARGET: {announcement.targetAudience}
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base font-extrabold mt-1 text-sky-950 leading-snug">
                "{announcement.text}"
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={onReplay}
              title="Replay Voice Audio"
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
            >
              <Volume2 className="w-4 h-4" />
              <span>Voice</span>
            </button>
            <button
              onClick={() => {
                if (onSentToArchive) onSentToArchive(announcement);
                onDismiss();
              }}
              title="Send to Announcement Portal Archive"
              className="px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span>Archive</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDismiss}
              title="Dismiss"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
