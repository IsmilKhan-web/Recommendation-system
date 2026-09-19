import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { TextMatchResult, TopicMatchResponse, RecommendationHistoryEntry } from '../types';
import { getInitials, avatarColorFor } from '../lib/utils';
import { Search, Sparkles, Building2, Users2, BookOpen, Clock, FileText, AlertCircle, History, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react';

export default function TopicSearch() {
  const { profile } = useAuth();
  const [topic, setTopic] = useState('');
  const [excludeFull, setExcludeFull] = useState(false);
  const [minScore, setMinScore] = useState(0);
  const [results, setResults] = useState<TextMatchResult[] | null>(null);
  const [queryKeywords, setQueryKeywords] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RecommendationHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const h = await api.getHistory();
      setHistory(h);
    } catch (err) {
      console.error('Failed to load history:', (err as Error).message);
    }
  }, []);

  const handleSearch = async () => {
    if (topic.trim().length < 3) {
      setError('Please enter a research topic of at least 3 characters.');
      return;
    }
    setError(null);
    setSearching(true);
    setResults(null);
    try {
      const data: TopicMatchResponse = await api.matchByTopic(topic.trim(), {
        excludeFull,
        minScore,
      });
      setResults(data.results);
      setQueryKeywords(data.queryKeywords);
      loadHistory();
    } catch (err) {
      setError((err as Error).message);
    }
    setSearching(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !searching) handleSearch();
  };

  const toggleExpand = (id: string) => {
    setExpandedFaculty(expandedFaculty === id ? null : id);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-soft">
            <Search className="h-5 w-5" />
          </div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">Topic-Based Supervisor Search</h1>
        </div>
        <p className="mt-2 text-neutral-600">
          Enter your research topic or abstract. Our TF-IDF matching engine scans faculty publications, keywords, and research interests to find the best supervisors.
        </p>
      </div>

      {/* Search bar */}
      <div className="mt-6 card p-6 animate-slide-up shadow-soft">
        <label className="label">Research topic or abstract</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-4 h-5 w-5 text-neutral-400" />
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Deep learning for Quranic audio classification and speech recognition"
            className="input pl-10 min-h-[80px] resize-y"
          />
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeFull}
                onChange={(e) => setExcludeFull(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-neutral-700">Exclude full supervisors</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-neutral-700">Min match:</span>
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="input-select !w-auto !py-1.5 text-sm"
              >
                <option value={0}>0%</option>
                <option value={10}>10%</option>
                <option value={25}>25%</option>
                <option value={50}>50%</option>
              </select>
            </div>
          </div>
          <button onClick={handleSearch} disabled={searching} className="btn-primary px-6 py-2.5">
            {searching ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Searching…</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Find Supervisors</>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 animate-fade-in">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Query keywords display */}
      {queryKeywords.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 animate-fade-in">
          <span className="text-xs font-semibold text-neutral-500">Extracted keywords:</span>
          {queryKeywords.map((k) => (
            <span key={k} className="badge bg-primary-50 text-primary-700">{k}</span>
          ))}
        </div>
      )}

      {/* History toggle */}
      {profile?.role === 'student' && (
        <button
          onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <History className="h-4 w-4" />
          {showHistory ? 'Hide' : 'Show'} search history
          {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}

      {showHistory && history.length > 0 && (
        <div className="mt-3 card p-4 animate-slide-up">
          <div className="space-y-2">
            {history.slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-800">{h.search_topic}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(h.createdAt).toLocaleDateString()} · {h.recommended_supervisors.length} matches
                  </p>
                </div>
                <button
                  onClick={() => { setTopic(h.search_topic); setShowHistory(false); }}
                  className="ml-2 shrink-0 text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  Re-run
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results !== null && (
        <div className="mt-6">
          {results.length === 0 ? (
            <div className="card p-12 text-center animate-slide-up">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                <Users2 className="h-8 w-8" />
              </div>
              <h2 className="mt-4 font-display text-xl font-bold text-neutral-900">No matching supervisors found</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Try a more descriptive topic, lower the minimum match score, or uncheck the exclude-full filter.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-neutral-500">
                Found <span className="font-bold text-neutral-800">{results.length}</span> supervisor{results.length === 1 ? '' : 's'} matching your topic.
              </p>
              <div className="space-y-4">
                {results.map((rec, idx) => (
                  <TopicMatchCard
                    key={rec.faculty.id}
                    rec={rec}
                    rank={idx + 1}
                    expanded={expandedFaculty === rec.faculty.id}
                    onToggle={() => toggleExpand(rec.faculty.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function TopicMatchCard({ rec, rank, expanded, onToggle }: {
  rec: TextMatchResult;
  rank: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { faculty, matchScore, matchedKeywords, availableSlots, totalSlots } = rec;
  const isTop = rank === 1 && matchScore >= 50;

  return (
    <div className={`card-hover overflow-hidden animate-slide-up stagger-${Math.min(rank, 6)} ${isTop ? 'ring-2 ring-accent-300 shadow-glow-accent' : ''}`}>
      {isTop && (
        <div className="bg-gradient-to-r from-accent-500 to-accent-400 px-5 py-1.5 text-center text-xs font-bold text-white">
          Best Match
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank + avatar */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
              rank === 1 ? 'bg-gradient-to-br from-accent-400 to-accent-600 text-white' :
              rank === 2 ? 'bg-gradient-to-br from-neutral-300 to-neutral-500 text-white' :
              rank === 3 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
              'bg-neutral-200 text-neutral-600'
            }`}>
              {rank}
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm ${avatarColorFor(faculty.id)}`}>
              {getInitials(faculty.full_name)}
            </div>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-lg font-bold text-neutral-900">{faculty.full_name}</h3>
              {isTop && <span className="badge bg-accent-50 text-accent-700"><Sparkles className="mr-1 h-3 w-3" />Top match</span>}
            </div>
            {faculty.department && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-neutral-500">
                <Building2 className="h-3.5 w-3.5" /> {faculty.department}
              </p>
            )}
            {faculty.bio && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-600">{faculty.bio}</p>}

            {/* Match score + keywords */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" strokeWidth="5" className="stroke-neutral-100" />
                    <circle
                      cx="32" cy="32" r="28" fill="none" strokeWidth="5" strokeLinecap="round"
                      className={matchScore >= 50 ? 'stroke-accent-500' : matchScore >= 25 ? 'stroke-primary-500' : 'stroke-amber-500'}
                      strokeDasharray={2 * Math.PI * 28}
                      strokeDashoffset={2 * Math.PI * 28 - (matchScore / 100) * 2 * Math.PI * 28}
                    />
                  </svg>
                  <span className={`absolute font-display text-sm font-bold ${matchScore >= 50 ? 'text-accent-600' : matchScore >= 25 ? 'text-primary-600' : 'text-amber-600'}`}>
                    {matchScore}%
                  </span>
                </div>
                <span className="text-xs font-semibold text-neutral-500">Match</span>
              </div>

              {/* Matched keywords */}
              <div className="flex flex-wrap gap-1.5">
                {matchedKeywords.slice(0, 6).map((k) => (
                  <span key={k} className="badge bg-primary-50 text-primary-700 text-[11px]">{k}</span>
                ))}
                {matchedKeywords.length > 6 && (
                  <span className="badge bg-neutral-100 text-neutral-500 text-[11px]">+{matchedKeywords.length - 6}</span>
                )}
              </div>
            </div>

            {/* Slot info */}
            <div className="mt-3 flex items-center gap-3 text-sm">
              <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${
                availableSlots > 0 ? 'bg-emerald-50 text-emerald-700' :
                totalSlots === 0 ? 'bg-neutral-50 text-neutral-500' :
                'bg-rose-50 text-rose-600'
              }`}>
                <Users2 className="h-3.5 w-3.5" />
                <span className="font-semibold">
                  {totalSlots === 0 ? 'Not accepting' : `${availableSlots}/${totalSlots} slots open`}
                </span>
              </div>
              {faculty.office_hours && (
                <span className="flex items-center gap-1 text-xs text-neutral-400">
                  <Clock className="h-3.5 w-3.5" /> {faculty.office_hours}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expand button */}
        <button
          onClick={onToggle}
          className="mt-4 flex w-full items-center justify-center gap-1 border-t border-neutral-100 pt-3 text-xs font-semibold text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          {expanded ? (<><ChevronUp className="h-4 w-4" /> Show less</>) : (<><ChevronDown className="h-4 w-4" /> Show full profile</>)}
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 space-y-4 animate-fade-in border-t border-neutral-100 pt-4">
            {/* Research keywords */}
            {faculty.research_keywords.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                  <Sparkles className="h-3.5 w-3.5" /> Research keywords
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {faculty.research_keywords.map((k) => (
                    <span key={k} className={`badge text-[11px] ${
                      matchedKeywords.includes(k) ? 'bg-accent-50 text-accent-700' : 'bg-neutral-100 text-neutral-600'
                    }`}>{k}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Publications */}
            {faculty.publications.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                  <FileText className="h-3.5 w-3.5" /> Key publications
                </p>
                <ul className="mt-1.5 space-y-1.5">
                  {faculty.publications.map((p, i) => (
                    <li key={i} className="text-xs leading-relaxed text-neutral-600 pl-4 relative before:absolute before:left-0 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-neutral-400">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Courses */}
            {faculty.courses.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                  <BookOpen className="h-3.5 w-3.5" /> Courses taught
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {faculty.courses.map((c) => (
                    <span key={c} className="badge bg-neutral-100 text-neutral-600 text-[11px]">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Research areas */}
            {faculty.research_areas.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                  <BookOpen className="h-3.5 w-3.5" /> Research areas (with expertise weight)
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {faculty.research_areas.map((ra) => (
                    <span key={ra.id} className="badge bg-primary-50 text-primary-700 text-[11px]">
                      {ra.research_area?.name}
                      <span className="ml-1 text-primary-400">·{ra.weight}/5</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
