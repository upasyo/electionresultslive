import React, { useState, useEffect } from 'react';
import { 
  Shield, Lock, CheckCircle2, RefreshCw, AlertCircle, Save, Tv, Globe, ListPlus, 
  Trash2, Radio, Calendar, Sparkles, Sliders, Users, Flag, Layers, FileText, Plus,
  BarChart3, Edit3, Eye, Zap, Flame, UserCheck, Play, Landmark, Building2, Crown,
  Swords, Target, Clock
} from 'lucide-react';
import { AdminConfig, NationalStats, StateData, CandidateProfile, LiveUpdate, SenateRace, HouseRace, GovRace, TargetAudience } from '../types';

interface AdminPortalProps {
  adminConfig: AdminConfig;
  onUpdateConfig: (newConfig: Partial<AdminConfig>) => void;
  onSimulateUpdate: () => void;
  darkMode: boolean;
}

type TabType = 'SYSTEM_TIMER' | 'NATIONAL_STATS' | 'STATES_EDITOR' | 'CANDIDATES' | 'AP_WIRE' | 'RACES_ROSTER' | 'ELECTION_DAY_STAGE';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  adminConfig,
  onUpdateConfig,
  onSimulateUpdate,
  darkMode,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('SYSTEM_TIMER');

  // System & Timer State
  const [headline, setHeadline] = useState(adminConfig.headline || '');
  const [subheadline, setSubheadline] = useState(adminConfig.subheadline || '');
  const [refreshInterval, setRefreshInterval] = useState(adminConfig.refreshInterval || 10);
  const [timerDate, setTimerDate] = useState(adminConfig.timerDate || '2026-11-03T09:00:00+05:30');
  const [postTimerHeadline, setPostTimerHeadline] = useState(adminConfig.postTimerHeadline || '2026 MIDTERM ELECTION DAY COUNTING DESK LIVE');
  const [postTimerMessage, setPostTimerMessage] = useState(adminConfig.postTimerMessage || 'Real-time sync active from Associated Press & Google Civic API. Automatic updates every 15 seconds.');
  const [apApiKey, setApApiKey] = useState(adminConfig.apApiKey || '');
  const [googleCivicApiKey, setGoogleCivicApiKey] = useState(adminConfig.googleCivicApiKey || '');
  const [cnnFeedUrl, setCnnFeedUrl] = useState(adminConfig.cnnFeedUrl || '');
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState(adminConfig.youtubeEmbedUrl || 'https://www.youtube.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw');
  const [rtmpStreamKey, setRtmpStreamKey] = useState(adminConfig.rtmpStreamKey || '');
  const [streamTitle, setStreamTitle] = useState(adminConfig.streamTitle || '');
  const [announcementQueue, setAnnouncementQueue] = useState<string[]>(adminConfig.announcementQueue || []);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [graffitiEnabled, setGraffitiEnabled] = useState(!!adminConfig.graffitiEnabled);
  const [targetAudience, setTargetAudience] = useState<TargetAudience>(adminConfig.targetAudience || 'ALL');
  const [announcementDuration, setAnnouncementDuration] = useState<number>(adminConfig.announcementDuration || 20);
  const [audioNarrationEnabled, setAudioNarrationEnabled] = useState(adminConfig.audioNarrationEnabled !== false);

  // Editable Site Data Loaded from API
  const [nationalStats, setNationalStats] = useState<NationalStats | null>(null);
  const [statesMap, setStatesMap] = useState<Record<string, StateData>>({});
  const [selectedStateId, setSelectedStateId] = useState<string>('TX');
  const [editState, setEditState] = useState<StateData | null>(null);

  const [candidatesList, setCandidatesList] = useState<CandidateProfile[]>([]);
  const [editingCandidate, setEditingCandidate] = useState<Partial<CandidateProfile> | null>(null);

  const [updatesList, setUpdatesList] = useState<LiveUpdate[]>([]);
  const [newUpdateItem, setNewUpdateItem] = useState<Partial<LiveUpdate>>({
    title: '',
    category: 'AP WIRE',
    message: '',
    significance: 'HIGH',
    sourceUrl: 'https://www.ap.org/elections/'
  });

  const [senateRaces, setSenateRaces] = useState<SenateRace[]>([]);
  const [houseRaces, setHouseRaces] = useState<HouseRace[]>([]);
  const [govRaces, setGovRaces] = useState<GovRace[]>([]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Fetch all site data upon authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    try {
      const [statusRes, statesRes, candRes, updatesRes, senateRes, houseRes, govRes] = await Promise.all([
        fetch('/api/election-status').then(r => r.json()),
        fetch('/api/states').then(r => r.json()),
        fetch('/api/candidates').then(r => r.json()),
        fetch('/api/updates').then(r => r.json()),
        fetch('/api/senate').then(r => r.json()),
        fetch('/api/house').then(r => r.json()),
        fetch('/api/governors').then(r => r.json()),
      ]);

      if (statusRes.nationalStats) setNationalStats(statusRes.nationalStats);
      if (statesRes) {
        setStatesMap(statesRes);
        if (statesRes['TX']) setEditState(statesRes['TX']);
      }
      if (Array.isArray(candRes)) setCandidatesList(candRes);
      if (Array.isArray(updatesRes)) setUpdatesList(updatesRes);
      if (Array.isArray(senateRes)) setSenateRaces(senateRes);
      if (Array.isArray(houseRes)) setHouseRaces(houseRes);
      if (Array.isArray(govRes)) setGovRaces(govRes);
    } catch (err) {
      console.error('Failed to load full CMS site data', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setErrorMsg('');
      } else {
        setErrorMsg('Invalid administrator credentials.');
      }
    } catch {
      setErrorMsg('Authentication error. Please try again.');
    }
  };

  const showTempStatus = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleSaveSystemConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      headline,
      subheadline,
      refreshInterval,
      timerDate,
      postTimerHeadline,
      postTimerMessage,
      apApiKey,
      googleCivicApiKey,
      cnnFeedUrl,
      youtubeEmbedUrl,
      rtmpStreamKey,
      streamTitle,
      announcementQueue,
      graffitiEnabled,
      targetAudience,
      audioNarrationEnabled,
      announcementDuration,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveNationalStats = async () => {
    if (!nationalStats) return;
    try {
      const res = await fetch('/api/admin/national-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nationalStats),
      });
      const data = await res.json();
      if (data.success) {
        showTempStatus('National chamber stats updated live across all pages!');
      }
    } catch (err) {
      console.error('Failed to save national stats', err);
    }
  };

  const handleSaveStateData = async () => {
    if (!editState) return;
    try {
      const res = await fetch('/api/admin/states', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editState),
      });
      const data = await res.json();
      if (data.success) {
        setStatesMap({ ...statesMap, [editState.id]: data.state });
        showTempStatus(`State data for ${editState.name} updated successfully!`);
      }
    } catch (err) {
      console.error('Failed to save state data', err);
    }
  };

  const handleSelectStateToEdit = (stateId: string) => {
    setSelectedStateId(stateId);
    if (statesMap[stateId]) {
      setEditState({ ...statesMap[stateId] });
    }
  };

  const handleSaveCandidate = async () => {
    if (!editingCandidate || !editingCandidate.name) return;
    try {
      const res = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCandidate),
      });
      const data = await res.json();
      if (data.success) {
        setEditingCandidate(null);
        fetchAllData();
        showTempStatus(`Candidate profile for ${editingCandidate.name} saved!`);
      }
    } catch (err) {
      console.error('Failed to save candidate', err);
    }
  };

  const handleDeleteCandidate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete candidate ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/candidates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        showTempStatus(`Candidate ${name} removed from directory.`);
      }
    } catch (err) {
      console.error('Failed to delete candidate', err);
    }
  };

  const handleSaveWireUpdate = async () => {
    if (!newUpdateItem.message) return;
    try {
      const res = await fetch('/api/admin/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUpdateItem),
      });
      const data = await res.json();
      if (data.success) {
        setNewUpdateItem({
          title: '',
          category: 'AP WIRE',
          message: '',
          significance: 'HIGH',
          sourceUrl: 'https://www.ap.org/elections/'
        });
        fetchAllData();
        showTempStatus('AP Wire item published live!');
      }
    } catch (err) {
      console.error('Failed to save wire update', err);
    }
  };

  const handleDeleteWireUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/updates/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAllData();
        showTempStatus('News wire item deleted.');
      }
    } catch (err) {
      console.error('Failed to delete update', err);
    }
  };

  const handleSetStage = async (stageKey: string) => {
    try {
      const res = await fetch('/api/admin/election-day-stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageKey }),
      });
      const data = await res.json();
      if (data.success) {
        showTempStatus(`Election Day Stage switched to: ${stageKey.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Failed to set stage', err);
    }
  };

  const handleTriggerTimer = async () => {
    try {
      await fetch('/api/admin/trigger-timer', { method: 'POST' });
      alert('Election Day Countdown Over triggered! Public view automatically switched to Election Desk.');
    } catch (err) {
      console.error('Failed to trigger timer', err);
    }
  };

  const handleSetDeskStatus = async (open: boolean) => {
    try {
      await fetch('/api/admin/set-desk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ open }),
      });
      alert(`Election Day Live Counting Desk is now ${open ? 'OPEN' : 'CLOSED'}.`);
    } catch (err) {
      console.error('Failed to set desk status', err);
    }
  };

  const handleBroadcastNow = async (textToBroadcast?: string) => {
    const text = textToBroadcast || newAnnouncement.trim();
    if (!text) return;
    setIsBroadcasting(true);
    try {
      const res = await fetch('/api/admin/broadcast-announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcement: text,
          targetAudience,
          durationSeconds: announcementDuration
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (!announcementQueue.includes(text)) {
          setAnnouncementQueue([text, ...announcementQueue]);
        }
        setNewAnnouncement('');
        showTempStatus(`"${text}" broadcasted LIVE (${announcementDuration}s display time)!`);
      }
    } catch (err) {
      console.error('Broadcast failed', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 rounded-3xl border-2 shadow-xl bg-sky-50 border-sky-200 text-sky-950">
        <div className="text-center space-y-3 pb-6 border-b border-sky-200">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-sky-950">CMS Administration Portal</h2>
          <p className="text-xs text-sky-700 font-medium">Authenticated election control desk & site administration portal.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 pt-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-pink-100 border border-pink-300 text-pink-800 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-pink-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-sky-900">Administrator Password</label>
            <input
              type="password"
              placeholder="Enter administrator password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-sky-200 text-sky-950 text-sm focus:outline-none focus:border-pink-500 font-mono shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-sky-600 to-pink-500 hover:from-sky-700 hover:to-pink-600 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md"
          >
            Authenticate CMS Session
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="p-6 md:p-8 rounded-3xl border-2 shadow-lg bg-sky-50/90 border-sky-200 text-slate-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-sky-200">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2 text-sky-950">
              <Shield className="w-7 h-7 text-pink-500" />
              <span>CMS Administrative Control Desk</span>
            </h2>
            <p className="text-xs text-sky-800 font-medium">Full administrative control over election timer, desk state, state maps, candidate roster, and real spray graffiti.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onUpdateConfig({ graffitiEnabled: !graffitiEnabled })}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-black rounded-xl shadow-md transition-transform hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>🎨 {graffitiEnabled ? 'Hide Graffiti' : 'Launch Spray Graffiti'}</span>
            </button>
            <button
              onClick={fetchAllData}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-sky-200 hover:bg-sky-100 text-sky-900 text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
              <span>Reload Data</span>
            </button>
            <button
              onClick={onSimulateUpdate}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Sync AP Wire</span>
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMsg && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('SYSTEM_TIMER')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SYSTEM_TIMER'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-red-500" />
            <span>System & Timer</span>
          </button>

          <button
            onClick={() => setActiveTab('NATIONAL_STATS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'NATIONAL_STATS'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-sky-500" />
            <span>National Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('STATES_EDITOR')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'STATES_EDITOR'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>50 States Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('CANDIDATES')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'CANDIDATES'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            <span>Candidates Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('AP_WIRE')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'AP_WIRE'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-500" />
            <span>AP News Wire</span>
          </button>

          <button
            onClick={() => setActiveTab('ELECTION_DAY_STAGE')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ELECTION_DAY_STAGE'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-600" />
            <span>Election Returns Stage</span>
          </button>
        </div>

        {/* ==========================================
            TAB 1: SYSTEM, TIMER & BROADCASTS
        ========================================== */}
        {activeTab === 'SYSTEM_TIMER' && (
          <div className="space-y-6 pt-6 animate-in fade-in duration-200">
            {/* Quick Desk Action Triggers */}
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-800 flex items-center gap-2">
                <Flame className="w-4 h-4 text-red-600" />
                <span>Election Day Desk Status & Simulation Triggers</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button onClick={handleTriggerTimer} className="p-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-1.5">
                  🚨 Force Timer Over (Open Desk)
                </button>
                <button onClick={() => handleSetDeskStatus(true)} className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-md flex items-center justify-center gap-1.5">
                  🟢 Open Election Desk Live
                </button>
                <button onClick={() => handleSetDeskStatus(false)} className="p-3 bg-slate-700 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-md flex items-center justify-center gap-1.5">
                  🔴 Close Election Desk
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSystemConfig} className="space-y-6">
              {/* Timer & Post-Timer Config */}
              <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>Countdown Timer & Post-Timer Settings</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Countdown Target Timestamp (ISO)</label>
                    <input
                      type="text"
                      value={timerDate}
                      onChange={(e) => setTimerDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:border-sky-600"
                    />
                    <span className="text-[10px] text-slate-500">Defaults to 9:00 AM IST on Nov 3, 2026</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Post-Timer Display Headline</label>
                    <input
                      type="text"
                      value={postTimerHeadline}
                      onChange={(e) => setPostTimerHeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-sky-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Post-Timer Message</label>
                  <textarea
                    value={postTimerMessage}
                    onChange={(e) => setPostTimerMessage(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-sky-600"
                  />
                </div>
              </div>

              {/* Media Streams & Graffiti */}
              <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">
                  <Tv className="w-4 h-4 text-red-600" />
                  <span>CNN Live Feed Embed & Interactive Controls</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">YouTube Embed URL (CNN / Election Live Feed)</label>
                    <input
                      type="text"
                      value={youtubeEmbedUrl}
                      onChange={(e) => setYoutubeEmbedUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Broadcast Banner Headline</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <input
                      type="checkbox"
                      checked={graffitiEnabled}
                      onChange={(e) => setGraffitiEnabled(e.target.checked)}
                      className="rounded border-slate-300 text-pink-600 w-4 h-4 focus:ring-pink-500"
                    />
                    <span>🎨 Spray Graffiti Canvas Overlay</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <input
                      type="checkbox"
                      checked={audioNarrationEnabled}
                      onChange={(e) => setAudioNarrationEnabled(e.target.checked)}
                      className="rounded border-slate-300 text-pink-600 w-4 h-4 focus:ring-pink-500"
                    />
                    <span>🎙️ Automated Voice Narration</span>
                  </label>
                </div>
              </div>

              {/* Granular Audience Target Segment Selector */}
              <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-sky-200">
                  <div>
                    <h3 className="text-sm font-black text-sky-950 flex items-center gap-2">
                      <Target className="w-4 h-4 text-pink-600" />
                      <span>Audience Target Segment Configuration</span>
                    </h3>
                    <p className="text-xs text-sky-800">Select which user segment receives live on-screen broadcasts and audio announcements.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-pink-100 text-pink-700 border border-pink-200 shrink-0">
                    Active: {targetAudience}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'ALL' as TargetAudience,
                      label: 'All Connected Visitors',
                      reach: '100% Reach',
                      badge: 'GLOBAL BROADCAST',
                      description: 'Broadcasts live to all active site visitors across every tab and page.',
                      icon: Users,
                      activeClass: 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-300',
                      badgeClass: 'bg-slate-800 text-slate-200'
                    },
                    {
                      id: 'SENATE' as TargetAudience,
                      label: 'Senate Race Viewers',
                      reach: '38% Reach',
                      badge: 'SENATE SEGMENT',
                      description: 'Targeted exclusively to visitors viewing Class 2 Senate battlegrounds.',
                      icon: Landmark,
                      activeClass: 'bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-200',
                      badgeClass: 'bg-sky-500 text-white'
                    },
                    {
                      id: 'HOUSE' as TargetAudience,
                      label: 'House Battlegrounds',
                      reach: '28% Reach',
                      badge: 'HOUSE SEGMENT',
                      description: 'Targeted to viewers analyzing 435 House districts & key swing seats.',
                      icon: Building2,
                      activeClass: 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200',
                      badgeClass: 'bg-blue-500 text-white'
                    },
                    {
                      id: 'GOVERNORS' as TargetAudience,
                      label: 'Gubernatorial Viewers',
                      reach: '22% Reach',
                      badge: 'GOVERNOR SEGMENT',
                      description: 'Delivers directly to users exploring 36 Governor contests & open seats.',
                      icon: Crown,
                      activeClass: 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-200',
                      badgeClass: 'bg-purple-500 text-white'
                    },
                    {
                      id: 'BATTLEGROUNDS' as TargetAudience,
                      label: 'Swing Battlegrounds',
                      reach: '18% Reach',
                      badge: 'BATTLEGROUND SEGMENT',
                      description: 'High-priority broadcast sent to viewers tracking competitive Tossup races.',
                      icon: Swords,
                      activeClass: 'bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-200',
                      badgeClass: 'bg-pink-500 text-white'
                    },
                    {
                      id: 'ELECTION_DESK' as TargetAudience,
                      label: 'Election Counting Desk',
                      reach: '15% Reach',
                      badge: 'COUNTING DESK ONLY',
                      description: 'Direct live alert restricted to visitors on the Election Day Live Count Desk.',
                      icon: Flame,
                      activeClass: 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200',
                      badgeClass: 'bg-red-500 text-white'
                    }
                  ].map((seg) => {
                    const IconComp = seg.icon;
                    const isSelected = targetAudience === seg.id;
                    return (
                      <button
                        key={seg.id}
                        type="button"
                        onClick={() => setTargetAudience(seg.id)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? seg.activeClass
                            : 'bg-white hover:bg-sky-50/50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-slate-700'}`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <span className="font-black text-xs">{seg.label}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${isSelected ? seg.badgeClass : 'bg-slate-100 text-slate-600'}`}>
                              {seg.reach}
                            </span>
                          </div>
                          <p className={`text-[11px] leading-snug font-medium ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                            {seg.description}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[10px] font-bold">
                          <span className="uppercase tracking-wider">{seg.badge}</span>
                          {isSelected && <span className="font-extrabold flex items-center gap-1">✓ SELECTED</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audio Flash Announcements Queue */}
              <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-4">
                <h3 className="text-sm font-bold flex items-center justify-between text-slate-900">
                  <span className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-pink-600 animate-pulse" />
                    <span>Live Broadcast & Announcement Portal Manager</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-pink-700 font-extrabold bg-pink-100 px-2.5 py-1 rounded-lg border border-pink-200">
                      Target: {targetAudience}
                    </span>
                    <span className="text-xs text-sky-700 font-semibold bg-sky-100 px-2.5 py-1 rounded-lg">
                      Timer: {announcementDuration}s on-screen
                    </span>
                  </div>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">Broadcast Announcement Text</label>
                    <input
                      type="text"
                      placeholder="Type broadcast text (will show on-screen for configured seconds)..."
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none font-medium shadow-sm"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-600 uppercase flex items-center gap-1">
                        <Clock className="w-3 h-3 text-pink-600" />
                        <span>Editable Broadcast Display Timer (Seconds)</span>
                      </label>
                      <span className="text-xs font-mono font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                        {announcementDuration}s Duration
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="1"
                        value={announcementDuration}
                        onChange={(e) => setAnnouncementDuration(Number(e.target.value))}
                        className="flex-1 accent-pink-600 cursor-pointer"
                      />
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={announcementDuration}
                        onChange={(e) => setAnnouncementDuration(Math.max(5, Math.min(120, Number(e.target.value))))}
                        className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-center focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    {/* Quick Duration Preset Chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[5, 10, 15, 20, 30, 45, 60, 90, 120].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => setAnnouncementDuration(sec)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                            announcementDuration === sec
                              ? 'bg-pink-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-sky-100'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-pink-600" />
                    <span>Will broadcast to: <strong className="text-pink-600 font-bold">{targetAudience}</strong> ({announcementDuration} seconds display)</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button type="button" onClick={() => { if (newAnnouncement.trim()) { setAnnouncementQueue([...announcementQueue, newAnnouncement.trim()]); setNewAnnouncement(''); } }} className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors">Queue Announcement</button>
                    <button type="button" onClick={() => handleBroadcastNow()} disabled={isBroadcasting} className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-black rounded-xl text-xs transition-colors shadow-md flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast Live Now'}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
                  {announcementQueue.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs gap-3 shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-pink-100 text-pink-800 shrink-0">{targetAudience}</span>
                        <span className="truncate text-slate-800 font-medium">{item}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => handleBroadcastNow(item)} className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-[10px]">Broadcast</button>
                        <button type="button" onClick={() => setAnnouncementQueue(announcementQueue.filter((_, i) => i !== idx))} className="p-1 rounded-lg text-slate-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg">
                <Save className="w-4 h-4" /> Save System & Timer Configurations
              </button>
            </form>
          </div>
        )}

        {/* ==========================================
            TAB 2: NATIONAL STATS MANAGER
        ========================================== */}
        {activeTab === 'NATIONAL_STATS' && nationalStats && (
          <div className="space-y-6 pt-6 animate-in fade-in duration-200">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-sky-600" />
                <span>Senate Composition & Battlegrounds</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Total Seats</label>
                  <input
                    type="number"
                    value={nationalStats.senate.totalSeats}
                    onChange={(e) => setNationalStats({ ...nationalStats, senate: { ...nationalStats.senate, totalSeats: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Contested 2026</label>
                  <input
                    type="number"
                    value={nationalStats.senate.contested2026}
                    onChange={(e) => setNationalStats({ ...nationalStats, senate: { ...nationalStats.senate, contested2026: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">GOP Defending</label>
                  <input
                    type="number"
                    value={nationalStats.senate.repDefending}
                    onChange={(e) => setNationalStats({ ...nationalStats, senate: { ...nationalStats.senate, repDefending: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Dem Defending</label>
                  <input
                    type="number"
                    value={nationalStats.senate.demDefending}
                    onChange={(e) => setNationalStats({ ...nationalStats, senate: { ...nationalStats.senate, demDefending: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Key Battlegrounds</label>
                  <input
                    type="number"
                    value={nationalStats.senate.keyBattlegrounds}
                    onChange={(e) => setNationalStats({ ...nationalStats, senate: { ...nationalStats.senate, keyBattlegrounds: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>House Majority Balance</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Total Seats</label>
                  <input
                    type="number"
                    value={nationalStats.house.totalSeats}
                    onChange={(e) => setNationalStats({ ...nationalStats, house: { ...nationalStats.house, totalSeats: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Needed Majority</label>
                  <input
                    type="number"
                    value={nationalStats.house.neededForMajority}
                    onChange={(e) => setNationalStats({ ...nationalStats, house: { ...nationalStats.house, neededForMajority: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Current GOP</label>
                  <input
                    type="number"
                    value={nationalStats.house.currentRep}
                    onChange={(e) => setNationalStats({ ...nationalStats, house: { ...nationalStats.house, currentRep: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Current Dem</label>
                  <input
                    type="number"
                    value={nationalStats.house.currentDem}
                    onChange={(e) => setNationalStats({ ...nationalStats, house: { ...nationalStats.house, currentDem: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Competitive Seats</label>
                  <input
                    type="number"
                    value={nationalStats.house.competitiveSeats}
                    onChange={(e) => setNationalStats({ ...nationalStats, house: { ...nationalStats.house, competitiveSeats: Number(e.target.value) } })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            <button onClick={handleSaveNationalStats} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg">
              <Save className="w-4 h-4" /> Save National Stats Updates
            </button>
          </div>
        )}

        {/* ==========================================
            TAB 3: 50 STATES EDITOR
        ========================================== */}
        {activeTab === 'STATES_EDITOR' && (
          <div className="space-y-6 pt-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700 shrink-0">Select State to Edit:</label>
              <select
                value={selectedStateId}
                onChange={(e) => handleSelectStateToEdit(e.target.value)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none"
              >
                {Object.values(statesMap).map(st => (
                  <option key={st.id} value={st.id}>{st.name} ({st.id})</option>
                ))}
              </select>
            </div>

            {editState && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-600">State Name</label>
                    <input
                      type="text"
                      value={editState.name}
                      onChange={(e) => setEditState({ ...editState, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600">Primary Status</label>
                    <select
                      value={editState.primaryStatus}
                      onChange={(e) => setEditState({ ...editState, primaryStatus: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    >
                      <option value="Past primaries">Past primaries</option>
                      <option value="Upcoming primaries">Upcoming primaries</option>
                      <option value="Runoff">Runoff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-600">Primary Date</label>
                    <input
                      type="text"
                      value={editState.primaryDate}
                      onChange={(e) => setEditState({ ...editState, primaryDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                {/* Senate Section */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Flag className="w-3.5 h-3.5 text-sky-600" /> Senate Contest Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">Senate Incumbent</label>
                      <input
                        type="text"
                        value={editState.senateIncumbent || ''}
                        onChange={(e) => setEditState({ ...editState, senateIncumbent: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">Senate Rating</label>
                      <select
                        value={editState.senateRating || 'Safe R'}
                        onChange={(e) => setEditState({ ...editState, senateRating: e.target.value as any })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
                      >
                        <option value="Tossup">Tossup</option>
                        <option value="Lean D">Lean D</option>
                        <option value="Lean R">Lean R</option>
                        <option value="Safe D">Safe D</option>
                        <option value="Safe R">Safe R</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">Key Candidates</label>
                      <input
                        type="text"
                        value={editState.senateKeyCandidates || ''}
                        onChange={(e) => setEditState({ ...editState, senateKeyCandidates: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Governor Section */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Flag className="w-3.5 h-3.5 text-emerald-600" /> Governor Contest Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">Governor Incumbent</label>
                      <input
                        type="text"
                        value={editState.govIncumbent || ''}
                        onChange={(e) => setEditState({ ...editState, govIncumbent: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">Governor Rating</label>
                      <select
                        value={editState.govRating || 'Safe R'}
                        onChange={(e) => setEditState({ ...editState, govRating: e.target.value as any })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
                      >
                        <option value="Tossup">Tossup</option>
                        <option value="Lean D">Lean D</option>
                        <option value="Lean R">Lean R</option>
                        <option value="Safe D">Safe D</option>
                        <option value="Safe R">Safe R</option>
                        <option value="Open / Term-Limited">Open / Term-Limited</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600">Gov Candidates</label>
                      <input
                        type="text"
                        value={editState.govKeyCandidates || ''}
                        onChange={(e) => setEditState({ ...editState, govKeyCandidates: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                <button onClick={handleSaveStateData} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md">
                  <Save className="w-4 h-4" /> Save {editState.name} State Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 4: CANDIDATES DIRECTORY MANAGER
        ========================================== */}
        {activeTab === 'CANDIDATES' && (
          <div className="space-y-6 pt-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">Verified Candidates Roster ({candidatesList.length})</h3>
              <button
                onClick={() => setEditingCandidate({
                  name: '',
                  office: 'Senate',
                  state: 'TX',
                  stateName: 'Texas',
                  party: 'Democrat',
                  isIncumbent: false,
                  status: 'Declared',
                  seatStatus: 'Open Seat',
                  raceRating: 'Tossup',
                  primaryDate: 'March 2026',
                  bio: '',
                  keyIssues: ['Public Schools', 'Healthcare', 'Ethics Reform'],
                  googleCivicVerified: true,
                  sourceUrl: 'https://www.ap.org/elections/'
                })}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
              >
                <Plus className="w-4 h-4" /> Add New Candidate
              </button>
            </div>

            {/* Editing Form Modal / Block */}
            {editingCandidate && (
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-4 text-xs shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="font-bold text-sm text-emerald-400">
                    {editingCandidate.id ? `Edit Candidate: ${editingCandidate.name}` : 'Create New Candidate Profile'}
                  </h4>
                  <button onClick={() => setEditingCandidate(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={editingCandidate.name || ''}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                      placeholder="e.g. James Talarico"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">Office</label>
                    <select
                      value={editingCandidate.office || 'Senate'}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, office: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="Senate">Senate</option>
                      <option value="Governor">Governor</option>
                      <option value="House">House</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">Party</label>
                    <select
                      value={editingCandidate.party || 'Democrat'}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, party: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="Democrat">Democrat</option>
                      <option value="Republican">Republican</option>
                      <option value="Independent">Independent</option>
                      <option value="Libertarian">Libertarian</option>
                      <option value="Green">Green</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">State Code (2-letter)</label>
                    <input
                      type="text"
                      value={editingCandidate.state || ''}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">State Full Name</label>
                    <input
                      type="text"
                      value={editingCandidate.stateName || ''}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, stateName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400">Race Rating</label>
                    <select
                      value={editingCandidate.raceRating || 'Tossup'}
                      onChange={(e) => setEditingCandidate({ ...editingCandidate, raceRating: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                    >
                      <option value="Tossup">Tossup</option>
                      <option value="Lean D">Lean D</option>
                      <option value="Lean R">Lean R</option>
                      <option value="Safe D">Safe D</option>
                      <option value="Safe R">Safe R</option>
                      <option value="Open / Term-Limited">Open / Term-Limited</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400">Bio / Campaign Summary</label>
                  <textarea
                    value={editingCandidate.bio || ''}
                    onChange={(e) => setEditingCandidate({ ...editingCandidate, bio: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setEditingCandidate(null)} className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl">Cancel</button>
                  <button onClick={handleSaveCandidate} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md">Save Candidate Profile</button>
                </div>
              </div>
            )}

            {/* List of Candidates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
              {candidatesList.map(cand => (
                <div key={cand.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{cand.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold ${cand.party === 'Democrat' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{cand.party}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{cand.office} · {cand.stateName} ({cand.state}) · {cand.raceRating}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditingCandidate({ ...cand })} className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDeleteCandidate(cand.id, cand.name)} className="p-1.5 rounded-lg bg-white border border-slate-200 text-red-600 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: AP NEWS WIRE MANAGER
        ========================================== */}
        {activeTab === 'AP_WIRE' && (
          <div className="space-y-6 pt-6 animate-in fade-in duration-200">
            {/* Publish Form */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3 text-xs">
              <h3 className="font-bold text-amber-900 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-amber-600" /> Publish AP Wire / Flash News Update
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Category</label>
                  <select
                    value={newUpdateItem.category}
                    onChange={(e) => setNewUpdateItem({ ...newUpdateItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="AP WIRE">AP WIRE</option>
                    <option value="GOOGLE CIVIC">GOOGLE CIVIC</option>
                    <option value="SENATE 2026">SENATE 2026</option>
                    <option value="GOVERNOR 2026">GOVERNOR 2026</option>
                    <option value="HOUSE 2026">HOUSE 2026</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Significance Level</label>
                  <select
                    value={newUpdateItem.significance}
                    onChange={(e) => setNewUpdateItem({ ...newUpdateItem, significance: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="HIGH">HIGH (Red Banner)</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">Title</label>
                  <input
                    type="text"
                    value={newUpdateItem.title || ''}
                    onChange={(e) => setNewUpdateItem({ ...newUpdateItem, title: e.target.value })}
                    placeholder="Headline..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Message Content</label>
                <textarea
                  value={newUpdateItem.message || ''}
                  onChange={(e) => setNewUpdateItem({ ...newUpdateItem, message: e.target.value })}
                  rows={2}
                  placeholder="Detailed wire bulletin..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>

              <button onClick={handleSaveWireUpdate} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md">
                Publish Wire Bulletin Live
              </button>
            </div>

            {/* List of Wire Updates */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {updatesList.map(upd => (
                <div key={upd.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 font-mono text-slate-700">{upd.category}</span>
                      <span>{upd.title || 'Wire Update'}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{upd.timestamp}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{upd.message}</p>
                  </div>

                  <button onClick={() => handleDeleteWireUpdate(upd.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 6: ELECTION RETURNS STAGE
        ========================================== */}
        {activeTab === 'ELECTION_DAY_STAGE' && (
          <div className="space-y-6 pt-6 animate-in fade-in duration-200">
            <div className="p-5 rounded-2xl bg-red-50 border border-red-200 space-y-4 text-xs">
              <h3 className="font-bold text-red-900 flex items-center gap-1.5 text-sm">
                <Flame className="w-4 h-4 text-red-600" /> Election Day Returns Stage Controller
              </h3>
              <p className="text-slate-600">Simulate or set the exact live election returns stage triggered on Election Day (Nov 3, 2026).</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => handleSetStage('polls_open')}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-500 font-bold text-left space-y-1 shadow-sm"
                >
                  <div className="text-slate-900 font-extrabold">1. Polls Open (18% In)</div>
                  <div className="text-[11px] text-slate-500 font-normal">Initial vote tallies starting across East Coast</div>
                </button>

                <button
                  onClick={() => handleSetStage('early_tabulation')}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-500 font-bold text-left space-y-1 shadow-sm"
                >
                  <div className="text-slate-900 font-extrabold">2. Early Tabulation (45% In)</div>
                  <div className="text-[11px] text-slate-500 font-normal">Sunbelt & Rust Belt returns pouring in</div>
                </button>

                <button
                  onClick={() => handleSetStage('midnight_wave')}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-500 font-bold text-left space-y-1 shadow-sm"
                >
                  <div className="text-slate-900 font-extrabold">3. Midnight Wave (76% In)</div>
                  <div className="text-[11px] text-slate-500 font-normal">Senate 49 D vs 48 R lead established</div>
                </button>

                <button
                  onClick={() => handleSetStage('late_returns')}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-red-500 font-bold text-left space-y-1 shadow-sm"
                >
                  <div className="text-slate-900 font-extrabold">4. Late Returns (88% In)</div>
                  <div className="text-[11px] text-slate-500 font-normal">House 215 D vs 212 R; Texas Senate inside 0.5%</div>
                </button>

                <button
                  onClick={() => handleSetStage('counting_nearly_over')}
                  className="p-4 rounded-xl bg-red-600 text-white font-bold text-left space-y-1 shadow-md col-span-1 sm:col-span-2 md:col-span-2"
                >
                  <div className="text-white font-extrabold text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> 5. Counting Nearly Over (99% In - FINAL)
                  </div>
                  <div className="text-xs font-normal text-red-100">
                    Official Calls: Democrats win Senate Majority (51-49) & flip House Majority (219-216)!
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
