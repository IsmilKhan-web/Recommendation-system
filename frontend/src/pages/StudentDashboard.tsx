import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ResearchArea, StudentResearchInterest, SupervisionRequest } from '../types';
import ResearchAreaSelector from '../components/ResearchAreaSelector';
import { Sparkles, Save, CheckCircle2, ArrowRight, BookOpen, Search, ClipboardList } from 'lucide-react';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [areas, setAreas] = useState<ResearchArea[]>([]);
  const [interests, setInterests] = useState<StudentResearchInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [requests, setRequests] = useState<SupervisionRequest[]>([]);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});

  const loadRequests = useCallback(async () => {
    if (!profile) return;
    try {
      const requestData = await api.getMySupervisionRequests();
      setRequests((current) => {
        const unchanged = current.length === requestData.length
          && current.every((request, index) => (
            request.id === requestData[index].id
            && request.status === requestData[index].status
          ));
        return unchanged ? current : requestData;
      });
    } catch (err) {
      console.error('Failed to refresh supervision requests:', (err as Error).message);
    }
  }, [profile]);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const [areasData, interestsData, requestData] = await Promise.all([
        api.getResearchAreas(),
        api.getStudentInterests(profile.id),
        api.getMySupervisionRequests(),
      ]);
      setAreas(areasData);
      setInterests(interestsData);
      setRequests(requestData);
      setSelectedIds(interestsData.map((i) => i.research_area_id));
      setWeights(Object.fromEntries(interestsData.map((i) => [i.research_area_id, i.weight])));
    } catch (err) {
      console.error('Failed to load:', (err as Error).message);
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!profile) return;
    const refresh = window.setInterval(loadRequests, 10000);
    return () => window.clearInterval(refresh);
  }, [loadRequests, profile]);

  const handleToggle = (areaId: string) => {
    setSelectedIds((prev) =>
      prev.includes(areaId) ? prev.filter((id) => id !== areaId) : [...prev, areaId],
    );
    setWeights((prev) => {
      const next = { ...prev };
      if (!(areaId in next)) next[areaId] = 3;
      return next;
    });
  };

  const handleWeightChange = (areaId: string, w: number) => {
    setWeights((prev) => ({ ...prev, [areaId]: w }));
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setSavedMsg(false);
    try {
      const updated = await api.saveStudentInterests(
        selectedIds.map((id) => ({ research_area_id: id, weight: weights[id] ?? 3 })),
      );
      setInterests(updated);
      setSelectedIds(updated.map((i) => i.research_area_id));
      setWeights(Object.fromEntries(updated.map((i) => [i.research_area_id, i.weight])));
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 3000);
    } catch (err) {
      console.error('Save failed:', (err as Error).message);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="skeleton h-10 w-64" />
        <div className="skeleton mt-3 h-5 w-96" />
        <div className="skeleton mt-8 h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="animate-fade-in">
        <h1 className="font-display text-3xl font-bold text-neutral-900">
          Welcome, {profile?.full_name.split(' ')[0]}
        </h1>
        <p className="mt-2 text-neutral-600">
          Select the research areas you're interested in and rank them by priority. We'll use these to recommend supervisors.
        </p>
      </div>

      <div className="mt-8 card p-6 animate-slide-up shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-neutral-900">
            <BookOpen className="h-5 w-5 text-primary-600" />
            Your research interests
          </h2>
          {selectedIds.length > 0 && (
            <span className="badge bg-primary-50 text-primary-700">{selectedIds.length} selected</span>
          )}
        </div>

        <ResearchAreaSelector
          areas={areas}
          selectedIds={selectedIds}
          weights={weights}
          onToggle={handleToggle}
          onWeightChange={handleWeightChange}
        />

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            {savedMsg ? (
              <span className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 animate-fade-in">
                <CheckCircle2 className="h-4 w-4" /> Saved! Your matches have been updated.
              </span>
            ) : (
              <span className="text-sm text-neutral-500">
                {selectedIds.length === 0 ? 'Select at least one area to get recommendations.' : 'Changes are saved when you click Save.'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/search" className="btn-secondary">
              <Search className="h-4 w-4" /> Topic search
            </Link>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save interests'}
            </button>
            {selectedIds.length > 0 && (
              <Link to="/recommendations" className="btn-accent">
                <Sparkles className="h-4 w-4" /> View matches <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="mt-6 card p-6 animate-slide-up">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-neutral-900"><ClipboardList className="h-5 w-5 text-primary-600" /> Supervision requests</h2>
          <Link to="/supervisions" className="text-sm font-semibold text-primary-600 hover:text-primary-700">List of Supervisions <ArrowRight className="ml-1 inline h-4 w-4" /></Link>
        </div>
        {requests.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500">You have not applied for a supervision slot yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-neutral-50 p-4">
                <div>
                  <p className="font-semibold text-neutral-800">{request.faculty?.full_name} · {request.project_mode}</p>
                  <p className="text-sm font-medium text-neutral-700">{request.project_title}</p>
                  <p className="text-sm text-neutral-500">{request.project_proposal}</p>
                </div>
                <span className={`badge ${request.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : request.status === 'denied' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{request.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {interests.length > 0 && (
        <div className="mt-6 card p-6 animate-slide-up">
          <h2 className="font-display text-lg font-bold text-neutral-900">Your current interests</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {interests
              .slice()
              .sort((a, b) => b.weight - a.weight)
              .map((i) => (
                <span key={i.id} className="badge bg-primary-50 py-1.5 pl-3 pr-2 text-primary-700">
                  {i.research_area?.name}
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white">
                    {i.weight}
                  </span>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
