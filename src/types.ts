export interface StateData {
  id: string;
  name: string;
  hasSenateRace: boolean;
  hasGovRace: boolean;
  primaryStatus: 'Past primaries' | 'Upcoming primaries' | 'Runoff';
  primaryDate: string;
  senateIncumbent?: string;
  senateParty?: 'R' | 'D' | 'I';
  senateRating?: 'Tossup' | 'Lean D' | 'Lean R' | 'Safe D' | 'Safe R';
  senateKeyCandidates?: string;
  govIncumbent?: string;
  govParty?: 'R' | 'D';
  govRating?: 'Tossup' | 'Lean D' | 'Lean R' | 'Safe D' | 'Safe R' | 'Open / Term-Limited';
  govKeyCandidates?: string;
  houseDistricts: number;
  houseBattlegrounds?: string;
  currentSenateComposition: string;
  generalElectionDate: string;
  lastUpdated: string;
  source: string;
}

export interface SenateRace {
  id: string;
  state: string;
  stateName: string;
  incumbent: string;
  party: 'R' | 'D' | 'I';
  rating: 'Tossup' | 'Lean D' | 'Lean R' | 'Safe D' | 'Safe R';
  keyCandidates: string;
  primaryDate: string;
  primaryStatus: 'Past primaries' | 'Upcoming primaries' | 'Runoff';
  statusDescription: string;
}

export interface GovRace {
  id: string;
  state: string;
  stateName: string;
  incumbent: string;
  party: 'R' | 'D';
  rating: 'Tossup' | 'Lean D' | 'Lean R' | 'Safe D' | 'Safe R' | 'Open / Term-Limited';
  keyCandidates: string;
  primaryDate: string;
  primaryStatus: 'Past primaries' | 'Upcoming primaries' | 'Runoff';
  statusDescription: string;
}

export interface HouseRace {
  id: string;
  state: string;
  district: string;
  incumbent: string;
  party: 'R' | 'D';
  rating: 'Tossup' | 'Lean D' | 'Lean R' | 'Safe D' | 'Safe R';
  keyCandidates: string;
  primaryStatus: 'Past primaries' | 'Upcoming primaries' | 'Runoff';
}

export interface CandidateProfile {
  id: string;
  name: string;
  office: 'Senate' | 'Governor' | 'House';
  state: string;
  stateName: string;
  district?: string;
  party: 'Democrat' | 'Republican' | 'Independent' | 'Libertarian' | 'Green';
  isIncumbent: boolean;
  status: 'Declared' | 'FEC Filed' | 'Primary Contender' | 'Expected' | 'Term-Limited Out';
  seatStatus: 'Open Seat' | 'Incumbent Defending' | 'Vacant';
  raceRating: 'Tossup' | 'Lean D' | 'Lean R' | 'Safe D' | 'Safe R' | 'Open / Term-Limited';
  primaryDate: string;
  fecId?: string;
  bio: string;
  keyIssues: string[];
  googleCivicVerified: boolean;
  sourceUrl: string;
}

export interface LiveUpdate {
  id: string;
  timestamp: string;
  title: string;
  category: 'AP WIRE' | 'GOOGLE CIVIC' | 'SENATE 2026' | 'GOVERNOR 2026' | 'HOUSE 2026';
  message: string;
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceUrl: string;
}

export interface NationalStats {
  senate: {
    totalSeats: number;
    contested2026: number;
    repDefending: number;
    demDefending: number;
    keyBattlegrounds: number;
  };
  house: {
    totalSeats: number;
    neededForMajority: number;
    currentRep: number;
    currentDem: number;
    competitiveSeats: number;
  };
  governors: {
    totalSeats: number;
    contested2026: number;
    termLimitedOpen: number;
  };
  lastUpdateTimestamp: string;
  feedSource: string;
  isTimerOver?: boolean;
  electionDayDeskOpen?: boolean;
}

export type TargetAudience = 'ALL' | 'SENATE' | 'HOUSE' | 'GOVERNORS' | 'BATTLEGROUNDS' | 'ELECTION_DESK';

