import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { StudentResearchInterest, RecommendationResult } from '../types';
import { getInitials, avatarColorFor } from '../lib/utils';
import { Sparkles, Users2, Building2, AlertTriangle, BookOpen, ArrowRight } from 'lucide-react';

export default function Recommendations() {
  const { profile } = useAuth();
  const [interests, setInterests] = useState<StudentResearchInterest[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [interestsData, recs] = await Promise.all([
        api.getStudentInterests(profile.id),
        api.getRecommendations(),
      ]);
      setInterests(interestsData);
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to load recommendations:', (err as Error).message);
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="skeleton h-10 w-72" />
        <div className="skeleton mt-3 h-5 w-96" />
        <div className="skeleton mt-6 h-20 w-full" />
        <div className="mt-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-soft">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="font-display text-3xl font-bold text-neutral-900">Your Supervisor Matches</h1>
        </div>
        <p className="mt-2 text-neutral-600">
          Ranked by how well each faculty member's research aligns with your interests and priority weights.
        </p>
      </div>

      {interests.length > 0 && (
        <div className="mt-6 card p-5 animate-slide-up">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-700">
              <BookOpen className="h-4 w-4 text-primary-600" /> Based on your {interests.length} selected interest{interests.length === 1 ? '' : 's'}
            </h2>
            <Link to="/dashboard" className="text-xs font-semibold text-primary-600 hover:text-primary-700">Edit interests</Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {interests.slice().sort((a, b) => b.weight - a.weight).map((i) => (
              <span key={i.id} className="badge bg-primary-50 py-1.5 pl-3 pr-2 text-primary-700">
                {i.research_area?.name}
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">{i.weight}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {interests.length === 0 && (
        <div className="mt-8 card p-12 text-center animate-slide-up">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-neutral-900">No interests selected yet</h2>
          <p className="mt-2 text-sm text-neutral-600">Select your research areas on the dashboard to get personalized recommendations.</p>
          <Link to="/dashboard" className="btn-primary mt-6">
            Go to dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {interests.length > 0 && (
        <>
          {recommendations.length === 0 ? (
            <div className="mt-8 card p-12 text-center animate-slide-up">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
                <Users2 className="h-8 w-8" />
              </div>
              <h2 className="mt-4 font-display text-xl font-bold text-neutral-900">No matching faculty found</h2>
              <p className="mt-2 text-sm text-neutral-600">No faculty share your selected research areas yet. Try broadening your interests or check back later.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {recommendations.map((rec, idx) => (
                <RecommendationCard key={rec.faculty.id} rec={rec} rank={idx + 1} delay={`stagger-${Math.min(idx + 1, 6)}`} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RecommendationCard({ rec, rank, delay }: { rec: RecommendationResult; rank: number; delay: string }) {
  const { faculty, matchScore, matchedAreas, availableSlots } = rec;
  const total = faculty.slot?.total_slots ?? 0;
  const isTop = rank === 1 && matchScore >= 70;

  return (
    <div className={`card-hover overflow-hidden animate-slide-up ${delay} ${isTop ? 'ring-2 ring-accent-300 shadow-glow-accent' : ''}`}>
      {isTop && (
        <div className="bg-gradient-to-r from-accent-500 to-accent-400 px-5 py-1.5 text-center text-xs font-bold text-white">
          Best Match
        </div>
      )}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 sm:flex-col sm:items-center">
          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
            rank === 1 ? 'bg-gradient-to-br from-accent-400 to-accent-600 text-white' : rank === 2 ? 'bg-gradient-to-br from-neutral-300 to-neutral-500 text-white' : rank === 3 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-neutral-200 text-neutral-600'
          }`}>
            {rank}
          </div>
          <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm ${avatarColorFor(faculty.id)}`}>
            {getInitials(faculty.full_name)}
          </div>
        </div>

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

          <div className="mt-3">
            <p className="text-xs font-semibold text-neutral-500">Matched research areas</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {matchedAreas.map((a) => (
                <span key={a.id} className="badge bg-primary-50 py-1.5 text-primary-700" title={`Your priority ${a.studentWeight} · Their expertise ${a.facultyWeight}`}>
                  {a.name}
                  <span className="ml-1.5 text-[10px] font-bold text-primary-500">
                    {a.studentWeight}×{a.facultyWeight}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-3">
          <ScoreGauge score={matchScore} />
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
            availableSlots > 0 ? 'bg-emerald-50' : total === 0 ? 'bg-neutral-50' : 'bg-rose-50'
          }`}>
            <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${
              availableSlots > 0 ? 'bg-emerald-100 text-emerald-600' : total === 0 ? 'bg-neutral-200 text-neutral-400' : 'bg-rose-100 text-rose-500'
            }`}>
              <Users2 className="h-3.5 w-3.5" />
            </div>
            <div className="text-sm">
              <span className={`font-bold ${availableSlots > 0 ? 'text-emerald-600' : total === 0 ? 'text-neutral-400' : 'text-rose-600'}`}>
                {total === 0 ? 'Not accepting' : `${availableSlots}/${total} open`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-accent-600' : score >= 50 ? 'text-primary-600' : score >= 25 ? 'text-amber-600' : 'text-neutral-400';
  const ring = score >= 75 ? 'stroke-accent-500' : score >= 50 ? 'stroke-primary-500' : score >= 25 ? 'stroke-amber-500' : 'stroke-neutral-300';
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex h-20 w-20 items-center justify-center">
      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" strokeWidth="6" className="stroke-neutral-100" />
        <circle
          cx="32" cy="32" r="28" fill="none" strokeWidth="6" strokeLinecap="round"
          className={`${ring} transition-all duration-700`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`font-display text-xl font-bold ${color}`}>{score}</span>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-neutral-400">match</span>
      </div>
    </div>
  );
}
