import React, { useState, useEffect } from 'react';
import { Clock, Radio, Play, Flame, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface CountdownTimerProps {
  darkMode: boolean;
  onEnterLiveMode?: () => void;
  isLiveActive?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  darkMode,
  onEnterLiveMode,
  isLiveActive = false,
}) => {
  // Target: November 3, 2026 at 09:00:00 IST (UTC+05:30)
  const targetDateStr = '2026-11-03T09:00:00+05:30';
  const targetDate = new Date(targetDateStr).getTime();

  const [forceExpired, setForceExpired] = useState<boolean>(false);
  const [selectedTz, setSelectedTz] = useState<'IST' | 'EST' | 'UTC'>('IST');

  const calculateTime = (): TimeRemaining => {
    if (forceExpired) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true };
    }
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, totalMs: diff, isExpired: false };
  };

  const [timeLeft, setTimeLeft] = useState<TimeRemaining>(calculateTime);

  useEffect(() => {
    const interval = setInterval(() => {
      const updated = calculateTime();
      setTimeLeft(updated);
      if (updated.isExpired && onEnterLiveMode && !forceExpired) {
        onEnterLiveMode();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [forceExpired]);

  const handleSimulateZero = () => {
    setForceExpired(true);
    if (onEnterLiveMode) {
      onEnterLiveMode();
    }
  };

  const isCountingZero = timeLeft.isExpired || forceExpired;

  return (
    <div
      className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all duration-300 ${
        darkMode
          ? isCountingZero
            ? 'bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 border-red-700/60 text-white'
            : 'bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-slate-800 text-white'
          : isCountingZero
          ? 'bg-gradient-to-r from-red-900 via-slate-900 to-slate-900 text-white border-red-800'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950 text-white border-slate-800'
      }`}
    >
      {/* Background ambient glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Left: Headline & Status */}
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-1.5 shadow-md ${
                isCountingZero
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{isCountingZero ? '🔴 LIVE COUNTING ACTIVE' : 'COUNTDOWN TO ELECTION DAY'}</span>
            </span>

            <span className="text-xs text-slate-300 font-mono">
              Target: Tuesday, Nov 3, 2026 · 9:00 AM IST
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isCountingZero
              ? 'Election Day In Progress: Live Ballot Counting'
              : 'Official 2026 Midterm Election Day Countdown'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {isCountingZero
              ? 'The 9:00 AM IST milestone has commenced! Live automated synchronization with AP Elections wire, Google Civic API, and Gemini 3.8 is broadcasting live returns every 15 seconds.'
              : 'Ticking down to 9:00 AM IST on Election Day (November 3, 2026). Once reached, live vote tabulation, precinct results, and Gemini intelligence automatically activate.'}
          </p>

          {/* Timezone Switches */}
          <div className="pt-1 flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Clock Ref:</span>
            {(['IST', 'EST', 'UTC'] as const).map((tz) => (
              <button
                key={tz}
                onClick={() => setSelectedTz(tz)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all ${
                  selectedTz === tz
                    ? 'bg-white text-slate-900 shadow'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
              >
                {tz === 'IST' && '9:00 AM IST (India)'}
                {tz === 'EST' && '10:30 PM EST (Eve)'}
                {tz === 'UTC' && '03:30 AM UTC'}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Digital Countdown Clock & Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Digit Boxes */}
          <div className="grid grid-cols-4 gap-2.5 text-center">
            {/* Days */}
            <div className="p-3 sm:p-4 rounded-2xl bg-black/50 border border-white/15 min-w-[70px] sm:min-w-[85px] shadow-inner">
              <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Days
              </div>
            </div>

            {/* Hours */}
            <div className="p-3 sm:p-4 rounded-2xl bg-black/50 border border-white/15 min-w-[70px] sm:min-w-[85px] shadow-inner">
              <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Hours
              </div>
            </div>

            {/* Minutes */}
            <div className="p-3 sm:p-4 rounded-2xl bg-black/50 border border-white/15 min-w-[70px] sm:min-w-[85px] shadow-inner">
              <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-emerald-400">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Mins
              </div>
            </div>

            {/* Seconds */}
            <div className="p-3 sm:p-4 rounded-2xl bg-black/50 border border-white/15 min-w-[70px] sm:min-w-[85px] shadow-inner">
              <div className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-red-400 animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                Secs
              </div>
            </div>
          </div>

          {/* No manual controls for public */}
        </div>
      </div>
    </div>
  );
};