export interface AdminConfig {
  headline: string;
  subheadline: string;
  refreshInterval: number;
  autoRefresh: boolean;
  audioNarrationEnabled: boolean;
  announcementQueue: string[];
  apApiKey: string;
  googleCivicApiKey: string;
  cnnFeedUrl: string;
  youtubeEmbedUrl: string;
  rtmpStreamKey: string;
  streamTitle: string;
  timerDate: string;
  postTimerHeadline: string;
  postTimerMessage: string;
  graffitiEnabled: boolean;
  targetAudience: TargetAudience;
  announcementDuration: number; // Duration in seconds (default 20)
  graffitiAutoIntervalSeconds: number; // Auto-spray interval in seconds (default 60)
  graffitiBurstDurationSeconds: number; // Auto-spray duration in seconds (default 5)
}

export interface LiveAnnouncement {
  id: string;
  text: string;
  timestamp: string;
  durationSeconds?: number;
  targetAudience?: TargetAudience;
}

export interface GeminiCandidateIntel {
  candidateName: string;
  office: string;
  state: string;
  party: string;
  status: string;
  summary: string;
  keyPlatformPoints: string[];
  campaignDynamics: string;
  fecFundraisingInsight: string;
  opponentAnalysis: string;
  pollingAndRating: string;
  sources: Array<{ title: string; uri: string }>;
  generatedAt: string;
  model: string;
  grounded: boolean;
}

export interface GeminiLiveBriefing {
  headline: string;
  overview: string;
  keyRaces: Array<{
    office: string;
    state: string;
    candidates: string;
    status: string;
    analysis: string;
  }>;
  fecTrends: string;
  sources: Array<{ title: string; uri: string }>;
  generatedAt: string;
  model: string;
}

export interface RaceLiveCount {
  id: string;
  state: string;
  stateName: string;
  office: 'Senate' | 'Governor' | 'House';
  demCandidate: string;
  repCandidate: string;
  demVotes: number;
  repVotes: number;
  otherVotes?: number;
  demPct: number;
  repPct: number;
  precinctsReportingPct: number;
  totalVotesCounted: number;
  status: 'Projected Dem' | 'Projected GOP' | 'Too Close to Call' | 'Polls Open' | 'Counting Ballots';
  calledWinner?: string;
  calledParty?: 'D' | 'R';
  isFlip?: boolean;
  lastUpdated: string;
}

export interface ChamberControlResult {
  senateMajorityParty: 'Democrat' | 'Republican' | 'Undecided';
  senateDemSeats: number;
  senateRepSeats: number;
  senateSummary: string;
  houseMajorityParty: 'Democrat' | 'Republican' | 'Undecided';
  houseDemSeats: number;
  houseRepSeats: number;
  houseSummary: string;
  nationalEdge: string;
  isCountingNearlyOver: boolean;
  projectedSpeakerControl: string;
  projectedSenateMajorityLeader: string;
}

export type CountingStage = 'polls_open' | 'early_tabulation' | 'midnight_wave' | 'late_returns' | 'counting_nearly_over';

export interface ElectionDayOverview {
  isElectionDayMode: boolean;
  electionDate: string;
  targetCountDownTimeIST: string;
  targetCountDownTimeUTC: string;
  pollsStatus: string;
  countingStage: CountingStage;
  isCountingNearlyOver: boolean;
  precinctsReportingTotalPct: number;
  totalBallotsCounted: number;
  nationalPopularVote: {
    demVotes: number;
    repVotes: number;
    otherVotes: number;
    totalVotes: number;
    demPct: number;
    repPct: number;
    margin: number;
  };
  chamberControl: ChamberControlResult;
  senateTallies: {
    demCalled: number;
    repCalled: number;
    uncalled: number;
    demNetChange: number;
    repNetChange: number;
    neededForMajority: number;
  };
  houseTallies: {
    demCalled: number;
    repCalled: number;
    uncalled: number;
    demNetChange: number;
    repNetChange: number;
    neededForMajority: number;
  };
  govTallies: {
    demCalled: number;
    repCalled: number;
    uncalled: number;
  };
  races: RaceLiveCount[];
  breakingCalls: Array<{
    id: string;
    timestamp: string;
    callText: string;
    office: string;
    state: string;
    winner: string;
    party: 'D' | 'R';
  }>;
}

