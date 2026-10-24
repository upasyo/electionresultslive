import React, { useState, useEffect } from 'react';
import { CandidateProfile, GeminiCandidateIntel, GeminiLiveBriefing } from '../types';
import {
  Search,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Sparkles,
  Building2,
  User,
  Globe,
  ExternalLink,
  Calendar,
  MapPin,
  Award,
  Bot,
  RefreshCw,
  Zap,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  BookOpen,
  DollarSign,
  Scale
} from 'lucide-react';

interface CandidatesDirectoryProps {
  darkMode: boolean;
  onSelectState?: (stateId: string) => void;
}

export const CandidatesDirectory: React.FC<CandidatesDirectoryProps> = ({ darkMode, onSelectState }) => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOffice, setSelectedOffice] = useState<string>('ALL');
  const [selectedParty, setSelectedParty] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Google Civic API State
  const [googleCivicAddressQuery, setGoogleCivicAddressQuery] = useState<string>('');
  const [googleCivicQueryResult, setGoogleCivicQueryResult] = useState<any>(null);
  const [isQueryingGoogle, setIsQueryingGoogle] = useState<boolean>(false);
  
  // Active Candidate Modal
  const [activeCandidateModal, setActiveCandidateModal] = useState<CandidateProfile | null>(null);
  const [modalTab, setModalTab] = useState<'profile' | 'gemini'>('profile');

  // Gemini Intelligence State
  const [geminiBriefing, setGeminiBriefing] = useState<GeminiLiveBriefing | null>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState<boolean>(false);
  const [geminiCandidateIntels, setGeminiCandidateIntels] = useState<Record<string, GeminiCandidateIntel>>({});
  const [loadingIntelId, setLoadingIntelId] = useState<string | null>(null);
  const [geminiAskQuery, setGeminiAskQuery] = useState<string>('');
  const [isAskingGemini, setIsAskingGemini] = useState<boolean>(false);
  const [geminiAskResult, setGeminiAskResult] = useState<{
    answer: string;
    sources: Array<{ title: string; uri: string }>;
    generatedAt: string;
    model: string;
  } | null>(null);

  useEffect(() => {
    fetchCandidates();
  }, [selectedOffice]);

  // Automatically fetch Gemini briefing on mount for comprehensive live candidate intelligence
  useEffect(() => {
    fetchGeminiBriefing();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const url = selectedOffice !== 'ALL' ? `/api/candidates?office=${selectedOffice}` : '/api/candidates';
      const res = await fetch(url);
      const data = await res.json();
      setCandidates(data);
    } catch (err) {
      console.error('Failed to fetch candidate profiles', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeminiBriefing = async () => {
    setIsBriefingLoading(true);
    try {
      const res = await fetch('/api/gemini/live-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focusArea: 'all' })
      });
      const data = await res.json();
      if (data.success && data.briefing) {
        setGeminiBriefing(data.briefing);
      }
    } catch (err) {
      console.error('Failed to fetch Gemini live briefing', err);
    } finally {
      setIsBriefingLoading(false);
    }
  };

  const fetchCandidateGeminiIntel = async (candidate: CandidateProfile) => {
    setLoadingIntelId(candidate.id);
    try {
      const res = await fetch('/api/gemini/candidate-intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: candidate.name,
          state: candidate.stateName,
          office: candidate.office,
          party: candidate.party
        })
      });
      const data = await res.json();
      if (data.success && data.intel) {
        setGeminiCandidateIntels(prev => ({
          ...prev,
          [candidate.id]: data.intel
        }));
      }
    } catch (err) {
      console.error('Failed to fetch candidate Gemini intel', err);
    } finally {
      setLoadingIntelId(null);
    }
  };

  const handleGeminiAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiAskQuery.trim()) return;
    setIsAskingGemini(true);
    try {
      const res = await fetch('/api/gemini/ask-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: geminiAskQuery.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setGeminiAskResult({
          answer: data.answer,
          sources: data.sources || [],
          generatedAt: data.generatedAt,
          model: data.model
        });
      }
    } catch (err) {
      console.error('Failed to query Gemini', err);
    } finally {
      setIsAskingGemini(false);
    }
  };

  const handleGoogleCivicSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleCivicAddressQuery.trim()) return;
    setIsQueryingGoogle(true);
    try {
      const res = await fetch(`/api/google-civic/query?q=${encodeURIComponent(googleCivicAddressQuery.trim())}`);
      const data = await res.json();
      setGoogleCivicQueryResult(data);
    } catch (err) {
      console.error('Google Civic API query failed', err);
    } finally {
      setIsQueryingGoogle(false);
    }
  };

  const openCandidateModal = (candidate: CandidateProfile, preferGeminiTab: boolean = false) => {
    setActiveCandidateModal(candidate);
    setModalTab(preferGeminiTab ? 'gemini' : 'profile');
    if (!geminiCandidateIntels[candidate.id]) {
      fetchCandidateGeminiIntel(candidate);
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.district && c.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesParty =
      selectedParty === 'ALL' ||
      (selectedParty === 'Democrat' && c.party === 'Democrat') ||
      (selectedParty === 'Republican' && c.party === 'Republican') ||
      (selectedParty === 'Independent' && (c.party === 'Independent' || c.party === 'Libertarian' || c.party === 'Green'));

    return matchesSearch && matchesParty;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border transition-colors shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-600/10 text-purple-600 border border-purple-500/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini 3.8 Intelligence Grounded</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-600/10 text-blue-600 border border-blue-500/20 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Google Civic Information API Verified</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/10 text-red-600 border border-red-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AP Elections (ap.org/elections)</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              2026 Candidates & Complete Election Intelligence
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Real-time candidate dossiers powered by Google Gemini (gemini-3.8-flash) with live Google Search grounding across all 33 Class 2 U.S. Senate seats, 36 Governors, and House battlegrounds.
            </p>
          </div>

          {/* Quick Stats Strip */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className={`p-3 rounded-2xl border text-center ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xl font-black text-emerald-600">33</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Class 2 Senate</div>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xl font-black text-purple-600">36</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Governors</div>
            </div>
            <div className={`p-3 rounded-2xl border text-center ${darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="text-xl font-black text-blue-600">Gemini</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Live Search Intel</div>
            </div>
          </div>
        </div>

        {/* Marquee Shortcut Chips */}
        <div className="mt-5 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Key Matchups:</span>
          </span>
          <button
            onClick={() => {
              setSearchQuery('Talarico');
              setSelectedOffice('ALL');
            }}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/20 transition-colors flex items-center gap-1"
          >
            <span>Texas Senate: James Talarico (D)</span>
          </button>
          <button
            onClick={() => {
              setSearchQuery('Ossoff');
              setSelectedOffice('ALL');
            }}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            Georgia Senate: Jon Ossoff (D)
          </button>
          <button
            onClick={() => {
              setSearchQuery('Tillis');
              setSelectedOffice('ALL');
            }}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-red-500/10 text-red-600 border border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            NC Senate: Thom Tillis (R) vs Cooper (D)
          </button>
          <button
            onClick={() => {
              setSearchQuery('California');
              setSelectedOffice('Governor');
            }}
            className="px-3 py-1 text-xs font-bold rounded-lg bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
          >
            California Governor Open Seat
          </button>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
            >
              Reset Search
            </button>
          )}
        </div>

        {/* GEMINI LIVE BRIEFING & INTELLIGENCE ENGINE */}
        <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-900/15 via-blue-900/10 to-slate-900/20 border border-purple-500/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-purple-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <span>Gemini 2026 Live Candidate Intelligence Briefing</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    gemini-3.8-flash
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Grounded with real-time Google Search across 2026 candidate rosters, endorsements, and primary dates.
                </p>
              </div>
            </div>

            <button
              onClick={fetchGeminiBriefing}
              disabled={isBriefingLoading}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBriefingLoading ? 'animate-spin' : ''}`} />
              <span>{isBriefingLoading ? 'Analyzing 2026 Races...' : 'Refresh Gemini Intel'}</span>
            </button>
          </div>

          {/* Gemini Briefing Content */}
          {geminiBriefing ? (
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs space-y-2">
                <div className="font-bold text-sm text-purple-700 dark:text-purple-300">
                  {geminiBriefing.headline}
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {geminiBriefing.overview}
                </p>
                {geminiBriefing.fecTrends && (
                  <div className="pt-2 border-t border-purple-500/20 flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span><strong>FEC Campaign Finance Signal:</strong> {geminiBriefing.fecTrends}</span>
                  </div>
                )}
              </div>

              {/* Key Races Grid from Gemini */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Key Marquee Contests Analyzed by Gemini
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {geminiBriefing.keyRaces.map((race, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between ${darkMode ? 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40' : 'bg-white border-slate-200 hover:border-purple-300'}`}
                    >
                      <div>
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
                          <span className="font-bold text-purple-600 dark:text-purple-400">
                            {race.office} · {race.state}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            {race.status}
                          </span>
                        </div>
                        <div className="font-bold mt-2 text-slate-900 dark:text-white">
                          {race.candidates}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                          {race.analysis}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                        <span>Synced from Google Search</span>
                        <button
                          onClick={() => {
                            setSearchQuery(race.state);
                          }}
                          className="font-bold text-purple-600 hover:underline flex items-center gap-0.5"
                        >
                          <span>Filter State</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citations from Google Search Grounding */}
              {geminiBriefing.sources && geminiBriefing.sources.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-500 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Gemini Search Grounding Citations:</span>
                  </span>
                  {geminiBriefing.sources.slice(0, 4).map((src, i) => (
                    <a
                      key={i}
                      href={src.uri}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span className="truncate max-w-[200px]">{src.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : isBriefingLoading ? (
            <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-500 animate-spin" />
              <span>Querying Google Search Grounding via Gemini for declared 2026 candidates...</span>
            </div>
          ) : null}

          {/* Interactive "Ask Gemini about Candidates" Bar */}
          <div className="mt-5 pt-4 border-t border-purple-500/20">
            <form onSubmit={handleGeminiAsk} className="flex gap-2">
              <div className="relative flex-1">
                <Bot className="absolute left-3 top-2.5 w-4 h-4 text-purple-500" />
                <input
                  type="text"
                  placeholder="Ask Gemini about any candidate or seat (e.g. 'What is James Talarico's platform for Texas Senate?', 'Who is running for Georgia Senate?')..."
                  value={geminiAskQuery}
                  onChange={(e) => setGeminiAskQuery(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border transition-colors ${darkMode ? 'bg-slate-900 border-purple-500/30 text-white placeholder-slate-500' : 'bg-white border-purple-300 text-slate-900 placeholder-slate-400'}`}
                />
              </div>
              <button
                type="submit"
                disabled={isAskingGemini}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isAskingGemini ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask Gemini</span>
                  </>
                )}
              </button>
            </form>

            {/* Gemini Freeform Answer Card */}
            {geminiAskResult && (
              <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-400/40 shadow-md space-y-3">
                <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Gemini Candidate Intelligence Dossier</span>
                  </div>
                  <button
                    onClick={() => setGeminiAskResult(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Dismiss
                  </button>
                </div>
                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {geminiAskResult.answer}
                </div>
                {geminiAskResult.sources && geminiAskResult.sources.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="font-semibold text-slate-400">Sources:</span>
                    {geminiAskResult.sources.map((s, idx) => (
                      <a
                        key={idx}
                        href={s.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline flex items-center gap-0.5"
                      >
                        <span>{s.title}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Google Civic Live Search & Verification Lookup */}
        <div className="mt-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>LIVE GOOGLE CIVIC INFORMATION API QUERY</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Query official ballot data by state, city, or candidate name
            </span>
          </div>

          <form onSubmit={handleGoogleCivicSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter state or jurisdiction (e.g. 'Georgia', 'Ohio', 'Texas', 'California', 'Maine')..."
                value={googleCivicAddressQuery}
                onChange={(e) => setGoogleCivicAddressQuery(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-blue-200 text-slate-900 placeholder-slate-400'}`}
              />
            </div>
            <button
              type="submit"
              disabled={isQueryingGoogle}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 disabled:opacity-50"
            >
              {isQueryingGoogle ? 'Querying API...' : 'Verify on Google'}
            </button>
            {googleCivicQueryResult && (
              <button
                type="button"
                onClick={() => setGoogleCivicQueryResult(null)}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                Clear
              </button>
            )}
          </form>

          {/* Google Civic Live Search Result Card */}
          {googleCivicQueryResult && (
            <div className="mt-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-bold text-slate-700 dark:text-slate-200">
                  Google Civic Query Results for "{googleCivicQueryResult.query}": {googleCivicQueryResult.count} Candidates Found
                </span>
                <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2026 API Handshake Verified</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {googleCivicQueryResult.results.map((r: CandidateProfile) => (
                  <div
                    key={r.id}
                    onClick={() => openCandidateModal(r, true)}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{r.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${r.party === 'Democrat' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {r.party.charAt(0)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {r.office} · {r.stateName} {r.isIncumbent && '· (Incumbent)'}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Status: {r.status}</span>
                      <span className="text-purple-600 font-bold flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" />
                        <span>Gemini Dossier</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Offices:</span>
          </div>
          {['ALL', 'Senate', 'Governor', 'House'].map((office) => (
            <button
              key={office}
              onClick={() => setSelectedOffice(office)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${selectedOffice === office ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'}`}
            >
              {office === 'ALL' ? 'All Contests' : office === 'Senate' ? 'Senate Class 2 (33)' : office === 'Governor' ? 'Governors (36)' : 'House Seats'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Party Filter */}
          <select
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'}`}
          >
            <option value="ALL">All Parties</option>
            <option value="Democrat">Democrat</option>
            <option value="Republican">Republican</option>
            <option value="Independent">Independent</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-4 py-1.5 text-xs rounded-xl border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'}`}
            />
          </div>
        </div>
      </div>

      {/* Candidates Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span>Loading verified 2026 candidate profiles...</span>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="py-16 text-center text-sm text-slate-500">
          No candidates found matching criteria "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => {
            const hasGeminiIntel = !!geminiCandidateIntels[candidate.id];
            const isLoadingThisIntel = loadingIntelId === candidate.id;

            return (
              <div
                key={candidate.id}
                className={`p-6 rounded-3xl border transition-all hover:shadow-xl flex flex-col justify-between ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'}`}
              >
                <div>
                  {/* Top Row: Office Badge & Verification */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${candidate.office === 'Senate' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-purple-500/10 text-purple-600 border border-purple-500/20'}`}>
                      {candidate.office === 'Senate' ? 'U.S. Senate Class 2' : 'Governor'} · {candidate.state}
                    </span>

                    <div className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold" title="Verified by Google Civic Information API">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Google Civic</span>
                    </div>
                  </div>

                  {/* Candidate Info */}
                  <div className="flex items-start gap-3.5 pt-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shrink-0 shadow-md ${candidate.party === 'Democrat' ? 'bg-blue-600' : 'bg-red-600'}`}>
                      {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                        {candidate.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`text-xs font-semibold ${candidate.party === 'Democrat' ? 'text-blue-600' : 'text-red-600'}`}>
                          {candidate.party}
                        </span>
                        <span className="text-xs text-slate-400">·</span>
                        <span className="text-xs text-slate-500">
                          {candidate.isIncumbent ? 'Incumbent' : 'Challenger / Nominee'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Rating Pills */}
                  <div className="grid grid-cols-2 gap-2 my-4">
                    <div className={`p-2.5 rounded-xl border text-center ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Race Rating</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                        {candidate.raceRating}
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-xl border text-center ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Filing Status</div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                        {candidate.status}
                      </div>
                    </div>
                  </div>

                  {/* Bio Excerpt */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {candidate.bio}
                  </p>

                  {/* Key Platform Issues */}
                  {candidate.keyIssues && candidate.keyIssues.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Core Platform:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.keyIssues.map((issue, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}
                          >
                            {issue}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gemini Quick Insight Pill if loaded */}
                  {hasGeminiIntel && (
                    <div className="mb-4 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-300">
                      <div className="font-bold flex items-center gap-1 mb-0.5">
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span>Gemini Intelligence Summary</span>
                      </div>
                      <p className="line-clamp-2 text-slate-600 dark:text-slate-400">
                        {geminiCandidateIntels[candidate.id].summary}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs gap-2">
                  <button
                    onClick={() => openCandidateModal(candidate, true)}
                    disabled={isLoadingThisIntel}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 text-[11px]"
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isLoadingThisIntel ? 'animate-spin' : ''}`} />
                    <span>{isLoadingThisIntel ? 'Loading...' : 'Gemini Dossier'}</span>
                  </button>

                  <button
                    onClick={() => openCandidateModal(candidate, false)}
                    className="font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors text-[11px]"
                  >
                    <span>Full Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Deep Dive Modal with Gemini Dossier Integration */}
      {activeCandidateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border shadow-2xl relative ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  2026 Verified Candidate & Intelligence Dossier
                </span>
              </div>
              <button
                onClick={() => setActiveCandidateModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Candidate Header */}
            <div className="flex items-center gap-4 py-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg ${activeCandidateModal.party === 'Democrat' ? 'bg-blue-600' : 'bg-red-600'}`}>
                {activeCandidateModal.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h2 className="text-2xl font-black">{activeCandidateModal.name}</h2>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${activeCandidateModal.party === 'Democrat' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
                    {activeCandidateModal.party} Nominee
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-500 mt-0.5">
                  {activeCandidateModal.office} for {activeCandidateModal.stateName}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Status: <strong>{activeCandidateModal.status}</strong> · {activeCandidateModal.seatStatus}
                </div>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <button
                onClick={() => setModalTab('gemini')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${modalTab === 'gemini' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini 3.8 Live AI Dossier</span>
              </button>
              <button
                onClick={() => setModalTab('profile')}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${modalTab === 'profile' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Google Civic & AP Official Record</span>
              </button>
            </div>

            {/* Tab 1: Gemini Live AI Dossier */}
            {modalTab === 'gemini' && (
              <div className="space-y-4 text-xs">
                {loadingIntelId === activeCandidateModal.id ? (
                  <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 text-purple-600 animate-spin" />
                    <span>Gemini is analyzing latest 2026 political records and search grounding for {activeCandidateModal.name}...</span>
                  </div>
                ) : geminiCandidateIntels[activeCandidateModal.id] ? (
                  <div className="space-y-4">
                    {/* Executive Summary */}
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                      <div className="font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider flex items-center justify-between">
                        <span>Gemini Executive Assessment</span>
                        <span className="text-[10px] font-mono font-normal">
                          {geminiCandidateIntels[activeCandidateModal.id].model}
                        </span>
                      </div>
                      <p className="leading-relaxed text-slate-800 dark:text-slate-200">
                        {geminiCandidateIntels[activeCandidateModal.id].summary}
                      </p>
                    </div>

                    {/* Platform Priorities */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-purple-600" />
                        <span>Core Campaign Platform & Legislative Priorities</span>
                      </div>
                      <ul className="space-y-1.5 list-disc pl-5 text-slate-700 dark:text-slate-300">
                        {geminiCandidateIntels[activeCandidateModal.id].keyPlatformPoints.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Campaign Dynamics & Opponent Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                          <span>Battleground Dynamics</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                          {geminiCandidateIntels[activeCandidateModal.id].campaignDynamics}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-red-500" />
                          <span>Opponent & Primary Field</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                          {geminiCandidateIntels[activeCandidateModal.id].opponentAnalysis}
                        </p>
                      </div>
                    </div>

                    {/* FEC Fundraising & Polling Signal */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                        <div className="text-[10px] text-emerald-600 uppercase font-bold flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>FEC Fundraising Signal</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                          {geminiCandidateIntels[activeCandidateModal.id].fecFundraisingInsight}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/20 space-y-1">
                        <div className="text-[10px] text-blue-600 uppercase font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Polling & Race Rating</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                          {geminiCandidateIntels[activeCandidateModal.id].pollingAndRating}
                        </p>
                      </div>
                    </div>

                    {/* Web Grounding Citations */}
                    {geminiCandidateIntels[activeCandidateModal.id].sources && (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-500">Google Grounding Sources:</span>
                        {geminiCandidateIntels[activeCandidateModal.id].sources.map((s, idx) => (
                          <a
                            key={idx}
                            href={s.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                          >
                            <span>{s.title}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-3">
                    <p className="text-slate-500">No Gemini intelligence cached for this candidate yet.</p>
                    <button
                      onClick={() => fetchCandidateGeminiIntel(activeCandidateModal)}
                      className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl text-xs hover:bg-purple-700 transition-colors"
                    >
                      Generate Live Gemini Intelligence Dossier
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Google Civic & AP Official Record */}
            {modalTab === 'profile' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="font-bold text-slate-500 uppercase tracking-wider">Biography & Background</div>
                  <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                    {activeCandidateModal.bio}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">FEC Candidate ID</span>
                    <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {activeCandidateModal.fecId || 'FEC-STATE-2026-FILED'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Primary Election Date</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {activeCandidateModal.primaryDate}
                    </div>
                  </div>
                </div>

                {activeCandidateModal.keyIssues && (
                  <div className="space-y-2">
                    <div className="font-bold text-slate-500 uppercase tracking-wider">Campaign Focus & Key Issues:</div>
                    <ul className="space-y-1.5 list-disc pl-4 text-slate-700 dark:text-slate-300">
                      {activeCandidateModal.keyIssues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Google Civic Information API Verified</span>
                  </div>
                  <a
                    href={activeCandidateModal.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>ap.org/elections</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                November 3, 2026 U.S. Midterms
              </span>
              <button
                onClick={() => setActiveCandidateModal(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 text-xs font-bold rounded-xl transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
