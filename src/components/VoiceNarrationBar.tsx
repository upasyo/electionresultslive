import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, X, Mic } from 'lucide-react';
import { LiveUpdate } from '../types';

interface VoiceNarrationBarProps {
  isOpen: boolean;
  onClose: () => void;
  latestUpdates: LiveUpdate[];
  darkMode: boolean;
}

export const VoiceNarrationBar: React.FC<VoiceNarrationBarProps> = ({
  isOpen,
  onClose,
  latestUpdates,
  darkMode,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceType, setVoiceType] = useState<'male' | 'female'>('female');
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(80);
  const [currentTextIdx, setCurrentTextIdx] = useState(0);

  if (!isOpen) return null;

  const currentUpdate = latestUpdates[currentTextIdx] || {
    title: 'Election Update',
    message: 'All competitive Senate and House races continue to report verified results.',
    timestamp: 'Live'
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const textToSpeak = `${currentUpdate.title}. ${currentUpdate.message}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speed;
    utterance.volume = volume / 100;

    const voices = window.speechSynthesis.getVoices();
    // Try to pick male/female voice if available
    const selectedVoice = voices.find(v => 
      voiceType === 'female' ? v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Victoria') : v.name.includes('Male') || v.name.includes('David') || v.name.includes('Mark') || v.name.includes('George')
    ) || voices[0];

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-96 rounded-2xl shadow-2xl border p-5 transition-all ${darkMode ? 'bg-slate-900/95 border-slate-800 text-white backdrop-blur-lg' : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-lg'}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-red-600/10 text-red-600">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold">AI Voice Broadcaster</h4>
            <p className="text-[11px] text-slate-500">Live Audio Narration System</p>
          </div>
        </div>
        <button
          onClick={() => {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            onClose();
          }}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-4 space-y-4">
        {/* Voice Selection */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Voice Profile</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setVoiceType('female')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${voiceType === 'female' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500'}`}
            >
              Female Broadcast
            </button>
            <button
              onClick={() => setVoiceType('male')}
              className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${voiceType === 'male' ? 'bg-white dark:bg-slate-700 text-red-600 shadow-sm' : 'text-slate-500'}`}
            >
              Male Broadcast
            </button>
          </div>
        </div>

        {/* Live Transcript Preview */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>TRANSCRIPT QUEUE ({currentTextIdx + 1}/{latestUpdates.length})</span>
            <span>{currentUpdate.timestamp}</span>
          </div>
          <p className="text-xs font-medium line-clamp-2">
            {currentUpdate.title}: {currentUpdate.message}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeak}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Narration' : 'Play Narration'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentTextIdx((prev) => (prev + 1) % latestUpdates.length);
              }}
              title="Next Update"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-medium text-slate-500">
            Speed: {speed}x
          </div>
        </div>
      </div>
    </div>
  );
};
