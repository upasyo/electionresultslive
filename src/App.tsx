import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { SenateRaces } from './components/SenateRaces';
import { HouseRaces } from './components/HouseRaces';
import { GovernorRaces } from './components/GovernorRaces';
import { StateResultsDetail } from './components/StateResultsDetail';
import { LiveCoverage } from './components/LiveCoverage';
import { LiveStreamMode } from './components/LiveStreamMode';
import { AdminPortal } from './components/AdminPortal';
import { AboutView } from './components/AboutView';
import { CandidatesDirectory } from './components/CandidatesDirectory';
import { ElectionDayLiveCounting } from './components/ElectionDayLiveCounting';
import { VoiceNarrationBar } from './components/VoiceNarrationBar';
import { LiveAnnouncementBanner } from './components/LiveAnnouncementBanner';
import { GraffitiOverlay } from './components/GraffitiOverlay';
import { NationalStats, StateData, SenateRace, HouseRace, GovRace, LiveUpdate, AdminConfig, LiveAnnouncement } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isNarrationOpen, setIsNarrationOpen] = useState<boolean>(false);

  const [nationalStats, setNationalStats] = useState<NationalStats>({
    senate: { totalSeats: 100, contested2026: 33, repDefending: 20, demDefending: 13, keyBattlegrounds: 5 },
    house: { totalSeats: 435, neededForMajority: 218, currentRep: 220, currentDem: 215, competitiveSeats: 42 },
    governors: { totalSeats: 50, contested2026: 36, termLimitedOpen: 14 },
    lastUpdateTimestamp: '10:57 PM EST',
    feedSource: 'Associated Press Elections API (ap.org/elections) & Google Civic Information API'
  });

  const [states, setStates] = useState<Record<string, StateData>>({});
  const [senateRaces, setSenateRaces] = useState<SenateRace[]>([]);
  const [houseRaces, setHouseRaces] = useState<HouseRace[]>([]);
  const [govRaces, setGovRaces] = useState<GovRace[]>([]);
  const [updates, setUpdates] = useState<LiveUpdate[]>([]);
  const [adminConfig, setAdminConfig] = useState<AdminConfig>({
    headline: '2026 US Midterm Elections',
    subheadline: 'Real-time verified counts and live projections.',
    refreshInterval: 15,
    autoRefresh: true,
    audioNarrationEnabled: true,
    announcementQueue: [],
    apApiKey: '',
    googleCivicApiKey: '',
    cnnFeedUrl: '',
    youtubeEmbedUrl: 'https://www.youtube.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw',
    rtmpStreamKey: '',
    streamTitle: '',
    timerDate: '2026-11-03T09:00:00+05:30',
    postTimerHeadline: '2026 MIDTERM ELECTION DAY COUNTING DESK LIVE',
    postTimerMessage: 'Real-time sync active from Associated Press & Google Civic API. Automatic updates every 15 seconds.',
    graffitiEnabled: false,
    targetAudience: 'ALL',
    announcementDuration: 20,
    graffitiAutoIntervalSeconds: 60,
    graffitiBurstDurationSeconds: 5
  });

  const [liveAnnouncement, setLiveAnnouncement] = useState<LiveAnnouncement | null>(null);
  const [announcementArchive, setAnnouncementArchive] = useState<LiveAnnouncement[]>([]);
  const lastAnnouncedIdRef = useRef<string | null>(null);

  const handleSendToArchive = (announcement: LiveAnnouncement) => {
    setAnnouncementArchive((prev) => {
      if (prev.some(a => a.id === announcement.id || a.text === announcement.text)) return prev;
      return [announcement, ...prev];
    });
  };

  const playBroadcastChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0, now + idx * 0.14);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.14 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.36);
      });
    } catch {
      // Audio autoplay restriction fallback
    }
  };

  const announceLiveVoice = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Attention. Live election announcement from the administrator: ${text}`);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.volume = 1.0;
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('David')));
      if (preferredVoice) utterance.voice = preferredVoice;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech error', err);
    }
  };

  useEffect(() => {
    // Fetch data from backend
    const fetchData = async () => {
      try {
        const [statusRes, statesRes, senateRes, houseRes, govRes, updatesRes] = await Promise.all([
          fetch('/api/election-status'),
          fetch('/api/states'),
          fetch('/api/senate'),
          fetch('/api/house'),
          fetch('/api/governors'),
          fetch('/api/updates'),
        ]);

        const statusData = await statusRes.json();
        setNationalStats(statusData.nationalStats);
        setAdminConfig(statusData.adminConfig);

        // Announce live whenever administrator pushes a new announcement
        if (statusData.latestAnnouncement) {
          if (lastAnnouncedIdRef.current === null) {
            lastAnnouncedIdRef.current = statusData.latestAnnouncement.id;
          } else if (lastAnnouncedIdRef.current !== statusData.latestAnnouncement.id) {
            lastAnnouncedIdRef.current = statusData.latestAnnouncement.id;
            setLiveAnnouncement(statusData.latestAnnouncement);
            playBroadcastChime();
            announceLiveVoice(statusData.latestAnnouncement.text);
          }
        }

        setStates(await statesRes.json());
        setSenateRaces(await senateRes.json());
        setHouseRaces(await houseRes.json());
        setGovRaces(await govRes.json());
        setUpdates(await updatesRes.json());
      } catch (err) {
        console.error('Failed to fetch election data', err);
      }
    };

    fetchData();

    // Auto-poll live feed every 10 seconds for real-time updates
    const pollInterval = setInterval(() => {
      fetchData();
    }, 10000);

    // Automatic welcome speech on entry (max 2 times for repeat visitors)
    const speechTimer = setTimeout(() => {
      const visitCount = parseInt(localStorage.getItem('midterm_visit_count') || '0', 10);
      if (visitCount < 2) {
        localStorage.setItem('midterm_visit_count', String(visitCount + 1));
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance("Welcome to MidtermPulse 2026. Live election results are streaming across all competitive Senate and House battlegrounds.");
          utterance.rate = 1.0;
          utterance.volume = 0.8;
          window.speechSynthesis.speak(utterance);
        }
      }
    }, 1500);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(speechTimer);
    };
  }, []);

  useEffect(() => {
    if (nationalStats.electionDayDeskOpen && currentTab !== 'electionday') {
      setCurrentTab('electionday');
    }
  }, [nationalStats.electionDayDeskOpen]);

  const handleSimulateUpdate = async () => {
    try {
      const res = await fetch('/api/simulate-update', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setNationalStats(data.nationalStats);
        setUpdates(prev => [data.latestUpdate, ...prev]);
      }
    } catch (err) {
      console.error('Simulation failed', err);
    }
  };

  const handleUpdateConfig = async (newConfig: Partial<AdminConfig>) => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const data = await res.json();
      if (data.success) {
        setAdminConfig(data.adminConfig);
      }
    } catch (err) {
      console.error('Config update failed', err);
    }
  };

  const isAnnouncementTargetingCurrentTab = (announcement: typeof liveAnnouncement, tab: string): boolean => {
    if (!announcement) return false;
    const target = announcement.targetAudience || 'ALL';
    if (target === 'ALL') return true;
    if (target === 'SENATE') return tab === 'senate' || tab === 'candidates' || tab === 'home';
    if (target === 'HOUSE') return tab === 'house' || tab === 'candidates' || tab === 'home';
    if (target === 'GOVERNORS') return tab === 'governors' || tab === 'candidates' || tab === 'home';
    if (target === 'ELECTION_DESK') return tab === 'electionday';
    if (target === 'BATTLEGROUNDS') return tab === 'senate' || tab === 'governors' || tab === 'electionday' || tab === 'home';
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-sky-50 text-slate-900 transition-colors">
      <GraffitiOverlay
        enabled={adminConfig.graffitiEnabled}
        autoIntervalSeconds={adminConfig.graffitiAutoIntervalSeconds || 60}
        burstDurationSeconds={adminConfig.graffitiBurstDurationSeconds || 5}
        onClose={() => handleUpdateConfig({ graffitiEnabled: false })}
      />

      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={false}
        setDarkMode={() => {}}
        onOpenNarration={() => setIsNarrationOpen(true)}
        onToggleGraffiti={() => handleUpdateConfig({ graffitiEnabled: !adminConfig.graffitiEnabled })}
        nationalStats={nationalStats}
      />

      {liveAnnouncement && isAnnouncementTargetingCurrentTab(liveAnnouncement, currentTab) && (
        <LiveAnnouncementBanner
          announcement={liveAnnouncement}
          onDismiss={() => setLiveAnnouncement(null)}
          onReplay={() => announceLiveVoice(liveAnnouncement.text)}
          onSentToArchive={handleSendToArchive}
          darkMode={false}
        />
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {currentTab === 'home' && (
          <Dashboard
            stats={nationalStats}
            states={states}
            updates={updates}
            darkMode={darkMode}
            setCurrentTab={setCurrentTab}
          />
        )}
        {currentTab === 'electionday' && (
          <ElectionDayLiveCounting
            darkMode={darkMode}
            adminConfig={adminConfig}
            onOpenState={(stateId) => setCurrentTab('states')}
          />
        )}
        {currentTab === 'candidates' && <CandidatesDirectory darkMode={darkMode} />}
        {currentTab === 'senate' && <SenateRaces races={senateRaces} darkMode={darkMode} />}
        {currentTab === 'house' && <HouseRaces races={houseRaces} darkMode={darkMode} />}
        {currentTab === 'governors' && <GovernorRaces races={govRaces} darkMode={darkMode} />}
        {currentTab === 'states' && <StateResultsDetail states={states} darkMode={darkMode} />}
        {currentTab === 'coverage' && (
          <LiveCoverage
            updates={updates}
            announcementArchive={announcementArchive}
            darkMode={darkMode}
            onOpenNarration={() => setIsNarrationOpen(true)}
            onReplayAnnouncement={(text) => announceLiveVoice(text)}
          />
        )}
        {currentTab === 'livestream' && (
          <LiveStreamMode
            stats={nationalStats}
            states={states}
            adminConfig={adminConfig}
            onOpenNarration={() => setIsNarrationOpen(true)}
          />
        )}
        {currentTab === 'admin' && (
          <AdminPortal
            adminConfig={adminConfig}
            onUpdateConfig={handleUpdateConfig}
            onSimulateUpdate={handleSimulateUpdate}
            darkMode={darkMode}
          />
        )}
        {currentTab === 'about' && <AboutView darkMode={darkMode} />}
      </main>

      <VoiceNarrationBar
        isOpen={isNarrationOpen}
        onClose={() => setIsNarrationOpen(false)}
        latestUpdates={updates}
        darkMode={darkMode}
      />

      <Footer darkMode={darkMode} />
    </div>
  );
}
