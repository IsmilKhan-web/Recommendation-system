import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ResearchArea, FacultyWithDetails } from '../types';
import { getInitials, avatarColorFor } from '../lib/utils';
import { Search, SlidersHorizontal, MapPin, X, Users2, Sparkles, Building2, Clock, FileText, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function FacultyList() {
  const { profile } = useAuth();
  const [faculty, setFaculty] = useState<FacultyWithDetails[]>([]);
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterAreaIds, setFilterAreaIds] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [facultyData, areasData] = await Promise.all([
        api.getFaculty(),
        api.getResearchAreas(),
      ]);
      setFaculty(facultyData);
      setAreas(areasData);
    } catch (err) {
      console.error('Failed to load faculty:', (err as Error).message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faculty.filter((f) => {
      const matchesQuery = !q ||
        f.full_name.toLowerCase().includes(q) ||
        (f.department ?? '').toLowerCase().includes(q) ||
        f.research_areas.some((r) => r.research_area?.name.toLowerCase().includes(q));
      const matchesAreas = filterAreaIds.length === 0 ||
        filterAreaIds.every((id) => f.research_areas.some((r) => r.research_area_id === id));
      const available = f.slot ? Math.max(0, f.slot.total_slots - f.slot.taken_slots) : 0;
      const matchesAvail = availabilityFilter === 'all' || available > 0;
      return matchesQuery && matchesAreas && matchesAvail;
    });
  }, [faculty, query, filterAreaIds, availabilityFilter]);

  const toggleFilterArea = (id: string) => {
    setFilterAreaIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  };

  const clearFilters = () => { setFilterAreaIds([]); setAvailabilityFilter('all'); setQuery(''); };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton mt-3 h-5 w-96" />
        <div className="skeleton mt-6 h-12 w-full" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-56" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-neutral-900">Browse Faculty</h1>
        <p className="mt-2 text-neutral-600">
          {faculty.length} faculty member{faculty.length === 1 ? '' : 's'} · filter by research topic and availability.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, department, or research area…"
            className="input pl-10"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`btn-secondary ${showFilters ? '!border-primary-300 !bg-primary-50 !text-primary-700' : ''}`}
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {filterAreaIds.length > 0 && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
              {filterAreaIds.length}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 card animate-slide-up p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-neutral-800">Filter by research topic</h3>
            {(filterAreaIds.length > 0 || availabilityFilter !== 'all' || query) && (
              <button onClick={clearFilters} className="text-xs font-semibold text-primary-600 hover:text-primary-700">Clear all</button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {areas.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleFilterArea(a.id)}
                className={`badge py-1.5 pl-3 pr-3 transition-all duration-200 ${
                  filterAreaIds.includes(a.id)
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {a.name}
                {filterAreaIds.includes(a.id) && <X className="ml-1.5 h-3 w-3" />}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-700">Availability:</span>
            <div className="flex gap-2">
              {(['all','available'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAvailabilityFilter(opt)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all duration-200 ${
                    availabilityFilter === opt ? 'bg-primary-600 text-white shadow-sm' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {opt === 'all' ? 'All' : 'Has open slots'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((f, i) => {
          const available = f.slot ? Math.max(0, f.slot.total_slots - f.slot.taken_slots) : 0;
          const total = f.slot?.total_slots ?? 0;
          return (
            <div key={f.id} className={`card-hover group p-5 animate-slide-up stagger-${Math.min(i + 1, 6)}`}>
              <div className="flex items-start gap-3">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm ${avatarColorFor(f.id)}`}>
                  {getInitials(f.full_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display font-bold text-neutral-900">{f.full_name}</h3>
                  {f.department && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                      <Building2 className="h-3 w-3" /> {f.department}
                    </p>
                  )}
                  {f.office_hours && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400">
                      <Clock className="h-3 w-3" /> {f.office_hours}
                    </p>
                  )}
                </div>
              </div>

              {f.bio && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-neutral-600">{f.bio}</p>}

              {/* Research keywords */}
              {f.research_keywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {f.research_keywords.slice(0, 5).map((k) => (
                    <span key={k} className="badge bg-accent-50 text-accent-700 text-[11px]">{k}</span>
                  ))}
                  {f.research_keywords.length > 5 && (
                    <span className="badge bg-neutral-100 text-neutral-500 text-[11px]">+{f.research_keywords.length - 5}</span>
                  )}
                </div>
              )}

              {/* Research areas */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {f.research_areas.slice(0, 4).map((r) => (
                  <span key={r.id} className="badge bg-primary-50 text-primary-700">
                    {r.research_area?.name}
                  </span>
                ))}
                {f.research_areas.length > 4 && (
                  <span className="badge bg-neutral-100 text-neutral-500">+{f.research_areas.length - 4}</span>
                )}
                {f.research_areas.length === 0 && f.research_keywords.length === 0 && (
                  <span className="text-xs text-neutral-400">No research areas listed</span>
                )}
              </div>

              {/* Quick stats */}
              <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
                {f.publications.length > 0 && (
                  <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {f.publications.length} pub{f.publications.length === 1 ? '' : 's'}</span>
                )}
                {f.courses.length > 0 && (
                  <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {f.courses.length} course{f.courses.length === 1 ? '' : 's'}</span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                    available > 0 ? 'bg-emerald-50 text-emerald-600' : total === 0 ? 'bg-neutral-100 text-neutral-400' : 'bg-rose-50 text-rose-500'
                  }`}>
                    <Users2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-sm">
                    <span className={`font-bold ${available > 0 ? 'text-emerald-600' : total === 0 ? 'text-neutral-400' : 'text-rose-600'}`}>
                      {total === 0 ? 'Not accepting' : `${available} / ${total} open`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile?.role === 'student' && (
                    <Link to="/search" className="text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                      <Sparkles className="mr-1 inline h-3 w-3" />Search match
                    </Link>
                  )}
                  <button onClick={() => setExpandedId(expandedId === f.id ? null : f.id)} className="text-xs font-semibold text-neutral-500 hover:text-neutral-700 transition-colors">
                    {expandedId === f.id ? <><ChevronUp className="mr-0.5 inline h-3 w-3" />Less</> : <><ChevronDown className="mr-0.5 inline h-3 w-3" />More</>}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expandedId === f.id && (
                <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4 animate-fade-in">
                  {f.publications.length > 0 && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500"><FileText className="h-3.5 w-3.5" /> Publications</p>
                      <ul className="mt-1.5 space-y-1">
                        {f.publications.map((p, idx) => (
                          <li key={idx} className="text-xs leading-relaxed text-neutral-600 pl-3 relative before:absolute before:left-0 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-neutral-400">{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {f.courses.length > 0 && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500"><BookOpen className="h-3.5 w-3.5" /> Courses taught</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {f.courses.map((c) => (
                          <span key={c} className="badge bg-neutral-100 text-neutral-600 text-[11px]">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {f.research_keywords.length > 5 && (
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500"><Sparkles className="h-3.5 w-3.5" /> All keywords</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {f.research_keywords.map((k) => (
                          <span key={k} className="badge bg-accent-50 text-accent-700 text-[11px]">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
            <Search className="h-8 w-8" />
          </div>
          <p className="mt-4 font-medium text-neutral-500">No faculty match your filters.</p>
          <button onClick={clearFilters} className="btn-secondary mt-4">Clear filters</button>
        </div>
      )}
    </div>
  );
}
